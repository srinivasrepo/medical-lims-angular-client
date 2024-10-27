import { Component, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ReportService } from "../service/report.service";
import { FormGroup, FormBuilder, Validators } from '../../../../node_modules/@angular/forms';
import { CommonMethods, dateParserFormatter } from '../../common/services/utilities/commonmethods';
import { GridActions, LookupCodes } from '../../common/services/utilities/constants';
import { LIMSContextServices } from '../../common/services/limsContext.service';
import { MatDialog } from '../../../../node_modules/@angular/material';
import { PageTitle } from '../../common/services/utilities/pagetitle';
import { ReportBO, ReportSearchBO } from '../models/report.model';
import { ReportView } from '../../common/component/reportView.component';
import { environment } from '../../../environments/environment';
import { AlertService } from '../../common/services/alert.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';

@Component({
    selector: 'report',
    templateUrl: '../html/reportList.html'
})

export class ReportsListComponent {
    rptForm: FormGroup;
    reportsList: Array<any> = [];
    entityActID: number = 0;
    headerData: any;
    dataSource: any;
    totalRecords: number;
    pageIndexes: Array<any> = [];
    actions: Array<string> = [GridActions.Report];
    hasCapability: boolean = false;
    subscription: Subscription = new Subscription();
    currentSelectedIndex: number = 0;
    rptVersionCode: string;
    pageTitle: string = PageTitle.logReports;
    btnType: string;
    reportType: string;
    entityType: string;
    matInfo: LookupInfo;
    yearList: any = [];
    monthList: any = [];

    @ViewChild('materials', { static: true }) materials: LookupComponent;

    get f() { return this.rptForm.controls; }

    constructor(private _service: ReportService, private _fb: FormBuilder,
        private _limstitle: LIMSContextServices, private activeModel: MatDialog,
        private _alert: AlertService, public _global: GlobalButtonIconsService) {

        this.rptForm = this._fb.group({
            reportCode: ['', [Validators.required]],
            refCode: ['', [Validators.required]],
            datefrom: ['', [Validators.required]],
            dateto: ['', [Validators.required]],
            year:['', [Validators.required]],
            month:['', [Validators.required]]
        });
    }

    ngAfterViewInit() {
        this.subscription = this._service.reportSubject.subscribe(resp => {
            if (resp.purpose == "entityReports")
                this.reportsList = resp.result;
            else if (resp.purpose == "searchResult") {

                this.prepareGridHeaders();
                this.dataSource = dateParserFormatter.FormatDate(resp.result.searchList, "arrayDateFormat", 'reportDate');
                this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
                this.totalRecords = resp.result.totalNumberOfRows;
            }
        });
        this.entityType = sessionStorage.getItem('entitytype');
        this._service.getEntityReports(this._limstitle.getEntityType());
        this.matInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Chemical, LookupCodes.plantMaterials, LKPDisplayNames.Chemical, LKPDisplayNames.ChemicalCode, LookUpDisplayField.header, LKPPlaceholders.Chemical, "CAT_CODE = 'LAB_MAT'");
        this.BindYears();
        this.BindMonths();
    }

    prepareGridHeaders() {
        this.headerData = [];
        this.headerData.push({ "columnDef": 'requstCode', "header": "System Code", cell: (element: any) => `${element.requstCode}` });
        if (this.reportType == 'RPT' && this.entityType == 'LABINV')
            this.headerData.push({ "columnDef": 'material', "header": "Name of the Chemical", cell: (element: any) => `${element.materialName}` });
        this.headerData.push({ "columnDef": 'reportName', "header": "Report", cell: (element: any) => `${element.reportName}` });
        this.headerData.push({ "columnDef": 'reportDate', "header": "Report Date", cell: (element: any) => `${element.reportDate}` });

    }

    rptChange() {
        this.pageIndexes = [];
        this.entityActID = 0;
        this.f.refCode.setValue("");
        this.f.datefrom.setValue("");
        this.f.dateto.setValue("");
        this.rptVersionCode = "";
        this.dataSource = [];
        this.headerData = [];
        this.f.year.setValue(new Date().getFullYear());
        this.f.month.setValue("");

        this.reportType = this.reportsList.filter(x => x.entityRPTCode == this.rptForm.controls.reportCode.value)[0].reportType;
    }

    BindYears() {
        let currentYear = new Date().getFullYear();
        let startYear: number = Number(environment.logYearFrom);

        for (var _i = startYear; _i <= currentYear; _i++) {
            this.yearList.push(startYear);
            startYear++;
        }
    }

    BindMonths() {
        this.monthList = CommonMethods.getMonths();
    }

    GetReport() {

        let obj = new ReportBO();

        if (CommonMethods.hasValue(this.entityActID))
            obj.entActID = this.entityActID;
        if (CommonMethods.hasValue(this.rptVersionCode))
            obj.versionCode = this.rptVersionCode;

        obj.reportType = this.reportType;
        obj.entityRPTCode = this.f.reportCode.value;
        if(CommonMethods.hasValue(this.f.year.value))
            obj.year = this.f.year.value;
        if(CommonMethods.hasValue(this.f.month.value))
            obj.month = this.f.month.value;

        const modalRef = this.activeModel.open(ReportView, CommonMethods.modalFullWidth);
        modalRef.componentInstance.rpt = obj;
    }

    searchfilter() {
        environment.pageIndex = "0";
        if (this.f.datefrom.value > this.f.dateto.value)
            return this._alert.warning("Date to should be greater than date from");
        this.getSearchObj();
        this.currentSelectedIndex = 0;
    }

    onPageIndexClicked(val: any) {
        this.currentSelectedIndex = val;
        environment.pageIndex = val;
        this.getSearchObj();
    }

    getSearchObj() {
        if (!CommonMethods.hasValue(this.f.reportCode.value))
            return this._alert.warning("Please select log report");

        let obj = new ReportSearchBO();
        obj.refCode = this.f.refCode.value;
        obj.dateFrom = this.f.datefrom.value;
        obj.dateTo = this.f.dateto.value;
        obj.reportCode = this.f.reportCode.value;
        obj.pageIndex = environment.pageIndex;
        obj.matID = this.materials.selectedId;
        this._service.getSearchResult(obj);
    }


    onActionClicked(evt) {
        this.entityActID = evt.val.entityActID;
        this.rptVersionCode = evt.val.versionCode;
        this.GetReport();
    }

    clear() {
        this.f.reportCode.setValue('');
        this.materials.clear();
        this.rptChange();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
