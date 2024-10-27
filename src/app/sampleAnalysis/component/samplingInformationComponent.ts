import { Component, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ButtonActions, EntityCodes, ActionMessages, PageUrls, LookupCodes } from 'src/app/common/services/utilities/constants';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { manageSamplingInfo, GetSamplePacks, AnalysisHeaderBO } from '../model/sampleAnalysisModel';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from 'src/app/common/services/utilities/commonmethods';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { manageSamplePackComponent } from './manageSamplePackComponent';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { AppBO, PrepareOccupancyBO } from 'src/app/common/services/utilities/commonModels';
import { Router } from '@angular/router';
import { LookupInfo, LookUpDisplayField, ManageRS232IntegrationFieldsBO } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { ManageAddFieldComponent } from 'src/app/limsHelpers/component/manageAddField.component';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';

@Component({
    selector: 'samp-info',
    templateUrl: '../html/samplingInformation.html'
})

export class SamplingInformationComponent {

    @Input() pageType: string = 'MNG';
    btnUpload: string = ButtonActions.btnUpload;
    btnType: string = ButtonActions.btnSave;
    samplingInfo: manageSamplingInfo = new manageSamplingInfo();
    uomList: any;
    subscription: Subscription = new Subscription();
    maxDate: any = new Date();
    showCompositeSample: boolean = false;
    showQtyAnalysis: boolean = true;
    showReserveSample: boolean = false;
    sampleReceivedOn: any
    specTypeCode: string;
    sampleTypeCode: string;
    analysisInfo: any;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    appBO: AppBO = new AppBO();
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: false }) equipment: LookupComponent;
    condition: string;
    showCompQty: boolean = false;
    isLoaderStart: boolean;
    totalPackQty: number;
    rs232Obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();

    @ViewChild('mngCustFields', { static: false }) mngCustField: ManageAddFieldComponent;


    constructor(private _saService: SampleAnalysisService, public _global: GlobalButtonIconsService, private _matDailog: MatDialog, private _limsContext: LIMSContextServices,
        private _alert: AlertService, private store: Store<fromAnalysisOptions.AnalysisState>, private _route: Router) { }


    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                this.headerInfo = analysis;
                if (this.mngCustField && analysis && CommonMethods.hasValue(this.headerInfo.arID)) {
                    this.rs232Obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode); //localStorage.getItem('conditionCode');
                    this.rs232Obj.entityActID = analysis.act.encTranKey;
                    this.rs232Obj.reqCode = analysis.act.referenceNumber;
                    this.rs232Obj.batchNumber = analysis.invBatchNumber;

                    this.mngCustField.getRS232IntegrationOther();

                }
            });

        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(analysis => {
                this.appBO = analysis;
                this.getData();
                this.getMaterilaUoms();
            });
        this.prepareEquipment();
    }

    ngAfterViewInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getConvertableUOMByMatID")
                this.uomList = resp.result.filter(x => x.uomCode != 'KG' && x.uomCode != 'LT' && x.uomCode != 'TN');

            else if (resp.purpose == "mangeSampleAnalysis") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    // this.appBO.initTime = resp.result.initTime;
                    // this.store.dispatch(new analysisActions.UpdateAnalysisAppInfo(this.appBO));
                    // this.headerInfo.status = resp.result.status;
                    // this.store.dispatch(new analysisActions.UpdateAnalysisInfo(this.headerInfo));
                    // this._alert.success(SampleAnalysisMessages.samplingSuccess);
                    // this.enableHeaders(false);
                    // this.getData();
                    this._alert.success(SampleAnalysisMessages.samplingSuccess);
                    this._route.navigateByUrl(PageUrls.homeUrl);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getSamplingInfo") {
                this.bindData(resp.result);
                this.showCompQty = resp.result.showCompQty;
                this.enableHeaders(!CommonMethods.hasValue(this.samplingInfo.deviation));
            }
        })

    }

    getMaterilaUoms() {
        if (CommonMethods.hasValue(this.headerInfo.matID) && CommonMethods.hasValue(this.appBO.transKey) && (!CommonMethods.hasValue(this.uomList) || this.uomList.length == 0))
            this._saService.getConvertableUOMByMatID(this.headerInfo.matID, this.appBO.encTranKey);
    }

    getData() {
        if (CommonMethods.hasValue(this.appBO.transKey) && !CommonMethods.hasValue(this.samplingInfo.reviewedBy))
            this._saService.getSamplingInfo(this.appBO.encTranKey);
    }

    Uploadfiles(section: string = 'SAMCHK') {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(section == 'PREINSP' ? 'MATIN' : EntityCodes.sampleAnalysis, 0, section, section == "PREINSP" ? this.samplingInfo.encIoID : this.headerInfo.encSamAnaID, [], section == 'PREINSP' ? 'MEDICALLIMS' : 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.mode = this.pageType == 'MNG' ? this.btnUpload == ButtonActions.btnViewDocus || section == 'PREINSP' ? 'VIEW' : 'MANAGE' : 'VIEW';
    }

    allowDecimals(val) {
        return CommonMethods.allowDecimal(val, 8, 3, 7);
    }

    allowNumbers(val) {
        return CommonMethods.allowNumber(val, '');
    }

    getSampledBy(val) {
        return CommonMethods.hasValue(val) ? val : CommonMethods.FormatValueString("");
    }

    prepareEquipment() {
        this.condition = "EQP_CAT_CODE = 'QCINST_TYPE' AND TYPE_CODE = 'SAMPLING_TOOL'";
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getActiveEquipments, LKPDisplayNames.Equipment, LKPDisplayNames.EquipmentCode, LookUpDisplayField.header, LKPPlaceholders.samplerID, this.condition);
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        if (CommonMethods.hasValue(this.equipment))
            this.equipment.disableBtn = !val;
    }

    validation() {
        if (!CommonMethods.hasValue(this.samplingInfo.sampleCollected))
            return SampleAnalysisMessages.sampleCollected;
        if (this.samplingInfo.sampleCollected == 'S') {
            if (this.cntlShowCondtions('SAMPLER_ID') && !this.equipment.selectedId)
                return SampleAnalysisMessages.samplerID;
            if (!CommonMethods.hasValue(this.samplingInfo.noofContainers))
                return SampleAnalysisMessages.noofContainer;
            if (!CommonMethods.hasValue(this.samplingInfo.samplingPoint) && this.headerInfo.inwardType == 'WATER')
                return SampleAnalysisMessages.samplingPoint;
            if (!CommonMethods.hasValue(this.sampleReceivedOn))
                return SampleAnalysisMessages.sampleReceivedOn;
            if (this.cntlShowCondtions('QTY_FROM') && !CommonMethods.hasValue(this.samplingInfo.qtyFrom))
                return SampleAnalysisMessages.qtyFrom;
            if (this.showCompositeSample && !CommonMethods.hasValue(this.samplingInfo.compositeSampleQty))
                return SampleAnalysisMessages.compositeSampQty;
            if (!CommonMethods.hasValue(this.samplingInfo.uom))
                return SampleAnalysisMessages.uom;
            if (this.showQtyAnalysis && !CommonMethods.hasValue(this.samplingInfo.qtyAnalysis))
                return SampleAnalysisMessages.qtyAnalysis;
            if (this.showCompositeSample && Number(this.samplingInfo.compositeSampleQty) < (Number(this.samplingInfo.qtyAnalysis) + Number(this.samplingInfo.reserveSampleQty)))
                return SampleAnalysisMessages.compositeQty;
            if (!this.showCompositeSample && this.samplingInfo.sampleCollected == 'S' && this.headerInfo.canShowPack && this.totalPackQty != (Number(this.samplingInfo.qtyAnalysis) + Number(this.samplingInfo.reserveSampleQty)))
                return SampleAnalysisMessages.totalPackQty;
        }
        if (!CommonMethods.hasValue(this.samplingInfo.deviation))
            return SampleAnalysisMessages.deviation;
    }

    saveSamplingInfo(type: string) {

        var obj: manageSamplingInfo = new manageSamplingInfo();
        if (type == 'SAVE') {
            if (this.btnType == ButtonActions.btnUpdate)
                return this.enableHeaders(true)

            var errMsg: string = this.validation();
            if (CommonMethods.hasValue(errMsg))
                return this._alert.warning(errMsg);
            else
                this.enableHeaders(false);
        }
        else {
            if (this.samplingInfo.sampleCollected == 'N') {
                obj.sampleCollected = this.samplingInfo.sampleCollected;
                obj.deviation = this.samplingInfo.deviation;
            }
            else {
                // if (this.samplingInfo.sampleCollected == 'S' && this.headerInfo.canShowPack && ((this.showCompositeSample && this.totalPackQty != Number(this.samplingInfo.compositeSampleQty)) || (!this.showCompositeSample && this.totalPackQty != (Number(this.samplingInfo.qtyAnalysis) + Number(this.samplingInfo.reserveSampleQty)))))
                //     return this._alert.warning(SampleAnalysisMessages.packAndReq);
                obj = this.samplingInfo;
                obj.sampleReceviedOn = dateParserFormatter.FormatDate(this.sampleReceivedOn, 'datetime');

                if (!CommonMethods.hasValue(this.samplingInfo.sampledBy))
                    this.samplingInfo.sampledBy = this._limsContext.limsContext.userDetails.userName;
            }

            if (CommonMethods.hasValue(this.equipment)) {
                obj.samplerID = this.equipment.selectedId;
                obj.samplerTitle = this.equipment.selectedText;
            }

            obj.encSioID = this.appBO.encTranKey;
            obj.reserveSampleUom = this.samplingInfo.uom;
            obj.initTime = this.appBO.initTime;
            obj.otherList = this.mngCustField.withValueFields();
            obj.referenceNumber = this.headerInfo.arNumber;
            this.isLoaderStart = true;

            this._saService.mangeSampleAnalysis(obj);
        }
    }

    formatString(val) {
        return CommonMethods.FormatValueString(val);
    }

    formatSmapleCollected(val) {
        return val == 'S' ? 'YES' : 'NO';
    }

    managePack() {
        // if (this.showCompositeSample && !CommonMethods.hasValue(this.samplingInfo.compositeSampleQty))
        //     return this._alert.warning(SampleAnalysisMessages.compositeSampQty);
        // if (!this.showCompositeSample && this.showQtyAnalysis && !CommonMethods.hasValue(this.samplingInfo.qtyAnalysis))
        //     return this._alert.warning(SampleAnalysisMessages.qtyAnalysis);
        // if (!CommonMethods.hasValue(this.samplingInfo.uom))
        //     return this._alert.warning(SampleAnalysisMessages.uom);

        var obj: GetSamplePacks = new GetSamplePacks();
        obj.purposeCode = 'SAMPLE_ANALYSIS';
        obj.encSioID = this.appBO.encTranKey;
        obj.secUomID = this.samplingInfo.uom;
        //obj.reqQuantity = CommonMethods.hasValue(this.samplingInfo.compositeSampleQty) ? this.samplingInfo.compositeSampleQty : (Number(this.samplingInfo.qtyAnalysis) + Number(this.samplingInfo.reserveSampleQty));
        const modal = this._matDailog.open(manageSamplePackComponent, { width: '75%' });
        modal.componentInstance.uomList = this.uomList;
        modal.componentInstance.samplePack = obj;
        modal.componentInstance.pageType = this.pageType == 'MNG' ? this.btnType == 'Update' ? 'VIEW' : 'MNG' : 'VIEW';
        modal.disableClose = true;
        modal.afterClosed().subscribe(resp => {
            if (CommonMethods.hasValue(resp) && CommonMethods.hasValue(resp.totalQty)) {
                this.samplingInfo.uom = resp.uomID;
                this.totalPackQty = Number(resp.totalQty);
                if (this.showCompositeSample)
                    this.samplingInfo.compositeSampleQty = resp.totalQty;
            }
        })
    }

    bindData(obj) {
        this.samplingInfo.sampleCollected = obj.sampleApplicability;
        if (this.headerInfo.inwardType == 'AQUAL' && !CommonMethods.hasValue(this.samplingInfo.sampleCollected))
            this.samplingInfo.sampleCollected = 'N';
        this.samplingInfo.samplerID = obj.samplerID;
        this.samplingInfo.noofContainers = obj.packsSampled;
        if (CommonMethods.hasValue(obj.sampleApplicability))
            this.samplingInfo.sampledBy = obj.sampledBy;
        this.sampleReceivedOn = obj.sampledOn;
        this.samplingInfo.sampleStorageTemp = obj.storageCondition;
        this.samplingInfo.qtyFrom = obj.stbQtyFrom;
        this.samplingInfo.compositeSampleQty = obj.compositQty;
        this.samplingInfo.qtyAnalysis = obj.sampleAnaQty;
        this.samplingInfo.reserveSampleQty = obj.reserveSamQty;
        this.samplingInfo.reserveSampleUom = this.samplingInfo.uom = obj.uomID;
        this.samplingInfo.workBookNumber = obj.workBookNo;
        this.samplingInfo.deviation = obj.remarks;
        this.samplingInfo.reviewedBy = obj.reviewedBy;
        this.samplingInfo.reviewedOn = dateParserFormatter.FormatDate(obj.reviewedOn, 'datetime');
        this.specTypeCode = obj.specTypeCode;
        this.sampleTypeCode = obj.sampleTypeCode;
        this.samplingInfo.encIoID = obj.encIoID;
        this.headerInfo.reviewedBy = obj.reviewedBy;
        // if (this.headerInfo.canShowPack && !this.cntlShowCondtions('COM_QTY'))
        //     this.totalPackQty = Number(this.samplingInfo.qtyAnalysis) + Number(this.samplingInfo.reserveSampleQty)
        // else if (this.headerInfo.canShowPack && this.cntlShowCondtions('COM_QTY'))
        //     this.totalPackQty = Number(this.samplingInfo.compositeSampleQty);
        if (CommonMethods.hasValue(this.samplingInfo.samplerID))
            this.equipment.setRow(this.samplingInfo.samplerID, obj.equipment);
        this.store.dispatch(new analysisActions.UpdateAnalysisInfo(this.headerInfo));
    }

    openChecklist() {

        // this.store
        // .pipe(select(fromAnalysisOptions.getAnalysisInfo))
        // .subscribe(analysis => {
        //   this.analysisInfo = analysis;
        // });

        // this.analysisInfo.productName ="CVA";
        // this.store.dispatch(new analysisActions.UpdateAnalysisInfo(this.analysisInfo));

        // this.store
        // .pipe(select(fromAnalysisOptions.getAnalysisInfo))
        // .subscribe(analysis => {
        //   this.analysisInfo = analysis;
        //   console.log(this.analysisInfo);
        // });


        const modal = this._matDailog.open(checklistComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.appBO.encTranKey;
        modal.componentInstance.categoryCode = this.headerInfo.checkListCategory;
        modal.componentInstance.remarksMandatory = true;
        modal.componentInstance.remarksValidationReq = false;
        modal.componentInstance.type = this.pageType == 'MNG' ? CommonMethods.hasValue(this.samplingInfo.reviewedBy) || this.btnType == ButtonActions.btnUpdate ? 'VIEW' : 'MANAGE' : 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.sampleAnalysis;
    }

    comInwards: any = ['COMM', 'PI', 'BCON', 'IU']
    comAnalysisCode: any = ['SPC_RAW', 'SPC_FIN', 'SPEC_INTER', 'SPC_PACK', 'SPEC_WATER', 'SPEC_RCVRY']
    resQtyInwards: any = ['IRQ', 'SUP', 'CTRL']
    resQtyAnalysisCode: any = ['SPEC_HOLDTIME', 'SPC_STAB', 'SPC_WORK', 'SPEC_REFSTD', 'SPEC_INTERUNIT', 'SPEC_WATER', 'SPC_INPROC', 'SPC_CLN', 'SPEC_OOS', 'SPEC_GENSAMPLE']
    samplerAnalysisCode: any = ['SPC_RAW', 'SPC_FIN', 'SPEC_INTER', 'SPEC_RETEST', 'SPEC_OOS', 'SPC_PACK']

    cntlShowCondtions(controlType: string = "") {
        var val: boolean = false;
        if (controlType == "QTY_FROM" && (this.headerInfo.inwardType == "STB" || this.headerInfo.inwardType == "HTS"))
            return val = true;
        if (controlType == 'VEN_DOC' && (this.headerInfo.inwardType == 'PI' || this.headerInfo.inwardType == 'IU'))
            return val = true;
        if (controlType == 'COM_QTY' && this.showCompQty && this.comInwards.includes(this.headerInfo.inwardType) && this.comAnalysisCode.includes(this.headerInfo.analysisTypeCode)) {
            val = true
            return this.showCompositeSample = true;
        }
        if (controlType == 'RESER_QTY' && !this.resQtyInwards.includes(this.headerInfo.inwardType) && !this.resQtyAnalysisCode.includes(this.headerInfo.analysisTypeCode)) {
            val = true;
            return this.showReserveSample = true;
        }
        if (controlType == 'SAMPLER_ID' && this.samplerAnalysisCode.includes(this.headerInfo.analysisTypeCode))
            val = true;

        return val;
    }

    addOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.rs232Obj.batchNumber;
        obj.encEntityActID = this.appBO.encTranKey;
        obj.occSource = 'SAMPLING_OCC';
        obj.entityRefNumber = this.appBO.referenceNumber;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
        obj.occSourceName = "Sampling";
        //obj.invID = this.invID;

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = this.pageType == 'MNG' ? this.btnType == 'Update' ? 'VIEW' : 'MNG' : 'VIEW';
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}