import { Component, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { materialCatInfo, LookupInfo, LookUpDisplayField, SolventQntyPreparation, SolQntyPrep, GridActionFilterBOList, RS232IntegrationModelBO } from '../entity/limsGrid';
import { LookupComponent } from './lookup';
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from '../entity/lookupTitles';
import { LookupCodes, GridActions, ActionMessages, EntityCodes, ButtonActions, LimsRespMessages, SectionCodes } from 'src/app/common/services/utilities/constants';
import { materialCategoryComponent } from './materialCategory.component';
import { mobilephaseMessages } from 'src/app/mobilePhase/messages/mobilePhaseMessages';
import { solventsPreparation } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { AlertService } from 'src/app/common/services/alert.service';
import { PrepareOccupancyBO } from 'src/app/common/services/utilities/commonModels';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';
import { MatDialog } from '@angular/material';
import { LimsHelperService } from '../services/limsHelpers.service';
import { Subscription } from 'rxjs';
import { LimsHelperMessages } from '../messages/limsMessages';
import { GridComponent } from './grid.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ConfirmationService } from './confirmationService';
import { RS232IntergrationComponent } from './rs232Integration.component';
import { Store, select } from '@ngrx/store';
import * as analysisActions from 'src/app/sampleAnalysis/state/analysis/analysis.action';
import * as fromAnalysisOptions from 'src/app/sampleAnalysis/state/analysis/analysis.reducer';
import { RS232IntegrationModeService } from 'src/app/common/services/rs232IntegrationMode.service';
import { SampleAnalysisLabDetails } from 'src/app/sampleAnalysis/model/sampleAnalysisModel';

@Component({
    selector: 'mng-solv',
    templateUrl: '../html/manageSolvents.html'
})

export class manageSolventsComponent implements OnChanges {

    @Input() pageAction: string = 'EDIT';
    @Input() encEntActID: string;
    @Input() entitySourceCode: string
    @Input() initTime: string;
    @Input() sourceType: string;
    @Input() invalidationID: number;
    @Input() MatID: number;
    @Input() AnalysisTypeCode: string;
    @Input() sampleAnlysis: SampleAnalysisLabDetails;
    @Input() requestCode: string;
    @Input() sourceCode: string;
    @Input() entityConditionCode: string;
    @Input() showDiscardBtn: boolean = false;
    isbtnOperationType: boolean = true;

    materialInfo: materialCatInfo = new materialCatInfo();
    batchCondition: string = '1=2';

    headerData: any = [];
    @Input() dataSource: any = [];
    action: any = [GridActions.Discard, GridActions.MNG_OCC, GridActions.RS232Intergration];
    uomList: any = [];
    uom: number;
    quantity: number;
    preparationID: number;
    solBtn: string = ButtonActions.btnAdd;
    batchInfo: LookupInfo;
    @ViewChild('batches', { static: false }) batches: LookupComponent;
    @ViewChild('materialCategory', { static: false }) materialCategory: materialCategoryComponent;
    subscription: Subscription = new Subscription();
    @Output() updateData: EventEmitter<any> = new EventEmitter();
    preparationName: string = 'Quantity for Preparation';
    uomName: string = 'Select UOM';
    manufacturer: string;
    usebefore: string;
    btnSolPrep: string = ButtonActions.btnSave;
    @Input() btnQntyPrep: boolean = true; // if u don't want quantity save btn make it as false
    @ViewChild('grid', { static: true }) grid: GridComponent;
    isDataSourceBinded: boolean = false;
    removeActions: any = { headerName: 'Solvents', Type: 'requestFrom', compareField: 'statusCode', RequestFrom: 'MEDICAL_LIMS' };
    extraColumns: any;
    stdAvg: any;
    @Input() IsMandatoryPrimary: boolean = false;
    ardsSolList: any;
    refresh: boolean = true;
    // isQuntyDisabled: boolean = true;
    isDisabled: boolean = false;
    subCategoryCode: string;
    purity: string;
    density: string;
    chemicalConsumeComments: string;
    chemicalConsumeRefArID: number;
    chemicalConsumeRefArdsExecID: number;
    testInfo: LookupInfo;
    @ViewChild('tests', { static: true }) tests: LookupComponent;
    arNumberInfo: LookupInfo;
    @ViewChild('arNumber', { static: true }) arNumber: LookupComponent;
    isLoaderStart: boolean = false;
    isLoaderStartbtn: boolean = false;
    cheType: string = 'CHEMICAL_OTH';
    chemicalTypeList: any;
    purityType: string;
    potPurAssy: string;

    @Input() analysisMode: string;

    constructor(private alert: AlertService, private _matDailog: MatDialog, private _confirmService: ConfirmationService,
        private service: LimsHelperService, public _global: GlobalButtonIconsService, private store: Store<fromAnalysisOptions.AnalysisState>,
        private _rs232Mode: RS232IntegrationModeService) {
        this.materialInfo.isCategoryShow = true;
        //this.materialInfo.categoryCode = 'LAB_MAT';
        this.materialInfo.condition = "CAT_CODE IN ('LAB_MAT', 'WATER_MAT')";
        this.materialInfo.category = "Material Category";
        this.materialInfo.subCategory = "Select Sub Category";
        this.materialInfo.material = "Chemical";
        this.materialInfo.categoryList = [{ catCode: 'LAB_MAT' }, { catCode: 'WATER_MAT' }]
        this.materialInfo.subCategories = [{ subCatCode: 'WATERMILLI_Q' }]
    }

    ngOnInit() {
        if (this.entitySourceCode == EntityCodes.sampleAnalysis || this.entitySourceCode == EntityCodes.calibrationArds || this.entitySourceCode == EntityCodes.calibrationValidation || this.entitySourceCode == EntityCodes.specValidation)
            this.store
                .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
                .subscribe(getArdsInputsInfo => {
                    this.ardsSolList = getArdsInputsInfo;
                });
    }

    ngAfterContentInit() {
        this.subscription = this.service.limsHelperSubject.subscribe(resp => {
            if (resp.purpose == "getUomDetailsByMaterialID") {
                this.uomList = resp.result;
                var index: number = CommonMethods.getUOMList().findIndex(x => x.type == this.uomList[0].uomCode);
                if (index == -1) {
                    this.alert.warning(LimsHelperMessages.materialUOM);
                    this.materialCategory.materials.clear();
                }
            }
            else if (resp.purpose == "manageMobilePhaseSolventsPreparation" + this.encEntActID) {
                this.isLoaderStart = false;
                if (resp.result.act.resultFlag == "SUCCESS") {
                    if (!CommonMethods.hasValue(this.invalidationID))
                        this.invalidationID = null;
                    this.initTime = resp.result.act.initTime;
                    this.preparationID = 0;
                    this.alert.success(this.successMessages());
                    this.grid.usrActions = new GridActionFilterBOList();
                    this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list.filter(x => x.invalidationID == this.invalidationID), 'arrayDateTimeFormat', 'useBeforeDate')));
                    if (this.entitySourceCode == EntityCodes.sampleAnalysis || this.entitySourceCode == EntityCodes.calibrationArds || this.entitySourceCode == EntityCodes.calibrationValidation || this.entitySourceCode == EntityCodes.specValidation) {
                        this.ardsSolList.solList = resp.result.list;
                        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.ardsSolList));
                    }
                    this.clear();
                    this.enableGridControl(false);
                    this.updateData.emit(this.initTime);
                    this.subCatItemCode = null;
                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.act.resultFlag));
            }
            else if (resp.purpose == "manageSolventQuantityPreparation" + this.encEntActID) {
                this.isDisabled = this.isLoaderStartbtn = false;
                if (resp.result.act.returnFlag == "SUCCESS") {
                    if (!CommonMethods.hasValue(this.invalidationID))
                        this.invalidationID = null;
                    this.alert.success(LimsHelperMessages.qntityUsedSaved);
                    this.initTime = resp.result.act.initTime;
                    this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list.filter(x => x.invalidationID == this.invalidationID), 'arrayDateTimeFormat', 'useBeforeDate')));
                    if (this.entitySourceCode == EntityCodes.sampleAnalysis || this.entitySourceCode == EntityCodes.calibrationArds || this.entitySourceCode == EntityCodes.calibrationValidation || this.entitySourceCode == EntityCodes.specValidation) {
                        this.ardsSolList.solList = resp.result.list;
                        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.ardsSolList));
                    }
                    this.enableGridControl(false);
                    this.updateData.emit(this.initTime);

                }
                else
                    this.alert.error(ActionMessages.GetMessageByCode(resp.result.act.returnFlag));
            }

            else if (resp.purpose == "getPreparationDetails") {
                if (CommonMethods.hasValue(this.isDataSourceBinded)) {
                    this.grid.usrActions = new GridActionFilterBOList();
                    this.dataSource.data.forEach((obj, index) => {
                        var data = resp.result.filter(x => x.preparationID == obj.preparationID)
                        if (data.length > 0) {
                            obj.equipmentUserCodes = data[0].equipmentUserCodes;
                            obj.statusCode = data[0].statusCode;
                        }
                        this.grid.checkUserActions(obj, index, 'REFRESH');
                    })

                }
                else
                    this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result, 'arrayDateTimeFormat', 'useBeforeDate')));
            }
            else if (resp.purpose == "getChemicalBatchDetailsByPackInvID") {
                if (!CommonMethods.hasValue(resp.result.manufacture) && resp.result.inHouse) {
                    this.manufacturer = "In-House"
                }
                else if (CommonMethods.hasValue(resp.result.manufacture))
                    this.manufacturer = resp.result.manufacture;
                this.stdAvg = resp.result.stdAvg;
                this.purity = resp.result.purity;
                this.density = resp.result.density;
                this.purityType = resp.result.purityType;
                this.potPurAssy = resp.result.potPurAssy;
                this.usebefore = dateParserFormatter.FormatDate(resp.result.useBeforeDate, 'datetime');
                this.subCatItemCode = resp.result.subCatCode;
                if (!CommonMethods.hasValue(this.materialInfo.subCategoryID) || !CommonMethods.hasValue(this.materialInfo.materialID)) {
                    this.refresh = false;
                    if (this.materialCategory)
                        this.materialCategory.category = resp.result.categoryCode;
                    this.materialInfo.categoryCode = resp.result.categoryCode;
                    this.materialInfo.subCategoryID = resp.result.subCatID;
                    this.materialInfo.materialID = resp.result.matID;
                    this.materialInfo.materialName = resp.result.matName;
                    if (this.materialCategory)
                        this.materialCategory.bindData();
                    this.batchLookupPrepare();
                }
            }
            else if (resp.purpose == "discardPreparationBatch") {
                if (resp.result == 'OK') {
                    this.alert.success(LimsHelperMessages.discardSucc);
                    var obj: solventsPreparation = new solventsPreparation();
                    obj.encEntityActID = this.encEntActID;
                    obj.entityCode = this.entitySourceCode;
                    obj.sourceType = this.sourceType;
                    this.isDataSourceBinded = true;
                    this.service.getPreparationDetails(obj);
                    //this.grid.reInitUserActions();
                }
                else if (resp.result == "OCC_TO_DATE")
                    this.alert.error(ActionMessages.GetMessageByCode("OCC_TO_DATE_DISC"));
                else this.alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "CHEMICAL_TYPE")
                this.chemicalTypeList = resp.result;
        });
        this.service.getCategoryItemsByCatCode('CHEMICAL_TYPE');
        this.prepageHeader();
        this.batchLookupPrepare();
        this.changeControlNames();
        this.enableGridControl(false);
        // this.service.getConvertableUOMByMatID(this.materialInfo.materialID);
        if (this.entitySourceCode == EntityCodes.sampleAnalysis || this.entitySourceCode == EntityCodes.calibrationArds) {

            this.arNumberConditionLkp();

            if (CommonMethods.hasValue(this.sampleAnlysis.chemicalConsumeComments))
                this.chemicalConsumeComments = this.sampleAnlysis.chemicalConsumeComments;
            if (CommonMethods.hasValue(this.sampleAnlysis.chemicalConsumeRefArID)) {
                this.arNumber.setRow(this.sampleAnlysis.chemicalConsumeRefArID, this.sampleAnlysis.chemicalConsumeRefArNumber);
                this.sampleAnalysisLkp();
                this.tests.setRow(this.sampleAnlysis.chemicalConsumeRefArdsExecID, this.sampleAnlysis.chemialConsumeTestTitle);
            }
        }


        if (this.pageAction == 'VIEW') {
            this.action = [GridActions.MNG_OCC];
            if (this.showDiscardBtn)
                this.action.push(GridActions.Discard)
        }
    }

    ngOnChanges() {
        setTimeout(() => {
            if (this.pageAction == 'VIEW') {
                this.action = [GridActions.MNG_OCC];
                if (this.showDiscardBtn)
                    this.action.push(GridActions.Discard)
            }
            else
                this.action = [GridActions.Discard, GridActions.MNG_OCC, GridActions.RS232Intergration]
            this.grid.isSolventGrid = true;

            this.removeRS232IntegrationModeAction();

        }, 300);
        this.btnSolPrep = ButtonActions.btnUpdate;
    }

    getRS232IntegrationMode() {
        if (((CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_ANALYSIS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CON_WISE" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CALIB" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CALIB_VALID" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_SPEC_VALID" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_HYPO" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_TEST")
            && (CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "CALIB_ARDS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == 'DAILY_CALIB' || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "SAMPLE_ANALYSIS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == 'CALIB_VALIDATION' || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "SPEC_VALID"
                || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "OOS_APP")) && this.analysisMode == "ONLINE")
            return true;

        return this._rs232Mode.getRS232IntegrationValidation() ? this._rs232Mode.getRSIntegrationReqStatus() : false;
    }

    removeRS232IntegrationModeAction() {

        var idx: number;
        idx = this.action.findIndex(x => x == GridActions.RS232Intergration);

        if (!this.getRS232IntegrationMode() && idx > -1)
            this.action.splice(idx, 1);
        else if (this.getRS232IntegrationMode() ? this.pageAction != 'VIEW' && idx == -1 : false)
            this.action.push(GridActions.RS232Intergration);

        sessionStorage.setItem("REFERESH_ACTIONS", 'true');

        return this.action;


        // if (!this.getRS232IntegrationMode() && this.action && this.action.length > 0 && this.action.findIndex(x => x == GridActions.RS232Intergration) > -1) {
        //     this.action.splice(idx, 1);
        // }
    }


    accessFieldsDisplay(val: boolean) {
        this.isbtnOperationType = val;
        setTimeout(() => {
            this.batches.disableBtn = !this.isbtnOperationType;
            this.materialCategory.isdisableBtnLkp(!this.isbtnOperationType);

            if (!this.isbtnOperationType)
                this.action = [GridActions.MNG_OCC];

            this.removeRS232IntegrationModeAction();

        }, 500);
    }

    successMessages() {
        if (this.entitySourceCode == EntityCodes.mobilePhase)
            return mobilephaseMessages.preparationAdded;
        else if (this.entitySourceCode == EntityCodes.indicators)
            return mobilephaseMessages.indicatorAdded;
        else if (this.entitySourceCode == EntityCodes.volumetricSol)
            return mobilephaseMessages.volSolutionSol;
        else if (this.entitySourceCode == EntityCodes.stockSolution)
            return mobilephaseMessages.stockAdded;
        else if (this.entitySourceCode == EntityCodes.rinsingSolutions)
            return mobilephaseMessages.rinsingSolAdded;
        else if (this.entitySourceCode == EntityCodes.sampleAnalysis)
            return mobilephaseMessages.sampleAnalysisSolAdded;
        else if (this.entitySourceCode == EntityCodes.calibrationArds)
            return mobilephaseMessages.calibSolAdded;
        else if (this.entitySourceCode == EntityCodes.calibrationValidation)
            return mobilephaseMessages.calibValid;
        else if (this.entitySourceCode == EntityCodes.specValidation)
            return mobilephaseMessages.specValid;
        else if (this.entitySourceCode == EntityCodes.oosModule)
            return mobilephaseMessages.oosChemical;

    }

    disableMatHeaders(val: boolean) {
        this.solBtn = val ? ButtonActions.btnUpdate : ButtonActions.btnAdd;
        this.materialCategory.enableHeaders(val);
        this.batches.disableBtn = val;
    }

    materialData(evt) {
        this.materialInfo.categoryCode = evt.categoryCode;
        this.materialInfo.subCategoryID = evt.subCategoryID;
        this.materialInfo.materialID = evt.materialID;
        this.subCategoryCode = evt.subCategoryCode;
        if (CommonMethods.hasValue(this.batches) && this.refresh) {
            this.batches.clear();
            this.batchLookupPrepare();
            if (CommonMethods.hasValue(this.materialInfo.materialID))
                this.service.getUomDetailsByMaterialID(this.materialInfo.materialID);
            this.manufacturer = this.usebefore = "";
        }
        this.refresh = true;
    }

    chemicalType() {
        var chemical: Array<string> = ['CHEMICALS_ACS_GRADE', 'CHEMICALS_AR_GRADE', 'CHEMICALS_REGULAR', "CHEMICALS_GC_GRADE", "CHEMICALS_HPLC_GRADE", 'CHEMICALS_LR_GRADE']
        if (this.cheType == 'CHEMICAL_OTH' && chemical.filter(x => x == this.subCategoryCode).length > 0)
            return true;
        else
            return false;
    }

    getCategoryList() {
        if (this.materialCategory)
            this.materialCategory.clear();
        if (this.batches)
            this.batches.clear();
        if (this.cheType == 'CHEMICAL_OTH') {
            this.materialInfo.isCategoryShow = true;
            //this.materialInfo.categoryCode = 'LAB_MAT';
            this.materialInfo.condition = "CAT_CODE IN ('LAB_MAT', 'WATER_MAT')";
            this.materialInfo.category = "Material Category";
            this.materialInfo.subCategory = "Select Sub Category";
            this.materialInfo.material = "Chemical";
            this.materialInfo.categoryList = [{ catCode: 'LAB_MAT' }, { catCode: 'WATER_MAT' }]
            this.materialInfo.subCategories = [{ subCatCode: 'WATERMILLI_Q' }]
            this.materialInfo.lkpType = "OTH"
        }
        else {
            this.materialInfo.isCategoryShow = true;
            //this.materialInfo.categoryCode = 'LAB_MAT';
            if (this.cheType == "WRK_STDS")
                this.materialInfo.condition = "REQ_TYPE = 'W'";
            else
                this.materialInfo.condition = "REQ_TYPE = 'R'";
            this.materialInfo.category = "Material Category";
            this.materialInfo.subCategory = "Select Sub Category";
            this.materialInfo.material = "Chemical";
            this.materialInfo.categoryList = [{ catCode: 'RAW_MAT' }, { catCode: 'FIN_MAT' }, { catCode: 'INTER_MAT' }, { catCode: 'IMPSTD_MAT' }]
            this.materialInfo.lkpType = "WRS"
        }
        this.materialCategory.prepareCatList();
        this.materialCategory.selectSubCategory();
        this.batchLookupPrepare();
    }

    arNumberConditionLkp() {
        var condition: string = "1 = 1";//"STATUS_CODE = 'UNANS' AND MAT_ID = " + this.MatID + " AND ANALYSIS_TYPE_CODE = '" + this.AnalysisTypeCode + "'";
        if (this.entitySourceCode == EntityCodes.sampleAnalysis)
            this.arNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getSampleAnalysisSearchArNumber, LKPDisplayNames.arNumber, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.arNumber, condition);
        else if (this.entitySourceCode == EntityCodes.calibrationArds)
            this.arNumberInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibrationRef, LookupCodes.getInstrumentCalibration, LKPDisplayNames.status, LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.calibrationRef, condition);

        this.sampleAnalysisLkp();
    }

    sampleAnalysisLkp() {
        var condition: string = "1=2";
        if (CommonMethods.hasValue(this.arNumber.selectedId) && this.entitySourceCode == EntityCodes.sampleAnalysis)
            condition = "ArID = " + this.arNumber.selectedId;
        else if (CommonMethods.hasValue(this.arNumber.selectedId) && this.entitySourceCode == EntityCodes.calibrationArds)
            condition = "EqpMaintID = " + this.arNumber.selectedId;

        if (this.entitySourceCode == EntityCodes.sampleAnalysis)
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getGroupTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, condition);
        else if (this.entitySourceCode == EntityCodes.calibrationArds)
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getGroupTests, LKPDisplayNames.test, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.test, condition);
    }

    batchLookupPrepare() {
        if (this.cheType == "CHEMICAL_OTH") {
            this.batchCondition = ' (IsMBBlock IS NULL OR IsMBBlock = 0)';
            if (CommonMethods.hasValue(this.materialInfo.categoryCode))
                this.batchCondition = this.batchCondition + " AND CatCode = '" + this.materialInfo.categoryCode + "'";
            if (CommonMethods.hasValue(this.materialInfo.subCategoryID))
                this.batchCondition = this.batchCondition + ' AND SubCatID = ' + this.materialInfo.subCategoryID
            if (CommonMethods.hasValue(this.materialInfo.materialID))
                this.batchCondition = 'MatID=' + this.materialInfo.materialID + " AND (IsMBBlock IS NULL OR IsMBBlock = 0)";
        }
        else {
            this.batchCondition = this.cheType == "WRK_STDS" ? "REQ_TYPE = 'W'" : "REQ_TYPE = 'R'";
            if (CommonMethods.hasValue(this.materialInfo.materialID))
                this.batchCondition = this.batchCondition + "AND MAT_ID = " + this.materialInfo.materialID
        }

        if (this.cheType == "CHEMICAL_OTH")
            this.batchInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.labInventoryBatch, LKPDisplayNames.reservedQty, LKPDisplayNames.batchNumber, LookUpDisplayField.code, LKPPlaceholders.BatchNumber, this.batchCondition, "Available Qty.", "LIMS");
        else
            this.batchInfo = CommonMethods.PrepareLookupInfo(LKPTitles.BatchNumber, LookupCodes.WorkRefPacks, LKPDisplayNames.availQty, LKPDisplayNames.batchNumber, LookUpDisplayField.code, LKPPlaceholders.BatchNumber, this.batchCondition, "", "LIMS");

    }

    allowdecimal(event: any) {
        return CommonMethods.allowDecimal(event, CommonMethods.allowDecimalLength, 3);
    }

    addSolvents() {
        if (this.solBtn == ButtonActions.btnUpdate) {
            return this.disableMatHeaders(false);
        }
        var solErr: string = this.solValidation();
        if (CommonMethods.hasValue(solErr))
            return this.alert.warning(solErr);

        var obj: solventsPreparation = new solventsPreparation();
        obj.encEntityActID = this.encEntActID;
        obj.initTime = this.initTime;
        obj.materialID = this.materialInfo.materialID;
        //obj.batchID = this.batches.selectedId;
        // obj.quantityPreparation = this.quantity;
        // obj.uomID = this.uom;
        if (this.cheType == "CHEMICAL_OTH")
            obj.packInvID = this.batches.selectedId;
        else
            obj.refInvID = this.batches.selectedId;
        obj.labChemicalTypeID = this.materialInfo.subCategoryID;
        obj.preparationID = this.preparationID;
        obj.entityCode = this.entitySourceCode;
        obj.sourceType = this.sourceType;
        obj.requestFrom = 'MEDICAL_LIMS';

        if (!CommonMethods.hasValue(this.preparationID) && this.getOccSource() == 'VOLSOL_PRE_STD_BATCH' && this.subCatItemCode == 'VOLUMETRIC_SOL')
            obj.isPrimaryPreparationBatch = (this.dataSource && this.dataSource.data && this.dataSource.data.length < 1)

        this.isLoaderStart = true;
        this.service.manageMobilePhaseSolventsPreparation(obj);
    }

    clear() {
        this.cheType = "CHEMICAL_OTH";
        this.materialCategory.clear();
        this.batches.clear();
        this.quantity = this.uom = 0;
        this.usebefore = this.manufacturer = '';
        this.subCategoryCode = '';
        this.chemicalType();
        this.potPurAssy = this.purityType = null;
        this.batchLookupPrepare();
    }

    solValidation() {
        if (!CommonMethods.hasValue(this.materialInfo.materialID))
            return this.entitySourceCode == EntityCodes.mobilePhase ? mobilephaseMessages.chemical : this.entitySourceCode == EntityCodes.indicators ? mobilephaseMessages.reagent : this.entitySourceCode == EntityCodes.volumetricSol ? mobilephaseMessages.volSolChemical : mobilephaseMessages.reagent;

        if (!CommonMethods.hasValue(this.batches.selectedId))
            return mobilephaseMessages.batch;
        // if (CommonMethods.hasValue(this.dataSource) && CommonMethods.hasValue(this.dataSource.data) && this.dataSource.data.length > 0) {
        //     var obj = this.dataSource.data.filter(x => x.packInvID == this.batches.selectedId && x.statusCode != 'DISC' && (!CommonMethods.hasValue(this.preparationID) || x.preparationID != this.preparationID));
        //     if (obj.length > 0)
        //         return LimsHelperMessages.batchExists;
        // }
        // if (!CommonMethods.hasValue(this.quantity))
        //     return this.entitySourceCode == EntityCodes.mobilePhase ? mobilephaseMessages.quantity : mobilephaseMessages.weight;
        // if (!CommonMethods.hasValue(this.uom))
        //     return this.entitySourceCode == EntityCodes.mobilePhase ? mobilephaseMessages.uom : mobilephaseMessages.volumne;
    }

    prepageHeader() {
        this.headerData = [];
        this.extraColumns = [];

        this.headerData.push({ columnDef: 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-4per' });

        if (this.entitySourceCode == "STOCK_SOL") {
            this.extraColumns.push({ columnDef: 'materialCode', "header": 'Chemical Code', cell: (element: any) => `${element.materialCode}` })
            this.headerData.push({ columnDef: 'materialName', "header": 'Chemical Name', cell: (element: any) => `${element.materialName}` })
            this.headerData.push({ columnDef: 'packBatchNumber', "header": 'In-house/Mfg B.No', cell: (element: any) => `${element.packBatchNumber}` })
            this.extraColumns.push({ columnDef: 'equipmentUserCodes', "header": 'Instrument ID(s)', cell: (element: any) => `${element.equipmentUserCodes}` })
            this.extraColumns.push({ columnDef: 'denomination', "header": "Conversion Factor ", cell: (element: any) => `${element.denomination}` })
            this.extraColumns.push({ columnDef: 'useBeforeDate', "header": 'Valid Up to', cell: (element: any) => `${element.useBeforeDate}` })

        }
        else {
            if (this.sourceType == 'VOLSOL_STD' || this.sourceType == "VOLSOL_RESTD")
                this.headerData.push({ columnDef: 'isPrimaryPreparationBatch', "header": '', cell: (element: any) => `${element.isPrimaryPreparationBatch}` });

            // this.headerData.push({ columnDef: 'chemicalType', "header": this.getControlHeadersNames('CHEC_TYPE'), cell: (element: any) => `${element.chemicalType}`, width: 'maxWidth-18per' });
            this.extraColumns.push({ columnDef: 'materialCode', "header": this.getHeadersCode(), cell: (element: any) => `${element.materialCode}`, width: 'maxWidth-10per' });
            this.headerData.push({ columnDef: 'materialName', "header": this.getControlHeadersNames('MATERIAL'), cell: (element: any) => `${element.materialName}`, width: 'maxWidth-60per' });
            // this.headerData.push({ columnDef: 'batchNumber', "header": "Batch No.", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-11per' });
            // this.headerData.push({ columnDef: 'packNo', "header": "Pack No.", cell: (element: any) => `${element.packNo}`, width: 'maxWidth-11per' });
            this.headerData.push({ columnDef: 'packBatchNumber', "header": "Batch No.(Pack No.)", cell: (element: any) => `${element.packBatchNumber}`, width: 'maxWidth-20per' });
            this.extraColumns.push({ columnDef: 'equipmentUserCodes', "header": "Instrument ID(s)", cell: (element: any) => `${element.equipmentUserCodes}`, width: 'maxWidth-15per' });
            this.extraColumns.push({ columnDef: 'denomination', "header": "Conversion Factor", cell: (element: any) => `${element.denomination}` })
            if (this.entitySourceCode != EntityCodes.volumetricSol)
                this.extraColumns.push({ columnDef: 'useBeforeDate', "header": "Valid Up to", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-20per' });
            else {
                // if (this.sourceType == 'VOLSOL_STD')
                //     this.headerData.push({ columnDef: 'expDateValidatity', "header": "EXP Date / Validity", cell: (element: any) => `${element.grade}`, width: 'maxWidth-15per' });

                this.extraColumns.push({ columnDef: 'grade', "header": "Grade", cell: (element: any) => `${element.grade}`, width: 'maxWidth-11per' });
                this.extraColumns.push({ columnDef: 'useBeforeDate', "header": "Valid Up to", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-10per' });
                // if (this.sourceType != 'VOLSOL_STD')
            }

        }
        this.headerData.push({ columnDef: 'quantity', "header": "Qty.Taken", cell: (element: any) => `${element.quantity}`, width: 'maxWidth-15per' });
        // this.headerData.push({ columnDef: 'denomination', "header": "Conversion Factor", cell: (element: any) => `${element.denomination}`, width: 'maxWidth-15per' });
        this.extraColumns.push({ columnDef: 'balanceQuantity', "header": "Pack Qty.", cell: (element: any) => `${element.balanceQuantity}`, width: 'maxWidth-20per' });
        // this.extraColumns.push({ columnDef: 'reservedQuantity', "header": "Reserved Qty.", cell: (element: any) => `${element.reservedQuantity}`, width: 'maxWidth-20per' });
        // this.extraColumns.push({ columnDef: 'actBalanceQty', "header": "Available Qty.", cell: (element: any) => `${element.actBalanceQty}`, width: 'maxWidth-20per' });
        if (this.pageAction != 'VIEW')
            this.headerData.push({ columnDef: "uomConvert", "header": "Conversion", width: 'maxWidth-4per' });
        this.extraColumns.push({ columnDef: 'stdAvg', "header": "Strength", cell: (element: any) => `${element.stdAvg}` });
        this.extraColumns.push({ columnDef: 'purity', "header": "Purity", cell: (element: any) => `${element.purity}`, width: 'maxWidth-20per' });
        this.extraColumns.push({ columnDef: 'density', "header": "Density", cell: (element: any) => `${element.density}`, width: 'maxWidth-20per' });
        this.extraColumns.push({ columnDef: 'manufacture', "header": "Manufacturer ", cell: (element: any) => `${element.manufacture}` });
        this.extraColumns.push({ columnDef: 'wrsPurity', "header": "", cell: (element: any) => `${element.potPurAssy}`, width: 'maxWidth-20per' });

    }

    getHeadersCode() {
        if (this.entitySourceCode == EntityCodes.mobilePhase)
            return 'Chemical Code';
        else if (this.entitySourceCode == EntityCodes.indicators)
            return 'Chemical Code';
        else
            return "Chemical Code";
    }

    getControlHeadersNames(type: string) {
        if (type == 'CHEC_TYPE' && this.entitySourceCode == EntityCodes.mobilePhase)
            return 'Name of the Reagents / Solvents'
        else if (type == 'CHEC_TYPE' && this.entitySourceCode == EntityCodes.indicators)
            return 'Sub Category'
        else if (type == 'MATERIAL' && this.entitySourceCode == EntityCodes.mobilePhase)
            return 'Chemical Name'
        else if (type == 'MATERIAL' && this.entitySourceCode == EntityCodes.indicators)
            return 'Reagent'
        if (type == 'CHEC_TYPE' && this.entitySourceCode == EntityCodes.volumetricSol)
            return 'Sub Category'
        else if (type == 'MATERIAL' && this.entitySourceCode == EntityCodes.volumetricSol)
            return 'Chemical Name'

    }

    onActionClicked(evt) {
        if (evt.action == "EDIT") {
            this.materialInfo.subCategoryID = evt.val.labChemicalTypeID;
            this.materialInfo.materialID = evt.val.materialID;
            this.materialInfo.materialName = evt.val.materialName;
            // this.service.getConvertableUOMByMatID(this.materialInfo.materialID);
            this.materialCategory.bindData();
            this.batches.setRow(evt.val.packInvID, evt.val.batchNumber);
            // this.quantity = evt.val.quantityPreparation;
            // this.uom = evt.val.uomID;
            this.preparationID = evt.val.preparationID;
            this.manufacturer = evt.val.manufacture;
            this.usebefore = evt.val.useBeforeDate;
            this.disableMatHeaders(true);
            this.batchLookupPrepare();
        }
        else if (evt.action == GridActions.MNG_OCC) {
            var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
            obj.occupancyCode = 'EQP_WEIGHING';
            obj.batchNumber = evt.val.batchPackNo;
            obj.encEntityActID = evt.val.preparationID;
            obj.occSource = this.getOccSource();
            //obj.invID = evt.val.invID;
            obj.entityRefNumber = this.requestCode;
            obj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
            obj.occSourceName = 'Lab Chemicals';

            const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.occupancyBO = obj;
            modal.componentInstance.occReqDispaly = true;
            modal.componentInstance.pageType = this.isbtnOperationType && this.pageAction == 'EDIT' && evt.val.statusCode != 'DISC' ? 'MNG' : 'VIEW';
            modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
            modal.componentInstance.entityCode = this.entitySourceCode;
            modal.afterClosed().subscribe(re => {
                if (CommonMethods.hasValue(re.isChanged)) {
                    var obj: solventsPreparation = new solventsPreparation();
                    obj.encEntityActID = this.encEntActID;
                    obj.entityCode = this.entitySourceCode;
                    obj.sourceType = this.sourceType;
                    this.isDataSourceBinded = true;
                    this.service.getPreparationDetails(obj);
                }
            })
        }
        else if (evt.action == GridActions.Discard) {
            if (this.btnSolPrep == ButtonActions.btnUpdate && !this.showDiscardBtn)
                return this.alert.info(LimsRespMessages.viewInfo);
            else {
                this._confirmService.confirm(LimsHelperMessages.discardConf, 'Confirmation', 'Ok', 'Cancel', 'lg', "FromSolvents").subscribe(res => {
                    if (res.result)
                        this.service.discardPreparationBatch({ CanInvalidate: res.canInvalidate, PreparationID: evt.val.preparationID });
                })
            }
        }
        else if (evt.action == GridActions.RS232Intergration) {
            var rsObj: RS232IntegrationModelBO = new RS232IntegrationModelBO();
            rsObj.occupancyCode = 'EQP_WEIGHING';
            rsObj.encEntityActID = evt.val.preparationID;
            rsObj.batchNumber = evt.val.batchPackNo;
            rsObj.reqCode = this.requestCode;
            rsObj.conditionCode = CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode);
            rsObj.occSource = 'Lab Chemicals';
            rsObj.sectionCode = this.getSectionCodes();
            rsObj.parentID = this.encEntActID;

            const modal = this._matDailog.open(RS232IntergrationComponent, CommonMethods.rs232ModalFullWidth);
            modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
            modal.componentInstance.entityCode = this.entitySourceCode;
            modal.componentInstance.rsObj = rsObj
            modal.componentInstance.btnType = this.btnSolPrep;
            modal.afterClosed().subscribe((resp) => {
                if (resp) {
                    evt.val.quantityPreparation = resp.singleVal;
                }
            })
        }
    }

    getSectionCodes() {
        if (this.sourceType == 'VOLSOL_STD')
            return SectionCodes.VOL_STAND_REQ;
        if (this.entitySourceCode == EntityCodes.mobilePhase)
            return SectionCodes.MP_REQ;
        else if (this.entitySourceCode == EntityCodes.indicators)
            return SectionCodes.IND_REQ;
        else if (this.entitySourceCode == EntityCodes.volumetricSol)
            return SectionCodes.VOL_REQ;

        else if (this.entitySourceCode == EntityCodes.stockSolution)
            return SectionCodes.STOCK_SOL;
        else if (this.entitySourceCode == EntityCodes.rinsingSolutions)
            return SectionCodes.RINSING_SOL;

        else if (this.entitySourceCode == EntityCodes.sampleAnalysis && this.sourceType == "SAM_ANA_PREP")
            return SectionCodes.TSTDOCS;

        else if (this.entitySourceCode == EntityCodes.sampleAnalysis && this.sourceType == 'CONT_WISE_ANA')
            return SectionCodes.TSTDOCS;
        else if (this.entitySourceCode == EntityCodes.oosModule || this.entitySourceCode == EntityCodes.specValidation)
            return SectionCodes.TSTDOCS;
        else if (this.entitySourceCode == EntityCodes.calibrationValidation)
            return SectionCodes.TSTDOCS;
        else if (this.entitySourceCode == EntityCodes.calibrationArds)
            return SectionCodes.TSTDOCS;

    }



    subCatItemCode: string;

    onSelectedLookup(evt) {
        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val)) {
            if (this.cheType == "CHEMICAL_OTH")
                this.service.getChemicalBatchDetailsByPackInvID(this.batches.selectedId, 0);
            else
                this.service.getChemicalBatchDetailsByPackInvID(0, this.batches.selectedId);
        }
        else
            this.subCatItemCode = this.manufacturer = this.usebefore = "";
    }

    getOccSource() {
        if (this.entitySourceCode == EntityCodes.mobilePhase)
            return 'MPHASE_PREP_BATCH';
        else if (this.entitySourceCode == EntityCodes.indicators)
            return 'INDIC_PRE_BATCH';
        else if (this.entitySourceCode == EntityCodes.volumetricSol && this.sourceType == 'VOLSOL_PREP')
            return 'VOLSOL_PRE_PRE_BATCH';
        else if (this.entitySourceCode == EntityCodes.volumetricSol && (this.sourceType == 'VOLSOL_STD' || this.sourceType == "VOLSOL_RESTD"))
            return 'VOLSOL_PRE_STD_BATCH';
        else if (this.entitySourceCode == EntityCodes.stockSolution)
            return 'STOCK_PRE_BATCH';
        else if (this.entitySourceCode == EntityCodes.rinsingSolutions)
            return 'RINSING_PRE_BATCH';
        else if (this.sourceCode)
            return this.entitySourceCode + "_" + this.sourceCode + "_EARDS";
        else
            return this.entitySourceCode + "_EARDS";
    }

    changeControlNames() {
        if (this.entitySourceCode == EntityCodes.indicators) {
            this.preparationName = 'Weight';
            this.uomName = "Select UOM";
        }
    }

    saveSolventsQnty() {
        if (this.btnSolPrep == ButtonActions.btnUpdate)
            return this.enableGridControl(true);

        var retval = this.validateGridQnty();

        if (CommonMethods.hasValue(retval))
            return this.alert.warning(retval);

        var obj: SolventQntyPreparation = new SolventQntyPreparation();
        obj.encEntityActID = this.encEntActID;
        obj.entityCode = this.entitySourceCode;
        obj.initTime = this.initTime;
        obj.sourceType = this.sourceType;
        obj.chemicalConsumeComments = this.chemicalConsumeComments;
        obj.chemicalConsumeRefArdsExecID = this.tests.selectedId;

        obj.solList = new Array<SolQntyPrep>();
        if (this.dataSource && this.dataSource.data.length > 0) {
            this.dataSource.data.forEach((x) => {
                if (x.statusCode != 'DISC') {
                    var item: SolQntyPrep = new SolQntyPrep();
                    item.paramAlies = x.paramAlies;
                    item.preparationID = x.preparationID;
                    item.quantityPreparation = x.quantityPreparation;
                    item.preparationQuantityString = x.quantityPreparation;
                    item.isPrimaryPreparationBatch = x.isPrimaryPreparationBatch;
                    obj.solList.push(item);
                }
            })
        }

        this.isDisabled = true;
        this.isLoaderStartbtn = true;
        this.service.manageSolventQuantityPreparation(obj)
    }

    validateGridQnty() {
        var retVal;

        if (CommonMethods.hasValue(this.dataSource) && !CommonMethods.hasValue(this.arNumber.selectedId)
            && !CommonMethods.hasValue(this.tests.selectedId) && !CommonMethods.hasValue(this.chemicalConsumeComments)) {
            if (this.dataSource.data.length < 1)
                return LimsHelperMessages.solventsCount;
        }

        if (!CommonMethods.hasValue(this.dataSource) && !CommonMethods.hasValue(this.arNumber.selectedId)
            && !CommonMethods.hasValue(this.tests.selectedId) && !CommonMethods.hasValue(this.chemicalConsumeComments))
            return LimsHelperMessages.solventsCount;

        if (CommonMethods.hasValue(this.arNumber.selectedId) && !CommonMethods.hasValue(this.tests.selectedId))
            return LimsHelperMessages.selectTest;


        // if (this.dataSource && this.dataSource.data.length < 1)
        //     return LimsHelperMessages.solventsCount;
        if (CommonMethods.hasValue(this.dataSource) && this.dataSource.data.length > 0) {
            var obj = this.dataSource.data.filter(x => CommonMethods.hasValue(x.quantityPreparation) || x.quantityPreparation == 0 || CommonMethods.hasValue(x.paramAlies))
            if (obj.length == 0)
                return LimsHelperMessages.addQuantity;


            obj.forEach((x) => {
                if (x.statusCode == 'APP' && !CommonMethods.hasValue(x.quantityPreparation) && !CommonMethods.hasValue(retVal)) {
                    if (x.quantityPreparation == 0 && x.quantityPreparation != '')
                        retVal = LimsHelperMessages.qntityUsed;
                    else retVal = LimsHelperMessages.quantity;
                }
                if (x.statusCode == 'APP' && !CommonMethods.validNumber(x.quantityPreparation) && !CommonMethods.hasValue(retVal))
                    retVal = LimsHelperMessages.validQtyTkn;
                else if (x.statusCode == 'APP' && !CommonMethods.hasValue(x.paramAlies) && !CommonMethods.hasValue(retVal))
                    retVal = LimsHelperMessages.uom;
            })


            if (!CommonMethods.hasValue(retVal) && (this.sourceType == 'VOLSOL_STD' || this.sourceType == "VOLSOL_RESTD") && this.IsMandatoryPrimary) {
                if (this.dataSource.data.filter(x => x.isPrimaryPreparationBatch).length < 1)
                    return LimsHelperMessages.isPrimaryBatch;
                else if (this.dataSource.data.filter(x => x.isPrimaryPreparationBatch).length > 1)
                    return LimsHelperMessages.isPrimaryBatchMore;
                else if (this.dataSource.data.filter(x => x.statusCode != 'DISC').length < 1)
                    return LimsHelperMessages.solutionChemicalCount;
            }
            else if (!CommonMethods.hasValue(retVal) && this.dataSource.data.filter(x => x.statusCode != 'DISC').length < 1)
                return LimsHelperMessages.labChemicalCount;

            // if (!CommonMethods.hasValue(retVal) && (this.sourceType == 'VOLSOL_STD' || this.sourceType == "VOLSOL_RESTD"))
            //     if (this.dataSource.data.filter(x => x.isPrimaryPreparationBatch).length > 1)
            //         return LimsHelperMessages.isPrimaryBatchMore;

            return retVal;
        }

    }

    enableGridControl(val: boolean) {
        this.btnSolPrep = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.arNumber.disableBtn = this.tests.disableBtn = this.btnSolPrep == ButtonActions.btnSave ? false : true;

        // this.grid.isDisabled = !val;
        if (val)
            this.grid.getUoms();
    }

    allowNumber(evt) {
        return CommonMethods.allowNumber(evt, null, 10);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}