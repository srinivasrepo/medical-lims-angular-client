import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { StockSolutionsService } from 'src/app/stockSolution/service/stockSolutions.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Router } from '@angular/router';
import { RinisingSolutionsService } from '../services/rinsingSolutions.service';
import { Subscription } from 'rxjs';
import { SearchRinsingSolutions } from '../model/rinsingSolutionsModel';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { RinsingSolutionsMessages } from '../messages/rinsingSolutionsMessages';
import { GridActions, EntityCodes, PageUrls, SearchPageTooltip, LookupCodes, CapabilityActions } from 'src/app/common/services/utilities/constants';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { MatDialog } from '@angular/material';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPDisplayNames, LKPTitles, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';

@Component({
    selector: 'ser-rin',
    templateUrl: '../html/searchRinsingSolutions.html'
})

export class SearchRinsingSolutionsComponent {

    totalNoOfRows: number;
    headers: any = [];
    dataSource: any;
    gridActions: any = [GridActions.view];
    statusDetailsList: any;
    usageList: any;
    pageTitle: string = PageTitle.searchRinsingSolutions;
    searchObj: SearchRinsingSolutions = new SearchRinsingSolutions();

    searchResult: any = [];
    searchBy: string = SearchPageTooltip.srchRinsingSol;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    batchNumberInfo: LookupInfo;
    getDateForIni: Date = new Date();
    @ViewChild('batchNumber', { static: true }) batchNumber: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;
    hasExpCap: boolean = false;
    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, private _rinsingService: RinisingSolutionsService, private _matDailog: MatDialog,
        public _global: GlobalButtonIconsService, private _router: Router, private _limsContextService: LIMSContextServices,
        private modalService: SearchFilterModalService, private _limstitle: LIMSContextServices) { }

    ngAfterViewInit() {
        this.subscription = this._rinsingService.rinsingSolSubject.subscribe(resp => {
            if (resp.purpose == "searchRinsingSolutionsData") {
                this.totalNoOfRows = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList,
                    "filterTwiceCol", ["useBeforeDate", "createdOn"]));
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.menuEvt();
                this.closeModal("rinsing-srch");
            }
            else if (resp.purpose == "getStatusList")
                this.statusDetailsList = resp.result;

            else if (resp.purpose == "USAGE_TYPE")
                this.usageList = resp.result;
        })

        this._rinsingService.getStatusList(EntityCodes.rinsingSolutions);
        this._rinsingService.getCategoryItemsByCatCode('USAGE_TYPE');
        this.prepareHeader();
        this.prepareLkp();
        this.searchRinsingSol('ALL', 'A');

        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.rinsingSolutions);
        this.gridActions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
    }

    searchRinsingSol(type: string, init: string = 'B') {

        var obj: SearchRinsingSolutions = new SearchRinsingSolutions();
        var key: string = SearchBoSessions['rinsingSolutionBO_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.searchObj = obj;
            this.searchObj.statusID = obj.statusID;
            this.searchObj.pageIndex = Number(obj.pageIndex);
            this.searchObj.usageType = obj.usageType;
            if (CommonMethods.hasValue(obj.solutionIDFrom))
                this.systemCodeFrom.setRow(obj.solutionIDFrom, obj.solutionIDFromName);
            if (CommonMethods.hasValue(obj.solutionIDTo))
                this.systemCodeTo.setRow(obj.solutionIDTo, obj.solutionIDToName);
            if (CommonMethods.hasValue(obj.batchNumberID))
                this.batchNumber.setRow(obj.batchNumberID, obj.batchNumberName);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.intiatedUser.setRow(obj.initiatedBy, obj.initiatedByName);
            if(CommonMethods.hasValue(obj.solutionID))
                this.systemCode.setRow(obj.solutionID,obj.solutionName);
        }
        else {
            if (type == 'ALL') {
                this.searchObj.statusID = this.searchObj.initiatedOn = this.searchObj.usageType = this.searchObj.nameOfTheSolution = this.searchObj.stpNumber = this.searchObj.advanceSearch = this.searchObj.validityFrom = this.searchObj.validityTo = null;
                this.batchNumber.clear();
                this.systemCodeTo.clear();
                this.systemCodeFrom.clear();
                this.intiatedUser.clear();
                this.systemCode.clear();
            }
            if (type == "SEARCH" && init == "B") {
                var errmsg: string = this.validate();
                if (CommonMethods.hasValue(errmsg))
                    return this._alert.warning(errmsg);
            }

            if (init != 'P')
                this.searchObj.pageIndex = 0;

            obj = this.searchObj;
            obj.pageIndex = this.searchObj.pageIndex;
            obj.statusID = this.searchObj.statusID;
            obj.usageType = this.searchObj.usageType;
            obj.batchNumberName = this.batchNumber.selectedText;
            obj.batchNumberID = this.searchObj.batchNumberID = this.batchNumber.selectedId;
            obj.solutionIDFrom = this.searchObj.solutionIDFrom = this.systemCodeFrom.selectedId;
            obj.solutionIDFromName = this.systemCodeFrom.selectedText;
            obj.solutionIDTo = this.searchObj.solutionIDTo = this.systemCodeTo.selectedId;
            obj.solutionIDToName = this.systemCodeTo.selectedText;
            obj.initiatedBy = this.searchObj.initiatedBy = this.intiatedUser.selectedId;
            obj.initiatedByName = this.searchObj.initiatedByName = this.intiatedUser.selectedText;
            obj.initiatedOn = this.searchObj.initiatedOn = dateParserFormatter.FormatDate(this.searchObj.initiatedOn, "date");
            obj.solutionID = this.searchObj.solutionID = this.systemCode.selectedId;
            obj.solutionName = this.searchObj.solutionName = this.systemCode.selectedText;

            SearchBoSessions.setSearchAuditBO(key, obj);

        }
        this._rinsingService.searchRinsingSolutionsData(this.searchObj);
    }

    prepareHeader() {
        this.headers.push({ "columnDef": 'solutionName', "header": "Name of the Solution", cell: (element: any) => `${element.solutionName}`, width: 'maxWidth-40per' });
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' });
        this.headers.push({ "columnDef": 'useBeforeDate', "header": "Valid Up to", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-15per' });
        this.headers.push({ "columnDef": 'stpNumber', "header": "STP Number", cell: (element: any) => `${element.stpNumber}`, width: 'maxWidth-15per' });
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    prepareLkp() {
        var batchNumCondition = "EntityCode = 'RINSING_SOL'";
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initUser, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');

        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.searchRinsingSolutions,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
        this.systemCodeFromLkp();
        this.systemCodeToLkp();
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "SolutionID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.searchRinsingSolutions,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "SolutionID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.searchRinsingSolutions,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }


    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.rinsingSolutions;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchObj.statusID)) {
            condition = condition + " AND StatusID = " + this.searchObj.statusID;
        }
        if (CommonMethods.hasValue(this.searchObj.usageType))
            condition = condition + ' AND UsageTypeID = ' + this.searchObj.usageType;
        _modal.componentInstance.condition = condition;

    }

    clear() {
        this.searchObj.statusID = this.searchObj.usageType = null;
    }

    onActionCLicked(evt) {
        localStorage.setItem("viewRinsingSolution", evt.val.encSolutionID);
        this._router.navigate(['lims/rinsingSol/manage'], { queryParams: { id: evt.val.encSolutionID } });
    }

    validate() {
        if (!CommonMethods.hasValue(this.searchObj.statusID) && !CommonMethods.hasValue(this.searchObj.usageType)
            && !CommonMethods.hasValue(this.searchObj.nameOfTheSolution) && !CommonMethods.hasValue(this.searchObj.stpNumber)
            && !CommonMethods.hasValue(this.batchNumber.selectedId) && !CommonMethods.hasValue(this.systemCodeFrom.selectedId)
            && !CommonMethods.hasValue(this.searchObj.validityFrom) && !CommonMethods.hasValue(this.searchObj.validityTo)
            && !CommonMethods.hasValue(this.searchObj.advanceSearch) && !CommonMethods.hasValue(this.systemCodeTo.selectedId)
            && !CommonMethods.hasValue(this.searchObj.initiatedOn) && !CommonMethods.hasValue(this.intiatedUser.selectedId)
            && !CommonMethods.hasValue(this.systemCode.selectedId))
            return RinsingSolutionsMessages.searchMsg;
    }


    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.searchObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchObj.advanceSearch });
        if (CommonMethods.hasValue(this.searchObj.nameOfTheSolution))
            this.searchResult.push({ code: "SOL_NAME", name: "Name of the Solution: " + this.searchObj.nameOfTheSolution });
        if (CommonMethods.hasValue(this.searchObj.usageType))
            var obj = this.searchResult.push({ code: 'USAGE', name: "Usage Type: " + this.usageList.filter(x => x.catItemID == this.searchObj.usageType)[0].catItem });
        if (CommonMethods.hasValue(this.searchObj.stpNumber))
            this.searchResult.push({ code: 'STP_NUM', name: "STP Number: " + this.searchObj.stpNumber });
        if (CommonMethods.hasValue(this.batchNumber.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.batchNumber.selectedText });
        if (CommonMethods.hasValue(this.searchObj.validityFrom))
            this.searchResult.push({ code: "VALID_FROM", name: "Validity From: " + dateParserFormatter.FormatDate(this.searchObj.validityFrom, 'date') });
        if (CommonMethods.hasValue(this.searchObj.validityTo))
            this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.searchObj.validityTo, 'date') });
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_FROM", name: "System Code From: " + this.systemCodeFrom.selectedText })
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_To", name: "System Code To: " + this.systemCodeTo.selectedText });
        if (CommonMethods.hasValue(this.searchObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusDetailsList.filter(x => x.statusID == this.searchObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.searchObj.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.searchObj.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated BY: " + this.intiatedUser.selectedText })
        if (CommonMethods.hasValue(this.systemCode.selectedId))
            this.searchResult.push({ code: "SYS_CODE", name: "System Code: " + this.systemCode.selectedText })
    }

    clearOption(code, index) {
        if (code == "SOL_NAME")
            this.searchObj.nameOfTheSolution = null;
        else if (code == "STATUS")
            this.searchObj.statusID = null;
        else if (code == "STP_NUM")
            this.searchObj.stpNumber = null;
        else if (code == "USAGE")
            this.searchObj.usageType = null;
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "VALID_FROM")
            this.searchObj.validityFrom = null;
        else if (code == "VALID_TO")
            this.searchObj.validityTo = null;
        else if (code == "SYSTEM_CODE_FROM")
            this.systemCodeFrom.clear();
        else if (code == "SYSTEM_CODE_To")
            this.systemCodeTo.clear();
        else if (code == "ADV_SRCH")
            this.searchObj.advanceSearch = null;
        else if (code == "INITIATED_ON")
            this.searchObj.initiatedOn = null;
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();
        else if (code == "SYS_CODE")
            this.systemCode.clear();

        this.searchResult.splice(index, 1);
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    onPage(evt) {
        this.searchObj.pageIndex = evt;
        this.searchRinsingSol('SEARCH', 'P');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}