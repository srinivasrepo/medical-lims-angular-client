import { Component } from '@angular/core';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef } from '@angular/material';
import { ButtonActions } from 'src/app/common/services/utilities/constants';
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { GetGroupTest } from '../model/sampleAnalysisModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';

@Component({
    selector: 'ass-test-result',
    templateUrl: '../html/assignTestResult.html'
})

export class assignTestResult {

    pageTitle: string = 'Assign Test Result';
    tests: any;
    specTestID: number;
    resultTo: string = 'F1';
    btnType: string = 'Confirm';
    grpTest: GetGroupTest = new GetGroupTest();
    testType: string;

    subscription: Subscription = new Subscription();
    constructor(public _global: GlobalButtonIconsService, public _activeModal: MatDialogRef<assignTestResult>, public _saService: SampleAnalysisService,
        private _alert: AlertService) { }
    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getTestByCategory") {
                this.tests = resp.result.testList;
                this.specTestID = resp.result.specTestID;
                if (CommonMethods.hasValue(resp.result.formulaResultFlag))
                    this.resultTo = resp.result.formulaResultFlag;
                if (CommonMethods.hasValue(this.specTestID))
                    this.btnType = 'Update';
                this.changeTest();
            }

        })

        this._saService.getTestByCategory(this.grpTest);
    }

    close(val: boolean = false) {
        var result: any = { isSave: val, specTestID: this.specTestID, resultTo: this.resultTo }
        this._activeModal.close(result);
    }

    confirm() {
        if (this.btnType == 'Update')
            return this.btnType = 'Confirm'

        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);
        this.close(true);
    }

    validation() {
        if (!CommonMethods.hasValue(this.specTestID))
            return SampleAnalysisMessages.slctTest;
        if (this.testType == 'R' && !CommonMethods.hasValue(this.resultTo))
            return SampleAnalysisMessages.slctFormula;
    }

    changeTest() {
        if (CommonMethods.hasValue(this.specTestID)) {
            var obj = this.tests.filter(x => x.specTestID == this.specTestID)
            this.testType = obj[0].testType;
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}