import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SamplePlanService } from '../service/samplePlan.service';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { SearchCloseShiftBo } from '../model/samplePlanModel';
import { SearchPageTooltip, EntityCodes, LimsRespMessages, CapabilityActions, GridActions, LookupCodes } from 'src/app/common/services/utilities/constants';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { Router } from '@angular/router';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-search-closeShit',
    templateUrl: '../html/searchShiftClosed.html'
})

export class SearchCloseShiftActivitiesComponent {


    pageTitle: string = PageTitle.searchCloseShift;
    statusList: any;
    srchTooltip: string = SearchPageTooltip.srchCloseShift;
    searchFil: any = [];
    totalNoOfRows: number;
    headersData: any;
    dataSource: any = [];
    actions: any;

    createdByInfo: LookupInfo;
    @ViewChild('createdBy', { static: true }) createdBy: LookupComponent;
    shiftIDFromInfo: LookupInfo;
    @ViewChild('shiftIDFrom', { static: true }) shiftIDFrom: LookupComponent;
    shiftIDToInfo: LookupInfo;
    @ViewChild('shiftIDTo', { static: true }) shiftIDTo: LookupComponent;
    shiftIDFromCondition: string;
    shiftIDToCondition: string;
    hasExpCap: boolean = false;
    searchBO: SearchCloseShiftBo = new SearchCloseShiftBo();

    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, public _global: GlobalButtonIconsService,
        private _spService: SamplePlanService, private modalService: SearchFilterModalService,
        private _limstitle: LIMSContextServices, private _router: Router, private _matDailog: MatDialog) { }

    ngAfterViewInit() {
        this.subscription = this._spService.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "searchCloseShift") {
                this.totalNoOfRows = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateTimeFormat", "createdOn"));
                this.menuEvt();
                this.closeModal('srch-closeShift');
            }
        })

        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.closeShift);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
        this.prepareLkp();
        this.prepareHeaders();
        this._spService.getStatuslist(EntityCodes.closeShift);
        this.searchFilter("ALL", 'A');
    }

    searchFilter(type: string, init: string = "B") {
        var sessionObj: SearchCloseShiftBo = new SearchCloseShiftBo();
        var key: string = SearchBoSessions['searchShiftCloseBO_' + this._limstitle.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            sessionObj = SearchBoSessions.getSearchAuditBO(key);

            this.searchBO = sessionObj;
            if (CommonMethods.hasValue(this.searchBO.createdUserRoleID))
                this.createdBy.setRow(this.searchBO.createdUserRoleID, this.searchBO.createdUserRole);
            if (CommonMethods.hasValue(this.searchBO.shiftIDFrom)) {
                this.shiftIDFrom.setRow(this.searchBO.shiftIDFrom, this.searchBO.shiftIDFromCode);
                this.shiftIDToLkp();
            }
            if (CommonMethods.hasValue(this.searchBO.shiftIDTo)) {
                this.shiftIDTo.setRow(this.searchBO.shiftIDTo, this.searchBO.shiftIDToCode);
                this.shiftIDFromLkp();
            }

        }
        else {
            if (type == "ALL") {
                this.searchBO = new SearchCloseShiftBo();
                this.createdBy.clear();
                this.shiftIDTo.clear();
                this.shiftIDFrom.clear();
            }

            else if (type == "Search" && init == "B") {
                var errmsg: string = this.validate();
                if (CommonMethods.hasValue(errmsg))
                    return this._alert.warning(errmsg);
            }

            else if (init != 'P')
                this.searchBO.pageIndex = 0;

            sessionObj = this.searchBO;
            sessionObj.createdUserRole = this.searchBO.createdUserRole = this.createdBy.selectedText;
            sessionObj.createdUserRoleID = this.searchBO.createdUserRoleID = this.createdBy.selectedId;
            if(CommonMethods.hasValue(this.createdBy) && this.createdBy.selectedData)
                sessionObj.userID = this.searchBO.userID = this.createdBy.selectedData.extColumn;
            sessionObj.shiftIDFrom = this.searchBO.shiftIDFrom = this.shiftIDFrom.selectedId;
            sessionObj.shiftIDFromCode = this.searchBO.shiftIDFromCode = this.shiftIDFrom.selectedText;
            sessionObj.shiftIDTo = this.searchBO.shiftIDTo = this.shiftIDTo.selectedId;
            sessionObj.shiftIDToCode = this.searchBO.shiftIDToCode = this.shiftIDTo.selectedText;
            sessionObj.dateFrom = this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date');
            sessionObj.dateTo = this.searchBO.dateTo = dateParserFormatter.FormatDate(this.searchBO.dateTo, 'date');
            sessionObj.isHODApp = this.searchBO.isHODApp;
            SearchBoSessions.setSearchAuditBO(key, sessionObj);
        }

        this._spService.searchCloseShift(this.searchBO);
    }

    validate() {
        if (!CommonMethods.hasValue(this.searchBO.statusID) && !CommonMethods.hasValue(this.searchBO.advanceSearch)
            && !CommonMethods.hasValue(this.createdBy.selectedId) && !CommonMethods.hasValue(this.searchBO.dateFrom)
            && !CommonMethods.hasValue(this.searchBO.dateTo) && !CommonMethods.hasValue(this.shiftIDFrom.selectedId)
            && !CommonMethods.hasValue(this.searchBO.shiftIDTo) && !CommonMethods.hasValue(this.shiftIDTo.selectedId)
            && !CommonMethods.hasValue(this.searchBO.isHODApp))
            return LimsRespMessages.chooseOne;
    }

    prepareLkp() {
        this.createdByInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.getQCUsers,
            LKPDisplayNames.analystName, LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.shiftIDFromLkp();
        this.shiftIDToLkp();
    }

    shiftIDFromLkp() {
        if (CommonMethods.hasValue(this.shiftIDTo.selectedId))
            this.shiftIDFromCondition = "ShiftID < '" + this.shiftIDTo.selectedId + "'";
        else this.shiftIDFromCondition = "";

        this.shiftIDFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.getCloseShift,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.shiftIDFromCondition);

    }

    shiftIDToLkp() {
        if (CommonMethods.hasValue(this.shiftIDFrom.selectedId))
            this.shiftIDToCondition = "ShiftID > '" + this.shiftIDFrom.selectedId + "'"
        else
            this.shiftIDFromCondition = "";
        this.shiftIDToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.getCloseShift,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.shiftIDToCondition);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: "requestCode", header: "System Code", cell: (element: any) => `${element.requestCode}` });
        this.headersData.push({ columnDef: "createdOn", header: "Created On", cell: (element: any) => `${element.createdOn}` });
        this.headersData.push({ columnDef: "createdBy", header: "Analyst Name", cell: (element: any) => `${element.createdBy}` });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}` });
    }

    onActionCLicked(evt) {
        if (evt.action == "VIE") {
            localStorage.setItem("viewShiftClose", evt.val.encShiftID);
            this._router.navigateByUrl('lims/samplePlan/viewCloseShift?id=' + evt.val.encShiftID);
        }
    }

    onPage(evt) {
        this.searchBO.pageIndex = evt;
        this.searchFilter('SEARCH', 'P');
    }

    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.createdBy.selectedId))
            this.searchFil.push({ code: "CRE_BY", name: "Analyst Name: " + this.createdBy.selectedText });
        if (CommonMethods.hasValue(this.shiftIDFrom.selectedId))
            this.searchFil.push({ code: "SHIFT_FROM", name: "System Code From : " + this.shiftIDFrom.selectedText });
        if (CommonMethods.hasValue(this.shiftIDTo.selectedId))
            this.searchFil.push({ code: "SHIFT_TO", name: "System Code To: " + this.shiftIDTo.selectedText });
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.searchBO.dateTo, 'date') });
        if (CommonMethods.hasValue(this.searchBO.statusID))
            this.searchFil.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.searchBO.statusID)[0].status });
        if (CommonMethods.hasValue(this.searchBO.isHODApp))
            this.searchFil.push({ code: 'HOD', name: "Search Text: HOD Closed Records" });
    }

    clearOption(code, index) {
        if (code == "DATE_FROM")
            this.searchBO.dateFrom = null;
        else if (code == "DATE_TO")
            this.searchBO.dateTo = null;
        else if (code == "STATUS")
            this.searchBO.statusID = null;
        else if (code == "CRE_BY")
            this.createdBy.clear();
        else if (code == "SHIFT_FROM")
            this.shiftIDFrom.clear();
        else if (code == "SHIFT_TO")
            this.shiftIDTo.clear();
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        else if (code == 'HOD')
            this.searchBO.isHODApp = false;
        this.searchFil.splice(index, 1);
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.closeShift;

        var sessionObj: SearchCloseShiftBo = new SearchCloseShiftBo();
        var key: string = SearchBoSessions['searchShiftCloseBO_' + this._limstitle.getEntityType()];

        sessionObj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(sessionObj.userID))
            condition = condition + " AND UserID = " + sessionObj.userID;
        if (CommonMethods.hasValue(sessionObj.shiftIDFrom))
            condition = condition + " AND ID <= " + sessionObj.shiftIDFrom;
        if (CommonMethods.hasValue(sessionObj.shiftIDTo))
            condition = condition + " AND ID >= " + sessionObj.shiftIDTo;
        if (CommonMethods.hasValue(sessionObj.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            condition = condition + " AND StatusID = '" + obj[0].statusCode + "'";
        }
        if (CommonMethods.hasValue(sessionObj.dateFrom))
            condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(sessionObj.dateTo))
            condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.searchBO.dateFrom.setDate(this.searchBO.dateFrom.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(sessionObj.isHODApp))
            condition = condition + + " AND IsHODApp = 1";
        _modal.componentInstance.condition = condition;
    }

    hasSearchVal() {
        var obj = this.searchFil.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }
    openModal(id: string) {
        this.modalService.open(id);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}