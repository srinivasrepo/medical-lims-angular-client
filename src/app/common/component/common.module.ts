import { MatSelectModule, MatSnackBarModule, MatCommonModule, MatInputModule, MatButtonModule, MatGridListModule } from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
//import { BrowserModule } from "@angular/platform-browser";
//import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ViewHistoryComponent } from './viewHistory.component';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from '../../app.material.module';
import { ManageOccupancyComponent } from './manageOccupancy.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { checklistComponent } from './checklist.component';
import { AddNewMaterialComponent } from './addNewMaterial.component';
import { TooltipDirective } from 'src/app/limsHelpers/component/toolTipDirective';
import { addCommentComponent } from './addComment.component';
import { MaterialUomConversionsComponent } from './materialUomConversions';
import { ViewSDMSDetailsComponent } from './viewSDMSDetails.component';
import { MaterialGridComponent } from './materialGrid.component';
import { DeviationHandler } from './deviationHandler.component';
import { ExportDataComponent } from './exportData.component';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { SpecificationHeaderComponent } from './specificationHeader.component';
import { QCCalibrationModule } from 'src/app/qcCalibrations/component/qcCalibration.module';
import { ManageCapaComponent } from './manageCapa.component';
import { ManageAssingUnAssignTestPlanComponent } from 'src/app/samplePlan/component/manageAssignUnAssignTest.component';
import { SamplePlanService } from 'src/app/samplePlan/service/samplePlan.service';
import { AnalysisReportComponent } from 'src/app/sampleAnalysis/component/analysisReport.component';
import { SampleAnalysisService } from 'src/app/sampleAnalysis/service/sampleAnalysis.service';
import { ChangeUserPlanTestComponent } from 'src/app/samplePlan/component/changeUserPlanTest.component';
import { manageIndicatorMasterDataComponent } from 'src/app/indicators/component/manageIndicatorMasterData.component';

@NgModule({
    declarations: [
        ViewHistoryComponent,
        ManageOccupancyComponent,
        checklistComponent,
        AddNewMaterialComponent,
        TooltipDirective,
        addCommentComponent,
        MaterialUomConversionsComponent,
        ViewSDMSDetailsComponent,
        MaterialGridComponent,
        DeviationHandler,
        ExportDataComponent,
        SpecificationHeaderComponent,
        ManageCapaComponent,
        ManageAssingUnAssignTestPlanComponent,
        AnalysisReportComponent,
        ChangeUserPlanTestComponent,
        manageIndicatorMasterDataComponent
    ],
    imports: [
        MatCommonModule,
        MatInputModule,
        MatSelectModule,
        LimsHelpersModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        //BrowserModule,
        //BrowserAnimationsModule,
        MatSnackBarModule,
        MatButtonModule,
        AppMaterialModule,
        MatGridListModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        QCCalibrationModule
    ],
    exports: [
        ViewHistoryComponent,
        MaterialGridComponent,
        ManageCapaComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [
        ViewHistoryComponent, MaterialUomConversionsComponent, DeviationHandler, ExportDataComponent, SpecificationHeaderComponent, 
        checklistComponent, AnalysisReportComponent,ManageAssingUnAssignTestPlanComponent,  ChangeUserPlanTestComponent, manageIndicatorMasterDataComponent
    ],
    providers:[SampleAnalysisService,TitleCasePipe, SamplePlanService]
})

export class LimsCommonModule { }