import { Component, Input, OnChanges, Output, EventEmitter } from "@angular/core";
import { MatTableDataSource, MAT_MENU_SCROLL_STRATEGY } from '@angular/material';
import { CommonMethods } from '../services/utilities/commonmethods';
import { SelectionModel } from '@angular/cdk/collections';
import { GridActionFilterBO } from 'src/app/limsHelpers/entity/limsGrid';
import { GridActions, EntityCodes } from '../services/utilities/constants';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';
import { Overlay, BlockScrollStrategy } from '@angular/cdk/overlay';

// block the backgroung scroll for mat-menu---------------
export function scrollFactory(overlay: Overlay): () => BlockScrollStrategy {
    return () => overlay.scrollStrategies.block();
}

@Component({
    selector: 'material-grid',
    templateUrl: '../html/materialGrid.html',
    styleUrls: ['../../sampleAnalysis/css/sampleAnalysis.scss'],
    providers: [
        { provide: MAT_MENU_SCROLL_STRATEGY, useFactory: scrollFactory, deps: [Overlay] }
    ]
})

export class MaterialGridComponent {

    selection = new SelectionModel<Element>(true, []);

    @Input() dataSource: any;
    @Input() columns: Array<any> = [];
    @Input() actions: Array<any> = [];
    @Input() isEnableCheckbox: boolean = false;
    @Input() checkboxField: string = 'isSelected';
    @Input() removeAction: any;
    @Input() rowActions: string = 'ANALYSIS';
    @Input() entityCode: string;
    @Input() pageType: string = "MNG";

    @Output() isSelectedCheckBox: EventEmitter<any> = new EventEmitter();
    @Output() onActionClicked: EventEmitter<any> = new EventEmitter();

    actionIcons: Map<string, string> = new Map<string, string>();
    actiontoolTip: Map<string, string> = new Map<string, string>();

    checkboxFields = ['isSelected'];
    displayedColumns: any = [];

    get getAnaColDesign() {
        return localStorage.getItem('DESIGN_COL') == "MNG";
    }

    constructor(public _global: GlobalButtonIconsService) {
        this.actionIcons.set("MNG_OCC", 'library_add');
        this.actionIcons.set("METHOD_RES", 'edit');
        this.actionIcons.set("UPLOAD", "attach_file");
        this.actionIcons.set("RRT", 'speaker_notes');
        this.actionIcons.set("RAW", 'redo');
        this.actionIcons.set("EDIT", "edit");
        this.actionIcons.set("DELETE", "delete_forever");
        this.actionIcons.set("PDF", "picture_as_pdf");
        this.actionIcons.set("SDMS_DATA", 'input')
        this.actionIcons.set("INVALID", 'cancel');
        this.actionIcons.set("CALIB_REPORT", "picture_as_pdf");
        this.actionIcons.set("SEND_FOR_REVIEW", "rate_review");
        this.actionIcons.set("DATAREVIEW_REPORT", "picture_as_pdf");
        this.actionIcons.set("ANALYTICALDATA_REPORT", "picture_as_pdf");
        this.actionIcons.set("SWITCH_STP", "swap_horizontal_circle");


        this.actiontoolTip.set("MNG_OCC", 'Manage Occupancy');
        this.actiontoolTip.set("METHOD_RES", 'Result');
        this.actiontoolTip.set("UPLOAD", "Uploads");
        this.actiontoolTip.set("RRT", 'Manage RRT - Values');
        this.actiontoolTip.set("RAW", 'EARDS');
        this.actiontoolTip.set("EDIT", "Edit");
        this.actiontoolTip.set("DELETE", "Delete");
        this.actiontoolTip.set("PDF", "View Result");
        this.actiontoolTip.set("SDMS_DATA", 'SDMS Data')
        this.actiontoolTip.set("INVALID", "Invalid");
        this.actiontoolTip.set("CALIB_REPORT", "ARDS Report");
        this.actiontoolTip.set("SEND_FOR_REVIEW", "Send For Review");
        this.actiontoolTip.set("DATAREVIEW_REPORT", "Data Review Report");
        this.actiontoolTip.set("ANALYTICALDATA_REPORT", "Analytical Raw Data Review Report");
        this.actiontoolTip.set("SWITCH_STP", "Switch ARDS Mode");

    }

