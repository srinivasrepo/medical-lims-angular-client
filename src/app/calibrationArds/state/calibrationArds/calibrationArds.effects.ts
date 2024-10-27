import { Injectable } from "@angular/core";
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import * as CalibrationArdsActions from './calibrationArds.action';
import { CalibArdsService } from './calibrationArds.service';


@Injectable()

export class CalibrationArdsEffects {
  constructor(private clibArdsService: CalibArdsService, private actions$: Actions) { }

  @Effect()
  GetCalibrationArdsHeaderInfo$: Observable<Action> = this.actions$.pipe(
    ofType(CalibrationArdsActions.CalibrationArdsActionTypes.GetCalibrationArdsHeaderInfo),
    mergeMap(action =>
      this.clibArdsService.GetCalibrationArdsHeaderInfo(action['encID']).pipe(
        map(payload => {
          return (new CalibrationArdsActions.GetCalibrationArdsInfoSuccess(payload));
        }),
        catchError(err => { throw (err); }
        )
      ))
  );
}