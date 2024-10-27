import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { analystService } from '../service/analyst.service';
import { ActivatedRoute } from '@angular/router';
import { PageUrls } from 'src/app/common/services/utilities/constants';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';

@Component({
    selector: 'view-analyst',
    templateUrl: '../html/viewAnalystQualification.html'
})

export class viewAnalystQualification {

    subscription: Subscription = new Subscription();
    reason: string;
    status: string;
    refNo: string;
    analystName: string;
    qualifications: string;
    viewHistory: any;
    encAnalystID: string;
    backUrl: string = PageUrls.analystQualif;
    pageTitle: string = PageTitle.viewAnalyst;

    constructor(private _analystService: analystService, private _actRoute: ActivatedRoute) { }

    ngAfterContentInit() {
        this._actRoute.queryParams.subscribe(param => this.encAnalystID = param['id']);
        this.subscription = this._analystService.analystSubject.subscribe(resp => {
            if (resp.purpose == "getAnalystDetailsByID") {
                this.reason = resp.result.analyst.reason;
                this.status = resp.result.analyst.status;
                this.refNo = resp.result.analyst.analystNumber;
                this.analystName = resp.result.analyst.userName;
                this.qualifications = resp.result.analyst.qualifications;
            }
        });
        this.viewHistory = ({ id: this.encAnalystID, code: 'ANALYST_QUALIFICATION' });
        this._analystService.getAnalystDetailsByID(this.encAnalystID);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}