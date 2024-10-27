import { Component, ViewChild } from "@angular/core";
import { SearchVolumetricSolBO } from '../model/volumetricSolModel';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from '../../common/services/utilities/commonmethods';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../common/services/alert.service';
import { LimsRespMessages, CapabilityActions, EntityCodes, LookupCodes, GridActions, ActionMessages, SearchPageTooltip } from '../../common/services/utilities/constants';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { Subscription } from '../../../../node_modules/rxjs';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { Router } from '../../../../node_modules/@angular/router';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { MatDialog } from '@angular/material';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';
import { SearchFilterModalService } from 'src/app/common/services/searchFilterModal.service';

@Component({
    selector: 'lims-vol',
    templateUrl: '../html/searchVolumetricSolution.html'
})

export class SearchVolumetricSolutionComponent {

    pageTitle: string = PageTitle.searchVolSolution;
    formulaType: string;
    currentSelectedIndex: number;
    totalRecords: number;
    headerData: any;
    dataSource: any;
    actions: Array<string> = [];
    hasManageIndexCap: boolean;
    hasCreateCap: boolean;
    statusList: any;
    materialInfo: LookupInfo;
    @ViewChild('material', { static: true }) material: LookupComponent;
    batchNumberInfo: LookupInfo;
    @ViewChild('batchNumber', { static: true }) batchNumber: LookupComponent;
    systemCodeFromInfo: LookupInfo;
    @ViewChild('systemCodeFrom', { static: true }) systemCodeFrom: LookupComponent;
    systemCodeToInfo: LookupInfo;
    @ViewChild('systemCodeTo', { static: true }) systemCodeTo: LookupComponent;
    systemCodeInfo: LookupInfo;
    @ViewChild('systemCode', { static: true }) systemCode: LookupComponent;
    statusID: any;
    searchResult: any = [];
    advanceSearch: string;
    validityFrom: Date;
    validityTo: Date;
    initiatedOn: Date;
    systemCodeFromCondition: string;
    systemCodeToCondition: string;
    searchBy: string = SearchPageTooltip.srchVolumetricSol;
    removeAction: any = { headerName: 'isZeroth', RE_STAND: true, isFinalApp: true, extraField: 'finalStatusCode', compareField: 'statusCode' }
    intiatedUserInfo: LookupInfo;
    @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;
    subscription: Subscription = new Subscription();
    today: Date = new Date();
    hasExpCap: boolean = false;

    constructor(private _alert: AlertService, private _volService: VolumetricSolService, private _confirm: ConfirmationService,
        private _limsContext: LIMSContextServices, private _router: Router, private _matDialog: MatDialog, public _global: GlobalButtonIconsService,
        private modalService: SearchFilterModalService) { }

