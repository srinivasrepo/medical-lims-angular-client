import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { ReportServiceUrls } from './reportServiceUrls';
import { LIMSHttpService } from '../../common/services/limsHttp.service';

@Injectable()

export class ReportService {

    reportSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }


    getEntityReports(entityType: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ReportServiceUrls.getEntityReportInfo, [entityType]))
            .subscribe(resp => {
                this.reportSubject.next({ "result": resp, "purpose": "entityReports" })
            })
    }

    getSearchResult(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ReportServiceUrls.searchRptResult, []), obj)
            .subscribe(resp => {
                this.reportSubject.next({ "result": resp, "purpose": "searchResult" });
            })
    }

}