import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { CommonMessages } from '../messages/commonMessages';
import { TitleCasePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { ExportColumns, ExportBO } from '../services/utilities/commonModels';
import { AlertService } from '../services/alert.service';
import { CommonService } from '../services/commonServices';
import { CommonMethods, dateParserFormatter } from '../services/utilities/commonmethods';
import { EntityCodes } from '../services/utilities/constants';
import * as ExcelJS from 'exceljs/dist/exceljs';
import * as fs from 'file-saver';

@Component({
    selector: 'exp-dta',
    templateUrl: '../html/exportData.html'
})

export class ExportDataComponent {


    title: string = "Export Data";
    entityCode: string;
    columnsList: Array<ExportColumns> = [];
    subscription: Subscription = new Subscription();
    checkAll: boolean = false;
    condition: string;
    dateTimeColumns: any = [];
    dateColumn: any = [];

    constructor(private _closeModel: MatDialogRef<ExportDataComponent>, private _utilService: CommonService, private _alert: AlertService,
        private titlecasePipe: TitleCasePipe) { }

    ngAfterContentInit() {
        this.subscription = this._utilService.commonSubject.subscribe(resp => {
            if (resp.purpose == "getExportColumns")
                this.columnsList = resp.result;
            else if (resp.purpose == "exportData") {
                if (!CommonMethods.hasValue(resp.result) || resp.result.length == 0)
                    return this._alert.warning(CommonMessages.nodata);


                const workBook = XLSX.utils.book_new();
                var obj = resp.result;
                if (CommonMethods.hasValue(this.dateTimeColumns))
                    obj = dateParserFormatter.FormatDate(obj, 'filterTwiceCol', this.dateTimeColumns)
                if (CommonMethods.hasValue(this.dateColumn))
                    obj = dateParserFormatter.FormatDate(obj, "filterTwiceDateCol", this.dateColumn)
                // obj = CommonMethods.listPropertyValue(obj);

                this.generateExcel(obj);
                this.close();
            }
        })
        this._utilService.getExportColumns(this.entityCode);
    }

    close() {
        this._closeModel.close();
    }

    selectAll(evt) {
        this.columnsList.forEach(x => x.select = evt.checked)
    }

    selectSingle(evt) {
        var obj = this.columnsList.filter(x => !CommonMethods.hasValue(x.select))
        this.checkAll = (obj.length == 0);
    }

    export() {
        var obj = this.columnsList.filter(x => CommonMethods.hasValue(x.select))
        if (obj.length == 0)
            return this._alert.warning(CommonMessages.selectOne);

        var getColums: string = "";
        obj.forEach(x => {
            getColums = getColums + x.columnName + ' [' + x.friendlyColumnName + '], ';
            if (x.columnType == 'DATETIME')
                this.dateTimeColumns.push(this.getPropertyName(x.friendlyColumnName));
            else if (x.columnType == 'DATE')
                this.dateColumn.push(this.getPropertyName(x.friendlyColumnName));
        })
        getColums = `${getColums}`.trim();
        var data: ExportBO = new ExportBO();
        data.entityCode = this.entityCode;
        data.columns = getColums.slice(0, -1);
        data.condition = this.condition;
        data.plantFilter = true;
        this._utilService.exportData(data);
    }

    getPropertyName(word: string) {
        return word[0].toLowerCase() + word.substr(1);
    }

    getFileName() {
        switch (this.entityCode) {
            case EntityCodes.sampleAnalysis:
                return 'Sample Analysis Export Data';
            case EntityCodes.mobilePhase:
                return 'Mobile Phase Export Data';
            case EntityCodes.indicators:
                return 'Test Solutions/Indicator Export Data';
            case EntityCodes.stockSolution:
                return "Calibration Solutions Export Data";
            case EntityCodes.rinsingSolutions:
                return "Rinsing Solutions Export Data";
            case EntityCodes.volumetricSol:
                return "Volumetric Solutions Export Data";
            case EntityCodes.invalidations:
                return "Invalidations Export Data";
            case EntityCodes.analystQualif:
                return "Analyst Qualification Export Data";
            case EntityCodes.specValidation:
                return "Spec & STP Validation Export Data";
            case EntityCodes.dataReview:
                return "Data Review Export Data";
            case EntityCodes.analyticalDataReview:
                return "Analytical Data Review Export Data";
            case EntityCodes.oosModule:
                return "Out of Specifications Export Data";
            case EntityCodes.samplePlan:
                return "Work Allotment Export Data";
            case EntityCodes.closeShift:
                return "Close Shift Export Data";
            case EntityCodes.qcInventory:
                return "Lab Inventory Export Data";
            case EntityCodes.sampleDestruction:
                return "Sample Destruction Export Data";
            case EntityCodes.calibrationArds:
                return "Instrument Calibration Export Data";
            case EntityCodes.calibParamSet:
                return "Calibration Parameter Sets Export Data";
            case EntityCodes.calibrationValidation:
                return "Calibration Parameter Set Validation Export Data";
            default:
                return 'Export Data';
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    generateExcel(exportData: any) {

        //Excel Title, Header, Data
        //const title = 'Car Sell Report';
        const header = [];
        Object.keys(exportData[0]).forEach((key, index) => {
            var obj = this.columnsList.filter(x => x.friendlyColumnName.toLowerCase() == key.toLowerCase())
            header.push(obj[0].friendlyColumnName);
        });

        const data = exportData;
        //Create workbook and worksheet
        let workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet(this.getFileName());

        //Add Header Row
        let headerRow = worksheet.addRow(header);

        // Cell Style : Fill and Border
        headerRow.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF044188' },
                bgColor: { argb: 'FFFFFFFF' }
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            cell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
            worksheet.getCell(cell.address).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        })

        // Add each row
        data.forEach((d, index) => {
            let value = [];
            Object.keys(exportData[0]).forEach((key, index) => {

                let itemValue = <any>Object.values(d);
                let itemKey = <any>Object.keys(d);
                for (let j = 0; j < itemKey.length; j++) {
                    if (key == itemKey[j])
                        value.push(CommonMethods.hasValue(itemValue[j]) ? itemValue[j] : 'N / A');
                }
            });

            let item = worksheet.addRow(value);
            item.eachCell((cell, number) => {
                cell.font = { size: 12 }
                worksheet.getCell(cell.address).alignment = { wrapText: true };
            });
        });

        // Set Column width
        let objectMaxLength = [];

        let key = <any>Object.keys(data[0]);
        for (let j = 0; j < key.length; j++) {
            objectMaxLength[j] = key[j].length + 8;
        }

        for (let i = 0; i < data.length; i++) {
            let value = <any>Object.values(data[i]);
            for (let j = 0; j < value.length; j++) {
                if (objectMaxLength[j] < 75) {
                    if (typeof value[j] == "number") {
                        objectMaxLength[j] = !CommonMethods.hasValue(value[j]) || objectMaxLength[j] >= String(value[j]).length + 3 ? objectMaxLength[j] : String(value[j]).length + 3;
                    }
                    else {
                        objectMaxLength[j] =
                            !CommonMethods.hasValue(value[j]) || objectMaxLength[j] >= value[j].length + 3
                                ? objectMaxLength[j]
                                : value[j].length + 3;
                    }
                }
            }
        }

        objectMaxLength.forEach((x, i) => worksheet.getColumn(i + 1).width = Number(x) > 75 ? 75 : x);

        // freeze header row//
        worksheet.views = [
            { state: 'frozen', ySplit: 1 }
        ];

        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            fs.saveAs(blob, this.getFileName() + '.xlsx');
        })
    }
}