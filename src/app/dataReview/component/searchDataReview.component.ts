import { Component, ViewChild } from "@angular/core";
import { PageTitle } from "src/app/common/services/utilities/pagetitle";
import { Router } from "@angular/router";
import {
  PageUrls,
  GridActions,
  EntityCodes,
  CapabilityActions,
  LookupCodes,
  LimsRespMessages,
  SearchPageTooltip,
} from "src/app/common/services/utilities/constants";
import { DataReviewService } from "../services/dataReview.service";
import { Subscription } from "rxjs";
import {
  CommonMethods,
  dateParserFormatter,
  SearchBoSessions,
} from "src/app/common/services/utilities/commonmethods";
import { SearchDataReview } from "../modal/dataReviewModal";
import { DataReviewMessages } from "../messages/dataReviewMessages";
import { AlertService } from "src/app/common/services/alert.service";
import { GlobalButtonIconsService } from "src/app/common/services/globalButtonIcons.service";
import { LIMSContextServices } from "src/app/common/services/limsContext.service";
import { LookupComponent } from "src/app/limsHelpers/component/lookup";
import {
  LookupInfo,
  LookUpDisplayField,
  materialCatInfo,
} from "src/app/limsHelpers/entity/limsGrid";
import {
  LKPTitles,
  LKPDisplayNames,
  LKPPlaceholders,
} from "src/app/limsHelpers/entity/lookupTitles";
import { materialCategoryComponent } from "src/app/limsHelpers/component/materialCategory.component";
import { SearchFilterModalService } from "src/app/common/services/searchFilterModal.service";
import { environment } from "src/environments/environment";
import { MatDialog } from '@angular/material';
import { ExportDataComponent } from 'src/app/common/component/exportData.component';

@Component({
  selector: "searchManu-root",
  templateUrl: "../html/searchDataReview.html",
})
export class SearchDataReviewComponent {
  headers: any = [];
  dataSource: any = [];
  totalRecords: number;
  pageTitle: string;
  fieldName: string;
  statusList: any;
  actions: any = [];
  searchObj: SearchDataReview = new SearchDataReview();
  currentSelectedIndex: number = 0;
  subscription: Subscription = new Subscription();
  sourceList: any;
  analysisList: any;
  searchFil: any = [];
  srchTooltip: string = SearchPageTooltip.srchDataReview;

  @ViewChild("batches", { static: true }) batches: LookupComponent;
  batchNumberInfo: LookupInfo;
  @ViewChild("arNum", { static: true }) arNum: LookupComponent;
  arNumberInfo: LookupInfo;
  @ViewChild("sampleNum", { static: true }) sampleNum: LookupComponent;
  sampleNumberInfo: LookupInfo;
  @ViewChild("instrNum", { static: true }) instrNum: LookupComponent;
  instrumentInfo: LookupInfo;
  @ViewChild("material", { static: true }) material: materialCategoryComponent;
  intiatedUserInfo: LookupInfo;
  @ViewChild('intiatedUser', { static: true }) intiatedUser: LookupComponent;

