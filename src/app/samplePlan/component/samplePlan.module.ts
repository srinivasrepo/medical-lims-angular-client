import { NgModule } from '@angular/core';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule } from '@angular/forms';
import { SamplePlanRoutingModule } from './samplePlanRouting.module';
import { SearchSamplePlanComponent } from './searchSamplePlan.component';
import { SamplePlanService } from '../service/samplePlan.service';
import { CommonModule } from '@angular/common';
import { ShiftClosedComponent } from './shiftClosed.component';
import { CreateSamplePlanComponent } from './createSamplePlan.component';
import { AnalystSamplePlanComponent } from './analystSample.component';
import { PlanningComponent } from './planning.component';
import { SamplesComponent } from './samples.component';
import { SampleTestComponent } from './sampleTest.component';
import { SpecificationsComponent } from './specifications.component';
import { MatTooltipModule, MatExpansionModule } from '@angular/material';
import { AnalystOccupancyDetailsComponent } from './analystOccupancyDetails.component';
import { ViewSampleDetailsComponent } from './viewSampleDetails.component';
import { ManageAssingUnAssignTestPlanComponent } from './manageAssignUnAssignTest.component';
import { ViewSamplePlanComponent } from './viewSamplePlan.component';
import { ChangeUserPlanTestComponent } from './changeUserPlanTest.component';
import { TestOccupancyDetailsComponent } from './testOccupancy.component';
import { SearchCloseShiftActivitiesComponent } from './searchShiftClosed.component';
import { ViewShiftClosedComponent } from './viewShiftClosed.component';

@NgModule({
    declarations: [
        SearchSamplePlanComponent,
        ShiftClosedComponent,
        CreateSamplePlanComponent,
        AnalystSamplePlanComponent,
        PlanningComponent,
        SamplesComponent,
        SampleTestComponent,
        SpecificationsComponent,
        AnalystOccupancyDetailsComponent,
        ViewSampleDetailsComponent,
        ViewSamplePlanComponent,
        TestOccupancyDetailsComponent,
        SearchCloseShiftActivitiesComponent,
        ViewShiftClosedComponent,
    ],
    imports: [
        LimsHelpersModule,
        AppMaterialModule,
        FormsModule,
        CommonModule,
        SamplePlanRoutingModule,
        MatTooltipModule,
        MatExpansionModule,
        MatTooltipModule
    ],
    providers: [SamplePlanService],
    entryComponents: [
        ViewSampleDetailsComponent,
        AnalystOccupancyDetailsComponent,
        TestOccupancyDetailsComponent
    ]
})

export class SamplePlanModule { }
