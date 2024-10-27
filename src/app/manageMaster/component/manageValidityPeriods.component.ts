import { Component } from '@angular/core'
import { ManageMasterService } from '../services/manageMaster.service';
import { Subscription } from 'rxjs';
import { LimsRespMessages, ActionMessages } from 'src/app/common/services/utilities/constants';
import { AlertService } from 'src/app/common/services/alert.service';
import { ManageMaster } from '../model/mngMaster';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { MngMasterMessage } from '../model/mngMasterMessage';
import { MatDialogRef } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';

@Component({
    selector: 'val-per',
    templateUrl: '../html/manageValidityPeriods.html'
})

export class manageValidityPeriods {

    categoryCode: string = "PERIODS";
    catItemList: any;
    subscription: Subscription = new Subscription();
    entityList: any;
    manageData: any = { catItemID: "", value: "", entityID: "" };
    pageTitle: string = "Add Validity Period";
    headerData: any;
    dataSource: any;

    constructor(private _catService: ManageMasterService, private _notify: AlertService, private _closeModal: MatDialogRef<manageValidityPeriods>,
        public _global: GlobalButtonIconsService, private _limstitle: LIMSContextServices) { }

    ngAfterContentInit() {
        this.subscription = this._catService.mngMasterSubject.subscribe(resp => {
            if (resp.purpose == "addValidityPeriods") {
                if (resp.result == "OK") {
                    this._notify.success(MngMasterMessage.addedPeriods);
                    this.clear();
                    this.selectModule();
                }
                else
                    this._notify.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == 'PERIODS')
                this.catItemList = resp.result;
            else if (resp.purpose == "getValidityEntities")
                this.entityList = resp.result;
            else if (resp.purpose == 'getValidityPeriods')
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);

        })
        this.prepareHeaders();
        this._catService.getCategoryItemsByCatCode('PERIODS');
        this._catService.getValidityEntities(this._limstitle.getEntityType());
    }

    save() {
        var obj: ManageMaster = this.formData();
        obj.categoryCode = this.categoryCode;
        var retVal = this.controlValidate(obj);

        if (CommonMethods.hasValue(retVal))
            return this._notify.warning(retVal);

        return this._catService.addValidityPeriods(obj);
    }

    allowNumbers(evt) {
        return CommonMethods.allowNumber(evt, '');
    }

    formData() {
        var obj: ManageMaster = new ManageMaster();
        obj.categoryCode = this.categoryCode;
        obj.catItemID = this.manageData.catItemID;
        obj.value = this.manageData.value;
        obj.entityID = this.manageData.entityID;

        return obj;
    }

    selectModule() {
        if (CommonMethods.hasValue(this.manageData.entityID)) {
            this.dataSource = null;
            var obj = this.entityList.filter(x => x.entityID == this.manageData.entityID)
            this._catService.getValidityPeriods(obj[0].entityCode);
        }
    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ columnDef: 'code', header: 'Period Type', cell: (element: any) => `${element.code}`, width: 'minWidth25Per' });
        this.headerData.push({ columnDef: 'value', header: 'Period Value', cell: (element: any) => `${element.value}`, width: 'minWidth25Per' });
        this.headerData.push({ columnDef: 'name', header: 'Validity Period', cell: (element: any) => `${element.name}`, width: 'minWidth25Per' });
    }

    controlValidate(obj: ManageMaster) {
        if (!CommonMethods.hasValue(obj.entityID))
            return MngMasterMessage.entity;
        if (!CommonMethods.hasValue(obj.catItemID))
            return MngMasterMessage.category;
        if (!CommonMethods.hasValue(obj.value))
            return MngMasterMessage.value;

    }


    clear() {
        this.manageData = { catItemID: "", value: "", entityID: this.manageData.entityID };
    }

    close() {
        this._closeModal.close();
    }

}