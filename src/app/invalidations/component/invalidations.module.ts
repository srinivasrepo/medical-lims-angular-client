import { NgModule } from "@angular/core";
import { SearchInvalidationsComponent } from './searchInvalidations.component';
import { LimsHelpersModule } from '../../limsHelpers/component/limsHelpers.module';
import { AppMaterialModule } from '../../app.material.module';
import { FormsModule } from '@angular/forms';
import { InvalidationsRoutingModule } from './invalidationsRouting.module';
import { CommonModule } from '@angular/common';
import { InvalidationsService } from '../service/invalidations.service';
import { manageInvalidationsRequestComponent } from './invalidationsRequest.component';
import { invalidationEvaluationComponent } from './invalidationsEvaluation.component';
import { invalidationsReviewComponent } from './invalidationsReview.component';
import { viewInvalidationsComponent } from './viewInvalidations.component';
import { MainPipeModule } from '../../common/pips/mainPipe.module';
import { GetPreviousInvalidationsComponent } from './getPreviousInvalidations.component';

@NgModule({
    declarations: [
        SearchInvalidationsComponent,
        manageInvalidationsRequestComponent,
        invalidationEvaluationComponent,
        invalidationsReviewComponent,
        viewInvalidationsComponent,
        GetPreviousInvalidationsComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        LimsHelpersModule,
        AppMaterialModule,
        InvalidationsRoutingModule,
        MainPipeModule
    ],
    providers:[InvalidationsService],
    entryComponents: [GetPreviousInvalidationsComponent]
})
export class InvalidationsModule { }