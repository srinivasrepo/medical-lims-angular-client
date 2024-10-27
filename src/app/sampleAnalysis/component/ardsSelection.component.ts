import { Component, OnDestroy, AfterContentInit, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Categories, GridActions, ButtonActions, ActionMessages, EntityCodes, LookupCodes, DCActionCode, CapabilityActions, PageUrls } from 'src/app/common/services/utilities/constants';
import { GetARDSSelectionsBO, ManageArdsBO, DiscardPrintRequestBO, ContainerArdsBO, extraneousTests, GetArdsPrintDoc, AnalysisHeaderBO, deviation } from '../model/sampleAnalysisModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { AppBO, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog } from '@angular/material';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromCalibArdsOptions from '../../calibrationArds/state/calibrationArds/calibrationArds.reducer';
import * as calibArdsActions from '../../calibrationArds/state/calibrationArds/calibrationArds.action';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField, GridActionFilterBOList } from 'src/app/limsHelpers/entity/limsGrid';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { ReportView } from 'src/app/common/component/reportView.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { DeviationHandler } from "src/app/common/component/deviationHandler.component";
import { Router } from "@angular/router";
@Component({
    selector: 'app-analysis-ards',
    templateUrl: '../html/ardsSelection.html'
})
export class ARDSSelectionComponent implements AfterContentInit, OnDestroy {

    @Input() encEntityActID: string;
    @Input() pageType: string = 'MNG';
    @Input() entityCode: string;
    @Output() updStatus: EventEmitter<any> = new EventEmitter();
    appBO: AppBO = new AppBO();
    disabledBtn: boolean = false;
    btnType: string = ButtonActions.btnSave;
    ardsBO: GetARDSSelectionsBO = new GetARDSSelectionsBO();
    manageArdsBO: ManageArdsBO = new ManageArdsBO();
    contArdsBO: ContainerArdsBO = new ContainerArdsBO();
    containerBO: GetARDSSelectionsBO = new GetARDSSelectionsBO();
    testInfo: LookupInfo;
    @ViewChild('specTests', { static: false }) specTests: LookupComponent;
    containerWiseAnalysisApp: string = 'No';
    packList: any;
    hide: boolean = false;
    lkpTestInfo: LookupInfo;
    stpInfo: LookupInfo;
    @ViewChild('tests', { static: false }) tests: LookupComponent;
    @ViewChild('stpLkp', { static: false }) stpLkp: LookupComponent;
    subscription: Subscription = new Subscription();
    actions: any = [GridActions.edit, GridActions.delete];
    headersData: any;
    testDataSource: any = [];
    extraneousID: number = -1;
    exBtnType: string = ButtonActions.btnAdd;
    specificationName: string;
    analyTestDataSource: any;
    analyheader: any;
    isDisplay: boolean = true;
    usrActions: GridActionFilterBOList = new GridActionFilterBOList();
    conUsrActions: GridActionFilterBOList = new GridActionFilterBOList();
    specDisable: boolean = false;
    isLoaderStart: boolean;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    isResetAction: boolean = false;
    isLoaderStartSpecReset: boolean = false;
    constructor(private _service: SampleAnalysisService, private _alert: AlertService, private _route: Router,
        public _global: GlobalButtonIconsService, private _matDailog: MatDialog, private _confirmService: ConfirmationService,
        private store: Store<fromAnalysisOptions.AnalysisState>, private _limsContext: LIMSContextServices
    ) { }

