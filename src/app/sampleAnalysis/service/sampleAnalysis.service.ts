import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LIMSHttpService } from 'src/app/common/services/limsHttp.service';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { SampleAnalysisServiceUrl } from './sampleAnalysisServiceUrl';
import { mobilePhaseServiceUrl } from 'src/app/mobilePhase/services/mobilePhaseServiceUrl';
import { ServiceUrls } from 'src/app/common/services/utilities/serviceurls';
import { ManageArdsBO, DiscardPrintRequestBO, ManageAnalysisOccupancyBO, ManageTestSampleRRTValuesBO, analysisRemarks, SaveInputValue, FormulaData, IncludeExcludeTestBOList, ManageSDMSInputDetails, IncludeExcludeTestBOItems, ManageFinalFormulaBO, ContainerArdsBO, SendForReview, ManageViewResetReportBO, ArdsReportBO, GetArdsPrintDoc, AddArdsReview, SkipPacks, ManageImpurityBasicInfoBO, ManageImpurityAssignSdmsBOList, SwitchArds, ColumnBO, ConfirmImpMapping, ManageSDMSDataDetailsBO } from '../model/sampleAnalysisModel';
import { manageSamplingInfo } from '../model/sampleAnalysisModel';
import { InvalidateBO } from 'src/app/volumetricSolution/model/volumetricSolModel';
import { VolumetricSolServiceUrl } from 'src/app/volumetricSolution/service/volumetricSolServiceUrl';
import { QCInvtServiceUrls } from 'src/app/QCInventory/service/QCInvServiceUrls';
import { GetBlockList } from 'src/app/QCInventory/model/QCInventorymodel';

@Injectable()

export class SampleAnalysisService {
    sampleAnlaysisSubject: Subject<any> = new Subject();

    constructor(private _limsHttpService: LIMSHttpService) { }

