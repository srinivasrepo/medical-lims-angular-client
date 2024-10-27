import { NgModule } from "@angular/core";
import { ManageMasterComponent } from './manageMaster.component';
import { ManageMasterService } from '../services/manageMaster.service';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { manageValidityPeriods } from './manageValidityPeriods.component';
import { SysConfigurationComponent } from './sysConfiguration.component';
import { OptionComponent } from './option.component';

@NgModule({
    declarations: [
        ManageMasterComponent, 
        manageValidityPeriods,
       SysConfigurationComponent,
        OptionComponent
    ],
    imports: [
        CommonModule,
        AppMaterialModule,
        LimsHelpersModule,
        FormsModule
    ],
    providers: [ManageMasterService],
    entryComponents: [manageValidityPeriods,OptionComponent]
})

export class ManageMasterModule {

}