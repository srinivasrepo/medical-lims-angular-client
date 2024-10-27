import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { LimsRespMessages, EntityCodes, CapabilityActions, LookupCodes, ActionMessages, SearchPageTooltip } from '../../common/services/utilities/constants';
import { AlertService } from '../../common/services/alert.service';
import { SearchIndicatorsBO } from '../model/indicatorsModel';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from '../../common/services/utilities/commonmethods';
import { environment } from '../../../environments/environment';
import { IndicatorsService } from '../service/indicators.service';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { Router } from '@angular/router';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MatDialog } from '@angular/material';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';

@Component({
    selector: 'search-ind',
    templateUrl: '../html/searchIndicator.html'
})

export class SearchIndicatorComponent {

    pageTitle: string = PageTitle.indicators;
    statusList: Array<any> = [];
    statusID: number;
    currentSelectedIndex: number;
    headersData: any;
    dataSource: any;
    totalRecords: number;
    actions: Array<any> = [];
    hasCreateCap: boolean;
    typeList: Array<any> = [];
    subCategory: any;
    indicatorInfo: LookupInfo;
    @ViewChild('indicator', { static: true }) indicator: LookupComponent;
    removeActions: any = { 'action': 'DISC', extraField: 'finalStatusCode', compareField: 'statusCode' }
    solutionInfo: LookupInfo;
    @ViewChild('solution', { static: true }) solution: LookupComponent;

    batchNumberInfo: LookupInfo;
    @ViewChild('batchNumber', { static: true }) batchNumber: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;
    analystInfo: LookupInfo;
    @ViewChild('analyst', { static: true }) analyst: LookupComponent;
    condition: string;
    hasManageIndexCap: boolean;
    searchResult: any = [];
    advanceSearch: string;
    validityFrom: Date;
    validityTo: Date;
    searchBy: string = SearchPageTooltip.srchTestSolution;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    initiatedOn: Date;
    today: Date = new Date();
    subscription: Subscription = new Subscription();
    hasExpCap: boolean = false;
    constructor(private _alert: AlertService, private _indService: IndicatorsService, private _confirm: ConfirmationService,
        private _limsContext: LIMSContextServices, private _router: Router, private _matDialog: MatDialog, public _global: GlobalButtonIconsService,
        private modalService: SearchFilterModalService) { }

    ngAfterContentInit() {
        this.subscription = this._indService.indicatorsSubject.subscribe(resp => {
            if (resp.purpose == "searchIndicators") {
                this.prepareHeaders();
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "filterTwiceCol", ['createdOn', 'useBefore']))
                this.menuEvt();
                this.closeModal("indicator-srch");
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == 'INDICATOR_TYPE')
                this.typeList = resp.result;
            else if (resp.purpose == "manageDiscardCommnets") {
                if (resp.result == 'OK') {
                    this._alert.success(mobilephaseMessages.succDisc);
                    this.searchFilter('Search', 'I');
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        });

        this.searchFilter('Search', 'Y');

        this._indService.getStatuslist(EntityCodes.indicators);
        this._indService.getCategoryItemsByCatCode('INDICATOR_TYPE');

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(EntityCodes.indicators);
        this.actions = capActions.actionList;
        // this.actions.push('DISC');
        this.hasCreateCap = capActions.createCap;
        this.hasExpCap = capActions.exportCap;
        this.actions.forEach((x, index) => {
            if (x == 'MNG_TEST_SOL_INDI_INDEX') {
                this.hasManageIndexCap = true;
                this.actions.splice(index, 1);
            }
        })

        this.lkpInfo();
    }

