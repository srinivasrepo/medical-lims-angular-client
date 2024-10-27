import { NgModule } from '@angular/core';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatFormFieldModule } from '@angular/material';
import { UploadFiles } from 'src/app/UtilUploads/component/upload.component';
import { OosService } from '../services/oos.service';
import { SearchOosComponent } from './searchOos.component';
import { manageOosComponent } from './manageOos.component';
import { OosAnalysisComponent } from './oosAnalysis.component';
import { OosChecklistGridComponent } from './oosChecklistGrid.component';
import { HypothesisTestingComponent } from './hypothesisTesting.component';
import { SampleAnalysisModule } from 'src/app/sampleAnalysis/component/sampleAnlaysis.module';
import { TestingOfSameSampleComponent } from './testingOfSameSample.component';
import { OosCATBComponent } from './oosCATB.component';
import { OosSingleCommentComponent } from './oosSingleComment.component';
import { OosSummaryComponent } from './oosSummary.component';
import { OosDeptReviewComponent } from './oosDeptReview.component';
import { DepartmentReviewsComponent } from './departmentReviews.component';
import { OosManufactureChecklistComponent } from './oosManufactureChecklist.component';
import { LimsCommonModule } from 'src/app/common/component/common.module';
import { QASummaryComponent } from './qaSummary.component';
import { OosRoutingModule } from './oosRouting.module';
import { OosHeaderDataComponent } from './oosHeaderData.component';


@NgModule({
    declarations: [
        SearchOosComponent,
        manageOosComponent,
        OosAnalysisComponent,
        OosChecklistGridComponent,
        HypothesisTestingComponent,
        TestingOfSameSampleComponent,
        OosCATBComponent,
        OosSingleCommentComponent,
        OosSummaryComponent,
        OosDeptReviewComponent,
        DepartmentReviewsComponent,
        OosManufactureChecklistComponent,
        QASummaryComponent,
        OosHeaderDataComponent
    ],
    imports: [
        LimsHelpersModule,
        AppMaterialModule,
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        MatStepperModule,
        OosRoutingModule,
        MatFormFieldModule,
        SampleAnalysisModule,
        LimsCommonModule,
    ],
    exports:[
        OosHeaderDataComponent,
        OosAnalysisComponent
    ],
    providers: [OosService],
    entryComponents: [DepartmentReviewsComponent]
})

export class OOSModule {

}