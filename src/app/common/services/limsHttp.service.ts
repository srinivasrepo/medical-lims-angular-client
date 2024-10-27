import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LoaderDetails } from './utilities/commonmethods';

// Training Management Commit test Mahesh

@Injectable()

export class LIMSHttpService {

    observables: Observable<any>;

    constructor(private _http: HttpClient, private ngxLoader: NgxUiLoaderService) { }

    getDataFromService(url: string, headers: HttpHeaders = null, isLocalFileAccessing: boolean = false): Observable<any> {
        LoaderDetails.loaderConfig.overlayColor= "rgba(40,40,40,0)";
        LoaderDetails.loaderConfig.bgsOpacity = 0;
        LoaderDetails.loaderConfig.blur = 0;
        LoaderDetails.loaderConfig.hasProgressBar = true;
        LoaderDetails.loaderConfig.fgsSize = 10;
        LoaderDetails.loaderConfig.fgsColor = "rgba(40,40,40,0)";
        return this._http.get(this.getUrl(isLocalFileAccessing, url), { headers: headers });
    }


    postDataToService(url: string, body: any, headers: HttpHeaders = null): Observable<any> {
        LoaderDetails.loaderConfig.overlayColor= "rgba(40,40,40,0.8)";
        LoaderDetails.loaderConfig.bgsOpacity = 0.5;
        LoaderDetails.loaderConfig.blur = 0;
        LoaderDetails.loaderConfig.hasProgressBar = false;
        LoaderDetails.loaderConfig.fgsSize = 60;
        LoaderDetails.loaderConfig.fgsColor = "#15958a";
        localStorage.setItem('isCommonApi', "No");
        return this._http.post(environment.baseUrl + url, body, { headers: headers });
    }

    updateDataToService(url: string, body: any, headers: HttpHeaders = null): Observable<any> {
        localStorage.setItem('isCommonApi', "No");
        return this._http.put(environment.baseUrl + url, body, { headers: headers })
    }

    deleteDataFromService(url: string, headers: HttpHeaders = null): Observable<any> {
        localStorage.setItem('isCommonApi', "No");
        return this._http.delete(environment.baseUrl + url, { headers: headers });
    }

    changeStatusFromService(url: string, headers: HttpHeaders = null): Observable<any> {
        localStorage.setItem('isCommonApi', "No");
        return this._http.put(environment.baseUrl + url, { headers: headers });
    }

    getDataFromCommonAPIService(url: string, headers: HttpHeaders = null, isLocalFileAccessing: boolean = false): Observable<any> {
        return this._http.get(this.getCommonAPIUrl(isLocalFileAccessing, url), {});
    }

    getUrl(isLocalFileAccessing: boolean, url: string) {
        localStorage.setItem('isCommonApi', "No");
        if (!isLocalFileAccessing) {
            url = environment.baseUrl + url;
        }

        return url;
    }

    getCommonAPIUrl(isLocalFileAccessing: boolean, url: string) {
        localStorage.setItem('isCommonApi', "Yes");
        if (!isLocalFileAccessing) {
            url = environment.commonAPIUrl + url;
        }

        return url;
    }
}