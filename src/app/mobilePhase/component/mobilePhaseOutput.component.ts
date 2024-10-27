import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Subscription } from 'rxjs';
import { AppBO } from '../../common/services/utilities/commonModels';
import { CommonMethods, dateParserFormatter } from '../../common/services/utilities/commonmethods';
import { MatDialog } from '@angular/material';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { mobilephaseMessages } from '../messages/mobilePhaseMessages';
import { AlertService } from '../../common/services/alert.service';
import { MobilePhaseOutput, GetMobilePreparationList } from '../model/mobilePhaseModel';
import { ActionMessages, EntityCodes, ButtonActions } from '../../common/services/utilities/constants';
import { Router } from '@angular/router';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'mob-out',
    templateUrl: '../html/mobilePhaseOutput.html'
})

export class MobilePhaseOutputComponent {

    @Input('encEntActID') encEntActID: string;
    isVisBtnDisable: boolean = true;
    disableAll: boolean;

    validityPeriodList: Array<any> = [];
    buttonType: string = ButtonActions.btnSave;
    disabledControls: boolean;
    appBO: AppBO = new AppBO();
    getDate: Date = new Date();
    phasePrepation: GetMobilePreparationList = new GetMobilePreparationList();
    btnUpload: string = ButtonActions.btnUpload;
    @Output() updateData: EventEmitter<any> = new EventEmitter();
    finalVolume: number;
    purposeType: string;
    useBeforeDateTime: string;
    otherInfo: string;
    uom: string;
    actionDate: Date;

    typeCode: string = 'MPHASE_PREP_TLC';

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;

