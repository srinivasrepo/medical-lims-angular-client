import { Component, Input, ViewChild } from "@angular/core";
import { UploadRequestBO, UploadFileBO, MergeUpload, InvalidUploadedFileBO } from "../model/uploadModel";
import { Subscription } from "rxjs";
import { UtilUploadsMessages } from "../messages/utilUploadsMessages";
import { MatDialog, MatDialogRef } from "@angular/material";
import { AlertService } from '../../common/services/alert.service';
import { LIMSHttpService } from '../../common/services/limsHttp.service';
import { ActionMessages, GridActions, LimsRespMessages, LookupCodes, } from '../../common/services/utilities/constants';
import { CommonMethods, dateParserFormatter } from '../../common/services/utilities/commonmethods';
import { ServiceUrls } from '../../common/services/utilities/serviceurls';
import { ConfirmationService } from 'src/app/limsHelpers/component/confirmationService';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { LIMSContextServices } from 'src/app/common/services/limsContext.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { SingleIDBO } from "src/app/common/services/utilities/commonModels";
import { addCommentComponent } from "src/app/common/component/addComment.component";

@Component({
    selector: 'medicallims-upload',
    templateUrl: '../html/upload.component.html'
})

export class UploadFiles {
    @Input() uploadBO: any;
    @Input() mode: string;
    @ViewChild('fileInput', { static: true }) fileUploadVar: any;
    type: string = 'SINGLE';
    tranBO: UploadRequestBO;
    headerData: any = [];
    tranarry: Array<string>;
    dataSource: any;
    dmsID: number = 0;
    userID: number = 1;
    modCode: string = 'QC'
    filesToUpload: Array<File> = [];
    actions: Array<string> = [];
    docSource: Array<string> = ["documentName"]
    subscription: Subscription = new Subscription();
    extentionList: Array<string> = ["doc", "docx", "Xls", "rar", "odt", "ppt", "pptx", "pptm", "pdf", "jpg", "tif", "png", "jpeg", "avi", "mkv", "mp4", "wmv", "xps", "mp3", "xlsx", "zip", "dwg", "dxf"];
    imageText: string = '';
    removable: boolean = true;
    uploadTitle: string = 'View Documents';
    documentInfo: LookupInfo;
    lkpCondition: string;
    updType: string = 'E';
    documentName: string;
    removeAction: any = { headerName: "FileUpload", action: GridActions.delete };
    @ViewChild('documents', { static: false }) documents: LookupComponent
    isLoaderStart: boolean = false;
    isLoaderStartIcn: boolean;
    isShowCumulativeRpt: boolean = false;

    constructor(public activeModal: MatDialogRef<UploadFiles>, private _limsHttpService: LIMSHttpService,
        private _toaster: AlertService, private _limsContext: LIMSContextServices
        , private _confirm: ConfirmationService, public _global: GlobalButtonIconsService, public modal: MatDialog
    ) { }

    ngOnInit() {
        this.activeModal.updateSize("75%");
        this.tranBO = this.uploadBO;
    }

    ngAfterViewInit() {
        this.BindDocuments();

        if (this.mode == "MANAGE" && this.tranBO.section != 'DMS_REPORT') {
            this.actions.push(GridActions.delete, GridActions.Invalid);
            this.uploadTitle = 'Upload Documents'
        }

        if (this.mode == 'VIEW' || CommonMethods.hasValue(this.tranBO.encryptedKey))
            this.actions.push(GridActions.view);

        this.documentInfo = CommonMethods.PrepareLookupInfo(LKPTitles.Documents, LookupCodes.DMSMappedDocuments, LKPDisplayNames.DocName, LKPDisplayNames.DocNo, LookUpDisplayField.code, LKPPlaceholders.Documents, this.lkpCondition, "")
    }

