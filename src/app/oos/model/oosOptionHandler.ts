export class oosOptionHandler {


    public static optionTitle: string = "N / A";
    public static optionList: any;

    public static optionType: OptionTypes;
    public static actionValidity: string;

    public static GetOptionDetails(actionValidity: string) {
        this.actionValidity = actionValidity;
        oosOptionHandler.setOptionType();
        oosOptionHandler.setOptions();
        return { title: oosOptionHandler.optionTitle, list: oosOptionHandler.optionList };
    }

    public static setOptionType() {
        switch (oosOptionHandler.actionValidity) {
            
            case "a":
            case "b":
                oosOptionHandler.optionType = OptionTypes.FURTHER_INVESTIGATION_REQUIRED_MFG;
                break;
            case "f":
            case "g":
                oosOptionHandler.optionType = OptionTypes.FURTHER_INVESTIGATION_REQUIRED_EXTENDED;
                break;
            case "v":
            case "i":
                oosOptionHandler.optionType = OptionTypes.SAMPLE_VALIDITY;
                break;
            case "w":
            case "o":
                oosOptionHandler.optionType = OptionTypes.ACCEPTANCE_CRITERIA;
                break;
            case "c":
            case "s":
                oosOptionHandler.optionType = OptionTypes.OBVIOUS_ERROR_IDENTIFIED_AS;
                break;
            case "m":
            case "e":
            case "l":
                oosOptionHandler.optionType = OptionTypes.FURTHER_INVESTIGATION_REQUIRED;
                break;
            case "y":
            case "z":
                oosOptionHandler.optionType = OptionTypes.ROOT_CAUSE_IDENTIFIED;
                break;
            default:
                oosOptionHandler.optionType = OptionTypes.NA;
                break;
        }
    }

    public static setOptions() {
        switch (oosOptionHandler.optionType) {
            case OptionTypes.SAMPLE_VALIDITY:
                oosOptionHandler.optionTitle = 'Validity of Sample';
                oosOptionHandler.optionList = [{ code: 'v', name: 'SAMPLE VALID' }, { code: 'i', name: 'SAMPLE INVALID' }];
                break;
            case OptionTypes.ACCEPTANCE_CRITERIA:
                oosOptionHandler.optionTitle = 'Acceptance Criteria';
                oosOptionHandler.optionList = [{ code: 'w', name: 'WITHIN LIMITS' }, { code: 'o', name: 'OUTSIDE LIMITS' }];
                break;
            case OptionTypes.OBVIOUS_ERROR_IDENTIFIED_AS:
                oosOptionHandler.optionTitle = 'Obvious Error Identified As';
                oosOptionHandler.optionList = [{ code: 'c', name: 'FOUND ASSIGNABLE CAUSE (CONFIRMED ERROR)' }, { code: 's', name: 'NO ASSIGNABLE CAUSE (SUSPECIOUS ERROR)' }];
                break;
            case OptionTypes.FURTHER_INVESTIGATION_REQUIRED:
                oosOptionHandler.optionTitle = 'Further Investigation Required';
                oosOptionHandler.optionList = [{ code: 'm', name: 'MANUFACTURING INVESTIGATION' }, { code: 'e', name: 'EXTENDED LABORATORY INVESTIGATION' }, { code: 'l', name: 'CONCLUDE OOS' }];
                break;
            case OptionTypes.FURTHER_INVESTIGATION_REQUIRED_MFG:
                    oosOptionHandler.optionTitle = 'Further Investigation Required MFG';
                    oosOptionHandler.optionList = [{ code: 'a', name: 'MANUFACTURING INVESTIGATION' }, { code: 'b', name: 'CONCLUDE OOS' }];
                    break;
                    case OptionTypes.FURTHER_INVESTIGATION_REQUIRED_EXTENDED:
                oosOptionHandler.optionTitle = 'Further Investigation Required Extended';
                oosOptionHandler.optionList = [{ code: 'f', name: 'EXTENDED LABORATORY INVESTIGATION' }, { code: 'g', name: 'CONCLUDE OOS' }];
                break;
            case OptionTypes.ROOT_CAUSE_IDENTIFIED:
                oosOptionHandler.optionTitle = 'Root cause was identified';
                oosOptionHandler.optionList = [{ code: 'y', name: 'Root Cause Identified' }, { code: 'Z', name: 'Root Cause Not Identified' }]
                break;
            default:
                oosOptionHandler.optionTitle = "N / A";
                break;
        }
    }

}

export enum OptionTypes {
    SAMPLE_VALIDITY,
    ACCEPTANCE_CRITERIA,
    OBVIOUS_ERROR_IDENTIFIED_AS,
    FURTHER_INVESTIGATION_REQUIRED,
    NA,
    ROOT_CAUSE_IDENTIFIED,
    FURTHER_INVESTIGATION_REQUIRED_MFG,
    FURTHER_INVESTIGATION_REQUIRED_EXTENDED
}