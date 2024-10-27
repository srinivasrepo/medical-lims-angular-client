import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { CategoryCodeList, GridActions, ActionMessages, LookupCodes } from 'src/app/common/services/utilities/constants';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { GetAssignedTestSampleUserModel, ManageAssignTestModel } from '../model/samplePlanModel';
import { AppBO, GetCategoryBO } from 'src/app/common/services/utilities/commonModels';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ChangeUserPlanTestComponent } from './changeUserPlanTest.component';

@Component({
    selector: 'sample-assign',
    templateUrl: '../html/manageAssignUnAssignTest.html'
})
export class ManageAssingUnAssignTestPlanComponent {
    objAssignedBo: GetAssignedTestSampleUserModel = new GetAssignedTestSampleUserModel();
    taskAssignBo: ManageAssignTestModel = new ManageAssignTestModel();
    catCodeList: Array<any> = [];
    getUserPlanTestDataSource: any;
    headersData: any;
    actions: Array<string> = [GridActions.unAssign, GridActions.ChangeUserPlanTest];
    appBo: AppBO = new AppBO();
    samplesInfo: LookupInfo;
    @ViewChild('samples', { static: false }) samples: LookupComponent;
    disableBtn: boolean;
    condition: string = '1=2';
    respResult: string;
    removeActions: any = { headerName: 'UnAssign', action: 'UN_ASSIGN', canUnAssign: "canUnAssign" };

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;

    constructor(private _service: SamplePlanService, private _alert: AlertService, private _matDialog: MatDialog,
        private _matDailogRef: MatDialogRef<ManageAssingUnAssignTestPlanComponent>,
        private _confirm: ConfirmationService, public _global: GlobalButtonIconsService) { }

    ngAfterViewInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.catCodeList = resp.result;
            else if (resp.purpose == "planActivitiesDetails") {
                this.prepareHeaders();
                resp.result.forEach((item, idx) => {
                    item['sno'] = idx + 1;
                })
                this.getUserPlanTestDataSource = CommonMethods.bindMaterialGridData(resp.result);
            }
            else if (resp.purpose == 'unAssignUserTests') {
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.respResult = 'SUCCESS';
                    this.appBo = resp.result;
                    this._alert.success(SamplePlanMessages.unAssignTestSampleSaved);
                    this._service.planActivitiesDetails(this.objAssignedBo);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == 'assignActivityToUser') {
                this.isLoaderStart = false;
                if (resp.result.rec.returnFlag == 'SUCCESS') {
                    this.appBo = resp.result.rec;
                    resp.result.act.forEach((item, idx) => {
                        item['sno'] = idx + 1;
                    })

                    this.getUserPlanTestDataSource = CommonMethods.bindMaterialGridData(resp.result.act);
                    this._alert.success(SamplePlanMessages.assignTestSampleSaved);
                    this.taskAssignBo = new ManageAssignTestModel();
                    this.respResult = 'SUCCESS';
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.rec.returnFlag));
            }

        })
        if (this.objAssignedBo.encPlanID)
            this.actions = [GridActions.unAssign]
        else
            this.actions = [GridActions.unAssign, GridActions.ChangeUserPlanTest]

        this._service.planActivitiesDetails(this.objAssignedBo);
        var obj: GetCategoryBO= new GetCategoryBO();
        obj.list = CategoryCodeList.GetSamplePlanAssignUnAssign();
        obj.type = 'MNG';
        this._service.getCatItemsByCatCodeList(obj);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'sno', "header": "S. No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-10per" });
        this.headersData.push({ "columnDef": 'activity', "header": "Activity Type", cell: (element: any) => `${element.activity}`, width: "minWidth-15per" });
        this.headersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`, width: "minWidth-15per" });
        this.headersData.push({ "columnDef": 'materialName', "header": "Product / Material Name", cell: (element: any) => `${element.materialName}`, width: "maxWidth-35per" });

        // this.headersData.push({ "columnDef": 'arNumber', "header": "Ar Number", cell: (element: any) => `${element.arNumber}` });
        // this.headersData.push({ "columnDef": 'activity', "header": "Activity", cell: (element: any) => `${element.activity}` });
        // this.headersData.push({ "columnDef": 'testTitle', "header": "Reference", cell: (element: any) => `${element.testTitle}` });

        this.headersData.push({ "columnDef": 'activityDescription', "header": "Activity Description", cell: (element: any) => `${element.activityDescription}`, width: "minWidth-20per" });

    }

    prepareLKPHeaders(code: string) {
        if (this.objAssignedBo.planID > 0)
            this.condition = "PlanID = " + this.objAssignedBo.planID;
        else
            this.condition = "";

        if (code == 'SAMPLING')
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sampleTitle, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.planSamplingInfo : LookupCodes.samplingActivityInfo, LKPDisplayNames.samplingActivityName, LKPDisplayNames.samplingActivityCode, LookUpDisplayField.code, LKPPlaceholders.samplingActivity, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? '' : 'Sample Inward Number', 'LIMS');

        else if (code == 'WET_INST') {
            if (CommonMethods.hasValue(this.condition))
                this.condition = this.condition + " AND  UserID = " + this.objAssignedBo.userID;
            else this.condition = "UserID = " + this.objAssignedBo.userID;

            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.wetInstrTitle, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.getSampleActivity : LookupCodes.wetAndInstrumentationInfo,  CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LKPDisplayNames.sampleActivityName : LKPDisplayNames.samplingActivityName, LKPDisplayNames.sampleActivityCode, LookUpDisplayField.code, LKPPlaceholders.sampleActivity, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? '' : 'Test Name', 'LIMS');
        }
        else if (code == 'INVALIDATION')
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.invalidation, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.invalidationActivityInfo : LookupCodes.inchargeInvalidationActivities, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LKPDisplayNames.InvalidationCode : LKPDisplayNames.samplingActivityName, LKPDisplayNames.InvalidationNumber, LookUpDisplayField.code, LKPPlaceholders.Invalidation, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? '' : 'Source Name', 'LIMS');
        else if (code == 'DATA_REVIEW')
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.dataReview, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.dataReviewActivityInfo : LookupCodes.dataReviewActivityInfoInchargeLevel, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LKPDisplayNames.requestType : LKPDisplayNames.samplingActivityName, LKPDisplayNames.systemCode, LookUpDisplayField.code, LKPPlaceholders.dataReview, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? '' : 'Source Name', 'LIMS');
        else if (code == 'SAMPLAN_MAN_ACTIVITI')
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.manualActTitle, LookupCodes.manualActInfo, LKPDisplayNames.manualActivityName, LKPDisplayNames.manualActivityCode, LookUpDisplayField.header, LKPPlaceholders.manualActivity, "CategoryCode = 'SAMPLAN_MAN_ACTIVITI'", '', 'LIMS');
        else if (code == 'OOS') {
            if (CommonMethods.hasValue(this.condition))
                this.condition = this.condition + " AND  UserID = " + this.objAssignedBo.userID;
            else this.condition = "UserID = " + this.objAssignedBo.userID;
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.oos, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.oosActivityInfo : LookupCodes.oosActivityInfoInchargeLevel, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LKPDisplayNames.oosCode : LKPDisplayNames.samplingActivityName, LKPDisplayNames.arNumber, LookUpDisplayField.code, LKPPlaceholders.oos, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? '' : 'OOS Number', 'LIMS');

        }
        else if (code == 'CALIBRATIONS')
            this.samplesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calib, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LookupCodes.calibActivityInfo : LookupCodes.calibActivityInfoInchargeLevel,  CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? LKPDisplayNames.parameter : LKPDisplayNames.samplingActivityName, LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.calibration, this.condition, CommonMethods.hasValue(this.objAssignedBo.encPlanID) ? 'Schedule Type' : 'Parameter Name', 'LIMS');

    }

    changeActivity() {
        if (CommonMethods.hasValue(this.taskAssignBo.activityCode)) {
            if (CommonMethods.hasValue(this.samples))
                this.samples.clear();
            this.prepareLKPHeaders(this.taskAssignBo.activityCode);
        }
    }

    onActionClicked(evt) {
        if (evt.action == 'UN_ASSIGN') {
            this._confirm.confirm(SamplePlanMessages.usrSampleTest).subscribe(resp => {
                if (resp) {
                    this.objAssignedBo.encUserTestID = evt.val.encUserTestID;
                    this.objAssignedBo.initTime = this.appBo.initTime;
                    this._service.unAssignUserTests(this.objAssignedBo);
                }
            })

        }
        else if (evt.action == "CHANGE_USR_PLAN_TEST") {
            const modal = this._matDialog.open(ChangeUserPlanTestComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.usrTestBO = { encPlanID: null, userRoleID: evt.val.userRoleID, initTime: null, userTestID: evt.val.userTestID, activityCode: evt.val.activityCode, testID: evt.val.testID, type: 'INCHARGE' }
            modal.afterClosed().subscribe(result => {
                if (result) {
                    this._service.planActivitiesDetails(this.objAssignedBo);
                }
            })

        }
    }

    assignUserTask() {

        var retVal = this.validateControls();
        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        this.taskAssignBo.encPlanID = this.objAssignedBo.encPlanID;
        this.taskAssignBo.initTime = this.appBo.initTime;
        this.taskAssignBo.encUserRoleID = this.objAssignedBo.encUserRoleID;
        this.taskAssignBo.activityActualID = this.samples.selectedId;
         this.isLoaderStart = true;
        this._service.assignActivityToUser(this.taskAssignBo);
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.taskAssignBo.activityCode))
            return SamplePlanMessages.sampleActivity;
        else if (!this.samples || !this.samples.selectedId)
            return this.taskAssignBo.activityCode == 'SAMPLAN_MAN_ACTIVITI' ? SamplePlanMessages.manualActivity : this.taskAssignBo.activityCode == 'SAMPLING' ? SamplePlanMessages.samplingActivity : this.taskAssignBo.activityCode == 'WET_INST' ? SamplePlanMessages.sampleTestAct : this.taskAssignBo.activityCode == 'INVALIDATION' ? SamplePlanMessages.invalidation : null;
        else if ((this.taskAssignBo.activityCode == 'SAMPLAN_MAN_ACTIVITI' || !CommonMethods.hasValue(this.objAssignedBo.encPlanID)) && !CommonMethods.hasValue(this.taskAssignBo.occupancyMin))
            return SamplePlanMessages.occupanyMinutes;
        // else if (this.taskAssignBo.activityCode == 'SAMPLAN_MAN_ACTIVITI' && !CommonMethods.hasValue(this.taskAssignBo.refNumber))
        //     return SamplePlanMessages.referNumber;
        // else if (this.taskAssignBo.activityCode == 'SAMPLAN_MAN_ACTIVITI' && !CommonMethods.hasValue(this.taskAssignBo.materialName))
        //     return SamplePlanMessages.matName;
        else if (this.taskAssignBo.activityCode == 'SAMPLAN_MAN_ACTIVITI' && !CommonMethods.hasValue(this.taskAssignBo.activityDesc))
            return SamplePlanMessages.taskDescription;
    }

    allowNumbers(evt) {
        return CommonMethods.allowNumber(evt, '');
    }

    close() {
        this._matDailogRef.close(this.respResult);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
