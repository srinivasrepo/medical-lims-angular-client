import { Component } from "@angular/core";
import { CommonService } from '../services/commonServices';
import { Subscription } from 'rxjs';
import { CommonMethods, dateParserFormatter } from '../services/utilities/commonmethods';
import { PageTitle } from '../services/utilities/pagetitle';
import { PageUrls } from '../services/utilities/constants';
import { SDMSDetails } from '../model/commonModel';

@Component({
    selector: 'app-sdms',
    templateUrl: '../html/viewSDMSDetails.html'
})

export class ViewSDMSDetailsComponent {

    showDetails: boolean;
    headersData: any;
    dataSource: any;
    pageTitle: string = PageTitle.viewSDMSDetails;
    backUrl: string = PageUrls.splash;
    sdmsDatsource: any;
    sdmsDetails: SDMSDetails = new SDMSDetails();
    headersSDMSList: any;
    entityActualID: number;

    subscription: Subscription = new Subscription();

    constructor(private _service: CommonService) { }

    ngAfterContentInit() {
        this.subscription = this._service.commonSubject.subscribe(resp => {
            if (resp.purpose == "getSDMSDetails") {
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(dateParserFormatter.FormatDate(resp.result, 'arrayDateTimeFormat', 'sdmsDateReceived'));
            }
        });
        this._service.getSDMSDetails();
        
    }

    prepareHeaders() {
        this.headersData = [];
        
        this.headersData.push({ "columnDef": 'entityActualID', "header": "Sample Analysis Test ID", cell: (element: any) => `${element.entityActualID}` });
        this.headersData.push({ "columnDef": 'sdmsDateReceived', "header": "Date Received", cell: (element: any) => `${element.sdmsDateReceived}` });

    }

    
    onActionClicked(evt) {

        var element = document.getElementById("details-class");
        this.sdmsDetails = evt.val.list;
        this.entityActualID = evt.val.entityActualID;
        
        if(evt.action == 'IND') {
            this.showDetails = true;
            element.classList.add('sdms-main-grid');
            
            this.headersSDMSList = [];
            
            this.headersSDMSList.push({ "columnDef": 'key', "header": "Test No", cell: (element: any) => `${element.key}` });
            this.headersSDMSList.push({ "columnDef": 'value', "header": "Test Value", cell: (element: any) => `${element.value}` });
        } 

        this.sdmsDetails = this.dataSource.data.filter(x => x.sdmsID == evt.val.sdmsID)[0].list;
      
        this.sdmsDatsource = CommonMethods.bindMaterialGridData(this.sdmsDetails.detailsList);

       
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    dateFormate( val: any) {
       return dateParserFormatter.FormatDate(val, 'date');
    }
}