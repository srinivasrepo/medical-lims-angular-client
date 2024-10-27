import { Component, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { LimsHelperService } from '../services/limsHelpers.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { Subscription } from 'rxjs';
import { materialCatInfo, LookupInfo, LookUpDisplayField } from '../entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LookupComponent } from './lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../entity/lookupTitles';
import { LookupCodes, MaterialCategories, EntityCodes } from 'src/app/common/services/utilities/constants';

@Component({
    selector: 'mat-cat',
    templateUrl: '../html/materialCategoryComponent.html'
})

export class materialCategoryComponent implements OnDestroy {

    categories: any = [];
    allCategories: any = [];
    category: string = '';
    categoryID: number;
    categoryName: string;
    subCategoryName: string;
    materialName: string;
    subCategories: Array<any> = [];
    subCategoryCode: string;
    subCategory: number;
    materialID: number;
    @Input('materialInfo') materialInfo: materialCatInfo = new materialCatInfo();
    subscription: Subscription = new Subscription();
    matInfo: LookupInfo;
    @ViewChild('materials', { static: true }) materials: LookupComponent;
    @Output() selectedMaterial: EventEmitter<any> = new EventEmitter();
    condition: string = '1=2';
    disable: boolean = false;
    @Input('entityCode') entityCode: string;

    constructor(private _service: LimsHelperService, private _limsContext: LIMSContextServices) { }

    ngAfterContentInit() {
        this.subscription = this._service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialCategories") {
                this.allCategories = resp.result;
                if (CommonMethods.hasValue(this.category)) {
                    var obj = this.allCategories.filter(ob => ob.paramCode == this.category);
                    this.categoryName = obj[0].paramName;
                }
                this.prepareCatList();
            }
            else if (resp.purpose == "getMaterialSubCategories") {
                this.subCategories = resp.result;



                if (this.entityCode == EntityCodes.qcInventory && !this.materialInfo.isSubCategoryShow) {

                    var removeActions = ['MOBILE_PHASE', 'TEST_SOLUTIONS_INDICATORS', 'VOLUMETRIC_SOL', 'STOCK_SOLUTION', 'RINSING_SOLUTION']

                    removeActions.forEach((item) => {
                        var index = this.subCategories.findIndex(x => x.caT_ITEM_CODE == item);
                        this.subCategories.splice(index, 1);
                    })
                }

                if (CommonMethods.hasValue(this.materialInfo.subCategories) && this.materialInfo.subCategories.length > 0) {
                    var obj: any = []
                    this.materialInfo.subCategories.forEach(o => {
                        var item = this.subCategories.filter(x => x.caT_ITEM_CODE == o.subCatCode);
                        if (item.length > 0)
                            obj.push(item[0]);
                    })
                    if (obj.length > 0)
                        this.subCategories = obj;
                }
                if (this.subCategories.length == 1) {
                    this.subCategory = this.subCategories[0].caT_ITEMID;
                    this.selectSubCategory();
                }
            }
            else if (resp.purpose == "getMaterialDetailsByMatID") {
                var obj = this.categories.filter(ob => ob.paramID == resp.result.category)
                this.category = obj[0].paramCode
                this.bindSubCategories();
                this.subCategory = resp.result.subcatid;
            }
        });
        this.getCategories();
        if (CommonMethods.hasValue(this.materialInfo.categoryCode)) {
            this.category = this.materialInfo.categoryCode;
            this.bindSubCategories();
        }
        this.subCategory = this.materialInfo.subCategoryID;
        if (CommonMethods.hasValue(this.materialInfo.materialID)) {
            this.materials.setRow(this.materialInfo.materialID, this.materialInfo.materialName);
            this.materialID = this.materialInfo.materialID;
        }
        this.prepareLkup();
    }

    prepareCatList() {
        if (CommonMethods.hasValue(this.materialInfo.categoryList) && this.materialInfo.categoryList.length > 0) {
            var obj: any = []
            this.materialInfo.categoryList.forEach(x => {
                this.allCategories.forEach(o => {
                    if (o.paramCode == x.catCode)
                        obj.push(o);
                })
            });
            this.categories = obj;
        }
        else
            this.categories = this.allCategories;
    }

    getCategories() {
        this._service.getMaterialCategories();
    }

    selectCategory() {
        this.subCategories = [];
        this.subCategory = 0;
        this.categoryID = 0;
        if (!CommonMethods.hasValue(this.materialInfo.isSubCategoryShow) && CommonMethods.hasValue(this.category))
            this.condition = "CAT_CODE = '" + this.category + "'"
        else if (!CommonMethods.hasValue(this.category))
            this.condition = "1 = 2";
        this.selectSubCategory();
        var obj = this.categories.filter(obj => obj.paramCode == this.category);
        if (obj.length > 0)
            this.categoryID = obj[0].paramID;
        if (CommonMethods.hasValue(this.category) && CommonMethods.hasValue(this.materialInfo.isSubCategoryShow))
            this.bindSubCategories();
    }

    bindSubCategories() {
        if (this.category == MaterialCategories.GetMaterialCategoryCode(this.category))
            this.subCategories.push({ caT_ITEMID: 0, caT_ITEM: "Not Applicable" });
        else
            this._service.getMaterialSubCategories(MaterialCategories.GetMaterialCategoryCode(this.category));
        var obj = this.categories.filter(obj => obj.paramCode == this.category);
        if (obj.length > 0)
            this.categoryID = obj[0].paramID;
    }

    selectSubCategory() {
        this.materials.clear();
        this.prepareLkup();
        this.updateData();
    }

    prepareLkup() {

        // if (this.entityCode == EntityCodes.mobilePhase || this.entityCode == EntityCodes.sampleAnalysis)
        this.condition = this.materialInfo.condition;
        if (!CommonMethods.hasValue(this.condition))
            this.condition = "1=2";
        if (CommonMethods.hasValue(this.category))
            this.condition = this.materialInfo.lkpType == 'WRS' ? this.condition + "AND MAT_CATCODE = '" + this.category + "'" : this.materialInfo.lkpType == 'SEARCH' ? "CATEGORY_CODE = '" + this.category + "'" : "CAT_CODE = '" + this.category + "'";
        if (this.entityCode != EntityCodes.analystQualif && this.materialInfo.isSubCategoryShow && CommonMethods.hasValue(this.subCategory))
            this.condition = this.materialInfo.lkpType == 'WRS' ? this.condition + "AND SUBCATID = " + this.subCategory : "SUBCATID = " + this.subCategory;

        if (this.materialInfo.lkpType != "WRS" && this.materialInfo.IsActive)
            this.condition = this.condition == "1=2" ? "1=2" : this.condition + ' AND STATUS_CODE= ' + "\'ACT\'";

        var lkpCode: LookupCodes = LookupCodes.plantMaterials;

        if (this.materialInfo.lkpType == "WRS")
            lkpCode = LookupCodes.WRKREFSampleMaterials;
        else if (this.materialInfo.lkpType == "SEARCH")
            lkpCode = LookupCodes.searchPlantMaterials;

        if (this.entityCode == EntityCodes.mobilePhase || (this.entityCode == EntityCodes.sampleAnalysis && this.materialInfo.material == 'Chemical'))
            this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Chemical, lkpCode, LKPDisplayNames.Chemical, LKPDisplayNames.ChemicalCode, LookUpDisplayField.code, LKPPlaceholders.Chemical, this.condition);
        else if ((this.entityCode == EntityCodes.sampleAnalysis && this.materialInfo.material == 'Material') || this.entityCode == EntityCodes.analystQualif)
            this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Materials, lkpCode, LKPDisplayNames.Material, LKPDisplayNames.MaterialCode, LookUpDisplayField.code, LKPPlaceholders.Material, this.condition);
        else if (this.entityCode == EntityCodes.dataReview || this.entityCode == EntityCodes.analyticalDataReview)
            this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Materials, lkpCode, LKPDisplayNames.Material, LKPDisplayNames.MaterialCode, LookUpDisplayField.code, LKPPlaceholders.Material, this.condition);

        else {

            if (this.entityCode == EntityCodes.volumetricSol)
                this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Chemical, lkpCode, LKPDisplayNames.Chemical, LKPDisplayNames.ChemicalCode, LookUpDisplayField.code, LKPPlaceholders.Chemical, this.condition);
            else if (this.entityCode == EntityCodes.qcInventory) {
                this.condition = this.condition;
                this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Chemical, lkpCode, LKPDisplayNames.Chemical, LKPDisplayNames.ChemicalCode, LookUpDisplayField.header, LKPPlaceholders.qcInvtChemical, this.condition)

            } else {

                if (!CommonMethods.hasValue(this.subCategory) && this.materialInfo.lkpType != "WRS")
                    this.condition = "CATEGORY_CODE= 'SUBCAT_LABCHEM'" + ' AND STATUS_CODE= ' + "\'ACT\'";
                if (this.entityCode == EntityCodes.rinsingSolutions)
                    this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Chemical, lkpCode, LKPDisplayNames.Chemical, LKPDisplayNames.ChemicalCode, LookUpDisplayField.code, LKPPlaceholders.Chemical, this.condition);
                else
                    this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.regent, lkpCode, LKPDisplayNames.reagent, LKPDisplayNames.reagentCode, LookUpDisplayField.code, LKPPlaceholders.reagent, this.condition);
            }
        }
    }

    onSelectedLookup(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val)) {
            this.materialID = evt.val.id;
            if (!CommonMethods.hasValue(this.subCategory))
                this._service.getMaterialDetailsByMatID(this.materialID);
        }
        else this.materialID = 0;
        this.updateData();
        this.prepareLkup();
    }

    clear() {
        this.category = "";
        this.categoryID = 0;
        this.subCategory = 0;
        this.materials.clear();
    }

    bindData() {
        setTimeout(() => {
            this.category = this.materialInfo.categoryCode;
            this.bindSubCategories();
            this.subCategory = this.materialInfo.subCategoryID;
            if (CommonMethods.hasValue(this.materialInfo.materialID)) {
                this.materials.setRow(this.materialInfo.materialID, this.materialInfo.materialName);
                this.materialID = this.materialInfo.materialID;
            }
            this.updateData();
        }, 200);
    }

    enableHeaders(val: boolean) {
        this.materials.disableBtn = this.disable = val;
    }

    updateData() {
        var category: any;
        if (CommonMethods.hasValue(this.category)) {
            category = this.categories.filter(x => x.paramCode == this.category);
            this.categoryName = category[0].paramName;
        }

        if (CommonMethods.hasValue(this.subCategory) && this.subCategories.length > 0) {
            var subCatObj = this.subCategories.filter(ob => ob.caT_ITEMID == this.subCategory)[0];
            this.subCategoryName = subCatObj.caT_ITEM
            this.subCategoryCode = subCatObj.caT_ITEM_CODE;
        }
        if (CommonMethods.hasValue(this.materials.selectedId))
            this.materialName = this.materials.selectedText
        var obj = { categoryCode: this.category, categoryName: this.categoryName, subCategoryID: this.subCategory, subCategoryName: this.subCategoryName, materialID: this.materialID, materialName: this.materialName, categoryID: CommonMethods.hasValue(category) && category.length > 0 ? category[0].paramID : 0, subCategoryCode: this.subCategoryCode }
        this.selectedMaterial.emit(obj);
    }

    getEntityControlNames(type: string) {
        if (type == 'CAT' && this.entityCode == EntityCodes.indicators)
            return 'Sub Category';
        if (type == 'CAT' && this.entityCode == EntityCodes.volumetricSol)
            return 'Select Sub Category';
        else
            return this.materialInfo.subCategory

    }

    isdisableBtnLkp(val: boolean) {
        this.disable = val;
        this.materials.disableBtn = val;
    }

    setCols() {
        return (this.materialInfo.isCategoryShow && this.materialInfo.isSubCategoryShow) || (!this.materialInfo.isCategoryShow && !this.materialInfo.isSubCategoryShow) ? 2 : 1;
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}