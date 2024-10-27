import { Component, ViewChild } from "@angular/core";
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from '../../common/services/utilities/commonmethods';
import { AuditService } from '../services/audit.service';
import { environment } from '../../../environments/environment';
import { MatDialog } from '@angular/material';
import { ViewAuditTrailComponent } from './viewAuditTrail.component';
import { Router } from '@angular/router';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { AlertService } from '../../common/services/alert.service';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { LookupCodes, LimsRespMessages } from '../../common/services/utilities/constants';
import { AuditTrailBO } from '../modal/auditMOdal';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'lims-auditSearch',
    templateUrl: '../html/searchAudit.html'
})

export class SearchAuditComponent {

    auditData: any = { entityID: '', refNumber: '', fromDate: '', toDate: '' };
    pageIndexes: Array<any> = [];
    totalRecords: number;
    action: any = ['VIEW'];
    currentSelectedIndex: number;
    headerData: any = [];
    dataSource: any;
    entityList: any = [];
    condition: string;
    pageTitle: string;

    actionInfo: LookupInfo;
    @ViewChild('actions', { static: true }) actions: LookupComponent;
    actionByinfo: LookupInfo;
    @ViewChild('actionsBy', { static: true }) actionsBy: LookupComponent;

    from_minDate: Date = new Date();
    subscription: Subscription = new Subscription();
    // icnSearch: string = ButtonIcons.icnSearch;
    // icnSearchAll: string = ButtonIcons.icnSearchAll;
    // icnClear: string = ButtonIcons.icnCancel;


    constructor(private _context: LIMSContextServices, private auditService: AuditService,
        private _matDail: MatDialog, private _router: Router,
        private _toaster: AlertService, public _global:GlobalButtonIconsService
    ) {
        this.pageTitle = PageTitle.auditTrail;
    }

    ngAfterContentInit() {
        this.actionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.actions, LookupCodes.auditActions, LKPDisplayNames.action, LKPDisplayNames.actionCode, LookUpDisplayField.header, LKPPlaceholders.action);
        this.actionByinfo = CommonMethods.PrepareLookupInfo(LKPTitles.actionsBy, LookupCodes.allUsers, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.actionBy, "UserCode != 'SYS_ADMIN'");
    }

    ngAfterViewInit() {

        this.subscription = this.auditService.auditSubject.subscribe(resp => {
            if (resp.purpose == "getEntityModules")
                this.entityList = resp.result.entityList;
            else if (resp.purpose == "getAuditTrailLogDetails") {
                this.prepareHeader();
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, 'arrayDateTimeFormat', 'auditEntryDate'));
                this.totalRecords = resp.result.totalNumberOfRows;
                // this.pageIndexes = CommonMethods.getPageIndexes(this.totalRecords);
                this.changeFormat('default');
            }
        })

        this.auditService.getEntityModules(this._context.getEntityType());
        this.searchFilter('search', 'Y');
    }

    prepareHeader() {
        this.headerData = [];
        this.headerData.push({ "columnDef": 'entityName', "header": "Entity", cell: (element: any) => `${element.entityName}` });
        this.headerData.push({ "columnDef": 'entityRefNum', "header": "Reference Number", cell: (element: any) => `${element.entityRefNum}` });
        this.headerData.push({ "columnDef": 'auditAction', "header": "Audit Action", cell: (element: any) => `${element.auditAction}` });
        this.headerData.push({ "columnDef": 'userName', "header": "Action By", cell: (element: any) => `${element.userName}` });
        this.headerData.push({ "columnDef": 'auditEntryDate', "header": "Action On", cell: (element: any) => `${element.auditEntryDate}` });
    }

    searchFilter(type: string, init: string = 'N') {
        var obj: AuditTrailBO = new AuditTrailBO();
        var key: string = SearchBoSessions['audTrailBOKey_' + this._context.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.auditData.entityID = obj.entityID;
            this.auditData.refNumber = obj.refNumber;
            this.auditData.fromDate = dateParserFormatter.FormatDate(obj.dateFrom, 'default');
            this.auditData.toDate = dateParserFormatter.FormatDate(obj.dateTo, 'default');

            if (CommonMethods.hasValue(obj.actionID))
                this.actions.setRow(obj.actionID, obj.action);
            if (CommonMethods.hasValue(obj.actionByID))
                this.actionsBy.setRow(obj.actionByID, obj.actionBy);

            this.currentSelectedIndex = obj.pageIndex;
            environment.pageIndex = String(obj.pageIndex);
        }
        else {
            if (!this.controlValidate(type) && init == 'N') {
                type == 'search' ? this._toaster.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type != 'search') {
                this.auditData = { entityID: '', refNumber: '', fromDate: '', toDate: '' };
                if (CommonMethods.hasValue(this.actions.selectedId))
                    this.actions.clear();
                if (CommonMethods.hasValue(this.actionsBy.selectedId))
                    this.actionsBy.clear();
            }
            else {
                if (CommonMethods.hasValue(this.auditData.fromDate))
                    obj.dateFrom = dateParserFormatter.FormatDate(this.auditData.fromDate, 'datetime')
                if (CommonMethods.hasValue(this.auditData.toDate))
                    obj.dateTo = dateParserFormatter.FormatDate(this.auditData.toDate, 'datetime')
            }

            if (init != 'I') {
                this.currentSelectedIndex = 0;
                environment.pageIndex = '0';
            }

            if (CommonMethods.hasValue(this.actions.selectedId))
                obj.actionID = this.actions.selectedId;
            if (CommonMethods.hasValue(this.actionsBy.selectedId))
                obj.actionByID = this.actionsBy.selectedId;

            obj.entityID = this.auditData.entityID;
            obj.refNumber = this.auditData.refNumber;
            SearchBoSessions.setSearchAuditBO(key, obj);
        }

        this.auditService.getAuditTrailLogDetails(obj);
    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (!CommonMethods.hasValue(this.auditData.entityID) && !CommonMethods.hasValue(this.auditData.refNumber) && !CommonMethods.hasValue(this.auditData.fromDate) && !CommonMethods.hasValue(this.auditData.toDate) && !CommonMethods.hasValue(this.actions.selectedId) && !CommonMethods.hasValue(this.actionsBy.selectedId))
            isVal = false;

        if ((isVal && type == 'searchAll') || (type == 'searchAll' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }

        return isVal;
    }

    clear() {
        this.auditData = { entityID: '', refNumber: '', fromDate: '', toDate: '' };
        this.actions.clear();
        this.actionsBy.clear();
    }

    onActionClicked(evt) {
        if (evt.action == "VIEW") {
            const viewRef = this._matDail.open(ViewAuditTrailComponent)
            viewRef.disableClose = true;
            viewRef.componentInstance.auditID = evt.val.encAuditID;
            viewRef.afterClosed().subscribe(result => {
            })
        }
    }

    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.searchFilter('search', 'I');
    }

    changeFormat(type: string = 'datetime') {
        if (CommonMethods.hasValue(this.auditData.fromDate))
            this.auditData.fromDate = dateParserFormatter.FormatDate(this.auditData.fromDate, type)

        if (CommonMethods.hasValue(this.auditData.toDate))
            this.auditData.toDate = dateParserFormatter.FormatDate(this.auditData.toDate, type)
    }

    manageTables() {
        this._router.navigate(['/lims/audit/mngTable']);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.currentSelectedIndex = 0;
        environment.pageIndex = '0';
    }

}