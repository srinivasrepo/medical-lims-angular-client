import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { OosSearchUrls } from './oosServiceUrl';
import { SearchOos, ManageHypoTesting, ManageOOSProcess, ManageOOSSummaryInfo } from '../model/oosModel';


@Injectable()

export class OosService {
    oosSubject: Subject<any> = new Subject();
    constructor(private limsHttpService: LIMSHttpService) { }

    getCategoryItemsByCatCode(code,type:string ="MNG") {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: code });
        });
    }

    getStatusList(code: string) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getStatusList, [code]))
            .subscribe(resp => {
                this.oosSubject.next({ "result": resp, "purpose": "getStatusList" });
            })
    }

    searchOOSTestDetails(obj: SearchOos) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.searchOOSTestDetails, []), obj)
            .subscribe(resp => {
                this.oosSubject.next({ "result": resp, "purpose": "searchOOSTestDetails" });
            })
    }

    getTestInfo(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.getTestInfo, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: "getTestInfo" });
        });
    }

    updateOOSSummary(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.updateOOSSummary, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: "updateOOSSummary" });
        });
    }

    oosGetPhase1CheckList(encOosTestDetID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.oosGetPhase1CheckList, [encOosTestDetID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'oosGetPhase1CheckList' });
        });
    }

    oosProcessItem(obj: ManageOOSProcess) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.oosProcessItem, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'oosProcessItem' });
        });
    }

    oosGetHypoTestingInfo(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.oosGetHypoTestingInfo, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'oosGetHypoTestingInfo' });
        });
    }

    oosManageHypoTestingPhases(obj: ManageHypoTesting) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.oosManageHypoTestingPhases, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'oosManageHypoTestingPhases' });
        });
    }

    oosTestingOfNewPortionOfSameSampleResult(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.oosTestingOfNewPortionOfSameSampleResult, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'oosTestingOfNewPortionOfSameSampleResult' });
        });
    }

    oosGetSingleAndCatBDetails(encOOSTestDetailID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.oosGetSingleAndCatBDetails, [encOOSTestDetailID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'OOSGetSingleAndCatBDetails' });
        });
    }

    getDeptReviewDetails(encOOSTestDetID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getDeptReviewDetails, [encOOSTestDetID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getDeptReviewDetails' });
        });
    }

    manageOOSDeptReview(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.manageOOSDeptReview, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'manageOOSDeptReview' });
        });
    }

    getDepartmentWiseReview(encOOSTestDetID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getDepartmentWiseReview, [encOOSTestDetID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getDepartmentWiseReview' });
        });
    }

    manageDepartmentComments(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.manageDepartmentComments, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'manageDepartmentComments' });
        });
    }

    getManufactureChecklist(category) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getManufactureChecklist, [category])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getManufactureChecklist' });
        });
    }

    getManufactureCheckPoints(encOosTestDetID, phaseID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getManufactureCheckPoints, [encOosTestDetID, phaseID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getManufactureCheckPoints' });
        });
    }

    manufactureInvestigationDetails(encOOSTestDetailID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.manufactureInvestigationDetails, [encOOSTestDetailID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'manufactureInvestigationDetails' });
        });
    }

    getQASummaryInfo(encID){
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getQASummaryInfo, [encID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getQASummaryInfo' });
        });
    }

    manageQASummaryInfo(obj){
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.manageQASummaryInfo, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'manageQASummaryInfo' });
        });
    }
    
    getOOSSummaryInfo(encOosTestID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.getOOSSummaryInfo, [encOosTestID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'getOOSSummaryInfo' });
        });
    }

    manageOOSSummaryInfo(obj: ManageOOSSummaryInfo) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(OosSearchUrls.manageOOSSummaryInfo, []), obj).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'manageOOSSummaryInfo' });
        });
    }

    generateDeviationReq(encOosTestID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(OosSearchUrls.generateDeviationReq, [encOosTestID])).subscribe(resp => {
            this.oosSubject.next({ result: resp, purpose: 'generateDeviationReq' });
        });
    }
}
