import { Component, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { MatDialogRef } from "@angular/material";
import { GlobalButtonIconsService } from "src/app/common/services/globalButtonIcons.service";
import { CommonMethods } from "src/app/common/services/utilities/commonmethods";
import {
  ButtonActions,
  LimsRespMessages,
  ActionMessages,
  CategoryCodeList
} from "src/app/common/services/utilities/constants";
import { ConfirmationService } from "src/app/limsHelpers/component/confirmationService";
import { AlertService } from "src/app/common/services/alert.service";
import { QCInvtMessages } from "../messages/QCInvtMessages";
import { QCInventoryService } from "../service/QCInventory.service";
import { ManagePack } from "../model/QCInventorymodel";
import { GridComponent } from "src/app/limsHelpers/component/grid.component";
import { GetCategoryBO, CategoryItemList, CategoryItem } from 'src/app/common/services/utilities/commonModels';

@Component({
  selector: "mng-pack",
  templateUrl: "../html/managePackDetails.html"
})
export class managePackDetailsComponent {
  subscription: Subscription = new Subscription();
  title: string = "Manage Packs";
  packBtn: string = ButtonActions.btnGo;
  noofPacks: number;
  eachPackQuantity: number;
  headers: any;
  dataSource: any;
  assignQty: number;
  invID: number;
  actBatchQty: string;
  uom: string;
  saveBtn: string = ButtonActions.btnSave;
  pageType: string = "MANAGE";
  natureType: number;
  material: string;
  batchNo: string;
  natureOfChemical: string;
  totalCatItemList: CategoryItemList;
  assignCatItemList: CategoryItemList = [];

  @ViewChild("grid", { static: true }) grid: GridComponent;
  isLoaderStart: boolean = false;

  constructor(
    private _closeModal: MatDialogRef<managePackDetailsComponent>,
    public _global: GlobalButtonIconsService,
    private _confirmService: ConfirmationService,
    private _alert: AlertService,
    private _qcService: QCInventoryService
  ) { }

  ngAfterContentInit() {
    this.subscription = this._qcService.QCInventSubject.subscribe(resp => {
      if (resp.purpose == "getQCInvPackDetails") {
        this.actBatchQty = resp.result.batchQty;
        this.uom = resp.result.uom;
        this.natureOfChemical = resp.result.natureofChemical;
        if (resp.result.list.length > 0) {
          this.noofPacks = resp.result.list.length;
          this.packBtn = ButtonActions.btnChange;
          this.enableHeaders(false);
        }
        this.dataSource = CommonMethods.bindMaterialGridData(resp.result.list);
        this.dataSource.data.forEach(x => {
          x.uom = this.uom;
        });
        this.onDataChange(true);
        if (!CommonMethods.hasValue(this.natureOfChemical)) {
          var categoryObj: GetCategoryBO = new GetCategoryBO();
          categoryObj.list = CategoryCodeList.GetManageLabInventoryCategories();
          categoryObj.type = 'MNG';
          this._qcService.getCatItemsByCatCodeList(categoryObj);
        }
      }
      else if (resp.purpose == "getCatItemsByCatCodeList")
        this.totalCatItemList = resp.result;
      else if (resp.purpose == "manageQCInvPackDetails") {
        this.isLoaderStart = false;
        if (resp.result == "OK") {
          this._alert.success(QCInvtMessages.succPack);
          this.enableHeaders(false);
          if (CommonMethods.hasValue(this.totalCatItemList)) {
            var obj = this.totalCatItemList.filter(
              o => o.catItemID == this.natureType
            );
            this.natureOfChemical = obj[0].catItem;
          }
        } else this._alert.error(ActionMessages.GetMessageByCode(resp.result));
      }
    });

    this.prepareHeaders();
    this._qcService.getQCInvPackDetails(this.invID);
    if (this.pageType == "VIEW") this.packBtn = ButtonActions.btnChange;
  }

  enableHeaders(val: boolean) {
    this.saveBtn = val ? ButtonActions.btnSave : ButtonActions.btnUpdate;
    this.grid.isDisabled = !val;
  }

  allowdecimal(event: any) {
    return CommonMethods.allowDecimal(
      event,
      CommonMethods.allowDecimalLength,
      5,
      5
    );
  }

  allowNumbers(evt) {
    return CommonMethods.allowNumber(evt, "");
  }

  addPacks() {
    if (this.packBtn == ButtonActions.btnChange) {
      this._confirmService.confirm(LimsRespMessages.continue).subscribe(re => {
        if (re) return (this.packBtn = ButtonActions.btnGo);
      });
    } else {
      if (!CommonMethods.hasValue(this.noofPacks))
        return this._alert.warning(QCInvtMessages.noofPack);
      if (!CommonMethods.hasValue(this.eachPackQuantity))
        return this._alert.warning(QCInvtMessages.eachPackQuantity);

      this.packBtn = ButtonActions.btnChange;
      // this.dataSource.data.length != this.noofPacks
      if (true) {
        this.dataSource = [];
        for (var i = 1; i <= this.noofPacks; i++) {
          var obj = {
            packNo: i + "/" + this.noofPacks,
            packQty: Number(this.eachPackQuantity),
            uom: this.uom
          };

          this.dataSource.push(obj);
        }
        var qty: number = 0;
        this.dataSource.forEach(x => {
          qty += Number(x.packQty);
        });
        this.assignQty = Number(qty.toFixed(5));
        this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
      }
    }
  }

  prepareHeaders() {
    this.headers = [];
    this.headers.push({
      columnDef: "packNo",
      header: "Pack No.",
      cell: (element: any) => `${element.packNo}`,
      width: "minWidth-35per"
    });
    if (this.pageType == "MANAGE")
      this.headers.push({
        columnDef: "packQty",
        header: "Pack Qty.",
        cell: (element: any) => `${element.packQty}`,
        width: "minWidth-35per"
      });
    else
      this.headers.push({
        columnDef: "viewPackQty",
        header: "Pack Qty.",
        cell: (element: any) => `${element.packQty}`,
        width: "minWidth-40per"
      });
  }

  close() {
    this._closeModal.close();
  }

  onDataChange(evt) {
    var qty: number = 0;
    if (evt) {
      this.dataSource.data.forEach(x => {
        qty += Number(x.packQty);
      });
    }
    this.assignQty = Number(qty.toFixed(5));
  }

  validations() {
    var obj = this.dataSource.data.filter(
      x => !CommonMethods.hasValue(x.packQty)
    );
    if (obj.length > 0) return QCInvtMessages.packQty;
    if (this.assignQty != Number(this.actBatchQty))
      return QCInvtMessages.batchQty;
    if (
      !CommonMethods.hasValue(this.natureType) &&
      !CommonMethods.hasValue(this.natureOfChemical)
    )
      return QCInvtMessages.natureofChemical;
  }

  save() {
    if (this.saveBtn == ButtonActions.btnUpdate)
      return this.enableHeaders(true);

    var errMsg: string = this.validations();
    if (CommonMethods.hasValue(errMsg)) return this._alert.warning(errMsg);
    var obj: ManagePack = new ManagePack();
    obj.invID = this.invID;
    obj.natureTypeID = this.natureType;
    this.dataSource.data.forEach(x => {
      x.qty = x.packQty;
    });
    obj.lst = this.dataSource.data;

    this.isLoaderStart = true;
    this._qcService.manageQCInvPackDetails(obj);
  }

  getCatItemList(categoryCode: string) {
    if (this.totalCatItemList && this.totalCatItemList.length > 1)
      return this.totalCatItemList.filter(x => x.category == categoryCode);
    else
      return null;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
