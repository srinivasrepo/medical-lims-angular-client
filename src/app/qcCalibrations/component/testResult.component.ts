import { Component, AfterContentInit, OnDestroy } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-testResult',
    templateUrl: '../html/testResult.html'
})
export class QCCalibTestResultComponent implements AfterContentInit, OnDestroy {

    encSpecCatID: string;
    dataSource: any;
    headersData: any;

    subscription: Subscription = new Subscription();

    constructor(private _service: QCCalibrationsService, public _global: GlobalButtonIconsService,
        private _matDailogRef: MatDialogRef<QCCalibTestResultComponent>
    ) { }


    ngAfterContentInit() {
        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "getTestResultByID") {
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);
            }

        })

        this._service.getTestResultByID(this.encSpecCatID);
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'resultName', "header": "Description", cell: (element: any) => `${element.resultName}` });
        this.headersData.push({ "columnDef": 'result', "header": "Result", cell: (element: any) => `${element.result}` });
    }

    close() {
        this._matDailogRef.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}