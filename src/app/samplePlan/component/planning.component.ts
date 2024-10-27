import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, PageUrls, GridActions, ButtonActions, CategoryCodeList, EntityCodes } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO, CategoryItem, CategoryItemList, IDCode } from 'src/app/common/services/utilities/commonModels';
import { GetSamplePlanningModel, GetPreparePlaneModel, UnAssignTestSampleModel, GetUserDetailsModel, GetAssignedTestSampleUserModel, ManageActStatus } from '../model/samplePlanModel';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { Router } from '@angular/router';
import { ManageAssingUnAssignTestPlanComponent } from './manageAssignUnAssignTest.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ChangeUserPlanTestComponent } from './changeUserPlanTest.component';

@Component({
    selector: 'sample-planning',
    templateUrl: '../html/planning.html'
})
export class PlanningComponent {
    @Input('encSamplePlanID') encSamplePlanID: string;
    @Input('appBO') appBO: AppBO = new AppBO();
    disableBtn: boolean;
    planningDetails: GetSamplePlanningModel = new GetSamplePlanningModel();
    headersData: any;
    actions: Array<string> = [GridActions.remove, GridActions.ChangeUserPlanTest, GridActions.unAssign];
    notAssAction: any = [GridActions.assignAna, GridActions.remove];
    showResetBtn: boolean = false;
    objAssignedBo: GetAssignedTestSampleUserModel = new GetAssignedTestSampleUserModel();
    subscription: Subscription = new Subscription();
    activityStatusLst: any = [];
    isDisabled: boolean = false;
    btnSaveType: string = ButtonActions.btnSave;
    notHeadersData: any;
    @Output() loader: EventEmitter<any> = new EventEmitter();
    isLoaderStart: boolean = false;
    assignCatItemList: CategoryItemList = [];
    constructor(private _service: SamplePlanService, private _matDailog: MatDialog,
        private _router: Router, private _alert: AlertService,
        private _confirm: ConfirmationService, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "planDetails") {
                resp.result.userPlanDet.forEach((obj) => {
                    resp.result.plandet.filter(x => x.userRoleID == obj.userRoleID).forEach((item, idx) => {
                        item['sno'] = idx + 1;
                    })
                })

                resp.result.plandet.filter(x => !x.userRoleID).forEach((item, idx) => {
                    item['sno'] = idx + 1;
                })

                this.planningDetails = resp.result;
                this.planningDetails.userPlanDet = CommonMethods.getAnalystOccupancy(this.planningDetails.userPlanDet);
                this.showResetBtn = true;
                this.prepareHeaders();
                var obj = this.planningDetails.plandet.filter(x => CommonMethods.hasValue(x.activityStatusID))
                this.enableHeaders((obj && obj.length > 0));
                obj.forEach(ob => {
                    var obj: CategoryItem = new CategoryItem();
                    obj.catItem = ob.activityStatus;
                    obj.catItemCode = ob.activityStatusCode;
                    obj.catItemID = ob.activityStatusID;
                    obj.category = "ACTIVITY_STATUS";
                    this.assignCatItemList.push(obj);
                })
                this.activityStatusLst = CommonMethods.prepareCategoryItemsList(this.activityStatusLst, this.assignCatItemList);
            }
            else if (resp.purpose == "autoPlan") {
                this.disableBtn = false;
                this.loader.emit({ isLoaderStart: false, type: '' })
                if (resp.result == 'OK') {
                    if (resp.type == 'GENERATE')
                        this._alert.success(SamplePlanMessages.autoplanSave);
                    else
                        this._alert.success(SamplePlanMessages.resetPlan);
                    this._service.planDetails(this.encSamplePlanID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result))
            }
            else if (resp.purpose == "deleteTestSample") {

                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBO = resp.result;
                    if (this.isLoaderStart)
                        this._alert.success(SamplePlanMessages.mulRemoveFromPlan);
                    else
                        this._alert.success(SamplePlanMessages.removeFromPlan);
                    this._service.planDetails(this.encSamplePlanID);
                    this._service.getSampleDetails(this.encSamplePlanID);
                    this._service.getSamplesmultiSpec(this.encSamplePlanID);
                    this._service.getTestActivitySamples(this.encSamplePlanID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.isLoaderStart = false;
            }
            else if (resp.purpose == 'unAssignUserTests') {
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBO = resp.result;
                    this._alert.success(SamplePlanMessages.unAssignTestSampleSaved);
                    this._service.planDetails(this.encSamplePlanID);

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "ACTIVITY_STATUS") {
                this.activityStatusLst = resp.result;
                this.activityStatusLst = CommonMethods.prepareCategoryItemsList(this.activityStatusLst, this.assignCatItemList);
            }
            else if (resp.purpose == "manageUserTestActivityStatus") {
                this.loader.emit({ isLoaderStart: false, type: 'SAVE' })
                if (resp.result.returnFlag == "SUCCESS") {
                    this.appBO = resp.result;
                    this.enableHeaders(true);
                    this._alert.success(SamplePlanMessages.statusSucc);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this._service.planDetails(this.encSamplePlanID);
        this._service.getCategoryItemsByCatCode('ACTIVITY_STATUS');
    }

    autoGenPlan(type: string) {

        this._confirm.confirm( type == "GENERATE" ? SamplePlanMessages.reAssignConfirm : SamplePlanMessages.resetPlanConf).subscribe(resp => {
            if (resp) {
                this.disableBtn = true;
                this.loader.emit({ isLoaderStart: true, type: type })
                this._service.autoPlan(this.encSamplePlanID, type);
            }
        })

    }

    enableHeaders(val: boolean) {
        this.btnSaveType = val ? ButtonActions.btnUpdate : ButtonActions.btnSave;
        this.isDisabled = val;
    }

    getUserName(userRoleID: number) {
        return this.planningDetails.userPlanDet.filter(x => x.userRoleID == userRoleID);
    }


    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSamplePlanID;
        obj.code = 'SAMPLE_PLAN';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encSamplePlanID, EntityCodes.samplePlan, this.appBO.appLevel, this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    save() {
        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(false);

        var data = this.planningDetails.plandet.filter(x => CommonMethods.hasValue(x.activityStatusID))

        if (!data || data.length == 0)
            return this._alert.warning(SamplePlanMessages.actStatus);

        var obj: ManageActStatus = new ManageActStatus();
        obj.encPlanID = this.encSamplePlanID;
        obj.initTime = this.appBO.initTime;
        obj.lst = this.planningDetails.plandet;

        this.loader.emit({ isLoaderStart: true, type: 'SAVE' })
        this._service.manageUserTestActivityStatus(obj);
    }

    prepareHeaders() {
        this.headersData = [];
        this.notHeadersData = [];
        // this.headersData.push({ "columnDef": 'arNumber', "header": "Ar Number", cell: (element: any) => `${element.arNumber}` });
        // this.headersData.push({ "columnDef": 'activity', "header": "Activity", cell: (element: any) => `${element.activity}` });
        // this.headersData.push({ "columnDef": 'testTitle', "header": "Reference", cell: (element: any) => `${element.testTitle}` });

        this.headersData.push({ "columnDef": 'sno', "header": "S. No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-7per" });
        this.headersData.push({ "columnDef": 'activity', "header": "Activity Type", cell: (element: any) => `${element.activity}`, width: "maxWidth-15per" });
        this.headersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`, width: "maxWidth-15per" });
        this.headersData.push({ "columnDef": 'materialName', "header": "Product / Material Name", cell: (element: any) => `${element.materialName}`, width: "maxWidth-35per" });

        this.headersData.push({ "columnDef": 'activityDescription', "header": "Activity Description", cell: (element: any) => `${element.activityDescription}`, width: "minWidth-15per" });
        this.headersData.push({ "columnDef": 'activityStatus', "header": "Activity Status", cell: (element: any) => `${element.activityStatusID}`, width: "maxWidth-15per" });

        this.notHeadersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
        this.notHeadersData.push({ "columnDef": 'sno', "header": "S. No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-7per" });
        this.notHeadersData.push({ "columnDef": 'activity', "header": "Activity Type", cell: (element: any) => `${element.activity}`, width: "maxWidth-15per" });
        this.notHeadersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`, width: "maxWidth-15per" });
        this.notHeadersData.push({ "columnDef": 'materialName', "header": "Product / Material Name", cell: (element: any) => `${element.materialName}`, width: "maxWidth-35per" });

        this.notHeadersData.push({ "columnDef": 'activityDescription', "header": "Activity Description", cell: (element: any) => `${element.activityDescription}`, width: "minWidth-15per" });


    }

