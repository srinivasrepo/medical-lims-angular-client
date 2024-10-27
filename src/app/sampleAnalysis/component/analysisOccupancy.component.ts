import { Component, AfterContentInit, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ColumnBO, ManageAnalysisOccupancyBO } from '../model/sampleAnalysisModel';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ButtonActions, GridActions, ActionMessages, EntityCodes } from 'src/app/common/services/utilities/constants';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { MatDialog, MatDialogRef, MatTableDataSource } from '@angular/material';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import { addCommentComponent } from "src/app/common/component/addComment.component";

@Component({
    selector: 'app-analysis-occupancy',
    templateUrl: '../html/analysisOccupancy.html'
})

export class AnalysisOccupancyComponent implements AfterContentInit {
    mode: string = 'MNG';

    manageOccuBO: ManageAnalysisOccupancyBO = new ManageAnalysisOccupancyBO();
    btnType: string = ButtonActions.btnSave;
    instrumentList: any = [];
    headersData: any;
    dataSource: any;
    actions: Array<any> = [GridActions.edit, GridActions.Invalid];
    colActions: Array<any> = [GridActions.edit, GridActions.delete];
    extraColumns: any;
    basicInfo: any;
    resultSubmitted: boolean;
    removeActions: any = {};
    analysisOccuInfo: LookupInfo;
    @ViewChild('analysisOccu', { static: false }) analysisOccu: LookupComponent;

    columnIDInfo: LookupInfo;
    @ViewChild('columnID', { static: false }) columnID: LookupComponent;

    mobilePhaseInfo: LookupInfo;
    @ViewChild('mobilePhase', { static: false }) mobilePhase: LookupComponent;

    refOccuInfo: LookupInfo;
    @ViewChild('refOccu', { static: false }) refOccu: LookupComponent;

    oneTimeAccess: string = 'NO';
    typesInstrumetns: Array<string> = ["HPLC", "GC"];
    typeCode: string;
    actTypeCode: string;

    additionalCountHide: boolean = false;
    showHideFields: boolean = false;
    condition: string = "1=2";
    disabledControls: boolean = false;
    isPrimaryInstAdded: boolean = false;
    isOccpancyAdded: boolean = false;
    getTestInfo: any;
    subscription: Subscription = new Subscription();
    encEntActID: string;
    useBeforeDate: any;
    hideMobilePhaseLKp: boolean = true;
    isLoaderStart: boolean;
    colDataSource: any;
    colHeadersData: any;
    index: number = -1;
    columnBO: ColumnBO = new ColumnBO();

    constructor(private _service: SampleAnalysisService, public _global: GlobalButtonIconsService,
        private _matDailogRef: MatDialogRef<AnalysisOccupancyComponent>, private _alert: AlertService,
        private _confirm: ConfirmationService, private _store: Store<fromAnalysisOptions.AnalysisState>, private _matDialog: MatDialog
    ) { }

