import { Component } from "@angular/core";
import { AuditService } from '../services/audit.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { Subscription } from 'rxjs';
import { ManageTables, ManageAudObj } from '../modal/auditMOdal';
import { CommonMethods } from '../../common/services/utilities/commonmethods';
import { AuditMessage } from '../message/auditMessage';
import { ActionMessages, PageUrls, ButtonActions } from '../../common/services/utilities/constants';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { AlertService } from '../../common/services/alert.service';

@Component({
    selector: 'lims-mngTab',
    templateUrl: '../html/manageTables.html'
})

export class ManageTablesComponent {
    ddlType: string = "";
    ddlTableID: number = 0;
    btnBool: boolean = false;
    btnGOText: string = ButtonActions.btnGo;
    tablesList: Array<any> = [];
    ddltableList: Array<any> = [];
    subscription: Subscription = new Subscription();
    pageTitle: string;
    backUrl: string = PageUrls.searchAudTrail;

    constructor(
        private _limsContext: LIMSContextServices, private _audServi: AuditService,
        private _router: Router, private _notify: AlertService
    ) {
        this.pageTitle = PageTitle.manageTables;
    }

    ngAfterViewInit() {
        this.subscription = this._audServi.auditSubject.subscribe(resp => {
            if (resp.purpose == "getAllTables") {
                if (this.ddlType == 'tab' || CommonMethods.hasValue(this.ddlTableID)) {
                    this.tablesList = resp.result;
                } else if (this.ddlType == 'col')
                    this.ddltableList = resp.result;
            }
            else if (resp.purpose == "manageDBObjects") {
                if (resp.result == "OK") {
                    this._notify.success(ActionMessages.GetMessageByCode(resp.result));
                    this._router.navigate([PageUrls.searchAudTrail]);
                }
            }

        })
    }

    changeType() {
        this.ddlTableID = 0;
        this.clear();

        if (CommonMethods.hasValue(this.ddlType) && this.ddlType != 'tab')
            this._audServi.getAllTables();
    }

    go() {

        if (!CommonMethods.hasValue(this.ddlType))
            return this._notify.warning(AuditMessage.type);
        else if (this.ddlTableID == 0 && this.ddlType == 'col')
            return this._notify.warning(AuditMessage.table);

        this.clear();

        if (this.btnGOText == ButtonActions.btnChange)
            return this.btnGOText = ButtonActions.btnGo;

        this.btnBool = true;
        this.btnGOText = ButtonActions.btnChange;

        this._audServi.getAllTables(this.ddlTableID); // get columns by tableid
    }

    manageTableData() {
        var list = new Array<ManageAudObj>();
        list = this.tablesList;
        var obj = new ManageTables();
        obj.tableID = this.ddlTableID;
        obj.list = list;

        this._audServi.manageDBObjects(obj);
    }

    clear() {
        this.btnBool = false;
        this.tablesList = [];
    }

    // back() {
    //     this._router.navigate(['/ams/audit']);
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}