    ngAfterContentInit() {
        this.subscription = this._volService.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "searchVolumetricSol") {
                this.prepareHeaders();
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.totalRecords = resp.result.totalNumberOfRows;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'filterTwiceCol', ['createdOn', 'useBeforeDate', 'reStandardizationDate']));
                this.menuEvt();
                this.closeModal("volumetric-search");
            }
            else if (resp.purpose == "getStatuslist")
                this.statusList = resp.result;
            else if (resp.purpose == "manageDiscardCommnets") {
                if (resp.result == 'OK') {
                    this._alert.success(mobilephaseMessages.succDisc);
                    this.searchFilter('Search', 'I');
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        this.searchFilter('Search', 'Y');
        this.prepareLKP();
        this._volService.getStatuslist(EntityCodes.volumetricSol);

        var capActions: CapabilityActions = this._limsContext.getSearchActinsByEntityCode(EntityCodes.volumetricSol, false);
        this.actions = capActions.actionList;

        this.actions.forEach((x, index) => {
            if (x == 'MNG_SOL_INDEX') {
                this.hasManageIndexCap = true;
                this.actions.splice(index, 1);
            }
        })

        this.hasCreateCap = capActions.createCap;
        this.actions.push(GridActions.ReStandardization);
        this.hasExpCap = capActions.exportCap;
        this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.initUser, LookupCodes.getQCUsers, LKPDisplayNames.employeeName,
            LKPDisplayNames.employeeCode, LookUpDisplayField.header, LKPPlaceholders.initUser, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'");
        //this.actions.push('DISC');
    }

    prepareLKP() {
        var batchNumCondition = "EntityCode = 'VOLSOLUTION'";
        this.batchNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.getInventoryDetails,
            LKPDisplayNames.batchNumber, LKPDisplayNames.Chemical, LookUpDisplayField.header, LKPPlaceholders.BatchNumber, batchNumCondition);
        this.materialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getVolSolutionIndexMaterials, LKPDisplayNames.solution, LKPDisplayNames.stpNumber, LookUpDisplayField.header, LKPPlaceholders.nameOfTheSolMaterial, "", "", "LIMS");
        this.systemCodeInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCode, LookupCodes.searchVolumetricSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.calibSystemCode);
        this.systemCodeFromLkp();
        this.systemCodeToLkp();
    }

    systemCodeFromLkp() {
        if (CommonMethods.hasValue(this.systemCodeTo.selectedId))
            this.systemCodeFromCondition = "SolutionID < '" + this.systemCodeTo.selectedId + "'";
        else this.systemCodeFromCondition = "";

        this.systemCodeFromInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeFrom, LookupCodes.searchVolumetricSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeFrom, this.systemCodeFromCondition);

    }

    systemCodeToLkp() {
        if (CommonMethods.hasValue(this.systemCodeFrom.selectedId))
            this.systemCodeToCondition = "SolutionID > '" + this.systemCodeFrom.selectedId + "'"
        else
            this.systemCodeToCondition = "";
        this.systemCodeToInfo = CommonMethods.PrepareLookupInfo(LKPTitles.systemCodeTo, LookupCodes.searchVolumetricSolution,
            LKPDisplayNames.status, LKPDisplayNames.mobilePhase, LookUpDisplayField.code, LKPPlaceholders.systemCodeTo, this.systemCodeToCondition);
    }

    prepareHeaders() {
        this.headerData = []
        this.headerData.push({ "columnDef": 'solutionName', "header": "Name of the Solution", cell: (element: any) => `${element.solutionName}`, width: 'minWidth-25per' });
        this.headerData.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-12per' });
        this.headerData.push({ "columnDef": 'useBeforeDate', "header": "Valid Up to", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-12per' });
        this.headerData.push({ "columnDef": 'reStandardizationDate', "header": "Re-Standardization Date", cell: (element: any) => `${element.reStandardizationDate}`, width: 'maxWidth-20per' });
        this.headerData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-12per' });
    }

    searchFilter(type: string, init: string = 'N') {
        var obj: SearchVolumetricSolBO = new SearchVolumetricSolBO();

        var key: string = SearchBoSessions['volumetricSolBO_' + this._limsContext.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.statusID = obj.statusID;
            this.formulaType = obj.formulaType;
            if (CommonMethods.hasValue(obj.materialID))
                this.material.setRow(obj.materialID, obj.material);
            if (CommonMethods.hasValue(obj.batchNumberID))
                this.batchNumber.setRow(obj.batchNumberID, obj.batchName);
            if (CommonMethods.hasValue(obj.solutionIDFrom))
                this.systemCodeTo.setRow(obj.solutionIDFrom, obj.solutionIDFromName);
            if (CommonMethods.hasValue(obj.solutionIDTo))
                this.systemCodeTo.setRow(obj.solutionIDTo, obj.solutionIDToName);
            if (CommonMethods.hasValue(obj.initiatedBy))
                this.intiatedUser.setRow(obj.initiatedBy, obj.initiatedByName)
            if (CommonMethods.hasValue(obj.solutionID))
                this.systemCode.setRow(obj.solutionID, obj.solutionIDName);
            this.validityFrom = obj.validityFrom;
            this.validityTo = obj.validityTo;
            this.advanceSearch = obj.advanceSearch;
            this.initiatedOn = obj.initiatedOn;

            this.currentSelectedIndex = Number(obj.pageIndex);
        }
        else {
            if (type != 'Search') {
                this.formulaType = '';
                this.material.clear();
                this.statusID = 0;
                this.advanceSearch = "";
                this.searchResult = [];
                this.validityFrom = this.validityTo = this.initiatedOn = null;
                this.batchNumber.clear();
                this.systemCodeFrom.clear();
                this.systemCodeTo.clear();
                this.intiatedUser.clear();
                this.systemCode.clear();
            }
            else if (!this.controlValidate(type) && init == 'N') {
                type == 'Search' ? this._alert.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (init != 'I') {
                this.currentSelectedIndex = 0;
                environment.pageIndex = '0';
            }

            obj.pageIndex = this.currentSelectedIndex;
            obj.formulaType = this.formulaType;
            obj.materialID = CommonMethods.hasValue(this.material) ? this.material.selectedId : null;
            obj.statusID = this.statusID;
            obj.material = this.material.selectedText;
            obj.validityTo = this.validityTo;
            obj.validityFrom = this.validityFrom;
            obj.batchNumberID = this.batchNumber.selectedId;
            obj.solutionIDFrom = this.systemCodeFrom.selectedId;
            obj.solutionIDFromName = this.systemCodeFrom.selectedText;
            obj.solutionIDTo = this.systemCodeTo.selectedId;
            obj.solutionIDToName = this.systemCodeTo.selectedText;
            obj.advanceSearch = this.advanceSearch;
            obj.initiatedOn = dateParserFormatter.FormatDate(this.initiatedOn, "date");
            obj.initiatedBy = this.intiatedUser.selectedId;
            obj.initiatedByName = this.intiatedUser.selectedText;
            obj.solutionID = this.systemCode.selectedId;
            obj.solutionIDName = this.systemCode.selectedText;
            SearchBoSessions.setSearchAuditBO(key, obj);
        }

        this._volService.searchVolumetricSol(obj);
    }

    export() {

        const _modal = this._matDialog.open(ExportDataComponent);
        _modal.disableClose = true;
        _modal.componentInstance.entityCode = EntityCodes.volumetricSol;

        var obj: SearchVolumetricSolBO = new SearchVolumetricSolBO();
        var key: string = SearchBoSessions['volumetricSolBO_' + this._limsContext.getEntityType()];
        if (SearchBoSessions.checkSessionVal(key))
            obj = SearchBoSessions.getSearchAuditBO(key);

        var condition: string = " AND 1 = 1";
        if (CommonMethods.hasValue(obj.materialID))
            condition = condition + " AND MaterialID = " + obj.materialID;
        if (CommonMethods.hasValue(obj.formulaType))
            condition = condition + " AND FormulaType = '" + obj.formulaType + "'";
        if (CommonMethods.hasValue(obj.statusID))
            condition = condition + " AND ( StatusID = " + obj.statusID + " OR StdStatusID = " + obj.statusID + ')';
        _modal.componentInstance.condition = condition;

    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (!CommonMethods.hasValue(this.formulaType) && !CommonMethods.hasValue(this.statusID) && (!CommonMethods.hasValue(this.material) || !CommonMethods.hasValue(this.material.selectedId))
            && !CommonMethods.hasValue(this.validityFrom) && !CommonMethods.hasValue(this.systemCodeFrom.selectedData)
            && !CommonMethods.hasValue(this.systemCodeTo.selectedId) && !CommonMethods.hasValue(this.validityFrom)
            && !CommonMethods.hasValue(this.validityTo) && !CommonMethods.hasValue(this.advanceSearch)
            && !CommonMethods.hasValue(this.batchNumber.selectedId)
            && !CommonMethods.hasValue(this.initiatedOn) && !CommonMethods.hasValue(this.intiatedUser.selectedId)
            && !CommonMethods.hasValue(this.systemCode.selectedId))
            isVal = false;

        if ((isVal && type == 'ALL') || (type == 'ALL' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }
        return isVal;
    }

    addIndex() {
        this._router.navigate(['/lims/volmetricSol/add']);
    }

    onActionClicked(evt) {
        if (evt.action == "VIE")
            this._router.navigateByUrl('/lims/volmetricSol/view?id=' + evt.val.encSolutionID);
        else if (evt.action == 'RE_STAND') {
            localStorage.setItem('isRestand', 'RESTAND');
            this._router.navigate(['/lims/volmetricSol/addSol'], { queryParams: { id: evt.val.encSolutionID } });
        }
        else if (evt.action == 'DISC') {
            this._confirm.confirm(LimsRespMessages.continue).subscribe(result => {
                if (result) {
                    const model = this._matDialog.open(addCommentComponent, { width: "600px" })
                    model.disableClose = true;
                    model.afterClosed().subscribe(res => {
                        if (res.result) {
                            var obj: CommentsBO = new CommentsBO();
                            obj.purposeCode = 'VOLSOL_PREP';
                            obj.encEntityActID = evt.val.encSolutionID;
                            obj.entityCode = EntityCodes.volumetricSol;
                            obj.comment = res.val;
                            this._volService.manageDiscardCommnets(obj);
                        }
                    })
                }

            })
        }
    }

    onPageIndexClicked(evt) {
        this.currentSelectedIndex = evt;
        environment.pageIndex = evt;
        this.searchFilter('Search', 'I');
    }

    menuEvt() {

        this.searchResult = [];
        if (CommonMethods.hasValue(this.advanceSearch))
            this.searchResult.push({ code: "ADV_SRCH", name: "Search Text: " + this.advanceSearch });
        if (CommonMethods.hasValue(this.statusID))
            var obj = this.searchResult.push({ code: 'STATUS', name: "Status: " + this.statusList.filter(x => x.statusID == this.statusID)[0].status });
        if (CommonMethods.hasValue(this.material.selectedId))
            this.searchResult.push({ code: "SOL_NAME", name: "Name of the Solution: " + this.material.selectedText });
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
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
            this.searchResult.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
        if (CommonMethods.hasValue(this.initiatedOn))
            this.searchResult.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.initiatedOn, "date") })
        if (CommonMethods.hasValue(this.systemCode.selectedId))
            this.searchResult.push({ code: "SYS_CODE", name: "System Code: " + this.systemCode.selectedText })
    }

    clearOption(code, index) {
        if (code == "ADV_SRCH")
            this.advanceSearch = null;
        else if (code == "SOL_NAME")
            this.material.clear();
        else if (code == "STATUS")
            this.statusID = null;
        else if (code == "VALID_FROM")
            this.validityFrom = null;
        else if (code == "VALID_TO")
            this.validityTo = null;
        else if (code == "SYSTEM_CODE_FROM")
            this.systemCodeFrom.clear();
        else if (code == "SYSTEM_CODE_To")
            this.systemCodeTo.clear();
        else if (code == "BATCH_NUM")
            this.batchNumber.clear();
        else if (code == "INITIATED_BY")
            this.intiatedUser.clear();
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

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}