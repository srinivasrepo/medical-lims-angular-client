import { Pipe, PipeTransform } from "@angular/core";
import { dateParserFormatter, CommonMethods } from '../services/utilities/commonmethods';

@Pipe({
    name: 'datePipe'
})
export class DatePipeComponent implements PipeTransform {
    transform(val, format) {
        if (!CommonMethods.hasValue(val))
            return 'N / A';

        return dateParserFormatter.FormatDate(val, format);
    }
}