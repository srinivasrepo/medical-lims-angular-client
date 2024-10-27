import { Component, Input, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { lookup } from 'dns';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ActionMessages, EntityCodes, LookupCodes } from 'src/app/common/services/utilities/constants';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LookUpDisplayField, LookupInfo } from 'src/app/limsHelpers/entity/limsGrid';
import { LKPDisplayNames, LKPPlaceholders, LKPTitles } from 'src/app/limsHelpers/entity/lookupTitles';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { AnalysisHeaderBO, CommonDataMapping, manageCommonDataMapping } from '../model/sampleAnalysisModel';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';

@Component({
    selector: 'ards-com-map',
    templateUrl: '../html/ArdsMappingCommonData.html'
})

export class ArdsCommonDataMapping {

    ArInfo: LookupInfo;
    TestInfo: LookupInfo;
    entityCode: string;
    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();
    @ViewChild('arNums', { static: false }) arNums: LookupComponent;
    @ViewChild("tests", { static: false }) tests: LookupComponent;
    header: any;
    dataSource: any;
    sectionLst: any;
    initTime: string;
    ardsExecID: string;
    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, private _service: SampleAnalysisService, public _global: GlobalButtonIconsService,
        private _actDialog: MatDialogRef<ArdsCommonDataMapping>, private store: Store<fromAnalysisOptions.AnalysisState>) { }

    ngOnInit() {
        this.store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                if (this.entityCode == EntityCodes.sampleAnalysis) {
                    this.headerInfo = analysis;
                }
            });
        this.store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionLst = getArdsInputsInfo;
            });
    }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getSTPCommonDataforMapping") {
                if (!CommonMethods.hasValue(resp.result) || resp.result.length == 0)
                    return this._alert.error(SampleAnalysisMessages.noCommonData);
                else
                    this.prepareDataSource(resp.result);
            }
            else if (resp.purpose == "manageSTPCommonData") {
                if (resp.result == "OK") {
                    this._alert.success(SampleAnalysisMessages.commondata);
                    this.close(true);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })
        this.prepareHeaders()
        if (this.entityCode == EntityCodes.sampleAnalysis) {
            var condition: string = "1 = 1"; // "STATUS_CODE = 'UNANS' AND MAT_ID = " + this.headerInfo.matID + " AND ANALYSIS_TYPE_CODE = '" + this.headerInfo.analysisTypeCode + "'";
            this.ArInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getSampleAnalysisSearchArNumber, LKPDisplayNames.arNumber, LKPDisplayNames.inwardNumber, LookUpDisplayField.header, LKPPlaceholders.arNumber, condition);
        }
        else {
            var condition: string = "1 = 1" // "StatusCode NOT IN ('FOR_CALIB', 'INPROG')"
            this.ArInfo = CommonMethods.PrepareLookupInfo(LKPTitles.calibrationRef, LookupCodes.getInstrumentCalibration, LKPDisplayNames.status, LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.calibrationRef, condition);
        }
        this.getTests();
    }

    prepareHeaders() {
        this.header = [];
        this.header.push({ columnDef: "sourceInput", header: "Source Input Description", cell: (element: any) => `${element.sourceInput}`, width: "maxWidth-30per" });
        this.header.push({ columnDef: "currentInput", header: "Current Input Description", cell: (element: any) => `${element.currentInput}`, width: "maxWidth-30per" });
        this.header.push({ columnDef: "value", header: "Value", cell: (element: any) => `${element.value}`, width: "maxWidth-30per" });

    }

    prepareDataSource(obj) {
        this.dataSource = [];
        var data: CommonDataMapping = new CommonDataMapping();
        obj.forEach(x => {
            var item = this.sectionLst.filter(o => o.detailID == x.detailID && CommonMethods.hasValue(o.isCommonData));
            if (item && item.length > 0) {
                data.sourceInput = x.inputDescription;
                data.currentInput = item[0].inputDescription;
                data.value = x.value;
            }
            else
                data.sourceInput = x.inputDescription;
            this.dataSource.push(data);
            data = new CommonDataMapping();
        });
        this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
    }

    getTests() {
        if (this.tests)
            this.tests.clear();
        this.dataSource = [];
        var condition = "1=2";
        if (CommonMethods.hasValue(this.arNums) && CommonMethods.hasValue(this.arNums.selectedId) && this.entityCode == EntityCodes.sampleAnalysis)
            condition = "ArID = " + this.arNums.selectedId;
        else if (CommonMethods.hasValue(this.arNums) && CommonMethods.hasValue(this.arNums.selectedId) && this.entityCode == EntityCodes.calibrationArds)
            condition = "EqpMaintID = " + this.arNums.selectedId

        if (this.entityCode == EntityCodes.calibrationArds)
            this.TestInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getGroupTests, LKPDisplayNames.test, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.test, condition);
        else
            this.TestInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getGroupTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, condition);

    }

    go() {
        if (!CommonMethods.hasValue(this.arNums.selectedId))
            return this._alert.warning(this.entityCode == EntityCodes.sampleAnalysis ? SampleAnalysisMessages.arnum : SampleAnalysisMessages.calibRef);
        if (!CommonMethods.hasValue(this.tests.selectedId))
            return this._alert.warning(this.entityCode == EntityCodes.sampleAnalysis ? SampleAnalysisMessages.test : SampleAnalysisMessages.slctParameter);
        this._service.getSTPCommonDataforMapping(this.tests.selectedId);
    }

    close(type: boolean = false) {
        this._actDialog.close(type);
    }

    save() {
        var obj: manageCommonDataMapping = new manageCommonDataMapping();
        obj.sourceArdsExecID = this.tests.selectedId;
        obj.ardsExecID = Number(this.ardsExecID);
        obj.initTime = this.initTime;
        obj.entityCode = this.entityCode;
        this._service.manageSTPCommonData(obj);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}