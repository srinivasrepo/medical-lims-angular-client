import { Component, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { MatDialogRef } from '@angular/material';
import { CommonService } from '../services/commonServices';
import { PageTitle } from '../services/utilities/pagetitle';
import { dateParserFormatter, CommonMethods } from '../services/utilities/commonmethods';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'view-his',
    templateUrl: '../html/viewHistory.html'
})

export class ViewHistoryComponent {

    @Input('obj') obj: any = {};
    @Input('type') type: string = 'VIEW';
    //headerData: any = [];
    dataSource: any;
    title: string = PageTitle.viewHistory;
    subscription: Subscription = new Subscription();
    showTitle: boolean = false;
    displayedColumns: string[] = [];

    constructor(private _closeModel: MatDialogRef<ViewHistoryComponent>, private _utilService: CommonService,
        public _global: GlobalButtonIconsService) {
    }

    ngAfterViewInit() {
        this.subscription = this._utilService.commonSubject.subscribe(resp => {
            if (resp.purpose == "ViewHistory") {
                // this.prepareHeaders();
                this.dataSource = dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'actionDate');
                // this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
                //this.displayedColumns = this.headerData.map(c => c.columnDef);
            }
        })

        this._utilService.ViewHistory(this.obj.id, this.obj.code);
    }

    // prepareHeaders() {
    //     this.headerData = [];
    //     this.headerData.push({ "columnDef": 'actionResult', "header": "Action Taken", cell: (element: any) => `${element.actionResult}`, width: 'maxWidth-15per' });
    //     this.headerData.push({ "columnDef": 'actionDate', "header": "Action Date", cell: (element: any) => `${element.actionDate}`, width: 'maxWidth-20per' });
    //     this.headerData.push({ "columnDef": 'userName', "header": "Action By", cell: (element: any) => `${element.userName}`, width: 'maxWidth-15per' });
    //     // this.headerData.push({ "columnDef": 'deptName', "header": "Dept Name", cell: (element: any) => `${element.deptName}`, width: 'maxWidth-15per' });
    //     this.headerData.push({ "columnDef": 'appLevel', "header": "App Level", cell: (element: any) => `${element.appLevel}`, width: 'maxWidth-10per' });
    //     this.headerData.push({ "columnDef": 'actionRemarks', "header": "Action Remarks", cell: (element: any) => `${element.actionRemarks}`, width: 'minWidth-10per' });
    //     // this.headerData.push({ "columnDef": 'roleName', "header": "Role Name", cell: (element: any) => `${element.roleName}`, width: 'maxWidth-20per' });
    // }

    close() {
        this._closeModel.close();
    }

    formatString(val) {
        return CommonMethods.FormatValueString(val)
    }

    getClass(code) {
        var cls = "";
        if (code == "APP" || code == "CLS")
            cls = "action-app"
        else if (code == "CAN")
            cls = "action-can"
        else if (code == "REJ")
            cls = "action-rej"
        else if (code == "DISC")
            cls = "action-disc"
        return cls;
    }

    getToolTipData(val: any) {
        return val.actionRemarks;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}