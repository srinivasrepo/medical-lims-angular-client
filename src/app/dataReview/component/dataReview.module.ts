import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../../app.material.module';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { ManageDataReviewComponent } from './manageDataReview.component';
import { DataReviewRoutingModule } from './dataReviewRouting.module';
import { DataReviewService } from '../services/dataReview.service';
import { SearchDataReviewComponent } from './searchDataReview.component';
import { SampleAnalysisModule } from 'src/app/sampleAnalysis/component/sampleAnlaysis.module';
import { LimsCommonModule } from 'src/app/common/component/common.module';
import { DataReviewCheckListComponent } from './dataReviewCheckList.component';
import { OOSModule } from 'src/app/oos/component/oos.module';


@NgModule({
    declarations: [
        ManageDataReviewComponent,
        SearchDataReviewComponent,
        DataReviewCheckListComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        LimsHelpersModule,
        DataReviewRoutingModule,
        SampleAnalysisModule,
        LimsCommonModule,
        OOSModule
    ],
    providers: [DataReviewService]
})

export class DataReviewModule { }