  materialInfo: materialCatInfo = new materialCatInfo();
  dateOfReviewFrom: any;
  dateOfReviewTo: any;
  getDateForIni: Date = new Date();
  hasExpCap: boolean = false;
  constructor(
    private route: Router,
    private dataReviewService: DataReviewService,
    public _global: GlobalButtonIconsService,
    private modalService: SearchFilterModalService,
    private _contextService: LIMSContextServices,
    private _notify: AlertService,
    private _limsContextService: LIMSContextServices,
    private _matDailog: MatDialog
  ) {
    this.searchObj.entityCode = localStorage.getItem("entityCode");
    if (
      CommonMethods.hasValue(this.searchObj.entityCode) &&
      this.searchObj.entityCode == EntityCodes.dataReview
    ) {
      this.pageTitle = "Search Data Review";
    } else {
      this.pageTitle = "Search Analytical Raw Data Review";
    }

    this.materialInfo.categoryList = [{ catCode: 'RAW_MAT' }, { catCode: 'PAK_MAT' }, { catCode: 'INTER_MAT' }, { catCode: 'FIN_MAT' }, { catCode: 'WATER_MAT' }, { catCode: 'IMPSTD_MAT' }, { catCode: 'COPROD_MAT' }, { catCode: 'MTHLQR_MAT' }, { catCode: 'BYPROD_MAT' }]
    this.materialInfo.condition = "CATEGORY_CODE IN ('RAW_MAT', 'PAK_MAT', 'INTER_MAT', 'FIN_MAT', 'WATER_MAT', 'IMPSTD_MAT', 'COPROD_MAT', 'MTHLQR_MAT', 'BYPROD_MAT')";
    this.materialInfo.isSubCategoryShow = false;
    this.materialInfo.IsActive = false;
    this.materialInfo.lkpType = "SEARCH";
  }

  ngAfterContentInit() {
    this.subscription = this.dataReviewService.dataReviewSubject.subscribe(
      (resp) => {
        if (resp.purpose == "searchDataReviewDetails") {
          this.totalRecords = resp.result.totalNumberOfRows;
          this.dataSource = CommonMethods.bindMaterialGridData(
            dateParserFormatter.FormatDate(
              resp.result.searchList,
              "arrayDateTimeFormat",
              "createdOn"
            )
          );
          this.menuEvt();
          this.closeModal("dataReview-srch");
        } else if (resp.purpose == "ARDS_SOURCES")
          this.sourceList = resp.result.filter(
            (x) => x.catItemCode == "SAMANA" || x.catItemCode == "CALIB" || x.catItemCode == 'OOS_TEST'
          );
        else if (resp.purpose == "getStatusList") this.statusList = resp.result;
        else if (resp.purpose == "getAnalysisTypes")
          this.analysisList = resp.result;
      }
    );

    this.dataReviewService.getStatusList(this.searchObj.entityCode);
    this.dataReviewService.getCategoryItemsByCatCode("ARDS_SOURCES");
    this.dataReviewService.getAnalysisTypes();

    var capActions: CapabilityActions = this._contextService.getSearchActinsByEntityCode(
      this.searchObj.entityCode
    );
    this.actions = capActions.actionList;
    this.hasExpCap = capActions.exportCap;
    this.prepareLKP();
    this.prepareHeaders();
    this.searchFilter("SearchALL", "Y");
  }

  prepareLKP() {
    this.batchNumberInfo = CommonMethods.PrepareLookupInfo(
      LKPTitles.batchNumber,
      LookupCodes.getLOTBatcheNumbers,
      LKPDisplayNames.Material,
      LKPDisplayNames.mrrBatchNumber,
      LookUpDisplayField.code,
      LKPPlaceholders.batchNumber,
      "",
      "Block",
      "LIMS"
    );
    this.arNumberInfo = CommonMethods.PrepareLookupInfo(
      LKPTitles.arNumber,
      LookupCodes.getDREntityReferenceNumbers,
      LKPDisplayNames.smapleInward,
      LKPDisplayNames.arNumber,
      LookUpDisplayField.code,
      LKPPlaceholders.refArNumber,
      "Code = 'SAMANA'",
      "",
      "LIMS"
    );
    this.sampleNumberInfo = CommonMethods.PrepareLookupInfo(
      LKPTitles.sampleNumber,
      LookupCodes.getSampleNumbers,
      LKPDisplayNames.Material,
      LKPDisplayNames.sampleNumber,
      LookUpDisplayField.code,
      LKPPlaceholders.SampleNumber,
      "STATUS_CODE IN ('ACT', 'INACT')",
      "",
      "LIMS"
    );
    this.instrumentInfo = CommonMethods.PrepareLookupInfo(
      LKPTitles.analysisInstrTitle,
      LookupCodes.getAllEquipmentsInstruments,
      LKPDisplayNames.instrumentType,
      LKPDisplayNames.analysisOccuCode,
      LookUpDisplayField.header,
      LKPPlaceholders.analysisOccu,
      "EQP_CAT_CODE = 'QCINST_TYPE' AND STATUS_CODE IN ('ACT', 'OBSE', 'INACT')"
    );
    this.intiatedUserInfo = CommonMethods.PrepareLookupInfo(
      LKPTitles.initUser,
      LookupCodes.getQCUsers, LKPDisplayNames.actionBy,
      LKPDisplayNames.actionByCode, LookUpDisplayField.header, LKPPlaceholders.initUser, "StatusCode = 'ACT' AND PlantStatusCode = 'ACT'", '', 'LIMS');
  }

