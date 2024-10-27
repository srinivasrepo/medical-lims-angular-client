import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef, MatDialog } from '@angular/material';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { SampleTest, GetTestResult, UpdTestResult, AnalysisHeaderBO, deviation } from '../model/sampleAnalysisModel';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, ButtonActions, EntityCodes, DCActionCode } from 'src/app/common/services/utilities/constants';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { select, Store } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import * as analysisActions from '../state/analysis/analysis.action';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { AppBO, CategoryItem, CategoryItemList } from 'src/app/common/services/utilities/commonModels';


@Component({
    selector: 'method-results',
    templateUrl: '../html/methodResults.html',
    styleUrls: ['../css/sampleAnalysis.scss'],

})

export class methodResultsComponent {
    mode: string = 'MNG';
    entityCode: string;

    pageTitle: string = PageTitle.methodResults;
    subscription: Subscription = new Subscription();
    encSampleAnaTestID: string;
    testInfo: SampleTest = new SampleTest();
    methodList: any;
    resultApplicable: boolean = true;
    btnType: string = 'Confirm';
    isChange: boolean = false;
    analysisStatus: string;
    isOOS: boolean = false;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    appBO: AppBO = new AppBO();
    resultBtn: string = "Update Result";
    passOrFail: string;
    getTestInfo: any;
    isDisabled: boolean = false;
    testCls: string;
    sourceCode: string;
    isExtraTest: boolean = false;
    pageType: string = 'MNG';
    justification: string;
    sampleRefList: any;
    encEntityActID: number;
    resultTypes: any;
    isLoaderStart: boolean;
    assignCatItemList: CategoryItemList = [];
    isNDorDRType: string;
    mainArdsExecID: any;
    constructor(public _global: GlobalButtonIconsService, private _actModal: MatDialogRef<methodResultsComponent>, private _saService: SampleAnalysisService,
        private _alert: AlertService, private _confirmSer: ConfirmationService, private _store: Store<fromAnalysisOptions.AnalysisState>, private _matDailog: MatDialog) { }