    ngAfterContentInit() {

        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getSpecificationsBySIOID")
                this.ardsBO.specifications = resp.result;
            else if (resp.purpose == Categories.specificationApplicableCode)
                this.ardsBO.specArdsApplicable = resp.result;
            else if (resp.purpose == "getAssignedDocsBySpecID") {
                if (resp.type == 'MAIN')
                    this.ardsBO.printReq = resp.result;
                else
                    this.containerBO.printReq = resp.result;
            }
            else if (resp.purpose == "ardsGetAssignedDocs") {
                if (resp.type != 'CONT_WISE_ANA') {
                    this.ardsBO.printHis = resp.result;
                    this.usrActions = new GridActionFilterBOList();
                }
                else {
                    this.containerBO.printHis = resp.result;
                    this.conUsrActions = new GridActionFilterBOList();
                }
            }
            else if (resp.purpose == "ardsManageRequest") {
                this.disabledBtn = this.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.ardsAnalysisSuccess);
                    this.enableHeaders(false);
                    this.appBO.initTime = resp.result.initTime;
                    this.updStatus.emit(resp.result.status);
                    this.actions = [];
                    this.isDisplay = false;
                    this.analyTestDataSource = null;
                    var obj = this.ardsBO.specifications.filter(x => x.specID == this.manageArdsBO.specID);
                    this.manageArdsBO.specNumber = obj[0].displayName;
                    var modeObj = this.ardsBO.specArdsApplicable.filter(x => x.catItemCode == this.manageArdsBO.analysisMode)
                    this.manageArdsBO.analysis = modeObj[0].catItem;
                    if (this.entityCode == EntityCodes.sampleAnalysis) {
                        this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                        this._service.getSamplingInfo(this.encEntityActID);
                    }
                    else if (this.entityCode = EntityCodes.calibrationArds)
                        this.store.dispatch(new calibArdsActions.UpdateCalibrationArdsAppInfo(this.appBO));

                    this.store.dispatch(new analysisActions.GetAnalysisInfo(this.encEntityActID));
                    sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                    this._service.getAnalysisTestBySioID(this.encEntityActID, this.entityCode); // get test samples
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "ardsSelectionPrint") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.respDocRequest);
                    this.appBO.initTime = resp.result.initTime;
                    this.ardsAssignedDocs();
                    this.changeSpecification();
                    if (this.isDisplay) {
                        this.isDisplay = false;
                        this.analyTestDataSource = null;
                        var obj = this.ardsBO.specifications.filter(x => x.specID == this.manageArdsBO.specID);
                        this.manageArdsBO.specNumber = obj[0].displayName;
                        var modeObj = this.ardsBO.specArdsApplicable.filter(x => x.catItemCode == this.manageArdsBO.analysisMode)
                        this.manageArdsBO.analysis = modeObj[0].catItem;
                        if (this.entityCode == EntityCodes.sampleAnalysis) {
                            this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                            this._service.getSamplingInfo(this.encEntityActID);
                        }
                        else if (this.entityCode = EntityCodes.calibrationArds)
                            this.store.dispatch(new calibArdsActions.UpdateCalibrationArdsAppInfo(this.appBO));

                        this._service.getAnalysisTestBySioID(this.encEntityActID, this.entityCode);
                    }
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == 'containerARDSSelectionPrint') {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.respDocRequest);
                    this.appBO.initTime = resp.result.initTime;
                    this.ardsAssignedDocs();
                    this.changeContainerSpecification();
                    this._service.getContainerWiseAnalysis(this.encEntityActID);

                    this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "ardsDiscardPrintRequest") {
                if (resp.result == "OK") {
                    this._alert.success(SampleAnalysisMessages.discrdSuccess);
                    this.ardsAssignedDocs();
                    this.changeSpecification();
                    this.changeContainerSpecification();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getSamplingInfo") {
                this.containerWiseAnalysisApp = resp.result.containerAnalysisApplicable;
                if (this.containerWiseAnalysisApp != 'App')
                    this.manageArdsBO.containerWiseAnalysisApp = this.containerWiseAnalysisApp;
                if (this.containerWiseAnalysisApp == 'Yes' || this.containerWiseAnalysisApp == 'App')
                    this._service.getContainerWiseAnalysis(this.encEntityActID);
            }
            else if (resp.purpose == "getContainerWiseAnalysis") {
                this.contArdsBO.specID = resp.result.specID;
                this.contArdsBO.ardsMode = resp.result.analysisMode;
                this.contArdsBO.type = resp.result.typeOfAnalysis;
                this.contArdsBO.testID = resp.result.specCatID;
                this.contArdsBO.testName = resp.result.testName;
                this.contArdsBO.specification = resp.result.specification;
                this.contArdsBO.analysisType = resp.result.analysisType;
                this.packList = resp.result.packList;
                if (CommonMethods.hasValue(this.contArdsBO.ardsMode)) {
                    this.hide = true;
                    this.manageArdsBO.containerWiseAnalysisApp = 'Yes';
                }
                if (this.isContainerAnalysisMode()) {
                    var printObj = this.getArdsPrintBo(this.contArdsBO.specID, 'CONTAINER');
                    this._service.getAssignedDocsBySpecID(printObj);
                }
            }
            else if (resp.purpose == 'saveContainerArdsDetails') {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.succCon);
                    this.appBO.initTime = resp.result.initTime;
                    this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                    this._service.getContainerWiseAnalysis(this.encEntityActID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getTestByID") {
                this.enableHeaders(false);
                this.prepareTestheader();
                this.analyTestDataSource = CommonMethods.bindMaterialGridData(resp.result);
            }
            else if (resp.purpose == "viewARDSMasterDocument" || resp.purpose == "viewARDSPrintDocument") {
                const modal = this._matDailog.open(ReportView, CommonMethods.modalFullWidth);
                modal.componentInstance.setAuditReportUrl = resp.result;
            }
            else if (resp.purpose == DCActionCode.ARDS_REPRINT) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset);
                    this.ardsAssignedDocs();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == DCActionCode.SAMANA_RESET) {
                this.isLoaderStartSpecReset = false;
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    if (this.headerInfo.statusCode != 'APP')
                        this._route.navigateByUrl(PageUrls.homeUrl);
                    else this._route.navigateByUrl('/lims/sampleAnalysis')
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        this._service.getCatItemsByCatCode(Categories.specificationApplicableCode);

        if (CommonMethods.hasValue(this.encEntityActID)) {
            this._service.getSpecificationsBySIOID(this.encEntityActID, this.entityCode);
            this.ardsAssignedDocs();
        }
        this.testLkp();
        if (this.pageType == 'VIEW') {
            this.actions = [];
            sessionStorage.setItem("REFERESH_ACTIONS", 'true');
        }
        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(this.entityCode);
        var obj = capActions.actionList.filter(x => x == 'RESET');
        this.isResetAction = (obj.length > 0);
    }


    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysisInfo => {
                this.headerInfo = analysisInfo;
            });
        if (this.entityCode == EntityCodes.sampleAnalysis) {
            this.specificationName = "Specification"
            this.store
                .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
                .subscribe(appBOInfo => {
                    this.appBO = appBOInfo;
                });

            this.store
                .pipe(select(fromAnalysisOptions.getAnalysisInfo))
                .subscribe(analysis => {
                    this.manageArdsBO.specID = analysis.specID;
                    this.manageArdsBO.analysisMode = analysis.analsysMode;
                    this.manageArdsBO.analysis = analysis.analysis;
                    this.manageArdsBO.specNumber = analysis.displaySpec;
                    this.manageArdsBO.extraneousAnalysis = analysis.extraneousMatterApplicable;
                    if (CommonMethods.hasValue(this.manageArdsBO.specID))
                        this.specDisable = true;
                    else this.specDisable = false;
                    if (this.isAnalysisMode()) {
                        var obj = this.getArdsPrintBo(this.manageArdsBO.specID, 'MAIN');
                        this._service.getAssignedDocsBySpecID(obj);
                    }

                    if (CommonMethods.hasValue(this.manageArdsBO.analysisMode)) {
                        this.enableHeaders(false);
                        this.isDisplay = false;
                    }
                    this.prepareHeadersData();
                });
            this.store
                .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                .subscribe(testList => {
                    if (testList.length > 0) {
                        this.testDataSource = [];
                        var obj = testList.filter(x => CommonMethods.hasValue(x.testID));
                        if (obj.length > 0) {
                            obj.forEach(x => {
                                var item: extraneousTests = new extraneousTests();
                                item.testTitle = x.testName;
                                item.template = x.template;
                                this.testDataSource.push(item)
                            })
                            this.actions = [];
                        }
                    }
                    else this.testDataSource = [];
                    this.testDataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.testDataSource));
                });
        }
        else if (this.entityCode == EntityCodes.calibrationArds) {
            this.specificationName = "Calibration Parameter Set"
            this.store
                .pipe(select(fromCalibArdsOptions.getCalibrationArdsAppInfo))
                .subscribe(appBOInfo => {
                    this.appBO = appBOInfo;
                });
            this.store
                .pipe(select(fromCalibArdsOptions.getCalibrationArdsInfo))
                .subscribe(calibArds => {
                    this.manageArdsBO.specID = calibArds.calibPramID;
                    this.manageArdsBO.analysisMode = calibArds.ardsMode;
                    this.manageArdsBO.analysis = calibArds.analysis;
                    this.manageArdsBO.specNumber = calibArds.specNumber;

                    if (this.isAnalysisMode()) {
                        var obj = this.getArdsPrintBo(this.manageArdsBO.specID, 'MAIN');
                        this._service.getAssignedDocsBySpecID(obj);
                    }

                    if (CommonMethods.hasValue(calibArds.calibPramID)) {
                        this.enableHeaders(false);
                        this.isDisplay = false;
                    }
                });
        }
    }

    //#region -- Get Print History Doc's

    ardsAssignedDocs() {
        this._service.ardsGetAssignedDocs(this.encEntityActID, this.entityCode);
        if (this.entityCode == EntityCodes.sampleAnalysis)
            this._service.ardsGetAssignedDocs(this.encEntityActID, "CONT_WISE_ANA");

    }

    //#endregion

    changeSpecification(type: string = 'ANY') {
        if (type == "MODE" && this.specDisable) {
            var item = this.ardsBO.specifications.filter(x => x.specID == this.manageArdsBO.specID)
            if (item && !item[0].hasStp && this.manageArdsBO.analysisMode == 'ONLINE' || this.manageArdsBO.analysisMode == 'OFFLINE') {
                setTimeout(() => {
                    this.manageArdsBO.analysisMode = null;
                }, 200);
                return this._alert.warning(SampleAnalysisMessages.modeNotApplicalbe);
            }
        }
        if (type == 'MODE' && !this.specDisable)
            this.manageArdsBO.specID = null;
        if (this.isAnalysisMode()) {
            var obj = this.getArdsPrintBo(this.manageArdsBO.specID, 'MAIN');
            this._service.getAssignedDocsBySpecID(obj);
        }
        this.prepareHeadersData();
    }

    isAnalysisMode() {
        return this.manageArdsBO.specID && this.manageArdsBO.analysisMode == 'YES';
    }

    changeContainerSpecification(type: string = 'ANY') {
        if (type == 'MODE')
            this.contArdsBO.specID = null;
        else
            this.testLkp();

        if (this.isContainerAnalysisMode()) {
            var obj = this.getArdsPrintBo(this.contArdsBO.specID, 'CONTAINER');
            this._service.getAssignedDocsBySpecID(obj);
        }
        this.prepareHeadersData();
    }

    getArdsPrintBo(specID, type) {
        var obj: GetArdsPrintDoc = new GetArdsPrintDoc();
        obj.encEntActID = this.encEntityActID;
        obj.specID = this.entityCode == EntityCodes.sampleAnalysis ? specID : 0;
        obj.calibParamID = this.entityCode != EntityCodes.sampleAnalysis ? specID : 0;
        obj.type = type;
        obj.sourceCode = type == 'CONTAINER' ? 'CONT_WISE_ANA' : this.entityCode;
        return obj;
    }

    isContainerAnalysisMode() {
        return this.contArdsBO.specID && this.contArdsBO.ardsMode == "YES";
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        //this.appBO.showConfirmBtn = !val;
    }

    disabledHeaders() {
        return this.btnType == ButtonActions.btnUpdate;
    }

    manageArdsData() {


        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        this.manageArdsBO.encEntityActID = this.encEntityActID;
        this.disabledBtn = true;
        this.manageArdsBO.initTime = this.appBO.initTime;
        this.manageArdsBO.entityCode = this.entityCode;
        this.manageArdsBO.list = this.testDataSource.data;
        this.isLoaderStart = true;
        this._service.ardsManageRequest(this.manageArdsBO);
    }

    getSpecTest() {
        if (this.btnType == ButtonActions.btnUpdate) {
            this.analyTestDataSource = null;
            this.actions = [GridActions.edit, GridActions.delete];
            sessionStorage.setItem("REFERESH_ACTIONS", 'true');
            return this.enableHeaders(true)
        }

        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);
        this.enableHeaders(false);
        this.actions = [];
        sessionStorage.setItem("REFERESH_ACTIONS", 'true');
        //var obj: any = { specID: this.entityCode == EntityCodes.sampleAnalysis ? this.manageArdsBO.specID : null, calibID: this.entityCode == EntityCodes.calibrationArds ? this.manageArdsBO.specID : null };
        //this._service.getTestByID(obj);
    }

    getSpec() {
        var obj: any = { specID: this.entityCode == EntityCodes.sampleAnalysis ? this.manageArdsBO.specID : 0, calibID: this.entityCode == EntityCodes.calibrationArds ? this.manageArdsBO.specID : 0 };

        const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = this.entityCode == EntityCodes.sampleAnalysis ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
        modal.componentInstance.encSpecID = obj.specID;
        modal.componentInstance.entityCode = this.entityCode;
        modal.componentInstance.encCalibID = obj.calibID;
        modal.componentInstance.isShow = true;

    }

    getConSpec() {
        const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = this.entityCode == EntityCodes.sampleAnalysis ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
        modal.componentInstance.encSpecID = String(this.contArdsBO.specID);
        modal.componentInstance.entityCode = this.entityCode;
        modal.componentInstance.encCalibID = '0';
        modal.componentInstance.isShow = true;
    }


    validateControls() {
        if (!CommonMethods.hasValue(this.manageArdsBO.analysisMode))
            return SampleAnalysisMessages.ardsAnalysisMode;
        if (!CommonMethods.hasValue(this.manageArdsBO.specID) && this.entityCode == EntityCodes.sampleAnalysis)
            return SampleAnalysisMessages.sampleSpecID;
        else if (!CommonMethods.hasValue(this.manageArdsBO.specID) && this.entityCode == EntityCodes.calibrationArds)
            return SampleAnalysisMessages.ardsSpecID;
        else if (!CommonMethods.hasValue(this.manageArdsBO.extraneousAnalysis) && this.entityCode == EntityCodes.sampleAnalysis)
            return SampleAnalysisMessages.extraneous;
        else if (this.manageArdsBO.extraneousAnalysis == 'YES' && (!CommonMethods.hasValue(this.testDataSource) || !CommonMethods.hasValue(this.testDataSource.data) || this.testDataSource.data.length == 0))
            return SampleAnalysisMessages.extraneousTest;
        else if (this.containerWiseAnalysisApp == "App" && !CommonMethods.hasValue(this.manageArdsBO.containerWiseAnalysisApp))
            return SampleAnalysisMessages.containerAnaApp;
    }

    onActionClicked(evt: any, type: string) {
        if (type == 'MAIN' && evt.type == "REQ" && evt.action == "SEND_REQUEST") {
            var retVal = this.validateControls();

            if (CommonMethods.hasValue(retVal))
                return this._alert.warning(retVal);
            this._confirmService.confirm(SampleAnalysisMessages.sendDocRequest).subscribe((confirmed) => {
                if (confirmed) {
                    this.manageArdsBO.encArdsID = evt.val.ardsID;
                    this.manageArdsBO.encEntityActID = this.encEntityActID;
                    this.manageArdsBO.type = "PRINT";
                    this.manageArdsBO.initTime = this.appBO.initTime;
                    this.manageArdsBO.entityCode = this.entityCode;
                    this.manageArdsBO.list = this.testDataSource.data;
                    this.manageArdsBO.sectionCode = this.entityCode + "_ARDS_PRINT";
                    this.manageArdsBO.role = this._limsContext.limsContext.userDetails.roleName;

                    this._service.ardsSelectionPrint(this.manageArdsBO);
                }
            })

        }
        else if (type == 'CONT' && evt.type == "REQ" && evt.action == "SEND_REQUEST") {
            var retVal = this.containerValidation();

            if (CommonMethods.hasValue(retVal) && !this.hide)
                return this._alert.warning(retVal);
            this._confirmService.confirm(SampleAnalysisMessages.sendDocRequest).subscribe((confirmed) => {
                if (confirmed) {
                    if (this.contArdsBO.type == 'Single Test' && !CommonMethods.hasValue(this.contArdsBO.testID))
                        this.contArdsBO.testID = this.specTests.selectedId;
                    this.contArdsBO.list = [];
                    this.packList.forEach(x => {
                        if (CommonMethods.hasValue(x.isSelected)) {
                            var obj: SingleIDBO = new SingleIDBO();
                            obj.id = x.invPackID;
                            this.contArdsBO.list.push(obj);
                        }
                    })
                    this.contArdsBO.encEntityActID = this.contArdsBO.encSioID = this.encEntityActID;
                    this.contArdsBO.initTime = this.appBO.initTime;
                    this.contArdsBO.encArdsID = evt.val.ardsID;
                    this.contArdsBO.reqType = "PRINT";
                    this.contArdsBO.entityCode = this.entityCode;
                    this.contArdsBO.sectionCode = "SAMANA_CONT_ARDS_PRINT";
                    this.contArdsBO.role = this._limsContext.limsContext.userDetails.roleName;

                    this._service.containerARDSSelectionPrint(this.contArdsBO);
                }
            })

        }

        else if (evt.type == "HIS" && evt.action == "DISCARD") {
            this._confirmService.confirm(SampleAnalysisMessages.printDocHistoryConfirm).subscribe((confirmed) => {
                if (confirmed) {
                    var obj: DiscardPrintRequestBO = new DiscardPrintRequestBO();
                    obj.encEntActID = this.encEntityActID;
                    obj.reqDocID = evt.val.docID;
                    obj.initTime = this.appBO.initTime;
                    obj.entityCode = this.entityCode;
                    obj.refNumber = this.appBO.referenceNumber;
                    this._service.ardsDiscardPrintRequest(obj);
                }
            })
        }
        else if (evt.type == "REQ" && evt.action == "VIEW") {
            this._service.viewARDSMasterDocument(evt.val.docTrackID);
        }
        else if (evt.type == "HIS" && evt.action == "VIEW") {
            this._service.viewARDSPrintDocument(evt.val.dmsID, evt.val.plantOrgCode);
        }
        else if (type == 'EXT' && evt.action == GridActions.edit) {
            this.extraneousID = evt.val.sno - 1;
            this.tests.setRow(evt.val.testID, evt.val.testTitle);
            this.stpLkp.setRow(evt.val.templateID, evt.val.template);
            this.exBtnType = ButtonActions.btnUpdate;
            this.tests.disableBtn = this.stpLkp.disableBtn = true;
        }
        else if (type == 'EXT' && evt.action == GridActions.delete) {
            this.testDataSource.data.splice(evt.val.sno - 1, 1);
            this.testDataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.testDataSource.data));
        }
    }

    formatString(val: any) {
        return CommonMethods.FormatValueString(val);
    }

    testLkp() {
        if (CommonMethods.hasValue(this.specTests) && CommonMethods.hasValue(this.specTests.selectedId))
            this.specTests.clear();
        var testCondition: string = "1=2"
        if (CommonMethods.hasValue(this.contArdsBO.specID))
            testCondition = 'SpecID =' + this.contArdsBO.specID;
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getSpecificatioinTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, testCondition, "", "LIMS");
        this.lkpTestInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getTests, LKPDisplayNames.testName, LKPDisplayNames.testID, LookUpDisplayField.header, LKPPlaceholders.testName, "STATUS_CODE = 'ACT' AND REQUEST_TYPE = 'EP'")
        this.stpInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle, LKPDisplayNames.templateNo, LookUpDisplayField.header, LKPPlaceholders.stpTitle, "STP_TYPE = 'A' AND STATUS_CODE = 'ACT' AND IS_EXTRANEOUS_MATTER = 1");

    }

    containerArds() {

        var err: string = this.containerValidation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);
        if (this.contArdsBO.type == 'Single Test')
            this.contArdsBO.testID = this.specTests.selectedId;
        this.contArdsBO.list = [];
        this.packList.forEach(x => {
            if (CommonMethods.hasValue(x.isSelected)) {
                var obj: SingleIDBO = new SingleIDBO();
                obj.id = x.invPackID;
                this.contArdsBO.list.push(obj);
            }
        })
        this.contArdsBO.encSioID = this.encEntityActID;
        this.contArdsBO.initTime = this.appBO.initTime;
        this._confirmService.confirm(SampleAnalysisMessages.cnfmContainer).subscribe(re => {
            if (re)
                this._service.saveContainerArdsDetails(this.contArdsBO);
        })
    }

    containerValidation() {
        var obj = this.packList.filter(x => CommonMethods.hasValue(x.isSelected))
        if (obj.length == 0)
            return SampleAnalysisMessages.slctPack;
        if (!CommonMethods.hasValue(this.contArdsBO.ardsMode))
            return SampleAnalysisMessages.ardsAnalysisMode;
        if (!CommonMethods.hasValue(this.contArdsBO.specID))
            return SampleAnalysisMessages.sampleSpecID;
        if (!CommonMethods.hasValue(this.contArdsBO.type))
            return SampleAnalysisMessages.analysisType;
        if (this.contArdsBO.type == 'Single Test' && (!CommonMethods.hasValue(this.specTests) || !CommonMethods.hasValue(this.specTests.selectedId)))
            return SampleAnalysisMessages.slctTest;
    }

    prepareHeadersData() {
        this.headersData = [];
        this.headersData.push({ columnDef: 'sno', header: 'S.No.', cell: (element: any) => `${element.sno}` });
        this.headersData.push({ columnDef: 'testName', header: 'Test Name', cell: (element: any) => `${element.testTitle}` });
        if (this.manageArdsBO.analysisMode == 'ONLINE' || this.manageArdsBO.analysisMode == 'OFFLINE')
            this.headersData.push({ columnDef: 'template', header: 'STP Title', cell: (element: any) => `${element.template}` });
    }

    addTest() {
        if (this.exBtnType == ButtonActions.btnUpdate) {
            this.exBtnType = ButtonActions.btnAdd;
            return this.tests.disableBtn = this.stpLkp.disableBtn = false;
        }
        var err: string = this.valid();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);
        var obj: extraneousTests = new extraneousTests();
        if (this.extraneousID == -1) {
            obj.testID = this.tests.selectedId;
            obj.testTitle = this.tests.selectedText;
            obj.templateID = this.stpLkp.selectedId;
            obj.template = this.stpLkp.selectedText;
            this.testDataSource.data.push(obj);
            this.testDataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.testDataSource.data));
        }
        else {
            this.testDataSource.data[this.extraneousID].testID = this.tests.selectedId;
            this.testDataSource.data[this.extraneousID].testTitle = this.tests.selectedText;
            this.testDataSource.data[this.extraneousID].templateID = this.stpLkp.selectedId;
            this.testDataSource.data[this.extraneousID].template = this.stpLkp.selectedText;
        }
        this.extraneousID = -1;
        this.tests.clear();
        this.stpLkp.clear();
    }

    valid() {
        if (!CommonMethods.hasValue(this.tests.selectedId))
            return SampleAnalysisMessages.slctTest;
        if ((this.manageArdsBO.analysisMode == 'ONLINE' || this.manageArdsBO.analysisMode == 'OFFLINE') && !CommonMethods.hasValue(this.stpLkp.selectedId))
            return SampleAnalysisMessages.tempalte;
        var obj = this.testDataSource.data.filter(x => x.testID == this.tests.selectedId)
        if (obj.length > 0 && this.extraneousID == -1)
            return SampleAnalysisMessages.testExists;
    }

    getSpecifications(type: string) {
        return this.ardsBO.specifications;
        if (type == 'COM' && (CommonMethods.hasValue(this.manageArdsBO.analysisMode) || this.specDisable)) {
            if (this.manageArdsBO.analysisMode == 'ONLINE' || this.manageArdsBO.analysisMode == 'OFFLINE')
                return this.ardsBO.specifications.filter(x => x.hasStp)
            else
                return this.ardsBO.specifications
        }
        else if (type == 'CONT' && CommonMethods.hasValue(this.contArdsBO.ardsMode)) {
            if (this.contArdsBO.ardsMode == 'ONLINE' || this.contArdsBO.ardsMode == 'OFFLINE')
                return this.ardsBO.specifications.filter(x => x.hasStp)
            else
                return this.ardsBO.specifications
        }
        else return null
    }

    prepareTestheader() {
        this.analyheader = [];
        this.analyheader.push({ columnDef: "isSelected", header: "", cell: (element: any) => `${element.isExclude}`, class: 'hide-chk' });
        this.analyheader.push({ columnDef: "srNum", header: "SR Number", cell: (element: any) => `${element.srNum}` });
        this.analyheader.push({ columnDef: "testName", header: "Test Name", cell: (element: any) => `${element.testName}` });
        this.analyheader.push({ columnDef: "testDesc", header: "Result", cell: (element: any) => `${element.testDesc}` });
        this.analyheader.push({ columnDef: "specDesc", header: "Specification Limit", cell: (element: any) => `${element.specDesc}` });
    }

    specReset() {
        // var obj = this.analysisTests.filter(x => CommonMethods.hasValue(x.invalidationID))
        // if (CommonMethods.hasValue(obj) && obj.length > 0)
        //     return this._alert.warning(SampleAnalysisMessages.cantRaiseSpecReset);
        this.raiseDeviation(DCActionCode.SAMANA_RESET)
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
                this.isLoaderStartSpecReset = true;
                this._service.raiseDeviation(obj);
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}