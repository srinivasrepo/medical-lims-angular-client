import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { InvalidationsService } from '../service/invalidations.service';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from '../../common/services/utilities/commonmethods';
import { AlertService } from '../../common/services/alert.service';
import { environment } from '../../../environments/environment';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { SearchInvalidationsBO, GenericIDBOList } from '../model/invalidationsModel';
import { LimsRespMessages, LookupCodes, CapabilityActions, EntityCodes, SearchPageTooltip } from '../../common/services/utilities/constants';
import { Router } from '@angular/router';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';

@Component({
    selector: 'search-inv',
    templateUrl: '../html/searchInvalidations.html'
})

export class SearchInvalidationsComponent {
    refNumberInfo: LookupInfo;
    @ViewChild('refNumber', { static: true }) refNumber: LookupComponent;
    statusList: Array<any> = [];
    statusID: number;

    pageTitle: string = PageTitle.searchInvalidations;

    headersData: any;
    dataSource: any;

    totalRecords: number;
    maxDate = new Date();
    minDate = new Date();
    hasCreateCap: boolean;
    actions: Array<any> = [];
    invTypes: GenericIDBOList = new GenericIDBOList();
    insTypes: GenericIDBOList = new GenericIDBOList();
    searchBO: SearchInvalidationsBO = new SearchInvalidationsBO();
    searchFil: any = [];
    search: string = null;
    analysisList: any;
    analystInfo: LookupInfo;
    @ViewChild('analyst', { static: false }) analyst: LookupComponent;
    arNumberInfo: LookupInfo;
    @ViewChild("arNum", { static: true }) arNum: LookupComponent;
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: false }) equipment: LookupComponent;
    productsInfo: LookupInfo;
    @ViewChild('product', { static: true }) product: LookupComponent;
    inventoryInfo: LookupInfo;
    @ViewChild('inventoryData', { static: true }) inventoryData: LookupComponent;
    testInfo: LookupInfo;
    @ViewChild('testParameter', { static: true }) testParameter: LookupComponent;

    subscription: Subscription = new Subscription();
    sourceList: any;
    srchTooltip: string = SearchPageTooltip.srchInvalidation;
    getDateForIni : Date = new Date();
    hasExpCap: boolean = false;

    constructor(private _invService: InvalidationsService, private _alert: AlertService, private _matDailog: MatDialog, private modalService: SearchFilterModalService,
        private _router: Router, private _limsContext: LIMSContextServices, public _global: GlobalButtonIconsService) { }

    ngAfterViewInit() {
        this.subscription = this._invService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "searchInvalidations") {
                this.dateFormat('default');
                this.prepareHeaders();
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateTimeFormat", 'createdOn'));
                this.menuEvt();
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "getInvTypesInsTypes") {
                this.insTypes = resp.result.insTypes;
                this.invTypes = resp.result.invTypes;
            }
            else if (resp.purpose == "getAnalysisTypes")
                this.analysisList = resp.result;
            else if (resp.purpose == "INVALIDATION_SOURCES")
                this.sourceList = resp.result;
        });


        this._invService.getInvTypesInsTypes();
        this._invService.getAnalysisTypes();
        this._invService.getStatuslist(EntityCodes.invalidations);
        this.prepareLKPData();
        this._invService.getCategoryItemsByCatCode('INVALIDATION_SOURCES', 'ALL');

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(EntityCodes.invalidations);
        this.actions = capActions.actionList;
        this.hasCreateCap = capActions.createCap;
        this.hasExpCap = capActions.exportCap;
        this.searchFilter('Search', 'Y');

    }

    prepareLKPData() {
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getAllEquipmentsInstruments, LKPDisplayNames.Equipment,
            LKPDisplayNames.EquipmentCode, LookUpDisplayField.code, LKPPlaceholders.Equipment,"EQP_CAT_CODE = 'QCINST_TYPE' AND STATUS_CODE IN ('ACT', 'OBSE', 'INACT')");
        this.arNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getARNumbers,
            LKPDisplayNames.arNumber, LKPDisplayNames.smapleInward, LookUpDisplayField.header, LKPPlaceholders.refArNumber, "", "", "LIMS");
        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analysisDone, LookupCodes.getQCUsers, LKPDisplayNames.analystName,
            LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analysisDone, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.refNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.invalidationCode, LookupCodes.getInvalidations,
            LKPDisplayNames.InvalidationNumber, LKPDisplayNames.InvalidationCode, LookUpDisplayField.code, LKPPlaceholders.Referencecode);
        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.actionBy,
            LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.initUser,"StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.productsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.product, LookupCodes.mobilePhaseProduct, 
            LKPDisplayNames.product, LKPDisplayNames.productCode, LookUpDisplayField.header, LKPPlaceholders.product, "", "Stage", "LIMS");
        this.inventoryInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, "EntityCode = 'INVALIDATIONS'");
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testParameter, LookupCodes.testName, LKPDisplayNames.testParName, 
            LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.testParamName, "SpecTestID IS NOT NULL");

    }

    searchFilter(type: string, init: string = 'N') {

        var srchObj: SearchInvalidationsBO = new SearchInvalidationsBO();
        var key: string = SearchBoSessions['analysisInvds_' + this._limsContext.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            srchObj = SearchBoSessions.getSearchAuditBO(key);

            this.searchBO.invalidationID = srchObj.invalidationID;
            this.searchBO.selectedRefName = srchObj.selectedRefName;
            this.searchBO.invTypeID = srchObj.invTypeID;
            this.searchBO.instrumentTypeID = srchObj.instrumentTypeID;
            this.searchBO.statusID = srchObj.statusID;
            this.searchBO.sourceTypeID = srchObj.sourceTypeID;
            this.searchBO.analysisDoneBy = srchObj.analysisDoneBy;
            this.searchBO.arID = srchObj.arID;
            this.searchBO.instrumentID = srchObj.instrumentID;
            this.searchBO.initiatedBy = srchObj.initiatedBy;
            if (CommonMethods.hasValue(srchObj.analysisDoneBy))
                this.analyst.setRow(srchObj.analysisDoneBy, srchObj.analysisDoneByName);
            if (CommonMethods.hasValue(srchObj.invalidationID))
                this.refNumber.setRow(srchObj.invalidationID, srchObj.selectedRefName);
            if (CommonMethods.hasValue(srchObj.arID))
                this.arNum.setRow(srchObj.arID, srchObj.arName);
            if (CommonMethods.hasValue(srchObj.instrumentID))
                this.equipment.setRow(srchObj.instrumentID, srchObj.instrumentName);
            if(CommonMethods.hasValue(srchObj.initiatedBy))
                this.intiatedUser.setRow(srchObj.initiatedBy,srchObj.initiatedByName)

            this.searchBO.dateFrom = dateParserFormatter.FormatDate(srchObj.dateFrom, 'default');
            this.searchBO.dateTo = dateParserFormatter.FormatDate(srchObj.dateTo, 'default');
            this.searchBO.initiatedOn = dateParserFormatter.FormatDate(srchObj.initiatedOn, 'date');
            this.searchBO.analysisType = srchObj.analysisType;
            this.searchBO.advanceSearch = srchObj.advanceSearch;
            this.searchBO.pageIndex = srchObj.pageIndex;
        } else {

            if (!this.controlValidate(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type != 'Search') {
                if (CommonMethods.hasValue(this.refNumber.selectedId))
                    this.refNumber.clear();
                this.analyst.clear();
                this.arNum.clear();
                this.equipment.clear();
                this.intiatedUser.clear();
                this.searchFil = [];
                // if (CommonMethods.hasValue(this.statusID))
                //     this.statusID = 0;

                this.searchBO = new SearchInvalidationsBO();
            }
            else {

                srchObj.dateFrom = dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date');
                srchObj.dateTo = dateParserFormatter.FormatDate(this.searchBO.dateTo, 'date');
                srchObj.initiatedOn = this.searchBO.initiatedOn = dateParserFormatter.FormatDate(this.searchBO.initiatedOn, 'date');

                this.searchBO.invalidationID = this.refNumber.selectedId;
                srchObj.invalidationID = this.searchBO.invalidationID;
                srchObj.selectedRefName = this.refNumber.selectedText;

                srchObj.invTypeID = this.searchBO.invTypeID;
                srchObj.statusID = this.searchBO.statusID;
                srchObj.instrumentTypeID = this.searchBO.instrumentTypeID;
                srchObj.totalRecords = this.searchBO.totalRecords;
                srchObj.pageIndex = this.searchBO.pageIndex;
                srchObj.sourceTypeID = this.searchBO.sourceTypeID;
                srchObj.analysisDoneBy = this.searchBO.analysisDoneBy = this.analyst.selectedId;
                srchObj.analysisDoneByName = this.analyst.selectedText;
                srchObj.arID = this.searchBO.arID = this.arNum.selectedId;
                srchObj.arName = this.arNum.selectedText;
                srchObj.instrumentID = this.searchBO.instrumentID = this.equipment.selectedId;
                srchObj.instrumentName = this.equipment.selectedText
                srchObj.initiatedBy = this.searchBO.initiatedBy = this.intiatedUser.selectedId;
                srchObj.initiatedByName = this.intiatedUser.selectedText;
                srchObj.advanceSearch = this.searchBO.advanceSearch;
                srchObj.analysisType = this.searchBO.analysisType;
                this.dateFormat('date');
            }


            if (init != 'I') {
                this.searchBO.pageIndex = 0;
                environment.pageIndex = '0';
            }
            SearchBoSessions.setSearchAuditBO(key, srchObj);
        }


        this.searchBO.totalRecords = this.totalRecords;
        this.searchBO.pageIndex = srchObj.pageIndex;


        // this.searchBO.statusID = this.statusID;
        this._invService.searchInvalidations(this.searchBO);
        this.closeModal('inval-srch');
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.invalidations;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchBO.invalidationID))
            condition = condition + " AND InvalidationID = " + this.searchBO.invalidationID;
        if (CommonMethods.hasValue(this.searchBO.statusID))
            condition = condition + " AND StatusID = " + this.searchBO.statusID;
        if (CommonMethods.hasValue(this.searchBO.invTypeID))
            condition = condition + ' AND ImpactTypeID = ' + this.searchBO.invTypeID;
        if (CommonMethods.hasValue(this.searchBO.instrumentTypeID))
            condition = condition + " AND InstType = " + this.searchBO.instrumentTypeID;
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.searchBO.dateTo.setDate(this.searchBO.dateTo.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.sourceTypeID))
            condition = condition + " AND SourceTypeID = " + this.searchBO.sourceTypeID;

        _modal.componentInstance.condition = condition;

    }



    dateFormat(format: string) {
        this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.searchBO.dateFrom, format);
        this.searchBO.dateTo = dateParserFormatter.FormatDate(this.searchBO.dateTo, format);
        this.searchBO.initiatedOn = dateParserFormatter.FormatDate(this.searchBO.initiatedOn, format);
    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (type != 'ALL' && !CommonMethods.hasValue(this.searchBO.advanceSearch) && !CommonMethods.hasValue(this.refNumber.selectedId) && !CommonMethods.hasValue(this.searchBO.statusID) && !CommonMethods.hasValue(this.searchBO.instrumentTypeID)
            && !CommonMethods.hasValue(this.searchBO.invTypeID) && !CommonMethods.hasValue(this.searchBO.dateFrom) && !CommonMethods.hasValue(this.searchBO.dateTo)
            && !CommonMethods.hasValue(this.searchBO.sourceTypeID) && !CommonMethods.hasValue(this.analyst.selectedId)
            && !CommonMethods.hasValue(this.arNum.selectedId) && !CommonMethods.hasValue(this.searchBO.initiatedOn)
            && !CommonMethods.hasValue(this.searchBO.analysisType) && !CommonMethods.hasValue(this.intiatedUser.selectedId)
            && !CommonMethods.hasValue(this.equipment.selectedId))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }


    onPageIndexClicked(val) {
        this.searchBO.pageIndex = val;
        environment.pageIndex = val;
        this.searchFilter('Search', 'I');
    }

    addInvalidation() {
        this._router.navigate(['/lims/invalidations/add']);
    }

    clear() {
        this.refNumber.clear();
        this.statusID = 0;
    }

    prepareHeaders() {
        this.headersData = [];
        // this.headersData.push({ "columnDef": 'invalidationNumber', "header": "System Code", cell: (element: any) => `${element.invalidationNumber}`, width: 'maxWidth-10per' });
        this.headersData.push({ "columnDef": 'invalidationCode', "header": "Invalidation Number", cell: (element: any) => `${element.invalidationCode}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'productName', "header": "Product Name / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-25per' });
        this.headersData.push({ "columnDef": 'batchNumber', "header": "Batch / Reference Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' });
        //this.headersData.push({ "columnDef": 'invalidationSource', "header": "Invalidation Source", cell: (element: any) => `${element.invalidationSource}`, width: 'maxWidth-12per' });
        this.headersData.push({ "columnDef": 'testName', "header": "Test / Parameter", cell: (element: any) => `${element.testName}` });
        this.headersData.push({ "columnDef": 'analysisUser', "header": "Analysis Done By", cell: (element: any) => `${element.analysisUser}`, width: 'maxWidth-15per' });
        //this.headersData.push({ "columnDef": 'stage', "header": "Stage", cell: (element: any) => `${element.stage}`, width: 'maxWidth-5per' });
        //this.headersData.push({ "columnDef": 'instCode', "header": "Instrument ID", cell: (element: any) => `${element.instCode}` });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    create() {

    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.refNumber.selectedId))
            this.searchFil.push({ code: "REQ_CODE", name: "System Code: " + this.refNumber.selectedText });
        if (CommonMethods.hasValue(this.searchBO.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            this.searchFil.push({ code: 'STATUS', name: "Status: " + obj[0].status });
        }
        if (CommonMethods.hasValue(this.searchBO.invTypeID))
            this.searchFil.push({ code: 'IMP_TYPE', name: "Impact Type: " + this.invTypes.filter(x => x.id == this.searchBO.invTypeID)[0].name });
        if (CommonMethods.hasValue(this.searchBO.instrumentTypeID))
            this.searchFil.push({ code: "INST_TYPE", name: "Instrument Type: " + this.insTypes.filter(x => x.id == this.searchBO.instrumentTypeID)[0].name });
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.searchBO.dateTo, 'date') });
        if (CommonMethods.hasValue(this.searchBO.sourceTypeID))
            this.searchFil.push({ code: "SOURCE", name: "Source Type: " + this.sourceList.filter(x => x.catItemID == this.searchBO.sourceTypeID)[0].catItem });
        if (CommonMethods.hasValue(this.arNum.selectedId))
            this.searchFil.push({ code: "AR", name: "Ar Number: " + this.arNum.selectedText });
        if (CommonMethods.hasValue(this.equipment.selectedId))
            this.searchFil.push({ code: "INSTRUMENT", name: "Instrument: " + this.equipment.selectedText });
        if (CommonMethods.hasValue(this.analyst.selectedId))
            this.searchFil.push({ code: "ANALYSTDONE", name: "Analysis Done By: " + this.analyst.selectedText });
        if (CommonMethods.hasValue(this.searchBO.initiatedOn))
            this.searchFil.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.searchBO.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchFil.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
        if (CommonMethods.hasValue(this.searchBO.analysisType))
            this.searchFil.push({ code: "ANALYSIS_TYPE", name: "Analysis Type: " + this.analysisList.filter(x => x.speC_TYPE_ID == this.searchBO.analysisType)[0].speC_TYPE })
    }

    clearOption(code, index) {
        if (code == "REQ_CODE")
            this.refNumber.clear();
        else if (code == "STATUS")
            this.searchBO.statusID = null;
        else if (code == "IMP_TYPE")
            this.searchBO.invTypeID = null;
        else if (code == "INST_TYPE")
            this.searchBO.instrumentTypeID = null;
        else if (code == "DATE_FROM")
            this.searchBO.dateFrom = null;
        else if (code == "DATE_TO")
            this.searchBO.dateTo = null;
        else if (code == "SOURCE")
            this.searchBO.sourceTypeID = null;
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        else if (code == "ANALYSTDONE")
            this.analyst.clear();
        else if (code == "AR")
            this.analyst.clear();
        else if (code == "INITIATED_ON")
            this.searchBO.initiatedOn = null;
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();
        else if (code == "ANALYSIS_TYPE")
            this.searchBO.analysisType = null;
        else if (code == "INSTRUMENT")
            this.equipment.clear();
        this.searchFil.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchFil.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    onActionClicked(evt) {
        if (evt.action == "VIEW" || evt.action == 'VIE')
            this._router.navigateByUrl('/lims/invalidations/view?id=' + evt.val.encInvalidationID);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}