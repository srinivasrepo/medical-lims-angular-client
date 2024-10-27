import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { RolePermissionService } from "../service/rolePermission.service";
import { RolePermissionDetails, Condition, SearchRPDetails } from "../model/rolePermissionModel";
import { environment } from "../../../environments/environment";
import { RolePermissionMessages } from "../messages/rolePermissionMessages";
import { Router } from "@angular/router";
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { AlertService } from '../../common/services/alert.service';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { CommonMethods, dateParserFormatter, SearchBoSessions } from '../../common/services/utilities/commonmethods';
import { LimsRespMessages, CapabilityActions, EntityCodes, GridActions } from '../../common/services/utilities/constants';
import { MatDialog } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'role-permission',
    templateUrl: '../html/rolePermission.html'
})

export class RolePermissionComponent {

    conditionID: number = 0;
    statusID: number = 0;
    entityID: number = 0;
    headersData: Array<any> = [];
    dataSource: any;
    actions: Array<any> = []
    ddlModules: any;
    ddlStatus: any;
    ddlCondition: Array<any>;
    totalRecords: number;
    hasCreateCap: boolean;
    entityTitle: any;
    subscription: Subscription = new Subscription();
    currentSelectedIndex: number = 0;
    hasCapability: boolean = false;
    pageTitle: string;
    removeAction: any = { headerName: 'templateID', "NEWVERSION": -1, "MANAGE": -1, "compareField": 'statusCode' };

    constructor(private _limstitle: LIMSContextServices, private _rolePermService: RolePermissionService,
        private _toaster: AlertService, private _router: Router,
        private _confirm: ConfirmationService, private _matDailog: MatDialog, public _global: GlobalButtonIconsService
    ) {
        this.pageTitle = PageTitle.rolePermission;
    }

