import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { ShiftEndTasks, ManageShiftClose } from '../model/samplePlanModel';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ButtonActions, ActionMessages, EntityCodes, PageUrls, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { AppBO, CategoryItem, CategoryItemList, GetCategoryBO } from 'src/app/common/services/utilities/commonModels';
import { ActivatedRoute, Router } from '@angular/router';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'shift-close',
    templateUrl: '../html/shiftClosed.html'
})

export class ShiftClosedComponent {

    subscription: Subscription = new Subscription();
    pendingAct: Array<ShiftEndTasks> = [];
    displayedActColumns: string[] = ['S.No', 'Activity', 'activityDesc', 'arNo', 'status', 'selectStatus', 'remarks']
    statusList: any;
    btnType: string = ButtonActions.btnSave;
    encShiftID: string;
    appBO: AppBO = new AppBO();
    pageTitle: string = PageTitle.shiftclose;
    backUrl: string = PageUrls.homeUrl;
    status: string;
    refNo: string;
    btnDisable: boolean = false;
    encUserTestID: string;
    analystName: string;
    createdOn: any;
    inchargeAssess: string;
    observation: string;
    viewHistoryVisible: boolean;
    viewHistory: any;
    entityCode: string = EntityCodes.closeShift;
    planLst: any = [];
    assignCatItemList: CategoryItemList = [];

