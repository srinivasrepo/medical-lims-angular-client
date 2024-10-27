import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '../../node_modules/@angular/forms';
import { AppMaterialModule } from './app.material.module';
import { FlexLayoutModule } from '../../node_modules/@angular/flex-layout';
import { BrowserAnimationsModule } from '../../node_modules/@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '../../node_modules/@angular/common/http';
import { LoginModule } from './login/component/login.module';
import { CommonModule } from '../../node_modules/@angular/common';
import { NotifierModule } from '../../node_modules/angular-notifier';
import { NgxUiLoaderModule } from '../../node_modules/ngx-ui-loader';
import { LoaderDetails, MY_MOMENT_FORMATS, MY_FORMATS } from './common/services/utilities/commonmethods';
import { LIMSHttpService } from './common/services/limsHttp.service';
import { LIMSContextServices } from './common/services/limsContext.service';
import { AlertService } from './common/services/alert.service';
import { LIMSHttpInterceptor } from './common/services/limsIntercepter.service';
import { EnvironmentModule } from './environment/component/environment.module';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime/date-time/adapter/moment-adapter/moment-date-time.module'
import { OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { GlobalButtonIconsService } from './common/services/globalButtonIcons.service';
import { StoreModule } from '@ngrx/store';
import { calibrationReducer } from './qcCalibrations/state/calibrations/calibration.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { CalibrationsEffects } from './qcCalibrations/state/calibrations/calibrations.effects';
import { analysisReducer } from './sampleAnalysis/state/analysis/analysis.reducer';
import { AnalysisEffects } from './sampleAnalysis/state/analysis/analysis.effects';
import { CalibrationArdsEffects } from './calibrationArds/state/calibrationArds/calibrationArds.effects';
import { calibrationArdsReducer } from './calibrationArds/state/calibrationArds/calibrationArds.reducer';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_HAMMER_OPTIONS } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppMaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    LoginModule,
    EnvironmentModule,
    ReactiveFormsModule,
    NotifierModule,
    OwlMomentDateTimeModule,
    NgxUiLoaderModule.forRoot(LoaderDetails.loaderConfig),
    StoreModule.forRoot({
      calibration: calibrationReducer,
      analysis: analysisReducer,
      calibrationArds: calibrationArdsReducer,

    }),
    StoreDevtoolsModule.instrument({
      name: 'Calibration',
      maxAge: 25,
    }),
    EffectsModule.forRoot(
      [CalibrationsEffects, AnalysisEffects, CalibrationArdsEffects]
    ),
  ],
  providers: [GlobalButtonIconsService,
    LIMSHttpService, LIMSContextServices, AlertService,
    {
      provide: HTTP_INTERCEPTORS, useClass: LIMSHttpInterceptor, multi: true
    },

    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_HAMMER_OPTIONS, useValue: { cssProps: { userSelect: true } } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
