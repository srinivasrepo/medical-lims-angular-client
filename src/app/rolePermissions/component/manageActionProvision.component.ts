import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { RolePermissionService } from '../service/rolePermission.service';
import {  ManageActionBO } from '../model/rolePermissionModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { RolePermissionMessages } from '../messages/rolePermissionMessages';
import { ActionMessages } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'app-mng-action',
    templateUrl: '../html/manageActionProvision.html'
})

export class ManageActionProvisionComponent {

    pageTitle: string = PageTitle.manageAction;
    manageActObj: ManageActionBO = new ManageActionBO();
    disableBtn : boolean ;

    subscription: Subscription = new Subscription();
    isActionAdded: boolean;

    constructor(private _dialogRef: MatDialogRef<ManageActionProvisionComponent>, public _global: GlobalButtonIconsService,
        private _alertService: AlertService, private _rolePermissionService: RolePermissionService) { }

    ngAfterViewInit() {
        this.subscription = this._rolePermissionService.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "manageAction") {
                this.disableBtn = false;
                if (resp.result == 'OK'){
                    this._alertService.success(RolePermissionMessages.mangeAction);
                    this.manageActObj = new ManageActionBO();
                    this.isActionAdded = true;
                }
                else
                    this._alertService.error(ActionMessages.GetMessageByCode(resp.result));
            }

        })
    }

    add() {

        var errMsg: string = this.validate();
        if (CommonMethods.hasValue(errMsg))
            return this._alertService.warning(errMsg);

        this.disableBtn = true;

        var obj: ManageActionBO = new ManageActionBO();
        obj.action = this.manageActObj.action;
        obj.actionCode = this.manageActObj.actionCode;
        this._rolePermissionService.manageAction(this.manageActObj);
    }

    validate() {
        if (!CommonMethods.hasValue(this.manageActObj.actionCode))
            return RolePermissionMessages.actionType
        else if (!CommonMethods.hasValue(this.manageActObj.action))
            return RolePermissionMessages.action;
    }

    close() {
        this._dialogRef.close(this.isActionAdded);
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}



