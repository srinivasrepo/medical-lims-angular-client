import { Component, Input } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { ViewQCInvtDetails } from '../model/QCInventorymodel';
import { dateParserFormatter, CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { EntityCodes } from 'src/app/common/services/utilities/constants';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'app-view-head-inv',
    templateUrl: '../html/viewQCInventoryHeaderData.html'
})
export class ViewQCInventoryHeaderDetailsComponent {

    @Input('encInvID') encInvID: string;
    viewQCInvtDetails: ViewQCInvtDetails = new ViewQCInvtDetails();
    isShow: boolean = false;

    subscription: Subscription = new Subscription();

    constructor(private _service: QCInventoryService, public _global: GlobalButtonIconsService, private _modal: MatDialog) { }

    ngAfterContentInit() {
        this.subscription = this._service.QCInventSubject.subscribe(resp => {
            if (resp.purpose == 'viewInvtDetailsByInvID'){
                this.viewQCInvtDetails = resp.result.invViewData;
                if(!CommonMethods.hasValue(this.viewQCInvtDetails.manufacturerName) && this.viewQCInvtDetails.inHouse) {
                    this.viewQCInvtDetails.manufacturerName = "In-House"
                }
            }
        })
    }

    dateFormate(val) {
        return val ? dateParserFormatter.FormatDate(val, 'date') : 'N / A';
    }

    dateTimeFormate(val){
        return val ? dateParserFormatter.FormatDate(val, 'datetime'): 'N / A';
    }

    formatValueString(val: any) {
        return CommonMethods.FormatValueString(val);
    }

    viewFiles() {
        const modal = this._modal.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.qcInventory, 0, 'QC_MNG_PAC', this.encInvID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW'
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}   