  searchFilter(type: string, init: string = "B") {
    var obj: SearchDataReview = new SearchDataReview();
    if (this.searchObj.entityCode == EntityCodes.analyticalDataReview)
      var key: string =
        SearchBoSessions[
        "analyticalDataReviewBO_" + this._limsContextService.getEntityType()
        ];
    else
      var key: string =
        SearchBoSessions[
        "dataReviewBO_" + this._limsContextService.getEntityType()
        ];

    if (SearchBoSessions.checkSessionVal(key) && init == "Y") {
      obj = SearchBoSessions.getSearchAuditBO(key);
      this.searchObj.statusID = obj.statusID;
      this.searchObj.pageIndex = Number(obj.pageIndex);
      this.searchObj.requestType = obj.requestType;

      this.searchObj.matCategoryID = obj.matCategoryID;
      this.material.category = obj.catCode;
      this.searchObj.matCategoryName = this.material.categoryName = obj.matCategoryName;

      this.searchObj.matID = obj.matID;
      this.searchObj.matName = obj.matName;
      if (CommonMethods.hasValue(obj.matID))
        this.material.materials.setRow(obj.matID, obj.matName);

      this.searchObj.sampleID = obj.sampleID;
      this.searchObj.sampleName = obj.sampleName;
      if (CommonMethods.hasValue(obj.sampleID))
        this.sampleNum.setRow(obj.sampleID, obj.sampleName);

      this.searchObj.invID = obj.invID;
      this.searchObj.invName = obj.invName;
      if (CommonMethods.hasValue(obj.invID))
        this.batches.setRow(obj.invID, obj.invName);

      this.searchObj.instrumentID = obj.instrumentID;
      this.searchObj.instrumentName = obj.instrumentName;
      if (CommonMethods.hasValue(obj.instrumentID))
        this.batches.setRow(obj.instrumentID, obj.instrumentName);

      this.searchObj.arID = obj.arID;
      this.searchObj.ArName = obj.ArName;
      if (CommonMethods.hasValue(obj.arID))
        this.arNum.setRow(obj.arID, obj.ArName);
      if (CommonMethods.hasValue(obj.initiatedBy))
        this.intiatedUser.setRow(obj.initiatedBy, obj.initiatedByName);

      this.dateOfReviewFrom = dateParserFormatter.FormatDate(
        obj.dateOfReviewFrom,
        "default"
      );
      this.dateOfReviewTo = dateParserFormatter.FormatDate(
        obj.dateOfReviewTo,
        "default"
      );
      this.searchObj.initiatedOn = dateParserFormatter.FormatDate(obj.initiatedOn, "default");
      this.searchObj.dateOfReviewFrom = obj.dateOfReviewFrom;
      this.searchObj.dateOfReviewTo = obj.dateOfReviewTo;

      this.searchObj.advanceSearch = obj.advanceSearch;
    } else {

      if (!this.validateControls(type) && init == "B") {
        type == "Search"
          ? this._notify.warning(LimsRespMessages.chooseOne)
          : "";
        return true;
      }

      if (type == "SearchALL" && init != "Y") {
        this.searchFil = [];
        this.searchObj = new SearchDataReview();

        if (CommonMethods.hasValue(this.batches.selectedId))
          this.batches.clear();
        if (CommonMethods.hasValue(this.arNum.selectedId))
          this.arNum.clear();
        if (CommonMethods.hasValue(this.instrNum.selectedId))
          this.instrNum.clear();
        if (CommonMethods.hasValue(this.material.categoryID)) {
          this.material.clear();
          this.searchObj.matCategoryName = "";
        }
        if (CommonMethods.hasValue(this.sampleNum.selectedId))
          this.sampleNum.clear();
        if (CommonMethods.hasValue(this.intiatedUser.selectedId))
          this.intiatedUser.clear();

        this.dateOfReviewFrom = this.dateOfReviewTo = null;
        this.searchObj.entityCode = localStorage.getItem("entityCode");
      } else {
        if (CommonMethods.hasValue(this.dateOfReviewFrom))
          this.searchObj.dateOfReviewFrom = dateParserFormatter.FormatDate(
            this.dateOfReviewFrom,
            "date"
          );

        if (CommonMethods.hasValue(this.dateOfReviewTo))
          this.searchObj.dateOfReviewTo = dateParserFormatter.FormatDate(
            this.dateOfReviewTo,
            "date"
          );


        this.searchObj.sampleID = this.sampleNum.selectedId;
        this.searchObj.invID = this.batches.selectedId;
        this.searchObj.arID = this.arNum.selectedId;
        this.searchObj.instrumentID = this.instrNum.selectedId;

        obj.matCategoryID = this.searchObj.matCategoryID;
        obj.matCategoryName = this.searchObj.matCategoryName;

        obj.matID = this.searchObj.matID;
        obj.matName = this.material.materials.selectedText;

        obj.arID = this.searchObj.arID;
        obj.ArName = this.arNum.selectedText;

        obj.invID = this.searchObj.invID;
        obj.invName = this.batches.selectedText;

        obj.instrumentID = this.searchObj.instrumentID;
        obj.instrumentName = this.instrNum.selectedText;

        obj.sampleID = this.searchObj.sampleID;
        obj.sampleName = this.sampleNum.selectedText;

        obj.dateOfReviewFrom = this.searchObj.dateOfReviewFrom = dateParserFormatter.FormatDate(
          this.dateOfReviewFrom,
          "date"
        );
        obj.dateOfReviewTo = this.searchObj.dateOfReviewTo = dateParserFormatter.FormatDate(
          this.dateOfReviewTo,
          "date"
        );

        obj.initiatedOn = this.searchObj.initiatedOn = dateParserFormatter.FormatDate(this.searchObj.initiatedOn, "date")
        obj.initiatedBy = this.searchObj.initiatedBy = this.intiatedUser.selectedId;
        obj.initiatedByName = this.searchObj.initiatedByName = this.intiatedUser.selectedText;
        if (CommonMethods.hasValue(this.intiatedUser) && this.intiatedUser.selectedData)
          obj.userID = this.searchObj.userID = this.intiatedUser.selectedData.extColumn;

        obj.pageIndex = this.searchObj.pageIndex;
        obj.statusID = this.searchObj.statusID;
        obj.requestType = this.searchObj.requestType;
        obj.analysisType = this.searchObj.analysisType;
        obj.advanceSearch = this.searchObj.advanceSearch;
        obj.pageIndex = this.currentSelectedIndex;
        //obj.pageSize = environment.recordsPerPage;

      }
      SearchBoSessions.setSearchAuditBO(key, obj);

      if (init != "P") this.searchObj.pageIndex = 0;
    }

    obj.entityCode = this.searchObj.entityCode;

    this.dataReviewService.searchDataReviewDetails(this.searchObj);
  }



