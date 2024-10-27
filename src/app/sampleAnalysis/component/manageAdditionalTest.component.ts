import { Component, ViewChild } from '@angular/core'
import { Subscription } from 'rxjs'
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, GridActions, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { MngAdditionTest } from '../model/sampleAnalysisModel';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';

@Component({
    selector: 'addit-tests',
    templateUrl: '../html/manageAdditionalTests.html'
})

export class ManageAdditionalTestComponent {
    subscription: Subscription = new Subscription();
    specLimit: string;
    result: string;
    testInfo: LookupInfo;
    encSamAnaID: string;
    headersData: any;
    dataSource: any;
    actions: any = [GridActions.delete];
    @ViewChild('tests', { static: true }) tests: LookupComponent;
    pageType: string = 'MNG';
    entityCode: string;

    constructor(private _closeModal: MatDialogRef<ManageAdditionalTestComponent>, public _global: GlobalButtonIconsService, private _service: SampleAnalysisService,
        private _alert: AlertService, private _confirmationService: ConfirmationService) { }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getAdditionalTest")
                this.bindGrid(resp.result);
            else if (resp.purpose == 'manageAdditionalTest') {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.succTest)
                    this.bindGrid(resp.result.lst)
                    this.tests.clear();
                    this.specLimit = this.result = "";
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag + '_ADD'))
            }

            else if (resp.purpose == 'deleteAdditionalTest') {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.succDelete)
                    this.bindGrid(resp.result.lst)
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag + '_DELETE'))
            }

        })

        this.prepareHeaders();
        this.getAdditionalTest();

        this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getAdditionalTest, LKPDisplayNames.test, LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.test, '', "", "LIMS");
        if (this.pageType != 'MNG')
            this.actions = [];
    }

    getAdditionalTest() {
        var obj: any = {};
        obj.entityCode = this.entityCode;
        obj.encSamAnaID = this.encSamAnaID;
        this._service.getAdditionalTest(obj);
    }

    bindGrid(obj) {
        this.dataSource = CommonMethods.bindMaterialGridData(obj);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'testTitle', "header": "Test Title", cell: (element: any) => `${element.testTitle}` });
        this.headersData.push({ "columnDef": 'specLimit', "header": "Specification Limit", cell: (element: any) => `${element.specLimit}` });
        this.headersData.push({ "columnDef": 'result', "header": "Result", cell: (element: any) => `${element.result}` });
    }

    addTest() {
        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        var obj: MngAdditionTest = new MngAdditionTest();
        obj.encSamAnaID = this.encSamAnaID;
        obj.testID = this.tests.selectedId;
        obj.specLimit = this.specLimit;
        obj.result = this.result;

        this._service.manageAdditionalTest(obj);
    }

    validation() {
        if (!CommonMethods.hasValue(this.tests.selectedId))
            return SampleAnalysisMessages.test;
        if (!CommonMethods.hasValue(this.specLimit))
            return SampleAnalysisMessages.specimit
        if (!CommonMethods.hasValue(this.result))
            return SampleAnalysisMessages.addResult;
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.delete)
            this._confirmationService.confirm(LimsRespMessages.delete).subscribe(res => {
                if (res)
                    this._service.deleteAdditionalTest(evt.val.additionalTestID);
            })
    }

    close() {
        this._closeModal.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}