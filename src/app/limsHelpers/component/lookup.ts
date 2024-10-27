import { Component, Input, Output, EventEmitter, ViewChild, TemplateRef } from "@angular/core";
import { Subscription } from "rxjs";
import { MatDialog, MatDialogRef } from "@angular/material";
import { LookupInfo, LookUpDisplayField } from '../entity/limsGrid';
import { AlertService } from '../../common/services/alert.service';
import { LimsHelperService } from '../services/limsHelpers.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { CommonMessages } from '../../common/messages/commonMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'lims-lookup',
    templateUrl: '../html/lookup.html'
})

export class LookupComponent {

    @Input() info: LookupInfo;
    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
    dialogRef: MatDialogRef<TemplateRef<any>>
    searchVal: string = '';
    displayTextVal: string = '';
    selectedData: any;
    headerData: any = [];
    dataSource: any;
    subscription: Subscription = new Subscription();
    modalReference = null;
    @Input() disableBtn: boolean = false;
    @Input() isMandatory: boolean;
    @Input() canSelectMultiple: boolean = false;
    @Input() dataList: any = [];
    length: number;
    isLoaderStart: boolean = false;

    constructor(private activeModel: MatDialog, private notify: AlertService,
        private _service: LimsHelperService, public _global: GlobalButtonIconsService) {
        this.subscription = this._service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "lookupData") {
                this.isLoaderStart = false;
                this.length = resp.result.length;
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);
                this.prepareGridHeaders();
            }
        });
    }

    onLookupClick() {
        this.displayTextVal = '';
        this.searchVal = '';
        this.dataSource = CommonMethods.bindMaterialGridData('');
        this.headerData = [];
        this.modalReference = this.activeModel.open(this.modalContent, { width: "80%" });
        this.length = -1;
    }

    onFilterClick() {
        this.isLoaderStart = true;
        this._service.getLookupData(this.info.lookupCode, this.info.condition, this.searchVal, this.info.purposeCode);
    }

    onRowClick(data) {
        if (this.info.displayField == LookUpDisplayField.header)
            this.displayTextVal = data.name;
        else if (this.info.displayField == LookUpDisplayField.code)
            this.displayTextVal = data.code;
        else if (this.info.displayField == LookUpDisplayField.extColumn)
            this.displayTextVal = data.extColumn;
        this.displayTextVal = CommonMethods.FormatValueString(this.displayTextVal);
        this.selectedData = { id: data.id, name: data[this.info.displayField], code: data.code, extColumn: data.extColName };

        this.onSelect.emit({ action: this.info.lookupCode, val: data });
        if (this.canSelectMultiple) {
            var item = this.dataList.filter(e => e.id == data.id)
            if (item.length > 0)
                this.notify.warning(CommonMessages.selectedCodeExists);
            else
                this.dataList.push(data);
        }
        this.modalReference.close();
        //this.modelClose.close();
    }

    setRow(selectedVal: any, selectedText: any) {
        selectedText = CommonMethods.FormatValueString(selectedText);
        this.selectedData = { id: selectedVal, name: selectedText };
        this.displayTextVal = selectedText;
    }

    get selectedId() {
        if (CommonMethods.hasValue(this.selectedData))
            return this.selectedData.id;
        else
            return null;
    }

    get selectedText() {
        return this.displayTextVal;
    }

    get selectedRow() {
        return this.selectedData;
    }

    prepareGridHeaders() {
        this.headerData = [];

        if (this.info.headerID)
            this.headerData.push({ "columnDef": 'extColName', "header": this.info.headerID, cell: (element: any) => `${element.extColName}` });
        // this.headerData.push({ "columnDef": 'id', "header": this.info.headerID, cell: (element: any) => `${element.id}` });

        if (!this.info.hideFstCol)
            this.headerData.push({ "columnDef": 'code', "header": this.info.headerCode, cell: (element: any) => `${element.code}` });
        this.headerData.push({ "columnDef": 'name', "header": this.info.headerName, cell: (element: any) => `${element.name}` });
        if (CommonMethods.hasValue(this.info.extColumnName))
            this.headerData.push({ "columnDef": 'extColName', "header": this.info.extColumnName, cell: (element: any) => `${element.extColName}` });
    }

    clear() {
        this.displayTextVal = "";
        this.selectedData = null;
        this.onSelect.emit({ action: this.info.lookupCode, val: null });
    }


    remove(i) {
        this.dataList.splice(i, 1);
        if (this.dataList.length == 0)
            this.clear();
    }

    ngAfterContentInit() {
        if (this.info == undefined) {
            this.info = new LookupInfo();
            this.info.placeholder = "";
        }
    }

    ngDoCheck() {
        if (this.dataList.length > 0)
            this.displayTextVal = "Something";
    }

    modelclose() {
        this.modalReference.close();
    }

}