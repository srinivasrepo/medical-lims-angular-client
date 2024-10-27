import { Component, OnDestroy, AfterContentInit, OnInit, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { ButtonActions, LookupCodes, ActionMessages, GridActions, PageUrls, EntityCodes, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { ManageQCCalibrationBO, AddResultBO, AddResultBOList, QCSPECDeleteTestMethodsBO, ManageSTPGroupTestBO } from '../models/qcCalibrationsModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { Store, select } from '@ngrx/store';
import * as fromCalibrationsOptions from '../state/calibrations/calibration.reducer';
import * as calibrationActions from '../state/calibrations/calibrations.action';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { AlertService } from 'src/app/common/services/alert.service';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { MatDialog } from '@angular/material';
import { QCCalibTestResultComponent } from './testResult.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { QCCalibrationHeadersComponent } from './qcCalibrationHeader.component';

@Component({
    selector: 'app-qcCalib',
    templateUrl: '../html/manageQCCalibrations.html'
})

export class ManageQCCalibrationsComponent implements OnInit, AfterContentInit, OnDestroy {

    // encCalibParamID: string;
    // btnDisabledReq: boolean = false;
    btnType: string = ButtonActions.btnSave;
    showHideCalibBtn: boolean = false;
    appBO: AppBO = new AppBO();
    showHideCategory: boolean = true;
    showHideSubCategory: boolean = true;
    isExpandPanel: boolean = false;

    categoryInfo: LookupInfo;
    @ViewChild('category', { static: false }) category: LookupComponent;

    subCategoryInfo: LookupInfo;
    @ViewChild('subCategory', { static: false }) subCategory: LookupComponent;

    testsInfo: LookupInfo;
    @ViewChild('tests', { static: false }) tests: LookupComponent;
    @ViewChild('headerCom', { static: false }) headerCom: QCCalibrationHeadersComponent;


    manageCalibBO: ManageQCCalibrationBO = new ManageQCCalibrationBO();
    addResult: AddResultBO = new AddResultBO();

    resultActions: Array<string> = [GridActions.delete];
    resultHeadersData: any;
    resultDatasource: any;

    calibrationActions: Array<string> = [GridActions.delete, GridActions.upload, GridActions.edit, GridActions.PDF];
    removeActions  = {headerName : "QCCalibrations",compareField : "rowType"}
    calibrationHeadersData: any;
    calibrationDatasource: any;
    actionType: string;

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;
    isLoaderStartIcn: boolean = false;

    constructor(private _service: QCCalibrationsService, private _actRoute: ActivatedRoute,
        private _global: GlobalButtonIconsService, private _store: Store<fromCalibrationsOptions.CalibrationState>,
        private _alert: AlertService, private _matDailog: MatDialog, private _router: Router,
        private _confirm: ConfirmationService

    ) { }

    ngOnInit() {
        this._store
            .pipe(select(fromCalibrationsOptions.getCalibrationAppInfo))
            .subscribe(appBOInfo => {
                this.appBO = appBOInfo;

                if (!this.pageType()) {
                    this.calibrationActions = [GridActions.view, GridActions.PDF]
                    this.btnType = ButtonActions.btnUpdate;
                }

            });

    }

    ngAfterContentInit() {

        this.getCalibParamID();

        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "addNewSpecCategory") {
                if (resp.result == 'SUCCESS') {
                    this._alert.success(QCCalibrationMessages.successCategory);
                    this.clear('CAT');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result + 'CAT'))
            }
            else if (resp.purpose == "addNewSpecSubCategory") {
                if (resp.result == 'SUCCESS') {
                    this._alert.success(QCCalibrationMessages.successSubCategory);
                    this.clear('SUB_CAT');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result + 'SUB_CAT'))
            }
            else if (resp.purpose == "qcUpdateSingleTestMethodInstrumentData") {
                this.isLoaderStart = false;
                // this.btnDisabledReq = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this.clear('CLEAR_MAIN');
                    this._alert.success(QCCalibrationMessages.successTestDetails);
                    // this.getCalibParamID();
                    this.manageCalibBO.initTime = resp.result.initTime;
                    this.appBO.initTime = resp.result.initTime;
                    this._store.dispatch(new calibrationActions.UpdateCalibrationAppInfo(this.appBO));
                    this.manageConfirmBtnSession('SET');
                    this.getCalibrationTests();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == "getCalibrationTests") {

                resp.result.forEach((item) => {
                    if (item.rowType != 'TEST')
                        item['isSelected'] = item.isGroupTest;
                })

                this.calibrationDatasource = CommonMethods.bindMaterialGridData(resp.result);

                this.showHideCalibBtn = true;
            }
            else if (resp.purpose == "getCalibrationTestDetailsByID") {

                if (resp.result.testCategoryID)
                    this.category.setRow(resp.result.testCategoryID, resp.result.testCategory);
                else
                    this.category.clear();

                if (resp.result.testSubCatID)
                    this.subCategory.setRow(resp.result.testSubCatID, resp.result.testSubCategory);
                else
                    this.subCategory.clear();

                if (resp.result.testID)
                    this.tests.setRow(resp.result.testID, resp.result.testName);
                else
                    this.tests.clear();

                this.manageCalibBO.specLimit = resp.result.specDesc;
                this.manageCalibBO.limitType = resp.result.testType;

                if (resp.result.testType == "D")
                    this.resultDatasource = CommonMethods.bindMaterialGridData(resp.result.list)
                else {
                    this.manageCalibBO.lowerLimit = resp.result.limitFrom;
                    this.manageCalibBO.upperLimit = resp.result.limitTo;
                    this.manageCalibBO.isLowerLimitApp = resp.result.isLowerLimitApp;
                    this.manageCalibBO.isUpperLimitApp = resp.result.isUpperLimitApp;
                }

                this.enableHeaders(false);
            }
            else if (resp.purpose == "qcSPECDeleteTestMethods") {
                if (resp.result.resultFlag == "OK") {
                    if (this.actionType == 'TEST')
                        this._alert.success(QCCalibrationMessages.deleteTest);
                    else if (this.actionType == 'CAT')
                        this._alert.success(QCCalibrationMessages.deleteCatTest);
                    else if (this.actionType == 'SUBCAT')
                        this._alert.success(QCCalibrationMessages.deleteSubCatTest);

                    this.getCalibrationTests();
                    this.manageCalibBO.initTime = resp.result.initTime;
                    this.appBO.initTime = resp.result.initTime;
                    this._store.dispatch(new calibrationActions.UpdateCalibrationAppInfo(this.appBO));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag))
            }
            else if (resp.purpose == "manageAssignSTPGroupTest") {
                this.isLoaderStartIcn = false;
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(QCCalibrationMessages.savedGroupTechAssigned);

                    this.appBO.initTime = resp.result.initTime;
                    this.manageCalibBO.initTime = resp.result.initTime;

                    this.getCalibrationTests();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))

            }
        })

        this.prepareLookUpData();
        this.prepareHeaders();
        this.calibrationDatasource = CommonMethods.bindMaterialGridData(this.calibrationDatasource);

        this.resultDatasource = CommonMethods.bindMaterialGridData(this.resultDatasource);

        this.manageConfirmBtnSession('SET');

        if (CommonMethods.hasValue(this.manageCalibBO.encCalibParamID))
            this.getCalibrationTests();
    }

    getCalibParamID() {
        this._actRoute.queryParams.subscribe(param => this.manageCalibBO.encCalibParamID = param['id']);
    }

    getCalibrationTests() {
        this._service.getCalibrationTests(this.manageCalibBO.encCalibParamID, 0);
    }

    prepareLookUpData() {
        this.categoryInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibParameterGroup, LookupCodes.getSpecTestCategories,
            LKPDisplayNames.category, LKPDisplayNames.sno, LookUpDisplayField.header, LKPPlaceholders.calibParameterGroup, "TYPE_CODE = 'CAL_PARAM_SET'", "", "LIMS", 'category', true);
        this.prepareLookupSubcategy();

        var condition: string = "REQUEST_TYPE = \'CP\'";

        setTimeout(() => {
            if (CommonMethods.hasValue(this.headerCom) && CommonMethods.hasValue(this.headerCom.selectedInstrList)) {
                var typeCondition: string = "";
                this.headerCom.selectedInstrList.forEach(x => typeCondition = typeCondition + x.id + ", ")
                condition = condition + " AND INSTRUMENT_TYPE IN ( " + typeCondition.slice(0, (typeCondition.lastIndexOf(",") >>> 0)) + " )"
            }

            this.testsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibParameter, LookupCodes.getAnaTest, LKPDisplayNames.test,
                LKPDisplayNames.testCode, LookUpDisplayField.header, LKPPlaceholders.calibParameter, condition, "", "LIMS", 'test');
        }, 500);


    }

    prepareLookupSubcategy() {

        var condition: string = "1=2";

        if (CommonMethods.hasValue(this.category) && CommonMethods.hasValue(this.category.selectedId))
            condition = "CATEGORY_ID = " + this.category.selectedId;

        this.subCategoryInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibSubGroup, LookupCodes.getSpecSubCategories, LKPDisplayNames.category,
            LKPDisplayNames.subCategory, LookUpDisplayField.code, LKPPlaceholders.calibSubGroup, condition, "", "LIMS", 'subcategory');
    }

    getCategories(evt: any) {

        if (evt.val)
            this.manageCalibBO.categoryID = evt.val.id;
        else
            this.manageCalibBO.categoryID = null;

        if(CommonMethods.hasValue(this.subCategory.selectedId))
            this.subCategory.clear();
        this.prepareLookupSubcategy();
    }

    enableHeaders(val: boolean) {
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        this.category.disableBtn = !val;
        this.subCategory.disableBtn = !val;
        this.tests.disableBtn = !val;
    }

    prepareHeaders() {
        this.resultHeadersData = [];

        this.resultHeadersData.push({ "columnDef": 'resultName', "header": "Description", cell: (element: any) => `${element.resultName}` });
        this.resultHeadersData.push({ "columnDef": 'result', "header": "Result", cell: (element: any) => `${element.result}` });

        this.calibrationHeadersData = [];

        this.calibrationHeadersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-5per" });
        this.calibrationHeadersData.push({ "columnDef": 'srNum', "header": "S.No.", cell: (element: any) => `${element.srNum}`, width: "maxWidth-5per" });
        this.calibrationHeadersData.push({ "columnDef": 'testNameCode', "header": "Parameter Name(Parameter ID)", cell: (element: any) => `${element.testNameCode}`, width: "minWidth-10per maxWidth-30per" });
        this.calibrationHeadersData.push({ "columnDef": 'specDesc', "header": "Acceptance Criteria", cell: (element: any) => `${element.specDesc}`, width: "minWidth-15per maxWidth-30per" });
        this.calibrationHeadersData.push({ "columnDef": 'limitResult', "header": "Limit for Results", cell: (element: any) => `${element.limitResult}`, width: "minWidth-15per maxWidth-30per" });

    }

    allowDecimal(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 10, '-');
    }

    save() {

        if (this.btnType == ButtonActions.btnUpdate) {
            this.manageConfirmBtnSession('REM');
            return this.enableHeaders(true);
        }

        var retVal = this.validateControlsMain();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        // this.btnDisabledReq = true;

        this.manageCalibBO.categoryID = this.category.selectedId;
        this.manageCalibBO.subCategoryID = this.subCategory.selectedId;
        this.manageCalibBO.testID = this.tests.selectedId;
        this.manageCalibBO.list = CommonMethods.getDataSource(this.resultDatasource);
        this.manageCalibBO.initTime = this.appBO.initTime;
        if (this.manageCalibBO.limitType == "S")
            this.manageCalibBO.specLimit = ' ';

        this.isLoaderStart = true;
        this._service.qcUpdateSingleTestMethodInstrumentData(this.manageCalibBO);
    }


    validateControlsMain() {

        if (!CommonMethods.hasValue(this.tests.selectedId))
            return QCCalibrationMessages.test;
        else if (!CommonMethods.hasValue(this.manageCalibBO.specLimit) && this.manageCalibBO.limitType != 'S')
            return QCCalibrationMessages.specificationlimit;
        else if (!CommonMethods.hasValue(this.manageCalibBO.limitType))
            return QCCalibrationMessages.limitType;
        else if (this.manageCalibBO.limitType == 'D' && (!CommonMethods.hasValue(this.resultDatasource) || this.resultDatasource.data.length < 1))
            return QCCalibrationMessages.descriptiveRes;
        else if (this.manageCalibBO.limitType == 'N' && !this.manageCalibBO.isLowerLimitApp && !this.manageCalibBO.isUpperLimitApp)
            return QCCalibrationMessages.atleastLimit;
        else if (this.manageCalibBO.limitType == 'N' && this.manageCalibBO.isLowerLimitApp && (!this.manageCalibBO.lowerLimit))
            return QCCalibrationMessages.lowerlimit;
        else if (this.manageCalibBO.limitType == 'N' && this.manageCalibBO.isUpperLimitApp && (!this.manageCalibBO.upperLimit))
            return QCCalibrationMessages.upperlimit;
        else if (this.manageCalibBO.limitType == 'N' && this.manageCalibBO.isLowerLimitApp && this.manageCalibBO.isUpperLimitApp && Number(this.manageCalibBO.lowerLimit) >= Number(this.manageCalibBO.upperLimit))
            return QCCalibrationMessages.upperlimitGreater;
        else if (this.manageCalibBO.limitType == 'R' && !this.manageCalibBO.isLowerLimitApp && !this.manageCalibBO.isUpperLimitApp)
            return QCCalibrationMessages.atleastRange;
        else if (this.manageCalibBO.limitType == 'R' && this.manageCalibBO.isLowerLimitApp && (!this.manageCalibBO.lowerLimit))
            return QCCalibrationMessages.lowerRange;
        else if (this.manageCalibBO.limitType == 'R' && this.manageCalibBO.isUpperLimitApp && (!this.manageCalibBO.upperLimit))
            return QCCalibrationMessages.upperRange;
        else if (this.manageCalibBO.limitType == 'R' && this.manageCalibBO.isLowerLimitApp && this.manageCalibBO.isUpperLimitApp && Number(this.manageCalibBO.lowerLimit) >= Number(this.manageCalibBO.upperLimit))
            return QCCalibrationMessages.upperRangeGreater;
    }

    saveResult() {

        var retVal = this.validateControlsResult();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        this.resultDatasource = CommonMethods.getDataSource(this.resultDatasource);
        this.resultDatasource.push(this.addResult);
        this.addResult = new AddResultBO();
        this.resultDatasource = CommonMethods.bindMaterialGridData(this.resultDatasource);
    }

    validateControlsResult() {
        if (!CommonMethods.hasValue(this.addResult.resultName))
            return QCCalibrationMessages.addResult;
        else if (!CommonMethods.hasValue(this.addResult.result))
            return QCCalibrationMessages.result;
    }

    onActionClicked(evt, type: string) {

        if (evt.action == 'DELETE' && type == 'TEST_RESUL') {

            if (this.btnType == ButtonActions.btnUpdate)
                return this._alert.info(LimsRespMessages.viewInfo);

            this.resultDatasource = CommonMethods.getDataSource(this.resultDatasource);

            var index = this.resultDatasource.findIndex(x => x == evt.val);

            if (index > -1)
                this.resultDatasource.splice(index, 1);

            this.resultDatasource = CommonMethods.bindMaterialGridData(this.resultDatasource);

        }
        else if (evt.action == "EDIT") {
            this.isExpandPanel = true;
            this.manageCalibBO.specTestID = evt.val.specTestID;
            this._service.getCalibrationTestDetailsByID(evt.val.encSpecCatID);
        }
        else if (evt.action == "PDF") {

            const modal = this._matDailog.open(QCCalibTestResultComponent, CommonMethods.modalFullWidth);
            modal.componentInstance.encSpecCatID = evt.val.encSpecCatID;
            modal.afterClosed();

        }
        else if (evt.action == "DELETE") {
            if (this.btnType == ButtonActions.btnUpdate && this.manageCalibBO.specTestID == evt.val.specTestID)
                return this._alert.warning(QCCalibrationMessages.editMode);
            var msg: string = evt.val.rowType == 'TEST' ? QCCalibrationMessages.cnfmdeleteParam : evt.val.rowType == 'CAT' ? QCCalibrationMessages.cnfmDeleteCat : QCCalibrationMessages.cnfmDeleteSub;
            this._confirm.confirm(msg).subscribe(resp => {
                if (resp) {

                    var obj: QCSPECDeleteTestMethodsBO = new QCSPECDeleteTestMethodsBO();
                    obj.initTime = this.manageCalibBO.initTime > this.appBO.initTime ? this.manageCalibBO.initTime : this.appBO.initTime;
                    obj.specTestID = evt.val.specTestID;
                    obj.encCalibParamID = this.manageCalibBO.encCalibParamID;

                    // Filter With - Row Type 'TEST'

                    // if (evt.val.rowType == 'TEST') {
                    //     var rowLength = this.calibrationDatasource.data.filter(x => x.rowType == "TEST").length;
                    //     if (rowLength > 1) {
                    //         var srNumb = evt.val.srNum.split('.')[0];

                    //         // Get Test Count Under Category ans Sub category

                    //         var testUnderCatSubCat = this.calibrationDatasource.data.filter(x => x.rowType == "TEST" && x.srNum.split('.')[0] == srNumb).length;

                    //         // If Test Is One Bind Category ID and Sub Category ID

                    //         // if (testUnderCatSubCat == 1) {
                    //         // }

                    //     }
                    // }
                    // else {

                    // }


                    if (evt.val.rowType != 'TEST') {
                        obj.categoryID = evt.val.testCategoryID;
                        obj.subCategoryID = evt.val.testSubCatID;
                    }

                    this.actionType = evt.val.rowType;
                    this._service.qcSPECDeleteTestMethods(obj);
                }
            })

        }
        else if (evt.action == 'UPLOAD_METHOD' || evt.action == "VIEW_METHOD")
            this.Uploadfiles('METHOD', evt.val);
        else if (evt.action == 'UPLOAD' || evt.action == "VIEW")
            this.Uploadfiles('FILE', evt.val);

    }

    Uploadfiles(type: string, val: any) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.calibParamSet, 0, type == 'FILE' ? 'CALIB_PARAM_FILE' : 'CALIB_PARAM_METHOD', val.encSpecCatID, [], 'MEDICAL_LIMS',this.appBO.referenceNumber);
        modal.componentInstance.mode = this.pageType() ? 'MANAGE' : 'VIEW';
        modal.componentInstance.uploadTitle = (type == 'METHOD' ? this.pageType() ? 'Upload Method' : 'View Method' : this.pageType() ? 'Uploads' : 'View Files')
        modal.afterClosed().subscribe((resu) => { })
    }

    saveCategory(type: string) {
        if (type == 'CAT') {
            if (!CommonMethods.hasValue(this.manageCalibBO.category))
                return this._alert.warning(QCCalibrationMessages.category);

            this._service.addNewSpecCategory(this.manageCalibBO);

        }
        else if (type == 'SUB_CAT') {

            if (!this.showHideCategory)
                this.manageCalibBO.categoryID = null;

            if (!CommonMethods.hasValue(this.manageCalibBO.categoryID))
                return this._alert.warning(QCCalibrationMessages.selectCategory);
            else if (!CommonMethods.hasValue(this.manageCalibBO.subCategory))
                return this._alert.warning(QCCalibrationMessages.subCategory);

            this._service.addNewSpecSubCategory(this.manageCalibBO);
        }
    }

    clear(type: string) {
        if (type == 'CAT') {
            this.manageCalibBO.categoryID = null;
            this.manageCalibBO.category = null
            this.showHideCategory = !this.showHideCategory;
        }
        else if (type == 'SUB_CAT') {
            this.manageCalibBO.subCategory = null
            this.showHideSubCategory = !this.showHideSubCategory;
        }
        else {
            if (!CommonMethods.hasValue(type) || type != 'CLEAR_MAIN') {
                this.category.clear();
                this.subCategory.clear();
            }

            this.tests.clear();

            var encCalibParamID = this.manageCalibBO.encCalibParamID;
            this.manageCalibBO = new ManageQCCalibrationBO();
            this.manageCalibBO.encCalibParamID = encCalibParamID;
            this.resultDatasource = [];
        }
    }

    showHideCalib(evt) {
        this.showHideCalibBtn = evt.hide;
        this.manageCalibBO.encCalibParamID = evt.id;
        this.prepareLookUpData();
    }

    getShowHideCalib() {
        return this.showHideCalibBtn && CommonMethods.hasValue(this.manageCalibBO.encCalibParamID);
    }

    pageType() {
        return this.appBO.operationType == "MANAGE" ? true : false;
    }

    changeIcons(type: string) {
        if (type == 'SAVE')
            return this.btnType == ButtonActions.btnSave ? this._global.icnSave : this._global.icnUpdate;
        else if (type == 'CLEAR')
            return this._global.icnClear;
        else if (type == 'ADD')
            return this._global.icnAdd;
        else if (type == 'MNG_GROP_TECH')
            return this._global.icnAdd;

    }

    manageConfirmBtnSession(type: string) {
        if (type == 'SET')
            localStorage.setItem('IS_SHOW_CONFIRM', 'true');
        else
            localStorage.removeItem('IS_SHOW_CONFIRM');
    }

    changeLimitType() {
        this.manageCalibBO.lowerLimit = this.manageCalibBO.upperLimit = null;
        if (this.manageCalibBO.limitType == 'R' || this.manageCalibBO.limitType == 'N')
            this.manageCalibBO.isLowerLimitApp = this.manageCalibBO.isUpperLimitApp = true;
    }

    selectCheckBox(evt, type) {
        if (type == 'UPPER')
            this.manageCalibBO.upperLimit = null;
        else
            this.manageCalibBO.lowerLimit = null;
    }

    manageGroupTechnique() {

        var data = this.calibrationDatasource.data.filter(x => x.isSelected);

        if (data.length == 0)
            return this._alert.warning(QCCalibrationMessages.selectOneGroupTechnique);

        var error: string = this.validation(data);
        if (CommonMethods.hasValue(error))
            return this._alert.warning(error);

        var obj: ManageSTPGroupTestBO = new ManageSTPGroupTestBO();
        obj.encCalibParamID = this.manageCalibBO.encCalibParamID;
        obj.initTime = this.appBO.initTime;
        obj.list = this.calibrationDatasource.data;
        obj.entityCode = EntityCodes.calibParamSet;

        this.isLoaderStartIcn = true;
        this._service.manageAssignSTPGroupTest(obj);
    }

    validation(obj) {
        var msg: string = "";
        obj.forEach(x => {
            var item = obj.filter(o => o.testCategoryID == x.testCategoryID && o.specCatID != x.specCatID && (!CommonMethods.hasValue(x.testSubCatID) || x.testSubCatID == o.testSubCatID))
            if (item.length > 0)
                msg = QCCalibrationMessages.gruptech;
        })
        return msg
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.manageConfirmBtnSession('REM');
    }

}