import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApprovalService } from '../services/approvalProcess.service';
import { AppMaterialModule } from '../../app.material.module';
import { ApprovalComponent } from './approvalProcess.component';
import { LimsCommonModule } from '../../common/component/common.module';
import { DirectiveModule } from 'src/app/limsHelpers/directive/directive.module';

@NgModule({
    declarations: [
        ApprovalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        AppMaterialModule,
        LimsCommonModule,
        DirectiveModule
    ],
    entryComponents:[ApprovalComponent],
    providers: [ApprovalService]
})

export class ApprovalProcessModule { }
