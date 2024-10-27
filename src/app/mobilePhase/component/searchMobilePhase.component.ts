import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { stageInfoBO, LookUpDisplayField, LookupInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { stageComponent } from 'src/app/limsHelpers/component/stageComponent.component';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { mobilephaseMessages } from '../messages/mobilePhaseMessages';
import { searchBo, CommentsBO, MPSearchTableColumnConfig } from '../model/mobilePhaseModel';
import { environment } from 'src/environments/environment.prod';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Router } from '@angular/router';
import { CapabilityActions, EntityCodes, LimsRespMessages, ActionMessages, LookupCodes, SearchPageTooltip, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MatDialog } from '@angular/material';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { LKPTitles, LKPPlaceholders, LKPDisplayNames } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { CategoryItemList, GetCategoryBO } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'src-mp',
    templateUrl: '../html/searchMobilePhase.html'
})

export class searchMobilePhaseComponent {

    pageTitle: string = PageTitle.searchMobilePhase;
    subscription: Subscription = new Subscription();
    stageBO: stageInfoBO = new stageInfoBO();
    currentSelectedIndex: number = 0;
    totalRecords: number;
    headersData: any;
    dataSource: any;
    actions: any = [];
    hasCreateCap: boolean;
    statusList: any = [];
    statusID: number = 0;
    purpose: number = 0;
    removeActions: any = { 'action': 'DISC', extraField: 'finalStatusCode', compareField: 'statusCode' }
    extraColumns: any
    @ViewChild('stage', { static: true }) stage: stageComponent;
    productsInfo: LookupInfo;
    @ViewChild('products', { static: true }) products: LookupComponent;
    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    testInfo: LookupInfo;
    @ViewChild('specTests', { static: true }) specTests: LookupComponent;
    inventoryInfo: LookupInfo;
    @ViewChild('inventoryData', { static: true }) inventoryData: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    analystInfo: LookupInfo;
    @ViewChild('analyst', { static: true }) analyst: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;

    preparationType: number;
    testCondition: string;
    searchBy: string = SearchPageTooltip.srchMobilePhase;
    searchResult: any = [];
    advanceSearch: string;
    validityFrom: Date;
    validityTo: Date;
    initiatedOn: Date;
    initiatedBy: number;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    totalCatItemList: CategoryItemList;
    today: Date = new Date();
    hasExpCap: boolean = false;

    constructor(private mpService: mobilePhaseService, private alert: AlertService,
        private router: Router, private _limstitle: LIMSContextServices,
        private _confirm: ConfirmationService, private _matDailog: MatDialog, public _global: GlobalButtonIconsService,
        private modalService: SearchFilterModalService) {
        this.stageBO.entityCode = EntityCodes.mobilePhase;
    }

