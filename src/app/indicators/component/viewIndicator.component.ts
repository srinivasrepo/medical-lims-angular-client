import { Component } from "@angular/core";
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { PageUrls, EntityCodes, GridActions } from '../../common/services/utilities/constants';
import { IndicatorsService } from '../service/indicators.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonMethods, dateParserFormatter } from '../../common/services/utilities/commonmethods';
import { MatDialog } from '@angular/material';
import { UploadFiles } from '../../UtilUploads/component/upload.component';
import { PrepareOccupancyBO } from '../../common/services/utilities/commonModels';
import { ManageOccupancyComponent } from '../../common/component/manageOccupancy.component';
import { TransHistoryBo } from '../../approvalProcess/models/Approval.model';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';

@Component({
    selector: 'ind-view',
    templateUrl: '../html/viewIndicator.html'
})

export class ViewIndicatorComponent {
    pageTitle: string = PageTitle.viewIndicators;
    backUrl: string = PageUrls.searchIndicator;
    indicatorInfo: any = {};
    headerData: any;
    dataSource: any;
    action: any = [GridActions.MNG_OCC];
    encIndicatorID: string;
    subscription: Subscription = new Subscription();
    viewHistory: any;
    status: string;
    refNo: string;
    useBefore: any;
    removeActions: any = { headerName: 'Solvents' };
    sourceType: string = "TEST_SOL_INDICATOR";
    entityCode : string = EntityCodes.indicators;

    constructor(private _indService: IndicatorsService, private _actrouter: ActivatedRoute,
        private _matDailog: MatDialog, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this._actrouter.queryParams.subscribe(param => this.encIndicatorID = param['id']);
        this.subscription = this._indService.indicatorsSubject.subscribe(resp => {
            if (resp.purpose == "viewIndicatorInfo") {
                this.prepareHeaders();
                this.indicatorInfo = resp.result;
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.solventList, 'arrayDateTimeFormat', 'useBeforeDate')));
                this.status = resp.result.status;
                this.refNo = resp.result.indicatorCode;
                this.useBefore = dateParserFormatter.FormatDate(this.indicatorInfo.useBefore, 'datetime');
            }
        });

        this._indService.viewIndicatorInfo(this.encIndicatorID);
        this.tranHistory();
    }

    prepareHeaders() {
        this.headerData = [];
        this.headerData.push({ columnDef: 'sno', "header": "S.No.", cell: (element: any) => `${element.sno}`, width: 'maxWidth-4per' });
        // this.headerData.push({ columnDef: 'chemicalType', "header": "Reagent Type", cell: (element: any) => `${element.chemicalType}`, width: 'minWidth-20per' });
        this.headerData.push({ columnDef: 'materialCode', "header": 'Chemical Code', cell: (element: any) => `${element.materialCode}`, width: 'maxWidth-10per' });
        this.headerData.push({ columnDef: 'materialName', "header": "Chemical", cell: (element: any) => `${element.materialName}`, width: 'minWidth-30per' });
        // this.headerData.push({ columnDef: 'batchNumber', "header": "Batch No.", cell: (element: any) => `${element.batchNumber}`, width: 'maxwidth-15per' });
        this.headerData.push({ columnDef: 'packBatchNumber', "header": "Batch No.(Pack No.)", cell: (element: any) => `${element.packBatchNumber}`, width: 'maxWidth-11per' });
        this.headerData.push({ columnDef: 'equipmentUserCodes', "header": "Instrument ID(s)", cell: (element: any) => `${element.equipmentUserCodes}`, width: 'maxWidth-15per' });
        this.headerData.push({ columnDef: 'validity', "header": "Valid Up to ", cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-15per' });
        this.headerData.push({ columnDef: 'quantity', "header": "Quantity Taken", cell: (element: any) => `${element.quantity}`, width: 'maxwidth-10per' });
        this.headerData.push({ columnDef: 'denomination', "header": "Conversion Factor", cell: (element: any) => `${element.denomination}`, width: 'maxWidth-15per' });
    }

    Uploadfiles(section: string) {
        const modal = this._matDailog.open(UploadFiles);
        modal.disableClose = true;
        modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.indicators, 0, section, this.encIndicatorID, [], 'MEDICAL_LIMS');
        modal.componentInstance.mode = 'VIEW';
    }

    onActionClicked(evt) {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.batchNumber = evt.val.batchNumber;
        obj.encEntityActID = evt.val.preparationID;
        obj.occSource = 'INDIC_PRE_BATCH';
        obj.invID = evt.val.invID;

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
        modal.componentInstance.condition = 'TYPE_CODE = \'ANALYTICAL BALANCE\' AND EQP_CAT_CODE =\'QCINST_TYPE\'';
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encIndicatorID;
        obj.code = 'INDICATOR';
        this.viewHistory = obj;
    }

    viewOccupancy() {
        var obj: PrepareOccupancyBO = new PrepareOccupancyBO();
        obj.occupancyCode = 'EQP_WEIGHING';
        obj.encEntityActID = this.encIndicatorID;
        obj.occSource = 'INDIC_OTH_OCC';
        obj.conditionCode = "INDICATOR";
        obj.occSourceName = "Preparation / Output";

        const modal = this._matDailog.open(ManageOccupancyComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.occupancyBO = obj;
        modal.componentInstance.pageType = 'VIEW';
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}