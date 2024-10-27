import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { RolePermissionService } from '../service/rolePermission.service';
import { ManageStatusBo } from '../model/rolePermissionModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { RolePermissionMessages } from '../messages/rolePermissionMessages';
import { ActionMessages } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'app-mng-status',
    templateUrl: '../html/manageStatus.html'
})

export class ManageStatusComponent {

    pageTitle: string = PageTitle.manageStatus;
    manageStaObj: ManageStatusBo = new ManageStatusBo();
    disableBtn : boolean ;

    subscription: Subscription = new Subscription();

    constructor(private _dialogRef: MatDialogRef<ManageStatusComponent>, public _global: GlobalButtonIconsService,
        private _alertService: AlertService, private _rolePermissionService: RolePermissionService) { }

    ngAfterViewInit() {
        this.subscription = this._rolePermissionService.roleSubjectDetails.subscribe(resp => {
            if (resp.purpose == "manageStatus") {
                this.disableBtn = false;
                if (resp.result == 'SUCCESS'){
                    this._alertService.success(RolePermissionMessages.manageStatus);
                    this.manageStaObj = new ManageStatusBo();
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
        this._rolePermissionService.manageStatus(this.manageStaObj);
    }

    validate() {
        if (!CommonMethods.hasValue(this.manageStaObj.statusCode))
            return RolePermissionMessages.statusCode
        else if (!CommonMethods.hasValue(this.manageStaObj.status))
            return RolePermissionMessages.status;
    }

    close() {
        this._dialogRef.close();
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}