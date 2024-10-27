import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material';
import { IndicatorsService } from '../service/indicators.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageMasterData } from '../model/indicatorsModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, ButtonActions } from 'src/app/common/services/utilities/constants';
import { IndicatorMessages } from '../messages/indicatorsMessages';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';

@Component({
    selector: 'mng-ind-mstr',
    templateUrl: '../html/manageIndicatorMasterData.html'
})

export class manageIndicatorMasterDataComponent {
    subscription: Subscription = new Subscription();
    description: string;
    preparationTypeID: number;
    solutionID: number;
    pageTitle: string = "Manage Preparation Master Data";
    preparationMasterID: number;
    isChange: boolean = false;
    buttonType: string = ButtonActions.btnSave;
    entityCode:string;
    encEntActID : string
    isLoaderStart: boolean;

    constructor(private _closeModal: MatDialogRef<manageIndicatorMasterDataComponent>, private _indService: IndicatorsService,
        public _global: GlobalButtonIconsService, private _alert: AlertService) { }

    ngAfterContentInit() {
        this.subscription = this._indService.indicatorsSubject.subscribe(resp => {
            if (resp.purpose == 'manageIndicatorMasterData') {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    this.description = resp.result.preparationText;
                    this.preparationMasterID = resp.result.preparationMasterID;
                    if (resp.type == 'MANAGE') {
                        this._alert.success(IndicatorMessages.masterSucc);
                        this.isChange = true;
                    }
                    this.enableHeaders(false)
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

        })
        this.bindData('GET');
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    bindData(type) {
        var obj: ManageMasterData = new ManageMasterData();
        obj.type = type;
        obj.preparationTypeID = this.preparationTypeID;
        obj.solutionID = this.solutionID;
        obj.description = this.description;
        obj.preparationMasterID = this.preparationMasterID;
        obj.entityCode = this.entityCode;
        obj.encEntActID = this.encEntActID;
        if(type == 'GET')
            this.isLoaderStart = false;
        else
        this.isLoaderStart = true;
        this._indService.manageIndicatorMasterData(obj);
    }

    save(){
        if(this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);
        
        if(!CommonMethods.hasValue(this.description))
            return this._alert.warning(IndicatorMessages.breafDescription)
        this.bindData('MANAGE')
    }

    close() {
        var obj = { data: this.description, val: this.isChange }
        this._closeModal.close(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}