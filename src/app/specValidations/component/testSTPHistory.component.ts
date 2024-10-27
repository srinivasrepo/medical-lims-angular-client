import { Component } from '@angular/core'
import { MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs'
import { GlobalButtonIconsService } from 'src/app/common/services/globalButtonIcons.service';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { SpecValidationsService } from '../service/specValidations.service';

@Component({
    selector: 'test-his',
    templateUrl: '../html/testSTPHistory.html'
})

export class TestSTPHistoryComponent {

    specCatID: number;
    headerData: any = [];
    dataSource: any;
    pageTitle: string ="Test STP History";

    subscription: Subscription = new Subscription();

    constructor(private _service: SpecValidationsService, private _actModal: MatDialogRef<TestSTPHistoryComponent>, public _global: GlobalButtonIconsService) { }

    ngAfterContentInit() {
        this.subscription = this._service.specValidSubject.subscribe(resp => {
            if (resp.purpose == "testSTPHistory") {
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(dateParserFormatter.FormatDate(resp.result, 'filterTwiceCol', ['effectiveFrom', 'effectiveTo'])))
            }
        })
        this.prepareHeader();
        this._service.testSTPHistory(this.specCatID);
    }

    prepareHeader() {
        this.headerData = [];
        this.headerData.push({ columnDef: 'sno', header: 'S.No.', cell: (element: any) => `${element.sno}`, width:"maxWidth-7per" });
        this.headerData.push({ columnDef: 'templateCode', header: 'Template Code/Version', cell: (element: any) => `${element.templateCode}` });
        this.headerData.push({ columnDef: 'effectiveFrom', header: 'Effective From', cell: (element: any) => `${element.effectiveFrom}` });
        this.headerData.push({ columnDef: 'effectiveTo', header: 'Effective To', cell: (element: any) => `${element.effectiveTo}` });
    }

    close() {
        this._actModal.close();
    }

    ngOnDestory() {
        this.subscription.unsubscribe();
    }
}