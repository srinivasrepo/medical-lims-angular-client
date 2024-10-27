import { Component, Input } from "@angular/core";
import { Subscription } from 'rxjs';
import { AuditService } from '../services/audit.service';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { MatDialogRef, MatTableDataSource } from '@angular/material';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'ams-view',
    templateUrl: '../html/viewAuditTrail.html'
})

export class ViewAuditTrailComponent {

    @Input() auditID: string = "";
    collap_icon: string = "+";
    collap_class: string = 'row collap-none';
    pageTitle: string = "";
    dataSourceData: any = [];
    dataSourceInfo: any = [];
    subscription: Subscription = new Subscription();
    filterType: string = 'More Data';
    displayedColumns: string[] = ['Column', 'Old Data', 'New Data'];

    btnfilter: any = true;
    defaultID: number = 0;  // initial defaultID is 0 After click button of filterType then assign to corresponding value ID 
    elementID: string;
    dataSource: any;

    constructor(private _atsServ: AuditService, private _actModal: MatDialogRef<ViewAuditTrailComponent>,
        public _global: GlobalButtonIconsService
    ) {
        this.pageTitle = PageTitle.viewAudit;
    }

    ngAfterViewInit() {
        this.subscription = this._atsServ.auditSubject.subscribe(resp => {
            if (resp.purpose == "viewAuditTableData") {
                this.dataSourceInfo = resp.result;
            }
            else if (resp.purpose == "getAuditColumnsByTableID") {
                this.dataSourceData = resp.result;
                this.dataSource = new MatTableDataSource(this.dataSourceData);
            }
        })

        this._atsServ.viewAuditTableData(this.auditID);
    }


    convertTableName(value: string) {
        var dot = value.split('.');
        if (dot.length > 1) {
            var splitted = dot[1].split('_');
            value = "";
            for (let i = 0; i < splitted.length; i++) {
                value += splitted[i].charAt(0).toUpperCase() + splitted[i].slice(1).toLowerCase() + ' ';
            }
        }

        return value;
    }

    closeModal() {
        this._actModal.close();
    }

    formatString(data: string) {
        return CommonMethods.FormatValueString(data);
    }

    expandCollap(id: string, hid: string, bid: string) {

        var collapID = document.getElementById('collapID');
        var container = collapID.getElementsByClassName('collap');

        for (var i = 0; i < container.length; i++) {
            if (hid != 'n' + i) {
                var icon = document.getElementById('n' + i)
                icon.innerText = '+';
                var b_id = document.getElementById('b' + i)
                b_id.className = 'row collap-none';
            }
        }

        var ids = document.getElementById(hid);
        var bodyid = document.getElementById(bid);
        if (ids.innerText == '+') {
            ids.innerText = '-';
            bodyid.className = "row collap-body";
            this._atsServ.getAuditColumnsByTableID(id);
        } else {
            ids.innerText = '+';
            bodyid.className = "row collap-none";
        }

    }


    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}