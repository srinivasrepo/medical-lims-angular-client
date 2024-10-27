import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { RolePermissionServiceUrl } from "./rolePermissionServiceUrl";
import { Condition, ManageAppLevel, ManageTemplateRoles, ManageCapability, GetUsersByID, ManageApprovalUsers, GetApprovalUsers, GetApprovalTemplateDetails, SearchRPDetails, ManageStatusBo, ManageActionBO } from "../model/rolePermissionModel";
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LIMSHttpService } from '../../common/services/limsHttp.service';

@Injectable()

export class RolePermissionService {

    roleSubjectDetails: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }


    getEntityModules(entityType: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getAllEntityModules, [entityType]))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getEntityModules" })
            })
    }


    getRolePermissionDetails(obj: SearchRPDetails) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.getRolePermissionDetails, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getRolePermission" });
            })
    }

    manageTemplate(objTemplate: Condition) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageTemplate, []), objTemplate)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageTemplate" });
            })
    }

    getManageApplevels(obj: GetApprovalTemplateDetails) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.getmanageApplevels, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getmanageAppLevel" });
            })
    }


    insertApprovalTemplates(insertAppLevels: ManageAppLevel) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.insertApprovalTemplates, []), insertAppLevels)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "insertApprovalTemplates" });
            })
    }

    getManageRolesDetails(obj: GetApprovalUsers) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.getManageRolesDetails, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getManageRolesDetails" })
            })
    }

    deleteApprovalTemplateDetails(obj: ManageTemplateRoles) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.deleteApprovalTemplateDetails, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "deleteApprovalTemplateDetails" });
            })
    }

    createNewVersion(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.createNewVersion, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "createNewVersion" });
            })
    }

    getCapabilityDetailsByID(entityID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getCapabilityDetailsByID, [entityID]))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getCapabilityDetails" });
            })
    }

    manageCapability(obj: ManageCapability) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageCapability, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageCapability" });
            })
    }

    getCapabilityRoles(permissionID, deptID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getCapabilityRoles, [permissionID, deptID]))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getCapabilityRoles" })
            })
    }

    deleteCapabilityPermission(encPermissionID) {
        this._limsHttpService.deleteDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.deleteCapabilityPermission, [encPermissionID]))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "deleteCapabilityPermission" })
            })
    }

    manageCapabilityRoles(obj: ManageTemplateRoles) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageCapabilityRoles, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageCapabilityRoles" });
            })
    }

    getConditionSByEntityModulesByID(entityID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getConditionSByEntityModulesByID, [entityID]))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getConditionSByEntityModulesByID" })
            })
    }

    discardTemplate(encTemplateID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.discardTemplate, [encTemplateID])).subscribe(resp => {
            this.roleSubjectDetails.next({ 'result': resp, "purpose": "discardTemplate" });
        });
    }

    getPlantDeptList() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getPlantDeptsList, []))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getPlantDeptsList" })
            })
    }

    getRoles(deptID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getRoles, [deptID])).subscribe(resp => {
            this.roleSubjectDetails.next({ 'result': resp, 'purpose': 'getRoles' });
        });
    }

    getUsersByID(obj: GetUsersByID) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.getUsersByID, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getUsersByID" });
            })
    }

    manageApprovalUsers(obj: ManageApprovalUsers) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageApprovalUsers, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageApprovalUsers" });
            })
    }

    getRolesByID(obj: GetUsersByID) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.getRolesByID, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getRolesByID" });
            })
    }

    manageApprovalRoles(obj: ManageApprovalUsers) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageApprovalRoles, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageApprovalRoles" });
            })
    }

    manageStatus(obj: ManageStatusBo) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageStatus, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageStatus" });
            })
    }

    manageAction(obj: ManageActionBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(RolePermissionServiceUrl.manageAction, []), obj)
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "manageAction" });
            })
    }

    getActionList() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(RolePermissionServiceUrl.getActionList, []))
            .subscribe(resp => {
                this.roleSubjectDetails.next({ "result": resp, "purpose": "getActionList" })
            })
    }
}