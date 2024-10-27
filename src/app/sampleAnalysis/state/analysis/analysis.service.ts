import { Injectable } from "@angular/core";
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { Observable, throwError } from 'rxjs';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { catchError } from 'rxjs/operators';
import { SampleAnalysisServiceUrl } from '../../service/sampleAnalysisServiceUrl';

@Injectable({
  providedIn: 'root',
})

export class AnalysisService {
  constructor(private _limsHttpService: LIMSHttpService) { }

  getAnalysisInfo(encSioID: string): Observable<any> {
    return this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisHeaderInfo, [encSioID])).
      pipe(catchError(this.handleError));
    // debugger
    // const requestUrl = '/api/physicians';
    // return this.http.get(requestUrl).pipe(catchError(this.handleError));
  }

  getArdsInputsInfo(encSamAnaTestID: string, sourceCode: string): Observable<any> {
    return this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getArdsInputsBySamAnaID, [encSamAnaTestID, sourceCode])).
      pipe(catchError(this.handleError));
    // debugger
    // const requestUrl = '/api/physicians';
    // return this.http.get(requestUrl).pipe(catchError(this.handleError));
  }

  private handleError(err) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}