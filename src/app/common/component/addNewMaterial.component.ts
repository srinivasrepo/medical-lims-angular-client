import { Component } from "@angular/core";
import { MatDialogRef } from '@angular/material';
import { PageTitle } from '../services/utilities/pagetitle';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GridActions, MaterialCategories, ActionMessages, EntityCodes } from '../services/utilities/constants';
import { CommonService } from '../services/commonServices';
import { ParamMasterObj, AddMaterial, AddMaterialLables } from '../model/commonModel';
import { CommonMethods } from '../services/utilities/commonmethods';
import { CommonMessages } from '../messages/commonMessages';
import { AlertService } from '../services/alert.service';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'add-material',
    templateUrl: '../html/addNewMaterial.html'
})

export class AddNewMaterialComponent {

    pageTitle: string = 'Solution';
    pageType: string = 'MNG';

    subCategory: string = 'TEST_SOLUTIONS_INDICATORS';

    addMaterialForm: FormGroup;
    isLoaderStart: boolean;

    get f() { return this.addMaterialForm.controls; }

    categories: any;
    subCategories: Array<any> = [];
    category: string = 'LAB_MAT';
    categoryID: number;
    typeParamList: Array<any> = [];
    uomParamList: Array<any> = [];
    entityCode: string;
    subscription: Subscription = new Subscription();
    labels: AddMaterialLables = new AddMaterialLables();

    constructor(private _matAct: MatDialogRef<AddNewMaterialComponent>, private _fb: FormBuilder,
        private _service: CommonService, private _alert: AlertService, public _global: GlobalButtonIconsService) {
        this.addMaterialForm = _fb.group({
            category: ['', [Validators.required]],
            subCategory: ['', [Validators.required]],
            materialAlies: ['', [Validators.required]],
            material: ['', [Validators.required]],
            materialType: ['', [Validators.required]],
            materialUom: ['', [Validators.required]]
        })
    }

    ngAfterContentInit() {
        this.pageTitle = this.pageType == 'MNG' ? 'Add ' + this.pageTitle : 'View ' + this.pageTitle;
        this.f.category.disable();
        this.f.subCategory.disable();
        //this.f.materialType.disable();

        this.subscription = this._service.commonSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialCategories") {
                this.categories = resp.result;
                this.categoryID = this.categories.filter(x => x.paramCode == this.category)[0].paramID;
                this.f.category.setValue(this.category);
                this._service.getMaterialSubCategories(MaterialCategories.GetMaterialCategoryCode(this.category));
            }
            else if (resp.purpose == "getMaterialSubCategories") {
                this.subCategories = resp.result;
                var obj = this.subCategories.filter(x => x.caT_ITEM_CODE == this.subCategory);
                this.f.subCategory.setValue(obj[0].caT_ITEMID);
            }
            else if (resp.purpose == "PARAM_TYPE") {
                this.typeParamList = resp.result.filter(x => x.paramAlies == 'SOL' || x.paramAlies == 'LIQ');
                if (this.entityCode == EntityCodes.indicators || this.entityCode == EntityCodes.stockSolution) {
                    var type = this.typeParamList.filter(x => x.paramAlies == 'LIQ')
                    this.f.materialType.setValue(type[0].paramKey)
                }

            }

            else if (resp.purpose == "PARAM_UOM") {
                this.uomParamList = resp.result;
                if (this.entityCode == EntityCodes.indicators || this.entityCode == EntityCodes.stockSolution) {
                    var uom = this.uomParamList.filter(x => x.paramAlies == 'ML')
                    this.f.materialUom.setValue(uom[0].paramKey);
                }

            }
            else if (resp.purpose == "addNewMaterial") {
                this.isLoaderStart = false;
                if (resp.result == 'SUCCESS') {
                    this._alert.success(CommonMessages.addmaterial);
                    this.close();
                }
                else if (resp.result == 'MAT_EXISTS')
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result + '_' + this.entityCode));
            }
        });

        this._service.getMaterialCategories();
        this.getParamData('TYPE');
        this.getParamData('UOM');
        if (this.entityCode == EntityCodes.stockSolution)
            this.subCategory = "STOCK_SOLUTION";
    }

    getParamData(code: string) {
        var obj: ParamMasterObj = new ParamMasterObj();
        obj.paramField = code;
        obj.paramFType = code == 'TYPE' ? 'T' : '';
        this._service.getParamMasterData(obj, 'PARAM_' + code);
    }

    save() {
        var retVal: string = this.controlValidate();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        var obj: AddMaterial = new AddMaterial();
        obj.categoryID = this.categoryID;
        obj.catItemID = this.f.subCategory.value;
        obj.material = this.f.material.value;
        obj.materialType = this.f.materialType.value;
        obj.materialUom = this.f.materialUom.value;
        obj.materialAlies = this.f.materialAlies.value.toUpperCase();
        obj.entityCode = this.entityCode;

        this.isLoaderStart = true;
        this._service.addNewMaterial(obj);
    }

    controlValidate() {
        if (!CommonMethods.hasValue(this.f.material.value))
            return this.entityCode == EntityCodes.indicators ? CommonMessages.solution : this.entityCode == EntityCodes.stockSolution ? CommonMessages.calibMaterial : CommonMessages.material;
        else if (!CommonMethods.hasValue(this.f.materialAlies.value))
            return this.labels.refNumber == 'Solution Short Name/Code' ? CommonMessages.materailShort : CommonMessages.stprefcode;
        // else if (this.f.materialAlies.value.split(' ').length > 1)
        //     return CommonMessages.materialAliesValid;
        else if (!CommonMethods.hasValue(this.f.materialType.value))
            return CommonMessages.materialType;
        else if (!CommonMethods.hasValue(this.f.materialUom.value))
            return CommonMessages.materialUom;
    }

    clear() {
        this.addMaterialForm.reset({});
        if (this.entityCode == EntityCodes.indicators)
            this.setOutPutMaterial();
    }

    setOutPutMaterial() {
        var type = this.typeParamList.filter(x => x.paramAlies == 'LIQ')
        this.f.materialType.setValue(type[0].paramKey)
        var uom = this.uomParamList.filter(x => x.paramAlies == 'ML')
        this.f.uom.setValue(uom[0].paramKey);
    }

    close() {
        this._matAct.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}