  validateControls(type: string) {
    var isVal: boolean = true;
    if (
      type != "SearchALL" &&
      !CommonMethods.hasValue(this.searchObj.advanceSearch) &&
      !CommonMethods.hasValue(this.material.categoryID) &&
      !CommonMethods.hasValue(this.material.category) &&
      !CommonMethods.hasValue(this.dateOfReviewFrom) &&
      !CommonMethods.hasValue(this.dateOfReviewTo) &&
      !CommonMethods.hasValue(this.searchObj.statusID) &&
      !CommonMethods.hasValue(this.searchObj.analysisType) &&
      !CommonMethods.hasValue(this.instrNum.selectedId) &&
      !CommonMethods.hasValue(this.sampleNum.selectedId) &&
      !CommonMethods.hasValue(this.batches.selectedId) &&
      !CommonMethods.hasValue(this.arNum.selectedId) &&
      !CommonMethods.hasValue(this.searchObj.matCategoryID) &&
      !CommonMethods.hasValue(this.searchObj.requestType) &&
      !CommonMethods.hasValue(this.searchObj.initiatedOn) &&
      !CommonMethods.hasValue(this.intiatedUser.selectedId)
    )
      isVal = false;

    if (
      (isVal && type == "SearchALL") ||
      (type == "SearchALL" && environment.pageIndex != "0")
    ) {
      environment.pageIndex = "0";
      isVal = true;
    }
    return isVal;
  }

