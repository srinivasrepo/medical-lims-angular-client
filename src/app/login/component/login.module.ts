import 'hammerjs';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';
import { AppMaterialModule } from '../../app.material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginService } from '../service/login.service';
import { MatIconModule } from '@angular/material/icon';
import { SplashComponent } from './splash.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonLoginComponent } from './commonLogin';
import { LoginComponent } from './login.component';
import { DirectiveModule } from 'src/app/limsHelpers/directive/directive.module';
import { SwitchPlantComponent } from './switchPlant.component';

@NgModule({
    declarations: [
        SplashComponent,
        CommonLoginComponent,
        LoginComponent,
        SwitchPlantComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FlexLayoutModule,
        MatIconModule,
        AppMaterialModule,
        DirectiveModule
    ],
    providers: [
        LoginService,
        CookieService
    ],
    entryComponents: [
        SwitchPlantComponent
    ]
})
export class LoginModule { }
