import { LookupCodes, EntityCodes} from "./constants";
import { MatSnackBarConfig, MatTableDataSource, MatDialogConfig, MatDateFormats } from "@angular/material";
import { DatePipe, TitleCasePipe } from '@angular/common';
import { NgxUiLoaderConfig, POSITION, SPINNER } from 'ngx-ui-loader';
import { CategoryItemList, SingleIDBO } from './commonModels';
import { OwlDateTimeFormats } from 'ng-pick-datetime';
import { UploadRequestBO } from '../../../UtilUploads/model/uploadModel';
import { LookupInfo, LookUpDisplayField } from '../../../limsHelpers/entity/limsGrid';
import { ApprovalsBO } from '../../../approvalProcess/models/Approval.model';
import { GetUserDetailsModelList } from 'src/app/samplePlan/model/samplePlanModel';
import { isString } from "util";

export class CommonMethods {

    public static allowDecimalLength: number = 11; // (10, 3)

    public static allowDecimalLength15: number = 16; // (15, 5)

    public static worningConfig: MatSnackBarConfig = {
        duration: 2000,
        panelClass: ["red-snackbar"],
        horizontalPosition: "center",
        verticalPosition: "bottom",
    };

    public static displayDateFormat() {
        return "dd-MMM-yyyy";
    }

    public static displayMonDateFormat() {
        return "dd-MMM-yyyy";
    }

    public static displayDateTimeFormat() {
        return "dd-MMM-yyyy HH:mm";
    }

    public static CalendarDateFormat() {
        return "yyyy-MM-dd";
    }

    public static CalendarDateTimeFormat() {
        return "yyyy-MM-dd HH:mm";
    }

    public static time() {
        return "HH:mm";
    }

    public static FormatValueString(value: string) {
        return CommonMethods.hasValueWithZero(value) || value == "0" ? value : "N / A";
    }

    public static DatePlaceholder() {
        return "dd-mm-yyyy";
    }

    public static formatString(str: string, arr: Array<string>): string {
        arr.forEach((itm, idx) => {
            str = str.replace('{' + idx.toString() + '}', itm);
        });
        return str;
    }

    public static defaultDateTime() {
        return "1/1/0001 12:00:00 AM";
    }

    public static hasValue(val: any) {
        var isValEmpty: boolean = true;
        if (val == "" || val == null || val == undefined || val == "null" || val == 'undefined')
            isValEmpty = false;
        else if (`${val}`.trim() == "" || val == 0)
            isValEmpty = false;

        return isValEmpty;
    }

    public static hasValueWithZero(val: any) {
        var isValEmpty: boolean = true;
        if ((val == null) || (val === '') || (val == undefined) || (val == "null") || (val == 'undefined'))
            isValEmpty = false;
        else if (`${val}`.trim() == "")
            isValEmpty = false;

        return isValEmpty;
    }
    public static listPropertyValue(val: any) {
        if (CommonMethods.hasValue(val)) {
            val.forEach(x => {
                Object.keys(x).forEach((key, index) => {
                    x[key] = !CommonMethods.hasValue(x[key]) ? "N / A" : x[key];
                });
            })
        }
        return val;
    }

    public static dbFormat(val) {
        if (CommonMethods.hasValue(val))
            return val.year + '/' + val.month + '/' + val.day
        else
            return "";
    }

    public static TrimValueString(value) {
        return value.trim();
    }

    public static timeFormat(value: any) {
        return value = value == null ? '' : value.slice(0, 5);
    }

    public static jsonFormat(val: any) {
        if (this.hasValue(val)) {
            var splitted = val.split("-");
            return val = { year: splitted[2], month: splitted[1], day: splitted[0] };
        }
        return "";
    }

    public static PrepareLookupInfo(title: string, lookupCode: LookupCodes, headerName, headerCode, displayField: LookUpDisplayField, placeholder: string = "", condition: string = "", extColumnName: string = "", typeCode: string = "LIMS", lkpName: string = "", hideFstCol: boolean = false, headerID: string = null) {
        let obj = new LookupInfo();
        obj.title = title;
        obj.lookupCode = lookupCode;
        obj.headerName = headerName;
        obj.headerCode = headerCode;
        obj.displayField = displayField;
        obj.placeholder = placeholder;
        if (CommonMethods.hasValue(condition))
            obj.condition = condition;
        if (CommonMethods.hasValue(extColumnName))
            obj.extColumnName = extColumnName;
        obj.purposeCode = typeCode;
        obj.name = lkpName;
        obj.hideFstCol = hideFstCol;
        obj.headerID = headerID;
        return obj;
    }

