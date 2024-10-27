import { Component, ViewChild } from '@angular/core';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { materialCatInfo, LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { SearchOos } from '../model/oosModel';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, EntityCodes, GridActions, SearchPageTooltip, CapabilityActions } from 'src/app/common/services/utilities/constants';
import { OosService } from '../services/oos.service';
import { stageComponent } from 'src/app/limsHelpers/component/stageComponent.component';
import { OosMessages } from '../messages/oosMessages';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';


@Component({
    selector: 'oos-srch',
    templateUrl: '../html/searchOos.html'
})

export class SearchOosComponent {

    pageTitle: string = PageTitle.searchOos;
    totalNoOfRows: number;
    headers: any = [];
    dataSource: any;
    actions: any = [GridActions.view];
    statusList: any;
    materialInfo: materialCatInfo = new materialCatInfo();
    searchOosObj: SearchOos = new SearchOos();
    entitySourceCode: string;
    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    batchNumberInfo: LookupInfo;
    @ViewChild('batchNumber', { static: false }) batchNumber: LookupComponent;
    testInfo: LookupInfo;
    @ViewChild('specTests', { static: true }) specTests: LookupComponent;
    productsInfo: LookupInfo;
    @ViewChild('product', { static: true }) product: LookupComponent;
    @ViewChild('material', { static: true }) material: materialCategoryComponent;
    searchBy: string = SearchPageTooltip.srchOos;
    searchResult: any = [];
    hasExpCap: boolean = false;
    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, private _oosService: OosService, private _matDailog: MatDialog,
        public _global: GlobalButtonIconsService, private _router: Router, private _limsContextService: LIMSContextServices, private _limstitle: LIMSContextServices,
        private modalService: SearchFilterModalService) {
        this.materialInfo.isCategoryShow = true;
        this.materialInfo.category = "Material Category";
        this.materialInfo.categoryList = [{ catCode: 'RAW_MAT' }, { catCode: 'PAK_MAT' }, { catCode: 'INTER_MAT' }, { catCode: 'FIN_MAT' }]
        this.materialInfo.isSubCategoryShow = true;
        this.materialInfo.lkpType = "SEARCH";
        this.materialInfo.IsActive = false;
    }

    ngAfterViewInit() {
        this.subscription = this._oosService.oosSubject.subscribe(resp => {
            if (resp.purpose == "getStatusList")
                this.statusList = resp.result;
            else if (resp.purpose == "searchOOSTestDetails") {
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateTimeFormat", 'createdOn'));
                this.totalNoOfRows = resp.result.totalNumberOfRows;
                this.closeModal("oos-srch");
                this.menuEvt();
            }
        })

        this.prepareHeaders();
        this.prepareLKP();
        this._oosService.getStatusList(EntityCodes.oosModule);
        this.searchOos('ALL', 'A');

        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.oosModule);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
    }

    prepareLKP() {
        var batchCondition: string;
        var specCondition: string;
        var testCondition: string = "STATUS_ID = '1'";
        var condition: string = "";
        if (CommonMethods.hasValue(this.materialInfo.materialID))
            batchCondition = 'MAT_ID=' + this.materialInfo.materialID;
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getOOSBatchNumbers,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Material, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchCondition);
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecificationSearch, LKPDisplayNames.specification,
            LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification);
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getOosTests, LKPDisplayNames.testName,
            LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, testCondition, "", "LIMS");
        this.productsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.product, LookupCodes.mobilePhaseProduct, LKPDisplayNames.product, LKPDisplayNames.productCode, LookUpDisplayField.header, LKPPlaceholders.product, "", "Stage", "LIMS");
    }

    searchOos(type: string, init: string = 'B') {
        var obj: SearchOos = new SearchOos();
        var key: string = SearchBoSessions['oosSessionBo_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'A') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.searchOosObj.statusID = obj.statusID;
            this.searchOosObj.pageIndex = Number(obj.pageIndex);
            this.searchOosObj.materialID = obj.materialID;
            this.searchOosObj.categoryID = obj.categoryID;
            this.searchOosObj.subCatID = obj.subCatID;
            this.searchOosObj.moleculaType = obj.moleculaType;
            this.searchOosObj.oosNumberFrom = obj.oosNumberFrom;
            this.searchOosObj.oosNumberTo = obj.oosNumberTo;
            this.searchOosObj.productID = obj.productID;
            this.searchOosObj.specificationID = obj.specificationID;
            this.searchOosObj.testID = obj.testID;
            this.searchOosObj.dateFrom = obj.dateFrom;
            this.searchOosObj.dateTo = obj.dateTo;
            this.searchOosObj.pageIndex = obj.pageIndex;
            if (CommonMethods.hasValue(obj.productID))
                this.product.setRow(obj.productID, obj.productName);
            if (CommonMethods.hasValue(obj.specificationID))
                this.specifications.setRow(obj.specificationID, obj.specificationName);
            if (CommonMethods.hasValue(obj.testID))
                this.specTests.setRow(obj.testID, obj.testName);
            if (CommonMethods.hasValue(obj.batchNumber))
                this.batchNumber.setRow(obj.batchNumber, obj.batchNoName);

            this.material.materialInfo.subCategoryID = this.searchOosObj.subCatID = obj.subCatID;
            this.material.categoryName = this.searchOosObj.categoryName = obj.categoryName;
            this.material.subCategoryName = this.searchOosObj.subCatName = obj.subCatName;
            this.material.materialInfo.materialID = this.searchOosObj.materialID = obj.materialID;
            this.searchOosObj.selectedMaterial = this.material.materialInfo.materialName = obj.selectedMaterial
            if (CommonMethods.hasValue(obj.materialID))
                this.material.materials.setRow(obj.materialID, obj.selectedMaterial)
        }
        else {
            if (type == 'ALL') {
                this.searchOosObj.statusID = this.searchOosObj.materialID = this.searchOosObj.categoryID = this.searchOosObj.subCatID =
                    this.searchOosObj.moleculaType = this.searchOosObj.oosNumberFrom = this.searchOosObj.oosNumberTo = this.searchOosObj.productID =
                    this.searchOosObj.projectID = this.searchOosObj.specificationID = this.searchOosObj.stageID = this.searchOosObj.testID =
                    this.searchOosObj.dateTo = this.searchOosObj.dateFrom = null;
                this.product.clear();
                this.specifications.clear();
                this.specTests.clear();
                this.batchNumber.clear();
                if (CommonMethods.hasValue(this.material.categoryID) || CommonMethods.hasValue(this.material.materials.selectedId))
                    this.material.clear();
            }

            if (type == "SEARCH" && init == "B") {
                var errmsg: string = this.validate();
                if (CommonMethods.hasValue(errmsg))
                    return this._alert.warning(errmsg);
            }

            if (init != 'P')
                this.searchOosObj.pageIndex = 0;
            this.searchOosObj.materialID = this.materialInfo.materialID;
            this.searchOosObj.subCatID = this.materialInfo.subCategoryID;
            this.searchOosObj.stageID = this.product.selectedId;
            this.searchOosObj.specificationID = this.specifications.selectedId;
            this.searchOosObj.testID = this.specTests.selectedId;
            this.searchOosObj.batchNumber = this.batchNumber.selectedId;
            obj.categoryName = this.searchOosObj.categoryName = this.material.categoryName;
            obj.subCatName = this.searchOosObj.subCatName = this.material.subCategoryName;
            obj.selectedMaterial = this.searchOosObj.selectedMaterial = this.searchOosObj.selectedMaterial;



            obj.statusID = this.searchOosObj.statusID;
            obj.pageIndex = this.searchOosObj.pageIndex;
            obj.materialID = this.searchOosObj.materialID;
            obj.categoryID = this.searchOosObj.categoryID;
            obj.subCatID = this.searchOosObj.subCatID;
            obj.moleculaType = this.searchOosObj.moleculaType;
            obj.oosNumberFrom = this.searchOosObj.oosNumberFrom;
            obj.oosNumberTo = this.searchOosObj.oosNumberTo;
            obj.productID = this.searchOosObj.productID;
            obj.specificationID = this.searchOosObj.specificationID;
            obj.testID = this.searchOosObj.testID;
            obj.testName = this.specTests.selectedText;
            obj.specificationName = this.specifications.selectedText;
            obj.batchNoName = this.batchNumber.selectedText;
            obj.productName = this.product.selectedText;
            obj.dateFrom = this.searchOosObj.dateFrom;
            obj.dateTo = this.searchOosObj.dateTo;

            SearchBoSessions.setSearchAuditBO(key, obj);
        }
        this._oosService.searchOOSTestDetails(this.searchOosObj);
    }

    materialData(evt) {
        this.materialInfo.categoryCode = evt.categoryCode;
        this.materialInfo.subCategoryID = evt.subCategoryID;
        this.materialInfo.materialID = evt.materialID;
        this.searchOosObj.categoryID = evt.categoryID;
        this.searchOosObj.categoryName = evt.categoryName;
        this.searchOosObj.subCatName = evt.subCategoryName;
        this.searchOosObj.selectedMaterial = evt.materialName;
    }

    prepareHeaders() {
        this.headers.push({ "columnDef": 'oosNumber', "header": "OOS Number", cell: (element: any) => `${element.oosNumber}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'createdOn', "header": "Date", cell: (element: any) => `${element.createdOn}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'materialName', "header": "Mat. Name (Code)", cell: (element: any) => `${element.materialName}`, width: 'maxWidth-25per' });
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch No.", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'specNumber', "header": "Specification No.", cell: (element: any) => `${element.specNumber}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'testName', "header": "Test Name", cell: (element: any) => `${element.testName}`, width: 'maxWidth-15per' });
        this.headers.push({ "columnDef": 'specLimit', "header": "Specification Limit", cell: (element: any) => `${element.specLimit}`, width: 'maxWidth-10per' });
        this.headers.push({ "columnDef": 'oosResult', "header": "Result", cell: (element: any) => `${element.result}`, width: 'maxWidth-7per' });
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });
    }

    validate() {
        if (!CommonMethods.hasValue(this.searchOosObj.dateFrom) && !CommonMethods.hasValue(this.searchOosObj.dateTo) &&
            !CommonMethods.hasValue(this.materialInfo.materialID) && !CommonMethods.hasValue(this.searchOosObj.categoryID) &&
            !CommonMethods.hasValue(this.materialInfo.subCategoryID) && !CommonMethods.hasValue(this.batchNumber.selectedId) &&
            !CommonMethods.hasValue(this.searchOosObj.oosNumberFrom) && !CommonMethods.hasValue(this.searchOosObj.oosNumberTo) &&
            !CommonMethods.hasValue(this.specTests.selectedId) && !CommonMethods.hasValue(this.specifications.selectedId) &&
            !CommonMethods.hasValue(this.product.selectedId) && !CommonMethods.hasValue(this.searchOosObj.statusID) &&
            !CommonMethods.hasValue(this.searchOosObj.buildID) &&
            !CommonMethods.hasValue(this.searchOosObj.moleculaType))
            return OosMessages.searchMsg;
    }

    onActionClicked(evt) {
        localStorage.setItem("viewOos", evt.val.encOosTestID);
        localStorage.setItem('conditionCode', 'OOS_APP');
        this._router.navigate(['lims/oos/manage'], { queryParams: { id: evt.val.encOosTestID } });
    }

    onPage(evt) {
        this.searchOosObj.pageIndex = evt;
        this.searchOos('SEARCH', 'P');
    }

    menuEvt() {
        this.searchResult = [];
        if (CommonMethods.hasValue(this.searchOosObj.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchOosObj.advanceSearch });
        if (CommonMethods.hasValue(this.batchNumber.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.batchNumber.selectedText });
        if (CommonMethods.hasValue(this.searchOosObj.dateFrom))
            this.searchResult.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.searchOosObj.dateFrom, "date") });
        if (CommonMethods.hasValue(this.searchOosObj.dateTo))
            this.searchResult.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.searchOosObj.dateTo, "date") });
        if (CommonMethods.hasValue(this.specifications.selectedId))
            this.searchResult.push({ code: "SPEC", name: "Specification Number: " + this.specifications.selectedText });
        if (CommonMethods.hasValue(this.product.selectedId))
            this.searchResult.push({ code: "PROD", name: "Product Name / Material Name: " + this.product.selectedText });
        if (CommonMethods.hasValue(this.specTests.selectedId))
            this.searchResult.push({ code: "SPEC_TEST", name: "Test Name: " + this.specTests.selectedText });
        if (CommonMethods.hasValue(this.searchOosObj.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.searchOosObj.statusID)[0].status });
        if (CommonMethods.hasValue(this.searchOosObj.categoryID))
            this.searchResult.push({ code: "Mat_TYPE", name: "Material Category: " + this.searchOosObj.categoryName });
        if (CommonMethods.hasValue(this.searchOosObj.subCatID))
            this.searchResult.push({ code: 'sub_TYPE', name: "Sub Category: " + this.searchOosObj.subCatName });
        if (CommonMethods.hasValue(this.material.materials.selectedId))
            this.searchResult.push({ code: 'MATERIAL', name: "Material Code: " + this.searchOosObj.selectedMaterial });
    }

    clearOption(code, index) {
        if (code == "ADV_SRCH")
            this.searchOosObj.advanceSearch = null;
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "DATE_FROM")
            this.searchOosObj.dateFrom = null;
        else if (code == "DATE_TO")
            this.searchOosObj.dateTo = null;
        else if (code == "SPEC")
            this.specifications.clear();
        else if (code == "PROD")
            this.product.clear();
        else if (code == "SPEC_TEST")
            this.specTests.clear();
        else if (code == "STATUS")
            this.searchOosObj.statusID = null;
        else if (code == "Mat_TYPE")
            this.material.categoryID = null;
        else if (code == "Sub_TYPE")
            this.material.subCategory = null;
        else if (code == "MATERIAL")
            this.material.materials.clear();

        this.searchResult.splice(index, 1);

    }

    hasSearchVal() {
        var obj = this.searchResult.filter(x => x.code == 'ADV_SRCH')
        return (obj.length > 0);
    }

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    export() {
        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.oosModule;

        var obj: SearchOos = new SearchOos();
        var key: string = SearchBoSessions['oosSessionBo_' + this._limsContextService.getEntityType()];
        obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND ArdsExecID IS NOT NULL";
        if (CommonMethods.hasValue(obj.categoryID))
            condition = condition + " AND CATEGORY = " + obj.categoryID;
        if (CommonMethods.hasValue(obj.subCatID))
            condition = condition + ' AND SUBCATID = ' + obj.subCatID;
        if (CommonMethods.hasValue(obj.materialID))
            condition = condition + ' AND MAT_ID = ' + obj.materialID;
        if (CommonMethods.hasValue(obj.batchNumber))
            condition = condition + ' AND INV_ID = ' + obj.batchNumber;
        if (CommonMethods.hasValue(obj.stageID))
            condition = condition + ' AND STAGE_ID = ' + obj.stageID;
        if (CommonMethods.hasValue(obj.specificationID))
            condition = condition + ' AND SPECIFICATION_ID = ' + obj.specificationID;
        if (CommonMethods.hasValue(obj.testID))
            condition = condition + ' AND TEST_ID = ' + obj.testID;
        if (CommonMethods.hasValue(obj.dateFrom))
            condition = condition + " AND CREATED_ON >= '" + dateParserFormatter.FormatDate(this.searchOosObj.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(obj.dateTo))
            condition = condition + " AND CREATED_ON < '" + dateParserFormatter.FormatDate(this.searchOosObj.dateTo.setDate(this.searchOosObj.dateTo.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(obj.statusID)) {
            var data = this.statusList.filter(x => x.statusID == obj.statusID);
            condition = condition + " AND STATUS_CODE = '" + data[0].statusCode + "'";
        }
        _modal.componentInstance.condition = condition;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}