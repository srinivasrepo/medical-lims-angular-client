import { Component } from '@angular/core';
import { SamplePlanService } from '../service/samplePlan.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, EntityCodes } from 'src/app/common/services/utilities/constants';
import { ViewShiftClose } from '../model/samplePlanModel';
import { dateParserFormatter, CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';

@Component({
    selector: 'app-view-shiftclosed',
    templateUrl: '../html/viewShiftClosed.html'
})

export class ViewShiftClosedComponent {

    pageTitle: string = PageTitle.viewShiftClose;
    backUrl: string = PageUrls.searchShifClose;
    encShiftID: string;
    dataSource: any = [];
    headersData: any;
    viewHistory: any;
    entityCode: string = EntityCodes.closeShift;
    planLst: any;
    pendingAct: any;
    viewObj: ViewShiftClose = new ViewShiftClose();

    subscription: Subscription = new Subscription();

    constructor(private _saService: SamplePlanService, private _actRoute: ActivatedRoute) { }

    ngAfterViewInit() {
        this._actRoute.queryParams.subscribe(param => this.encShiftID = param['id']);
        this.subscription = this._saService.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "viewShiftClosed") {
                this.viewObj = resp.result;
                this.planLst = resp.result.planLst;
                if (!this.planLst || this.planLst.length == 0)
                    this.planLst.push({ planID: null });
                this.viewObj.requestDate = dateParserFormatter.FormatDate(resp.result.requestDate, "date");
                this.pendingAct = resp.result.getShiftActivitiesList;
            }
        })

        this.prepareHeaders();
        this.tranHistory();
        this._saService.viewShiftClosed(this.encShiftID);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: "sno", header: "S.No", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.headersData.push({ columnDef: "activity", header: "Activity Type", cell: (element: any) => `${element.activity}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "activityDesc", header: "Activity Description", cell: (element: any) => `${element.activityDesc}`, width: "maxWidth-30per" });
        this.headersData.push({ columnDef: "refNumberCls", header: "Reference Number", cell: (element: any) => `${element.arNumber}`, width: "maxWidth-15per" });
        // this.headersData.push({ columnDef: "testTitle", header: "Test Title", cell: (element: any) => `${element.testTitle}` });
        this.headersData.push({ columnDef: "actStatus", header: "Activity Status", cell: (element: any) => `${element.activityStatus}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "status", header: "Status", cell: (element: any) => `${element.status}`, width: "maxWidth-15per" });
        this.headersData.push({ columnDef: "remarksClose", header: "Remarks", cell: (element: any) => `${element.remarks}`, width: "maxWidth-20per" });

    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encShiftID
        obj.code = EntityCodes.closeShift;
        this.viewHistory = obj;
    }

    getData(id) {
        var obj: any;
        if (CommonMethods.hasValue(id))
            obj = this.pendingAct.filter(x => x.planID == id)
        else
            obj = this.pendingAct.filter(x => !CommonMethods.hasValue(x.planID))
        return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(obj));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}