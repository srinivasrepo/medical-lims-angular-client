import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { ActionMessages, ButtonActions, LimsRespMessages } from 'src/app/common/services/utilities/constants';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { ArdsSectionDataList, FormulaData, GetArdsHeadersBO, GetGroupTest, ManageFinalFormulaBO, SaveInputValue } from '../model/sampleAnalysisModel';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { Store, select } from '@ngrx/store';
import * as analysisActions from '../state/analysis/analysis.action';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { assignTestResult } from './assignTestResult.component';

@Component({
    selector: 'dync-frmula',
    templateUrl: '../html/dynamicFormulaCalculation.html',
    styleUrls: ['../css/sampleAnalysis.scss']
})

export class DynamicFormulaCalculationComponent {

    formulaObj: FormulaData = new FormulaData();
    formulaList: any;
    btnType: string = ButtonActions.btnGo;
    slctDetailID: number;
    dependentLst: any;
    impHeaderDisplayCol: any;
    impHeaders: Array<any> = [];
    impDatadataSource: any;
    formulaDeptData: any
    btnSaveType: string = ButtonActions.btnSave;
    lst: any;
    isChange: boolean = false;
    passOrFail: string;
    getTestInfo: any;
    sectionDetailsList: ArdsSectionDataList;
    getArdsInputsInfo: GetArdsHeadersBO;
    value: string;
    impurityValueID: number;
    testType: string;
    pageType: string;
    detailID: number;
    finalFormula: string;
    specTestID: number;
    rowType: string;
    subscription: Subscription = new Subscription();
    constructor(private _actModel: MatDialogRef<DynamicFormulaCalculationComponent>, public _global: GlobalButtonIconsService, private _confirmSer: ConfirmationService,
        private _service: SampleAnalysisService, private _alert: AlertService, private store: Store<fromAnalysisOptions.AnalysisState>, private _matDialog: MatDialog) { }

