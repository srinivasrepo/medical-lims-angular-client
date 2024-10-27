import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ActionMessages } from 'src/app/common/services/utilities/constants';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { ArdsSectionDataList, FormulaData, GetArdsHeadersBO, GetGroupTest, ManageFinalFormulaBO } from '../model/sampleAnalysisModel';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import * as analysisActions from '../state/analysis/analysis.action';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { assignTestResult } from './assignTestResult.component';



@Component({
    selector: 'tbl-result-exec',
    templateUrl: '../html/tableResultSetExecution.html',
    styleUrls: ['../css/sampleAnalysis.scss']
})

export class TableResultSetExecComponent {

    pageTitle: string = "Table Result Set Execution";
    resultSetID: number;
    ardsExecID: number;
    table1Header: any;
    table2Header: any;
    table1DataSource: any;
    table2DataSource: any;
    displayedTable1Columns: any = [];
    displayedTable2Columns: any = [];
    sourceCode: string;
    getArdsInputsInfo: GetArdsHeadersBO;
    lst: any;
    getTestInfo: any;
    detailID: number;
    subscription: Subscription = new Subscription();
    testType: string;
    pageType: string;
    rowType: string;
    entityCode: string;
    finalFormula: string;
    specTestID: number;
    impurityValueID: number;
    sectionDetailsList: ArdsSectionDataList;
    selectedTab: number = 1;
    showExecBtn: boolean = false;
    constructor(private _service: SampleAnalysisService, private _actModal: MatDialogRef<TableResultSetExecComponent>, private _confirmSer: ConfirmationService,
        public _global: GlobalButtonIconsService, private store: Store<fromAnalysisOptions.AnalysisState>, private _alert: AlertService,
        private _matDialog: MatDialog) { }

