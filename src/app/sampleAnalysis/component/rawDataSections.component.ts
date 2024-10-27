import { Component, Input, ViewChild, OnChanges, DoCheck } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as fromCalibArdsOptions from '../../calibrationArds/state/calibrationArds/calibrationArds.reducer';

import { ArdsSectionBOList, ArdsSectionDataList, ArdsSectionDataBO, SaveInputValue, GetArdsHeadersBO, TabBO, ManageFinalFormulaBO, GetGroupTest, deviation, AnalysisHeaderBO, AddArdsReview, ManageViewResetReportBO, SampleAnalysisLabDetails, ManageImpurityBasicInfoBO, ManageImpurityAssignSdmsBOList, ManageImpurityAssignSdmsBO, FormulaData, ConfirmImpMapping } from '../model/sampleAnalysisModel';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog, MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { FormulaDependentDetailsComponent } from './formulaDependentDetails.component';
import { ActionMessages, LimsRespMessages, PageTypeSection, EntityCodes, DCActionCode, CapabilityActions, ButtonActions, GridActions, LookupCodes, SectionCodes } from 'src/app/common/services/utilities/constants';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { assignTestResult } from './assignTestResult.component';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { LookUpDisplayField, LookupInfo, RS232IntegrationModelBO } from 'src/app/limsHelpers/entity/limsGrid';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { ReportView } from 'src/app/common/component/reportView.component';
import { LKPDisplayNames, LKPPlaceholders, LKPTitles } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { DynamicFormulaCalculationComponent } from './dynamicFormulaCalculation.component';
import { TableResultSetExecComponent } from './tableResultSetExecution.component';

@Component({
    selector: 'raw-sec',
    templateUrl: '../html/rawDataSections.html',
    styleUrls: ['../styles/sampleAnalysisStyles.scss', '../css/sampleAnalysis.scss']
})

export class rawDataSectionComponent implements DoCheck {
    @Input() entityCode: string;
    @Input() refNo: string;
    @Input() updTestStatus: string;
    tabList: Array<TabBO> = []
    sectionList: ArdsSectionBOList = [];
    sectionDetailsList: ArdsSectionDataList;
    displayedColumns: any = ['code', 'desc', 'value'];
    getArdsInputsInfo: GetArdsHeadersBO;
    @Input() samAnaTestID: number;
    detailID: number;
    getTestInfo: any;
    occSub: boolean;
    showHidePageType: PageTypeSection = PageTypeSection.ARDS;
    isInvalidated: string;
    ardsInvalidationList: Array<any> = [];
    testInitTime: string;
    dataSourceSolvents: any;
    testType: string;
    finalFormula: string;
    rowType: string;
    pageAction: string = "EDIT";
    @Input() sourceCode: string;
    @Input() pageType: string = 'MNG';
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    specTestID: number;
    @Input() analysisMode: string;
    solList: any;
    invalidationDet: any = { actionBy: null, actionDate: null, dmsID: null };
    arNumber: string;
    reviewList: any;
    dataSourceReview: any;
    headersData: any = [];
    hasReviewCap: boolean = false;
    unknownTabID: number;
    sampleAnalysisLabObj: SampleAnalysisLabDetails = new SampleAnalysisLabDetails();

    @ViewChild('tabGroup', { static: false }) tabGroup: MatTabGroup;

    mngImpBO: ManageImpurityBasicInfoBO = new ManageImpurityBasicInfoBO();
    btnImpChange: string = ButtonActions.btnAdd;
    getUnKnowImpData: any;
    unKnownImpDatadataSource: any;
    isShowImpurityAdd: boolean = true;
    impurityActions: Array<string> = [GridActions.assign];
    impHeaders: Array<any> = [];
    impHeaderDisplayCol: any;
    injectionID: number;
    sdmsDetailsData: any;
    btnSdmsFile: string = ButtonActions.btnGo;
    peakDataList: Array<any> = [];
    selectedPeakDataObject: any;
    selectedInjTitle: string;
    btnSaveImp: string = "Assign";
    dynamicValueLst: any;
    tabType: string = "Unknown Impurity";
    reviewStatus: string;

    sdmsInfo: LookupInfo;
    @ViewChild('sdmsData', { static: true }) sdmsData: LookupComponent;

