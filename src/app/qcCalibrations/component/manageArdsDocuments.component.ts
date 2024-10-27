import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { QCCalibrationsService } from '../services/qcCalibrations.service';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { AlertService } from 'src/app/common/services/alert.service';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, GridActions } from 'src/app/common/services/utilities/constants';
import { ManageArdsDocuments } from '../models/qcCalibrationsModel';
import { QCCalibrationMessages } from '../messages/qcCalibrationMessages';
import { MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-mngards-doc',
    templateUrl: '../html/manageArdsDocuments.html'
})

export class ManageArdsDocumentsComponent {

    pageTitle: string = PageTitle.manageArdsDocuments;

    headersData: any = [];
    dataSource: any = [];
    actions: any = [GridActions.delete];
    removeActions = { headerName: "manageArdsDoc" }

    documentInfo: LookupInfo;
    @ViewChild('documents', { static: false }) documents: LookupComponent;

    @Input() encCalibParamID: string;

    manageArdsObj: ManageArdsDocuments = new ManageArdsDocuments();

    subscription: Subscription = new Subscription();
    isLoaderStart: boolean;

    constructor(private _service: QCCalibrationsService, public _global: GlobalButtonIconsService,
        private _alert: AlertService, private _dialogRef: MatDialogRef<ManageArdsDocumentsComponent>) { }

    ngAfterViewInit() {
        this.subscription = this._service.qcCalibrationsSubject.subscribe(resp => {
            if (resp.purpose == "manageArdsDocuments") {
                this.isLoaderStart = false;
                if (resp.mode == "ADD") {
                    if (resp.result.returnFlag == "SUCCESS") {
                        this.documents.clear();
                        this._alert.success(QCCalibrationMessages.addDocuments);
                    }
                    else
                        this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }
                else if (resp.mode == "DEL") {
                    if (resp.result.returnFlag == "SUCCESS")
                        this._alert.success(QCCalibrationMessages.delDocuments);
                    else
                        this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                }
                if (resp.mode == null && CommonMethods.hasValue(resp.result.returnFlag))
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.returnFlag));
                sessionStorage.setItem("REFERESH_ACTIONS", 'true');
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result.getArdsDocuments,
                    "filterTwiceCol", ["effectiveFrom", "effectiveTo"]));

            }
        })

        this.prepareLkp();
        this.prepareHeaders();
        this.manageArdsObj.encCalibParamID = this.encCalibParamID;
        this.manageDoc("");
    }

    prepareLkp() {
        this.documentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Documents, LookupCodes.DMSMappedDocuments,
            LKPDisplayNames.DocName, LKPDisplayNames.DocNo, LookUpDisplayField.code, LKPPlaceholders.Documents, "ENTITY_CODE = 'CAL_PARAM_SET' AND STATUS_CODE = 'ACT'")
    }

    prepareHeaders() {
        this.headersData.push({ "columnDef": 'docNumber', "header": "Document Number", cell: (element: any) => `${element.docNumber}`, width: 'maxWidth-20per' });
        this.headersData.push({ "columnDef": 'docName', "header": "Document Name", cell: (element: any) => `${element.docName}`, width: 'maxWidth-35per'  });
        this.headersData.push({ "columnDef": 'status', "header": "Document Status", cell: (element: any) => `${element.status}`, width: 'maxWidth-15per' });
        this.headersData.push({ "columnDef": 'effectiveFrom', "header": "Effective From", cell: (element: any) => `${element.effectiveFrom}`, width: 'maxWidth-12per'  });
        this.headersData.push({ "columnDef": 'effectiveTo', "header": "Effective To", cell: (element: any) => `${element.effectiveTo}`, width: 'maxWidth-12per'  });
    }

    manageDoc(mode: string) {
        this.manageArdsObj.mode = mode;
        if(mode == 'ADD')
         this.isLoaderStart = true;
        this._service.manageArdsDocuments(this.manageArdsObj);
    }

    addDocument() {
        var errMsg: string = this.validate();
        if (CommonMethods.hasValue(errMsg))
            return this._alert.warning(errMsg);

        this.manageArdsObj.docTrackID = this.documents.selectedId;
        this.manageDoc("ADD");
    }

    onActionClicked(evt) {
        if (evt.action == "DELETE") {
            this.manageArdsObj.docTrackID = evt.val.docTracID;
            this.manageDoc("DEL");
        }
    }

    validate() {

        if (!CommonMethods.hasValue(this.documents.selectedId))
            return QCCalibrationMessages.selectDocuments;
        else if (CommonMethods.hasValue(this.dataSource.data.filter(x => x.docTracID == this.documents.selectedId && !CommonMethods.hasValue(x.effectiveTo))))
            return QCCalibrationMessages.dupDoc

    }

    closeModel() {
        this._dialogRef.close();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}