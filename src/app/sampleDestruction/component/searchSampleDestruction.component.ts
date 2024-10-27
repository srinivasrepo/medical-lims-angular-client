import { Component, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { SampleDestructionService } from '../service/sampleDestruction.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { Subscription } from 'rxjs';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { SearchSampleDestruction } from '../model/sampleDestructionModel';
import { SampleDestructionMessages } from '../messages/sampleDestructionMessages';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, GridActions, EntityCodes, SearchPageTooltip, CategoryCodeList, CapabilityActions } from 'src/app/common/services/utilities/constants';
import { LookUpDisplayField, LookupInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { Router } from '@angular/router';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { GetCategoryBO, CategoryItemList } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'search-destruction',
    templateUrl: '../html/searchSampleDestruction.html'
})

export class SearchSampleDestructionComponent {

    pageTitle: string = PageTitle.searchSampleDestruction;
    headers: Array<any> = [];
    dataSource: MatTableDataSource<any>;
    statusList: any = [];
    requestSourceList: any = [];
    actions: any = [GridActions.view];
    searchDestructionObj: SearchSampleDestruction = new SearchSampleDestruction();
    destructionIDInfo: LookupInfo;
    @ViewChild('destructionData', { static: true }) destructionData: LookupComponent;
    batchNumberInfo: LookupInfo;
    @ViewChild('batchNumber', { static: true }) batchNumber: LookupComponent;
    createdByInfo: LookupInfo;
    @ViewChild('createdBy', { static: true }) createdBy: LookupComponent;
    materialInfo: LookupInfo;
    @ViewChild('material', { static: true }) material: LookupComponent;

    condition: string;
    searchResult: any = [];
    searchBy: string = SearchPageTooltip.srchSampleDes;
    destructionSourceList: any;
    typeOfWasteList: any;
    typeOfNatureList: any;
    modeOfDestructionList: any;
    totalCatItemList: CategoryItemList;
    hasExpCap: boolean = false;

    subscription: Subscription = new Subscription();

    constructor(private _samDestrServ: SampleDestructionService, public _globalBtn: GlobalButtonIconsService,
        private _contextService: LIMSContextServices, private _notify: AlertService, private _matDailog: MatDialog,
        private _router: Router, private modalService: SearchFilterModalService) { }

    ngAfterContentInit() {

        this.subscription = this._samDestrServ.sampleDestructionSubject.subscribe(resp => {
            if (resp.purpose == 'searchSampleDestruction') {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.searchDestructionObj.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateTimeFormat", 'requestDate'));
                this.menuEvt();
                this.closeModal("sampleDes-srch");
            }
            else if (resp.purpose == 'getStatusList')
                this.statusList = resp.result;
            else if (resp.purpose == 'getRequestSource')
                this.requestSourceList = resp.result;
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        });

        this.searchSampDestr('SEARCH', 'A');
        this.prepareHeaders();
        this.preLookupDestrID();
        var capActions: CapabilityActions = this._contextService.getSearchActinsByEntityCode(EntityCodes.sampleDestruction);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
        
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetSearchSampleDestructionCategories();
        obj.type = 'GET_ALL';
        this._samDestrServ.getCatItemsByCatCodeList(obj);
        
        this._samDestrServ.getStatusDetails('SAMPLE_DESTRUCTION');
        this._samDestrServ.getRequestSourceDetails('SAM_DEST_SOURCE', 'SEARCH');
        this._samDestrServ.searchSampleDestructionDetails(this.searchDestructionObj);
    }

    onActionClicked(event) {
        if (event.action == 'VIE')
            this._router.navigate(['/lims/sampleDestruction/view'], { queryParams: { id: event.val.encDestructionID } });
    }

