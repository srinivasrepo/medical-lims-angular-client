import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { ActivatedRoute } from '@angular/router';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, GridActions, EntityCodes, ConditionCodes } from 'src/app/common/services/utilities/constants';
import { viewMobilePhase, GetMobilePreparationList } from '../model/mobilePhaseModel';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from 'src/app/common/services/utilities/commonmethods';
import { PrepareOccupancyBO } from 'src/app/common/services/utilities/commonModels';
import { MatDialog } from '@angular/material';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';
import { ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';
import { ManageAddFieldComponent } from 'src/app/limsHelpers/component/manageAddField.component';

@Component({
    selector: 'view-mp',
    templateUrl: '../html/viewMobilePhase.html'
})

export class viewMobilePhaseComponent {

    encMobilePhaseID: string;
    subscription: Subscription = new Subscription();
    pageTitle: string = PageTitle.viewMobilePhase;
    backUrl: string = PageUrls.searchMobile;
    mobileRe: viewMobilePhase = new viewMobilePhase();
    headerData: any = [];
    dataSource: any = [];
    action: any = [GridActions.MNG_OCC];
    viewHistory: any;
    status: string;
    refNo: string;
    preparationList: GetMobilePreparationList = new GetMobilePreparationList();
    typeCode: string = 'MPHASE_PREP_TLC';
    purposeType: string;
    finalVolume: string;
    uom: string;
    removeActions: any = { headerName: 'Solvents' };
    extraColumns: any
    rs232Obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();
    entityCode: string = EntityCodes.mobilePhase;
    @ViewChild('viewCustField', { static: false }) viewCustField: ManageAddFieldComponent;

    constructor(private mpService: mobilePhaseService, private actRoute: ActivatedRoute,
        private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(param => this.encMobilePhaseID = param['id'])
        this.subscription = this.mpService.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "viewMobilePhaseData") {
                this.prepageHeader();
                this.mobileRe = resp.result.mobilePhase;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solvents, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.status = resp.result.mobilePhase.status;
                this.refNo = resp.result.mobilePhase.mobilePhaseCode;
                this.preparationList = resp.result.preparation;
                this.purposeType = resp.result.mobilePhase.purposeCode;
                this.finalVolume = resp.result.mobilePhase.finalVol;
                this.uom = resp.result.mobilePhase.uom;

                this.rs232Obj.entityActID = this.encMobilePhaseID;
                this.rs232Obj.conditionCode = ConditionCodes.MOBILE_PHASE;
                this.rs232Obj.reqCode = this.refNo;
                this.rs232Obj.entityCode = EntityCodes.mobilePhase;

                this.viewCustField.getRS232IntegrationOther();
            }
        })

        this.mpService.viewMobilePhaseData(this.encMobilePhaseID)
        this.tranHistory();
    }

    prepageHeader() {
        this.headerData = [];
        this.extraColumns = [];
        this.headerData.push({ columnDef: 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-4per' });
        // this.headerData.push({ columnDef: 'chemicalType', "header": "Name of the Reagents / Solvents", cell: (element: any) => `${element.chemicalType}`, width: 'minWidth-20per' });
        this.extraColumns.push({ columnDef: 'materialCode', header: 'Chemical Code', cell: (element: any) => `${element.materialCode}`, width: 'maxWidth-10per' });
        this.headerData.push({ columnDef: 'materialName', "header": "Chemical", cell: (element: any) => `${element.materialName}`, width: 'minWidth-30per' });
        //this.headerData.push({ columnDef: 'batchNumber', "header": "Batch No.", cell: (element: any) => `${element.batchNumber}`, width: 'maxwidth-15per' });
        this.headerData.push({ columnDef: 'packBatchNumber', "header": "Batch No.(Pack No.)", cell: (element: any) => `${element.packBatchNumber}`, width: 'maxWidth-11per' });
        this.headerData.push({ columnDef: 'quantity', "header": "Quantity Taken", cell: (element: any) => `${element.quantity}`, width: 'maxwidth-10per' });

        this.extraColumns.push({ columnDef: 'equipmentUserCodes', "header": "Instrument ID(s)", cell: (element: any) => `${element.equipmentUserCodes}`, width: 'maxWidth-15per' });
        this.extraColumns.push({ columnDef: 'denomination', "header": "Conversion Factor", cell: (element: any) => `${element.denomination}`, width: 'maxWidth-15per' });
        this.extraColumns.push({ columnDef: 'useBeforeDate', "header": "Valid Up to", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-15per' })
        this.extraColumns.push({ columnDef: 'balanceQuantity', "header": "Pack Qty.", cell: (element: any) => `${element.balanceQuantity}`, width: 'maxWidth-20per' });
        // this.extraColumns.push({ columnDef: 'reservedQuantity', "header": "Reserved Qty.", cell: (element: any) => `${element.reservedQuantity}`, width: 'maxWidth-20per' });
        // this.extraColumns.push({ columnDef: 'actBalanceQty', "header": "Available Qty.", cell: (element: any) => `${element.actBalanceQty}`, width: 'maxWidth-20per' });
        this.extraColumns.push({ columnDef: 'purity', "header": "Purity / Potency / Assay", cell: (element: any) => `${element.purity}`, width: 'maxWidth-20per' });
        this.extraColumns.push({ columnDef: 'density', "header": "Density / Normality / Molarity", cell: (element: any) => `${element.density}`, width: 'maxWidth-20per' });
        this.extraColumns.push({ columnDef: 'stdAvg', "header": "Strength", cell: (element: any) => `${element.stdAvg}` });
        this.extraColumns.push({ columnDef: 'manufacture', "header": "Manufacturer ", cell: (element: any) => `${element.manufacture}` })
    }




    preparationTypes: Array<string> = ['HPLC', 'UPL'];

    getActiveControls() {
        return (this.preparationTypes.includes(this.mobileRe.preparationType))
    }

    onActionClicked(evt) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = evt.val.batchNumber;
        obj.encEntityActID = evt.val.preparationID;
        obj.occSource = 'MPHASE_PREP_BATCH';
        obj.invID = evt.val.invID;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
        obj.occSourceName = 'Lab Chemicals';

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.mobilePhase;
        modal.componentInstance.condition = 'TYPE_CODE = \'ANALYTICAL BALANCE\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    openOccupancy(item: any) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'Eqp_Sam_Ana';
        obj.encEntityActID = item.preparationID;
        // obj.occSource = 'MPHASE_PH_METER';
        obj.occSource = item.preparationCode;
        obj.conditionCode = EntityCodes.mobilePhase;
        obj.occSource = item.preparationName;

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.mobilePhase;
        modal.componentInstance.pageTitle = "Instrument Occupancy";
        // modal.componentInstance.condition = 'TYPE_CODE = \'PH METER\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';

    }

    Uploadfiles(section: string) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.mobilePhase, 0, section, this.encMobilePhaseID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
    }

    formatValueString(val) {
        return CommonMethods.FormatValueString(val);
    }


    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encMobilePhaseID;
        obj.code = 'MOBILE_PHASE';
        this.viewHistory = obj;
    }

    getSpec() {
        var obj: any = { specID: this.mobileRe.preparationTypeCode == "ANALYSIS" ? this.mobileRe.specID : 0, calibID: this.mobileRe.preparationTypeCode != 'ANALYSIS' ? this.mobileRe.calibPramID : 0 };

        const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = this.mobileRe.preparationTypeCode == "ANALYSIS" ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
        modal.componentInstance.encSpecID = obj.specID;
        modal.componentInstance.entityCode = EntityCodes.mobilePhase;
        modal.componentInstance.encCalibID = obj.calibID;
        modal.componentInstance.isShow = true;
    }

    getPreparationUnEmptyList() {
        // return this.phasePrepation.filter(x => this.purposeType != this.typeCode ? x.preparation != null && x.preparation.trim() != "" : x);
        return this.preparationList.filter(x => this.purposeType != this.typeCode ? (CommonMethods.hasValue(x.preparation) && x.isVisible) : x.isVisible);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}