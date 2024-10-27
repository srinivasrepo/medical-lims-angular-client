import { Component, Input, Output, EventEmitter } from '@angular/core'
import { environment } from '../../../environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmationService } from './confirmationService';
import { AlertService } from '../../common/services/alert.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { ApprovalProcessMessages } from '../../approvalProcess/messages/approvalProcessMessages';
import { CommonMessages } from '../../common/messages/commonMessages';
import { FileDownload, UomDenominationObj, GridActionFilterBOList, GridActionFilterBO, RS232IntegrationModelBO } from '../entity/limsGrid';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { FileDownloadComponent } from './fileDownload.component';
import { LimsHelperUrl } from '../services/limsHelpersServiceUrl';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog, MAT_MENU_SCROLL_STRATEGY } from '@angular/material';
import { MaterialUomConversionsComponent } from 'src/app/common/component/materialUomConversions';
import { LimsHelperService } from '../services/limsHelpers.service';
import { ActionMessages, ConditionCodes, GridActions, SectionCodes } from 'src/app/common/services/utilities/constants';
import { Subscription } from 'rxjs';
import { ViewQCInventoryComponent } from 'src/app/QCInventory/component/ViewQCInventory.component';
import { Overlay, BlockScrollStrategy } from '@angular/cdk/overlay';
import { ReportBO } from 'src/app/reports/models/report.model';
import { ReportView } from 'src/app/common/component/reportView.component';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// block the backgroung scroll for mat-menu---------------
export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
    return () => overlay.scrollStrategies.block();
}

@Component({
    selector: 'lims-grid',
    templateUrl: '../html/grid.html',
    providers: [
        { provide: MAT_MENU_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] }
    ]
})


// siva
export class GridComponent {

    @Input() headers: any = [];
    @Input() dataSource: any = [];
    @Input() docSource: any = [];
    @Input() actions: any = [];
    @Output() onActionClicked: EventEmitter<any> = new EventEmitter();
    @Output() onRowClicked: EventEmitter<any> = new EventEmitter();
    @Output() deleteItems: EventEmitter<any> = new EventEmitter();
    displayedColumns: any = [];
    actionIcons: Map<string, string> = new Map<string, string>();
    actiontoolTip: Map<string, string> = new Map<string, string>();
    @Input() removeAction: any;
    showConditionHeader: boolean = false;
    listActions: Array<any> = [];
    selectedindex: number;
    sortedData: any = [];
    checkBox: boolean = true;
    @Input('isEnableCheckbox') isEnableCheckbox: boolean;
    selection = new SelectionModel<Element>(true, []);
    @Output('isSelectedCheckBox') isSelectedCheckBox: EventEmitter<any> = new EventEmitter();
    @Input('allCheckboxSelected') allCheckboxSelected: boolean;
    @Input('isDisabledActions') isDisabledActions: boolean;
    templateFilterActions: Array<string> = ['REJ', 'DISC'];
    @Input('checkboxField') checkboxField: string = 'select';
    @Input() btnType: string = 'MNG';
    downloadFile: FileDownloadComponent = new FileDownloadComponent();
    fileType: string = '';
    @Input('isParentCheckBoxVisible') isParentCheckBoxVisible: boolean;
    @Input('extraColumns') extraColumns: any;
    @Input() isDisabled: boolean = false;
    uomList: Array<any> = [];
    @Input('entityType') entityType: string = "DEF";
    @Output('onDataChange') onDataChange: EventEmitter<any> = new EventEmitter();
    @Input('gradeList') gradeList: any = [];
    @Input('blockList') blockList: any = [];
    today: Date = new Date();
    @Input('displayActionHeader') displayActionHeader: boolean = true;
    @Input('applyRowCss') applyRowCss: boolean = false;
    @Input('isSolventGrid') isSolventGrid: boolean = false;
    @Input('type') type: string = 'MEDICAL_LIMS';
    @Input('activityStatusLst') activityStatusLst: any = [];
    @Input() referenceNumber: string;
    @Input() batchNumber: string;
    @Input() entActID: string;
    index: number;
    fireAtOnce: boolean = false;

