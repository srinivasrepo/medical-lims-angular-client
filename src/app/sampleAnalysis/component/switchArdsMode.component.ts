import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ActionMessages } from 'src/app/common/services/utilities/constants';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { SwitchArds } from '../model/sampleAnalysisModel';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';

@Component({
    selector: 'switch-mode',
    templateUrl: '../html/switchArdsMode.html'
})

export class SwitchArdsModeComponent {

    subscription: Subscription = new Subscription();
    pageTitle: string = "Switch ARDS Mode";
    analysisModes: any;
    presentArdsMode: string;
    switchObj: SwitchArds = new SwitchArds();

    constructor(private _service: SampleAnalysisService, public _global: GlobalButtonIconsService, private _actModal: MatDialogRef<SwitchArdsModeComponent>,
        private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "ANALYSIS_MODES")
                this.analysisModes = resp.result.filter(x => x.catItemCode != "YES" && x.catItemCode != this.presentArdsMode);
            else if (resp.purpose == "switchARDSMode") {
                if (resp.result.returnFlag == "SUCCESS") {
                    this.switchObj.testInitTime = resp.result.testInitTime;
                    this._alert.success(SampleAnalysisMessages.ardsMode);
                    this.close();
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
        })

        this._service.getCatItemsByCatCode('ANALYSIS_MODES')
    }

    save() {
        if (!CommonMethods.hasValue(this.switchObj.ardsMode))
            return this._alert.warning(SampleAnalysisMessages.ardsAnalysisMode);

        this._service.switchARDSMode(this.switchObj);
    }

    close() {
        this._actModal.close(this.switchObj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}