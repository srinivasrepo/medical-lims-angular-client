import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { ActionMessages, SamplePlanLocalKeys, ButtonActions, EntityCodes } from 'src/app/common/services/utilities/constants';
import { SamplePlanMessages } from '../messages/samplePlanMessages';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { ActivatedRoute } from '@angular/router';
import { SamplesComponent } from './samples.component';
import { PageReqModel } from '../model/samplePlanModel';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls } from '../../common/services/utilities/constants';
import { SpecificationsComponent } from './specifications.component';
import { SampleTestComponent } from './sampleTest.component';
import { PlanningComponent } from './planning.component';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { AnalystSamplePlanComponent } from './analystSample.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';

@Component({
    selector: 'app-sample-plan',
    templateUrl: '../html/createSamplePlan.html'
})
export class CreateSamplePlanComponent {

    encSamplePlanID: string;
    appBO: AppBO = new AppBO();
    @ViewChild('analysts', { static: false }) analysts: AnalystSamplePlanComponent;
    @ViewChild('samples', { static: false }) samples: SamplesComponent;
    @ViewChild('samples_spec', { static: false }) samples_spec: SpecificationsComponent;
    @ViewChild('samples_Test', { static: false }) samples_Test: SampleTestComponent;
    @ViewChild('samples_Planning', { static: false }) samples_Planning: PlanningComponent;
    stepName: string = 'ANALYSTS';

    pageReqBO: PageReqModel = new PageReqModel();
    pageTitle: string = PageTitle.manageSampleplan;
    backUrl: string = PageUrls.homeUrl;
    disableBtn: boolean;
    selectedTabIndex: number = 0;
    totalTabs: number = 5;
    btnSaveType: String = ButtonActions.btnSave;
    status: string;
    refNumber: string;
    dynamicSkip: boolean = false;
    shiftList: any = [];
    shiftID: number;
    viewHistory: any;
    viewHistoryVisible: boolean;
    entityCode: string = EntityCodes.samplePlan;
    enablePlanningTab: boolean = false;
    subscription: Subscription = new Subscription();
    isLoaderStart: boolean = false;
    isLoaderStartIcn: boolean = false;
    isLoaderReset: boolean = false;
    isLoaderGenerate: boolean = false;
    showRpts: boolean = false;
    constructor(private _service: SamplePlanService, private _alert: AlertService,
        private _actRoute: ActivatedRoute, public _global: GlobalButtonIconsService) { }


