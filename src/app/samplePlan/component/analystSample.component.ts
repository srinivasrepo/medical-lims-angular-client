import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, SamplePlanLocalKeys } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { GetAnalyticsList, GetAnalytics, ManageAnalystModel } from '../model/samplePlanModel';
import { MatDialog } from '@angular/material';
import { AnalystOccupancyDetailsComponent } from './analystOccupancyDetails.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ButtonActions } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'sample-analyst',
    templateUrl: '../html/analystSample.html'
})
export class AnalystSamplePlanComponent {

    @Input('encSamplePlanID') encSamplePlanID: string;
    @Input('appBO') appBO: AppBO = new AppBO();

    btnSaveType: string = ButtonActions.btnSave;
    disableBtn: boolean;
    getAnalysts: GetAnalyticsList = new GetAnalyticsList();
    totalAnalysts: number;
    availabelAnalyst: number;
    notAvailableAnalyst: number;
    subscription: Subscription = new Subscription();
    @Output() loader: EventEmitter<any> = new EventEmitter();    
    
    constructor(private _service: SamplePlanService, private _alert: AlertService, private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getAnalysts") {
                this.getAnalysts = resp.result;
                var index = this.getAnalysts.findIndex(x => x.isSelected == true);
                if (index != -1)
                    this.enableHeaders(false);
                this.totalAnalysts = this.getAnalysts.length;
                this.availabelAnalyst = this.getAnalystsList('AVAILABLE').length;
                this.notAvailableAnalyst = this.getAnalystsList('NOT_AVAILABLE').length;
            }
            else if (resp.purpose == "saveAnalysts") {
                // this.disableBtn = = false;
            this.loader.emit(false);
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(SamplePlanMessages.saveAnalysts);
                    this.appBO = resp.result;
                    this.enableHeaders(false);
                    localStorage.setItem(SamplePlanLocalKeys.Anal_PlanningKey, 'true');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })

        this._service.getAnalysts(this.encSamplePlanID);
    }

    changeAnalQua(evt: any, ana: GetAnalytics) {
        this.getAnalysts.filter(x => x.userRoleID == ana.userRoleID).forEach(item => item.isSelected = evt.checked);
    }

    enableHeaders(val: boolean) {
        this.btnSaveType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    getAalystsDetails(encUserRoleID: string) {
        const modal = this._matDailog.open(AnalystOccupancyDetailsComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.encUserRoleID = encUserRoleID;
        modal.afterClosed();
    }

    saveAnalysts() {

        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        if (this.getSelectedAnalysts().length < 1)
            return this._alert.warning(SamplePlanMessages.analysts);

        var obj: ManageAnalystModel = new ManageAnalystModel();
        obj.encPlanID = this.encSamplePlanID;
        obj.initTime = this.appBO.initTime;
        obj.list = this.getSelectedAnalysts();
        //this.disableBtn = true;
        //this.isLoaderStart = true;
        this.loader.emit(true);
        this._service.saveAnalysts(obj);
    }

    getSelectedAnalysts() {
        var list: Array<SingleIDBO> = [];
        this.getAnalysts.filter(x => x.isSelected == true).forEach(item => {
            var obj: SingleIDBO = new SingleIDBO();
            obj.id = item.userRoleID;
            list.push(obj);
        });

        return list;
    }

    getAnalystsList(type: string) {
        if (type == 'AVAILABLE')
            return this.getAnalysts.filter(x => CommonMethods.hasValue(x.isAvailable))
        else
            return this.getAnalysts.filter(x => !CommonMethods.hasValue(x.isAvailable))
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}