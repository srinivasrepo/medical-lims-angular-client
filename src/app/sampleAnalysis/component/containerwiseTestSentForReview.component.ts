import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';

@Component({
    selector: 'cont_test_rev',
    templateUrl: '../html/containerwiseTestSendForreview.html'
})

export class ContainerwiseTestSendForReview {

    encSioID: string;
    specCatID: number;
    testName: string;
    dataSource: any;
    headerData: any;
    pageTitle: string = "Send For Review";

    subscription: Subscription = new Subscription

    constructor(private _service: SampleAnalysisService, public _global: GlobalButtonIconsService, private _actModal: MatDialogRef<ContainerwiseTestSendForReview>,
        private _alert: AlertService, private _confirService: ConfirmationService) { }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getPackTestsForSendToReview") {
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);
            }
        });
        this.prepareHeader();
        this._service.getPackTestsForSendToReview(this.encSioID, this.specCatID);
    }

    prepareHeader() {
        this.headerData = [];
        this.headerData.push({ columnDef: "isSelected", header: "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-10per" });
        this.headerData.push({ columnDef: "packNumber", header: "Pack Number", cell: (element: any) => `${element.packNumber}`, });

    }

    close() {
        this._actModal.close(null);
    }

    sendForReview() {
        var err = this.validation();
        if (CommonMethods.hasValue(err))
           return this._alert.warning(err);
        this._confirService.confirm(SampleAnalysisMessages.cnfmSendForReview).subscribe(re => {
            if (re) {
                var obj = this.dataSource.data.filter(x => x.isSelected)
                this._actModal.close(obj);
            }
        })
    }

    validation() {
        var obj = this.dataSource.data.filter(x => x.isSelected)
        if (!CommonMethods.hasValue(obj) || obj.length == 0)
            return SampleAnalysisMessages.slctPack;
    }

    ngOnDestory() {
        this.subscription.unsubscribe()
    }
}