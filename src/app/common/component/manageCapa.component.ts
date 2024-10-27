import { Component, Input, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { CommonService } from '../services/commonServices';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';
import { LookupInfo, LookUpDisplayField } from 'src/app/limsHelpers/entity/limsGrid';
import { LookupComponent } from 'src/app/limsHelpers/component/lookup';
import { CommonMethods, dateParserFormatter } from '../services/utilities/commonmethods';
import { LKPTitles, LKPPlaceholders, LKPDisplayNames } from 'src/app/limsHelpers/entity/lookupTitles';
import { LookupCodes, ActionMessages, GridActions } from '../services/utilities/constants';
import { CAPAInsertUpdateCAPA, GetCAPAActionsBySourceRefType } from '../model/commonModel';
import { CommonMessages } from '../messages/commonMessages';

@Component({
    selector: 'mng-capa',
    templateUrl: '../html/manageCapa.html'
})

export class ManageCapaComponent {

    @Input() capaType: string;
    @Input() sourceReferenceID: string;
    @Input() capaSourceCode: string;
    @Input() moduleCode: string;
    @Input() pageType: string = 'MNG';
    gridAction: any = [GridActions.edit];
    typeList: any;
    type: string = "CA_TYPE";
    implementationList: any;
    scopeList: any;
    responsibilityInfo: LookupInfo;
    headersData: any = [];
    dataSource: any;
    maxDate: Date = new Date();
    @ViewChild('responsibility', { static: false }) responsibility: LookupComponent;
    capaID: number;
    isLoaderStart : boolean;

    capaMngObj: CAPAInsertUpdateCAPA = new CAPAInsertUpdateCAPA();
    getCapaList: GetCAPAActionsBySourceRefType = new GetCAPAActionsBySourceRefType();

    subscription: Subscription = new Subscription();

    constructor(private _alert: AlertService, private service: CommonService,
        public _global: GlobalButtonIconsService) { }

    ngAfterViewInit() {
        this.subscription = this.service.commonSubject.subscribe(resp => {
            if (resp.purpose == this.type)
                this.typeList = resp.result;
            else if (resp.purpose == "IMPLEMENTATION_AREA")
                this.implementationList = resp.result;
            else if (resp.purpose == "CAPA_SCOPE")
                this.scopeList = resp.result;
            else if (resp.purpose == "CAPAInsertUpdateCAPA") {
                this.isLoaderStart = false;
                if (CommonMethods.hasValue(resp.result.retVal)) {
                    this.capaID = 0;
                    this.add('CLEAR');
                    this._alert.success(CommonMessages.manageCapaSuccess);
                    this.service.CAPAGetCAPAActionsBySourceRefType(this.getCapaList);
                }
                else
                    this._alert.error(ActionMessages.GetMessageByCode(resp.result.retVal));
            }
            else if (resp.purpose == "CAPAGetCAPAActionsBySourceRefType" + this.capaType) {
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result, 'arrayDateFormat', 'targetDate'));
            }
        })
        if (this.capaType == 'C')
            this.type = 'CA_TYPE'
        else
            this.type = 'PA_TYPE'
        this.prepareLkp();
        this.prepareHeaders();
        this.service.getCategoryItems(this.type);
        this.service.getCategoryItems("IMPLEMENTATION_AREA");
        this.service.getCategoryItems("CAPA_SCOPE");
        this.getCapaList.capaType = this.capaType
        this.getCapaList.capaModuleCode = this.moduleCode;
        this.getCapaList.encSourceRefID = this.sourceReferenceID;
        this.getCapaList.sourceRefCode = this.capaSourceCode;
        this.service.CAPAGetCAPAActionsBySourceRefType(this.getCapaList);
        if (this.pageType == 'VIEW')
            this.gridAction = [];
    }

    add(type: string) {
        if (type == "CLEAR") {
            this.responsibility.clear();
            this.capaMngObj = new CAPAInsertUpdateCAPA();
            this.capaID = 0;
        }

        else if (type == "ADD") {
            var errMsg = this.validate();
            if (CommonMethods.hasValue(errMsg))
                return this._alert.warning(errMsg);
            this.capaMngObj.capaID = this.capaID;
            this.capaMngObj.capaOwnerID = this.responsibility.selectedId;
            this.capaMngObj.isNewCapa = this.capaMngObj.isFromUC = true;
            this.capaMngObj.encSourceReferenceID = this.sourceReferenceID;
            this.capaMngObj.capaSourceCode = this.capaSourceCode;
            this.capaMngObj.capaType = this.capaType;
            this.capaMngObj.moduleCode = this.moduleCode;
            this.capaMngObj.targetDate = dateParserFormatter.FormatDate(this.capaMngObj.targetDate, 'date');
            this.isLoaderStart = true;
            this.service.CAPAInsertUpdateCAPA(this.capaMngObj);
        }
    }

    prepareLkp() {
        this.responsibilityInfo = CommonMethods.PrepareLookupInfo(LKPTitles.actionsBy, LookupCodes.userControlDetail, LKPDisplayNames.actionBy,
            LKPDisplayNames.dept, LookUpDisplayField.code, LKPPlaceholders.responsibility, "", "Designation", 'LIMS');
    }

    prepareHeaders() {
        this.headersData.push({ columnDef: 'type', header: "Type", cell: (element: any) => `${element.typeText}`, width: 'maxWidth-15per' });
        this.headersData.push({ columnDef: 'action', header: "Action", cell: (element: any) => `${element.capa}`, width: 'maxWidth-15per' });
        this.headersData.push({ columnDef: 'targetDate', header: "Target Date", cell: (element: any) => `${element.targetDate}`, width: 'maxWidth-15per' });
        this.headersData.push({ columnDef: 'responsibility', header: "Responsibility", cell: (element: any) => `${element.capaOwnerName}`, width: 'maxWidth-15per' });
        this.headersData.push({ columnDef: 'areaOfImplementationText', header: "Area Of Implementation", cell: (element: any) => `${element.areaOfImplementationText}`, width: 'maxWidth-15per' });
        this.headersData.push({ columnDef: 'scopeOfCapaText', header: "Scope Of Action", cell: (element: any) => `${element.scopeOfCapaText}`, width: 'maxWidth-15per' });
    }

    onActionClicked(event) {
        if (event.action == GridActions.edit) {
            this.capaID = event.val.capaID;
            this.capaMngObj.capa = event.val.capa;
            this.capaMngObj.type = event.val.type;
            this.capaMngObj.areaOfImplementation = event.val.areaOfImplementation;
            this.capaMngObj.scopeOfCapa = event.val.scopeOfCapa;
            this.capaMngObj.targetDate = dateParserFormatter.FormatDate(event.val.targetDate, 'default');
            this.responsibility.setRow(event.val.capaOwnerID, event.val.capaOwnerName);
        }
    }

    validate() {
        if (!CommonMethods.hasValue(this.capaMngObj.type))
            return CommonMessages.type;
        else if (!CommonMethods.hasValue(this.capaMngObj.capa))
            return CommonMessages.action;
        else if (!CommonMethods.hasValue(this.capaMngObj.targetDate))
            return CommonMessages.targetDate;
        else if (!CommonMethods.hasValue(this.responsibility.selectedId))
            return CommonMessages.responsibility;
        else if (!CommonMethods.hasValue(this.capaMngObj.areaOfImplementation))
            return CommonMessages.areaOfImpl;
        else if (!CommonMethods.hasValue(this.capaMngObj.scopeOfCapa))
            return CommonMessages.scopeOfAction;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}