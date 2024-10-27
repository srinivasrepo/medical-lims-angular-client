import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs';
import { LoginService } from '../service/login.service';
import { FormBuilder } from '@angular/forms';
import { CommonLogin } from '../model/login';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { CommonContextService } from 'src/app/common/services/commonContext.service';

@Component({
    template: ` {{msg}}`,
})

export class CommonLoginComponent extends CommonContextService {

    subscription: Subscription = new Subscription();
    userToken: string;
    msg: string = "Processing  ....."
    constructor(private _fb: FormBuilder, public _router: Router,
        private _contextService: LIMSContextServices, private _loginService: LoginService,
        private cookieService: CookieService) {
        super(_router, null)
    }

    ngAfterViewInit() {
        this.subscription = this._loginService.loginSubject.subscribe(resp => {
            if (resp.purpose == "tokenValidate") {
                if (resp.result.returnValue == "SUCCESS") {
                    this._contextService.limsContext.limsToken = resp.result.token;
                    this._contextService.limsContext.userDetails.roleName = resp.result.rolename;
                    this._contextService.limsContext.userDetails.deptName = resp.result.deptName;
                    this._contextService.limsContext.userDetails.plantName = resp.result.plantName;
                    this._contextService.limsContext.userDetails.lastLogin = resp.result.lastLoginDate;
                    this._contextService.limsContext.userDetails.userName = resp.result.name;
                    this._contextService.limsContext.userDetails.shortName = resp.result.shotName;
                    this._contextService.limsContext.capabilities = resp.result.capabilities;
                    this._contextService.limsContext.userDetails.roleType = resp.result.roleType;

                    this._contextService.setSession();
                    this._router.navigateByUrl('/splash');
                }
                else
                    this.envResetUrls("LOG_OUT", null)
            }
        });

        this.login();
    }

    login() {

        // this.userToken = this.getCommonToken(this.cookieService);
        // console.log(this.userToken);
        var tokenName = environment.userToken + "_medicalLimsToken";
        this.userToken = this.cookieService.get(tokenName);

        if (!CommonMethods.hasValue(this.userToken))
        {
            // console.log(this.userToken)
            // console.log(tokenName)
            return this.navigateMainLogin();
        }

        var obj: CommonLogin = new CommonLogin();
        obj.key = this.userToken;
        this._loginService.CommonLogin(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}   