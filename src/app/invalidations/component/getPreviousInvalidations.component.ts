import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { InvalidationsService } from '../service/invalidations.service';
import { Subscription } from 'rxjs';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';

@Component({
    selector: 'get-pre',
    templateUrl: '../html/getPreviousInvalidations.html'
})

export class GetPreviousInvalidationsComponent {

    pageTitle : string = PageTitle.getPreviousInvalidations;

    headersData : any=[];
    dataSource : any=[];

    @Input('encInvalidationID') encInvalidationID: string;

    subscription: Subscription = new Subscription();

    constructor(private _matDailog: MatDialog, private _closeModel: MatDialogRef<GetPreviousInvalidationsComponent>,
        private _invalidationService: InvalidationsService, public _global: GlobalButtonIconsService) { }

    ngAfterViewInit() {
        this.subscription = this._invalidationService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "getPreviousInvalidations") {
                this.dataSource = CommonMethods.bindMaterialGridData( resp.result);
            }
        })
        this.prepareHeaders();
        this._invalidationService.getPreviousInvalidations(this.encInvalidationID);
    }


    prepareHeaders(){
        this.headersData.push({ "columnDef": 'invalidationCode', "header": "Invalidation Number", cell: (element: any) => `${element.invalidationCode}` });
        this.headersData.push({ "columnDef": 'systemCode', "header": "System Code", cell: (element: any) => `${element.systemCode}`});
        this.headersData.push({ "columnDef": 'impactType', "header": "Impact Type", cell: (element: any) => `${element.impactType}` });
        this.headersData.push({ "columnDef": 'instrumentType', "header": "Instrument Type", cell: (element: any) => `${element.instrumentType}` });
    }

    close() {
        this._closeModel.close();
    }

    ngOnDestroy(){
        this.subscription.unsubscribe();
    }
}