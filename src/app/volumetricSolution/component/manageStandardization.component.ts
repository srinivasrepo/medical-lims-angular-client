import { Component, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { AppBO, PrepareOccupancyBO } from '../../common/services/utilities/commonModels';
import { Subscription } from 'rxjs';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from '../../common/services/utilities/commonmethods';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { MatDialog } from '@angular/material';
import { ApprovalComponent } from '../../approvalProcess/component/approvalProcess.component';
import { EntityCodes, GridActions, ActionMessages, ButtonActions, ConditionCodes, SectionCodes } from '../../common/services/utilities/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { ManageOccupancyComponent } from '../../common/component/manageOccupancy.component';
import { StdItems, VolumetricStdDetails, ReStand, VolFormulaBOList, InvReviewDetailsBO } from '../model/volumetricSolModel';
import { VolumetricSolMessages } from '../messages/volumetricSolMessages';
import { AlertService } from '../../common/services/alert.service';
import { ViewHistoryComponent } from '../../common/component/viewHistory.component';
import { manageSolventsComponent } from '../../limsHelpers/component/manageSolvents.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { LimsHelperMessages } from 'src/app/limsHelpers/messages/limsMessages';
import { RS232IntegrationModelBO } from 'src/app/limsHelpers/entity/limsGrid';

@Component({
    selector: 'lims-stand',
    templateUrl: '../html/manageStandardization.html'
})

export class ManageStandardComponent {

    encStandardID: string;
    encSolutionID: string;

    entityCode: string = EntityCodes.volumetricSol;
    appBO: AppBO = new AppBO();
    headersData: any;
    dataSource: any;
    action: Array<string> = [GridActions.MNG_OCC];
    dataSourceSol: any;
    headersDataStd: any;
    dataSourceStd: any = [];

    buttonType: string = ButtonActions.btnSave;
    psDryingTem: string;
    finalVol: string;

    batchNumber: string;
    invID: number;
    actionStd: Array<string> = [GridActions.edit, GridActions.view];
    editStd: boolean;
    sourceType: string = 'VOLSOL_STD';
    btnSubmitStand: string = ButtonActions.btnSave;
    average: any;
    isRestandardization: string;
    pageAction: string = 'EDIT';
    @Input() pageLevelAction: string = 'EDIT';
    uom: string;
    removeAction: any = { headerName: 'isFinal', EDIT: false, VIEW: true }
    @ViewChild('solvents', { static: false }) solvents: manageSolventsComponent;
    rsd: any;
    remarks: string;
    subscription: Subscription = new Subscription();
    stdProcedure: string;
    dryingDuration: string;
    coolingDuration: string;
    preparationVol: number;
    btnUpload: string = ButtonActions.btnUpload;
    blankValue: any;
    formulaDef: string;
    formulaList: VolFormulaBOList = new VolFormulaBOList();
    IsMandatoryPrimary: boolean = false;
    isBtnsShow: boolean = false;
    disableAll: boolean;
    maxAppLevel: number;
    referenceNumber: string;
    isEnabledRs232Mode: boolean = false;

    invReviewDetails: InvReviewDetailsBO = new InvReviewDetailsBO();
    isLoaderStart: boolean;
    isLoaderStartIcn: boolean;
    isLoaderStartBtn: boolean

    constructor(private _service: VolumetricSolService, private _matDailog: MatDialog, private confirService: ConfirmationService,
        private _router: Router, private _alert: AlertService, private _actRouter: ActivatedRoute, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this._actRouter.queryParams.subscribe(param => this.encSolutionID = param['id']);

        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getVolumetricSolutionByID") {
                this.prepareHeadersStd();
                this.encStandardID = resp.result.encStandardizationID;
                this.dataSourceStd = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.standList, 'arrayDateTimeFormat', 'standardStartDate'));
                this.uom = resp.result.uom;
                this.preparationVol = resp.result.preparationVolume;
                this.referenceNumber = resp.result.solutionRefCode;
                // this.appBO = new AppBO();
                // console.log('data');
                // this.prepareHeaders();
            }
            else if (resp.purpose == "getVolumetricStandardByID") {
                this.prepareHeaders();
                this.dataSourceSol = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.stdList));
                this.maxAppLevel = resp.result.maxAppLevel;
                this.appBO = resp.result.act;
                this.editStd = true;
                this.average = resp.result.stdAvg;
                if (this.average > 0)
                    this.rsd = resp.result.stdRSD;
                this.finalVol = resp.result.finalVolume;
                this.psDryingTem = resp.result.psDryingTern;
                this.remarks = resp.result.remarks;
                this.stdProcedure = resp.result.standardizationProcedure;
                this.coolingDuration = resp.result.coolingDuration;
                this.dryingDuration = resp.result.dryingDuration;
                this.blankValue = resp.result.blankValue;

                this.enableHeaders(false);

                this.operationTypeDisble();

                this.formulaList = resp.result.formulaList;

                this.IsMandatoryPrimary = this.formulaList.filter(x => x.inputCode == 'A3').length > 0;

                this.formulaDef = resp.result.formulaDef;
                sessionStorage.setItem("REFERESH_ACTIONS", "true")

                this.invReviewDetails = resp.result.invReviewDetails;

                if (this.invReviewDetails.reviewedOn)
                    this.invReviewDetails.reviewedOn = dateParserFormatter.FormatDate(this.invReviewDetails.reviewedOn, 'datetime')

            }
            else if (resp.purpose == "manageVolumetricSolStandard") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(VolumetricSolMessages.stdDetailSaved);
                    this.appBO = resp.result;
                    this.rsd = resp.result.resultFlag;
                    this.enableHeaders(false);
                    this._service.getVolumetricSolutionByID(this.encSolutionID);
                    this.onActionClicked({ action: 'EDIT', val: { encStandardizationID: this.encStandardID } })
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "reStandardization") {
                this.isLoaderStartBtn = false;
                if (resp.result.returnFlag == 'OK') {
                    localStorage.removeItem('isRestand');
                    this._alert.success(VolumetricSolMessages.restandardStarted);
                    this._service.getVolumetricSolutionByID(this.encSolutionID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "getRSDValue") {
                this.rsd = resp.result;
            }
            else if (resp.purpose == "invalidate") {
                this.isLoaderStartIcn = false;
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(VolumetricSolMessages.invalidateSuccess);
                    this._router.navigate(['/lims/volmetricSol']);

                    // this._service.getVolumetricSolutionByID(this.encSolutionID);
                    // this.editStd = false;
                    // this.dataSourceSol = null;
                    // this.appBO.canApprove = false;
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }


        })

        if (this.pageLevelAction == 'VIEW') {
            var index = this.actionStd.findIndex(x => x == 'EDIT');
            this.actionStd.splice(index, 1);
            this.pageAction = this.pageLevelAction;
            this.removeAction = {};
        }
    }

    operationTypeDisble() {
        if (this.appBO.operationType == 'VIEW') {
            this.disableAll = true;
            this.pageAction = 'VIEW';
        }
    }

    enableHeaders(val: boolean) {
        this.btnSubmitStand = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
    }

    addOccupancy(occSource: string = 'VOLSTD_OCC', encEntityActID: string = this.encStandardID, occReq: boolean = true) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.batchNumber;
        obj.invID = this.invID;
        obj.encEntityActID = encEntityActID;
        obj.occSource = occSource;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
        obj.occSourceName = occSource == 'VOLSTD_OCC' ? 'Titration' : 'Standardization';

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.occReqDispaly = occReq;
        modal.componentInstance.pageType = (this.btnSubmitStand != 'Update' && this.pageAction == 'EDIT') ? 'MNG' : 'VIEW';
        modal.componentInstance.isAppPrimaryOcc = (occSource == 'VOLSTD_OCC_DET');
        // if(occSource != 'VOLSTD_OCC')
        //     modal.componentInstance.condition = 'TYPE_CODE = \'ANALYTICAL BALANCE\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
        // else 
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encStandardID;
        obj.code = 'VOLSOLUTION';

        var failVal = this.dataSource.data.filter(x => x.passOrFail == 'Fail')

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encStandardID, EntityCodes.volumetricSol,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.doNotSelectAction = this.appBO.appLevel == this.maxAppLevel && failVal.length > 0 ? 'APP' : '';
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate(['/lims/home']);
        });
    }

    prepareHeadersStd() {
        this.headersDataStd = [];
        this.headersDataStd.push({ "columnDef": 'type', "header": "Type", cell: (element: any) => `${element.type}` });
        this.headersDataStd.push({ "columnDef": 'stdAvg', "header": "Average", cell: (element: any) => `${element.stdAvg}` });
        this.headersDataStd.push({ "columnDef": 'stdRSD', "header": "% RSD", cell: (element: any) => `${element.stdRSD}` });
        this.headersDataStd.push({ "columnDef": 'standardStartDate', "header": "Start Date", cell: (element: any) => `${element.standardStartDate}` });
        this.headersDataStd.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}` });
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` });
        this.headersData.push({ "columnDef": 'psWeight', "header": "Weight of P.S / Volume Taken", cell: (element: any) => `${element.psWeight}` });
        this.headersData.push({ "columnDef": 'solutionConsumed', "header": "Vol of Sol. Consumed", cell: (element: any) => `${element.solutionConsumed}` });
        this.headersData.push({ "columnDef": 'result', "header": "Normality / Molarity", cell: (element: any) => `${element.result}` });
        this.headersData.push({ "columnDef": 'passOrFail', "header": 'Pass / Fail', cell: (element: any) => `${element.passOrFail}` })
    }

    isRestand: string;

    onActionClicked(evt) {
        if (evt.action == "EDIT" || evt.action == "VIEW") {
            this.isRestand = evt.val.stdType;
            this.pageAction = evt.action;
            this.encStandardID = evt.val.encStandardizationID;
            this.sourceType = evt.val.stdType == 'RSD' ? 'VOLSOL_RESTD' : 'VOLSOL_STD';
            this._service.getVolumetricStandardByID(evt.val.encStandardizationID);

            setTimeout(() => {
                if (this.solvents && this.solvents.action.length > 1 && evt.action == "VIEW") {
                    var index = this.solvents.action.findIndex(x => x == 'EDIT');
                    this.solvents.action.splice(index, 1);
                }
                else if (evt.action == "EDIT" && this.solvents.action.length <= 1)
                    this.solvents.action.push(GridActions.edit);

            }, this.solvents ? 0 : 200);
            this.isBtnsShow = true;
        }
        else if (evt.action == "MNG_OCC")
            this.addOccupancy('VOLSTD_OCC_DET', evt.val.encDetailID, true);

    }

    saveStandardization() {

        if (this.btnSubmitStand == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var retval = this.validateControl();

        if (CommonMethods.hasValue(retval))
            return this._alert.warning(retval);


        var obj: VolumetricStdDetails = new VolumetricStdDetails();
        obj.encStandardID = this.encStandardID;
        obj.finalVol = this.finalVol;
        obj.initTime = this.appBO.initTime;
        obj.psDrying = this.psDryingTem
        obj.avg = this.getAvgStd();
        obj.stdProcedure = this.stdProcedure;
        obj.coolingDuration = this.coolingDuration;
        obj.blankValue = this.blankValue;
        obj.dryingDuration = this.dryingDuration;
        obj.previousMolarity = this.solvents.dataSource.data.filter(x => x.isPrimaryPreparationBatch).length > 0 ? this.solvents.dataSource.data.filter(x => x.isPrimaryPreparationBatch)[0].stdAvg : null;
        obj.formulaDef = this.formulaDef;

        obj.stdList = new Array();
        var data = this.dataSource.data.filter(o => CommonMethods.hasValue(o.psWeight) || CommonMethods.hasValue(o.solutionConsumed) || CommonMethods.hasValue(o.result))
        if (data.length > 0) {
            this.dataSource.data.forEach((x) => {
                var item: StdItems = new StdItems();
                item.detailID = x.detailID;
                item.psWeight = x.psWeight;
                item.volConsumed = x.solutionConsumed;
                item.result = x.result;
                obj.stdList.push(item);
            })
        }

        obj.remarks = this.remarks;
        obj.formulaList = this.formulaList;
        obj.formulaDef = this.formulaDef;

        this.isLoaderStart = true;
        this._service.manageVolumetricSolStandard(obj);
    }

    validateControl() {
        var retval;
        var data = this.dataSource.data.filter(o => CommonMethods.hasValue(o.psWeight) || CommonMethods.hasValue(o.solutionConsumed) || CommonMethods.hasValue(o.result))

        // if (!CommonMethods.hasValue(this.psDryingTem) && (CommonMethods.hasValue(this.stdProcedure) || data.length == 0))
        //     return VolumetricSolMessages.psDrying;
        if (!CommonMethods.hasValue(this.stdProcedure))
            return VolumetricSolMessages.staProce;

        else if (data.length > 0) {
            this.dataSource.data.forEach((x) => {
                if (!CommonMethods.hasValue(x.psWeight) || !CommonMethods.hasValue(x.solutionConsumed))
                    retval = VolumetricSolMessages.stdDetails;
            })
        }
        if (CommonMethods.hasValue(retval))
            return retval;

        // if (data.length > 0) {
        //     for (var i = 0; i < this.dataSource.data.length; i++) {
        //         if (!CommonMethods.hasValue(this.dataSource.data[i].result))
        //             return VolumetricSolMessages.validStdDetails;
        //     }
        // }
        if (!CommonMethods.hasValue(this.finalVol) && data.length > 0)
            return VolumetricSolMessages.finalVol;
        if (!CommonMethods.validNumber(this.finalVol))
            return VolumetricSolMessages.validFinalVol;
        if (CommonMethods.hasValue(this.finalVol) && CommonMethods.hasValue(this.preparationVol) && Number(this.finalVol) > this.preparationVol && this.sourceType == 'VOLSOL_STD')
            return VolumetricSolMessages.finalLess;
        if (!CommonMethods.hasValue(this.remarks) && data.length > 0)
            return VolumetricSolMessages.remarks;


        var index = this.formulaList.findIndex(x => x.inputCode == "A3");

        if (index > -1 && this.solvents.dataSource.data.filter(x => x.isPrimaryPreparationBatch).length < 1) {
            return LimsHelperMessages.isPrimaryBatch;
        }

    }

    updateInitTime(evt) {
        this.appBO.initTime = evt;
    }

    getAvgStd() {
        var retval;
        if (CommonMethods.hasValueWithZero(this.average))
            return this.average;
        else
            return this.average;

        // futher need to discuss with @siva, if it is not required this code then remove //

        if (this.dataSource == null || this.dataSource == undefined || this.dataSource.data == undefined)
            return null;
        this.dataSource.data.forEach((x) => {
            if (!CommonMethods.hasValueWithZero(x.psWeight) || !CommonMethods.hasValueWithZero(x.solutionConsumed) || !CommonMethods.hasValueWithZero(x.result))
                retval = "pending";
        })

        if (retval == "pending")
            return null;

        if (this.dataSource && this.dataSource.data && this.dataSource.data.length > 0) {
            var sum = this.dataSource.data.reduce(function (sum, value) {
                return sum + value.result;
            }, 0);

            var avg = sum / this.dataSource.data.length;
            return avg.toFixed(4);
        }
    }

    getRSD() {

        var retval;

        this.dataSource.data.forEach((x) => {
            if (!CommonMethods.hasValue(x.psWeight) || !CommonMethods.hasValue(x.solutionConsumed) || !CommonMethods.hasValue(x.result))
                retval = VolumetricSolMessages.stdDetails;
        })

        if (CommonMethods.hasValue(retval)) {
            this._alert.warning(retval);
            return;
        }

        var obj: any = [];
        this.dataSource.data.forEach((x) => {
            var item: StdItems = new StdItems();
            item.detailID = x.detailID;
            item.psWeight = x.psWeight;
            item.volConsumed = x.solutionConsumed;
            item.result = x.result;
            obj.push(item);
        })

        this._service.getRsdValue(obj);
    }

    saverage(data) {
        var sum = data.reduce(function (sum, value) {
            return sum + value;
        }, 0);

        var avg = sum / data.length;
        return avg;
    }

    reStandardization() {
        var obj: ReStand = new ReStand();
        obj.encSolutionID = this.encSolutionID;
        obj.stdType = 'RSD';
        this.isLoaderStartBtn = true;
        this._service.reStandardization(obj);
    }

    actionHis() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encStandardID;
        obj.code = 'VOLSOL_STD';
        const modal = this._matDailog.open(ViewHistoryComponent, { minWidth: "50%" });
        modal.disableClose = true;
        modal.componentInstance.showTitle = true;
        modal.componentInstance.obj = obj;
    }


    getVolmeVal() {
        if (CommonMethods.hasValue(this.finalVol)) {
            return this.finalVol + " " + this.uom;
        }
        else
            return "N / A";

    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 3);
    }

    Invalidate() {
        var obj: ReStand = new ReStand();
        obj.encSolutionID = this.encStandardID;
        obj.stdType = 'INVA_STD';
        obj.initTime = this.appBO.initTime;

        this.confirService.confirm(VolumetricSolMessages.confirmStndInvalidate).subscribe((confirmed) => {
            if (confirmed) {
                this.isLoaderStartIcn = true;
                this._service.invalStd(obj);
            }

        })


    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.volumetricSol, 0, this.isRestand == 'SD' ? 'VOL_STAND_REQ' : 'VOL_RES_STAND_REQ', this.encStandardID, [], 'MEDICAL_LIMS',this.referenceNumber);
        if (this.btnUpload == ButtonActions.btnViewDocus)
            modal.componentInstance.mode = 'VIEW';
        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe((resu) => {

            })
        }
    }

    ngDoCheck() {
        this.isRestandardization = localStorage.getItem('isRestand');
    }

    prepareRs232(type: string, code: string, id: string) {
        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = ConditionCodes.VOLSOL_STD;
        obj.reqCode = this.referenceNumber;

        obj.sourceName = type;
        obj.encEntityActID = this.encStandardID;

        obj.chemicalName = type;
        obj.batchNumber = this.appBO.batchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = code;
        obj.occSource = "Titration";
        obj.sectionCode = SectionCodes.VOL_REQ;
        obj.parentID = this.encStandardID;

        return obj;
    }

    getRS232Values(evt: RS232IntegrationModelBO) {

        if (evt) {
            if (evt.sourceCode == 'VOL_STD_BLANK_VAL')
                this.blankValue = evt.keyValue;
        }
    }

    checkIsEnableRS232(evt) {
        this.isEnabledRs232Mode = evt;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        localStorage.removeItem('isRestand');
    }



    getRsdValue() {
        if (this.rsd == undefined || this.rsd == null)
            return "N / A"
        else
            return this.rsd;
    }

}