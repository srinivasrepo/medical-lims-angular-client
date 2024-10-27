import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { SearchQCInvetory, StatusDetails } from '../model/QCInventorymodel';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { LookupInfo, LookUpDisplayField, materialCatInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, GridActions, CapabilityActions, EntityCodes, SearchPageTooltip, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { Router } from '@angular/router';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { MaterialUomConversionsComponent } from 'src/app/common/component/materialUomConversions';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { environment } from 'src/environments/environment';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';
import { SendSampleComponent } from './sendSample.component';
import { GetCategoryBO, CategoryItemList } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'srch-qcinventory',
    templateUrl: '../html/SearchQCInventory.html'
})

export class SearchQCInventoryComponent {

    pageTitle: string = PageTitle.searchQCInventory;
    dataSource: MatTableDataSource<any>;
    headers: any = [];
    conditionMat: string = "CAT_CODE = " + "\'LAB_MAT\'";
    conditionInv: string = "(IsMBBlock IS NULL OR IsMBBlock = 0)";

    actions: any = [];
    getSources: any = [];
    statusDetailsList: Array<StatusDetails> = [];
    searchQCInventoryObj: SearchQCInvetory = new SearchQCInvetory();
    sampleDestructionObj: SearchQCInvetory = new SearchQCInvetory();

    inventoryInfo: LookupInfo;
    @ViewChild('inventoryData', { static: true }) inventoryData: LookupComponent;
    materialInfo: materialCatInfo = new materialCatInfo();
    @ViewChild('materialCategory', { static: true }) materialCategory: materialCategoryComponent;
    manufacturerInfo: LookupInfo;
    @ViewChild("manufacturer", { static: true }) manufacturer: LookupComponent;
    hasSamDestructionCap: boolean;

    searchResult: any = [];
    blockList: any = [];
    totalCatItemList: CategoryItemList;
    searchBy: string = SearchPageTooltip.srchQCInv;
    entitySourceCode: string = EntityCodes.qcInventory;
    hasExpCap: boolean = false;
    subscription: Subscription = new Subscription();

    constructor(private _qcinvtServ: QCInventoryService, private _alertService: AlertService, private _router: Router, private _contextService: LIMSContextServices,
        public _global: GlobalButtonIconsService, private _matDialog: MatDialog, private modalService: SearchFilterModalService) {
        // this.materialInfo.categoryCode = 'LAB_MAT';
        this.materialInfo.condition = "CATEGORY_CODE IN ('LAB_MAT', 'WATER_MAT')";
        this.materialInfo.isCategoryShow = true;
        this.materialInfo.isSubCategoryShow = true;
        this.materialInfo.categoryList = [{ catCode: 'LAB_MAT' }, { catCode: 'WATER_MAT' }];
        this.materialInfo.subCategories = [{ subCatCode: 'WATERMILLI_Q' }];
        this.materialInfo.lkpType = "SEARCH";
        this.materialInfo.IsActive = false;
        // this.materialInfo.condition = "CAT_CODE = 'LAB_MAT' AND CAT_ITEM_CODE NOT IN ('MOBILE_PHASE', 'TEST_SOLUTIONS_INDICATORS', 'VOLUMETRIC_SOL', 'STOCK_SOLUTION', 'RINSING_SOLUTION')";
    }

