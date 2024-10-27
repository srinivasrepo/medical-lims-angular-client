import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, SamplePlanLocalKeys, ButtonActions } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO, IDCode } from 'src/app/common/services/utilities/commonModels';
import { SampleTestModel, ManageSamplingTestModel } from '../model/samplePlanModel';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'plan-samplesTest',
    templateUrl: '../html/sampleTest.html'
})
export class SampleTestComponent {

    @Input('encSamplePlanID') encSamplePlanID: string;
    @Input('appBo') appBo: AppBO = new AppBO();

    // disableBtn: boolean;
    sampleDetails: SampleTestModel = new SampleTestModel();
    sampleingSource: any;
    btnSaveType: string = ButtonActions.btnSave;
    testTypesList: Array<string> = [];
    totalTest: number;
    availabelTests: number;
    notAvailableTests: number;
    masterTestList: any;
    disableAll: boolean = false;
    isSelect: Boolean = false;
    @Output() loader: EventEmitter<any> = new EventEmitter();


    subscription: Subscription = new Subscription();

    constructor(private _service: SamplePlanService, private _alert: AlertService, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getTestActivitySamples") {
                this.sampleDetails = resp.result;

                // if (resp.result.sam.length > 1)
                //     this.sampleDetails.sam = resp.result.sam;
                // else
                //     this.sampleDetails.sam.push(resp.result.sam[0]);

                // this.sampleDetails.wetIns = resp.result.wetIns;

                // if (resp.result.inv.length > 1)
                //     this.sampleDetails.inv = resp.result.inv;
                // else
                //     this.sampleDetails.inv.push(resp.result.inv);


                // this.sampleDetails = resp.result;
                if (this.sampleDetails.wetIns.length > 0) {
                    var testTypes = this.sampleDetails.wetIns.map(x => x.testType);
                    this.testTypesList = testTypes.filter(function (v, i) { return testTypes.indexOf(v) == i; })
                }

                this.sampleDetails.wetIns = this.sampleDetails.wetIns.filter((item, index, array) =>
                    index === array.findIndex((findItem) =>
                        findItem.specCatID === item.specCatID && findItem.sioID === item.sioID
                    )
                );

                this.totalTest = this.sampleDetails.sam.length + this.sampleDetails.wetIns.length + this.sampleDetails.inv.length + this.sampleDetails.oosTestList.length + this.sampleDetails.drList.length + this.sampleDetails.calibList.length;
                this.availabelTests = this.sampleDetails.sam.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.inv.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.wetIns.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.oosTestList.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.drList.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.calibList.filter(x => x.isSelected).length;
                this.notAvailableTests = this.totalTest - this.availabelTests;

                this.totalTest == this.notAvailableTests ? this.enableHeaders(true) : this.enableHeaders(false);
            }
            else if (resp.purpose == "manageTestActivitySamples") {
                // this.disableBtn = false;
                this.loader.emit(false);
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(SamplePlanMessages.saveSampleTest);
                    this.appBo = resp.result;
                    this.enableHeaders(false);
                    localStorage.setItem(SamplePlanLocalKeys.Anal_PlanningKey, 'true');
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

        })

        this._service.getTestActivitySamples(this.encSamplePlanID);
    }

    enableHeaders(val: boolean) {
        this.btnSaveType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    prepareHeaders(type: string) {
        var headersData: Array<any> = [];

        if (type == 'SAMPLING') {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'arNumbr', "header": "AR Number", cell: (element: any) => `${element.arNumbr}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-30per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }
        else if (type == 'Samples for Analysis') {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            // headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Operation Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Test Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'analysisType', "header": "Analysis Type", cell: (element: any) => `${element.analysisType}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }
        else if (type == 'invalidations') {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'invalidationCode', "header": "Invalidation Number", cell: (element: any) => `${element.invalidationCode}`, width: 'minWidth-10per' })
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'invalidationDate', "header": "Date of Invalidation", cell: (element: any) => `${element.invalidationDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }
        else if (type == 'oos') {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'oosNumber', "header": "OOS Number", cell: (element: any) => `${element.oosNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'invBatchNumber', "header": "Batch Number", cell: (element: any) => `${element.invBatchNumber}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'prodNameCode', "header": "Product / Material Name", cell: (element: any) => `${element.prodNameCode}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'oosDate', "header": "Date of OOS", cell: (element: any) => `${element.oosDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }
        else if (type == 'DR') {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'requestCode', "header": "Request Code", cell: (element: any) => `${element.requestCode}`, width: 'maxWidth-12per' })
            headersData.push({ "columnDef": 'productName', "header": "Product / Material Name", cell: (element: any) => `${element.productName}`, width: 'maxWidth-35per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Test/Parameter Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-20per' })
            headersData.push({ "columnDef": 'reviewDate', "header": "Date of Send for Review", cell: (element: any) => `${element.reviewDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }
        else if (type == 'CALIB' || type == "DAILY_CALIB") {
            headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
            headersData.push({ columnDef: "sno", header: "S. No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
            headersData.push({ "columnDef": 'rptNumber', "header": "Request Code", cell: (element: any) => `${element.rptNumber}`, width: 'maxWidth-12per' })
            headersData.push({ "columnDef": 'eqpCode', "header": "Instrument ID", cell: (element: any) => `${element.eqpCode}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'category', "header": "Instrument Type", cell: (element: any) => `${element.category}`, width: 'maxWidth-10per' })
            headersData.push({ "columnDef": 'testTitle', "header": "Parameter Name", cell: (element: any) => `${element.testTitle}`, width: 'maxWidth-30per' })
            headersData.push({ "columnDef": 'nextDueDate', "header": "Schedule Date", cell: (element: any) => `${element.nextDueDate}`, width: 'maxWidth-15per' })
            headersData.push({ "columnDef": 'minutes', "header": "Analyst Occupancy", cell: (element: any) => `${element.minutes}`, width: 'maxWidth-15perinput' })
            headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
        }

        return headersData;
    }

    getDataSource(type: string) {
        var obj: any;
        if (type == 'SAMPLING')
            obj = this.sampleDetails.sam;
        else if (type == 'Samples for Analysis')
            obj = this.sampleDetails.wetIns;
        else if (type == 'invalidations')
            obj = dateParserFormatter.FormatDate(this.sampleDetails.inv, 'arrayDateTimeFormat', 'invalidationDate');
        else if (type == 'oos')
            obj = dateParserFormatter.FormatDate(this.sampleDetails.oosTestList, 'arrayDateTimeFormat', 'oosDate');
        else if (type == "DR")
            obj = dateParserFormatter.FormatDate(this.sampleDetails.drList, 'arrayDateTimeFormat', 'reviewDate');
        else if (type == "CALIB")
            obj = dateParserFormatter.FormatDate(this.sampleDetails.calibList.filter(x => x.conditionCode == "CALIB_ARDS"), 'arrayDateFormat', 'nextDueDate');
        else if (type == "DAILY_CALIB")
            obj = dateParserFormatter.FormatDate(this.sampleDetails.calibList.filter(x => x.conditionCode == 'DAILY_CALIB'), 'arrayDateFormat', 'nextDueDate');
        if (this.isSelect)
            obj = obj.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan));
        return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
    }

    saveTestSample() {

        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var retVal = this.validatingMinutes();

        if (CommonMethods.hasValue(retVal))
            return this._alert.warning(retVal);


        // this.disableBtn = true;

        var obj: ManageSamplingTestModel = new ManageSamplingTestModel();
        obj.encPlanID = this.encSamplePlanID;
        obj.initTime = this.appBo.initTime;

        this.sampleDetails.sam.filter(x => x.isSelected == true).forEach(item => {
            var bo: IDCode = new IDCode();
            bo.id = item.sioID;
            bo.sioID = item.sioID;
            bo.code = 'SAMPLING';
            bo.minutes = item.minutes;
            obj.samplTestList.push(bo);
        })

        this.sampleDetails.wetIns.filter(x => x.isSelected == true).forEach((item) => {
            var wetIns: IDCode = new IDCode();
            wetIns.id = item.specCatID;
            wetIns.sioID = item.sioID;
            wetIns.code = "WET_INST";
            wetIns.minutes = item.minutes;
            obj.samplTestList.push(wetIns);
        })

        this.sampleDetails.inv.filter(x => x.isSelected == true).forEach((item) => {
            var invBO: IDCode = new IDCode();
            invBO.id = item.invalidationID;
            invBO.code = "INVALIDATION";
            invBO.minutes = item.minutes;
            obj.samplTestList.push(invBO);
        })

        this.sampleDetails.oosTestList.filter(x => x.isSelected == true).forEach(item => {
            var oosBO: IDCode = new IDCode();
            oosBO.id = item.oosTestID;
            oosBO.code = "OOS";
            oosBO.minutes = item.minutes;
            obj.samplTestList.push(oosBO);
        })

        this.sampleDetails.drList.filter(x => x.isSelected == true).forEach(item => {
            var drBO: IDCode = new IDCode();
            drBO.id = item.reviewID;
            drBO.code = "DATA_REVIEW";
            drBO.minutes = item.minutes;
            obj.samplTestList.push(drBO);
        })

        this.sampleDetails.calibList.filter(x => x.isSelected == true).forEach(item => {
            var calibBO: IDCode = new IDCode();
            calibBO.id = item.specCatID;
            calibBO.code = "CALIBRATIONS";
            calibBO.minutes = item.minutes;
            calibBO.maintRptID = item.maintRptID;
            obj.samplTestList.push(calibBO);
        })

        this.loader.emit(true);
        this._service.manageTestActivitySamples(obj);
    }

    isSelectAllCheckBox(type: string) {
        this.isSelectedAllSampleTests(type)
    }

    validatingMinutes() {

        var messages: string = '';

        this.sampleDetails.sam.filter(x => x.isSelected == true).forEach((item) => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });

        this.sampleDetails.wetIns.filter(x => x.isSelected == true).forEach((item) => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });

        this.sampleDetails.inv.filter(x => x.isSelected == true).forEach((item) => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });

        this.sampleDetails.oosTestList.filter(x => x.isSelected == true).forEach(item => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });

        this.sampleDetails.drList.filter(x => x.isSelected == true).forEach(item => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });

        this.sampleDetails.calibList.filter(x => x.isSelected == true).forEach(item => {
            if (!CommonMethods.hasValue(item.minutes))
                messages = SamplePlanMessages.occupanyMinutes;
        });
        if (this.sampleDetails.sam.filter(x => x.isSelected == true).length < 1 && this.sampleDetails.wetIns.filter(x => x.isSelected == true).length < 1 && this.sampleDetails.inv.filter(x => x.isSelected == true).length < 1 && this.sampleDetails.oosTestList.filter(x => x.isSelected == true).length < 1 && this.sampleDetails.drList.filter(x => x.isSelected).length < 1 && this.sampleDetails.calibList.filter(x => x.isSelected).length < 1)
            messages = SamplePlanMessages.atLeastOneSampleing;

        return messages;
    }

    getSamplesSelectedCount(type: string) {
        this.selectCheck();
        var totalCount: number, selecedCount: number;
        if (type == 'SAMPLING') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.sam.length;
                selecedCount = this.sampleDetails.sam.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.sam.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.sam.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'invalidations') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.inv.length;
                selecedCount = this.sampleDetails.inv.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.inv.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.inv.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'oos') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.oosTestList.length;
                selecedCount = this.sampleDetails.oosTestList.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.oosTestList.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.oosTestList.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'DR') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.drList.length;
                selecedCount = this.sampleDetails.drList.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.drList.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.drList.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'CALIB') {
            var obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "CALIB_ARDS");
            if (!this.isSelect) {
                totalCount = obj.length;
                selecedCount = obj.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = obj.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = obj.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if(type == "DAILY_CALIB"){
            var obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "DAILY_CALIB");
            if (!this.isSelect) {
                totalCount = obj.length;
                selecedCount = obj.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = obj.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = obj.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.wetIns.length;
                selecedCount = this.sampleDetails.wetIns.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.wetIns.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.wetIns.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        return selecedCount + ' / ' + totalCount;

    }

    getMasterTestsSelectedCount(masterTestID) {
        this.selectCheck();
        var totalCount: number, selecedCount: number;
        if (CommonMethods.hasValue(masterTestID)) {
            var obj: any
            if (!this.isSelect)
                obj = this.sampleDetails.wetIns.filter(x => x.masterTestID == masterTestID)
            else
                obj = this.sampleDetails.wetIns.filter(x => x.masterTestID == masterTestID && x.isIncludeOtherPlan)
            totalCount = obj.length;
            selecedCount = obj.filter(x => x.isSelected == true).length;
        }
        else {
            var obj: any
            if (!this.isSelect)
                obj = this.sampleDetails.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID))
            else
                obj = this.sampleDetails.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID) && x.isIncludeOtherPlan)
            totalCount = obj.length;
            selecedCount = obj.filter(x => x.isSelected == true).length;
        }
        return selecedCount + ' / ' + totalCount;

    }

    changeSamplesTestSelect(evt, type: string) {
        if (evt.checked) {
            var obj: any
            if (type == 'SAMPLING')
                obj = this.sampleDetails.sam;
            else if (type == 'invalidations')
                obj = this.sampleDetails.inv;
            else if (type == 'oos')
                obj = this.sampleDetails.oosTestList
            else if (type == 'DR')
                obj = this.sampleDetails.drList;
            else if (type == 'CALIB')
                obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "CALIB_ARDS");
            else if (type == "DAILY_CALIB")
                obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "DAILY_CALIB");
            else
                obj = this.sampleDetails.wetIns;
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan)
            obj.forEach(x => { x.isSelected = true });
        }
        else {
            var obj: any
            if (type == 'SAMPLING')
                obj = this.sampleDetails.sam;
            else if (type == 'invalidations')
                obj = this.sampleDetails.inv;
            else if (type == 'oos')
                obj = this.sampleDetails.oosTestList;
            else if (type == 'DR')
                obj = this.sampleDetails.drList;
            else if (type == 'CALIB')
                obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "CALIB_ARDS");
            else if (type == "DAILY_CALIB")
                obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "DAILY_CALIB");
            else
                obj = this.sampleDetails.wetIns;
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan)
            obj.forEach(x => { x.isSelected = false });
        }

    }

    changeMasterTestSelect(evt, masterTestID) {
        if (CommonMethods.hasValue(masterTestID))
            this.sampleDetails.wetIns.filter(x => x.masterTestID == masterTestID).forEach(x => { x.isSelected = evt.checked ? true : false })
        else
            this.sampleDetails.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID)).forEach(x => { x.isSelected = evt.checked ? true : false })
    }

    isSelectedAllSampleTests(type: string) {
        var totalCount: number, selecedCount: number;
        if (type == 'SAMPLING') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.sam.length;
                selecedCount = this.sampleDetails.sam.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.sam.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.sam.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'invalidations') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.inv.length;
                selecedCount = this.sampleDetails.inv.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.inv.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.inv.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'oos') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.oosTestList.length;
                selecedCount = this.sampleDetails.oosTestList.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.oosTestList.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.oosTestList.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'DR') {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.drList.length;
                selecedCount = this.sampleDetails.drList.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.drList.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.drList.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == 'CALIB') {
            var obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "CALIB_ARDS");
            if (!this.isSelect) {
                totalCount = obj.length;
                selecedCount = obj.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = obj.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = obj.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else if (type == "DAILY_CALIB"){
            var obj = this.sampleDetails.calibList.filter(x => x.conditionCode == "DAILY_CALIB");
            if (!this.isSelect) {
                totalCount = obj.length;
                selecedCount = obj.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = obj.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = obj.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        else {
            if (!this.isSelect) {
                totalCount = this.sampleDetails.wetIns.length;
                selecedCount = this.sampleDetails.wetIns.filter(x => x.isSelected == true).length;
            }
            else {
                totalCount = this.sampleDetails.wetIns.filter(x => x.isIncludeOtherPlan).length;
                selecedCount = this.sampleDetails.wetIns.filter(x => x.isSelected == true && x.isIncludeOtherPlan).length;
            }
        }
        return totalCount > 0 ? totalCount == selecedCount ? true : false : false;

    }

    isSelectedAllMasterTests(masterTestID: number) {
        var totalLen: number, selectedLen: number;
        if (CommonMethods.hasValue(masterTestID)) {
            var obj = this.sampleDetails.wetIns.filter(x => x.masterTestID == masterTestID)
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan);
            totalLen = obj.length;
            selectedLen = obj.filter(x => x.isSelected == true).length;
        }
        else {
            var obj = this.sampleDetails.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID))
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan);
            totalLen = obj.length;
            selectedLen = obj.filter(x => x.isSelected == true).length;
        }
        return totalLen > 0 ? totalLen == selectedLen ? true : false : false;
    }

    getMasterTests(masterTestID: number) {
        if (CommonMethods.hasValue(masterTestID)) {
            var obj = this.sampleDetails.wetIns.filter(x => x.masterTestID == masterTestID);
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan);
            return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
        }
        else {
            var obj = this.sampleDetails.wetIns.filter(x => !CommonMethods.hasValue(x.masterTestID));
            if (this.isSelect)
                obj = obj.filter(x => x.isIncludeOtherPlan)
            return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
        }
    }

    selectCheck() {
        if (!this.isSelect) {
            this.totalTest = this.sampleDetails.sam.length + this.sampleDetails.wetIns.length + this.sampleDetails.inv.length + this.sampleDetails.oosTestList.length + this.sampleDetails.drList.length + this.sampleDetails.calibList.length;
            this.availabelTests = this.sampleDetails.sam.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.inv.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.wetIns.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.oosTestList.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.drList.filter(x => CommonMethods.hasValue(x.isSelected)).length + this.sampleDetails.calibList.filter(x => CommonMethods.hasValue(x.isSelected)).length;
            this.notAvailableTests = this.totalTest - this.availabelTests;
        }
        else {
            this.totalTest = this.sampleDetails.sam.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.wetIns.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.inv.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.oosTestList.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.drList.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.calibList.filter(x => CommonMethods.hasValue(x.isIncludeOtherPlan)).length;
            this.availabelTests = this.sampleDetails.sam.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.inv.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.wetIns.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.oosTestList.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.drList.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length + this.sampleDetails.calibList.filter(x => CommonMethods.hasValue(x.isSelected) && CommonMethods.hasValue(x.isIncludeOtherPlan)).length;
            this.notAvailableTests = this.totalTest - this.availabelTests;
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}