  onActionClicked(event) {
    if (event.action == "VIE") {
      localStorage.setItem("DATA_REVIEW_PAGE", "VIEW");
      this.route.navigate(["lims/dataReview/manage"], {
        queryParams: { id: event.val.encReviewID },
      });
    }
  }

  prepareHeaders() {
    this.headers = [];

    this.headers.push({
      columnDef: "referenceNum",
      header: "AR Number / Ref. No.",
      cell: (element: any) => `${element.referenceNum}`,
      width: "maxWidth-12per",
    });
    this.headers.push({
      columnDef: "matOrInstumnetName",
      header: "Product Name / Material Name / Instrument Title (ID)",
      cell: (element: any) => `${element.matOrInstumnetName}`,
      width: "maxWidth-25per",
    });
    this.headers.push({
      columnDef: "testName",
      header: "Test / Parameter Name",
      cell: (element: any) => `${element.testName}`,
      width: "maxWidth-25per",
    });
    this.headers.push({
      columnDef: "batchNumber",
      header: "Batch Number",
      cell: (element: any) => `${element.batchNumber}`,
      width: "maxWidth-15per",
    });
    this.headers.push({
      columnDef: "analysisOrScheduleType",
      header: "Analysis Type / Schedule Type",
      cell: (element: any) => `${element.analysisOrScheduleType}`,
      width: "maxWidth-15per",
    });
    // this.headers.push({
    //   columnDef: "totalTests",
    //   header: "No. of Tests / Parameters",
    //   cell: (element: any) => `${element.totalTests}`,
    //   width: "maxWidth-10per",
    // });
    // this.headers.push({
    //   columnDef: "initiatedBy",
    //   header: "Initiated By",
    //   cell: (element: any) => `${element.userName}`,
    //   width: "maxWidth-15per",
    // });
    this.headers.push({
      columnDef: "status",
      header: "Status",
      cell: (element: any) => `${element.status}`,
      width: "maxWidth-10per",
    });
  }

  onPageIndexClicked(event) {
    this.searchObj.pageIndex = event;
    this.searchFilter("Search", "P");
  }