    public static BindApprovalBO(detailID: number, encryptedKey: string, entityCode: string = "", appLevel: number = 0, initTime: string = "") {
        let bo = <ApprovalsBO>{};
        bo.detailID = detailID;
        bo.actionID = 0;
        bo.comment = "";
        bo.encryptedKey = encryptedKey;
        bo.entityCode = entityCode;
        bo.appLevel = appLevel;
        bo.initTime = initTime;
        return bo;
    }

    public static allowNumber(evt, specialChara: string, length: number = null) {
        evt = (evt) ? evt : window.event;
        var val = evt.target.value;
        var totalLen = val.length; // 1245.120

        var charCode = (evt.which) ? evt.which : evt.keyCode;

        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            if (CommonMethods.hasValue(specialChara) && evt.key == specialChara && (length || totalLen < length))
                return true;
            return false;
        }
        return true;
    }

    public static allowAlphabets(evt) {
        evt = (evt) ? evt : window.event;
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || charCode == 32)
            return true;
        return false;
    }

    public static BuildUpload(entityCode: string, entActID: number, section: string, encryptedKey: string = null, fileUploadedIDs: Array<SingleIDBO> = [], type: string = "MEDICAL_LIMS", refNumber: string = "") {
        let bo = <UploadRequestBO>{};
        bo.entityCode = entityCode;
        bo.entityActID = entActID;
        bo.section = section;
        bo.encryptedKey = encryptedKey;
        bo.fileUploadedIDs = fileUploadedIDs;
        bo.type = type;
        bo.refNumber = refNumber;
        return bo;
    }

    public static increaseSNo(list: Array<any>) {
        list.forEach((item, index) => {
            list[index].sno = index + 1;
        })
        return list;
    }

    public static bindMaterialGridData(val) {
        return new MatTableDataSource(val);
    }

    public static modalFullWidth: MatDialogConfig<any> = {
        panelClass: "full-width",
        disableClose: true
    }

    public static rs232ModalFullWidth: MatDialogConfig<any> = {
        panelClass: "full-width",
        maxHeight: '500px',
        disableClose: true
    }

    public static sdmsModalFullWidth: MatDialogConfig<any> = {
        disableClose: true,
        minWidth:'82vw'
    }

    public static switchPlantModalConfig: MatDialogConfig<any> = {
        disableClose: true,
        height: '190px'
    }

    public static getDataSource(dataSource) {
        if (CommonMethods.hasValue(dataSource))
            return dataSource.data;
        else
            return [];
    }

    public static removeLocalItems(key: string) {
        localStorage.removeItem(key);
    }

    public static validNumber(val: any) {
        if (!this.hasValue(val))
            return false;

        var x = val.length; // 123.21
        var str = val.toString();
        var lastVal = str.charCodeAt(--x);
        return lastVal != 46;
    }

    public static allowDecimal(evt, defVal: number = this.allowDecimalLength, afterDeci: number = 5, beforeDeci: number = 7, specCharacter: string = '') {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        var val = evt.target.value;
        var totalLen = val.length; // 1245.120

        if (specCharacter == '-' && charCode == 45 && evt.target.selectionStart == 0)
            return true;
        if (val.indexOf('.') === -1 && totalLen > beforeDeci - 1 && charCode != 46)
            return false;

        if (specCharacter && ((!CommonMethods.hasValue(val) || (val.indexOf(specCharacter) == -1)) && (specCharacter == evt.key && evt.target.selectionStart == 0)))
            return true;

        if (charCode == 46 && evt.target.selectionStart == 0)
            return false;

        if (totalLen < defVal) {
            if (charCode == 46)  // Allow Only 1 '.'
                return val.indexOf('.') === -1;
            else if (charCode > 31 && (charCode < 48 || charCode > 57))
                return false;
            else {
                if (evt.srcElement.id != "" && afterDeci > 1) {
                    var curPosi = evt.target.selectionStart;
                    var dotIndex = val.indexOf('.');
                    if (dotIndex != -1) {
                        var dotPo = dotIndex + 1;
                        var dotAfter = val.substring(dotPo, totalLen)

                        if (curPosi > dotIndex && dotAfter.length > (afterDeci - 1))
                            return false;
                    }
                }
            }
        }
        else
            return false;

        return true;
    }

    public static getUOMListFilter(val: string, key: string) {
        return this.getUOMList().filter(x => x[key] == val);
    }

    public static getUOMList() {
        return [
            { type: 'KG', value: 'S', name: 'Kg' },
            { type: 'GR', value: 'S', name: 'gr.' },
            { type: 'MG', value: 'S', name: 'mg.' },
            { type: 'LT', value: 'L', name: 'Lt.' },
            { type: 'ML', value: 'L', name: 'ml.' },
            { type: 'KL', value: 'L', name: 'kl.' }
        ];

    }

    public static getMonths() {
        return [
            { monthID: '1', monthName: 'January' },
            { monthID: '2', monthName: 'February' },
            { monthID: '3', monthName: 'March' },
            { monthID: '4', monthName: 'April' },
            { monthID: '5', monthName: 'May' },
            { monthID: '6', monthName: 'June' },
            { monthID: '7', monthName: 'July' },
            { monthID: '8', monthName: 'August' },
            { monthID: '9', monthName: 'September' },
            { monthID: '10', monthName: 'October' },
            { monthID: '11', monthName: 'November' },
            { monthID: '12', monthName: 'December' },
        ];
    }

    public static getMaterialCategoryFilterData(val: Array<any>, filters: Array<string>) {
        var categoryList: Array<any> = [];
        filters.forEach(x => {
            categoryList.push(val.filter(item => item.paramCode == x)[0]);
        })
        return categoryList;
    }

    public static prepareCategoryItemsList(totalList: CategoryItemList, assignList: CategoryItemList) {
        if (totalList && totalList.length > 0) {
            assignList.forEach(a => {
                var index = totalList.findIndex(x => x.catItemID == a.catItemID);
                if (index == -1)
                    totalList.push(a);
            });
        }
        return totalList;
    }

    public static getAnalystOccupancy(lst: GetUserDetailsModelList) {
        lst.forEach(x => {
            var data = 0;
            data = x.currentPlanOCC + x.openPlanOCC

            var hours = Math.floor(data / 60);
            var minutes = data % 60;

            x.occHours = hours + ":" + (minutes < 10 ? '0' + minutes : minutes);
            if (hours < 8)
                x.overTime = false;
            else if ((hours > 8) || (hours == 8 && minutes > 0))
                x.overTime = true;
        })
        return lst;
    }

    public static CommonArdsSourcesByEntityCode(entityCode: string) {
        switch (entityCode) {
            case EntityCodes.sampleAnalysis:
                return 'SAMANA';
            case EntityCodes.calibrationArds:
                return 'CALIB';
            case EntityCodes.specValidation:
                return 'SPECVALID'
            case EntityCodes.oosModule:
                return 'OOS_HYPOTEST'

            default:
                return entityCode;
        }
    }
}

