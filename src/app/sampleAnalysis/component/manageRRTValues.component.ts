import { Component, OnDestroy, AfterContentInit } from "@angular/core";
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { ManageTestSampleRRTValuesBO } from '../model/sampleAnalysisModel';
import { GridActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { dateParserFormatter, CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { MatDialogRef } from '@angular/material';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';

@Component({
    selector: 'app-analysis-rrt',
    templateUrl: '../html/manageRRTValues.html'
})
export class ManageRRTValuesComponent implements AfterContentInit, OnDestroy {

    manageRRTValuesBO: ManageTestSampleRRTValuesBO = new ManageTestSampleRRTValuesBO();
    mode: string = 'MNG';
    title: string = "Manage RRT Values"
    headersData: any;
    extraColumns: any;
    dataSource: any;
    actions: Array<string> = [GridActions.delete]

    subscription: Subscription = new Subscription();

    constructor(private _service: SampleAnalysisService, public _global: GlobalButtonIconsService,
        private _alert: AlertService, private _matDailogRef: MatDialogRef<ManageRRTValuesComponent>,
        private _confirm: ConfirmationService, private _store: Store<fromAnalysisOptions.AnalysisState>
    ) { }

    ngAfterContentInit() {

        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "manageTestSampleRRTValues") {
                if (this.manageRRTValuesBO.type == 'G' || resp.result.trn.returnFlag == 'OK') {
                    if (this.manageRRTValuesBO.type == 'I') {
                        this.clear();
                        this._alert.success(SampleAnalysisMessages.rrtValuesSaved);
                    }
                    else if (this.manageRRTValuesBO.type == 'D')
                        this._alert.success(SampleAnalysisMessages.rrtValuesDeleted);


                    if (this.manageRRTValuesBO.type != 'G') {

                        this._store
                            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
                            .subscribe(testInfo => {

                                // Update Test Init Time

                                var obj: any = testInfo.filter(x => x.samAnaTestID == this.manageRRTValuesBO.encSamTestID);
                                if (obj.length > 0) {
                                    obj[0].testInitTime = resp.result.trn.initTime;
                                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(testInfo));
                                }
                                this.manageRRTValuesBO.initTime = resp.result.trn.initTime;
                            });
                    }
                    this.manageRRTValuesBO.encRRtID = null;
                    this.prepareHeaders();
                    this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'createdOn'));
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.trn.returnFlag));

            }
        })

        this.manageRRTValues('G');

        if (this.mode != 'MNG'){
            this.actions = [];
            this.title = "View RRT Values"
        }
    }

    prepareHeaders() {
        this.headersData = [];

        this.headersData.push({ columnDef: "testDesc", header: "Test Description", cell: (element: any) => `${element.testDesc}`, width: 'minWidth-30per'  });
        this.headersData.push({ columnDef: "result", header: "Result", cell: (element: any) => `${element.result}`, width: 'maxWidth-35per' });
        this.headersData.push({ columnDef: "createdBy", header: "Created By", cell: (element: any) => `${element.createdBy}`, width: 'maxWidth-15per' });

        this.extraColumns = [];
        this.extraColumns.push({ columnDef: "acceptanceCriteria", header: "Acceptance Criteria", cell: (element: any) => `${element.acceptanceCriteria}` });

    }

    onActionClicked(evt: any) {
        if (evt.action == 'DELETE') {
            this.manageRRTValuesBO.encRRtID = evt.val.encRRTID;
            this.manageRRTValues('D');
        }
    }

    manageRRTValues(type: string) {

        if (type == 'I') {
            var retVal = this.validateControls();
            if (CommonMethods.hasValue(retVal))
                return this._alert.warning(retVal);
        }
        else if (type == 'D') {
            this._confirm.confirm(SampleAnalysisMessages.deleteConfirmRRT).subscribe(resp => {
                if (resp)
                    this.manageTestSamRRT(type);
            })
        }

        if (type == 'D')
            return;

        this.manageTestSamRRT(type);
    }

    manageTestSamRRT(type: string) {
        this.manageRRTValuesBO.type = type;
        this._service.manageTestSampleRRTValues(this.manageRRTValuesBO);
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.manageRRTValuesBO.testDesc))
            return SampleAnalysisMessages.testDesc;
        else if (!CommonMethods.hasValue(this.manageRRTValuesBO.acceptenceCriteria))
            return SampleAnalysisMessages.accptanceCriteria;
        else if (!CommonMethods.hasValue(this.manageRRTValuesBO.result))
            return SampleAnalysisMessages.resultRRT;
    }

    close() {
        this._matDailogRef.close();
    }

    clear() {
        this.manageRRTValuesBO.acceptenceCriteria = this.manageRRTValuesBO.result = this.manageRRTValuesBO.testDesc = null
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}