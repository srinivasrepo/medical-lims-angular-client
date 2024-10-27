import { Injectable } from "@angular/core";
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as AnalysisActions from './analysis.action';
import { AnalysisService } from './analysis.service';

@Injectable()

export class AnalysisEffects {
  constructor(private analysisService: AnalysisService, private actions$: Actions) { }

  @Effect()
  getAnalysisInfo$: Observable<Action> = this.actions$.pipe(
    ofType(AnalysisActions.AnalysisActionTypes.GetAnalysisHeaderInfo),
    mergeMap(action =>
      this.analysisService.getAnalysisInfo(action['encSioID']).pipe(
        map(payload => {
          return (new AnalysisActions.GetAnalysisInfoSuccess(payload));
        }),
        catchError(err => { throw (err); }
        )
      ))
  );

  @Effect()
  getArdsIputsInfo$: Observable<Action> = this.actions$.pipe(
    ofType(AnalysisActions.AnalysisActionTypes.GetArdsinputsInfo),
    mergeMap(action =>
      this.analysisService.getArdsInputsInfo(action['encSamAnaTestID'], action['sourceCode']).pipe(
        map(payload => {
          return (new AnalysisActions.GetArdsInputsInfoSuccess(payload));
        }),
        catchError(err => { throw (err); }
        )
      ))
  );


  // @Effect()
  // updateAnalysisInfo$: Observable<Action> = this.actions$.pipe(
  //   ofType(AnalysisActions.AnalysisActionTypes.UpdateHeaderInfoSuccess),
  //   mergeMap(action =>

  //     this.analysisService.getAnalysisInfo(action['anaData']).pipe(
  //       map(payload => {
  //         return (new AnalysisActions.GetAnalysisInfoSuccess(payload));
  //       }),
  //       catchError(err => { throw (err); }
  //       )
  //     ))
  // );
}