    constructor(private _confirm: ConfirmationService, private _notify: AlertService, private _modal: MatDialog, private _limsService: LimsHelperService,
        private service: LIMSHttpService, public _global: GlobalButtonIconsService) {

        this.actionIcons.set("DELETE", "delete_forever");
        this.actionIcons.set("CHGSTAT", "swap_horiz");
        this.actionIcons.set("ASSIGN", "person_add");
        this.actionIcons.set("VIEW", "visibility");
        this.actionIcons.set("NEWVERSION", "merge_type");
        this.actionIcons.set("CLONE", "merge_type");
        this.actionIcons.set("UPD", "edit");
        this.actionIcons.set("EXECUTE", "play_circle_filled_white");
        this.actionIcons.set("EXECUTIONVIEW", "visibility");
        this.actionIcons.set("UPLOAD", "attach_file");
        this.actionIcons.set("EDIT", "edit");
        this.actionIcons.set("MANAGE", "edit");
        this.actionIcons.set("CLONE", "merge_type");
        this.actionIcons.set("VIE", "visibility");
        this.actionIcons.set("RE_STAND", "refresh");
        this.actionIcons.set("MNG_PRO", "edit")
        this.actionIcons.set("MNG_OCC", 'library_add');
        this.actionIcons.set("INVALID", 'cancel');
        this.actionIcons.set('DISC', "not_interested");
        this.actionIcons.set("CHANGE_USR_PLAN_TEST", "swap_horiz");
        this.actionIcons.set("OPEN", "person_add")
        this.actionIcons.set("MNGPACK", 'edit');
        this.actionIcons.set("BLOCK", 'block');
        this.actionIcons.set("CANCONSUME", "edit");
        this.actionIcons.set("NOT_ISSUED", "visibility");
        this.actionIcons.set("DISCARD", "block");
        this.actionIcons.set("ASSIGN_ANALYST", "person_add");
        this.actionIcons.set("UN_ASSIGN", 'remove_circle_outline');
        this.actionIcons.set("SEND_REQUEST", 'send');
        this.actionIcons.set("UPD_REMARKS", "edit");
        this.actionIcons.set("ASSIGN_FORMULAE", "add");
        this.actionIcons.set("ANALYSIS", "work");
        this.actionIcons.set("BATCH_SPLIT", "call_split");
        this.actionIcons.set("ASSIGN_STP", "add");
        this.actionIcons.set("MANAGE_GP_TECH", "assignment_turned_in");
        this.actionIcons.set("RS232_INTEGRATION", "assignment_turned_in");
        this.actionIcons.set("VERSION", "merge_type");
        this.actionIcons.set("CHECK_LIST", "insert_chart");
        this.actionIcons.set("ASSIGN_INST", "add");
        this.actionIcons.set("ASSIGN_PLANT", "add");
        this.actionIcons.set("CALIB_REPORT", "picture_as_pdf");
        this.actionIcons.set("MNG_ARDS", "attach_file");
        this.actionIcons.set("RE_PRINT", "restore_page");
        this.actionIcons.set("VIEW_SPEC", "visibility");
        this.actionIcons.set("VIEW_CALIB", "visibility");
        this.actionIcons.set("NEW_REQ", "add_circle_outline");
        this.actionIcons.set("PDF", "picture_as_pdf");
        this.actionIcons.set("REMOVE", "delete_forever");
        this.actionIcons.set("DIS_QUALIFY", "person_add_disabled");

        this.actiontoolTip.set("VERSION", "New Version");
        this.actiontoolTip.set("CHANGE_USR_PLAN_TEST", "Change User Plan Test");
        this.actiontoolTip.set("ADD", "Add");
        this.actiontoolTip.set("EDIT", "Edit");
        this.actiontoolTip.set("DELETE", "Delete");
        this.actiontoolTip.set("CHGSTAT", "Change Status");
        this.actiontoolTip.set("NEWVERSION", "New Version");
        this.actiontoolTip.set("UPD", "Update");
        this.actiontoolTip.set("EXECUTE", "Execute");
        this.actiontoolTip.set("VIEW", "View");
        this.actiontoolTip.set("EXECUTIONVIEW", "Executive View");
        this.actiontoolTip.set("UPLOAD", "Uploads");
        this.actiontoolTip.set("UPDATE", "Update");
        this.actiontoolTip.set("MANAGE", "Manage Users");
        this.actiontoolTip.set("CLONE", "Clone");
        this.actiontoolTip.set("ASSIGN", "Assign");
        this.actiontoolTip.set("VIE", "View");
        this.actiontoolTip.set("MNG_OCC", 'Manage Occupancy');
        this.actiontoolTip.set("RE_STAND", "Re Standardization");
        this.actiontoolTip.set("INVALID", "Invalid");
        this.actiontoolTip.set("DISC", "Discard");
        this.actiontoolTip.set("MNG_PRO", "Manage Procedures");
        this.actiontoolTip.set("OPEN", "Open");
        this.actiontoolTip.set("MNGPACK", "Manage Pack");
        this.actiontoolTip.set('BLOCK', 'Block Unblock');
        this.actiontoolTip.set("CANCONSUME", "Misc. Consume");
        this.actiontoolTip.set("NOT_ISSUED", "Reservations");
        this.actiontoolTip.set("DISCARD", "Discard");
        this.actiontoolTip.set("ASSIGN_ANALYST", "Assign Analyst");
        this.actiontoolTip.set("UN_ASSIGN", "Un Assign");
        this.actiontoolTip.set("SEND_REQUEST", 'Send Request');
        this.actiontoolTip.set("UPD_REMARKS", "Update Remarks");
        this.actiontoolTip.set("ASSIGN_FORMULAE", "Assign Formulae");
        this.actiontoolTip.set("ANALYSIS", "Analysis")
        this.actiontoolTip.set("BATCH_SPLIT", "Batch Split");
        this.actiontoolTip.set("ASSIGN_STP", "Assign STP")
        this.actiontoolTip.set("MANAGE_GP_TECH", "Manage Group Technique");
        this.actiontoolTip.set("RS232_INTEGRATION", "Rs232 Integration");
        this.actiontoolTip.set("CHECK_LIST", "Checklist");
        this.actiontoolTip.set("ASSIGN_INST", "Assign Instruments");
        this.actiontoolTip.set("ASSIGN_PLANT", "Assign Plant");
        this.actiontoolTip.set("CALIB_REPORT", "ARDS Report");
        this.actiontoolTip.set("MNG_ARDS", "Manage ARDS");
        this.actiontoolTip.set("RE_PRINT", "Re-Print");
        this.actiontoolTip.set("VIEW_SPEC", "View Specification");
        this.actiontoolTip.set("VIEW_CALIB", "View Calibration");
        this.actiontoolTip.set("NEW_REQ", "Generate New Calibration");
        this.actiontoolTip.set("CLONE", "Clone");
        this.actiontoolTip.set("PDF", "Reports");
        this.actiontoolTip.set("REMOVE", "Remove from plan");
        this.actiontoolTip.set("DIS_QUALIFY", "Dis-Qualify");
    }