    ngAfterViewInit() {
        this.subscription = this._rolePermService.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "getRolePermission") {
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateTimeFormat", 'createdOn'));
                this.totalRecords = resp.result.totalNumberOfRows;
            }
            else if (resp.purpose == "getEntityModules") {
                this.ddlModules = resp.result.entityList;
                this.ddlStatus = resp.result.statusList;
                this.changeModule(this.entityID);
            }
            else if (resp.purpose == "manageTemplate") {
                if (resp.result == "OK") {
                    this._toaster.success(LimsRespMessages.created);
                    this.searchfilter('Search', 'Y');
                }
                else
                    this._toaster.error(RolePermissionMessages.alreadyExists);
            }
            else if (resp.purpose == "createNewVersion") {
                if (resp.result.resultFlag == "OK") {
                    this._toaster.success(RolePermissionMessages.newVersionCreated);
                    this._router.navigate(['/lims/rPermission/manageAppLevel'], { queryParams: { id: resp.result.encNewTemplateID } });
                    // this._rolePermService.getRolePermissionDetails(this.conditionID, this.statusID, this.entityID);
                }
                else if (resp.result.resultFlag == "DUPLICATE")
                    this._toaster.error(RolePermissionMessages.alreadyVersionCreated)
                else
                    this._toaster.error(resp.result.resultFlag);
            }
            else if (resp.purpose == "getConditionSByEntityModulesByID") {
                this.ddlCondition = resp.result;
                this.conditionID = this.ddlCondition.length == 1 ? this.ddlCondition[0].conditionID : '';
            }
        })

        this._rolePermService.getEntityModules(this._limstitle.getEntityType());
        this.searchfilter('Search', 'Y');
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'entityName', "header": "Modules", cell: (element: any) => `${element.entityName}` });
        this.headersData.push({ "columnDef": 'condition', "header": "Conditions", cell: (element: any) => `${element.condition}` });
        this.headersData.push({ "columnDef": 'version', "header": "Version", cell: (element: any) => `${element.version}` });
        // this.headersData.push({ "columnDef": 'createdOn', "header": "Created On", cell: (element: any) => `${element.createdOn}` });
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}` });
    }

    searchfilter(type: string, init: string = 'N') {
        var obj: SearchRPDetails = new SearchRPDetails();
        var key: string = SearchBoSessions['rolePermissionBO_' + this._limstitle.getEntityType()];

        if (SearchBoSessions.checkSessionVal(key) && init == 'Y') {
            obj = SearchBoSessions.getSearchAuditBO(key);
            this.entityID = obj.entityID;
            this.conditionID = obj.conditionID;
            this.statusID = obj.statusID;
            this.currentSelectedIndex = Number(obj.pageIndex);
            environment.pageIndex = obj.pageIndex;

            // this.changeModule(this.entityID);
        }
        else {

            if (!this.controlValidate(type) && init == 'N') {
                type == 'Search' ? this._toaster.warning(LimsRespMessages.chooseOne) : "";
                return true;
            }

            if (type != 'Search')
                this.entityID = this.conditionID = this.statusID = 0;

            if (init != 'I') {
                this.currentSelectedIndex = 0;
                environment.pageIndex = '0';
            }

            obj.pageIndex = environment.pageIndex;
            obj.conditionID = this.conditionID;
            obj.statusID = this.statusID;
            obj.entityID = this.entityID;
            obj.entityType = this._limstitle.getEntityType();

            SearchBoSessions.setSearchAuditBO(key, obj);
        }

        this._rolePermService.getRolePermissionDetails(obj);
    }

    controlValidate(type: string) {
        var isVal: boolean = true;
        if (!CommonMethods.hasValue(this.entityID) && !CommonMethods.hasValue(this.conditionID) && !CommonMethods.hasValue(this.statusID))
            isVal = false;

        if ((isVal && type == 'SearchAll') || (type == 'SearchAll' && environment.pageIndex != '0')) {
            environment.pageIndex = '0';
            isVal = true;
        }

        return isVal;
    }

    add() {

        var retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._toaster.warning(retVal);

        let con = new Condition();
        con.conditionID = this.conditionID;
        this._rolePermService.manageTemplate(con);
    }

    validateControls() {
        if (!CommonMethods.hasValue(this.entityID))
            return RolePermissionMessages.moduleMandatory;
        else if (!CommonMethods.hasValue(this.conditionID))
            return RolePermissionMessages.conditionMandatory;
    }


    onPageIndexClicked(val) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.searchfilter('Search', 'I');
    }

    onActionClicked(evt) {
        if (evt.action == 'UPD' || evt.action == 'UPDATE' || evt.action == 'VIEW' || evt.action == 'MANAGE')
            this._router.navigate(['/lims/rPermission/manageAppLevel'], { queryParams: { id: evt.val.encTemplateID } });
        else if (evt.action == "NEWVERSION") {
            //if (evt.val.status != 'Obsolete') {
            this._confirm.confirm(RolePermissionMessages.confirmNewVersion).subscribe((confirmed) => {
                if (confirmed)
                    this._rolePermService.createNewVersion({ encTemplateIDU: evt.val.encTemplateID });
            })
            //  }
        }

    }

    manageCapability() {
        if (this.entityID == 0)
            return this._toaster.warning(RolePermissionMessages.moduleMandatory);

        this._router.navigate(['/lims/rPermission/manageCapability'], { queryParams: { id: this.entityID } });
        localStorage.setItem('capabilityTitle', this.entityTitle.entityName);
    }

    changeModule(entityID: number) {
        if (entityID > 0) {
            this.setCapabilityTitle(entityID);
            this._rolePermService.getConditionSByEntityModulesByID(entityID);
        }

    }

    cloneRoles() {
        this._router.navigateByUrl('/lims/rPermission/cloneRole');
    }

    ngAfterContentInit() {
        var capActions: CapabilityActions = this._limstitle.getSearchActinsByEntityCode(EntityCodes.ROLE_MGMT);
        this.actions = capActions.actionList;
        this.hasCreateCap = capActions.createCap;
        this.actions = [GridActions.manage, GridActions.NewVersion]
    }

    setCapabilityTitle(entityID) {
        this.entityTitle = this.ddlModules && this.ddlModules.find(obj => obj.entityID == entityID);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        environment.pageIndex = "0";
    }

}