    searchSampDestr(type: string, init: string = 'N') {
        var srchDestrObj: SearchSampleDestruction = new SearchSampleDestruction();
        var key: string = SearchBoSessions['sampleDestrBO_' + this._contextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            srchDestrObj = SearchBoSessions.getSearchAuditBO(key);

            this.searchDestructionObj = srchDestrObj;
            this.searchDestructionObj.destructionID = srchDestrObj.destructionID;
            this.searchDestructionObj.destructionSource = srchDestrObj.destructionSource;
            this.searchDestructionObj.selectedDestrNo = srchDestrObj.selectedDestrNo;
            this.searchDestructionObj.statusID = this.searchDestructionObj.status = srchDestrObj.status;
            this.searchDestructionObj.createdOn = srchDestrObj.createdOn = dateParserFormatter.FormatDate(srchDestrObj.createdOn, "date");
            this.searchDestructionObj.dateFrom = srchDestrObj.dtFrom;
            this.searchDestructionObj.dtTo = srchDestrObj.dateTo = dateParserFormatter.FormatDate(srchDestrObj.dtTo, "default");
            this.searchDestructionObj.dateTo = srchDestrObj.dtTo;
            this.searchDestructionObj.pageIndex = Number(srchDestrObj.pageIndex);
            if (CommonMethods.hasValue(this.searchDestructionObj.matID))
                this.material.setRow(this.searchDestructionObj.matID, this.searchDestructionObj.matName);
            if (CommonMethods.hasValue(this.searchDestructionObj.createdUserRoleID))
                this.createdBy.setRow(this.searchDestructionObj.createdUserRoleID, this.searchDestructionObj.createdUserName);
            if (CommonMethods.hasValue(this.searchDestructionObj.batchNumberID))
                this.batchNumber.setRow(this.searchDestructionObj.batchNumberID, this.searchDestructionObj.batchName);


        } else {

            if (type == 'SEARCH' && init == 'N') {
                var msg: string = this.validate();
                if (CommonMethods.hasValue(msg))
                    return this._notify.warning(msg);
                // else
                //     this.searchDestructionObj.destructionID = this.destructionData.selectedId;
                // this.searchDestructionObj.dateFrom = dateParserFormatter.FormatDate(this.searchDestructionObj.dtFrom, "date");
                // this.searchDestructionObj.dateTo = dateParserFormatter.FormatDate(this.searchDestructionObj.dtTo, "date");
                // this.searchDestructionObj.pageIndex = Number(srchDestrObj.pageIndex);

            }

            if (type == "ALL") {
                this.searchDestructionObj = new SearchSampleDestruction();
                // this.destructionData.clear();
                this.batchNumber.clear();
                this.createdBy.clear();
                this.material.clear();
            }

            if (init != "P")
                this.searchDestructionObj.pageIndex = 0;

            srchDestrObj = this.searchDestructionObj;
            srchDestrObj.destructionID = this.searchDestructionObj.destructionID;
            // srchDestrObj.selectedDestrNo = this.destructionData.selectedText;
            srchDestrObj.destructionSource = this.searchDestructionObj.destructionSource;
            srchDestrObj.status = this.searchDestructionObj.statusID;
            srchDestrObj.createdOn = srchDestrObj.createdOn = dateParserFormatter.FormatDate(this.searchDestructionObj.createdOn, "date");
            srchDestrObj.dtTo = srchDestrObj.dateTo = dateParserFormatter.FormatDate(this.searchDestructionObj.dateTo, "date");
            srchDestrObj.totalRecords = this.searchDestructionObj.totalRecords;
            srchDestrObj.pageIndex = Number(this.searchDestructionObj.pageIndex);
            srchDestrObj.batchNumberID = this.batchNumber.selectedId;
            srchDestrObj.batchName = this.batchNumber.selectedText;
            srchDestrObj.createdUserRoleID = this.createdBy.selectedId;
            srchDestrObj.createdUserName = this.createdBy.selectedText;
            srchDestrObj.matID = this.material.selectedId;
            srchDestrObj.matName = this.material.selectedText;
            SearchBoSessions.setSearchAuditBO(key, srchDestrObj);
        }

        this._samDestrServ.searchSampleDestructionDetails(this.searchDestructionObj);
    }

    validate() {
        if (!CommonMethods.hasValue(this.searchDestructionObj.createdOn) && !CommonMethods.hasValue(this.searchDestructionObj.dtTo)
            && !CommonMethods.hasValue(this.searchDestructionObj.destructionSource) && !CommonMethods.hasValue(this.searchDestructionObj.statusID)
            && !CommonMethods.hasValue(this.material.selectedId) && !CommonMethods.hasValue(this.searchDestructionObj.modeOfDestruction)
            && !CommonMethods.hasValue(this.searchDestructionObj.advanceSearch) && !CommonMethods.hasValue(this.searchDestructionObj.natureOfWaste)
            && !CommonMethods.hasValue(this.createdBy.selectedId) && !CommonMethods.hasValue(this.searchDestructionObj.wasteType)
            && !CommonMethods.hasValue(this.batchNumber.selectedId))
            return SampleDestructionMessages.searchField;
    }

    onPage(evt) {
        this.searchDestructionObj.pageIndex = evt;
        this.searchSampDestr('SEARCH', 'P');
    }

    preLookupDestrID() {

        this.materialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.chemicalSol, LookupCodes.getAllMaterials, LKPDisplayNames.solution, LKPDisplayNames.solutionCode, LookUpDisplayField.header, LKPPlaceholders.chemicalSol, this.condition);
        this.createdByInfo = CommonMethods.PrepareLookupInfo(LKPTitles.createdBy, LookupCodes.getQCUsers, LKPDisplayNames.analystName, LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.createdBy, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.prepareBatchLkp();
    }

