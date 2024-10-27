import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LIMSContextServices } from './common/services/limsContext.service';
import { CommonContextService } from './common/services/commonContext.service';
import { LoaderDetails } from './common/services/utilities/commonmethods';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends CommonContextService {
  title = 'MedicalLIMS';
  //loaderName: string = LoaderDetails.loaderName;
  loader: any = LoaderDetails.loaderConfig;

  constructor(private cdref: ChangeDetectorRef, _router: Router,
      private _context: LIMSContextServices) {
    super(_router, null);

    _router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
        if (val.url == "/")
          this.setUrls();
      }

    })
  }

  /**
   * REDUCE THE ERRORS IN CONSOLE
   */

  // ngAfterContentChecked() {
  //   this.cdref.detectChanges();
  // }

}