    onActionClick(action: any, dataItem: any) {

        if (this.isDisabledActions)
            return;

        if (this.docSource.length > 0 && action == "VIEW") {
            if (dataItem.section == "REPORT" && !CommonMethods.hasValue(dataItem.isPermanentRptGenerated)) {

                let obj = new ReportBO();

                if (CommonMethods.hasValue(dataItem.entActID))
                    obj.entActID = dataItem.entActID;
                if (CommonMethods.hasValue(dataItem.versionCode))
                    obj.versionCode = dataItem.versionCode;

                obj.reportType = 'RPT';
                obj.entityRPTCode = dataItem.entRptCode;
                obj.dmsID = dataItem.dmsID;

                const modalRef = this._modal.open(ReportView, CommonMethods.modalFullWidth);
                modalRef.componentInstance.rpt = obj;
                return;
            }
            else
                return this.downloadFiles(dataItem.documentName, dataItem.entityCode, dataItem.fileUploadID, dataItem.documentActualName, dataItem.section, dataItem.dmsID, dataItem.doctTrackID, dataItem.entRptCode, dataItem.entActID)

            // // window.location.href = this.getPath(dataItem);
            // window.open(this.getPath(dataItem), '_blank');
            // return;
        }
        if (this.applyRowCss) {
            this.dataSource.data.forEach(x => { x.applyClass = false })
            dataItem.applyClass = true;
        }

        this.onActionClicked.emit({ action: action, val: dataItem });
    }

    getPath(path: any) {
        var obj = path.documentName.split('UserFiles');
        return environment.baseUrl + 'UserFiles/' + obj[1];
    }

    formatString(val, sourceField) {
        var columns: Array<string> = ['respectiveDept', 'respectivePlant', 'select', 'isArrears', 'isInclude', 'quantity', 'psWeight', 'solutionConsumed', 'isSelected', 'minutes', 'isPrimaryPreparationBatch', 'mfgBatchNumber', 'activityStatus'];

        if (sourceField == 'mfgBatchNumber' && this.isDisabled)
            return CommonMethods.FormatValueString(val)

        if (columns.includes(sourceField)) {
            if (sourceField != 'minutes' && this.checkboxFields.includes(sourceField)) {
                this.checkboxField = sourceField;
            }

            if ((this.checkboxField != 'quantity' && this.btnType != 'VIEW') || (sourceField == 'isPrimaryPreparationBatch'))
                return "";
            else if (this.btnType != 'VIEW')
                return "";
        }

        return CommonMethods.FormatValueString(val)
    }

    checkfieldExist(data: any, col: string) {
        var columns: Array<string> = ['respectiveDept', 'respectivePlant', 'isArrears'];

        if (columns.includes(col))
            return CommonMethods.hasValue(data[col]) && data[col] == true ? true : false;
        else
            return false;
    }

    onRowClick(data) {
        this.onRowClicked.emit(data);
    }

    extraFieldFilter(dataItem) {
        return CommonMethods.hasValue(this.removeAction.extraField) == true ? dataItem[this.removeAction.extraField] == dataItem[this.removeAction.compareField] : true;
    }

    ngOnChanges() {
        this.displayColumnFilter();
        if (sessionStorage.getItem("REFERESH_ACTIONS") == 'true') {
            this.reInitUserActions();
            sessionStorage.setItem("REFERESH_ACTIONS", 'false');
        }
    }

    ngDoCheck() {
        if (this.isSolventGrid) {
            this.reInitUserActions();
            this.isSolventGrid = false;
        }
    }

    public masterToggle(evt) {
        if (evt.checked)
            this.dataSource.data.forEach((x) => { x[this.checkboxField] = true; this.selection.select(x) })
        else
            this.dataSource.data.forEach((x) => { x[this.checkboxField] = false; if (x['minutes']) x.minutes = ''; this.selection.clear(); })

        this.allCheckboxSelected = evt.checked;
        this.isSelectedCheckBox.emit({ checked: evt.checked, selected: "ALL" })
    }

