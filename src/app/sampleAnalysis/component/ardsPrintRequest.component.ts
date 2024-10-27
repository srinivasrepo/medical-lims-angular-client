import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { GridActions, EntityCodes, DCActionCode } from 'src/app/common/services/utilities/constants';
import { CommonMethods } from 'src/app/common/services/utilities/commonmethods';
import { GetARDSSelectionsBO, deviation } from '../model/sampleAnalysisModel';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { MatDialog } from '@angular/material';
import { DeviationHandler } from 'src/app/common/component/deviationHandler.component';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { AppBO } from 'src/app/common/services/utilities/commonModels';
import { select, Store } from '@ngrx/store';
import * as fromAnalysisOptions from '../state/analysis/analysis.reducer';
import { GridActionFilterBOList } from 'src/app/limsHelpers/entity/limsGrid';

@Component({
    selector: 'ards-print',
    templateUrl: '../html/ardsPrintRequest.html'
})

export class manageArdsPrintRequest {

    subscription: Subscription = new Subscription();
    removeAction: any = { headerName: 'ARDS_SELECTION', DISCARD: 'DISC', compareField: 'statusCode' };
    @Input() pageType: string;
    @Input() ardsBO: GetARDSSelectionsBO = new GetARDSSelectionsBO();
    @Input() entityCode: string;
    @Output() onActionClick: EventEmitter<any> = new EventEmitter();
    @Input() appBO: AppBO = new AppBO();
    headerInfo: any;
    @Input() usrActions: GridActionFilterBOList = new GridActionFilterBOList();
    @Input() conUsrActions: GridActionFilterBOList = new GridActionFilterBOList();
    @Input() type: string;

    constructor(private _matDailog: MatDialog, private _service: SampleAnalysisService, private _store: Store<fromAnalysisOptions.AnalysisState>,) { }

    ngAfterContentInit() {
        sessionStorage.setItem("REFERESH_ACTIONS", 'true');
    }

    ngOnInit(){
        this._store
        .pipe(select(fromAnalysisOptions.getAnalysisInfo))
        .subscribe(analysisInfo => {
            this.headerInfo = analysisInfo;
        });
    }

    prepareHeaders(type: string) {

        var headersData: Array<any> = []
        headersData.push({ "columnDef": 'doctName', "header": "Document Number (version)", cell: (element: any) => `${element.doctNum}` });

        if (type == 'PRINT_HIS')
            headersData.push({ "columnDef": 'status', "header": "Status", cell: (element: any) => `${element.status}` });

        return headersData;
    }

    getActions(type: string) {

        if (type == 'PRINT_HIS') {
            if (this.pageType == 'MNG')
                return [GridActions.view, GridActions.Discard, GridActions.upload, GridActions.RePrint];
            else
                return [GridActions.view];
        }
        else if (type == 'PRINT_REQ') {
            if (this.pageType == 'MNG')
                return [GridActions.view, GridActions.sendRequest];
            else
                return [GridActions.view];
        }
    }

    getDataSource(type: string) {
        if (type == 'PRINT_HIS')
            return CommonMethods.bindMaterialGridData(this.ardsBO.printHis);
        else if (type == 'PRINT_REQ')
            return CommonMethods.bindMaterialGridData(this.ardsBO.printReq);
    }

    onActionClicked(evt: any, type: string) {
        if (evt.action != GridActions.upload && evt.action != GridActions.RePrint) {
            evt.type = type;
            this.onActionClick.emit(evt);
        }
        else if (evt.action == GridActions.upload){
            const modal = this._matDailog.open(UploadFiles);
            modal.disableClose = true;
            modal.componentInstance.uploadBO = CommonMethods.BuildUpload(this.entityCode, 0, 'ARDS_DOC', evt.val.docID, [], 'MEDICAL_LIMS');
            modal.componentInstance.mode = this.pageType == 'VIEW' ? 'VIEW' : 'MANAGE';
            
        }
        else if(evt.action == GridActions.RePrint){
            const dialogRef = this._matDailog.open(DeviationHandler, { width: '80%' });
            dialogRef.disableClose = true;
            dialogRef.componentInstance.entityCode = EntityCodes.SamArds;
            dialogRef.componentInstance.dcActionCode = DCActionCode.ARDS_REPRINT;
    
            dialogRef.afterClosed().subscribe(result => {
                if (result != null && result.CanRiceDeviation) {
                    var obj: deviation = new deviation();
                    obj.encEntityActID = evt.val.docID;
                    obj.entityCode =  EntityCodes.SamArds;
                    obj.dcActionCode = DCActionCode.ARDS_REPRINT;
                    obj.remarks = result.comments;
                    obj.devType = result.DeviationType;
                    obj.refCode = this.entityCode == EntityCodes.sampleAnalysis ? this.headerInfo.arNumber : this.appBO.referenceNumber;
                    obj.initTime = this.appBO.initTime;
                    obj.lst = result.lst;
                    this._service.raiseDeviation(obj);
                }
            });
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}