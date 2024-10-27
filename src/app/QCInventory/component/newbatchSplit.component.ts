import { Component, OnDestroy, AfterContentInit } from "@angular/core";
import { Subscription } from 'rxjs';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef } from '@angular/material';
import { QCInventoryService } from '../service/QCInventory.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages } from 'src/app/common/services/utilities/constants';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { BatchSplitBO } from '../model/QCInventorymodel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';

@Component({
    selector: 'batch-split',
    templateUrl: '../html/newbatchSplit.html'
})
export class BatchSpitComponent implements AfterContentInit, OnDestroy {

    batchBO: BatchSplitBO = new BatchSplitBO();

    result: any;
    subscription: Subscription = new Subscription();
    type: string = 'MNG';
    isLoaderStart: boolean = false;

    constructor(private _qcService: QCInventoryService, public _global: GlobalButtonIconsService, private _confirm: ConfirmationService,
        private _close: MatDialogRef<BatchSpitComponent>, private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._qcService.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "generateNewBatchSplit") {
                this.isLoaderStart = false;
                if (resp.result.retmsg == "OK") {
                    this._alert.success(QCInvtMessages.newBatchSplt);
                    this.result = resp.result;
                    this.close();
                } else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.retmsg))
            }
        })
    }

    newBatchGenerate() {

        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        this._confirm.confirm(QCInvtMessages.confirmBatchSplit).subscribe(re => {
            if (re){
                this.isLoaderStart = true;
                this._qcService.generateNewBatchSplit(this.batchBO);

            }
        })
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.batchBO.batchQnty))
            return QCInvtMessages.batchqtygiven;
        else if (this.batchBO.batchQnty >= this.batchBO.actualQnty)
            return QCInvtMessages.batchqtygivenGreater;
    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 5);
    }


    close() {
        this._close.close(this.result);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}