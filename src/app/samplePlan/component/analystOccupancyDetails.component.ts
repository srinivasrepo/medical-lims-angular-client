import { Component } from "@angular/core";
import { Subscription } from 'rxjs';
import { SamplePlanService } from '../service/samplePlan.service';
import { AnalystsOccupancyModelList } from '../model/samplePlanModel';
import { MatDialogRef } from '@angular/material';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'analyst-occ',
    templateUrl: '../html/analystOccupancyDetails.html'
})
export class AnalystOccupancyDetailsComponent {
    encUserRoleID: string;
    occuDetails: AnalystsOccupancyModelList = new AnalystsOccupancyModelList();
    analystOccuActivities: any = [];

    subscription: Subscription = new Subscription();

    constructor(private _service: SamplePlanService, private _matDailogRef: MatDialogRef<AnalystOccupancyDetailsComponent>, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {

        this.subscription = this._service.samplePlanSubject.subscribe(resp => {
            if (resp.purpose == "getAnalystsOccupancyDetails") {
                if (resp.result.length > 0)
                    this.occuDetails = dateParserFormatter.FormatDate(resp.result, 'filterTwiceDateCol', ['assignOn', 'schDate', 'inalidationDate', 'reviewDate']);
                // else
                //     this.occuDetails.push(resp.result);

                let activity = this.occuDetails.map(x => x.activity);
                this.analystOccuActivities = activity.filter((x, i, a) => x && a.indexOf(x) === i);
            }
        })

        this._service.getAnalystsOccupancyDetails(this.encUserRoleID);
    }

    getOccuActivitiesDataSource(activity: string) {
        return CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.occuDetails.filter(x => x.activity == activity)));
    }

    getHeadersData(activity: string) {
        var headersData: Array<any> = [];

        if (activity == 'Sampling') {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'arNum', "header": "AR Number", cell: (element: any) => `${element.arNum}` , width: 'maxWidth-25per'});
            headersData.push({ 'columnDef': 'specNumber', "header": 'Specification No.', cell: (element: any) => `${element.specNumber}` , width: 'maxWidth-25per' })
            headersData.push({ "columnDef": 'planCode', "header": "Plan Ref. No.", cell: (element: any) => `${element.planCode}` , width: 'maxWidth-25per' });
            headersData.push({ "columnDef": 'assignBy', "header": "Assigned By", cell: (element: any) => `${element.assignBy}` , width: 'maxWidth-20per' });
            headersData.push({ "columnDef": 'assignOn', "header": "Assigned On", cell: (element: any) => `${element.assignOn}`, width: 'maxWidth-20per' });
        }
        else if (activity == 'Samples Analysis') {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per'});
            headersData.push({ "columnDef": 'arNum', "header": "AR Number", cell: (element: any) => `${element.arNum}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'testTitle', "header": "Test Title", cell: (element: any) => `${element.testTitle}` , width: 'maxWidth-30per'});
            headersData.push({ "columnDef": 'planCode', "header": "Plan Ref. No.", cell: (element: any) => `${element.planCode}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'assignBy', "header": "Assigned By", cell: (element: any) => `${element.assignBy}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'assignOn', "header": "Assigned On", cell: (element: any) => `${element.assignOn}` , width: 'maxWidth-15per'});
        }
        else if (activity == 'Manual Activity') {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'activityDesc', "header": "Activity Description", cell: (element: any) => `${element.activityDesc}` , width: 'maxWidth-25per' });
            headersData.push({ "columnDef": 'planCode', "header": "Plan Ref. No.", cell: (element: any) => `${element.planCode}` , width: 'maxWidth-25per' });
            headersData.push({ "columnDef": 'assignBy', "header": "Assigned By", cell: (element: any) => `${element.assignBy}` , width: 'maxWidth-25per' });
            headersData.push({ "columnDef": 'assignOn', "header": "Assigned On", cell: (element: any) => `${element.assignOn}` , width: 'maxWidth-25per' });
        }
        else if (activity == "Invalidations") {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'testTitle', "header": "Invalidation Number", cell: (element: any) => `${element.testTitle}`  , width: 'maxWidth-20per'});
            headersData.push({ "columnDef": 'planCode', "header": "Plan Ref. Number", cell: (element: any) => `${element.planCode}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'inalidationDate', "header": "Invalidation Date", cell: (element: any) => `${element.inalidationDate}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'material', "header": "Product / Material Name", cell: (element: any) => `${element.material}` , width: 'maxWidth-40per'});
        }
        else if (activity == "Calibrations") {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per'});
            headersData.push({ "columnDef": 'mntReportCode', "header": " Reference Number", cell: (element: any) => `${element.mntReportCode}`, width: 'maxWidth-15per' });
            headersData.push({ "columnDef": 'instNumber', "header": "Instrument ID", cell: (element: any) => `${element.instNumber}`  , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'instType', "header": "Instrument Type", cell: (element: any) => `${element.instType}`, width: 'maxWidth-20per' });
            headersData.push({ "columnDef": 'testTitle', "header": "Parameter Name", cell: (element: any) => `${element.testTitle}` , width: 'maxWidth-30per'});
            headersData.push({ "columnDef": 'schDate', "header": "Schedule Date", cell: (element: any) => `${element.schDate}`, width: 'maxWidth-15per' });
        }
        else if (activity == "Preventive Maintenance") {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`  , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'instNumber', "header": "Instrument Number", cell: (element: any) => `${element.instNumber}`  });
            headersData.push({ "columnDef": 'mntReportCode', "header": "Calibration Ref. Number", cell: (element: any) => `${element.mntReportCode}` });
            headersData.push({ "columnDef": 'instType', "header": "Instrument Type", cell: (element: any) => `${element.instType}` });
            headersData.push({ "columnDef": 'schDate', "header": "Schedule Due Date", cell: (element: any) => `${element.schDate}` , width: 'maxWidth-20per'  });
        }
        else if (activity == "Out of Specification"){
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`  , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'referenceNumber', "header": "OOS Number", cell: (element: any) => `${element.referenceNumber}`  , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'arNum', "header": "AR Number", cell: (element: any) => `${element.arNum}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'batchNumber', "header": "Batch Number", cell: (element: any) => `${element.batchNumber}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'material', "header": "Product / Material Name", cell: (element: any) => `${element.material}` , width: 'maxWidth-40per'});
            headersData.push({ "columnDef": 'testTitle', "header": "Test Title", cell: (element: any) => `${element.testTitle}` , width: 'maxWidth-30per'});
        }
        else if (activity == "Data Review") {
            headersData.push({ "columnDef": 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}` , width: 'maxWidth-7per' });
            headersData.push({ "columnDef": 'referenceNumber', "header": "Reference Number", cell: (element: any) => `${element.referenceNumber}`  , width: 'maxWidth-20per'});
            headersData.push({ "columnDef": 'planCode', "header": "Plan Ref. Number", cell: (element: any) => `${element.planCode}` , width: 'maxWidth-15per'});
            headersData.push({ "columnDef": 'test', "header": "Test / Parameter Name", cell: (element: any) => `${element.activityDesc}` , width: 'maxWidth-40per'});
            headersData.push({ "columnDef": 'material', "header": "Product / Material Name", cell: (element: any) => `${element.material}` , width: 'maxWidth-40per'});
            headersData.push({ "columnDef": 'reviewDate', "header": "Date of Send for Review", cell: (element: any) => `${element.reviewDate}` , width: 'maxWidth-25per' });
        }
        return headersData;
    }

    close() {
        this._matDailogRef.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}