import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { PageTitle } from '../services/utilities/pagetitle';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from '../services/utilities/commonmethods';
import { CommonMessages } from '../messages/commonMessages';
import { AlertService } from '../services/alert.service';
import { CommonService } from '../services/commonServices';
import { Subscription } from 'rxjs';
import { materialUomCon } from '../model/commonModel';
import { ActionMessages, GridActions, EntityCodes } from '../services/utilities/constants';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { MngMasterMessage } from 'src/app/manageMaster/model/mngMasterMessage';
import { materialCatInfo } from 'src/app/limsHelpers/entity/limsGrid';

@Component({
    selector: 'uom-con',
    templateUrl: '../html/materialUomConversions.html'
})

export class MaterialUomConversionsComponent {

    pageTitle: string = PageTitle.uomConversion;
    pageType: string = 'MNG';
    headerData: any;
    dataSource: any;
    targetValue: number;
    targetUom: number;
    materialID: number;
    subscription: Subscription = new Subscription();
    uomList: any;
    materialName: string;
    sourceName: string;
    actions: any = [GridActions.changeStatus]
    removeAction: any = { headerName: 'isActive', action: 'CHGSTAT' };
    isChnage: boolean = false;
    entityType: string;
    material: materialCatInfo = new materialCatInfo();
    isShowMaterial: boolean = true;
    entityCode: string = EntityCodes.qcInventory
    constructor(private _closeModal: MatDialogRef<MaterialUomConversionsComponent>, public _global: GlobalButtonIconsService,
        private _alert: AlertService, private _service: CommonService, private _confirmService: ConfirmationService) {

        // this.material.categoryCode = 'LAB_MAT';
        // this.material.isCategoryShow = false;
        // this.material.condition = "CAT_CODE = 'LAB_MAT'";

        this.material.condition = "CAT_CODE IN ('LAB_MAT', 'WATER_MAT')";
        this.material.isCategoryShow = true;
        this.material.isSubCategoryShow = true;
        this.material.categoryList = [{ catCode: 'LAB_MAT' }, { catCode: 'WATER_MAT' }]
        this.material.subCategories = [{ subCatCode: 'WATERMILLI_Q' }]
    }

    ngAfterContentInit() {
        this.subscription = this._service.commonSubject.subscribe(resp => {
            if (resp.purpose == "getMaterialUOMConvertions"){
                this.uomList = resp.result;}
            else if (resp.purpose == 'getMaterialUomDetails') {
                this.materialName = resp.result.materialName;
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.sourceName = resp.result.baseUom;
                this.dataSource = CommonMethods.increaseSNo(resp.result.list);
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(this.dataSource, 'filterTwiceCol', ['effectiveFrom', 'effectiveTo']))
            }
            else if (resp.purpose == "addMaterialConvertData") {
                if (resp.result == 'SUCCESS') {
                    this._alert.success(CommonMessages.succUomCon);
                    this._service.getMaterialUomDetails(this.materialID);
                    this.clear();
                    this.isChnage = true;
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));

            }
            else if (resp.purpose == "changeUomConvertionStatus") {
                if (resp.result == "SUCCESS") {
                    this._alert.success(CommonMessages.succChngesta);
                    this._service.getMaterialUomDetails(this.materialID);
                    this.isChnage = true;
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));

            }
        })

        this.prepareHeaders();
        if (CommonMethods.hasValue(this.materialID))
            this.bindData();


        this.entityType = sessionStorage.getItem('entitytype');
    }

    bindData() {
        this._service.getMaterialUOMConvertions()
        this._service.getMaterialUomDetails(this.materialID);
    }

    addConversion() {
        var errMsg = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        var obj: materialUomCon = new materialUomCon();
        obj.materialID = this.materialID;
        obj.targetUom = this.targetUom;
        obj.targetValue = this.targetValue;
        this._service.addMaterialConvertData(obj);

    }

    materialData(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.materialID)) {
            this.materialID = evt.materialID;
            this.bindData();
        }
        else
            this.materialID = 0;
    }

    validation() {
        if (!CommonMethods.hasValue(this.targetValue))
            return CommonMessages.targetVal;
        if (!CommonMethods.hasValue(this.targetUom))
            return CommonMessages.targetUom;
    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 10);
    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ columnDef: 'sno', header: 'S.No.', cell: (element: any) => `${element.sno}`, width: 'maxWidth-10per' });
        this.headerData.push({ columnDef: 'convertedUom', header: 'Target UOM', cell: (element: any) => `${element.convertedUom}`, width: 'maxWidth-15per' });
        this.headerData.push({ columnDef: "value", header: 'Conversion Factor', cell: (element: any) => `${element.value}`, width: 'minWidth-10per' });
        this.headerData.push({ columnDef: 'effectiveFrom', header: "Effective From", cell: (element: any) => `${element.effectiveFrom}`, width: "maxWidth-15per" });
        this.headerData.push({ columnDef: 'effectiveTo', header: "Effective To", cell: (element: any) => `${element.effectiveTo}`, width: "maxWidth-15per" });
    }

    clear() {
        this.targetValue = null;
        this.targetUom = 0;
    }

    onActionClicked(evt) {
        if (evt.action == GridActions.changeStatus) {
            this._confirmService.confirm(MngMasterMessage.confirmChangeStatus).subscribe((confirmed) => {
                if (confirmed) {
                    this._service.changeUomConvertionStatus(evt.val.convertedUomID);
                }
            })
        }
    }

    close() {
        this._closeModal.close(this.isChnage);
    }

    getConversionTitles(type: string) {
        if (type == 'MAT_NAME')
            return this.entityType == 'SOLMGMT' || this.entityType == 'LABINV' ? 'Chemical Name' : 'Material Name';
        else if (type == 'PAGE_TITLE')
            return this.entityType == 'SOLMGMT' || this.entityType == 'LABINV' ? PageTitle.uomChmicalConversion : PageTitle.uomConversion;
        else if (type == 'SOURCE_UOM')
            return this.entityType == 'SOLMGMT' || this.entityType == 'LABINV' ? 'Source UOM' : 'Source';
    }

}