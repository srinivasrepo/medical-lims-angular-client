import { Component, Input, Inject } from "@angular/core";
import { RolePermissionService } from "../service/rolePermission.service";
import { Subscription } from "rxjs";
import { ManageTemplateRoles, DialogData, GetUsersByID, ManageApprovalUsers, ApprovalData, GetApprovalUsers } from "../model/rolePermissionModel";
import { RolePermissionMessages } from "../messages/rolePermissionMessages";
import { MatDialogRef } from '@angular/material';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { SingleIDBO } from '../../common/services/utilities/commonModels';
import { AlertService } from '../../common/services/alert.service';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { LimsRespMessages, ActionMessages, ButtonActions } from '../../common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'manage-roles',
    templateUrl: '../html/manageAppLevelRoles.html'
})


export class ManageApprovalLevelRoles {

    appLevelAssign: Array<any> = [];
    assignArray: Array<any> = [];
    unassignArray: Array<any> = [];
    assigndataSource: Array<any> = [];
    unAssigndataSource: Array<any> = [];

    subscription: Subscription = new Subscription();
    ischekcedA: boolean = false;
    ischekcedU: boolean = false;
    assignedRoles: Array<any> = [];
    allRoles: any;

    plantList: Array<any> = [];
    deptList: Array<any> = [];
    roleList: Array<any> = [];
    manageData: any = { deptID: '', plantID: '', roleID: '' };
    step: number = 0;
    submitType: string = ButtonActions.btnUsers;
    submitTypeRole: string = ButtonActions.btnRoles;
    assignedUsers: Array<any> = [];
    plantDeptList: Array<any> = [];
    data: ApprovalData;
    encEntityActID: string;
    userArrayList: Array<any> = [];
    isDisabled: boolean;
    assignSubmitType: string;
    deptByPlant: Array<any> = [];
    assignType: string;
    approvalList: Array<string> = ['getRolesByID', 'getUsersByID']
    typeBtn: string;
    assignedDeptRoles: Array<any> = [];
    btnLoaderForunassign: boolean;
    btnLoaderAssign: boolean;
    btnLoaderRoles: boolean;
    btnLoaderUsers: boolean;


    constructor(private _roleService: RolePermissionService, private _notify: AlertService,
        private _closeModal: MatDialogRef<ManageApprovalLevelRoles>, private _confirm: ConfirmationService,
        public _global: GlobalButtonIconsService
    ) { }

    ngAfterViewInit() {
        this.subscription = this._roleService.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "getCapabilityRoles") {
                this.clearControls();
                this.assignedRoles = resp.result.assinedRoles;
                this.allRoles = resp.result.masterRoles;
                // this.setRoles();
            }
            else if (resp.purpose == "manageCapabilityRoles") {
                if (resp.result == "SUCCESS") {
                    if (this.assignType == 'ASSIGN')
                        this._notify.success(RolePermissionMessages.rolesAssign);
                    else
                        this._notify.success(RolePermissionMessages.rolesunAssign);

                    this._roleService.getCapabilityRoles(this.data.encDetailID, this.data.deptID);
                }
                else if (resp.result == "ERROR")
                    this._notify.error(LimsRespMessages.checkDetails);
                else
                    this._notify.error(resp.result);
            }

