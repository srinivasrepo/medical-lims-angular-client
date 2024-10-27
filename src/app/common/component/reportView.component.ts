import { Component, Input } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LIMSContextServices } from '../services/limsContext.service';
import { CommonMethods } from '../services/utilities/commonmethods';
import { ReportBO } from '../../reports/models/report.model';
import { GlobalButtonIconsService } from '../services/globalButtonIcons.service';

@Component({
    selector: 'reportView',
    templateUrl: '../html/reportView.html'
})

export class ReportView {
    @Input() rpt: ReportBO;

    path: string;
    reportUrl: SafeResourceUrl = "";

    constructor(private activeModel: MatDialogRef<ReportView>, private sanitizer: DomSanitizer,
        private _context: LIMSContextServices, public _global: GlobalButtonIconsService) {
    }

    Close() {
        this.activeModel.close();
    }

    getUrl() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(environment.baseUrl + this.path + this.getReportVersionCode() + this.getEntityRPTCode() + this.getID() + this.ardxExecID() + this.getYear() + this.getMonth() + this.getDmsID() + this.token());
    }

    getID() {
        if (CommonMethods.hasValue(this.rpt.entActID))
            return "&id=" + this.rpt.entActID
        else
            return "";
    }

    getReportVersionCode() {
        if (CommonMethods.hasValue(this.rpt.versionCode))
            return "requestType=" + this.rpt.versionCode;
        else
            return "";
    }

    getEntityRPTCode() {
        if (this.rpt.reportType == 'LOG')
            return "entityRptCode=" + this.rpt.entityRPTCode;
        else
            return "";
    }

    token() {
        return "&token=" + this._context.limsContext.limsToken;
    }

    ardxExecID() {
        if (CommonMethods.hasValue(this.rpt.ardsExecID))
            return "&ardsExecID=" + this.rpt.ardsExecID;
        else
            return "";
    }

    getYear() {
        if (CommonMethods.hasValue(this.rpt.year))
            return "&year=" + this.rpt.year;
        else return "";
    }

    getMonth() {
        if (CommonMethods.hasValue(this.rpt.month))
            return "&month=" + this.rpt.month;
        else return "";
    }

    getDmsID() {
        if (CommonMethods.hasValue(this.rpt.dmsID))
            return "&dmsID=" + this.rpt.dmsID;
        else return "";
    }

    ngAfterContentInit() {
        if (this.rpt) {
            this.path = this.rpt.reportType == 'RPT' ? '/Reports/rptViewer.aspx?' : '/Reports/LogrptViewer.aspx?';
            this.reportUrl = this.getUrl();
        }
    }

    set setAuditReportUrl(val: string) {
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(val);
    }
}