    ngOnInit() {
        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisAppInfo))
            .subscribe(appBOInfo => {
                this.appBO = appBOInfo;
            });

        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysisInfo => {
                this.headerInfo = analysisInfo
            });
        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo
                var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.encSampleAnaTestID)
                if (obj && obj.length > 0) {
                    this.isExtraTest = CommonMethods.hasValue(obj[0].testID);
                    if (this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation)
                        this.mode = this.mode == 'MNG' && obj[0].hasOccSubmitted && !obj[0].hasOOS ? 'MNG' : 'VIEW';
                    this.isDisabled = (CommonMethods.hasValue(obj[0].templateID) && (!CommonMethods.hasValue(obj[0].ardsMode) || obj[0].ardsMode == 'ONLINE' || obj[0].ardsMode == 'OFFLINE'));
                }
            });
    }


    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getSampleTestInfo") {
                this.testInfo = resp.result;
                this.justification = resp.result.justification;
                this.mainArdsExecID = resp.result.mainArdsExecID;
                if(!CommonMethods.hasValue(this.mainArdsExecID))
                    this.mainArdsExecID = this.encSampleAnaTestID
                this.isDisabled = (CommonMethods.hasValue(this.testInfo.templateID) && (!CommonMethods.hasValue(this.testInfo.ardsMode) || this.testInfo.ardsMode == 'ONLINE' || this.testInfo.ardsMode == 'OFFLINE'));
                this.passOrFail = this.testInfo.passOrFail;
                this.methodList = resp.result.lst;
                this.resultApplicable = this.testInfo.passOrFail == 'N' ? false : true;
                if (CommonMethods.hasValue(this.methodList) && this.methodList.length > 0) {
                    this.methodList.push({ methodResultID: 'O', resultName: 'Other', result: 'O' });
                    var obj = this.methodList.filter(x => (x.result == this.testInfo.passOrFail && this.testInfo.resultType != 'O') || x.resultName == resp.result.result)
                    if (CommonMethods.hasValue(obj) && obj.length > 0)
                        this.testInfo.resultID = obj[0].methodResultID;
                    if (this.testInfo.resultType == 'O')
                        this.testInfo.resultID = 'O';
                    this.selectMethod();
                }
                this.enableHeaders(!CommonMethods.hasValue(this.testInfo.passOrFail));
                if (CommonMethods.hasValueWithZero(resp.result.testResult) && !CommonMethods.hasValueWithZero(this.testInfo.result) && this.testInfo.result != '0') {
                    this.testInfo.result = CommonMethods.hasValueWithZero(resp.result.testResult.limtFrom) ? (!isNaN(resp.result.testResult.limtFrom) ? Number(resp.result.testResult.limtFrom).toFixed(0) : resp.result.testResult.limtFrom) : null;
                    this.testInfo.resultTo = CommonMethods.hasValueWithZero(resp.result.testResult.limtTo) ? (!isNaN(resp.result.testResult.limtTo) ? Number(resp.result.testResult.limtTo).toFixed(0) : resp.result.testResult.limtTo) : null;
                    this.passOrFail = this.testInfo.passOrFail = resp.result.testResult.passOrFail;
                }
                if (CommonMethods.hasValue(this.testInfo.updTestStatus) && this.testInfo.updTestStatus == 'APP')
                    this.mode = 'MNG';

                if (CommonMethods.hasValue(this.testInfo.templateID) && !this.isExtraTest && (!CommonMethods.hasValue(this.testInfo.ardsMode) || this.testInfo.ardsMode == 'ONLINE' || this.testInfo.ardsMode == 'OFFLINE')) {
                    if (this.testInfo.methodType == 'S') {
                        this.testInfo.result = resp.result.testResult.descResult;
                        this.testInfo.passOrFail = resp.result.testResult.passOrFail;
                    }
                    else if (this.testInfo.methodType != 'D') {
                        this.testInfo.result = CommonMethods.hasValueWithZero(resp.result.testResult.limtFrom) ? (!isNaN(resp.result.testResult.limtFrom) ? Number(resp.result.testResult.limtFrom).toFixed(resp.result.testResult.decimalFrom) : resp.result.testResult.limtFrom) : null;
                        this.testInfo.resultTo = CommonMethods.hasValueWithZero(resp.result.testResult.limtTo) ? (!isNaN(resp.result.testResult.limtTo) ? Number(resp.result.testResult.limtTo).toFixed(resp.result.testResult.decimalTo) : resp.result.testResult.limtTo) : null;
                        this.passOrFail = this.testInfo.passOrFail = resp.result.testResult.passOrFail;
                    }
                    else {
                        if (this.testInfo.result == resp.result.testResult.descResult)
                            var obj = this.methodList.filter(x => x.result == this.testInfo.result)
                        else if (CommonMethods.hasValueWithZero(resp.result.testResult.descResult)) {
                            var obj = this.methodList.filter(x => x.result == resp.result.testResult.descResult)
                            this.testInfo.result = resp.result.testResult.descResult;
                        }
                        if (CommonMethods.hasValue(obj) && obj.length > 0) {
                            this.testInfo.resultID = obj[0].methodResultID;
                            this.selectMethod();
                        }
                        else this.testInfo.resultID = 'O';
                    }
                }
                if (!CommonMethods.hasValue(this.testInfo.typeCode))
                    this.testInfo.typeCode = 'ACT_RES';
                if (this.isExtraTest) {
                    this.testInfo.methodType = 'D';
                    this.testInfo.resultType = this.testInfo.resultID = 'O'
                }
                if (this.testInfo.methodType != 'D' && !CommonMethods.hasValue(this.passOrFail))
                    this.getResultStatus();
                if (this.testInfo.phaseType == 'NS' || this.testInfo.phaseType == 'NS2' || this.testInfo.phaseType == 'NS3' || this.testInfo.phaseType == 'NS4')
                    this._saService.getNewSampleRequests(this.encEntityActID);
                if (CommonMethods.hasValue(resp.result.testResult)) {
                    if (resp.result.testResult.fromSkipType == 'ND' || resp.result.testResult.fromSkipType == 'DR')
                        this.isNDorDRType = resp.result.testResult.fromSkipType;
                    else if (resp.result.testResult.toSkipType == 'ND' || resp.result.testResult.toSkipType == 'DR')
                        this.isNDorDRType = resp.result.testResult.toSkipType;
                }
                if (CommonMethods.hasValue(this.testInfo.typeID)) {
                    var item: CategoryItem = new CategoryItem();
                    item.catItem = this.testInfo.type;
                    item.catItemCode = this.testInfo.typeCode;
                    item.catItemID = this.testInfo.typeID;
                    item.category = "ANA_RES_TYPES";
                    this.assignCatItemList.push(item);
                }
                this.resultTypes = CommonMethods.prepareCategoryItemsList(this.resultTypes, this.assignCatItemList);
            }
            else if (resp.purpose == "getResultStatus") {
                this.testInfo.passOrFail = resp.result.passOrFail;
                this.testInfo.result = !isNaN(resp.result.limtFrom) ? Number(resp.result.limtFrom).toFixed(resp.result.decimalFrom) : resp.result.testResult.limtFrom;
                this.testInfo.resultTo = CommonMethods.hasValueWithZero(resp.result.limtTo) && this.testInfo.methodType == 'R' ? !isNaN(resp.result.limtTo) ? Number(resp.result.limtTo).toFixed(resp.result.decimalTo) : resp.result.limtTo : "";
            }
            else if (resp.purpose == "updateTestResults") {
                this.isLoaderStart = false;
                if (resp.result.returnFlag == 'OK') {
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.encSampleAnaTestID)
                    obj[0].testInitTime = this.testInfo.testInitTime = resp.result.testInitTime;
                    obj[0].hasOOS = resp.result.hasOOS;
                    this.mode = obj[0].hasOccSubmitted && !obj[0].hasOOS ? 'MNG' : 'VIEW';
                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));

                    this.analysisStatus = resp.result.analysisStatus;
                    if (this.entityCode != EntityCodes.calibrationArds && this.entityCode != EntityCodes.calibrationValidation)
                        this._alert.success(SampleAnalysisMessages.successTest);
                    else if (this.entityCode == EntityCodes.calibrationArds || this.entityCode == EntityCodes.calibrationValidation)
                        this._alert.success(SampleAnalysisMessages.successParam);
                    if (this.isOOS)
                        this._alert.success(SampleAnalysisMessages.oosRaise);
                    this.isChange = true;
                    this.enableHeaders(false);
                    //if (this.testInfo.updTestStatus == 'APP')
                    this.close();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

            else if (resp.purpose == DCActionCode.SAMANA_TEST_UPD) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    this.close();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }

            else if (resp.purpose == 'getNewSampleRequests')
                this.sampleRefList = resp.result;
            else if (resp.purpose == 'ANA_RES_TYPES')
                this.resultTypes = resp.result;
        });

        this._saService.getCatItemsByCatCode('ANA_RES_TYPES')
        this.getSampleTestInfo();
        if (CommonMethods.hasValue(localStorage.getItem('SAM_PAGE')) && localStorage.getItem('SAM_PAGE') == 'VIEW')
            this.pageType = 'VIEW';
    }

    getSampleTestInfo() {
        var obj: any = {};
        obj.encSampleAnaTestID = this.encSampleAnaTestID;
        obj.entityCode = this.entityCode;
        obj.sourceCode = this.sourceCode;
        this._saService.getSampleTestInfo(obj);
    }

    enableHeaders(val) {
        this.btnType = val ? 'Confirm' : ButtonActions.btnUpdate;
        if (CommonMethods.hasValue(this.testInfo.templateID) && (!CommonMethods.hasValue(this.testInfo.ardsMode) || this.testInfo.ardsMode == 'ONLINE' || this.testInfo.ardsMode == 'OFFLINE'))
            this.btnType = 'Confirm';
    }

    close() {
        var result: string;
        var passOrFail: string;
        if (this.resultApplicable) {
            if (CommonMethods.hasValueWithZero(this.testInfo.corrValue)) {
                if (this.testInfo.typeCode != 'ACT_RES') {
                    var item = this.resultTypes.filter(x => x.catItemCode == this.testInfo.typeCode);
                    result = item[0].catItem + ' - ' + this.testInfo.corrValue;
                }
                else {
                    result = this.testInfo.corrValue;
                }
            }
            else
                result = CommonMethods.hasValueWithZero(this.testInfo.resultTo) ? this.testInfo.result + ' - ' + this.testInfo.resultTo : this.testInfo.result;
            result = !CommonMethods.hasValue(this.testInfo.corrValue) && CommonMethods.hasValue(this.testInfo.testUom) ? result + " " + this.testInfo.testUom : result;
            passOrFail = this.testInfo.passOrFail;
        }
        var obj = ({ isChange: this.isChange, isApplicable: this.resultApplicable, result: result, passOrFail: passOrFail, analysisStatus: this.analysisStatus, isOOS: this.isOOS });
        this._actModal.close(obj);
    }

    allowDecimals(evt) {
        return CommonMethods.allowDecimal(evt, CommonMethods.allowDecimalLength, 5, 5, '-');
    }

    selectMethod() {
        if (CommonMethods.hasValue(this.testInfo.resultID)) {
            var obj = this.methodList.filter(x => x.methodResultID == this.testInfo.resultID)
            this.testInfo.passOrFail = obj[0].result != 'O' ? obj[0].result : '';
            this.testInfo.result = obj[0].result != 'O' ? obj[0].resultName : '';
        }
    }

    saveMethodResults() {
        if (this.btnType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var errMsg: string = this.validation();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);
        if (this.testInfo.typeCode == 'ACT_RES')
            this.testInfo.corrValue = "";
        if (this.headerInfo.inwardType != 'AQUAL' && !this.isExtraTest && this.entityCode != EntityCodes.specValidation && this.entityCode != EntityCodes.calibrationValidation && this.entityCode != EntityCodes.oosModule && CommonMethods.hasValue(this.testInfo.isOOSRequred) && this.resultApplicable && this.testInfo.passOrFail == 'F') {
            this._confirmSer.confirm(SampleAnalysisMessages.confimMsg, "Confirm", "Yes", "Not Now").subscribe(res => {
                this.saveReq(res);
                this.isOOS = res;
            })
        }
        else
            this.saveReq(false);
    }

    saveReq(val: boolean = false) {

        var obj: UpdTestResult = new UpdTestResult();
        obj.encSampleAnaTestID = this.encSampleAnaTestID;
        obj.entityCode = this.entityCode;
        if (this.resultApplicable) {
            obj.result = this.testInfo.result;
            obj.resultTo = this.testInfo.resultTo;
            obj.sendOss = val;
            obj.testInitTime = this.getTestInfo.testInitTime;
            obj.passOrFail = this.testInfo.methodType == 'S' ? 'P' : this.testInfo.passOrFail;
            obj.resultType = this.testInfo.methodType != 'D' ? null : this.testInfo.resultID == 'O' ? 'O' : "R";
            obj.specPassOrFail = this.testInfo.specPassOrFail;
            obj.typeCode = this.testInfo.typeCode;
            if (CommonMethods.hasValue(this.isNDorDRType) && (this.isNDorDRType == 'ND' || this.isNDorDRType == 'DR'))
                this.testInfo.corrValue = CommonMethods.hasValue(this.testInfo.resultTo) ? this.testInfo.result + " - " + this.testInfo.resultTo : this.testInfo.result;
            obj.corrValue = this.testInfo.corrValue;
            obj.justification = this.justification;
            obj.newSampleRefID = this.testInfo.newSampleRefID;
        }
        else
            obj.passOrFail = 'N'
        this.isLoaderStart = true;
        this._saService.updateTestResults(obj);
    }

    validation() {
        if (CommonMethods.hasValue(this.resultApplicable)) {
            if (!CommonMethods.hasValueWithZero(this.testInfo.result) && this.testInfo.result != '0')
                return this.testInfo.methodType == 'D' ? SampleAnalysisMessages.testResult : SampleAnalysisMessages.testNResult;
            if (this.testInfo.methodType == 'R' && !CommonMethods.hasValueWithZero(this.testInfo.resultTo) && this.testInfo.resultTo != '0')
                return SampleAnalysisMessages.testResultTo;
            if (this.testInfo.methodType == 'R' && Number(this.testInfo.resultTo) < Number(this.testInfo.result))
                return SampleAnalysisMessages.moreThanResult;
            if (this.testInfo.methodType != 'S' && !CommonMethods.hasValue(this.testInfo.passOrFail))
                return this.testInfo.resultID == 'O' ? SampleAnalysisMessages.testPass : this.entityCode == EntityCodes.calibrationArds ? SampleAnalysisMessages.passOrFailParam : SampleAnalysisMessages.passOrFail;
            if ((this.entityCode == EntityCodes.specValidation || this.entityCode == EntityCodes.calibrationValidation) && !CommonMethods.hasValue(this.testInfo.specPassOrFail))
                return SampleAnalysisMessages.specPass;
            if (this.testInfo.typeCode != 'ACT_RES' && !CommonMethods.hasValueWithZero(this.testInfo.corrValue))
                return SampleAnalysisMessages.corrValue;
            if (this.sourceCode == 'OOS_HYPOTEST' && !CommonMethods.hasValue(this.justification))
                return SampleAnalysisMessages.justification;
            if ((this.testInfo.phaseType == 'NS' || this.testInfo.phaseType == 'NS2' || this.testInfo.phaseType == 'NS3' || this.testInfo.phaseType == 'NS4') && !CommonMethods.hasValue(this.testInfo.newSampleRefID))
                return SampleAnalysisMessages.slctSample;
        }
    }

    formatString(val) {
        return CommonMethods.FormatValueString(val);
    }

    getResultStatus() {
        this.testInfo.passOrFail = "";
        if (CommonMethods.hasValueWithZero(this.testInfo.result) || this.testInfo.result == '0') {
            if (this.testInfo.methodType != 'R' || (this.testInfo.methodType == 'R' && (CommonMethods.hasValueWithZero(this.testInfo.resultTo) || this.testInfo.resultTo == '0'))) {
                if (this.entityCode != EntityCodes.calibrationArds)
                    this._alert.info(SampleAnalysisMessages.passOrFail);
                else
                    this._alert.info(SampleAnalysisMessages.passOrFailParam)
                var obj: GetTestResult = new GetTestResult();
                obj.encSampleAnaTestID = this.encSampleAnaTestID;
                obj.result = Number(this.testInfo.result);
                obj.resultTo = Number(this.testInfo.resultTo);
                obj.sourceCode = this.entityCode;
                this._saService.getResultStatus(obj);
            }
        }
    }

    raiseDev() {
        if (CommonMethods.hasValue(this.testInfo.updTestStatus) && this.testInfo.updTestStatus != 'APP')
            return this._alert.error(SampleAnalysisMessages.pendingSpec);

        else if (!CommonMethods.hasValue(this.testInfo.updTestStatus)) {
            const dialogRef = this._matDailog.open(DeviationHandler, { width: '60%' });
            dialogRef.disableClose = true;
            dialogRef.componentInstance.entityCode = EntityCodes.sampleAnalysis;
            dialogRef.componentInstance.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
            dialogRef.afterClosed().subscribe(result => {
                if (result != null && result.CanRiceDeviation) {
                    var obj: deviation = new deviation();
                    obj.encEntityActID = this.mainArdsExecID;
                    obj.entityCode = EntityCodes.sampleAnalysis;
                    obj.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
                    obj.remarks = result.comments;
                    obj.devType = result.DeviationType;
                    obj.refCode = this.headerInfo.arNumber;
                    obj.initTime = this.appBO.initTime;
                    obj.lst = result.lst;
                    this._saService.raiseDeviation(obj);
                }
            });
        }
        else {
            if (this.resultBtn == 'Update Result') {
                this.btnType = "Confirm";
                return this.resultBtn = "Save Result";
            }
            else {
                if (!CommonMethods.hasValue(this.testInfo.passOrFail))
                    return this._alert.warning(SampleAnalysisMessages.testPass)
                if (this.passOrFail != this.testInfo.passOrFail)
                    return this._alert.warning(SampleAnalysisMessages.passResult);
                this.saveReq(false);
            }
        }
    }

    viewResult() {
        this.testCls = this.testInfo.passOrFail == 'P' ? 'testPass' : this.testInfo.passOrFail == 'F' ? 'testFail' : '';
        return CommonMethods.hasValue(this.testInfo.resultTo) || this.testInfo.resultTo == '0' ? this.testInfo.result + ' - ' + this.testInfo.resultTo : this.testInfo.result;
    }

    getClass() {
        var cls: string = "mat-form-field-appearance-outline";
        if (this.testInfo.passOrFail == 'F')
            cls = 'border-red mat-form-field-appearance-outline'
        else if (this.testInfo.passOrFail == 'P')
            cls = "border-green mat-form-field-appearance-outline";

        return cls
    }

    getSpecResult() {
        if (CommonMethods.hasValue(this.testInfo.specPassOrFail)) {
            return this.testInfo.specPassOrFail == 'P' ? 'Pass' : 'Fail';
        }
        return 'N / A'
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}