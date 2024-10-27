import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators'
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from '@angular/material';
import { LIMSContextServices } from './limsContext.service';
import { CommonMethods, LoaderDetails } from './utilities/commonmethods';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CommonContextService } from './commonContext.service';

// Vinesh
@Injectable()

export class LIMSHttpInterceptor extends CommonContextService implements HttpInterceptor {

    constructor(private _limsContextService: LIMSContextServices,
        private cookieService: CookieService, public snackBar: MatSnackBar, public router: Router, private ngxLoader: NgxUiLoaderService) {
        super(router, snackBar);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.loaderBehaviour(true);
        if (localStorage.getItem('isCommonApi') != 'Yes') {

            request = request.clone({
                setHeaders: {
                    "LIMSToken": this._limsContextService.limsContext.limsToken + this.getCommonToken(this.cookieService)
                }
            });
        }

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse)
                    this.loaderBehaviour(false);

                return event;
            }),
            catchError((error) => {
                this.handleAuthError(error);
                return of(error);
            }) as any);
        //return next.handle(request);
    }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        if (err.status === 401 || err.status === 400) {
            this._limsContextService.clearSession();
            // if (err.status == 401)
            //     this.snackBar.open("Invalide session details", "close", CommonMethods.worningConfig);
            //  window.location.href = environment.othUrl + "MedicalLIMSLogOut.aspx";
            // this.router.navigate(['/login']);

            if (Object.keys(err.error).filter(x => x == "message").length > 0)
                this.envResetUrls(err.error.message);
            else
                this.envResetUrls(err.error);

            return of(err.message);
        }

        this.loaderBehaviour(false);
    }

    loaderBehaviour(isLoad: boolean = false) {
        var isloaded: any;

        // setTimeout(() => {
        //     isloaded = document.getElementsByTagName('ngx-ui-loader')[0].children[0].className.indexOf('loading-foreground') > -1; //['children']//.classList;//.contains('loading-foreground') > -1;

        //     if (isLoad && !isloaded)
        //         this.ngxLoader.startLoader(LoaderDetails.loaderName); // start loader
        //     else
        //         this.ngxLoader.stopLoader(LoaderDetails.loaderName); // stop Loader

        // }, 100);

        // if (isLoad)
        //     this.ngxLoader.startLoader(LoaderDetails.loaderName); // start loader
        // else
        //     this.ngxLoader.stopLoader(LoaderDetails.loaderName); // stop Loader
    }
}