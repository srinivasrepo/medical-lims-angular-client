import { AfterContentInit, Component, OnDestroy } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material";
import { Subscription } from "rxjs";
import { addCommentComponent } from "src/app/common/component/addComment.component";
import { AlertService } from "src/app/common/services/alert.service";
import { GlobalButtonIconsService } from "src/app/common/services/globalButtonIcons.service";
import { CommonMethods, CustomLocalStorage, dateParserFormatter, LOCALSTORAGE_KEYS } from "src/app/common/services/utilities/commonmethods";
import { GridActions } from "src/app/common/services/utilities/constants";
import { SampleAnalysisMessages } from "../messages/sampleAnalysisMessages";
import { ManageSDMSDataBO, ManageSDMSDataBOList, ManageSDMSDataDetailsBO } from "../model/sampleAnalysisModel";
import { SampleAnalysisService } from "../service/sampleAnalysis.service";

@Component({
    selector: 'app-sdmsdata',
    templateUrl: '../html/manageSDMSData.html'
})
export class ManageSDMSDataComponent implements AfterContentInit, OnDestroy {

    encSamAnaTestID: string;
    entityCode: string;
    headersData: Array<any> = [];
    dataSource: any;
    actions: Array<string> = [GridActions.Invalid];
    isLoaderStart: boolean = false;

    sdmsData: ManageSDMSDataDetailsBO = new ManageSDMSDataDetailsBO();

    subscription: Subscription = new Subscription();

    constructor(private _service: SampleAnalysisService, public _global: GlobalButtonIconsService,
        private _dailogRef: MatDialogRef<ManageSDMSDataComponent>, private modal: MatDialog,
        private _alert: AlertService
    ) { }

    ngAfterContentInit() {
        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            if (resp.purpose == "getSDMSData") {
                this.isLoaderStart = false;
                if (resp.result.resultFlag == "SUCCESS")
                    this._alert.success(this.sdmsData.type == "MNG" ? SampleAnalysisMessages.manageSdmsData : SampleAnalysisMessages.manageSdmsDatainvalid);

                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result.list, 'arrayDateTimeFormat', 'dateReceived')));
                this.sdmsData = new ManageSDMSDataDetailsBO();
            }
        })

        this.prepareHeaders();
        this.manageSDMSData('GET');
    }

    prepareHeaders() {
        this.headersData = [];

        this.headersData.push({ columnDef: "isSelected", header: "", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-5per" });
        this.headersData.push({ columnDef: "sno", header: "S.No", cell: (element: any) => `${element.sno}`, width: "maxWidth-5per" });
        this.headersData.push({ columnDef: "dateReceived", header: "Date Received", cell: (element: any) => `${element.dateReceived}`, width: "maxWidth-25per" });
        this.headersData.push({ columnDef: "reportTitle", header: "Report Title", cell: (element: any) => `${element.reportTitle}`, width: "maxWidth-25per" });
        this.headersData.push({ columnDef: "prepRunNo", header: "Prep Run No", cell: (element: any) => `${element.prepRunNo}`, width: "maxWidth-25per" });
        this.headersData.push({ columnDef: "dataSource", header: "DataSource", cell: (element: any) => `${element.dataSource}`, width: "maxWidth-25per" });
    }

    saveSDMSData() {
        var count = this.dataSource && this.dataSource.data && this.dataSource.data.filter(x => x.isSelected == true).length;

        if (count > 0) {

            var list = new ManageSDMSDataBOList();

            console.log(this.dataSource.data);

            this.dataSource.data.filter(x => x.isSelected == true).forEach((item) => {
                var obj: ManageSDMSDataBO = new ManageSDMSDataBO();
                obj.id = item.sdmsid;
                list.push(obj);
            })

            console.log(list);

            this.manageSDMSData('MNG', list);
        }
        else
            this._alert.warning(SampleAnalysisMessages.atLeastOneSdmsData);

    }

    manageSDMSData(type: string, list: any = []) {

        this.sdmsData.encSamAnaTestID = this.encSamAnaTestID;
        this.sdmsData.type = type;
        this.sdmsData.list = list;
        this.sdmsData.entityCode = !this.entityCode ? CustomLocalStorage.getSession(LOCALSTORAGE_KEYS.ENTITYCODE) : this.entityCode;

        if (type == "MNG")
            this.isLoaderStart = true;

        this._service.getSDMSDataDetails(this.sdmsData);
    }

    onActionClicked(evt) {

        var list = new ManageSDMSDataBOList();
        list.push({ id: evt.val.sdmsid });

        // list.push({ id: 94 });

        const model = this.modal.open(addCommentComponent, CommonMethods.modalFullWidth);
        model.disableClose = true;
        model.componentInstance.isCommentType = false;
        model.componentInstance.type = "Uploads";
        model.componentInstance.pageTitle = "Remarks";
        model.afterClosed().subscribe(resp => {
            if (resp.result) {
                this.sdmsData.remarks = resp.val;
                this.manageSDMSData('INVALID', list);
            }
        })

    }

    cancel() {
        this._dailogRef.close();
    }

    clear() {
        this.headersData = [];
        this.dataSource = null;
        this.actions = [];
        this.sdmsData = null;
    }

    ngOnDestroy() {
        this.clear();
        this.subscription.unsubscribe();
    }

}