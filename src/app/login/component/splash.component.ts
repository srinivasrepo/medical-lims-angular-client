import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { LoginService } from '../service/login.service';
import { UserDetails } from '../../common/services/utilities/limsContext';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialog } from '@angular/material';
import { SwitchPlantComponent } from './switchPlant.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { CommonContextService } from "src/app/common/services/commonContext.service";
import { AlertService } from "src/app/common/services/alert.service";

@Component({
    templateUrl: '../html/splash.html'
})

export class SplashComponent extends CommonContextService {

    userName: string;
    lastLoginDate: string;
    loginDetails: UserDetails;
    moduleList: Array<any>;
    isSwitchPlant: boolean = false;

    subscription: Subscription = new Subscription();

    constructor(public _router: Router, private _service: LoginService,
        public _limsContextService: LIMSContextServices, public _global: GlobalButtonIconsService,
        private _matDailog: MatDialog, private _alert: AlertService
    ) {
        super(_router, null)
        this.loginDetails = this._limsContextService.limsContext.userDetails;
    }

    ngOnInit() {
        this.subscription = this._service.loginSubject.subscribe(resp => {
            if (resp.purpose == "auditUnderProcessRecords")
                this.moduleList = resp.result;
        })
        this.loginDetails = this._limsContextService.limsContext.userDetails;
        this._service.auditUnderProcessRecords();
        localStorage.removeItem('conditionID')

        this.isSwitchPlant = (this._limsContextService.limsContext.userDetails.roleType.trim() == "ADMIN" || this._limsContextService.limsContext.userDetails.roleType.trim() == "MEDICAL_LIMS_SITE_ADMIN");
    }

    homePage(entityType: string) {
        if (this.getSplashData(entityType, 'cap')) {
            sessionStorage.setItem("entitytype", entityType);
            this._router.navigateByUrl('/lims/home');
        }
    }

    userDetails() {
        this._router.navigate(['/ViewSDMSDetails']);
    }

    getSplashData(entityType: string, purpose: string) {
        var data = [];

        if (this.moduleList)
            data = this.moduleList.filter(x => x.entityType == entityType);

        if (data && data.length > 0) {
            if (purpose == "Name")
                return data[0].entityName;
            else if (purpose == "count")
                return data[0].auditsCount;
            else if (purpose == "cap")
                return data[0].hasCapable;
            else if (purpose == "progCount")
                return data[0].schedulePrograms;
        }
        else
            return null;

    }

    getNamePrefix(entitytype: string) {
        return entitytype == 'S' ? 'Supplier' : entitytype == 'I' ? 'Internal' : entitytype == 'R' ? 'Regulatory' : entitytype == 'C' ? 'Customer' : entitytype == 'Q' ? 'Quality' : '';
    }

    logout() {
        this._limsContextService.clearSession();
        this.envResetUrls("LOG_OUT", this._alert);
    }

    switchPlant() {
        const _modal = this._matDailog.open(SwitchPlantComponent, CommonMethods.switchPlantModalConfig);
        _modal.afterClosed().subscribe(resp => {
            if (resp) {
                this._router.routeReuseStrategy.shouldReuseRoute = () => false;
                this._router.onSameUrlNavigation = 'reload';
                this._router.navigate(['/splash']);
            }
        })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}