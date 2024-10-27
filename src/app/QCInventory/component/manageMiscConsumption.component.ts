import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef } from '@angular/material';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { MiscConsumption } from '../model/QCInventorymodel';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { UomDenominationObj } from 'src/app/limsHelpers/entity/limsGrid';

@Component({
    selector: 'misc-consu',
    templateUrl: '../html/manageMiscConsumption.html'
})

export class ManageMiscConsumptionComponent {

    subscription: Subscription = new Subscription();
    title: string = "Manage Miscellaneous Consumption";
    quantity: number;
    remarks: string;
    saveBtn: string = ButtonActions.btnSave;
    uomList: any;
    uom: string;
    baseUom: string;
    packUom: string;
    packInvID: number;
    packDetails: any;
    dataSource: any;
    headers: any;
    convertionFactor: string;
    isChange: boolean = false;
    isLoaderStart : boolean = false;

    constructor(private _qcService: QCInventoryService, public _global: GlobalButtonIconsService, private _modal: MatDialogRef<ManageMiscConsumptionComponent>,
        private _alert: AlertService, private _confirmService: ConfirmationService) { }

    ngAfterContentInit() {
        this.subscription = this._qcService.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialUOMConvertions")
                this.uomList = resp.result;
            else if (resp.purpose == "getMiscConsumptionDetails") {
                this.packDetails = resp.result;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'actionOn'));
            }
            else if (resp.purpose == "manageMiscConsumptionData") {
                this.isLoaderStart = false;
                if (resp.result == 'OK') {
                    this._alert.success(QCInvtMessages.succMisc);
                    this._qcService.getMiscConsumptionDetails(this.packInvID);
                    this.quantity = null;
                    this.uom = this.remarks = "";
                    this.isChange = true;
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "getUOMConvertionDenomination") {
                if (resp.result != 'UOM_NOT_EXISTS')
                    this.convertionFactor = resp.result;
                else {
                    this.uom = "";
                    this.quantity = null;
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
                }
            }

        });
        this.prepareHeaders();
        this._qcService.getMiscConsumptionDetails(this.packInvID);
        this._qcService.getMaterialUOMConvertions(this.baseUom);
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ columnDef: 'qty', header: 'Quantity', cell: (element: any) => `${element.quantity}` });
        this.headers.push({ columnDef: 'actionBy', header: 'Action By', cell: (element: any) => `${element.actionBy}` });
        this.headers.push({ columnDef: 'actionOn', header: 'Action On', cell: (element: any) => `${element.actionOn}` });
        this.headers.push({ columnDef: 'miscRemarks', header: 'Remarks', cell: (element: any) => `${element.remarks}` });
    }

    changeUOM() {
        var obj: UomDenominationObj = new UomDenominationObj();
        obj.sourceUOM = this.baseUom;
        obj.targetUOM = this.uom;
        obj.materialID = this.packDetails.matID;
        this.convertionFactor = "";
        this._qcService.getUOMConvertionDenomination(obj);
    }

    close() {
        this._modal.close(this.isChange);
    }

    save() {

        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);
        var obj: MiscConsumption = new MiscConsumption();
        obj.packInvID = this.packInvID;
        obj.qty = this.quantity;
        obj.uom = this.uom;
        obj.Remarks = this.remarks;
        this._confirmService.confirm(QCInvtMessages.confim).subscribe(res => {
            if (res){
                this.isLoaderStart = true;
                this._qcService.manageMiscConsumptionData(obj);

            }
        })
    }

    validation() {
        if (!CommonMethods.hasValue(this.quantity))
            return QCInvtMessages.quantityMsg;
        if (!CommonMethods.hasValue(this.uom))
            return QCInvtMessages.uom;
    }

    allowDecimals(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 10);
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}