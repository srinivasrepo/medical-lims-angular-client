import { Component, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { QCInventoryService } from '../service/QCInventory.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { MatDialog } from '@angular/material';
import { managePackDetailsComponent } from './managePackDetails.component';
import { ButtonActions, ActionMessages, EntityCodes, PageUrls, GridActions, CategoryCodeList } from 'src/app/common/services/utilities/constants';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { QCInvtMessages } from '../messages/QCInvtMessages';
import { AlertService } from 'src/app/common/services/alert.service';
import { ManageBatches, BatchSplitBO } from '../model/QCInventorymodel';
import { GridComponent } from 'src/app/limsHelpers/component/grid.component';
import { AppBO, GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';
import { TransHistoryBo } from 'src/app/approvalProcess/models/Approval.model';
import { ApprovalComponent } from 'src/app/approvalProcess/component/approvalProcess.component';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { BatchSpitComponent } from './newbatchSplit.component';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { GridActionFilterBOList, GridActionFilterBO } from 'src/app/limsHelpers/entity/limsGrid';

@Component({
    selector: 'mng-ch-pack',
    templateUrl: '../html/manageChemicalPacks.html'
})

export class manageChemicalPacksComponent {

    encInvSourceID: string = '3';
    subscription: Subscription = new Subscription();
    chemicalSource: string;
    dataSource: any;
    headers: any;
    pageTitle: string = PageTitle.managePacks;
    actions: any = ['MNGPACK', 'UPLOAD', 'BATCH_SPLIT', GridActions.delete];
    blockList: any = [];
    saveBtn: string = ButtonActions.btnSave;
    appBO: AppBO = new AppBO();
    backUrl: string = PageUrls.homeUrl;
    status: string;
    refNumber: string;
    viewHistoryVisible: boolean;
    viewHistory: any;
    entityCode: string = EntityCodes.qcInventory;
    actionIcons: Map<string, string> = new Map<string, string>();
    actiontoolTip: Map<string, string> = new Map<string, string>();
    today: Date = new Date();
    totalCatItemList: CategoryItemList;
    assignCatItemList: CategoryItemList = [];

    removeActions: any = { headerName: 'parentInvID', BATCH_SPLIT: null, DELETE: !null }

    @ViewChild('grid', { static: true }) grid: GridComponent;
    isLoaderStart: boolean = false;

    constructor(private _qcService: QCInventoryService, private _actRoutes: ActivatedRoute, private _modal: MatDialog, public _global: GlobalButtonIconsService,
        private _alert: AlertService, private _router: Router, private _confirm: ConfirmationService) {
        this.actionIcons.set("DELETE", "delete_forever");
        this.actionIcons.set("UPLOAD", "attach_file");
        this.actionIcons.set("MNGPACK", 'edit');
        this.actionIcons.set("BATCH_SPLIT", "call_split");



        this.actiontoolTip.set("DELETE", "Delete");
        this.actiontoolTip.set("UPLOAD", "Uploads");
        this.actiontoolTip.set("MNGPACK", "Manage Pack");
        this.actiontoolTip.set("BATCH_SPLIT", "Batch Split");
    }

    ngAfterContentInit() {
        this._actRoutes.queryParams.subscribe(param => this.encInvSourceID = param['id']);
        this.subscription = this._qcService.QCInventSubject.subscribe(resp => {
            if (resp.purpose == "getQCInventoryDetails") {
                this.chemicalSource = resp.result.chemicalSource;
                this.status = resp.result.status;
                this.refNumber = resp.result.refNumber;
                this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
                this.dataSource.data.forEach(x => {
                    x.manufDate = x.mfgDate;
                    x.expiredDate = x.expiryDate;
                    if (CommonMethods.hasValue(x.gradeID)) {
                        var obj: CategoryItem = new CategoryItem();
                        obj.catItem = x.grade;
                        obj.catItemID = x.gradeID;
                        obj.catItemCode = x.gradeCode;
                        obj.category = 'GRADE';
                        this.prepareAssignCatList(obj);
                    }
                    this.totalCatItemList = CommonMethods.prepareCategoryItemsList(this.totalCatItemList, this.assignCatItemList);
                })
                this.appBO = resp.result.act;
                this.enableHeaders(false);
            }
            else if (resp.purpose == 'getBlockByPlantID')
                this.blockList = resp.result;

            else if (resp.purpose == "getCatItemsByCatCodeList")
                this.totalCatItemList = resp.result;
            else if (resp.purpose == "manageQCBatchDetails") {
                this.isLoaderStart = false;
                if (resp.result == 'OK') {
                    this._alert.success(QCInvtMessages.succBatch);
                    this.enableHeaders(false);
                }
                else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
            else if (resp.purpose == "deleteNewBatchSplit") {
                if (resp.result.retmsg == 'OK') {
                    this._alert.success(QCInvtMessages.succDeleteBatch);
                    this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
                    this.dataSource.data.forEach(x => {
                        x.manufDate = x.mfgDate;
                        x.expiredDate = x.expiryDate;
                    })
                    // this._qcService.getQCInventoryDetails(this.encInvSourceID);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.retmsg));
            }
        });
        this.showHistory();
        this.prepareHeaders();
        this._qcService.getBlockByPlantID({deptCode:'QC',type:"MNG"});
        var obj: GetCategoryBO = new GetCategoryBO();
        obj.list = CategoryCodeList.GetManageLabInventoryCategories();
        obj.type = 'MNG';
        this._qcService.getCatItemsByCatCodeList(obj);
        this._qcService.getQCInventoryDetails(this.encInvSourceID);
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ columnDef: "refNumber", header: 'System Code', cell: (element: any) => `${element.refNumber}`, width: 'maxWidth-10per' });
        this.headers.push({ columnDef: "chemicalName", header: 'Chemical Name', cell: (element: any) => `${element.chemical}`, width: 'maxWidth-30per' });
        this.headers.push({ columnDef: "mfgBatchNumber", header: 'Mfg Batch Number', cell: (element: any) => `${element.mfgBatchNumber}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "batchQty", header: 'Batch Qty.', cell: (element: any) => `${element.batQty}`, width: 'maxWidth-7per' });
        this.headers.push({ columnDef: "mngMfgDate", header: 'MFG. Date', cell: (element: any) => `${element.manufDate}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "mngUserBeforeDate", header: 'Expiry Date', cell: (element: any) => `${element.expiredDate}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "mngGrade", header: 'Grade', cell: (element: any) => `${element.gradeID}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "mngBlock", header: 'Block', cell: (element: any) => `${element.blockID}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "purity", header: 'Purity', cell: (element: any) => `${element.purity}`, width: 'maxWidth-10perinput' });
        this.headers.push({ columnDef: "density", header: 'Density', cell: (element: any) => `${element.density}`, width: 'maxWidth-10perinput' });

    }

    validations() {

        var obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.mfgBatchNumber));
        if (obj.length > 0)
            return QCInvtMessages.batchNumber;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.manufDate));
        if (obj.length > 0)
            return QCInvtMessages.mfgDate;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.expiredDate) && x.subCatCode != "STANDARDS");
        if (obj.length > 0)
            return QCInvtMessages.expireDate;
        obj = this.dataSource.data.filter(x => CommonMethods.hasValue(x.expiredDate) && dateParserFormatter.FormatDate(x.manufDate, 'default') > dateParserFormatter.FormatDate(x.expiredDate, 'default'))
        if (obj.length > 0)
            return QCInvtMessages.expGreaterthan;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.gradeID));
        if (obj.length > 0)
            return QCInvtMessages.grade;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.blockID));
        if (obj.length > 0)
            return QCInvtMessages.block;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.purity));
        if (obj.length > 0)
            return QCInvtMessages.purity;
        obj = this.dataSource.data.filter(x => !CommonMethods.hasValue(x.density));
        if (obj.length > 0)
            return QCInvtMessages.density;
    }

    save() {
        if (this.saveBtn == ButtonActions.btnUpdate)
            return this.enableHeaders(true);

        var errMsg: string = this.validations();

        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        var obj: ManageBatches = new ManageBatches
        obj.encInvSourceID = this.encInvSourceID;
        obj.list = this.dataSource.data;
        obj.initTime = this.appBO.initTime;

        obj.list.forEach(x => {
            x.mfgDate = dateParserFormatter.FormatDate(x.manufDate, 'datetime');
            x.expiryDate = dateParserFormatter.FormatDate(x.expiredDate, 'datetime');
        })

        this.isLoaderStart = true;
        this._qcService.manageQCBatchDetails(obj);
    }

    enableHeaders(val: boolean) {
        this.saveBtn = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
        //this.grid.isDisabled = !val;
    }

    onActionClicked(action, data) {
        if (action == 'MNGPACK') {
            const modal = this._modal.open(managePackDetailsComponent, { width: '80%' });
            modal.componentInstance.invID = data.invID;
            modal.componentInstance.material = data.chemical;
            modal.componentInstance.batchNo = data.mfgBatchNumber;
            modal.disableClose = true;
            modal.componentInstance.pageType = this.saveBtn == ButtonActions.btnSave ? 'MANAGE' : 'VIEW';
        }
        else if (action == 'UPLOAD') {
            const modal = this._modal.open(UploadFiles);
            modal.disableClose = true;
            modal.componentInstance.uploadBO = CommonMethods.BuildUpload(EntityCodes.qcInventory, 0, 'QC_MNG_PAC', data.invID, [], 'MEDICAL_LIMS');
            modal.componentInstance.mode = this.saveBtn == ButtonActions.btnSave ? 'MANAGE' : 'VIEW';
        }
        else if (action == "BATCH_SPLIT") {
            const modal = this._modal.open(BatchSpitComponent, CommonMethods.modalFullWidth);
            var obj: BatchSplitBO = new BatchSplitBO();
            obj.refNumber = data.refNumber;
            obj.actualQnty = data.batchQty;
            obj.encInvID = data.invID;
            obj.encInvSourceID = this.encInvSourceID;
            modal.componentInstance.batchBO = obj;
            modal.componentInstance.type = this.saveBtn == ButtonActions.btnSave ? 'MNG' : "VIEW"
            modal.afterClosed().subscribe(resp => {
                if (resp && resp.retmsg == "OK") {
                    this.dataSource = CommonMethods.bindMaterialGridData(resp.list);
                    this.dataSource.data.forEach(x => {
                        x.manufDate = x.mfgDate;
                        x.expiredDate = x.expiryDate;
                    })
                }
            })
        }
        else if (action == 'DELETE') {
            if (this.saveBtn != ButtonActions.btnSave)
                return
            this._confirm.confirm(QCInvtMessages.batchDelete).subscribe(resp => {
                if (resp)
                    this._qcService.deleteInvBatchSplit(data.invID);
            })
        }
    }

    confirm() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encInvSourceID;
        obj.code = 'QCINV_MANAGE_PACK';

        const modal = this._modal.open(ApprovalComponent, CommonMethods.modalFullWidth);
        modal.componentInstance.appbo = CommonMethods.BindApprovalBO(this.appBO.detailID, this.encInvSourceID, EntityCodes.qcInventory, this.appBO.appLevel, this.appBO.initTime);
        modal.componentInstance.transHis = obj;
        modal.afterClosed().subscribe((obj) => {
            if (obj == "OK")
                this._router.navigateByUrl(PageUrls.homeUrl);
        });
    }

    usrActions: GridActionFilterBOList = new GridActionFilterBOList();
    checkUserActions(dataItem: any, idx: number) {
        if (this.usrActions.filter(x => x.index == idx).length > 0)
            return this.usrActions.filter(x => x.index == idx)[0].data;

        var obj: GridActionFilterBO = new GridActionFilterBO();
        obj.index = idx;

        this.actions.forEach((action, index) => {
            if (action == 'BATCH_SPLIT' && !CommonMethods.hasValue(dataItem['parentInvID']))
                obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
            else if ((CommonMethods.hasValue(dataItem['parentInvID']) && action == 'DELETE') || (action != 'DELETE' && action != 'BATCH_SPLIT'))
                obj.data.push({ code: action, val: this.actiontoolTip.get(action), icon: this.actionIcons.get(action) });
        })

        this.usrActions.push(obj)
        return (obj.data);
    }

    tranHistory() {
        var obj: TransHistoryBo = new TransHistoryBo();
        obj.id = this.encInvSourceID;
        obj.code = 'QCINV_MANAGE_PACK';
        this.viewHistory = obj;
    }

    showHistory() {
        if (CommonMethods.hasValue(this.encInvSourceID)) {
            this.viewHistoryVisible = true;
            this.tranHistory();
        }
        else
            this.viewHistoryVisible = false;
    }

    getCatItemList(categoryCode: string) {
        if (this.totalCatItemList && this.totalCatItemList.length > 1)
            return this.totalCatItemList.filter(x => x.category == categoryCode);
        else
            return null;
    }

    prepareAssignCatList(obj: CategoryItem) {
        if (obj.catItemID) {
            this.assignCatItemList.push(obj);
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}