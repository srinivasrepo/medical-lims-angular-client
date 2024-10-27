import { Component, Input, Type, AfterContentInit, OnDestroy, OnChanges } from '@angular/core'
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ViewHistoryComponent } from '../../common/component/viewHistory.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { EntityCodes, CapabilityActions } from 'src/app/common/services/utilities/constants';
import { RS232IntegrationModeService } from 'src/app/common/services/rs232IntegrationMode.service';
import { RS232IntegrationBO } from 'src/app/common/services/utilities/commonModels';
import { Subscription } from 'rxjs';
import { CommonMethods, CustomLocalStorage, LOCALSTORAGE_KEYS, LOCALSTORAGE_VALUES } from 'src/app/common/services/utilities/commonmethods';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';


@Component({
    selector: 'page-head',
    templateUrl: '../html/pageHeader.html'
})

export class pageHeaderComponent implements AfterContentInit, OnChanges, OnDestroy {

    @Input() pageTitle: string;
    @Input() status: string;
    @Input() refNo: string;
    @Input() viewHistoryVisible: boolean;
    @Input() viewHistory: any;
    @Input() viewBack: boolean;
    @Input() backUrl: string = '/medicallims/home';
    @Input() advanceSeachID = "";
    @Input() encEntityActID: string;
    @Input() entityCode: string;
    @Input() showRpts: boolean;
    @Input() encRptEntActID: string;


    reqCode: string = 'ON';

    obj: RS232IntegrationBO = new RS232IntegrationBO();

    subscription: Subscription = new Subscription();

    constructor(private _openModal: MatDialog, private router: Router, public _global: GlobalButtonIconsService, private _context: LIMSContextServices, private _rsMode: RS232IntegrationModeService) { }

    ngAfterContentInit() {

        if (this.encEntityActID)
            this.manageRS232Status('GET');

        // this.subscription = this._rsMode.subject.subscribe(resp => {
        //     if (resp.purpose == "manageRS232Status") {
        //         if (this.obj.type == 'GET')
        //             this.reqCode = !resp.result ? this.reqCode : resp.result;
        //         else if (this.obj.type != 'GET')
        //             this.reqCode = this.obj.reqCode;
        //     }
        // })
        if (!CommonMethods.hasValue(this.encRptEntActID) && this.showRpts)
            this.encRptEntActID = this.encEntityActID;
    }



    ngOnChanges() {
        if (this.encEntityActID) {
            this.obj = new RS232IntegrationBO();
            this.manageRS232Status('GET');
        }

    }

    view() {
        const modal = this._openModal.open(ViewHistoryComponent, { minWidth: "50%" });
        modal.disableClose = true;
        modal.componentInstance.showTitle = true;
        modal.componentInstance.obj = this.viewHistory;
    }

    back() {
        localStorage.removeItem('SAM_PAGE');
        localStorage.removeItem('CALIB_PAGE');
        this.router.navigateByUrl(this.backUrl);
    }

    advancedSearch() {

    }


    toggleRS232Status() {
        this.manageRS232Status('MNG', true);
    }

    getRSIntegrationStatus() {

        if ((CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_ANALYSIS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CON_WISE" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_CALIB"
            || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_SPEC_VALID" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_HYPO" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.RS232_SECTION_MODE) == "RS232_OOS_TEST")
            && (CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "CALIB_ARDS" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "SAMPLE_ANALYSIS"
            || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "SPEC_VALID" || CustomLocalStorage.getItem(LOCALSTORAGE_KEYS.conditionCode) == "OOS_APP"))
            return false;

        return this._rsMode.getRSIntegrationStatus() && this.encEntityActID;
    }

    getRSIntegrationReqStatus() {
        return this._rsMode.getRSIntegrationReqStatus();
    }

    manageRS232Status(type: string, isClicked: boolean = false) {
        this.obj.encEntityActID = this.encEntityActID;
        this.obj.type = type;
        this.obj.isClicked = isClicked;
        this._rsMode.manageRS232Status(this.obj);
    }

    reports() {
        const modal = this._openModal.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.mode = "VIEW";
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, "REPORT", this.encRptEntActID);
        modal.componentInstance.isShowCumulativeRpt = (this.entityCode == EntityCodes.sampleAnalysis || this.entityCode == EntityCodes.calibrationArds || this.entityCode == EntityCodes.oosModule);
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}