            else if (resp.purpose == "getManageRolesDetails") {
                this.clearControls();
                this.plantDeptList = resp.result.plantDeptList;
                this.assignedUsers = resp.result.assignedUserList;
                this.assignedRoles = resp.result.assinedRoles;
                this.assignedDeptRoles = resp.result.selectedDeptList;
            }
            else if (resp.purpose == "getPlantDeptsList") {
                this.deptList = resp.result.deptList;
                this.plantList = resp.result.plantList;
            }
            else if (resp.purpose == "getRoles")
                this.roleList = resp.result;
            else if (this.approvalList.includes(resp.purpose)) {
                this.assignArray = resp.result;
                this.enableHeaders(false);
            }
            else if (resp.purpose == "manageApprovalUsers") {
                this.btnLoaderUsers = this.btnLoaderAssign =false;
                if (resp.result == "SUCCESS") {

                    if (this.assignSubmitType == 'ASSIGN') {
                        this._notify.success(RolePermissionMessages.assignUsers);
                        this.ischekcedA = false;
                    }
                    else {
                        this._notify.success(RolePermissionMessages.unAssignUsers);
                        this.ischekcedU = false;
                    }

                    this.getApprovalUsers();
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "manageApprovalRoles") {
                this.btnLoaderRoles = this.btnLoaderAssign = false;
                if (resp.result == "SUCCESS") {
                    if (this.assignSubmitType == 'ASSIGN') {
                        this._notify.success(RolePermissionMessages.assignRoles);
                        this.ischekcedA = false;
                    }
                    else {
                        this._notify.success(RolePermissionMessages.unAssignRoles);
                        this.ischekcedU = false;
                    }

                    this.assignArray = [];
                    this.plantDeptList = [];
                    this.assignedUsers = [];
                    this.clearControls();
                    this.enableHeaders(true);
                    this.getApprovalUsers();
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })

        if (this.data.type == 'AppLevelRoles') {
            this.getApprovalUsers();
            this._roleService.getPlantDeptList();
            this.enableHeaders(true);
        }
        else
            this._roleService.getCapabilityRoles(this.data.encDetailID, this.data.deptID);
    }

    enableHeaders(val) {

        if (this.typeBtn == 'USERS' || this.typeBtn == '')
            this.submitType = val ? ButtonActions.btnUsers : ButtonActions.btnChange;

        if (this.typeBtn == 'ROLES' || this.typeBtn == '')
            this.submitTypeRole = val ? ButtonActions.btnRoles : ButtonActions.btnChange;

        this.isDisabled = !val;
    }

    getApprovalUsers() {
        var obj: GetApprovalUsers = new GetApprovalUsers();
        obj.encDetailID = this.data.encDetailID;
        obj.encEntityActID = this.encEntityActID;
        this._roleService.getManageRolesDetails(obj);
    }

    onSelectcheckBox(evt, type) {
        if (evt.checked) {
            type == 'assign' ? this.assignArray.push({ roleID: evt.source.value, type: type }) : this.unassignArray.push({ roleID: evt.source.value, type: type });
        }
        else {
            var filterArray: any = type == 'assign' ? this.assignArray : this.unassignArray;
            var index = filterArray.findIndex(item => item.roleID == evt.source.value);
            filterArray.splice(index, 1);
        }
    }

    // setRoles() {
    //     if (this.assignedRoles.length > 0) {
    //         this.allRoles.forEach((sub) => {
    //             if (this.isAssignedRole(sub.rolE_ID))
    //                 this.unAssigndataSource.push(sub);
    //             else
    //                 this.assigndataSource.push(sub);
    //         });
    //     }
    //     else
    //         this.assigndataSource = this.allRoles;
    // }

    isAssignedRole(id) {
        var index = this.assignedRoles.findIndex(obj => obj.rolE_ID == id)
        return index > -1
    }

    onSelectAllchkbox(evt, type) {
        if (evt.checked) {
            this.assignArray = []; this.unassignArray = [];
            type == 'assign' ? this.allRoles.forEach((item) => { item.isSelect = true; this.assignArray.push({ roleID: item.rolE_ID, type: type }) })
                : this.assignedRoles.forEach((item) => { item.isSelect = true; this.unassignArray.push({ roleID: item.rolE_ID, type: type }); });
        }
        else {
            if (type == 'assign') {
                this.allRoles.forEach((item) => { item.isSelect = false; });
                this.assignArray = [];
            }
            else {
                this.assignedRoles.forEach((item) => { item.isSelect = false; });
                this.unassignArray = [];
            }
        }
    }

    assignUnAssign(type) {
        let bo = new ManageTemplateRoles();
        bo.type = type == 'unassign' ? 'UNASSIGN' : 'ASSIGN';
        var objArray: any = bo.type == 'UNASSIGN' ? this.unassignArray : this.assignArray;

        if (objArray.length < 1) {
            this._notify.warning(RolePermissionMessages.atleastOneRoleCheck);
            return;
        }

        bo.roleList = bo.type == 'UNASSIGN' ? this.unassignArray : this.assignArray;
        bo.encDetailID = this.data.encDetailID;
        this.assignType = bo.type;

        this._roleService.manageCapabilityRoles(bo);
    }

