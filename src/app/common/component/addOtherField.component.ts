import { AfterContentInit, Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { EnvironmentService } from 'src/app/environment/service/environment.service';
import { ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';
import { LimsHelperMessages } from 'src/app/limsHelpers/messages/limsMessages';
import { AlertService } from '../services/alert.service';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';
import { CommonMethods } from '../services/utilities/commonmethods';
import { ActionMessages } from '../services/utilities/constants';

@Component({
    selector: 'add-new-field',
    templateUrl: '../html/addOtherField.html'
})

export class AddOtherFieldComponent implements AfterContentInit, OnDestroy {

    obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();
    isSaved: string = 'NO';
    subscription: Subscription = new Subscription();
    isLoaderStart : boolean = false;

    constructor(private _service: EnvironmentService, private _dailogRef: MatDialogRef<AddOtherFieldComponent>,
        public _global: GlobalButtonIconsService, private _alert: AlertService
    ) { }

    ngAfterContentInit() {
        this._service.environmentSubject.subscribe(resp => {
            if (resp.purpose == "manageRs232IntegrationOther") {
                this.isLoaderStart = false;
                if (resp.result == "OK") {
                    this._alert.success(LimsHelperMessages.manageRS232IntegrationOther);
                    this.isSaved = 'YES';
                    this.obj.keyTitle = null;
                }
                else
                    this._alert.success(ActionMessages.GetMessageByCode(resp.result));
            }
        })

    }

    saveTitle() {

        if (!CommonMethods.hasValue(this.obj.keyTitle))
            return this._alert.warning(LimsHelperMessages.manageRS232IntegrationOtherTitle);

        this.isLoaderStart = true;
        this._service.manageRS232IntegrationOther(this.obj);
    }

    close() {
        if (this.isSaved != 'YES')
            this.obj.keyTitle = null;

        this._dailogRef.close(this.isSaved);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}