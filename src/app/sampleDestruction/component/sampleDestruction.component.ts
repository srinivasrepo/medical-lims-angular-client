import { Component } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, ActionMessages } from 'src/app/common/services/utilities/constants';
import { MatTableDataSource } from '@angular/material';
import { Subscription } from 'rxjs';
import { SampleDestructionService } from '../service/sampleDestruction.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { SaveSampleDestruction, GetSampleDestruction, SavePackBO } from '../model/sampleDestructionModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleDestructionMessages } from '../messages/sampleDestructionMessages';

@Component({
    selector: 'sample-destruction',
    templateUrl: '../html/sampleDestruction.html'
})

export class SampleDestructionComponent {

    pageTitle: string = PageTitle.sampleDestruction;
    backUrl: string = PageUrls.searchQcInvtUrl;
    dataSource: any=[];
    headers: Array<any> = [];
    isParentCheckBoxVisible: boolean = true;
    remarks: string;
    getDestructionObj: GetSampleDestruction = new GetSampleDestruction();
    saveDestructionObj: SaveSampleDestruction = new SaveSampleDestruction();
    activeRows: number = 0;

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean;

    constructor(private _samDestrServ: SampleDestructionService, public _globalBtn: GlobalButtonIconsService,
        private _notify: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._samDestrServ.sampleDestructionSubject.subscribe(resp => {
            if (resp.purpose == 'getSamplePackDestruction') 
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result, "arrayDateFormat", 'useBeforeDate'));
            
            else if (resp.purpose == 'saveSamplePackDestruction') {
                this.isLoaderStart = false;
                if (resp.result.retcode == 'OK') {
                    this._notify.success(SampleDestructionMessages.saveSampleDestruction);
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.getResultPacksForDestruction, "arrayDateFormat", 'useBeforeDate'));
                    this.activeRows = 0;
                    this.saveDestructionObj = new SaveSampleDestruction();
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result.retcode));
            }
        });

        this.prepareHeaders();
        this.getDestructionObj = JSON.parse(sessionStorage.getItem('DESTRUCTION'));

        if (!this.getDestructionObj)
            this.getDestructionObj = new GetSampleDestruction();

        this._samDestrServ.getSamplePackDestructionDetails(this.getDestructionObj);
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
        this.headers.push({ "columnDef": 'matFormatt', "header": "Chemical/Solution Name", cell: (element: any) => `${element.matFormatt}`, width: 'maxWidth-23per' })
        this.headers.push({ "columnDef": 'refNumber', "header": "System Code", cell: (element: any) => `${element.refNumber}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'batchNumber', "header": " Batch (Pack No.)", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'remQtyUom', "header": "Balance Quantity", cell: (element: any) => `${element.remQtyUom}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'useBeforeDate', "header": "Use Before Date", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-11per' })
    }

    isSelectedCheckBox(evt) {
        if (evt.checked)
            this.activeRows = this.activeRows + 1;
        else
            this.activeRows = this.activeRows - 1;

        if (evt.selected == 'ALL') {
            if (evt.checked)
                this.activeRows = this.dataSource.data.filter(x => x.isSelected == true).length;
            else
                this.activeRows = 0;
        }
    }

    validate() {
        if (CommonMethods.hasValue(this.dataSource.data.length==0))
            return SampleDestructionMessages.noData;
        if (!CommonMethods.hasValue(this.activeRows))
            return SampleDestructionMessages.notSelectSample;
        if (!CommonMethods.hasValue(this.saveDestructionObj.remarks))
            return SampleDestructionMessages.remarksEmpty;
    }

    sampDestrSave() {
        var errmsg = this.validate();
        if (CommonMethods.hasValue(errmsg))
            return this._notify.warning(errmsg);

        this.saveDestructionObj.list = []; 

        this.dataSource.data.filter(x => x.isSelected == true).forEach(item => {
            var savePack: SavePackBO = new SavePackBO();
            savePack.sourceActualID = item.packInvID;
            savePack.matID = item.matID;
            savePack.destructionQuantity = item.remQtyUom;
            savePack.batchNumber = item.batchNumber;
            savePack.sourceReferenceNumber = item.refNumber;
            this.saveDestructionObj.list.push(savePack);
        });

        this.isLoaderStart = true;
        this._samDestrServ.savePackDestructionDetails(this.saveDestructionObj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        sessionStorage.removeItem('DESTRUCTION');
    }

}