export class years {
    year: number;
}


export class dateParserFormatter {
    datePipe = new DatePipe("en-US");
    format(date: Date): string {
        let stringDate: string = "";
        stringDate = this.datePipe.transform(date, CommonMethods.displayDateFormat());
        return stringDate;
    }


    public static FormatDate(value: any, formatType: string, dateCol: any = 'meetingDate') {
        var datePipe = new DatePipe("en-US");
        var titleCasePipe = new TitleCasePipe();
        if (!CommonMethods.hasValue(value))
            return value;

        if (formatType == "dateFormat") {
            var date: Date = new Date(value.year, value.month - 1, value.day);
            value = datePipe.transform(date, CommonMethods.displayDateFormat());
        }

        else if (formatType == "removeAfterTDate") {
            if (value == null || value == '1900-01-01T00:00:00')
                return null;
            var firstIndex = value.indexOf('T');
            value = value.substring(0, firstIndex)
            value = datePipe.transform(value, CommonMethods.displayDateFormat());
        }

        else if (formatType == "arrayDateFormat" || formatType == "EventCalDateFormat") {
            for (let i = 0; i < value.length; i++) {
                // if (value[i][dateCol] == null)
                //     return;
                if (value[i][dateCol] != null) {
                    var firstIndex: any = value[i][dateCol].indexOf('T');
                    if (firstIndex > -1) {
                        if (formatType == "arrayDateFormat")
                            value[i][dateCol] = datePipe.transform(value[i][dateCol].substring(0, firstIndex), CommonMethods.displayDateFormat());
                        else
                            value[i][dateCol] = datePipe.transform(value[i][dateCol].substring(0, firstIndex), CommonMethods.CalendarDateFormat());
                    }
                }
            }
        }
        else if (formatType == "arrayDateTimeFormat" || formatType == "EventCalDateTimeFormat") {
            for (let i = 0; i < value.length; i++) {
                if (formatType == "arrayDateTimeFormat")
                    value[i][dateCol] = datePipe.transform(value[i][dateCol], CommonMethods.displayDateTimeFormat());
                else
                    value[i][dateCol] = datePipe.transform(value[i][dateCol].substring(0, firstIndex), CommonMethods.CalendarDateTimeFormat());
            }
        }
        else if (formatType == "datetime" && CommonMethods.hasValue(value))
            value = datePipe.transform(value, CommonMethods.displayDateTimeFormat());
        else if (formatType == 'dateMonth' && CommonMethods.hasValue(value))
            value = datePipe.transform(value, CommonMethods.displayMonDateFormat());
        else if (formatType == "date" && value != null && value != undefined)
            value = datePipe.transform(value, CommonMethods.displayDateFormat());
        else if (formatType == "time" && value != null && value != undefined)
            value = value = datePipe.transform(value, CommonMethods.time());
        else if (formatType == "default" && CommonMethods.hasValue(value))
            value = new Date(value);
        else if (formatType == 'filterTwiceCol') {
            for (let index = 0; index < dateCol.length; index++) {
                for (let i = 0; i < value.length; i++) {
                    value[i][dateCol[index]] = datePipe.transform(value[i][dateCol[index]], CommonMethods.displayDateTimeFormat());
                }
            }
        }
        else if (formatType == 'filterTwiceDateCol') {
            for (let index = 0; index < dateCol.length; index++) {
                for (let i = 0; i < value.length; i++) {
                    value[i][dateCol[index]] = datePipe.transform(value[i][dateCol[index]], CommonMethods.displayDateFormat());
                }
            }
        }
        else if (formatType == 'filterTwiceDateMonCol') {
            for (let index = 0; index < dateCol.length; index++) {
                for (let i = 0; i < value.length; i++) {
                    value[i][dateCol[index]] = datePipe.transform(value[i][dateCol[index]], CommonMethods.displayMonDateFormat());
                }
            }
        }
        else if (formatType == 'exportFilterTwiceCol') {
            for (let index = 0; index < dateCol.length; index++) {

                for (let i = 0; i < value.length; i++) {
                    value[i][dateCol[index]] = datePipe.transform(value[i][dateCol[index]], CommonMethods.displayDateTimeFormat());
                }
            }
        }

        else if (formatType == 'exportFilterTwiceDateCol') {
            for (let index = 0; index < dateCol.length; index++) {
                for (let i = 0; i < value.length; i++) {
                    value[i][dateCol[index]] = datePipe.transform(value[i][dateCol[index]], CommonMethods.displayDateFormat());
                }
            }
        }
        return value;
    }
}

