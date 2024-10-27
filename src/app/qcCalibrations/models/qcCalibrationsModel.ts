import { SingleIDBO } from 'src/app/common/services/utilities/commonModels';

export class GetQCCalibrationDetailsBO {
    instrumentType: number;
    instrumentID: number;
    title: string;
    instrumentTypeDesc: string;
    instrumentName: string;
    status: string;
    requestCode: string;
    initTime: string;
    instrumentTypeCode: string;
    manualReferenceNumber: string;
    obsoluteComments : string;
    actionBy : string;
    actionOn : Date;
}

export class QCCalibHeadersInfoBO {
    encCalibParamID: string;
    title: string;
    instrumentTypeID: number;
    instrumentID: number;
    initTime: string;
    uploadFiles: Array<SingleIDBO> = new Array<SingleIDBO>();
    instrumentList: Array<SingleIDBO> = new Array<SingleIDBO>();
    instrUserCodes: string;
    manualReferenceNumber: string;
    entityCode: string;
    role: string;
}

export class ManageQCCalibrationBO {
    encCalibParamID: string;
    categoryID: number;
    category: string;
    subCategoryID: number;
    subCategory: string;
    testID: number;
    specLimit: string;
    limitType: string;
    lowerLimit: any;
    upperLimit: any;
    list: AddResultBOList = new AddResultBOList();
    initTime: string;
    specTestID: number;
    isLowerLimitApp: boolean;
    isUpperLimitApp: boolean;
}

export class LimsSubscription {
    purpose: string;
    result: any;
}

export class AddResultBO {
    result: string;
    resultName: string;
}
export class AddResultBOList extends Array<AddResultBO>{ }

export class QCSPECDeleteTestMethodsBO {
    specTestID: number;
    initTime: string;
    encCalibParamID: string;
    categoryID: number;
    subCategoryID: number;
}

export class SearchQCCalibrationsBO {
    pageIndex: number;
    statusID: number;
    InstrumentType: number;
    instrument: string;
    instrumentID: number;
    instrumentName: string;
    calibrationID: number;
    calibrationName: string;
    title: string;
    advanceSearch: string;
    calibrationIDTo: number;
    calibrationIDToName: string;
    calibrationIDName: string;
    calibrationIDFrom: number;
    calibrationIDFromName: string;
    initiatedOn: Date;
    initiatedBy: number;
    initiatedByName: string;
}

export class ManageSTPGroupTestBO {
    encCalibParamID: string;
    templateID: number;
    initTime: string;
    specID: number;
    entityCode: string;
    list: STPGroupTestBOList = new STPGroupTestBOList();
}

export class STPGroupTestBO {
    encSpecCatID: string;
    isSelected: boolean;
}
export class STPGroupTestBOList extends Array<STPGroupTestBO>{ }

export class AssignInstrc {
    encCalibParamID: string;
    type: string;
    instrumentTypeID: number;
    list: Array<InstrumentList> = [];
}

export class InstrumentList {
    id: string;
    name: string;
    isSelect: boolean;
}

export class AssignPlant {
    encCalibParamID: string;
    type: string;
    list: Array<SingleIDBO> = new Array<SingleIDBO>();
}

export class ManageArdsDocuments {
    encCalibParamID: string;
    docTrackID: number;
    mode: string;
}

export class ManualRefNumber{
    entityCode : string;
    encEntActID : string;
    sectionCode : string;
    fileIds : Array<SingleIDBO> = [];
}

