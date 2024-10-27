export class ReportBO {
    versionCode: string;
    entActID: number;
    deptID: number;
    year: number;
    empID: number;
    plantID: number;
    topicHeaderID: number;
    topicID: number;
    reportType: string;
    dateFrom: Date;
    dateTo: Date;
    entityRPTCode:string;
    ardsExecID: string;
    month: number;
    dmsID: string;
}

export class ReportSearchBO {
    reportCode: string;
    empID: number;
    year: number;
    deptID: number;
    searchPlantID: number;
    refCode: string;
    dateFrom: Date;
    dateTo: Date;
    topicID: number;
    pageIndex: string;
    matID: number;
}