  menuEvt() {
    this.searchFil = [];
    if (CommonMethods.hasValue(this.searchObj.advanceSearch))
      this.searchFil.push({
        code: "ADV_SRCH",
        name: "Search Text: " + this.searchObj.advanceSearch,
      });

    if (CommonMethods.hasValue(this.batches.selectedId))
      this.searchFil.push({
        code: "BAT_NUM",
        name: "Lot/Batch Number: " + this.batches.selectedText,
      });
    if (CommonMethods.hasValue(this.arNum.selectedId))
      this.searchFil.push({
        code: "AR_NUM",
        name: "AR Number: " + this.arNum.selectedText,
      });
    if (CommonMethods.hasValue(this.searchObj.analysisType))
      this.searchFil.push({
        code: "ANA_TYPE",
        name:
          "Analysis Type: " +
          this.analysisList.filter(
            (x) => x.speC_TYPE_ID == this.searchObj.analysisType
          )[0].speC_TYPE,
      });
    if (CommonMethods.hasValue(this.searchObj.matCategoryName))
      this.searchFil.push({
        code: "Mat_TYPE",
        name: "Material Category: " + this.searchObj.matCategoryName,
      });

    if (CommonMethods.hasValue(this.searchObj.matID))
      this.searchFil.push({
        code: "MATERIAL",
        name: "Material Code: " + this.searchObj.matName,
      });

    if (CommonMethods.hasValue(this.searchObj.requestType))
      this.searchFil.push({
        code: "REQ_TYPE",
        name:
          "Request Type: " +
          this.sourceList.filter(
            (x) => x.catItemID == this.searchObj.requestType
          )[0].catItem,
      });
    if (CommonMethods.hasValue(this.instrNum.selectedId))
      this.searchFil.push({
        code: "Instr_NUM",
        name: "Instrument ID: " + this.instrNum.selectedText,
      });
    if (CommonMethods.hasValue(this.sampleNum.selectedId))
      this.searchFil.push({
        code: "SAM_NUM",
        name: "Sample/Operation Number: " + this.sampleNum.selectedText,
      });
    if (CommonMethods.hasValue(this.searchObj.dateOfReviewFrom))
      this.searchFil.push({
        code: "DATE_FROM",
        name:
          "Date From: " +
          dateParserFormatter.FormatDate(
            this.searchObj.dateOfReviewFrom,
            "date"
          ),
      });
    if (CommonMethods.hasValue(this.searchObj.dateOfReviewTo))
      this.searchFil.push({
        code: "DATE_TO",
        name:
          "Date To: " +
          dateParserFormatter.FormatDate(this.searchObj.dateOfReviewTo, "date"),
      });
    if (CommonMethods.hasValue(this.searchObj.statusID)) {
      var obj = this.statusList.filter(
        (x) => x.statusID == this.searchObj.statusID
      );
      this.searchFil.push({ code: "STATUS", name: "Status: " + obj[0].status });
    }

    if (CommonMethods.hasValue(this.searchObj.initiatedOn))
      this.searchFil.push({ code: "INITIATED_ON", name: "Initiated On: " + dateParserFormatter.FormatDate(this.searchObj.initiatedOn, "date") })
    if (CommonMethods.hasValue(this.intiatedUser.selectedId))
      this.searchFil.push({ code: "INITIATED_BY", name: "Initiated By: " + this.intiatedUser.selectedText })
  }

  clearOption(code, index) {
    if (code == "BAT_NUM") this.batches.clear();
    else if (code == "AR_NUM") this.arNum.clear();
    else if (code == "ANA_TYPE") this.searchObj.analysisType = null;
    else if (code == "Instr_NUM") this.instrNum.clear();
    else if (code == "Mat_TYPE") this.material.category = null;
    else if (code == "MATERIAL") this.material.clear();
    else if (code == "REQ_TYPE") this.searchObj.requestType = null;
    else if (code == "SAM_NUM") this.sampleNum.clear();
    else if (code == "DATE_FROM") this.searchObj.dateOfReviewFrom = null;
    else if (code == "DATE_TO") this.searchObj.dateOfReviewTo = null;
    else if (code == "STATUS") this.searchObj.statusID = null;
    else if (code == "ADV_SRCH") this.searchObj.advanceSearch = null;
    else if (code == "INITIATED_ON")
      this.searchObj.initiatedOn = null;
    else if (code == "INITIATED_BY")
      this.intiatedUser.clear();
    this.searchFil.splice(index, 1);
  }

