import { Component, Input, ViewChild } from "@angular/core";
import { QCInventoryService } from '../service/QCInventory.service';
import { Subscription } from 'rxjs';
import { materialCatInfo, LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LimsHelperService } from 'src/app/limsHelpers/services/limsHelpers.service';
import { EntityCodes, PageUrls, ButtonActions, LookupCodes, ActionMessages } from 'src/app/common/services/utilities/constants';
import { ManageQcInvtDetails } from '../model/QCInventorymodel';
import { AlertService } from 'src/app/common/services/alert.service';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { materialCategoryComponent } from 'src/app/limsHelpers/component/materialCategory.component';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MatDialog } from '@angular/material';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';

@Component({
    selector: 'manage-qcinventory',
    templateUrl: '../html/manageQCInventory.html',
})

export class ManageQcInventoryComponent {
    subscription: Subscription = new Subscription();
    entityCode: string = EntityCodes.qcInventory;
    materialInfo: materialCatInfo = new materialCatInfo();
    @ViewChild('materialCategory', { static: false }) materialCategory: materialCategoryComponent;
    quantity: number;
    batchNo: string;
    pageTitle: string = PageTitle.stockManagement;
    backUrl: string = PageUrls.searchQcInvtUrl;
    chemicalName: string = '';
    chemicalCode: string = '';
    uomName: string = '';
    uomList: any;
    btnType: string = ButtonActions.btnSave;
    readonly: boolean = false;
    confirmDisable: boolean = true;
    subCategory: string;

    manufacturerInfo: LookupInfo;
    @ViewChild("manufacturer", { static: false }) manufacturer: LookupComponent;

    // currentDate: Date = new Date();
    manageInvtDetails: ManageQcInvtDetails = new ManageQcInvtDetails();
    isLoaderStart: boolean = false;
    constructor(private _qcInvtService: QCInventoryService, private _service: LimsHelperService, public _global: GlobalButtonIconsService,
        private _alertService: AlertService, private _matDailog: MatDialog, private _confirmService: ConfirmationService) {
        //this.materialInfo.categoryCode = 'LAB_MAT';
        this.materialInfo.isCategoryShow = false;
        this.materialInfo.isSubCategoryShow = false;
        this.materialInfo.condition = "CAT_CODE IN ('LAB_MAT') AND CAT_ITEM_CODE NOT IN ('MOBILE_PHASE', 'TEST_SOLUTIONS_INDICATORS', 'VOLUMETRIC_SOL', 'STOCK_SOLUTION', 'RINSING_SOLUTION')";
    }

    ngAfterContentInit() {
        this.subscription = this._qcInvtService.QCInventSubject.subscribe(res => {
            if (res.purpose == 'manageQcInvt') {
                this.isLoaderStart = false;
                if (res.result == 'OK') {
                    this.btnType = 'Save';
                    this.materialCategory.clear();
                    this.batchNo = '';
                    this.quantity = null;
                    this.manufacturer.clear();
                    this.confirmDisable = true;
                    this.materialCategory.enableHeaders(false);
                    return this._alertService.success(QCInvtMessages.successManageQCInvt);
                }
                else {
                    this._alertService.error(ActionMessages.GetMessageByCode(res.result));
                    this.btnType = 'Save';
                    this.readonly = false;
                    this.confirmDisable = true;
                    this.materialCategory.enableHeaders(false);
                }
            }
            else if (res.purpose == 'getMaterialDetailsByID') {
                this.uomList = res.result;
                this.chemicalName = this.uomList.materialName;
                this.chemicalCode = this.uomList.materialCode;
                this.uomName = this.uomList.uomName;
                this.subCategory = this.uomList.subCategory;
            }
        });

        this.prepareLkp();
    }

    materialData(event) {
        this.materialInfo.categoryCode = event.categoryCode;
        this.materialInfo.subCategoryID = event.subCategoryID;
        this.materialInfo.materialID = event.materialID;
        if (CommonMethods.hasValue(this.materialInfo.materialID))
            this._qcInvtService.getMaterialDetailsByID(this.materialInfo.materialID);
        else {
            this.uomName = '';
            this.chemicalName = '';
            this.chemicalCode = '';
            this.subCategory = '';
        }
    }

    prepareLkp() {
        var condition: string = "STATUS_CODE = 'ACT'";
        this.manufacturerInfo = CommonMethods.PrepareLookupInfo(LKPTitles.manufacturer, LookupCodes.getManufacturers, LKPDisplayNames.manufacturer,
            LKPDisplayNames.manufacturerCode, LookUpDisplayField.header, LKPPlaceholders.manufacturer, condition);
    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 5);
    }

    validation() {
        if (!CommonMethods.hasValue(this.materialInfo.materialID))
            return QCInvtMessages.chemicalCode;
        if (!CommonMethods.hasValue(this.manufacturer.selectedId))
            return QCInvtMessages.manufacturer;
        if (!CommonMethods.hasValue(this.quantity)) {
            if (this.quantity == 0)
                return QCInvtMessages.zeroQuantity;
            else return QCInvtMessages.quantityMsg;
        }
        if (!CommonMethods.hasValue(this.batchNo))
            return QCInvtMessages.batchNoMsg;
    }

    manageQcInvt() {
        let validate: string = this.validation();
        if (this.btnType == 'Save') {
            if (CommonMethods.hasValue(validate) && this.btnType == 'Save')
                return this._alertService.warning(validate);
            else {
                this.readonly = true;
                this.btnType = 'Update';
                this.confirmDisable = false;
                this.materialCategory.enableHeaders(true);
                return this._alertService.info(QCInvtMessages.savingQCInventory);
            }
        } else {
            this.btnType = 'Save';
            this.readonly = false;
            this.confirmDisable = true;
            this.materialCategory.enableHeaders(false);
        }
        // this.manageInvtDetails.userBeforeDate = this.useBeforeDate;
    }

    confirm() {
        if (this.btnType == 'Update') {
            this._confirmService.confirm(QCInvtMessages.confirmStockManagement).subscribe(confirm => {
                if (confirm) {
                    this.materialCategory.enableHeaders(true);
                    this.manageInvtDetails.entityCode = this.entityCode;
                    this.manageInvtDetails.matID = this.materialInfo.materialID;
                    this.manageInvtDetails.batchNumber = this.batchNo;
                    this.manageInvtDetails.qty = this.quantity;
                    this.manageInvtDetails.mfgID = this.manufacturer.selectedId;
                    this.readonly = false;
                    this.isLoaderStart = true;
                    this._qcInvtService.manageQcInventory(this.manageInvtDetails);
                }
            });
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