    ngAfterContentInit() {
        this.subscription = this._qcinvtServ.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "searchQCInventory") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.searchQCInventoryObj.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateFormat", 'useBeforeDate'));
                this.closeModal("qcInv-srch");
                this.menuEvt();
            }
            else if (resp.purpose == "getStatusList")
                this.statusDetailsList = resp.result;
            else if (resp.purpose == "getQCInventorySources")
                this.getSources = resp.result;
            else if (resp.purpose == 'getBlockByPlantID')
                this.blockList = resp.result;
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        })

        var capabilities: CapabilityActions = this._contextService.getSearchActinsByEntityCode(EntityCodes.qcInventory);
        this.actions = capabilities.actionList;
        this.hasExpCap = capabilities.exportCap;
        this.actions.forEach((x, index) => {
            if (x == 'MNG_SAM_DESTRUCTION') {
                this.hasSamDestructionCap = true;
                this.actions.splice(index, 1);
            }
        })

        this.prepareHeaders();
        // this.materialInfo.categoryID = null;
        this.prepareLKPInv({ val: '' });
        this._qcinvtServ.getStatusList("QC_INV");
        this._qcinvtServ.getBlockByPlantID({deptCode:"QC",type:'ALL'});
        this._qcinvtServ.getQCInventorySources();
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetSearchQCInventoryCategories();
        obj.type = 'GET_ALL';
        this._qcinvtServ.getCatItemsByCatCodeList(obj);

        this.searchQCInvent("SEARCH", "A");


    }

    onActionClicked(event) {
        if (event.action == 'VIE')
            this._router.navigate(['/lims/qcInventory/viewInvtDetails'], { queryParams: { id: event.val.encInvID } })
    }

    searchQCInvent(type, init: string = "B") {

        var srchObj: SearchQCInvetory = new SearchQCInvetory();
        var key: string = SearchBoSessions['qcInv_Phase_' + this._contextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            srchObj = SearchBoSessions.getSearchAuditBO(key);
            this.searchQCInventoryObj = srchObj;
            this.searchQCInventoryObj.matID = srchObj.matID;
            this.searchQCInventoryObj.invID = srchObj.invID;
            this.searchQCInventoryObj.selectedMatText = srchObj.selectedMatText;
            this.searchQCInventoryObj.entityID = this.searchQCInventoryObj.entity = srchObj.entityID;
            this.searchQCInventoryObj.selectedBatchText = srchObj.selectedBatchText;
            if (CommonMethods.hasValue(srchObj.invID))
                this.inventoryData.setRow(srchObj.invID, srchObj.selectedBatchText);
            if (CommonMethods.hasValue(srchObj.manufactureID))
                this.manufacturer.setRow(srchObj.manufactureID, srchObj.manufacturerName);
            this.searchQCInventoryObj.statusID = this.searchQCInventoryObj.status = srchObj.status;
            this.searchQCInventoryObj.btBefDate = srchObj.batchUseBeforeDate = dateParserFormatter.FormatDate(srchObj.btBefDate, "default");
            this.searchQCInventoryObj.useBefDate = srchObj.useBeforeDate = this.searchQCInventoryObj.useBeforeDate = dateParserFormatter.FormatDate(srchObj.useBeforeDate, "default");
            this.searchQCInventoryObj.pageIndex = Number(srchObj.pageIndex);
            this.searchQCInventoryObj.chemicalType = srchObj.chemicalType;
            this.materialInfo.categoryCode = srchObj.categoryCode;
            this.materialInfo.subCategoryID = srchObj.subCategoryID;
            if (CommonMethods.hasValue(srchObj.matID)) {
                this.materialInfo.materialID = srchObj.matID;
                this.materialInfo.materialName = srchObj.matName;
            }

        } else {

            if (type == 'ALL') {
                this.searchQCInventoryObj.invID = this.searchQCInventoryObj.statusID = this.searchQCInventoryObj.inwardDateFrom = this.searchQCInventoryObj.advanceSearch =
                    this.searchQCInventoryObj.entity = this.searchQCInventoryObj.entityID = this.searchQCInventoryObj.matID =
                    this.searchQCInventoryObj.useBeforeDate = this.searchQCInventoryObj.batchUseBeforeDate = this.searchQCInventoryObj.btBefDate =
                    this.searchQCInventoryObj.useBefDate = this.searchQCInventoryObj.chemicalType = this.searchQCInventoryObj.inwardDateTo =
                    this.searchQCInventoryObj.blockID = this.searchQCInventoryObj.chemicalGrade = this.searchQCInventoryObj.showZeroQtyRecords =
                    this.materialInfo.categoryCode = this.materialInfo.subCategoryID = this.materialInfo.materialID  = null;
                this.inventoryData.clear();
                this.manufacturer.clear();
                this.materialCategory.clear();
                this.searchResult = [];

            }

            if (type == "SEARCH" && init == "B") {
                var errmsg = this.formData();
                if (CommonMethods.hasValue(errmsg))
                    return this._alertService.warning(errmsg);
                else {

                    this.searchQCInventoryObj.pageIndex = Number(srchObj.pageIndex);
                }
            }

            if (init != 'P')
                this.searchQCInventoryObj.pageIndex = 0;

            srchObj = this.searchQCInventoryObj;
            this.searchQCInventoryObj.invID = this.inventoryData.selectedId;
            this.searchQCInventoryObj.batchUseBeforeDate = srchObj.batchUseBeforeDate = dateParserFormatter.FormatDate(this.searchQCInventoryObj.batchUseBeforeDate, "date");
            this.searchQCInventoryObj.useBeforeDate = srchObj.useBeforeDate = dateParserFormatter.FormatDate(this.searchQCInventoryObj.useBeforeDate, "date");
            srchObj.matID = this.searchQCInventoryObj.matID = this.materialInfo.materialID;
            srchObj.subCategoryID = this.searchQCInventoryObj.subCategoryID = this.materialInfo.subCategoryID;
            srchObj.subcategoryName = this.searchQCInventoryObj.subcategoryName = this.materialCategory.subCategoryName;
            srchObj.categoryName = this.searchQCInventoryObj.categoryName;
            srchObj.selectedBatchText = this.inventoryData.selectedText;
            srchObj.invID = this.searchQCInventoryObj.invID;
            srchObj.status = this.searchQCInventoryObj.statusID;
            srchObj.manufactureID = this.searchQCInventoryObj.manufactureID = this.manufacturer.selectedId;
            srchObj.manufacturerName = this.searchQCInventoryObj.manufacturerName = this.manufacturer.selectedText;
            srchObj.totalRecords = environment.recordsPerPage;

            srchObj.pageIndex = Number(this.searchQCInventoryObj.pageIndex);

            SearchBoSessions.setSearchAuditBO(key, srchObj);
        }

        this._qcinvtServ.searchQCInventory(this.searchQCInventoryObj);
    }


    changeMaterialCategory(event) {
        this.searchQCInventoryObj.categoryID = event.categoryID;
        this.searchQCInventoryObj.categoryCode = this.materialInfo.categoryCode = event.categoryCode;
        this.searchQCInventoryObj.categoryName = event.categoryName;
        this.searchQCInventoryObj.matName = event.materialName;
        this.searchQCInventoryObj.subcategoryName = event.subCategoryName;
        this.materialInfo.categoryCode = event.categoryCode;
        this.searchQCInventoryObj.subCategoryID = this.materialInfo.subCategoryID = event.subCategoryID;
        if (CommonMethods.hasValue(event.materialID))
            this.searchQCInventoryObj.matID = this.materialInfo.materialID = event.materialID;

    }


    prepareLKPInv(evt) {
        // if (CommonMethods.hasValue(evt.val) && CommonMethods.hasValue(evt.val.id))
        //     this.conditionInv = "MatID = " + evt.val.id + " AND (IsMBBlock IS NULL OR IsMBBlock = 0)";
        // else if (CommonMethods.hasValue(evt.action) && !CommonMethods.hasValue(evt.val)) {
        //     this.inventoryData.clear();
        //     this.conditionInv = " (IsMBBlock IS NULL OR IsMBBlock = 0)";
        // }
        var condition: string = "STATUS_CODE = 'ACT'";
        this.conditionInv = "EntityCode = 'QC_INV'"
        this.manufacturerInfo = CommonMethods.PrepareLookupInfo(LKPTitles.manufacturer, LookupCodes.getManufacturers, LKPDisplayNames.manufacturer,
            LKPDisplayNames.manufacturerCode, LookUpDisplayField.header, LKPPlaceholders.manufacturer, condition);
        this.inventoryInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, this.conditionInv)
    }

    formData() {
        if (!CommonMethods.hasValue(this.inventoryData.selectedId) && !CommonMethods.hasValue(this.searchQCInventoryObj.advanceSearch)
            && !CommonMethods.hasValue(this.searchQCInventoryObj.statusID) && !CommonMethods.hasValue(this.searchQCInventoryObj.batchUseBeforeDate)
            && !CommonMethods.hasValue(this.searchQCInventoryObj.useBeforeDate) && !CommonMethods.hasValue(this.searchQCInventoryObj.entityID)
            && !CommonMethods.hasValue(this.searchQCInventoryObj.chemicalType) && !CommonMethods.hasValue(this.searchQCInventoryObj.blockID)
            && !CommonMethods.hasValue(this.searchQCInventoryObj.inwardDateTo) && !CommonMethods.hasValue(this.searchQCInventoryObj.inwardDateFrom)
            && !CommonMethods.hasValue(this.manufacturer.selectedId) && !CommonMethods.hasValue(this.searchQCInventoryObj.chemicalGrade)
            && !this.searchQCInventoryObj.showZeroQtyRecords
            && !CommonMethods.hasValue(this.materialInfo.categoryCode) && !CommonMethods.hasValue(this.materialInfo.subCategoryID)
            && !CommonMethods.hasValue(this.materialInfo.materialID) && !CommonMethods.hasValue(this.searchQCInventoryObj.categoryID))
            return QCInvtMessages.searchQCInventoryMsg;
    }

    prepareHeaders() {
        // this.headers.push({ columnDef: 'icon', header: '', cell: (element: any) => `${element.isDestroyed}` });
        this.headers.push({ "columnDef": 'matFormatt', "header": "Name of the Chemical", cell: (element: any) => `${element.matFormatt}`, width: 'minWidth-35per' });
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch No.", cell: (element: any) => `${element.batchNumber}`, width: 'minWidth-15per' });
        this.headers.push({ "columnDef": 'chemicalNature', "header": "Chemical Type", cell: (element: any) => `${element.chemicalNature}`, width: 'minWidth-10per' });
        this.headers.push({ "columnDef": 'chemicalSource', "header": "Chemical Source", cell: (element: any) => `${element.chemicalSource}`, width: 'minWidth-15per' })
        this.headers.push({ "columnDef": 'BalQtyUom', "header": "Balance Qty.", cell: (element: any) => `${element.balQtyUom}`, width: 'minWidth-10per' });
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'minWidth-10per' });
    }

    export() {

        const _modal = this._matDialog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.qcInventory;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchQCInventoryObj.matID))
            condition = condition + " AND MatID = " + this.searchQCInventoryObj.matID;
        if (CommonMethods.hasValue(this.searchQCInventoryObj.invID))
            condition = condition + ' AND InvID = ' + this.searchQCInventoryObj.invID;
        if (CommonMethods.hasValue(this.searchQCInventoryObj.status))
            condition = condition + " AND ( StatusID = " + this.searchQCInventoryObj.status + ' OR ( StatusID IS NULL AND BatchStatusID = ' + this.searchQCInventoryObj.status + ' ))';
        if (CommonMethods.hasValue(this.searchQCInventoryObj.btBefDate))
            condition = condition + " AND BatchExpiry <= '" + dateParserFormatter.FormatDate(this.searchQCInventoryObj.batchUseBeforeDate, 'date') + "'";
        if (CommonMethods.hasValue(this.searchQCInventoryObj.useBefDate))
            condition = condition + " AND ValidUpTo <= '" + dateParserFormatter.FormatDate(this.searchQCInventoryObj.useBeforeDate, 'date') + "'";
        if (CommonMethods.hasValue(this.searchQCInventoryObj.entity))
            condition = condition + " AND EntityID = " + this.searchQCInventoryObj.entity;
        _modal.componentInstance.condition = condition;

    }

    update() {
        this._router.navigateByUrl("lims/qcInventory/manageQcInvt");
    }

    sampleDestruction() {
        this.sampleDestructionObj.invID = this.inventoryData.selectedId;
        this.sampleDestructionObj.statusID = this.searchQCInventoryObj.status;
        this.sampleDestructionObj.entity = this.searchQCInventoryObj.entity;
        this.sampleDestructionObj.batchUseBeforeDate = dateParserFormatter.FormatDate(this.searchQCInventoryObj.btBefDate, "date");
        this.sampleDestructionObj.useBeforeDate = dateParserFormatter.FormatDate(this.searchQCInventoryObj.useBefDate, "date");
        sessionStorage.setItem('DESTRUCTION', JSON.stringify(this.sampleDestructionObj));
        this._router.navigateByUrl("lims/sampleDestruction/sampleDestruction");
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.searchQCInventoryObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchQCInventoryObj.advanceSearch });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.inwardDateFrom))
            this.searchResult.push({ code: "INWARD_DATE_FROM", name: "Inward Date From: " + dateParserFormatter.FormatDate(this.searchQCInventoryObj.inwardDateFrom, "date") });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.inwardDateTo))
            this.searchResult.push({ code: "INWARD_DATE_TO", name: "Inward Date To: " + dateParserFormatter.FormatDate(this.searchQCInventoryObj.inwardDateTo, "date") });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusDetailsList.filter(x => x.statusID == this.searchQCInventoryObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.chemicalGrade))
            this.searchResult.push({ code: 'CHE_GRADE', name: "Chemical Grade: " + this.totalCatItemList.filter(x => x.catItemID == this.searchQCInventoryObj.chemicalGrade)[0].catItem });
        if (CommonMethods.hasValue(this.inventoryData.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.inventoryData.selectedText });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.useBeforeDate))
            this.searchResult.push({ code: "VALID_FROM", name: "Expiry / Validity Date From: " + dateParserFormatter.FormatDate(this.searchQCInventoryObj.useBeforeDate, 'date') });
        if (CommonMethods.hasValue(this.searchQCInventoryObj.batchUseBeforeDate))
            this.searchResult.push({ code: "VALID_TO", name: "Expiry / Validity Date To: " + dateParserFormatter.FormatDate(this.searchQCInventoryObj.batchUseBeforeDate, 'date') });
        // if (CommonMethods.hasValue(this.searchQCInventoryObj.batchExpDateTo))
        //     this.searchResult.push({ code: "USE_BEF", name: "Use Before Date: " + dateParserFormatter.FormatDate(this.searchQCInventoryObj.batchExpDateTo, "date") })
        if (CommonMethods.hasValue(this.manufacturer.selectedId))
            this.searchResult.push({ code: "MANU_NAME", name: "Manufacturer Name: " + this.manufacturer.selectedText })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.entityID))
            this.searchResult.push({ code: "CHE_SOU", name: "Chemical Source: " + this.getSources.filter(x => x.entityID == this.searchQCInventoryObj.entityID)[0].entity })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.chemicalType))
            this.searchResult.push({ code: "CHE_TYPE", name: "Chemical Type: " + this.totalCatItemList.filter(x => x.catItemID == this.searchQCInventoryObj.chemicalType)[0].catItem })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.blockID))
            this.searchResult.push({ code: "BLOCK_ID", name: "Block Name: " + this.blockList.filter(x => x.blocK_ID == this.searchQCInventoryObj.blockID)[0].blocK_NAME })
        if (this.searchQCInventoryObj.showZeroQtyRecords)
            this.searchResult.push({ code: "SHOW_ZER", name: "Show Zero Quantity Records: Yes" })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.categoryID))
            this.searchResult.push({ code: "CAT_ID", name: "Category Name: " + this.searchQCInventoryObj.categoryName })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.subCategoryID))
            this.searchResult.push({ code: "SUB_CAT_ID", name: "Sub Categroy: " + this.searchQCInventoryObj.subcategoryName })
        if (CommonMethods.hasValue(this.searchQCInventoryObj.matID))
            this.searchResult.push({ code: "MAT_ID", name: "Chemical: " + this.searchQCInventoryObj.matName });

    }

    clearOption(code, index) {
        if (code == "INWARD_DATE_FROM")
            this.searchQCInventoryObj.inwardDateFrom = null;
        else if (code == "INWARD_DATE_TO")
            this.searchQCInventoryObj.inwardDateTo = null;
        else if (code == "STATUS")
            this.searchQCInventoryObj.statusID = null;
        // else if (code == "USE_BEF")
        //     this.searchQCInventoryObj.batchExpDateTo = null;
        else if (code == "CHE_GRADE")
            this.searchQCInventoryObj.chemicalGrade = null;
        else if (code == "BATCH_NUM")
            this.inventoryData.clear();
        else if (code == "VALID_FROM")
            this.searchQCInventoryObj.useBeforeDate = null;
        else if (code == "VALID_TO")
            this.searchQCInventoryObj.batchUseBeforeDate = null;
        else if (code == "MANU_NAME")
            this.manufacturer.clear();
        else if (code == "CHE_SOU")
            this.searchQCInventoryObj.entityID = null;
        else if (code == "CHE_TYPE")
            this.searchQCInventoryObj.chemicalType = null;
        else if (code == "BLOCK_ID")
            this.searchQCInventoryObj.blockID = null;
        else if (code == "SHOW_ZER")
            this.searchQCInventoryObj.showZeroQtyRecords = null;
        else if (code == "CAT_ID") {
            this.searchQCInventoryObj.categoryID = null;
            this.materialCategory.clear();
        }
        else if (code == "SUB_CAT_ID") {
            this.searchQCInventoryObj.subCategoryID = 0;
            this.materialInfo.subCategoryID = 0;
        }
        else if (code == "MAT_ID") {
            this.searchQCInventoryObj.matID = null;
            this.materialInfo.materialID = null;
        }
        else if (code == "ADV_SRCH")
            this.searchQCInventoryObj.advanceSearch = null;

        this.searchResult.splice(index, 1);
    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }


    onPage(evt) {
        this.searchQCInventoryObj.pageIndex = evt;
        this.searchQCInvent('SEARCH', 'P');
    }

    addConverion() {
        const modal = this._matDialog.open(MaterialUomConversionsComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.isShowMaterial = false;
    }

    sendSample() {
        const modal = this._matDialog.open(SendSampleComponent, CommonMethods.modalFullWidth);
        modal.disableClose = true;
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