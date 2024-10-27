import { Component, OnDestroy, AfterContentInit, Input, EventEmitter, Output, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from 'src/app/common/services/utilities/commonmethods';
import { GridActions, EntityCodes, ButtonActions, ActionMessages, DCActionCode, PageUrls, CapabilityActions, PageTypeSection, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { MatDialog } from '@angular/material';
import { AnalysisOccupancyComponent } from './analysisOccupancy.component';
import { ManageAnalysisOccupancyBO, ManageTestSampleRRTValuesBO, AnalysisHeaderBO, updFinalRemarks, IncludeExcludeTestBOList, IncludeExcludeTestBO, IncludeExcludeTestBOItems, GetCurrentAnalysisBO, SendForReview, ArdsReportBO, SwitchArds } from '../model/sampleAnalysisModel';
import { methodResultsComponent } from './methodResults.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { analysisRemarks, deviation } from '../model/sampleAnalysisModel';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { Router } from '@angular/router';
import { ManageRRTValuesComponent } from './manageRRTValues.component';
import { select, Store } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromCalibArdsOptions from '../../calibrationArds/state/calibrationArds/calibrationArds.reducer';
import { ManageAdditionalTestComponent } from './manageAdditionalTest.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { InvalidateBO } from 'src/app/volumetricSolution/model/volumetricSolModel';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { VolumetricSolMessages } from 'src/app/volumetricSolution/messages/volumetricSolMessages';
import { ReportBO } from 'src/app/reports/models/report.model';
import { ReportView } from 'src/app/common/component/reportView.component';
import { AnalysisReportComponent } from './analysisReport.component';
import { MaterialGridComponent } from 'src/app/common/component/materialGrid.component';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { ContainerwiseTestSendForReview } from './containerwiseTestSentForReview.component';
import { SwitchArdsModeComponent } from './switchArdsMode.component';

@Component({
    selector: 'app-analysis',
    templateUrl: '../html/manageAnalysis.html'
})

export class ManageAnalysisComponent implements AfterContentInit, OnDestroy {

    @Input() encEntityActID: any;
    @Input() pageType: string = 'MNG';
    @Input() entityCode: string;
    @Input() specCatID: number;
    @Input() sourceCode: string;
    @Input() appBO: AppBO = new AppBO();
    @Input() encSioID: string;
    @Input() analysisMode: string;
    @Output() updateAppInfo: EventEmitter<any> = new EventEmitter();
    @Output() closeAnalysis: EventEmitter<any> = new EventEmitter();

    @ViewChild('extGrid', { static: false }) extGrid: MaterialGridComponent;
    @Input() showBtns: boolean = true;
    @Input() showCancel: boolean = false;
    headersData: any;
    dataSource: any;
    isEnableCheckbox: boolean = false;
    actions: Array<string> = [GridActions.MNG_OCC, GridActions.Method_Res, GridActions.RRT, GridActions.RAW, GridActions.upload, GridActions.Invalid, GridActions.Calib_Report, GridActions.SwitchSTP];
    btnType: string = ButtonActions.btnSave;
    remarks: string;
    btnUpload: string = ButtonActions.btnUpload;
    // initTime: string;
    analysisStatus: string;
    specPrecautions: string;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    removeActions: any = { headerName: 'rowType', MNG_OCC: 'SUBCAT', METHOD_RES: 'TEST', UPLOAD: 'TEST', RRT: 'TEST', isRRT: true, RAW: 'TEST', INVALID: 'passOrFail', passOrFail: 'N' }

    // showRawData: boolean = false;
    encSamAnalysisTestID: string = '';
    isResetAction: boolean = false;
    disableRemarks: boolean = true;
    remarksBtn: string = "Update Remarks";
    includeExcludeBO: IncludeExcludeTestBOItems = new IncludeExcludeTestBOItems();
    actionButtonDisabled: boolean = false;
    rawDataPageType: string = 'MNG';
    callEnable: boolean = true;
    disStatus: boolean = true;
    // Mapping SDMS
    showHidePageType: PageTypeSection = PageTypeSection.ANALYSIS;

    subscription: Subscription = new Subscription();
    analysisTests: any;
    reviewedBy: string;
    isExcluded: boolean = false;
    isIncluded: boolean = false;
    samAnaTestID: string;
    btnInc: string = "Include / Exclude Test";
    extrandataSource: any;
    containerAnaApp: boolean;
    containerAnaStatus: string;
    reviewApp: boolean = false;
    actPageType: string;
    remarksType: string = "Remarks";
    compreRemarks: string;
    isCompChkApp: boolean = false;
    sendReviewLst: any;
    testAnalysisMode: string;
    isLoaderObj = { isLoaderStartInclExclTest: false, isLoaderStartSpecReset: false, isLoaderStart: false, isLoaderFinalRemarks: false };
    containerWiseAnalysisApp: string = "No";
    updTestStatus: string = "";
    @Output() emitArdsExecID: EventEmitter<any> = new EventEmitter();

    constructor(private _service: SampleAnalysisService, private _matDailog: MatDialog,
        public _global: GlobalButtonIconsService, public _alert: AlertService,
        private _route: Router, private _store: Store<fromAnalysisOptions.AnalysisState>,
        private _limsTitle: LIMSContextServices, private _confirService: ConfirmationService) {
    }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getAnalysisTestBySioID") {
                this.analysisStatus = resp.result.analysisStatus;
                this.remarks = resp.result.resultRemarks;
                this.specPrecautions = resp.result.specialPrecautions;
                this.containerAnaApp = resp.result.isContainerAnaCompleted;
                this.containerAnaStatus = resp.result.containerAnaStatus;
                this.compreRemarks = resp.result.comprehensiveRemarks;
                this.isCompChkApp = resp.result.isComprehensiveChkApp;
                this.prepareHeaders();
                setTimeout(() => {
                    this.dataSource = CommonMethods.bindMaterialGridData(resp.result.lst.filter(x => !CommonMethods.hasValue(x.testID)));
                    this.extrandataSource = CommonMethods.bindMaterialGridData(resp.result.lst.filter(x => CommonMethods.hasValue(x.testID)));
                    this.extrandataSource.data.forEach((x, index) => { if (!CommonMethods.hasValue(x.srNum)) x.srNum = index + 1 });
                    this.analysisTests = resp.result.lst;
                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
                    if (this.entityCode == EntityCodes.calibrationArds) {
                        var obj = this.analysisTests.filter(x => x.hasOccSubmitted)
                        if (obj.length > 0)
                            this.pageType = this.actPageType = this.actPageType;
                        else
                            this.pageType = this.actPageType = 'VIEW';
                    }
                    if (this.sourceCode == 'CONT_WISE_ANA') {
                        if (CommonMethods.hasValue(resp.result.isSkipedFromAnalysis))
                            this.pageType = this.actPageType = "VIEW";
                        else
                            this.pageType = this.actPageType;
                    }
                    if ((CommonMethods.hasValue(this.remarks) && this.callEnable) || this.pageType == 'VIEW')
                        this.enableHeaders(false);
                    else this.enableHeaders(true);
                    this.callEnable = true;
                }, 300);
                this.getAnalysisStatus();
            }
            else if (resp.purpose == "saveAnalysis") {
                this.isLoaderObj.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {
                    if (this.entityCode == EntityCodes.calibrationArds)
                        this._alert.success(SampleAnalysisMessages.calibSuccess);
                    else if (this.entityCode == EntityCodes.specValidation)
                        this._alert.success(SampleAnalysisMessages.validSuccess)
                    else if (this.entityCode == EntityCodes.calibrationValidation)
                        this._alert.success(SampleAnalysisMessages.calibValidSuccess)
                    else
                        this._alert.success(SampleAnalysisMessages.analysisSucc);
                    this.appBO.initTime = resp.result.initTime;
                    this.analysisStatus = resp.result.analysisStatus;
                    this.updateAppInfo.emit(this.appBO);
                    this.enableHeaders(false);
                    // this._store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == DCActionCode.SAMANA_UPDREMARKS) {
                this.isLoaderObj.isLoaderStartSpecReset = false;
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    if (this.headerInfo.statusCode != 'APP')
                        this._route.navigateByUrl(PageUrls.homeUrl);
                    else this._route.navigateByUrl('/lims/sampleAnalysis')
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "updateFinalRemarks") {
                this.isLoaderObj.isLoaderFinalRemarks = false;
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.remarksSucc);
                    this._route.navigateByUrl('/lims/sampleAnalysis');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "manageIncludeExcludeTest") {

                this.actionButtonDisabled = this.isLoaderObj.isLoaderStartInclExclTest = false;
                this.callEnable = false;
                if (resp.result.returnFlag == "OK") {

                    resp.result.list.forEach((item) => {
                        var obj = this.analysisTests.filter(x => x.samAnaTestID == item.id);

                        obj[0].testInitTime = item.testInitTime;
                        obj[0].passOrFail = item.passOrFail;
                        obj[0].isExclude = false;

                        obj[0].isSelected = false;
                        obj[0].hasOccSubmitted = false;
                        obj[0].rawdataUpdOn = null;
                        obj[0].rawdataConfOn = null;

                        if (item.passOrFail == 'N')
                            this.isExcluded = true;
                        else this.isIncluded = true;

                    })
                    var msg: string
                    if (this.isIncluded && this.isExcluded)
                        msg = SampleAnalysisMessages.testIncludeExc + (this.entityCode == EntityCodes.calibrationArds ? 'parameter(s)' : 'test(s)');
                    else if (this.isIncluded)
                        msg = SampleAnalysisMessages.testInclude + (this.entityCode == EntityCodes.calibrationArds ? 'parameter(s)' : 'test(s)');
                    else if (this.isExcluded)
                        msg = SampleAnalysisMessages.testExculde + (this.entityCode == EntityCodes.calibrationArds ? 'parameter(s)' : 'test(s)');
                    this._alert.success(msg)
                    this.isIncluded = this.isExcluded = false;

                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
                    this.getSampleAnalysisData()
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

            else if (resp.purpose == "getSamplingInfo") {
                this.reviewedBy = resp.result.reviewedBy;
                this.containerWiseAnalysisApp = resp.result.containerAnalysisApplicable;
            }
            else if (resp.purpose == "invalidateTest") {
                if (resp.result.returnFlag == "OK") {

                    this._alert.success(VolumetricSolMessages.invalidateSuccess);
                    //this.dataSource = CommonMethods.getDataSource(this.dataSource);

                    if (this.showHidePageType == PageTypeSection.ARDS)
                        this.showHidePageType = PageTypeSection.ANALYSIS;

                    this._store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));

                    this.analysisTests.filter(x => x.samAnaTestID == this.samAnaTestID).forEach((item) => {
                        item.testInitTime = resp.result.initTime;
                        item.encInvalidationID = resp.result.encryptedKey;
                        item.invalidationID = resp.result.transKey;
                    })

                    // this.analysisTests = this.dataSource;
                    this.dataSource = CommonMethods.bindMaterialGridData(this.analysisTests.filter(x => !CommonMethods.hasValue(x.testID)));
                    this.extrandataSource = CommonMethods.bindMaterialGridData(this.analysisTests.filter(x => CommonMethods.hasValue(x.testID)));
                    this.samAnaTestID = null;
                    this.hideRawDataEmit(null);

                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
                    this.gridResetActions();
                    localStorage.setItem('IS_INVALIDATED', 'TRUE');
                    if (CommonMethods.hasValue(this.extrandataSource) && this.extrandataSource.data.length > 0) {
                        this.extGrid.usrActions = [];
                    }

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            // else if (resp.purpose == "getCalibrationReportDetails") {
            //     if (resp.result.statusCode == 'OK') {
            //         window.open(resp.result.message, "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=1500,height=700");
            //     }
            //     else
            //         this._alert.error(ActionMessages.GetMessageByCode(resp.result.message));
            // }
            else if (resp.purpose == "sendTestForReview") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(this.entityCode == EntityCodes.sampleAnalysis ? SampleAnalysisMessages.succSendAna : SampleAnalysisMessages.succSendCalib);
                    if (CommonMethods.hasValue(this.samAnaTestID))
                        this.analysisTests.filter(x => x.samAnaTestID == this.samAnaTestID).forEach((item) => { item.testInitTime = resp.result.testInitTime; item.statusCode = 'UNDER_QC_REVIEW' })
                    else if (CommonMethods.hasValue(this.sendReviewLst) && this.sendReviewLst.length > 0) {
                        this._service.getContainerWiseAnalysis(this.encSioID);
                        this.sendReviewLst.forEach(x => {
                            this.analysisTests.filter(a => a.samAnaTestID == x.id).forEach((item) => { item.testInitTime = resp.result.testInitTime; item.statusCode = 'UNDER_QC_REVIEW' })
                        })
                    }
                    this.dataSource = CommonMethods.bindMaterialGridData(this.analysisTests.filter(x => !CommonMethods.hasValue(x.testID)));
                    this.extrandataSource = CommonMethods.bindMaterialGridData(this.analysisTests.filter(x => CommonMethods.hasValue(x.testID)));
                    this.samAnaTestID = null;
                    this.sendReviewLst = null;
                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
                }
                else if (resp.result.returnFlag == "NOACT_TEMP")
                    this._alert.error(ActionMessages.GetMessageByCode('NOACT_TEMP_DR'));
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag + '_' + this.entityCode));
            }
        })

        if (CommonMethods.hasValue(this.encEntityActID))
            this.getSampleAnalysisData();

        // this.changeBgColor('INIT');
        var capActions: CapabilityActions = this._limsTitle.getSearchActinsByEntityCode(this.entityCode);
        var obj = capActions.actionList.filter(x => x == 'RESET');
        this.isResetAction = (obj.length > 0);

        if (this.appBO.operationType == "VIEW")
            this.pageType = this.actPageType = 'VIEW';

        this.showHidePageType = PageTypeSection.ANALYSIS;
        if (this.entityCode == EntityCodes.calibrationArds)
            this.btnInc = "Include / Exclude Parameter";

        if (this.pageType == 'VIEW' || this.pageType == 'UPD') {
            this.btnUpload = ButtonActions.btnViewDocus;
            this.actions = [GridActions.MNG_OCC, GridActions.Method_Res, GridActions.RRT, GridActions.RAW, GridActions.upload, GridActions.Calib_Report];

        }

        var index = this.actions.findIndex(x => x == GridActions.SendForReview)
        if (index == -1 && this.reviewApp && (this.pageType == 'MNG' || this.pageType == "UPD") && (this.entityCode == EntityCodes.sampleAnalysis || this.entityCode == EntityCodes.oosModule || this.entityCode == EntityCodes.calibrationArds))
            this.actions.push(GridActions.SendForReview);
        if (this.entityCode == EntityCodes.sampleAnalysis || this.entityCode == EntityCodes.calibrationArds)
            this.actions.push(GridActions.DataReview_Report, GridActions.AnalyticalData_Report);
        this.actPageType = this.pageType;
        if (this.entityCode == EntityCodes.oosModule)
            this.remarksType = 'Justification';
        var switchIndex = this.actions.findIndex(x => x == GridActions.SwitchSTP)
        if (switchIndex > -1 && (this.entityCode == EntityCodes.specValidation || this.entityCode == EntityCodes.calibrationValidation))
            this.actions.splice(switchIndex, 1);


        if (this.sourceCode == 'CONT_WISE_ANA')
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_CON_WISE);
        else if (this.entityCode == EntityCodes.calibrationValidation)
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_CALIB_VALID);
        else if (this.entityCode == 'QCSAMPASYS' && !CommonMethods.hasValue(this.sourceCode))
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_ANALYSIS);
        else if (this.entityCode == 'ENGGMNT' && !CommonMethods.hasValue(this.sourceCode))
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_CALIB);
        else if (this.entityCode == EntityCodes.specValidation)
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_SPEC_VALID);
        else if (this.entityCode == EntityCodes.oosModule && CommonMethods.hasValue(this.sourceCode) && this.sourceCode == "OOS_HYPOTEST")
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_OOS_HYPO)
        else if (this.entityCode == EntityCodes.oosModule && CommonMethods.hasValue(this.sourceCode) && this.sourceCode == "OOS_TEST")
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_OOS_TEST)
    }

    ngOnInit() {
        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(appBOInfo => {
                if (this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation && this.entityCode != EntityCodes.oosModule)
                    this.appBO = appBOInfo;
                if (this.appBO.operationType == "VIEW")
                    this.pageType = this.actPageType = 'VIEW';
            });

        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysisInfo => {
                this.headerInfo = analysisInfo;
                if (this.entityCode != EntityCodes.calibrationArds) {
                    this.reviewApp = analysisInfo.isReviewApplicable;
                    var index = this.actions.findIndex(x => x == GridActions.SendForReview)
                    if (index == -1 && this.reviewApp && (this.pageType == 'MNG' || this.pageType == "UPD"))
                        this.actions.push(GridActions.SendForReview);
                    if (this.headerInfo.analsysMode == 'NO' || this.headerInfo.analsysMode == 'YES') {
                        var switchIndex = this.actions.findIndex(x => x == GridActions.SwitchSTP)
                        if (switchIndex > -1 && this.headerInfo.analsysMode == 'YES')
                            this.actions.splice(switchIndex, 1)
                    }
                }
            });


        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisPageTypeAction))
            .subscribe(actionType => {
                this.showHidePageType = actionType;
            });

        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(testList => {
                if (CommonMethods.hasValue(testList) && testList.length > 0) {
                    this.dataSource = CommonMethods.bindMaterialGridData(testList.filter(x => !CommonMethods.hasValue(x.testID)));
                    this.extrandataSource = CommonMethods.bindMaterialGridData(testList.filter(x => CommonMethods.hasValue(x.testID)));
                    this.extrandataSource.data.forEach((x, index) => { x.srNum = index + 1 });
                    this.analysisTests = testList;
                }
                this.gridResetActions();
            });
        if (this.entityCode == EntityCodes.calibrationArds) {
            this._store
                .pipe(select(fromCalibArdsOptions.getCalibrationArdsAppInfo))
                .subscribe(appBOInfo => {
                    this.appBO = appBOInfo;
                    if (this.appBO.operationType == "VIEW")
                        this.pageType = this.actPageType = 'VIEW';
                });
            this._store
                .pipe(select(fromCalibArdsOptions.getCalibrationArdsInfo))
                .subscribe(calibrationArds => {
                    this.reviewApp = calibrationArds.isReviewApplicable;
                    var index = this.actions.findIndex(x => x == GridActions.SendForReview)
                    if (index == -1 && (this.pageType == 'MNG' || this.pageType == "UPD"))
                        this.actions.push(GridActions.SendForReview);
                    if (calibrationArds.ardsMode == 'NO' || calibrationArds.ardsMode == 'YES') {
                        var switchIndex = this.actions.findIndex(x => x == GridActions.SwitchSTP)
                        if (switchIndex > -1 && this.headerInfo.analsysMode == 'YES')
                            this.actions.splice(switchIndex, 1)
                    }
                });

        }
        else if (this.entityCode == EntityCodes.oosModule)
            this.reviewApp = true;
    }

    getSampleAnalysisData() {
        if (!CommonMethods.hasValue(this.sourceCode))
            this._service.getAnalysisTestBySioID(this.encEntityActID, this.entityCode);
        else if (this.sourceCode == 'CONT_WISE_ANA' || this.sourceCode == 'OOS_HYPOTEST' || this.sourceCode == 'OOS_TEST') {
            setTimeout(() => {
                this._service.getAnalysisTestBySioID(this.encEntityActID, this.sourceCode);
            }, 300);
        }
        this.showHidePageType = PageTypeSection.ANALYSIS;
    }

    prepareHeaders() {
        this.headersData = [];
        // if (this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation)

        this.headersData.push({ columnDef: "srNum", header: "SR Number", cell: (element: any) => `${element.srNum}` });
        if (this.pageType == 'MNG')
            this.headersData.push({ columnDef: "isSelected", header: "", cell: (element: any) => `${element.isExclude}`, class: this.entityCode == EntityCodes.specValidation || this.entityCode == EntityCodes.calibrationValidation || this.entityCode == EntityCodes.oosModule ? 'hide-chk' : '' });
        this.headersData.push({ columnDef: "testName", header: "Test Name", cell: (element: any) => `${element.testName}` });
        this.headersData.push({ columnDef: "testDesc", header: "Result", cell: (element: any) => `${element.testDesc}` });
        //this.headersData.push({ columnDef: "passOrFail", header: "Pass/Fail", cell: (element: any) => `${element.passOrFail}` });
        this.headersData.push({ columnDef: "specDesc", header: "Specification Limit", cell: (element: any) => `${element.specDesc}` });
        this.headersData.push({ columnDef: "resultAPP", header: "", cell: (element: any) => `${element.isSelected}` });
    }

    onActionClick(evt) {

        if (CommonMethods.hasValue(evt.val.encInvalidationID))
            localStorage.setItem('IS_INVALIDATED', 'TRUE');
        else
            localStorage.removeItem('IS_INVALIDATED');

        this.pageType = evt.val.invalidationID || (CommonMethods.hasValue(evt.val.statusCode) && evt.val.statusCode != "SENT_BACK_REVIEW" && evt.val.statusCode != "QA_REVIEW_COM" && evt.val.statusCode != "QC_REVIEW_COM") ? 'VIEW' : this.actPageType;
        if (!evt.val.canEditTestValues && this.pageType == 'MNG')
            return this._alert.warning(SampleAnalysisMessages.userDontHaveper)
        if (CommonMethods.hasValue(evt.val.ardsMode))
            this.testAnalysisMode = evt.val.ardsMode;
        else
            this.testAnalysisMode = this.analysisMode;
        if ((this.actPageType == 'VIEW' || this.btnType == 'Update') && (evt.action == GridActions.SwitchSTP || evt.action == GridActions.Invalid || (evt.action == GridActions.SendForReview && this.pageType != "UPD")))
            return this._alert.info(LimsRespMessages.viewInfo);

        if (evt.val.passOrFail == 'N')
            return evt.action == GridActions.SendForReview ? this._alert.warning(SampleAnalysisMessages.cantSendReview) : null;

        else if (evt.action == GridActions.SwitchSTP) {
            if (this.entityCode == EntityCodes.specValidation || this.entityCode == EntityCodes.calibrationValidation || this.pageType == "VIEW")
                return;
            const modal = this._matDailog.open(SwitchArdsModeComponent, { width: "600px", height: "250px" });
            modal.disableClose = true;
            modal.componentInstance.presentArdsMode = evt.val.ardsMode;
            var switchObj: SwitchArds = new SwitchArds();
            switchObj.ardsExecID = evt.val.samAnaTestID;
            switchObj.testInitTime = evt.val.testInitTime;
            switchObj.entityCode = this.entityCode;
            if (!CommonMethods.hasValue(this.sourceCode))
                switchObj.sourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
            else
                switchObj.sourceCode = this.sourceCode;
            modal.componentInstance.switchObj = switchObj;

            modal.afterClosed().subscribe(resp => {
                this.getSampleAnalysisData();
            })
        }
        else if (evt.action == "MNG_OCC")
            this.openOccupancy(evt.val);

        else if (evt.action == GridActions.Method_Res) {
            if (CommonMethods.hasValue(evt.val.templateID) && (!CommonMethods.hasValue(evt.val.ardsMode) || evt.val.ardsMode == 'ONLINE' || evt.val.ardsMode == 'OFFLINE') && !CommonMethods.hasValue(evt.val.rawdataConfOn) && evt.val.rowTypeCode == 'TEST')
                return this._alert.warning(SampleAnalysisMessages.subEards);
            var data = this.analysisTests.filter(x => x.testCategoryID == evt.val.testCategoryID && x.oosTestUID == evt.val.oosTestUID && x.rowTypeCode == 'Group' && x.passOrFail != 'N' && CommonMethods.hasValue(x.templateID) && (!CommonMethods.hasValue(x.ardsMode) || x.ardsMode == 'ONLINE' || x.ardsMode == 'OFFLINE') && !CommonMethods.hasValue(x.rawdataConfOn) && ((CommonMethods.hasValue(x.testSubCatID) && x.testSubCatID == evt.val.testSubCatID) || !CommonMethods.hasValue(x.testSubCatID)))
            if (CommonMethods.hasValue(data) && data.length > 0)
                return this._alert.warning(SampleAnalysisMessages.grpEards);
            const modal = this._matDailog.open(methodResultsComponent, { width: '80%' });
            modal.disableClose = true;
            modal.componentInstance.encSampleAnaTestID = evt.val.samAnaTestID;
            // this.pageType = evt.val.invalidationID ? 'VIEW' : this.pageType
            modal.componentInstance.mode = (this.pageType != 'MNG') ? this.pageType : this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MNG';
            modal.componentInstance.entityCode = this.entityCode;
            modal.componentInstance.sourceCode = this.sourceCode;
            modal.componentInstance.encEntityActID = this.encEntityActID;

            modal.afterClosed().subscribe(res => {
                if (res.isChange) {
                    var index = this.analysisTests.findIndex(x => x.samAnaTestID == evt.val.samAnaTestID);
                    this.analysisTests[index].isSelected = res.isApplicable;
                    this.analysisTests[index].testDesc = res.result;
                    this.analysisTests[index].passOrFail = res.passOrFail;
                    this.analysisStatus = res.analysisStatus;
                    this.analysisTests[index].hasOOS = res.isOOS;
                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
                }
                this.getAnalysisStatus();
            })
        }
        else if (evt.action == GridActions.upload) {
            var mode: string = "";
            if (CommonMethods.hasValue(evt.val.updTestStatus) && evt.val.updTestStatus == "APP")
                mode = "MANAGE"
            this.Uploadfiles('TSTDOCS', evt.val.samAnaTestID, mode);
        }

        else if (evt.action == GridActions.RRT) {
            // if (this.sourceCode == 'CONT_WISE_ANA')
            //     return
            const DAI_MODEL = this._matDailog.open(ManageRRTValuesComponent, CommonMethods.modalFullWidth);

            var obj: ManageTestSampleRRTValuesBO = new ManageTestSampleRRTValuesBO();
            obj.encSamTestID = evt.val.samAnaTestID;
            obj.initTime = evt.val.testInitTime;
            DAI_MODEL.componentInstance.manageRRTValuesBO = obj;
            DAI_MODEL.componentInstance.mode = this.pageType != 'MNG' ? this.pageType : this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MNG';
            DAI_MODEL.afterClosed().subscribe();
        }
        else if (evt.action == GridActions.RAW) {

            if (!CommonMethods.hasValue(evt.val.templateID) || evt.val.ardsMode == 'NO')
                return this._alert.warning(this.entityCode != EntityCodes.calibrationArds && this.entityCode != EntityCodes.calibrationValidation ? SampleAnalysisMessages.eardsNotApp : SampleAnalysisMessages.eardsNotAppPram);

            this.encSamAnalysisTestID = evt.val.samAnaTestID;
            this.samAnaTestID = evt.val.samAnaTestID;
            this.updTestStatus = evt.val.updTestStatus;
            var analyisBo: GetCurrentAnalysisBO = new GetCurrentAnalysisBO();
            analyisBo.currentSamAnaTestID = this.encSamAnalysisTestID;
            if (this.entityCode == EntityCodes.sampleAnalysis) {
                analyisBo.arID = this.headerInfo.arID;
                analyisBo.arNumber = this.headerInfo.arNumber;
            }
            else {
                analyisBo.arID = this.appBO.transKey;
                analyisBo.arNumber = this.appBO.referenceNumber;
            }
            analyisBo.samAnaTestID = this.encSamAnalysisTestID;
            analyisBo.testName = evt.val.testName;

            this._store.dispatch(new analysisActions.UpdateMappingCurrentAnalysisInfo(analyisBo));
            this.pageType = evt.val.showSpecTestID ? this.actPageType : this.pageType;
            if (CommonMethods.hasValue(evt.val.statusCode) && evt.val.statusCode != "SENT_BACK_REVIEW" && evt.val.statusCode != "QA_REVIEW_COM" && evt.val.statusCode != "QC_REVIEW_COM")
                this.pageType = "VIEW";
            this.openRaw()
        }
        else if (evt.action == GridActions.Invalid) {
            if (!CommonMethods.hasValue(evt.val.hasOccSubmitted) || this.pageType == 'VIEW' || this.btnType == ButtonActions.btnUpdate)
                return;
            if (CommonMethods.hasValue(evt.val.hasOOS))
                return this._alert.warning(SampleAnalysisMessages.oosRaised)
            this.Invalidate(evt.val);
        }
        else if (evt.action == GridActions.Calib_Report) {
            var rptObj: ArdsReportBO = new ArdsReportBO();
            rptObj.ardsExecID = evt.val.samAnaTestID;
            rptObj.entityCode = this.entityCode;
            rptObj.dmsReportID = evt.val.dmsReportID;
            rptObj.refNumber = this.headerInfo.arNumber;

            const modal = this._matDailog.open(AnalysisReportComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.rptObj = rptObj;
            modal.componentInstance.mode = this.pageType == 'MNG' ? 'MANAGE' : this.pageType;

            // modal.componentInstance.documentID = 0;
            // modal.componentInstance.entityActID = evt.val.samAnaTestID;



            // if (!CommonMethods.hasValue(evt.val.templateID))
            //     return this._alert.warning(this.entityCode != EntityCodes.calibrationArds && this.entityCode != EntityCodes.calibrationValidation ? SampleAnalysisMessages.eardsNotApp : SampleAnalysisMessages.eardsNotAppPram);
            // var rptObj: any = { ardsExecID: evt.val.samAnaTestID, entityCode: this.entityCode };
            // this._service.getCalibrationReportDetails(rptObj);
        }
        else if (evt.action == GridActions.SendForReview) {
            if (CommonMethods.hasValue(evt.val.passOrFail) && evt.val.passOrFail == 'N')
                return this._alert.warning(SampleAnalysisMessages.cantSendReview)
            if (!CommonMethods.hasValue(evt.val.hasOccSubmitted) || this.pageType == 'VIEW' || (this.btnType == ButtonActions.btnUpdate && this.pageType != "UPD"))
                return;
            // if (!CommonMethods.hasValue(evt.val.passOrFail) && evt.val.rowTypeCode == 'TEST')
            //     return this._alert.warning(SampleAnalysisMessages.submitResult)
            if (CommonMethods.hasValue(evt.val.encInvalidationID))
                return this._alert.warning(this.entityCode == EntityCodes.sampleAnalysis || this.entityCode == EntityCodes.oosModule ? SampleAnalysisMessages.invalidRaiesd : SampleAnalysisMessages.invalidRaiesdParam);

            var sendObj: SendForReview = new SendForReview();
            sendObj.entityCode = this.entityCode;
            if (this.sourceCode != "CONT_WISE_ANA") {
                this._confirService.confirm(SampleAnalysisMessages.cnfmSendForReview).subscribe(re => {
                    if (re) {
                        this.samAnaTestID = sendObj.ardsExecID = evt.val.samAnaTestID;
                        sendObj.testInitTime = evt.val.testInitTime;
                        this._service.sendTestForReview(sendObj);
                    }
                })
            }
            else if (this.sourceCode == "CONT_WISE_ANA") {
                const modal = this._matDailog.open(ContainerwiseTestSendForReview, { width: '800px' });
                modal.disableClose = true;
                modal.componentInstance.encSioID = this.encSioID;
                modal.componentInstance.specCatID = evt.val.specCatID;
                modal.componentInstance.testName = evt.val.testName;
                modal.afterClosed().subscribe(resp => {
                    if (CommonMethods.hasValue(resp) && resp.length > 0) {
                        this.sendReviewLst = [];
                        resp.forEach(x => {
                            var item: IncludeExcludeTestBO = new IncludeExcludeTestBO();
                            item.id = x.ardsExecID;
                            item.testInitTime = x.testInitTime;
                            this.sendReviewLst.push(item);
                        })
                        sendObj.lst = this.sendReviewLst;
                        this._service.sendTestForReview(sendObj);
                    }
                })
            }
        }
        else if (evt.action == GridActions.DataReview_Report) {
            let obj = new ReportBO();

            if (CommonMethods.hasValue(evt.val.dataReviewID))
                obj.entActID = evt.val.dataReviewID;
            else return this._alert.warning("Report not generated");
            //if (CommonMethods.hasValue(versionCode))
            obj.versionCode = evt.val.drVersionCode;
            obj.ardsExecID = evt.val.samAnaTestID;
            obj.reportType = 'RPT';

            const modalRef = this._matDailog.open(ReportView, CommonMethods.modalFullWidth);
            modalRef.componentInstance.rpt = obj;
        }
        else if (evt.action == GridActions.AnalyticalData_Report) {
            let obj = new ReportBO();

            if (CommonMethods.hasValue(evt.val.analyticalDataReviewID))
                obj.entActID = evt.val.analyticalDataReviewID;
            else return this._alert.warning("Report not generated");
            //if (CommonMethods.hasValue(versionCode))
            obj.versionCode = evt.val.adrVersionCode;
            obj.reportType = 'RPT';

            const modalRef = this._matDailog.open(ReportView, CommonMethods.modalFullWidth);
            modalRef.componentInstance.rpt = obj;
        }
    }


    Invalidate(val: any) {
        if ((!CommonMethods.hasValue(this.reviewedBy) && !CommonMethods.hasValue(this.headerInfo.reviewedBy)) && this.entityCode == EntityCodes.sampleAnalysis)
            return this._alert.warning(SampleAnalysisMessages.ComSampling);
        var obj: InvalidateBO = new InvalidateBO();
        this.samAnaTestID = val.samAnaTestID;
        obj.encSolutionID = val.samAnaTestID;
        obj.stdType = this.entityCode == EntityCodes.sampleAnalysis ? 'INVAL_SAMANA' : this.entityCode == EntityCodes.oosModule ? 'INVAL_OOS' : 'INVAL_CALIB';
        obj.initTime = val.testInitTime;

        this._confirService.confirm(VolumetricSolMessages.confirmStndInvalidate).subscribe((confirmed) => {
            if (confirmed)
                this._service.invalidateTest(obj);

        })


    }

    Uploadfiles(type: string, entityActID: any = "", mode: string = "") {
        if (!CommonMethods.hasValue(entityActID))
            entityActID = this.encEntityActID
        if (type == EntityCodes.sampleAnalysis && CommonMethods.hasValue(this.sourceCode))
            type = this.sourceCode;
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, type, entityActID, [], 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.mode = CommonMethods.hasValue(mode) ? mode : this.pageType != 'MNG' ? this.pageType : this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE';
        if (this.remarksBtn == 'Save Remarks')
            modal.componentInstance.mode = "MANAGE";
        modal.afterClosed().subscribe(res => {
            if (type == 'TSTDOCS') {
                var obj = this.analysisTests.filter(x => x.samAnaTestID == entityActID);
                obj[0].hasDocuments = res;
                this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.analysisTests));
            }
        })
    }

    openOccupancy(item: any) {
        // var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        // obj.occupancyCode = 'Eqp_Sam_Ana';
        // obj.encEntityActID = item.samAnaTestID;
        // obj.occSource = 'SAMPLE_ANA_TEST';

        var obj: ManageAnalysisOccupancyBO = new ManageAnalysisOccupancyBO();
        obj.encSamAnalTestID = item.samAnaTestID;
        obj.occupancyReq = "Y";
        obj.testInitTime = item.testInitTime;
        obj.entityCode = this.entityCode;
        obj.encEnityActID = this.appBO.encTranKey;
        obj.refNo = this.appBO.referenceNumber;
        obj.isRefOcc = false;
        const modal = this._matDailog.open(AnalysisOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.manageOccuBO = obj;
        // this.pageType = item.invalidationID ? 'VIEW' : this.pageType;
        modal.componentInstance.encEntActID = this.encEntityActID;

        modal.componentInstance.mode = (this.pageType != 'MNG') ? this.pageType : this.btnType == ButtonActions.btnUpdate || (CommonMethods.hasValue(item.statusCode) && item.statusCode != 'QA_REVIEW_COM' && item.statusCode != 'QC_REVIEW_COM' && item.statusCode != "SENT_BACK_REVIEW") ? 'VIEW' : 'MNG';
        modal.componentInstance.isPrimaryInstAdded = item.hasOccSubmitted;
        if (item.rowType == 'TEST')
            modal.componentInstance.resultSubmitted = CommonMethods.hasValue(item.passOrFail);
        else {
            this._store
                .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                .subscribe(testInfo => {
                    var obj = testInfo.filter(x => x.testCategoryID == item.testCategoryID && x.oosTestUID == item.oosTestUID && CommonMethods.hasValue(x.passOrFail));
                    modal.componentInstance.resultSubmitted = (CommonMethods.hasValue(obj) && obj.length > 0);
                });
        }

        // modal.componentInstance.pageType = (this.btnType == 'Save') ? 'MNG' : 'VIEW';
        // modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
        // modal.componentInstance.entityCode = EntityCodes.sampleAnalysis;
        modal.afterClosed().subscribe(res => {

            if (item.rowType == 'TEST') {
                item.hasOccSubmitted = res.primaryOccAdded;
                item.showSpecTestID = res.occAdded;
                item.userArdsExecID = (item.showSpecTestID && item.ardsMode == 'ONLINE') ? item.samAnaTestID : null;
            }
            else {
                this._store
                    .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                    .subscribe(testInfo => {
                        var obj = testInfo.filter(x => x.testCategoryID == item.testCategoryID && x.oosTestUID == item.oosTestUID);
                        if (obj.length > 0) {
                            obj.forEach((val) => {
                                val.hasOccSubmitted = res.primaryOccAdded;
                            })
                            item.showSpecTestID = res.occAdded;
                            item.userArdsExecID = (item.showSpecTestID && item.ardsMode == 'ONLINE') ? item.samAnaTestID : null;
                            this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(testInfo));
                        }

                    });
            }

        });
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        setTimeout(() => {
            this.appBO.showConfirmBtn = !val && CommonMethods.hasValue(this.analysisTests) && this.analysisTests.length > 0 ? true : false;
            this._store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));

        }, 300);
        this.isEnableCheckbox = !val;
    }

    additionalTest() {
        const modal = this._matDailog.open(ManageAdditionalTestComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encSamAnaID = this.headerInfo.encSamAnaID;
        modal.componentInstance.entityCode = this.entityCode;
        modal.componentInstance.pageType = this.pageType != 'MNG' ? this.pageType : this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MNG';

    }

    saveAnalysis() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);
        var obj: analysisRemarks = new analysisRemarks();
        this.getAnalysisStatus();
        if (this.sourceCode != 'CONT_WISE_ANA')
            obj.encSioID = this.encEntityActID;
        else {
            obj.containerAnaID = this.encEntityActID;
            obj.encSioID = this.encSioID;
        }
        if (this.entityCode == EntityCodes.sampleAnalysis && this.sourceCode != 'CONT_WISE_ANA')
            obj.analysisStatus = this.analysisStatus;
        obj.remarks = this.remarks;
        obj.initTime = this.appBO.initTime;
        obj.specPrecautions = this.specPrecautions;
        obj.entityCode = this.entityCode;
        obj.sourceCode = this.sourceCode;
        if (CommonMethods.hasValue(this.headerInfo) && CommonMethods.hasValue(this.headerInfo.arNumber))
            obj.referenceNumber = this.headerInfo.arNumber;
        else
            obj.referenceNumber = this.appBO.referenceNumber;
        this.isLoaderObj.isLoaderStart = true;
        this._service.saveAnalysis(obj);
    }

    validation() {
        if ((!CommonMethods.hasValue(this.reviewedBy) && !CommonMethods.hasValue(this.headerInfo.reviewedBy)) && this.entityCode == EntityCodes.sampleAnalysis)
            return SampleAnalysisMessages.ComSampling;
        if (this.entityCode == EntityCodes.sampleAnalysis && this.sourceCode != 'CONT_WISE_ANA' && !CommonMethods.hasValue(this.containerAnaApp))
            return SampleAnalysisMessages.completeContainer;
        if (!CommonMethods.hasValue(this.disStatus) && !CommonMethods.hasValue(this.analysisStatus))
            return SampleAnalysisMessages.status;
        if (!CommonMethods.hasValue(this.remarks))
            return this.entityCode != EntityCodes.oosModule ? SampleAnalysisMessages.analysisRemarks : SampleAnalysisMessages.justification;
        if ((this.headerInfo.analysisTypeCode == 'SPC_WORK' || this.headerInfo.analysisTypeCode == 'SPEC_REFSTD') && !CommonMethods.hasValue(this.specPrecautions))
            return SampleAnalysisMessages.specPrecaution;
    }

    updateRemarks() {
        if (CommonMethods.hasValue(this.headerInfo.updRemarksStatus) && this.headerInfo.updRemarksStatus != 'APP')
            return this._alert.error(SampleAnalysisMessages.pendingSpec);

        if (!CommonMethods.hasValue(this.headerInfo.updRemarksStatus))
            this.raiseDeviation(DCActionCode.SAMANA_UPDREMARKS)
        else {
            if (this.remarksBtn == "Update Remarks") {
                this.remarksBtn = "Save Remarks";
                this.btnUpload = ButtonActions.btnUpload;
                this.disableRemarks = false;
            }
            else {
                var obj: updFinalRemarks = new updFinalRemarks();
                obj.initTime = this.appBO.initTime;
                obj.encSamAnaID = this.headerInfo.encSamAnaID;
                obj.Remarks = this.remarks;
                obj.entityCode = this.entityCode;
                this.isLoaderObj.isLoaderFinalRemarks = true;
                this._service.updateFinalRemarks(obj);
            }
        }
    }

    raiseDeviation(dcActionCode: string) {
        const dialogRef = this._matDailog.open(DeviationHandler, { width: '80%' });
        dialogRef.disableClose = true;
        dialogRef.componentInstance.entityCode = this.entityCode;
        dialogRef.componentInstance.dcActionCode = dcActionCode;

        dialogRef.afterClosed().subscribe(result => {
            if (result != null && result.CanRiceDeviation) {
                var obj: deviation = new deviation();
                obj.encEntityActID = this.encEntityActID;
                obj.entityCode = this.entityCode;
                obj.dcActionCode = dcActionCode;
                obj.remarks = result.comments;
                obj.devType = result.DeviationType;
                obj.refCode = this.entityCode == EntityCodes.sampleAnalysis ? this.headerInfo.arNumber : this.appBO.referenceNumber;
                obj.initTime = this.appBO.initTime;
                obj.lst = result.lst;
                this.isLoaderObj.isLoaderStartSpecReset = true;
                this._service.raiseDeviation(obj);
            }
        });
    }

    hideRawDataEmit(evt: any) {
        // this.showRawData = evt;
        // this.showHidePageType = evt.val;

        if (this.showHidePageType == PageTypeSection.ANALYSIS) {
            this.encSamAnalysisTestID = "";
            this.updTestStatus = "";
            this.samAnaTestID = null;
            this.headerInfo.headerType = 'ANA_TYPE';
            this.getSampleAnalysisData();
            this._store.dispatch(new analysisActions.UpdateAnalysisInfo(this.headerInfo));
            this.emitArdsExecID.emit(this.encSamAnalysisTestID);
        }

    }

    openRaw() {
        this.emitArdsExecID.emit(this.encSamAnalysisTestID);

        this.headerInfo.headerType = 'STP_TYPE';
        this._store.dispatch(new analysisActions.UpdateAnalysisInfo(this.headerInfo));
        // this.showRawData = !this.showRawData;
        this.showHidePageType = PageTypeSection.ARDS;
        this._store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
    }


    // changeBgColor(type: string) {
    //     var docID = document.getElementById('bg_complaints');

    //     if (CommonMethods.hasValue(docID) && type == 'CLEAR')
    //         docID.className = '';
    //     else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
    //         docID.className = 'blue-light';
    // }


    includeExcludeTest() {

        var obj = this.getSelectedExcludeInclude();

        var retVal: string;

        for (let index = 0; index < obj.length; index++) {
            var item = this.analysisTests.filter(x => x.testCategoryID == obj[index].testCategoryID && x.rowTypeCode == 'Group' && x.passOrFail != 'N' && ((CommonMethods.hasValue(x.testSubCatID) && x.testSubCatID == obj[index].testSubCatID) || !CommonMethods.hasValue(x.testSubCatID)))
            if ((obj[index].hasOOS || (item.length > 0 && item[0].hasOOS && obj[index].passOrFail == 'F')) && !CommonMethods.hasValue(retVal)) {
                retVal = SampleAnalysisMessages.testResultTo;
                break;
            }
            else if (CommonMethods.hasValue(obj[index].isInvalidationRaised) && !CommonMethods.hasValue(retVal)) {
                retVal = SampleAnalysisMessages.canExclude;
                break;
            }
            // var data = this.analysisTests.filter(x => x.testCategoryID == obj[index].testCategoryID && x.rowType == 'CAT' && CommonMethods.hasValue(x.rawdataUpdOn))
            // if (CommonMethods.hasValue(data) && data.length > 0 && !CommonMethods.hasValue(retVal)) {
            //     retVal = SampleAnalysisMessages.rawExec;
            //     break;
            // }
        }
        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        if (obj.length > 0) {

            this.includeExcludeBO.list = new IncludeExcludeTestBOList();

            obj.forEach((item) => {
                var testIncludeBO: IncludeExcludeTestBO = new IncludeExcludeTestBO();
                testIncludeBO.id = item.samAnaTestID;
                testIncludeBO.testInitTime = item.testInitTime;
                this.includeExcludeBO.list.push(testIncludeBO);
            })
        }
        else
            return this._alert.warning(SampleAnalysisMessages.atLeastOneTest);

        if (this.analysisTests.length == 1 || CommonMethods.hasValue(this.isExcludeAllTests()))
            return this._alert.warning(SampleAnalysisMessages.cantExcledAll);

        this.actionButtonDisabled = true;
        this.includeExcludeBO.entityCode = this.entityCode;
        this.includeExcludeBO.sourceCode = this.sourceCode;
        this.isLoaderObj.isLoaderStartInclExclTest = true;
        this._service.manageIncludeExcludeTest(this.includeExcludeBO);
    }

    getSelectedExcludeInclude() {
        return this.analysisTests.filter(x => CommonMethods.hasValue(x.isExclude) && x.isExclude);
    }

    isExcludeAllTests() {
        var selectedLst: any = this.getSelectedExcludeInclude().filter(x => (x.rowTypeCode == 'Group' || x.rowTypeCode == 'TEST'));
        var notExcluLst: any = this.analysisTests.filter(x => (x.rowTypeCode == 'Group' || x.rowTypeCode == 'TEST') && x.passOrFail != 'N');
        if (selectedLst.filter(x => x.passOrFail != 'N').length == notExcluLst.length && selectedLst.filter(x => x.passOrFail != 'N').length == selectedLst.length)
            return SampleAnalysisMessages.cantExcledAll;
    }


    gridResetActions() {
        localStorage.setItem("GRID_RESET_ACTIONS", 'TRUE')
    }

    getAnalysisStatus() {
        if (this.entityCode == EntityCodes.sampleAnalysis && this.sourceCode != 'CONT_WISE_ANA' && this.containerAnaApp && this.containerWiseAnalysisApp == 'Yes' && CommonMethods.hasValue(this.analysisTests) && this.analysisTests.length > 0) {
            var obj = this.analysisTests.filter(x => x.passOrFail == 'F')
            if (obj.length == 0 && this.containerAnaStatus == 'REJ') {
                this.analysisStatus = this.analysisStatus;
                this.disStatus = false;
            }
            else if (obj.length > 0 && CommonMethods.hasValue(this.remarks)) {
                this.analysisStatus = "Rejected";
                this.disStatus = true;
            }
            else if (CommonMethods.hasValue(this.remarks)) {
                this.analysisStatus = 'Approved';
                this.disStatus = true;
            }
        }
        else
            this.analysisStatus = this.analysisStatus
    }

    saveChecklist() {
        const modal = this._matDailog.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.encEntityActID;
        modal.componentInstance.categoryCode = "COMPRE_RAW_CHKLIST";
        modal.componentInstance.type = this.btnType == ButtonActions.btnSave ? 'MANAGE' : 'VIEW';
        modal.componentInstance.overAllRemarksMandatory = true;
        modal.componentInstance.remarksMandatory = true;
        modal.componentInstance.remarks = this.compreRemarks;
        modal.componentInstance.entityCode = this.entityCode;
        modal.afterClosed().subscribe(resp => {
            if (CommonMethods.hasValue(resp))
                this.compreRemarks = resp
        })
    }

    close() {
        this.closeAnalysis.emit(true);
    }

    ngOnDestroy() {
        //this.changeBgColor('CLEAR');
        this.subscription.unsubscribe();
        localStorage.removeItem('DESIGN_COL');
    }

}