    ngAfterViewInit() {
        this.subscription = this.mpService.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "getSearchMobilePhaseData") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.list, "filterTwiceCol", ['createdOn', 'useBefore']))
                this.menuEvt();
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "manageDiscardCommnets") {
                if (resp.result == 'OK') {
                    this.alert.success(mobilephaseMessages.succDisc);
                    this.searchFilter('Search', 'P');
                }
                else this.alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        });
        this.prepareLkp();
        this.testLkp();
        this.mpService.getStatuslist(EntityCodes.mobilePhase);
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetMobilePhaseCategories();
        obj.type = 'ALL';
        this.mpService.getCatItemsByCatCodeList(obj);
        this.searchFilter('ALL', 'Y');
    }

    ngAfterContentInit() {
        this.prepareHeader();
        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.mobilePhase);
        this.actions = capActions.actionList;
        //  this.actions.push('DISC')
        this.hasCreateCap = capActions.createCap;
        this.hasExpCap = capActions.exportCap;
    }

    prepareLkp() {
        var condition = 'STATUS_CODE =' + "\'ACT\'";
        var batchNumCondition = "EntityCode = 'MOBILE_PHASE'";

        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initiatedBy, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initiatedBy, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'");
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification, LKPDisplayNames.specNumber,
            LookUpDisplayField.code, LKPPlaceholders.specification, condition, '', 'LIMS');
        this.productsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.product, LookupCodes.mobilePhaseProduct, LKPDisplayNames.product,
            LKPDisplayNames.productCode, LookUpDisplayField.header, LKPPlaceholders.product, "", "Stage", "LIMS");
        this.inventoryInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.searchMobilePhase,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
        this.systemCodeFromLkp();
        this.systemCodeToLkp();
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "MobilePhaseID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.searchMobilePhase,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "MobilePhaseID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.searchMobilePhase,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }

    testLkp() {

        this.testCondition = "REQUEST_TYPE IN ('AT', 'CP')";
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testParameter, LookupCodes.getTests, LKPDisplayNames.testOrParameterName, LKPDisplayNames.testOrParameterName, LookUpDisplayField.header, LKPPlaceholders.testParamName, this.testCondition);

    }

    stageSelected(evt) {
        this.stageBO.productID = evt.productID;
        this.stageBO.stageID = evt.stage;
        this.stageBO.productName = evt.productName;
        this.stageBO.entityCode = EntityCodes.mobilePhase;
    }

    searchFilter(type: string = 'ALL', init: string = 'N') {
        var obj: searchBo = new searchBo();
        var key: string = SearchBoSessions['mobilePhaseBO_' + this._limstitle.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.statusID = obj.statusID;
            this.purpose = obj.purpose;
            this.preparationType = obj.preparationType;
            if (CommonMethods.hasValue(obj.specificationID))
                this.specifications.setRow(obj.specificationID, obj.specificationName)
            if (CommonMethods.hasValue(obj.productID))
                this.products.setRow(obj.productID, obj.productName);
            if (CommonMethods.hasValue(obj.specTestID))
                this.specTests.setRow(obj.specTestID, obj.testName);
            if (CommonMethods.hasValue(obj.batchNumber))
                this.inventoryData.setRow(obj.batchNumber, obj.batchName);
            if (CommonMethods.hasValue(obj.mobilePhaseIDFrom))
                this.systemCodeFrom.setRow(obj.mobilePhaseIDFrom, obj.mobilePhaseFromCode);
            if (CommonMethods.hasValue(obj.mobilePhaseIDTo))
                this.systemCodeTo.setRow(obj.mobilePhaseIDTo, obj.mobilePhaseToCode);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.analyst.setRow(obj.initiatedBy, obj.initiatedByName);
            if (CommonMethods.hasValue(obj.mobilePhaseID))
                this.systemCode.setRow(obj.mobilePhaseID, obj.mobilePhaseName);
            this.validityTo = obj.validTo;
            this.validityFrom = obj.validFrom;
            this.initiatedOn = obj.initiatedOn
            this.currentSelectedIndex = Number(obj.pageIndex);
        }
        else {

            if (type == 'ALL') {
                // this.stage.clear();
                // this.stageBO = new stageInfoBO();
                // this.stageBO.entityCode = EntityCodes.mobilePhase;
                this.products.clear();
                this.currentSelectedIndex = 0;
                this.statusID = this.purpose = 0;
                this.advanceSearch = this.preparationType = this.validityTo = this.validityFrom = this.initiatedOn = null;
                this.specTests.clear();
                this.specifications.clear();
                this.systemCodeFrom.clear();
                this.systemCodeTo.clear();
                this.inventoryData.clear();
                this.analyst.clear();
                this.systemCode.clear();
            }
            else if (init != 'P' && this.validation()) {
                return this.alert.warning(mobilephaseMessages.searchCriteria)
            }
            else {
                // obj.productID = this.stageBO.productID;
                obj.stageID = this.products.selectedId;
                obj.statusID = this.statusID;
                obj.purpose = this.purpose;
                obj.productName = this.products.selectedText;
                obj.advanceSearch = this.advanceSearch;
                obj.preparationType = this.preparationType;
                obj.specTestID = this.specTests.selectedId;
                obj.specificationID = this.specifications.selectedId;
                obj.validFrom = this.validityFrom;
                obj.validTo = this.validityTo;
                obj.batchNumber = this.inventoryData.selectedId;
                obj.mobilePhaseIDFrom = this.systemCodeFrom.selectedId;
                obj.mobilePhaseIDTo = this.systemCodeTo.selectedId;
                obj.mobilePhaseFromCode = this.systemCodeFrom.selectedText;
                obj.mobilePhaseToCode = this.systemCodeTo.selectedText;
                obj.testName = this.specTests.selectedText;
                obj.specificationName = this.specifications.selectedText;
                obj.batchName = this.inventoryData.selectedText;
                obj.initiatedOn = dateParserFormatter.FormatDate(this.initiatedOn, 'date');
                obj.initiatedBy = this.analyst.selectedId;
                obj.initiatedByName = this.analyst.selectedText;
                obj.mobilePhaseID = this.systemCode.selectedId;
                obj.mobilePhaseName = this.systemCode.selectedText;

            }

            obj.pageSize = environment.recordsPerPage;
            obj.pageIndex = this.currentSelectedIndex;

            SearchBoSessions.setSearchAuditBO(key, obj);

        }
        this.closeModal("mobilePhase-search");
        this.mpService.getSearchMobilePhaseData(obj);

    }

    validation() {
        if (!(CommonMethods.hasValue(this.products.selectedId)
            || CommonMethods.hasValue(this.purpose) || CommonMethods.hasValue(this.statusID)
            || CommonMethods.hasValue(this.advanceSearch) || CommonMethods.hasValue(this.preparationType)
            || CommonMethods.hasValue(this.specifications.selectedId) || CommonMethods.hasValue(this.specTests.selectedId)
            || CommonMethods.hasValue(this.validityFrom) || CommonMethods.hasValue(this.validityTo)
            || CommonMethods.hasValue(this.systemCodeTo.selectedId) || CommonMethods.hasValue(this.systemCodeFrom.selectedId)
            || CommonMethods.hasValue(this.inventoryData.selectedId) || CommonMethods.hasValue(this.analyst.selectedId)
            || CommonMethods.hasValue(this.initiatedOn) || CommonMethods.hasValue(this.systemCode.selectedId)))
            return true;
        else
            return false;
    }

    create() {
        this.router.navigateByUrl('lims/mobilePhase/add');
    }

    prepareHeader() {

        this.headersData = MPSearchTableColumnConfig();

        // this.headersData = [];

        // this.extraColumns = [];

        // this.headersData.push({ columnDef: 'batchNumber', header: "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' });
        // this.headersData.push({ columnDef: 'productName', header: "Product Name", cell: (element: any) => `${element.productName}`, width: 'minWidth-30per' });
        // this.headersData.push({ columnDef: 'userName', header: "Initiated By", cell: (element: any) => `${element.userName}`, width: 'maxWidth-15per' });
        // this.headersData.push({ columnDef: 'specTest', header: "Test Name", cell: (element: any) => `${element.specTest}`, width: 'minWidth-20per' });


        // // this.headersData.push({ columnDef: 'useBefore', header: "Validity", cell: (element: any) => `${element.useBefore}`, width: 'maxWidth-11per' });
        // // this.headersData.push({ columnDef: 'finalVolume', header: "Final Volume", cell: (element: any) => `${element.finalVolume}`, width: 'maxWidth-11per' });
        // // this.headersData.push({ columnDef: 'status', header: "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });

        // this.headersData.push({ columnDef: 'useBefore', header: "Valid Upto", cell: (element: any) => `${element.useBefore}`, width: 'maxWidth-11per' });
        // // this.extraColumns.push({ columnDef: 'mpFinalVolume', header: "Final Volume", cell: (element: any) => `${element.mpFinalVolume}`, width: 'maxWidth-11per' });
        // this.headersData.push({ columnDef: 'status', header: "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' });

    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.mobilePhase;


        var obj: searchBo = new searchBo();
        var key: string = SearchBoSessions['mobilePhaseBO_' + this._limstitle.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key))
            obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";
        // if (CommonMethods.hasValue(obj.productID))
        //     condition = condition + " AND ProductID = " + obj.productID;
        if (CommonMethods.hasValue(obj.stageID))
            condition = condition + " AND StageID = " + obj.productID;
        if (CommonMethods.hasValue(obj.statusID))
            condition = condition + " AND StatusID = " + obj.statusID;
        if (CommonMethods.hasValue(obj.purpose))
            condition = condition + " AND Purpose = " + obj.purpose;

        _modal.componentInstance.condition = condition;

    }

    onPageIndexClicked(evt) {
        this.currentSelectedIndex = evt;
        environment.pageIndex = evt;
        this.searchFilter('Search', 'P');
    }

    onActionClicked(evt) {
        if (evt.action == "VIE")
            this.router.navigateByUrl('/lims/mobilePhase/view?id=' + evt.val.encMobilePhaseID);
        else if (evt.action == 'DISC') {
            this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
                if (result) {
                    const model = this._matDailog.open(addCommentComponent, { width: "600px" })
                    model.disableClose = true;
                    model.afterClosed().subscribe(res => {
                        if (res.result) {
                            var obj: CommentsBO = new CommentsBO();
                            obj.purposeCode = 'MOBILE_PHASE';
                            obj.encEntityActID = evt.val.encMobilePhaseID;
                            obj.entityCode = EntityCodes.mobilePhase;
                            obj.comment = res.val;
                            this.mpService.manageDiscardCommnets(obj);
                        }
                    })
                }

            })
        }
    }

    menuEvt() {

        this.searchResult = [];
        if (CommonMethods.hasValue(this.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.advanceSearch });
        if (CommonMethods.hasValue(this.products.selectedId))
            this.searchResult.push({ code: "PROD_CODE", name: "Product Name / Material Name: " + this.products.selectedText });
        if (CommonMethods.hasValue(this.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.statusID)[0].status });
        if (CommonMethods.hasValue(this.purpose))
            this.searchResult.push({ code: 'INSR_TYPE', name: "Instrument Type: " + this.totalCatItemList.filter(x => x.catItemID == this.purpose)[0].catItem });
        if (CommonMethods.hasValue(this.preparationType))
            this.searchResult.push({ code: "PREP_TYPE", name: "Preparation Type: " + this.totalCatItemList.filter(x => x.catItemID == this.preparationType)[0].catItem });
        if (CommonMethods.hasValue(this.specTests.selectedId))
            this.searchResult.push({ code: "TEST", name: "Test/Parameter Name: " + this.specTests.selectedText });
        if (CommonMethods.hasValue(this.validityFrom))
            this.searchResult.push({ code: "VALID_FROM", name: "Validity From: " + dateParserFormatter.FormatDate(this.validityFrom, 'date') });
        if (CommonMethods.hasValue(this.validityTo))
            this.searchResult.push({ code: "VALID_TO", name: "Validity To: " + dateParserFormatter.FormatDate(this.validityTo, 'date') });
        if (CommonMethods.hasValue(this.specifications.selectedId))
            this.searchResult.push({ code: "SPECIFICATION", name: "Specification: " + this.specifications.selectedText });
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_FROM", name: "System Code From: " + this.systemCodeFrom.selectedText })
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.searchResult.push({ code: "SYSTEM_CODE_To", name: "System Code To: " + this.systemCodeTo.selectedText })
        if (CommonMethods.hasValue(this.inventoryData.selectedId))
            this.searchResult.push({ code: "BATCH_NUM", name: "Batch Number: " + this.inventoryData.selectedText })
        if (CommonMethods.hasValue(this.analyst.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated By: " + this.analyst.selectedText })
        if (CommonMethods.hasValue(this.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.initiatedOn, 'date') })
        if (CommonMethods.hasValue(this.systemCode.selectedId))
            this.searchResult.push({ code: "SYS_CODE", name: "System Code: " + this.systemCode.selectedText })
    }

    clearOption(code, index) {
        if (code == "ADV_SRCH")
            this.advanceSearch = null;
        else if (code == "STATUS")
            this.statusID = null;
        else if (code == "PROD_CODE")
            this.advanceSearch = null;
        else if (code == "INSR_TYPE")
            this.purpose = null;
        else if (code == "PREP_TYPE")
            this.preparationType = null;
        else if (code == "TEST")
            this.specTests.clear();
        else if (code == "VALID_FROM")
            this.validityFrom = null;
        else if (code == "VALID_TO")
            this.validityTo = null;
        else if (code == "SPECIFICATION")
            this.specifications.clear();
        else if (code == "SYSTEM_CODE_FROM")
            this.systemCodeFrom.clear();
        else if (code == "SYSTEM_CODE_To")
            this.systemCodeTo.clear();
        else if (code == "BATCH_NUM")
            this.inventoryData.clear();
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

    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 0)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else return null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}