    selectSingleChk(evt, row, field: string = '') {
        if (evt.checked)
            row[this.checkboxField] = true;
        else {
            row[field] = '';
            row[this.checkboxField] = false;
            row['packIssueQty'] = ''
            this.onDataChange.emit({ val: true });
        }

        this.selection.toggle(row);

        var list = this.dataSource.data.filter(x => x[this.checkboxField] == true);

        if (list.length == this.dataSource.data.length)
            this.allCheckboxSelected = true;
        else
            this.allCheckboxSelected = false;

        this.isSelectedCheckBox.emit({ checked: evt.checked, selected: "SINGLE" })
    }

    HeaderDelete() {
        if (this.dataSource && this.dataSource.data) {
            if (this.dataSource.data.length > 1) {
                if ((this.dataSource.data.filter(x => x.select == true).length) == 0) {
                    this._notify.warning(CommonMessages.atleastone);
                    return
                }

                this._confirm.confirm(ApprovalProcessMessages.deleteSelectedItems).subscribe(result => {
                    if (result)
                        this.deleteItems.emit();
                });
            }
            else if (this.dataSource.data.length == 1) {
                this._confirm.confirm(ApprovalProcessMessages.deleteItem).subscribe(result => {
                    if (result) {
                        this.dataSource.data.forEach((x) => { x['select'] = true; })
                        this.deleteItems.emit();
                    }
                });
            }
        }
    }

    showCheckBox() {
        this.checkBox = (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0);
        return this.checkBox;
    }

    showMatTooltip(val: any) {
        var tip: string = '';
        if (CommonMethods.hasValue(val.createdOn) || CommonMethods.hasValue(val.actionDate))
            tip = val.createdOn || val.actionDate;
        if (CommonMethods.hasValue(val.userName))
            tip = tip + ' | ' + val.userName;
        if (CommonMethods.hasValue(val.changeStatusComment))
            tip = val.changeStatusComment;
        return tip;
    }

    checkboxFields = ['select', 'isInclude', 'isSelected', 'isPrimaryPreparationBatch'];

    isShowCheckBox(columnDef: string, row: any) {


        if (row && (row['preparationSource'] != 'VOLUMETRIC_SOL' || row['statusCode'] == 'DISC') && columnDef == 'isPrimaryPreparationBatch')
            return false;
        else if (columnDef == 'isDocSelect' && row && row['isShowChkbox'])
            return true;
        return this.checkboxFields.includes(columnDef) && this.showCheckBox()
    }

    txtboxFields = ['quantity', 'psWeight', 'solutionConsumed', 'minutes'];

    enableTxtBox(columnDef: string) {
        return this.txtboxFields.includes(columnDef) && this.btnType == 'MNG';
    }



