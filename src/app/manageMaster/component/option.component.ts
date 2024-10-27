import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageMasterService } from '../services/manageMaster.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { Subscription } from 'rxjs';
import { UpdateSysConfiguration } from '../model/mngMaster';
import { AlertService } from 'src/app/common/services/alert.service';
import { MngMasterMessage } from '../model/mngMasterMessage';
import { ActionMessages } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'opt-com',
    templateUrl: '../html/option.html'
})

export class OptionComponent {

    @Input() encConfigID: string;
    @Input() title: string;
    @Input() dataType: string;
    @Input() option: string;

    pageTitle: string;
    optionList: any = [];
    optionObj: UpdateSysConfiguration = new UpdateSysConfiguration();

    subscription: Subscription = new Subscription();

    constructor(private _dialogRef: MatDialogRef<OptionComponent>, private _catService: ManageMasterService,
        public _global: GlobalButtonIconsService, private _alert: AlertService) { }

    ngAfterViewInit() {
        this.subscription = this._catService.mngMasterSubject.subscribe(resp => {
            if (resp.purpose == "updateSysConfiguration") {
                if (resp.result == 'OK') {
                    this._alert.success(MngMasterMessage.sysConfig);
                    this.optionClose(resp.result);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        this.pageTitle = this.title;
        this.listingOption();
    }

    listingOption() {
        if (this.dataType == 'LIST') 
            this.optionList = this.option.split(",")
    }

    saveConfig() {
        this.optionObj.encConfigID = this.encConfigID;
        if (!CommonMethods.hasValue(this.optionObj.configValue))
            return this.dataType == "LIST" ? this._alert.warning(MngMasterMessage.sysConfigValidList) : this._alert.warning(MngMasterMessage.sysConfigValid)
        this._catService.updateSysConfiguration(this.optionObj);
    }

    allowDecimals(event) {
        return CommonMethods.allowNumber(event, '');
    }

    optionClose(val: string = "") {
        this._dialogRef.close(val);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}