    selectBatch(evt) {
        if (!CommonMethods.hasValue(this.material.selectedId)) {
            if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
                this.material.setRow(evt.val.extColName, evt.val.code);
            else
                this.material.clear();
        }
    }

    prepareBatchLkp() {
        var batchNumCondition = "";
        if (CommonMethods.hasValue(this.material.selectedId))
            batchNumCondition = "MatID = " + this.material.selectedId;

        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
    }

    prepareHeaders() {
        this.headers.push({ "columnDef": 'requestCode', "header": "System Code", cell: (element: any) => `${element.requestCode}` })
        this.headers.push({ "columnDef": 'requestDate', "header": "Request Created On", cell: (element: any) => `${element.requestDate}` })
        this.headers.push({ "columnDef": 'requestCreatedBy', "header": "Request Created By", cell: (element: any) => `${element.requestCreatedBy}` })
        this.headers.push({ "columnDef": 'typeOfWaste', "header": "Type of Waste", cell: (element: any) => `${element.typeOfWaste}` })
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}` })
    }


    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.sampleDestruction;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchDestructionObj.destructionID))
            condition = condition + " AND DestructionID = " + this.searchDestructionObj.destructionID;
        if (CommonMethods.hasValue(this.searchDestructionObj.dateFrom))
            condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.searchDestructionObj.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(this.searchDestructionObj.dateTo))
            condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.searchDestructionObj.dateTo.setDate(this.searchDestructionObj.dateTo.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(this.searchDestructionObj.destructionSource))
            condition = condition + " AND DestructionSource = " + this.searchDestructionObj.destructionSource;
        if (CommonMethods.hasValue(this.searchDestructionObj.statusID))
            condition = condition + " AND StatusID = " + this.searchDestructionObj.statusID;

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
        if (CommonMethods.hasValue(this.searchDestructionObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchDestructionObj.advanceSearch });
        if (CommonMethods.hasValue(this.createdBy.selectedId))
            this.searchResult.push({ code: "REQ_CRE_BY", name: "Request Created By: " + this.createdBy.selectedText });
        if (CommonMethods.hasValue(this.searchDestructionObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.searchDestructionObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.searchDestructionObj.natureOfWaste))
            this.searchResult.push({ code: 'TYPE_NATURE', name: "Nature of Waste: " + this.totalCatItemList.filter(x => x.catItemID == this.searchDestructionObj.natureOfWaste)[0].catItem });
        if (CommonMethods.hasValue(this.batchNumber.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.batchNumber.selectedText });
        if (CommonMethods.hasValue(this.searchDestructionObj.createdOn))
            this.searchResult.push({ code: "VALID_FROM", name: "Request Created On: " + dateParserFormatter.FormatDate(this.searchDestructionObj.createdOn, 'date') });
        // if (CommonMethods.hasValue(this.searchDestructionObj.dateTo))
        //     this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.searchDestructionObj.dateTo, 'date') });
        if (CommonMethods.hasValue(this.material.selectedId))
            this.searchResult.push({ code: "MAT", name: "Material: " + this.material.selectedText })
        if (CommonMethods.hasValue(this.searchDestructionObj.modeOfDestruction))
            this.searchResult.push({ code: "MODE_DES", name: "Mode of Destruction: " + this.totalCatItemList.filter(x => x.catItemID == this.searchDestructionObj.modeOfDestruction)[0].catItem });

        if (CommonMethods.hasValue(this.searchDestructionObj.destructionSource))
            this.searchResult.push({ code: 'DES_SOUR', name: "Destruction of Source: " + this.totalCatItemList.filter(x => x.catItemID == this.searchDestructionObj.destructionSource)[0].catItem });
        if(CommonMethods.hasValue(this.searchDestructionObj.wasteType))
            this.searchResult.push({ code:'WASTE_TYPE', name:"Type of Waste: "+ this.totalCatItemList.filter(x => x.catItemID == this.searchDestructionObj.wasteType)[0].catItem });
    }

    clearOption(code, index) {
        if (code == "REQ_CRE_BY")
            this.createdBy.clear();
        else if (code == "STATUS")
            this.searchDestructionObj.statusID = null;
        else if (code == "TYPE_NATURE")
            this.searchDestructionObj.natureOfWaste = null;
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "VALID_FROM")
            this.searchDestructionObj.dateFrom = null;
        else if (code == "VALID_TO")
            this.searchDestructionObj.dateTo = null;
        else if (code == "MODE_DES")
            this.searchDestructionObj.modeOfDestruction = null;
        else if (code == "DES_SOUR")
            this.searchDestructionObj.destructionSource = null;
        else if (code == "MAT")
            this.material.clear();
        else if (code == "ADV_SRCH")
            this.searchDestructionObj.advanceSearch = null;
        else if (code =="WASTE_TYPE")
            this.searchDestructionObj.wasteType = null;

        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
