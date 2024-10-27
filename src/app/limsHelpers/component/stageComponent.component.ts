import { Component, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { LookupInfo, LookUpDisplayField, stageInfoBO, stages } from '../entity/limsGrid';
import { LookupComponent } from './lookup';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../entity/lookupTitles';
import { LookupCodes, EntityCodes } from 'src/app/common/services/utilities/constants';
import { LimsHelperService } from '../services/limsHelpers.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'stage-com',
    templateUrl: '../html/stageComponent.html'
})

export class stageComponent {

    stagesList: Array<stages> = [];
    stage: number = 0;
    productID: number;
    productName: string;
    productsInfo: LookupInfo;
    keyType: string;
    @ViewChild('products', { static: true }) products: LookupComponent;
    subscription: Subscription = new Subscription();
    @Output() stageSelected: EventEmitter<any> = new EventEmitter();
    @Input() stageBO: stageInfoBO = new stageInfoBO();
    disable: boolean = false;
    result: any;
    constructor(private _service: LimsHelperService) { }

    ngAfterContentInit() {
        this.subscription = this._service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "getStages") {
                this.result = resp.result;
                resp.result.forEach(ob => {
                    this.stagesList.push({ id: ob[this.keyType], name: ob.stagE_NAME });
                });
                if (this.stagesList.length == 1 && !CommonMethods.hasValue(this.stage)) {
                    this.stage = this.stagesList[0].id;
                    this.selectedStage();
                }
            }
        });
        this.prepareLkup();
        this.keyType = this.stageBO.bindKeyType;
    }

    onSelectedLookup(evt) {
        this.stagesList = [];
        this.stage = 0;
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val)) {
            this.productID = evt.val.id;
            this.productName = evt.val.name;
            this._service.getStages(this.productID);
        }
        else
            this.productID = 0;
        this.selectedStage();
    }

    selectedStage() {
        var obj = { productID: this.productID, stage: this.stage, productName: this.productName }
        this.stageSelected.emit(obj);
    }

    bindData(obj: stageInfoBO) {
        if (CommonMethods.hasValue(this.stageBO.productID)) {
            this.products.setRow(obj.productID, obj.productName);
            this.productID = obj.productID;
            this.stage = this.stageBO.stageID
            this._service.getStages(this.productID);
        }
    }

    clear() {
        this.products.clear();
        this.stage = 0;
    }

    enableHeaders(val: boolean) {
        this.products.disableBtn = this.disable = !val;
    }

    prepareLkup() {
        var condition: string = "";
        // if (this.stageBO.entityCode == EntityCodes.mobilePhase)
        //     condition = "CAT_CODE IN ('RAW_MAT','INTER_MAT','FIN_MAT')"

        this.productsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.product, LookupCodes.getPlantWiseProd, LKPDisplayNames.product, LKPDisplayNames.productCode, LookUpDisplayField.header, LKPPlaceholders.product, condition, "", "LIMS");
    }
}