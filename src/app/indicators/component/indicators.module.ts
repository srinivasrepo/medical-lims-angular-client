import { NgModule } from "@angular/core";
import { IndicatorsRoutingModule } from './indicators-Routing.module';
import { SearchIndicatorComponent } from './searchIndicator.component';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { FormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app.material.module';
import { CommonModule } from '@angular/common';
import { IndicatorsService } from '../service/indicators.service';
import { ManageIndicatorComponent } from './manageIndicators.component';
import { ViewIndicatorComponent } from './viewIndicator.component';
import { ManageTestSolutionIndexComponent } from './manageIndex.component';

@NgModule({
    declarations: [
        SearchIndicatorComponent,
        ManageIndicatorComponent,
        ViewIndicatorComponent,
        ManageTestSolutionIndexComponent
    ],
    imports: [
        IndicatorsRoutingModule,
        LimsHelpersModule,
        FormsModule,
        CommonModule,
        AppMaterialModule
    ],
    providers: [IndicatorsService]
})

export class IndicatorsModule { }