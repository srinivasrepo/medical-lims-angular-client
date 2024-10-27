import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField, ManageRS232IntegrationFieldsBO, RS232IntegrationModelBO } from 'src/app/limsHelpers/entity/limsGrid';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ButtonActions, EntityCodes, PageUrls, GridActions, ActionMessages, ConditionCodes, CategoryCodeList, SectionCodes, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { StockSolutionsMessages } from '../messages/stockSolutionsMessages';
import { StockSolutionsService } from '../service/stockSolutions.service';
import { StockSolutionRequest, GetStockSolutionDetails, StockDetailsPreparation, StockDetailsOutput } from '../model/stockSolutionsModel';
import { AppBO, PrepareOccupancyBO, SingleIDBO, GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { manageIndicatorMasterDataComponent } from 'src/app/indicators/component/manageIndicatorMasterData.component';
import { ManageAddFieldComponent } from 'src/app/limsHelpers/component/manageAddField.component';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';

@Component({
    selector: 'mng-stk',
    templateUrl: '../html/stockSolutionRequest.html'
})

export class StockSolutionsRequestComponent {

    pageTitle: string = PageTitle.stockSolutionsRequest;
    solCondition: string = 'IsActive = 1';
    specCondition: string = "1=2";
    equpCondition: string = 'EQP_CAT_CODE =' + '\'QCINST_TYPE\'';
    buttonType: string = "Save";
    buttonTypePrep: string = "Save";
    buttonPrepType: string = "Save";
    buttonOutType: string = "Save";
    btnUpload: string = ButtonActions.btnUpload;
    btnUploadOut: string = ButtonActions.btnUpload;
    instumentTypeCode: number;
    sourceType: string = "STOCK_PRE_BATCH";
    tabIndex: number = 0;
    solventList: any;
    batchNumber: any;
    invID: any;
    validityPeriodList: any;
    getDate: Date = new Date();
    uploadIDs: Array<SingleIDBO> = [];
    hideView: boolean = false;
    backUrl: string = PageUrls.homeUrl;
    viewBackUrl: string = PageUrls.searchStockSolution;
    headerData: any = [];
    extraColumns: any = [];
    action: any = [GridActions.MNG_OCC];
    removeActions: any = { headerName: 'Solvents' };
    viewPageTitle: string = PageTitle.viewStockSolutions;
    viewHistory: any;
    disableButtonReq: boolean;
    disableButtonPrep: boolean;
    isPrepUpdated: boolean = false;
    disableAll: boolean;
    viewHistoryVisible: boolean;
    entityCode: string = EntityCodes.stockSolution;
    isEnabledRs232Mode: boolean = false;

    solutionInfo: LookupInfo;
    @ViewChild('solution', { static: true }) solution: LookupComponent;
    specificationsInfo: LookupInfo;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    equipmentInfo: LookupInfo;
    @ViewChild('equipment', { static: true }) equipment: LookupComponent;
    calibInfo: LookupInfo;
    @ViewChild('calibaration', { static: true }) calibaration: LookupComponent;

    obj: StockSolutionRequest = new StockSolutionRequest();
    getObj: GetStockSolutionDetails = new GetStockSolutionDetails();
    objPrep: StockDetailsPreparation = new StockDetailsPreparation();
    objOut: StockDetailsOutput = new StockDetailsOutput();
    appBO: AppBO = new AppBO();
    actionDate: Date;
    rs232Obj: ManageRS232IntegrationFieldsBO = new ManageRS232IntegrationFieldsBO();
    @ViewChild('mngCustField', { static: false }) mngCustField: ManageAddFieldComponent;
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;
    isLoaderStartBtn: boolean = false;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];
    isLoaderPrepratn: boolean = false;
    isLoaderOutput: boolean = false;

    constructor(private _alert: AlertService, private _router: Router,
        private _actrouter: ActivatedRoute, private _matDailog: MatDialog, private _stockSolService: StockSolutionsService,
        public _global: GlobalButtonIconsService, private _confirmSer: ConfirmationService) { }

    ngAfterContentInit() {
        this._actrouter.queryParams.subscribe(resp => { this.obj.encStockSolutionID = resp['id'] });
        this.subscription = this._stockSolService.stockSolSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            if (resp.purpose == "stockManageStockSolutionsRequest") {
                this.disableButtonReq = this.disableButtonPrep = false;
                this.isLoaderStart = this.isLoaderStartBtn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(StockSolutionsMessages.request);
                    this.appBO = resp.result;
                    this.enableHeaders(false, resp.type);
                    this.getObj.status = this.appBO.status;
                    this.getObj.referenceNumber = this.appBO.referenceNumber;

                    this._stockSolService.getSTOCKStockSolutionsDetailsByID(this.appBO.encTranKey);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));

                this.uploadIDs = [];
                this.getObj.status = resp.result.status;
                this.getObj.referenceNumber = resp.result.referenceNumber;
                this.objPrep.encStockSolutionID = this.objOut.encStockSolutionID = this.obj.encStockSolutionID = this.appBO.encTranKey;
                this.showHistory();
            }
            else if (resp.purpose == "GetSTOCKStockSolutionsDetailsByID") {

                if (!this.hideView) {
                    this.appBO = resp.result.recordActions;
                    this.objPrep.encStockSolutionID = this.objOut.encStockSolutionID = this.obj.encStockSolutionID = this.appBO.encTranKey;
                }

                this.getObj = resp.result.stockStockSolutionsDetails;
                this.getObj.status = resp.result.stockStockSolutionsDetails.status;
                this.getObj.referenceNumber = resp.result.stockStockSolutionsDetails.requestCode;
                this.obj.dryingDuration = resp.result.stockStockSolutionsDetails.dryingDuration;
                this.obj.manual = this.getObj.manual;
                this.obj.dryingTemp = resp.result.stockStockSolutionsDetails.dryingTemp;
                this.obj.coolingDuration = resp.result.stockStockSolutionsDetails.coolingDuration;
                this.objPrep.otherInfo = resp.result.stockStockSolutionsDetails.otherInfo;
                this.objPrep.description = resp.result.stockStockSolutionsDetails.description;
                this.solventList = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solventsList, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.solution.setRow(this.getObj.solutionIndexID, this.getObj.materialName);
                this.specifications.setRow(this.getObj.testID, this.getObj.testTitle);
                this.equipment.setRow(this.getObj.instID, this.getObj.instrumentCode);
                this.calibaration.setRow(this.getObj.calibrationReferenceID, this.getObj.calibrationReference)
                this.objOut = resp.result.stockStockSolutionsDetails;
                this.objOut.encStockSolutionID = this.appBO.encTranKey;
                this.objOut.useBefore = dateParserFormatter.FormatDate(resp.result.stockStockSolutionsDetails.useBefore, 'datetime')
                // this.isPrepUpdated = resp.result.stockStockSolutionsDetails.isPreparationUpd;
                this.instumentTypeCode = this.getObj.instrumentTypeCode;
                if (CommonMethods.hasValue(this.instumentTypeCode)) {
                    this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE' AND TYPE_CODE= '" + this.instumentTypeCode + "'";
                    this.prepareLkp();
                }
                if (CommonMethods.hasValue(this.getObj.calibPramID))
                    this.specCondition = "CalibParamID = " + this.getObj.calibPramID;
                this.specificationLkp();
                // this.buttonConfig("prep");
                this.disableButtonReq = this.disableButtonPrep = false;
                this.operationTypeDisble();
                this.actionDate = resp.result.stockStockSolutionsDetails.actionDate;

                this.enableHeaders(false, '');

                if (this.objPrep.description && resp.result.stockStockSolutionsDetails.isPreparationUpd)
                    this.enableHeaders(false, 'preparation');

                if (this.objOut.validity)
                    this.enableHeaders(false, 'output');

                this.rs232Obj.conditionCode = ConditionCodes.STOCK_SOL;
                this.rs232Obj.entityActID = this.obj.encStockSolutionID;
                this.rs232Obj.reqCode = this.getObj.referenceNumber;
                this.rs232Obj.batchNumber = this.getObj.batchNumber;


                this.objPrep.weight = resp.result.stockStockSolutionsDetails.weight;
                this.objPrep.solPH = resp.result.stockStockSolutionsDetails.solPH;

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = this.getObj.instrumentType;
                obj.catItemID = this.getObj.instrumentTypeID;
                obj.catItemCode = this.getObj.instrumentCode;
                obj.category = 'QCINST_TYPE';
                this.prepareAssignCatList(obj);
                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);

                this.mngCustField.getRS232IntegrationOther();

            }
            else if (resp.purpose == "getValidityPeriods")
                this.validityPeriodList = resp.result;
            else if (resp.purpose == "stockManageStockSolutionsPreparation") {
                this.isLoaderPrepratn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this.appBO = resp.result;
                    // this.isPrepUpdated = true;
                    this._alert.success(StockSolutionsMessages.fullRequest);
                    this.enableHeaders(false, 'preparation');

                }
                else {
                    // this.buttonPrepType = "Save";
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }

            }
            else if (resp.purpose == "stockManageStockSolutionsOutput") {
                this.isLoaderOutput = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this.appBO = resp.result;
                    // this.buttonOutType = "Update"
                    this._alert.success(StockSolutionsMessages.outputRequest);

                    this.enableHeaders(false, 'output');
                }
                else {
                    // this.buttonOutType = "Update";
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }


            }
        })

        this.showHistory();
        this.hideManageView();
        this.prepareLkp();
        this.calibLkp();
        this.specificationLkp();
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageStockSolutionsCategories();
        obj.type = 'MNG';
        this._stockSolService.getCatItemsByCatCodeList(obj);
        // this._stockSolService.getCatItemsByCatCode("QCINST_TYPE");
        if (CommonMethods.hasValue(this.obj.encStockSolutionID))
            this._stockSolService.getSTOCKStockSolutionsDetailsByID(this.obj.encStockSolutionID);


        this._stockSolService.getValidityPeriods(EntityCodes.stockSolution);
        if (CommonMethods.hasValue(this.getObj.dryingDuration))
            this.buttonTypePrep = "Update";

    }

    operationTypeDisble() {
        if (this.appBO.operationType == 'VIEW') {
            this.disableAll = true;
            this.solution.disableBtn = this.specifications.disableBtn = this.calibaration.disableBtn = this.equipment.disableBtn = true;
        }
    }

    equpConditon() {
        this.equipment.clear();
        if (!CommonMethods.hasValue(this.instumentTypeCode))
            this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE'";
        else
            this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE' AND TYPE_CODE= '" + this.instumentTypeCode + "'";
        this.prepareLkp();
    }

    onSelectTestLkp(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
            this.specCondition = "CalibParamID = " + evt.val.extColName;
        else {
            this.specCondition = "1=2";
            this.specifications.clear();
        }
        this.specificationLkp();
    }

    specificationLkp() {
        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameter, LookupCodes.getSpecificatioinTests,
            LKPDisplayNames.parameter, LKPDisplayNames.parameterID, LookUpDisplayField.header, LKPPlaceholders.parameter, this.specCondition, "", "LIMS");
    }

    calibLkp() {
        this.calibInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibrationRef, LookupCodes.calibrationReference, LKPDisplayNames.status,
            LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.caliRefNumber);
    }

    prepareLkp() {
        this.solCondition = "IsActive= 1 AND EntityCode = '" + EntityCodes.stockSolution + "'";
        this.solutionInfo = CommonMethods.PrepareLookupInfo(LKPTitles.solution, LookupCodes.getTestSolIndexMaterials, LKPDisplayNames.solutionName, LKPDisplayNames.solutionShortName, LookUpDisplayField.header, LKPPlaceholders.nameOfTheSolMaterial, this.solCondition);
        this.equipmentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Equipment, LookupCodes.getActiveEquipments, LKPDisplayNames.Equipment, LKPDisplayNames.EquipmentCode, LookUpDisplayField.code, LKPPlaceholders.calibration, this.equpCondition);
    }

    enableHeaders(val: boolean, type: string = '') {

        if (type == 'req' || type == '') {
            this.buttonType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.handleLKP(!val);
        }

        if (type == 'prep' || type == '') {
            this.buttonTypePrep = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.btnUpload = this.buttonTypePrep == ButtonActions.btnUpdate ? ButtonActions.btnViewDocus : ButtonActions.btnUpload;
        }

        if (type == 'preparation')
            this.buttonPrepType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;

        if (type == 'output') {
            this.buttonOutType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
            this.btnUploadOut = this.buttonOutType == ButtonActions.btnUpdate ? ButtonActions.btnViewDocus : ButtonActions.btnUpload;
        }

    }

    handleLKP(val: boolean) {

        setTimeout(() => {

            this.solution.disableBtn = val;
            this.specifications.disableBtn = val;
            this.equipment.disableBtn = this.calibaration.disableBtn = val;

        }, val ? 500 : 0);

    }

    saveRequest(type: string) {

        if (type == 'req') {

            if (this.buttonType == ButtonActions.btnUpdate)
                return this.enableHeaders(true, type);
            //     this._confirmSer.confirm(mobilephaseMessages.confirmMobileUpdate).subscribe((confirmed) => {
            //         if (confirmed)
            //             this.enableHeaders(true, type);
            //     })
            // }
            // else {

            var errmsg = this.validation();

            if (CommonMethods.hasValue(errmsg))
                return this._alert.warning(errmsg);

            this.saveServiceCall(type);
            // }
        }
        else {
            if (this.buttonTypePrep == ButtonActions.btnUpdate)
                return this.enableHeaders(true, type);

            this.saveServiceCall(type);
        }


        // if (this.buttonType != 'Update') {
        //     var errmsg = this.validation();
        //     if (CommonMethods.hasValue(errmsg))
        //         return this._alert.warning(errmsg);
        // }

        // if (type != "prep") {
        //     this.buttonType = btnType;
        //     if (type == 'req' && this.buttonType == "Update") {
        //         this._confirmSer.confirm(mobilephaseMessages.confirmMobileUpdate).subscribe((confirmed) => {
        //             if (confirmed)
        //                 this.buttonConfig(type);
        //         })
        //         return;
        //     }
        //     this.buttonConfig(type);
        // }
        // else {
        //     this.buttonType = "Update";
        //     this.buttonConfig(type);
        // }



        // this.obj.type = type;

        // if (this.buttonType == "Save" || this.buttonTypePrep == "Save")
        //     return;


    }

    saveServiceCall(type: string) {
        this.obj.uploadedID = this.uploadIDs;
        this.obj.solutionIndexID = this.solution.selectedId;
        this.obj.testID = this.specifications.selectedId;
        this.obj.instID = this.equipment.selectedId;
        this.obj.calibrationReferenceID = this.calibaration.selectedId;

        this.disableButtonReq = true;

        type == 'req' ? this.isLoaderStart = true : this.isLoaderStartBtn = true;

        this._stockSolService.stockManageStockSolutionsRequest(this.obj, type);
    }

    savePreparation(type: string) {

        if (this.buttonPrepType == ButtonActions.btnUpdate)
            return this.enableHeaders(true, type);

        if (!CommonMethods.hasValue(this.objPrep.description))
            return this._alert.warning(StockSolutionsMessages.description);

        this.objPrep.initTime = this.appBO.initTime;
        // this.disableButtonPrep = true;

        this.isLoaderPrepratn = true;
        this._stockSolService.stockManageStockSolutionsPreparation(this.objPrep);

        // if (type == "Update")
        //     this.buttonPrepType = "Save";
        // else {
        //     if (!CommonMethods.hasValue(this.objPrep.description))
        //         return this._alert.warning(StockSolutionsMessages.description);
        // }
    }

    saveOutput(type: string) {


        if (type == 'output' && this.buttonOutType == ButtonActions.btnUpdate) {
            CustomLocalStorage.setItem(LOCALSTORAGE_KEYS.IS_RS232_IS_CLICKED, LOCALSTORAGE_VALUES.ON);
            return this.enableHeaders(true, type);
        }

        if (!CommonMethods.hasValue(this.objOut.finalVolume))
            return this._alert.warning(StockSolutionsMessages.final);
        else if (!CommonMethods.hasValue(this.objOut.validity))
            return this._alert.warning(StockSolutionsMessages.validity);

        this.objOut.initTime = this.appBO.initTime;

        // if (type == 'output')
        //     this.objOut.otherList = this.mngCustField.withValueFields();

        // this.disableButtonPrep = true;
        this.isLoaderOutput = true;
        this._stockSolService.stockManageStockSolutionsOutput(this.objOut);


        // if (type == "Update") {
        //     this.buttonOutType = "Save";
        //     this.btnUploadOut = ButtonActions.btnUpload;
        // }
        // else {
        //     if (!CommonMethods.hasValue(this.objOut.finalVolume))
        //         return this._alert.warning(StockSolutionsMessages.final);
        //     if (!CommonMethods.hasValue(this.objOut.validity))
        //         return this._alert.warning(StockSolutionsMessages.validity);

        //     this.btnUploadOut = ButtonActions.btnViewFiles;
        //     this.disableButtonPrep = true;
        //     this._stockSolService.stockManageStockSolutionsOutput(this.objOut);
        // }
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

        this.objOut.useBefore = dateParserFormatter.FormatDate(date, 'datetime');
    }

    buttonConfig(type: string) {
        if (this.buttonType == "Save" && CommonMethods.hasValue(this.obj.encStockSolutionID)) {
            this.buttonType = "Update";
            this.btnUpload = ButtonActions.btnViewDocus;
            if (CommonMethods.hasValue(this.solution) && this.buttonType == "Update")
                this.solution.disableBtn = this.specifications.disableBtn = this.equipment.disableBtn = this.calibaration.disableBtn = true;
        }
        else if (this.buttonType == "Save" && type == 'req') {
            this.buttonType = "Update";
            this.solution.disableBtn = this.specifications.disableBtn = this.calibaration.disableBtn = this.equipment.disableBtn = true;
        }
        else if (type == 'req') {
            this.buttonType = "Save";
            this.solution.disableBtn = this.specifications.disableBtn = this.calibaration.disableBtn = this.equipment.disableBtn = false;
        }
        if (type == "prep" && this.buttonTypePrep == "Save") {
            this.buttonTypePrep = "Update";
            this.btnUpload = ButtonActions.btnViewDocus;
        }
        else if (type == "prep" && this.buttonTypePrep == "Update") {
            this.buttonTypePrep = "Save";
            this.btnUpload = ButtonActions.btnUpload;
        }
        if (CommonMethods.hasValue(this.objPrep.description) && CommonMethods.hasValue(this.isPrepUpdated))
            this.buttonPrepType = "Update"
        if (CommonMethods.hasValue(this.objOut.finalVolume)) {
            this.buttonOutType = "Update";
            this.btnUploadOut = ButtonActions.btnViewDocus;
        }

    }

    clear(type: string) {
        if (type == "REQ") {
            this.solution.clear();
            this.equipment.clear();
            this.specifications.clear();
            this.calibaration.clear();
            this.instumentTypeCode = this.obj.manual = null;
        }
        else if (type == "PREP")
            this.objPrep.otherInfo = this.objPrep.description = this.objPrep.solPH = this.objPrep.weight = null;
        else if (type == "OUT")
            this.objOut.useBefore = this.objOut.finalVolume = this.objOut.validity = null;
    }

    updateInitTime(initTime: string) {
        this.appBO.initTime = initTime;
    }

    getSpec() {
        const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = "Calibration Parameter Details";
        modal.componentInstance.encSpecID = this.specifications.selectedId;
        modal.componentInstance.entityCode = EntityCodes.stockSolution;
        modal.componentInstance.encCalibID = this.calibaration.selectedId;
        modal.componentInstance.isShow = true;
    }

    Uploadfiles(type: string, section: string) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.stockSolution, 0, section, this.obj.encStockSolutionID, this.uploadIDs, 'MEDICAL_LIMS', this.appBO.referenceNumber);
        if ((this.btnUpload == ButtonActions.btnViewDocus && type == 'REQ') || (this.btnUploadOut == ButtonActions.btnViewDocus && type == 'OUT') || (type == 'VIEW'))
            modal.componentInstance.mode = 'VIEW';
        // else if (this.btnUploadOut == ButtonActions.btnViewFiles && type == 'OUT')
        //     modal.componentInstance.mode = 'VIEW';
        // else if (type == 'VIEW')
        //     modal.componentInstance.mode = 'VIEW';
        // // else if (this.btnUploadOut == ButtonActions.btnViewFiles && type == 'OUT')
        // //     modal.componentInstance.mode = 'VIEW';
        // // else if (type == 'VIEW')
        // //     modal.componentInstance.mode = 'VIEW';
        else {
            modal.componentInstance.mode = 'MANAGE';
            modal.afterClosed().subscribe(resu => {
                if (CommonMethods.hasValue(resu))
                    this.uploadIDs = resu;
            })
        }
    }

    validation() {
        if (!CommonMethods.hasValue(this.solution.selectedId))
            return StockSolutionsMessages.solution;
        if (!CommonMethods.hasValue(this.obj.manual))
            return StockSolutionsMessages.manual;
        if (CommonMethods.hasValue(this.calibaration.selectedId) && !CommonMethods.hasValue(this.specifications.selectedId))
            return StockSolutionsMessages.specification

        if (!CommonMethods.hasValue(this.equipment.selectedId))
            return StockSolutionsMessages.instrument;
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.objOut.encStockSolutionID;
        obj.code = EntityCodes.stockSolution;

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.objOut.encStockSolutionID, this.entityCode, this.appBO.appLevel, this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    addOccupancy(code: string = 'INITIATION') {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.getObj.batchNumber;
        obj.encEntityActID = this.obj.encStockSolutionID;
        obj.occSource = 'STOCK_OTH_OCC';
        obj.invID = this.invID;
        obj.entityRefNumber = this.appBO.referenceNumber;
        obj.occSourceName = code == "INITIATION" ? "Calibration Solution" : 'Preparation';
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = (code == 'INITIATION' ? (this.buttonTypePrep == "Save" ? 'MNG' : 'VIEW') : (this.buttonPrepType == ButtonActions.btnSave ? 'MNG' : 'VIEW'));
        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    hideManageView() {
        if (CommonMethods.hasValue(localStorage.getItem("viewStockSolution"))) {
            this.hideView = true;
            this._stockSolService.getSTOCKStockSolutionsDetailsByID(localStorage.getItem("viewStockSolution"));
            this.tranHistory();
        }
        else
            this.hideView = false;
    }

    // prepareHeaders() {
    //     this.headerData.push({ columnDef: 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-4per' });
    //     this.extraColumns.push({ columnDef: 'materialCode', "header": 'Standards/Chemicals Used', cell: (element: any) => `${element.materialCode}` })
    //     this.headerData.push({ columnDef: 'materialName', "header": 'Chemical Name', cell: (element: any) => `${element.materialName}` })
    //     this.headerData.push({ columnDef: 'packBatchNumber', "header": 'In-house/Mfg B.No', cell: (element: any) => `${element.packBatchNumber}` })
    //     this.headerData.push({ columnDef: 'equipmentUserCodes', "header": 'Manufacturer', cell: (element: any) => `${element.equipmentUserCodes}` })
    //     this.extraColumns.push({ columnDef: 'useBefore', "header": 'Standards/Chemicals UseBeforeDate', cell: (element: any) => `${element.useBefore}` })
    // }

    onActionClicked(evt) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = evt.val.batchNumber;
        obj.encEntityActID = evt.val.preparationID;
        obj.occSource = 'INDIC_PRE_BATCH';
        obj.invID = evt.val.invID;

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
        modal.componentInstance.condition = 'TYPE_CODE = \'ANALYTICAL BALANCE\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    viewOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.encEntityActID = this.obj.encStockSolutionID;
        obj.occSource = 'STOCK_OTH_OCC';
        obj.occSourceName = "Calibration Solution"

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
    }

    masterData() {
        const modal = this._matDailog.open(manageIndicatorMasterDataComponent, { width: '80%' });
        modal.disableClose = true;
        modal.componentInstance.solutionID = this.solution.selectedId;
        //modal.componentInstance.preparationTypeID = instrumentTypeID[0].catItemID;
        modal.componentInstance.entityCode = EntityCodes.stockSolution;
        modal.componentInstance.encEntActID = this.obj.encStockSolutionID;
        modal.afterClosed().subscribe(res => {
            if (CommonMethods.hasValue(res.val)) {
                this.objPrep.description = res.data;
            }
        })
    }

    onSelectedLookup(evt) {
        if (CommonMethods.hasValue(evt.val)) {
            this.instumentTypeCode = evt.val.extColName;
            this.equpCondition = "EQP_CAT_CODE ='QCINST_TYPE' AND TYPE_CODE= '" + this.instumentTypeCode + "'";
            this.prepareLkp();
        }
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.obj.encStockSolutionID;
        obj.code = EntityCodes.stockSolution;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.obj.encStockSolutionID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    selectedTab(event) {
        this.tabIndex = event;
    }

    allowdecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 3);
    }


    allowdecimal15(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength15, 5, 10);
    }


    formatString(val) {
        return CommonMethods.FormatValueString(val);
    }

    ngOnDestroy() {
        localStorage.removeItem("viewStockSolution");
        this.subscription.unsubscribe();
    }


    prepareRs232(type: string, code: string, id: string) {
        var obj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
        obj.id = id;
        obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
        obj.reqCode = this.getObj.referenceNumber;

        obj.sourceName = type;
        obj.encEntityActID = this.obj.encStockSolutionID;

        obj.chemicalName = type;
        obj.batchNumber = this.getObj.batchNumber;
        obj.isComingLabchamical = false;
        obj.sourceCode = code;
        obj.occSource = "Preparation";
        obj.sectionCode = SectionCodes.STOCK_SOL;
        obj.parentID = this.obj.encStockSolutionID;
        return obj;
    }

    getRS232Values(evt: RS232IntegrationModelBO) {

        if (evt) {
            if (evt.sourceCode == 'CALIB_REQ_WEIGHT')
                this.objPrep.weight = evt.keyValue;
            else if (evt.sourceCode == 'CALIB_REQ_PH')
                this.objPrep.solPH = evt.keyValue;
        }
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

    checkIsEnableRS232(evt) {
        this.isEnabledRs232Mode = evt;
    }

}