    get isRs232Mode() {
        return CommonMethods.hasValue(CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_STATUS)) && (CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_STATUS) == "ON");
    }

    subscription: Subscription = new Subscription();

    constructor(private store: Store<fromAnalysisOptions.AnalysisState>, private _alert: AlertService, public _global: GlobalButtonIconsService,
        private _saService: SampleAnalysisService, private _matDialog: MatDialog, private _confirmSer: ConfirmationService, private _limsContext: LIMSContextServices) {
        localStorage.setItem('IS_ACCESS_TAB', 'TRUE');
    }

    ngDoCheck() {

        if (localStorage.getItem('IS_ACCESS_TAB')) {
            this.selectedTabID = Number(localStorage.getItem('SELECTED_TAB') || 0);
            if (this.tabGroup)
                this.tabGroup.selectedIndex = Number(localStorage.getItem('SELECTED_TAB_INDEX') || 0);

            localStorage.removeItem('IS_ACCESS_TAB')
        }

        this.isInvalidated = localStorage.getItem('IS_INVALIDATED');
    }

    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getArdsTabList))
            .subscribe(getArdsInputInfo => {
                this.tabList = [];
                this.tabList.push({ tabID: 0, tab: 'Chemical Consumption', sectionSubject: 'Chemical Consumption' });

                getArdsInputInfo.forEach(x => {
                    this.tabList.push(x)
                })
                this.unknownTabID = this.tabList.length;
                // this.tabList.push({ tabID: this.unknownTabID, tab: 'Unknown Impurities' });
                this.getTabSelectedIndex(null, 0);


            })
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionList = getArdsInputsInfo
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionDetailsList = getArdsInputsInfo;
                if (CommonMethods.hasValue(this.sectionDetailsList) && this.sectionDetailsList.length > 0)
                    this.sectionDetailsList.forEach(x => {
                        this.prepareToolTip(x)
                    })
            });

        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo;
                this.sampleAnalysisLabObj.chemicalConsumeRefArdsExecID = this.getArdsInputsInfo.chemicalConsumeRefArdsExecID;
                this.sampleAnalysisLabObj.chemicalConsumeRefArID = this.getArdsInputsInfo.chemicalConsumeRefArID;
                this.sampleAnalysisLabObj.chemicalConsumeComments = this.getArdsInputsInfo.chemicalConsumeComments;
                this.sampleAnalysisLabObj.chemialConsumeTestTitle = this.getArdsInputsInfo.chemialConsumeTestTitle;
                this.sampleAnalysisLabObj.chemicalConsumeRefArNumber = this.getArdsInputsInfo.chemicalConsumeRefArNumber;
                if (CommonMethods.hasValue(getArdsInputsInfo.solList) && getArdsInputsInfo.solList.length > 0) {
                    this.solList = getArdsInputsInfo.solList;
                    this.dataSolventGrid();
                }
                if (CommonMethods.hasValue(getArdsInputsInfo.reviewList) && getArdsInputsInfo.reviewList.length > 0) {
                    this.reviewList = getArdsInputsInfo.reviewList;
                }
                if (CommonMethods.hasValue(getArdsInputsInfo.dynamicValueLst) && getArdsInputsInfo.dynamicValueLst.length > 0) {
                    this.dynamicValueLst = getArdsInputsInfo.dynamicValueLst
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo
                if (this.getTestInfo.length > 0)
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);

                if (obj && obj.length > 0) {
                    this.testInitTime = obj[0].testInitTime;
                    this.occSub = (obj[0].hasOccSubmitted || obj[0].showSpecTestID) && !obj[0].hasOOS;
                    this.testType = obj[0].testType;
                    this.rowType = obj[0].rowType;
                    this.reviewStatus = obj[0].statusCode;
                }
            });

        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisPageTypeAction))
            .subscribe(pageTypeAction => {
                this.showHidePageType = pageTypeAction
            });

        this.store
            .pipe(select(fromAnalysisOptions.getArdsInvalidationInfo))
            .subscribe(invalidationInfo => {
                this.ardsInvalidationList = invalidationInfo;

                if (
                    (this.ardsInvalidationList.length > 0)
                    && (this.getTestInfo.length > 0) &&
                    (this.ardsInvalidationList.filter(x => !CommonMethods.hasValue(x.invalidationID)).length < 1)
                    && (this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID && x.invalidationID == null).length > 0)
                ) {
                    this.ardsInvalidationList.push({ invalidationID: null, invalidationCode: "Actual Ards Details" })

                    localStorage.removeItem('IS_INVALIDATED');
                    this.isInvalidated = localStorage.getItem('IS_INVALIDATED');
                }
                else if ((this.getTestInfo.length > 0) && this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID && x.invalidationID != null).length > 0) {
                    localStorage.setItem('IS_INVALIDATED', 'TRUE');
                    this.isInvalidated = localStorage.getItem('IS_INVALIDATED');
                }
                else {
                    localStorage.removeItem('IS_INVALIDATED');
                    this.isInvalidated = localStorage.getItem('IS_INVALIDATED');
                }

                this.store.dispatch(new analysisActions.UpdateSelectionIndex(this.isInvalidated));

            });
        if (this.entityCode == EntityCodes.sampleAnalysis) {
            this.store
                .pipe(select(fromAnalysisOptions.getAnalysisInfo))
                .subscribe(analysisInfo => {
                    this.headerInfo = analysisInfo;
                    this.arNumber = analysisInfo.arNumber;
                    if (!CommonMethods.hasValue(this.analysisMode))
                        this.analysisMode = analysisInfo.analsysMode;
                });
        }
        else if (this.entityCode == EntityCodes.calibrationArds) {
            this.store
                .pipe(select(fromCalibArdsOptions.getCalibrationArdsInfo))
                .subscribe(calibArds => {
                    if (!CommonMethods.hasValue(this.analysisMode))
                        this.analysisMode = calibArds.ardsMode;
                });
        }

    }

    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == 'saveInputValues' && !CommonMethods.hasValue(resp.type)) {
                if (resp.result.returnFlag == 'OK') {
                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
                    this.testInitTime = data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;
                    //this._alert.success(SampleAnalysisMessages.successInput);
                    var obj = this.sectionDetailsList.filter(x => x.detailID == this.detailID && !CommonMethods.hasValue(x.invalidationID))
                    obj[0].prevValue = obj[0].value;
                    obj[0].isDisable = true;
                    obj[0].updatedOn = resp.result.updatedOn;
                    obj[0].updatedBy = resp.result.updatedBy;
                    obj[0].initialValue = resp.result.initialValue;
                    obj[0].passOrFail = resp.result.passOrFail;
                    if (obj[0].skipType != 'DG')
                        obj[0].skipType = null;
                    if (!CommonMethods.hasValue(obj[0].createdBy)) {
                        obj[0].createdOn = resp.result.updatedOn;
                        obj[0].createdBy = resp.result.updatedBy;
                    }
                    this.prepareToolTip(obj[0])

                    if (CommonMethods.hasValue(resp.result.lst)) {
                        resp.result.lst.forEach(x => {
                            var obj = this.sectionDetailsList.filter(o => o.detailID == x.detailID && !CommonMethods.hasValue(x.invalidationID));
                            obj[0].updateFlag = x.updateFlag;
                        })
                    }
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
                else {
                    var obj = this.sectionDetailsList.filter(x => x.detailID == this.detailID && !CommonMethods.hasValue(x.invalidationID))
                    obj[0].value = obj[0].prevValue;
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }
                this.detailID = 0;
                this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
            }
            else if (resp.purpose == "manageIsFinalFormula") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.finalFormulaSuccess);

                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;
                    this.testInitTime = resp.result.initTime;

                    this.sectionDetailsList.forEach((item) => {
                        if (this.detailID == item.detailID && !CommonMethods.hasValue(item.invalidationID)) {
                            item.formulaResultFlag = this.finalFormula;
                            if (CommonMethods.hasValue(this.specTestID))
                                item.specTestID = this.specTestID;
                        }
                        else if (this.finalFormula == item.formulaResultFlag && !CommonMethods.hasValue(item.invalidationID) && (!CommonMethods.hasValue(this.specTestID) || item.specTestID == this.specTestID)) {
                            item.formulaResultFlag = null;
                            item.specTestID = null;
                        }
                    })

                    this.finalFormula = null;
                    this.detailID = 0;

                    this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "skipInpurFieldFromExecution") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.skipSuccess);

                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;
                    this.testInitTime = resp.result.initTime;

                    this.sectionDetailsList.forEach((item) => {
                        if (this.detailID == item.detailID && !CommonMethods.hasValue(item.invalidationID)) {
                            item.skipType = resp.type;
                            if (resp.type == 'SKIP') {
                                item.formulaResultFlag = null;
                                item.specTestID = null;
                                item.value = item.prevValue = null;
                            }
                            else
                                item.value = item.prevValue = '0';
                        }
                    })

                    this.finalFormula = null;
                    this.detailID = 0;

                    this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "addArdsReviewComment") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.reviewAdded)
                    if (!CommonMethods.hasValue(this.reviewList) || this.reviewList.length == 0)
                        this.reviewList = [];
                    this.reviewList.push(resp.result)
                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.testInitTime;
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
            }

            else if (resp.purpose == "viewARDSReport") {
                if (this._matDialog.openDialogs.length < 1) {
                    const modal = this._matDialog.open(ReportView, CommonMethods.modalFullWidth);
                    modal.componentInstance.setAuditReportUrl = resp.result.message;
                }
            }
            else if (resp.purpose == "manageImpurityBasicInfo") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(SampleAnalysisMessages.impurityNameSuccess);
                    this.mngImpBO = new ManageImpurityBasicInfoBO();
                    this._saService.getUnknownImpurities(this.samAnaTestID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "deleteImpurity") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(SampleAnalysisMessages.impurityNameDeleted);
                    this._saService.getUnknownImpurities(this.samAnaTestID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getUnknownImpurities") {
                this.getUnKnowImpData = resp.result;
                this.prepareUnKnownDataList(this.tabType);
            }
            else if (resp.purpose == "manageImpuritySDMSDetails") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(SampleAnalysisMessages.impurityPeakSuccess);
                    this.resetUnKnownImpurity();
                    localStorage.removeItem('qc_updatetbl');
                    this._saService.getUnknownImpurities(this.samAnaTestID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));

            }
            else if (resp.purpose == "getMappingInfo") {
                this.sdmsDetailsData = resp.result;
                this.getSDMSPeakData();
            }
            else if (resp.purpose == "confirmImpMapping") {
                if (resp.result == "SUCCESS") {
                    var msg = "";
                    if (resp.type == "UNKNOWN") {
                        this.getArdsInputsInfo.isUnknownMapping = !this.getArdsInputsInfo.isUnknownMapping;
                        msg = this.getArdsInputsInfo.isUnknownMapping ? SampleAnalysisMessages.confirmImpSuccess : "";
                    }
                    else {
                        this.getArdsInputsInfo.isknownMapping = !this.getArdsInputsInfo.isknownMapping;
                        msg = this.getArdsInputsInfo.isknownMapping ? SampleAnalysisMessages.confirmImpSuccess : "";
                    }
                    if (CommonMethods.hasValue(msg))
                        this._alert.success(msg);
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        if (CommonMethods.hasValue(this.dataSourceSolvents) && this.dataSourceSolvents.length > 0)
            this.dataSourceSolvents = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(this.dataSourceSolvents, 'arrayDateTimeFormat', 'useBeforeDate')));
        else
            this.dataSourceSolvents = null;
        if (this.pageType == 'VIEW' || this.pageType == "UPD")
            this.pageAction = 'VIEW';
        this.prepareHeader();

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(this.entityCode);
        var obj = capActions.actionList.filter(x => x == 'ARDS_REVIEW')
        this.hasReviewCap = (obj && obj.length > 0)
        if (CommonMethods.hasValue(this.samAnaTestID))
            this._saService.getUnknownImpurities(this.samAnaTestID);
    }

    invalidationID: any = null;

    openArdsData(invalidID: any) {
        this.invalidationID = invalidID;

        if (this.invalidationID)
            localStorage.setItem('IS_INVALIDATED', 'TRUE');
        else
            localStorage.removeItem('IS_INVALIDATED');

        this.isInvalidated = localStorage.getItem('IS_INVALIDATED');

        if (this.pageType == 'VIEW' || CommonMethods.hasValue(invalidID) || this.pageType == "UPD")
            this.pageAction = 'VIEW';
        else
            this.pageAction = 'EDIT'

        var obj = this.ardsInvalidationList.filter(x => x.invalidationID == this.invalidationID)

        if (obj.length > 0) {
            this.invalidationDet.actionBy = obj[0].actionBy;
            this.invalidationDet.actionDate = dateParserFormatter.FormatDate(obj[0].actionDate, 'datetime');
            this.invalidationDet.dmsID = obj[0].dmsReportID;
        }


        this.store.dispatch(new analysisActions.UpdateSelectionIndex(this.isInvalidated));
        this.dataSolventGrid();
    }

    aviodSpaces(evt, isAccCriteriaApp?: boolean) {
        if (isAccCriteriaApp) {
            return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength15, 5, 15);
        }
        else {
            evt = (evt) ? evt : window.event;
            var charCode = (evt.which) ? evt.which : evt.keyCode;
            return CommonMethods.hasValue(evt.target.value) ? true : charCode != 32;
        }
    }

    allowNumber(evt, type: string) {
        // if (type == "AREA" || type == "P_AREA") {
        //     if (!CommonMethods.allowDecimal(evt, 16, 5, 10, '') && evt.key != "N" && evt.key != "D" && evt.key != "R")
        //         return false;
        //     else return true;
        // }
        // else
        return CommonMethods.allowDecimal(evt, 16, 5, 10, '');
    }

    getSections(tabID: number) {
        return this.sectionList.filter(x => x.tabID == tabID);
    }

    getSectionDetails(sectionID: number, tabID: number) {
        return this.sectionDetailsList.filter(x => x.sectionID == sectionID && x.tabID == tabID && x.invalidationID == this.invalidationID);
    }

    saveValue(obj: ArdsSectionDataBO, indexj: number, indexi: number) {
        if (CommonMethods.hasValueWithZero(obj.value) || obj.value == '0') {
            if (obj.value == '.')
                return obj.value = '';

            if ((CommonMethods.hasValue(obj.formulaResultFlag) && CommonMethods.hasValueWithZero(obj.value) && !Number(obj.value.split(" ")[0])) && (this.testType == 'R' || this.testType == 'N')) {

                obj.value = "";
                window.document.getElementById(indexj.toString() + indexi.toString()).focus();
                return this._alert.warning(SampleAnalysisMessages.numericValues);
            }

            if (CommonMethods.hasValueWithZero(obj.prevValue))
                obj.isDisable = true;
            if (obj.value.trim() != obj.prevValue) {
                if (obj.skipType && obj.skipType != 'REG') {
                    this._confirmSer.confirm(SampleAnalysisMessages.regularType).subscribe(resp => {
                        if (resp) {
                            var data: SaveInputValue = new SaveInputValue();
                            data.samAnaTestID = this.samAnaTestID;
                            data.value = obj.value.trim();
                            if (!CommonMethods.hasValue(this.sourceCode))
                                data.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
                            else
                                data.ardsSourceCode = this.sourceCode
                            data.detailID = obj.detailID;
                            this.detailID = obj.detailID;
                            var test = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)

                            data.initTime = test[0].testInitTime;
                            this._saService.saveInputValues(data);
                        }
                        else
                            obj.value = obj.prevValue
                    })
                }
                else {
                    var data: SaveInputValue = new SaveInputValue();
                    data.samAnaTestID = this.samAnaTestID;
                    data.value = obj.value.trim();
                    if (!CommonMethods.hasValue(this.sourceCode))
                        data.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
                    else
                        data.ardsSourceCode = this.sourceCode
                    data.detailID = obj.detailID;
                    this.detailID = obj.detailID;
                    var test = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)

                    data.initTime = test[0].testInitTime;
                    this._saService.saveInputValues(data);
                }
            }
        }
    }

    formulaEvaluate(detailID: number, updFlag, inputType: string) {
        if (this.raiseDev() == 'OK') {
            if (inputType == 'FRMLA') {
                const modal = this._matDialog.open(FormulaDependentDetailsComponent, { width: '75%' });
                modal.disableClose = true;
                modal.componentInstance.detailID = detailID;
                modal.componentInstance.samAnaTestID = this.samAnaTestID;
                modal.componentInstance.entityCode = this.entityCode;
                modal.componentInstance.sourceCode = this.sourceCode;
                modal.componentInstance.testInitTime = this.testInitTime
                modal.componentInstance.pageType = this.pageType;
                // modal.componentInstance.value = value;
                // modal.componentInstance.actValue = value;
                modal.componentInstance.updFlag = updFlag;
                modal.afterClosed().subscribe(res => {
                    if (CommonMethods.hasValue(res.isChange)) {
                        var obj = this.sectionDetailsList.filter(x => x.detailID == detailID && !CommonMethods.hasValue(x.invalidationID));
                        if (!CommonMethods.hasValueWithZero(res.value))
                            obj[0].isDisable = false;
                        else
                            obj[0].isDisable = true;
                        obj[0].value = res.value;
                        obj[0].updateFlag = "";
                        obj[0].passOrFail = res.passOrFail;
                        this.prepareToolTip(obj[0]);
                        if (CommonMethods.hasValue(res.lst)) {
                            res.lst.forEach(x => {
                                var obj = this.sectionDetailsList.filter(o => o.detailID == x.detailID && !CommonMethods.hasValue(x.invalidationID));
                                obj[0].updateFlag = x.updateFlag;
                            })
                        }
                        this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
                        this.store
                            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                            .subscribe(getTestInfo => {
                                var obj = getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);
                                if (obj && obj.length > 0)
                                    this.testInitTime = obj[0].testInitTime;
                            });
                    }
                })
            }
            else {
                const modal = this._matDialog.open(DynamicFormulaCalculationComponent);
                modal.disableClose = true;
                modal.addPanelClass("dync-modal")
                var obj: FormulaData = new FormulaData();
                obj.detailID = detailID;
                obj.samAnaTestID = this.samAnaTestID;
                obj.sourceCode = this.sourceCode;
                obj.entityCode = this.entityCode;
                obj.initTime = this.testInitTime
                modal.componentInstance.formulaObj = obj;
                modal.componentInstance.testType = this.testType;
                modal.componentInstance.pageType = this.pageType;
                modal.afterClosed().subscribe(res => {
                    if (CommonMethods.hasValue(res.isChange)) {
                        var obj = this.sectionDetailsList.filter(x => x.detailID == detailID && !CommonMethods.hasValue(x.invalidationID));
                        if (!CommonMethods.hasValueWithZero(res.value))
                            obj[0].isDisable = false;
                        else
                            obj[0].isDisable = true;
                        obj[0].value = res.value;
                        obj[0].updateFlag = "";
                        obj[0].passOrFail = res.passOrFail;
                        this.prepareToolTip(obj[0]);
                        if (CommonMethods.hasValue(res.lst)) {
                            res.lst.forEach(x => {
                                var obj = this.sectionDetailsList.filter(o => o.detailID == x.detailID && !CommonMethods.hasValue(x.invalidationID));
                                obj[0].updateFlag = x.updateFlag;
                            })
                        }
                        this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
                        this.store
                            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                            .subscribe(getTestInfo => {
                                var obj = getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);
                                if (obj && obj.length > 0)
                                    this.testInitTime = obj[0].testInitTime;
                            });
                    }
                })
            }
        }
    }

    edit(data, index) {
        if (this.raiseDev() == 'OK') {
            this._confirmSer.confirm(LimsRespMessages.changeResult).subscribe(resp => {
                if (resp) {
                    data.isDisable = false;
                    var input = window.document.getElementById(index);
                    setTimeout(() => {
                        input.focus();
                    }, 100);
                }
            })
        }
    }

    skip(data, type) {
        if (this.raiseDev() == 'OK') {
            const modal = this._matDialog.open(addCommentComponent, { width: '800px' });
            modal.disableClose = true;
            modal.componentInstance.isCommentMandatory = true;
            modal.componentInstance.comment = type == 'SKIP' ? 'N / A' : type;
            modal.afterClosed().subscribe(resp => {
                if (resp.result) {
                    var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
                    obj.samAnaTestID = this.samAnaTestID;
                    obj.detailID = data.detailID;
                    if (!CommonMethods.hasValue(this.sourceCode))
                        obj.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA'; 
                    else
                        obj.aRDSSourceCode = this.sourceCode;
                    obj.initTime = this.testInitTime;
                    obj.type = type;
                    obj.comments = resp.val;
                    this.detailID = data.detailID;
                    this._saService.skipInpurFieldFromExecution(obj);
                }
            })
        }
    }

    getClass(data) {
        var cls: string = "mat-form-field-appearance-outline";
        if (data.updateFlag == 'UPD' && CommonMethods.hasValue(data.value))
            cls = 'border-red mat-form-field-appearance-outline'
        else if (CommonMethods.hasValue(data.value))
            cls = "border-green mat-form-field-appearance-outline";

        return cls
    }

    getCls(data) {
        var cls: string = "";
        if (data.updateFlag == 'UPD' && CommonMethods.hasValue(data.value))
            cls = 'testFail'
        else if (CommonMethods.hasValue(data.value))
            cls = "testPass";

        return cls
    }

    selectedTabID: number = 0;

    getTabSelectedIndex(evt: MatTabChangeEvent, index: number) {

        if (this.tabList.length > 0) {

            this.selectedTabID = this.tabList[index > -1 ? index : evt.index].tabID;
            localStorage.setItem('SELECTED_TAB', this.selectedTabID.toString());
            localStorage.setItem('SELECTED_TAB_INDEX', evt && evt.index >= 0 ? evt.index.toString() : index.toString());
            var tabType = this.tabList[index > -1 ? index : evt.index].sectionSubject
            if (tabType == 'Unknown Impurity' || tabType == 'known Impurity') {
                this.tabType = tabType;
                this.prepareUnKnownDataList(tabType);
                this.isShowImpurityAdd = true;
                this.btnSaveImp = 'Assign';
                if (this.sdmsData && this.sdmsData.selectedId)
                    this.sdmsData.clear();
            }
        }
    }

    updateInitTime(evt) {
        var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
        this.testInitTime = evt;
        data[0].testInitTime = this.getArdsInputsInfo.initTime = evt;
        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
        this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo;
                if (CommonMethods.hasValue(getArdsInputsInfo.solList) && getArdsInputsInfo.solList.length > 0) {
                    this.solList = getArdsInputsInfo.solList;
                    this.dataSolventGrid();
                }

            });
    }

    getSourceType() {
        if (this.entityCode == EntityCodes.sampleAnalysis)
            return "SAM_ANA_PREP";
        else if (this.entityCode == EntityCodes.calibrationArds)
            return "CALIB_PREP";
        else if (this.entityCode == EntityCodes.calibrationValidation)
            return 'CALIB_PARAMETER_PREP';
        else if (this.entityCode == EntityCodes.specValidation)
            return 'SPEC_PREP';
        else if (this.entityCode == EntityCodes.oosModule && this.sourceCode == 'OOS_HYPOTEST')
            return 'OOS_HYPOTEST_PREP';
        else if (this.entityCode == EntityCodes.oosModule && this.sourceCode == 'OOS_TEST')
            return 'OOS_TEST_PREP';
    }

    manageIsFinalFormula(id: number, formula: string, data: any) {
        if (this.pageType == "VIEW")
            return;
        if ((CommonMethods.hasValue(data.value) && !Number(data.value.split(" ")[0])) && (this.testType == 'R' || this.testType == 'N'))
            return this._alert.warning(SampleAnalysisMessages.numericValuesFormula);

        if (this.raiseDev() == 'OK') {

            if (this.rowType == 'TEST') {
                this._confirmSer.confirm(SampleAnalysisMessages.rawDataSectIsFinalFormula).subscribe(resp => {
                    if (resp)
                        this.sendFinalformula(id, formula)
                })
            }
            else {
                var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);
                const modal = this._matDialog.open(assignTestResult, { width: '50%' });
                modal.disableClose = true;
                var testBo: GetGroupTest = new GetGroupTest();
                testBo.catID = obj[0].testCategoryID;
                testBo.subCatID = obj[0].testSubCatID;
                testBo.detailID = id;
                if (!CommonMethods.hasValue(this.sourceCode))
                    testBo.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
                else
                    testBo.aRDSSourceCode = this.sourceCode;
                testBo.aRDSSourceRefKey = this.samAnaTestID;
                modal.componentInstance.grpTest = testBo;
                modal.afterClosed().subscribe(re => {
                    if (CommonMethods.hasValue(re.isSave))
                        this.sendFinalformula(id, re.resultTo, re.specTestID);
                })

            }
        }
    }

    sendFinalformula(id: number, formula: string, specTestID: number = 0) {
        var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
        obj.samAnaTestID = this.samAnaTestID;
        obj.detailID = id;
        if (!CommonMethods.hasValue(this.sourceCode))
            obj.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA'; 
        else
            obj.aRDSSourceCode = this.sourceCode;
        obj.formula = formula;
        obj.initTime = this.testInitTime;
        obj.specTestID = specTestID;
        this.detailID = id;
        this.finalFormula = formula;
        this.specTestID = specTestID;
        this._saService.manageIsFinalFormula(obj);
    }


    raiseDev() {
        if ((this.headerInfo.statusCode == 'APP' || this.headerInfo.statusCode == 'REJ') && CommonMethods.hasValue(this.getArdsInputsInfo.updTestStatus) && this.getArdsInputsInfo.updTestStatus != 'APP')
            return this._alert.error(SampleAnalysisMessages.pendingSpec);

        else if ((this.headerInfo.statusCode == 'APP' || this.headerInfo.statusCode == 'REJ') && !CommonMethods.hasValue(this.getArdsInputsInfo.updTestStatus)) {
            const dialogRef = this._matDialog.open(DeviationHandler, { width: '60%' });
            dialogRef.disableClose = true;
            dialogRef.componentInstance.entityCode = EntityCodes.sampleAnalysis;
            dialogRef.componentInstance.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
            dialogRef.afterClosed().subscribe(result => {
                if (result != null && result.CanRiceDeviation) {
                    var obj: deviation = new deviation();
                    obj.encEntityActID = String(this.samAnaTestID);
                    obj.entityCode = EntityCodes.sampleAnalysis;
                    obj.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
                    obj.remarks = result.comments;
                    obj.devType = result.DeviationType;
                    obj.refCode = this.headerInfo.arNumber;
                    obj.initTime = this.testInitTime;
                    obj.lst = result.lst;
                    this._saService.raiseDeviation(obj);
                }
            });
        }
        else return 'OK';
    }

    mappingSDMS() {
        if (CommonMethods.hasValue(this.reviewStatus) && this.reviewStatus != 'QA_REVIEW_COM' && this.reviewStatus != 'QC_REVIEW_COM' && this.reviewStatus != "SENT_BACK_REVIEW")
            return this._alert.warning(SampleAnalysisMessages.testSentReview);
        this.showHidePageType = PageTypeSection.MAPPING_ARDS;
        this.store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
    }

    dataSolventGrid() {
        this.dataSourceSolvents = null;
        if (CommonMethods.hasValue(this.solList) && this.solList.length > 0) {
            this.dataSourceSolvents = this.solList.filter(x => x.invalidationID == this.invalidationID);
            this.dataSourceSolvents = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(this.dataSourceSolvents, 'arrayDateTimeFormat', 'useBeforeDate')));
        }
    }


    prepareRs232(type: string, item: any, id: string) {

        if (!CommonMethods.hasValue(this.sourceCode))
            this.sourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);

        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode); //localStorage.getItem('conditionCode');
        obj.reqCode = this.arNumber;
        obj.sourceName = item.inputDescription;
        obj.encEntityActID = item.resultID;   //item.detailID;
        obj.chemicalName = type;
        obj.batchNumber = this.headerInfo.invBatchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = this.sourceCode;
        obj.occSource = "ARDS Execution";
        obj.sectionCode = SectionCodes.TSTDOCS;
        obj.parentID = this.samAnaTestID.toString();

        return obj;
    }


    getRS232Values(evt: RS232IntegrationModelBO, obj: ArdsSectionDataBO, indexj: number, indexi: number) {

        if (evt) {
            obj.value = evt.keyValue
            this.saveValue(obj, indexi, indexj);
        }


        // if (evt) {
        //     this.sectionDetailsList.filter(x => x.detailID == Number(evt.encEntityActID)).forEach((item) => {
        //         item.value = evt.keyValue;
        //     })
        // }

    }

    prepareHeader() {
        this.headersData = [];
        this.headersData.push({ columnDef: "reviewedBy", header: "Reviewed By", cell: (element: any) => `${element.reviewedBy}`, width: "maxWidth-30per" });
        this.headersData.push({ columnDef: "reviewedOn", header: "Reviewed On", cell: (element: any) => `${element.reviewedOn}`, width: "maxWidth-20per" });
        this.headersData.push({ columnDef: "reviewComment", header: "Comment", cell: (element: any) => `${element.reviewComment}`, width: "minWidth-30per" });
    }

    getDataSource(tabID) {
        if (CommonMethods.hasValue(this.reviewList) && this.reviewList.length > 0) {
            var obj = this.reviewList.filter(x => x.invalidationID == this.invalidationID && x.tabID == tabID);
            return CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(obj, 'arrayDateTimeFormat', 'reviewedOn'));
        }
        else
            return null;
    }

    addReview(tabID: number) {
        const model = this._matDialog.open(addCommentComponent, { width: "600px" })
        model.disableClose = true;
        model.afterClosed().subscribe(res => {
            if (res.result) {
                var obj: AddArdsReview = new AddArdsReview();
                obj.ardsExecID = this.samAnaTestID;
                if (!CommonMethods.hasValue(this.sourceCode))
                    obj.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
                else
                    obj.ardsSourceCode = this.sourceCode
                obj.tabID = tabID;
                obj.commnet = res.val;
                obj.initTime = this.getArdsInputsInfo.initTime;
                this._saService.addArdsReviewComment(obj);
            }
        })
    }

    prepareToolTip(data) {
        if (data.createdOn != data.updatedOn)
            data.displayToolTip = "Input Type : " + data.inputType + "\n\nInitial Value : " + data.initialValue + "\n\nEntered By : " + data.createdBy + '\n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime') + '\n\nLast Updated By : ' + data.updatedBy + '\n\nDate & Time :  ' + dateParserFormatter.FormatDate(data.updatedOn, 'datetime');
        else if (CommonMethods.hasValue(data.createdBy))
            data.displayToolTip = "Input Type : " + data.inputType + "\n\nEntered By : " + data.createdBy + '\n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime');
        else
            data.displayToolTip = "Input Type : " + data.inputType
    }

    getDynmicValueTooltip(type, id) {
        if (this.dynamicValueLst == undefined || !CommonMethods.hasValue(this.dynamicValueLst))
            return false;

        var obj = this.dynamicValueLst.filter(x => x.resultID == id);
        var tooltip: string = "";
        if (type == 'SHOW') {
            return obj && obj.length > 0 ? true : false
        }
        {
            obj.forEach(x => {
                tooltip = tooltip + x.itemDescription + " Value : " + x.value + "\n\n";
            })
            return tooltip;
        }
    }

    viewArds(id) {
        if (!CommonMethods.hasValue(id))
            return;
        else {
            var obj: ManageViewResetReportBO = new ManageViewResetReportBO();
            obj.reportID = id;
            obj.type = "VIEW";
            obj.section = "DMS_REPORT";
            this._saService.viewARDSReport(obj);
        }
    }

    getTooltip(type) {
        if (type == 'SKIP')
            return "Skipped"
        else if (type == 'ND')
            return 'Not Detected';
        else if (type == 'DG')
            return 'Disregarded'
    }

    //#region START IMPURITY IMPLEMENTATION

    addImpurity(): void {
        var retMsg: string = this.impValidations();

        if (CommonMethods.hasValue(retMsg))
            return this._alert.warning(retMsg);

        this.mngImpBO.ardsExecID = this.samAnaTestID;
        this._saService.manageImpurityBasicInfo(this.mngImpBO);
    }

    impValidations(): string {
        if (!CommonMethods.hasValue(this.mngImpBO.impurityName))
            return SampleAnalysisMessages.impurityName;
    }

    prepareUnKnownDataList(type: string = "Unknown Impurity") {
        this.tabType = type
        this.prepareImpHeaders();
        this.prepareUnKnowImpData();
    }

    prepareImpHeaders() {
        this.impHeaders = [];
        this.impHeaders.push({ columnDef: "injectionName", header: "", cell: (element: any) => `${element.impurityName}`, columnID: null, class: 'mat-column-injectionName' });


        if (this.getUnKnowImpData && this.getUnKnowImpData.injList && this.getUnKnowImpData.injList.length > 0) {
            if (this.entityCode == EntityCodes.specValidation || this.analysisMode == "OFFLINE") {
                this.getUnKnowImpData.injList.forEach(a => {
                    if (this.tabType == "known Impurity") {
                        this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID)).forEach((b, i) => {
                            var obj = this.getUnKnowImpData.unKIList.filter(x => x.injectionID == a.injectionID && x.impurityID == b.impurityID)
                            if (obj.length > 0 && !CommonMethods.hasValue(obj[0].unknownImpurityName))
                                obj[0].unknownImpurityName = 'Peak' + String(i + 1);
                        })
                    }
                    else {
                        this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID)).forEach((b, i) => {
                            var obj = this.getUnKnowImpData.unKIList.filter(x => x.injectionID == a.injectionID && x.impurityID == b.impurityID)
                            if (obj.length > 0 && !CommonMethods.hasValue(obj[0].unknownImpurityName))
                                obj[0].unknownImpurityName = 'Peak' + String(i + 1);
                        })
                    }
                })
            }
            // if (this.tabType == "known Impurity") {
            //     this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID)).forEach((item) => {
            //         this.impHeaders.push({ columnDef: this._getColumnDef(item.impurityName), header: item.impurityName, cell: (element: any) => `${element[this._getColumnDef(item.impurityName)]}`, columnID: item.impurityID, class: 'imp-cols' })
            //     })
            // }
            // else {
            //     this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID)).forEach((item) => {
            //         this.impHeaders.push({ columnDef: this._getColumnDef(item.impurityName), header: item.impurityName, cell: (element: any) => `${element[this._getColumnDef(item.impurityName)]}`, columnID: item.impurityID, class: 'imp-cols' })
            //     })
            // }
            this.getUnKnowImpData.injList.forEach((item) => {
                this.impHeaders.push({ columnDef: this._getColumnDef(item.injectionName), header: item.injectionName, cell: (element: any) => `${element[this._getColumnDef(item.injectionName)]}`, columnID: item.injectionID, class: 'imp-cols' })
            })
            this.impHeaderDisplayCol = this.impHeaders.map(col => col.columnDef);
            // if (this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation)
            //     this.impHeaderDisplayCol.push('actions')
        }

    }

    prepareUnKnowImpData() {
        if (this.getUnKnowImpData && this.getUnKnowImpData.impList && this.getUnKnowImpData.impList.length > 0) {
            var obj: any
            if (this.tabType == "known Impurity")
                obj = this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID));
            else
                obj = this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID));

            this.unKnownImpDatadataSource = CommonMethods.bindMaterialGridData(obj);
        }
    }


    // Assign Impurity 

    assignImpurity(injectionID: any) {

        this.enableChangeSDMSFile(true);
        this.injectionID = injectionID;
        this.checkPeakValExists(injectionID);
    }

    checkPeakValExists(injectionID: any) {
        if (this.tabType == "known Impurity") {
            if (this.getUnKnowImpData.unKIList.filter(x => CommonMethods.hasValue(x.knownImpID) && x.injectionID == injectionID && x.unknownImpurityName).length > 0) {
                this._confirmSer.confirm(SampleAnalysisMessages.confirmPeakValue).subscribe(resp => {
                    if (resp)
                        this.navigateAssignPeakValue(injectionID);
                })
            }
            else
                this.navigateAssignPeakValue(injectionID);
        }
        else {
            if (this.getUnKnowImpData.unKIList.filter(x => !CommonMethods.hasValue(x.knownImpID) && x.injectionID == injectionID && x.unknownImpurityName).length > 0) {
                this._confirmSer.confirm(SampleAnalysisMessages.confirmPeakValue).subscribe(resp => {
                    if (resp)
                        this.navigateAssignPeakValue(injectionID);
                })
            }
            else
                this.navigateAssignPeakValue(injectionID);
        }
    }

    navigateAssignPeakValue(injectionID: any) {
        this.setIsShowImpurityAdd();
        this.selectedInjTitle = this.getUnKnowImpData.injList.filter(x => x.injectionID == injectionID)[0].injectionName;
        this.sdmsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sdms, LookupCodes.getSDMSDetailsImpurities, LKPDisplayNames.sdmsTitle, LKPDisplayNames.sdmsCode, LookUpDisplayField.code, LKPPlaceholders.sdms, "SamAnaTestID = " + this.samAnaTestID + "& ParentID = " + this.samAnaTestID, null, 'LIMS', null, false, LKPDisplayNames.prepRunNo);
    }


    setIsShowImpurityAdd() {
        this.isShowImpurityAdd = !this.isShowImpurityAdd;
    }

    formatString(val: any, columnDef: string, row: any, injectionID: number = 0) {

        if (columnDef != 'injectionName'){
            var obj = this.getUnKnowImpData.unKIList.filter(x => x.impurityID == row.impurityID && x.injectionID == injectionID);
            if(obj && obj.length > 0)
                return CommonMethods.FormatValueString(obj[0].unknownImpurityName);
        }

        return CommonMethods.FormatValueString(val);
    }

    addValue(impurityID: Number, injectionID: number, type: string, evt) {
        var obj = this.getUnKnowImpData.unKIList.filter(x => x.injectionID == injectionID && x.impurityID == impurityID)[0];

        if (obj != undefined) {
            if (type == 'AREA')
                obj.impurityArea = evt.target.value;
            else if (type == "RT_RATIO")
                obj.rtRatio = evt.target.value;
            else
                obj.impurityPArea = evt.target.value;
        }

    }

    getAddValue(impurityID: Number, injectionID: number, type: string) {
        var obj = this.getUnKnowImpData.unKIList.filter(x => x.injectionID == injectionID && x.impurityID == impurityID)[0];

        if (obj != undefined) {
            if (type == 'AREA')
                return obj.impurityArea;
            else if (type == "RT_RATIO")
                return obj.rtRatio;
            else
                return obj.impurityPArea;

        }

    }

    private _getInjectFilter(id): string {
        return this.getUnKnowImpData.injList.filter(x => x.injectionID == id)[0].injectionName;
    }

    private _getColumnDef(name: string): string {
        return String(name).replace(/ /g, "").toLowerCase()
    }

    getSelectedSDMSDetails(evt) {
        if (evt.val) {
            var obj: any = { sdmsID: evt.val.id };
            this._saService.getMappingInfo(obj);
        }
        else
            this.sdmsDetailsData = null;
    }

    getSDMSPeakData() {
        if (this.sdmsDetailsData.dataProcessed != null) {
            var obj = JSON.parse(this.sdmsDetailsData.dataProcessed);
            if (obj && obj.jsonTableInfo && obj.jsonTableInfo.length > 0)
                this.selectedPeakDataObject = JSON.parse(obj.jsonTableInfo[0]).filter(x => CommonMethods.hasValue(x.PeakName) && x.PeakName.trim() != '-') //.map(x => x.PeakName);
        }
    }

    changeSDMSFile() {

        if (this.btnSdmsFile == ButtonActions.btnChange) {
            this.peakDataList = [];
            return this.enableChangeSDMSFile(true);
        }
        else
            this.enableChangeSDMSFile(false);

        this.peakDataList = this.selectedPeakDataObject.map(x => x.PeakName);
        this.peakDataList.push("ND");
        this.peakDataList.push("DR");
    }

    getImpurityList() {
        if (this.tabType == 'known Impurity')
            return this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID));
        else
            return this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID));
    }

    saveSDMSFileDetails() {

        var retMsg = this.assignSDMSValidation();

        if (CommonMethods.hasValue(retMsg))
            return this._alert.warning(retMsg);

        var impList: ManageImpurityAssignSdmsBOList = new ManageImpurityAssignSdmsBOList();

        this.getUnKnowImpData.impList.forEach((item) => {
            if ((this.tabType == "known Impurity" && CommonMethods.hasValue(item.knownImpID)) || (this.tabType != 'known Impurity' && !CommonMethods.hasValue(item.knownImpID))) {
                var obj: ManageImpurityAssignSdmsBO = new ManageImpurityAssignSdmsBO();
                var peakObj = this.getImpPeakAreaOrPerAreaVal(item.peakValue);

                if (peakObj) {
                    obj.ImpurityArea = peakObj.Area;
                    obj.impurityPArea = peakObj.PercentageArea ? peakObj.PercentageArea : null;
                    obj.rtRatio = peakObj.RTRatio;
                }

                obj.impurityName = item.peakValue;
                obj.impurityType = (item.peakValue == "ND" || item.peakValue == "DR") ? item.peakValue : "VALUE";
                obj.unknownImpurityID = this.getUnKnowImpData.unKIList.filter(x => x.injectionID == this.injectionID && x.impurityID == item.impurityID)[0].unknownImpurityID;

                impList.push(obj);
            }
        })

        // console.log(impList);

        this._saService.manageImpuritySDMSDetails(impList);

    }

    get qc_updatetbl() {


        if (this.btnSaveImp != "Assign")
            return localStorage.getItem('qc_updatetbl') || ''
        else if (this.entityCode == 'SPEC_VALID')
            return 'qc_spec_impurity';
        else
            return null;
    }

    saveImpData() {
        if (this.btnSaveImp == "Assign") {

            localStorage.setItem('qc_updatetbl', 'qc_updatetbl');

            this.btnSaveImp = ButtonActions.btnSave;
            return this.isShowImpurityAdd = false;
        }
        var err = this.impValidation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        var impList: ManageImpurityAssignSdmsBOList = new ManageImpurityAssignSdmsBOList();
        if (this.tabType == "known Impurity") {
            this.getUnKnowImpData.impList.filter(a => CommonMethods.hasValue(a.knownImpID)).forEach(o => {
                this.getUnKnowImpData.unKIList.filter(x => x.impurityID == o.impurityID).forEach((item) => {
                    var obj: ManageImpurityAssignSdmsBO = new ManageImpurityAssignSdmsBO();

                    obj.ImpurityArea = item.impurityArea;
                    obj.impurityPArea = item.impurityPArea;

                    obj.impurityName = item.unknownImpurityName;
                    obj.impurityType = "VALUE";;
                    obj.unknownImpurityID = item.unknownImpurityID;
                    obj.rtRatio = item.rtRatio;
                    impList.push(obj);
                })
            });
        }
        else {
            this.getUnKnowImpData.impList.filter(a => !CommonMethods.hasValue(a.knownImpID)).forEach(o => {
                this.getUnKnowImpData.unKIList.filter(x => x.impurityID == o.impurityID).forEach((item) => {
                    var obj: ManageImpurityAssignSdmsBO = new ManageImpurityAssignSdmsBO();

                    obj.ImpurityArea = item.impurityArea;
                    obj.impurityPArea = item.impurityPArea;

                    obj.impurityName = item.unknownImpurityName;
                    obj.impurityType = "VALUE";;
                    obj.unknownImpurityID = item.unknownImpurityID;
                    obj.rtRatio = item.rtRatio;
                    impList.push(obj);
                })
            });
        }

        this._saService.manageImpuritySDMSDetails(impList);
    }

    cancel() {
        localStorage.removeItem('qc_updatetbl');
        this.isShowImpurityAdd = !this.isShowImpurityAdd;
        this.btnSaveImp = "Assign";
    }

    deleteImpurity(impurityID) {
        this._confirmSer.confirm(LimsRespMessages.delete).subscribe(resp => {
            if (resp)
                this._saService.deleteImpurity(impurityID);
        })
    }

    impValidation() {
        var retMsg: string;
        if (this.tabType == "known Impurity") {
            var areaIndex = this.getUnKnowImpData.inputTypeList.findIndex(x => x.inputType == 'KNOWN_AREA');
            var pareaIndex = this.getUnKnowImpData.inputTypeList.findIndex(x => x.inputType == 'KNOWN_PAREA');

            this.getUnKnowImpData.impList.filter(a => CommonMethods.hasValue(a.knownImpID)).forEach(o => {
                var obj = this.getUnKnowImpData.unKIList.filter(x => x.impurityID == o.impurityID && ((areaIndex > -1 && !CommonMethods.hasValueWithZero(x.impurityArea)) || (pareaIndex > -1 && !CommonMethods.hasValueWithZero(x.impurityPArea))))
                if (obj && obj.length > 0)
                    retMsg = SampleAnalysisMessages.addPeakValue;
            })
        }
        else {
            var areaIndex = this.getUnKnowImpData.inputTypeList.findIndex(x => x.inputType == 'UNKN_AREA');
            var pareaIndex = this.getUnKnowImpData.inputTypeList.findIndex(x => x.inputType == 'UNKN_PAREA');

            this.getUnKnowImpData.impList.filter(a => !CommonMethods.hasValue(a.knownImpID)).forEach(o => {
                var obj = this.getUnKnowImpData.unKIList.filter(x => x.impurityID == o.impurityID && ((areaIndex > -1 && !CommonMethods.hasValueWithZero(x.impurityArea)) || (pareaIndex > -1 && !CommonMethods.hasValueWithZero(x.impurityPArea))))
                if (obj && obj.length > 0)
                    retMsg = SampleAnalysisMessages.addPeakValue;
            })
        }
        return retMsg;
    }

    getImpPeakAreaOrPerAreaVal(peakName: string) {
        return this.selectedPeakDataObject.filter(x => x.PeakName == peakName)[0];
    }

    assignSDMSValidation() {
        var retMsg: string;

        if (this.tabType == "known Impurity") {
            if (this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID) && x.peakValue == null).length > 0)
                retMsg = SampleAnalysisMessages.impurityPeakValue;
            else {

                var list = this.getUnKnowImpData.impList.filter(x => (CommonMethods.hasValue(x.knownImpID) && x.peakValue != "ND" && x.peakValue != "DR"));
                for (let index = 0; index < list.length; index++) {
                    const element = list[index];
                    if (this.getUnKnowImpData.impList.filter(x => CommonMethods.hasValue(x.knownImpID) && x.impurityID != element.impurityID && element.peakValue == x.peakValue).length > 0) {
                        retMsg = SampleAnalysisMessages.dupImpurityPeakValue;
                        break;
                    }
                }
            }
        }
        else {
            if (this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID) && x.peakValue == null).length > 0)
                retMsg = SampleAnalysisMessages.impurityPeakValue;
            else {

                var list = this.getUnKnowImpData.impList.filter(x => (!CommonMethods.hasValue(x.knownImpID) && x.peakValue != "ND" && x.peakValue != "DR"));
                for (let index = 0; index < list.length; index++) {
                    const element = list[index];
                    if (this.getUnKnowImpData.impList.filter(x => !CommonMethods.hasValue(x.knownImpID) && x.impurityID != element.impurityID && element.peakValue == x.peakValue).length > 0) {
                        retMsg = SampleAnalysisMessages.dupImpurityPeakValue;
                        break;
                    }
                }
            }
        }

        return retMsg;
    }

    enableChangeSDMSFile(val: boolean): void {
        this.btnSdmsFile = val ? ButtonActions.btnGo : ButtonActions.btnChange;
    }

    fieldIsShow(type: string) {
        if (this.tabType == "known Impurity") {
            if (type == "AREA") {
                var obj = this.getUnKnowImpData.inputTypeList.filter(x => x.inputType == 'KNOWN_AREA');
                return (obj && obj.length > 0)
            }
            else {
                var obj = this.getUnKnowImpData.inputTypeList.filter(x => x.inputType == 'KNOWN_PAREA');
                return (obj && obj.length > 0)
            }
        }
        else {
            if (type == "AREA") {
                var obj = this.getUnKnowImpData.inputTypeList.filter(x => x.inputType == 'UNKN_AREA');
                return (obj && obj.length > 0)
            }
            else {
                var obj = this.getUnKnowImpData.inputTypeList.filter(x => x.inputType == 'UNKN_PAREA');
                return (obj && obj.length > 0)
            }
        }
    }

    resetUnKnownImpurity() {

        this.enableChangeSDMSFile(true);
        this.setIsShowImpurityAdd();
        this.btnSaveImp = "Assign";
        this.impHeaders = [];
        this.impHeaderDisplayCol = null;
        this.injectionID = null;
        this.sdmsDetailsData = null;
        this.peakDataList = [];
        this.selectedPeakDataObject = null;
        this.selectedInjTitle = null;

    }

    //#endregion

    isIconDispay(icon, dataItem) {
        if (this.pageType == 'VIEW' || (this.pageType == 'UPD' && this.sourceCode == "CONT_WISE_ANA")) {
            if (!this.isInvalidated && dataItem.formulaResultFlag == icon)
                return true;
            else
                return false;
        }
        else {
            if (dataItem.inputType == 'KNOWN_AREA' || dataItem.inputType == 'KNOWN_AREA' || dataItem.inputType == 'KNOWN_AREA' || dataItem.inputType == 'KNOWN_AREA' || dataItem.inputType == 'KNOWN_AREA' || this.getDynmicValueTooltip('SHOW', dataItem.resultID))
                return false;
            else if (icon == 'F2')
                return (!this.isInvalidated && dataItem.skipType != 'SKIP' && this.testType == 'R');
            else
                return (!this.isInvalidated && dataItem.skipType != 'SKIP');
        }
    }

    getBtnType(type: string) {
        if (type == 'Unknown Impurity')
            return CommonMethods.hasValue(this.getArdsInputsInfo.isUnknownMapping) ? 'Update Impurity Mapping' : 'Confirm Impurity Mapping';
        else
            return CommonMethods.hasValue(this.getArdsInputsInfo.isknownMapping) ? 'Update Impurity Mapping' : 'Confirm Impurity Mapping';

    }

    showFields(type: string) {
        if (type == 'Unknown Impurity')
            return !CommonMethods.hasValue(this.getArdsInputsInfo.isUnknownMapping);
        else
            return !CommonMethods.hasValue(this.getArdsInputsInfo.isknownMapping);

    }


    confirmImp(type: string) {
        var obj: ConfirmImpMapping = new ConfirmImpMapping();
        obj.mappingType = type == 'Unknown Impurity' ? "UNKNOWN" : "KNOWN";
        obj.isConfirm = type == 'Unknown Impurity' ? !CommonMethods.hasValue(this.getArdsInputsInfo.isUnknownMapping) : !CommonMethods.hasValue(this.getArdsInputsInfo.isknownMapping);
        obj.ardsExecID = this.samAnaTestID;
        this._confirmSer.confirm(obj.isConfirm ? SampleAnalysisMessages.confirmImp : SampleAnalysisMessages.updateImp).subscribe(resp => {
            if (resp)
                this._saService.confirmImpMapping(obj);
        })
    }


    getTableResultSets(type: string) {
        if (type == 'Unknown Impurity')
            return this.getArdsInputsInfo.tableResultLst.filter(x => x.resultSetType == 'Unknown');
        else
            return this.getArdsInputsInfo.tableResultLst.filter(x => x.resultSetType != 'Unknown');
    }

    execTableResult(resultRestID: number) {
        const modal = this._matDialog.open(TableResultSetExecComponent, { width: "90%", height: '80%' });
        modal.disableClose = true;
        modal.componentInstance.resultSetID = resultRestID;
        modal.componentInstance.ardsExecID = this.samAnaTestID;
        modal.componentInstance.sourceCode = this.sourceCode;
        modal.componentInstance.testType = this.testType;
        modal.componentInstance.pageType = this.pageType;
        modal.componentInstance.entityCode = this.entityCode;
    }

    ngOnDestroy() {

        localStorage.removeItem('SELECTED_TAB');
        localStorage.removeItem('SELECTED_TAB_INDEX');

        localStorage.removeItem('qc_updatetbl');

        this.subscription.unsubscribe();
    }
}