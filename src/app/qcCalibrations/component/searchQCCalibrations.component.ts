import { Component, OnDestroy, AfterContentInit, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { SearchQCCalibrationsBO } from '../models/qcCalibrationsModel';
import { SearchBoSessions, CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { LimsRespMessages, LookupCodes, GridActions, EntityCodes, CapabilityActions, ActionMessages, SearchPageTooltip } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { environment } from 'src/environments/environment';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders, LkpPurpose } from 'src/app/limsHelpers/entity/lookupTitles';
import { Router } from '@angular/router';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog } from '@angular/material';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { AssignInstrumentComponent } from './assignInstruments.component';
import { ChangePlantComponent } from './changePlant.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { ManageArdsDocumentsComponent } from './manageArdsDocuments.component';

@Component({
    selector: 'app-searchCalib',
    templateUrl: '../html/searchQCCalibrations.html'
})

export class SearchQCCalibrationsComponent implements AfterContentInit, OnDestroy {

    searchBO: SearchQCCalibrationsBO = new SearchQCCalibrationsBO();
    pageTitle: string = PageTitle.searchQCCalibrations;
    statusList: Array<any> = [];

    qcInstrTypesInfo: LookupInfo;
    @ViewChild('qcInstrTypes', { static: false }) qcInstrTypes: LookupComponent;
    qcParameterInfo: LookupInfo;
    @ViewChild('qcParameter', { static: false }) qcParameter: LookupComponent;
    qcInstrInfo: LookupInfo;
    @ViewChild('qcInstr', { static: false }) qcInstr: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    getDateForIni: Date = new Date();


    headersData: any;
    dataSource: any;
    actions: Array<string> = [];
    totalRecords: number;
    instCondition: string;
    searchResult: any = [];
    searchBy: string = SearchPageTooltip.srchQcCalib;
    hasExpCap: boolean = false;
    removeActions = { headerName: 'SEARCH_QC_CALIB', MNG_ARDS: "showManageArds", MANAGE_GP_TECH: 'statusCode', ASSIGN_PLANT: 'showAssignPlant', statusCode: 'ACT', VERSION: 'showNewVersion', CHGSTAT: 'statusCode', hasChild: 'NO' }


    subscription: Subscription = new Subscription();

    constructor(private _service: QCCalibrationsService, private _matDailog: MatDialog,
        private _limsContext: LIMSContextServices, private _confirm: ConfirmationService,
        private _alert: AlertService, private _router: Router, public _global: GlobalButtonIconsService,
        private modalService: SearchFilterModalService) { }