    getDataSource(userRoleID: number) {
        return CommonMethods.bindMaterialGridData(this.planningDetails.plandet.filter(x => x.userRoleID == userRoleID));
    }

    getNotAssDataSource() {
        return CommonMethods.bindMaterialGridData(this.planningDetails.plandet.filter(x => !CommonMethods.hasValue(x.userRoleID)));
    }

    manageUserTestPlan(usrDetails: GetUserDetailsModel) {
        var obj: GetAssignedTestSampleUserModel = new GetAssignedTestSampleUserModel();
        obj.encUserRoleID = usrDetails.encUserRoleID;
        obj.encPlanID = this.encSamplePlanID;
        obj.planID = this.appBO.transKey;
        obj.userID = usrDetails.userID;
        const modal = this._matDailog.open(ManageAssingUnAssignTestPlanComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.objAssignedBo = obj;
        modal.componentInstance.appBo = this.appBO;
        modal.afterClosed().subscribe(resp => {
            if (resp == 'SUCCESS') {
                this._service.planDetails(this.encSamplePlanID);
                this._service.getPlanningDetails(this.encSamplePlanID);
            }
        });
    }

    onActionClicked(evt, type: string) {
        if (evt.action == GridActions.remove) {
            this._confirm.confirm(SamplePlanMessages.deleteTest).subscribe(resp => {
                if (resp) {
                    var obj: UnAssignTestSampleModel = new UnAssignTestSampleModel();
                    obj.initTime = this.appBO.initTime;
                    obj.encPlanID = this.encSamplePlanID;
                    if (CommonMethods.hasValue(evt.val.userTestID))
                        obj.encUserTestID = evt.val.encUserTestID;
                    //if (type == 'NOT_ASSINGED')
                    obj.testID = evt.val.testID;
                    obj.sampleLst = [];
                    this._service.deleteTestSample(obj);
                }
            })

        }
        else if (evt.action == "CHANGE_USR_PLAN_TEST" || evt.action == GridActions.assignAna) {
            const modal = this._matDailog.open(ChangeUserPlanTestComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.usrTestBO = { encPlanID: this.encSamplePlanID, userRoleID: evt.val.userRoleID, initTime: this.appBO.initTime, userTestID: evt.val.userTestID, activityCode: evt.val.activityCode, testID: evt.val.testID, type: 'PLAN' }
            modal.afterClosed().subscribe(result => {
                if (result) {
                    this.appBO = result;
                    this._service.planDetails(this.encSamplePlanID);
                }
            })

        }
        else if (evt.action == 'UN_ASSIGN') {
            this._confirm.confirm(SamplePlanMessages.usrSampleTest).subscribe(resp => {
                if (resp) {
                    this.objAssignedBo.encUserTestID = evt.val.encUserTestID;
                    this.objAssignedBo.encPlanID = this.encSamplePlanID;
                    this.objAssignedBo.initTime = this.appBO.initTime;
                    this._service.unAssignUserTests(this.objAssignedBo);
                }
            })

        }
    }

    removeFromPlan() {
        var obj = this.planningDetails.plandet.filter(x => !CommonMethods.hasValue(x.userRoleID) && x.isSelected);
        if (!obj || obj.length == 0)
            return this._alert.warning(SamplePlanMessages.bulkRemove);
        this._confirm.confirm(SamplePlanMessages.deleteTest).subscribe(resp => {
            if (resp) {
                var obj: UnAssignTestSampleModel = new UnAssignTestSampleModel();
                obj.initTime = this.appBO.initTime;
                obj.encPlanID = this.encSamplePlanID;
                obj.sampleLst = [];
                this.planningDetails.plandet.forEach(x => {
                    if (!CommonMethods.hasValue(x.userRoleID) && x.isSelected) {
                        var bo: IDCode = new IDCode();
                        bo.id = x.testID;
                        bo.code = x.activityCode;
                        obj.sampleLst.push(bo);
                    }
                })
                this.isLoaderStart = true;
                this._service.deleteTestSample(obj);
            }
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}   