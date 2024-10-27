import { Component, ViewChild } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, LookupCodes, ActionMessages, EntityCodes, ButtonActions, CategoryCodeList, SectionCodes } from 'src/app/common/services/utilities/constants';
import { stageInfoBO, LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { Subscription } from 'rxjs';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { mobilePhaseService } from '../services/mobilePhase.service';
// import { stageComponent } from 'src/app/limsHelpers/component/stageComponent.component';
import { mobilephaseMessages } from '../messages/mobilePhaseMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { manageMobilePhase, MasterData } from '../model/mobilePhaseModel';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { SingleIDBO, AppBO, SingleCodeBO, GetProdStageDetails, CategoryItem, CategoryItemList, GetCategoryBO } from '../../common/services/utilities/commonModels';
import { MatDialog, MatTabGroup } from '@angular/material';
import { MobilePhasePreparationComponent } from './mobilePhasePreparartion.component';
import { MobilePhaseOutputComponent } from './mobilePhaseOutput.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { manageSolventsComponent } from 'src/app/limsHelpers/component/manageSolvents.component';
import { SpecificationHeaderComponent } from 'src/app/common/component/specificationHeader.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';

@Component({
    selector: 'mob-req',
    templateUrl: '../html/mobilePhaseRequest.html'
})

export class MobilePhaseRequestComponent {

    pageTitle: string = PageTitle.mobilePhase;
    backUrl: string = PageUrls.homeUrl;
    // stageBO: stageInfoBO = new stageInfoBO();
    type: string;
    condition: string = '1=2';
    specificationsInfo: LookupInfo;
    specificationID: number;
    btnType: string = ButtonActions.btnSave;
    disable: boolean = false;
    encMobilePhaseID: string;
    specification: string;
    @ViewChild('specifications', { static: true }) specifications: LookupComponent;
    // @ViewChild('stage', { static: true }) stage: stageComponent;
    @ViewChild('mobilePrep', { static: true }) mobilePrep: MobilePhasePreparationComponent;
    @ViewChild('mobileOut', { static: true }) mobileOut: MobilePhaseOutputComponent;
    @ViewChild('solvents', { static: true }) solvents: manageSolventsComponent;
    @ViewChild('mbTab', { static: true }) mbTab: MatTabGroup;
    matInfo: LookupInfo;
    @ViewChild('materials', { static: true }) materials: LookupComponent;

    status: string;
    refNo: string;

    subscription: Subscription = new Subscription();
    dataSource: any = [];
    UploadIDs: Array<SingleIDBO> = [];
    btnUpload: string = ButtonActions.btnUpload;
    appBO: AppBO = new AppBO();
    btnDisabledReq: boolean = false;
    preparationType: string;
    manual: string;
    parameter: number;
    calibRef: string;
    parameterList: any;
    catCodeList: any = [];
    prodStageDetails: GetProdStageDetails = new GetProdStageDetails();
    sourceType: string = 'MOB_PHASE';
    calibPramID: number;

    testInfo: LookupInfo;
    @ViewChild('specTests', { static: true }) specTests: LookupComponent;

    calibInfo: LookupInfo;
    @ViewChild('calibaration', { static: true }) calibaration: LookupComponent;

    testCondition: string = "1=2";
    materialCategory: number;
    batchNumber: string;
    viewHistory: any;
    viewHistoryVisible: boolean;
    materialName: string;

    disableAll: boolean;
    entityCode: string = EntityCodes.mobilePhase;
    isLoaderStart: boolean = false;
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    constructor(private mblPhaseService: mobilePhaseService, private alert: AlertService,
        private actRoute: ActivatedRoute, private confirService: ConfirmationService, private _limsContext: LIMSContextServices,
        private _matDailog: MatDialog, private _router: Router, public _global: GlobalButtonIconsService) {
        // this.stageBO.bindKeyType = 'stagE_MAT_ID';
    }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(params => this.encMobilePhaseID = params['id'])
        this.subscription = this.mblPhaseService.mobilephaseSubject.subscribe(resp => {
            if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            else if (resp.purpose == "getCalibrationParameters")
                this.parameterList = resp.result;
            else if (resp.purpose == "manageMobilePhase") {
                this.isLoaderStart = false;
                if (resp.result.resultFlag == "SUCCESS") {
                    this.encMobilePhaseID = resp.result.encTranKey;
                    this.appBO.initTime = resp.result.initTime;
                    this.alert.success(mobilephaseMessages.mobilePhaseSuccess);
                    this.enableHeaders(false);
                    this.showHistory();
                    this.mblPhaseService.getMobilePreparationData(this.encMobilePhaseID)
                    this.btnDisabledReq = false;
                    this.UploadIDs = [];
                    this.mblPhaseService.getPreparationDetails(this.encMobilePhaseID);
                    this.getMassterData();

                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag));
            }
            else if (resp.purpose == "getMobilephaseData") {
                this.encMobilePhaseID = resp.result.mobilePhase.encMobilePhaseID;
                this.type = resp.result.mobilePhase.purpose;
                this.preparationType = resp.result.mobilePhase.preparationTypeCode;
                if (this.preparationType == 'CALIBRATION') {
                    this.manual = resp.result.mobilePhase.manual;
                    this.calibaration.setRow(resp.result.mobilePhase.maintenanceReportID, resp.result.mobilePhase.calibrationReference);
                    this.parameter = resp.result.mobilePhase.parameterType;
                    this.calibPramID = resp.result.mobilePhase.calibPramID;
                    this.calibLkp();
                    this.testLkp();
                }
                else {

                    this.prodStageDetails.product = resp.result.mobilePhase.product;
                    this.prodStageDetails.stage = resp.result.mobilePhase.stage;
                    this.prodStageDetails.stageID = resp.result.mobilePhase.stageID;
                    this.materialCategory = resp.result.mobilePhase.matCategoryID;
                    // this.stageBO.stageID = resp.result.mobilePhase.stageMatID;
                    // this.stageBO.productID = resp.result.mobilePhase.productID;
                    // this.stageBO.productName = resp.result.mobilePhase.productName;
                    // this.stageBO.bindKeyType = "stagE_MAT_ID";
                    // this.stage.bindData(this.stageBO);
                    this.specificationID = resp.result.mobilePhase.specificationID;
                    this.materials.setRow(resp.result.mobilePhase.materialID, resp.result.mobilePhase.materialCode);

                    this.specification = resp.result.mobilePhase.specification;
                    this.specifications.setRow(this.specificationID, resp.result.mobilePhase.specNumber);
                    this.prepageLkup();
                    this.testLkp();
                    this.materialName = resp.result.mobilePhase.material;
                }
                this.specTests.setRow(resp.result.mobilePhase.specTest, resp.result.mobilePhase.specTestName)
                this.enableHeaders(false);
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solvents, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.appBO = resp.result.appTran;
                this.status = resp.result.mobilePhase.status;
                this.refNo = resp.result.mobilePhase.mobilePhaseCode;
                this.batchNumber = resp.result.mobilePhase.batchNumber;
                // this.appBO.operationType = "VIEW";
                this.solvents.accessFieldsDisplay(this.fieldsValidate());
                this.mobileOut.accessFieldsDisplay(this.fieldsValidate());
                this.operationTypeDisable();

                var obj: CategoryItem = new CategoryItem();
                obj.catItem = resp.result.mobilePhase.purposeName;
                obj.catItemID = resp.result.mobilePhase.purposeID;
                obj.catItemCode = resp.result.mobilePhase.purpose;
                obj.category = 'MPHASE_PREP_TYPES';
                this.prepareAssignCatList(obj);

                var prObj: CategoryItem = new CategoryItem();
                prObj.catItem = resp.result.mobilePhase.preparationType;
                prObj.catItemID = resp.result.mobilePhase.preparationTypeID;
                prObj.catItemCode = resp.result.mobilePhase.preparationTypeCode;
                prObj.category = 'PREPARATION_TYPE';
                this.prepareAssignCatList(prObj);

                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);

            }
            else if (resp.purpose == "getAllMaterialCategories") {
                this.catCodeList = CommonMethods.getMaterialCategoryFilterData(resp.result, CategoryCodeList.GetMaterialCategories());
                this.prepareLKPMaterial();
            }
            else if (resp.purpose == "getProductStageDetailsByMaterialID") {
                this.prodStageDetails = resp.result;
                this.materialCategory = resp.result.categoryID;
            }

            else if (resp.purpose == "getMaterialDetailsBySpecID") {
                this.prodStageDetails.product = resp.result.product;
                this.prodStageDetails.stage = resp.result.stage;
                this.prodStageDetails.stageID = resp.result.stageID;
                this.materialCategory = resp.result.categoryID;
                this.prepareLKPMaterial();
                this.materials.setRow(resp.result.matID, resp.result.matCode);
            }

        })

        this.prepageLkup();
        this.prepareLKPMaterial();
        this.showHistory();

        this.calibLkp();
        this.testLkp();
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetMobilePhaseCategories();
        obj.type = 'MNG';
        this.mblPhaseService.getCatItemsByCatCodeList(obj);
        this.mblPhaseService.getCalibrationParameters();
        this.mblPhaseService.getAllMaterialCategories();

        if (CommonMethods.hasValue(this.encMobilePhaseID)) {
            this.mblPhaseService.getPreparationDetails(this.encMobilePhaseID);
            this.mblPhaseService.getMobilePreparationData(this.encMobilePhaseID);
        }
        else
            this.enableHeaders(true);
    }

    // stageSelected(evt) {
    //     this.specifications.clear();
    //     // this.stageBO.productID = evt.productID;
    //     // this.stageBO.stageID = evt.stage;
    //     this.prepageLkup();
    // }
    operationTypeDisable() {
        if (this.appBO.operationType == "VIEW") {
            this.disableAll = true;
            this.materials.disableBtn = this.specTests.disableBtn = this.specifications.disableBtn = this.calibaration.disableBtn = true;
        }
    }
    prepageLkup() {
        this.condition = '1=2'
        if (CommonMethods.hasValue(this.materials) && this.materials.selectedId)
            this.condition = 'MAT_ID=' + this.materials.selectedId + ' AND STATUS_CODE =' + "\'ACT\'";
        else if (CommonMethods.hasValue(this.materialCategory))
            this.condition = 'CATEGORY =' + this.materialCategory + ' AND STATUS_CODE =' + "\'ACT\'";
        else this.condition = 'STATUS_CODE =' + "\'ACT\'";
        // else
        //     this.condition = '1=2';

        this.specificationsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.specifications, LookupCodes.getSpecifications, LKPDisplayNames.specification, LKPDisplayNames.specNumber, LookUpDisplayField.code, LKPPlaceholders.specification, this.condition, '', 'LIMS');
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encMobilePhaseID;
        obj.code = 'MOBILE_PHASE';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encMobilePhaseID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    onChange() {
        this.specTests.clear();
        this.testCondition = "1 = 2";
        this.testLkp();
        if (CommonMethods.hasValue(this.materials))
            this.materials.clear();
        if (CommonMethods.hasValue(this.specifications))
            this.specifications.clear();
        this.prodStageDetails = new GetProdStageDetails();
        this.materialCategory = null;
        this.manual = null;
        if (CommonMethods.hasValue(this.calibaration))
            this.calibaration.clear();
    }

    getSpec() {
        var obj: any = { specID: this.preparationType == "ANALYSIS" ? this.specifications.selectedId : 0, calibID: this.preparationType != 'ANALYSIS' ? this.calibPramID : 0 };

        const modal = this._matDailog.open(SpecificationHeaderComponent, { width: '75%' });
        modal.componentInstance.pageTitle = this.preparationType == "ANALYSIS" ? PageTitle.getSpecHeaderInfo : "Calibration Parameter Details";
        modal.componentInstance.encSpecID = obj.specID;
        modal.componentInstance.entityCode = EntityCodes.mobilePhase;
        modal.componentInstance.encCalibID = obj.calibID;
        modal.componentInstance.isShow = true;
    }

    testLkp() {
        if (this.preparationType == "ANALYSIS") {
            this.getMaterialDetails();
            if (CommonMethods.hasValue(this.specifications.selectedId))
                this.testCondition = 'SpecID =' + this.specifications.selectedId;
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getSpecificatioinTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, this.testCondition, "", "LIMS");
        }
        else {
            if (CommonMethods.hasValue(this.calibPramID))
                this.testCondition = "CalibParamID = " + this.calibPramID;
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.parameter, LookupCodes.getSpecificatioinTests, LKPDisplayNames.parameter, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.parameter, this.testCondition, "", "LIMS");
        }

    }

    getMaterialDetails() {
        if (CommonMethods.hasValue(this.specifications.selectedId) && (!CommonMethods.hasValue(this.materialCategory) || !CommonMethods.hasValue(this.materials.selectedId)))
            this.mblPhaseService.getMaterialDetailsBySpecID(this.specifications.selectedId);
    }

    onSelectTestLkp(evt) {
        this.testCondition = "1=2";
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val)) {
            this.calibPramID = evt.val.extColName;
        }
        else {
            this.specTests.clear();
            this.calibPramID = null;
            this.testCondition = "1 = 2";
        }
        this.testLkp();
    }

    calibLkp() {
        this.calibInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibrationRef, LookupCodes.calibrationReference, LKPDisplayNames.status, LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.caliRefNumber);
    }

    savePreparation() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        this.specificationID = this.specifications.selectedId;
        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this.alert.warning(err);

        if (!CommonMethods.hasValue(this.encMobilePhaseID))
            this.btnDisabledReq = true;

        var obj: manageMobilePhase = new manageMobilePhase();
        obj.preparationType = this.preparationType;
        obj.purpose = this.type;
        if (this.preparationType == 'ANALYSIS') {
            obj.materialID = this.materials.selectedId;
            obj.specificationID = this.specificationID;
            obj.stageID = this.prodStageDetails.stageID;

        }
        else {
            obj.manual = this.manual;
            obj.parameterType = this.parameter;
            obj.calibrationReference = this.calibRef;
            obj.MaintenanceReportID = this.calibaration.selectedId;
        }
        obj.specTest = this.specTests.selectedId;
        obj.initTime = this.appBO.initTime;
        obj.encMobilePhaseID = this.encMobilePhaseID;
        obj.fileUploadedIDs = this.UploadIDs;
        obj.entityCode = EntityCodes.mobilePhase;
        obj.role = this._limsContext.limsContext.userDetails.roleName;

        this.isLoaderStart = true;

        this.mblPhaseService.manageMobilePhase(obj);
    }

    enableHeaders(val: boolean) {
        this.disable = !val;
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
        this.specifications.disableBtn = !val;
        this.specTests.disableBtn = !val
        this.calibaration.disableBtn = !val;

        if (this.preparationType == 'ANALYSIS')
            this.materials.disableBtn = !val;
    }

    validation() {
        if (!CommonMethods.hasValue(this.preparationType))
            return mobilephaseMessages.preparationType;
        if (!CommonMethods.hasValue(this.type))
            return mobilephaseMessages.type;
        if (this.preparationType == 'ANALYSIS') {
            if (!CommonMethods.hasValue(this.materialCategory))
                return mobilephaseMessages.materialCategory;
            if (!CommonMethods.hasValue(this.materials.selectedId))
                return mobilephaseMessages.material;
            if (!CommonMethods.hasValue(this.specificationID))
                return mobilephaseMessages.specification;
            if (!CommonMethods.hasValue(this.specTests.selectedId))
                return mobilephaseMessages.test;
        }
        else {
            if (!CommonMethods.hasValue(this.manual))
                return mobilephaseMessages.manual;
            if (!CommonMethods.hasValue(this.calibaration.selectedId))
                return mobilephaseMessages.reference;
            if (!CommonMethods.hasValue(this.specTests.selectedId))
                return mobilephaseMessages.testparameter;
        }


    }
    clear(type: string) {
        this.preparationType = ""; this.materialCategory = 0;
        this.materials.clear();
        this.prodStageDetails = new GetProdStageDetails();
        this.specifications.clear();
        this.specificationID = 0;
        this.specTests.clear();

        if (!CommonMethods.hasValue(this.encMobilePhaseID))
            this.type = "";
    }

    updateInitTime(initTime) {
        this.appBO.initTime = initTime;
        this.updateData(this.appBO);
    }

    updateData(evt) {
        this.mobileOut.appBO = evt;
        this.appBO = evt;
        this.mobilePrep.appBO = evt;
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.mobilePhase, 0, SectionCodes.MP_REQ, this.encMobilePhaseID, this.UploadIDs, 'MEDICAL_LIMS', this.refNo);
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

    ngDoCheck() {
        if (!CommonMethods.hasValue(this.encMobilePhaseID))
            this.mbTab.selectedIndex = 0;
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encMobilePhaseID;
        obj.code = 'MOBILE_PHASE';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encMobilePhaseID,this.entityCode,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate(['/lims/home']);
        });
    }

    fieldsValidate() {
        return this.encMobilePhaseID ? (this.appBO.appLevel >= 0 && (this.appBO.operationType == 'MANAGE' || !CommonMethods.hasValue(this.appBO.operationType))) : true;
    }

    prepareLKPMaterial() {
        var lkpCondition: string;
        if (CommonMethods.hasValue(this.materialCategory))
            lkpCondition = "CATEGORY_ID=" + this.materialCategory + " AND STATUS_CODE = 'ACT'";
        else {
            lkpCondition = "CATEGORY_ID IN ("
            this.catCodeList.forEach(x => {
                lkpCondition = lkpCondition + x.paramID + ', ';
            })
            lkpCondition = lkpCondition.substr(0, lkpCondition.length - 2)
            lkpCondition = lkpCondition + ") AND STATUS_CODE = 'ACT'";
        }

        this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Materials, LookupCodes.plantMaterials, LKPDisplayNames.Material, LKPDisplayNames.MaterialCode, LookUpDisplayField.code, LKPPlaceholders.materialCode, lkpCondition);
    }

    onSelectedLookup(evt) {
        this.prepageLkup(); // specification lkp
        if (CommonMethods.hasValue(evt.val)) {
            this.materialName = evt.val.name;
            this.mblPhaseService.getProductStageDetailsByMaterialID(evt.val.id);
        }
        else {
            this.specifications.clear();
            this.specTests.clear();
            this.prodStageDetails = new GetProdStageDetails();
            this.materialName = null;
        }
    }

    changeMatCat() {
        this.materials.clear();
        this.prepareLKPMaterial();
        this.specifications.clear();
        this.prepageLkup()
        this.specTests.clear();
        this.prodStageDetails = new GetProdStageDetails();
    }

    getMassterData() {
        var obj: MasterData = new MasterData();
        obj.type = 'NEW_REQ';
        obj.preparationType = this.preparationType;
        obj.typeCode = this.type;
        obj.materialID = this.materials.selectedId;
        obj.testID = this.specTests.selectedId;
        this.mblPhaseService.managePreparationMasterData(obj);
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 0)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else return null;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}