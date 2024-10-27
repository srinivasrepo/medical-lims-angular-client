import { Component, OnDestroy, AfterContentInit, Input, ViewChild, OnInit } from "@angular/core";
import { ArdsSectionDataList, ArdsSectionBOList, InputDragValuesBOList, InputDragValuesBO, ManageSDMSInputDetails, AnalysisHeaderBO, GetCurrentAnalysisBO, deviation, GetArdsHeadersBO } from '../model/sampleAnalysisModel';
import { Store, select } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { PageTypeSection, ActionMessages, LookupCodes, EntityCodes, DCActionCode, PageUrls } from 'src/app/common/services/utilities/constants';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { Subscription } from 'rxjs';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import * as analysisActions from '../state/analysis/analysis.action';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { AlertService } from 'src/app/common/services/alert.service';
import { SampleAnalysisMessages } from '../messages/sampleAnalysisMessages';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { LKPTitles, LKPDisplayNames, LKPPlaceholders } from 'src/app/limsHelpers/entity/lookupTitles';
import { MatDialog } from "@angular/material";
import { DeviationHandler } from "src/app/common/component/deviationHandler.component";
import { Router } from "@angular/router";
import { ManageSDMSDataComponent } from "./manageSDMSData.component";

@Component({
    selector: 'mapping-inputs',
    templateUrl: '../html/mappingSdmsInputs.html',
    styleUrls: ['../css/sampleAnalysis.scss']
})
export class MappingSdmsInputsComponent implements OnInit, AfterContentInit, OnDestroy {

    // chipDatasource: Array<any> = [];

    dataSourceData: any;


    columns: Array<any> = [];
    displayedColumns: string[] = [];

    dynamicColumns: Array<any> = [];
    dynamicDisplayedColumns: string[] = [];

    objectHeaders: Array<any> = [];


    selectedTabID: number;
    @Input() encSamAnalysisTestID: string;
    @Input() entityCode: string;
    @Input() sourceCode: string;
    @Input() pageType: string = 'MNG';

    headersData: any;
    dataSource: any;

    dynamicHeadersData: any;
    dynamicDataSource: any;



    // sdmsDetailsBO: any;

    sectionList: ArdsSectionBOList = new ArdsSectionBOList();
    sectionDetailsList: ArdsSectionDataList = new ArdsSectionDataList();
    getArdsInputsInfo: GetArdsHeadersBO;
    //  Left Drop List
    filteredDetailsList: ArdsSectionDataList = new ArdsSectionDataList();
    selectedList: InputDragValuesBOList = new InputDragValuesBOList();


    //Right Drag List
    inputDetailsList: any = [];

    showHidePageType: PageTypeSection = PageTypeSection.MAPPING_ARDS;


    manageSDMSDetails: ManageSDMSInputDetails = new ManageSDMSInputDetails();
    getTestInfo: any;

    //lkps
    arNumInfo: LookupInfo;
    testInfo: LookupInfo;
    sdmsInfo: LookupInfo;

    @ViewChild('arNumbers', { static: true }) arNumbers: LookupComponent;
    @ViewChild('tests', { static: true }) tests: LookupComponent;
    @ViewChild('sdmsData', { static: true }) sdmsData: LookupComponent;

    headerInfo: AnalysisHeaderBO = new AnalysisHeaderBO();

    getCurrentAnalysis: GetCurrentAnalysisBO = new GetCurrentAnalysisBO();
    objectInfo: any = {};
    invID: number;

    subscription: Subscription = new Subscription();

    constructor(private _store: Store<fromAnalysisOptions.AnalysisState>, private _service: SampleAnalysisService,
        public _global: GlobalButtonIconsService, private _alert: AlertService, private _matDialog: MatDialog, private _route: Router 
    ) { }


    ngOnInit() {

        this.prepareArLkp();

        this._store
            .pipe(select(fromAnalysisOptions.getAnalysisInfo))
            .subscribe(analysis => {
                this.headerInfo = analysis;
            });

        this._store
            .pipe(select(fromAnalysisOptions.getMappingCurrentAnalysis))
            .subscribe(analysis => {
                this.getCurrentAnalysis = analysis;
            });

        setTimeout(() => {
            if (this.getCurrentAnalysis.currentSamAnaTestID) {
                this.arNumbers.setRow(this.getCurrentAnalysis.arID, this.getCurrentAnalysis.arNumber);
                this.tests.setRow(this.getCurrentAnalysis.currentSamAnaTestID, this.getCurrentAnalysis.testName);


                this.prepareArLkp();

            }
        }, 1000);


    }