export const MY_MOMENT_FORMATS: OwlDateTimeFormats = {
    parseInput: 'MM/YYYY',
    fullPickerInput: 'DD-MMM-YYYY HH:mm',
    datePickerInput: 'MM/YYYY',
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
};

export const MY_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'input',
    },
    display: {
        dateInput: 'DD-MMM-YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

// Loaders Config
export class LoaderDetails {
    public static loaderName: string = 'master';

    public static loaderConfig: NgxUiLoaderConfig = {
        bgsColor: 'red',
        fgsColor: "#f8615a",
        bgsPosition: POSITION.bottomCenter,
        bgsSize: 40,
        bgsType: SPINNER.rectangleBounce,
        hasProgressBar: false,
        fgsType: 'three-strings',
        text: 'Loading',
        bgsOpacity: 0.5,
        blur: 5,
        masterLoaderId: "master",
        overlayColor: "rgba(40, 40, 40, 0.8)",
        pbColor: "#f8615a",
        pbDirection: "ltr",
        pbThickness: 5,
        fgsSize: 60,
    };
}


export class SearchBoSessions {

    public static masterBO_SOLMGMT = "masterBO_SOLMGMT";
    public static masterBO_ANALYSIS = "masterBO_ANALYSIS";
    public static masterBO_SAMPLAN = "masterBO_SAMPLAN";
    public static masterBO_LABINV = "masterBO_LABINV";
    public static masterBO_QCCALIB = "masterBO_QCCALIB";

    public static rolePermissionBO_SOLMGMT = "rolePermissionBO_SOLMGMT";
    public static rolePermissionBO_ANALYSIS = "rolePermissionBO_ANALYSIS";
    public static rolePermissionBO_SAMPLAN = "rolePermissionBO_SAMPLAN";
    public static rolePermissionBO_LABINV = "rolePermissionBO_LABINV";
    public static rolePermissionBO_QCCALIB = "rolePermissionBO_QCCALIB";

    public static mobilePhaseBO_SOLMGMT = "mobilePhaseBO_SOLMGMT";
    public static testSolutionBO_SOLMGMT = "testSolutionBO_SOLMGMT";
    public static volumetricSolBO_SOLMGMT = "volumetricSolBO_SOLMGMT";
    public static analystQualificationBO_ANALYSIS = "analystQualificationBO_ANALYSIS";


    public static qcInv_Phase_LABINV = "qcInv_Phase_LABINV";

    public static analysisInvds_ANALYSIS = "analysisInvds_ANALYSIS";

    public static sampleAnalysis_ANALYSIS = "sampleAnalysis_ANALYSIS"

    public static sampleDestrBO_LABINV = "sampleDestrBO_LABINV";

    public static qcCalibrationsBO_QCCALIB = "qcCalibrationsBO_QCCALIB";

    public static specValidations_ANALYSIS = "specValidations_ANALYSIS";

    public static stockSolutionBO_SOLMGMT = "stockSolutionBO_SOLMGMT";

    public static rinsingSolutionBO_SOLMGMT = "rinsingSolutionBO_SOLMGMT";

    public static calibrationArdsBO_ENGGMNT = "calibrationArdsBO_ENGGMNT";

    public static analyticalDataReviewBO_ANALYSIS = "analyticalDataReviewBO_ANALYSIS";

    public static dataReviewBO__ANALYSIS = "dataReviewBO_ANALYSIS";
    public static oosSessionBo_ANALYSIS = "oosSessionBo_ANALYSIS";

    public static samplePlan_SAMPLAN = "samplePlan_SAMPLAN";

    public static searchShiftCloseBO_SAMPLAN = "searchShiftCloseBO_SAMPLAN";




    // public static audTrailBOKey = "AudTrailQualityBO";
    // public static masterBOKey_A = "MasterAnalysisBO";
    // public static masterBOKey_S = "MasterSolutionBO";
    // public static roleBOKey_A = "RolePQualityBO_A";
    // public static roleBOKey_S = "RolePQualityBO_S";

    public static checkSessionVal(key: string): boolean {
        return CommonMethods.hasValue(this.getSearchAuditBO(key))
    }

    public static setSearchAuditBO(key: string, val: any) {
        sessionStorage.setItem(key, JSON.stringify(val));
    }

    public static getSearchAuditBO(key: string) {
        return JSON.parse(sessionStorage.getItem(key));
    }

}


export class CustomLocalStorage {

    static setItem(key: LOCALSTORAGE_KEYS, value: LOCALSTORAGE_VALUES) {
        localStorage.setItem(LOCALSTORAGE_KEYS[key], LOCALSTORAGE_VALUES[value]);
    }

    static dynamicValSetItem(key: LOCALSTORAGE_KEYS, value: any) {
        localStorage.setItem(LOCALSTORAGE_KEYS[key], value);
    }

    static getItem(key: LOCALSTORAGE_KEYS) {
        return CommonMethods.hasValue(localStorage.getItem(LOCALSTORAGE_KEYS[key])) ? localStorage.getItem(LOCALSTORAGE_KEYS[key]) : null;
    }

    static removeItem(key: LOCALSTORAGE_KEYS) {
        return localStorage.removeItem(LOCALSTORAGE_KEYS[key]);
    }

    static setSession<T>(key: LOCALSTORAGE_KEYS, val: T) {
        sessionStorage.setItem(LOCALSTORAGE_KEYS[key], isString(val) ? val : JSON.stringify(val));
    }

    static getSession(key: LOCALSTORAGE_KEYS) {
        return sessionStorage.getItem(LOCALSTORAGE_KEYS[key]);
    }


}

export enum LOCALSTORAGE_KEYS {
    RS232_STATUS,
    RS232_SECTION_MODE,
    IS_RS232_IS_CLICKED,
    RS232_SEC_CLICK,
    conditionCode,
    limsContext,
    ENTITYCODE
}

export enum LOCALSTORAGE_VALUES {
    ON,
    OFF,
    RS232_VOL_PREP,
    RS232_VOL_STAND,
    RS232_ANALYSIS,
    RS232_CON_WISE,
    RS232_CALIB,
    RS232_SAMPLING,
    RS232_SPEC_VALID,
    RS232_OOS_HYPO,
    RS232_OOS_TEST,
    RS232_CALIB_VALID
}