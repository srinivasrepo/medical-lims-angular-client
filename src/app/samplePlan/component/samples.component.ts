import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, SamplePlanLocalKeys, ButtonActions } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO, SingleIDBO } from 'src/app/common/services/utilities/commonModels';
import { SaveSampleModel, GetSamplesModelList } from '../model/samplePlanModel';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'plan-samples',
    templateUrl: '../html/samples.html'
})
export class SamplesComponent {
    @Input('encSamplePlanID') encSamplePlanID: string;
    @Input('appBO') appBO: AppBO = new AppBO();

    getSamplesDetails: GetSamplesModelList = new GetSamplesModelList();
    getSamplesTypes: Array<string>;
    btnSaveType: string = ButtonActions.btnSave;
    // btnDisabled: boolean;
    headersData: any;
    totalSamples: number;
    assignedSamples: number;
    unAssignedSamples: number;
    SampleDetails: any;
    searchText: string;
    isSelect: boolean = false;
    subscription: Subscription = new Subscription();
    disableAll: boolean = false;
    @Output() loader: EventEmitter<any> = new EventEmitter();    


    constructor(private _service: SamplePlanService, private _alert: AlertService, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getSampleDetails") {
                this.prepareHeaders();
                this.SampleDetails = CommonMethods.bindMaterialGridData(resp.result);
                this.getSamplesDetails = dateParserFormatter.FormatDate(resp.result, 'arrayDateFormat', 'inwardDate');
                let smaples = this.getSamplesDetails.map(x => x.analysisType);
                this.getSamplesTypes = smaples.filter(function (v, i) { return smaples.indexOf(v) == i; });
                if (this.getSamplesDetails.findIndex(x => x.isSelected == true) > -1)
                    this.enableHeaders(false);
                this.totalSamples = this.getSamplesDetails.length;
                this.assignedSamples = this.getSamplesDetails.filter(x => CommonMethods.hasValue(x.isSelected)).length;
                this.unAssignedSamples = this.getSamplesDetails.filter(x => !CommonMethods.hasValue(x.isSelected)).length;

            }
            else if (resp.purpose == "manageSamples") {
                // this.btnDisabled = false;
                this.loader.emit(false);
                if (resp.result.returnFlag == "SUCCESS") {
                    this._alert.success(SamplePlanMessages.saveSamples);
                    this.appBO = resp.result;
                    this.enableHeaders(false);
                    localStorage.setItem(SamplePlanLocalKeys.Samples_SpecKey, 'true');
                    localStorage.setItem(SamplePlanLocalKeys.Samples_SampleTestKey, 'true');
                    localStorage.setItem(SamplePlanLocalKeys.Anal_PlanningKey, 'true');

                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
            }

        })
    }

    enableHeaders(val: boolean) {
        this.btnSaveType = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: 'sno', header: 'S. No.', cell: (element: any) => `${element.sno}`, width: 'maxWidth-5per' });
        this.headersData.push({ "columnDef": 'isSelected', "header": "", cell: (element: any) => `${element.isSelected}`, width: 'maxWidth-5per' })
        this.headersData.push({ "columnDef": 'inwardDate', "header": "Inward Date", cell: (element: any) => `${element.inwardDate}`, width: 'maxWidth-10per' })
        this.headersData.push({ "columnDef": 'arNumber', "header": "AR Number", cell: (element: any) => `${element.arNumber}`, width: 'maxWidth-10per' })
        this.headersData.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' })
        this.headersData.push({ "columnDef": 'sampleNumber', "header": "Sample Number", cell: (element: any) => `${element.sampleNumber}`, width: 'maxWidth-15per' })
        this.headersData.push({ "columnDef": 'productName', "header": "Product / Material", cell: (element: any) => `${element.productName}`, width: 'maxWidth-30per' })
        this.headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-10per' })
        // this.headersData.push({ "columnDef": 'isIncludeOtherPlan', "header": "", cell: (element: any) => `${element.isIncludeOtherPlan}`, width: 'maxWidth-5per' })
    }

    getSamplesDataSource(sampleType: string) {

        return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.getSamplesDetails.filter(x => x.analysisType == sampleType)));
    }

    saveSamples() {

        if (this.btnSaveType == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        if (this.getSamplesDetails.filter(x => x.isSelected == true).length < 1)
            return this._alert.warning(SamplePlanMessages.samples);

        var obj: SaveSampleModel = new SaveSampleModel();
        obj.encPlanID = this.encSamplePlanID;


        this.SampleDetails.data.filter(x => x.isSelected == true).forEach(item => {
            var single: SingleIDBO = new SingleIDBO();
            single.id = item.sioID;
            obj.list.push(single);
        });

        obj.initTime = this.appBO.initTime;
        // this.btnDisabled = true;

        this.loader.emit(true);
        this._service.manageSamples(obj);
    }

    getSamplesSelectedCount(analysisType: string) {
        this.assignedSamples = this.getSamplesDetails.filter(x => CommonMethods.hasValue(x.isSelected)).length;
        this.unAssignedSamples = this.getSamplesDetails.filter(x => !CommonMethods.hasValue(x.isSelected)).length;
        var totalCount: number, selecedCount: number;
        totalCount = this.getSamplesDetails.filter(x => x.analysisType == analysisType).length;
        selecedCount = this.getSamplesDetails.filter(x => x.analysisType == analysisType && x.isSelected == true).length;
        return selecedCount + ' / ' + totalCount;
    }

    changeSamplesSelect(evt, analysisType: string) {
        if (evt.checked)
            this.getSamplesDetails.filter(item => item.analysisType == analysisType).forEach((x) => { x.isSelected = true; })
        else
            this.getSamplesDetails.filter(item => item.analysisType == analysisType).forEach((x) => { x.isSelected = false; })

    }

    isSelectedAllSamples(analysisType: string) {
        this.assignedSamples = this.getSamplesDetails.filter(x => CommonMethods.hasValue(x.isSelected)).length;
        this.unAssignedSamples = this.getSamplesDetails.filter(x => !CommonMethods.hasValue(x.isSelected)).length;
        var totalLen = this.getSamplesDetails.filter(item => item.analysisType == analysisType).length;
        var selectedLen = this.getSamplesDetails.filter(item => item.analysisType == analysisType && item.isSelected == true).length;
        return totalLen > 0 ? totalLen == selectedLen ? true : false : false;
    }

    onFilterClick(evt) {
        const filterValue = (evt.target as HTMLInputElement).value;
        this.SampleDetails.filter = filterValue.trim().toLowerCase();
        this.getSamplesDetails = this.SampleDetails.filteredData;
        this.selectCheck()
    }

    selectCheck() {
        if (this.isSelect) {
            var obj = this.getSamplesDetails.filter(x => x.isIncludeOtherPlan)
            this.getSamplesDetails = obj;
        }
        else {
            if(!CommonMethods.hasValue(this.searchText))
                this.searchText = "";
            this.SampleDetails.filter = this.searchText.trim().toLowerCase();
            this.getSamplesDetails = this.SampleDetails.filteredData;
        }
        this.totalSamples = this.getSamplesDetails.length;
        this.assignedSamples = this.getSamplesDetails.filter(x => CommonMethods.hasValue(x.isSelected)).length;
        this.unAssignedSamples = this.getSamplesDetails.filter(x => !CommonMethods.hasValue(x.isSelected)).length;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}