import { Component } from '@angular/core'
import { Subscription } from 'rxjs'
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { MatDialogRef } from '@angular/material';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { GetSamplePacks, SamplePacks, managePack } from '../model/sampleAnalysisModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ButtonActions } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'sample-mng-pack',
    templateUrl: '../html/manageSamplePack.html'
})

export class manageSamplePackComponent {

    subscription: Subscription = new Subscription();
    title: string = PageTitle.containerSelection;
    samplePack: GetSamplePacks;
    materialName: string;
    matCode: string;
    reqQty: string;
    arNumber: string;
    headerData: any;
    dataSource: any;
    samPacks: Array<SamplePacks> = [];
    totalPackQty: number = 0;
    uom: string;
    pageType: string = 'MNG';
    uomList: any;
    uomBtn: string = ButtonActions.btnGo;

    constructor(private _saService: SampleAnalysisService, private _modalClose: MatDialogRef<manageSamplePackComponent>, public _global: GlobalButtonIconsService,
        private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getIssuedContainerDetails") {
                this.uomBtn = ButtonActions.btnChange;
                this.materialName = resp.result.matName;
                this.matCode = resp.result.matCode;
                this.reqQty = resp.result.reqQuantity;
                this.arNumber = resp.result.reqCode;
                this.uom = resp.result.matUom;
                this.samPacks = resp.result.lst
                this.samPacks.forEach(x => {
                    x.uom = resp.result.matUom;
                    x.batchNumber = x.batchNumber + ' (' + this.reqQty + ' ' + this.uom + ')';
                    x.availableQty = x.availableQty + ' ' + x.uom;
                    x.reservedQty = String(x.reserveQty) + ' ' + x.uom;
                    x.packIssueQty = CommonMethods.hasValue(x.packIssueQty) ? x.packIssueQty : null;
                    x.viewPackIssueQty = String(x.packIssueQty) + ' ' + x.uom;
                    x.isSelected = CommonMethods.hasValue(x.packIssueQty);
                })
                this.dataSource = CommonMethods.bindMaterialGridData(this.samPacks);
                this.packQtyChange(true);
            }
            else if (resp.purpose == "manageSamplePacks") {
                if (resp.result == "OK") {
                    this._alert.success(SampleAnalysisMessages.successManagePack);
                    this.close();
                }
            }

        })
        this.prepareHeaders();
        if (CommonMethods.hasValue(this.samplePack.secUomID))
            this.getPacks();
    }

    getPacks() {
        if (!CommonMethods.hasValue(this.samplePack.secUomID))
            return this._alert.warning(SampleAnalysisMessages.uom)
        if (this.uomBtn == ButtonActions.btnChange)
            this.uomBtn = ButtonActions.btnGo;
        else
            this._saService.getIssuedContainerDetails(this.samplePack);
    }

    prepareHeaders() {
        this.headerData = [];
        if (this.pageType == 'MNG')
            this.headerData.push({ columnDef: "isSelected", header: '', cell: (element: any) => `${element.isSelected}` });
        //this.headerData.push({ columnDef: "batchNumber", header: 'Batch Number', cell: (element: any) => `${element.batchNumber}` });
        this.headerData.push({ columnDef: "packNumber", header: 'Pack Number', cell: (element: any) => `${element.packNumber}` });
        this.headerData.push({ columnDef: "availableQty", header: 'Available Qty.', cell: (element: any) => `${element.availableQty}` });
        this.headerData.push({ columnDef: "reservedQty", header: 'Reserved for Others', cell: (element: any) => `${element.reservedQty}` });
        if (this.pageType == 'MNG')
            this.headerData.push({ columnDef: "packIssueQty", header: 'Qty. to Issue', cell: (element: any) => `${element.packIssueQty}` });
        else
            this.headerData.push({ columnDef: "viewPackIssueQty", header: 'Qty. to Issue', cell: (element: any) => `${element.viewPackIssueQty}` });

    }

    packQtyChange(val) {
        this.totalPackQty = 0
        this.dataSource.data.forEach(x => {
            if (CommonMethods.hasValue(x.packIssueQty))
                this.totalPackQty = this.totalPackQty + Number(x.packIssueQty);
        })
    }

    save() {
        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);
        var obj: GetSamplePacks = new GetSamplePacks();
        obj.purposeCode = this.samplePack.purposeCode;
        obj.encSioID = this.samplePack.encSioID;
        obj.secUomID = this.samplePack.secUomID;
        obj.lst = [];
        var data = this.dataSource.data.filter(x => CommonMethods.hasValue(x.isSelected));
        data.forEach(x => {
            var lst: managePack = new managePack();
            lst.entInvID = x.entInvID;
            lst.invPackID = x.invPackID;
            lst.issueQty = x.packIssueQty;
            lst.sealNo = '';
            obj.lst.push(lst);
        })
        this._saService.manageSamplePacks(obj);
    }

    validation() {
        var obj = this.dataSource.data.filter(x => CommonMethods.hasValue(x.isSelected))
        if (obj.length == 0)
            return SampleAnalysisMessages.selectAtOne;
        var data = this.dataSource.data.filter(x => CommonMethods.hasValue(x.isSelected) && !CommonMethods.hasValue(x.packIssueQty))
        if (data.length > 0)
            return SampleAnalysisMessages.validQty + ' ' + data[0].packNumber;
        // if (this.reqQty != String(this.totalPackQty))
        //     return SampleAnalysisMessages.packAndReq;

    }

    close() {
        var obj: any = { uomID: this.samplePack.secUomID, totalQty: this.totalPackQty };
        this._modalClose.close(obj);
    }

    getVal() {
        return CommonMethods.hasValue(this.totalPackQty) ? String(this.totalPackQty) + ' ' + this.uom : 'N / A';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}