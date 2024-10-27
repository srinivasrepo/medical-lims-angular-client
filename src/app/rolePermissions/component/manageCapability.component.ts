import { Component } from "@angular/core";
import { Subscription } from "rxjs";
import { RolePermissionService } from "../service/rolePermission.service";
import { ManageCapability, ApprovalData, SelectedCapa } from "../model/rolePermissionModel";
import { RolePermissionMessages } from "../messages/rolePermissionMessages";
import { ManageApprovalLevelRoles } from "./manageAppLevelRoles.component";
import { MatDialog } from '@angular/material';
import { AlertService } from '../../common/services/alert.service';
import { PageUrls, ButtonActions } from '../../common/services/utilities/constants';
import { ActivatedRoute } from '@angular/router';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'manage-capability',
    templateUrl: '../html/manageCapability.html'
})

export class ManageCapabilityComponent {

    entityID: number;
    capabilityList: any;
    deptList: any;
    pageTitle: string;
    backUrl: string = PageUrls.searchRolePer;
    selectedAppCapaList: Array<any> = [];
    buttonType: string = ButtonActions.btnSave;
    disableCheckBox: boolean = false;
    isLoaderStartBtn : boolean;

    subscription: Subscription = new Subscription();

    constructor(private _activatedRoute: ActivatedRoute, private _roleSevice: RolePermissionService,
        private _toaster: AlertService, private _modal: MatDialog, public _global:GlobalButtonIconsService
    ) {
        this.pageTitle = localStorage.getItem('capabilityTitle');
    }

    ngAfterViewInit() {
        this._activatedRoute.queryParams.subscribe((param) => { this.entityID = param['id'] });

        this.subscription = this._roleSevice.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "getCapabilityDetails") {
                this.capabilityList = resp.result.appCapaList;
                // this.capabilityList.splice(this.capabilityList.findIndex(x => x.capability == 'Assign STP'),1)
                
                this.deptList = resp.result.deptList;
                this.selectedAppCapaList = resp.result.selectedAppCapaList;

                if (this.selectedAppCapaList.length > 0)
                    this.enableHeaders(false);
                else
                    this.enableHeaders(true);

            }
            else if (resp.purpose == "manageCapability") {
                this.isLoaderStartBtn = false;
                if (resp.result == "SUCCESS") {
                    this._toaster.success(RolePermissionMessages.manageCapability);
                    this._roleSevice.getCapabilityDetailsByID(this.entityID);
                }
                else if (resp.result == "DUPLICATE")
                    this._toaster.error(RolePermissionMessages.capabilityDuplicate);
            }
            else if (resp.purpose == "deleteCapabilityPermission") {
                if (resp.result == "SUCCESS") {
                    this._toaster.success(RolePermissionMessages.deleteCapability);
                    this._roleSevice.getCapabilityDetailsByID(this.entityID);
                }
                else
                    this._toaster.error(resp.result);
            }
        })

        this._roleSevice.getCapabilityDetailsByID(this.entityID);
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.disableCheckBox = !val;
    }

    add() {

        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        if (this.selectedAppCapaList.length < 1)
            return this._toaster.warning(RolePermissionMessages.capabilityManadatory);

        var obj: ManageCapability = this.formData();
        this.isLoaderStartBtn = true;
        this._roleSevice.manageCapability(obj);
    }

    formData() {
        var obj: ManageCapability = new ManageCapability();
        obj.entityID = this.entityID;
        var list: Array<SelectedCapa> = [];

        this.selectedAppCapaList.forEach(x => {
            var item: SelectedCapa = new SelectedCapa();
            item.capID = x.capabilityID;
            item.deptID = x.departmentID;
            list.push(item);
        })

        obj.selectedCapaList = list;
        return obj;
    }

    assignRoles(deptID: number, capabilityID: number) {
        const modalRef = this._modal.open(ManageApprovalLevelRoles);
        var obj: ApprovalData = new ApprovalData();
        obj.encDetailID = this.getPermissionID(deptID, capabilityID);
        obj.type = 'CapabilityRoles';
        obj.deptID = deptID;
        modalRef.componentInstance.data = obj;
        modalRef.disableClose = true;
    }

    getPermissionID(deptID: number, capabilityID: number) {
        var obj = this.selectedAppCapaList.filter(x => x.departmentID == deptID && x.capabilityID == capabilityID)
        return obj[0].encPermissionID;
    }

    manageCapa(evt, deptID: number, capabilityID: number) {
        if (evt.checked)
            this.selectedAppCapaList.push({ departmentID: deptID, capabilityID: capabilityID });
        else {
            var index: number = this.selectedAppCapaList.findIndex(x => x.departmentID == deptID && x.capabilityID == capabilityID);
            if (index != -1)
                this.selectedAppCapaList.splice(index, 1);
        }
    }

    isCheckedCapability(deptID: number, capabilityID: number) {
        var index: number = this.selectedAppCapaList.findIndex(x => x.departmentID == deptID && x.capabilityID == capabilityID);
        return index != -1;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        localStorage.removeItem('capabilityTitle');
    }

}
