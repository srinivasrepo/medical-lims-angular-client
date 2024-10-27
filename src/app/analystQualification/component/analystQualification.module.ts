import { NgModule } from '@angular/core'
import { LimsHelpersModule } from 'src/app/limsHelpers/component/limsHelpers.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app.material.module';
import { analystQualificationRoutingModule } from './analystQualificationRouting.module';
import { searchAnalystQualificationComponent } from './searchAnalystQualification.component';
import { manageAnalystQualification } from './manageAnalystQualification.component';
import { analystService } from '../service/analyst.service';
import { viewAnalystQualification } from './viewAnalystQualifcation.component';
import { AnalystQualifictionRequestComponent } from './analystQualifictionRequest.component';
import { viewAnalystQualificationRequestComponent } from './viewAnalystQualificationRequest.component';

@NgModule({
    declarations:[
        searchAnalystQualificationComponent,
        manageAnalystQualification,
        viewAnalystQualification,
        AnalystQualifictionRequestComponent,
        viewAnalystQualificationRequestComponent
    ],
    imports:[
        CommonModule,
        LimsHelpersModule,
        FormsModule,
        AppMaterialModule,
        analystQualificationRoutingModule
    ],
    providers:[analystService]
})

export class analystQualificationModule{
}