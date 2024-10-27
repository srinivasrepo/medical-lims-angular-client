import { AfterContentInit, Component, OnDestroy } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ActionMessages } from 'src/app/common/services/utilities/constants';
import { ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';
import { LimsHelperMessages } from 'src/app/limsHelpers/messages/limsMessages';
import { EnvironmentService } from '../service/environment.service';

@Component({
    selector: 'rs232-other',
    templateUrl: '../html/manageRS232IntegrationOther.html'
})

export class ManageRS232IntegrationOtherComponent implements AfterContentInit, OnDestroy {

    obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();

    isSaved: string = 'NO';

    subscription: Subscription = new Subscription();

    constructor(private _service: EnvironmentService, private _dailogRef: MatDialogRef<ManageRS232IntegrationOtherComponent>,
        public _global: GlobalButtonIconsService, private _alert: AlertService
    ) { }

    ngAfterContentInit() {
        this._service.environmentSubject.subscribe(resp => {
            if (resp.purpose == "manageRs232IntegrationOther") {
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