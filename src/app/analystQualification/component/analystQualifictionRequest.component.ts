import { Component, ViewChild } from '@angular/core';
import { LookupInfo, LookUpDisplayField, materialCatInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { analystService } from '../service/analyst.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, PageUrls, EntityCodes, ActionMessages, ButtonActions, GridActions, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { SearchTestsByTechniqueAndArID, ManageQualificationRequest, TestIDLIst, ManageQualificationEvaluation, SelectedCriteiaBO } from '../model/analystModel';
import { analystMessages } from '../messages/analystMessages';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AppBO, CategoryItem, CategoryItemList, GetCategoryBO, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { ArdsReportBO } from 'src/app/sampleAnalysis/model/sampleAnalysisModel';
import { AnalysisReportComponent } from 'src/app/sampleAnalysis/component/analysisReport.component';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { ReportBO } from 'src/app/reports/models/report.model';
import { ReportView } from 'src/app/common/component/reportView.component';

@Component({
    selector: 'analyst-QualfReq',
    templateUrl: '../html/analystQualifictionRequest.html',
})
export class AnalystQualifictionRequestComponent {

    pageTitle: string = PageTitle.anlaystQualifaction;
    analystInfo: LookupInfo;
    techniqueInfo: LookupInfo;
    refArNumberInfo: LookupInfo;
    volSolutionInfo: LookupInfo;
    status: string;
    refNo: string;
    materialInfo: materialCatInfo = new materialCatInfo();
    entitySourceCode: string = EntityCodes.analystQualif
    backUrl: string = PageUrls.homeUrl;
    condition: string;
    appBO: AppBO = new AppBO();
    subscription: Subscription = new Subscription();
    qualificationTypeList: any[];
    analysisTypeList: any[];
    testList: any[];
    materialID: number;
    categoryID: number;
    analysistypeId: number;
    hideFields: boolean = false;
    techniqueID: number;
    qualTypeID: number;
    arNUmberID: number;
    encQualificationID: string;
    getQualificationTestsDetailsList: any;
    btnType: string = ButtonActions.btnSave;
    ChangebtnType: string = ButtonActions.btnSave;
    analystID: number;
    headers: Array<any> = [];
    assignedTestList: any[];
    conclusionID: number;
    disabledControls: boolean = false;
    remarks: string;
    justification: string;
    isNeedJustification: boolean;
    arNUmber: string;
    tabIndex: number = 0;
    finalStatus: string;
    showRequalifiaction: boolean;
    reQualificationID: any;
    showJustification: boolean;
    typeCode: string;
    @ViewChild('analyst', { static: false }) analyst: LookupComponent;
    @ViewChild('technique', { static: false }) technique: LookupComponent;
    @ViewChild('refArNumber', { static: false }) refArNumber: LookupComponent;
    @ViewChild('volSolution', { static: false }) volSolution: LookupComponent;
    @ViewChild('materialCategory', { static: false }) materialCategory: materialCategoryComponent;
    acceptCriteria: any = [];
    analyHeader: any;
    analyDataSource: any;
    displayedColumns: any = [];
    extraColumns: any;
    referenceNo: string;
    reqBtnUpd: string = ButtonActions.btnUpload;
    evaBtnUpd: string = ButtonActions.btnUpload;
    UploadIDs: Array<SingleIDBO> = [];
    actions: any = [GridActions.Calib_Report]
    requestTypeCode: string;
    volSolutionID: number;
    versionCode: string;
    batchNumber: string;
    batchStatus: string;
    viewHistoryVisible: boolean;
    viewHistory: any;
    selectedTests: string;
    isLoaderStart: boolean;
    isLoaderStartEvaluation: boolean;

    totalCatItemList: CategoryItemList = [];
    assignCatItemList: CategoryItemList = [];

    constructor(private _analystService: analystService, private alert: AlertService, private actRoute: ActivatedRoute, private _limsContext: LIMSContextServices,
        public _global: GlobalButtonIconsService, private _modalDialog: MatDialog, private _router: Router,) {
        this.materialInfo.isCategoryShow = true;
        this.materialInfo.category = "Material Category";
        this.materialInfo.categoryList = [{ catCode: 'RAW_MAT' }, { catCode: 'PAK_MAT' }, { catCode: 'INTER_MAT' }, { catCode: 'FIN_MAT' }]
        this.materialInfo.isSubCategoryShow = false;
    }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(param => this.encQualificationID = param['id']);
        this.subscription = this._analystService.analystSubject.subscribe(resp => {
            if (resp.purpose == "getQualificationType") {
                this.qualificationTypeList = resp.result;
                if (this.qualificationTypeList[0].qualificationTypeID == 0) {
                    this.alert.error(ActionMessages.GetMessageByCode('DUP_ANALYST'));
                    this.hideFields = false;
                }
                else if (this.qualificationTypeList[0].qualificationTypeCode == 'SAME_USER') {
                    this.alert.error(analystMessages.sameUser);
                    this.hideFields = false;
                }
                this.qualTypeID = resp.result[0].qualificationTypeID;
                this.showRequalifiaction = resp.result[0].qualificationTypeCode == "REQUAL";
            }
            else if (resp.purpose == "getAnalysisTypeByCategoryID")
                this.analysisTypeList = resp.result;
            else if (resp.purpose == "getTestsByTechniqueAndArID") {
                this.testList = resp.result;
                if (CommonMethods.hasValue(this.assignedTestList)) {
                    this.testList.forEach(o => {
                        var obj = this.assignedTestList.filter(x => x.specTestID == o.specTestID)
                        if (obj.length > 0) {
                            o.isSelect = true;
                            o.qualificationTestID = obj[0].qualificationTestID;
                        }
                    })
                }
            }

            else if (resp.purpose == "manageQualificationRequest") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.alert.success(analystMessages.savedAnallyst);
                    this.appBO = resp.result;
                    this.status = resp.result.status;
                    this.refNo = resp.result.referenceNumber;
                    this.encQualificationID = resp.result.encTranKey;
                    this.showHistory();
                    this.disableHeaders(true);
                    this.UploadIDs = [];
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

            else if (resp.purpose == "getQualificationDetails") {
                if (resp.result.recordActionResults.returnFlag != 'SUCCESS') {
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.recordActionResults.returnFlag));
                    return this._router.navigateByUrl(this.backUrl);
                }
                this.requestTypeCode = resp.result.getQualificationRequestDetails.requestTypeCode;
                this.versionCode = resp.result.getQualificationRequestDetails.versionCode;
                this.batchNumber = resp.result.getQualificationRequestDetails.batchNumber;
                this.batchStatus = resp.result.getQualificationRequestDetails.batchStatus;
                this.volSolutionID = resp.result.getQualificationRequestDetails.volSolutionID;
                this.selectedTests = resp.result.getQualificationRequestDetails.selectedTests;
                this.appBO = resp.result.recordActionResults;
                this.analyst.setRow(resp.result.getQualificationRequestDetails.userRoleID, resp.result.getQualificationRequestDetails.analystName);
                if (CommonMethods.hasValue(resp.result.getQualificationRequestDetails.techniqueID)) {
                    this.techniqueID = resp.result.getQualificationRequestDetails.techniqueID;
                    this.technique.setRow(resp.result.getQualificationRequestDetails.techniqueID, resp.result.getQualificationRequestDetails.technique);
                }
                this.prepareHeaders();
                this.hideFields = true;
                this.qualificationTypeList = [];
                this.qualificationTypeList.push({ qualificationTypeID: resp.result.getQualificationRequestDetails.qualificationTypeID, qualificationType: resp.result.getQualificationRequestDetails.qualificationType })
                this.qualTypeID = resp.result.getQualificationRequestDetails.qualificationTypeID;
                this.showRequalifiaction = resp.result.getQualificationRequestDetails.qualificationTypeCode == "REQUAL";
                this.referenceNo = resp.result.getQualificationRequestDetails.referenceNo;

                if (this.requestTypeCode != 'VOLUMETRIC_SOLUTIONS') {
                    this.materialInfo.categoryCode = resp.result.getQualificationRequestDetails.categoryCode;
                    this.materialInfo.materialName = resp.result.getQualificationRequestDetails.materialCode;
                    this.materialID = this.materialInfo.materialID = resp.result.getQualificationRequestDetails.matID;
                    setTimeout(() => { this.materialCategory.bindData(); }, 1000);
                    this.arNUmberID = resp.result.getQualificationRequestDetails.arID;
                    setTimeout(() => {
                        this.analysistypeId = resp.result.getQualificationRequestDetails.analysisTypeID;
                        this.prepareLKP();
                        this.refArNumber.setRow(resp.result.getQualificationRequestDetails.arID, resp.result.getQualificationRequestDetails.arNumber);
                    }, 1000);
                    this.assignedTestList = resp.result.getTestsByTechniqueAndArIDList;
                    setTimeout(() => { this.getTests(); this.disableHeaders(true); }, 1000);
                    this.analyDataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.analysisResultList));
                    this.arNUmber = resp.result.getQualificationRequestDetails.aR_NUM;
                }
                else
                    this.volSolution.setRow(resp.result.getQualificationRequestDetails.volumetricIndexID, resp.result.getQualificationRequestDetails.chemicalName)
                this.refNo = resp.result.getQualificationRequestDetails.requestCode;
                this.status = resp.result.getQualificationRequestDetails.status;
                this.getQualificationTestsDetailsList = CommonMethods.bindMaterialGridData(resp.result.getQualificationTestsDetailsList);
                if (CommonMethods.hasValue(resp.result.testCriteriaLst)) {
                    resp.result.testCriteriaLst.forEach(x => {
                        var obj = this.getQualificationTestsDetailsList.data.filter(o => o.qualificationTestID == x.qualificationTestID);
                        if (x.type == "ACC_CRITERIA") {
                            if (!CommonMethods.hasValue(obj[0].acceptanceCriteriaLstID))
                                obj[0].acceptanceCriteriaLstID = [];
                            obj[0].acceptanceCriteriaLstID.push(x.acceptanceCriteriaID)
                        }
                        else {
                            if (!CommonMethods.hasValue(obj[0].originalAcceptanceCriteriaLstID))
                                obj[0].originalAcceptanceCriteriaLstID = [];
                            obj[0].originalAcceptanceCriteriaLstID.push(x.acceptanceCriteriaID)
                        }
                    })
                }
                else {
                    this.getQualificationTestsDetailsList.data.forEach(x => {
                        if (x.acceptanceCriteriaID) {
                            x.acceptanceCriteriaLstID = [];
                            x.originalAcceptanceCriteriaLstID = [];
                            x.acceptanceCriteriaLstID.push(x.acceptanceCriteriaID);
                            x.originalAcceptanceCriteriaLstID.push(x.originalAcceptanceCriteriaID);
                        }
                    })
                }
                this.analystID = resp.result.getQualificationRequestDetails.userRoleID;
                this.conclusionID = resp.result.getQualificationRequestDetails.conclusionID;
                this.remarks = resp.result.getQualificationRequestDetails.remarks;
                this.finalStatus = resp.result.getQualificationRequestDetails.finalStatus;
                this.justification = resp.result.getQualificationRequestDetails.justification;
                this.isNeedJustification = resp.result.getQualificationRequestDetails.isNeedJustification;
                this.reQualificationID = resp.result.getQualificationRequestDetails.reQualificationPurpose;
                this.acceptCriteria = resp.result.getAcceptenceCriteriaDetailsList;
                this.typeCode = resp.result.getQualificationRequestDetails.typeCode;
                if (!CommonMethods.hasValue(this.typeCode) && CommonMethods.hasValue(this.arNUmber))
                    this.typeCode = 'SNG_ANA';
                if (CommonMethods.hasValue(this.isNeedJustification) || CommonMethods.hasValue(this.justification)) {
                    this.showJustification = true;
                }
                else { this.showJustification = false; }

                if (this.appBO.appLevel == 1) {
                    this.tabIndex = 1;
                    if (!CommonMethods.hasValue(this.finalStatus) || (this.finalStatus != 'APP' && this.finalStatus != 'REJ' && this.finalStatus != 'DISC')) {
                        this.alert.warning(analystMessages.status);
                        this.ChangebtnType = ButtonActions.btnSave;
                        this.disabledControls = false;
                    }
                    else if (this.finalStatus == "REJ" || this.finalStatus == 'DISC') {
                        this.conclusionID = this.totalCatItemList.filter(x => x.catItemCode == "DISQUAL")[0].catItemID;
                        this.disabledControls = true;
                    }
                }
                //  if (this.appBO.operationType == 'VIEW') { this.disableUpdatebtn = true;}
                this.disableHeaders(true);
                var obj: CategoryItem = new CategoryItem();
                obj.catItem = resp.result.getQualificationRequestDetails.conclusionID;
                obj.catItemID = resp.result.getQualificationRequestDetails.conclusion;
                obj.catItemCode = resp.result.getQualificationRequestDetails.conclusionCode;
                obj.category = 'CONCLUSION';
                this.prepareAssignCatList(obj);

                var prObj: CategoryItem = new CategoryItem();
                prObj.catItem = resp.result.getQualificationRequestDetails.type;
                prObj.catItemID = resp.result.getQualificationRequestDetails.typeID;
                prObj.catItemCode = resp.result.getQualificationRequestDetails.typeCode;
                prObj.category = 'ANA_TYPE';
                this.prepareAssignCatList(prObj);

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = resp.result.getQualificationRequestDetails.requestType;
                obj.catItemID = resp.result.getQualificationRequestDetails.requestTypeID;
                obj.catItemCode = resp.result.getQualificationRequestDetails.requestTypeCode;
                obj.category = 'QUAL_REQUEST_TYPE';
                this.prepareAssignCatList(obj);

                var prObj: CategoryItem = new CategoryItem();
                prObj.catItem = resp.result.getQualificationRequestDetails.reQualPurposeType;
                prObj.catItemID = resp.result.getQualificationRequestDetails.reQualificationPurpose;
                prObj.catItemCode = resp.result.getQualificationRequestDetails.reQualPurposeCode;
                prObj.category = 'RE_QUALIF_PURPOSE';
                this.prepareAssignCatList(prObj);

                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
            }

            else if (resp.purpose == "manageQualificationEvaluation") {
                this.isLoaderStartEvaluation = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.alert.success(analystMessages.evaluation);
                    this.disableHeaders(true);
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        });

        this.showHistory();

        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetMngAnalystQualificationCategories();
        obj.type = 'MNG';
        this._analystService.getCatItemsByCatCodeList(obj);

        this.prepareLookups();
        this.prepareLKP();
        if (CommonMethods.hasValue(this.encQualificationID))
            this._analystService.getQualificationDetails(this.encQualificationID);

    }

    toGetQualification(event, type: string) {
        if (type == 'req_type') {
            if (CommonMethods.hasValue(this.technique))
                this.technique.clear();
            this.prepareLookups();
        }
        if (type == 'req_type' || (CommonMethods.hasValue(event) && CommonMethods.hasValue(event.val))) {
            if (type == 'technique')
                this.techniqueID = event.val.id;
            else if (type == 'analyst')
                this.analystID = event.val.id;
            if (CommonMethods.hasValue(this.requestTypeCode) && CommonMethods.hasValue(this.analystID) && CommonMethods.hasValue(this.techniqueID)) {
                var reqID = this.totalCatItemList.filter(x => x.catItemCode == this.requestTypeCode)[0].catItemID;
                this._analystService.getQualificationType(CommonMethods.hasValue(this.techniqueID) ? this.techniqueID : 0, this.analystID, reqID);
                this.hideFields = true;
                this.clearFields();
            }
            else
                this.hideFields = false;
        }
        else {
            if (type == 'technique')
                this.techniqueID = null;
            else if (type == 'analyst')
                this.analystID = null;

            this.hideFields = false;
        }
    }

    changeMaterialCategory(evt) {
        if (CommonMethods.hasValue(evt)) {
            this.materialID = evt.materialID;
            this.categoryID = evt.categoryID;
            if (CommonMethods.hasValue(this.categoryID)) {
                this.analysistypeId = 0;
                this._analystService.getAnalysisTypeByCategoryID(this.categoryID);
                this.prepareLKP();
            }
        }
        if (CommonMethods.hasValue(this.arNUmberID))
            this.refArNumber.clear();
    }

    selectedAnalysisType(event) {
        this.prepareLKP();
        this.refArNumber.clear();
    }

    toGetTestList(event) {
        if (CommonMethods.hasValue(event) && CommonMethods.hasValue(event.val)) {
            this.arNUmberID = event.val.id;
            this.getTests();
        }
        else
            this.testList = [];
    }

    getTests() {
        var obj: SearchTestsByTechniqueAndArID = new SearchTestsByTechniqueAndArID();
        obj.techniqueID = this.techniqueID;
        obj.arID = this.arNUmberID;
        this._analystService.getTestsByTechniqueAndArID(obj);
    }

    prepareLookups() {
        var condition: string = '1=2';
        if (this.requestTypeCode == 'VOLUMETRIC_SOLUTIONS')
            condition = " TEST_TYPE = 'VS' AND STATUS_CODE = 'ACT'";
        else if (this.requestTypeCode == 'SAMPLE_ANALYSIS')
            condition = " TEST_TYPE = 'AT' AND STATUS_CODE = 'ACT'";

        this.techniqueInfo = CommonMethods.PrepareLookupInfo(LKPTitles.technique, LookupCodes.activeTechniques, LKPDisplayNames.techniqueName, LKPDisplayNames.techniqueCode, LookUpDisplayField.header, LKPPlaceholders.technique, condition, '', '');

        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.getQCUsers, LKPDisplayNames.analystName, LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "UserActive = 1 AND StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
    }

    prepareLKP() {
        this.condition = "1 = 2";
        if (CommonMethods.hasValue(this.materialID) && CommonMethods.hasValue(this.analysistypeId))
            this.condition = "SpecTypeID = " + this.analysistypeId + " AND (MatID = " + this.materialID + " OR StageMatID =" + this.materialID + ")";
        this.refArNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refArNumber, LookupCodes.arNumbers, LKPDisplayNames.arNumber, LKPDisplayNames.batchNumber, LookUpDisplayField.header, LKPPlaceholders.refArNumber, this.condition, '', 'LIMS');
        this.volSolutionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getSolutionIndex, LKPDisplayNames.solution, LKPDisplayNames.stpNumber, LookUpDisplayField.header, LKPPlaceholders.solution, "", "", 'LIMS');

    }

    save() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.disableHeaders(false, 'REQ');
        var errMsgs = this.validations();
        if (CommonMethods.hasValue(errMsgs))
            return this.alert.warning(errMsgs);
        var obj: ManageQualificationRequest = new ManageQualificationRequest();
        obj.encQualificationID = this.encQualificationID;
        if (this.requestTypeCode == 'VOLUMETRIC_SOLUTIONS')
            obj.volumetricIndexID = this.volSolution.selectedId;
        else {
            obj.matID = this.materialID;
            obj.arID = this.arNUmberID;
            var lst = this.testList.filter(ob => ob.isSelect)
            lst.forEach(o => {
                var data: TestIDLIst = new TestIDLIst();
                data.qualificationTestID = o.qualificationTestID;
                data.specTestID = o.specTestID;
                obj.list.push(data);
            })
        }
        obj.techniqueID = this.techniqueID;
        obj.requestTypeID = this.totalCatItemList.filter(x => x.catItemCode == this.requestTypeCode)[0].catItemID;
        obj.analystID = this.analystID;
        obj.qualificationTypeID = this.qualTypeID;
        obj.reQualificationPurposeID = this.reQualificationID;
        obj.typeCode = this.typeCode;
        obj.referenceNo = this.referenceNo;
        obj.fileUploadedIDs = this.UploadIDs;
        obj.entityCode = EntityCodes.analystQualif;
        obj.role = this._limsContext.limsContext.userDetails.roleName;
        this.isLoaderStart = true;
        this._analystService.manageQualificationRequest(obj);
    }

    evaluation() {
        if (this.ChangebtnType == ButtonActions.btnUpdate)
            return this.disableHeaders(false, 'EVA');

        var Msg = this.validEvaluation();
        if (CommonMethods.hasValue(Msg))
            return this.alert.warning(Msg);
        var object: ManageQualificationEvaluation = new ManageQualificationEvaluation();
        object.encQualificationID = this.encQualificationID;
        object.conclusionID = this.conclusionID;
        object.remarks = this.remarks;
        object.initTime = this.appBO.initTime;
        object.justification = this.justification;
        object.list = this.getQualificationTestsDetailsList.data;
        object.selectedAcceptanceCriteiaLst = [];
        var criLst: SelectedCriteiaBO = new SelectedCriteiaBO();
        this.getQualificationTestsDetailsList.data.forEach(x => {
            x.acceptanceCriteriaLstID.forEach(o => {
                criLst.acceptanceCriteriaID = o;
                criLst.qualificationTestID = x.qualificationTestID;
                criLst.type = "ACC_CRITERIA";
                object.selectedAcceptanceCriteiaLst.push(criLst);
                criLst = new SelectedCriteiaBO();
            })

            x.originalAcceptanceCriteriaLstID.forEach(o => {
                criLst.acceptanceCriteriaID = o;
                criLst.qualificationTestID = x.qualificationTestID;
                criLst.type = "ORG_CRITERIA";
                object.selectedAcceptanceCriteiaLst.push(criLst);
                criLst = new SelectedCriteiaBO();
            })
        })
        this.isLoaderStartEvaluation = true;
        this._analystService.manageQualificationEvaluation(object);

    }

    validEvaluation() {
        if (!CommonMethods.hasValue(this.finalStatus) || (this.finalStatus != 'APP' && this.finalStatus != 'REJ' && this.finalStatus != 'DISC'))
            return analystMessages.status;
        var obj = this.getQualificationTestsDetailsList.data.filter(x => !CommonMethods.hasValueWithZero(x.preparationResult1) || !CommonMethods.hasValueWithZero(x.preparationResult2) || !CommonMethods.hasValueWithZero(x.variationObserved) || !CommonMethods.hasValue(x.acceptanceCriteriaLstID) || !CommonMethods.hasValueWithZero(x.averageResult) || !CommonMethods.hasValue(x.originalAcceptanceCriteriaLstID) || (this.requestTypeCode != 'VOLUMETRIC_SOLUTIONS' && !CommonMethods.hasValueWithZero(x.originalVariationObserved)) || (this.requestTypeCode == 'VOLUMETRIC_SOLUTIONS' && !CommonMethods.hasValueWithZero(x.preparationResult3)))
        if (obj.length > 0)
            return analystMessages.preparationDetails;

        if (!CommonMethods.hasValue(this.conclusionID))
            return analystMessages.conclusion;
        if (!CommonMethods.hasValue(this.remarks))
            return analystMessages.remarks;
        if (CommonMethods.hasValue(this.showJustification) && !CommonMethods.hasValue(this.justification))
            return analystMessages.justification;
    }

    validations() {
        if (!CommonMethods.hasValue(this.requestTypeCode))
            return analystMessages.reqType;
        if (!CommonMethods.hasValue(this.technique.selectedId))
            return analystMessages.technique;
        if (!CommonMethods.hasValue(this.analyst.selectedId))
            return analystMessages.analyst;
        if (!CommonMethods.hasValue(this.qualTypeID))
            return analystMessages.activityType;
        if (CommonMethods.hasValue(this.showRequalifiaction) && !CommonMethods.hasValue(this.reQualificationID))
            return analystMessages.reQualification;
        if (CommonMethods.hasValue(this.showRequalifiaction) && !CommonMethods.hasValue(this.referenceNo))
            return analystMessages.referenceNo;
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS' && !CommonMethods.hasValue(this.categoryID))
            return analystMessages.category;
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS' && !CommonMethods.hasValue(this.materialID))
            return analystMessages.material;
        if (!CommonMethods.hasValue(this.typeCode))
            return analystMessages.type;
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS' && !CommonMethods.hasValue(this.analysistypeId))
            return analystMessages.analysistype;
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS' && !CommonMethods.hasValue(this.refArNumber.selectedId))
            return analystMessages.arNumber;
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS') {
            var count = this.testList.filter(ob => ob.isSelect == true).length;
            if (count < 1)
                return analystMessages.testTiles;
        }
        if (this.requestTypeCode != 'SAMPLE_ANALYSIS' && !CommonMethods.hasValue(this.volSolution.selectedId))
            return analystMessages.volIndex
    }

    prepareHeaders() {
        this.headers = [];
        this.extraColumns = [];
        this.headers.push({ "columnDef": 'testTitle', "header": "Test Title", cell: (element: any) => `${element.testTitle}` });
        if (this.requestTypeCode == 'SAMPLE_ANALYSIS') {
            this.extraColumns.push({ "columnDef": 'preparationResult1', "header": "Preparation Result 1", cell: (element: any) => `${element.preparationResult1}` });
            this.extraColumns.push({ "columnDef": 'preparationResult2', "header": "Preparation Result 2", cell: (element: any) => `${element.preparationResult2}` });
            this.extraColumns.push({ "columnDef": 'variationObserved', "header": "Variation Observed", cell: (element: any) => `${element.variationObserved}` });
            this.extraColumns.push({ "columnDef": 'acceptanceCriteria', "header": "Acceptance Criteria", cell: (element: any) => `${element.acceptanceCriteria}` });
            this.extraColumns.push({ "columnDef": 'averageResult', "header": "Average Result", cell: (element: any) => `${element.averageResult}` });
            this.extraColumns.push({ "columnDef": 'originalResult', "header": "Original Result", cell: (element: any) => `${element.originalResult}` });
            this.extraColumns.push({ "columnDef": 'originalVariationObserved', "header": "Original Variation Observed", cell: (element: any) => `${element.originalVariationObserved}` });
            this.extraColumns.push({ "columnDef": 'originalAcceptanceCriteria', "header": "Original Acceptance Criteria", cell: (element: any) => `${element.originalAcceptanceCriteria}` });
        }
        else {
            this.extraColumns.push({ "columnDef": 'preparationResult1', "header": "Preparation Result 1", cell: (element: any) => `${element.preparationResult1}` });
            this.extraColumns.push({ "columnDef": 'preparationResult2', "header": "Preparation Result 2", cell: (element: any) => `${element.preparationResult2}` });
            this.extraColumns.push({ "columnDef": 'preparationResult3', "header": "Preparation Result 3", cell: (element: any) => `${element.preparationResult3}` });
            this.extraColumns.push({ "columnDef": 'variationObserved', "header": "Variation Observed", cell: (element: any) => `${element.variationObserved}` });
            this.extraColumns.push({ "columnDef": 'averageResult', "header": "Average Result", cell: (element: any) => `${element.averageResult}` });
            this.extraColumns.push({ "columnDef": 'acceptanceCriteria', "header": "Acceptance Criteria", cell: (element: any) => `${element.acceptanceCriteria}` });
            // this.extraColumns.push({ "columnDef": 'originalResult', "header": "Original Result", cell: (element: any) => `${element.originalResult}` });
            // this.extraColumns.push({ "columnDef": 'originalVariationObserved', "header": "Original Variation Observed", cell: (element: any) => `${element.originalVariationObserved}` });
            this.extraColumns.push({ "columnDef": 'originalAcceptanceCriteria', "header": "Original Acceptance Criteria", cell: (element: any) => `${element.originalAcceptanceCriteria}` });
        }
        this.analyHeader = [];
        this.analyHeader.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.analyHeader.push({ "columnDef": 'sioCode', "header": "Inward No.", cell: (element: any) => `${element.sioCode}`, width: "maxWidth-15per" });
        this.analyHeader.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: "maxWidth-15per" });
        this.analyHeader.push({ "columnDef": 'testName', header: "Test Name", cell: (element: any) => `${element.testName}`, width: "maxWidth-20per" });
        this.analyHeader.push({ "columnDef": 'specDesc', header: "Specification Limit", cell: (element: any) => `${element.specDesc}`, width: "maxWidth-20per" });
        this.analyHeader.push({ "columnDef": 'finalResult', "header": "Result", cell: (element: any) => `${element.finalResult}`, width: "maxWidth-15per" });

        this.displayedColumns = this.headers.map(c => c.columnDef);
        this.displayedColumns = this.headers.map(c => c.columnDef).concat(['act']);

    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encQualificationID;
        obj.code = 'ANALYST_QUALIFICATION';
        const modal = this._modalDialog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encQualificationID, EntityCodes.analystQualif,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    selectedTestCheckBox(evt, specTestID, groupSpecCatID) {
        if (CommonMethods.hasValue(groupSpecCatID))
            this.testList.filter(x => x.groupSpecCatID == groupSpecCatID).forEach(item => item.isSelect = evt.checked)

        else
            this.testList.filter(x => x.specTestID == specTestID).forEach(item => item.isSelect = evt.checked)
    }

    changeIcons() {
        return this.btnType == ButtonActions.btnSave ? this._global.icnSave : this._global.icnUpdate;
    }

    disableHeaders(val: boolean, type = "ALL") {
        if (type != "EVA") {
            if (CommonMethods.hasValue(this.encQualificationID)) {
                this.analyst.disableBtn = true;
                if (CommonMethods.hasValue(this.technique))
                    this.technique.disableBtn = true
                if (CommonMethods.hasValue(this.refArNumber))
                    this.refArNumber.disableBtn = val;
                if (CommonMethods.hasValue(this.materialCategory))
                    this.materialCategory.isdisableBtnLkp(val);
                if (CommonMethods.hasValue(this.volSolution))
                    this.volSolution.disableBtn = val;
                this.btnType = val ? ButtonActions.btnUpdate : ButtonActions.btnSave;
                this.reqBtnUpd = val ? ButtonActions.btnViewDocus : ButtonActions.btnUpload;
            }
            else {
                this.analyst.disableBtn = this.technique.disableBtn = this.refArNumber.disableBtn = val;
                this.materialCategory.isdisableBtnLkp(val);
                this.btnType = val ? ButtonActions.btnUpdate : ButtonActions.btnSave;
            }
        }
        if (type != 'REQ') {
            if (CommonMethods.hasValue(this.appBO) && this.appBO.appLevel > 0 && CommonMethods.hasValue(this.conclusionID)) {
                this.ChangebtnType = val ? ButtonActions.btnUpdate : ButtonActions.btnSave;
                this.evaBtnUpd = val ? ButtonActions.btnViewDocus : ButtonActions.btnUpload;
                this.disabledControls = val;
            }
        }
    }

    clearFields() {
        if (CommonMethods.hasValue(this.refArNumber))
            this.refArNumber.clear();
        this.analysistypeId = null;
        if (CommonMethods.hasValue(this.materialCategory))
            this.materialCategory.clear();
        if (CommonMethods.hasValue(this.volSolution))
            this.volSolution.clear();
    }

    selectedTab(event) {
        this.tabIndex = event;
    }

    allowType(event, type) {
        if (type == 'N')
            return CommonMethods.allowDecimal(event, 11, 5, 5, "-");
        else return true
    }

    calculateValues(dataItem) {
        dataItem.originalResult = dataItem.originalTestResult;
        if (dataItem.testMethodType == 'N' && CommonMethods.hasValue(dataItem.preparationResult1) && CommonMethods.hasValue(dataItem.preparationResult2) && (this.requestTypeCode == 'SAMPLE_ANALYSIS' || CommonMethods.hasValue(dataItem.preparationResult3))) {
            if (this.requestTypeCode == 'SAMPLE_ANALYSIS') {
                dataItem.variationObserved = (Number(dataItem.preparationResult1) - Number(dataItem.preparationResult2)).toFixed(3);
                dataItem.averageResult = ((Number(dataItem.preparationResult1) + Number(dataItem.preparationResult2)) / 2).toFixed(3);
                dataItem.originalVariationObserved = (Number(dataItem.averageResult) - Number(dataItem.originalResult)).toFixed(3);
            }
            else
                dataItem.averageResult = ((Number(dataItem.preparationResult1) + Number(dataItem.preparationResult2) + Number(dataItem.preparationResult3)) / 3).toFixed(3);
        }
    }

    uploadFile(section) {
        const modal = this._modalDialog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.analystQualif, 0, section, this.encQualificationID, this.UploadIDs, 'MEDICAL_LIMS', this.refNo);
        if ((section == 'ANALYST_QUA_REQ' && this.reqBtnUpd == ButtonActions.btnViewDocus) || (section == 'ANALYST_QUA_EVA' && this.evaBtnUpd == ButtonActions.btnViewDocus))
            modal.componentInstance.mode = 'VIEW';

        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe((resu) => {
                if (CommonMethods.hasValue(resu))
                    this.UploadIDs = resu;
            })
        }
    }

    onActionClicked(evt) {
        var rptObj: ArdsReportBO = new ArdsReportBO();
        rptObj.ardsExecID = evt.val.samAnaTestID;
        rptObj.entityCode = EntityCodes.sampleAnalysis;
        rptObj.dmsReportID = evt.val.dmsReportID;
        rptObj.refNumber = evt.val.arNumber;
        rptObj.requestFrom = EntityCodes.analystQualif;

        const modal = this._modalDialog.open(AnalysisReportComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.rptObj = rptObj;
    }

    saveChecklist() {
        const modal = this._modalDialog.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.encQualificationID;
        modal.componentInstance.categoryCode = 'INVALID_CHECKLIST';
        modal.componentInstance.type = this.ChangebtnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE';
        modal.componentInstance.entityCode = EntityCodes.analystQualif;
    }

    onRowClick(dataItem) {
        this.getQualificationTestsDetailsList.data.forEach(x => x.isOpened = false)
        dataItem.isOpened = true;
    }

    getConclusionCode() {
        if (this.conclusionID > 0)
            return this.totalCatItemList.filter(x => x.catItemID == this.conclusionID)[0].catItemCode;
    }

    showVolSolReport() {
        const modalRef = this._modalDialog.open(UploadFiles, CommonMethods.modalFullWidth);
        modalRef.disableClose = true;
        modalRef.componentInstance.mode = "VIEW";
        modalRef.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.volumetricSol, 0, "REPORT", String(this.volSolutionID));
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encQualificationID;
        obj.code = 'ANALYST_QUALIFICATION';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encQualificationID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    getTypeLst() {
        if (this.requestTypeCode != 'SAMPLE_ANALYSIS')
            return this.totalCatItemList.filter(x => x.catItemCode != 'DUP_ANA' && x.category == 'ANA_TYPE');
        else return this.totalCatItemList.filter(x => x.category == 'ANA_TYPE');
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