    ngAfterContentInit() {

        this._actRoute.queryParams.subscribe(param => this.encSamplePlanID = param['id']);
        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "createSampleplan") {
                this.disableBtn = false;
                if (resp.result.returnFlag == 'SUCCESS') {
                    this._alert.success(SamplePlanMessages.createPlanSaved);
                    this.appBO = resp.result;
                    this.status = resp.result.status;
                    this.refNumber = resp.result.referenceNumber;
                    this.encSamplePlanID = this.appBO.encTranKey;
                    this.showHistory();
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.resultFlag))
            }
            else if (resp.purpose == "getPlanningDetails") {
                this.pageReqBO = resp.result.plan;
                this.status = resp.result.plan.status;
                this.refNumber = resp.result.plan.requestCode;
                this.appBO = resp.result.rec;
                setTimeout(() => { this.setTabIndex(this.selectedTabIndex) }, 1000);
            }
            else if (resp.purpose == "saveAnalysts" || resp.purpose == "manageSamples" || resp.purpose == 'manageTestActivitySamples' || resp.purpose == "manageSamplesSpec" || resp.purpose == "deleteTestSample") {
                if (resp.result.returnFlag == "SUCCESS")
                    this.appBO = resp.result;
            }
            else if (resp.purpose == 'WORK_SHIFTS')
                this.shiftList = resp.result;
            else if (resp.purpose == "planDetails") {
                if (resp.result.plandet && resp.result.plandet.length > 0) {
                    var obj = resp.result.plandet.filter(x => CommonMethods.hasValue(x.userRoleID))
                    this.enablePlanningTab = true;
                    if (obj && obj.length > 0) {
                        this.disableBtn = true;
                        this.samples.disableAll = this.samples_spec.disableAll = this.samples_Test.disableAll = true;
                    }
                    else {
                        this.disableBtn = false;
                        this.samples.disableAll = this.samples_spec.disableAll = this.samples_Test.disableAll = false;
                    }
                }
                else {
                    this.enablePlanningTab = false;
                    this.disableBtn = false;
                    this.samples.disableAll = this.samples_spec.disableAll = this.samples_Test.disableAll = false;
                }
            }

        })

        this.showHistory();
        this._service.getCategoryItemsByCatCode('WORK_SHIFTS')
        if (CommonMethods.hasValue(this.encSamplePlanID))
            this._service.getPlanningDetails(this.encSamplePlanID);

        if (!this.encSamplePlanID)
            this.changeBgColor('INIT');
    }

    addSamplePlan() {
        // this._confirm.confirm(SamplePlanMessages.confirmSampleplan).subscribe(resp => {
        //     if (resp) {
        //         this.disableBtn = true;
        //         this._service.createSamplePlan();
        //     }
        // })
        if (!CommonMethods.hasValue(this.shiftID))
            return this._alert.warning(SamplePlanMessages.selectShift)

        this.changeBgColor('CLEAR');
        this.disableBtn = true;
        this._service.createSamplePlan(this.shiftID);
    }

    selectedTab(type: string, isSelected: boolean = true) {

        if (isSelected) {
            if (type == 'left')
                this.selectedTabIndex = this.selectedTabIndex == 0 ? 0 : this.selectedTabIndex - 1;
            else {
                if (!this.getSwichTabValue(this.selectedTabIndex))
                    this.selectedTabIndex = this.selectedTabIndex == this.totalTabs - 1 ? this.selectedTabIndex : this.selectedTabIndex + 1;
            }

            this.stepName = this.getStepName(this.selectedTabIndex);
        }

        if (this.selectedTabIndex == 1 && this.samples && this.samples.getSamplesDetails && this.samples.getSamplesDetails.length < 1)
            this._service.getSampleDetails(this.encSamplePlanID);
        else if (this.selectedTabIndex == 2 && localStorage.getItem(SamplePlanLocalKeys.Samples_SpecKey)) {
            localStorage.removeItem(SamplePlanLocalKeys.Samples_SpecKey);
            this._service.getSamplesmultiSpec(this.encSamplePlanID);
        }
        else if (this.selectedTabIndex == 3 && localStorage.getItem(SamplePlanLocalKeys.Samples_SampleTestKey)) {
            localStorage.removeItem(SamplePlanLocalKeys.Samples_SampleTestKey);
            this._service.getTestActivitySamples(this.encSamplePlanID);
        }
        else if (this.selectedTabIndex == 4 && localStorage.getItem(SamplePlanLocalKeys.Anal_PlanningKey)) {
            localStorage.removeItem(SamplePlanLocalKeys.Anal_PlanningKey);
            this._service.planDetails(this.encSamplePlanID);
        }
    }

    getStepName(index: number) {
        return index == 0 ? 'ANALYSTS' : index == 1 ? 'SAMPLES' : index == 2 ? 'SPECIFICATIONS' : index == 3 ? 'SAMPLE TEST' : index == 4 ? 'PLANNING' : null;
    }

    getBtnType(index: number) {
        return index == 0 ? this.analysts.btnSaveType : index == 1 ? this.samples.btnSaveType : index == 2 ? this.samples_spec.btnSaveType : index == 3 ? this.samples_Test.btnSaveType : index == 4 ? this.samples_Planning.btnSaveType : ButtonActions.btnSave;
    }

    setTabIndex(index) {
        this.selectedTabIndex = index;
        //this.stepName = this.getStepName(this.selectedTabIndex);
        this.btnSaveType = this.getBtnType(index);
        this.selectedTab('', false);
        if (index == 1)
            setTimeout(() => { this.btnSaveType = this.getBtnType(index); }, 500);
    }

    isDisabledTab(index: number) {
        if (!this.dynamicSkip && CommonMethods.hasValue(this.samples_Test) && this.samples_Test.btnSaveType == ButtonActions.btnSave) {
            if (this.analysts && this.analysts.btnSaveType == ButtonActions.btnSave) {
                if (index == 1 || index == 2 || index == 3 || index == 4)
                    return true;
            }
            else if (this.samples && this.samples.btnSaveType == ButtonActions.btnSave) {
                if (index == 2 || ((index == 3 || index == 4) && this.samples_Test.btnSaveType == ButtonActions.btnSave))
                    return true;
            }
            else if (this.samples_spec && this.samples_spec.btnSaveType == ButtonActions.btnSave) {
                if ((index == 3 || index == 4) && this.samples_Test.btnSaveType == ButtonActions.btnSave)
                    return true;
            }
            else if (this.samples_Test && this.samples_Test.btnSaveType == ButtonActions.btnSave && !this.enablePlanningTab) {
                if (index == 4)
                    return true;
            }
        }
    }

    isDisable(index: number) {
        return this.disableBtn;
    }

    getSwichTabValue(index: number) {
        if (index == 0)
            return this.analysts.btnSaveType == ButtonActions.btnSave;
        else if (index == 1)
            return this.samples.btnSaveType == ButtonActions.btnSave;
        else if (index == 2)
            return this.samples_spec.btnSaveType == ButtonActions.btnSave;
        else if (index == 3)
            return this.samples_Test.btnSaveType == ButtonActions.btnSave;
    }

    save(index) {
        if (index == 0)
            this.analysts.saveAnalysts();
        else if (index == 1)
            this.samples.saveSamples();
        else if (index == 2)
            this.samples_spec.saveSpecifications();
        else if (index == 3)
            this.samples_Test.saveTestSample();
        else if (index == 4)
            this.samples_Planning.save();

        setTimeout(() => {
            this.btnSaveType = this.getBtnType(index);
            if (this.btnSaveType == ButtonActions.btnUpdate && index < 4)
                this.selectedTabIndex = index + 1;
        }, 1500);

    }


    ngOnDestroy() {
        if (localStorage.getItem(SamplePlanLocalKeys.Samples_SpecKey))
            localStorage.removeItem(SamplePlanLocalKeys.Samples_SpecKey)
        if (localStorage.getItem(SamplePlanLocalKeys.Samples_SampleTestKey))
            localStorage.removeItem(SamplePlanLocalKeys.Samples_SampleTestKey);
        if (localStorage.getItem(SamplePlanLocalKeys.Anal_PlanningKey))
            localStorage.removeItem(SamplePlanLocalKeys.Anal_PlanningKey);

        this.subscription.unsubscribe();
        this.changeBgColor('CLEAR');
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSamplePlanID
        obj.code = EntityCodes.samplePlan;
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encSamplePlanID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    /*for page bg - sukumar*/

    changeBgColor(type: string) {
        var docID = document.getElementById('bg_complaints');

        if (CommonMethods.hasValue(docID) && type == 'CLEAR')
            docID.className = '';
        else if (CommonMethods.hasValue(docID) && type != 'CLEAR')
            docID.className = 'workplanbg';
    }


    goToNextTab() {
        debugger;
        this.dynamicSkip = true
        this.selectedTabIndex = this.selectedTabIndex + 1;
        setTimeout(() => {
            this.dynamicSkip = false;
        }, 300);
    }
    /*for page bg - sukumar end - 14022020*/


    isLoaderOn(evt){
        this.isLoaderStart = evt;
    }

    samplePlanLoader(evt){
        if( evt.type != 'SAVE' && evt.type !=  '')
            evt.type == 'GENERATE' ? this.isLoaderGenerate = evt.isLoaderStart  : this.isLoaderReset = evt.isLoaderStart
        else{
            this.isLoaderReset = this.isLoaderGenerate = false;
            this.isLoaderStartIcn = evt.isLoaderStart;
        }
    }
}


