import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { MatDialogRef } from '@angular/material';
import { StandardProcedure } from '../model/volumetricSolModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { AlertService } from 'src/app/common/services/alert.service';
import { VolumetricSolMessages } from '../messages/volumetricSolMessages';
import { ButtonActions } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'sta-pro',
    templateUrl: '../html/standaradizationProcedure.html'
})

export class ManageStandardProcedure {

    encIndexID: string
    subscription: Subscription = new Subscription();
    preProcedure: string;
    staProcedure: string;
    pageTitle: string = 'Manage Procedures';
    btnType: string = ButtonActions.btnSave;
    isLoaderStart : boolean = false;

    constructor(private _volService: VolumetricSolService, private _closeMat: MatDialogRef<ManageStandardProcedure>,
        private _alert: AlertService, public _global:GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this._volService.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "manageStandProcedures") {
                this.isLoaderStart = false;
                if(resp.type == 'UPD')
                    this._alert.success(VolumetricSolMessages.proceSucc);
                this.preProcedure = resp.result.preparationProcedure;
                this.staProcedure = resp.result.standardizationProcedure;
                this.enableHeaders(!CommonMethods.hasValue(this.preProcedure))
            }
        })
        this.manageData('GET');
    }

    manageData(type: string) {
        var obj: StandardProcedure = new StandardProcedure();
        obj.encIndexID = this.encIndexID;
        obj.type = type;
        obj.preparationProcedure = this.preProcedure;
        obj.standardizationProcedure = this.staProcedure

        type == 'UPD' ? this.isLoaderStart = true : this.isLoaderStart = false ;
        this._volService.manageStandProcedures(obj);
    }

    enableHeaders(val: boolean){
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save() {
        if(this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var err: string = this.validation();

        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        this.manageData('UPD')
    }

    validation() {
        if (!CommonMethods.hasValue(this.preProcedure))
            return VolumetricSolMessages.preparProced;
        if (!CommonMethods.hasValue(this.staProcedure))
            return VolumetricSolMessages.staProce;
    }

    close() {
        this._closeMat.close();
    }
}