    ngAfterContentInit() {
        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "searchQCCalibrations") {
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'arrayDateTimeFormat', 'createdOn'));
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.menuEvt();
                this.closeModal("qcCalib-srch");
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "newVersionCalibParamset") {
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(QCCalibrationMessages.versionCalib);
                    this._router.navigate(['/lims/qcCalib/manage'], { queryParams: { id: resp.result.transKey } });
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "calibrationChangeStatusComments") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(QCCalibrationMessages.discConfirm);
                    this.searchFilter('Search', 'Y');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "cloneCalibrationParamSet") {
                if (resp.result.returnFlag == "SUCCESS") {
                    localStorage.setItem('SEARCH_CALIB_ACT', 'CLONE')
                    this._alert.success(QCCalibrationMessages.cloneCalib);
                    this._router.navigate(['/lims/qcCalib/manage'], { queryParams: { id: resp.result.encTranKey } });
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this.searchFilter('Search', 'Y');
        this.prepareLKPInstrumntType();
        this._service.getStatuslist(EntityCodes.calibParamSet);

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(EntityCodes.calibParamSet);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
        var index = this.actions.findIndex(x => x == "MANAGE_GP_TECH")
        if (index > -1)
            this.actions.splice(index, 1);
        if (capActions.createCap)
            this.actions.push(GridActions.Clone);
        // this.actions.push('UPD');
    }

    prepareLKPInstrumntType() {
        var condition: string = "CategoryCode = 'QCINST_TYPE'";

        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initUser, "UserActive = 1 AND StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.qcInstrTypesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.instrumentType, LookupCodes.getAllCategoryItems, LKPDisplayNames.instrumentType, 
            LKPDisplayNames.instrumentTypeCode, LookUpDisplayField.header, LKPPlaceholders.instrumentType, condition, "", "LIMS", 'instrumentstypes');
        this.qcParameterInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameter, LookupCodes.getCalibInstr, LKPDisplayNames.calibInTitle,
            LKPDisplayNames.systemCode, LookUpDisplayField.header, LKPPlaceholders.calibSystemCode);
        this.prepareInsLkp();
        this.systemCodeFromLkp();
        this.systemCodeToLkp();

    }

    prepareInsLkp() {
        this.qcInstrInfo = CommonMethods.PrepareLookupInfo(LKPTitles.instrument, LookupCodes.getAllEquipmentsInstruments,
            LKPDisplayNames.instrumentName, LKPDisplayNames.EquipmentCodeMP, LookUpDisplayField.code, LKPPlaceholders.analysisOccu, this.instCondition);
        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.getCalibInstr,
            LKPDisplayNames.status, LKPDisplayNames.solution, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
    }

    getInstruments(evt) {
        if (CommonMethods.hasValue(this.qcInstr)) {
            this.instCondition = null;
            this.qcInstr.clear();
        }
        if (CommonMethods.hasValue(evt.val))
            this.instCondition = "EQP_CAT_CODE = 'QCINST_TYPE'" + " AND EQP_TYPE_CODE ='" + evt.val.code + "'";
        this.prepareInsLkp();
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'instrumentTypeDesc', "header": "Instrument Type", cell: (element: any) => `${element.instrumentTypeDesc}`, width: "minWidth-40per" });
        this.headersData.push({ "columnDef": 'title', "header": "Title", cell: (element: any) => `${element.title}`, width: "maxWidth-25per" });
        this.headersData.push({ "columnDef": 'assignedInstruments', "header": "No. of Instruments assigned", cell: (element: any) => `${element.assignedInstruments}`, width: "maxWidth-20per" });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    searchFilter(type: string, init: string = 'N') {

        // var obj: SearchQCCalibrationsBO = new SearchQCCalibrationsBO();
        var key: string = SearchBoSessions['qcCalibrationsBO_' + this._limsContext.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            this.searchBO = SearchBoSessions.getSearchAuditBO(key);
            // this.searchBO.statusID = obj.statusID;
            // this.searchBO.InstrumentType = obj.InstrumentType;
            // this.searchBO.instrument = obj.instrument;
            // this.searchBO.pageIndex = obj.pageIndex;

            // this.currentSelectedIndex = Number(obj.pageIndex);

            if (this.searchBO.InstrumentType)
                setTimeout(() => {
                    this.qcInstrTypes.setRow(this.searchBO.InstrumentType, this.searchBO.instrument);
                }, 200);
            if (this.searchBO.instrumentName) {
                setTimeout(() => {
                    this.qcInstr.setRow(this.searchBO.instrumentID, this.searchBO.instrumentName);
                }, 200);
            }
            // if (this.searchBO.calibrationName) {
            //     setTimeout(() => {
            //         this.qcParameter.setRow(this.searchBO.calibrationID, this.searchBO.calibrationName);
            //     }, 200);
            // }
            if (CommonMethods.hasValue(this.searchBO.calibrationIDName))
                this.systemCode.setRow(this.searchBO.calibrationID, this.searchBO.calibrationIDName);
            if (CommonMethods.hasValue(this.searchBO.calibrationIDToName))
                this.systemCodeTo.setRow(this.searchBO.calibrationIDTo, this.searchBO.calibrationIDName);
            if (CommonMethods.hasValue(this.searchBO.calibrationIDFromName))
                this.systemCodeFrom.setRow(this.searchBO.calibrationIDFrom, this.searchBO.calibrationIDFromName);
            if(CommonMethods.hasValue(this.searchBO.initiatedBy))
                this.intiatedUser.setRow(this.searchBO.initiatedBy,this.searchBO.initiatedByName);
        }
        else {
            if (!this.controlValidate(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type != 'Search') {
                if (CommonMethods.hasValue(this.searchBO.statusID))
                    this.searchBO.statusID = 0;

                this.searchBO = new SearchQCCalibrationsBO();
                this.searchBO.pageIndex = 0;
                this.qcInstrTypes.clear();
                // this.qcParameter.clear();
                this.qcInstr.clear();
                // this.systemCodeTo.clear();
                // this.systemCodeFrom.clear();
                // this.systemCode.clear();
                this.intiatedUser.clear();
            }

            if (init != 'I') {
                this.searchBO.pageIndex = 0;
                environment.pageIndex = '0';
            }

            // obj.pageIndex = this.currentSelectedIndex;
            // obj.statusID = this.searchBO.statusID;
            // obj.InstrumentType = search
            // this.searchBO.calibrationIDFrom = this.systemCodeFrom.selectedId;
            // this.searchBO.calibrationIDTo = this.systemCodeTo.selectedId;
            // this.searchBO.calibrationIDFromName = this.systemCodeFrom.selectedText;
            // this.searchBO.calibrationIDToName = this.systemCodeTo.selectedText;
            // this.searchBO.calibrationID = this.systemCode.selectedId;
            // this.searchBO.calibrationIDName = this.systemCode.selectedText;
            this.searchBO.initiatedBy = this.intiatedUser.selectedId;
            this.searchBO.initiatedByName = this.intiatedUser.selectedText;
            this.searchBO.initiatedOn = dateParserFormatter.FormatDate(this.searchBO.initiatedOn,'date');

            SearchBoSessions.setSearchAuditBO(key, this.searchBO);
        }

        this._service.searchQCCalibrations(this.searchBO);

    }


    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.calibParamSet;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchBO.InstrumentType))
            condition = condition + " AND InstrumentTypeID = " + this.searchBO.InstrumentType;
        if (CommonMethods.hasValue(this.searchBO.statusID))
            condition = condition + " AND StatusID = " + this.searchBO.statusID;
        _modal.componentInstance.condition = condition;

    }

    onActionClicked(evt: any) {
        if (evt.action == "ASSIGN_PLANT") {
            const _plantModal = this._matDailog.open(ChangePlantComponent, { width: "60%" });
            _plantModal.disableClose = true;
            _plantModal.componentInstance.encID = evt.val.encCalibParamID;
        }
        else if (evt.action == 'ASSIGN_INST') {

            const model = this._matDailog.open(AssignInstrumentComponent, { width: "60%" })
            model.disableClose = true;
            model.componentInstance.instrObj.encCalibParamID = evt.val.encCalibParamID;
            model.afterClosed().subscribe(res => {
                this.searchFilter('Search', 'Y');
            })
        }
        else if (evt.action == GridActions.Clone) {
            this._service.cloneCalibrationParamSet(evt.val.encCalibParamID);
            return;
        }
        else {
            if (evt.action == 'VERSION') {
                this._service.newVersionCalibParamset(evt.val.encCalibParamID);
                return;
            }
            else if (evt.action == 'CHGSTAT') {
                this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
                    if (result) {
                        const model = this._matDailog.open(addCommentComponent, { width: "600px" })
                        model.disableClose = true;
                        model.afterClosed().subscribe(res => {
                            if (res.result) {
                                var obj: CommentsBO = new CommentsBO();
                                obj.encEntityActID = evt.val.encCalibParamID;
                                obj.entityCode = EntityCodes.calibParamSet;
                                obj.comment = res.val;
                                this._service.calibrationChangeStatusComments(obj);
                                return;
                            }
                        })
                    }

                })
                return;
            }
            else if (evt.action == "ASSIGN_STP")
                localStorage.setItem('SEARCH_CALIB_ACT', 'ASSIGN_STP')
            else if (evt.action == "MANAGE_GP_TECH")
                localStorage.setItem('SEARCH_CALIB_ACT', 'MANAGE_GP_TECH')
            else if (evt.action == "VIE")
                localStorage.setItem('SEARCH_CALIB_ACT', 'VIEW')
            if (evt.action == "MNG_ARDS") {
                const model = this._matDailog.open(ManageArdsDocumentsComponent, CommonMethods.modalFullWidth);
                model.componentInstance.encCalibParamID = evt.val.encCalibParamID;
            }
            else
                this._router.navigate(['/lims/qcCalib/view'], { queryParams: { id: evt.val.encCalibParamID } });
        }
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo) && CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "CalibParamID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.getCalibInstr,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom) && CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "CalibParamID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.getCalibInstr,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.qcInstrTypes.selectedId))
            this.searchResult.push({ code: "INST_TYPE", name: "Instrument Type: " + this.qcInstrTypes.selectedText });
        if (CommonMethods.hasValue(this.searchBO.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.searchBO.statusID)[0].status });
        if (CommonMethods.hasValue(this.qcInstr.selectedId))
            this.searchResult.push({ code: 'INST', name: "Instrument ID: " + this.qcInstr.selectedText });
        // if (CommonMethods.hasValue(this.qcParameter.selectedId))
        //     this.searchResult.push({ code: "SYS_CODE", name: "Parameter System Code : " + this.qcParameter.selectedText });
        if (CommonMethods.hasValue(this.searchBO.title))
            this.searchResult.push({ code: "TITLE", name: "Title: " + this.searchBO.title });
        // if (CommonMethods.hasValue(this.validityTo))
        //     this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.validityTo, 'date') });
        // if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
        //     this.searchResult.push({ code: "SYSTEM_CODE_FROM", name: "System Code From: " + this.systemCodeFrom.selectedText })
        // if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
        //     this.searchResult.push({ code: "SYSTEM_CODE_To", name: "System Code To: " + this.systemCodeTo.selectedText })
        // if (CommonMethods.hasValue(this.systemCode.selectedId))
        //     this.searchResult.push({ code: "SYSTEM_CODE", name: "System Code: " + this.systemCode.selectedText })
        if (CommonMethods.hasValue(this.searchBO.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.searchBO.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
    }

    clearOption(code, index) {
        if (code == "INST_TYPE")
            this.qcInstrTypes.clear();
        else if (code == "STATUS")
            this.searchBO.statusID = null;
        else if (code == "INST")
            this.qcInstr.clear();
        else if (code == "TITLE")
            this.searchBO.title = null;
        // else if (code == "SYSTEM_CODE_FROM")
        //     this.systemCodeFrom.clear();
        // else if (code == "SYSTEM_CODE_To")
        //     this.systemCodeTo.clear();
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        // else if (code == 'SYSTEM_CODE')
        //     this.systemCode.clear();
        else if (code == "INITIATED_ON")
            this.searchBO.initiatedOn = null;
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();

        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    onPageIndexClicked(val) {
        environment.pageIndex = val;
        this.searchBO.pageIndex = val;
        this.searchFilter('Search', 'I');
    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (this.qcInstrTypes) {
            this.searchBO.InstrumentType = this.qcInstrTypes.selectedId;
            this.searchBO.instrument = this.qcInstrTypes.selectedText;
        }
        if (this.qcParameter) {
            this.searchBO.calibrationID = this.qcParameter.selectedId;
            this.searchBO.calibrationName = this.qcParameter.selectedText;
        }
        if (this.qcInstr) {
            this.searchBO.instrumentID = this.qcInstr.selectedId;
            this.searchBO.instrumentName = this.qcInstr.selectedText;
        }
        if (!CommonMethods.hasValue(this.searchBO.statusID) && (!CommonMethods.hasValue(this.searchBO.InstrumentType)
            && !CommonMethods.hasValue(this.searchBO.calibrationID) && !CommonMethods.hasValue(this.searchBO.instrumentID)
            && !CommonMethods.hasValue(this.searchBO.title) && !CommonMethods.hasValue(this.searchBO.advanceSearch) 
            && !CommonMethods.hasValue(this.searchBO.initiatedOn) && !CommonMethods.hasValue(this.intiatedUser.selectedId) && type != 'ALL'))
            isVal = false;

        return isVal;
    }

    selectLkpData(evt: any, type: string) {
        if (type == "INSTR_TYPE") {
            this.searchBO.InstrumentType = evt.val ? evt.val.id : null;
        }
        else if (type == "INSTR") {
            this.searchBO.instrumentID = evt.val ? evt.val.id : null;
        }
        else if (type == "PARAM") {
            this.searchBO.calibrationID = evt.val ? evt.val.id : null;
        }

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}