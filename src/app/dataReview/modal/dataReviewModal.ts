import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class GetTestBO {
    requestID: number;
    entityCode: string;
    requestType: string;
}

export class ManageDataReview {
    encReviewID: string;
    entityCode: string;
    requestType: number;
    requestID: number;
    initTime: string;
    observations: string;
    recommendations: string;
    remarks: string;
    applicationSoftware : string;
    dataFileNo : string;
    lst: Array<SingleIDBO>;
    checkLst: Array<CheckList>;
}

export class CheckList {
    reviewItemID: number;
    rawDataVerified: string;
    electronicDataVerified: string;
    remarks: string;
}

export class SearchDataReview {
    requestType: number;
    statusID: number;
    pageIndex: number;
    totalRecords: number;
    entityCode: string;
    requestCode: string;
    status: string;
    analysisType: number;
    dateOfReviewFrom: Date;
    dateOfReviewTo: Date;
    arID:number;
    ArName: string;
    maintanceRptID : number;
    matID :number;
    matName:string;
    instrumentID : number;
    instrumentName : string;
    invID : number;
    invName : string;
    scheduleType: number;
    matCategoryID: number;
    matCategoryName: string;
    catCode: string;

    sampleID : number;
    sampleName : string;
    advanceSearch : string;
    maintanceRptName:string;
    initiatedOn : Date;
    initiatedBy : number;
    initiatedByName : string;
    userID: number;
}