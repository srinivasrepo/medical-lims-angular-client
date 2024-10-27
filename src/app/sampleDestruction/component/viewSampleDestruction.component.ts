import { Component } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { EntityCodes, PageUrls } from 'src/app/common/services/utilities/constants';
import { Subscription } from 'rxjs';
import { SampleDestructionService } from '../service/sampleDestruction.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { ViewSampleDestructionModel } from '../model/sampleDestructionModel';
import { ActivatedRoute } from '@angular/router';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';

@Component({
    selector: 'view-sample-destruction',
    templateUrl: '../html/viewsampleDestruction.html'
})

export class ViewSampleDestructionComponent {

    pageTitle: string = PageTitle.viewSampleDestruction;
    backUrl: string = PageUrls.searchSampleDestruction;
    headers: Array<any> = [];
    dataSource: any = [];
    encDestructionID: string;
    viewSampleDestructionObj: ViewSampleDestructionModel = new ViewSampleDestructionModel();
    viewHistory: any;
    entityCode: string = EntityCodes.sampleDestruction;
    subscription: Subscription = new Subscription();

    constructor(private _viewSampleDestruction: SampleDestructionService, private _activatedRoute: ActivatedRoute) { }

    ngAfterViewInit() {
        this._activatedRoute.queryParams.subscribe(params => this.encDestructionID = params["id"]);

        this.subscription = this._viewSampleDestruction.sampleDestructionSubject.subscribe(resp => {
            if (resp.purpose == "getSampleDestructionDetailsForView") {
                this.viewSampleDestructionObj = resp.result.destructions;
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.destructionContainerList, "arrayDateTimeFormat", 'requestRaisedOn'));
                var obj: TransHistoryBo = new TransHistoryBo();
                obj.id = this.encDestructionID;
                obj.code = 'SAMPLE_DESTRUCTION';
                this.viewHistory = obj;
            }
        })
        this._viewSampleDestruction.getSampleDestructionDetailsForView(this.encDestructionID);
        this.prepareHeaders();
    }

    prepareHeaders() {
        this.headers.push({ "columnDef": 'requestRaisedOn', "header": "Date", cell: (element: any) => `${element.requestRaisedOn}`, width: 'maxWidth-11per' })
        this.headers.push({ "columnDef": 'sampleSource', "header": "Source", cell: (element: any) => `${element.sampleSource}`, width: 'maxWidth-10per' })
        this.headers.push({ "columnDef": 'chemicalName', "header": "Chemical/Solution Name", cell: (element: any) => `${element.chemicalName}`, width: 'maxWidth-40per' })
        this.headers.push({ "columnDef": 'batchNumber', "header": "Batch (Pack No.)", cell: (element: any) => `${element.batchNumber}`, width: 'maxWidth-15per' })
        this.headers.push({ "columnDef": 'sourceReferenceNumber', "header": "System Code", cell: (element: any) => `${element.sourceReferenceNumber}`, width: 'maxWidth-15per' })
        this.headers.push({ "columnDef": 'destructionQuantity', "header": "Quantity", cell: (element: any) => `${element.destructionQuantity}`, width: 'maxWidth-10per' })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}