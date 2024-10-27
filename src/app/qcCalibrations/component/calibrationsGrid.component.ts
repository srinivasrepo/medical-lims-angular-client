import { Component, Input, Output, EventEmitter } from '@angular/core';
import { GridActionFilterBO } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'app-calib-grid',
    templateUrl: '../html/calibrationsGrid.html'
})
export class CalibrationGridComponent {

    @Input() dataSource: any;
    @Input() columns: Array<any> = [];
    @Input() actions: Array<any> = [];
    @Input() isEnableCheckbox: boolean = false;
    @Input() checkboxField: string = 'isSelected';
    @Input() removeAction: any;
    @Input() actionPage: string;

    @Output() isSelectedCheckBox: EventEmitter<any> = new EventEmitter();
    @Output() onActionClicked: EventEmitter<any> = new EventEmitter();

    actionIcons: Map<string, string> = new Map<string, string>();
    actiontoolTip: Map<string, string> = new Map<string, string>();

    checkboxFields = ['isSelected'];
    displayedColumns: any = [];

    constructor(public _global: GlobalButtonIconsService) {

        this.actionIcons.set("DELETE", "delete_forever");
        this.actionIcons.set("UPLOAD", "attach_file");
        this.actionIcons.set("VIEW", "attach_file");
        this.actionIcons.set("UPLOAD_METHOD", "attach_file");
        this.actionIcons.set("VIEW_METHOD", "attach_file");
        this.actionIcons.set("EDIT", "edit");
        this.actionIcons.set("PDF", "picture_as_pdf");
        this.actionIcons.set("UPD", "edit");

        this.actiontoolTip.set("PDF", "View Result");
        this.actiontoolTip.set("EDIT", "Edit");
        this.actiontoolTip.set("UPLOAD", "Uploads");
        this.actiontoolTip.set("VIEW", "View Files");
        this.actiontoolTip.set("UPLOAD_METHOD", "Upload Method");
        this.actiontoolTip.set("VIEW_METHOD", "View Method");
        this.actiontoolTip.set("DELETE", "Delete");
        this.actiontoolTip.set("UPD", "Update");

    }

    ngOnChanges() {
        if ((this.actions && this.actions.length > 0) && (this.columns && this.columns.length > 0))
            this.displayedColumns = this.columns.map(c => c.columnDef).concat(['actions']);
        else if (this.columns && this.columns.length > 0)
            this.displayedColumns = this.columns.map(c => c.columnDef)
    }

    hideColumns: string[] = ['limitResult', 'isGroupTest'];

    dataValidationsShowHide(columnDef: string, row: any) {
        return (!this.hideColumns.includes(columnDef) || row['limitType'] != 'D');  //( columnDef != 'limitResult' || row['limitType'] != 'D') || columnDef != 'isGroupTest'
    }

    checkfieldExist(row: any, columnDef: string) {
        return this.hideColumns.includes(columnDef) && row[columnDef] == true;
    }

    onActionClick(action: any, dataItem: any) {
        this.onActionClicked.emit({ action: action, val: dataItem });
    }

    usrActions: Array<any> = [];

    checkUserActions(dataItem: any, idx: number, removeAction: string[] = []) {
        if (this.usrActions.filter(x => x.index == idx).length > 0) {

            if (removeAction.length < 1)
                return this.usrActions.filter(x => x.index == idx)[0].data;
            else
                return this.usrActions.filter(x => x.index == idx)[0].data.filter(x => x.code != removeAction[0]);
        }

        var obj: GridActionFilterBO = new GridActionFilterBO();
        obj.index = idx;

        this.actions.forEach((action) => {
            if (CommonMethods.hasValue(this.removeAction)) {
                if (this.removeAction.headerName == "QCCalibrations") {
                    if ((dataItem[this.removeAction.compareField] != "CAT" && dataItem[this.removeAction.compareField] != "SUBCAT") && action == "EDIT")
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                    else if(action != "EDIT")
                        obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
                }
            }
            else
                obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
        })

        this.usrActions.push(obj)
        return (obj.data);
    }

    actionPages: string[] = ['MANAGE_GP_TECH', 'ASSIGN_STP']

    isShowCheckBox(columnDef: string, row: any) {

        if (this.actionPages.includes(this.actionPage)) {
            if ((this.actionPage == 'MANAGE_GP_TECH' && row['rowType'] != 'TEST' || this.actionPage == 'ASSIGN_STP'))
                return this.checkboxFields.includes(columnDef) && this.showCheckBox();

            return false;
        }
        else if (
            (row['rowType'] != 'TEST' && !this.actionPages.includes(this.actionPage))
            ||
            (!this.actionPages.includes(this.actionPage))
        )
            return false;

        return this.checkboxFields.includes(columnDef) && this.showCheckBox()
    }

    showCheckBox() {
        return (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0);
    }

    selectSingleChk(evt, row) {
        if (evt.checked)
            row[this.checkboxField] = true;
        else
            row[this.checkboxField] = false;

        this.isSelectedCheckBox.emit({ checked: evt.checked, selected: "SINGLE" })
    }

    formatValue(val: any, columnDef: string, row: any) {
        if (this.checkboxFields.includes(columnDef) || columnDef == 'isGroupTest')
            return "";
        else if (row['rowType'] && row['rowType'] != 'TEST' && columnDef != 'srNum' && columnDef != 'testNameCode' && columnDef != 'stpTitle')
            return '';

        return CommonMethods.FormatValueString(val);
    }

    changeBasicStyle(row: any, action: string) {
        if (action == 'RRT')
            return "hide-action";
        else if ((action == 'UPLOAD' && row['hasDocuments']) || (action == 'METHOD_RES' && row['testDesc']) || (action == 'MNG_OCC' && row['hasOccSubmitted']) || (action == 'RAW' && row['rawdataConfOn']))
            return "fill-result action-item";
        else if ((action == 'RAW' && row['rawdataUpdOn']))
            return "fill-updatedOn action-item"
        else
            return "action-item";

    }

    changeBgColor(row: any) {
        if (row['rowType']) {
            var val = row['rowType'];
            return val == 'TEST' ? 'test-bgColor' : val == 'SUBCAT' ? 'subcategory-bgColor' : val == 'CAT' ? 'category-bgColor' : "";
        }
    }

    getActiveRowClass(index: any) {
        this.dataSource.data.forEach((item, idx) => {
            var id = document.getElementById('grid-' + idx);
            id.classList.replace("activeRow", "a");
        })

        var id = document.getElementById('grid-' + index);
        id.className += " activeRow";
    }

}