    BindDocuments() {

        this.subscription = this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.getDouments,
            []), this.tranBO)
            .subscribe(resp => {
                this.prepareGridHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp, "arrayDateTimeFormat", 'uploadedOn'));
            })
    }

    prepareGridHeaders() {
        this.headerData = [];
        if (this.mode == "MANAGE")
            this.headerData.push({ "columnDef": 'isDocSelect', "header": "", "sourceField": "isSelected", cell: (element: any) => `${element.isSelected}`, width: "maxWidth-7per" });
        this.headerData.push({ "columnDef": 'documentActualName', "header": "Document Name / Document Number", "sourceField": "documentActualName", cell: (element: any) => `${element.documentActualName}`, width: "minWidth-20per" });
        this.headerData.push({ "columnDef": 'uploadedBy', "header": "Uploaded By", "sourceField": "uploadedBy", cell: (element: any) => `${element.uploadedBy}`, width: "maxWidth-25per" });
        this.headerData.push({ "columnDef": 'uploadedOn', "header": "Uploaded On", "sourceField": "uploadedOn", cell: (element: any) => `${element.uploadedOn}`, width: 'maxWidth-20per' });
    }


    fileChangeEvent(fileInput: any) {
        if (fileInput.target.files.length >= 1)
            this.filesToUpload = <Array<File>>fileInput.target.files;
        var size = this.filesToUpload[0].size
        var filename = this.filesToUpload[0].name;
        this.imageText = filename;

        if (this.imageText.length > 100) {
            this.clearFile();
            return this._toaster.warning("File name should be lesser than 100 characters");
        }

        var extention = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        var index = this.extentionList.findIndex(objData => objData == extention.toLowerCase())
        if (index < 0) {
            this._toaster.warning("." + extention + " files won't allow to upload");
            this.clearFile();
        }
        if (CommonMethods.hasValue(size)) {
            size = size / 1000 / 1000;
            if (size > 4) {
                this._toaster.warning(LimsRespMessages.fileSizeErr);
                this.clearFile();
            }

        }

    }

    selectDocument(evt) {
        this.documentName = CommonMethods.hasValue(evt.val) ? evt.val.name : "";
    }

    documentChange() {
        if (this.updType == 'E') {
            this.filesToUpload = [];
            this.imageText = '';
        }
        else {
            this.documents.clear();
            this.documentName = "";
        }

    }

    upload() {
        if ((this.type == 'SINGLE' || this.updType == 'N') && this.filesToUpload.length < 1) {
            this._toaster.warning(UtilUploadsMessages.fileUploadMandatory);
            return;
        }
        else if (this.type == 'BOTH' && this.updType == 'E' && !CommonMethods.hasValue(this.documents.selectedId)) {
            this._toaster.warning(UtilUploadsMessages.selectDocument);
            return;
        }

        if (this.tranBO.section == "DMS_REPORT") {
            this._confirm.confirm(UtilUploadsMessages.updateReport).subscribe(re => {
                if (re)
                    this.uploadService()
            })
        }
        else if (this.tranBO.section != 'DMS_REPORT')
            this.uploadService();
    }

    uploadService() {
        let formData: FormData = new FormData();
        for (var i = 0; i < this.filesToUpload.length; i++) {
            formData.append('uploadedFiles', this.filesToUpload[i], this.filesToUpload[i].name);
        }

        var docTrancID = CommonMethods.hasValue(this.documents) && CommonMethods.hasValue(this.documents.selectedId) ? this.documents.selectedId : 0;
        this.type == 'SINGLE' ? this.isLoaderStart = true : this.isLoaderStartIcn = true;
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.uploadDocument,
            [this.tranBO.entityCode, this.tranBO.encryptedKey, this.tranBO.section,
                'APP', this.dmsID.toString(), this.tranBO.refNumber, this._limsContext.limsContext.userDetails.roleName, docTrancID, this.documentName]), formData, null)
            .subscribe(resp => {
                if (resp.resultFlag == "SUCCESS" || resp.resultFlag == "Success") {
                    this.isLoaderStart = this.isLoaderStartIcn = false;
                    if (this.tranBO.section == 'DMS_REPORT')
                        this._toaster.success(LimsRespMessages.reportUpdated)
                    else
                        this._toaster.success(LimsRespMessages.fileSuccess)
                    if (!CommonMethods.hasValue(this.tranBO.encryptedKey))
                        this.tranBO.fileUploadedIDs.push({ ID: resp.dmsTempID });
                    this.BindDocuments();
                    this.clearFile()
                }
                else {
                    this.isLoaderStart = this.isLoaderStartIcn = false;
                    this._toaster.error(resp);
                }
            })
    }

    onActionClicked(evt) {
        if (evt.action == "DELETE") {
            this._confirm.confirm(UtilUploadsMessages.confirmDelete).subscribe((confirmed) => {
                if (confirmed) {
                    var obj = new UploadFileBO();
                    obj.section = this.tranBO.section;

                    if (evt.val.dmsID)
                        obj.dmsID = evt.val.dmsID;

                    if (evt.val.fileUploadID)
                        obj.entityActID = evt.val.fileUploadID;
                    obj.role = this._limsContext.limsContext.userDetails.roleName;
                    obj.type = CommonMethods.hasValue(this.tranBO.encryptedKey) ? 'File' : 'TEMP_FILE';
                    this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.deleteDocument,
                        []), obj)
                        .subscribe(resp => {
                            if (resp == "SUCCESS" || resp == 'Success') {
                                this._toaster.success(LimsRespMessages.deleteItem);
                                this.BindDocuments();
                            } else
                                this._toaster.error(resp);
                        })
                }
            })
        }
        else if (evt.action == GridActions.Invalid) {

            const model = this.modal.open(addCommentComponent,CommonMethods.modalFullWidth);
            model.disableClose = true;
            model.componentInstance.isCommentType = false;
            model.componentInstance.type = "Uploads";
            model.componentInstance.pageTitle = "Remarks";
            // this._confirm.confirm(UtilUploadsMessages.confirmInvalidUploadFile).subscribe((confirmed) => {
            model.afterClosed().subscribe(resp =>{
                if (resp.result) {
                    var obj: InvalidUploadedFileBO = new InvalidUploadedFileBO();
                    obj.entityActID = this.tranBO.encryptedKey;
                    obj.entityCode = this.tranBO.entityCode;
                    obj.refNumber = this.tranBO.refNumber;
                    obj.role = this._limsContext.limsContext.userDetails.roleName;
                    obj.utilID = evt.val.dmsID;
                    obj.remarks = resp.val;

                    this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.invalidUploadFile,
                        []), obj).subscribe(resp => {
                            if (resp == "OK") {
                                this._toaster.success(LimsRespMessages.invalidUploadFile);
                                this.BindDocuments();
                            }
                            else
                                this._toaster.error(resp);
                        })
                }
            })



        }
    }

    mergeUploadFiles() {

        var data = this.dataSource.data.filter(x => CommonMethods.hasValue(x.select))
        if (!CommonMethods.hasValue(data) || data.length < 2)
            return this._toaster.warning(UtilUploadsMessages.slectMergeDoc);

        var obj: MergeUpload = new MergeUpload();
        obj.encEntActID = this.tranBO.encryptedKey;
        obj.entityCode = this.tranBO.entityCode;
        obj.sectionCode = obj.insertSection = this.tranBO.section;
        obj.referenceNumber = this.tranBO.refNumber;
        obj.list = [];
        data.forEach(x => {
            var item: SingleIDBO = new SingleIDBO();
            item.id = x.dmsID;
            obj.list.push(item);
        })

        const modal = this.modal.open(addCommentComponent, { width: "600px" });
        modal.disableClose = true;
        modal.componentInstance.pageTitle = "Document Name";
        modal.componentInstance.comment = this.tranBO.refNumber + "_MergedReport";
        modal.componentInstance.isCommentType = false
        modal.afterClosed().subscribe(res => {
            if (res.result) {
                obj.fileName = res.val;
                this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.mergeUploadFiles,
                    []), obj)
                    .subscribe(resp => {
                        if (resp == "OK") {
                            this._toaster.success(LimsRespMessages.mergerFiles);
                            this.BindDocuments();
                        } else
                            this._toaster.error(resp);
                    })
            }
        })

    }

    generateCumulativeReport() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.generateCumulativeArdsReport,
            [this.tranBO.encryptedKey, this.tranBO.entityCode]))
            .subscribe(resp => {
                if (resp == "OK") {
                    this._toaster.success(UtilUploadsMessages.generateCumulative);
                    this.BindDocuments();
                } else
                    this._toaster.error(ActionMessages.GetMessageByCode(resp));
            })
    }

    close() {
        if (this.tranBO.section == 'TSTDOCS') {
            var hasDocs: boolean = this.dataSource.data.length > 0;
            this.activeModal.close(hasDocs);
        }
        else
            this.activeModal.close(this.tranBO.fileUploadedIDs);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    clearFile() {
        //this.fileUploadVar.nativeElement.value = "";
        this.filesToUpload = [];
        this.imageText = '';
        this.documentName = "";
        if (CommonMethods.hasValue(this.documents))
            this.documents.clear();
    }

    remove() {
        this.clearFile();
    }

}

