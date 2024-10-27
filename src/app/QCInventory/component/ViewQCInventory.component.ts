import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { PageUrls, GridActions, EntityCodes } from 'src/app/common/services/utilities/constants';
import { MatDialog, MatDialogRef } from '@angular/material';
import { OpenPackComponent } from './openPack.component';
import { GetPackDetailsBO } from '../model/QCInventorymodel';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { ManageMiscConsumptionComponent } from './manageMiscConsumption.component';
import { CommentsBO } from 'src/app/mobilePhase/model/mobilePhaseModel';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { addCommentComponent } from 'src/app/common/component/addComment.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { AlertService } from 'src/app/common/services/alert.service';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { QCInvReservationsComponent } from './qcInventoryReservations.component';
import { GridActionFilterBOList } from 'src/app/limsHelpers/entity/limsGrid';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';

@Component({
    selector: 'view-qcinventory',
    templateUrl: '../html/ViewQCInventory.html',
})

export class ViewQCInventoryComponent {
    encObj: GetPackDetailsBO = new GetPackDetailsBO();
    isFrom: string
    dataSource: any;
    headerData: any;
    actions: any = [GridActions.open, GridActions.canConsume, GridActions.block, GridActions.NotIssued, GridActions.PDF];
    removeAction: any = { headerName: 'canOpen', OPEN: true, CANCONSUME: true, BLOCK: 'statusCode' };
    manfDate: any;
    expiryDate: any;
    invDate: any;
    pageTitle: string = PageTitle.viewInventoryDetails;
    backUrl: string = PageUrls.searchQcInvtUrl;
    status: string;
    refNo: string;
    baseUom: string;
    uom: string;
    encInvSourceID: string;
    viewHistory: any;
    displayActionField: boolean = true;
    solventStatusCode: string;
    categoryCode: string;
    entityCode: string = EntityCodes.qcInventory;
    packInvID: string;
    subCategoryCode : string;

    subscription: Subscription = new Subscription();
    usrActions: GridActionFilterBOList = new GridActionFilterBOList();

    constructor(private _actRoute: ActivatedRoute, private _qcInvtService: QCInventoryService,
        private _dialog: MatDialog, public _global: GlobalButtonIconsService, private _close: MatDialogRef<ViewQCInventoryComponent>,
        private _confirm: ConfirmationService, private _alertService: AlertService) { }

    ngAfterContentInit() {

        if (!CommonMethods.hasValue(this.encObj.encInvPackID))
            this._actRoute.queryParams.subscribe(param => this.encObj.encInvID = param['id']);

        this.subscription = this._qcInvtService.QCInventSubject.subscribe(resp => {
            if (resp.purpose == 'viewInvtDetailsByInvID') {
                this.status = resp.result.invViewData.status;
                this.refNo = resp.result.invViewData.refNumber;
                this.baseUom = resp.result.invViewData.baseUom;
                this.uom = resp.result.invViewData.uom;
                this.encInvSourceID = resp.result.invViewData.encInvSourceID;
                this.categoryCode = resp.result.invViewData.categoryCode;
                this.subCategoryCode = resp.result.invViewData.subCatCode;
                this.usrActions = new GridActionFilterBOList();
                this.dataSource = dateParserFormatter.FormatDate(resp.result.viewList, 'filterTwiceCol', ['useBeforeDate', 'packOpenedOn'])
                this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
                var obj: TransHistoryBo = new TransHistoryBo();
                obj.id = this.encInvSourceID;
                obj.code = 'QCINV_MANAGE_PACK';
                this.viewHistory = obj;
            }
            else if (resp.purpose == 'manageDiscardCommnets') {
                if (resp.result == 'OK') {
                    this._alertService.success(QCInvtMessages.succDisc);
                    this.getPackDetails();
                }
            }
        });

        this.prepareHeader();

        this.getPackDetails();
        if (!this.displayActionField && this.solventStatusCode != 'DISC')
            this.actions = [GridActions.NotIssued];
        else if (this.solventStatusCode == 'DISC')
            this.actions = [];
    }

