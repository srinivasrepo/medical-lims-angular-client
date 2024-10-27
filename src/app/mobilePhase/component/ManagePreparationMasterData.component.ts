import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { MasterData, PreparationData } from '../model/mobilePhaseModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, ButtonActions } from 'src/app/common/services/utilities/constants';
import { mobilephaseMessages } from '../messages/mobilePhaseMessages';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';

@Component({
    selector: 'mng-pre-master',
    templateUrl: '../html/ManagePreparationMasterData.html'
})

export class ManagePreparationMasterDataComponent {

    subscription: Subscription = new Subscription()

    phasePrepation: Array<PreparationData> = [];
    preparationType: string;
    typeCode: string;
    materialID: number;
    testID: number;
    pageTitle: string = "Manage Preparation Master Data";
    buttonType: string = ButtonActions.btnSave;
    isChange: boolean = false;
    isVisBtnDisable: boolean = true;
    encMobilePhaseID:string;
    isLoaderStart : boolean = false;
    constructor(private _closeModal: MatDialogRef<ManagePreparationMasterDataComponent>, private _mpService: mobilePhaseService, private _alert: AlertService,
        public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this._mpService.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "managePreparationMasterData") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    this.phasePrepation = resp.result.lst;
                    if (resp.type == 'MANAGE') {
                        this._alert.success(mobilephaseMessages.masterSucc);
                        this.isChange = true;
                    }
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

        })
        this.bindData('GET')
    }

    bindData(type: string) {
        var obj: MasterData = new MasterData();
        obj.type = type;
        obj.preparationType = this.preparationType;
        obj.typeCode = this.typeCode;
        obj.materialID = this.materialID;
        obj.testID = this.testID;
        obj.lst = this.phasePrepation;
        obj.encMobilePhaseID = this.encMobilePhaseID;

        type == 'MANAGE' ? this.isLoaderStart = true : this.isLoaderStart = false ;
        this._mpService.managePreparationMasterData(obj);
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    save() {
        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var obj = this.phasePrepation.filter(o => CommonMethods.hasValue(o.preparationText))
        if (obj.length == 0)
            return this._alert.warning(mobilephaseMessages.atleasetOne);
        this.bindData('MANAGE')
    }


    close() {
        var obj = { data: this.phasePrepation, val: this.isChange }
        this._closeModal.close(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}