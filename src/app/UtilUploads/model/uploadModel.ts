import { SingleIDBO } from "src/app/common/services/utilities/commonModels";

export class UploadRequestBO {
    public entityCode: string;
    public entityActID: number;
    public section: string;
    public encryptedKey: string;
    public fileUploadedIDs: any;
    public type: string;
    public refNumber: string;
}

export class UploadFileBO {
    dmsID: number;
    entityActID: string;
    section: string;
    role: string;
    type: string;
}

export class MergeUpload {
    encEntActID: string;
    entityCode: string;
    sectionCode: string;
    list: Array<SingleIDBO> = [];
    insertSection: string;
    referenceNumber: string;
    fileName: string;
}

export class InvalidUploadedFileBO {
    entityCode: string;
    entityActID: any;
    utilID: number;
    refNumber: string;
    loginID: string;
    role: string;
    plantCode: string;
    deptCode: string;
    remarks : string;
}