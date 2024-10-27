import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpecValidationsService } from '../service/specValidations.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SearchSpecValidations } from '../model/specValidations';
import { CommonMethods, SearchBoSessions, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { Router } from '@angular/router';
import { CapabilityActions, EntityCodes, LookupCodes, LimsRespMessages, SearchPageTooltip, GridActions } from 'src/app/common/services/utilities/constants';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { environment } from 'src/environments/environment';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';

@Component({
    selector: 'srch-spec-valid',
    templateUrl: '../html/searchSpecValidations.html'
})


export class SearchSpecValidationsCompnent {
    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.searchSpecValidation;
    mode: number;
    statusID: number;
    statusList: any = [];
    headersData: Array<any> = [];
    dataSource: any;
    actions: any = [];
    totalRecords: number;
    currentSelectedIndex: number = 0;
    modetype: any;
    entityCode: string
    isManageGrpTech: boolean = false;
    isManageAssignSTP: boolean = false;
    searchFil: any = [];

    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    testInfo: LookupInfo;
    @ViewChild('specTests', { static: true }) specTests: LookupComponent;
    templateInfo: LookupInfo;
    @ViewChild('tempalte', { static: true }) tempalte: LookupComponent;
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    condition: string;
    testCondition: string;
    searchBO: SearchSpecValidations = new SearchSpecValidations();
    dateFrom: any;
    dateTo: any;
    srchTooltip: string = SearchPageTooltip.srchSpecValidation;
    typeList: any
    typeID: number;
    initiatedOn: Date;
    getDateForIni: Date = new Date();
    hasExpCap: boolean = false;
    constructor(private _specService: SpecValidationsService, private _alert: AlertService, private _matDailog: MatDialog, private modalService: SearchFilterModalService,
        public _global: GlobalButtonIconsService, private _limsContextService: LIMSContextServices, private router: Router) {
        if (sessionStorage.getItem("entitytype") == 'QCCALIB') {
            this.entityCode = EntityCodes.calibrationValidation;
            this.pageTitle = PageTitle.searchCalibValidation;
            this, this.srchTooltip = SearchPageTooltip.srchCalibValidation;
        }
        else this.entityCode = EntityCodes.specValidation;
    }

    ngAfterContentInit() {
        this.subscription = this._specService.specValidSubject.subscribe(resp => {
            if (resp.purpose == "searchResultSpecValidations") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList,
                    "arrayDateTimeFormat", "createdOn"));
                this.menuEvt();
                this.closeModal('specVali-srch');
            }
            else if (resp.purpose == "ANALYSIS_MODES")
                this.modetype = resp.result;
            else if (resp.purpose == 'getStatuslist')
                this.statusList = resp.result;
            else if (resp.purpose == "getParamMasterData")
                this.typeList = resp.result;

        });
        this.prepareHeaders();
        this.PrprLkp();
        this._specService.getStatuslist(this.entityCode);
        this._specService.getCatItemsByCatCode("ANALYSIS_MODES");
        this._specService.getParamMasterData({ paramField: 'TYPE', paramFType: 'SPEC' })
        this.searchFilter("ALL", 'Y');
        var act: CapabilityActions = this._limsContextService.getSearchActinsByEntityCode(this.entityCode);
        this.actions = act.actionList;
        this.hasExpCap = act.exportCap;
        if (CommonMethods.hasValue(this.actions) && this.actions.filter(x => x == 'MANAGE_GP_TECH').length > 0 && this.entityCode == EntityCodes.specValidation) {
            this.isManageGrpTech = true;
            this.actions.splice(this.actions.findIndex(x => x == 'MANAGE_GP_TECH'), 1);
        }
        if (CommonMethods.hasValue(this.actions) && this.actions.filter(x => x == 'ASSIGN_STP').length > 0) {
            this.isManageAssignSTP = true;
            this.actions.splice(this.actions.findIndex(x => x == 'ASSIGN_STP'), 1);
        }
        if (CommonMethods.hasValue(this.actions) && this.actions.filter(x => x == 'ARDS_REVIEW').length > 0)
            this.actions.splice(this.actions.findIndex(x => x == 'ARDS_REVIEW'), 1);
        if (this.entityCode == EntityCodes.specValidation)
            this.actions.push(GridActions.ViewSpec);
        else
            this.actions.push(GridActions.ViewCalib);
    }

    PrprLkp() {
        if (this.entityCode == EntityCodes.specValidation) {
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecificationSearch, LKPDisplayNames.specification, LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, '');
            this.condition = "STP_TYPE = 'A' AND STATUS_CODE IN ('ACT', 'INACT', 'OBSE')";
        }
        else {
            this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameterSetNumber, LookupCodes.getCalibrationParameters, LKPDisplayNames.calibInTitle, LKPDisplayNames.calibCode, LookUpDisplayField.code, LKPPlaceholders.parameterSetNumber, '');
            this.condition = "STP_TYPE = 'C' AND STATUS_CODE IN ('ACT', 'INACT', 'OBSE')";
            this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers,
                LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header,
                LKPPlaceholders.initUser, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        }
        this.templateInfo = CommonMethods.PrepareLookupInfo(LKPTitles.stdProcedure, LookupCodes.standardTestProc, LKPDisplayNames.stpTitle, LKPDisplayNames.templateNo, LookUpDisplayField.code, LKPPlaceholders.stpNumber, this.condition);

        this.testLkp();
    }
    searchFilter(type: string, init: string = 'N') {
        var obj: SearchSpecValidations = new SearchSpecValidations();
        var key: string = SearchBoSessions['specValidations_' + this._limsContextService.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.mode = obj.mode;
            this.statusID = obj.statusID
            if (CommonMethods.hasValue(obj.specID))
                this.specifications.setRow(obj.specID, obj.specName);
            if (CommonMethods.hasValue(obj.templateID))
                this.tempalte.setRow(obj.templateID, obj.temlateName);
            if (CommonMethods.hasValue(obj.testID))
                this.specTests.setRow(obj.testID, obj.specTypeName);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.intiatedUser.setRow(obj.initiatedBy, obj.initiatedByName);
            this.dateFrom = dateParserFormatter.FormatDate(obj.dateFrom, 'default');
            this.dateTo = dateParserFormatter.FormatDate(obj.dateTo, 'default');
            this.initiatedOn = dateParserFormatter.FormatDate(obj.initiatedOn, "default")
            this.typeID = obj.specTypeID;
            this.searchBO.dateFrom = obj.dateFrom;
            this.searchBO.dateTo = obj.dateTo;
            this.searchBO.advanceSearch = obj.advanceSearch;

        }
        else {

            if (!this.validateControls(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type == 'ALL' && init == 'N') {
                this.searchBO = new SearchSpecValidations();

                if (CommonMethods.hasValue(this.specifications.selectedId))
                    this.specifications.clear();
                if (CommonMethods.hasValue(this.specTests.selectedId))
                    this.specTests.clear();
                if (CommonMethods.hasValue(this.tempalte.selectedId))
                    this.tempalte.clear();
                if (CommonMethods.hasValue(this.intiatedUser.selectedId))
                    this.intiatedUser.clear();

                this.typeID = this.statusID = 0;
                this.mode = 0;

                this.dateFrom = this.dateTo = this.initiatedOn = null;

                this.searchFil = [];

            }
            else {
                obj.statusID = this.statusID;
                obj.mode = this.mode;
                obj.specID = this.specifications.selectedId;
                obj.specName = this.specifications.selectedText;

                obj.testID = this.specTests.selectedId;
                obj.specTypeName = this.specTests.selectedText;

                obj.templateID = this.tempalte.selectedId;
                obj.temlateName = this.tempalte.selectedText;

                obj.dateFrom = this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');
                obj.dateTo = this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');
                obj.initiatedOn = this.searchBO.initiatedOn = dateParserFormatter.FormatDate(this.initiatedOn, "date");
                obj.advanceSearch = this.searchBO.advanceSearch;
                obj.specTypeID = this.typeID;
                obj.initiatedBy = this.intiatedUser.selectedId;
                obj.initiatedByName = this.intiatedUser.selectedText;


                obj.pageIndex = this.currentSelectedIndex;
                obj.pageSize = environment.recordsPerPage;
            }
            SearchBoSessions.setSearchAuditBO(key, obj);

            if (init != 'P') {
                this.currentSelectedIndex = this.searchBO.pageIndex = 0;
                environment.pageIndex = '0';
            }
        }
        obj.entityCode = this.entityCode;
        this._specService.searchResultSpecValidations(obj);

    }

    validateControls(type: string) {

        var isVal: boolean = true;
        if (type != 'ALL' && !CommonMethods.hasValue(this.searchBO.advanceSearch) && !CommonMethods.hasValue(this.statusID)
            && !CommonMethods.hasValue(this.dateFrom) && !CommonMethods.hasValue(this.dateTo)
            && !CommonMethods.hasValue(this.specTests.selectedId) && !CommonMethods.hasValue(this.specifications.selectedId)
            && !CommonMethods.hasValue(this.tempalte.selectedId) && !CommonMethods.hasValue(this.mode)
            && !CommonMethods.hasValue(this.typeID) && !CommonMethods.hasValue(this.initiatedOn)
            && !CommonMethods.hasValue(this.intiatedUser.selectedId))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }

    prepareHeaders() {
        this.headersData = [];
        if (this.entityCode == EntityCodes.specValidation) {
            this.headersData.push({ columnDef: "specificationNumber", header: "Specification Number", cell: (element: any) => `${element.specificationNumber}` });
            this.headersData.push({ columnDef: "specType", header: "Specification Type", cell: (element: any) => `${element.specType}` });
        }
        else
            this.headersData.push({ columnDef: "specificationNumber", header: "Parameter Set Number", cell: (element: any) => `${element.specificationNumber}` });
        this.headersData.push({ columnDef: "stpNumber", header: "STP Number", cell: (element: any) => `${element.stpNumber}` });
        if (this.entityCode == EntityCodes.specValidation)
            this.headersData.push({ columnDef: "testTitle", header: "Test Name", cell: (element: any) => `${element.testTitle}` });
        else
            this.headersData.push({ columnDef: "testTitle", header: "Parameter Name", cell: (element: any) => `${element.testTitle}` });
        this.headersData.push({ columnDef: "userName", header: "Initiated By", cell: (element: any) => `${element.userName}` });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}` });
        this.headersData.push({ columnDef: "mode", header: "Qualification Mode", cell: (element: any) => `${element.mode}` });
    }

    testLkp() {
        if (this.entityCode == EntityCodes.calibrationValidation) {
            this.testCondition = "REQUEST_TYPE = 'CP'";
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getTests, LKPDisplayNames.test, LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.test, this.testCondition);
        }
        else {
            this.testCondition = "REQUEST_TYPE = 'AT'";
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getTests, LKPDisplayNames.testName, LKPDisplayNames.testID, LookUpDisplayField.header, LKPPlaceholders.testName, this.testCondition);
        }
    }


    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = this.entityCode;
        var obj: SearchSpecValidations = new SearchSpecValidations();
        var key: string = SearchBoSessions['specValidations_' + this._limsContextService.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key))
            obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";

        if (this.entityCode == EntityCodes.specValidation) {
            if (CommonMethods.hasValue(obj.mode))
                condition = condition + " AND ModeID = " + obj.mode;
            if (CommonMethods.hasValue(obj.specID))
                condition = condition + "AND SpecID = " + obj.specID;
            if (CommonMethods.hasValue(obj.testID))
                condition = condition + "AND TestID = " + obj.testID;
            if (CommonMethods.hasValue(obj.templateID))
                condition = condition + "AND TemplateID = " + obj.templateID;
            if (CommonMethods.hasValue(this.searchBO.dateFrom))
                condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.dateFrom, 'date') + "'";
            if (CommonMethods.hasValue(this.searchBO.dateTo))
                condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.dateTo.setDate(this.dateTo.getDate() + 1), 'date') + "'";
            if (CommonMethods.hasValue(obj.statusID))
                condition = condition + ' AND StatusID = ' + obj.statusID;
            if (CommonMethods.hasValue(obj.specTypeID))
                condition = condition + ' AND SpecTypeID = ' + obj.specTypeID;
            if (CommonMethods.hasValue(obj.advanceSearch))
                condition = condition + " AND ( SpecNumber LIKE '%" + obj.advanceSearch + "%' OR SpecType LIKE '%" + obj.advanceSearch + "%' OR StpNumber LIKE '%" + obj.advanceSearch + "%' OR TestTitle LIKE '%" + obj.advanceSearch + "%' )"

            _modal.componentInstance.condition = condition;
        }
        else {
            if (CommonMethods.hasValue(obj.mode))
                condition = condition + " AND ModeID = " + obj.mode;
            if (CommonMethods.hasValue(obj.specID))
                condition = condition + "AND CalibParamID = " + obj.specID;
            if (CommonMethods.hasValue(obj.testID))
                condition = condition + "AND TestID = " + obj.testID;
            if (CommonMethods.hasValue(obj.templateID))
                condition = condition + "AND TemplateID = " + obj.templateID;
            if (CommonMethods.hasValue(this.searchBO.dateFrom))
                condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.dateFrom, 'date') + "'";
            if (CommonMethods.hasValue(this.searchBO.dateTo))
                condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.dateTo.setDate(this.dateTo.getDate() + 1), 'date') + "'";
            if (CommonMethods.hasValue(obj.statusID))
                condition = condition + ' AND StatusID = ' + obj.statusID;
            if (CommonMethods.hasValue(obj.advanceSearch))
                condition = condition + " AND ( InstTypes LIKE '%" + obj.advanceSearch + "%' OR Calibration LIKE '%" + obj.advanceSearch + "%' OR StpNumber LIKE '%" + obj.advanceSearch + "%' OR TestTitle LIKE '%" + obj.advanceSearch + "%' )"

            _modal.componentInstance.condition = condition;

        }

    }


    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.specifications.selectedId) && this.entityCode == EntityCodes.specValidation)
            this.searchFil.push({ code: "SPECIF", name: "Specification Number: " + this.specifications.selectedText });
        if (CommonMethods.hasValue(this.specifications.selectedId) && this.entityCode == EntityCodes.calibrationValidation)
            this.searchFil.push({ code: "SPECIF", name: "Parameter Set Number: " + this.specifications.selectedText });
        if (CommonMethods.hasValue(this.tempalte.selectedId))
            this.searchFil.push({ code: "STP_NUM", name: "STP Number: " + this.tempalte.selectedText });
        if (CommonMethods.hasValue(this.specTests.selectedId) && this.entityCode == EntityCodes.specValidation)
            this.searchFil.push({ code: "Test_Name", name: "Test Name: " + this.specTests.selectedText });
        if (CommonMethods.hasValue(this.specTests.selectedId) && this.entityCode == EntityCodes.calibrationValidation)
            this.searchFil.push({ code: "Test_Name", name: "Parameter Name: " + this.specTests.selectedText });
        if (CommonMethods.hasValue(this.mode))
            this.searchFil.push({ code: 'MODE', name: "Qualification Mode: " + this.modetype.filter(x => x.catItemID == this.mode)[0].catItem });
        if (CommonMethods.hasValue(this.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.dateTo, 'date') });
        if (CommonMethods.hasValue(this.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.statusID);
            this.searchFil.push({ code: 'STATUS', name: "Status: " + obj[0].status });
        }
        if (CommonMethods.hasValue(this.typeID)) {
            this.searchFil.push({ code: 'TYPE', name: "Specification Type: " + this.typeList.filter(x => x.paramKey == this.typeID)[0].paramValue });
        }
        if (CommonMethods.hasValue(this.initiatedOn))
            this.searchFil.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchFil.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
    }

    clearOption(code, index) {
        if (code == "SPECIF")
            this.specifications.clear();
        else if (code == "STP_NUM")
            this.tempalte.clear();
        else if (code == "Test_Name")
            this.specTests.clear();
        else if (code == "MODE")
            this.mode = null;
        else if (code == "DATE_FROM")
            this.dateFrom = null;
        else if (code == "DATE_TO")
            this.dateTo = null;
        else if (code == "STATUS")
            this.statusID = null;
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        else if (code == "TYPE")
            this.typeID = null;
        else if (code == "INITIATED_ON")
            this.initiatedOn = null;
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();
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


    onActionClicked(evt) {
        if (evt.action == 'VIE') {
            localStorage.setItem('SPEC_VALID_PAGE', 'VIEW')
            this.router.navigateByUrl("/lims/specValid/manage?id=" + evt.val.encSpecValidationID);
        }
        else if (evt.action == 'VIEW_SPEC' || evt.action == 'VIEW_CALIB') {
            const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
            modal.componentInstance.pageTitle = this.entityCode == EntityCodes.specValidation ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
            modal.componentInstance.encSpecID = this.entityCode == EntityCodes.specValidation ? evt.val.entActID : 0;
            modal.componentInstance.entityCode = this.entityCode;
            modal.componentInstance.encCalibID = this.entityCode != EntityCodes.specValidation ? evt.val.entActID : 0;
            modal.componentInstance.isShow = true;
        }

    }

    manageGroupTest() {
        this.router.navigateByUrl("/lims/specValid/manageGroupTest");
    }

    manageSnstp() {
        this.router.navigateByUrl("/lims/specValid/assignSTP")
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.searchFilter('Search', 'P');
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}