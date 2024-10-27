import { Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { analystBO, searchAnalystBO, SearchTestsByTechniqueAndArID, ManageQualificationRequest, ManageQualificationEvaluation } from '../model/analystModel';
import { analystServiceUrls } from './analystServiceUrl';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';

@Injectable()

export class analystService {
    analystSubject: Subject<any> = new Subject();
    constructor(private _httpService: LIMSHttpService) { }

    getAnalystQualifications() {
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getAnalystQualifications, [])).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: 'getAnalystQualifications' });
        })
    }

    manageAnalystQualification(obj: analystBO) {
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.manageAnalystQualification, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "manageAnalystQualification" });
        });
    }

    getAnalystDetailsByID(encAnalystID) {
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getAnalystDetailsByID, [encAnalystID])).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "getAnalystDetailsByID" });
        });
    }

    searchQualififcationDetails(obj: searchAnalystBO) {
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.searchQualififcationDetails, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "searchQualififcationDetails" });
        });
    }

    getStatuslist(entityCode) {
        this._httpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    getQualificationType(techniqueID,analystID,requestTypeID){
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getQualificationType,[techniqueID,analystID,requestTypeID])).subscribe(resp =>{
            this.analystSubject.next({result : resp, purpose : "getQualificationType"});
        })
    }

    getAnalysisTypeByCategoryID(categoryID: any = 0){
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getAnalysisTypeByCategoryID,[categoryID])).subscribe(resp =>{
            this.analystSubject.next({result : resp, purpose : "getAnalysisTypeByCategoryID"});
       })
    }

    getTestsByTechniqueAndArID( obj : SearchTestsByTechniqueAndArID){
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.getTestsByTechniqueAndArID, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "getTestsByTechniqueAndArID" });
        })
    }

    manageQualificationRequest( obj :ManageQualificationRequest ){
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.manageQualificationRequest, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "manageQualificationRequest" });
        })
    }

    getQualificationDetails( encQualificationID : string){
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getQualificationDetails,[encQualificationID])).subscribe(resp =>{
            this.analystSubject.next({result : resp, purpose : "getQualificationDetails"});
       })
    }

    getCategoryItemsByCatCode(code, type: string = 'MNG') {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code, type])).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: code });
        });
    }

    manageQualificationEvaluation( obj :ManageQualificationEvaluation ){
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.manageQualificationEvaluation, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: "manageQualificationEvaluation" });
        })
    }
    
    getQualificationDetailsForView(encQualificationID){
        this._httpService.getDataFromService(CommonMethods.formatString(analystServiceUrls.getQualificationDetailsForView,[encQualificationID])).subscribe(resp=>{
            this.analystSubject.next({result:resp,purpose:"getQualificationDetailsForView"})
        });
    }

    manageAnalystDisqualify(obj){
        this._httpService.postDataToService(CommonMethods.formatString(analystServiceUrls.manageAnalystDisqualify,[]), obj).subscribe(resp => {
            this.analystSubject.next({result: resp, purpose: "manageAnalystDisqualify"});
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.analystSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }
}