    constructor(private _saService: SamplePlanService, private _alert: AlertService, private _actRoute: ActivatedRoute,
        private _matDailog: MatDialog, private _router: Router, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encShiftID = param['id']);
        this.subscription = this._saService.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getShiftCloseActivities") {
                if (resp.result.act.returnFlag != 'UNDER_PROCESS') {
                    this.planLst = resp.result.planLst;
                    if (!this.planLst || this.planLst.length == 0)
                        this.planLst.push({ planID: null });
                    this.pendingAct = resp.result.list;
                    this.appBO = resp.result.act;
                    var status = this.statusList.filter(o => o.catItemCode == 'COM')
                    this.pendingAct.forEach(ob => {
                        if (ob.statusCode == status[0].catItemCode)
                            ob.statusID = status[0].catItemID;
                        if (CommonMethods.hasValue(ob.statusID)) {
                            var obj: CategoryItem = new CategoryItem();
                            obj.catItem = ob.activityStatus;
                            obj.catItemCode = ob.activityStatusCode;
                            obj.catItemID = ob.statusID;
                            obj.category = "SHIFT_TASK_STATUS";
                            this.assignCatItemList.push(obj);
                        }
                    });
                    this.status = resp.result.status;
                    this.refNo = resp.result.requestCode;
                    this.analystName = resp.result.userName;
                    this.inchargeAssess = resp.result.assessment;
                    this.observation = resp.result.observations;
                    this.createdOn = dateParserFormatter.FormatDate(resp.result.requestDate, 'datetime')
                    if (CommonMethods.hasValue(this.appBO) && CommonMethods.hasValue(this.appBO.encTranKey))
                        this.encShiftID = this.appBO.encTranKey;
                    this.enableHeaders(!CommonMethods.hasValue(this.encShiftID));
                    this.showHistory();
                    if (this.appBO.operationType == 'VIEW')
                        this.btnType = ButtonActions.btnUpdate

                    this.statusList = CommonMethods.prepareCategoryItemsList(this.statusList, this.assignCatItemList);
                }
                else {
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.act.returnFlag))
                    this._router.navigateByUrl(PageUrls.homeUrl)
                }

            }
            else if (resp.purpose == "getCatItemsByCatCodeList") {
                this.statusList = resp.result;
                this._saService.getShiftCloseActivities(this.encShiftID);
            }
            else if (resp.purpose == "manageShiftCloseActivities") {
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.appBO = resp.result;
                    this.encShiftID = this.appBO.encTranKey;
                    this.status = resp.result.status;
                    this.refNo = resp.result.referenceNumber;
                    this._alert.success(SamplePlanMessages.shiftClose);
                    this.enableHeaders(false);
                    this.showHistory();
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.btnDisable = false;
            }
        });
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetCloseShiftCategories();
        obj.type = 'MNG';
        this._saService.getCatItemsByCatCodeList(obj);
        if (CommonMethods.hasValue(localStorage.getItem("USER_TEST_ID"))) {
            this.encUserTestID = localStorage.getItem("USER_TEST_ID");
            localStorage.removeItem("USER_TEST_ID");
        }
    }

    enableHeaders(val: boolean) {
        if (this.appBO.appLevel == 0)
            this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        else if (this.appBO.appLevel >= 1)
            this.btnType = !val && CommonMethods.hasValue(this.inchargeAssess) ? ButtonActions.btnUpdate : ButtonActions.btnSave;
    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        this.btnDisable = true;
        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg)) {
            this.btnDisable = false;
            return this._alert.warning(errMsg);
        }
        var obj: ManageShiftClose = new ManageShiftClose();
        obj.encShiftID = this.encShiftID;
        obj.initTime = this.appBO.initTime;
        obj.lst = this.pendingAct;
        obj.observation = this.observation;
        obj.inchargeAssessment = this.inchargeAssess;
        this._saService.manageShiftCloseActivities(obj);
    }

    validation() {
        // var lst = this.pendingAct.filter(ob => !CommonMethods.hasValue(ob.statusID))
        // if (lst.length > 0)
        //     return SamplePlanMessages.taskStatus;
        // var status = this.statusList.filter(o => o.catItemCode == 'COM')
        // var obj = this.pendingAct.filter(ob => ob.statusID != status[0].catItemID && !CommonMethods.hasValue(ob.remarks))

        // if (obj.length > 0)
        //     return SamplePlanMessages.tastRemarks;
        if (CommonMethods.hasValue(this.encUserTestID)) {
            var data = this.pendingAct.filter(x => x.encUserTestID == this.encUserTestID);
            if (!CommonMethods.hasValue(data[0].statusID))
                return SamplePlanMessages.taskStatus;
            if (!CommonMethods.hasValue(data[0].remarks))
                return SamplePlanMessages.tastRemarks;
        }

        if (this.appBO.appLevel == 1 && !CommonMethods.hasValue(this.observation))
            return SamplePlanMessages.observation;
        if (this.appBO.appLevel == 1 && !CommonMethods.hasValue(this.inchargeAssess))
            return SamplePlanMessages.inchargeAssess
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encShiftID;
        obj.code = 'CLOSE_SHIFT';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encShiftID, EntityCodes.closeShift, this.appBO.appLevel, this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    getStatus(data: any) {
        if (data.activity == 'Sampling' || data.activity == 'Manual Activity' || data.activity == 'Invalidations')
            return this.statusList.filter(x => x.catItemCode != 'DISCARD' && x.catItemCode != 'COMPLETED_INVAL' && x.catItemCode != 'COMPLETED_OOS' && x.catItemCode != 'INVAL_UNDER_PROG' && x.catItemCode != 'OOS_UNDER_PROG')
        else if (data.activity == 'Calibrations' || data.activity == 'Out of Specification')
            return this.statusList.filter(x => x.catItemCode != 'DISCARD' && x.catItemCode != 'COMPLETED_OOS' && x.catItemCode != 'OOS_UNDER_PROG')
        else if (data.activity == "Data Review")
            return this.statusList.filter(x => x.catItemCode != 'DISCARD' && x.catItemCode != "DEVIATION" && x.catItemCode != 'COMPLETED_INVAL' && x.catItemCode != 'COMPLETED_OOS' && x.catItemCode != 'INVAL_UNDER_PROG' && x.catItemCode != 'OOS_UNDER_PROG')

        else
            return this.statusList;
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encShiftID
        obj.code = EntityCodes.closeShift;
        this.viewHistory = obj;
    }

    onStatusChange(evt, data) {
        var obj = this.statusList.filter(x => x.catItemID == evt);
        if ((obj[0].catItemCode == 'COM' || obj[0].catItemCode == 'COMPLETED_OOS' || obj[0].catItemCode == 'COMPLETED_INVAL') && !data.isTestCompleted) {
            setTimeout(() => {
                data.statusID = null;
            }, 200);
            return this._alert.warning(SamplePlanMessages.testNotCom);
        }
    }

    getTooltip(data) {
        var val: string = "";
        if (CommonMethods.hasValue(data.oosNumber))
            val = "OOS Number : " + data.oosNumber + "\n";
        if (CommonMethods.hasValue(data.invalidationCodes))
            val = val + "Invalidation Number(s) : " + data.invalidationCodes;
        return val;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encShiftID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    getData(id) {
        if (CommonMethods.hasValue(id))
            return this.pendingAct.filter(x => x.planID == id)
        else
            return this.pendingAct.filter(x => !CommonMethods.hasValue(x.planID))
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        localStorage.removeItem("USER_TEST_ID");
    }
}