    constructor(private _matDailog: MatDialog, private _phaseSservice: mobilePhaseService,
        private _alert: AlertService, private _router: Router, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._phaseSservice.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "getValidityPeriods")
                this.validityPeriodList = resp.result;
            else if (resp.purpose == "getMobilephaseData") {
                this.finalVolume = resp.result.mobilePhase.finalVol;
                this.purposeType = resp.result.mobilePhase.purposeCode;
                this.useBeforeDateTime = resp.result.mobilePhase.useBeforeDateTime;
                this.otherInfo = resp.result.mobilePhase.outputOtherInfo;
                this.uom = resp.result.mobilePhase.uom;
                this.actionDate = resp.result.mobilePhase.actionDate;

                if (this.appBO.operationType == "VIEW")
                    this.disableAll = true;
                // if (this.isVisBtnDisable)
                //     this.disabledControls = !this.isVisBtnDisable;

                if (CommonMethods.hasValue(this.finalVolume) || CommonMethods.hasValue(this.otherInfo))
                    this.enableHeaders(false);

                this.appBO = resp.result.appTran;

            }
            else if (resp.purpose == "managePhaseOutput") {
                this.isLoaderStart = false;
                if (resp.result.trn.returnFlag == "SUCCESS") {
                    this._alert.success(mobilephaseMessages.mobilePhaseoutput);
                    this.appBO = resp.result.trn;
                    this.enableHeaders(false);
                    this.finalVolume = resp.result.finalVolume;
                    this.useBeforeDateTime = resp.result.useBeforeDateTime;
                    if (this.appBO.operationType == "VIEW")
                        this.disableAll = true;
                    this.updateData.emit(this.appBO);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.trn.returnFlag));
            }
            else if (resp.purpose == "getPreparationDetails") {
                this.phasePrepation = resp.result;
                this.phasePrepation.forEach((item) => {
                    item.useBeforeDate = dateParserFormatter.FormatDate(item.useBeforeDate, 'datetime');
                })

                // var index = this.phasePrepation.findIndex(x => x.validationPeriodID > 0);
                // if (index > -1)
                //     this.enableHeaders(false);

            }


        })

        localStorage.removeItem('NEW_REQ');
        this._phaseSservice.getValidityPeriods(EntityCodes.mobilePhase);
    }

    accessFieldsDisplay(val: boolean) {
        this.isVisBtnDisable = val;
        this.disabledControls = !val;
    }

    enableHeaders(val: boolean) {
        this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.disabledControls = !val;
    }

    manageMPhaseOutput() {

        if (this.buttonType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var retVal = this.validatityControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        var obj: MobilePhaseOutput = new MobilePhaseOutput();
        obj.encEntActID = this.encEntActID;
        obj.finalVol = this.finalVolume;
        obj.initTime = this.appBO.initTime;
        obj.otherInfo = this.otherInfo;
        obj.list = new GetMobilePreparationList();
        // obj.list = this.phasePrepation.filter(emp => (this.purposeType != this.typeCode ? emp.preparation != null : emp) && emp.isVisible);
        obj.list = this.phasePrepation.filter(emp => (this.purposeType != this.typeCode ? emp.preparation != null : emp) && emp.isVisible);
       
       this.isLoaderStart = true;
        this._phaseSservice.managePhaseOutput(obj);
    }

    validatityControls() {
        var preparationFilters = ['UPL_BUFF', 'HPLC_BUFF'];
        var retval = "";


        if (this.purposeType == 'MPHASE_PREP_TLC') {

            for (let index = 0; index < this.phasePrepation.length; index++) {
                if (this.phasePrepation[index].preparationCode != 'TLC_OTH_INFO' &&
                    !CommonMethods.hasValue(this.phasePrepation[index].prepartionVolum)
                ) {
                    retval = mobilephaseMessages.finalVolume;
                    break;
                }
                else if (this.phasePrepation[index].preparationCode != 'TLC_OTH_INFO' &&
                    !CommonMethods.hasValue(this.phasePrepation[index].validationPeriodID)) {
                    retval = mobilephaseMessages.validityPeriod;
                    break;
                }

            }
        }

        // if (this.phasePrepation.filter(x => x.preparation != null).length < 1)
        //     return retval;

        // this.phasePrepation.filter(emp => this.purposeType != this.typeCode ? emp.preparation != null : emp).forEach((x) => {
        //     if ((!CommonMethods.hasValue(x.prepartionVolum) || (!CommonMethods.hasValue(x.validationPeriodID) && !preparationFilters.includes(x.preparationCode))) && x.isVisible)
        //         retval = mobilephaseMessages.outputDetails;
        // })

        // if (!CommonMethods.hasValue(retval)) {
        //     var totalFinalVal: number = this.calculateFinalVol();
        //     var mobilePhaVol: number = 0;
        //     this.phasePrepation.filter(item => (item.isPreparationMandatory)).forEach((x) => { mobilePhaVol += Number(x.prepartionVolum) })

        //     var count = this.phasePrepation.filter(item => ((!item.isPreparationMandatory && item.isCalculateVol) && (item.prepartionVolum > mobilePhaVol)))
        //     if (count.length > 0)
        //         return mobilephaseMessages.mobilePhaseFinlVolOut;
        //     else if ((mobilePhaVol > totalFinalVal && totalFinalVal > 0) && (this.purposeType != 'MPHASE_PREP_TLC'))
        //         return mobilephaseMessages.mobilePhaseTot;
        //     else if (!CommonMethods.hasValue(this.finalVolume) && (this.purposeType != 'MPHASE_PREP_TLC'))
        //         return mobilephaseMessages.finalVol;
        //     else if (this.finalVolume > mobilePhaVol && (this.purposeType != 'MPHASE_PREP_TLC'))
        //         return mobilephaseMessages.finalVolValid;
        // }


        // this.phasePrepation.forEach((item) => {
        //     if (CommonMethods.hasValue(item.prepartionVolum) && !CommonMethods.hasValue(item.validationPeriodID)) {
        //         retval = "";

        //     }

        // })


        for (let index = 0; index < this.phasePrepation.length; index++) {
            if (CommonMethods.hasValue(this.phasePrepation[index].prepartionVolum)
                && !CommonMethods.hasValue(this.phasePrepation[index].validationPeriodID)
                && this.phasePrepation[index].preparationCode != 'TLC_OTH_INFO') {
                retval = mobilephaseMessages.validityPeriod;
                break;
            }
            else if (!CommonMethods.hasValue(this.phasePrepation[index].prepartionVolum)
                && CommonMethods.hasValue(this.phasePrepation[index].validationPeriodID)
                && this.phasePrepation[index].preparationCode != 'TLC_OTH_INFO') {
                retval = mobilephaseMessages.finalVolume;
                break;
            }
        }

        if (CommonMethods.hasValue(retval))
            return retval;

        // var obj = this.phasePrepation.filter(x => x.preparation && (!CommonMethods.hasValue(x.prepartionVolum) || !CommonMethods.hasValue(x.validationPeriodID)));
        // if (obj.length > 0)
        //     return mobilephaseMessages.outputDetails;

        if (!CommonMethods.hasValue(this.finalVolume) && this.purposeType != this.typeCode)
            return mobilephaseMessages.finalOutputDetails;

        // return retval;
    }

    calculateFinalVol() {
        // var finalVolFilter = ['HPLC_PHASE_A', 'UPL_PHASE_A', 'HPLC_PHASE_B', 'UPL_PHASE_B', 'HPLC_PHASE_C', 'UPL_PHASE_C', 'TLC_PHASEA'];
        var totalFinalVal: number = 0;
        this.phasePrepation.filter(item => item.isCalculateVol).forEach((x) => { totalFinalVal += Number(x.prepartionVolum) })
        return totalFinalVal;
    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt,16, 3);
    }

    getValidityDate(id: number, preparationID: number) {
        var obj = this.validityPeriodList.filter(x => x.id == id);

        var date: Date;

        if (CommonMethods.hasValue(this.actionDate))
            this.getDate = dateParserFormatter.FormatDate(this.actionDate, 'default');

        if (CommonMethods.hasValue(obj)) {

            if (obj[0].code == 'DAYS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate() + obj[0].value, this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'HRS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours() + obj[0].value, this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'MONTHS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth() + obj[0].value, this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'YEARS')
                date = new Date(this.getDate.getFullYear() + obj[0].value, this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
        }

        this.phasePrepation.filter(x => x.preparationID == preparationID).forEach((itm) => {
            if (CommonMethods.hasValue(id))
                itm.useBeforeDate = dateParserFormatter.FormatDate(date, 'datetime');
            else
                itm.useBeforeDate = null;
        })

    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.mobilePhase, 0, 'MP_OUT', this.encEntActID, [], 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.mode = this.btnUpload == ButtonActions.btnViewDocus ? 'VIEW' : "MANAGE";
    }

    getPreparationUnEmptyList() {
        if (!CommonMethods.hasValue(localStorage.getItem('NEW_REQ'))) {
            // return this.phasePrepation.filter(x => this.purposeType != this.typeCode ? (CommonMethods.hasValue(x.preparation) && x.isVisible) : x.isVisible);
            return this.phasePrepation.filter(x => (CommonMethods.hasValue(x.preparation) && x.isVisible));
        }
        else
            return [];
    }

    formatValueString(obj: any) {
        return CommonMethods.FormatValueString(obj);
    }

    disableFields() {
        // if (this.appBO.appLevel > 0)
        //     return true;
        // else
        return this.disabledControls;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}