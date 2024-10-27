import { Component, OnInit } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, GridActions } from 'src/app/common/services/utilities/constants';
import { ManageMasterService } from '../services/manageMaster.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { Subscription } from 'rxjs';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { MatDialog, MatDialogRef } from '@angular/material';
import { OptionComponent } from './option.component';

@Component({
    selector: 'sys-con',
    templateUrl: '../html/sysConfiguration.html'
})

export class SysConfigurationComponent {

    pageTitle: string = PageTitle.sysConfig;
    backUrl: string = PageUrls.homeUrl;
    headersData: any;
    dataSource: any = [];
    actions: any = [GridActions.edit]

    subscription: Subscription = new Subscription();

    constructor(private _catService: ManageMasterService, private _alert: AlertService,
        private _dialog: MatDialog) { }

    ngAfterViewInit() {
        this.subscription = this._catService.mngMasterSubject.subscribe(resp => {
            if (resp.purpose == "getSysConfigurationData") 
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result);
        })

        this.prepareHeaders();
        this._catService.getSysConfigurationData();
    }

    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ "columnDef": 'description', "header": "Description", cell: (element: any) => `${element.description}` });
        this.headersData.push({ "columnDef": 'configValue', "header": "Configuration Value", cell: (element: any) => `${element.configValue}` });
    }

    onActionCLicked(evt) {
        const modelRef = this._dialog.open(OptionComponent, {
            width: "1000px"
        });
        modelRef.componentInstance.encConfigID = evt.val.encConfigID;
        modelRef.componentInstance.title = evt.val.description;
        modelRef.componentInstance.option = evt.val.options;
        modelRef.componentInstance.dataType = evt.val.dataType;
        return modelRef.afterClosed().subscribe(resp => {
            if (resp == 'OK')
                this._catService.getSysConfigurationData();
        });
    }

    // close() {
    //     this._closeModal.close();
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}