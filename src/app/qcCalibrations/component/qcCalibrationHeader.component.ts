import { Component, AfterContentInit, OnDestroy, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { Subscription } from 'rxjs';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { QCCalibHeadersInfoBO, GetQCCalibrationDetailsBO, ManualRefNumber } from '../models/qcCalibrationsModel';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ButtonActions, PageUrls, ActionMessages, EntityCodes, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { Store, select } from '@ngrx/store';
import * as fromCalibrationsOptions from '../state/calibrations/calibration.reducer';
import * as calibrationActions from '../state/calibrations/calibrations.action';
import { AppBO, SingleIDBO, GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog } from '@angular/material';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';

@Component({
    selector: 'app-qcCalib-headers',
    templateUrl: '../html/qcCalibrationHeader.html'
})

export class QCCalibrationHeadersComponent implements OnInit, AfterContentInit, OnDestroy {
    allChecked: boolean = false;
    appBO: AppBO = new AppBO();
    // btnDisabledReq: boolean = false;
    btnType: string = ButtonActions.btnSave;
    viewHistoryVisible: boolean;
    viewHistory: any;
    entityCode: string = EntityCodes.calibParamSet;
    manageHeaderInfo: QCCalibHeadersInfoBO = new QCCalibHeadersInfoBO();
    getHeadersInfoBo: GetQCCalibrationDetailsBO = new GetQCCalibrationDetailsBO();

    UploadIDs: Array<SingleIDBO> = [];
    btnUpload: string = ButtonActions.btnUpload;

    private pageTitle: string = PageTitle.manageQCCalibrations;
    private backUrl: string = PageUrls.homeUrl;

    qcInstrTypesInfo: LookupInfo;
    @ViewChild('qcInstrTypes', { static: false }) qcInstrTypes: LookupComponent;

    qcInstrumentsInfo: LookupInfo;
    @ViewChild('qcInstruments', { static: false }) qcInstruments: LookupComponent;

    @Output() showHideCalibration: EventEmitter<any> = new EventEmitter();

    qcinstrumentsList: Array<any> = [];
    totalCatItemList: CategoryItemList = [];
    assignCatItemList: CategoryItemList = [];
    selectedInstrList: Array<any> = new Array<any>();
    resetSelectedPrevList: Array<SingleIDBO> = new Array<SingleIDBO>();

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;

    constructor(private _service: QCCalibrationsService, private _global: GlobalButtonIconsService, private _limsContext: LIMSContextServices,
        private _actRoute: ActivatedRoute, private _store: Store<fromCalibrationsOptions.CalibrationState>,
        private _alert: AlertService, private _matDailog: MatDialog, private _router: Router
    ) { }

    ngOnInit() {
        this._store
            .pipe(select(fromCalibrationsOptions.getCalibrationAppInfo))
            .subscribe(appBOInfo => {
                this.appBO = appBOInfo;
            });
    }

    ngAfterContentInit() {

        this._actRoute.queryParams.subscribe(param => this.manageHeaderInfo.encCalibParamID = param['id']);

        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "getCalibrationHeaderDetails") {
                this.getHeadersInfoBo = resp.result;
                this.appBO = resp.result.trn;
                // this.qcInstruments.setRow(this.getHeadersInfoBo.instrumentID, this.getHeadersInfoBo.instrumentName);
                this.manageHeaderInfo.title = this.getHeadersInfoBo.title;
                this.manageHeaderInfo.manualReferenceNumber = this.getHeadersInfoBo.manualReferenceNumber;
                this.selectedInstrList = resp.result.instrumentTypeIDList;

                this.instrAllSelect();

                this.enableHeaders(false);
                this.showHistory();
                this.getCategoryItems();
                this._service.getInstrumentsByType(this.getHeadersInfoBo.instrumentTypeCode);
                this._store.dispatch(new calibrationActions.UpdateCalibrationAppInfo(resp.result.trn));

                this.assignCatItemList = resp.result.instrumentTypeIDList;
                this.assignCatItemList.forEach(x => x.catItemID = x.id);
                
                this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
            }
            else if (resp.purpose == "manageCalibrationHeadersInfo") {
                this.isLoaderStart = false;
                // this.btnDisabledReq = false;
                localStorage.removeItem('SEARCH_CALIB_ACT');
                if (resp.result.returnFlag == "SUCCESS") {
                    this.appBO = resp.result;
                    this.manageHeaderInfo.encCalibParamID = resp.result.encryptedKey;
                    this._alert.success(QCCalibrationMessages.successHeaders);
                    this.enableHeaders(false);
                    this._store.dispatch(new calibrationActions.UpdateCalibrationAppInfo(this.appBO));
                    this.showHideCalibration.emit({ hide: true, id: resp.result.encryptedKey });

                    this.getHeadersInfoBo.status = resp.result.status;
                    this.getHeadersInfoBo.requestCode = resp.result.referenceNumber;
                    this.resetSelectedPrevList = [];
                    this.UploadIDs = [];
                    this.getHeadersInfoBo.instrumentName = this.manageHeaderInfo.instrUserCodes;
                    this._service.getCalibrationHeaderDetails(this.manageHeaderInfo.encCalibParamID);
                    this._service.getCalibrationTests(this.manageHeaderInfo.encCalibParamID, 0);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag))
            }
            else if (resp.purpose == "getInstrumentsByType") {
                this.qcinstrumentsList = resp.result;
                this.instrAllSelect();
            }
            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            else if(resp.purpose == "getManualReferenceNumber"){
                if(CommonMethods.hasValue(resp.result) && resp.result != "NOT_FOUND")
                    this.manageHeaderInfo.manualReferenceNumber = resp.result;
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }

        })

        if (CommonMethods.hasValue(this.manageHeaderInfo.encCalibParamID))
            this._service.getCalibrationHeaderDetails(this.manageHeaderInfo.encCalibParamID);

        this.prepareInstrumentLkp();
        this.getCategoryItems();

    }

    getCategoryItems() {
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageCalibrationParameterSetsCategories();
        obj.type = 'MNG';
        this._service.getCatItemsByCatCodeList(obj);
    }

    instrAllSelect() {
        this.allChecked = this.selectedInstrList.length > 0 && this.totalCatItemList.length == this.selectedInstrList.length;
    }

    prepareInstrumentLkp(type: string = '') {

        if (!CommonMethods.hasValue(type) || type == 'INSTR_TYPE') {
            var condition: string = "CategoryCode = 'QCINST_TYPE'";
            this.qcInstrTypesInfo = CommonMethods.PrepareLookupInfo(LKPTitles.instrumentType, LookupCodes.manualActInfo, LKPDisplayNames.instrumentType, LKPDisplayNames.instrumentTypeCode, LookUpDisplayField.header, LKPPlaceholders.instrumentType, condition, "", "LIMS", 'instrumentstypes');
        }

        // if (!CommonMethods.hasValue(type) || type == 'INSTR') {
        //     var condition: string = '1=2';

        //     if (CommonMethods.hasValue(this.qcInstrTypes) && CommonMethods.hasValue(this.qcInstrTypes.selectedId)) {
        //         // console.log(this.qcInstrTypes.selectedRow, this.qcInstrTypes.selectedData);

        //         condition = "EQP_TYPECODE = " + '\'' + this.qcInstrTypes.selectedData.code + '\'';
        //     }
        //     // this.qcInstrumentsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.instrument, LookupCodes.getAnalysisAdditionalOccu, LKPDisplayNames.instrumentName, LKPDisplayNames.instrumentCode, LookUpDisplayField.header, LKPPlaceholders.instrument, condition, "", "LIMS", 'instruments');
        // }

    }

    enableHeaders(val: boolean) {
        if (CommonMethods.hasValue(localStorage.getItem('SEARCH_CALIB_ACT')) && localStorage.getItem('SEARCH_CALIB_ACT') == 'CLONE')
            val = true;
        this.btnType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        // this.qcInstruments.disableBtn = !val;
        this.btnUpload = val ? ButtonActions.btnUpload : ButtonActions.btnViewDocus;
    }

    save() {

        if (this.btnType == ButtonActions.btnUpdate) {
            this.showHideCalibration.emit({ hide: true, id: this.manageHeaderInfo.encCalibParamID });
            return this.enableHeaders(true);
        }

        var retVal: string;

        retVal = this.validateControls();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);

        this.manageHeaderInfo.initTime = this.appBO.initTime;
        // this.manageHeaderInfo.instrumentID = this.qcInstruments.selectedId;
        this.manageHeaderInfo.uploadFiles = this.UploadIDs;

        this.manageHeaderInfo.instrumentList = this.selectedInstrList;
        // this.btnDisabledReq = true;
        this.manageHeaderInfo.entityCode = EntityCodes.calibParamSet;
        this.manageHeaderInfo.role = this._limsContext.limsContext.userDetails.roleName;

        //this.getInstrumentUserCode();

        this.isLoaderStart = true;
        this._service.manageCalibrationHeadersInfo(this.manageHeaderInfo);

    }

    getInstrumentUserCode() {

        this.selectedInstrList.forEach((item, index) => {
            var obj = this.qcinstrumentsList.filter(x => x.equipmentID == item.id)[0];
            this.manageHeaderInfo.instrUserCodes = index == 0 ? obj.eqpUserCode : this.manageHeaderInfo.instrUserCodes + ', ' + obj.eqpUserCode;
        });
    }

    validateControls() {

        if (!CommonMethods.hasValue(this.manageHeaderInfo.title))
            return QCCalibrationMessages.calibTitle;
        // else if (!CommonMethods.hasValue(this.qcInstrTypes.selectedId))
        //     return QCCalibrationMessages.instrumentType;
        if (!CommonMethods.hasValue(this.manageHeaderInfo.manualReferenceNumber))
            return QCCalibrationMessages.manualRef;
        else if (this.selectedInstrList.length < 1)
            return QCCalibrationMessages.instrumentTypeAtOne;


    }

    getQCInstrumentTypes(evt, type: string) {

        if (CommonMethods.hasValue(evt.val)) {
            if (type == 'INSTR_TYPE') {
                // this.qcInstruments.clear();
                this.prepareInstrumentLkp('INSTR');
                this.getHeadersInfoBo.instrumentTypeCode = evt.val.code;

                this._service.getInstrumentsByType(evt.val.code);

                if (this.getHeadersInfoBo.instrumentTypeDesc != evt.val.code) {
                    this.resetSelectedPrevList = this.selectedInstrList;
                    this.selectedInstrList = new Array<SingleIDBO>(); // reset selected instruments after chage the instrument type
                    this.allChecked = false;
                }
                else {
                    this.selectedInstrList = this.resetSelectedPrevList;
                    this.allChecked = this.selectedInstrList.length == this.qcinstrumentsList.length;
                }
            }
        }
        else {
            this.allChecked = false;
            this.qcinstrumentsList = []
        }
        // else if (type == 'INSTR_TYPE')
        //     this.qcInstruments.clear();
        // else if (type == 'INSTR')
        //     this.qcInstruments.clear();

    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.calibParamSet, 0, 'CALIB_PARAM_REQ', this.manageHeaderInfo.encCalibParamID, this.UploadIDs, 'MEDICAL_LIMS', this.appBO.referenceNumber);
        modal.componentInstance.type = "BOTH";
        modal.componentInstance.lkpCondition = "ENTITY_CODE = 'CAL_PARAM_SET' AND STATUS_CODE = 'ACT'";
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

    getManualReferenceNumber(){
        var refObj : ManualRefNumber = new ManualRefNumber();
        refObj.entityCode = EntityCodes.calibParamSet;
        refObj.encEntActID = CommonMethods.hasValue(this.manageHeaderInfo.encCalibParamID) ? this.manageHeaderInfo.encCalibParamID : null ;
        refObj.sectionCode = "CALIB_PARAM_REQ";
        refObj.fileIds = this.UploadIDs;
        if(!CommonMethods.hasValue(refObj.encEntActID) && this.UploadIDs.length <=0)
            return this._alert.warning(QCCalibrationMessages.noFiles);
        this._service.getManualReferenceNumber(refObj);
    }

    changeIcons(type: string) {
        if (type == 'SAVE')
            return this.btnType == ButtonActions.btnSave ? this._global.icnSave : this._global.icnUpdate;
        else if (type == 'CLEAR')
            return this._global.icnClear;
        else if (type == 'UPLOAD')
            return this.btnUpload == ButtonActions.btnUpload ? this._global.icnUpload : this._global.icnViewFiles;
        else if (type == 'CONFIRM')
            return this._global.icnConfirm;

    }

    bindInstruments(obj) {
        var index = this.selectedInstrList.findIndex(x => x.id == obj.catItemID);
        if (index > -1)
            this.selectedInstrList.splice(index, 1);
        else
            this.selectedInstrList.push({ id: obj.catItemID });
    }


    manageAllInstruments() {
        if (this.allChecked) {
            this.selectedInstrList = [];
            this.allChecked = false;
        }
        else {
            this.allChecked = true;
            this.totalCatItemList.forEach((item) => {
                if (!this.checkedInstrument(item)) {
                    var obj: SingleIDBO = new SingleIDBO();
                    obj.id = item.catItemID;
                    this.selectedInstrList.push(obj);
                }
            })
        }
    }

    checkedInstrument(obj) {

        this.instrAllSelect();

        return this.selectedInstrList.findIndex(x => x.id == obj.catItemID) > -1;
    }

    getHeaderInfo(type: string) {
        if (type == 'TITLE')
            return this.pageTitle;
        else if (type == 'BACKURL')
            return this.backUrl;
        else if (type == 'STATUS')
            return this.getHeadersInfoBo.status;
        else if (type == 'REFNUM')
            return this.getHeadersInfoBo.requestCode;
    }

    getConirm() {
        return this.appBO && this.appBO.canApprove && this.btnType == ButtonActions.btnUpdate && localStorage.getItem('IS_SHOW_CONFIRM');
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.manageHeaderInfo.encCalibParamID;
        obj.code = 'CAL_PARAM_SET';

        const modal = this._matDailog.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.manageHeaderInfo.encCalibParamID, EntityCodes.calibParamSet,this.appBO.appLevel,this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigate([PageUrls.homeUrl]);
        });
    }

    pageType() {
        return this.appBO.operationType == 'MANAGE' ? true : false;
    }

    clear() {
        //this.qcInstrTypes.clear();
        // this.qcInstruments.clear();
        this.manageHeaderInfo.title = null;
        this.manageHeaderInfo.manualReferenceNumber = null;
        this.selectedInstrList = [];
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.manageHeaderInfo.encCalibParamID;
        obj.code = 'CAL_PARAM_SET';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.manageHeaderInfo.encCalibParamID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    ngOnDestroy() {
        localStorage.removeItem('SEARCH_CALIB_ACT');
        this.subscription.unsubscribe();
    }

}