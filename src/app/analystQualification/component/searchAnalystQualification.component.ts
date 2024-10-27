import { Component, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Router } from '@angular/router';
import { analystService } from '../service/analyst.service';
import { environment } from 'src/environments/environment';
import { searchAnalystBO } from '../model/analystModel';
import { CommonMethods, SearchBoSessions, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPPlaceholders, LKPTitles, LKPDisplayNames } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, EntityCodes, CapabilityActions, LimsRespMessages, SearchPageTooltip, GridActions, ActionMessages, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog } from '@angular/material';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { analystMessages } from '../messages/analystMessages';
import { CategoryItemList, GetCategoryBO } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'srch-analyst',
    templateUrl: '../html/searchAnalystQualification.html'
})

export class searchAnalystQualificationComponent {

    pageTitle: string = PageTitle.searchAnalyst;
    statusID: number;
    statusList: any = [];
    headersData: Array<any> = [];
    dataSource: any;
    actions: any = [];
    totalRecords: number;
    currentSelectedIndex: number = 0;
    analystInfo: LookupInfo;
    techniqueInfo: LookupInfo;
    refArNumberInfo: LookupInfo;
    refInwardNumberInfo: LookupInfo;
    intiatedUserInfo: LookupInfo;
    anaQualifInfo: LookupInfo;

    categoryID: number;
    searchBO: searchAnalystBO = new searchAnalystBO();
    srchTooltip: string = SearchPageTooltip.srchAnaQualification;
    formulaType: string;

    @ViewChild('analyst', { static: true }) analyst: LookupComponent;
    @ViewChild('technique', { static: true }) technique: LookupComponent;
    @ViewChild('refArNumber', { static: true }) refArNumber: LookupComponent;
    @ViewChild('materials', { static: true }) materials: LookupComponent;
    @ViewChild('testParameter', { static: true }) testParameter: LookupComponent;
    @ViewChild('refInwardNumber', { static: true }) refInwardNumber: LookupComponent;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    @ViewChild('anaQualif', { static: true }) anaQualif: LookupComponent;


    subscription: Subscription = new Subscription();
    analysisTypeList: any[];
    searchFil: any = [];
    matInfo: LookupInfo;
    testInfo: LookupInfo;
    dateFrom: any;
    dateTo: any;
    initiatedDate: any;
    removeActions: any = { headerName: "searchAnalyst", DIS_QUALIFY: true };
    totalCatItemList: CategoryItemList;
    hasExpCap: boolean = false;

    constructor(private router: Router, private _analystService: analystService, private _modal: MatDialog,
        private _alert: AlertService, private _limsContextService: LIMSContextServices,
        public _global: GlobalButtonIconsService, private _matDailog: MatDialog, private modalService: SearchFilterModalService
    ) { }