    lkpInfo() {
        var batchNumCondition = "EntityCode = 'INDICATOR'";
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
        // this.condition = "CATEGORY_CODE = " + "\'LAB_MAT\'" + ' AND SUBCATCODE =' + "\'TEST_SOLUTIONS_INDICATORS\'"
        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initiatedBy, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initiatedBy, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'");
        this.solutionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getTestSolIndexMaterials, LKPDisplayNames.solution, LKPDisplayNames.solutionCode, LookUpDisplayField.header, LKPPlaceholders.nameOfTheSolMaterial, "EntityCode = '" + EntityCodes.indicators + "'");
        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.indicatorDetails,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
        this.systemCodeFromLkp();
        this.systemCodeToLkp();
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "IndicatorID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.indicatorDetails,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "IndicatorID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.indicatorDetails,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'solutionName', "header": "Name of the Solution", cell: (element: any) => `${element.solutionName}`, width: 'minWidth-35per' });
        this.headersData.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'minWidth-15per' });
        this.headersData.push({ "columnDef": 'reqType', "header": "Solution Type", cell: (element: any) => `${element.reqType}`, width: 'maxWidth-15per' });

        // this.headersData.push({ "columnDef": 'createdOn', "header": "Created On", cell: (element: any) => `${element.createdOn}` });
        // this.headersData.push({ "columnDef": 'userName', "header": "Created By", cell: (element: any) => `${element.userName}` });
        this.headersData.push({ "columnDef": 'useBefore', "header": "Valid Up to", cell: (element: any) => `${element.useBefore}`, width: 'minWidth-10per' });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    searchFilter(type: string, init: string = 'N') {
        var obj: SearchIndicatorsBO = new SearchIndicatorsBO();
        var key: string = SearchBoSessions['testSolutionBO_' + this._limsContext.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.statusID = obj.statusID;
            this.subCategory = obj.indicatorType;
            if (CommonMethods.hasValue(obj.indicatorID))
                this.systemCodeFrom.setRow(obj.indicatorID, obj.indicatorName);
            if (CommonMethods.hasValue(obj.solutionID))
                this.solution.setRow(obj.solutionID, obj.solutionName);
            if (CommonMethods.hasValue(obj.indicatorIDTo))
                this.systemCodeTo.setRow(obj.indicatorIDTo, obj.indicatorIDToName);
            if (CommonMethods.hasValue(obj.batchNumberID))
                this.batchNumber.setRow(obj.batchNumberID, obj.batchNumberName);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.analyst.setRow(obj.initiatedBy, obj.initiatedByName)
            if (CommonMethods.hasValue(obj.indicatorCodeID))
                this.systemCode.setRow(obj.indicatorCodeID, obj.indicatorSystemCodeName);

            this.validityFrom = obj.validityFrom;
            this.validityTo = obj.validityTo;
            this.initiatedOn = obj.initiatedOn;
            this.advanceSearch = obj.advanceSearch;

            this.currentSelectedIndex = Number(obj.pageIndex);
        }
        else {
            if (!this.controlValidate(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type != 'Search') {
                if (CommonMethods.hasValue(this.statusID))
                    this.statusID = 0;

                this.subCategory = null;
                this.validityTo = this.validityFrom = this.advanceSearch = this.statusID = this.initiatedOn = null;
                this.batchNumber.clear();
                this.solution.clear();
                this.systemCodeFrom.clear();
                this.systemCodeTo.clear();
                this.analyst.clear();
                this.systemCode.clear();
            }

            if (init != 'I') {
                this.currentSelectedIndex = 0;
                environment.pageIndex = '0';
            }

            obj.pageIndex = this.currentSelectedIndex;
            obj.statusID = this.statusID;
            obj.indicatorType = this.subCategory;
            obj.indicatorID = this.systemCodeFrom.selectedId;
            obj.indicatorIDTo = this.systemCodeTo.selectedId;
            obj.indicatorIDToName = this.systemCodeTo.selectedText;
            obj.solutionID = this.solution.selectedId;
            obj.indicatorName = this.systemCodeFrom.selectedText;
            obj.solutionName = this.solution.selectedText;
            obj.advanceSearch = this.advanceSearch;
            obj.validityFrom = this.validityFrom;
            obj.validityTo = this.validityTo;
            obj.batchNumberName = this.batchNumber.selectedText;
            obj.batchNumberID = this.batchNumber.selectedId;
            obj.initiatedOn = dateParserFormatter.FormatDate(this.initiatedOn, 'date');
            obj.initiatedBy = this.analyst.selectedId;
            obj.initiatedByName = this.analyst.selectedText;
            obj.indicatorCodeID = this.systemCode.selectedId;
            obj.indicatorSystemCodeName = this.systemCode.selectedText;

            SearchBoSessions.setSearchAuditBO(key, obj);
        }

        this._indService.searchIndicators(obj);

    }

    export() {

        const _modal = this._matDialog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.indicators;

        var obj: SearchIndicatorsBO = new SearchIndicatorsBO();
        var key: string = SearchBoSessions['testSolutionBO_' + this._limsContext.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key))
            obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(obj.indicatorID))
            condition = condition + " AND IndicatorID = " + obj.indicatorID;
        if (CommonMethods.hasValue(obj.indicatorType))
            condition = condition + " AND IndicatorType = " + obj.indicatorType;
        if (CommonMethods.hasValue(obj.statusID))
            condition = condition + " AND StatusID = " + obj.statusID;
        if (CommonMethods.hasValue(obj.solutionID))
            condition = condition + " AND SolutionID = " + obj.solutionID;
        _modal.componentInstance.condition = condition;

    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (!CommonMethods.hasValue(this.statusID) && !CommonMethods.hasValue(this.subCategory)
            && !CommonMethods.hasValue(this.systemCodeFrom.selectedData) && !CommonMethods.hasValue(this.solution.selectedId)
            && !CommonMethods.hasValue(this.systemCodeTo.selectedId) && !CommonMethods.hasValue(this.validityFrom)
            && !CommonMethods.hasValue(this.validityTo) && !CommonMethods.hasValue(this.advanceSearch) && !CommonMethods.hasValue(this.batchNumber.selectedId)
            && !CommonMethods.hasValue(this.analyst.selectedId) && !CommonMethods.hasValue(this.initiatedOn)
            && !CommonMethods.hasValue(this.systemCode.selectedId) && type != 'ALL')
            isVal = false;

        // if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
        //     environment.pageIndex = '0';
        //     isVal = true;
        // }
        return isVal;
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.advanceSearch });
        if (CommonMethods.hasValue(this.solution.selectedId))
            this.searchResult.push({ code: "SOL_NAME", name: "Name of the Solution: " + this.solution.selectedText });
        if (CommonMethods.hasValue(this.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.statusID)[0].status });
        if (CommonMethods.hasValue(this.subCategory))
            this.searchResult.push({ code: 'SOL_TYPE', name: "Solution Type: " + this.typeList.filter(x => x.catItemID == this.subCategory)[0].catItem });
        if (CommonMethods.hasValue(this.batchNumber.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.batchNumber.selectedText });
        if (CommonMethods.hasValue(this.validityFrom))
            this.searchResult.push({ code: "VALID_FROM", name: "Validity From: " + dateParserFormatter.FormatDate(this.validityFrom, 'date') });
        if (CommonMethods.hasValue(this.validityTo))
            this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.validityTo, 'date') });
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_FROM", name: "System Code From: " + this.systemCodeFrom.selectedText })
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_To", name: "System Code To: " + this.systemCodeTo.selectedText })
        if (CommonMethods.hasValue(this.analyst.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated By: " + this.analyst.selectedText })
        if (CommonMethods.hasValue(this.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.initiatedOn, 'date') })
        if (CommonMethods.hasValue(this.systemCode.selectedId))
            this.searchResult.push({ code: "SYS_CODE", name: "System Code: " + this.systemCode.selectedText })
    }

    clearOption(code, index) {
        if (code == "SOL_NAME")
            this.solution.clear();
        else if (code == "STATUS")
            this.statusID = null;
        else if (code == "SOL_TYPE")
            this.subCategory = null;
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "VALID_FROM")
            this.validityFrom = null;
        else if (code == "VALID_TO")
            this.validityTo = null;
        else if (code == "SYSTEM_CODE_FROM")
            this.systemCodeFrom.clear();
        else if (code == "SYSTEM_CODE_To")
            this.systemCodeTo.clear();
        else if (code == "ADV_SRCH")
            this.advanceSearch = null;
        else if (code == "INITIATED_BY")
            this.analyst.clear();
        else if (code == "INITIATED_ON")
            this.initiatedOn = null;
        else if (code == "SYS_CODE")
            this.systemCode.clear();


        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.searchFilter('Search', 'I');
    }

    addIndicators() {
        this._router.navigate(['/lims/indicator/add']);
    }

    onActionClicked(evt) {
        if (evt.action == 'VIE'){
            localStorage.setItem('conditionCode', 'INDICATOR');
            this._router.navigate(['/lims/indicator/view'], { queryParams: { id: evt.val.encIndicatorID } });
        }
        else if (evt.action == 'DISC') {
            this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
                if (result) {
                    const model = this._matDialog.open(addCommentComponent, { width: "600px" })
                    model.disableClose = true;
                    model.afterClosed().subscribe(res => {
                        if (res.result) {
                            var obj: CommentsBO = new CommentsBO();
                            obj.purposeCode = 'INDICATOR';
                            obj.encEntityActID = evt.val.encIndicatorID;
                            obj.entityCode = EntityCodes.indicators;
                            obj.comment = res.val;
                            this._indService.manageDiscardCommnets(obj);
                        }
                    })
                }

            })
        }
    }

    addIndex() {
        this._router.navigate(['lims/indicator/manageSolIndex']);
    }

    clear() {
        this.statusID = 0;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}