    ngOnInit() {
        this._actModal.updateSize("95%", "75%");
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
                    var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.ardsExecID);
                    this.rowType = obj[0].rowType;
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionDetailsList = getArdsInputsInfo;
            });
    }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getTableResultSetExecution") {
                this.table1DataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.table1))
                this.table2DataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(resp.result.table2))
                if (resp.result.resultFlag == "OK")
                    this.showExecBtn = true;
                else {
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag));
                    this.showExecBtn = false;
                }
            }
            else if (resp.purpose == "executeSystemFormulas") {
                if (resp.result.returnFlag == 'OK') {
                    this.lst = resp.result.lst;
                    if (CommonMethods.hasValue(resp.result.initTime)) {
                        var data = this.getTestInfo.filter(x => x.samAnaTestID == this.ardsExecID)

                        data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;

                        this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    }
                    var index = this.table2DataSource.data.findIndex(x => x.detailID == this.detailID);
                    var count = this.table2DataSource.data.filter(x => x.detailID == this.detailID).length;
                    this.table2DataSource.data.splice(index, count, ...resp.result.sysFormulas);
                    this.table2DataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.table2DataSource.data));
                    this.detailID = null;
                    setTimeout(() => {
                        this.execute();          
                    }, 100);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }
            else if (resp.purpose == "skipUnknownImpurities") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.skipSuccess);
                    if (CommonMethods.hasValue(this.impurityValueID)) {
                        var row = this.table2DataSource.data.filter(x => x.impurityValueID == this.impurityValueID)
                        row[0].prevType = resp.Type;
                        if (CommonMethods.hasValue(resp.type)) {
                            row[0].inputValue = null;
                            if (resp.type == 'SKIP')
                                row[0].specTestID = row[0].formulaResultFlag = null;
                        }
                        else {
                            row[0].type = 'REG';
                        }
                        if (row[0].type == "REG")
                            row[0].status = "Under Process";
                        this.updateDataSource(resp.result.lst);
                    }
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.impurityValueID = null;
            }
            else if (resp.purpose == "skipInpurFieldFromExecution") {
                if (resp.result.returnFlag == 'OK') {
                    this._alert.success(SampleAnalysisMessages.skipSuccess);
                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.ardsExecID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;

                    if (CommonMethods.hasValue(this.detailID)) {
                        var row = this.table2DataSource.data.filter(x => x.detailID == this.detailID)
                        row[0].prevType = resp.Type;
                        if (CommonMethods.hasValue(resp.type)) {
                            row[0].inputValue = null;
                            if (resp.type == 'SKIP')
                                row[0].specTestID = row[0].formulaResultFlag = null;
                        }
                        else {
                            row[0].type = 'REG';
                        }
                        if (row[0].type == "REG")
                            row[0].status = "Under Process";
                    }
                    this.updateDataSource(resp.result.lst);
                    this.store.dispatch(new analysisActions.UpdateArdsInputInfo(this.getArdsInputsInfo));
                    this.store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                this.impurityValueID = null;
            }
            else if (resp.purpose == "manageIsFinalFormula") {
                if (resp.result.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.finalFormulaSuccess);

                    var data = this.getTestInfo.filter(x => x.samAnaTestID == this.ardsExecID)
                    data[0].testInitTime = this.getArdsInputsInfo.initTime = resp.result.initTime;
                    this.getArdsInputsInfo.rawdataUpdatedBy = resp.result.updatedBy;
                    data[0].rawdataUpdOn = this.getArdsInputsInfo.rawdataUpdOn = resp.result.updatedOn;
                    data[0].rawdataConfOn = this.getArdsInputsInfo.rawDataConfirmedBy = this.getArdsInputsInfo.rawdataConfOn = null;

                    this.table2DataSource.data.forEach((item) => {
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
        this._service.getTableResultSetExecution(this.ardsExecID, this.resultSetID);
        this.prepareHeader();
    }

    prepareHeader() {
        this.table1Header = [];
        this.table1Header.push({ columnDef: "sno", header: "S.No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-7per" });
        this.table1Header.push({ columnDef: "code", header: "Code", cell: (element: any) => `${element.code}`, width: "maxWidth-11per" });
        this.table1Header.push({ columnDef: "description", header: "Description", cell: (element: any) => `${element.description}`, width: "minWidth-20per maxWidth-30per" });
        this.table1Header.push({ columnDef: "calcFormula", header: "Formula", cell: (element: any) => `${element.calcFormula}`, width: "maxWidth-30per" });
        this.table1Header.push({ columnDef: "inputValue", header: "Value", cell: (element: any) => `${element.inputValue}`, width: "maxWidth-12per" });

        this.displayedTable1Columns = this.table1Header.map(c => c.columnDef);

        this.table2Header = [];
        this.table2Header.push({ columnDef: "sno", header: "S.No.", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.table2Header.push({ columnDef: "code", header: "Code", cell: (element: any) => `${element.code}`, width: "maxWidth-7per" });
        this.table2Header.push({ columnDef: "description", header: "Description", cell: (element: any) => `${element.description}`, width: "minWidth-20per  maxWidth-30per" });
        this.table2Header.push({ columnDef: "calcFormula", header: "Formula", cell: (element: any) => `${element.calcFormula}`, width: "maxWidth-30per" });
        this.table2Header.push({ columnDef: "inputValue", header: "Value", cell: (element: any) => `${element.inputValue}`, width: "maxWidth-10per" });
        if (this.pageType != "VIEW")
            this.table2Header.push({ columnDef: "type", header: "Type", cell: (element: any) => `${element.type}`, width: "maxWidth-20per" });
        this.displayedTable2Columns = this.table2Header.map(c => c.columnDef);
    }

    close() {
        this._actModal.close();
    }

    startExecute() {
        var obj = this.table2DataSource.data.filter(obj => (!CommonMethods.hasValue(obj.type) || obj.type == "REG"))
        if (CommonMethods.hasValue(obj) && obj.length > 0) {
            obj.forEach(x => {
                x.status = "Under Process";
                x.inputValue = null;
            })
        }
        this.execute();
    }

    execute() {

        var obj = this.table2DataSource.data.filter(obj => !CommonMethods.hasValueWithZero(obj.inputValue) && (!CommonMethods.hasValue(obj.type) || obj.type == "REG"))
        if (CommonMethods.hasValue(obj) && obj.length > 0) {
            var data: FormulaData = new FormulaData();
            data.samAnaTestID = this.ardsExecID;
            this.detailID = data.detailID = obj[0].detailID;
            data.initTime = this.getArdsInputsInfo.initTime;
            data.sourceCode = this.sourceCode;
            this._service.executeSystemFormulas(data);
        }
    }

    updateDataSource(obj: any) {
        if (obj && obj.length > 0) {
            obj.forEach(x => {
                var item = this.table2DataSource.data.filter(o => o.detailID == x.id).forEach(i => {
                    i.inputValue = null;;
                    i.status = "Under Process";
                });
            })
        }
        this.execute();
    }

    typeChange(row) {
        if (row.type != row.prevType) {
            const modal = this._matDialog.open(addCommentComponent, { width: '800px' });
            modal.disableClose = true;
            modal.componentInstance.isCommentMandatory = true;
            modal.componentInstance.comment = row.type == 'SKIP' ? 'N / A' : row.type;

            modal.afterClosed().subscribe(resp => {
                if (resp.result) {
                    var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
                    obj.impurityValueID = row.impurityValueID;
                    obj.type = row.type;
                    this.detailID = obj.detailID = row.detailID;
                    this.impurityValueID = row.impurityValueID;
                    obj.samAnaTestID = this.ardsExecID;
                    obj.initTime = this.getArdsInputsInfo.initTime;
                    obj.aRDSSourceCode = this.sourceCode;
                    obj.comments = resp.val;
                    this.skipService(obj);
                }
                else {
                    row.type = row.prevType;
                }
            })
        }
    }

    skipService(obj) {
        if (CommonMethods.hasValue(obj.impurityValueID))
            this._service.skipUnknownImpurities(obj);
        else
            this._service.skipInpurFieldFromExecution(obj);
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
            var obj = this.getTestInfo.filter(x => x.samAnaTestID == this.ardsExecID);
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
            testBo.aRDSSourceRefKey = this.ardsExecID;
            modal.componentInstance.grpTest = testBo;
            modal.afterClosed().subscribe(re => {
                if (CommonMethods.hasValue(re.isSave))
                    this.sendFinalformula(id, re.resultTo, re.specTestID, data.impurityValueID);
            })

        }
    }

    sendFinalformula(id: number, formula: string, specTestID: number = 0, impurityValueID: number) {
        var obj: ManageFinalFormulaBO = new ManageFinalFormulaBO();
        obj.samAnaTestID = this.ardsExecID;
        obj.detailID = id;
        if (!CommonMethods.hasValue(this.sourceCode))
            obj.aRDSSourceCode = CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode); //'SAMANA'; 
        else
            obj.aRDSSourceCode = this.sourceCode;
        obj.formula = formula;
        obj.initTime = this.getArdsInputsInfo.initTime;
        obj.specTestID = specTestID;
        obj.impurityValueID = impurityValueID;
        this.detailID = id;
        this.finalFormula = formula;
        this.specTestID = specTestID;
        this.impurityValueID = impurityValueID;
        this._service.manageIsFinalFormula(obj);
    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}