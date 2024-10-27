import { Component } from "@angular/core";
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { MatDialogRef } from '@angular/material';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';

@Component({
    selector: 'app-reservations',
    templateUrl: '../html/qcInventoryReservations.html'
})
export class QCInvReservationsComponent {

    encPackInvID: string;
    dataSource: any;
    headersData: any;

    subscription: Subscription = new Subscription();

    constructor(private _service: QCInventoryService, public _global: GlobalButtonIconsService,
        private _matDailogRef: MatDialogRef<QCInvReservationsComponent>
    ) { }

    ngAfterViewInit() {
        this.subscription = this._service.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "getPackInvReserDetails") {
                this.prepareHeaders()
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result, 'arrayDateTimeFormat', 'reservedOn'));
            }
        })

        this._service.getPackInvReserDetails(this.encPackInvID);
    }

    prepareHeaders() {
        this.headersData = [];

        this.headersData.push({ columnDef: "preparationSource", header: "Source", cell: (element: any) => `${element.preparationSource}` });
        this.headersData.push({ columnDef: "referenceCode", header: "Batch/ Ref. Number", cell: (element: any) => `${element.referenceCode}` });
        this.headersData.push({ columnDef: "prepQntyUOM", header: "Reserved Quantity (UOM)", cell: (element: any) => `${element.prepQntyUOM}` });
        this.headersData.push({ columnDef: 'reservedOn', header: 'Reserved On', cell: (element: any) => `${element.reservedOn}` });

    }

    close() {
        this._matDailogRef.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}