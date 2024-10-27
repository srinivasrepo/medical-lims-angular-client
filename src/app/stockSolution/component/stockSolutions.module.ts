import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { StockSolutionsRequestComponent } from './stockSolutionsRequest.component';
import { StockSolutionsService } from '../service/stockSolutions.service';
import { SearchStockSolutionComponent } from './searchStockSolution.component';
import { StockSolutionRoutingModule } from './stockSolutionsRouting.module';
import { IndicatorsService } from 'src/app/indicators/service/indicators.service';


@NgModule({
    declarations: [StockSolutionsRequestComponent,SearchStockSolutionComponent],
    imports: [
        CommonModule, 
        AppMaterialModule, 
        FormsModule, 
        LimsHelpersModule, 
        ReactiveFormsModule,
        StockSolutionRoutingModule
    ],
    exports: [],
    providers: [StockSolutionsService,IndicatorsService],
})

export class StockSolutionsModule { }