    searchSampleAnalysis(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.searchSampleAnalysis, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "searchSampleAnalysis" });
        });
    }

    getAnalysisHeaderInfo(encSioID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisHeaderInfo, [encSioID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getAnalysisHeaderInfo" });
        });
    }

    getStatuslist(entityCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(mobilePhaseServiceUrl.getStatusList, [entityCode])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getStatuslist" });
        });
    }

    getAnalysisTypes() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisTypes, [])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getAnalysisTypes" });
        });
    }

    getSupplierCOADetails(encSioID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSupplierCOADetails, [encSioID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSupplierCOADetails" });
        });
    }

    manageSupplierCOADetails(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageSupplierCOADetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageSupplierCOADetails" });
        });
    }

    getSpecificationsBySIOID(encEntityActID: string, entityCode: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSpecifications, [encEntityActID, entityCode])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSpecificationsBySIOID" });
        });
    }

    getCatItemsByCatCode(catCode: string, type: string = "MNG") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.GetCatItemsByCatCode, [catCode, type]))
            .subscribe(resp => {
                this.sampleAnlaysisSubject.next({ result: resp, purpose: catCode });
            });
    }

    getAssignedDocsBySpecID(obj: GetArdsPrintDoc) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAssignedDocsBySpecID, []), obj)
            .subscribe(resp => {
                this.sampleAnlaysisSubject.next({ result: resp, purpose: "getAssignedDocsBySpecID", type: obj.type });
            });
    }

    ardsGetAssignedDocs(encEntActID: string, sourceCode) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.ardsGetAssignedDocs, [encEntActID, sourceCode]))
            .subscribe(resp => {
                this.sampleAnlaysisSubject.next({ result: resp, purpose: 'ardsGetAssignedDocs', type: sourceCode });
            });
    }

    ardsManageRequest(obj: ManageArdsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.ardsManageRequest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "ardsManageRequest" });
        });
    }

    ardsSelectionPrint(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(ServiceUrls.ardsSelectionPrint, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "ardsSelectionPrint" });
        });
    }

    containerARDSSelectionPrint(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.containerARDSSelectionPrint, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "containerARDSSelectionPrint" });
        });
    }

    ardsDiscardPrintRequest(obj: DiscardPrintRequestBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.ardsDiscardPrintRequest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "ardsDiscardPrintRequest" });
        });
    }

    getConvertableUOMByMatID(matID, encSioID: string = "") {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.GetConvertableUOMBySioMatID, [matID, encSioID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getConvertableUOMByMatID' });
        });
    }

    mangeSampleAnalysis(obj: manageSamplingInfo) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.mangeSampleAnalysis, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'mangeSampleAnalysis' });
        });
    }

    getSamplingInfo(encSioID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSamplingInfo, [encSioID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getSamplingInfo' });
        });
    }

    getIssuedContainerDetails(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getIssuedContainerDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getIssuedContainerDetails" });
        });
    }

    manageSamplePacks(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageSamplePacks, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageSamplePacks" });
        })
    }

    getAnalysisTestBySioID(encEntityActID: string, entityCode: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisTestBySioID, [encEntityActID, entityCode])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getAnalysisTestBySioID' });
        });
    }

    getCurrentDateTime(type: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(ServiceUrls.getCurrentDateTime, [])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: type });
        });
    }

    getSampleTestInfo(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSampleTestInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSampleTestInfo" });
        });
    }

    getResultStatus(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getResultStatus, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getResultStatus" });
        });
    }

    updateTestResults(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.updateTestResults, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "updateTestResults" });
        });
    }

    saveAnalysis(obj: analysisRemarks) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.saveAnalysis, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "saveAnalysis" });
        });
    }

    raiseDeviation(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.raiseDeviation, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: obj.dcActionCode });
        });
    }

    getInstrumentsForTest(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getInstrumentsForTest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getInstrumentsForTest" });
        });
    }

    getEQPUGetEqpTypeCode(equipID: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getEQPUGetEqpTypeCode, [equipID.toString()])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getEQPUGetEqpTypeCode" });
        });
    }

    getCumulativeCount(columnID: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getCumulativeCount, [columnID.toString()])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getCumulativeCount" });
        });
    }

    getTestInstruments(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getTestInstruments, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getTestInstruments" });
        });
    }

    insertNUpdateInstruments(obj: ManageAnalysisOccupancyBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.insertNUpdateInstruments, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "insertNUpdateInstruments" });
        });
    }

    getInstrumnetDetailsByID(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getInstrumnetDetailsByID, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getInstrumnetDetailsByID" });
        });
    }

    deleteInstrumnetDetailsByID(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.deleteInstrumnetDetailsByID, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "deleteInstrumnetDetailsByID" });
        });
    }

    invalidInstOccupancy(obj){
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.invalidInstOccupancy, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "invalidInstOccupancy" });
        });
    }

    manageTestSampleRRTValues(obj: ManageTestSampleRRTValuesBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageTestSampleRRTValues, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageTestSampleRRTValues" });
        });
    }

    saveInputValues(obj: SaveInputValue) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.saveInputValues, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "saveInputValues", type: obj.isFormulaEval });
        });
    }

    getAdditionalTest(obj: any) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAdditionalTest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getAdditionalTest" });
        });
    }

    manageAdditionalTest(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageAdditionalTest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageAdditionalTest" });
        });
    }

    deleteAdditionalTest(addTestID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.deleteAdditionalTest, [addTestID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "deleteAdditionalTest" });
        });
    }

    updateFinalRemarks(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.updateFinalRemarks, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "updateFinalRemarks" });
        });
    }

    getFormulaDependentDetails(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getFormulaDependentDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getFormulaDependentDetails" });
        });
    }

    executeFormula(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.executeFormula, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "executeFormula" });
        });
    }

    executeMultipleFormulas(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.executeMultipleFormulas, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "executeMultipleFormula" });
        });
    }

    confirmEArds(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.confirmEArds, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "confirmEArds" });
        });
    }

    manageIncludeExcludeTest(obj: IncludeExcludeTestBOItems) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageIncludeExcludeTest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageIncludeExcludeTest" });
        });
    }

    getSDMSDataBySamAnaTestID(encSamAnalysisTestID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSDMSDataBySamAnaTestID, [encSamAnalysisTestID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSDMSDataBySamAnaTestID" });
        });
    }


    manageSDMSInputDetails(obj: ManageSDMSInputDetails) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageSDMSInputDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageSDMSInputDetails" });
        });
    }

    invalidateTest(obj: InvalidateBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(VolumetricSolServiceUrl.InvalidateRequest, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "invalidateTest" });
        });
    }

    getMappingInfo(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getMappingInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getMappingInfo' });
        });
    }

    manageIsFinalFormula(obj: ManageFinalFormulaBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageIsFinalFormula, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'manageIsFinalFormula' });
        });
    }

    getMaterialDetailsByID(matID: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getMaterialDetailsByID, [matID.toString()])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getMaterialDetailsByID" });
        });
    }

    getAnalysisTypesByID(id: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getAnalysisTypesByID, [id.toString()])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getAnalysisTypes" });
        })
    }

    getSampleSources() {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSampleSources, [])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSampleSources" });
        })
    }

    containerWiseMaterials(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.containerWiseMaterials, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "containerWiseMaterials", type: obj.type });
        })
    }

    getTestByCategory(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getTestByCategory, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getTestByCategory' });
        });
    }

    getContainerWiseAnalysis(encSioID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getContainerWiseAnalysis, [encSioID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getContainerWiseAnalysis' });
        })
    }

    saveContainerArdsDetails(obj: ContainerArdsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.saveContainerArdsDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'saveContainerArdsDetails' });
        });
    }

    getTestByID(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getTestByID, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getTestByID' });
        });
    }

    getCalibrationReportDetails(obj: ArdsReportBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getCalibrationReportDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getCalibrationReportDetails' });
        });
    }

    sendTestForReview(obj: SendForReview) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.sendTestForReview, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'sendTestForReview' });
        });
    }

    getNewSampleRequests(encOOSTestID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getNewSampleRequests, [encOOSTestID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getNewSampleRequests' });
        });
    }

    manageViewResetReport(obj: ManageViewResetReportBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageViewResetReport, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'manageViewResetReport', type: obj.type });
        });
    }
    viewARDSReport(obj: ManageViewResetReportBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageViewResetReport, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'viewARDSReport' });
        });
    }

    downloadReport(obj: ManageViewResetReportBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.downloadReport, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'downloadReport' });
        })
    }

    getFileName(reportID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getFileName, [reportID, 'File'])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'getFileName' });
        });
    }

    updatePlaceholderValues(obj: ArdsReportBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.updatePlaceholderValues, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'updatePlaceholderValues' });
        });
    }

    viewARDSMasterDocument(documnetID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.viewARDSMasterDocument, [documnetID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "viewARDSMasterDocument" });
        });
    }

    viewARDSPrintDocument(dmsID: any, plantOrgCode: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.viewARDSPrintDocument, [dmsID, plantOrgCode])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "viewARDSPrintDocument" });
        });
    }

    addArdsReviewComment(obj: AddArdsReview) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.addArdsReviewComment, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'addArdsReviewComment' });
        });
    }

    skipPacksFromAnalysis(obj: SkipPacks) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.skipPacksFromAnalysis, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: 'skipPacksFromAnalysis' });
        });
    }

    skipInpurFieldFromExecution(obj: ManageFinalFormulaBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.skipInpurFieldFromExecution, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "skipInpurFieldFromExecution", type: obj.type });
        });
    }

    getPackTestsForSendToReview(encSioID: string, specCatID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getPackTestsForSendToReview, [encSioID, specCatID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getPackTestsForSendToReview" });
        });
    }

    getSTPCommonDataforMapping(encEntActID: string) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSTPCommonDataforMapping, [encEntActID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSTPCommonDataforMapping" });
        });
    }

    manageSTPCommonData(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageSTPCommonData, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageSTPCommonData" });
        });
    }

    manageImpurityBasicInfo(obj: ManageImpurityBasicInfoBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageImpurityBasicInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageImpurityBasicInfo" });
        });
    }

    getUnknownImpurities(ardsExecID: number) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getUnknownImpurities, [ardsExecID.toString()])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getUnknownImpurities" });
        });
    }

    manageImpuritySDMSDetails(obj: ManageImpurityAssignSdmsBOList) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageImpuritySDMSDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageImpuritySDMSDetails" });
        });
    }

    manageMultipleFormulaValues(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageMultipleFormulaValues, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageMultipleFormulaValues" });
        });
    }

    getDynamicFormulaInfo(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getDynamicFormulaInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getDynamicFormulaInfo" });
        });
    }

    getDyncFormulaDependentData(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getDyncFormulaDependentData, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getDyncFormulaDependentData" });
        });
    }

    executeDynamicFormulaData(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.executeDynamicFormulaData, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "executeDynamicFormulaData", id: obj.impurityValueID });
        });
    }

    deleteImpurity(impurityID) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.deleteImpurity, [impurityID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "deleteImpurity" });
        });
    }

    switchARDSMode(obj: SwitchArds) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.switchARDSMode, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "switchARDSMode" });
        });
    }

    getBlockByPlantID(obj: GetBlockList) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(QCInvtServiceUrls.getBlockByPlantID, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getBlockByPlantID" });
        })
    }

    skipUnknownImpurities(obj) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.skipUnknownImpurities, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "skipUnknownImpurities", type: obj.type });
        });
    }

    manageColumnInfo(obj: ColumnBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.manageColumnInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "manageColumnInfo" });
        });
    }

    deleteColumnInfo(obj: ColumnBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.deleteColumnInfo, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "deleteColumnInfo" });
        });
    }

    confirmImpMapping(obj: ConfirmImpMapping) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.confirmImpMapping, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "confirmImpMapping", type: obj.mappingType });
        });
    }

    getTableResultSetExecution(ardsExecID: any, resultSetID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getTableResultSetExecution, [ardsExecID, resultSetID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getTableResultSetExecution" });
        });
    }

    executeSystemFormulas(obj: FormulaData) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.executeSystemFormulas, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "executeSystemFormulas" });
        });
    }

    getRefEqpOthInfo(eqpOthID: any) {
        this._limsHttpService.getDataFromService(CommonMethods.formatString(SampleAnalysisServiceUrl.getRefEqpOthInfo, [eqpOthID])).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getRefEqpOthInfo" });
        });
    }

    getSDMSDataDetails(obj: ManageSDMSDataDetailsBO) {
        this._limsHttpService.postDataToService(CommonMethods.formatString(SampleAnalysisServiceUrl.getSDMSDataDetails, []), obj).subscribe(resp => {
            this.sampleAnlaysisSubject.next({ result: resp, purpose: "getSDMSData" });
        });
    }

}