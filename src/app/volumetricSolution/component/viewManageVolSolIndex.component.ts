import { Component } from "@angular/core";
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonMethods, dateParserFormatter } from 'src/app/common/services/utilities/commonmethods';
import { PageUrls } from 'src/app/common/services/utilities/constants';
import { PageTitle } from 'src/app/common/services/utilities/pagetitle';
import { SolMgmtFormulae, VolSolutionIndex } from '../model/volumetricSolModel';
import { VolumetricSolService } from '../service/volumetricSol.service';

@Component({
    selector: 'lims-viewVolIndex',
    templateUrl: '../html/viewManageVolSolIndex.html'
})

export class ViewManageVolSolIndexComponent {

    encIndexID: string;
    viewPageTitle: string = PageTitle.viewVolSolIndex;
    viewBackUrl: string = PageUrls.searchVolSol;
    volSolutionIndex = new VolSolutionIndex();
    solMgmtFormulaeList: Array<SolMgmtFormulae> = new Array<SolMgmtFormulae>();
    headers: any[];
    dataSource: any;
    subscription: Subscription = new Subscription();

    constructor(private _service: VolumetricSolService, private _activatedRoute: ActivatedRoute) { }

    ngAfterViewInit() {
        this._activatedRoute.queryParams.subscribe(params => this.encIndexID = params["id"])
        this.subscription = this._service.VolumetricSubject.subscribe(resp => {
            if (resp.purpose == "getVolViewSolIndexDetailsByID") {
                this.volSolutionIndex = resp.result.volSolIndex;
                this.volSolutionIndex.createdOn = dateParserFormatter.FormatDate(resp.result.volSolIndex.createdOn, 'datetime');
                this.solMgmtFormulaeList = resp.result.solMgmtFormulaeList;
                this.prepareHeaders();
                this.dataSource = CommonMethods.bindMaterialGridData(CommonMethods.increaseSNo(this.solMgmtFormulaeList));
            }
        })

        // if(CommonMethods.hasValue(this.encIndexID))
        this._service.getVolViewSolIndexDetailsByID(this.encIndexID);
    }

    prepareHeaders() {
        this.headers = [];
        this.headers.push({ columnDef: "sno", header: "S.No", cell: (element: any) => `${element.sno}`, width: "maxWidth-10per" });
        this.headers.push({ columnDef: "formulaTitle", header: "Formula Title", cell: (element: any) => `${element.formulaTitle}`, width: "maxWidth-30per"  });
        this.headers.push({ columnDef: "strengthRangeFrom", header: "Strength Range From", cell: (element: any) => `${element.strengthRangeFrom}`, width: "maxWidth-30per"  });
        this.headers.push({ columnDef: "strengthRangeTo", header: "Strength Range To", cell: (element: any) => `${element.strengthRangeTo}`, width: "maxWidth-30per"  });
    }
}