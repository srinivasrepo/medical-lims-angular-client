import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { SamplePlanUrls } from './samplePlanServiceUrl';
import { testOccupancyBO, ManageAnalystModel, SaveSampleModel, SaveSampleSpecModel, ManageSamplingTestModel, UnAssignTestSampleModel, GetAssignedTestSampleUserModel, ManageAssignTestModel, ManageShiftClose, ChangeUserPlanTest, SearchCloseShiftBo } from '../model/samplePlanModel';
import { SingleIDBO, SingleCodeBO } from 'src/app/common/services/utilities/commonModels';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';

@Injectable()

export class SamplePlanService {

    samplePlanSubject: Subject<any> = new Subject();

    constructor(private _httpService: LIMSHttpService) { }


    // Shift Close Activities
    getShiftCloseActivities(encShiftID) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getShiftCloseActivities, [encShiftID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getShiftCloseActivities" });
        });
    }

    getCategoryItemsByCatCode(code, type: string = "MNG") {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code, type])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: code });
        });
    }
    createSamplePlan(shiftID) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.createSampleplan, [shiftID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "createSampleplan" })
        })
    }

    // getPlantDetailsByID(encSamplePlanID: string) {
    //     this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getPlantDetailsByID, [encSamplePlanID])).subscribe(resp => {
    //         this.samplePlanSubject.next({ result: resp, purpose: "getPlantDetailsByID" })
    //     })
    // }

    getAnalysts(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getAnalysts, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getAnalysts" })
        })
    }


    // save analyst

    saveAnalysts(obj: ManageAnalystModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.saveAnalysts, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "saveAnalysts" })
        })
    }

    getAnalystsOccupancyDetails(encUserRoleID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getAnalystsOccupancyDetails, [encUserRoleID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getAnalystsOccupancyDetails" })
        })
    }


    getSampleDetails(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getSamples, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getSampleDetails" })
        })
    }

    manageSamples(obj: SaveSampleModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.manageSamples, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "manageSamples" })
        })
    }

    getSamplesmultiSpec(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getSamplesmultiSpec, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getSamplesmultiSpec" })
        })

    }

    manageSamplesSpec(obj: SaveSampleSpecModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.manageSamplesSpec, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "manageSamplesSpec" })
        })
    }

    getSampleDetailsByID(encSampleID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getSampleDetailsByID, [encSampleID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getSampleDetailsByID" })
        })
    }

    getTestActivitySamples(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getTestActivitySamples, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getTestActivitySamples" })
        })
    }

    manageTestActivitySamples(obj: ManageSamplingTestModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.manageTestActivitySamples, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "manageTestActivitySamples" })
        })
    }

    getPlanningDetails(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.getPlanningDetails, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getPlanningDetails" })
        })
    }

    autoPlan(encSamplePlanID: string, type: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.autoPlan, [encSamplePlanID, type])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "autoPlan", type: type })
        })
    }

    planDetails(encSamplePlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.planDetails, [encSamplePlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "planDetails" })
        })
    }

    deleteTestSample(obj: UnAssignTestSampleModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.deleteTestSample, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "deleteTestSample" })
        })
    }

    getCatItemsByCatCodeList(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getCatItemsByCatCodeList" })
        })
    }

    planActivitiesDetails(obj: GetAssignedTestSampleUserModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.planActivitiesDetails, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "planActivitiesDetails" })
        })
    }

    unAssignUserTests(obj: GetAssignedTestSampleUserModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.unAssignUserTests, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "unAssignUserTests" })
        })
    }

    assignActivityToUser(obj: ManageAssignTestModel) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.assignActivityToUser, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "assignActivityToUser" })
        })
    }

    manageShiftCloseActivities(obj: ManageShiftClose) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.manageShiftCloseActivities, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "manageShiftCloseActivities" });
        });
    }


    viewSamplePlanDetailsByID(encPlanID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.viewSamplePlanDetailsByID, [encPlanID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "viewSamplePlanDetailsByID" })
        })
    }


    getStatuslist(entityCode) {
        this._httpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    searchSamplePlan(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.searchSamplePlan, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "searchSamplePlan" });
        });
    }

    changeUserPlanTest(obj: ChangeUserPlanTest) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.changeUserPlanTest, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "changeUserPlanTest" });
        });
    }

    testOccupancy(obj: testOccupancyBO) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.testOccupancy, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "testOccupancy" });
        });
    }

    searchCloseShift(obj: SearchCloseShiftBo) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.searchCloseShift, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "searchCloseShift" });
        })
    }

    viewShiftClosed(encShiftID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(SamplePlanUrls.viewShiftClosed, [encShiftID])).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "viewShiftClosed" });
        })
    }

    manageUserTestActivityStatus(obj: any) {
        this._httpService.postDataToService(CommonMethods.formatString(SamplePlanUrls.manageUserTestActivityStatus, []), obj).subscribe(resp => {
            this.samplePlanSubject.next({ result: resp, purpose: "manageUserTestActivityStatus" });
        });
    }
}