import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { AppBO, PrepareOccupancyBO } from '../../common/services/utilities/commonModels';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from '../../limsHelpers/entity/limsGrid';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from '../../common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, EntityCodes, PageUrls, ButtonActions } from '../../common/services/utilities/constants';
import { AddSolution } from '../model/volumetricSolModel';
import { AlertService } from '../../common/services/alert.service';
import { VolumetricSolMessages } from '../messages/volumetricSolMessages';
import { Router, ActivatedRoute } from '@angular/router';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from '../../approvalProcess/component/approvalProcess.component';
import { ParamMasterObj } from 'src/app/common/model/commonModel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';

@Component({
    selector: 'lims-vol',
    templateUrl: '../html/manageVolumetricSol.html'
})

export class ManageVolumetricSolutionComponent {

    encSolutionID: string;
    pageTitle: string = PageTitle.mngvolSolution;
    appBO: AppBO = new AppBO();
    buttonType: string = ButtonActions.btnSave;

    materialInfo: LookupInfo;
    @ViewChild('material', { static: true }) material: LookupComponent;

    materialID: number;
    solutionRefCode: string;
    molecularWeight: string;
    formulaType: string;
    briefDescription: string;
    briefBtn: string = ButtonActions.btnSave;
    backUrl: string = PageUrls.homeUrl;
    dataSource: any;
    solutionFormulaType: any;
    entityCode: string = EntityCodes.volumetricSol;
    sourceType: string = 'VOLSOL_PREP';
    type: string;
    status: string;
    refNo: string;
    isFinalPrep: boolean;
    selectedTab: number = 0;
    PreparationAction: string = "EDIT"
    volume: number;
    formulaID: number;
    uom: string;
    btnUpload: string = ButtonActions.btnUpload;
    btnDisabledReq: boolean = false;
    disableAll: boolean;
    subscription: Subscription = new Subscription();
    periodList: any;
    validPeriodID: number;
    validUpTo: any;
    restdPeriodID: number;
    restdData: any;
    actionDate: Date;
    psDryingTem: string;
    dryingDuration: string;
    coolingDuration: string;
    getDate: Date = new Date();
    batchNumber: string;
    invID: number;
    isFromAnaQualification: boolean = false;
    viewHistoryVisible: boolean;
    viewHistory: any;
    isLoaderStart: boolean = false;
    isLoaderStartIcn: boolean = false;

    constructor(private _service: VolumetricSolService, private _alert: AlertService, private confirService: ConfirmationService,
        private _actRouter: ActivatedRoute, private _matDailog: MatDialog, private _router: Router, public _global: GlobalButtonIconsService) {

    }

