import { Component, ViewChild } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { Subscription } from 'rxjs';
import { StockSolutionsService } from '../service/stockSolutions.service';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { StatusDetails, SearchStockDetails } from '../model/stockSolutionsModel';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, EntityCodes, GridActions, CapabilityActions, PageUrls, SearchPageTooltip } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { StockSolutionsMessages } from '../messages/stockSolutionsMessages';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Router } from '@angular/router';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { MatDialog } from '@angular/material';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';

@Component({
    selector: 'search-stock',
    templateUrl: '../html/searchStockSolution.html'
})

export class SearchStockSolutionComponent {

    totalNoOfRows: number;
    dataSource: any;
    headers: any = [];
    solCondition: string; hasCreateCap: boolean;
    statusDetailsList: Array<StatusDetails> = [];
    stockObj: SearchStockDetails = new SearchStockDetails();
    pageTitle: string = PageTitle.searchStockSolutionsRequest;
    uom: string;
    actions: any = [];
    hasSamDestructionCap: boolean;
    solutionInfo: LookupInfo;
    @ViewChild('solution', { static: true }) solution: LookupComponent;
    hasManageIndexCap: boolean;

    searchResult: any = [];
    searchBy: string = SearchPageTooltip.srchStockSol;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    batchNumberInfo: LookupInfo;
    instrumentTypeList: any;
    getDateForIni: Date = new Date();
    specCondition: string = "REQUEST_TYPE = \'CP\'";
    equpCondition = "EQP_CAT_CODE ='QCINST_TYPE'";
    @ViewChild('batchNumber', { static: true }) batchNumber: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: true }) equipment: LookupComponent;
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    hasExpCap: boolean = false;

    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, private _stockSolService: StockSolutionsService, private _contextService: LIMSContextServices,
        public _global: GlobalButtonIconsService, private _router: Router, private _limsContextService: LIMSContextServices,
        private _matDailog: MatDialog, private modalService: SearchFilterModalService) { }

    ngAfterViewInit() {
        this.subscription = this._stockSolService.stockSolSubject.subscribe(resp => {
            if (resp.purpose == "stockSearchStockSolutions") {
                this.totalNoOfRows = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList,
                    "filterTwiceCol", ["useBefore", "createdOn"]));
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.menuEvt();
                this.closeModal("stockSol-srch");

            }
            else if (resp.purpose == "getStatusList")
                this.statusDetailsList = resp.result;
            else if (resp.purpose == "QCINST_TYPE")
                this.instrumentTypeList = resp.result;
        })

        var capabilities: CapabilityActions = this._contextService.getSearchActinsByEntityCode(EntityCodes.stockSolution);



        var index = capabilities.actionList.findIndex(x => x == "MNG_CALIB_SOL_INDEX");

        if (index > -1) {
            capabilities.actionList.splice(index, 1);
            this.hasManageIndexCap = true;
        }
        this.actions = capabilities.actionList;
        this.hasExpCap = capabilities.exportCap;
        // this.actions.push('DISC')
        // this.hasCreateCap = capabilities.createCap;

        // this.actions.forEach((x, index) => {
        //     if (x == 'MNG_SAM_DESTRUCTION') {
        //         this.hasSamDestructionCap = true;
        //         this.actions.splice(index, 1);
        //     }
        // })
        this._stockSolService.getCatItemsByCatCode("QCINST_TYPE", "GET_ALL");
        this._stockSolService.getStatusList(EntityCodes.stockSolution);
        this.prepareLkp();
        this.searchStockSol("ALL", 'A');
        this.prepareHeader();
    }

    prepareLkp() {
        var batchNumCondition = "EntityCode = 'STOCK_SOL'";
        this.solCondition = "EntityCode = '" + EntityCodes.stockSolution + "'";
        this.solutionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getTestSolIndexMaterials,
            LKPDisplayNames.solution, LKPDisplayNames.solutionCode, LookUpDisplayField.header, LKPPlaceholders.nameOfTheSolMaterial, this.solCondition);
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameter, LookupCodes.getTests, LKPDisplayNames.parameter,
            LKPDisplayNames.parameterID, LookUpDisplayField.header, LKPPlaceholders.parameter, "REQUEST_TYPE = 'CP'", "", "LIMS");
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getQCInstruments,
            LKPDisplayNames.Equipment, LKPDisplayNames.EquipmentCode, LookUpDisplayField.code, LKPPlaceholders.calibration, this.equpCondition);
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initUser, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.searchCalibrationSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
        this.systemCodeToLkp();
        this.systemCodeFromLkp();
    }

    searchStockSol(type: string, init: string = 'B') {
        var obj: SearchStockDetails = new SearchStockDetails();
        var key: string = SearchBoSessions['stockSolutionBO_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.stockObj = obj;
            this.stockObj.statusID = obj.statusID;
            this.stockObj.pageIndex = Number(obj.pageIndex);
            this.stockObj.solutionID = obj.solutionID;
            this.stockObj.stockSolutionIDFrom = obj.stockSolutionIDFrom;
            this.stockObj.stockSolutionIDTo = obj.stockSolutionIDTo;
            this.stockObj.parameterID = obj.parameterID;
            this.stockObj.instrumentID = obj.instrumentID;
            this.stockObj.batchNumberID = obj.batchNumberID;
            this.stockObj.initiatedOn = obj.initiatedOn;

            if (CommonMethods.hasValue(obj.solutionID))
                this.solution.setRow(obj.solutionID, obj.solutionName);
            if (CommonMethods.hasValue(obj.instrumentID))
                this.equipment.setRow(obj.instrumentID, obj.instrumentName);
            if (CommonMethods.hasValue(obj.batchNumberID))
                this.batchNumber.setRow(obj.batchNumberID, obj.batchName);
            if (CommonMethods.hasValue(obj.parameterID))
                this.specifications.setRow(obj.parameterID, obj.parameterName);
            if (CommonMethods.hasValue(obj.stockSolutionIDFrom))
                this.systemCodeFrom.setRow(obj.stockSolutionIDFrom, obj.stockSolutionIDFromName);
            if (CommonMethods.hasValue(obj.stockSolutionIDTo))
                this.systemCodeTo.setRow(obj.stockSolutionIDTo, obj.stockSolutionIDToName);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.intiatedUser.setRow(obj.initiatedBy, obj.initiatedByName);
            if (CommonMethods.hasValue(obj.stockSolutionCode))
                this.systemCode.setRow(obj.stockSolutionCode, obj.stockSolutionCodeName);

        }
        else {
            if (type == 'ALL') {
                this.stockObj.statusID = this.stockObj.initiatedOn = this.stockObj.solutionID = this.stockObj.instrumentType = this.stockObj.advanceSearch = this.stockObj.validityFrom = this.stockObj.validityTo = null;
                this.solution.clear();
                this.systemCodeTo.clear();
                this.systemCodeFrom.clear();
                this.equipment.clear();
                this.specifications.clear();
                this.batchNumber.clear();
                this.intiatedUser.clear();
                this.systemCode.clear();
            }
            if (type == "SEARCH" && init == "B") {
                var errmsg: string = this.validate();
                if (CommonMethods.hasValue(errmsg))
                    return this._alert.warning(errmsg);
                else
                    this.stockObj.solutionID = this.solution.selectedId;
            }

            if (init != 'P')
                this.stockObj.pageIndex = 0;

            obj = this.stockObj;
            obj.pageIndex = this.stockObj.pageIndex;
            obj.statusID = this.stockObj.statusID;
            obj.solutionID = this.stockObj.solutionID;
            obj.solutionName = this.solution.selectedText;
            obj.parameterID = this.stockObj.parameterID = this.specifications.selectedId;
            obj.parameterName = this.specifications.selectedText;
            obj.instrumentID = this.stockObj.instrumentID = this.equipment.selectedId;
            obj.instrumentName = this.equipment.selectedText;
            obj.batchNumberID = this.stockObj.batchNumberID = this.batchNumber.selectedId;
            obj.batchName = this.batchNumber.selectedText;
            obj.stockSolutionIDFrom = this.stockObj.stockSolutionIDFrom = this.systemCodeFrom.selectedId;
            obj.stockSolutionIDFromName = this.systemCodeFrom.selectedText;
            obj.stockSolutionIDTo = this.stockObj.stockSolutionIDTo = this.systemCodeTo.selectedId;
            obj.stockSolutionIDToName = this.systemCodeTo.selectedText;
            obj.initiatedBy = this.stockObj.initiatedBy = this.intiatedUser.selectedId;
            obj.initiatedByName = this.stockObj.initiatedByName = this.intiatedUser.selectedText;
            obj.initiatedOn = dateParserFormatter.FormatDate(obj.initiatedOn, "date");
            obj.stockSolutionCode = this.systemCode.selectedId;
            obj.stockSolutionCodeName = this.systemCode.selectedText;

            SearchBoSessions.setSearchAuditBO(key, obj);
        }

        this._stockSolService.stockSearchStockSolutions(this.stockObj);
    }

    prepareHeader() {
        this.headers.push({ "columnDef": 'solutionName', "header": "Name of the Solution", cell: (element: any) => `${element.solutionName}`, width: 'maxWidth-30per' });
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-22per' });
        this.headers.push({ "columnDef": 'useBefore', "header": "Valid Up to", cell: (element: any) => `${element.useBefore}`, width: 'maxWidth-12per' });
        this.headers.push({ "columnDef": 'instrumentID', "header": "Instrument ID", cell: (element: any) => `${element.instrumentID}`, width: 'maxWidth-13per' });
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "StockSolutionID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.searchCalibrationSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "StockSolutionID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.searchCalibrationSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.stockSolution;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.stockObj.statusID))
            condition = condition + " AND StatusID = " + this.stockObj.statusID;
        if (CommonMethods.hasValue(this.stockObj.solutionID))
            condition = condition + " AND SolutionIndexID = " + this.stockObj.solutionID;
        _modal.componentInstance.condition = condition;

    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.stockObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.stockObj.advanceSearch });
        if (CommonMethods.hasValue(this.solution.selectedId))
            this.searchResult.push({ code: "SOL_NAME", name: "Name of the Solution: " + this.solution.selectedText });
        if (CommonMethods.hasValue(this.stockObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusDetailsList.filter(x => x.statusID == this.stockObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.stockObj.instrumentType))
            this.searchResult.push({ code: 'INSTR_TYPE', name: "Instrument Type: " + this.instrumentTypeList.filter(x => x.catItemID == this.stockObj.instrumentType)[0].catItem });
        if (CommonMethods.hasValue(this.batchNumber.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.batchNumber.selectedText });
        if (CommonMethods.hasValue(this.stockObj.validityFrom))
            this.searchResult.push({ code: "VALID_FROM", name: "Validity From: " + dateParserFormatter.FormatDate(this.stockObj.validityFrom, 'date') });
        if (CommonMethods.hasValue(this.stockObj.validityTo))
            this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.stockObj.validityTo, 'date') });
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_FROM", name: "System Code From :" + this.systemCodeFrom.selectedText })
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_To", name: "System Code To :" + this.systemCodeTo.selectedText })
        if (CommonMethods.hasValue(this.specifications.selectedId))
            this.searchResult.push({ code: "PARAMETER", name: "Parameter Name :" + this.specifications.selectedText })
        if (CommonMethods.hasValue(this.equipment.selectedId))
            this.searchResult.push({ code: "INSTR_ID", name: "Instrument ID :" + this.equipment.selectedText })
        if (CommonMethods.hasValue(this.stockObj.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.stockObj.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
        if (CommonMethods.hasValue(this.systemCode.selectedId))
            this.searchResult.push({ code: "SYS_CODE", name: "System Code: " + this.systemCode.selectedText })
    }

    clearOption(code, index) {
        if (code == "SOL_NAME")
            this.solution.clear();
        else if (code == "STATUS")
            this.stockObj.statusID = null;
        else if (code == "INSTR_TYPE")
            this.stockObj.instrumentType = null;
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "VALID_FROM")
            this.stockObj.validityFrom = null;
        else if (code == "VALID_TO")
            this.stockObj.validityTo = null;
        else if (code == "SYSTEM_CODE_FROM")
            this.systemCodeFrom.clear();
        else if (code == "SYSTEM_CODE_To")
            this.systemCodeTo.clear();
        else if (code == "ADV_SRCH")
            this.stockObj.advanceSearch = null;
        else if (code == "INSTR_ID")
            this.equipment.clear();
        else if (code == "PARAMETER")
            this.specifications.clear();
        else if (code == "INITIATED_ON")
            this.stockObj.initiatedOn = null;
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();
        else if (code == "SYS_CODE")
            this.systemCode.clear();

        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }



    onActionCLicked(evt) {
        localStorage.setItem("viewStockSolution", evt.val.encStockSolutionID);
        this._router.navigate(['lims/stockSolutions/manage'], { queryParams: { id: evt.val.encStockSolutionID } });
    }

    validate() {
        if (!CommonMethods.hasValue(this.stockObj.statusID) && !CommonMethods.hasValue(this.solution.selectedId)
            && !CommonMethods.hasValue(this.equipment.selectedId) && !CommonMethods.hasValue(this.specifications.selectedId)
            && !CommonMethods.hasValue(this.stockObj.validityFrom) && !CommonMethods.hasValue(this.stockObj.validityTo)
            && !CommonMethods.hasValue(this.systemCodeFrom.selectedId) && !CommonMethods.hasValue(this.systemCodeTo.selectedId)
            && !CommonMethods.hasValue(this.stockObj.instrumentType) && !CommonMethods.hasValue(this.batchNumber.selectedId)
            && !CommonMethods.hasValue(this.stockObj.advanceSearch) && !CommonMethods.hasValue(this.intiatedUser.selectedId)
            && !CommonMethods.hasValue(this.stockObj.initiatedOn) && !CommonMethods.hasValue(this.systemCode.selectedId))
            return StockSolutionsMessages.searchMsg;
    }

    onPage(evt) {
        this.stockObj.pageIndex = evt;
        this.searchStockSol('SEARCH', 'P');
    }

    addIndex() {
        this._router.navigate(['lims/indicator/manageSolIndex']);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}