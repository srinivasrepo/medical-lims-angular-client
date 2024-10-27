import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SampleAnalysisService } from '../service/sampleAnalysis.service';
import { SampleAnalysisRoutingModule } from './sampleAnalysisRouting.module';
import { SearchSampleAnalysisComponent } from './searchSampleAnalysis.component';
import { ManageSampleAnalysisComponent } from './manageSampleAnalysis.component';
import { ViewSampleAnalysisComponent } from './viewSampleAnalysis.component';
import { SampleAnalysisHeaderComponent } from './sampleAnalysisHeader.component';
import { SupplierCOAAnalysisComponent } from './supplierCOAAnalysis.component';
import { SamplingInformationComponent } from './samplingInformationComponent';
import { ARDSSelectionComponent } from './ardsSelection.component';
import { OwlNativeDateTimeModule, OwlDateTimeModule } from 'ng-pick-datetime';
import { manageSamplePackComponent } from './manageSamplePackComponent';
import { LimsCommonModule } from "../../common/component/common.module";
import { ManageAnalysisComponent } from './manageAnalysis.component';
import { AnalysisOccupancyComponent } from './analysisOccupancy.component';
import { methodResultsComponent } from './methodResults.component';
import { AnalysisService } from '../state/analysis/analysis.service';
import { ManageRRTValuesComponent } from './manageRRTValues.component';
import { RawDataHeaderComponent } from './rawDataHeader.component';
import { rawDataSectionComponent } from './rawDataSections.component';
import { ManageAdditionalTestComponent } from './manageAdditionalTest.component';
import { MainPipeModule } from 'src/app/common/pips/mainPipe.module';
import { FormulaDependentDetailsComponent } from './formulaDependentDetails.component';
import { MappingSdmsInputsComponent } from './mappingSdmsInputs.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTreeModule, MatExpansionModule } from '@angular/material';
import { GridMouseHoverDirective } from 'src/app/limsHelpers/directive/gridMouseHover.directive';
import { ManageContainerWiseMaterialsComponent } from './manageContainerWiseMaterials.component';
import { assignTestResult } from './assignTestResult.component';
import { ContainerWiseAnalysisComponent } from './containerWiseAnalysis.component';
import { AnalysisReportComponent } from './analysisReport.component';
import { manageArdsPrintRequest } from './ardsPrintRequest.component';
import { ContainerwiseTestSendForReview } from './containerwiseTestSentForReview.component';
import { ArdsCommonDataMapping } from './ArdsMappingCommonData.component';
import { DynamicFormulaCalculationComponent } from './dynamicFormulaCalculation.component';
import { SwitchArdsModeComponent } from './switchArdsMode.component';
import { TableResultSetExecComponent } from './tableResultSetExecution.component';
import { ManageSDMSDataComponent } from './manageSDMSData.component';

@NgModule({
    declarations: [
        SearchSampleAnalysisComponent,
        ManageSampleAnalysisComponent,
        ViewSampleAnalysisComponent,
        SampleAnalysisHeaderComponent,
        SupplierCOAAnalysisComponent,
        SamplingInformationComponent,
        manageSamplePackComponent,
        methodResultsComponent,
        ARDSSelectionComponent,        
        ManageAnalysisComponent,
        AnalysisOccupancyComponent,
        ManageRRTValuesComponent,
        RawDataHeaderComponent,
        rawDataSectionComponent,
        ManageAdditionalTestComponent,
        FormulaDependentDetailsComponent,
        MappingSdmsInputsComponent,
        ManageContainerWiseMaterialsComponent,
        GridMouseHoverDirective,
        assignTestResult,
        ContainerWiseAnalysisComponent,
        manageArdsPrintRequest,
        ContainerwiseTestSendForReview,
        ArdsCommonDataMapping,
        DynamicFormulaCalculationComponent,
        SwitchArdsModeComponent,
        TableResultSetExecComponent,
        ManageSDMSDataComponent
    ],
    imports: [
        CommonModule,
        LimsHelpersModule,
        AppMaterialModule,
        FormsModule,
        SampleAnalysisRoutingModule,
        ReactiveFormsModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        LimsCommonModule,
        DragDropModule,
        MatTreeModule,
        MatExpansionModule,
        
        // StoreModule.forRoot({
        //     analysis: analysisReducer,
        //   }),
        //   StoreDevtoolsModule.instrument({
        //     name: 'Analysis',
        //     maxAge: 25
        //   }),
        //   EffectsModule.forRoot(
        //     [AnalysisEffects]
        //   ),
          MainPipeModule
    ],
    exports:[ARDSSelectionComponent, ManageAnalysisComponent, SampleAnalysisHeaderComponent, RawDataHeaderComponent, ContainerWiseAnalysisComponent],
    providers: [SampleAnalysisService,AnalysisService, DecimalPipe],
    entryComponents: [manageSamplePackComponent, AnalysisOccupancyComponent, methodResultsComponent, ManageRRTValuesComponent, ManageAdditionalTestComponent,
         FormulaDependentDetailsComponent, assignTestResult, ContainerwiseTestSendForReview, ArdsCommonDataMapping, DynamicFormulaCalculationComponent,
         SwitchArdsModeComponent, TableResultSetExecComponent, ManageSDMSDataComponent]
})

export class SampleAnalysisModule { }