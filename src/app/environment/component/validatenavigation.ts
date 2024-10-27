import { CanActivate, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { CommonContextService } from "src/app/common/services/commonContext.service";
import { MatSnackBar } from "@angular/material/snack-bar";
@Injectable()

export class ValidateNavigationService extends CommonContextService implements CanActivate {

    constructor(private _limsContextService: LIMSContextServices, public _router: Router, public snackBar: MatSnackBar) {
        super(_router, snackBar)
    }

    canActivate() {
        if (this._limsContextService.limsContext.userDetails.userName != null && this._limsContextService.limsContext.userDetails.userName != '')
            return true;
        else {
            this.envResetUrls("TOKEN_INVALID");
            return false;
        }

    }
}