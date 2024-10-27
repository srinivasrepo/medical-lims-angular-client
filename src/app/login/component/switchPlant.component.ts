import { AfterContentInit, Component, OnDestroy } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LoginMessages } from '../model/loginMessages';
import { SwitchPlant } from '../model/switchPlant';
import { LoginService } from '../service/login.service';

@Component({
    selector: 'app-switchPlant',
    templateUrl: '../html/switchPlant.html'
})
export class SwitchPlantComponent implements AfterContentInit, OnDestroy {

    plantList: Array<any> = [];
    deptList: Array<any> = [];
    plantDeptList: Array<any> = [];
    switchPlantObj: SwitchPlant = new SwitchPlant();

    subscription: Subscription = new Subscription();

    constructor(private _service: LoginService, private _context: LIMSContextServices,
        private _dailogRef: MatDialogRef<SwitchPlantComponent>, public _global: GlobalButtonIconsService,
        private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._service.loginSubject.subscribe(resp => {
            if (resp.purpose == "getPlantDeptsList") {
                this.plantList = resp.result.plantList;
                this.deptList = resp.result.deptList;
            }
            else if (resp.purpose == "switchPlant") {
                this._context.limsContext.limsToken = resp.result;
                this._context.limsContext.userDetails.plantName = this.plantList.filter(e => e.plantID == this.switchPlantObj.plantID)[0].plantName;
                this._context.limsContext.userDetails.deptName = this.deptList.filter(e => e.deptCode == this.switchPlantObj.deptCode)[0].deptName;
                this._context.setSession();
                this._alert.success(LoginMessages.switchPlantSuccess);
                this._dailogRef.close("OK");
            }
        });

        this.bindData();
    }

    bindData() {
        this._service.getPlantDeptList();
    }

    changePlant() {

        this.plantDeptList = [];
        this.switchPlantObj.deptCode = "";

        if (CommonMethods.hasValue(this.switchPlantObj.plantID)) {
            var plant = this.plantList.filter(e => e.plantID == this.switchPlantObj.plantID);
            if (plant[0].hO_Flag)
                this.plantDeptList = this.deptList.filter(obj => obj.deptType === 2)
            else
                this.plantDeptList = this.deptList.filter(obj => obj.deptType === 1)
        }
    }

    go() {
        var msg = this.validations();

        if (CommonMethods.hasValue(msg))
            return this._alert.warning(msg);

        this._service.switchPlant(this.switchPlantObj);
    }

    validations() {
        if (!CommonMethods.hasValue(this.switchPlantObj.plantID))
            return LoginMessages.plant;
        else if (!CommonMethods.hasValue(this.switchPlantObj.deptCode))
            return LoginMessages.dept;
    }

    cancel() {
        this._dailogRef.close();
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}