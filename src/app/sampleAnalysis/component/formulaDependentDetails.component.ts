import { Component } from '@angular/core';
import { Subscription, ReplaySubject } from 'rxjs';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { GetArdsHeadersBO, FormulaData, SaveInputValue, ArdsSectionDataList, executeMultFormulaValue, ManageFinalFormulaBO, GetGroupTest } from '../model/sampleAnalysisModel';
import { Store, select } from '@ngrx/store';
import { DecimalPipe } from '@angular/common';
import { ActionMessages, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import * as analysisActions from '../state/analysis/analysis.action';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { assignTestResult } from './assignTestResult.component';

@Component({
    selector: 'for-dep',
    templateUrl: '../html/formulaDependentDetails.html',
    styleUrls: ['../css/sampleAnalysis.scss']
})

export class FormulaDependentDetailsComponent {
    subscription: Subscription = new Subscription();
    detailID: number;
    samAnaTestID: number;
    dataSource: any;
    headersData: any;
    getArdsInputsInfo: GetArdsHeadersBO;
    value: string;
    actValue: string;
    lst: any;
    isChange: boolean = false;
    getTestInfo: any
    updFlag: string;
    entityCode: string;
    isAcceptanceCriteriaApp: string;
    acceptanceCriteria: string;
    passOrFail: string;
    sourceCode: string;
    acceptanceCriteriaTo: number;
    acceptanceCriteriaFrom: number;
    displayTooltip: string;
    sectionDetailsList: ArdsSectionDataList;
    formula: string;
    multipleValues: any;
    formulaType: string;
    isMultiFormula: boolean;
    showBtn: boolean = true;
    impurityValueID: number;
    displayedActColumns: any = ['inputDescription', 'actValue', 'value', 'type'];
    pageType: string;
    testInitTime: string;
    finalFormula: string;
    specTestID: number;
    rowType: string;
    testType: string;

    constructor(private store: Store<fromAnalysisOptions.AnalysisState>, private _saService: SampleAnalysisService, private _closeModal: MatDialogRef<FormulaDependentDetailsComponent>,
        public _global: GlobalButtonIconsService, private _alert: AlertService, private decimalPipe: DecimalPipe, private _confmService: ConfirmationService, private _matDialog: MatDialog) { }

    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo
            });
        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo;
                if (this.getTestInfo.length > 0) {
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);
                    this.rowType = obj[0].rowType;
                    this.testType = obj[0].testType;
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionDetailsList = getArdsInputsInfo;
            });

    }

    ngAfterContentInit() {
        this.subscription = this._saService.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getFormulaDependentDetails") {
                this.actValue = resp.result.actualValue;
                this.value = resp.result.value;
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.lst);
                this.isAcceptanceCriteriaApp = resp.result.isAcceptanceCriteriaApp;
                this.acceptanceCriteria = resp.result.acceptanceCriteria;
                this.acceptanceCriteriaFrom = resp.result.acceptanceCriteriaFrom;
                this.acceptanceCriteriaTo = resp.result.acceptanceCriteriaTo;
                this.formula = resp.result.formulaValue;
                this.formulaType = resp.result.formulaType;
                this.multipleValues = resp.result.impurityLst;
                this.multipleValues.forEach(x => {
                    if (CommonMethods.hasValue(x.type) && x.type != 'REG') {
                        x.value = null;
                    }
                })
                this.isMultiFormula = (this.formulaType == 'IAVG' || this.formulaType == 'IPAVG' || this.formulaType == 'PREP');
                if (resp.result.resultFlag == "KNOWN_CONFIRM" || resp.result.resultFlag == "UNKNOWN_CONFIRM") {
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag));
                    this.showBtn = false;
                }
                else if (resp.result.resultFlag != 'OK') {
                    this._alert.error(SampleAnalysisMessages.forValue);
                    this.showBtn = false;
                }
            }
            else if (resp.purpose == "executeFormula") {
                this.value = resp.result;
                this.actValue = resp.result;
                this.updFlag = "";
            }

            else if (resp.purpose == "executeMultipleFormula") {
                this.multipleValues = resp.result;
                this.multipleValues.forEach(x => {
                    if (CommonMethods.hasValue(x.type) && x.type != "REG") {
                        x.value = null;
                    }
                })
                this.updFlag = "";
            }


            else if (resp.purpose == 'saveInputValues' && CommonMethods.hasValue(resp.type)) {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.formulaExe);
                    this.lst = resp.result.lst
                    this.isChange = true;
                    this.passOrFail = resp.result.passOrFail;
                    if (CommonMethods.hasValue(resp.result.initTime)) {
                        var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)

                        data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;

                        var obj = this.sectionDetailsList.filter(x => x.detailID == this.detailID && !CommonMethods.hasValue(x.invalidationID))
                        obj[0].updatedOn = resp.result.updatedOn;
                        obj[0].updatedBy = resp.result.updatedBy;
                        obj[0].initialValue = resp.result.initialValue;
                        if (CommonMethods.hasValue(resp.result.passOrFail))
                            obj[0].passOrFail = resp.result.passOrFail;
                        if (obj[0].skipType != "DG")
                            obj[0].skipType = null;
                        if (!CommonMethods.hasValue(obj[0].createdBy)) {
                            obj[0].createdOn = resp.result.updatedOn;
                            obj[0].createdBy = resp.result.updatedBy;
                        }
                        this.prepareToolTip(obj[0]);
                        if (this.multipleValues && this.multipleValues.length > 0) {
                            this.multipleValues.forEach(x => {
                                var item = this.getArdsInputsInfo.dynamicValueLst.filter(o => o.impurityValueID == x.impurityValueID);
                                item[0].value = x.value;
                                item[0].actualValue = x.actualValue;
                            })
                        }
                        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    }

                    this.close()

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));

            }
            else if (resp.purpose == "manageMultipleFormulaValues") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success("Success")
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "skipUnknownImpurities") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.skipSuccess);
                    if (CommonMethods.hasValue(this.impurityValueID)) {
                        var row = this.multipleValues.filter(x => x.impurityValueID == this.impurityValueID)
                        if (CommonMethods.hasValue(resp.type)) {
                            row[0].isDisable = true;
                            row[0].value = 0;
                            if (resp.type == 'SKIP')
                                row[0].specTestID = row[0].formulaResultFlag = null;
                        }
                        else {
                            row[0].type = 'REG';
                            row[0].isDisable = false;
                        }
                    }
                    this.isChange = true;
                    this.value = this.passOrFail = null;
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.impurityValueID = null;
            }
            else if (resp.purpose == "manageIsFinalFormula") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.finalFormulaSuccess);

                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;
                    this.testInitTime = resp.result.initTime;

                    this.multipleValues.forEach((item) => {
                        if (this.detailID == item.detailID && item.impurityValueID == this.impurityValueID) {
                            item.formulaResultFlag = this.finalFormula;
                            if (CommonMethods.hasValue(this.specTestID))
                                item.specTestID = this.specTestID;
                        }
                        else if (this.finalFormula == item.formulaResultFlag && (!CommonMethods.hasValue(this.specTestID) || item.specTestID == this.specTestID)) {
                            item.formulaResultFlag = null;
                            item.specTestID = null;
                        }
                    })

                    this.sectionDetailsList.forEach((item) => {
                        if (this.detailID == item.detailID && !CommonMethods.hasValue(item.invalidationID)) {
                            item.formulaResultFlag = this.finalFormula;
                            if (CommonMethods.hasValue(this.specTestID))
                                item.specTestID = this.specTestID;
                        }
                        else if (this.finalFormula == item.formulaResultFlag && !CommonMethods.hasValue(item.invalidationID) && (!CommonMethods.hasValue(this.specTestID) || item.specTestID == this.specTestID)) {
                            item.formulaResultFlag = null;
                            item.specTestID = null;
                        }
                    })

                    this.finalFormula = null;
                    this.detailID = 0;
                    this.impurityValueID = null;
                    this.store.dispatch(new analysisActions.UpdateArdsSecInputInfo(this.sectionDetailsList));
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
        })
        this.prepareHeaders();
        this.getData();
    }

    prepareToolTip(data) {
        if (data.createdOn != data.updatedOn)
            data.displayToolTip = "Input Type : " + data.inputType + "\n\nInitial Value : " + data.initialValue + "\n\nEntered By : " + data.createdBy + '\n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime') + '\n\nLast Updated By : ' + data.updatedBy + '\n\nDate & Time :  ' + dateParserFormatter.FormatDate(data.updatedOn, 'datetime');
        else
            data.displayToolTip = "Input Type : " + data.inputType + "\n\nEntered By : " + data.createdBy + ' \n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime');
    }

    getData() {
        var obj: FormulaData = new FormulaData();
        obj.samAnaTestID = this.samAnaTestID;
        if (CommonMethods.hasValue(this.sourceCode))
            obj.sourceCode = this.sourceCode;
        else
            obj.sourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); // 'SAMANA';
        obj.detailID = this.detailID;
        this._saService.getFormulaDependentDetails(obj);
    }

    close() {
        var obj: any = { isChange: this.isChange, value: this.value, lst: this.lst, passOrFail: this.passOrFail, displayTooltip: this.displayTooltip }
        this._closeModal.close(obj);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: 'inputDescription', header: "Description", cell: (element: any) => `${element.inputDescription}` });
        this.headersData.push({ columnDef: 'value', header: "Value", cell: (element: any) => `${element.value}` });
    }

    evaluate() {
        if (CommonMethods.hasValue(this.dataSource) && this.dataSource.data.length > 0) {
            var errMsg: string = this.validation();
            if (CommonMethods.hasValue(errMsg))
                return this._alert.warning(errMsg);
            var obj: FormulaData = new FormulaData();
            obj.samAnaTestID = this.samAnaTestID;
            if (CommonMethods.hasValue(this.sourceCode))
                obj.sourceCode = this.sourceCode
            else
                obj.sourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA';
            obj.detailID = this.detailID;
            obj.initTime = this.getArdsInputsInfo.initTime;
            if (this.isMultiFormula)
                this._saService.executeMultipleFormulas(obj);
            else
                this._saService.executeFormula(obj);
        }
    }

    validation() {
        var obj = this.dataSource.data.filter(x => !CommonMethods.hasValueWithZero(x.value) && x.value != '0')
        if (CommonMethods.hasValue(obj) && obj.length > 0)
            return SampleAnalysisMessages.forValue;
        obj = this.dataSource.data.filter(x => x.updateFlag == 'UPD')
        if (CommonMethods.hasValue(obj) && obj.length > 0)
            return SampleAnalysisMessages.reExec;
    }

    allowNumbers(evt) {
        return CommonMethods.allowDecimal(evt, 25, 10, 15);
    }
    save() {
        var errMsg: string = "";
        if (this.isMultiFormula)
            errMsg = this.validateMultipleValue();
        else
            errMsg = this.validateFormulaValue();

        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg)

        var data: SaveInputValue = new SaveInputValue();
        data.samAnaTestID = this.samAnaTestID;
        data.value = this.value;
        if (CommonMethods.hasValue(this.sourceCode))
            data.ardsSourceCode = this.sourceCode;
        else
            data.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA';
        data.detailID = this.detailID;
        data.initTime = this.getArdsInputsInfo.initTime;
        data.isFormulaEval = true;
        data.actValue = this.actValue;
        if (this.isMultiFormula) {
            var obj = this.multipleValues.filter(x => CommonMethods.hasValueWithZero(x.value) && (!CommonMethods.hasValue(x.type) || x.type == "REG"))
            if (obj && obj.length > 0) {
                this.value = data.value = obj[0].value;
                data.actValue = obj[0].actualValue;
            }
            else{
                this.value = data.value = this.multipleValues[0].comments;
                data.actValue = this.multipleValues[0].actualValue;
            }
            data.ImpurityValues = this.multipleValues;
        }

        if (CommonMethods.hasValue(this.acceptanceCriteria) && ((CommonMethods.hasValue(this.acceptanceCriteriaFrom) && this.acceptanceCriteriaFrom > Number(this.value)) || (CommonMethods.hasValue(this.acceptanceCriteriaTo) && this.acceptanceCriteriaTo < Number(this.value)))) {
            this._confmService.confirm(SampleAnalysisMessages.cnfmForm).subscribe(re => {
                if (re)
                    this._saService.saveInputValues(data);
            })
        }
        else
            this._saService.saveInputValues(data);

        // var errMsg: string = this.validateMultipleValue();
        // if (CommonMethods.hasValue(errMsg))
        //     return this._alert.warning(errMsg)
        // var obj: executeMultFormulaValue = new executeMultFormulaValue();
        // obj.samAnaTestID = this.samAnaTestID;
        // if (CommonMethods.hasValue(this.sourceCode))
        //     obj.ardsSourceCode = this.sourceCode;
        // else
        //     obj.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA';
        // obj.initTime = this.getArdsInputsInfo.initTime;
        // obj.lst = this.multipleValues;
        // this._saService.manageMultipleFormulaValues(obj);

    }

    validateFormulaValue() {
        if (Number(this.value) && Number(this.actValue)) {
            var value = Math.floor(Number(this.value));
            var actVal = Math.floor(Number(this.actValue));
            if (value != actVal)
                return SampleAnalysisMessages.afterDeci;
        }
    }

    validateMultipleValue() {
        var item = this.multipleValues.filter( c=> (c.type == "REG" || !CommonMethods.hasValue(c.type)) && !CommonMethods.hasValue(c.value));
        if(item && item.length > 0)
            return SampleAnalysisMessages.execAllFormula;
        var obj = this.multipleValues.filter(x => (x.type == "REG" || !CommonMethods.hasValue(x.type)) && Number(x.actualValue) && Math.floor(Number(x.actualValue)) != Math.floor(Number(x.value)))
        if (obj && obj.length > 0)
            return SampleAnalysisMessages.afterDeci;
    }

    typeChange(row) {
        const modal = this._matDialog.open(addCommentComponent, { width: '800px' });
        modal.disableClose = true;
        modal.componentInstance.isCommentMandatory = true;
        modal.componentInstance.comment = row.type == 'SKIP' ? 'N / A' : row.type;
        modal.afterClosed().subscribe(resp => {
            if (resp.result) {
                var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
                obj.impurityValueID = row.impurityValueID;
                obj.type = row.type;
                this.impurityValueID = row.impurityValueID;
                row.comments = obj.comments = resp.val;
                this.skipService(obj);
            }
        })
    }

    remove(row) {
        var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
        obj.impurityValueID = row.impurityValueID;
        this.impurityValueID = row.impurityValueID;
        this.skipService(obj);
    }

    skipService(obj) {
        this._saService.skipUnknownImpurities(obj);
    }

    manageIsFinalFormula(id: number, formula: string, data: any) {
        if (this.pageType == "VIEW")
            return;
        if ((CommonMethods.hasValue(data.value) && !Number(data.value.split(" ")[0])) && (this.testType == 'R' || this.testType == 'N'))
            return this._alert.warning(SampleAnalysisMessages.numericValuesFormula);

        if (this.rowType == 'TEST') {
            this._confmService.confirm(SampleAnalysisMessages.rawDataSectIsFinalFormula).subscribe(resp => {
                if (resp)
                    this.sendFinalformula(id, formula, 0, data.impurityValueID)
            })
        }
        else {
            var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.samAnaTestID);
            const modal = this._matDialog.open(assignTestResult, { width: '50%' });
            modal.disableClose = true;
            var testBo: GetGroupTest = new GetGroupTest();
            testBo.catID = obj[0].testCategoryID;
            testBo.subCatID = obj[0].testSubCatID;
            testBo.detailID = id;
            if (!CommonMethods.hasValue(this.sourceCode))
                testBo.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode);
            else
                testBo.aRDSSourceCode = this.sourceCode;
            testBo.aRDSSourceRefKey = this.samAnaTestID;
            modal.componentInstance.grpTest = testBo;
            modal.afterClosed().subscribe(re => {
                if (CommonMethods.hasValue(re.isSave))
                    this.sendFinalformula(id, re.resultTo, re.specTestID, data.impurityValueID);
            })

        }
    }

    sendFinalformula(id: number, formula: string, specTestID: number = 0, impurityValueID: number) {
        var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
        obj.samAnaTestID = this.samAnaTestID;
        obj.detailID = id;
        if (!CommonMethods.hasValue(this.sourceCode))
            obj.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA'; 
        else
            obj.aRDSSourceCode = this.sourceCode;
        obj.formula = formula;
        obj.initTime = this.testInitTime;
        obj.specTestID = specTestID;
        obj.impurityValueID = impurityValueID;
        this.detailID = id;
        this.finalFormula = formula;
        this.specTestID = specTestID;
        this.impurityValueID = impurityValueID;
        this._saService.manageIsFinalFormula(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}