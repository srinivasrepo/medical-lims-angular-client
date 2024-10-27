import { Component, ViewChild } from "@angular/core";
import { Subscription } from 'rxjs';
import { VolumetricSolService } from '../service/volumetricSol.service';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { PageUrls, EntityCodes } from '../../common/services/utilities/constants';
import { ActivatedRoute } from '@angular/router';
import { CommonMethods, dateParserFormatter } from '../../common/services/utilities/commonmethods';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { MatTabGroup, MatDialog } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { PrepareOccupancyBO } from 'src/app/common/services/utilities/commonModels';
import { ManageOccupancyComponent } from 'src/app/common/component/manageOccupancy.component';

@Component({
    selector: 'vol-view',
    templateUrl: '../html/viewVolumetricSol.html'
})

export class ViewVolumetricSolutionComponent {

    @ViewChild('tabGroup', { static: true }) tabGroup: MatTabGroup

    encSolutionID: string;
    volSolInfo: any = {};

    pageTitle: string = PageTitle.viewSolu;
    backUrl: string = PageUrls.volmetricSol;
    viewHistory: any;
    status: string;
    refNo: string;
    sourceType: string = 'VOLSOL_PREP';
    entityCode: string = EntityCodes.volumetricSol;
    dataSourcePrep: any;
    viewHistoryVisible: boolean = true;

    subscription: Subscription = new Subscription();
    batchNumber: string;
    invID: number;

    constructor(private _service: VolumetricSolService, private _actRouter: ActivatedRoute,
        private _matDailog: MatDialog, public _global:GlobalButtonIconsService) {

    }

    ngAfterContentInit() {
        this._actRouter.queryParams.subscribe(param => this.encSolutionID = param['id']);
        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getVolumetricSolutionByID") {
                this.volSolInfo = resp.result;
                // this.solutionRefCode = resp.result.solutionCode;
                // this.molecularWeight = resp.result.molecularWeight;
                // this.formulaType = resp.result.formulaType;
                // this.briefDescription = resp.result.briefDescription;
                this.status = resp.result.status;
                this.refNo = resp.result.solutionRefCode;
                this.dataSourcePrep = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'useBeforeDate')));
                // this.appBO = resp.result.act;
                // this.enableControls(false);

            }
        })

        this._service.getVolumetricSolutionByID(this.encSolutionID);
        this.tranHistory('VOLSOL_PREP');
    }


    tranHistory(type: string) {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encSolutionID;
        obj.code = type;
        this.viewHistory = obj;
    }

    changeTrans() {
        if (this.tabGroup.selectedIndex == 0) {
            this.tranHistory('VOLSOL_PREP')
            this.viewHistoryVisible = true;
        }
        else
            this.viewHistoryVisible = false;
    }

    Uploadfiles() {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.volumetricSol, 0, 'VOL_REQ', this.encSolutionID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
        modal.afterClosed().subscribe((resu) => { })
    }

    
    addOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = this.batchNumber;
        obj.invID = this.invID;
        obj.encEntityActID = this.encSolutionID;
        obj.occSource = 'VOLPREP_OCC';
        obj.occSourceName= "Preparation"

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.occReqDispaly = true;
        modal.componentInstance.pageType =  'VIEW';
        modal.componentInstance.isAppPrimaryOcc = false;

        modal.componentInstance.condition = 'EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    ngOnDetroy() {
        this.subscription.unsubscribe();
    }

}