    ngAfterContentInit() {

        this._actRouter.queryParams.subscribe(param => this.encSolutionID = param['id']);

        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getVolumetricSolIndexByID") {
                this.solutionRefCode = resp.result.matCode;
                this.molecularWeight = resp.result.molecularWeight;
                this.formulaType = resp.result.formulaType;
                this.materialID = resp.result.materialID;
                this.uom = resp.result.uom;
                this.briefDescription = resp.result.preparationProcedure;
            }
            else if (resp.purpose == "manageVolumetricSol") {
                this.btnDisabledReq = this.isLoaderStart = this.isLoaderStartIcn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(VolumetricSolMessages.manageSol);
                    this.appBO = resp.result;
                    this.status = resp.result.status;
                    this.refNo = resp.result.referenceNumber
                    this.encSolutionID = resp.result.encTranKey;
                    this.enableControls(false);
                    this.showHistory();
                    this._service.getVolumetricSolutionByID(this.encSolutionID);

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getVolumetricSolutionByID") {
                if (!CommonMethods.hasValue(resp.result.canAccess)) {
                    this._alert.error(ActionMessages.GetMessageByCode('VSANALYST_CAN_PERFORM'));
                    return this._router.navigateByUrl(PageUrls.homeUrl);
                }
                this.isFromAnaQualification = resp.result.isFromAnalystQualification;
                this.solutionRefCode = resp.result.solutionCode;
                this.molecularWeight = resp.result.molecularWeight;
                this.formulaType = resp.result.formulaType;
                this.briefDescription = resp.result.briefDescription;
                this.psDryingTem = resp.result.primaryStandardDryingTern;
                this.coolingDuration = resp.result.coolingDuration;
                this.dryingDuration = resp.result.dryingDuration;
                this.materialID = resp.result.materialID;
                this.status = resp.result.status;
                this.refNo = resp.result.solutionRefCode;
                this.uom = resp.result.uom;
                this.formulaID = resp.result.formulaID;
                this.volume = resp.result.preparationVolume;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.appBO = resp.result.act;
                this.enableControls(false);
                this.isFinalPrep = resp.result.isFinalPrep;

                if (this.isFinalPrep) {
                    this.selectedTab = 1;
                    this.PreparationAction = "VIEW";
                    CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_VOL_STAND);
                }
                else
                    CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE, LOCALSTORAGE_VALUES.RS232_VOL_PREP);

                this.operationTypeDisable();

                setTimeout(() => {
                    this.material.setRow(resp.result.indexID, resp.result.solutionName);
                }, 100);
                this._service.getSolutionFormulaByIndexID(resp.result.indexID);
                this.validPeriodID = resp.result.validityPeriodID;
                this.restdPeriodID = resp.result.reStandardizationPeriodID;
                this.getValidityDate('VALID');
                this.getValidityDate('RE_STD');

            }

            else if (resp.purpose == "getSolutionFormulaByIndexID")
                this.solutionFormulaType = resp.result;
            else if (resp.purpose == "getValidityPeriods")
                this.periodList = resp.result;
        })

        this.showHistory();
        this._service.getValidityPeriods(EntityCodes.volumetricSol);
        if (CommonMethods.hasValue(this.encSolutionID))
            this._service.getVolumetricSolutionByID(this.encSolutionID);

        this.prepareLKP();
    }

    operationTypeDisable() {
        if (this.appBO.operationType == 'VIEW') {
            this.disableAll = true;
            this.material.disableBtn = true;
        }
    }

    enableControls(val: boolean) {
        if (!CommonMethods.hasValue(this.type) || this.type == 'INIT') {
            this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.material.disableBtn = this.buttonType == ButtonActions.btnUpdate ? true : false;
            if (this.isFromAnaQualification)
                this.material.disableBtn = true;
        }



        if (CommonMethods.hasValue(this.briefDescription)) {
            this.briefBtn = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        }

    }

    prepareLKP() {
        this.materialInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solutionName, LookupCodes.getSolutionIndex, LKPDisplayNames.solutionName, LKPDisplayNames.stpNumber, LookUpDisplayField.header, LKPPlaceholders.solutionName, "", "", 'LIMS');
    }

    onSelectedLookup(evt) {
        if (CommonMethods.hasValue(evt.val.id)) {
            this._service.getVolumetricSolIndexByID(evt.val.id);
            this._service.getSolutionFormulaByIndexID(evt.val.id);
        }

    }

    savePreparation(code: string) {
        this.type = code;

        if (code == 'INIT' && this.buttonType == ButtonActions.btnUpdate) {
            // this.confirService.confirm(VolumetricSolMessages.confirmVolumetricUpdate).subscribe((confirmed) => {
            //     if (confirmed)
            return this.enableControls(true);
            // })
        }
        //return this.enableControls(true);

        if (code == 'BREIF' && this.briefBtn == ButtonActions.btnUpdate)
            return this.enableControls(true);

        var retval = this.validateControls();

        if (CommonMethods.hasValue(retval))
            return this._alert.warning(retval);

        var obj: AddSolution = new AddSolution();
        obj.materialID = this.materialID;
        obj.encSolutionID = this.encSolutionID;
        obj.initTime = this.appBO.initTime;
        obj.brefDesc = this.briefDescription;
        obj.preparationVolume = this.volume;
        obj.formulaID = this.formulaID;
        obj.type = this.type;
        obj.validityPeriodID = this.validPeriodID;
        obj.restandardizationPeriodID = this.restdPeriodID;
        obj.psDryingTem = this.psDryingTem;
        obj.coolingDuration = this.coolingDuration;
        obj.dryingDuration = this.dryingDuration;
        this.btnDisabledReq = true;

        code == 'INIT' ? this.isLoaderStart = true : this.isLoaderStartIcn = true;
        this._service.manageVolumetricSol(obj);
    }

    validateControls() {


        if (!CommonMethods.hasValue(this.material.selectedId) && this.type == 'INIT')
            return VolumetricSolMessages.solution;
        if (!CommonMethods.hasValue(this.volume) && this.type == 'INIT')
            return VolumetricSolMessages.prepaVolume
        if (!CommonMethods.hasValue(this.formulaID) && this.type == 'INIT')
            return VolumetricSolMessages.formulaID;
        else if (CommonMethods.hasValue(this.formulaID) && this.type == 'INIT') {
            var obj = this.solutionFormulaType.filter(x => x.formulaID == this.formulaID)
            if (obj.length <= 0)
                return VolumetricSolMessages.formulaID;
        }
        if (!CommonMethods.hasValue(this.validPeriodID) && this.type == 'INIT')
            return VolumetricSolMessages.validPreriod;
        if (!CommonMethods.hasValue(this.restdPeriodID) && this.type == 'INIT')
            return VolumetricSolMessages.restdPeriod;
        if (this.type == 'INIT' && (new Date(this.validUpTo).getTime() <= new Date(this.restdData).getTime()))
            return VolumetricSolMessages.restdDate;
        if (!CommonMethods.validNumber(this.volume))
            return VolumetricSolMessages.validPrepVol;
        else if (!CommonMethods.hasValue(this.briefDescription) && this.type != 'INIT')
            return VolumetricSolMessages.briefDescri;

    }

    updateInitTime(evt) {
        this.appBO.initTime = evt;
    }

    updateData(evt) {
        this.appBO = evt;
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSolutionID;
        obj.code = 'VOLSOLUTION';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encSolutionID, EntityCodes.volumetricSol,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate(['/lims/home']);
        });
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSolutionID;
        obj.code = 'VOLSOL_PREP';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encSolutionID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }


    clear() {
        this.material.clear();
        this.solutionRefCode = this.molecularWeight = this.formulaType = "";
        this.formulaID = null;
        this.volume = this.validPeriodID = this.restdPeriodID = null;
        this.validUpTo = '';

    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 3);
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.volumetricSol, 0, 'VOL_REQ', this.encSolutionID, [], 'MEDICAL_LIMS',this.appBO.referenceNumber);
        if (this.btnUpload == ButtonActions.btnViewDocus)
            modal.componentInstance.mode = 'VIEW';
        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe((resu) => {

            })
        }
    }

    getValidityDate(type) {
        var obj: any
        if (type == 'VALID' && this.periodList) {
            obj = this.periodList.filter(x => x.id == this.validPeriodID);
        }
        else if (type != 'VALID' && this.periodList) {
            obj = this.periodList.filter(x => x.id == this.restdPeriodID);
        }

        var date: Date;

        if (CommonMethods.hasValue(this.actionDate))
            this.getDate = dateParserFormatter.FormatDate(this.actionDate, 'default');
        if (CommonMethods.hasValue(obj) && obj.length > 0) {
            if (obj[0].code == 'DAYS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate() + obj[0].value, this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'HRS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours() + obj[0].value, this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'MONTHS')
                date = new Date(this.getDate.getFullYear(), this.getDate.getMonth() + obj[0].value, this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
            else if (obj[0].code == 'YEARS')
                date = new Date(this.getDate.getFullYear() + obj[0].value, this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());

            if (type == 'VALID')
                this.validUpTo = dateParserFormatter.FormatDate(date, 'datetime');
            else this.restdData = dateParserFormatter.FormatDate(date, 'datetime');
        }
    }

    addOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.batchNumber;
        obj.invID = this.invID;
        obj.encEntityActID = this.encSolutionID;
        obj.occSource = 'VOLPREP_OCC';
        obj.entityRefNumber = this.appBO.referenceNumber;
        obj.occSourceName = 'Preparation';
        obj.conditionCode = localStorage.getItem('conditionCode');

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.occReqDispaly = true;
        modal.componentInstance.pageType = this.briefBtn != 'Update' ? 'MNG' : 'VIEW';
        modal.componentInstance.isAppPrimaryOcc = false;

        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();

        CustomLocalStorage.removeItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE);
    }

}