  hasSearchVal() {
    var obj = this.searchFil.filter((x) => x.code == "ADV_SRCH");
    return obj.length > 0;
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }
  openModal(id: string) {
    this.modalService.open(id);
  }

  changeMaterialCategory(event) {
    this.searchObj.matCategoryID = event.categoryID;
    this.searchObj.catCode = this.materialInfo.categoryCode = event.categoryCode;
    this.searchObj.matCategoryName = event.categoryName;
    this.searchObj.matName = event.materialName;
    this.materialInfo.categoryCode = event.categoryCode;
    if (CommonMethods.hasValue(event.materialID))
      this.searchObj.matID = this.materialInfo.materialID = event.materialID;

  }

  export() {
    const _modal = this._matDailog.open(ExportDataComponent);
    _modal.disableClose = true;
    _modal.componentInstance.entityCode = localStorage.getItem("entityCode");;

    var obj: SearchDataReview = new SearchDataReview();

    if (this.searchObj.entityCode == EntityCodes.analyticalDataReview)
      var key: string = SearchBoSessions["analyticalDataReviewBO_" + this._limsContextService.getEntityType()];
    else
      var key: string = SearchBoSessions["dataReviewBO_" + this._limsContextService.getEntityType()];


    if (SearchBoSessions.checkSessionVal(key))
      obj = SearchBoSessions.getSearchAuditBO(key);

    var condition: string = " AND EntityCode = '" + this.searchObj.entityCode + "'";
    if (CommonMethods.hasValue(obj.requestType))
      condition = condition + " AND RequestType = " + obj.requestCode;
    if (CommonMethods.hasValue(obj.arID))
      condition = condition + " AND RequestID = " + obj.arID;
    if (CommonMethods.hasValue(obj.matID))
      condition = condition + " AND MatID = " + obj.matID;
    if (CommonMethods.hasValue(obj.instrumentID))
      condition = condition + " AND EquipmentID = " + obj.instrumentID;
    // if (CommonMethods.hasValue(obj.specTestID))
    //     condition = condition + " AND spectTestID = " + obj.specTestID;
    if (CommonMethods.hasValue(obj.invID))
      condition = condition + " AND InvID = " + obj.invID;
    if (CommonMethods.hasValue(obj.analysisType))
      condition = condition + " AND AnalysisTypeID = " + obj.analysisType;
    if (CommonMethods.hasValue(obj.sampleID))
      condition = condition + " AND SampleID = " + obj.sampleID;
    if (CommonMethods.hasValue(obj.matCategoryID))
      condition = condition + " AND CategoryID = " + obj.matCategoryID;
    if (CommonMethods.hasValue(obj.scheduleType))
      condition = condition + " AND ScheduleTypeID = " + obj.scheduleType;
    if (CommonMethods.hasValue(obj.dateOfReviewFrom))
      condition = condition + " AND CreatedOn >= '" + dateParserFormatter.FormatDate(this.dateOfReviewFrom, 'date') + "'";
    if (CommonMethods.hasValue(obj.dateOfReviewTo))
      condition = condition + " AND CreatedOn < '" + dateParserFormatter.FormatDate(this.dateOfReviewTo.setDate(this.dateOfReviewTo.getDate() + 1), 'date') + "'";
    if (CommonMethods.hasValue(obj.statusID))
      condition = condition + " AND StatusID = " + obj.statusID;
    if (CommonMethods.hasValue(obj.userID))
      condition = condition + " AND UserID = " + obj.userID;
    if (CommonMethods.hasValue(obj.advanceSearch))
      condition = condition + " AND ( ReferenceNum LIKE '%" + obj.advanceSearch + "%' OR MatOrInstumnetName LIKE '%" + obj.advanceSearch + "%' OR BatchNumber LIKE '%" + obj.advanceSearch + "%' OR AnalysisOrScheduleType LIKE '%" + obj.advanceSearch + "%' )"

    _modal.componentInstance.condition = condition;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
