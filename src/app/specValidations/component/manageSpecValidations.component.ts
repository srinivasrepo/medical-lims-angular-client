import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpecValidationsService } from '../service/specValidations.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, Categories, LimsRespMessages, GridActions, ActionMessages, EntityCodes, PageUrls, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { SpecValidRequestBO, SpecCyclesReq, viewSpecValidBO, testValid } from '../model/specValidations';
import { AlertService } from 'src/app/common/services/alert.service';
import { SpecValidationMessages } from '../messages/specValidationsMessages';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { ActivatedRoute, Router } from '@angular/router';
import { AppBO, CategoryItemList, GetCategoryBO, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { ManageAnalysisComponent } from 'src/app/sampleAnalysis/component/manageAnalysis.component';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { QCCalibrationMessages } from 'src/app/qcCalibrations/messages/qcCalibrationMessages';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';
import { ReportView } from 'src/app/common/component/reportView.component';
import { ReportBO } from 'src/app/reports/models/report.model';

@Component({
    selector: 'mng-spec-valid',
    templateUrl: '../html/manageSpecValidations.html'
})

export class ManageSpecValidationsCompnent {
    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.manageSpecValidation;

    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    testInfo: LookupInfo;
    @ViewChild('specTests', { static: true }) specTests: LookupComponent;

    testCondition: string = "1=2";
    modeList: any;
    disableButtonReq: boolean = false;

    specReqBO: SpecValidRequestBO = new SpecValidRequestBO();
    encSpecValidationID: string;
    dataSource: any;
    headers: any;
    gridActions: any = [GridActions.analysis, GridActions.delete];
    appBo: AppBO = new AppBO();
    status: string;
    reqCode: string;
    showAnalysis: boolean = false;
    entityCode: string;
    entityActID: number;
    @ViewChild('samAna', { static: true }) samAna: ManageAnalysisComponent;
    pageType: string = 'MNG';
    viewSpec: viewSpecValidBO = new viewSpecValidBO();
    viewHistory: any;
    showHistory: boolean = false;
    backUrl: string = PageUrls.homeUrl;
    templateInfo: LookupInfo;
    @ViewChild('tempalte', { static: true }) tempalte: LookupComponent;
    condition: string;
    regPageType: string = 'MNG';
    isLoaderStart: boolean;
    isLoaderStartForAddCycles: boolean;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];
    removeActions: any = { headerName: 'specCycle', DELETE: 'isSystemGenerated' }
    cycleName: string;
    constructor(private _specService: SpecValidationsService, public _global: GlobalButtonIconsService, private _alert: AlertService, private _confirmService: ConfirmationService,
        private _actRoute: ActivatedRoute, private _modal: MatDialog, private _router: Router) {
        if (sessionStorage.getItem("entitytype") == 'QCCALIB') {
            this.entityCode = EntityCodes.calibrationValidation;
            this.pageTitle = PageTitle.manageCalibValidation;
        }
        else this.entityCode = EntityCodes.specValidation;
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encSpecValidationID = param['id']);
        this.subscription = this._specService.specValidSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList") {
                this.totalCatItemList = resp.result;
                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
            }

            else if (resp.purpose == "manageSpecValidationsDetails") {
                this.isLoaderStart = false;
                if (resp.result.act.returnFlag == "SUCCESS") {
                    if (this.entityCode == EntityCodes.specValidation)
                        this._alert.success(SpecValidationMessages.specValidSuccess);
                    else
                        this._alert.success(SpecValidationMessages.calibSucc);
                    this.appBo = resp.result.act;
                    this.encSpecValidationID = this.appBo.encTranKey;
                    this.status = resp.result.act.status;
                    this.reqCode = resp.result.act.referenceNumber;
                    this.prepareHeaders();
                    this.dataSource = CommonMethods.bindMaterialGridData(resp.result.specValidtions);
                    this.specifications.disableBtn = this.specTests.disableBtn = true;
                    this.viewSpec.specification = this.specifications.selectedText;
                    this.viewSpec.testName = this.specTests.selectedText;
                    this.viewSpec.template = this.tempalte.selectedText;
                    var obj = this.totalCatItemList.filter(x => x.catItemID == this.specReqBO.mode)
                    this.viewSpec.mode = obj[0].catItem;
                    if (CommonMethods.hasValue(this.encSpecValidationID))
                        this._specService.getSpecValidationDetails(this.encSpecValidationID, this.entityCode);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.act.returnFlag));
            }
            else if (resp.purpose == "getSpecValidationDetails") {
                this.appBo = resp.result.recordActionResults;
                this.specReqBO.mode = resp.result.getSpecTestDetailsBO.mode;
                this.specReqBO.specTestCatID = resp.result.getSpecTestDetailsBO.specTestCatID;
                this.specTests.setRow(resp.result.getSpecTestDetailsBO.specTestCatID, resp.result.getSpecTestDetailsBO.testTitle);
                this.specifications.setRow(resp.result.getSpecTestDetailsBO.specID, resp.result.getSpecTestDetailsBO.specification);
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.specCycleDetail);
                this.specifications.disableBtn = this.specTests.disableBtn = true;
                this.viewSpec.specification = resp.result.getSpecTestDetailsBO.specification;
                this.viewSpec.testName = resp.result.getSpecTestDetailsBO.testTitle;
                this.viewSpec.mode = resp.result.getSpecTestDetailsBO.modeType;
                this.viewSpec.matCode = resp.result.getSpecTestDetailsBO.matCode;
                this.viewSpec.documentName = resp.result.getSpecTestDetailsBO.documentName;
                this.viewSpec.documentID = resp.result.getSpecTestDetailsBO.documentID;
                this.status = resp.result.getSpecTestDetailsBO.status;
                this.reqCode = resp.result.getSpecTestDetailsBO.requestCode;
                this.viewSpec.template = resp.result.getSpecTestDetailsBO.template;
                this.viewSpec.specificationName = resp.result.getSpecTestDetailsBO.specificationName;
                this.showViewHistory();
                if (this.appBo.operationType == "VIEW") {
                    this.regPageType = this.appBo.operationType;
                    this.prepareHeaders();
                }

                var categoryObj: CategoryItem = new CategoryItem();
                categoryObj.catItem = resp.result.getSpecTestDetailsBO.modeType;
                categoryObj.catItemID = resp.result.getSpecTestDetailsBO.mode;
                categoryObj.catItemCode = resp.result.getSpecTestDetailsBO.modeCode;
                categoryObj.category = 'ANALYSIS_MODES';
                this.prepareAssignCatList(categoryObj);

            }
            else if (resp.purpose == "manageCycleDetails") {
                this.isLoaderStartForAddCycles = false;
                if (resp.result.act.returnFlag == "SUCCESS") {
                    if (resp.type == "SAVE") {
                        if (this.entityCode == EntityCodes.specValidation)
                            this._alert.success(SpecValidationMessages.specCycleAdded);
                        else
                            this._alert.success(SpecValidationMessages.calibCycle);
                    }
                    else {
                        if (this.entityActID == resp.cycleID){
                            setTimeout(() => {
                                this.showAnalysis = false;
                            }, 200);
                        }
                        this._alert.success(SpecValidationMessages.specCycleDeleted);
                    }
                    this.appBo = resp.result.act;
                    this.dataSource = CommonMethods.bindMaterialGridData(resp.result.specValidtions);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.act.returnFlag));
            }
            else if (resp.purpose == "validateTest" && resp.result != 'OK') {
                this._alert.error(ActionMessages.GetMessageByCode(resp.result + '_' + this.entityCode));
                this.specTests.clear();
            }
            else if (resp.purpose == "viewARDSMasterDocument") {
                const modal = this._modal.open(ReportView, CommonMethods.modalFullWidth);
                modal.componentInstance.setAuditReportUrl = resp.result;
            }
        })

        if (this.entityCode == EntityCodes.specValidation) {
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification, LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, "(STATUS_CODE = 'ACT' OR STATUS_CODE = 'FOR_VALID' OR STATUS_CODE = 'VALIDATE_FAILD' )", 'Material Code', 'LIMS');
            this.condition = "STP_TYPE = 'A' AND STATUS_CODE = 'ACT'";
        }
        else {
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibration, LookupCodes.getCalibrationParameters, LKPDisplayNames.calibrationParameter, LKPDisplayNames.calibCode, LookUpDisplayField.code, LKPPlaceholders.calibrationParam, "(STATUS_CODE = 'ACT' OR STATUS_CODE = 'FOR_VALID' OR STATUS_CODE = 'VALIDATE_FAILD' )", '', 'LIMS');
            this.condition = "STP_TYPE = 'C' AND STATUS_CODE = 'ACT'";
        }
        this.templateInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle, LKPDisplayNames.templateNo, LookUpDisplayField.header, LKPPlaceholders.stpTitle, this.condition);

        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageSpecValidationsCategories();
        obj.type = 'MNG';
        this._specService.getCatItemsByCatCodeList(obj);
        // this._specService.getCatItemsByCatCode(Categories.specificationApplicableCode);
        this.testLkp();
        this.changeBgColor('INIT');

        if (CommonMethods.hasValue(this.encSpecValidationID))
            this._specService.getSpecValidationDetails(this.encSpecValidationID, this.entityCode);
        if (CommonMethods.hasValue(localStorage.getItem('SPEC_VALID_PAGE'))) {
            this.regPageType = this.pageType = localStorage.getItem('SPEC_VALID_PAGE')
            if (this.entityCode == EntityCodes.specValidation)
                this.pageTitle = PageTitle.viewSpecValidation;
            else
                this.pageTitle = PageTitle.viewCalibValidation;
            this.tranHistory();
            this.showHistory = true;
            this.backUrl = "/lims/specValid/search";
        }
    }

    testLkp() {
        if (CommonMethods.hasValue(this.specTests.selectedId))
            this.specTests.clear();
        this.testCondition = "1=2"
        if (CommonMethods.hasValue(this.specifications.selectedId) && this.entityCode == EntityCodes.specValidation)
            this.testCondition = 'SpecID =' + this.specifications.selectedId;
        if (CommonMethods.hasValue(this.specifications.selectedId) && this.entityCode == EntityCodes.calibrationValidation)
            this.testCondition = 'CalibParamID =' + this.specifications.selectedId;
        if (this.entityCode == EntityCodes.calibrationValidation)
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getSpecificatioinTests, LKPDisplayNames.test, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.test, this.testCondition, "", "LIMS");
        else
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getSpecificatioinTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, this.testCondition, "", "LIMS");

    }

    saveRequest() {
        this.disableButtonReq = true;

        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg)) {
            this._alert.warning(errMsg);
            return this.disableButtonReq = false;
        }

        this._confirmService.confirm(LimsRespMessages.continue).subscribe(re => {
            if (re) {
                this.specReqBO.specTestCatID = this.specTests.selectedId;
                this.specReqBO.entityCode = this.entityCode;
                if (!this.isShow(this.specReqBO.mode))
                    this.specReqBO.stpTemplateID = this.tempalte.selectedId;
                this.isLoaderStart = true;
                this._specService.manageSpecValidationsDetails(this.specReqBO);
            }
            else
                this.disableButtonReq = false;
        })
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ columnDef: 'cycle', header: 'Cycle', cell: (element: any) => `${element.cycle}`, width: "maxWidth-15per" });
        this.headers.push({ columnDef: 'status', header: 'Status', cell: (element: any) => `${element.status}`, width: "maxWidth-15per" });
        if (this.regPageType != 'VIEW')
            this.headers.push({ columnDef: 'remarks', header: 'Remarks', cell: (element: any) => `${element.remarks}`, width: "maxWidth-15perinput" });
        else
            this.headers.push({ columnDef: 'rem', header: 'Remarks', cell: (element: any) => `${element.remarks}`, width: "maxWidth-15perinput" })
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSpecValidationID;
        obj.code = this.entityCode;
        this.viewHistory = obj;
    }

    showViewHistory() {
        if (CommonMethods.hasValue(this.encSpecValidationID)) {
            this.showHistory = true;
            this.tranHistory();
        }
        else
            this.showHistory = false;
    }

    validation() {
        if (!CommonMethods.hasValue(this.specifications.selectedId)) {
            if (this.entityCode == EntityCodes.specValidation)
                return SpecValidationMessages.specification;
            else
                return SpecValidationMessages.calibration;
        }
        if (!CommonMethods.hasValue(this.specTests.selectedId)) {
            if (this.entityCode == EntityCodes.specValidation)
                return SpecValidationMessages.test;
            else
                return SpecValidationMessages.parameter;
        }

        if (!CommonMethods.hasValue(this.specReqBO.mode))
            return SpecValidationMessages.mode;

        var obj = this.totalCatItemList.filter(x => x.catItemID == this.specReqBO.mode)
        if ((obj[0].catItemCode != "YES" && obj[0].catItemCode != "NO") && !CommonMethods.hasValue(this.tempalte.selectedId))
            return QCCalibrationMessages.selectTemplate;
    }

    onActionClicked(evt) {
        if (evt.action == "ANALYSIS") {
            if (this.entityActID != evt.val.specValidCycleID) {
                this.entityActID = evt.val.specValidCycleID;
                this.showAnalysis = false;
                setTimeout(() => {
                    this.cycleName = evt.val.cycle;
                    this.showAnalysis = true;
                }, 100);
            }
        }
        else {
            this._confirmService.confirm(LimsRespMessages.delete).subscribe(resp => {
                if (resp) {
                    this.manageCycle("DELETE", evt.val.specValidCycleID);
                }
            })
        }
    }

    manageCycle(type: string, cycleID?: number) {
        var obj: SpecCyclesReq = new SpecCyclesReq();
        obj.encSpecValidationID = this.encSpecValidationID;
        obj.initTime = this.appBo.initTime;
        obj.type = type;
        obj.specValidCycleID = cycleID;
        obj.entityCode = this.entityCode;
        this.isLoaderStartForAddCycles = true;
        this._specService.manageCycleDetails(obj);
    }

    updateAppInfo(obj) {
        this._specService.getSpecValidationDetails(this.encSpecValidationID, this.entityCode);
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSpecValidationID;
        obj.code = this.entityCode;

        const modal = this._modal.open(ApprovalComponent);
        modal.disableClose = true;
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBo.detailID, this.encSpecValidationID, EntityCodes.specValidation, this.appBo.appLevel, this.appBo.initTime);
        modal.componentInstance.transHis = obj;

        modal.afterClosed().subscribe(re => {
            if (re == 'OK')
                this._router.navigateByUrl(PageUrls.homeUrl);
        })
    }

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'blue-light';
    }

    validateTest() {
        if (CommonMethods.hasValue(this.specTests.selectedId)) {
            var obj: testValid = new testValid();
            obj.entActID = this.specifications.selectedId;
            obj.testCatID = this.specTests.selectedId;
            obj.entityCode = this.entityCode;
            this._specService.validateTest(obj);
        }
    }

    isShow(modeID) {
        if (CommonMethods.hasValue(modeID)) {
            var obj = this.totalCatItemList.filter(x => x.catItemID == modeID);
            if (obj && obj.length > 0)
                return obj[0].catItemCode == 'NO' || obj[0].catItemCode == 'YES';
            else return true;
        }
        else return true;
    }

    getSpec() {
        var obj: any = { specID: this.entityCode == EntityCodes.specValidation ? this.specifications.selectedId : 0, calibID: this.entityCode == EntityCodes.calibrationValidation ? this.specifications.selectedId : 0 };

        const modal = this._modal.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = this.entityCode == EntityCodes.specValidation ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
        modal.componentInstance.encSpecID = obj.specID;
        modal.componentInstance.entityCode = this.entityCode;
        modal.componentInstance.encCalibID = obj.calibID;
        modal.componentInstance.isShow = true;

    }

    getDocument() {
        if (!CommonMethods.hasValue(this.viewSpec.documentID))
            return;
        else
            this._specService.viewARDSMasterDocument(this.viewSpec.documentID);
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    getValidationRpt() {
        let obj = new ReportBO();

        if (CommonMethods.hasValue(this.specifications.selectedId))
            obj.entActID = this.specifications.selectedId;
        obj.versionCode = "SPECVALIDATION_V1";

        obj.reportType = 'RPT';
        obj.entityRPTCode = "SPECVALIDATION";
        const modalRef = this._modal.open(ReportView, CommonMethods.modalFullWidth);
        modalRef.componentInstance.rpt = obj;
    }

    ngOnDestroy() {
        this.changeBgColor('CLEAR');
        localStorage.removeItem('SPEC_VALID_PAGE')
        this.subscription.unsubscribe();
    }
}