import { Component, Input, Output, EventEmitter, OnChanges, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { AlertService } from '../../common/services/alert.service';
import { MobilePhasePrep, GetMobilePreparationList, GetSelectedMobilePreparationList, GetMobilePreparation, GetSelectedMobilePreparation } from '../model/mobilePhaseModel';
import { ActionMessages, EntityCodes, ButtonActions, ConditionCodes, SectionCodes } from '../../common/services/utilities/constants';
import { mobilephaseMessages } from '../messages/mobilePhaseMessages';
import { AppBO, PrepareOccupancyBO } from '../../common/services/utilities/commonModels';
import { MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from 'src/app/common/services/utilities/commonmethods';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManagePreparationMasterDataComponent } from './ManagePreparationMasterData.component';
import { ManageRS232IntegrationFieldsBO, RS232IntegrationModelBO } from 'src/app/limsHelpers/entity/limsGrid';
import { AddOtherFieldComponent } from 'src/app/common/component/addOtherField.component';
import { ManageAddFieldComponent } from 'src/app/limsHelpers/component/manageAddField.component';

@Component({
    selector: 'mob-pre',
    templateUrl: '../html/mobilePhasePreparation.html'
})

export class MobilePhasePreparationComponent {

    @Input('encEntActID') encEntActID: string = '6';
    @Input('type') type: string;
    @Input('isVisBtnDisable') isVisBtnDisable: boolean = true;
    disableAll: boolean;

    appBO: AppBO = new AppBO();
    // bufferPreparation: string;
    // phaseA: string;
    // phaseB: string;
    // diluentPreparation: string;
    // otherInfo: string;
    // solPH: number;
    // phMeterCount: number;

    buttonType: string = ButtonActions.btnSave;
    disabledControls: boolean;

    pageTitle: string = PageTitle.mobilePhase;
    subscription: Subscription = new Subscription();
    btnUpload: string = ButtonActions.btnUpload;
    result: any;

    phasePrepation: GetMobilePreparationList = new GetMobilePreparationList();
    purposeType: string;
    typeCode: string = 'MPHASE_PREP_TLC';
    reqCode: string;

    @Output() updateData: EventEmitter<any> = new EventEmitter();

    otherFieldsList: Array<any> = [];
    rs232Obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();

    @ViewChild('mngCustField', { static: false }) mngCustField: ManageAddFieldComponent;
    isLoaderStart: boolean = false;


    constructor(private mblPhaseService: mobilePhaseService, private alert: AlertService,
        private _matDailog: MatDialog, public _global: GlobalButtonIconsService, private _modal: MatDialog) { }

    ngAfterContentInit() {
        this.subscription = this.mblPhaseService.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "getMobilephaseData") {
                // this.otherInfo = resp.result.mobilePhase.otherInfo
                this.appBO = resp.result.appTran;
                this.enableHeaders(false);
                this.type = resp.result.mobilePhase.preparationTypeCode;
                this.purposeType = resp.result.mobilePhase.purposeCode;
                this.result = resp.result.mobilePhase;
                if (this.appBO.operationType == "VIEW")
                    this.disableAll = true;

                this.reqCode = this.appBO.referenceNumber;
                // this.reqCode = resp.result.mobilePhase.mobilePhaseCode;

                this.rs232Obj.entityActID = this.encEntActID;
                this.rs232Obj.conditionCode = ConditionCodes.MOBILE_PHASE;
                this.rs232Obj.reqCode = this.reqCode;
                this.rs232Obj.batchNumber = resp.result.mobilePhase.mobilePhaseCode;
                this.rs232Obj.entityCode = EntityCodes.mobilePhase;

                this.appBO.batchNumber = resp.result.mobilePhase.mobilePhaseCode;
                this.mngCustField.getRS232IntegrationOther();
            }
            else if (resp.purpose == "manageMobilePhasePrepComments") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    localStorage.removeItem('NEW_REQ');
                    this.alert.success(mobilephaseMessages.mobilePhasePrep);
                    this.enableHeaders(false);
                    this.appBO = resp.result;
                    if (this.appBO.operationType == "VIEW")
                        this.disableAll = true;
                    this.mblPhaseService.getPreparationDetails(this.encEntActID);
                    this.mblPhaseService.getMobilePreparationData(this.encEntActID);
                    this.updateData.emit(resp.result);
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getPreparationDetails") {
                setTimeout(() => {
                    this.phasePrepation = resp.result;
                    this.enableHeaders(resp.result[0].isEnable);
                    this.phasePrepation.forEach((item) => {
                        item.preparationSolPH = item.preparationSolPH == 0 ? null : item.preparationSolPH;
                    })
                }, 300)

            }


            if (resp.purpose == "managePreparationMasterData") {
                if (resp.type == 'NEW_REQ') {
                    localStorage.setItem('NEW_REQ', 'InitMobilePhaseReq');
                    this.phasePrepation.forEach(x => {
                        var data = resp.result.lst.filter(o => x.preparationCode == o.preparationCode)
                        if (data.length > 0)
                            x.preparation = data[0].preparationText;
                    })

                    setTimeout(() => {
                        this.enableHeaders(true);

                    }, 200);
                }
            }

        })

    }


    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.disabledControls = !val;
    }

    savePreparation() {

        if (this.buttonType == ButtonActions.btnUpdate) {
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED, LOCALSTORAGE_VALUES.ON);
            return this.enableHeaders(true);
        }

        // var err: string = this.validations();

        // if (CommonMethods.hasValue(err))
        //     return this.alert.warning(err);

        var obj: MobilePhasePrep = new MobilePhasePrep();
        obj.encEntActID = this.encEntActID;
        obj.initTime = this.appBO.initTime;
        obj.list = new GetSelectedMobilePreparationList();

        this.phasePrepation.forEach((item) => {
            var objPre: GetSelectedMobilePreparation = new GetSelectedMobilePreparation();
            objPre.preparation = CommonMethods.hasValue(item.preparation) ? item.preparation : null;
            objPre.preparationID = item.preparationID;
            objPre.solutionPH = item.preparationSolPH;
            objPre.weight = item.weight;
            obj.list.push(objPre);
        })

        // obj.otherList = this.mngCustField.withValueFields();

        this.isLoaderStart = true;
        this.mblPhaseService.manageMobilePhasePrepComments(obj);
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.mobilePhase, 0, 'MP_PRE', this.encEntActID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = this.btnUpload == ButtonActions.btnViewDocus ? 'VIEW' : "MANAGE";
    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5);
    }

    allowAlphaNumeric(evt) {
        if (CommonMethods.allowNumber(evt, '') || CommonMethods.allowAlphabets(evt))
            return true;
        else return false;
    }

    openOccupancy(item: any) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'Eqp_Sam_Ana';
        obj.encEntityActID = item.preparationID;
        obj.occSource = item.preparationCode;
        obj.entityRefNumber = this.appBO.referenceNumber;
        obj.batchNumber = this.result.batchNumber;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
        obj.occSourceName = item.preparationName;

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        // modal.componentInstance.pageType =  this.isVisBtnDisable ? 'MNG' : 'VIEW';
        modal.componentInstance.pageType = (this.buttonType == 'Save' && this.isVisBtnDisable) ? 'MNG' : 'VIEW';
        modal.componentInstance.pageTitle = "Instrument Occupancy"

        // modal.componentInstance.condition = 'TYPE_CODE = \'PH METER\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
        modal.componentInstance.entityCode = EntityCodes.mobilePhase;

        modal.afterClosed().subscribe(count => {
            item.phUsedCount = count.val;
        })
    }

    // preparationCodesList: Array<string> = ['UPL_MOB_PHASE', 'HPLC_MOB_PHASE', 'TLC_PHASEA'];

    validations() {

        // var index: number = 0;
        // this.phasePrepation.filter((item) => {
        //     if (!CommonMethods.hasValue(item.preparation) && (item.isPreparationMandatory))
        //         index += 1;
        // })

        // if (index > 0)
        //     return mobilephaseMessages.mobilePrep;

    }

    masterData() {
        const modal = this._modal.open(ManagePreparationMasterDataComponent, { width: '80%' })
        modal.disableClose = true;
        modal.componentInstance.preparationType = this.result.preparationTypeCode;
        modal.componentInstance.typeCode = this.result.purpose;
        modal.componentInstance.materialID = this.result.materialID;
        modal.componentInstance.testID = this.result.specTest;
        modal.componentInstance.isVisBtnDisable = this.isVisBtnDisable;
        modal.componentInstance.encMobilePhaseID = this.encEntActID;
        modal.afterClosed().subscribe(res => {
            if (CommonMethods.hasValue(res.val)) {
                var obj = res.data.filter(x => CommonMethods.hasValue(x.preparationText))
                if (obj.length > 0) {
                    this.phasePrepation.forEach(x => {
                        var data = obj.filter(o => x.preparationCode == o.preparationCode)
                        if (data.length > 0)
                            x.preparation = data[0].preparationText;
                    })
                }
                this.enableHeaders(true);
            }
        })
    }


    prepareRs232(type: string, item: any, code: string, id: string) {

        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = ConditionCodes.MOBILE_PHASE;
        obj.reqCode = this.reqCode;
        obj.encEntityActID = item.preparationID;
        obj.sourceName = this.addMobilePhaseName(item.preparationName);
        obj.occSource = item.preparationName;
        obj.sectionCode = SectionCodes.MP_REQ;
        obj.parentID = this.encEntActID;

        /** ---- REMOVE ------------
         
            if (code != 'MOBILE_OTH_FIELD') {
            obj.encEntityActID = item.preparationID;
            obj.sourceName = this.addMobilePhaseName(item.preparationName);
            obj.occSource = item.preparation;
    
        }
        else {
            obj.sourceName = item.keyTitle;
            obj.encEntityActID = item.encIntegrationOtherID;
            obj.occSource = item.preparation;
        }
 
         */


        obj.chemicalName = type;
        obj.batchNumber = this.appBO.batchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = code;

        return obj;
    }


    addMobilePhaseName(type: string) {

        if (type.indexOf('Mobile Phase') < 0)
            type = 'Mobile Phase ' + type;

        return type;
    }



    // addNewField() {
    //     const modal = this._matDailog.open(AddOtherFieldComponent, CommonMethods.modalFullWidth);
    //     modal.componentInstance.obj = this.rs232Obj;
    //     modal.afterClosed().subscribe(resp => {
    //         if (resp == 'YES')
    //             this.mngCustField.getRS232IntegrationOther();

    //     })

    // }

    getRS232Values(evt: RS232IntegrationModelBO) {

        if (evt) {

            if (evt.sourceCode == 'MOBILE_SOL_PH' || evt.sourceCode == 'MOBILE_SOL_WEIGHT')
                this.phasePrepation.filter(x => x.preparationID == Number(evt.encEntityActID)).forEach((item) => {
                    if (evt.sourceCode == 'MOBILE_SOL_WEIGHT')
                        item.weight = evt.keyValue;
                    else
                        item.preparationSolPH = evt.keyValue;
                })
        }


    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}