    ngOnChanges() {


        if (localStorage.getItem('GRID_RESET_ACTIONS')) {
            this.usrActions = [];
            localStorage.removeItem('GRID_RESET_ACTIONS');
        }

        if ((this.actions && this.actions.length > 0) && (this.columns && this.columns.length > 0))
            this.displayedColumns = this.columns.map(c => c.columnDef).concat(['actions']);
        else if (this.columns && this.columns.length > 0)
            this.displayedColumns = this.columns.map(c => c.columnDef)
    }

    formatValue(val: any, columnDef: string) {

        if (this.checkboxFields.includes(columnDef))
            return "";
        else if (columnDef == 'passOrFail' && val == 'N')
            return "N / A"
        return CommonMethods.FormatValueString(val);
    }

    changeBgColor(row: any) {
        if (row['rowType']) {
            var val = row['rowType'];
            return val == 'TEST' ? 'test-bgColor' : val == 'SUBCAT' ? 'subcategory-bgColor' : val == 'CAT' ? 'category-bgColor' : "";
        }

    }

    passOrFail(row: any, columnDef: string) {
        if (columnDef == 'testDesc') {
            if (row['passOrFail'] == "P")
                return "testPass";
            else if (row['passOrFail'] == "F")
                return "testFail";
            else
                return "";
        }
        else
            return "";

    }

    manageHideValues(row: any, columnDef: string) {
        if (row['rowType'] != 'TEST' && (columnDef != 'srNum' && columnDef != 'testName')) {
            return false;
        }
        else if ((columnDef == 'passOrFail' && CommonMethods.hasValue(row['passOrFail']) && row['passOrFail'] != 'N') || columnDef == "resultAPP")
            return false;
        else
            return true;

    }

    manageHide(row: any) {


        return (CommonMethods.hasValue(row['passOrFail']) && row['passOrFail'] == 'N')

        // if (row['rowType'] != 'TEST') {
        //     return false;
        // }
        // else if ((CommonMethods.hasValue(row['passOrFail']) && row['passOrFail'] != 'N') || !row['resultAPP'])
        //     return false;
        // else
        //     return true;
    }

    getDisplayIcon(row: any, columnDef: string) {
        if (columnDef == 'passOrFail') {
            return row['passOrFail'] == 'P' ? this._global.icnConfirm : row['passOrFail'] == 'F' ? this._global.icnCancel : null;
        }
    }

    onActionClick(action: any, dataItem: any) {
        // console.log(dataItem);

        this.onActionClicked.emit({ action: action, val: dataItem });
    }

    usrActions: Array<any> = [];

