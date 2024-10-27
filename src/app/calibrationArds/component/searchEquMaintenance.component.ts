import { Component, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { CalibrationArdsService } from '../services/calibrationArds.service';
import { Router } from '@angular/router';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { EntityCodes, CapabilityActions, LookupCodes, SearchPageTooltip, GridActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { SearchEquipmentMaintenance, GetEquipmentType } from '../modal/calibrationArdsModal';
import { CalibrationArdsMessages } from '../messages/calibrationArdsMessages';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';
import { CreateNewCalibrationComponent } from './createNewCalibration.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';

@Component({
    selector: 'equ-main',
    templateUrl: '../html/searchEquMaintenance.html'
})

export class SearchEquMaintenanceComponent {

    pageTitle: string = PageTitle.searchEquMaintenance;
    condition: string = "1=2";
    headers: any = [];
    dataSource: any = [];
    actions: any = [];
    totalRecords: number = 0;
    statusList: any;
    equipmentList: any;
    typeList: any;
    schTypeList: any;
    qcInstrTypesInfo: LookupInfo;
    searchResult: any = [];
    searchBy: string = SearchPageTooltip.srchEqpMain;
    hasExpCap: boolean = false;
    arNumInfo: LookupInfo;
    @ViewChild('arNumbers', { static: true }) arNumbers: LookupComponent;
    qcParameterInfo: LookupInfo;
    @ViewChild('qcParameter', { static: false }) qcParameter: LookupComponent;
    @ViewChild('qcInstrTypes', { static: false }) qcInstrTypes: LookupComponent;

    searchEquObj: SearchEquipmentMaintenance = new SearchEquipmentMaintenance();
    removeActions: any = { headerName: 'SearcfInstCalib', NEW_REQ: 'hasCreateNewRequest' }

    subscription: Subscription = new Subscription();


    constructor(private _calibService: CalibrationArdsService, private _route: Router, private _matDailog: MatDialog,
        public _global: GlobalButtonIconsService, private _alert: AlertService, private _confirmService: ConfirmationService,
        private _limsContextService: LIMSContextServices, private modalService: SearchFilterModalService) { }

    ngAfterViewInit() {
        this.subscription = this._calibService.calibrationArdsSubject.subscribe(resp => {
            if (resp.purpose == "getStatusList")
                this.statusList = resp.result;
            else if (resp.purpose == "searchEquipmentMaintenance") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList,
                    "filterTwiceDateCol", ["maintDate", "scheduleDate", 'calibrationDoneOn']));
                this.menuEvt();
                this.closeModal("eqp-srch");
            }
            else if (resp.purpose == "getEquipmentCategories") {
                this.equipmentList = resp.result;
                this.searchEquObj.category = this.equipmentList.filter(x => x.categoryCode == "QCINST_TYPE")[0].categoryID;
                this.condition = "EQP_CAT_CODE = 'QCINST_TYPE' AND STATUS_CODE IN ('ACT', 'OBSE', 'INACT')";
                this.prepareLKPInstrumntType();
                this.getType();
            }
            else if (resp.purpose == "getEquipmentTypesByCategory")
                this.typeList = resp.result;
            else if (resp.purpose == "getScheduleTypesByDeptCode") {
                this.schTypeList = resp.result.filter(x => x.schType == "Calibration" || x.schType == 'Daily Calibration');
                this.getType();
            }
            else if (resp.purpose == "generateNewRequest") {
                if (resp.result.returnFlag == "SUCCESS") {
                    this._route.navigateByUrl("/lims/calibArds/manage?id=" + resp.result.encTranKey);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this.prepareHeaders();
        this.prepareLKPInstrumntType();

        var act: CapabilityActions = this._limsContextService.getSearchActinsByEntityCode(EntityCodes.calibrationArds);
        this.actions = act.actionList.filter(x => x == 'VIE');
        this.hasExpCap = act.exportCap;
        // this.actions.push(GridActions.GenerateNew);
        this._calibService.getStatusList(EntityCodes.calibrationArds);
        this._calibService.getEquipmentCategories();
        this._calibService.getScheduleTypesByDeptCode();
        this.searchEquMain('ALL', 'A');
    }

    searchEquMain(type: string, init: string = 'B') {

        var sessionObj: SearchEquipmentMaintenance = new SearchEquipmentMaintenance();
        var key: string = SearchBoSessions['calibrationArdsBO_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            sessionObj = SearchBoSessions.getSearchAuditBO(key);
            this.searchEquObj = sessionObj;
            this.searchEquObj.pageIndex = Number(sessionObj.pageIndex);
            this.searchEquObj.type = sessionObj.type;
            if (CommonMethods.hasValue(sessionObj.equipmentID))
                this.qcInstrTypes.setRow(sessionObj.equipmentID, sessionObj.equipment);
            if (CommonMethods.hasValue(sessionObj.maintanceRptID))
                this.arNumbers.setRow(sessionObj.maintanceRptID, sessionObj.maintanceRptName);
            if (CommonMethods.hasValue(sessionObj.calibParamID))
                this.qcParameter.setRow(sessionObj.calibParamID, sessionObj.calibParamName);
            this.getType();
        }
        else {
            if (type == "ALL") {
                this.searchEquObj.schType = this.searchEquObj.dateFrom = this.searchEquObj.dateTo = this.searchEquObj.equipmentID
                    = this.searchEquObj.statusID = this.searchEquObj.type = this.searchEquObj.showDateCrossedRecords = this.searchEquObj.schDate = this.searchEquObj.advanceSearch = null;
                this.qcInstrTypes.clear();
                this.arNumbers.clear();
                this.qcParameter.clear();
                this.condition = "EQP_CAT_CODE = 'QCINST_TYPE' AND STATUS_CODE IN ('ACT', 'OBSE', 'INACT')";
                this.prepareLKPInstrumntType();
            }

            else if (type == "SEARCH" && init == "B") {
                var errmsg: string = this.validate();
                if (CommonMethods.hasValue(errmsg))
                    return this._alert.warning(errmsg);
            }
            if (init != 'P')
                this.searchEquObj.pageIndex = 0;
            sessionObj = this.searchEquObj;
            this.searchEquObj.dateFrom = dateParserFormatter.FormatDate(this.searchEquObj.dateFrom, "date");
            this.searchEquObj.dateTo = dateParserFormatter.FormatDate(this.searchEquObj.dateTo, "date");
            this.searchEquObj.schDate = dateParserFormatter.FormatDate(this.searchEquObj.schDate, "date");
            this.searchEquObj.equipmentID = this.qcInstrTypes.selectedId;
            this.searchEquObj.equipment = this.qcInstrTypes.selectedText;
            this.searchEquObj.maintanceRptID = this.arNumbers.selectedId;
            this.searchEquObj.maintanceRptName = this.arNumbers.selectedText;
            this.searchEquObj.calibParamID = this.qcParameter.selectedId;
            this.searchEquObj.calibParamName = this.qcParameter.selectedText;

            SearchBoSessions.setSearchAuditBO(key, sessionObj);
        }

        this._calibService.searchEquipmentMaintenance(this.searchEquObj);
    }

    validate() {
        if (!CommonMethods.hasValue(this.searchEquObj.schType) && !CommonMethods.hasValue(this.arNumbers.selectedId) && !CommonMethods.hasValue(this.searchEquObj.schDate)
            && !CommonMethods.hasValue(this.searchEquObj.dateFrom) && !CommonMethods.hasValue(this.searchEquObj.dateTo)
            && !CommonMethods.hasValue(this.searchEquObj.type) && !CommonMethods.hasValue(this.qcInstrTypes.selectedId)
            && !CommonMethods.hasValue(this.searchEquObj.statusID) && !CommonMethods.hasValue(this.searchEquObj.advanceSearch)
            && !CommonMethods.hasValue(this.qcParameter.selectedId) && !this.searchEquObj.showDateCrossedRecords)
            return CalibrationArdsMessages.searchEquip;
    }

    prepareHeaders() {
        this.headers.push({ "columnDef": 'type', "header": "Instrument Type", cell: (element: any) => `${element.type}`, width: "maxWidth-20per" });

        this.headers.push({ "columnDef": 'equipment', "header": "Equipment/Instrument Title/ID", cell: (element: any) => `${element.equipment}`, width: "maxWidth-30per" });
        this.headers.push({ "columnDef": 'scheduleDate', "header": "Schedule Date", cell: (element: any) => `${element.scheduleDate}`, width: "maxWidth-15per" });
        this.headers.push({ "columnDef": 'calibrationDoneOn', "header": "Calibration Done On", cell: (element: any) => `${element.calibrationDoneOn}`, width: "maxWidth-15per" });
        this.headers.push({ "columnDef": 'rptNumber', "header": "Calibration Ref. No.", cell: (element: any) => `${element.rptNumber}`, width: "maxWidth-15per" });
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-15per" });
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.searchEquObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchEquObj.advanceSearch });
        if (CommonMethods.hasValue(this.searchEquObj.schType))
            this.searchResult.push({ code: "SCH_TYP", name: "Schedule Type: " + this.schTypeList.filter(x => x.schTypeID == this.searchEquObj.schType)[0].schType });
        if (CommonMethods.hasValue(this.searchEquObj.type))
            this.searchResult.push({ code: "INST_TYP", name: "Instrument Type: " + this.typeList.filter(x => x.catItemID == this.searchEquObj.type)[0].catItem });
        if (CommonMethods.hasValue(this.searchEquObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.searchEquObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.qcInstrTypes.selectedId))
            this.searchResult.push({ code: 'INSTR', name: "Instrument ID: " + this.qcInstrTypes.selectedText });
        if (CommonMethods.hasValue(this.searchEquObj.schDate))
            this.searchResult.push({ code: "SCH_DATE", name: "Schdule Date: " + dateParserFormatter.FormatDate(this.searchEquObj.schDate, 'date') });
        if (CommonMethods.hasValue(this.searchEquObj.dateFrom))
            this.searchResult.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.searchEquObj.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.searchEquObj.dateTo))
            this.searchResult.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.searchEquObj.dateTo, 'date') });
        if (CommonMethods.hasValue(this.qcParameter.selectedId))
            this.searchResult.push({ code: "PARA_SET_REF_NUM", name: "Parameter Set Reference Number: " + this.qcParameter.selectedText })
        if (CommonMethods.hasValue(this.arNumbers.selectedId))
            this.searchResult.push({ code: "CAL_REF_NUM", name: "Calibration Reference Number: " + this.arNumbers.selectedText })
        if (this.searchEquObj.showDateCrossedRecords)
            this.searchResult.push({ code: "SHOW_ZER", name: "Show Date Crossed Records: Yes" });
    }

    clearOption(code, index) {
        if (code == "INST_TYP")
            this.searchEquObj.type = null;
        else if (code == "STATUS")
            this.searchEquObj.statusID = null;
        else if (code == "INSTR")
            this.qcInstrTypes.clear();
        else if (code == "CAL_REF_NUM")
            this.arNumbers.clear();
        else if (code == "SCH_DATE")
            this.searchEquObj.schDate = null;
        else if (code == "DATE_FROM")
            this.searchEquObj.dateFrom = null;
        else if (code == "DATE_TO")
            this.searchEquObj.dateTo = null;
        else if (code == "PARA_SET_REF_NUM")
            this.qcParameter.clear();
        else if (code == "ADV_SRCH")
            this.searchEquObj.advanceSearch = null;
        else if (code == "SHOW_ZER")
            this.searchEquObj.showDateCrossedRecords = false;
        else if (code == "SCH_TYP")
            this.searchEquObj.schType = null;

        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    prepareLKPInstrumntType() {
        this.arNumInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refNum, LookupCodes.getInstrumentCalibration, LKPDisplayNames.status,
            LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.caliRefNumber)

        this.qcParameterInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameter, LookupCodes.getCalibInstr, LKPDisplayNames.calibInTitle,
            LKPDisplayNames.systemCode, LookUpDisplayField.code, LKPPlaceholders.paraSetRefNumber, "StatusCode IN ('ACT', 'OBSE', 'INACT')");
        this.qcInstrTypesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.equipmentID, LookupCodes.getAllEquipmentsInstruments,
            LKPDisplayNames.equipmentTitle, LKPDisplayNames.equipmentID, LookUpDisplayField.code, LKPPlaceholders.equipmentID, this.condition, "", "LIMS", 'instrumentstypes');
    }

    getType() {
        var eqpObj: GetEquipmentType = new GetEquipmentType();
        if (CommonMethods.hasValue(this.searchEquObj.schType) && CommonMethods.hasValue(this.searchEquObj.category)) {
            eqpObj.schTypeID = this.searchEquObj.schType;
            eqpObj.categoryID = this.searchEquObj.category;
            this._calibService.getEquipmentTypesByCategory(eqpObj);
        }
    }

    getCondition(evt) {
        if (CommonMethods.hasValue(this.searchEquObj.type)) {
            var typeCode: string = this.typeList.filter(x => x.catItemID == evt)[0].catItemCode
            this.condition = "EQP_CAT_CODE = 'QCINST_TYPE' AND EQP_TYPE_CODE ='" + typeCode + "' AND STATUS_CODE IN ('ACT', 'OBSE', 'INACT')";
            this.prepareLKPInstrumntType();
        }
    }

    onActionClicked(evt) {
        if (evt.action == 'VIE') {
            localStorage.setItem('CALIB_PAGE', 'VIEW')
            this._route.navigateByUrl("/lims/calibArds/manage?id=" + evt.val.encMainRptID);
        }
        else {
            this._confirmService.confirm(CalibrationArdsMessages.generateNew).subscribe(resp => {
                if (resp)
                    this._calibService.generateNewRequest(evt.val.encMainRptID);
            })
        }
    }

    newInstrument(){
        this._matDailog.open(CreateNewCalibrationComponent,CommonMethods.modalFullWidth);
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.calibrationArds;
        var sessionObj: SearchEquipmentMaintenance = new SearchEquipmentMaintenance();
        var key: string = SearchBoSessions['calibrationArdsBO_' + this._limsContextService.getEntityType()];
        sessionObj = SearchBoSessions.getSearchAuditBO(key);
        if (SearchBoSessions.checkSessionVal(key)) {
            var condition: string = " AND 1 = 1";
            if (CommonMethods.hasValue(sessionObj.type))
                condition = condition + " AND InstrumentTypeID = " + sessionObj.type;
            if (CommonMethods.hasValue(sessionObj.equipmentID))
                condition = condition + " AND EquipmentID = " + sessionObj.equipmentID;
            if (CommonMethods.hasValue(sessionObj.schDate))
                condition = condition + " AND ScheduleDate = '" + dateParserFormatter.FormatDate(sessionObj.schDate, 'date') + "'";
            if (CommonMethods.hasValue(sessionObj.maintanceRptID))
                condition = condition + " AND MaintRptID = " + sessionObj.maintanceRptID;
            if (CommonMethods.hasValue(sessionObj.calibParamID))
                condition = condition + " AND CalibParamID = " + sessionObj.calibParamID;
            if (CommonMethods.hasValue(sessionObj.dateFrom))
                condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(sessionObj.dateFrom, 'date') + "'";
            if (CommonMethods.hasValue(sessionObj.dateTo))
                condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(sessionObj.dateTo.setDate(sessionObj.dateTo.getDate() + 1), 'date') + "'";
            if (CommonMethods.hasValue(sessionObj.statusID))
                condition = condition + " AND StatusID = " + sessionObj.statusID;
            _modal.componentInstance.condition = condition;
        }
    }

    onPage(evt) {
        this.searchEquObj.pageIndex = evt;
        this.searchEquMain('SEARCH', 'P');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}