    ngOnInit() {
        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo
                var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.manageOccuBO.encSamAnalTestID)
                if (obj && obj.length > 0) {
                    this.mode = this.mode == 'MNG' ? !obj[0].hasOOS ? 'MNG' : 'VIEW' : this.mode;
                    this.manageOccuBO.testInitTime = obj[0].testInitTime;
                }
            });

    }

    ngAfterContentInit() {

        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == 'dateFrom') {
                this.manageOccuBO.dateFrom = dateParserFormatter.FormatDate(resp.result, 'datetime');
                this.manageOccuBO.dateTo = "";
            }
            else if (resp.purpose == 'dateTo')
                this.manageOccuBO.dateTo = dateParserFormatter.FormatDate(resp.result, 'datetime');
            else if (resp.purpose == 'getInstrumentsForTest')
                this.instrumentList = resp.result;
            else if (resp.purpose == 'getEQPUGetEqpTypeCode') {
                this.showHideFields = this.typesInstrumetns.includes(resp.result.actTypeCode) && this.manageOccuBO.occupancyType != 'Eqp_Para_Sam_Ana';
                this.typeCode = resp.result.typeCode;
                this.actTypeCode = resp.result.actTypeCode;
                if (this.manageOccuBO.isRefOcc)
                    this.showHideFields = false;

                if (this.showHideFields)
                    this.prepareLookUpColumnID();
            }
            else if (resp.purpose == "getCumulativeCount") {
                if (resp.result > 0) {
                    this.columnBO.cumulativeInj = resp.result;
                    this.additionalCountHide = true;
                }
            }
            else if (resp.purpose == "getTestInstruments") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.prepareHeaders();
                this.basicInfo = resp.result;
                this.manageOccuBO.occupancyReq = CommonMethods.hasValue(this.basicInfo.isOccRequired) ? 'Y' : 'N'
                this.manageOccuBO.remarks = this.basicInfo.remarks;
                this.manageOccuBO.encSamAnaInstID = resp.result.encSamInstID;
                if (this.mode == 'MNG')
                    this.mode = CommonMethods.hasValue(resp.result.hasCatLevelOcc) ? 'VIEW' : 'MNG'
                if (CommonMethods.hasValue(resp.result.hasCatLevelOcc))
                    this.actions = [];

                if (CommonMethods.hasValue(this.basicInfo))
                    this.basicInfo.sampleReceivedOn = dateParserFormatter.FormatDate(this.basicInfo.sampleReceivedOn, 'datetime');
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.lst, 'filterTwiceCol', ['fromTime', 'toTime']));
                if (CommonMethods.hasValue(this.manageOccuBO.remarks))
                    this.enableHeaders(false);

                this.isPrimaryOccupancy();

            }
            else if (resp.purpose == "insertNUpdateInstruments") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {

                    // if ((this.manageOccuBO.occupancyReq == 'Y' && this.manageOccuBO.occupancyType == 'Eqp_Sam_Ana') || this.manageOccuBO.occupancyReq == 'N')
                    //     this.isPrimaryInstAdded = true;
                    // else
                    //     this.isPrimaryInstAdded = false;

                    this.updateTestInitTime(resp.result);
                    this._alert.success(SampleAnalysisMessages.analysisOccuSaved);
                    this.getTestInstruments();
                    this.clear('Y');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));

            }
            else if (resp.purpose == "getInstrumnetDetailsByID") {
                this.manageOccuBO.occupancyRequired = resp.result.isOccReq;
                this.manageOccuBO.occupancyReq = (resp.result.isOccReq == true ? 'Y' : 'N');

                if (this.manageOccuBO.occupancyReq == 'Y') {

                    // this._service.getInstrumentsForTest(this.manageOccuBO.encSamAnalTestID);
                    this.getInstrumentsForTest();
                    this.manageOccuBO.epqOccID = resp.result.epqOccID;
                    this.colDataSource = CommonMethods.bindMaterialGridData(resp.result.lst);
                    this.manageOccuBO.occupancyType = (resp.result.isPrimaryOcc ? 'Eqp_Sam_Ana' : 'Eqp_Add_Sam_Ana');
                    this.manageOccuBO.occupancyType = resp.result.isParameterOcc ? 'Eqp_Para_Sam_Ana' : this.manageOccuBO.occupancyType;
                    this.manageOccuBO.isRefOcc = resp.result.isRefOcc;
                    this.manageOccuBO.refEqpOccID = resp.result.refEqpOccID;
                    this.showHideFields = this.typesInstrumetns.includes(resp.result.typeCode);
                    this.typeCode = resp.result.typeCode + '_COL';
                    this.actTypeCode = resp.result.typeCode;
                    this.hideMobilePhaseLKp = true;
                    if (this.manageOccuBO.occupancyType != "Eqp_Add_Sam_Ana") {
                        this.manageOccuBO.instrumentTitleID = resp.result.equipmentID;
                        this.prepareRefLkp();
                        this.callEQPUGetEqpTypeCode(this.manageOccuBO.instrumentTitleID);
                        if (CommonMethods.hasValue(resp.result.isRefOcc)) {
                            this.refOccu.setRow(resp.result.refEqpOccID, resp.result.refInvBatch);
                            this.showHideFields = false;
                            this.colActions = [];
                        }
                    }
                    else {
                        setTimeout(() => {
                            this.analysisOccu.setRow(resp.result.equipmentID, resp.result.eqpCode);
                            this.prepareRefLkp();
                            if (CommonMethods.hasValue(resp.result.isRefOcc)) {
                                this.refOccu.setRow(resp.result.refEqpOccID, resp.result.refInvBatch);
                                this.showHideFields = false;
                                this.colActions = [];
                            }
                        }, 1000);
                    }

                    if (this.showHideFields) {


                        if (resp.result.columnID) {
                            this._service.getCumulativeCount(resp.result.columnID);

                            setTimeout(() => {
                                this.columnID.setRow(resp.result.columnID, resp.result.colTitle);
                                if (CommonMethods.hasValue(resp.result.mobilePhaseID))
                                    this.mobilePhase.setRow(resp.result.mobilePhaseID, resp.result.batchNumber);
                                this.useBeforeDate = dateParserFormatter.FormatDate(resp.result.useBeforeDate, 'datetime');
                            }, 1000);
                        }
                        this.prepareLookUpColumnID();

                    }
                    setTimeout(() => {
                        this.manageOccuBO.dateFrom = dateParserFormatter.FormatDate(resp.result.fromTime, 'datetime');
                        this.manageOccuBO.dateTo = dateParserFormatter.FormatDate(resp.result.toTime, 'datetime');
                    }, 1200)
                }

                this.manageOccuBO.remarks = resp.result.remarks;
                this.enableHeaders(false);

            }
            else if (resp.purpose == "deleteInstrumnetDetailsByID") {
                if (resp.result.returnFlag == "OK") {
                    this.updateTestInitTime(resp.result);
                    this._alert.success(SampleAnalysisMessages.deleteOccupancyInstr);
                    this.getTestInstruments();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "invalidInstOccupancy") {
                if (resp.result.returnFlag == "OK") {
                    this.updateTestInitTime(resp.result);
                    this._alert.success(SampleAnalysisMessages.invalidatedOcc);
                    this.getTestInstruments();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

            else if (resp.purpose == "deleteColumnInfo") {
                this._alert.success(SampleAnalysisMessages.columnDeleted);
                this.colDataSource = CommonMethods.bindMaterialGridData(resp.result);
            }
            else if (resp.purpose == "manageColumnInfo") {
                this._alert.success(SampleAnalysisMessages.columnAdded);
                this.colDataSource = CommonMethods.bindMaterialGridData(resp.result);
            }
            else if (resp.purpose == "getRefEqpOthInfo") {
                this.manageOccuBO.dateFrom = dateParserFormatter.FormatDate(resp.result.fromTime, 'datetime');
                this.manageOccuBO.dateTo = dateParserFormatter.FormatDate(resp.result.toTime, 'datetime');
                this.showHideFields = false;
                if (CommonMethods.hasValue(resp.result.lst) && resp.result.lst.length > 0) {
                    this.colDataSource = CommonMethods.bindMaterialGridData(resp.result.lst);
                    this.colActions = [];
                }
            }
        })

        // this._service.getTestInstruments(this.manageOccuBO.encSamAnalTestID);
        this.colDataSource = CommonMethods.bindMaterialGridData(this.colDataSource);
        this.getTestInstruments();
        this.prepareRefLkp();
        if (this.mode != 'MNG') {
            this.actions = [];
            this.colActions = [];
        }
        this.removeActions = { headerName: 'ananlysis_occ', action: 'INVALID', showDelete: this.manageOccuBO.entityCode == EntityCodes.calibrationArds ? true : this.resultSubmitted }
    }

    isPrimaryOccupancy() {
        if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
            this.isPrimaryInstAdded = this.dataSource.data.filter(x => x.isPrimary && !CommonMethods.hasValue(x.invalidationID)).length > 0;
            this.isOccpancyAdded = true;
        }
        else if (this.manageOccuBO.occupancyReq == 'N') {
            this.isPrimaryInstAdded = true;
            this.isOccpancyAdded = true;
        }
        else {
            this.isPrimaryInstAdded = false;
            this.isOccpancyAdded = false;
        }
    }

    getTestInstruments() {

        var obj: any = {};
        obj.encSamAnalTestID = this.manageOccuBO.encSamAnalTestID;
        obj.entityCode = this.manageOccuBO.entityCode;
        this._service.getTestInstruments(obj);
    }


    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'iconInv', "header": "", cell: (element: any) => `${element.invalidationID}`, width: 'maxWidth-4per' });
        this.headersData.push({ "columnDef": 'instName', "header": "Instrument Title(ID)", cell: (element: any) => `${element.instName}`, width: 'maxWidth-45per' });
        this.headersData.push({ "columnDef": 'fromTime', "header": "Start Time", cell: (element: any) => `${element.fromTime}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'toTime', "header": "End Time", cell: (element: any) => `${element.toTime}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'primaryOcc', "header": "Is Primary", cell: (element: any) => `${element.primaryOcc}`, width: 'maxWidth-15per' });
        //this.headersData.push({ "columnDef": 'hplcGcColumn', "header": "Column ID", cell: (element: any) => `${element.hplcGcColumn}`, width: 'maxWidth-10per' });

        this.extraColumns = [];
        this.extraColumns.push({ "columnDef": 'analystName', "header": "Analyst Name", cell: (element: any) => `${element.analystName}` })
        this.extraColumns.push({ "columnDef": 'duration', "header": "Duration", cell: (element: any) => `${element.duration}` });
        // if (!this.hideMobilePhaseLKp)
        //     this.extraColumns.push({ "columnDef": 'mobilePhase', "header": "Mobile Phase", cell: (element: any) => `${element.mobilePhase}` });
        // this.extraColumns.push({ "columnDef": 'noOfInjections', "header": "No. Of Injections", cell: (element: any) => `${element.noOfInjections}` });
        // this.extraColumns.push({ "columnDef": 'cumulativeInjection', "header": "Cumulative Injection", cell: (element: any) => `${element.cumulativeInjection}` });
        // this.extraColumns.push({ "columnDef": 'dataSeqFile', "header": "Data Seq. File", cell: (element: any) => `${element.dataSeqFile}` });
        this.extraColumns.push({ "columnDef": 'remarks', "header": "Remarks", cell: (element: any) => `${element.remarks}` });

        this.colHeadersData = [];
        this.colHeadersData.push({ "columnDef": 'hplcGcColumn', "header": "Column ID", cell: (element: any) => `${element.eqpCode}`, width: 'maxWidth-20per' });
        this.colHeadersData.push({ "columnDef": 'noOfInjections', "header": "No. Of Injections", cell: (element: any) => `${element.noOfInjections}`, width: 'maxWidth-10per' });
        this.colHeadersData.push({ "columnDef": 'cumulativeInjection', "header": "Cumulative Injection", cell: (element: any) => `${element.cumulativeInj}`, width: 'maxWidth-20per' });
        this.colHeadersData.push({ "columnDef": 'dataSeqFile', "header": "Data Seq. File", cell: (element: any) => `${element.dataSeqFile}`, width: 'maxWidth-20per' });
        this.colHeadersData.push({ "columnDef": 'colRemarks', "header": "Remarks", cell: (element: any) => `${element.remarks}`, width: 'maxWidth-30per' });


    }

    prepareLookUpInfo() {
        this.analysisOccuInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analysisInstrTitle, LookupCodes.getAnalysisAdditionalOccu, LKPDisplayNames.analysisOccuName, LKPDisplayNames.analysisOccuCode, LookUpDisplayField.code, LKPPlaceholders.analysisOccu, "", '', '');
    }

    prepareLookUpColumnID() {

        this.condition = "1=2";

        if (this.typeCode)
            this.condition = "CAT_ITEM_CODE = '" + this.typeCode + "'";

        this.columnIDInfo = CommonMethods.PrepareLookupInfo(LKPTitles.columnIDs, LookupCodes.getAnalysisColumnID, LKPDisplayNames.analysisColumnName, LKPDisplayNames.analysisColumnCode, LookUpDisplayField.code, LKPPlaceholders.analysisColumnIDOccu, this.condition, '', '');
        this.mobilePhaseInfo = CommonMethods.PrepareLookupInfo(LKPTitles.mobilePhase, LookupCodes.getMBBatchNumbers, LKPDisplayNames.batchNum, LKPDisplayNames.mobilePhase, LookUpDisplayField.header, LKPPlaceholders.mobilePhase, '');
    }

    changeOccupancyType() {

        if ((this.manageOccuBO.occupancyType == "Eqp_Sam_Ana" || this.manageOccuBO.occupancyType == "Eqp_Para_Sam_Ana") && this.oneTimeAccess == 'NO') {
            this.oneTimeAccess = 'YES';
            // this._service.getInstrumentsForTest(this.manageOccuBO.encSamAnalTestID);
            this.getInstrumentsForTest();
        } else {
            this.typeCode = this.actTypeCode = null;
            this.prepareLookUpInfo();

        }
        this.prepareRefLkp();
    }

    getInstrumentsForTest() {
        var obj: any = {};
        obj.encSamAnalTestID = this.manageOccuBO.encSamAnalTestID;
        obj.entityCode = this.manageOccuBO.entityCode;

        this._service.getInstrumentsForTest(obj);
    }

    manageHideFields(type: string, evt?: any) {

        if (type == 'DDL_TITLE') {
            this.hideMobilePhaseLKp = true;
            this.showHideFields = this.typesInstrumetns.includes(this.instrumentList.filter(x => x.eqpID == this.manageOccuBO.instrumentTitleID)[0].eqpType);
            if (this.manageOccuBO.isRefOcc)
                this.showHideFields = false;

            if (this.showHideFields) {
                this.callEQPUGetEqpTypeCode(this.manageOccuBO.instrumentTitleID);
                this.prepareLookUpColumnID();
            }
            else {
                if (CommonMethods.hasValue(this.columnID))
                    this.columnID.clear();
                this.columnBO = new ColumnBO();
            }
        }
        else if (CommonMethods.hasValue(this.analysisOccu.selectedId)) {
            if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
                this.hideMobilePhaseLKp = true;
            this.callEQPUGetEqpTypeCode(this.analysisOccu.selectedId);
        }

    }

    callEQPUGetEqpTypeCode(val: number) {
        this._service.getEQPUGetEqpTypeCode(val);
    }

    changeInstrumentTitle(type: string, evt?: any) {
        this.manageHideFields(type, evt);
        this.prepareRefLkp();
    }

    getCurrentDateTime(type) {

        if (this.btnType == ButtonActions.btnUpdate || this.manageOccuBO.isRefOcc || (type == 'dateFrom' && CommonMethods.hasValue(this.manageOccuBO.dateFrom)) || (type == 'dateTo' && CommonMethods.hasValue(this.manageOccuBO.dateTo) && this.manageOccuBO.dateTo != this.manageOccuBO.dateFrom))
            return;

        this._service.getCurrentDateTime(type);
    }

    selectedColumnIns(evt) {
        if (CommonMethods.hasValue(evt.val))
            this._service.getCumulativeCount(this.columnID.selectedId);
        else
            this.columnBO.cumulativeInj = 0;
    }

    selectedMobilePhase(evt) {
        if (CommonMethods.hasValue(evt.val)) {
            this.useBeforeDate = dateParserFormatter.FormatDate(evt.val.extColName, 'datetime');
        }
        else
            this.useBeforeDate = null;
    }

    durationTime() {
        if (CommonMethods.hasValue(this.manageOccuBO.dateFrom) && CommonMethods.hasValue(this.manageOccuBO.dateTo)) {
            var fromDate = new Date(this.manageOccuBO.dateFrom).getDate();
            var toDate = new Date(this.manageOccuBO.dateTo).getDate();

            var diffDate = toDate - fromDate;

            var fromTime = new Date(this.manageOccuBO.dateFrom).getTime();
            var toTime = new Date(this.manageOccuBO.dateTo).getTime();

            var diffTime = toTime - fromTime;

            diffTime = diffTime / 1000 / 60;

            return diffDate + ' hr(s) ' + diffTime + ' min(s)';
        }
    }

    changeIcons() {
        return this.btnType == ButtonActions.btnSave ? this._global.icnSave : this._global.icnUpdate;
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.disabledControls = !val;
        if (!val || this.manageOccuBO.isRefOcc)
            this.colActions = [];
        else
            this.colActions = [GridActions.edit, GridActions.delete];
        setTimeout(() => {
            if (this.columnID)
                this.columnID.disableBtn = !val;
            if (this.mobilePhase)
                this.mobilePhase.disableBtn = !val;

            if (this.analysisOccu)
                this.analysisOccu.disableBtn = this.manageOccuBO.occupancyType == "Eqp_Add_Sam_Ana";
            if (this.refOccu)
                this.refOccu.disableBtn = !val;

        }, 1000);


    }

    manageOccu() {

        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        if (this.analysisOccu && this.analysisOccu.selectedId)
            this.manageOccuBO.instrumentTitleID = this.analysisOccu.selectedId;
        if (this.refOccu && this.refOccu.selectedId)
            this.manageOccuBO.refEqpOccID = this.refOccu.selectedId;
        else
            this.manageOccuBO.refEqpOccID = 0;

        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        if (this.additionalCountHide)
            this.columnBO.cumulativeInj = null;

        if (this.manageOccuBO.occupancyReq == 'Y' && !this.manageOccuBO.isRefOcc && this.typesInstrumetns.includes(this.actTypeCode) && this.manageOccuBO.occupancyType != 'Eqp_Para_Sam_Ana') {
            this.manageOccuBO.list = this.colDataSource.data;
        }

        this.manageOccuBO.occupancyRequired = this.manageOccuBO.occupancyReq == 'Y' ? true : false;
        this.isLoaderStart = true;

        this._service.insertNUpdateInstruments(this.manageOccuBO);

    }

    allowNumber(evt) {
        return CommonMethods.allowNumber(evt, '');
    }

    addColumnData() {
        var error: string = this.colValidations();
        if (CommonMethods.hasValue(error))
            return this._alert.warning(error);
        if (!CommonMethods.hasValue(this.colDataSource) || !CommonMethods.hasValue(this.colDataSource.data))
            this.colDataSource = new MatTableDataSource();
        if (!CommonMethods.hasValue(this.manageOccuBO.encSamAnaInstID)) {
            if (this.index == -1) {
                var obj: ColumnBO = new ColumnBO();
                this.columnBO.columnID = this.columnID.selectedId;
                this.columnBO.eqpCode = this.columnID.selectedText;

                this.colDataSource.data.push(this.columnBO);
            }
            else {
                this.dataSource.data[this.index].columnID = this.columnID.selectedId;
                this.dataSource.data[this.index].eqpCode = this.columnID.selectedText;
                this.dataSource.data[this.index].dataSeqFile = this.columnBO.dataSeqFile;
                this.dataSource.data[this.index].noOfInjections = this.columnBO.noOfInjections;
                this.dataSource.data[this.index].cumulativeInj = this.columnBO.cumulativeInj;
                this.dataSource.data[this.index].remarks = this.columnBO.remarks;
            }
        }
        else {
            this.columnBO.columnID = this.columnID.selectedId;
            this.columnBO.eqpCode = this.columnID.selectedText;
            this.columnBO.epqOccID = this.manageOccuBO.epqOccID;
            this.columnBO.entityCode = this.manageOccuBO.entityCode;
            this.columnBO.encEnityActID = this.manageOccuBO.encEnityActID;
            this.columnBO.refNo = this.manageOccuBO.refNo;
            this._service.manageColumnInfo(this.columnBO);
        }
        this.index = -1;
        this.columnBO = new ColumnBO();
        this.columnID.clear();
        this.colDataSource = CommonMethods.bindMaterialGridData(this.colDataSource.data);
    }


    colValidations() {
        if (this.showHideFields /*&& (this.manageOccuBO.entityCode != EntityCodes.calibrationArds || this.manageOccuBO.occupancyType == 'Eqp_Add_Sam_Ana')*/) {
            if (!CommonMethods.hasValue(this.columnID.selectedId))
                return SampleAnalysisMessages.columnID;
            if (CommonMethods.hasValue(this.colDataSource) && this.colDataSource.data && this.colDataSource.data.length > 0) {
                var obj = this.colDataSource.data.filter(x => x.columnID == this.columnID.selectedId && !CommonMethods.hasValue(this.columnBO.columnInjectionID))
                if (obj && obj.length > 0)
                    return SampleAnalysisMessages.existsColumnID;
            }
            if (!CommonMethods.hasValue(this.columnBO.dataSeqFile))
                return SampleAnalysisMessages.dataSeqFile;
            if (!this.hideMobilePhaseLKp && !CommonMethods.hasValue(this.mobilePhase.selectedId))
                return SampleAnalysisMessages.mobilePhase;
            if (!CommonMethods.hasValueWithZero(this.columnBO.noOfInjections))
                return SampleAnalysisMessages.noofInjections;
            if (!CommonMethods.hasValue(this.columnBO.cumulativeInj) && !this.additionalCountHide)
                return SampleAnalysisMessages.cumulativeNoOfInjections;
            if (!CommonMethods.hasValue(this.columnBO.remarks))
                return SampleAnalysisMessages.remarksOccu;
        }
    }

    validateControls() {


        //console.log(this.manageOccuBO.dateFrom, dateParserFormatter.FormatDate(this.manageOccuBO.dateFrom, 'datetime'), dateParserFormatter.FormatDate(this.basicInfo.sampleReceivedOn, 'datetime'));


        if (this.manageOccuBO.occupancyReq == 'Y') {
            if (!CommonMethods.hasValue(this.manageOccuBO.occupancyType))
                return SampleAnalysisMessages.occupancyType;
            else if (!CommonMethods.hasValue(this.manageOccuBO.instrumentTitleID))
                return this.manageOccuBO.occupancyType == 'Eqp_Sam_Ana' ? SampleAnalysisMessages.instr : SampleAnalysisMessages.equipInstr;
            else if (CommonMethods.hasValue(this.manageOccuBO.isRefOcc) && !CommonMethods.hasValue(this.manageOccuBO.refEqpOccID))
                return SampleAnalysisMessages.refEqpOcc;
            else if (!CommonMethods.hasValue(this.manageOccuBO.dateFrom))
                return SampleAnalysisMessages.instrStartTime;
            else if (CommonMethods.hasValue(this.basicInfo.sampleReceivedOn) && dateParserFormatter.FormatDate(this.manageOccuBO.dateFrom, 'default') < dateParserFormatter.FormatDate(this.basicInfo.sampleReceivedOn, 'default'))
                return SampleAnalysisMessages.occuSampleReceivedOn;
            else if (CommonMethods.hasValue(this.manageOccuBO.dateTo) && (new Date(this.manageOccuBO.dateFrom).getTime() >= new Date(this.manageOccuBO.dateTo).getTime()))
                return SampleAnalysisMessages.endTime;
            else if (this.showHideFields && (!this.colDataSource || !this.colDataSource.data || this.colDataSource.data.length == 0))
                return SampleAnalysisMessages.atleastOneCol;
        }
        if (!CommonMethods.hasValue(this.manageOccuBO.remarks))
            return SampleAnalysisMessages.remarksOccu;

    }

    onActionClicked(evt, type: string = 'MAIN') {
        if (evt.action == "EDIT" && type == "MAIN") {

            this.manageOccuBO.encSamAnaInstID = evt.val.encSamInstID;

            var obj: any = {};
            obj.encSamAnaInstID = this.manageOccuBO.encSamAnaInstID;
            obj.entityCode = this.manageOccuBO.entityCode;
            if (this.manageOccuBO.entityCode == EntityCodes.calibrationArds)
                obj.encCalibMainID = this.encEntActID;

            this._service.getInstrumnetDetailsByID(obj);

        }
        else if (evt.action == "DELETE" && type == "MAIN") {

            this._confirm.confirm(SampleAnalysisMessages.deleteConfirm).subscribe(resp => {
                if (resp) {
                    var obj: any = {}
                    obj.encSamInstrID = evt.val.encSamInstID;
                    obj.initTime = this.manageOccuBO.testInitTime;
                    obj.entityCode = this.manageOccuBO.entityCode;
                    this._service.deleteInstrumnetDetailsByID(obj);
                }
            })
        }
        else if (evt.action == GridActions.Invalid && type == "MAIN") {
            if(this.manageOccuBO.encSamAnaInstID == evt.val.encSamInstID)
                return this._alert.warning(SampleAnalysisMessages.selectInst);
            const modal = this._matDialog.open(addCommentComponent, { width: '600px' });
            modal.disableClose = true;
            modal.afterClosed().subscribe(resp => {
                if (resp.result) {
                    var obj: any = {}
                    obj.encSamInstrID = evt.val.encSamInstID;
                    obj.initTime = this.manageOccuBO.testInitTime;
                    obj.entityCode = this.manageOccuBO.entityCode;
                    obj.remarks = resp.val;
                    this._service.invalidInstOccupancy(obj);
                }
            })
        }

        else if (evt.action == "EDIT" && type == "SUB") {
            this.columnBO = evt.val;
            this.columnID.setRow(evt.val.columnID, evt.val.eqpCode);
            this._service.getCumulativeCount(evt.val.columnID);
            if (!CommonMethods.hasValue(this.manageOccuBO.encSamAnaInstID))
                this.index = this.colDataSource.data.findIndex(x => x.columnID == evt.val.columnID);
        }

        else if (evt.action == "DELETE" && type == "SUB") {
            if (this.index > -1)
                return;
            else if (!CommonMethods.hasValue(evt.val.columnInjectionID)) {
                var index = this.colDataSource.data.findIndex(x => x.columnID == evt.val.columnID);
                this.colDataSource.data.splice(index, 1)
                this.colDataSource = CommonMethods.bindMaterialGridData(this.colDataSource.data);
            }
            else if (CommonMethods.hasValue(evt.val.columnInjectionID)) {
                var delObj: ColumnBO = new ColumnBO();
                delObj.columnInjectionID = evt.val.columnInjectionID;
                delObj.entityCode = this.manageOccuBO.entityCode;
                delObj.encEnityActID = this.manageOccuBO.encEnityActID;
                delObj.refNo = this.manageOccuBO.refNo;
                this._service.deleteColumnInfo(delObj);
            }
        }
    }

    changeOccuRequired() {
        this.clear('N');
    }

    clear(clearAll: string = 'Y') {

        if (clearAll == 'Y')
            this.manageOccuBO.encSamAnaInstID = null;

        this.manageOccuBO.instrumentTitleID = this.manageOccuBO.occupancyType = this.manageOccuBO.dateFrom = this.manageOccuBO.dateTo = this.manageOccuBO.remarks = null;
        if (this.analysisOccu)
            this.analysisOccu.clear();
        if (this.columnID)
            this.columnID.clear();
        if (this.mobilePhase)
            this.mobilePhase.clear();
        if (this.refOccu)
            this.refOccu.clear();
        this.columnBO = new ColumnBO();
        this.showHideFields = false;
        this.manageOccuBO.isRefOcc = false;
    }

    close() {
        this._matDailogRef.close({ primaryOccAdded: this.isPrimaryInstAdded, occAdded: this.isOccpancyAdded });
    }

    updateTestInitTime(val: any) {
        // this._store
        //     .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
        //     .subscribe(testInfo => {

        // Update Test Init Time

        var obj: any = this.getTestInfo.filter(x => x.samAnaTestID == this.manageOccuBO.encSamAnalTestID);
        if (obj.length > 0) {
            obj[0].testInitTime = val.initTime;
            this.manageOccuBO.testInitTime = val.initTime;
            this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
        }

        // });
    }

    prepareRefLkp(evt: any = "") {
        if (CommonMethods.hasValue(evt))
            this.manageOccuBO.isRefOcc = evt.checked;
        if (CommonMethods.hasValue(this.refOccu))
            this.refOccu.clear();
        if (this.manageOccuBO.occupancyType == 'Eqp_Add_Sam_Ana' && this.instrumentList.length > 0 && this.manageOccuBO.instrumentTitleID)
            this.manageHideFields("LKP_TITLE");
        else if (this.instrumentList.length > 0 && this.manageOccuBO.instrumentTitleID)
            this.manageHideFields("DDL_TITLE");
        var condition: string = "1 = 2";
        if (CommonMethods.hasValue(this.manageOccuBO.isRefOcc) && (CommonMethods.hasValue(this.manageOccuBO.instrumentTitleID) || CommonMethods.hasValue(this.analysisOccu.selectedId)))
            condition = CommonMethods.hasValue(this.manageOccuBO.instrumentTitleID) ? "EquipmentID = " + this.manageOccuBO.instrumentTitleID : "EquipmentID = " + this.analysisOccu.selectedId;

        this.refOccuInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refEqpOcc, LookupCodes.getRefEqpOthOccupancyDetails, LKPDisplayNames.occSource, LKPDisplayNames.refInvBatch, LookUpDisplayField.code, LKPPlaceholders.refEqpOcc, condition, LKPDisplayNames.entRefNumber);
    }

    getRefEqpOCC(evt) {
        if (CommonMethods.hasValue(this.refOccu) && CommonMethods.hasValue(this.refOccu.selectedId))
            this._service.getRefEqpOthInfo(this.refOccu.selectedId);
        else {
            this.manageOccuBO.dateFrom = this.manageOccuBO.dateTo = null;
            this.colDataSource = CommonMethods.bindMaterialGridData(null);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}