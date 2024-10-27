import { Component, ViewChild } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ChangeUserPlanTest } from '../model/samplePlanModel';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO } from 'src/app/common/services/utilities/commonModels';

@Component({
    selector: 'sample-planChange',
    templateUrl: '../html/changeUserPlanTest.html'
})

export class ChangeUserPlanTestComponent {

    usrTestBO: ChangeUserPlanTest = new ChangeUserPlanTest();
    changeUserInfo: LookupInfo;
    @ViewChild('changeUser', { static: true }) changeUser: LookupComponent;
    subscription: Subscription = new Subscription();
    isLoaderStart : boolean = false;

    constructor(public _global: GlobalButtonIconsService, private _matDailogRef: MatDialogRef<ChangeUserPlanTestComponent>,
        private _sampleService: SamplePlanService, private _alert: AlertService
    ) { }

    ngAfterViewInit() {

        this.subscription = this._sampleService.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "changeUserPlanTest") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(SamplePlanMessages.sampleChangeuserTest);
                    this.close(resp.result);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))

            }
        })

        this.prepareLKPUsers();
    }

    prepareLKPUsers() {
        if (this.usrTestBO.activityCode != 'WET_INST' && this.usrTestBO.activityCode != "OOS") {
            if (this.usrTestBO.encPlanID) {
                var condition = CommonMethods.hasValue(this.usrTestBO.userRoleID) ? "UserRoleID <> " + this.usrTestBO.userRoleID + " AND PlanID = " + '[' + this.usrTestBO.encPlanID + ']' : "PlanID = " + '[' + this.usrTestBO.encPlanID + ']';
                this.changeUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.changeUserPlanTestDetails, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.analyst, condition, '', 'LIMS');
            }
            else {
                this.changeUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.getQCUsers, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.analyst, "UserActive = 1 AND StatusCode = 'ACT' AND PlantStatusCode = 'ACT' AND UserRoleID <> " + this.usrTestBO.userRoleID, '', 'LIMS');
            }
        }
        else if (this.usrTestBO.activityCode == "OOS")
            this.changeUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.changeUserPlanOOSTest, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.analyst, CommonMethods.hasValue(this.usrTestBO.encPlanID) ? " PlanID = " + '[' + this.usrTestBO.encPlanID + '] AND TestID = ' + this.usrTestBO.testID : 'TestID = ' + this.usrTestBO.testID, '', 'LIMS');
        else
            this.changeUserInfo = CommonMethods.PrepareLookupInfo(LKPTitles.analyst, LookupCodes.changeUserPlanAndTest, LKPDisplayNames.actionBy, LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.analyst, CommonMethods.hasValue(this.usrTestBO.encPlanID) ? " PlanID = " + '[' + this.usrTestBO.encPlanID + '] AND TestID = ' + this.usrTestBO.testID : 'TestID = ' + this.usrTestBO.testID, '', 'LIMS');

    }


    changeUserTest() {

        if (!CommonMethods.hasValue(this.changeUser.selectedId))
            return this._alert.warning(SamplePlanMessages.userName);

        if (CommonMethods.hasValue(this.usrTestBO.encPlanID))
            this.usrTestBO.type = "PLAN";
        else
            this.usrTestBO.type = "INCHARGE";

        this.usrTestBO.userRoleID = this.changeUser.selectedId;
        this.isLoaderStart = true;
        this._sampleService.changeUserPlanTest(this.usrTestBO);
    }


    close(appBo: AppBO = null) {
        this._matDailogRef.close(appBo);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}