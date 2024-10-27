import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { CapabilityActions, EntityCodes, LookupCodes, LimsRespMessages, SearchPageTooltip } from 'src/app/common/services/utilities/constants';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { Router } from '@angular/router';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { SearchSamplePlanBO } from '../model/samplePlanModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { environment } from 'src/environments/environment';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { MatDialog } from '@angular/material';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';
import { searchAnalystBO } from 'src/app/analystQualification/model/analystModel';
import { TestOccupancyDetailsComponent } from './testOccupancy.component';

@Component({
    selector: 'srch-sample-plan',
    templateUrl: '../html/searchSamplePlan.html'
})

export class SearchSamplePlanComponent {

    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.searchSamplePlan;
    actions: Array<string> = [];
    //samplePlanInfo: LookupInfo;
    statusList: any;
    searchBO: SearchSamplePlanBO = new SearchSamplePlanBO();
    headersData: any;
    dataSource: any;
    totalRecords: number;
    currentSelectedIndex: number = 0;
    dateFrom: any;
    dateTo: any;
    analystInfo: LookupInfo;
    matInfo: LookupInfo;
    testInfo: LookupInfo;
    @ViewChild('testParameter', { static: true }) testParameter: LookupComponent;
    @ViewChild('analyst', { static: true }) analyst: LookupComponent;
    @ViewChild('materials', { static: true }) materials: LookupComponent;
    //@ViewChild('samplePlan', { static: true }) samplePlan: LookupComponent;
    @ViewChild('requestCodeFrom', { static: true }) requestCodeFrom: LookupComponent;
    @ViewChild('requestCodeTo', { static: true }) requestCodeTo: LookupComponent;
    @ViewChild('planCreatedBy', { static: true }) planCreatedBy: LookupComponent;
    planCreatedByInfo: LookupInfo;
    @ViewChild('sampleNum', { static: true }) sampleNum: LookupComponent;
    sampleNumberInfo: LookupInfo;

    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    specificationsInfo: LookupInfo;
    @ViewChild('arNum', { static: true }) arNum: LookupComponent;
    arNumberInfo: LookupInfo;
    requestCodeFromInfo: LookupInfo;
    requestCodeToInfo: LookupInfo;
    requestCodeFromCondition: string;
    requestCodeToCondition: string;
    searchFil: any = [];
    srchTooltip: string = SearchPageTooltip.srchSamPlan;
    planCreatedUserID: any = 0;
    planCreatedOn: Date;
    getDateForIni: Date = new Date();
    shiftList : any;
    hasExpCap: boolean = false;

    constructor(private _spService: SamplePlanService, private _limstitle: LIMSContextServices, private _matDailog: MatDialog, private _router: Router,
        private _alert: AlertService, public _global: GlobalButtonIconsService, private modalService: SearchFilterModalService) { }

