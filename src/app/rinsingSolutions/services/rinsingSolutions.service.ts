import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { RinsingSolutionsUrls } from './rinsingSolutionsServiceUrls';
import { ManageRinsingSolution, ManageOutputRinsingSol, SearchRinsingSolutions } from '../model/rinsingSolutionsModel';

@Injectable()



export class RinisingSolutionsService {

    rinsingSolSubject: Subject<any> = new Subject();

    constructor(private _httpService : LIMSHttpService) { }
    
    getCategoryItemsByCatCode(code,type:string = "MNG") {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.rinsingSolSubject.next({ result: resp, purpose: code });
        });
    }

    getCatItemsByCatCodeList(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.rinsingSolSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    getAllMaterialCategories() {
        this._httpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getAllMaterialCategories, [])).subscribe(resp => {
            this.rinsingSolSubject.next({ result: resp, purpose: "getAllMaterialCategories" });
        });
    }

    manageRinsingSolutions(obj:ManageRinsingSolution){
        this._httpService.postDataToService(CommonMethods.formatString(RinsingSolutionsUrls.manageRinsingSolutions,[]),obj).subscribe(resp => {
            this.rinsingSolSubject.next({result:resp , purpose:"manageRinsingSolution"});
        })
    }

    getRinsingSolutionsDetailsByID(encID:string){
        this._httpService.getDataFromService(CommonMethods.formatString(RinsingSolutionsUrls.getRinsingSolutionsDetailsByID,[encID])).subscribe(resp=>{
            this.rinsingSolSubject.next({result:resp,purpose:"getRinsingSolutionsDetailsByID"});
        })
    }

    getValidityPeriods(entityCode :string) {
        this._httpService.getDataFromService(CommonMethods.formatString(RinsingSolutionsUrls.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.rinsingSolSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    manageRinsingSolutionsOutputDetails(obj:ManageOutputRinsingSol){
        this._httpService.postDataToService(CommonMethods.formatString(RinsingSolutionsUrls.manageRinsingSolutionsOutputDetails,[]),obj).subscribe(resp =>{
            this.rinsingSolSubject.next({result:resp , purpose:"manageRinsingSolutionsOutputDetails"});
        });
    }

    searchRinsingSolutionsData(obj : SearchRinsingSolutions){
        this._httpService.postDataToService(CommonMethods.formatString(RinsingSolutionsUrls.searchRinsingSolutionsData,[]),obj).subscribe(resp =>{
            this.rinsingSolSubject.next({result:resp , purpose:"searchRinsingSolutionsData"});
        });
    }

    getStatusList(code: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(RinsingSolutionsUrls.getStatusList, [code]))
            .subscribe(resp => {
                this.rinsingSolSubject.next({ "result": resp, "purpose": "getStatusList" });
            })
    }
}