    prepareHeader() {
        this.headerData = [];
        this.headerData.push({ columnDef: 'icon', header: '', cell: (element: any) => `${element.isDestroyed}`, width: 'maxWidth-2per' });
        this.headerData.push(
            {
                columnDef: 'packNo', header: 'Pack No.', cell: (element: any) => `${element.packNo}`, width: 'maxWidth-7per'
            });
        this.headerData.push(
            {
                columnDef: 'packQntyUOM', header: 'Pack Quantity', cell: (element: any) => `${element.packQntyUOM}`, width: 'maxWidth-10per'
            });
        this.headerData.push(
            {
                columnDef: 'balanceQntyUOM', header: 'Balance Quantity', cell: (element: any) => `${element.balanceQntyUOM}`, width: 'maxWidth-15per'
            });
        if (!CommonMethods.hasValue(this.isFrom))
            this.headerData.push(
                {
                    columnDef: 'status', header: 'Status', cell: (element: any) => `${element.status}`, width: 'maxWidth-7per'
                });
        this.headerData.push(
            {
                columnDef: 'packOpenedBy', header: 'Pack Opened By', cell: (element: any) => `${element.packOpenedBy}`, width: 'maxWidth-15per'
            });
        this.headerData.push(
            {
                columnDef: 'packOpenedOn', header: 'Pack Opened On', cell: (element: any) => `${element.packOpenedOn}`, width: 'maxWidth-15per'
            });
        this.headerData.push(
            {
                columnDef: 'useBeforeDate', header: 'Valid Up to', cell: (element: any) => `${element.useBeforeDate}`, width: 'maxWidth-15per'
            });
        if (!CommonMethods.hasValue(this.isFrom))
            this.headerData.push(
                {
                    columnDef: 'validity', header: 'Validity', cell: (element: any) => `${element.validity}`, width: 'maxWidth-10per'
                });
        // this.headerData.push(
        //     {
        //         columnDef: 'uom', header: 'UOM', cell: (element: any) => `${element.uom}`
        //     });
    }

    onActionClicked(evnt) {
        if (evnt.action == GridActions.open) {
            var obj: Date = new Date();

            if (this.categoryCode == 'WATER_MAT' && obj.getHours() < 9)
                return this._alertService.info(QCInvtMessages.openAfter9);
            else {
                const modelRef = this._dialog.open(OpenPackComponent, {
                    width: "1000px"
                });
                modelRef.componentInstance.packInvID = this.packInvID = evnt.val.packInvID;
                modelRef.componentInstance.packNo = evnt.val.packNo;
                modelRef.componentInstance.categoryCode = this.categoryCode;
                modelRef.componentInstance.subCategoryCode = this.subCategoryCode;
                return modelRef.afterClosed().subscribe(resp => {
                    if (CommonMethods.hasValue(resp))
                        this.getPackDetails();
                });
            }
        }
        else if (evnt.action == GridActions.canConsume) {
            const modal = this._dialog.open(ManageMiscConsumptionComponent, { width: '80%' });
            modal.disableClose = true;
            modal.componentInstance.packInvID = evnt.val.packInvID;
            modal.componentInstance.baseUom = this.baseUom;
            modal.componentInstance.packUom = this.uom;
            modal.afterClosed().subscribe(resp => {
                if (CommonMethods.hasValue(resp))
                    this.getPackDetails();
            })
        }
        else if (evnt.action == 'BLOCK') {

            const model = this._dialog.open(addCommentComponent, { width: '600px' });
            model.disableClose = true;
            model.afterClosed().subscribe(res => {
                if (res.result) {
                    this._confirm.confirm(QCInvtMessages.continue).subscribe(result => {
                        if (result) {
                            var obj: CommentsBO = new CommentsBO();
                            obj.purposeCode = 'BLKUNBLK';
                            obj.entityCode = EntityCodes.qcInventory;
                            obj.encEntityActID = evnt.val.packInvID;
                            obj.comment = res.val;
                            this._qcInvtService.manageDiscardCommnets(obj);
                        }

                    });
                }
            });
        }
        else if (evnt.action == GridActions.NotIssued) {
            const modal = this._dialog.open(QCInvReservationsComponent, { width: '80%' });
            modal.disableClose = true;
            modal.componentInstance.encPackInvID = evnt.val.packInvID;
            modal.afterClosed().subscribe(resp => { })
        }
        else if (evnt.action == GridActions.PDF) {
            const modal = this._dialog.open(UploadFiles);
            modal.disableClose = true;
            modal.componentInstance.mode = "VIEW";
            modal.componentInstance.uploadBO = CommonMethods.BuildUpload("QC_INV_PACK", 0, "REPORT", evnt.val.packInvID);
        }
    }

    // getInvtViewDetails() {
    //     this._qcInvtService.viewInvtDetailsByInvID(this.encInvID);
    // }

    getPackDetails() {
        this._qcInvtService.viewInvtDetailsByInvID(this.encObj);
    }

    close() {
        this._close.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
