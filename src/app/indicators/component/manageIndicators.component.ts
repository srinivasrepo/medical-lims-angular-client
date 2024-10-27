import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { AlertService } from '../../common/services/alert.service';
import { IndicatorsService } from '../service/indicators.service';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Constants, PageUrls, LookupCodes, ActionMessages, EntityCodes, ButtonActions, ConditionCodes, CategoryCodeList, SectionCodes } from '../../common/services/utilities/constants';
import { AppBO, SingleIDBO, PrepareOccupancyBO, CategoryItemList, CategoryItem, GetCategoryBO } from '../../common/services/utilities/commonModels';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { ApprovalComponent } from '../../approvalProcess/component/approvalProcess.component';
import { CommonMethods, dateParserFormatter, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from '../../common/services/utilities/commonmethods';
import { LookupInfo, LookUpDisplayField, RS232IntegrationModelBO } from '../../limsHelpers/entity/limsGrid';
import { LookupComponent } from '../../limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../../limsHelpers/entity/lookupTitles';
import { IndicatorMessages } from '../messages/indicatorsMessages';
import { ManageIndicatorBO } from '../model/indicatorsModel';
import { UploadFiles } from '../../UtilUploads/component/upload.component';
import { mobilephaseMessages } from '../../mobilePhase/messages/mobilePhaseMessages';
import { ConfirmationService } from '../../limsHelpers/component/confirmationService';
import { AddNewMaterialComponent } from '../../common/component/addNewMaterial.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';
import { AddMaterialLables } from 'src/app/common/model/commonModel';
import { manageIndicatorMasterDataComponent } from './manageIndicatorMasterData.component';

@Component({
    selector: 'mng-ind',
    templateUrl: '../html/manageIndicator.html'
})

export class ManageIndicatorComponent {
    encIndicatorID: string;
    typeList: Array<any> = [];
    pageTitle: string = PageTitle.manageindicators;
    backUrl: string = PageUrls.homeUrl;
    appBO: AppBO = new AppBO();
    buttonType: string = ButtonActions.btnSave;
    buttonTypeOutput: string = ButtonActions.btnSave;
    btnUpload: string = ButtonActions.btnUpload;
    disable: boolean;
    solutionInfo: LookupInfo;
    subCategory: any;
    volPrepared: any;
    useBefore: string;
    briefDescription: string;
    dataSource: any;
    UploadIDs: Array<SingleIDBO> = [];
    uom: string;
    btnDisabledReq: boolean = false;
    refNo: string;
    status: string;
    otherInfo: string;
    validityPeriodList: Array<any> = [];
    getDate: Date = new Date();
    sourceType: string = 'TEST_SOL_INDICATOR';
    disableAll: boolean;
    actionDate: Date;
    dryingTemp: string;
    dryingDuration: string;
    coolingDuration: string;
    @ViewChild('solution', { static: true }) solution: LookupComponent;
    condition: string = '1=2';
    validationPeriodID: number;
    batchNumber: string;
    invID: number;
    solutionPH: number;
    weight: string;
    viewHistory: any;
    viewHistoryVisible: boolean;
    subscription: Subscription = new Subscription();
    entityCode: string = EntityCodes.indicators;
    isLoaderStart: boolean;
    isLoaderStartIcn: boolean;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    constructor(private _alert: AlertService, private _indService: IndicatorsService,
        private _limsContext: LIMSContextServices, private _actrouter: ActivatedRoute,
        private _confirmSer: ConfirmationService, private _router: Router,
        private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this._actrouter.queryParams.subscribe(param => this.encIndicatorID = param['id']);

        this.subscription = this._indService.indicatorsSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            else if (resp.purpose == "manageIndicatorsInfo") {
                this.isLoaderStart = this.isLoaderStartIcn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(IndicatorMessages.indicatorsSaved);
                    this.enableHeaders(false);
                    this.appBO = resp.result;
                    this.encIndicatorID = resp.result.encTranKey;
                    this.UploadIDs = [];
                    this.showHistory();
                    this._indService.getIndicatorsInfo(this.encIndicatorID);
                    this.btnDisabledReq = false;
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == "getIndicatorsInfo") {
                this.subCategory = resp.result.indicatorType;
                setTimeout(() => {
                    this.solution.setRow(resp.result.solutionID, resp.result.name);
                }, 100);

                this.volPrepared = resp.result.volumePrepared;
                this.useBefore = dateParserFormatter.FormatDate(resp.result.useBefore, 'datetime');
                this.validationPeriodID = resp.result.validatePeriodID;
                this.briefDescription = resp.result.breafDescription;
                this.solutionPH = resp.result.solutionPH;
                this.weight = resp.result.weight;
                this.otherInfo = resp.result.otherInfo;
                this.dryingDuration = resp.result.dryingDuration;
                this.dryingTemp = resp.result.dryingTemp;
                this.coolingDuration = resp.result.coolingDuration;
                this.uom = resp.result.uom;
                this.appBO = resp.result.tran;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solventsList, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.enableHeaders(false);
                this.prepareLkup();
                this.status = resp.result.status;
                this.refNo = resp.result.indicatorCode;
                this.operationTypeDisable();
                this.actionDate = resp.result.actionDate;

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = resp.result.indicatorTypeName;
                obj.catItemID = this.subCategory;
                obj.catItemCode = resp.result.indicatorTypeCode;
                obj.category = 'INDICATOR_TYPE';
                this.prepareAssignCatList(obj);

                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
            }
            else if (resp.purpose == "getValidityPeriods")
                this.validityPeriodList = resp.result;
        })

        this.showHistory();
        this._indService.getValidityPeriods(EntityCodes.indicators);

        if (CommonMethods.hasValue(this.encIndicatorID))
            this._indService.getIndicatorsInfo(this.encIndicatorID);

        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageIndicatorCategories();
        obj.type = 'MNG';
        this._indService.getCatItemsByCatCodeList(obj);
        this.prepareLkup();
    }


    prepareRs232(type: string, code: string, id: string) {

        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = ConditionCodes.INDICATOR;
        obj.reqCode = this.appBO.referenceNumber;
        obj.sourceName = type;
        obj.encEntityActID = this.encIndicatorID;
        obj.chemicalName = type;
        obj.batchNumber = this.refNo;
        obj.isComingLabchamical = false;
        obj.sourceCode = code;
        obj.occSource = 'Preparation / Output';
        obj.sectionCode = SectionCodes.IND_REQ;
        obj.parentID = this.encIndicatorID;

        return obj;
    }

    getRS232Values(evt: RS232IntegrationModelBO) {

        if (evt) {
            if (evt.sourceCode == 'INDICATOR_PRE_WEIGHT')
                this.weight = evt.keyValue;
            else
                this.solutionPH = evt.keyValue;
        }
    }

    operationTypeDisable() {
        if (this.appBO.operationType == 'VIEW') {
            this.disableAll = true;
            this.solution.disableBtn = true;
        }
    }

    prepareLkup() {
        this.condition = "1=2";
        // if (CommonMethods.hasValue(this.subCategory)) {
        this.condition = "IsActive= 1 AND EntityCode = '" + EntityCodes.indicators + "'";
        // this.condition = "CATEGORY_CODE = " + "\'LAB_MAT\'" + ' AND SUBCATCODE =' + "\'TEST_SOLUTIONS_INDICATORS\'" + ' AND STATUS_CODE =' + "\'ACT\'";
        // }

        this.solutionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getTestSolIndexMaterials, LKPDisplayNames.solutionName, LKPDisplayNames.solutionShortName, LookUpDisplayField.header, LKPPlaceholders.nameOfTheSolMaterial, this.condition);
    }

    enableHeaders(val: boolean, req: string = '') {
        if (req == 'REQ' || req == '') {
            this.disable = !val;
            this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;


            if (CommonMethods.hasValue(this.solution))
                this.solution.disableBtn = !val;
        }

        if ((req == 'OUT' || req == '') && CommonMethods.hasValue(this.volPrepared)) {
            this.buttonTypeOutput = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        }
    }

    changeIndicatorType() {
        this.solution.clear();
        this.prepareLkup();
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encIndicatorID;
        obj.code = 'INDICATOR';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encIndicatorID, this.entityCode, this.appBO.appLevel, this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encIndicatorID
        obj.code = EntityCodes.indicators;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encIndicatorID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    savePreparation(type: string) {
        if (type == 'REQ' && this.buttonType == ButtonActions.btnUpdate) {
            // this._confirmSer.confirm(mobilephaseMessages.confirmMobileUpdate).subscribe((confirmed) => {
            //     if (confirmed)
            this.enableHeaders(true, type);
            //})
            return;
        }

        if (type == 'OUT' && this.buttonTypeOutput == ButtonActions.btnUpdate) {
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED, LOCALSTORAGE_VALUES.ON);
            return this.enableHeaders(true, type);
        }

        var retVal = this.validateControls(type);

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        if (!CommonMethods.hasValue(this.encIndicatorID))
            this.btnDisabledReq = true;

        var obj: ManageIndicatorBO = new ManageIndicatorBO();
        obj.encIndicatorID = this.encIndicatorID;
        obj.indicatorType = this.subCategory;
        obj.indicatorSol = this.solution.selectedId;
        obj.volumePrepared = this.volPrepared;
        obj.type = type;
        obj.useBefore = this.useBefore;
        obj.validatePeriodID = this.validationPeriodID;
        obj.initTime = this.appBO.initTime;
        obj.briefDescription = this.briefDescription;
        obj.uploadedID = this.UploadIDs;
        obj.otherInfo = this.otherInfo;
        obj.entityCode = EntityCodes.indicators;
        obj.solutionPH = this.solutionPH;
        obj.weight = this.weight;
        obj.dryingDuration = this.dryingDuration;
        obj.dryingTemp = this.dryingTemp;
        obj.coolingDuration = this.coolingDuration;
        obj.role = this._limsContext.limsContext.userDetails.roleName;

        type == 'REQ' ? this.isLoaderStart = true : this.isLoaderStartIcn = true;
        this._indService.manageIndicatorsInfo(obj);
    }

    validateControls(type: string) {
        if (type == 'REQ') {
            if (!CommonMethods.hasValue(this.subCategory))
                return IndicatorMessages.indicatorType;
            else if (!CommonMethods.hasValue(this.solution.selectedId))
                return IndicatorMessages.solution;
        }
        else if (!CommonMethods.hasValue(this.briefDescription))
            return IndicatorMessages.breafDescription;
        else if (!CommonMethods.hasValue(this.volPrepared))
            return IndicatorMessages.volPrepared;
        else if (!CommonMethods.hasValue(this.validationPeriodID))
            return mobilephaseMessages.validityPeriods;
        else if (!CommonMethods.hasValue(this.useBefore))
            return IndicatorMessages.useBefore;
    }

    // addMaterial() {
    //     const modal = this._matDailog.open(AddNewMaterialComponent, CommonMethods.modalFullWidth);
    //     // modal.componentInstance.subCategory = this.getCategoryByID();
    //     var obj: AddMaterialLables = new AddMaterialLables();
    //     obj.material = "Output Solution Name";
    //     obj.materialType = false;
    //     obj.isUomDisabled = true;
    //     obj.uom = "Output Solution UOM";
    //     modal.componentInstance.labels = obj;
    //     modal.componentInstance.pageTitle = 'Solution';
    //     modal.componentInstance.entityCode = EntityCodes.indicators;
    //     modal.componentInstance.pageType = this.buttonType == ButtonActions.btnUpdate ? ButtonActions.btnView : 'MNG';
    //     modal.afterClosed().subscribe(resp => {
    //         this.prepareLkup();
    //     })
    // }

    getCategoryByID() {
        var obj = this.totalCatItemList.filter(x => x.catItemID == this.subCategory);

        if (obj.length > 0)
            return obj[0].catItemCode;
        else
            return "";
    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 3, 7);
    }

    updateInitTime(initTime: string) {
        this.appBO.initTime = initTime;
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.indicators, 0, 'IND_REQ', this.encIndicatorID, this.UploadIDs, 'MEDICAL_LIMS', this.appBO.referenceNumber);
        if (this.btnUpload == ButtonActions.btnViewDocus)
            modal.componentInstance.mode = 'VIEW';

        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe((resu) => {
                if (CommonMethods.hasValue(resu))
                    this.UploadIDs = resu;
            })
        }
    }

    allowSpecialChara_Numb(evt) {
        return CommonMethods.allowNumber(evt, '/');
    }

    clear(type: string) {
        if (type == 'REQ') {
            this.subCategory = '';
            this.solution.clear();
        }
        else {

            if (!this.disabledFields())
                this.volPrepared = this.useBefore = this.coolingDuration = this.dryingDuration = this.dryingTemp = this.weight = this.solutionPH = this.briefDescription = this.otherInfo = this.validationPeriodID = null;
            else
                this.otherInfo = null;

        }

    }

    getValidityDate(id: number) {
        var obj = this.validityPeriodList.filter(x => x.id == id);

        var date: Date;

        if (CommonMethods.hasValue(this.actionDate))
            this.getDate = dateParserFormatter.FormatDate(this.actionDate, 'default');

        if (obj[0].code == 'DAYS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate() + obj[0].value, this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'HRS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours() + obj[0].value, this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'MONTHS')
            date = new Date(this.getDate.getFullYear(), this.getDate.getMonth() + obj[0].value, this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());
        else if (obj[0].code == 'YEARS')
            date = new Date(this.getDate.getFullYear() + obj[0].value, this.getDate.getMonth(), this.getDate.getDate(), this.getDate.getHours(), this.getDate.getMinutes(), this.getDate.getSeconds());

        this.useBefore = dateParserFormatter.FormatDate(date, 'datetime');
    }

    addOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.refNo;
        obj.encEntityActID = this.encIndicatorID;
        obj.occSource = 'INDIC_OTH_OCC';
        obj.invID = this.invID;
        obj.entityRefNumber = this.appBO.referenceNumber;
        obj.conditionCode = ConditionCodes.INDICATOR;
        obj.occSourceName = "Preparation / Output";

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = this.buttonTypeOutput == ButtonActions.btnSave ? 'MNG' : 'VIEW';
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    masterData() {
        const modal = this._matDailog.open(manageIndicatorMasterDataComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.solutionID = this.solution.selectedId;
        modal.componentInstance.preparationTypeID = this.subCategory;
        modal.componentInstance.entityCode = EntityCodes.indicators;
        modal.componentInstance.encEntActID = this.encIndicatorID;
        modal.afterClosed().subscribe(res => {
            if (CommonMethods.hasValue(res.val)) {
                this.briefDescription = res.data;
                this.enableHeaders(true, 'OUT')
            }
        })
    }

    disabledFields() {
        if (this.appBO.appLevel > 0)
            return true;
        else
            return this.buttonTypeOutput == 'Update'
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}