    checkUserActions(dataItem: any, idx: number) {

        if (this.usrActions.filter(x => x.index == idx).length > 0)
            return this.usrActions.filter(x => x.index == idx)[0].data;

        var obj: GridActionFilterBO = new GridActionFilterBO();
        obj.index = idx;

        this.actions.forEach((action, index) => {

            if (CommonMethods.hasValue(this.removeAction)) {
                if ((action == GridActions.Method_Res && (dataItem['rowTypeCode'] == 'TEST' || dataItem['rowTypeCode'] == 'GroupTest'))
                    || ((((action == GridActions.MNG_OCC || action == GridActions.SwitchSTP) && this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation)
                        || action == GridActions.RAW || action == GridActions.sdmsData || action == GridActions.SendForReview)
                        && ((dataItem['rowTypeCode'] == 'TEST' || dataItem['rowTypeCode'] == 'Group'))) || (dataItem[this.removeAction[action]] != this.removeAction[action] && this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation && action == GridActions.Invalid && !dataItem['encInvalidationID'] && (dataItem['rowTypeCode'] == 'TEST' || dataItem['rowTypeCode'] == 'Group')))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if ((this.entityCode == EntityCodes.sampleAnalysis || this.entityCode == EntityCodes.calibrationArds) && ((action == GridActions.DataReview_Report && CommonMethods.hasValue(dataItem.dataReviewID)) || (action == GridActions.AnalyticalData_Report && CommonMethods.hasValue(dataItem.analyticalDataReviewID))) && CommonMethods.hasValue(dataItem['statusCode']) && dataItem['statusCode'] != 'FORRVW')
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (action == GridActions.upload && (dataItem['rowTypeCode'] == 'TEST' || dataItem['rowTypeCode'] == 'Group') && this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation)
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (dataItem[this.removeAction.headerName] == this.removeAction[action] && ((action == GridActions.RRT && this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation && this.entityCode != EntityCodes.calibrationArds && dataItem['isRRT'] == this.removeAction['isRRT']) || (action != GridActions.Invalid && action != GridActions.MNG_OCC && GridActions.SwitchSTP && action != GridActions.RRT && action != GridActions.RAW && action != GridActions.upload && action != GridActions.SendForReview && action != GridActions.DataReview_Report && action != GridActions.AnalyticalData_Report)))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                else if (action == GridActions.Calib_Report && CommonMethods.hasValue(dataItem['templateID']) && (dataItem['ardsMode'] == 'ONLINE' || dataItem['ardsMode'] == 'OFFLINE') && (dataItem['rowTypeCode'] == "Group" || dataItem['rowTypeCode'] == "TEST"))
                    obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
            }
            else
                obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
        })

        this.usrActions.push(obj)
        return (obj.data);
    }



    isShowCheckBox(columnDef: string, row: any) {

        if (row['rowTypeCode'] == 'TEST' || row['rowTypeCode'] == 'Group' || row['rowTypeCode'] == 'GroupTest')
            return this.checkboxFields.includes(columnDef) && this.showCheckBox();


        return false;
    }

    showCheckBox() {
        return (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0);
    }

    selectSingleChk(evt, row) {
        if (evt.checked)
            row[this.checkboxField] = true;
        else
            row[this.checkboxField] = false;

        // this.selection.toggle(row);

        this.isSelectedCheckBox.emit({ checked: evt.checked, selected: "SINGLE" })
    }

    changeBasicStyle(row: any, action: string) {
        if (action == 'RRT')
            return "hide-action";
        else if (row['passOrFail'] != 'N' && ((action == 'UPLOAD' && row['hasDocuments']) || (action == 'METHOD_RES' && row['testDesc']) || (action == 'MNG_OCC' && row['hasOccSubmitted']) || (action == 'RAW' && row['rawdataConfOn'])))
            return "fill-result action-item";
        else if ((action == 'RAW' && row['rawdataUpdOn']))
            return "fill-updatedOn action-item"
        else
            return "action-item";
    }

    isSubmitedData(row: any, action: string) {
        if (row['passOrFail'] != 'N' && ((action == 'UPLOAD' && row['hasDocuments']) || (action == 'METHOD_RES' && row['testDesc']) || (action == 'MNG_OCC' && row['hasOccSubmitted']) || (action == 'RAW' && row['rawdataConfOn'])))
            return true;
        return false;
    }

    displayIcon(data) {
        var obj = data.filter(x => x.code != 'RAW' && x.code != 'UPLOAD' && x.code != 'METHOD_RES' && x.code != 'MNG_OCC')
        return obj.length > 0;
    }

    getIcon(statusCode) {
        return '~/../assets/images/' + statusCode + '.png';
    }

    getIconTooltip(statusCode) {
        if (statusCode == 'FORRVW')
            return 'For Review';
        else if (statusCode == 'UNDER_QC_REVIEW')
            return 'Under QC Review';
        else if (statusCode == 'UNDER_QA_REVIEW')
            return 'Under QA Review';
        else if (statusCode == 'QA_REVIEW_COM')
            return 'QA Review Completed';
        else if (statusCode == 'QC_REVIEW_COM')
            return 'QC Review Completed';
        else if (statusCode == "SENT_BACK_REVIEW")
            return "Sent Back From Data Review";
    }
}