    ngAfterContentInit() {
        this.subscription = this._spService.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == 'WORK_SHIFTS')
                this.shiftList = resp.result;
            else if (resp.purpose == "searchSamplePlan") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'arrayDateTimeFormat', 'planCreatedOn'));
                this.menuEvt();
                this.closeModal('samPlan-srch');
            }
        });

        this._spService.getCategoryItemsByCatCode('WORK_SHIFTS')
        this._spService.getStatuslist(EntityCodes.samplePlan);
        this.prepareHeaders();
        this.searchFilter('ALL', 'Y');
        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.samplePlan);
        this.actions = capActions.actionList;
        this.hasExpCap = capActions.exportCap;
        var matCondition: string = "(CAT_CODE IN ('RAW_MAT', 'PAK_MAT', 'INTER_MAT', 'FIN_MAT', 'WATER_MAT', 'IMPSTD_MAT', 'COPROD_MAT', 'MTHLQR_MAT', 'BYPROD_MAT') OR (CAT_CODE = 'LAB_MAT' AND CAT_ITEM_CODE = 'VOLUMETRIC_SOL'))"
        //this.samplePlanInfo = CommonMethods.PrepareLookupInfo(LKPTitles.samplePlan, LookupCodes.getSamplePlan, LKPDisplayNames.Status, LKPDisplayNames.samplePlanCode, LookUpDisplayField.code, LKPPlaceholders.samplePlan);
        this.arNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getARNumbers, LKPDisplayNames.arNumber, LKPDisplayNames.smapleInward, LookUpDisplayField.header, LKPPlaceholders.refArNumber, '', '', 'LIMS');
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification, LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, '');
        this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Materials, LookupCodes.plantMaterials, LKPDisplayNames.material, LKPDisplayNames.MaterialCode, LookUpDisplayField.header, LKPPlaceholders.promaterial, matCondition);
        var testCondition = "REQUEST_TYPE IN ('AT', 'CP')";
        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testParameter, LookupCodes.getTests, LKPDisplayNames.testOrParameterName, LKPDisplayNames.testOrParameterName, LookUpDisplayField.header, LKPPlaceholders.testParamName, testCondition);
        //this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testParameter, LookupCodes.testName, LKPDisplayNames.testParName, LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.testParamName, "SpecTestID IS NOT NULL");
        this.analystInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.getQCUsers, LKPDisplayNames.analystName, LKPDisplayNames.analystCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
        this.planCreatedByInfo = CommonMethods.PrepareLookupInfo(LKPTitles.planCreated, LookupCodes.getQCUsers, LKPDisplayNames.planCreatedBy, LKPDisplayNames.planCreatedID, LookUpDisplayField.header, LKPPlaceholders.planCreatedBy, "", '', 'LIMS');
        this.sampleNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sampleNumber, LookupCodes.getSampleNumbers, LKPDisplayNames.Material, LKPDisplayNames.sampleNumber, LookUpDisplayField.code, LKPPlaceholders.SampleNumber, "STATUS_CODE IN ('ACT', 'INACT')", '', 'LIMS');

        this.systemCodeFromLkp();
        this.systemCodeToLkp();
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.requestCodeTo.selectedId))
            this.requestCodeFromCondition = "PlanID < '" + this.requestCodeTo.selectedId + "'";
        else this.requestCodeFromCondition = "";

        this.requestCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.requCodeFrom, LookupCodes.getSamplePlan, LKPDisplayNames.Status, LKPDisplayNames.reqCodeFromDate, LookUpDisplayField.code, LKPPlaceholders.reqCodeFrom, this.requestCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.requestCodeFrom.selectedId))
            this.requestCodeToCondition = "PlanID > '" + this.requestCodeFrom.selectedId + "'"
        else
            this.requestCodeToCondition = "";

        this.requestCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.reqCodeTo, LookupCodes.getSamplePlan, LKPDisplayNames.Status, LKPDisplayNames.reqCodeToDate, LookUpDisplayField.code, LKPPlaceholders.reqCodeTo, this.requestCodeToCondition);
    }

    selectPlanCreatedLkp(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
            this.planCreatedUserID = evt.val.extColName;
    }

    searchFilter(type: string, init: string = "N") {

        var srchObj: SearchSamplePlanBO = new SearchSamplePlanBO();
        var key: string = SearchBoSessions['samplePlan_' + this._limstitle.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            srchObj = SearchBoSessions.getSearchAuditBO(key);


            this.searchBO.matID = srchObj.matID;
            this.searchBO.matName = srchObj.matName;
            if (CommonMethods.hasValue(srchObj.matID))
                this.materials.setRow(srchObj.matID, srchObj.matName);

            this.searchBO.planCreatedUserRoleID = srchObj.planCreatedUserRoleID;
            this.searchBO.planCreatedUserRoleName = srchObj.planCreatedUserRoleName;
            if (CommonMethods.hasValue(srchObj.planCreatedUserRoleID))
                this.planCreatedBy.setRow(srchObj.planCreatedUserRoleID, srchObj.planCreatedUserRoleName);

            this.searchBO.statusID = srchObj.statusID;

            this.searchBO.samplePlanID = srchObj.samplePlanID;
            this.searchBO.samplePlanName = srchObj.samplePlanName;
            // if (CommonMethods.hasValue(srchObj.samplePlanID))
            //     this.samplePlan.setRow(srchObj.samplePlanName, srchObj.samplePlanName);

            this.searchBO.samplePlanIDFrom = srchObj.samplePlanID;
            this.searchBO.samplePlanNameFrom = srchObj.samplePlanName;
            if (CommonMethods.hasValue(srchObj.samplePlanIDFrom))
                this.requestCodeFrom.setRow(srchObj.samplePlanIDFrom, srchObj.samplePlanNameFrom);

            this.searchBO.samplePlanIDTo = srchObj.samplePlanIDTo;
            this.searchBO.samplePlanNameTo = srchObj.samplePlanNameTo;
            if (CommonMethods.hasValue(srchObj.samplePlanIDTo))
                this.requestCodeFrom.setRow(srchObj.samplePlanIDTo, srchObj.samplePlanNameTo);

            this.searchBO.arID = srchObj.arID;
            this.searchBO.arName = srchObj.arName;
            if (CommonMethods.hasValue(srchObj.arName))
                this.arNum.setRow(srchObj.arName, srchObj.arName);

            this.searchBO.analystID = srchObj.analystID;
            this.searchBO.analystName = srchObj.analystName;
            if (CommonMethods.hasValue(srchObj.analystID))
                this.analyst.setRow(srchObj.analystID, srchObj.analystName);

            this.searchBO.testID = srchObj.testID;
            this.searchBO.testName = srchObj.testName;
            if (CommonMethods.hasValue(srchObj.testID))
                this.testParameter.setRow(srchObj.testID, srchObj.testName);
            if (CommonMethods.hasValue(srchObj.sampleID))
                this.sampleNum.setRow(srchObj.sampleID, srchObj.selectedSampleText);


            this.searchBO.specificationID = srchObj.specificationID;
            this.searchBO.specificationName = srchObj.specificationName;
            if (CommonMethods.hasValue(srchObj.specificationID))
                this.testParameter.setRow(srchObj.specificationID, srchObj.specificationName);

            this.dateFrom = dateParserFormatter.FormatDate(srchObj.dateFrom, 'default');
            this.dateTo = dateParserFormatter.FormatDate(srchObj.dateTo, 'default');
            this.planCreatedOn = dateParserFormatter.FormatDate(srchObj.planCreatedOn, "default");
            this.searchBO.dateFrom = srchObj.dateFrom;
            this.searchBO.dateTo = srchObj.dateTo;
            this.searchBO.shiftID = srchObj.shiftID;
            this.searchBO.advanceSearch = srchObj.advanceSearch;
            this.searchBO.pageIndex = this.currentSelectedIndex = srchObj.pageIndex;


        } else {

            if (!this.validateControls(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type == 'ALL' && init != 'Y') {
                this.searchBO = new SearchSamplePlanBO();

                // if (CommonMethods.hasValue(this.samplePlan.selectedId))
                //     this.samplePlan.clear();
                if (CommonMethods.hasValue(this.testParameter.selectedId))
                    this.testParameter.clear();
                if (CommonMethods.hasValue(this.arNum.selectedId))
                    this.arNum.clear();
                if (CommonMethods.hasValue(this.specifications.selectedId))
                    this.specifications.clear();
                if (CommonMethods.hasValue(this.materials.selectedId))
                    this.materials.clear();
                if (CommonMethods.hasValue(this.analyst.selectedId))
                    this.analyst.clear();
                if (CommonMethods.hasValue(this.requestCodeFrom.selectedId))
                    this.requestCodeFrom.clear();
                if (CommonMethods.hasValue(this.requestCodeTo.selectedId))
                    this.requestCodeTo.clear();
                if (CommonMethods.hasValue(this.planCreatedBy.selectedId))
                    this.planCreatedBy.clear();
                if (CommonMethods.hasValue(this.sampleNum.selectedId))
                    this.sampleNum.clear();

                this.planCreatedUserID = this.dateFrom = this.dateTo = this.planCreatedOn = null;

                this.searchFil = [];

            } else {


                if (CommonMethods.hasValue(this.dateFrom))
                    this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');

                if (CommonMethods.hasValue(this.dateTo))
                    this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');

                this.searchBO.matID = this.materials.selectedId;
                this.searchBO.samplePlanIDTo = this.requestCodeTo.selectedId;
                this.searchBO.samplePlanIDFrom = this.requestCodeFrom.selectedId;
                this.searchBO.analystID = this.analyst.selectedId;
                this.searchBO.specificationID = this.specifications.selectedId;
                //this.searchBO.samplePlanID = this.samplePlan.selectedId;
                this.searchBO.arID = this.arNum.selectedId;
                this.searchBO.testID = this.testParameter.selectedId;
                this.searchBO.planCreatedUserRoleID = this.planCreatedBy.selectedId;
                this.searchBO.pageSize = environment.recordsPerPage;
                this.searchBO.pageIndex = this.currentSelectedIndex;
                this.searchBO.sampleID = this.sampleNum.selectedId;


                srchObj.matID = this.searchBO.matID;
                srchObj.matName = this.materials.selectedText;

                srchObj.analystID = this.searchBO.analystID;
                srchObj.analystName = this.analyst.selectedText;

                srchObj.planCreatedUserRoleID = this.searchBO.planCreatedUserRoleID;
                srchObj.planCreatedUserRoleName = this.planCreatedBy.selectedText;


                srchObj.statusID = this.searchBO.statusID;

                srchObj.samplePlanIDFrom = this.searchBO.samplePlanIDFrom;
                srchObj.samplePlanNameFrom = this.requestCodeFrom.selectedText;

                srchObj.samplePlanIDTo = this.searchBO.samplePlanIDTo;
                srchObj.samplePlanNameTo = this.requestCodeTo.selectedText;

                srchObj.arID = this.searchBO.arID;
                srchObj.arName = this.arNum.selectedText;

                srchObj.samplePlanID = this.searchBO.samplePlanID;
                //srchObj.samplePlanName = this.samplePlan.selectedText;

                srchObj.specificationID = this.searchBO.specificationID;
                srchObj.specificationName = this.specifications.selectedText;

                srchObj.sampleID = this.searchBO.sampleID;
                srchObj.selectedSampleText = this.sampleNum.selectedText;

                srchObj.testID = this.searchBO.testID;
                srchObj.testName = this.testParameter.selectedText;
                srchObj.shiftID = this.searchBO.shiftID ;

                srchObj.dateFrom = this.searchBO.dateFrom = dateParserFormatter.FormatDate(this.dateFrom, 'date');
                srchObj.dateTo = this.searchBO.dateTo = dateParserFormatter.FormatDate(this.dateTo, 'date');
                srchObj.planCreatedOn = this.searchBO.planCreatedOn = dateParserFormatter.FormatDate(this.planCreatedOn, "date");

                srchObj.pageSize = this.searchBO.pageSize;
                srchObj.pageIndex = this.searchBO.pageIndex;


                srchObj.advanceSearch = this.searchBO.advanceSearch;
            }
            if (init != 'P')
                this.currentSelectedIndex = 0;


            SearchBoSessions.setSearchAuditBO(key, srchObj);

        }

        this._spService.searchSamplePlan(this.searchBO);
    }

    validateControls(type: string) {

        var isVal: boolean = true;
        if (type != 'ALL' && !CommonMethods.hasValue(this.searchBO.advanceSearch) && !CommonMethods.hasValue(this.planCreatedBy.selectedId)
            && !CommonMethods.hasValue(this.analyst.selectedId) && !CommonMethods.hasValue(this.materials.selectedId)
            && !CommonMethods.hasValue(this.testParameter.selectedId) && !CommonMethods.hasValue(this.sampleNum.selectedId)
            && !CommonMethods.hasValue(this.dateFrom) && !CommonMethods.hasValue(this.dateTo)
            && !CommonMethods.hasValue(this.searchBO.statusID) && !CommonMethods.hasValue(this.specifications.selectedId)
            && !CommonMethods.hasValue(this.arNum.selectedId) && !CommonMethods.hasValue(this.requestCodeFrom.selectedId)
            && !CommonMethods.hasValue(this.requestCodeTo.selectedId) && !CommonMethods.hasValue(this.planCreatedOn)
            && !CommonMethods.hasValue(this.searchBO.shiftID))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: "requestCode", header: "System code", cell: (element: any) => `${element.requestCode}` });
        this.headersData.push({ columnDef: "planCreatedOn", header: "Plan Created On", cell: (element: any) => `${element.planCreatedOn}` });
        this.headersData.push({ columnDef: "createdBy", header: "Plan Created By", cell: (element: any) => `${element.createdBy}` });
        this.headersData.push({ columnDef: "workShift", header: "Work Shift", cell: (element: any) => `${element.workShift}` });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}` });
    }

    export() {

        const _modal = this._matDailog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.samplePlan;

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(this.planCreatedUserID))
            condition = condition + " AND UserID = " + this.planCreatedUserID;
        // if (CommonMethods.hasValue(this.searchBO.arID))
        //     condition = condition + " AND ArID = " + this.searchBO.arID;
        // if (CommonMethods.hasValue(this.searchBO.analystID))
        //     condition = condition + " AND AnalystID = " + this.searchBO.analystID;
        // if (CommonMethods.hasValue(this.searchBO.testID))
        //     condition = condition + " AND TestID = " + this.searchBO.testID;
        // if (CommonMethods.hasValue(this.searchBO.specificationID))
        //     condition = condition + " AND SpecificationID = " + this.searchBO.specificationID;
        if (CommonMethods.hasValue(this.searchBO.samplePlanIDTo))
            condition = condition + " AND PlanID <= " + this.searchBO.samplePlanIDTo;
        if (CommonMethods.hasValue(this.searchBO.samplePlanIDFrom))
            condition = condition + " AND PlanID >= " + this.searchBO.samplePlanIDFrom;
        // if (CommonMethods.hasValue(this.searchBO.matID))
        //     condition = condition + " AND MatID = " + this.searchBO.matID;
        if (CommonMethods.hasValue(this.searchBO.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            condition = condition + " AND StatusID = '" + obj[0].statusCode + "'";
        }
        if (CommonMethods.hasValue(this.searchBO.dateFrom))
            condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.dateFrom, 'date') + "'";
        if (CommonMethods.hasValue(this.searchBO.dateTo))
            condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.dateTo.setDate(this.dateTo.getDate() + 1), 'date') + "'";

        _modal.componentInstance.condition = condition;
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = environment.pageIndex = val;
        this.searchFilter('Search', 'P');
    }


    menuEvt() {

        this.searchFil = [];
        if (CommonMethods.hasValue(this.searchBO.advanceSearch))
            this.searchFil.push({ code: "ADV_SRCH", name: "Search Text: " + this.searchBO.advanceSearch });
        if (CommonMethods.hasValue(this.arNum.selectedId))
            this.searchFil.push({ code: "AR_NUM", name: "AR Number: " + this.arNum.selectedText });
        if (CommonMethods.hasValue(this.testParameter.selectedId))
            this.searchFil.push({ code: "Test_Name", name: "Test/Paramete Name: " + this.testParameter.selectedText });
        if (CommonMethods.hasValue(this.requestCodeFrom.selectedId))
            this.searchFil.push({ code: "ReqCode_From", name: "Request Code From: " + this.requestCodeFrom.selectedText });
        if (CommonMethods.hasValue(this.requestCodeTo.selectedId))
            this.searchFil.push({ code: "ReqCode_To", name: "Request Code To: " + this.requestCodeTo.selectedText });
        if (CommonMethods.hasValue(this.analyst.selectedId))
            this.searchFil.push({ code: "Ana_Name", name: "Analyst Name: " + this.analyst.selectedText });
        // if (CommonMethods.hasValue(this.samplePlan.selectedId))
        //     this.searchFil.push({ code: "Samp_Plan", name: "Sample Plan: " + this.samplePlan.selectedText });
        if (CommonMethods.hasValue(this.specifications.selectedId))
            this.searchFil.push({ code: "Spec_Name", name: "Specifications Number: " + this.specifications.selectedText });
        if (CommonMethods.hasValue(this.planCreatedBy.selectedId))
            this.searchFil.push({ code: "Pla_BY", name: "Plan Created By: " + this.planCreatedBy.selectedText });
        if (CommonMethods.hasValue(this.materials.selectedId))
            this.searchFil.push({ code: "Mat_Name", name: "Material Name: " + this.materials.selectedText });
        if (CommonMethods.hasValue(this.dateFrom))
            this.searchFil.push({ code: "DATE_FROM", name: "Date From: " + dateParserFormatter.FormatDate(this.dateFrom, 'date') });
        if (CommonMethods.hasValue(this.dateTo))
            this.searchFil.push({ code: "DATE_TO", name: "Date To: " + dateParserFormatter.FormatDate(this.dateTo, 'date') });
        if (CommonMethods.hasValue(this.searchBO.statusID)) {
            var obj = this.statusList.filter(x => x.statusID == this.searchBO.statusID);
            this.searchFil.push({ code: 'STATUS', name: "Status: " + obj[0].status });
        }
        if (CommonMethods.hasValue(this.sampleNum.selectedId))
            this.searchFil.push({ code: "SAM_NUM", name: "Sample/Operation Number: " + this.sampleNum.selectedText });
        if (CommonMethods.hasValue(this.planCreatedOn))
            this.searchFil.push({ code: "PLAN_CREA_ON", name: "Plan Created On: " + dateParserFormatter.FormatDate(this.planCreatedOn, "date") });
        if(CommonMethods.hasValue(this.searchBO.shiftID))
            this.searchFil.push({code:"WORK_SHIFT", name:"Work Shift: "+this.shiftList.filter(x => x.catItemID == this.searchBO.shiftID)[0].catItem})
    }

    clearOption(code, index) {
        if (code == "Spec_Name")
            this.specifications.clear();
        // else if (code == "Sam_Plan")
        //     this.samplePlan.clear();
        else if (code == "Pla_BY")
            this.planCreatedBy.clear();
        else if (code == "AR_NUM")
            this.arNum.clear();
        else if (code == "Test_Name")
            this.testParameter.clear();
        else if (code == "ReqCode_From")
            this.requestCodeFrom.clear();
        else if (code == "ReqCode_To")
            this.requestCodeTo.clear();
        else if (code == "Ana_Name")
            this.analyst.clear();
        else if (code == "Mat_Name")
            this.materials.clear();
        else if (code == "DATE_FROM")
            this.dateFrom = null;
        else if (code == "DATE_TO")
            this.dateTo = null;
        else if (code == "STATUS")
            this.searchBO.statusID = null;
        else if (code == "ADV_SRCH")
            this.searchBO.advanceSearch = null;
        else if (code == "SAM_NUM")
            this.sampleNum.clear();
        else if (code == "PLAN_CREA_ON")
            this.planCreatedOn = null;
        else if(code == "WORK_SHIFT")
            this.searchBO.shiftID = null;
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
        if (evt.action == 'VIE')
            this._router.navigateByUrl('/lims/samplePlan/view?id=' + evt.val.encPlanID);
    }

    testOcuupancy() {
        const model = this._matDailog.open(TestOccupancyDetailsComponent, CommonMethods.modalFullWidth);
        model.disableClose = true;
        model.afterClosed();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}