    ngAfterContentInit() {

        this._store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionList = getArdsInputsInfo
            });

        this._store
            .pipe(select(fromAnalysisOptions.getArdsInputsSectionDetailsListInfo))
            .subscribe(getArdsInputsInfo => {
                this.sectionDetailsList = getArdsInputsInfo;
            });

        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisPageTypeAction))
            .subscribe(pageTypeAction => {
                this.showHidePageType = pageTypeAction
            });

        this._store
            .pipe(select(fromAnalysisOptions.GetAnalysisTestInfo))
            .subscribe(testInfo => {
                this.getTestInfo = testInfo
            });

            this._store
            .pipe(select(fromAnalysisOptions.getArdsHeaderDataInfo))
            .subscribe(getArdsInputsInfo => {
                this.getArdsInputsInfo = getArdsInputsInfo;});

        this.selectedTabID = Number(localStorage.getItem('SELECTED_TAB') || 0);

        this.filteredDetailsList = [];
        this.selectedList = [];

        this.sectionList.filter(x => x.tabID == this.selectedTabID).forEach((item) => {
            this.sectionDetailsList.filter(details => details.sectionID == item.sectionID && (details.inputType == 'DEVICE' || details.inputType == "IFOT" || details.inputType == "RS232") && details.invalidationID == null).forEach((child) => {
                this.filteredDetailsList.push(child);
            })
        })


        this.filteredDetailsList.filter(x => x.value && x.keyName).forEach((ite) => {
            this.selectedList.push({ detailID: ite.detailID, value: ite.value, operationType: 'ADD', keyName: ite.keyName, field: this.getConvertedFieldName(ite.keyName), sdmsID: ite.sdmsID })
        })

        this.subscription = this._service.sampleAnlaysisSubject.subscribe(resp => {
            // if (resp.purpose == "getSDMSDataBySamAnaTestID") {

            //     this.chipDatasource = [];
            //     this.chipDatasource = dateParserFormatter.FormatDate(resp.result, 'arrayDateTimeFormat', 'dateReceived');

            //     // this.sdmsDetailsBO = resp.result;

            //     // this.prepareHeaders();
            //     // this.dataSource = dateParserFormatter.FormatDate(CommonMethods.increaseSNo(resp.result), 'arrayDateTimeFormat', 'dateReceived');

            //     // if (resp.result.length > 1)
            //     //     this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(CommonMethods.increaseSNo(resp.result), 'arrayDateTimeFormat', 'dateReceived'));
            //     // else {
            //     //     this.dataSource = [];
            //     //     this.dataSource.push({ sno: 1, dateReceived: dateParserFormatter.FormatDate(resp.result.dateReceived, 'datetime'), obj: resp.result.obj });
            //     //     this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
            //     // }

            //     // let parseString = require('xml2js').parseString;

            //     // resp.result.forEach((item) => {

            //     //     parseString(item.xmlData, function (err, result) {
            //     //         console.dir(result);
            //     //     });

            //     // })


            //     // var ds = new DOMParser();
            //     // ds.parseFromString(resp.result[0].xmlData, "text/html");
            //     // console.log(ds.parseFromString(resp.result[1].xmlData, "text/html"));


            //     // if (resp.result.length > 0) {
            //     //     Object.keys(resp.result[0].obj.detailsList[0]).forEach((item) => {
            //     //         this.columns.push({ field: item })
            //     //     })

            //     //     if (resp.result[0].obj.jsonTableInfo)
            //     //         this.setKeyColumns(resp, 0);
            //     //     else if (resp.result[1].obj.jsonTableInfo)
            //     //         this.setKeyColumns(resp, 1);

            //     // }

            //     // this.setDisplayedColumns();

            //     // this.dataSource = [];
            //     // this.dynamicDataSource = [];
            //     // this.objectMapping = [];
            //     // this.chipDatasource = [];

            //     // resp.result.forEach((item) => {
            //     //     item.obj.detailsList.forEach((child) => { // details list with key , value
            //     //         this.dataSource.push(child);
            //     //     })

            //     //     if (item.obj.jsonTableInfo)
            //     //         item.obj.jsonTableInfo.forEach((child) => { // dynamic table list
            //     //             this.dynamicDataSource.push(child);
            //     //         })
            //     // })
            //     // // this.objectMapping = resp.result
            //     // this.chipDatasource = dateParserFormatter.FormatDate(resp.result, 'arrayDateTimeFormat', 'dateReceived');
            //     // this.dataSource = CommonMethods.bindMaterialGridData(this.dataSource);
            //     // this.dynamicDataSource = CommonMethods.bindMaterialGridData(this.dynamicDataSource);

            // }
            // else

            if (resp.purpose == "manageSDMSInputDetails") {
                if (resp.result.trn.returnFlag == "OK") {
                    this._alert.success(SampleAnalysisMessages.successSDMSInput);
                    this.manageSDMSDetails.initTime = resp.result.trn.initTime;
                    this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)[0].testInitTime = resp.result.trn.initTime;
                    this._store.dispatch(new analysisActions.UpdateAnalysisTestInfo(this.getTestInfo));
                    this.manageSDMSDetails.list = new InputDragValuesBOList();


                    resp.result.list.forEach((item) => {
                        var obj = this.sectionDetailsList.filter(x => x.detailID == item.detailID);
                        obj[0].value = item.value;
                        obj[0].updateFlag = item.updateFlag;
                        obj[0].sdmsID = item.sdmsID;
                    })

                    this.selectedList.forEach((item) => {
                        this.sectionDetailsList.filter(x => x.detailID == item.detailID).forEach((x) => {
                            if (item.operationType == 'DELETED') {
                                x.keyName = null;
                                x.value = null;
                                x.isDisable = false;
                                x.sdmsID = null;
                            }
                            else {
                                x.keyName = item.keyName;
                                x.value = item.value;
                                x.sdmsID = item.sdmsID;
                                x.isDisable = true;
                            }

                        })
                    })

                    this._store.dispatch(new analysisActions.UpdateArdsInputsSectionDetailsListInfo(this.sectionDetailsList));
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.trn.returnFlag))
            }
            else if (resp.purpose == "getMappingInfo") {
                this.dataSourceData = resp.result;
                this.onActionClicked(this.dataSourceData);
            }
            else if (resp.purpose == DCActionCode.SAMANA_TEST_UPD) {
                if (resp.result == 'OK') {
                    this._alert.success(SampleAnalysisMessages.specReset)
                    this._route.navigateByUrl(PageUrls.searchSampleAnalysis);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result));
            }
        })


        // this._service.getSDMSDataBySamAnaTestID(this.encSamAnalysisTestID);
    }

    setDisplayedColumns() {
        this.columns.forEach((colunm, index) => {
            colunm.index = index;
            this.displayedColumns[index] = colunm.field;
        });

        this.dynamicColumns.forEach((colunm, index) => {
            colunm.index = index;
            this.dynamicDisplayedColumns[index] = colunm.key;
        });

    }

    setKeyColumns(jsonTableList: any) {

        jsonTableList.forEach((obj) => {
            Object.keys(obj).forEach((item) => {
                if (this.dynamicColumns.length > 0) {
                    var index = this.dynamicColumns.findIndex(x => x.key == item);
                    if (index == -1)
                        this.dynamicColumns.push({ key: item, field: item })
                }
                else
                    this.dynamicColumns.push({ key: item, field: item })
            })
        })

        // Object.keys(resp.obj.jsonTableInfo[0]).forEach((item) => {
        //     this.dynamicColumns.push({ key: item, field: this.getConvertedFieldName(item) })
        // })
    }


    prepareHeaders() {
        this.headersData = [];
        this.headersData.push({ columnDef: "sno", header: "S.No.", cell: (element: any) => `${element.sno}` });
        this.headersData.push({ columnDef: "dateReceived", header: "Date Received", cell: (element: any) => `${element.dateReceived}` });
    }

    getObjectDataList(key: string, type: string) {

        // if (key == "dateAnalyzed")
        //     return dateParserFormatter.FormatDate(this.chipDatasource[this.selectedIndex].obj[key], 'date')
        // else

        if (type == "EX_HEAD_LIST") {
            if (key == 'result' && CommonMethods.hasValue(this.dataSourceData[key]) && CommonMethods.hasValue(this.dataSourceData['resultTo']))
                return this.dataSourceData[key] + ' - ' + this.dataSourceData['resultTo']
            else
                return this.dataSourceData[key];
        }
        else if (type == "EX_OBJ_LIST")
            return this.dataSourceData['obj'][key];
        else if (type == "KEY_VALUE") {

            if (this.objectInfo && this.objectInfo.DetailsList && this.objectInfo.DetailsList.length > 0) {
                var index = this.objectInfo.DetailsList.findIndex(x => x.Key == key);

                if (index > -1)
                    return this.objectInfo.DetailsList[index].Value;
            }

            // if (this.dataSourceData['obj'].detailsList && this.dataSourceData['obj'].detailsList.length > 0) {
            //     var index = this.dataSourceData['obj'].detailsList.findIndex(x => x.key == key);

            //     if (index > -1)
            //         return this.dataSourceData['obj'].detailsList[index].value;
            // }

        }

    }

    selectedIndex: number = 0;

    onActionClicked(evt: any) {

        // Reset All Mapping Table Data

        this.columns = [];
        this.dynamicColumns = [];
        this.displayedColumns = [];
        this.dynamicDisplayedColumns = [];
        this.dataSource = [];
        this.dynamicDataSource = [];
        this.objectHeaders = [];

        // this.selectedIndex = index;

        Object.keys(evt).forEach((key) => {
            if (key != "dataProcessed" && evt[key] != null)
                this.objectHeaders.push({ key: key, field: this.getConvertedFieldName(key), KeyField: 'EX_HEAD_LIST' });
        })

        // new process

        if (evt.dataProcessed) {

            this.objectInfo = JSON.parse(evt.dataProcessed);
            var jsonTableList: Array<any> = []

            if (this.objectInfo.DetailsList) {
                this.objectInfo.DetailsList.forEach((item, index) => {
                    Object.keys(item).forEach((key) => {
                        if (key == 'Key')
                            this.objectHeaders.push({ key: item[key], field: this.getConvertedFieldName(item[key]), KeyField: 'KEY_VALUE' });
                    })
                })
            }

            if (this.objectInfo.jsonTableInfo)
                this.objectInfo.jsonTableInfo.forEach((item, index) => {
                    if (index > 0)
                        jsonTableList.concat(item)
                    else
                        jsonTableList = JSON.parse(item);
                })


            if (jsonTableList.length > 0)
                this.setKeyColumns(jsonTableList);

            if (jsonTableList.length > 0)
                jsonTableList.forEach((child) => { // dynamic table list
                    this.dynamicDataSource.push(child);
                })

            this.setDisplayedColumns();

            this.dynamicDataSource = CommonMethods.bindMaterialGridData(this.dynamicDataSource);

        }

        // this.dynamicColumns.push({ key: item, field: this.getConvertedFieldName(item) })


        // if (this.objectInfo)
        //     Object.keys(evt.obj).forEach((key) => {
        //         if (key != "detailsList" && key != 'jsonTableInfo' && key != 'trn' && evt.obj[key] != null)
        //             this.objectHeaders.push({ key: key, field: this.getConvertedFieldName(key), KeyField: 'EX_OBJ_LIST' });
        //     })


        // if (evt.obj && evt.obj.detailsList && evt.obj.detailsList.length > 0) {

        //     evt.obj.detailsList.forEach((item) => {
        //         this.objectHeaders.push({ key: item.key, field: this.getConvertedFieldName(item.key), KeyField: 'KEY_VALUE' });
        //     })

        //     // Object.keys(evt.obj.detailsList[0]).forEach((item) => {
        //     //     this.objectHeaders.push({ key: item, field: this.getConvertedFieldName(item.key), KeyField: 'KEY_VALUE' });
        //     // })
        // }


        // if (evt.obj.detailsList && evt.obj.detailsList.length > 0) {
        //     Object.keys(evt.obj.detailsList[0]).forEach((item) => {
        //         this.columns.push({ field: item })
        //     })
        // }

        // if (jsonTableList.length > 0)
        //     this.setKeyColumns(evt);


        // Object.keys(evt.obj).forEach((key) => {
        //     if (key != "detailsList" && key != 'jsonTableInfo' && evt.obj[key] != null)
        //         this.objectHeaders.push({ key: key, field: this.getConvertedFieldName(key) });

        // })

        // evt.obj.detailsList.forEach((child) => { // details list with key , value
        //     this.dataSource.push(child);
        // })


    }

    getConvertedFieldName(key: string) {
        var keyVal = "";

        if (!key)
            return keyVal;

        var i = 0;
        for (let index = 0; index < key.length; index++) {
            if (index == 0)
                keyVal = key[index].toUpperCase()
            else if (key[index].toUpperCase() == key[index] && i == 0) {
                keyVal += ' ' + key[index];
                i++;
            }
            else
                keyVal += key[index];

        }

        return keyVal;
    }

    updateInputList() {


        // this.selectedList.forEach((item) => {
        //     this.sectionDetailsList.filter(x => x.detailID == this.filteredDetailsList[item.valueID].detailID)[0].value = item.value;
        // })

        this.manageSDMSDetails.initTime = this.getTestInfo.filter(x => x.samAnaTestID == this.encSamAnalysisTestID)[0].testInitTime;

        this.manageSDMSDetails.encSamAnaTestID = this.encSamAnalysisTestID;
        // this.manageSDMSDetails.initTime = this.appBO.initTime;
        this.manageSDMSDetails.list = this.selectedList;  //.filter(x => x.operationType == 'ADD');
        this.manageSDMSDetails.source = !CommonMethods.hasValue(this.sourceCode) ? CommonMethods.CommonArdsSourcesByEntityCode(this.entityCode) : this.sourceCode;
        if (this.raiseDev() == 'OK') {
            this._service.manageSDMSInputDetails(this.manageSDMSDetails);
        }
        // this._store.dispatch(new analysisActions.UpdateArdsInputsSectionDetailsListInfo(this.sectionDetailsList));
    }


    raiseDev() {
        if ((this.headerInfo.statusCode == 'APP' || this.headerInfo.statusCode == 'REJ') && CommonMethods.hasValue(this.getArdsInputsInfo.updTestStatus) && this.getArdsInputsInfo.updTestStatus != 'APP')
            return this._alert.error(SampleAnalysisMessages.pendingSpec);

        else if ((this.headerInfo.statusCode == 'APP' || this.headerInfo.statusCode == 'REJ') && !CommonMethods.hasValue(this.getArdsInputsInfo.updTestStatus)) {
            const dialogRef = this._matDialog.open(DeviationHandler, { width: '60%' });
            dialogRef.disableClose = true;
            dialogRef.componentInstance.entityCode = EntityCodes.sampleAnalysis;
            dialogRef.componentInstance.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
            dialogRef.afterClosed().subscribe(result => {
                if (result != null && result.CanRiceDeviation) {
                    var obj: deviation = new deviation();
                    obj.encEntityActID = String(this.encSamAnalysisTestID);
                    obj.entityCode = EntityCodes.sampleAnalysis;
                    obj.dcActionCode = DCActionCode.SAMANA_TEST_UPD;
                    obj.remarks = result.comments;
                    obj.devType = result.DeviationType;
                    obj.refCode = this.headerInfo.arNumber;
                    obj.initTime = this.manageSDMSDetails.initTime;
                    obj.lst = result.lst;
                    this._service.raiseDeviation(obj);
                }
            });
        }
        else return 'OK';
    }


    filterInputFieldsValues(detailID: number) {
        return this.selectedList.filter(x => x.detailID == detailID && x.operationType == 'ADD');
    }

    // Mouse Hover With Click When Drag

    mouseEnterHandler(event: MouseEvent, chapterExpansionPanel: any, obj: any) {
        if (event.buttons && !chapterExpansionPanel.expanded) {
            chapterExpansionPanel.open();
        }
    }


    drop(event: CdkDragDrop<any[]>, detailID: number) {
        var item = this.filteredDetailsList.filter(x => x.detailID == detailID);
        var isFormulaDependent = item[0].isFormulaDependent;
        var isAccCriteriaApp = item[0].isAccCriteriaApp;

        if (this.entityCode == EntityCodes.sampleAnalysis && this.invID != this.headerInfo.invID && item[0].inputType == "IFOT" && (event.item.data['Key'] == "result" || event.item.data['Key'] == "resultTo")) {
            return this._alert.warning(SampleAnalysisMessages.sameBatchResult);
        }

        if (event.previousContainer === event.container) {

            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

        } else {

            // Check Same cdk-drop-list 

            if ((event.item.element.nativeElement.id).split('-')[0] == 'Temp') {

                //#region   -- Get Placing Item Index

                // var splitVal = (event.container.id).split('-');
                // var index: number;

                // if (splitVal) {
                //     var val = splitVal[splitVal.length - 1]
                //     index = Number(val) - 1;
                // }

                //#endregion 

                // -- Override Input Values

                // this.getInutArray(event, index);

                // var detailID = detailID; //this.filteredDetailsList[index].detailID;

                var selectedIndex: number = this.selectedList.findIndex(x => x.detailID == detailID);
                if (selectedIndex > -1) {

                    this.selectedList.filter(x => x.detailID == detailID).forEach((item) => {
                        if (!CommonMethods.hasValue(isFormulaDependent) || Number(event.item.data.value.split(' ')[0]) || CommonMethods.hasValue(isAccCriteriaApp)) {
                            // item.keyName = event.previousContainer.data[event.previousIndex]['key'];
                            // item.value = event.previousContainer.data[event.previousIndex]['value'];
                            item.value = ((!isAccCriteriaApp) || !CommonMethods.hasValue(isFormulaDependent)) ? event.item.data.value : Number(event.item.data.value.split(' ')[0]);
                            item.sdmsID = this.sdmsData.selectedId;
                            // item.keyName = event.item.data['Key'] ? event.item.data['Key'] : null;
                            item.operationType = 'ADD';
                            item.keyName = event.item.data['Key'];
                            item.field = event.item.data['name'];
                        }
                    })
                }
                else {

                    if (!CommonMethods.hasValue(isFormulaDependent) || Number(event.item.data.value.split(' ')[0]) || CommonMethods.hasValue(isAccCriteriaApp)) {

                        var obj: InputDragValuesBO = new InputDragValuesBO();
                        obj.detailID = detailID;
                        // obj.keyName = event.previousContainer.data[event.previousIndex]['key'];
                        // obj.value = event.previousContainer.data[event.previousIndex]['value'];
                        // obj.value = event.item.data.value;
                        obj.value = ((!isAccCriteriaApp) || !CommonMethods.hasValue(isFormulaDependent)) ? event.item.data.value : Number(event.item.data.value.split(' ')[0]);
                        obj.sdmsID = this.sdmsData.selectedId;
                        // obj.keyName = event.item.data['Key'] ? event.item.data['Key'] : null;
                        obj.operationType = "ADD";
                        obj.keyName = event.item.data['Key'];
                        obj.field = event.item.data['name'];

                        this.selectedList.push(obj);
                    }
                }

                // this.filteredDetailsList[index].value = event.previousContainer.data[event.previousIndex]['value']
            }

        }

    }


    // remove Input values from this.selectedList

    removeInputValue(item: any) {

        var index = this.selectedList.findIndex(x => x.detailID == item.detailID);

        if (index > -1) {
            // this.selectedList[index].keyName = null;
            this.selectedList[index].value = null;
            this.selectedList[index].sdmsID = null;
            this.selectedList[index].operationType = 'DELETED'
        }

    }

    prepareArLkp() {
        var condition: string = "";
        // condition = "MaterialID = " + this.headerInfo.matID;
        // if (CommonMethods.hasValue(this.headerInfo.invID))
        //     condition = condition + " OR InvID = " + this.headerInfo.invID;
        var instrCondition: string = "CalibPramID IS NOT NULL";
        if (this.entityCode == EntityCodes.sampleAnalysis)
            this.arNumInfo = CommonMethods.PrepareLookupInfo(LKPTitles.arNumber, LookupCodes.getSamARNumbers, LKPDisplayNames.arNumber, LKPDisplayNames.Status, LookUpDisplayField.header, LKPPlaceholders.arNumber, condition);
        else
            this.arNumInfo = CommonMethods.PrepareLookupInfo(LKPTitles.refNum, LookupCodes.getInstrumentCalibration, LKPDisplayNames.status, LKPDisplayNames.reportID, LookUpDisplayField.code, LKPPlaceholders.refNum, instrCondition)
        this.prepareTestLkp("");
        this.prepareSdmsLkp();
    }

    prepareTestLkp(evt) {

        if (CommonMethods.hasValue(evt) && CommonMethods.hasValue(evt.val))
            this.invID = evt.val.extColumn;
        else this.invID = null

        if (!this.arNumbers.selectedId) {

            if (this.tests.selectedId)
                this.tests.clear();

            if (this.sdmsData.selectedId)
                this.sdmsData.clear();
        }

        // if (CommonMethods.hasValue(this.tests.selectedId))
        //     this.tests.clear();

        var condition = "1=2";
        if (CommonMethods.hasValue(this.arNumbers.selectedId) && this.entityCode == EntityCodes.sampleAnalysis)
            condition = "ArID = " + this.arNumbers.selectedId;
        else if (CommonMethods.hasValue(this.arNumbers.selectedId) && this.entityCode == EntityCodes.calibrationArds)
            condition = "EqpMaintID = " + this.arNumbers.selectedId
        if (this.entityCode == EntityCodes.calibrationValidation || this.entityCode == EntityCodes.calibrationArds)
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.testName, LookupCodes.getGroupTests, LKPDisplayNames.test, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.test, condition);
        else
            this.testInfo = CommonMethods.PrepareLookupInfo(LKPTitles.test, LookupCodes.getGroupTests, LKPDisplayNames.testName, LKPDisplayNames.srNum, LookUpDisplayField.header, LKPPlaceholders.testName, condition);

    }

    prepareSdmsLkp() {
        if (CommonMethods.hasValue(this.sdmsData.selectedId))
            this.sdmsData.clear();
        var condition = "1=2";
        if (CommonMethods.hasValue(this.tests.selectedId))
            condition = "SamAnaTestID = " + this.tests.selectedId;

        // if (CommonMethods.hasValue(this.encSamAnalysisTestID) && CommonMethods.hasValue(this.tests.selectedId))
        //     condition = condition + " AND ParentID = " + this.encSamAnalysisTestID;
        // else if (CommonMethods.hasValue(this.encSamAnalysisTestID))
        //     condition = "ParentID = " + this.encSamAnalysisTestID;

        condition = condition + " AND StatusCode = 'ACT'";

        this.sdmsInfo = CommonMethods.PrepareLookupInfo(LKPTitles.sdms, LookupCodes.getSDMSDetails, LKPDisplayNames.sdmsTitle, LKPDisplayNames.sdmsCode, LookUpDisplayField.code, LKPPlaceholders.sdms, condition, null, "LIMS", null, null, LKPDisplayNames.prepRunNo);

    }

    getData(type: string = 'GO') {

        var obj: any;

        if (type == 'GO') {
            var err: string = this.validation();

            if (CommonMethods.hasValue(err))
                return this._alert.warning(err);

            obj = { CurrentSamAnaTestID: this.tests.selectedId, SamAnaTestID: this.encSamAnalysisTestID, SdmsID: this.sdmsData.selectedId }
        }
        else {
            this.invID = this.headerInfo.invID;
            this.arNumbers.setRow(this.getCurrentAnalysis.arID, this.getCurrentAnalysis.arNumber);
            this.tests.setRow(this.getCurrentAnalysis.currentSamAnaTestID, this.getCurrentAnalysis.testName);


            obj = this.getCurrentAnalysis;
            obj['isGetARDSExecDetails'] = true;
        }

        this._service.getMappingInfo(obj);
    }

    manageSDMSData() {
        const modal = this._matDialog.open(ManageSDMSDataComponent, CommonMethods.sdmsModalFullWidth);
        modal.componentInstance.encSamAnaTestID = this.encSamAnalysisTestID;
        modal.componentInstance.entityCode = this.entityCode;

        modal.afterClosed().subscribe(resp => {

        })
    }

    validation() {
        if (!CommonMethods.hasValue(this.arNumbers.selectedId))
            return SampleAnalysisMessages.arnum;
        else if (!CommonMethods.hasValue(this.tests.selectedId))
            return SampleAnalysisMessages.test;
    }

    ngOnDestroy() {

        if (this.showHidePageType == PageTypeSection.MAPPING_ARDS) {
            this.showHidePageType = PageTypeSection.ANALYSIS;
            this._store.dispatch(new analysisActions.UpdateAnalysisPageTypeAction(this.showHidePageType));
        }

        localStorage.setItem('IS_ACCESS_TAB', 'TRUE');
    }
}