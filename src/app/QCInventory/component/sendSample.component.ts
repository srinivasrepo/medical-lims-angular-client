import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AlertService } from 'src/app/common/services/alert.service';
import { QCInventoryService } from '../service/QCInventory.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { QCInvtMessages } from '../messages/QCInvtMessages';

@Component({
    selector: 'app-send-sample',
    templateUrl: '../html/sendSample.html'
})

export class SendSampleComponent {

    pageTitle: string = PageTitle.sendSample;
    disableBtn : boolean;
    sendSampleInfo: LookupInfo;
    @ViewChild('sendSample', { static: true }) sendSample: LookupComponent;
    
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;
    
    constructor(private _qcinvtServ: QCInventoryService, private _alertService: AlertService,
        public _global: GlobalButtonIconsService,private _modelRef : MatDialogRef<SendSampleComponent>) { }

    ngOnInit() { 
        this.subscription = this._qcinvtServ.QCInventSubject.subscribe(resp => {
            if(resp.purpose == "sendBatchForSample"){
                // this.disableBtn = false;
                this.isLoaderStart = false;
                if(resp.result == "OK"){
                    this._alertService.success(QCInvtMessages.sendSampleSuccess);
                    this.sendSample.clear();
                }
                else
                    this._alertService.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        this.prepareLkp();
    }

    prepareLkp(){
        this.sendSampleInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber,LookupCodes.getBatchesForSendSample,LKPDisplayNames.material,
            LKPDisplayNames.batchNum,LookUpDisplayField.code, LKPPlaceholders.BatchNumber);
    }

    go(){
        if(!CommonMethods.hasValue(this.sendSample.selectedId))
            return this._alertService.warning(QCInvtMessages.sendSample);
        
        // this.disableBtn = true;
        this.isLoaderStart = true;
        this._qcinvtServ.sendBatchForSample(this.sendSample.selectedId);
    }

    close(){
        this._modelRef.close();
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}