    ngAfterContentInit() {
        this.subscription = this._analystService.analystSubject.subscribe(resp => {
            if (resp.purpose == "searchQualififcationDetails") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'arrayDateTimeFormat', 'createdOn'));
                this.menuEvt();
                this.closeModal('anaQuali-srch');

            }
            else if (resp.purpose == "getAnalysisTypeByCategoryID") {
                this.analysisTypeList = resp.result;
                var index = this.analysisTypeList.findIndex(x => x.analysisType == "Water");
                if (index > -1)
                    this.analysisTypeList.splice(index, 1);
            }
            else if (resp.purpose == 'getStatuslist')
                this.statusList = resp.result;
            else if (resp.purpose == "manageAnalystDisqualify") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(analystMessages.disqualified);
                    this.searchFilter('Search', 'P');
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
        });

        this.prepareHeaders();

        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetSearchAnalystQualificationCategories();
        obj.type = 'MNG';
        this._analystService.getCatItemsByCatCodeList(obj);
        this._analystService.getStatuslist(EntityCodes.analystQualif);
        this._analystService.getAnalysisTypeByCategoryID();


        var matCondition: string = "(CAT_CODE IN ('RAW_MAT', 'PAK_MAT', 'INTER_MAT', 'FIN_MAT') OR (CAT_CODE = 'LAB_MAT' AND CAT_ITEM_CODE = 'VOLUMETRIC_SOL'))";

        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.getQCUsers, LKPDisplayNames.analystName, LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.techniqueInfo = CommonMethods.PrepareLookupInfo(LKPTitles.technique, LookupCodes.activeTechniques, LKPDisplayNames.techniqueName, LKPDisplayNames.techniqueCode, LookUpDisplayField.header, LKPPlaceholders.technique, "", '', '');
        this.refArNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refArNumber, LookupCodes.getARNumbers, LKPDisplayNames.arNumber, LKPDisplayNames.inwardNumber, LookUpDisplayField.header, LKPPlaceholders.refArNumber, '');
        this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.materialsSolu, LookupCodes.plantMaterials, LKPDisplayNames.materialSolu, LKPDisplayNames.MaterialSoluCode, LookUpDisplayField.code, LKPPlaceholders.matSolution, matCondition);
        var testCondition = "REQUEST_TYPE = 'AT'";
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getTests, LKPDisplayNames.testName, LKPDisplayNames.testID, LookUpDisplayField.header, LKPPlaceholders.testName, testCondition);
        //this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testParameter, LookupCodes.testName, LKPDisplayNames.testParName, LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.testParamName, "SpecTestID IS NOT NULL");
        this.refInwardNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.inwardNumbers, LookupCodes.getAQInwardNumbers, LKPDisplayNames.status, LKPDisplayNames.inwardNumber, LookUpDisplayField.code, LKPPlaceholders.inwardNumbers, '');
        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.employeeName, LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initUser,"StatusCode = 'ACT' AND PlantStatusCode = 'ACT'");
        this.anaQualifInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.searchAnalystQualification, LKPDisplayNames.analystName, LKPDisplayNames.requestCode, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode, "", '', 'LIMS');

        this.searchFilter("ALL", 'Y');
        // this.bindDrpDwns();

        var act: CapabilityActions = this._limsContextService.getSearchActinsByEntityCode(EntityCodes.analystQualif);
        this.actions = act.actionList;
        this.hasExpCap = act.exportCap;
    }

    bindDrpDwns() {
        this._analystService.getCategoryItemsByCatCode("QUAL_TYPE", 'SEARCH');
        this._analystService.getAnalysisTypeByCategoryID();

    }


    searchFilter(type: string, init: string = 'N') {
        var obj: searchAnalystBO = new searchAnalystBO();
        var key: string = SearchBoSessions['analystQualificationBO_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.statusID = obj.statusID;
            if (CommonMethods.hasValue(obj.analystID))
                this.analyst.setRow(obj.analystID, obj.analystName);
            if (CommonMethods.hasValue(obj.techniqueID))
                this.technique.setRow(obj.techniqueID, obj.techniqueName);
            if (CommonMethods.hasValue(obj.arNumberID))
                this.refArNumber.setRow(obj.arNumberID, obj.arNumberName);
            if (CommonMethods.hasValue(obj.matID))
                this.materials.setRow(obj.matID, obj.matName);
            if (CommonMethods.hasValue(obj.specTestID))
                this.testParameter.setRow(obj.specTestID, obj.specTestName);
            if (CommonMethods.hasValue(obj.initiatedID))
                this.intiatedUser.setRow(obj.initiatedID, obj.initiatedUser);
            if (CommonMethods.hasValue(obj.sioID))
                this.refInwardNumber.setRow(obj.sioID, obj.initiatedUser);
            if (CommonMethods.hasValue(obj.qualificationID))
                this.anaQualif.setRow(obj.qualificationID, obj.systemCode)

            this.searchBO.activityType = obj.activityType;
            this.searchBO.qualificationID = obj.qualificationID;
            this.searchBO.systemCode = obj.systemCode;
            this.searchBO.conclusionID = obj.conclusionID;
            this.searchBO.analysisType = obj.analysisType;
            this.searchBO.advanceSearch = obj.advanceSearch;
            this.dateFrom = dateParserFormatter.FormatDate(obj.dateFrom, 'default');
            this.dateTo = dateParserFormatter.FormatDate(obj.dateTo, 'default');
            this.initiatedDate = dateParserFormatter.FormatDate(obj.initiatedDate, 'default');
            this.searchBO.initiatedDate = obj.initiatedDate;
            this.searchBO.dateFrom = obj.dateFrom;
            this.searchBO.dateTo = obj.dateTo;
            this.formulaType = obj.formulaType;
            this.searchBO.inwardNumber = obj.inwardNumber;
            this.searchBO.initiatedUser = obj.initiatedUser;
            this.currentSelectedIndex = Number(obj.pageIndex);
        }
        else {

            if (!this.validateControls(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type == 'ALL' && init == 'N') {
                this.searchBO = new searchAnalystBO();

                if (CommonMethods.hasValue(this.analyst.selectedId))
                    this.analyst.clear();
                if (CommonMethods.hasValue(this.technique.selectedId))
                    this.technique.clear();
                if (CommonMethods.hasValue(this.refArNumber.selectedId))
                    this.refArNumber.clear();
                if (CommonMethods.hasValue(this.materials.selectedId))
                    this.materials.clear();
                if (CommonMethods.hasValue(this.testParameter.selectedId))
                    this.testParameter.clear();
                if (CommonMethods.hasValue(this.refInwardNumber.selectedId))
                    this.refInwardNumber.clear();
                if (CommonMethods.hasValue(this.intiatedUser.selectedId))
                    this.intiatedUser.clear();
                if (CommonMethods.hasValue(this.anaQualif.selectedId))
                    this.anaQualif.clear();

                this.statusID = 0;

                this.formulaType = this.dateFrom = this.dateTo = this.initiatedDate = null;

                this.searchFil = [];

            }
            else {

                obj.statusID = this.statusID;
                obj.analystID = this.analyst.selectedId;
                obj.pageIndex = this.currentSelectedIndex;
                obj.pageSize = environment.recordsPerPage;
                obj.techniqueID = this.technique.selectedId;
                obj.analystName = this.analyst.selectedText;
                obj.techniqueName = this.technique.selectedText;
                obj.formulaType = this.formulaType;
                obj.conclusionID = this.searchBO.conclusionID

                obj.arNumberID = this.refArNumber.selectedId;
                obj.arNumberName = this.refArNumber.selectedText;
                obj.matID = this.materials.selectedId;
                obj.matName = this.materials.selectedText;
                obj.specTestID = this.testParameter.selectedId;
                obj.specTestName = this.testParameter.selectedText;
                obj.analysisType = this.searchBO.analysisType;
                obj.activityType = this.searchBO.activityType;
                obj.advanceSearch = this.searchBO.advanceSearch;
                obj.initiatedID = this.intiatedUser.selectedId;
                obj.initiatedUser = this.searchBO.initiatedUser = this.intiatedUser.selectedText;
                obj.sioID = this.refInwardNumber.selectedId;
                obj.inwardNumber = this.searchBO.inwardNumber = this.refInwardNumber.selectedText;
                obj.qualificationID = this.anaQualif.selectedId;
                obj.systemCode = this.anaQualif.selectedText;
                obj.dateFrom = this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');
                obj.dateTo = this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');
                obj.initiatedDate = this.searchBO.initiatedDate = dateParserFormatter.FormatDate(this.initiatedDate, 'date');
                this.searchBO = obj;

            }
            SearchBoSessions.setSearchAuditBO(key, obj);
        }
        this._analystService.searchQualififcationDetails(obj);


    }

    validateControls(type: string) {

        var isVal: boolean = true;
        if (type != 'ALL' && !CommonMethods.hasValue(this.searchBO.advanceSearch) && !CommonMethods.hasValue(this.formulaType) &&
            !CommonMethods.hasValue(this.statusID) && !CommonMethods.hasValue(this.dateFrom)
            && !CommonMethods.hasValue(this.dateTo) && !CommonMethods.hasValue(this.analyst.selectedId)
            && !CommonMethods.hasValue(this.testParameter.selectedId) && !CommonMethods.hasValue(this.technique.selectedId)
            && !CommonMethods.hasValue(this.refArNumber.selectedId) && !CommonMethods.hasValue(this.materials.selectedId)
            && !CommonMethods.hasValue(this.searchBO.analysisType) && !CommonMethods.hasValue(this.searchBO.activityType)
            && !CommonMethods.hasValue(this.searchBO.conclusionID) && !CommonMethods.hasValue(this.intiatedUser.selectedId)
            && !CommonMethods.hasValue(this.refInwardNumber.selectedId) && !CommonMethods.hasValue(this.initiatedDate)
            && !CommonMethods.hasValue(this.anaQualif.selectedId))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }


    prepareHeaders() {
        this.headersData = [];
        // this.headersData.push({ columnDef: "requestCode", header: "Reference Code", cell: (element: any) => `${element.requestCode}` });
        // this.headersData.push({ columnDef: "qualificationType", header: "Activity Type", cell: (element: any) => `${element.qualificationType}` });
        this.headersData.push({ columnDef: "analystName", header: "Analyst Name", cell: (element: any) => `${element.analystName}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "materialName", header: "Material / Product Name / Solution Name", cell: (element: any) => `${element.materialName}`, width: "maxWidth-25per" });
        this.headersData.push({ columnDef: "technique", header: "Technique", cell: (element: any) => `${element.technique}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "conclusion", header: "Conclusion", cell: (element: any) => `${element.conclusion}`, width: "maxWidth-15per" });

        // this.headersData.push({ columnDef: "arNumber", header: "AR Number", cell: (element: any) => `${element.arNumber}` });
        this.headersData.push({ columnDef: "createdOn", header: "Created On", cell: (element: any) => `${element.createdOn}`, width: "maxWidth-12per" });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-12per" });
    }


    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.analystQualif;

        var obj: searchAnalystBO = new searchAnalystBO();
        var key: string = SearchBoSessions['analystQualificationBO_' + this._limsContextService.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key))
            obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(obj.techniqueID))
            condition = condition + " AND TechniqueID = " + obj.techniqueID;
        if (CommonMethods.hasValue(obj.analystID))
            condition = condition + " AND AnalystID = " + obj.analystID;
        if (CommonMethods.hasValue(obj.arNumberID))
            condition = condition + " AND ArID = " + obj.arNumberID;
        if (CommonMethods.hasValue(obj.matID))
            condition = condition + " AND MatID = " + obj.matID;
        // if (CommonMethods.hasValue(obj.specTestID))
        //     condition = condition + " AND spectTestID = " + obj.specTestID;
        if (CommonMethods.hasValue(obj.activityType))
            condition = condition + " AND ActivityID = " + obj.activityType;
        if (CommonMethods.hasValue(obj.analysisType))
            condition = condition + " AND AnalysisTypeID = " + obj.analysisType;
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.dateTo.setDate(this.dateTo.getDate() + 1), 'date') + "'";
        if (CommonMethods.hasValue(obj.statusID))
            condition = condition + " AND StatusID = " + obj.statusID;
        if (CommonMethods.hasValue(obj.advanceSearch))
            condition = condition + " AND ( Technique LIKE '%' " + obj.advanceSearch + " '%' OR AnalystName LIKE '%' " + obj.advanceSearch + " '%' OR MaterialName LIKE '%' " + obj.advanceSearch + " '%' OR AnalysisType LIKE '%' " + obj.advanceSearch + "'%' )"

        _modal.componentInstance.condition = condition;

    }


    onActionClicked(evt) {
        if (evt.action == 'VIE')
            this.router.navigateByUrl("/lims/analystQualify/view?id=" + evt.val.encQualificationID);
        else if (evt.action == "DIS_QUALIFY") {
            const modal = this._matDailog.open(addCommentComponent, { width: '800px' });
            modal.disableClose = true;
            modal.componentInstance.commnetMinLength = 20;
            modal.afterClosed().subscribe(resp => {
                if (resp.result) {
                    var obj = { encQualificationID: evt.val.encQualificationID, comments: resp.val };
                    this._analystService.manageAnalystDisqualify(obj);
                }
            })
        }
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.searchFilter('Search', 'P');
    }


    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.technique.selectedId))
            this.searchFil.push({ code: "PRO_CODE", name: "Technique: " + this.technique.selectedText });
        if (CommonMethods.hasValue(this.analyst.selectedId))
            this.searchFil.push({ code: "BAT_NUM", name: "Analyst: " + this.analyst.selectedText });
        if (CommonMethods.hasValue(this.refArNumber.selectedId))
            this.searchFil.push({ code: "AR_NUM", name: "AR Number: " + this.refArNumber.selectedText });
        if (CommonMethods.hasValue(this.materials.selectedId))
            this.searchFil.push({ code: "MATERIAL", name: "Materials: " + this.materials.selectedText });
        if (CommonMethods.hasValue(this.testParameter.selectedId))
            this.searchFil.push({ code: "TYPE", name: "Test/Parameter: " + this.testParameter.selectedText });
        if (CommonMethods.hasValue(this.searchBO.analysisType))
            this.searchFil.push({ code: 'ANA_TYPE', name: "Analysis Type: " + this.analysisTypeList.filter(x => x.analysisTypeID == this.searchBO.analysisType)[0].analysisType });
        if (CommonMethods.hasValue(this.searchBO.activityType))
            this.searchFil.push({ code: 'ACT_TYPE', name: "Activity Type: " + this.totalCatItemList.filter(x => x.catItemID == this.searchBO.activityType)[0].catItem });
        if (CommonMethods.hasValue(this.formulaType))
            this.searchFil.push({ code: 'FORMULA', name: "Fomula Type: " + this.formulaType });
        if (CommonMethods.hasValue(this.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.dateTo, 'date') });
        if (CommonMethods.hasValue(this.searchBO.conclusionID))
            this.searchFil.push({ code: "CONCLUSION", name: "Conclusion: " + this.totalCatItemList.filter(x => x.catItemID == this.searchBO.conclusionID)[0].catItem });
        if (CommonMethods.hasValue(this.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.statusID);
            this.searchFil.push({ code: 'STATUS', name: "Status: " + obj[0].status });
        }
        if (CommonMethods.hasValue(this.searchBO.initiatedDate))
            this.searchFil.push({ code: "INIT_DATE", name: "Initiated Date: " + this.searchBO.initiatedDate });
        if (CommonMethods.hasValue(this.searchBO.initiatedUser))
            this.searchFil.push({ code: "INIT_USER", name: "Initiated By: " + this.searchBO.initiatedUser });
        if (CommonMethods.hasValue(this.searchBO.inwardNumber))
            this.searchFil.push({ code: "INWARD_NO", name: "Inward Number: " + this.searchBO.inwardNumber });
        if (CommonMethods.hasValue(this.searchBO.qualificationID))
            this.searchFil.push({ code: "SYS_CODE", name: "System Code: " + this.searchBO.systemCode });
    }

    clearOption(code, index) {
        if (code == "PRO_CODE")
            this.technique.clear();
        else if (code == "BAT_NUM")
            this.analyst.clear();
        else if (code == "AR_NUM")
            this.refArNumber.clear();
        else if (code == "MATERIAL")
            this.materials.clear();
        else if (code == "TYPE")
            this.testParameter.clear();
        else if (code == "ANA_TYPE")
            this.searchBO.analysisType = null;
        else if (code == "ACT_TYPE")
            this.searchBO.activityType = null;
        else if (code == "DATE_FROM")
            this.dateFrom = null;
        else if (code == "DATE_TO")
            this.dateTo = null;
        else if (code == "STATUS")
            this.statusID = null;
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        else if (code == "FORMULA")
            this.searchBO.formulaType = null;
        else if (code == "CONCLUSION")
            this.searchBO.conclusionID = null;
        else if (code == 'INIT_DATE')
            this.initiatedDate = this.searchBO.initiatedDate = null;
        else if (code == "INIT_USER")
            this.intiatedUser.clear();
        else if (code == "INWARD_NO")
            this.refInwardNumber.clear();
        else if (code == "SYS_CODE")
            this.anaQualif.clear();
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

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 0)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else return null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}