import { Component, Input } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { QCInventoryService } from '../service/QCInventory.service';
import { Subscription } from 'rxjs';
import { Validity, OpenPackDetails } from '../model/QCInventorymodel';
import { AlertService } from 'src/app/common/services/alert.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ActionMessages } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'open-pack',
    templateUrl: '../html/openPack.html'
})

export class OpenPackComponent {

    @Input() packInvID: number;
    @Input() packNo: string;
    subCategoryCode: string; 
    pageTitle: string = PageTitle.openPack;
    validityList: Array<Validity> = [];
    categoryCode: string;
    openPackObj: OpenPackDetails = new OpenPackDetails();
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;

    constructor(private _qcInvetServ: QCInventoryService, private _alertService: AlertService,
        private _conformationService: ConfirmationService, private _dialogRef: MatDialogRef<OpenPackComponent>,
        public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this._qcInvetServ.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "getValidityPeriods")
                this.validityList = resp.result;
            else if (resp.purpose == "openPack") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alertService.success(QCInvtMessages.manageOpenPack);
                    this.openPackClose("OK");
                }
                else
                    this._alertService.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        
        this._qcInvetServ.getValidityPeriods("QC_INV");
    }

    openPack() {
        var errMsg = this.formData();
        if (CommonMethods.hasValue(errMsg))
            return this._alertService.warning(errMsg);

        this._conformationService.confirm(QCInvtMessages.openPackConfirm).subscribe((confirmed) => {
            if (confirmed) {
                this.openPackObj.packInvID = this.packInvID;
                this.openPackObj.packNo = this.packNo;

                this.isLoaderStart = true;
                this._qcInvetServ.openPack(this.openPackObj);
            }
        })
        return;
    }

    formData() {
        if (!CommonMethods.hasValue(this.packNo))
            return QCInvtMessages.packNo;
        else if (!CommonMethods.hasValue(this.openPackObj.validityPeriodID) && this.categoryCode != 'WATER_MAT'
            && this.subCategoryCode != "STANDARDS" )
            return QCInvtMessages.validity;
        else if (!CommonMethods.hasValue(this.openPackObj.statusCode) && this.categoryCode != 'WATER_MAT')
            return QCInvtMessages.status;
        else if (!CommonMethods.hasValue(this.openPackObj.remarks))
            return QCInvtMessages.remarks;
        else if (this.openPackObj.remarks.length < 6)
            return QCInvtMessages.remarksLen;
    }

    openPackClose(val: string = "") {
        this._dialogRef.close(val);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}