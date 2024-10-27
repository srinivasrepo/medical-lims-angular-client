import { NgModule } from '@angular/core';
import { ManageRinsingSolutionsComponent } from './manageRinsingSolutions.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { RinisingSolutionsService } from '../services/rinsingSolutions.service';
import { SearchRinsingSolutionsComponent } from './searchRinsingSolutions.component';
import { RinsingSolutionsRoutingModule } from './rinsingSolutionsRouting.module';

@NgModule({
    declarations: [ManageRinsingSolutionsComponent,SearchRinsingSolutionsComponent],
    imports: [CommonModule,
        AppMaterialModule,
        FormsModule,
        LimsHelpersModule,
        ReactiveFormsModule,
        RinsingSolutionsRoutingModule],
    exports: [],
    providers: [RinisingSolutionsService]
})

export class RinsingSolutionsModule { }