    ngOnInit() {
        this._actModel.updateSize("95%", "90%");
        this.store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(getTestInfo => {
                this.getTestInfo = getTestInfo
                if (this.getTestInfo.length > 0) {
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.formulaObj.samAnaTestID);
                    this.rowType = obj[0].rowType;
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionDetailsList = getArdsInputsInfo;
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo
            });
    }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getDynamicFormulaInfo") {
                this.formulaList = resp.result.formulaLst;
                this.formulaDeptData = resp.result;
                this.prepareImpHeaders();
                if (resp.result.formulaDepenLst && resp.result.formulaDepenLst.length > 0)
                    this.impDatadataSource = CommonMethods.bindMaterialGridData(resp.result.formulaDepenLst);
                this.impDatadataSource.data.forEach(x => {
                    if (CommonMethods.hasValue(x.type) && x.type != 'REG') {
                        x.value = null;
                    }
                })
                var obj = resp.result.formulaDepenLst.filter(x => !CommonMethods.hasValueWithZero(x.value));
                if (obj && obj.length > 0)
                    this.enableHeaders(true);
                else
                    this.enableHeaders(false);
            }
            else if (resp.purpose == "getDyncFormulaDependentData") {
                this.btnType = ButtonActions.btnChange;
                this.dependentLst = resp.result;
            }
            else if (resp.purpose == "executeDynamicFormulaData") {
                var obj = this.impDatadataSource.data.filter(x => x.impurityValueID == resp.id)
                obj[0].value = obj[0].actualValue = resp.result;
            }
            else if (resp.purpose == "saveInputValues") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.savedExecValue)
                    this.lst = resp.result.lst
                    this.isChange = true;
                    this.passOrFail = resp.result.passOrFail;
                    if (CommonMethods.hasValue(resp.result.initTime)) {
                        var data = this.getTestInfo.filter(x => x.samAnaTestID == this.formulaObj.samAnaTestID)

                        data[0].testInitTime = this.formulaObj.initTime = resp.result.initTime;
                        this.value = this.impDatadataSource.data[0].value;
                        var obj: any = this.sectionDetailsList.filter(x => x.detailID == this.formulaObj.detailID && !CommonMethods.hasValue(x.invalidationID))
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
                        if (this.impDatadataSource && this.impDatadataSource.data && this.impDatadataSource.data.length > 0) {
                            this.impDatadataSource.data.forEach(x => {
                                var item = this.getArdsInputsInfo.dynamicValueLst.filter(o => o.impurityValueID == x.impurityValueID);
                                item[0].value = x.value;
                                item[0].actualValue = x.actualValue;
                            })
                        }
                        this.prepareToolTip(obj[0])
                        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                        this.enableHeaders(false);
                    }

                    //this.close()

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "skipUnknownImpurities") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.skipSuccess);
                    if (CommonMethods.hasValue(this.impurityValueID)) {
                        var row = this.impDatadataSource.data.filter(x => x.impurityValueID == this.impurityValueID)
                        if (CommonMethods.hasValue(resp.type)) {
                            row[0].isDisable = true;
                            row[0].value = null;
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

                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.formulaObj.samAnaTestID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;
                    this.formulaObj.initTime = resp.result.initTime;

                    this.impDatadataSource.data.forEach((item) => {
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
        });
        this._service.getDynamicFormulaInfo(this.formulaObj);
    }

    go() {
        if (this.btnType == ButtonActions.btnChange)
            return this.btnType = ButtonActions.btnGo;
        if (!CommonMethods.hasValue(this.slctDetailID))
            return this._alert.warning(SampleAnalysisMessages.slctDependFormula);
        var obj: FormulaData = new FormulaData();
        obj.detailID = this.slctDetailID;
        obj.samAnaTestID = this.formulaObj.samAnaTestID;
        obj.sourceCode = this.formulaObj.sourceCode;

        this._service.getDyncFormulaDependentData(obj);
    }

    enableHeaders(value: boolean) {
        this.btnSaveType = value ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    prepareImpHeaders() {
        this.impHeaders = [];
        this.impHeaders.push({ columnDef: "dynImpName", header: "", cell: (element: any) => `${element.inputDescription}`, detailID: null, class: "mat-column-dynImpName" });


        if (this.formulaDeptData && this.formulaDeptData.impList && this.formulaDeptData.impList.length > 0) {
            const items = [...new Set(this.formulaDeptData.impList.map(item => item.itemDescription))];
            items.forEach((item) => {
                this.impHeaders.push({ columnDef: this._getColumnDef(item), header: item, cell: (element: any) => `${element[this._getColumnDef(item)]}`, detailID: this._getDetailID(item), class: "dync-cols" })
            })
            this.impHeaders.push({ columnDef: "actualValue", header: "Actual Value", cell: (element: any) => `${element.actualValue}`, detailID: null, class: "mat-column-outputValue" });
            this.impHeaders.push({ columnDef: "outputValue", header: "Output Value", cell: (element: any) => `${element.value}`, detailID: null, class: "mat-column-outputValue" });
            this.impHeaders.push({ columnDef: "type", header: "Type", cell: (element: any) => `${element.type}`, detailID: null, class: "mat-column-outputValue" });
            this.impHeaderDisplayCol = this.impHeaders.map(col => col.columnDef);
            this.impHeaderDisplayCol.push('actions')
        }
    }

    private _getColumnDef(name): string {
        return String(name).replace(/ /g, "").toLowerCase()
    }

    private _getDetailID(name): Number {
        var obj = this.formulaDeptData.impList.filter(x => x.itemDescription == name)
        return obj[0].detailsID
    }

    formatString(val: any, columnDef: string, row: any, detailID: number = 0, type: string) {

        if (columnDef != 'dynImpName' && columnDef != "actualValue" && columnDef != 'outputValue') {
            if (type == 'LBL')
                return CommonMethods.FormatValueString(this.formulaDeptData.impList.filter(x => x.formulaID == row.impurityValueID && x.detailsID == detailID)[0].value);
            else
                return this.formulaDeptData.impList.filter(x => x.formulaID == row.impurityValueID && x.detailsID == detailID)[0].value;
        }

        return CommonMethods.FormatValueString(val);
    }

    showInputFileld(columnDef: string, row: any, detailID: number = 0) {
        var obj = this.formulaDeptData.impList.filter(x => x.formulaID == row.impurityValueID && x.detailsID == detailID && x.inputType == "DINPUT");
        if (columnDef != 'dynImpName' && columnDef != "actualValue" && columnDef != 'outputValue' && columnDef != 'type') {
            if (obj && obj.length > 0)
                return true;
            else return false;
        }
        else
            return false
    }

    addValue(detailID: number, impurityValueID: number, value) {
        var obj = this.formulaDeptData.impList.filter(x => x.formulaID == impurityValueID && x.detailsID == detailID)
        obj[0].value = value;
    }

    addOutputValue(dataItem) {
        if (!CommonMethods.hasValueWithZero(dataItem.actualValue))
            return dataItem.value = null;
        else {
            var value = Math.floor(Number(dataItem.value));
            var actVal = Math.floor(Number(dataItem.actualValue));
            if (value != actVal) {
                dataItem.value = dataItem.actualValue;
                return this._alert.warning(SampleAnalysisMessages.afterDeci);
            }

        }
    }

    exec(row) {
        var obj = this.formulaDeptData.impList.filter(x => x.formulaID == row.impurityValueID && !CommonMethods.hasValueWithZero(x.value))
        if (obj && obj.length > 0)
            return this._alert.warning(SampleAnalysisMessages.forValue)
        var execObj: any = { impurityValueID: row.impurityValueID, valueLst: this.formulaDeptData.impList.filter(x => x.formulaID == row.impurityValueID) }
        this._service.executeDynamicFormulaData(execObj);
    }

    close() {
        var obj: any = { isChange: this.isChange, value: this.value, lst: this.lst, passOrFail: this.passOrFail }
        this._actModel.close(obj);
    }

    save() {
        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var err: string = this.validation();
        if (CommonMethods.hasValue(err))
            return this._alert.warning(err);

        var data: SaveInputValue = new SaveInputValue();
        data.samAnaTestID = this.formulaObj.samAnaTestID;
        if (CommonMethods.hasValue(this.formulaObj.sourceCode))
            data.ardsSourceCode = this.formulaObj.sourceCode;
        else
            data.ardsSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.formulaObj.entityCode); //'SAMANA';
        data.detailID = this.formulaObj.detailID;
        data.initTime = this.formulaObj.initTime;
        data.isFormulaEval = true;
        var obj = this.impDatadataSource.data.filter(x => CommonMethods.hasValueWithZero(x.value) && (!CommonMethods.hasValue(x.type) || x.type == "REG"))
        if (obj && obj.length > 0) {
            data.value = obj[0].value;
            data.actValue = obj[0].actualValue;
        }
        else{
            data.value = this.impDatadataSource.data[0].value;
            data.actValue = this.impDatadataSource.data[0].actualValue;
        }
        this.impDatadataSource.data.forEach(x => {
            if (!CommonMethods.hasValueWithZero(x.value)) {
                x.value = null;
            }
        })
        data.ImpurityValues = this.impDatadataSource.data;

        this._service.saveInputValues(data);
    }

    validation() {
        var lst = this.impDatadataSource.data.filter(x => CommonMethods.hasValueWithZero(x.actualValue))
        if (!CommonMethods.hasValue(lst) || lst.length == 0)
            return SampleAnalysisMessages.atLeastexecuteFormula;
        var obj = this.impDatadataSource.data.filter(x => !CommonMethods.hasValueWithZero(x.actualValue) && CommonMethods.hasValueWithZero(x.value))
        if (obj && obj.length > 0)
            return SampleAnalysisMessages.executeAllFormula;
    }

    allowNumber(evt) {
        return CommonMethods.allowDecimal(evt, 16, 5, 15);
    }

    prepareToolTip(data) {
        if (data.createdOn != data.updatedOn)
            data.displayToolTip = "Initial Value : " + data.initialValue + "\n\nEntered By : " + data.createdBy + '\n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime') + '\n\nLast Updated By : ' + data.updatedBy + '\n\nDate & Time :  ' + dateParserFormatter.FormatDate(data.updatedOn, 'datetime');
        else
            data.displayToolTip = "Entered By : " + data.createdBy + ' \n\nDate & Time : ' + dateParserFormatter.FormatDate(data.createdOn, 'datetime');
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
                row.comments =  obj.comments = resp.val;
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
        this._service.skipUnknownImpurities(obj);
    }

    manageIsFinalFormula(id: number, formula: string, data: any) {
        if (this.pageType == "VIEW")
            return;
        if ((CommonMethods.hasValue(data.value) && !Number(data.value.split(" ")[0])) && (this.testType == 'R' || this.testType == 'N'))
            return this._alert.warning(SampleAnalysisMessages.numericValuesFormula);

        if (this.rowType == 'TEST') {
            this._confirmSer.confirm(SampleAnalysisMessages.rawDataSectIsFinalFormula).subscribe(resp => {
                if (resp)
                    this.sendFinalformula(id, formula, 0, data.impurityValueID)
            })
        }
        else {
            var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.formulaObj.samAnaTestID);
            const modal = this._matDialog.open(assignTestResult, { width: '50%' });
            modal.disableClose = true;
            var testBo: GetGroupTest = new GetGroupTest();
            testBo.catID = obj[0].testCategoryID;
            testBo.subCatID = obj[0].testSubCatID;
            testBo.detailID = id;
            if (!CommonMethods.hasValue(this.formulaObj.sourceCode))
                testBo.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.formulaObj.entityCode);
            else
                testBo.aRDSSourceCode = this.formulaObj.sourceCode;
            testBo.aRDSSourceRefKey = this.formulaObj.samAnaTestID;
            modal.componentInstance.grpTest = testBo;
            modal.afterClosed().subscribe(re => {
                if (CommonMethods.hasValue(re.isSave))
                    this.sendFinalformula(id, re.resultTo, re.specTestID, data.impurityValueID);
            })

        }
    }

    sendFinalformula(id: number, formula: string, specTestID: number = 0, impurityValueID: number) {
        var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
        obj.samAnaTestID = this.formulaObj.samAnaTestID;
        obj.detailID = id;
        if (!CommonMethods.hasValue(this.formulaObj.sourceCode))
            obj.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.formulaObj.entityCode); //'SAMANA'; 
        else
            obj.aRDSSourceCode = this.formulaObj.sourceCode;
        obj.formula = formula;
        obj.initTime = this.formulaObj.initTime;
        obj.specTestID = specTestID;
        obj.impurityValueID = impurityValueID;
        this.detailID = id;
        this.finalFormula = formula;
        this.specTestID = specTestID;
        this.impurityValueID = impurityValueID;
        this._service.manageIsFinalFormula(obj);
    }

    ngOnDestory() {
        this.subscription.unsubscribe();
    }
}