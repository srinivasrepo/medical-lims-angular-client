import { Injectable } from '@angular/core'
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { Subject } from 'rxjs';
import { GetTestBO, SearchDataReview } from '../modal/dataReviewModal';
import { DataReviewServiceUrls } from './dataReviewServiceUrls';
import { CalibrationArdsServiceUrls } from 'src/app/calibrationArds/services/calibrationArdsServiceUrl';
import { SampleAnalysisServiceUrl } from 'src/app/sampleAnalysis/service/sampleAnalysisServiceUrl';

@Injectable()

export class DataReviewService {

    dataReviewSubject: Subject<any> = new Subject();
    constructor(private limsHttpService: LIMSHttpService) { }

    getCategoryItemsByCatCode(code,type : string = "MNG") {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: code });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    getTestForReview(obj: GetTestBO) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(DataReviewServiceUrls.getTestForReview, []), obj).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'getTestForReview' });
        });
    }

    manageDataReviewData(obj) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(DataReviewServiceUrls.manageDataReviewData, []), obj).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'manageDataReviewData' });
        });
    }

    getDataReviewData(encReviewID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(DataReviewServiceUrls.getDataReviewData, [encReviewID])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'getDataReviewData' });
        });
    }

    searchDataReviewDetails(obj: SearchDataReview) {
        this.limsHttpService.postDataToService(CommonMethods.formatString(DataReviewServiceUrls.searchDataReviewDetails, []), obj)
            .subscribe(resp => {
                this.dataReviewSubject.next({ result: resp, purpose: "searchDataReviewDetails" });
            });
    }

    getStatusList(entityCode) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(DataReviewServiceUrls.getStatusList, [entityCode])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: "getStatusList" });
        });
    }

    getCalibrationArdsHeaderInfo(encID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(CalibrationArdsServiceUrls.getCalibrationArdsHeaderInfo, [encID])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'getCalibrationArdsHeaderInfo' });
        });
    }

    getAnalysisHeaderInfo(encID) {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisHeaderInfo, [encID])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: 'getAnalysisHeaderInfo' });
        });
    }

    getAnalysisTypes() {
        this.limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisTypes, [])).subscribe(resp => {
            this.dataReviewSubject.next({ result: resp, purpose: "getAnalysisTypes" });
        });
    }
}