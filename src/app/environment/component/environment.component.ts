import { Component, ViewChild, ElementRef } from '@angular/core'
import { Event, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EnvironmentService } from '../service/environment.service';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { NavService } from '../service/nav.service';
import { MatDialog } from '@angular/material';
import { ActionMessages, NavigateToSchedulePage } from '../../common/services/utilities/constants';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { CommonMessages } from 'src/app/common/messages/commonMessages';
import { environment } from 'src/environments/environment';
import { CommonContextService } from 'src/app/common/services/commonContext.service';

@Component({
    templateUrl: '../html/environment.html'
})

export class EnvironmentComponent extends CommonContextService {
    moduleList: any = []
    entityTypes: any = []
    subscription: Subscription = new Subscription();
    userName: string = "";
    lastAccessDate: string = "";
    role: string = "";
    shortName: string = "";
    deptName: string = "";
    plantName: string = "";
    // contentMargin = 70;
    // isMenuOpen : boolean;
    @ViewChild('appDrawer', { static: true }) appDrawer: ElementRef;
    config: CommonMethods = new CommonMethods();
    @ViewChild('sidenav', { static: true }) slidenav;
    isShow: boolean = true;
    notificationCount: number = 0;
    activeType: string;
    newReqList: any = [];
    childList: any;
    disableSyncBtn: boolean = false;
    loading: boolean = false;
    appVersion: string = environment.appVersion;

    constructor(public _limsContextService: LIMSContextServices, public _router: Router, private _alert: AlertService,
        private _limstitle: LIMSContextServices, private _envronmentService: EnvironmentService,
        public navService: NavService, public _global: GlobalButtonIconsService) {
        super(_router, null)
        _limstitle.pageTitle = PageTitle.environment;
        _limstitle.status = "";
        _limstitle.refNo = "";

        this._router.events.subscribe((event: Event) => {
            switch (true) {
                case event instanceof NavigationStart: {
                    this.loading = true;
                    break;
                }

                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    this.loading = false;
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    ngAfterContentInit() {
        this.subscription = this._envronmentService.environmentSubject.subscribe(resp => {
            if (resp.purpose == "moduleList") {
                this.moduleList = resp.result.mainList;
                this.newReqList = resp.result.newReqList;
                this.childList = resp.result.childs;
            }
            else if (resp.purpose == "getReportsInfoForSyncToDMS") {
                this.disableSyncBtn = false;
                if (resp.result == "SUCCESS")
                    this._alert.success(CommonMessages.syncSucc);
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        });

        this.bindData();
        this.userName = this._limsContextService.limsContext.userDetails.userName;
        this.role = this._limsContextService.limsContext.userDetails.roleName;
        this.shortName = this._limsContextService.limsContext.userDetails.shortName;
        this.deptName = this._limsContextService.limsContext.userDetails.deptName;
        this.plantName = this._limsContextService.limsContext.userDetails.plantName;
        this.navService.appDrawer = this.appDrawer;

        if (CommonMethods.hasValue(localStorage.getItem('activeEntity')))
            this.activeType = localStorage.getItem('activeEntity');
        else
            this.activeType = 'D';
    }

    bindData() {
        this._envronmentService.getModuleList(this._limstitle.getEntityType());
    }

    logout() {
        this._limsContextService.clearSession();
        this.envResetUrls("LOG_OUT", this._alert);
    }

    splash() {
        this._router.navigate(['/splash']);
    }

    filterData(val) {
        if (this.moduleList != undefined && this.moduleList.length > 0) {
            let obj = this.moduleList.filter(objData => objData.entityType == val)
            return obj;
        }
    }

    getEntityTypes() {
        let modules = this.moduleList.map(function (obj) { return obj.entityType; });
        modules = modules.filter(function (v, i) { return modules.indexOf(v) == i; });
        return modules;
    }

    getEntTypeName(type: string) {
        if (type == "M")
            return "Masters";
        else if (type == "S")
            return "Schedules";
        else if (type == "P")
            return "Programs";
    }

    gotoNewRequestPage(route: string, entityCode: string) {

        var url = this._router.url.split('?')[0];
        localStorage.setItem('entityCode', entityCode);

        if (url == route) { // same page reload
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                this._router.navigate([route]));
        }
        else
            this._router.navigateByUrl(route);
    }

    navigateToLind(item) {
        var cat = this.childList.filter(c => c.entityType == item.entityType)
        if (cat && cat.length > 0)
            localStorage.setItem('entityCode', cat[0].entityCode);
        this.activeType = item.entityType;
        this._router.navigate([item.route]);
    }

    isScheduleAccess() {
        // return this._limsContextService.hasCapability(CommonMethods.getEntityProgCode(this._limsContextService.getEntityType()), 'CRE')
    }

    syncReports() {
        this.disableSyncBtn = true;
        var entityType = sessionStorage.getItem('entitytype');
        this._envronmentService.getReportsInfoForSyncToDMS(entityType);
    }

}