    getUOMList(val: string) {
        if (!CommonMethods.hasValue(val))
            return [];
        // var obj = CommonMethods.getUOMListFilter(val, 'type');
        // var index = this.uomList.findIndex(x => x.value == obj[0].value);

        // if (index < 0) {
        //     var list = CommonMethods.getUOMListFilter(obj[0].value, 'value');
        //     for (let index = 0; index < list.length; index++)
        //         this.uomList.push(list[index]);
        // }

        // return this.uomList.filter(x => x.value == obj[0].value);

        return this.uomList.filter(x => x.sourceUOM == val);
    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 5, 5);
    }

    changeStdWeight(evt, row, val: any) {
        if (CommonMethods.hasValue(row.psWeight) && CommonMethods.hasValue(row.solutionConsumed) && CommonMethods.validNumber(val))
            row.result = this.cal(row);
        else
            row.result = "";
    }

    cal(row) {
        return Number(((1000 * (Number(row.psWeight))) / (Number(row.solutionConsumed) * Number(row.molecularWeight))).toString().match(/^-?\d+(?:\.\d{0,5})?/)[0]);
    }


    @Input('usrActions') usrActions: GridActionFilterBOList = new GridActionFilterBOList();

    checkUserActions(dataItem: any, idx: number, isRefresh: string = "NO") {

        if (this.usrActions.filter(x => x.index == idx).length > 0 && isRefresh == "NO")
            return this.usrActions.filter(x => x.index == idx)[0].data;

        var obj: GridActionFilterBO = new GridActionFilterBO();
        obj.index = idx;

        this.actions.forEach((action, index) => {
            if (CommonMethods.hasValue(this.removeAction)) {




                if (this.removeAction.headerName == 'ananlysis_occ') {
                    if (!CommonMethods.hasValue(dataItem['invalidationID']) && dataItem['statusCode'] != "INVALID" && ((action == this.removeAction.action && !CommonMethods.hasValue(this.removeAction.showDelete)) || action == 'EDIT'))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "specCycle") {
                    if (action == "ANALYSIS" || (action == "DELETE" && !dataItem[this.removeAction[action]]))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "SearcfInstCalib") {
                    if (action == 'VIE' || (action == GridActions.GenerateNew && dataItem[this.removeAction.NEW_REQ]))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "searchAnalyst") {
                    if (action == 'VIE' || (this.removeAction[action] == dataItem['showDisQuify']))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "SEARCH_QC_CALIB") {
                    if ((((action != "ASSIGN_INST" && action != "VERSION" && action != 'CHGSTAT') && (dataItem[this.removeAction[action]] == this.removeAction[this.removeAction[action]])) || (action == 'VIEW')
                        || (action == 'ASSIGN_INST' && (dataItem['showAssignInst'])) || (action == "VERSION" && (dataItem['showNewVersion'])
                            || (action == "MNG_ARDS") && dataItem["showManageArds"]) || (action == 'CHGSTAT' && (dataItem['statusCode'] == 'ACT' || dataItem['statusCode'] == 'FOR_VALID') && (dataItem['hasChild'] == 'NO'))
                        || (action == "ASSIGN_PLANT" && dataItem["showAssignPlant"]))
                        && action != 'ASSIGN_STP')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "ARDS_SELECTION") {
                    if ((action == GridActions.Discard && (dataItem[this.removeAction.compareField] != "DISC" && dataItem[this.removeAction.compareField] != "ISS" && dataItem['statusCode'] != 'REPRINT' && dataItem['statusCode'] != "FORQAAPP")) || action == GridActions.view)
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'ISS' && (action == GridActions.upload || action == GridActions.RePrint))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });

                }
                else if (this.removeAction.headerName == "manageArdsDoc") {
                    if (!CommonMethods.hasValue(dataItem.effectiveTo))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "MANAGE_APPLEVEL") {
                    if (dataItem[this.removeAction.compareField] != this.removeAction[action])
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "parentInvID" && (action == 'DELETE' || action == 'BATCH_SPLIT')) {

                    if (action == 'BATCH_SPLIT' && !CommonMethods.hasValue(dataItem[this.removeAction.headerName]))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (CommonMethods.hasValue(dataItem[this.removeAction.headerName]) && action == 'DELETE')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "FileUpload") {
                    if ((dataItem["documentActualName"] && dataItem["documentActualName"].lastIndexOf('( Invalid )') > -1) && action != GridActions.view)
                        obj.data;
                    else if ((action == GridActions.delete && dataItem["isSystemDoc"] != 'SYSTEM') || action != GridActions.delete)
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (CommonMethods.hasValue(this.removeAction.headerName) && (this.removeAction.headerName == 'isFinal' || this.removeAction.headerName == 'isZeroth')) {
                    if ((((action == 'RE_STAND' && dataItem['isFinalApp'] == this.removeAction.isFinalApp && dataItem['isAccessRest'] && dataItem['isRestd']) && (dataItem['status'] != 'Discarded' && dataItem['status'] != 'Rejected') && (!CommonMethods.hasValue(dataItem['standardizationID'])) && dataItem[this.removeAction.headerName] == this.removeAction[action] && this.extraFieldFilter(dataItem))) || dataItem[this.removeAction.headerName] == this.removeAction[action] && (action != 'RE_STAND'))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (action == 'DISC' && this.extraFieldFilter(dataItem))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (action == 'VIE' &&
                        (this.removeAction.headerName == 'isFinal' && (dataItem[this.removeAction.headerName] == this.removeAction[action]))
                        ||
                        (this.removeAction.headerName == 'isZeroth' && action != 'RE_STAND' && action != 'DISC')
                    )
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == 'sampleAna') {
                    if ((action == 'UPD' && dataItem['sampleAnalysisType'] != 'S' && (dataItem[this.removeAction.UPD_REMARKS] == 'APP' || dataItem[this.removeAction.UPD_REMARKS] == 'REJ')) || action == 'VIE')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (dataItem[this.removeAction.headerName] == this.removeAction[action] && dataItem[this.removeAction.headerName] == 'INVALID')
                    this.usrActions;
                else if ((this.removeAction['action'] == action && this.removeAction.headerName == 'isActive' && CommonMethods.hasValue(dataItem[this.removeAction.headerName])) || (this.removeAction.headerName == 'isActive' && action == "VIEW"))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (this.removeAction['action'] == action && this.extraFieldFilter(dataItem) && this.removeAction.headerName != 'isActive' && this.removeAction.headerName != "UnAssign")
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (this.removeAction.headerName == 'Solvents') {
                    if (dataItem[this.removeAction.compareField] == 'APP' && action == 'EDIT')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.Type] == this.removeAction.RequestFrom && dataItem[this.removeAction.compareField] == 'APP' && action == 'DISCARD')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (action == 'MNG_OCC' || action == "RS232_INTEGRATION")
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if (this.removeAction.headerName == "UnAssign") {
                    if (dataItem[this.removeAction.canUnAssign] == 'YES' && action == this.removeAction.action)
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (action == GridActions.ChangeUserPlanTest)
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
                else if ((!this.removeAction[action] || this.removeAction.extraField == 'INVALID') && action != 'DISC' && action != 'CANCONSUME' && this.removeAction.headerName != 'isActive')
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] == this.removeAction[action] && this.extraFieldFilter(dataItem) && action != 'CANCONSUME' && this.removeAction.headerName != 'isActive')
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] != this.removeAction[action] && ((action == 'EXECUTIONVIEW') || (action == 'PREPARATION' && !CommonMethods.hasValue(dataItem['executionStatus'])) || (action == 'PREPARATIONVIEW')))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] && (action == 'MNG_PRO' || action == 'CHGSTAT'))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] != this.removeAction[action]) {
                    if (dataItem[this.removeAction.compareField] != 'INPROG' && action == 'NEWVERSION')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'ACT' && action == 'MANAGE')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'ACT' && action == 'CHANGESTATUS')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] != 'INPROG' && action == 'CLONE')
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'ACT' && action == 'UPD')
                        obj.data.push({ code: 'MANAGE', val: this.actiontoolTip.get('MANAGE'), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'INPROG' && (action == 'UPD' || action == 'MANAGE'))
                        obj.data.push({ code: 'UPDATE', val: this.actiontoolTip.get('UPDATE'), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.compareField] == 'OBSE' && action == 'UPD')
                        obj.data.push({ code: 'VIEW', val: this.actiontoolTip.get('VIEW'), icon: this.actionIcons.get('VIEW') });
                    else if (dataItem[this.removeAction.headerName] == this.removeAction[action])
                        obj.data.push({ code: 'OPEN', val: this.actiontoolTip.get('OPEN'), icon: this.actionIcons.get('OPEN') });
                    else if (CommonMethods.hasValue(dataItem['canConsume']) && action == 'CANCONSUME' && !CommonMethods.hasValue(dataItem['canOpen']))
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    // else if (CommonMethods.hasValue(dataItem['canConsume']) && this.removeAction[action] == dataItem['canConsume'])
                    //     obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if (dataItem[this.removeAction.headerName] == this.removeAction[action])
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if ((this.removeAction.extraField == 'INVALID' || this.removeAction.extraField == 'SINGLE_ACT')) {
                        if (dataItem[this.removeAction.headerName] == 'INVALID' || dataItem[this.removeAction.headerName])
                            obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                        // else
                        //     obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    }
                    else if ((dataItem[this.removeAction.BLOCK] == 'APP' || dataItem[this.removeAction.BLOCK] == 'BLCKD' || dataItem[this.removeAction.BLOCK] == 'FOROPEN') && action == 'BLOCK' && dataItem['balanceQty'] > 0)
                        obj.data.push({ code: 'BLOCK', val: this.actiontoolTip.get('BLOCK'), icon: this.actionIcons.get('BLOCK') });
                }
                else if ((((action == 'RE_STAND' && dataItem['isFinalApp'] == this.removeAction.isFinalApp) && (!CommonMethods.hasValue(dataItem['standardizationID'])) && dataItem[this.removeAction.headerName] == this.removeAction[action] && action != 'CANCONSUME')) || (dataItem[this.removeAction.headerName] == this.removeAction[action] && (action != 'RE_STAND' && action != 'CANCONSUME' && action != 'DISC')) || (dataItem[this.removeAction.headerName] && this.removeAction.action == action))
                    return obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (this.removeAction.action == 'DISC' && this.extraFieldFilter(dataItem))
                    return obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] && (this.removeAction[action]) && action != 'CANCONSUME')
                    return obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
            }
            else
                obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });

        })

        this.usrActions.push(obj)
        return (obj.data);
    }

    private downloadFiles(documentName: string, entityCode: string, fileUploadID: number, documentActualName: string, section: string, dmsID: number, docTrackID: number, entRptCode: string, entActID: any) {
        var obj: FileDownload = new FileDownload();
        obj.fileUploadID = fileUploadID;
        obj.entityCode = entityCode;
        obj.section = section;

        if (documentActualName) {
            if (documentActualName.lastIndexOf('( Invalid )') > -1)
                documentActualName = (documentActualName.substring(0, documentActualName.lastIndexOf('( Invalid )')).trim())
        }

        obj.documentActualName = documentActualName;
        obj.documentName = documentName;
        obj.type = this.type;
        obj.reportID = dmsID;
        if (CommonMethods.hasValue(documentActualName) && CommonMethods.hasValue(documentActualName.split('.')[1]))
            this.fileType = documentActualName.split('.')[1].trim();
        if (section != "REPORT" && (!CommonMethods.hasValue(docTrackID) && this.type == 'MEDICAL_LIMS') || (this.type == 'MEDICALLIMS' && !CommonMethods.hasValue(dmsID))) {
            this.service.postDataToService(CommonMethods.formatString(LimsHelperUrl.fileDownload, []), obj)
                .subscribe(resp => {
                    if (resp != "NOFILES") {
                        var file = { type: this.fileType, name: documentActualName }
                        this.downloadFile.convertBase64StringToBlob(resp, file);
                    }
                    else
                        this._notify.error(CommonMessages.downloadFile);
                })
        }
        else if (section == "REPORT") {
            var file: any = { dmsid: dmsID, type: entRptCode, entityActID: entActID, entityCode: 'INVALIDATIONS', section: section }
            this.service.postDataToService(CommonMethods.formatString(LimsHelperUrl.viewFile, []), file)
                .subscribe(resp => {
                    if (resp == "PERMANENT_RPT_NOT_GEN")
                        return this._notify.error(ActionMessages.GetMessageByCode(resp))
                    const modal = this._modal.open(ReportView, CommonMethods.modalFullWidth);
                    modal.componentInstance.setAuditReportUrl = resp;
                })
        }
        else {
            var file: any = { dmsid: CommonMethods.hasValue(docTrackID) ? docTrackID : dmsID }
            this.service.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.viewARDSMasterDocument, [CommonMethods.hasValue(docTrackID) ? String(docTrackID) : String(dmsID)]))
                .subscribe(resp => {
                    const modal = this._modal.open(ReportView, CommonMethods.modalFullWidth);
                    modal.componentInstance.setAuditReportUrl = resp;
                })
        }
    }

    allowNumbers(evt) {
        return CommonMethods.allowNumber(evt, '');
    }

    displayColumnFilter() {
        if (CommonMethods.hasValue(this.actions) && CommonMethods.hasValue(this.headers) && this.displayActionHeader)
            this.displayedColumns = this.headers.map(c => c.columnDef).concat(['actions']);
        else if (CommonMethods.hasValue(this.headers))
            this.displayedColumns = this.headers.map(c => c.columnDef);
    }

    columnsAdd(evt, data) {
        if (evt.checked) {
            // this.headers.push(data);
            // this.extSelectedFields.push(data);
        }
        else {
            // var index = this.headers.findIndex(o => o.columnDef == data.columnDef);
            // this.headers.splice(index, 1);

            // var index = this.extSelectedFields.findIndex(o => o.columnDef == data.columnDef);
            // this.extSelectedFields.splice(index, 1);

        }
        // this.displayColumnFilter();
    }

    uomConvert(data) {
        const modal = this._modal.open(MaterialUomConversionsComponent, { width: "80%" });
        modal.disableClose = true;
        modal.componentInstance.materialID = data.materialID;
        modal.afterClosed().subscribe(res => {
            if (res)
                this.getUoms()
        })
    }

    getUoms() {
        this.uomList = [];
        this.dataSource.data.forEach(o => {
            // this._limsService.getMaterialUomList(o.materialID);
            this._limsService.getMaterialUOMConvertions(o.baseUOM);
            // paramAlies

        })
    }

    subscription: Subscription = new Subscription();
    ngAfterContentInit() {
        this.subscription = this._limsService.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialUOMConvertions") {
                // this.uomList = resp.result;
                var obj = this.uomList.filter(o => o.sourceUOM == resp.result[0].sourceUOM)
                if (obj.length == 0) {
                    resp.result.forEach(x => {
                        this.uomList.push(x);
                    })
                }
                else {
                    resp.result.forEach(x => {
                        var item = obj.filter(o => o.sourceUOM != x.sourceUOM)
                        if (item.length > 0)
                            this.uomList.push(item);
                    })
                }
            }
            else if (resp.purpose == "getUOMConvertionDenomination") {
                if (resp.result != 'UOM_NOT_EXISTS') {
                    if (CommonMethods.hasValueWithZero(this.index))
                        this.dataSource.data[this.index].denomination = resp.result;
                }
                else {
                    if (CommonMethods.hasValueWithZero(this.index)) {
                        this.dataSource.data[this.index].paramAlies = "";
                        this.dataSource.data[this.index].denomination = 0;
                        this.index = -1;
                    }
                    if (this.fireAtOnce)
                        this._notify.error(ActionMessages.GetMessageByCode(resp.result + '_' + this.entityType));
                    this.fireAtOnce = false;
                }

            }
        })
    }

    changeUOM(row: any) {
        this.index = this.dataSource.data.findIndex(x => (CommonMethods.hasValue(x.packInvID) && x.packInvID == row['packInvID']) || (CommonMethods.hasValue(x.refPackID) && x.refPackID == row['refPackID']));
        var obj: UomDenominationObj = new UomDenominationObj();
        obj.sourceUOM = row['baseUOM'];
        obj.targetUOM = row['paramAlies'];
        obj.materialID = row['materialID'];
        this.fireAtOnce = true;
        this._limsService.getUOMConvertionDenomination(obj);
    }

    hasValue(val) {
        return CommonMethods.hasValue(val) || val == 'N / A';
    }

    controlCol: any = ['isDocSelect', 'uomConvert', 'mngMfgDate', 'mngUserBeforeDate', 'mngGrade', 'mngBlock', 'packQty', 'packBatchNumber', 'isIncludeOtherPlan', 'packIssueQty', 'sdmsDateReceived', 'icon', 'rawDataVerified', 'electronicDataVerified', 'remarks', 'iconInv', 'passOrFail']

    displayControls(item, data) {
        if (item != 'arNumber')
            return this.controlCol.includes(item);
        else if (item == 'arNumber' && data['rptVersionCode'])
            return true;

    }

    packQty(evt) {
        this.onDataChange.emit({ val: true });
    }

    packIssueQty(evt, index) {
        this.dataSource.data[index][this.checkboxField] = true;
        this.onDataChange.emit({ val: true });
    }

    packDetails(encPackID: string, statusCode: string,refPackID : string = '') {
        const modal = this._modal.open(ViewQCInventoryComponent, { width: '80%', disableClose: true });
        modal.componentInstance.encObj = { encInvPackID: encPackID, encInvID: null,refPackID : refPackID };
        // modal.componentInstance.getPackDetails();
        modal.componentInstance.isFrom = "SOL_MNG";
        modal.componentInstance.displayActionField = false;
        modal.componentInstance.solventStatusCode = statusCode;
        modal.afterClosed().subscribe();
    }

    reInitUserActions() {
        this.usrActions = new GridActionFilterBOList();
        if (CommonMethods.hasValue(this.dataSource) && this.dataSource.data.length > 0)
            this.dataSource.data.forEach((obj, index) => { this.checkUserActions(obj, index, "REFRESH") });
    }

    getdiscardPreparationCls(row: any) {
        if (CommonMethods.hasValue(this.removeAction))
            return row.statusCode == 'DISC' && this.removeAction.headerName == 'Solvents'; // ? 'strick' : ''
    }

    getSdmsIDDetails(dataItem: any) {
        this.onActionClick('IND', dataItem);
    }

    getRowClass(data) {
        if (CommonMethods.hasValue(data.updateFlag) && data.updateFlag == 'UPD')
            return "updateFormula";
        else if (this.applyRowCss && data.applyClass)
            return "selectedRow";
    }

    hideStdAvg(columnDef: string, element: any) {

        // (val.columnDef == 'stdAvg' && element['preparationSource'] != 'VOLUMETRIC_SOL' && entityType != 'VOLSOLUTION')

        // console.log(element, element.columnDef, element.columnDef == 'stdAvg' && element['preparationSource'] != 'VOLUMETRIC_SOL');
        var chemical: Array<string> = ['CHEMICALS_ACS_GRADE', 'CHEMICALS_AR_GRADE', 'CHEMICALS_REGULAR', "CHEMICALS_GC_GRADE", "CHEMICALS_HPLC_GRADE", 'CHEMICALS_LR_GRADE']
        if ((columnDef == "purity" || columnDef == "density") && chemical.filter(x => x == element['preparationSource']).length == 0)
            return true;
        else if (columnDef == "wrsPurity" && !CommonMethods.hasValue(element['purityType']))
            return true;

        return columnDef == 'stdAvg' && element['preparationSource'] != 'VOLUMETRIC_SOL';
    }

    getWidthOfCalib() {
        if (localStorage.getItem('activeEntity') == 'QCCALIB')
            return 'qc_calib_menu';

        return "";
    }

    getTooltip(data) {
        var val: string = "";
        if (CommonMethods.hasValue(data.oosNumber))
            val = "OOS Number : " + data.oosNumber + "\n";
        if (CommonMethods.hasValue(data.invalidationCodes))
            val = val + "Invalidation Number(s) : " + data.invalidationCodes;
        return val;
    }

    generateReport(sioID, versionCode) {
        let obj = new ReportBO();

        if (CommonMethods.hasValue(sioID))
            obj.entActID = sioID;
        if (CommonMethods.hasValue(versionCode))
            obj.versionCode = versionCode;

        obj.reportType = 'RPT';

        const modalRef = this._modal.open(ReportView, CommonMethods.modalFullWidth);
        modalRef.componentInstance.rpt = obj;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


    prepareRs232(type: string, code: string, id: string, data: any) {
        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = ConditionCodes.VOLSOL_STD;
        obj.reqCode = this.referenceNumber;

        obj.sourceName = type;
        obj.encEntityActID = data.detailID;

        obj.chemicalName = type;
        obj.batchNumber = this.batchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = code;
        obj.occSource = 'Standardization';
        obj.sectionCode = SectionCodes.VOL_REQ;
        obj.parentID = this.entActID;
        
        return obj;
    }

    getRS232Values(evt: RS232IntegrationModelBO, obj: any, columnDef: string) {
        if (evt)
            obj[columnDef] = evt.keyValue;
    }

    isRs232Enabled: boolean = false;

    checkIsEnableRS232(evt) {
        this.isRs232Enabled = evt;

    }

    // isEdited: boolean = true;

    // isTableEdit() {
    //     this.isEdited = !this.isEdited;
    // }

    // drop(event: CdkDragDrop<string[]>) {
    //     this.headers[event.currentIndex].order = event.previousIndex;
    //     this.headers[event.previousIndex].order = event.currentIndex;

    //     moveItemInArray(this.headers, event.previousIndex, event.currentIndex);
    // }

    // savedHeaders() {
    //     this.isEdited = !this.isEdited;
    // }

}