import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockSolutionsRequestComponent } from './stockSolutionsRequest.component';
import { SearchStockSolutionComponent } from './searchStockSolution.component';


export const stockSolutionRoutes: Routes = [
    {path : '',redirectTo:'search',pathMatch:'full'},
    {path:'manage',component:StockSolutionsRequestComponent},
    {path:'search',component:SearchStockSolutionComponent}
]

@NgModule({
    imports: [RouterModule.forChild(stockSolutionRoutes)],
    exports: [RouterModule]
})

export class StockSolutionRoutingModule { }