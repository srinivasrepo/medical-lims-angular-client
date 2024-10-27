import { NgModule } from '@angular/core';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { mobilePhaseService } from '../services/mobilePhase.service';
import { MobilePhaseRequestComponent } from './mobilePhaseRequest.component';
import { MatStepperModule, MatFormFieldModule } from '@angular/material';
import { MobilePhasePreparationComponent } from './mobilePhasePreparartion.component';
import { MobilePhaseOutputComponent } from './mobilePhaseOutput.component';
import { searchMobilePhaseComponent } from './searchMobilePhase.component';
import { viewMobilePhaseComponent } from './viewMobilePhase.component';
import { MainPipeModule } from '../../common/pips/mainPipe.module';
import { ManagePreparationMasterDataComponent } from './ManagePreparationMasterData.component';
import { DirectiveModule } from 'src/app/limsHelpers/directive/directive.module';
import { MobilePhaseRoutingModule } from './mobilePhaseRouting.module';

@NgModule({
    declarations: [
        MobilePhaseRequestComponent,
        MobilePhasePreparationComponent,
        MobilePhaseOutputComponent,
        searchMobilePhaseComponent,
        viewMobilePhaseComponent,
        ManagePreparationMasterDataComponent
    ],
    imports: [
        LimsHelpersModule,
        AppMaterialModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        MatStepperModule,
        MatFormFieldModule,
        MainPipeModule,
        DirectiveModule,
        MobilePhaseRoutingModule
    ],
    providers: [mobilePhaseService],
    entryComponents:[ManagePreparationMasterDataComponent]
})

export class MobilePhaseModule {

}