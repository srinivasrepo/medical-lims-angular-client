import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { EntityCodes, LookupCodes, GridActions, DCActionCode, CapabilityActions, SearchPageTooltip, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { SearchSampleAnalysis, deviation } from '../model/sampleAnalysisModel';
import { environment } from 'src/environments/environment';
import { LookupInfo, LookUpDisplayField, materialCatInfo, stageInfoBO } from 'src/app/limsHelpers/entity/limsGrid';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';
import { stageComponent } from 'src/app/limsHelpers/component/stageComponent.component';
import { AlertService } from 'src/app/common/services/alert.service';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { MatDialog } from '@angular/material';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { Router } from '@angular/router';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';


@Component({
    selector: 'srch-sampAnls',
    templateUrl: '../html/searchSampleAnalysis.html'
})

export class SearchSampleAnalysisComponent {

    subsription: Subscription = new Subscription();
    pageTitle: string = PageTitle.searchSampleAnalysis;
    headersData: any;
    dataSource: any;
    actions: any = [];
    totalRecords: number;
    currentSelectedIndex: number = 0;
    entityCode: string = EntityCodes.sampleAnalysis;
    searchBO: SearchSampleAnalysis = new SearchSampleAnalysis();
    statusList: any;
    analysisList: any;
    blockList: any;
    dateFrom: any;
    dateTo: any;
    removeActions: any = { headerName: 'sampleAna', UPD_REMARKS: 'statusCode' };
    hasExpCap: boolean = false;
    @ViewChild('sampleNum', { static: true }) sampleNum: LookupComponent;
    sampleNumberInfo: LookupInfo;

    @ViewChild('batches', { static: true }) batches: LookupComponent;
    batchNumberInfo: LookupInfo;

    @ViewChild('arNum', { static: true }) arNum: LookupComponent;
    arNumberInfo: LookupInfo;

    @ViewChild('projects', { static: true }) projects: LookupComponent;
    projectsInfo: LookupInfo;

    @ViewChild('material', { static: true }) material: materialCategoryComponent;
    // @ViewChild('product', { static: true }) product: stageComponent;
    productsInfo: LookupInfo;
    @ViewChild('products', { static: true }) products: LookupComponent;
    isExpand: boolean = false;

    materialInfo: materialCatInfo = new materialCatInfo()
    searchFil: any = [];
    srchTooltip: string = SearchPageTooltip.srchSampAnalysis;


    constructor(private _samAnService: SampleAnalysisService, private _alert: AlertService, public _global: GlobalButtonIconsService,
        private _contextService: LIMSContextServices, private _matDailog: MatDialog, private _router: Router, private modalService: SearchFilterModalService) {
            this.materialInfo.categoryList = [{catCode: 'RAW_MAT'}, {catCode: 'PAK_MAT'}, {catCode: 'INTER_MAT'}, {catCode: 'FIN_MAT'}, {catCode: 'WATER_MAT'}, {catCode: 'IMPSTD_MAT'}, {catCode: 'COPROD_MAT'}, {catCode: 'MTHLQR_MAT'}, {catCode: 'BYPROD_MAT'}]
            this.materialInfo.condition = "CATEGORY_CODE IN ('RAW_MAT', 'PAK_MAT', 'INTER_MAT', 'FIN_MAT', 'WATER_MAT', 'IMPSTD_MAT', 'COPROD_MAT', 'MTHLQR_MAT', 'BYPROD_MAT')";
            this.materialInfo.lkpType = "SEARCH";
            this.materialInfo.IsActive = false;
    }


    ngAfterContentInit() {
        this.subsription = this._samAnService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == 'searchSampleAnalysis') {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'filterTwiceCol', ['sampleOn', 'retestDate', 'expiryDate']));
                this.menuEvt();
                this.closeModal('sampAna-srch');
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "getAnalysisTypes")
                this.analysisList = resp.result;
            else if (resp.purpose == "getBlockByPlantID")
                this.blockList = resp.result;
        });
        this.prepareLKP();
        this.bindDrpDwns();
        this.prepareHeaders();
        this.searchFilter('ALL', 'Y');
        var capActions: CapabilityActions = this._contextService.getSearchActinsByEntityCode(EntityCodes.sampleAnalysis);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
    }

    prepareHeaders() {
        this.headersData = [];

        this.headersData.push({ columnDef: "sioCode", header: "Inward Number", cell: (element: any) => `${element.sioCode}`, width: "maxWidth-12per" });
        this.headersData.push({ columnDef: "arNumber", header: "AR Number", cell: (element: any) => `${element.arNumber}`, width: "maxWidth-12per qc_badge1" });
        this.headersData.push({ columnDef: "materialName", header: "Material / Product Name", cell: (element: any) => `${element.materialName}`, width: "minWidth-20per" });
        // this.headersData.push({ columnDef: "stage", header: "Stage", cell: (element: any) => `${element.stage}`, width: "maxWidth-5per" });
        this.headersData.push({ columnDef: "batchNumber", header: "Lot / Batch Number", cell: (element: any) => `${element.batchNumber}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "sampleOn", header: "Initiated On", cell: (element: any) => `${element.sampleOn}`, width: "maxWidth-11per" });
        // this.headersData.push({ columnDef: "sampleNumber", header: "Sample / Operation Number", cell: (element: any) => `${element.sampleNumber}`, width: "minWidth-15per" });
        this.headersData.push({ columnDef: "analysisType", header: "Analysis Type", cell: (element: any) => `${element.analysisType}`, width: "maxWidth-11per" });
        // this.headersData.push({ columnDef: "retestDate", header: "Retest Date", cell: (element: any) => `${element.retestDate}`, width: "maxWidth-7per" });
        // this.headersData.push({ columnDef: "expiryDate", header: "Expiry Date", cell: (element: any) => `${element.expiryDate}`, width: "maxWidth-7per" });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-10per" });
        // this.headersData.push({ columnDef: "oosStatus", header: "OOS Status", cell: (element: any) => `${element.oosStatus}`, width: "maxWidth-7per" });

    }

    searchFilter(type: string, init: string = 'N') {

        this.isExpand = false;

        var srchObj: SearchSampleAnalysis = new SearchSampleAnalysis();
        var key: string = SearchBoSessions['sampleAnalysis_' + this._contextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            srchObj = SearchBoSessions.getSearchAuditBO(key);

            this.searchBO.catID = srchObj.catID;
            this.material.materialInfo.categoryCode = srchObj.catCode;

            this.material.materialInfo.subCategoryID = this.searchBO.subcatID = srchObj.subcatID;
            this.material.categoryName = this.searchBO.catName = srchObj.catName;
            this.material.subCategoryName = this.searchBO.subCatName = srchObj.subCatName;

            this.material.materialInfo.materialID = this.searchBO.matID = srchObj.matID;
            this.searchBO.selectedMatText = this.material.materialInfo.materialName = srchObj.selectedMatText
            if (CommonMethods.hasValue(srchObj.matID))
                this.material.materials.setRow(srchObj.matID, srchObj.selectedMatText)
            //this.searchBO.productID = srchObj.productID;
            this.searchBO.selectedProdText = srchObj.selectedProdText;
            //.product.products.setRow(srchObj.productID, srchObj.selectedProdText);

            this.searchBO.stageID = srchObj.stageID;
            //this.product.stage = srchObj.stageID;

            this.searchBO.statusID = srchObj.statusID;

            this.searchBO.sampleID = srchObj.sampleID;
            this.searchBO.selectedSampleText = srchObj.selectedSampleText;
            if (CommonMethods.hasValue(srchObj.sampleID))
                this.sampleNum.setRow(srchObj.sampleID, srchObj.selectedSampleText);

            this.searchBO.batchID = srchObj.batchID;
            this.searchBO.selectedBatchText = srchObj.selectedBatchText;
            if (CommonMethods.hasValue(srchObj.batchID))
                this.batches.setRow(srchObj.batchID, srchObj.selectedBatchText);

            this.searchBO.aRID = srchObj.aRID;
            this.searchBO.selectedArText = srchObj.selectedArText;
            if (CommonMethods.hasValue(srchObj.aRID))
                this.arNum.setRow(srchObj.aRID, srchObj.selectedArText);

            this.searchBO.projectID = srchObj.projectID;
            this.searchBO.selectedProjectText = srchObj.selectedProjectText;
            if (CommonMethods.hasValue(srchObj.projectID))
                this.projects.setRow(srchObj.projectID, srchObj.selectedProjectText);

            this.searchBO.analysisTypeID = srchObj.analysisTypeID;
            this.searchBO.plantAreaID = srchObj.plantAreaID;
            this.searchBO.moleclueType = srchObj.moleclueType;
            this.dateFrom = dateParserFormatter.FormatDate(srchObj.dateFrom, 'default');
            this.dateTo = dateParserFormatter.FormatDate(srchObj.dateTo, 'default');
            this.searchBO.dateFrom = srchObj.dateFrom;
            this.searchBO.dateTo = srchObj.dateTo;
            this.searchBO.advanceSearch = srchObj.advanceSearch;
            this.searchBO.pageIndex = this.currentSelectedIndex = srchObj.pageIndex;

            if (CommonMethods.hasValue(srchObj.subcatID))
                this.material.bindSubCategories();
            // if (CommonMethods.hasValue(srchObj.stageID))
            //     this.products.setRow(srchObj.stageID, srchObj.selectedProdText)

            // var obj: stageInfoBO = new stageInfoBO();
            // obj.productID = srchObj.productID;
            // obj.productName = srchObj.selectedProdText;
            // obj.entityCode = EntityCodes.sampleAnalysis;
            // this.product.stageBO = obj;
            // this.product.bindData(obj)

        } else {

            if (!this.validateControls(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type == 'ALL' && init != 'Y') {
                this.searchBO = new SearchSampleAnalysis();

                // if (CommonMethods.hasValue(this.products.selectedId))
                //     this.products.clear();
                if (CommonMethods.hasValue(this.batches.selectedId))
                    this.batches.clear();
                if (CommonMethods.hasValue(this.arNum.selectedId))
                    this.arNum.clear();
                if (CommonMethods.hasValue(this.projects.selectedId))
                    this.projects.clear();
                if (CommonMethods.hasValue(this.material.categoryID) || CommonMethods.hasValue(this.material.materials.selectedId))
                    this.material.clear();
                if (CommonMethods.hasValue(this.sampleNum.selectedId))
                    this.sampleNum.clear();

                this.dateFrom = this.dateTo = null;

                this.searchFil = [];

            } else {

                if (CommonMethods.hasValue(this.dateFrom))
                    this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');

                if (CommonMethods.hasValue(this.dateTo))
                    this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');



                //this.searchBO.productID = this.product.productID;

                //this.searchBO.stageID = this.products.selectedId;

                this.searchBO.sampleID = this.sampleNum.selectedId;
                this.searchBO.batchID = this.batches.selectedId;
                this.searchBO.aRID = this.arNum.selectedId;
                this.searchBO.projectID = this.projects.selectedId;
                //this.searchBO.advanceSearch = srchObj.advanceSearch;
                this.searchBO.pageSize = environment.recordsPerPage;
                this.searchBO.pageIndex = this.currentSelectedIndex;

                srchObj.catID = this.searchBO.catID;
                srchObj.catCode = this.searchBO.catCode;
                srchObj.catName = this.material.categoryName;
                srchObj.subCatName = this.material.subCategoryName;

                srchObj.subcatID = this.searchBO.subcatID;

                srchObj.matID = this.searchBO.matID;
                srchObj.selectedMatText = this.searchBO.selectedMatText;

                //srchObj.productID = this.searchBO.productID;
                //srchObj.selectedProdText = this.products.selectedText;

                //srchObj.stageID = this.products.selectedId;

                srchObj.statusID = this.searchBO.statusID;

                srchObj.batchID = this.searchBO.batchID;
                srchObj.selectedBatchText = this.batches.selectedText;

                srchObj.aRID = this.searchBO.aRID;
                srchObj.selectedArText = this.arNum.selectedText;

                srchObj.sampleID = this.searchBO.sampleID;
                srchObj.selectedSampleText = this.sampleNum.selectedText;

                srchObj.projectID = this.searchBO.projectID;
                srchObj.selectedProjectText = this.projects.selectedText;

                srchObj.dateFrom = this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');
                srchObj.dateTo = this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');

                srchObj.pageSize = this.searchBO.pageSize;
                srchObj.pageIndex = this.searchBO.pageIndex;

                srchObj.analysisTypeID = this.searchBO.analysisTypeID;
                srchObj.plantAreaID = this.searchBO.plantAreaID;
                srchObj.moleclueType = this.searchBO.moleclueType;
                srchObj.advanceSearch = this.searchBO.advanceSearch;
            }
            if (init != 'P')
                this.currentSelectedIndex = 0;

            SearchBoSessions.setSearchAuditBO(key, srchObj);
        }

        this._samAnService.searchSampleAnalysis(this.searchBO);
    }

    prepareLKP() {
        //this.productsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.product, LookupCodes.mobilePhaseProduct, LKPDisplayNames.product, LKPDisplayNames.productCode, LookUpDisplayField.header, LKPPlaceholders.productName, "", "Stage", "LIMS");
        this.sampleNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sampleNumber, LookupCodes.getSampleNumbers, LKPDisplayNames.Material, LKPDisplayNames.sampleNumber, LookUpDisplayField.header, LKPPlaceholders.SampleNumber, "STATUS_CODE IN ('ACT', 'INACT')", '', 'LIMS');
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.batchNumber, LookupCodes.getLOTBatcheNumbers, LKPDisplayNames.Material, LKPDisplayNames.mrrBatchNumber, LookUpDisplayField.code, LKPPlaceholders.batchNumber, '', 'Block', 'LIMS');
        this.arNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getARNumbers, LKPDisplayNames.arNumber, LKPDisplayNames.smapleInward, LookUpDisplayField.header, LKPPlaceholders.refArNumber, '', '', 'LIMS');
        this.projectsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.projects, LookupCodes.getProjects, LKPDisplayNames.project, LKPDisplayNames.projectCode, LookUpDisplayField.header, LKPPlaceholders.project, '', '', 'LIMS');
    }

    bindDrpDwns() {
        this._samAnService.getStatuslist(EntityCodes.sampleAnalysis)
        this._samAnService.getAnalysisTypes();
        this._samAnService.getBlockByPlantID({deptCode:'',type:"ALL"});
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = environment.pageIndex = val;
        this.searchFilter('Search', 'P')
    }

    validateControls(type: string) {

        var isVal: boolean = true;
        if (type != 'ALL' && !CommonMethods.hasValue(this.searchBO.advanceSearch) && !CommonMethods.hasValue(this.material.categoryID) && !CommonMethods.hasValue(this.material.category) && /*!CommonMethods.hasValue(this.products.selectedId) && */ !CommonMethods.hasValue(this.dateFrom) && !CommonMethods.hasValue(this.dateTo) && !CommonMethods.hasValue(this.searchBO.statusID) && !CommonMethods.hasValue(this.searchBO.analysisTypeID) && !CommonMethods.hasValue(this.searchBO.plantAreaID) && !CommonMethods.hasValueWithZero(this.searchBO.moleclueType) && !CommonMethods.hasValue(this.sampleNum.selectedId) && !CommonMethods.hasValue(this.batches.selectedId) && !CommonMethods.hasValue(this.arNum.selectedId) && !CommonMethods.hasValue(this.projects.selectedId))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }

    onActionClicked(evt) {
        if (evt.action == 'UPD' || evt.action == 'VIE') {
            localStorage.removeItem('SAM_PAGE');
            if (evt.action == 'VIE')
                localStorage.setItem('SAM_PAGE', 'VIEW')
            else
                localStorage.setItem('SAM_PAGE', 'UPD')
            this._router.navigateByUrl('/lims/sampleAnalysis/manage?id=' + evt.val.encSioID);
        }
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.sampleAnalysis;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.searchBO.aRID))
            condition = condition + " AND AR_ID = " + this.searchBO.aRID;
        if (CommonMethods.hasValue(this.searchBO.catID))
            condition = condition + ' AND SAMPLE_ANA_MAT_CAT_ID = ' + this.searchBO.catID;
        if (CommonMethods.hasValue(this.searchBO.subcatID))
            condition = condition + ' AND SUBCATID = ' + this.searchBO.subcatID;
        if (CommonMethods.hasValue(this.searchBO.matID))
            condition = condition + ' AND MAT_ID = ' + this.searchBO.matID;
        if (CommonMethods.hasValue(this.searchBO.sampleID))
            condition = condition + ' AND SAMPLE_ID = ' + this.searchBO.sampleID;
        if (CommonMethods.hasValue(this.searchBO.productID))
            condition = condition + ' AND PROD_MAT_ID = ' + this.searchBO.productID;
        if (CommonMethods.hasValue(this.searchBO.stageID))
            condition = condition + ' AND STAGE_MAT_ID = ' + this.searchBO.stageID;
        if (CommonMethods.hasValue(this.searchBO.analysisTypeID))
            condition = condition + ' AND ANALYSIS_TYPE_ID = ' + this.searchBO.analysisTypeID;
        if (CommonMethods.hasValue(this.searchBO.projectID))
            condition = condition + ' AND PROJECT_ID = ' + this.searchBO.projectID;
        if (CommonMethods.hasValue(this.searchBO.moleclueType))
            condition = condition + ' AND MOLECULE_TYPE = ' + this.searchBO.moleclueType;
        if (CommonMethods.hasValue(this.searchBO.batchID))
            condition = condition + ' AND INV_ACTUAL_ID = ' + this.searchBO.batchID;
        if (CommonMethods.hasValue(this.searchBO.plantAreaID))
            condition = condition + ' AND BLOCK_ID = ' + this.searchBO.plantAreaID
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            condition = condition + " AND CREATED_ON >= '" + dateParserFormatter.FormatDate(this.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            condition = condition + " AND CREATED_ON < '" + dateParserFormatter.FormatDate(this.dateTo.setDate(this.dateTo.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            condition = condition + " AND STATUS_CODE = '" + obj[0].statusCode + "'";
        }
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            condition = condition + " AND ( AR_NUM LIKE '%" + this.searchBO.advanceSearch + "%' OR PRODUCT_NAME LIKE '%" + this.searchBO.advanceSearch + "%' OR INV_BATCHNUM LIKE '%" + this.searchBO.advanceSearch + "%' OR ANALYSIS_TYPE  LIKE '%" + this.searchBO.advanceSearch + "%' )";

        _modal.componentInstance.condition = condition;
    }

    changeMaterialCategory(event) {
        this.searchBO.catID = event.categoryID;
        this.searchBO.catCode = this.materialInfo.categoryCode = event.categoryCode;
        this.searchBO.catName = event.categoryName;
        this.searchBO.selectedMatText = event.materialName;
        this.searchBO.subCatName = event.subCategoryName;
        this.materialInfo.categoryCode = event.categoryCode;
        this.searchBO.subcatID = this.materialInfo.subCategoryID = event.subCategoryID;
        if (CommonMethods.hasValue(event.materialID))
            this.searchBO.matID = this.materialInfo.materialID = event.materialID;

    }

    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        // if (CommonMethods.hasValue(this.products.selectedId))
        //     this.searchFil.push({ code: "PRO_CODE", name: "Product: " + this.products.selectedText });
        if (CommonMethods.hasValue(this.batches.selectedId))
            this.searchFil.push({ code: "BAT_NUM", name: "Lot/Batch Number: " + this.batches.selectedText });
        if (CommonMethods.hasValue(this.arNum.selectedId))
            this.searchFil.push({ code: "AR_NUM", name: "AR Number: " + this.arNum.selectedText });
        if (CommonMethods.hasValue(this.searchBO.analysisTypeID))
            this.searchFil.push({ code: 'ANA_TYPE', name: "Analysis Type: " + this.analysisList.filter(x => x.speC_TYPE_ID == this.searchBO.analysisTypeID)[0].speC_TYPE });
        if (CommonMethods.hasValue(this.searchBO.catName))
            this.searchFil.push({ code: "Mat_TYPE", name: "Material Category: " + this.searchBO.catName });
        if (CommonMethods.hasValue(this.searchBO.subcatID))
            this.searchFil.push({ code: 'sub_TYPE', name: "Sub Category: " + this.searchBO.subCatName });
        if (CommonMethods.hasValue(this.material.materials.selectedId))
            this.searchFil.push({ code: 'MATERIAL', name: "Material Code: " + this.searchBO.selectedMatText });
        if (CommonMethods.hasValue(this.projects.selectedId))
            this.searchFil.push({ code: "PROJECTS", name: "Projects: " + this.projects.selectedText });
        if (CommonMethods.hasValue(this.searchBO.plantAreaID))
            this.searchFil.push({ code: "PLANT_AREA", name: "Plant Area: " + this.blockList.filter(x => x.blocK_ID == this.searchBO.plantAreaID)[0].blocK_NAME });
        if (this.searchBO.moleclueType == 1)
            this.searchFil.push({ code: "MOL_TYPE", name: "Molecule Type: " + "Development Molecule" });
        else if (this.searchBO.moleclueType == 0)
            this.searchFil.push({ code: "MOL_TYPE", name: "Molecule Type: " + "Filed Molecule" });
        if (CommonMethods.hasValue(this.sampleNum.selectedId))
            this.searchFil.push({ code: "SAM_NUM", name: "Sample/Operation Number: " + this.sampleNum.selectedText });
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.searchBO.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.searchBO.dateTo, 'date') });
        if (CommonMethods.hasValue(this.searchBO.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            this.searchFil.push({ code: 'STATUS', name: "Status: " + obj[0].status });
        }
    }

    clearOption(code, index) {
        // if (code == "PRO_CODE")
        //     this.products.clear();
        if (code == "BAT_NUM")
            this.batches.clear();
        else if (code == "AR_NUM")
            this.arNum.clear();
        else if (code == "ANA_TYPE")
            this.searchBO.analysisTypeID = null;
        else if (code == "PROJECTS")
            this.projects.clear();
        else if (code == "Mat_TYPE")
            this.material.categoryID = null;
        else if (code == "Sub_TYPE")
            this.material.subCategory = null;
        else if (code == "MATERIAL")
            this.material.materials.clear();
        else if (code == "PLANT_AREA")
            this.searchBO.plantAreaID = null;
        else if (code == "MOL_TYPE")
            this.searchBO.moleclueType = null;
        else if (code == "SAM_NUM")
            this.sampleNum.clear();
        else if (code == "DATE_FROM")
            this.searchBO.dateFrom = null;
        else if (code == "DATE_TO")
            this.searchBO.dateTo = null;
        else if (code == "STATUS")
            this.searchBO.statusID = null;
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        this.searchFil.splice(index, 1);
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

    containerWiseMaterials() {
        this._router.navigate(['lims/sampleAnalysis/containerWiseMaterials']);
    }

    ngOnDestroy() {
        this.subsription.unsubscribe();

    }
}