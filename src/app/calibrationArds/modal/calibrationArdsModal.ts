export class calibrationArdsHeaderBO {
    eqpCategory: string;
    eqpType: string;
    eqpTitle: string;
    eqpCode: string;
    scheduleType: string;
    schDate: any;
    schStartDate: any;
    status: string;
    periodType: string;
    hasDeviation: boolean;
    encEqpMinSchID: string;
    schEndDate: any;
    calibPramID: number;
    ardsMode: string;
    specResetDeviation: boolean;
    hasPrimaryOccSubmitted: Boolean;
    specNumber: string;
    docStatus: string
    conditionCode: string;
}

export class SearchEquipmentMaintenance{
    pageIndex : number;
    pageSize : number;
    statusID : number;
    equipmentID : number;
    equipment: string;
    type : number;
    category : number;
    dateFrom : Date;
    dateTo : Date;
    schType : number;
    advanceSearch : string;
    schDate :Date;
    calibParamID : number;
    calibParamName : string;
    maintanceRptID : number;
    maintanceRptName : string;
    executionMode : number;
    executionOn : Date;
    showDateCrossedRecords : boolean;
}

export class GetEquipmentType{
    categoryID : number
    schTypeID : number;
}

export class EQUPMAINInsertNewRequest{
    eqpMaintID : number;
    scheduleDate : Date;
}