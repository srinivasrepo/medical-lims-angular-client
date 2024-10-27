import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { StockSolutionsUrl } from '../service/stockSolutionsServiceUrl'
import { StockSolutionRequest } from '../model/stockSolutionsModel';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';

@Injectable()

export class StockSolutionsService {

    stockSolSubject: Subject<any> = new Subject();

    constructor(private _httpService: LIMSHttpService) { }

    getCatItemsByCatCode(code: string,type : string = "MNG") {
        this._httpService.getDataFromService(CommonMethods.formatString(StockSolutionsUrl.getCatItemsByCatCode, [code,type])).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: code });
        })
    }

    getCatItemsByCatCodeList(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(ServiceUrls.getCatItemsByCatCodeList, []), obj).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: 'getCatItemsByCatCodeList' });
        });
    }

    stockManageStockSolutionsRequest(obj: StockSolutionRequest, type: string) {
        this._httpService.postDataToService(CommonMethods.formatString(StockSolutionsUrl.stockSolutionRequest, []), obj).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: "stockManageStockSolutionsRequest", type: type });
        })
    }

    getSTOCKStockSolutionsDetailsByID(encID: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(StockSolutionsUrl.getSTOCKStockSolutionsDetailsByID, [encID])).subscribe(
            resp => {
                this.stockSolSubject.next({ result: resp, purpose: "GetSTOCKStockSolutionsDetailsByID" });
            })
    }

    getValidityPeriods(entityCode) {
        this._httpService.getDataFromService(CommonMethods.formatString(StockSolutionsUrl.getValidityPeriods, [entityCode])).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: 'getValidityPeriods' });
        });
    }

    stockManageStockSolutionsPreparation(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(StockSolutionsUrl.stockManageStockSolutionsPreparation, []), obj).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: "stockManageStockSolutionsPreparation" });
        });
    }

    stockManageStockSolutionsOutput(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(StockSolutionsUrl.stockManageStockSolutionsOutput, []), obj).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: "stockManageStockSolutionsOutput" });
        });
    }

    stockSearchStockSolutions(obj) {
        this._httpService.postDataToService(CommonMethods.formatString(StockSolutionsUrl.stockSearchStockSolutions, []), obj).subscribe(resp => {
            this.stockSolSubject.next({ result: resp, purpose: "stockSearchStockSolutions" });
        });
    }

    getStatusList(code: string) {
        this._httpService.getDataFromService(CommonMethods.formatString(StockSolutionsUrl.getStatusList, [code]))
            .subscribe(resp => {
                this.stockSolSubject.next({ "result": resp, "purpose": "getStatusList" });
            })
    }

}