    getRoles() {
        if (CommonMethods.hasValue(this.manageData.deptID))
            this._roleService.getRoles(this.manageData.deptID);
    }

    getUsers(type: string) {
        if (type == 'USERS') {
            if (this.submitType == ButtonActions.btnChange) {
                this._confirm.confirm(RolePermissionMessages.changeUsers).subscribe(result => {
                    if (result) {
                        this.assignArray = [];
                        this.typeBtn = '';
                        return this.enableHeaders(true);
                    }
                });
            }
            else
                this.getUserDetails(type);
        }
        else {

            if (this.submitTypeRole == ButtonActions.btnChange) {
                this._confirm.confirm(RolePermissionMessages.changeUsers).subscribe(result => {
                    if (result) {
                        this.assignArray = [];
                        this.typeBtn = '';
                        return this.enableHeaders(true);
                    }
                });
            }
            else
                this.getUserDetails(type);
        }


    }

    getUserDetails(type: string) {
        var retVal = this.controlValidate(type);

        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        this.typeBtn = type;

        var obj: GetUsersByID = new GetUsersByID();
        obj.plantID = this.manageData.plantID;
        obj.deptID = this.manageData.deptID;
        obj.roleID = this.manageData.roleID;
        obj.encDetailID = this.data.encDetailID;
        
        if (type == "USERS") 
            this._roleService.getUsersByID(obj);
        else 
            this._roleService.getRolesByID(obj);
    }

    controlValidate(type: string) {
        if (!CommonMethods.hasValue(this.manageData.plantID))
            return RolePermissionMessages.plantID;
        else if (!CommonMethods.hasValue(this.manageData.deptID))
            return RolePermissionMessages.deptID;
        else if (!CommonMethods.hasValue(this.manageData.roleID) && type != 'ROLES')
            return RolePermissionMessages.roleID;
    }

    getChildData(data) {
        return this.assignedUsers.filter(x => x.plantID == data.plantID && x.deptID == data.deptID);
    }

    getChildRolesData(data) {
        return this.assignedRoles.filter(x => x.deptID == data.deptID);
    }

    checkAllUsers(evt, type: string, val: any = '') {

        if (type == 'assign') {
            if (evt.checked) {
                this.assignArray.forEach((item) => {
                    item.isSelect = true;
                })
            }
            else {
                this.assignArray.forEach((item) => {
                    item.isSelect = false;
                })
            }
        }
        else if (type == 'unassign') {
            if (evt.checked) {
                this.assignedUsers.forEach((item) => {
                    item.isSelect = true;
                })
            }
            else {
                this.assignedUsers.forEach((item) => {
                    item.isSelect = false;
                })
            }
        }
        else {
            var obj = this.getChildData(val);
            if (evt.checked) {
                obj.forEach((item) => {
                    item.isSelect = true;
                })
            }
            else {
                obj.forEach((item) => {
                    item.isSelect = false;
                })
            }
        }
    }

    checkAllRoles(evt, item) {
        var obj = this.getRolesByDeptID(item.deptID)

        if (obj.length < 0)
            return;

        if (evt.checked) {
            obj.forEach((x) => {
                x.isSelect = true;
            })
        }
        else {
            obj.forEach((x) => {
                x.isSelect = false;
            })
        }
    }

    getRolesByDeptID(id) {
        return this.assignedRoles.filter(x => x.deptID == id);
    }

    assigningUsersList(type: string) {
        var list: Array<any> = [];

        if (type == 'Assign') {
            this.assignSubmitType = 'ASSIGN';
            this.assignArray.forEach((x) => {
                if (x.isSelect == true) {
                    var single: SingleIDBO = new SingleIDBO();
                    single.id = x.id;
                    list.push(single);
                }
            })
        }
        else {
            this.assignSubmitType = 'UNASSIGN';
            this.assignedUsers.forEach((x) => {
                if (x.isSelect == true) {
                    var single: SingleIDBO = new SingleIDBO();
                    single.id = x['userID'];
                    list.push(single);
                }
            })
        }

        return list;
    }

