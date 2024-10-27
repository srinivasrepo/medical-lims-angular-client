import { NgModule } from '@angular/core';
import { SampleDestructionService } from '../service/sampleDestruction.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app.material.module';
import { SampleDestructionRoutingModule } from './sampleDestructionRouting.module';
import { SearchSampleDestructionComponent } from './searchSampleDestruction.component';
import { ManageSampleDestructionComponent } from './manageSampleDestruction.component';
import { SampleDestructionComponent } from './sampleDestruction.component';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { ViewSampleDestructionComponent } from './viewSampleDestruction.component';

@NgModule({
    declarations: [
        SearchSampleDestructionComponent,
        ManageSampleDestructionComponent,
        SampleDestructionComponent,
        ViewSampleDestructionComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        SampleDestructionRoutingModule,
        LimsHelpersModule
    ],
    providers: [SampleDestructionService]
})

export class SampleDestructionModule { }