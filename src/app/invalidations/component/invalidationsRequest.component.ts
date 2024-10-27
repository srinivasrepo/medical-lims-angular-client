import { Component, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { InvalidationsService } from '../service/invalidations.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { invalidationsMessages } from '../messages/invalidationsMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ManageInvalidationBO, GenericIDBOList, ManageInvalidationManualInfo } from '../model/invalidationsModel';
import { AppBO, CategoryItem, CategoryItemList, GetCategoryBO } from 'src/app/common/services/utilities/commonModels';
import { LimsRespMessages, ActionMessages, PageUrls, ButtonActions, EntityCodes, LookupCodes, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog, MatTabGroup } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { invalidationEvaluationComponent } from './invalidationsEvaluation.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GetPreviousInvalidationsComponent } from './getPreviousInvalidations.component';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';

@Component({
    selector: 'inv-req',
    templateUrl: '../html/invalidationsRequest.html'
})

export class manageInvalidationsRequestComponent {
    pageTitle: string = PageTitle.manageInvalidations;
    encInvalidationID: string;
    impactType: string;
    sampleNumber: string;
    dataNumbers: string;
    description: string;
    btnType: string = ButtonActions.btnSave;
    reqBtnType: string = ButtonActions.btnSave;
    btnUpload: string = ButtonActions.btnUpload;
    subscription: Subscription = new Subscription();
    disable: boolean = false;
    result: any = [];
    instrumentType: any;
    appBO: AppBO = new AppBO();
    appLevel: number = 0;
    confBtnDisable: boolean = true;
    status: string;
    refNo: string;
    impactDis: boolean = false;
    backUrl: string = PageUrls.homeUrl;
    testType: string = "Name of the"
    viewHistoryVisible: boolean;
    viewHistory: any;
    analystInfo: LookupInfo;
    qcInstrTypesInfo: LookupInfo;
    @ViewChild('evaluation', { static: true }) evaluation: invalidationEvaluationComponent;
    @ViewChild('review', { static: true }) review: invalidationEvaluationComponent;
    @ViewChild('invTab', { static: true }) invTab: MatTabGroup;
    @ViewChild('analyst', { static: false }) analyst: LookupComponent;
    @ViewChild('qcInstrTypes', { static: false }) qcInstrTypes: LookupComponent;
    isPrevReqPending: boolean = false;
    entityCode: string = EntityCodes.invalidations;
    prevInvalidationID: number;
    equpCondition: string;
    conditionCode: string;
    entitySource: string;
    instCode: string;
    isLoaderStart: boolean;
    isLoaderStartReq: boolean;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];
    mngManualObj: ManageInvalidationManualInfo = new ManageInvalidationManualInfo();

    constructor(private invalidationService: InvalidationsService, public alert: AlertService, private _confirmService: ConfirmationService,
        public _router: Router, private _matDailog: MatDialog, private actRoute: ActivatedRoute, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(param => this.encInvalidationID = param['id']);
        this.subscription = this.invalidationService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "getInvalidationData") {
                if (resp.result.canProcess == "NOT_COMPLITED") {
                    if (resp.result.enitySourecDesc == 'Volumetric Solutions')
                        resp.result.enitySourecDesc = 'volumetric solutions process';
                    else if (resp.result.enitySourecDesc == 'Out of Specification')
                        resp.result.enitySourecDesc = 'Analysis';

                    this.alert.error('Please complete ' + resp.result.enitySourecDesc + ' to proceed further');
                    this._router.navigate(['/lims/home']);
                    return;
                }
                else if (resp.result.prevInvalidationID) {
                    // this.checkPrevInstr = resp.result.instType;
                    this.prevInvalidationID = resp.result.prevInvalidationID;
                }
                this.mngManualObj = resp.result;
                this.mngManualObj.testName = resp.result.testTitle;
                this.mngManualObj.specStpNumber = resp.result.specStpNo;
                this.mngManualObj.instrumentTypeID = resp.result.instTypeID;
                this.instCode = resp.result.eqpCode;
                this.result = resp.result;
                this.status = resp.result.status;
                this.refNo = resp.result.invalidationNumber;
                this.impactType = resp.result.impactTypeCode;
                this.sampleNumber = resp.result.sampleSetNo;
                this.dataNumbers = resp.result.dataFileNo;
                this.description = resp.result.description;
                this.instrumentType = resp.result.instType;
                this.appBO = resp.result.act;
                this.appLevel = resp.result.applevel;
                this.mngManualObj.encInvalidationID = this.appBO.encTranKey;
                this.entitySource = resp.result.entitySource;
                if (CommonMethods.hasValue(resp.result.instID))
                    this.qcInstrTypes.setRow(resp.result.instID, resp.result.eqpTitle)
                if (this.manualEntitySource() && CommonMethods.hasValue(this.encInvalidationID))
                    this.enableManualHeaders(false);
                if (resp.result.entitySource == 'INVAL_SAMANA')
                    this.testType = 'Sample Analysis Test';
                else if (resp.result.entitySource == 'INVAL_CALIB')
                    this.testType = 'Parameter Name';
                else if (resp.result.entitySource == 'INVAL_OOS')
                    this.testType = 'Test Name';
                else this.testType = 'Solution Name'
                if (CommonMethods.hasValue(resp.result.analysisUserRoleID))
                    this.analyst.setRow(resp.result.analysisUserRoleID, this.result.analysisUser)
                if (CommonMethods.hasValue(this.impactType))
                    this.enableHeaders(false);
                this.impactDis = CommonMethods.hasValue(this.result.invalidationCode);
                this.isPrevReqPending = resp.result.isPreviousRequestsPending;

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = resp.result.impactTypeName;
                obj.catItemID = resp.result.imapactType;
                obj.catItemCode = resp.result.impactTypeCode;
                obj.category = 'INVALID_IMPACT_TYPE';
                this.prepareAssignCatList(obj);

                var prObj: CategoryItem = new CategoryItem();
                prObj.catItem = resp.result.instTypeName;
                prObj.catItemID = resp.result.instType;
                prObj.catItemCode = resp.result.instTypeCode;
                prObj.category = 'INVALID_INSTRU_TYPE';
                this.prepareAssignCatList(prObj);
                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
                this.equpConditon(this.mngManualObj.instrumentTypeID, "GET_CALL");
            }
            else if (resp.purpose == "REQ") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.enableHeaders(false);
                    //this.result.invalidationCode = resp.result.referenceNumber;
                    this.appBO = resp.result;
                    this.alert.success(invalidationsMessages.requestSuccess);
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "manageInvalidationManualInfo") {
                this.isLoaderStartReq = false;
                if (resp.result.returnFlag == "OK") {
                    this.appBO = resp.result;
                    this.enableManualHeaders(false);
                    this.alert.success(invalidationsMessages.manualRequestSaved);
                    this.encInvalidationID = this.mngManualObj.encInvalidationID = this.appBO.encTranKey;
                    this.invalidationService.getInvalidationData(this.encInvalidationID);
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        });
        this.showHistory();
        this.prepareLkp();
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetInvalidationReqTabCategories();
        obj.type = 'MNG';
        this.invalidationService.getCatItemsByCatCodeList(obj);
        if (!CommonMethods.hasValue(this.encInvalidationID))
            this.entitySource = "INVAL_MANUAL";
        else
            this.invalidationService.getInvalidationData(this.encInvalidationID);

    }

    manualEntitySource() {
        return this.entitySource == "INVAL_MANUAL" ? true : false;
    }

    getInstCode(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
            this.instCode = evt.val.code;
        else
            this.instCode = null;
    }

    prepareLkp() {
        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analysisDone, LookupCodes.getQCUsers, LKPDisplayNames.analystName,
            LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analysisDone, "UserActive = 1 AND StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.qcInstrTypesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getActiveEquipments,
            LKPDisplayNames.Equipment, LKPDisplayNames.EquipmentCode, LookUpDisplayField.header, LKPPlaceholders.Equipment, this.equpCondition, "", "LIMS");
    }

    equpConditon(evt, type?) {
        if (type != "GET_CALL")
            this.qcInstrTypes.clear();
        if (!CommonMethods.hasValue(evt))
            this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE'";
        else if(this.totalCatItemList && this.totalCatItemList.length > 0){
            this.conditionCode = this.totalCatItemList.filter(x => x.catItemID == evt)[0].catItemCode;
            this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE' AND TYPE_CODE='" + this.conditionCode + "'";
        }
        this.prepareLkp();
    }

    saveManualInvalidationReq() {
        if (this.reqBtnType == ButtonActions.btnUpdate)
            return this.enableManualHeaders(true);

        var errMsg: string = this.valdations("ManualReq");
        if (CommonMethods.hasValue(errMsg))
            return this.alert.warning(errMsg);

        this.isLoaderStartReq = true;
        this.mngManualObj.instrumentID = this.qcInstrTypes.selectedId;
        this.invalidationService.manageInvalidationManualInfo(this.mngManualObj);
    }

    saveRequest() {
        if (this.btnType == ButtonActions.btnUpdate) {
            this.enableHeaders(true);
            return
        }
        var errMsg: string = this.valdations("Request");
        if (CommonMethods.hasValue(errMsg))
            return this.alert.warning(errMsg);
        var obj: ManageInvalidationBO = new ManageInvalidationBO();
        obj.encInvalidationID = this.encInvalidationID;
        obj.type = 'REQ';
        obj.impactTypeCode = this.impactType;
        obj.sampleSetNo = this.sampleNumber;
        obj.dataFileNo = this.dataNumbers;
        obj.description = this.description;
        obj.instType = this.instrumentType;
        obj.initTime = this.appBO.initTime;
        obj.analysisDone = this.analyst.selectedId;
        this.isLoaderStart = true;
        this.invalidationService.manageInvalidationInfo(obj);
    }

    clear() {
        this.sampleNumber = this.dataNumbers = this.description = "";

        if (!this.impactDis)
            this.impactType = this.instrumentType = ""
        if (CommonMethods.hasValue(this.analyst))
            this.analyst.clear();
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.analyst.disableBtn = !val;
        this.disable = !val;
    }

    enableManualHeaders(val: boolean) {
        this.reqBtnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.qcInstrTypes.disableBtn = !val;
    }

    valdations(type: string) {
        if (type == "Request") {
            if (!CommonMethods.hasValue(this.impactType))
                return invalidationsMessages.impactType;
            else if (!CommonMethods.hasValue(this.sampleNumber))
                return invalidationsMessages.sampleNo;
            else if (!CommonMethods.hasValue(this.dataNumbers))
                return invalidationsMessages.datafiles;
            else if (!CommonMethods.hasValue(this.description))
                return invalidationsMessages.description;
            else if (!CommonMethods.hasValue(this.instrumentType))
                return invalidationsMessages.instrumentType;
            else if (!CommonMethods.hasValue(this.analyst.selectedId))
                return invalidationsMessages.analysisDone;
        }
        else if (type == "ManualReq") {
            if (!CommonMethods.hasValue(this.mngManualObj.productName))
                return invalidationsMessages.productName;
            else if (!CommonMethods.hasValue(this.mngManualObj.stage))
                return invalidationsMessages.stage;
            else if (!CommonMethods.hasValue(this.mngManualObj.batchNumber))
                return invalidationsMessages.batchNumber;
            else if (!CommonMethods.hasValue(this.mngManualObj.arNumber))
                return invalidationsMessages.arNumber;
            else if (!CommonMethods.hasValue(this.mngManualObj.instrumentTypeID))
                return invalidationsMessages.instrumentType;
            else if (!CommonMethods.hasValue(this.qcInstrTypes.selectedId))
                return invalidationsMessages.instrumentID;
            else if (!CommonMethods.hasValue(this.mngManualObj.testName))
                return invalidationsMessages.testName;
            else if (!CommonMethods.hasValue(this.mngManualObj.specStpNumber))
                return invalidationsMessages.specStp;
        }
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encInvalidationID;
        obj.code = 'INVALID_ATIONS';

        if (CommonMethods.hasValue(this.isPrevReqPending) && this.appBO.appLevel == 2) {
            this._confirmService.confirm(invalidationsMessages.confirm).subscribe(resp => {
                if (resp) {
                    const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
                    modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encInvalidationID,this.entityCode,this.appBO.appLevel,this.appBO.initTime);
                    modal.componentInstance.transHis = obj;
                    modal.afterClosed().subscribe((obj) => {
                        if (obj == "OK")
                            this._router.navigate(['/lims/home']);
                    });
                }
                else
                    return
            })
        }
        else {
            const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encInvalidationID, EntityCodes.invalidations, this.appBO.appLevel, this.appBO.initTime);
            modal.componentInstance.transHis = obj;
            modal.afterClosed().subscribe((obj) => {
                if (obj == "OK")
                    this._router.navigate(['/lims/home']);
            });
        }
    }

    show() {
        if (this.appBO.canApprove && this.result.applevel == 0 && this.invTab.selectedIndex == 0) {
            this.confBtnDisable = false;
            return true;
        }
        else if (this.appBO.canApprove && this.result.applevel == 1 && this.invTab.selectedIndex == 1) {
            this.confBtnDisable = false;
            return true;
        }
        else if (this.appBO.canApprove && this.result.applevel > 1 && this.invTab.selectedIndex == 2) {
            this.confBtnDisable = false;
            return true;
        }
        else {
            this.confBtnDisable = true;
            return false;
        }
    }

    getPreviousInvalidations() {
        const modal = this._matDailog.open(GetPreviousInvalidationsComponent, { width: '75%' });
        modal.componentInstance.encInvalidationID = this.encInvalidationID;
        modal.disableClose = true;
    }

    updateData(evt) {
        this.appBO = evt;
        this.evaluation.appBO = evt;
        this.review.appBO = evt;
    }

    uploadFiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.invalidations, 0, 'INVALID_REQ', this.encInvalidationID, [], 'MEDICAL_LIMS', this.refNo);
        modal.componentInstance.mode = this.btnType == ButtonActions.btnUpdate ? 'VIEW' : "MANAGE";
    }

    formatValueString(val) {
        return CommonMethods.FormatValueString(val);
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encInvalidationID;
        obj.code = 'INVALID_ATIONS';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encInvalidationID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 0)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else return null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}