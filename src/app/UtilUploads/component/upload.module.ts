import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadFiles } from './upload.component';
import { MatButtonModule, MatChipsModule } from '@angular/material';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from 'src/app/app.material.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [UploadFiles],
    imports: [
        LimsHelpersModule, 
        CommonModule,
        MatButtonModule,
        MatChipsModule,
        AppMaterialModule,
        FormsModule
    ]
})
export class uploadModule { }
