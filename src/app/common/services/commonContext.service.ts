import { Injectable, Optional, Self } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { environment } from "src/environments/environment";
import { AlertService } from "./alert.service";
import { CommonMethods } from "./utilities/commonmethods";
import { CustString, ErrorCodes, PageUrls } from "./utilities/constants";

@Injectable()

export class CommonContextService {

    // INVALID_SESSION = "Invalide session details";

    constructor(protected _router: Router, protected snackBar: MatSnackBar) { }

    setUrls() {
        if (environment.production)
            this._router.navigate([PageUrls.clogin]);
        else
            this._router.navigate([PageUrls.login]);
    }

    envResetUrls(errCode: ErrorCodes, _alert: AlertService = null) {

        if (errCode != "LOG_OUT")
            this.snackBar.open(this.getErrorMsg(errCode), "close", CommonMethods.worningConfig);
        else if (_alert)
            _alert.success(this.getErrorMsg(errCode));

        if (environment.production)
            window.location.href = environment.othUrl + "MedicalLIMSLogOut.aspx";
        else
            this._router.navigate([PageUrls.login]);
    }

    getCommonToken(_cookieService: CookieService) {
        var tokenName = environment.userToken + "_medicalLimsToken";
        console.log(tokenName);
        if (environment.production)
        {
            console.log(_cookieService.get(tokenName));
            return "|" + _cookieService.get(tokenName)
        }
        else
            return CustString.Empty;
    }

    navigateMainLogin() {
        window.location.href = environment.othUrl + "MedicalLIMSLogin.aspx";
    }


    private getErrorMsg(errCode: ErrorCodes) {
        switch (errCode) {
            case "USR_UN_AUTH":
                return "Sorry, you are not authorized to access this page";
            case "TOKEN_INVALID":
                return "Sorry, your login token expired. Please login again";
            case "LOG_OUT":
                return "User logout successfully";


            default:
                return errCode;
        }
    }

}

