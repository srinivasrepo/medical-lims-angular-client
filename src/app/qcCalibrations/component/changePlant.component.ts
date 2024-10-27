import { Component, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { AssignPlant } from '../models/qcCalibrationsModel';
import { ButtonActions, ActionMessages } from 'src/app/common/services/utilities/constants';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';

@Component({
    selector: 'chg-pl',
    templateUrl: '../html/changePlant.html'
})

export class ChangePlantComponent {

    pageTitle: string = PageTitle.assignPlant;

    @Input('encID') encID: string;
    btnType: string = ButtonActions.btnSave;
    getPlantList: any;

    assignPlantObj: AssignPlant = new AssignPlant();


    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;

    constructor(public _closeModel: MatDialogRef<ChangePlantComponent>, public _global: GlobalButtonIconsService,
        private _service: QCCalibrationsService, private _alert: AlertService) { }

    ngAfterViewInit() {
        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "GET") {
                this.getPlantList = resp.result.getPlantForCalibrationParameters;
                this.getPlantList.forEach(element => {
                    element.disable = element.isSelect;
                });

            }
            else if (resp.purpose == "SAVE") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(QCCalibrationMessages.assignPlant);
                    this.assignPlantObj.type = null;
                    this.assignPlantObj.list = [];
                    this.assignPlantObj.type = "GET";
                    this._service.assignPlant(this.assignPlantObj);
                    this.btnType = ButtonActions.btnUpdate;
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })
        this.assignPlantObj.type = "GET";
        this.assignPlantObj.encCalibParamID = this.encID;
        this._service.assignPlant(this.assignPlantObj);
    }

    assignPlant() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.btnType = ButtonActions.btnSave;

        this.assignPlantObj.type = "SAVE";
        this.getPlantList.forEach(element => {
            if (element.isSelect)
                this.assignPlantObj.list.push({ id: element.plantID });
        });
        if (this.assignPlantObj.list.length < 1)
            return this._alert.warning(QCCalibrationMessages.plantMsg);
        
        this.isLoaderStart = true;
        this._service.assignPlant(this.assignPlantObj);
    }

    close() {
        this._closeModel.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}