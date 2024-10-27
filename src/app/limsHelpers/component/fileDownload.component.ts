import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileDownload } from '../entity/limsGrid';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import FileSaver from 'file-saver';

@Component({
    selector: 'file-download',
    templateUrl: '../html/fileDownload.html'
})

export class FileDownloadComponent {

    fileType: string = 'doc';
    count: number = 0;

    subscription: Subscription = new Subscription();

    downloadUserUploadFile(documentName: string, entityCode: string, fileUploadID: number, documentActualName: string, section: string) {
        var obj: FileDownload = new FileDownload();
        obj.fileUploadID = fileUploadID;
        obj.entityCode = entityCode;
        obj.section = section;
        obj.documentActualName = documentActualName;
        obj.documentName = documentName;

        if (CommonMethods.hasValue(documentActualName))
            this.fileType = documentActualName.split('.')[1];

    }

    downLoadingFile() {
        var path = 'AUDIT_CUSTOMER/Training Sheet- Mahesh.xlsx';
        var fileName = 'Training Sheet- Mahesh.xlsx'
        var fileType = this.fileFormat(fileName);
        var obj = { name: fileName, type: fileType };
    }

    fileFormat(fileName: string) {
        //file type extension
        let checkFileType = fileName.split('.');
        var fileType;

        switch ('.' + checkFileType[1]) {
            case '.doc':
                fileType = "application/vnd.ms-word";
                break;
            case '.docx':
                fileType = "application/vnd.ms-word";
                break;
            case '.txt':
                fileType = "text/plain";
                break;
            case '.pdf':
                fileType = "application/pdf";
                break;
            case '.png':
                fileType = "image/png";
                break;
            case '.xls':
                fileType = 'application/vnd.ms-excel'
                break;
            case '.xlsx':
                fileType = 'application/vnd.ms-excel'
                break;
            case '.jpg':
                fileType = 'image/jpeg'
                break;
            case '.jpeg':
                fileType = 'image/jpeg'
                break;
            case '.gif':
                fileType = "image/gif";
                break;
            case '.csv':
                fileType = "text/csv";
                break;

            default:
                break;
        }

        return fileType;
    }

    convertBase64StringToBlob(resp: any, file: any) {
        var FileSaver = require('file-saver')
        var byteCharacters = atob(resp);
        let byteNumbers = new Array(byteCharacters.length);
        for (var i = 0; i < byteCharacters.length; i++)
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        let byteArray = new Uint8Array(byteNumbers)
        var blob = new Blob([byteArray], { type: file.type })
        FileSaver.saveAs(blob, file.name);
    }

    ngOnChanges() {
        if (this.count > 0) {
            this.count = 0;
            this.subscription.unsubscribe();
        }
    }
}