    assigningRolesList(type: string) {
        var list: Array<any> = [];

        if (type == 'Assign') {
            this.assignSubmitType = 'ASSIGN';
            this.assignArray.forEach((x) => {
                if (x.isSelect == true) {
                    var single: any = {};
                    single.roleID = x.id;
                    list.push(single);
                }
            })
        }
        else {
            this.assignSubmitType = 'UNASSIGN';
            this.assignedRoles.forEach((x) => {
                if (x.isSelect == true) {
                    var single: any = {};
                    single.roleID = x.roleID;
                    list.push(single);
                }
            })
        }

        return list;
    }

    assignUsers(type: string, val: string = '') {
        var list: Array<any> = [];
        if (this.typeBtn == 'USERS' || val == 'USERS')
            list = this.assigningUsersList(type);
        else
            list = this.assigningRolesList(type);

        if (list.length < 1)
            return this._notify.warning((this.typeBtn == 'USERS' || val == 'USERS') ? RolePermissionMessages.atleastOneUserCheck : RolePermissionMessages.atleastOneRoleCheck);

        var obj: ManageApprovalUsers = new ManageApprovalUsers();
        obj.encDetailID = this.data.encDetailID;
        obj.type = type;

        if (type == "Assign" && val == "")
            this.btnLoaderAssign = true;

        if (this.typeBtn == 'USERS' || val == 'USERS') {
            obj.usrList = list;
            if (type == 'UnAssign' && val == 'USERS')
                this.btnLoaderUsers = true;
           
            this._roleService.manageApprovalUsers(obj);
        }
        else {
            if (type == 'UnAssign' && val == 'ROLES')
                this.btnLoaderRoles = true;
            obj.roleList = list;
            this._roleService.manageApprovalRoles(obj);
        }
    }

    singleUserCheck(evt, type: string) {
        if (type == 'Assign') {
            if (evt.checked) {
                var obj: any = this.assignArray.filter((x) => { x.isSelect == true });
                return (obj.length == this.assignArray.length) && this.assignArray.length > 0;
            } else {
                var obj: any = this.assignArray.filter((x) => { x.isSelect == false });
                return (obj.length == this.assignArray.length) && this.assignArray.length > 0;
            }
        }
        else {
            if (evt.checked) {
                var obj: any = this.assignedUsers.filter((x) => { x.isSelect == true });
                return (obj.length == this.assignedUsers.length) && this.assignedUsers.length > 0;
            } else {
                var obj: any = this.assignedUsers.filter((x) => { x.isSelect == false });
                return (obj.length == this.assignedUsers.length) && this.assignedUsers.length > 0;
            }
        }
    }

    clearControls() {
        this.assignArray = [];
        this.unassignArray = [];
        this.assigndataSource = [];
        this.unAssigndataSource = [];
        this.ischekcedA = false;
        this.ischekcedU = false;
        this.typeBtn = '';
        this.enableHeaders(true);
    }

    close() {
        this._closeModal.close();
    }

    setStep(index) {
        this.step = index;
    }

    checkedDeptAll(parent, type: string) {
        var count: number = 0;
        if (type != 'selectAll') {
            var obj: Array<any> = this.getChildData(parent);
            obj.forEach((item) => {
                if (item.isSelect)
                    count = count + 1;
            })

            return obj.length == count;
        }
        else {
            this.assignedUsers.forEach((item) => {
                if (item.isSelect)
                    count = count + 1;
            })

            return this.assignedUsers.length == count;
        }
    }

    checkedRolesAll() {
        var count: number = 0;
        this.assignedRoles.forEach((x) => {
            if (x.isSelect)
                count = count + 1;
        })

        return this.assignedRoles.length == count && this.assignedRoles.length > 0;
    }


    changePlant() {
        var plnt = this.plantList.filter(p => p.plantID == this.manageData.plantID)
        if (plnt[0].hO_Flag)
            this.deptByPlant = this.deptList.filter(d => d.deptType == 2)
        else
            this.deptByPlant = this.deptList.filter(d => d.deptType == 1)
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}