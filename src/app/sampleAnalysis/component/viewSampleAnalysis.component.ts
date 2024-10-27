import { Component } from '@angular/core';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { AnalysisHeaderBO } from '../model/sampleAnalysisModel';

@Component({
    selector: 'view-sam-anly',
    templateUrl: '../html/viewSampleAnalysis.html'
})

export class ViewSampleAnalysisComponent {

    encSioID: string;
    sampleMode: string;

    pageTitle: string = PageTitle.viewSampleAnalysis;

    subscription: Subscription = new Subscription();
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    getArdsInputsInfo: any;


    constructor(private _saService: SampleAnalysisService, private _actRoute: ActivatedRoute, private store: Store<fromAnalysisOptions.AnalysisState>) { }


    ngOnInit() {

        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                this.headerInfo = analysis;
            });

        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo
            });
    }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encSioID = param['id']);

        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            // if (resp.purpose == 'getAnalysisHeaderInfo')
            //     this.sampleMode = resp.result.sampleMode;
        });

        // this._saService.getAnalysisHeaderInfo(this.encSioID);
        this.store.dispatch(new analysisActions.GetAnalysisInfo(this.encSioID));

    }

    ngOnDestroy() {
        this.store.dispatch(new analysisActions.DestoryAnalysisInfo());
        this.subscription.unsubscribe();
    }
}