import { Component } from '@angular/core';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, EntityCodes } from 'src/app/common/services/utilities/constants';
import { Subscription } from 'rxjs';
import { InvalidationsService } from '../service/invalidations.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { checklistComponent } from 'src/app/common/component/checklist.component';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GetPreviousInvalidationsComponent } from './getPreviousInvalidations.component';

@Component({
    selector: 'view-inv',
    templateUrl: '../html/viewInvalidations.html'
})

export class viewInvalidationsComponent {

    pageTitle: string = PageTitle.viewInvalidations;
    backUrl: string = PageUrls.searchInv;
    subscription: Subscription = new Subscription();
    encInvalidationID: string;
    result: any = [];
    status: string;
    refNo: string
    viewHistory: any;
    testType: string = "Name of the"
    entityCode: string = EntityCodes.invalidations;

    constructor(private invalidationService: InvalidationsService, private _matDailog: MatDialog,
        private actRoute: ActivatedRoute, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.actRoute.queryParams.subscribe(param => this.encInvalidationID = param['id']);
        this.subscription = this.invalidationService.invalidationsSubject.subscribe(resp => {
            if (resp.purpose == "getInvalidationData") {
                this.result = resp.result;
                this.status = resp.result.status;
                this.refNo = resp.result.invalidationNumber;
                if (resp.result.entitySource == 'INVAL_SAMANA')
                    this.testType = 'Sample Analysis Test';
                else if (resp.result.entitySource == 'INVAL_CALIB')
                    this.testType = 'Parameter Name';
                else if (resp.result.entitySource == 'INVAL_OOS')
                    this.testType = 'Test Name';
                else this.testType = 'Solution Name'
            }
        });

        this.invalidationService.getInvalidationData(this.encInvalidationID);
        this.tranHistory();
    }

    viewCheckList() {
        const modal = this._matDailog.open(checklistComponent, { width: '800px' });
        modal.disableClose = true;
        modal.componentInstance.encEntityActID = this.encInvalidationID;
        modal.componentInstance.categoryCode = 'INVALID_CHECKLIST';
        modal.componentInstance.type = 'VIEW';
        modal.componentInstance.entityCode = EntityCodes.invalidations;
    }

    formatValueString(val) {
        return CommonMethods.FormatValueString(val);
    }

    tranHistory() {

        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encInvalidationID;
        obj.code = 'INVALID_ATIONS';
        this.viewHistory = obj;
    }

    getPreviousInvalidations() {
        const modal = this._matDailog.open(GetPreviousInvalidationsComponent, { width: '75%' });
        modal.componentInstance.encInvalidationID = this.encInvalidationID;
        modal.disableClose = true;
    }

    uploadFiles(type: string) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.invalidations, 0, type, this.encInvalidationID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = "VIEW";
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}