export class Constants {
    // public static empGroupCode = "EMP_GROUP";
    // public static advisoryCommitteeCode = "TACS";
    // public static trainingtypesCode = "TRNG_TYPS";
    // public static tacMeeting = "TAC_MEETINGS";
    // public static trainerQualiCode = "TRNR_QUAL";

    public static entityKey = "entityCode";
    public static userAuditTypeKey = "UserAuditTypeKey";
}

export class GridActions {
    public static add = "ADD";
    public static edit = "EDIT";
    public static view = "VIEW";
    public static delete = 'DELETE';
    public static changeStatus = 'CHGSTAT';
    public static assign = 'ASSIGN'
    public static change = 'CHANGE';
    public static execute = 'EXECUTE';
    public static manage = 'MANAGE';
    public static NewVersion = 'NEWVERSION';
    public static update = 'UPD';
    public static MNG_OCC = "MNG_OCC";
    public static Report = 'VIE';
    public static ReStandardization = 'RE_STAND';
    public static Invalid = 'INVALID';
    public static mngPro = "MNG_PRO"
    public static ChangeUserPlanTest = "CHANGE_USR_PLAN_TEST";
    public static open = "OPEN";
    public static block = 'BLOCK';
    public static canConsume = "CANCONSUME";
    public static upload = "UPLOAD";
    public static NotIssued = "NOT_ISSUED";
    public static Discard = "DISCARD";
    public static assignAna = "ASSIGN_ANALYST";
    public static unAssign = "UN_ASSIGN";
    public static sendRequest = "SEND_REQUEST";
    public static Method_Res = "METHOD_RES";
    public static RRT = "RRT";
    public static RAW = "RAW";
    public static updateRemarks = "UPD_REMARKS";
    public static PDF = "PDF";
    public static sdmsData = "SDMS_DATA";
    public static uploadMethod = "UPLOAD_METHOD";
    public static viewMethod = "VIEW_METHOD"
    public static assignFormulae = "ASSIGN_FORMULAE";
    public static analysis = "ANALYSIS";
    public static assignSTP = "ASSIGN_STP";
    public static manageGroupTech = "MANAGE_GP_TECH";
    public static RS232Intergration = "RS232_INTEGRATION";
    public static Calib_Report = "CALIB_REPORT";
    public static SendForReview = 'SEND_FOR_REVIEW';
    public static checkList = "CHECK_LIST";
    public static DataReview_Report = "DATAREVIEW_REPORT";
    public static AnalyticalData_Report = "ANALYTICALDATA_REPORT";
    public static manageArdsDoc = "MNG_ARDS";
    public static RePrint = "RE_PRINT";
    public static ViewSpec = "VIEW_SPEC";
    public static ViewCalib = "VIEW_CALIB";
    public static GenerateNew = "NEW_REQ";
    public static Clone = 'CLONE';
    public static remove = 'REMOVE';
    public static disQualify = 'DIS_QUALIFY';
    public static SwitchSTP = "SWITCH_STP";
}

export class ButtonActions {
    public static btnSave = "Save";
    public static btnUpdate = "Update";
    public static btnEdit = "Edit";
    public static btnDelete = "Delete";
    public static btnGo = "Go";
    public static btnChange = "Change";
    public static btnUpload = "Upload";
    public static btnViewFiles = "View Files";
    public static btnView = "View";
    public static btnOk = "Ok";
    public static btnCancel = "Cancel";
    public static btnAdd = "Add";
    public static btnUsers = "Get Users";
    public static btnRoles = "Get Roles";
    public static btnViewDocus = "View Documents";
}

export class ButtonIcons {
    public static icnSave = "fas fa-save";
    public static icnUpdate = "fas fa-pencil-alt";
    public static icnEdit = "fas fa-pencil-alt";
    public static icnDelete = "fas fa-trash-alt";
    public static icnGo = "fas fa-play";
    public static icnChange = "fas fa-undo";
    public static icnUpload = "fas fa-upload";
    public static icnViewFiles = "fas fa-file-alt";
    public static icnView = "fas fa-eye";
    public static icnOk = "fas fa-check";
    public static icnCancel = "fas fa-times-circle";
    public static icnAdd = "fas fa-plus";
    public static icnUsers = "fas fa-users";
    public static icnRoles = "fas fa-user-tag";
    public static icnConfirm = "fas fa-check-circle";
    public static icnSearch = "fas fa-search";
    public static icnSearchAll = "fas fa-search-plus";
}

export class ActionMessages {
    public static GetMessageByCode(code: string) {
        switch (code) {
            case 'InValid Login!!!':
                return 'Please check the details';
            case 'NOACT_TEMP':
                return 'Please create template for this module';
            case 'NOACT_TEMP_DR':
                return 'Please create template for data review module';
            case 'PAYROLL_ALREADY':
                return 'Please payroll already created, please check once';
            case 'PAYROLL_NOT_START_AT':
                return 'Please payroll start from month of 26th';
            case 'PAYROLL_NOT_FUTUR':
                return 'Please payroll not start for future month';
            case 'NO_DEF':
                return "Please provide component definition for assigned components, to proceed confirmation";
            case 'NEWVER_CRE':
                return 'New version already creaded for this template';
            case 'ASSIGN_PAYROLL':
                return "Please assign payroll template for all active employees, to proceed run payroll";
            case 'DUPUSER':
                return 'Performed by and checked by should not be the same user';
            case 'EQPDUP':
                return 'Selected instrument is already in usage with specified time interval.';
            case 'OCCOPEN':
                return 'Selected equipment / instrument in already in usage with specified time interval';
            case 'DUPAPPUSER':
                return 'Previous level and current level approver should not be same';
            case 'OCCIDLE':
                return 'Please conclude either Waiting Period or Idle Condition for empty period';

            case 'MOB_PHASE_BAL_USED':
                return 'Please select occupancy is applicable or not for added Chemical/Solution';
            case 'MOB_PHASE_COMM':
                return 'Please give preparation comments';
            case 'MOB_PHASE_PH_METER':
                return 'Please add occupancy for given solution PH';
            case 'MOB_PHASE_WEIGHT':
                return 'Please add occupancy for given weight';

            case 'CHK_ANS':
                return 'Please provide answers for all checklists, to proceed confirmation';
            case 'INDI_OUTPUT_MANDAT':
                return 'Please provide output details';

            case 'DUPMAT':
                return 'This solution already exists, please proceed with another one';
            case 'DUP':
                return 'Request details modified by another user. Please re-initiate Request again';
            case 'SOL_QNTY_PREP':
            case 'VOL_SOL_QNTY_PREP':
            case 'SOL_QNTY_PREP_IND':
                return 'Please give quantity for added Chemicals/Solutions';
            case 'MND_SOLVENTS':
            case 'STOCK_CHE_DETAILS':
            case 'INDI_CHE_DETAILS':
            case 'MOB_PHASE_SOLVENTS':
                return 'Please add at least one chemical in list of chemical details';
            case 'CH_BAL_USED':
                return 'Please select occupancy is applicable or not for added chemical/solution';
            case 'CHMICA_SOLVENTS':
                return 'Please add at least one record in chemical details';
            case 'OCC_MND':
                return 'Please add at least one drying occupancy';
            case 'OCC_APP':
            case 'SAM_OCC_APP':
                return 'Please select occupancy applicable or not';
            case 'OCC_MANDATORY':
            case 'SAM_OCC_MAN':
                return 'Please add at least one occupancy';
            case 'OCC_MND_DET':
                return 'Please add occupancy in list of standardization details';
            case 'ALRDY_CATCODE':
                return 'Already category item code exists, please proceed with another one';
            case 'ALRDY_CATITEM':
                return 'Already category item exists, please proceed with another one';
            case 'DUPLICATE_USER':
                return 'Selected user already assigned as an analyst, please proceed with another';
            case 'NO_FINAL_VOLUME':
                return 'Please provide standard Dry tem and final volume details';
            case 'NO_STD_DETAILS':
                return 'Please provide standardization details';
            case 'SAME_USR_CONFIM':
            case 'DUP_APP_USER':
                return "Same user can't confirm action in two consecutive levels";
            case 'ACTIVITY_EXIST_TO_USER':
                return "User assiged for this task";
            case 'UPLOAD':
                return 'Please upload at least one document';
            case 'RSD_ERROR':
                return '% RSD is greater than 0.2 , so please raise invalidation to proceed further action';
            case 'MOB_PHASE_OUTPUT':
                return 'Please give the output details';
            case 'RSDQTY_ERR':
                return 'Quantity not available for start re-standardization';
            case 'VAL_EXISTS':
                return 'Validity period value already exists for selected module';
            case 'OCC_TO_DATE':
                return 'Please provide occupancy end time for the added chemicals/solutions';
            case "OCC_TO_DATE_DISC":
                return 'In order to discard this item, given instrument occupancy shall be invalidated';
            case 'MOB_OCC_IS_APP':
            //return 'Please select occupancy is applicable or not for added solvents';
            case 'CH_OCC_IS_APP':
                return 'Please select occupancy is applicable or not for added chemical/solution';
            case 'MND_OCC_IS_APP':
                return 'Please select occupancy is applicable or not for standardization details';
            case 'PH_METER_TO_DATE':
                return 'Please give instrument release date for add occupancy in preparation';
            case 'MND_SOL_CHEM':
                return 'Please add at least one chemical details to save preparation';
            case 'UOM_EXISTS':
                return 'Selected Uom is already exists for this material';
            case 'OCC_MND_IS_APP':
                return 'Please select drying occupancy applicable or not';
            case 'UOM_NOT_EXISTS':
            case 'UOM_NOT_EXISTS_ENGGMNT':
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.volumetricSol:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.mobilePhase:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.indicators:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.stockSolution:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.rinsingSolutions:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.sampleAnalysis:
                return 'Please add conversion uom for this chemical';
            case 'UOM_NOT_EXISTS_' + EntityCodes.calibrationValidation:
                return 'Please add conversion uom for this chemical';
            case 'DISCARD_FAILD':
                return 'Discard failed, Plese try again';
            case 'PH_OCC_IS_APP':
                return 'Please select occupancy required or not for ph meter';
            case 'NO_MFG_DATE':
                return 'Please select mfg. date for each chemical batch';
            case 'NO_EXP_DATE':
                return 'Please select expiry date for each chemical batch';
            case 'NO_GRADE':
                return 'Please select grade for each chemical batch';
            case 'NO_BLOCK':
                return 'Please select block for each chemical batch';
            case 'NO_PACK':
                return 'Please add pack details for each chemical batch';
            case 'LESS_QTY':
                return 'Quantity should be less than batch remaining quantity';
            case 'NO_QTY':
                return 'Invalid uom';
            case 'DUP_ANALYST':
                return 'Analyst vs Technique combination is already existing, so can’t proceed further';
            case 'DUP_DETAILS':
                return 'Already record exists with selected details, please proceed with another one'
            case 'NO_BALANCE_QTY':
                return "No balance quantity for selected batch, please select another one";
            case 'NO_BASE_UOM_QTY':
                return 'No base quantity for selected material, please select another one';
            case 'PREP_VALIDITY':
                return 'Please give the valid up to date';
            case 'ERR':
            case 'ERROR':
                return 'Unable to process your request'
            case 'UNDER_PROCESS':
                return "Your previous request pending from incharge, once completed you can proceed further";
            case 'DUP_TEST':
                return 'Sample analysis test details modified by another user. Please re-initiate request again.'
            case 'OOSAPP_GEN':
                return 'OOS approval request already generated for this test. Unable to save test results';
            case 'OOSINS_MISSING':
                return 'Please provide primary occupancy to proceed with OOS approval request';
            case 'OOS_NOTAPPLICABLE':
                return 'OOS not applicable for this specification test.';
            case 'OCC_MISS':
                return 'Unable to save test results. Please provide primary instrument occupancy to proceed';
            case 'OCC_MISS_PARAM':
                return 'Unable to save parameter results. Please provide primary instrument occupancy to proceed';
            case 'TO_TIME_MISSING':
            case "TO_TIME_MISSING_" + EntityCodes.sampleAnalysis:
            case "TO_TIME_MISSING_" + EntityCodes.oosModule:
                return 'Selected test name consists incompleted instrument occupancy information regarding end time, Please provide end time';
            case 'TO_TIME_MISSING_PARAM':
            case "TO_TIME_MISSING_" + EntityCodes.calibrationArds:
                return 'Selected parameter name consists incompleted instrument occupancy information regarding end time, Please provide end time';
            case 'ARDS_REFRESH_ACT_DOC':
                return 'Please Receive or Refresh the document in Active Documents module to continue print';
            case 'STAT_MISMATCH':
                return 'In order to discard, request status should be in requested';
            case 'MINONE':
                return 'Please select result applicable for at least one test, to proceed further action';
            case 'MINONE_PARAM':
                return 'Please select result applicable for at least one parameter, to proceed further action';
            case 'PENDING':
                return 'Please select result applicable or not for all tests, to proceed further action';
            case 'PENDING_PARAM':
                return 'Please select result applicable or not for all parameter, to proceed further action';
            case 'DUP_DCREQUEST':
                return 'Another request is pending for approval at QA';
            case 'DUPREVIEW':
                return 'Sampled by and reviewed by cannot be same.';
            case 'SAMQTY':
                return 'Please select quantity for analysis uom.';
            case 'PAKQTYNOMATCH':
                return 'Sampling quantity should equal container wise quantity.';
            case 'LIMITEXCEED10':
                return 'Sample qty. should not be more than 10 for packing materials.';
            case 'LIMITEXCEED':
                return 'Sample qty. should not be more than 10% of the remaining quantity in the batch / lot. Please check.';
            case 'NOSCHQTY':
                return 'Sample qty. is not configured in schedule. Please update inorder to proceed.';
            case 'NOUOMCONV':
                return 'Batch and sample uom cannot be converted. Please update inorder to proceed.';
            case 'NOQTY':
                return 'Sample qty. is not available in selected batch. Please update inorder to proceed.';
            case 'CAT_LEVEL_OCC':
                return 'Already sub test(s) results are submitted. Hence Category level primary occupancy cannot be deleted'
            case 'EXISTS_PRIMARY':
                return "Already primary occupancy added to the list";
            case 'CHILDOCC':
                return "Already occupancy submitted to Sub Test(s), Won't allow to add in category level";
            case 'PARENTOCC':
                return "Already occupancy submitted category level, Won't allow to add in test level";
            case 'NO_JUSTIFI':
                return "Please enter justification, to proceed further action";
            case 'DUP_PRIMARY_OCC':
                return 'Primary occupancy already added to the list you are not able to add another occupancy';
            case 'DUP_PARAM_OCC':
                return 'Parameter occupancy already added to the list you are not able to add another occupancy';
            case 'CLOSE_ADD':
                return 'Analysis is completed; New tests cannot be added'
            case 'CLOSE_DELETE':
                return 'Analysis is completed; Tests cannot be deleted';
            case 'OOS_NOTAPPLICABLE':
                return "OOS Not Applicable for this Test";
            case 'OOSAPP_GEN':
                return "OOS Approval Request already generated for this Test";
            case "OOSAPP_OPEN":
                return "Some of the tests are pending at OOS Approvals. Please approve them in order to proceed";
            case 'OOS_OPEN':
                return "Some of the test results are pending at OOS. Please approve them in order to proceed";
            case 'OOS_RISED':
                return 'OOS already started, Please do not exclude the test';
            case 'STD_FINAL_VOLUME':
                return 'Final volume should not be more than Standardization volume';
            case 'AT_LEAST_TST':
                return 'Please add at least one parameter';
            case 'INP_PENDING':
                return 'In-process sample(s) not yet completed. You cannot proceed.';
            case 'EQP_MANDATORY':
                return 'Please provide primary occupancy to invalidate';
            case 'UOM_NOT_EXISTS_STOCK_SOL':
                return 'Please add conversion uom for this chemical';
            case 'UPD_SPEC_RESULT':
                return 'Please submit result and remarks for each cycle, to proceed further action';
            case 'RESULT_PENDING':
                return 'Please submit result for selected spec. test, to proceed further action';
            case 'PARAM_RESULT_PENDING':
                return 'Please submit result for selected parameters, to proceed further action'
            case 'OCC_REQ_INV':
                return 'Please add at least one primary occupancy in titration to rise Invalidation request';
            case 'MAT_EXISTS':
                return 'Solution already exists, please proceed with another one';
            case 'MATCD_EXS_' + EntityCodes.volumetricSol:
                return 'STP ref. number already exists, please proceed with another one';
            case 'MATCD_EXS_' + EntityCodes.indicators:
            case 'MATCD_EXS_' + EntityCodes.stockSolution:
                return 'Solution short code / name already exists, please proceed with another one';
            case 'BATCH_QNTY_LESS':
                return 'Batch quantity should be lesser than actual batch quantity';
            case 'INVAL_PENDING':
                return 'Please close invalidation(s) for raised test(s), to proceed further action';
            case 'INVAL_PENDING_PARAM':
                return 'Please close invalidation(s) for raised parameter(s), to proceed further action';
            case 'SPEC_INACT':
                return "Selected A.R No. specification is Obsolete / Revised / In-Active, can't able to proceed";
            case 'INDEX_INACTIVE':
                return "Selected solution index In-Active, can't able to proceed";
            case 'NO_PRI_STD':
                return 'Please provide Primary Standard Drying Temp., to proceed further action';
            case 'NO_DRY_DUA':
                return 'Please provide drying duration, to proceed further action';
            case 'NO_COL_DUA':
                return 'Please provide cooling duration, to proceed further action';
            case 'ALREADY_EXISTCAT':
                return 'Category is already existed, please enter another one.';
            case 'ALREADY_EXISTSUB_CAT':
                return 'Sub category is already existed, please enter another one.';
            case 'ANA_INCOM':
                return 'Please complete analysis, to proceed further action';
            case 'NO_EVALU':
                return 'Please submit evaluation details,to proceed further action';
            case 'PRE_DET':
                return "Please provide preparation details, to proceed further action";
            case 'BRI_DESC':
                return 'Please provide brief description, to proceed further action';
            case 'AT_ONE_TEST':
                return 'At least one parameter is required to proceed further';
            case 'TO_TIME_INV':
                return "Please provide occupancy end time for the added chemicals/solutions, to raise invalidation";
            case 'INV_ACT_AQ':
                return "Send back option is not applicable at this level";
            case 'INV_ACT':
                return "Selected Action is not applicable.";
            case 'NO_PREP_DETAILS':
                return "Please provide preparation result details";
            case 'LESS_RESER_QTY':
                return "Quantity should be less than pack batch remaining quantity - reserved quantity";
            case 'WRONG_VALUE':
                return "Please enter numeric values";
            case 'TEST_FINAL':
                return 'Please select test final formula, to proceed further action';
            case 'GROUP_FINAL':
                return 'Please select final formulas for all tests, to proceed further action';
            case 'CON_ANA_PENDING':
                return 'Please start container wise analysis';
            case 'CON_ANA_MINONE':
                return 'Please select result applicable or not for all tests in container wise analysis tab, to proceed further';
            case 'CON_ANA_RES_PENDING':
                return 'Result not submitted for applicable test in container wise analysis';
            case 'CON_ANA_INVAL_PENDING':
                return 'Please close invalidation(s) for raised test(s) in container wise analysis, to proceed further action';
            case 'REQ_PENDING':
                return "Please submit initiation details, to proceed further action";
            case 'EVAL_PENDING':
                return "Please submit evaluation details, to proceed further action";
            case 'REVIEW_PENDING':
                return "Please submit review details, to proceed further action";
            case 'REVIEW_PENDING_TAB':
                return 'Please submit review details to confirm ARDS';
            case 'ANA_APP_NOT_SAM':
                return 'Analyst and Approval user can’t be same';
            case 'ANA_APP_SAM':
                return 'Selected Analyst only can proceed with a request';
            case 'OOS_RAISED':
                return 'OOS raised for the test(s), can not proceed the reset request';
            case 'INVALIDATION_RAISED':
                return 'Invalidation raised for the test(s), can not proceed the reset request';
            case 'SELECT_GRP_TEQ_' + EntityCodes.calibrationValidation:
                return 'Please select group technique for selected parameter';
            case 'SELECT_GRP_TEQ_' + EntityCodes.specValidation:
                return 'Please select group test for selected test';
            case 'TEST_NOT_GRP_' + EntityCodes.calibrationValidation:
                return 'Selected parameter is not a group technique'
            case 'TEST_NOT_GRP_' + EntityCodes.specValidation:
                return 'Selected test is not a group test';
            case "DUP_PARAMER":
                return "Same parameter details should not be added";
            case "NEW_VERS_EXIS":
                return "Version already exists, please proceed with another one";
            case "DAILY_CALIB_PENDING":
                return "Please complete calibration process for this instrument, to proceed further";
            case 'GRP_TECH_ASSIGNED':
                return "Should not select group parameter and sub group parameter as a group technique in same group";
            case 'NO_PARAM_OCC':
                return 'Please submit parameter occupancy for each parameter, to proceed further';
            case 'PARAM_TO_TIME':
                return "Please submit parameter occupancy end time for each parameter, to proceed further";
            case 'PRIM_TODATE_SB':
                return 'Primary occupacy end time submitted, so can not modify parameter occupancy end time';
            case 'TO_TIME_PRIMARY':
                return "Please submit primary occupancy end time, to proceed further";
            case 'PENDING_REMARKS':
                return 'Please submit required details, to proceed further action';
            case 'PENDING_COA':
                return 'Please submit required details, to proceed further action';
            case 'ALRDY_TEST_ASSIGN':
                return 'Selected test / parameter already in process';
            case 'SAME_USER':
                return 'Same user can not confirm review and send for review';
            case 'DUP_TEST_' + EntityCodes.sampleAnalysis:
                return 'Sample analysis test details modified by another user. Please re-initiate request again.'
            case 'DUP_TEST_' + EntityCodes.calibrationArds:
                return 'Parameter details modified by another user. Please re-initiate request again.'
            case 'DUP_TEST_' + EntityCodes.oosModule:
                return 'Sample analysis test details modified by another user. Please re-initiate request again.'
            case 'TEST_RESULT_' + EntityCodes.sampleAnalysis:
                return 'Please submit result for selected test';
            case 'TEST_RESULT_' + EntityCodes.calibrationArds:
                return 'Please submit result for selected parameter';
            case 'GROUP_RESULT_' + EntityCodes.sampleAnalysis:
                return 'Please submit result for all test under selected test';
            case 'GROUP_RESULT_' + EntityCodes.calibrationArds:
                return 'Please submit result for all parameters under selected parameter';
            case 'ALRD_SEND_REVIEW_' + EntityCodes.sampleAnalysis:
                return 'Selected test already sent for review';
            case 'ALRD_SEND_REVIEW_' + EntityCodes.calibrationArds:
                return 'Selected parameter already sent for review';
            case 'GENERATE_REPORT_' + EntityCodes.sampleAnalysis:
            case 'GENERATE_REPORT':
                return 'Please generate ARDS report';
            case 'GENERATE_REPORT_' + EntityCodes.calibrationArds:
                return 'Please generate ARDS report'
            case 'TEST_SENT_FOR_REVIEW':
                return 'Selected test sent for review, you cannot raise invalidation';
            case 'PARAMETER_SENT_FOR_REVIEW':
                return 'Selected parameter sent for review, you cannot raise invalidation';
            case 'PARAM_SENT_REVIEW':
                return 'Selected parameter sent for review, you cannot modify result';
            case 'TEST_SENT_REVIEW':
                return 'Selected test sent for review, you cannot modify result';
            case 'CHECKED_BY_PENDING':
                return 'Please provide checked by details for the provided test results';
            case 'CON_ANA_APP_INV':
                return 'Invalidation(s) are pending in container wise analysis';
            case 'ANA_APP_INV':
                return 'Invalidation(s) are pending in analysis';
            case 'QA_REMARKS_PENDING':
                return 'Please submit QA remarks, to proceed further action';
            case 'BATCH_EXISTS':
                return "Batch number already exists, please proceed with another one";
            case 'INV_RAISED':
                return "Invalidation Raised for the test(s), Cannot Exclude test";
            case 'TEST_SENT_TO_REVIEW':
                return "Test sent to review, can not proceed the exclude request";
            case 'PARAM_SENT_TO_REVIEW':
                return "Parameter sent to review, can not proceed the exclude request";
            case 'NOT_SEND_FOR_REVIEW_PARAM':
                return 'All the parameters should be sent for review';
            case 'QC_REVIEW_NOT_COM_PARAM':
                return 'QC review not completed for some parameters';
            case 'QA_REVIEW_NOT_COM_PARAM':
                return 'QA review not completed for some parameters';
            case 'NO_COMMENTS':
                return 'Please submit comments';
            case 'NO_OOS_ROOT_CAUSE':
                return 'Please submit laboratory investidation checklist details';
            case 'NO_CHK_REMARKS':
                return 'Please submit remarks for each checklist item in laboratory investidation tab';
            case 'ANALYSIS_NOT_COM':
                return 'Please complete analysis to proceed further';
            case 'NO_JUSTIFICATION':
                return 'Please submit justification info.';
            case 'NO_CORR_ACTION':
                return 'Please submit user analysis details';
            case 'NO_OOS_REMARKS':
                return 'Please submit remarks';
            case 'NO_CATB_COMMENTS':
                return 'Please submit category B comments tab details';
            case 'NO_DEPTS':
                return 'Please select departments for review';
            case 'REVIEW_NOT_COMPLETED':
                return 'Department review not yet completed';
            case 'NO_PROBABLE':
                return 'Please submit manufacture investigation tab details';
            case 'NO_CAPA':
                return 'Please provide CAPA details, to proceed further';
            case 'DUPLICATE':
                return 'Error Occured ! Try Again.';
            case 'DUPGEN':
                return 'Already generated auto deviation for this oos.';
            case 'NO_QC_SUMMARY':
                return 'Please submit QC summary details';
            case 'NO_OOS_JUSTI':
                return 'Please submit justification for delay';
            case 'QA_APP_PENDING':
                return 'QA approval pending in OOS Approvals module against this test';
            case 'COL_VERIFY_NOTDEFINED':
                return 'Please provide column verification details for the selected column id inorder to proceed further';
            case 'COL_VERIFY_FAIL':
                return 'Selected column id verification status is failed';
            case 'FORMULA_ASSIGN':
                return 'Selected formula already assigned, please proceed with another one';
            case 'DOC_FAILED':
                return 'Document download failed, please try again';
            case 'INVAL_NOT_COMPLETED':
                return 'Please close invalidation(s), to proceed further';
            case 'DUP_STATUS_CODE':
                return 'Status code already exists, please proceed with another one';
            case 'DUP_STATUS':
                return 'Status already exists, please proceed with another one';
            case 'ALR_EXISTS':
                return 'Action already exists, please proceed with another one';
            case 'DOC_EXISTS':
                return 'Document already exists, please proceed with amother one';
            case 'ARDS_REFRESH_ACT_DOC':
                return "Please Receive or Refresh the document in Active Documents module to continue print";
            case 'ANALYST_NOT_OCC':
                return 'Analyst(s) not occupied with tests';
            case 'ARDS_ISS':
                return 'ARDS not received yet; Please collect Prints to proceed';
            case 'SPEC_VER_TESTS':
                return "Selected test or ARDS got update, so can't proceed";
            case 'AGAINST_RESULT':
                return "Sample status is Rejected/Discarded, so cannot Qualify the selected Analyst.";
            case 'NO_MASTER_TECH':
                return "All the tests in category/sub-category are not selected, please check in order to proceed further";
            case 'PREV_CALIB_PENDING':
                return "Previous instrument calibration is not yet completed";
            case 'SPEC_INACT_OBS':
                return "Some of the selected specifications are updated, Please check to proceed further";
            case 'PACK_ANA_STARTED':
                return "Some of the selected packs are started analysis, please check to proceed further";
            case 'PACK_SKIPPED':
                return "Pack is skipped from analysis, please include it to proceed further";
            case 'SAM_OCC_TO':
                return "Please give instrument release date for add occupancy";
            case 'SAMPLE_NOT_COM':
                return "Please complete sampling, to proceed further action";
            case 'COMPRE_CHK_LST':
                return "Please submit comprehensive checklist details";
            case 'ANALYST_CAN_PERFORM':
                return "Only Selected Analyst in Analyst Qualification can perform the Analysis";
            case 'VSANALYST_CAN_PERFORM':
                return "Only Selected Analyst in Analyst Qualification can perform the Solution";
            case 'PERMANENT_RPT_NOT_GEN':
                return "Permanent reports are not generated";
            case 'PREP_OCC_TO_DATE':
            case 'OCC_TO_DATE_INST':
                return 'Please provide occupancy end time for added instruments';
            case 'OCC_TO_DATE_END':
                return 'Please provide occupancy end time for added occupancy';

            case 'IMPDUP':
                return 'Impurity Name already exists, please proceed with another one';
            case 'SOL_IN_ACT':
                return "Selected Solution was in-Active, can’t save Calibration solution details";
            case 'PAR_IN_ACT':
                return "Selected Parameter was in-Active, can’t save Calibration solution details";
            case 'OOS_TEST':
                return 'OOS is raised for seleceted test , you cannot raise invalidation';
            case 'OOS_PARAM':
                return 'OOS is raised for seleceted parameter , you cannot raise invalidation';
            case 'OOS_INST':
                return 'Unable to save test results. Please provide Primary (or) Additional Instrument Occupancy to proceed.';
            case 'OOS_INST_OCC':
                return 'Primary (or) Additional Equipment Occupancy information is incompleted regarding End Time.';
            case 'OOS_TEST_PEN':
                return 'Test(s) information is incomplete.\r\nPlease provide test result(s) to proceed.';
            case 'OOS_TEST_RES':
                return 'One or more test results are failed; you cannot approve';
            case 'SAMPLE_SUSP':
                return 'Some of the selected samples are suspended in sample analysis, Please check to proceed further';
            case 'AUQUAL_TEST_ASSIGN':
                return ' Should not unassign analyst qualification test';
            case 'TASK_INV':
                return 'Selected task in already involved in plan';
            case 'REQ_UND_INCH':
                return 'Request is under In-charge/HOD approval, Please check to proceed further';
            case 'TEST_ASSIGN_INCHARGE':
                return 'Some of the selected task(s) are assigned in In-Charge level, Please check to proceed further';
            case 'USGE_TYP_IN_ACT':
                return "Selected usage type is in-active, please proceed with another one";
            case 'DISC_OCC':
            case 'OCC_DISC_TO_UPDATE':
                return " To discard record, please  release / invalidate added occupancies ";
            case 'NO_EARDS':
                return "STP not assigned to this specification/calibration parameter, please check once";
            case 'NO_TEST_STP':
                return "STP not assigned to the selected test/parameter, please check once";
            case 'INVALID_RAISED':
                return 'Invalidation raised for the test/parameter, can not switch ARDS mode';
            case 'STP_NOT_VALID':
                return 'Test/Parameter STP is not in valid status, please check once';
            case 'DISC_INST_OCC':
                return 'Please submit instument occupancy to time, to proceed further';
            case 'INVAL_ACTION':
                return 'Send back is not applicable';
            case 'OCC_TO_SPEC_RESET':
                return "Please provide instrument occupancy end time, to proceed spec reset";
            case 'DATAREVIEW_NOT_COM':
                return "Please complete data review for started test(s)/parameter(s), to proceed spec reset";
            case 'NO_OOS_DESC':
                return "Please provide description of OOS, to proceed further";
            case 'NO_ARDS_RPT':
                return "ARDS reports are not found, for this request";
            case "NOT_FOUND":
                return "No uploaded documents";
            case 'NEWSCHDATE_PLACED':
                return 'New schedule already placed against to this instrument';
            case "NO_IMPURITY":
                return "Please add atleast one impurity";
            case "ASSIGN_PEACKVALUES":
                return "Please assign peak values, to proceed further";
            case "KNOWN_CONFIRM":
                return "Please confirm known impurity peak values";
            case "UNKNOWN_CONFIRM":
                return "Please confirm unknown impurity peak values";
            case "NOIMP_DATA":
                return "Please provide all dependent values, to proceed further";
            case "PREV_CLS_PENDING":
                return "Previous shift work report not in final status";
            default:
                return code;
        }
    }
}

export class EntityCodes {
    public static ROLE_MGMT = "ROLE_PERM";
    public static master = "MASTERS";
    public static mobilePhase = "MOBILE_PHASE";
    public static invalidations = "INVALIDATIONS";
    public static indicators = "INDICATOR";
    public static volumetricSol = "VOLSOLUTION";
    public static analystQualif = "ANALYST_QUALIFICATION"
    public static samplePlan = "SAMPLE_PLAN";
    public static sampleAnalysis = "QCSAMPASYS";
    public static qcInventory = "QC_INV";
    public static calibParamSet = "CAL_PARAM_SET";
    public static stockSolution = "STOCK_SOL";
    public static calibrationArds = "ENGGMNT";
    public static specValidation = "SPEC_VALID";
    public static rinsingSolutions = "RINSING_SOL";
    public static sampleDestruction = "SAMPLE_DESTRUCTION";
    public static calibrationValidation = "CALIB_VALIDATION";
    public static oosModule = "OOSPROC";
    public static dataReview = "DATA_REVIEW";
    public static analyticalDataReview = "ANA_DATA_REVIEW";
    public static closeShift = "CLOSE_SHIFT";
    public static SamArds = "SAM_ARDS";

    // For RS232 Integration added
    public static rs232StatusMain = "RS232_STATUS";
    public static rs232_INTEGRATION = "RS232_INTEGRATION";


}

export class ConditionCodes {
    public static MOBILE_PHASE = "MOBILE_PHASE";
    public static STOCK_SOL = "STOCK_SOL";
    public static VOLSOL_STD = "VOLSOL_STD";
    public static INDICATOR = "INDICATOR";
}

export class UserEntityTypes {
    public static AUDIT_SUPPLIER = "AUDIT_SUPPLIER";
    public static AUDIT_CUSTOMER = "AUDIT_CUSTOMER";
    public static AUDIT_REGULATORY = 'AUDIT_REGULATORY';
    public static AUDIT_QUALITY = 'AUDIT_QUALITY';
    public static AUDIT_INTERNEL = "AUDIT_INTERNEL";
}

export class DCActionCode {
    // public static SAMANA_RESET = "SAMANA_RESET";
    public static STB_ANA_DT_EXP = "STB_ANA_DT_EXP";
    public static SAMANA_UPDREMARKS = "SAMANA_UPDREMARKS";
    public static SAMANA_TEST_UPD = "SAMANA_TEST_UPD";

    public static SAMANA_RESET = "LIMS_ANA_SPEC_RESET";
    public static LIMS_CONTAINER_SPEC_RESET = "LIMS_CONTAINER_SPEC_RESET";
    public static ARDS_REPRINT = "ARDS_REPRINT";
    public static RPT_EXECUTE = "RPT_EXECUTE";
}

export class Categories {
    // public static BALANCE_POS = "BALANCE_POS";
    public static SUPP_PURPOSE = "PURPOSE";
    public static SUPP_TYPE = "SUPPLIER_TYPE";
    public static SUPP_CATEGORY = "SUPP_CATEGORY";
    public static PURPOSE_INT = "PURPOSE_INT";
    public static PURPOSE_QMS = "PURPOSE_QMS";
    public static AUD_SERV_NAME = "AUD_SERV_NAME";
    public static SUP_AUD_RESP = "AUD_RESP";
    public static SUP_FUR_ACT = "FUR_ACT";
    public static SUP_COMP_STATUS = "SUP_COMP_STATUS";
    public static AUD_SUP_EXC = "AUD_SUP_EXC";
    public static QMS_MAS_CHKLIST = "QMS_MAS_CHKLIST";
    public static INTER_CHK_LIST = "MASTER_CHK_LIST";



    // Analysis

    public static specificationApplicableCode = "ANALYSIS_MODES";

}

export class LimsRespMessages {
    public static delete = 'Do you wish to delete ?';
    public static addedItem = "Request details saved successfully";
    public static updateItem = "Request details updated successfully";
    public static invalidUploadFile = "Successfully invalidated";
    public static deleteItem = "Successfully deleted";
    public static fileSuccess = "Successfully uploaded";
    public static mergerFiles = "Successfully merged files";
    public static reportUpdated = "Successfully report updated";
    public static fileSizeErr = "Uploaded file size should not be greater than 4 MB";
    public static changeStatusSuccess = "Successfully status changed";
    public static checkDetails = "Please Check The Details";
    public static assignSuccess = "Successfully Assigned";
    public static actionConfirm = "Action confirmed successfully";
    public static saved = "Successfully saved";
    public static mustBeActive = "If Changing The Status , Record Must Be Active";
    public static created = "Successfully created";
    public static orderSave = "Successfully document order saved";
    public static continue = "Are you sure , do you want to continue ?"
    public static chooseOne = "Please choose any one";
    public static toQualify = "Are you sure do you wish to qualify the user ?";
    public static toDisQualify = "Are you sure do you wish to disqualify the user ?";
    public static discard = "Template successfully discarded";
    public static changeResult = "Are you sure, do you want to change the result";
    public static skipResult = "Are you sure, do you want to skip the result";
    public static viewInfo = "Page is in view mode, you can not proceed with this action";
    public static rsIntegrationReset = "Any SDMS data received will be invalidated; Do you wish to continue ?";
    public static confirmValid = "Any unsaved data will be lost; ensure before taking action.";
}

export class CapabilityList {   // To Display Grid Actions Depending On User Capability 
    public static CREATE = "CRE";
    public static UPDATE = "UPD";
    public static VIEW = "VIE";
    public static APPROVE = "APP";
}

export class CapabilityActions {
    createCap: boolean;
    actionList: Array<any> = [];
    public static APPROVE = "APP";
    manageCapability: boolean;
    exportCap: boolean;
}

export enum LookupCodes {
    balances = "GetBalancesTypes",
    plantMaterials = "PlantMaterials",
    searchPlantMaterials = "SearchPlantMaterials",
    testName = "GetParameterName",
    invBatch = "INVBATCHES",
    auditActions = "GetAuditActions",
    allUsers = "ALLACTIVEUSERS",
    userDetails = "GetUserDetails",
    statusMaster = "StatusMaster",
    getProducts = "ALLPRODUCTS",
    getSpecifications = "GetSpecifications",
    getAllMaterials = "PlantMaterials",
    getActiveEquipments = "GetActiveEquipments",
    getInvalidations = "GetInvalidations",
    getPlantWiseProd = "GetPlantWiseProd",
    indicatorDetails = 'IndicatorDetails',
    getSolutionIndex = 'GetSolutionIndex',
    getQCUsers = "GetQCUsers",
    getSampleActivity = "SampleActivityInfo",
    invalidationActivityInfo = "InvalidationActivityInfo",
    samplingActivityInfo = "SamplingActivityInfo",
    manualActInfo = "GetCategoryItems",
    getSamplePlan = "GetSamplePlans",
    getSampleNumbers = "GetSampleNumbers",
    getLOTBatcheNumbers = "GetLOTBatcheNumbers",
    getARNumbers = "GetARNumbers",
    getProjects = "GetProjects",
    getSpecificatioinTests = "GetSpecificatioinTests",
    getSpecificationSearch = "GetSpecificationSearch",
    changeUserPlanTestDetails = "ChangeUserPlanTestDetails",
    planSamplingInfo = "PlanSamplingInfo",
    labInventoryBatch = "LabInventoryBatch",
    getInventoryDetails = "GetInventoryDetails",
    wetAndInstrumentationInfo = "WetAndInstrumentationInfo",
    inchargeInvalidationActivities = "InchargeInvalidationActivities",
    changeUserPlanAndTest = "ChangeUserPlanAndTest",
    changeUserPlanOOSTest = "ChangeUserPlanOOSTest",
    activeTechniques = "ActiveTechniques",
    getComponents = "GetComponents",
    getDestructionDetails = "DestructionCode",
    arNumbers = "ArNumbers",
    getVolSolutionIndexMaterials = "GetVolSolutionIndexMaterials",
    getTestSolIndexMaterials = "GetTestSolIndexMaterials",
    getAnalysisAdditionalOccu = "GetAnalysisActInstruments",
    getActiveInstruments = "GetActiveInstruments",
    getOOSBatchNumbers = "GetOOSBatchNumbers",
    getOosTests = "GetOosTests",
    getAnalysisColumnID = "GetActHplcGCClol",
    getAdditionalTest = "GetAdditionalTest",
    GetDeviationRequest = "GetDeviationRequest",
    GetPlannedChange = "GetPlannedChange",
    GetChangeControl = "GetChangeControl",
    GetInitProcSearch = 'GetInitProcSearch',
    GetExportCAPA = 'GetExportCAPA',
    getSpecTestCategories = "GetSpecTestCategories",
    getSpecSubCategories = "GetSpecSubCategories",
    getAnaTest = "GetAnaTest",
    getStockTest = "GetStockTest",
    getSamARNumbers = "GetSamARNumbers",
    getGroupTests = "GetGroupTests",
    getSDMSDetails = "GetSDMSDetails",
    getSDMSDetailsImpurities = "GetSDMSDetailsImpurities",
    standardTestProc = "StandardTestProc",
    calibrationReference = "CalibrationReference",
    getTests = 'GetTests',
    getCalibrationParameters = "GetCalibrationParameters",
    getCalibInstr = "GetCalibrationParameterSets",
    getInstrumentCalibration = 'GetInstrumentCalibration',
    analysisDataReview = "AnalysisDataReview",
    calibrationDataReview = "CalibrationDataReview",
    getManufacturers = "GetManufacturers",
    getMBBatchNumbers = "GetMBBatchNumbers",
    userControlDetail = "UserControlDetail",
    getPlantCustomers = "GetPlantCustomers",
    mobilePhaseProduct = "MobilePhaseProduct",
    searchMobilePhase = "SearchMobilePhase",
    searchVolumetricSolution = "SearchVolumetricSolution",
    searchCalibrationSolution = "SearchCalibrationSolution",
    searchRinsingSolutions = "SearchRinsingSolutions",
    solutionFormulae = "SolutionFormulae",
    DMSMappedDocuments = "DMSMappedDocuments",
    getCloseShift = "GetSearchCloseShit",
    getBatchesForSendSample = "GetBatchesForSendSample",
    getDREntityReferenceNumbers = "GetDREntityReferenceNumbers",
    getAQInwardNumbers = "GetAQInwardNumbers",
    getAllUsers = "GetAllUsers",
    getSampleAnalysisSearchArNumber = "GetSampleAnalysisSearchArNumber",
    dataReviewActivityInfo = "DataReviewActivityInfo",
    dataReviewActivityInfoInchargeLevel = "DataReviewActivityInfoInchargeLevel",
    oosActivityInfo = "OOSActivityInfo",
    oosActivityInfoInchargeLevel = "OOSActivityInfoInchargeLevel",
    calibActivityInfo = "CalibActivityInfo",
    calibActivityInfoInchargeLevel = "CalibActivityInfoInchargeLevel",
    getQCInstruments = "GetQCInstruments",
    searchAnalystQualification = "SearchAnalystQualification",
    WRKREFSampleMaterials = "WRKREFSampleMaterials",
    WorkRefPacks = "WorkRefPacks",
    getAllCategoryItems = "GetAllCategoryItems",
    getAllEquipmentsInstruments = "GetAllEquipmentsInstruments",
    getMaintenanceSchedule = "GetMaintenanceSchedule",
    getMaintenanceEquipments = "GetMaintenanceEquipments",
    getRefEqpOthOccupancyDetails = "GetRefEqpOthOccupancyDetails",
}


export class PageUrls {
    public static splash = "/splash";
    public static homeUrl = '/lims/home';
    public static searchAudTrail = '/lims/audit';
    public static searchMngMaster = '/medicallims/mngMaster';
    public static searchRolePer = '/lims/rPermission';
    public static searchMobile = "/lims/mobilePhase";
    public static searchInv = '/lims/invalidations';
    public static searchIndicator = '/lims/indicator';
    public static volmetricSol = '/lims/volmetricSol';
    public static analystQualif = "/lims/analystQualify";
    public static shiftClose = "/lims/samplePlan/shiftClose";
    public static searchSamplePlan = "/lims/samplePlan";
    public static searchQcInvtUrl = "lims/qcInventory/qcInvtSearch";
    public static searchSampleDestruction = "/lims/sampleDestruction/search";
    public static searchStockSolution = "/lims/stockSolutions";
    public static searchQCCalib = "/lims/qcCalib";
    public static searchRinSol = "/lims/rinsingSol";
    public static searchSampleAnalysis = "lims/sampleAnalysis";
    public static SearchspecValid = "lims/specValid";
    public static searchDataReview = "lims/dataReview";
    public static searchOOS = "lims/oos";
    public static searchShifClose = "/lims/samplePlan/searchCloseShift";
    public static searchVolSol = "lims/volmetricSol/add";
    public static viewVolSol = "lims/volmetricSol/viewVolSolIdx";
    public static login = "/login";
    public static clogin = "/clogin";
}

export class SearchPageTooltip {
    public static srchInvalidation = "Invalidation Number / Product Name / Material Name / Batch Number / Reference Number / Test Name / Parameter Name";
    public static srchSampAnalysis = "AR Number / Product Name/Material Name / Batch Number / Analysis Type";
    public static srchAnaQualification = "Technique / Analyst Name / Material/Product Name / Analysis Type";
    public static srchSpecValidation = "Specification Number / Specification Type / STP Number / Test Name";
    public static srchCalibValidation = "Parameter Set Number / STP Number / Parameter Name";
    public static srchDataReview = "AR Number / Reference Number / Product Name / Material Name / Instrument ID / Batch Number / Analysis Type / Schedule Type / Test / Parameter Name";
    public static srchMobilePhase = "Preparation Type / Instrument Type / Product Name / Material Name / Test/Parameter Name";
    public static srchTestSolution = "Name of the Solution / Solution Type / Batch Number";
    public static srchVolumetricSol = "Name of the Solution / STP Number / Batch Number";
    public static srchStockSol = "Name of the Solution / Parameter Name / Instrument Type / Instrument ID";
    public static srchRinsingSol = "Name of the Solution / STP Number / Usage Type / Batch Number";
    public static srchSampleDes = "Request Created By / Request Created On / Source of Samples / Type of Waste";
    public static srchQCInv = "Name of the Chemical / Chemical Source / Batch Number / Chemical Type";
    public static srchQcCalib = "Instrument Type / Instrument ID / Title / Status";
    public static srchEqpMain = "Instrument Type /Instrument ID / Calibration Reference Number";
    public static srchSamPlan = "Plan Created By / Work Shift / Status / Reference Number";
    public static srchCloseShift = "Analyst Name / System Code / Status";
    public static srchOos = "Name of the Solution / Solution Type / Batch Number"
}

export class NavigateToSchedulePage {

    private static supplierSchedule = '/lims/supAudit/supplier';
    private static internalSchedule = '/lims/internalQuaSch/manageSch';
    private static regulatorySchedule = "/lims/reguAudit/manageRegulatory";
    private static customerSchedule = "/lims/custAudit/customerAudit";
    private static qmsSchedule = "limss/qmsAuditSch/manageQmsAud";

    public static SchedulePageByType(type: string) {
        switch (type) {
            case 'S':
                return this.supplierSchedule;
            case 'I':
                return this.internalSchedule;
            case 'R':
                return this.regulatorySchedule;
            case 'C':
                return this.customerSchedule;
            case 'Q':
                return this.qmsSchedule;
        }
    }
}


export class MaterialCategories {
    public static GetMaterialCategoryCode(code) {
        switch (code) {
            case 'RAW_MAT' || 'PRC_RAW' || 'SAM_RAW':
                return 'SUBCAT_RAWMAT';
            case 'FIN_MAT' || 'PRC_FIN' || 'SAM_FIN':
                return 'SUBCAT_FINISHED';
            case 'CONSUM_MAT' || 'PRC_CUNS':
                return 'SUBCAT_CONSMAT';
            case 'INTER_MAT' || 'PRC_INTER' || 'SAM_INTER':
                return 'SUBCAT_INTER';
            case 'BLK_MAT' || 'SAM_BULK':
                return 'SUBCAT_BULK';
            case 'PAK_MAT' || 'PRC_PACK' || 'SAM_PACKMAT':
                return 'SUBCAT_PACK';
            case 'LAB_MAT' || 'PRC_LABC':
                return 'SUBCAT_LABCHEM';
            case 'ENGG_MAT' || 'PRC_ENG':
                return 'SUBCAT_ENGGMAT';
            case 'WATER_MAT' || 'PRC_ASST':
                return 'SUBCAT_WATERMAT';
            case 'ASSETS_MAT':
                return 'SUBCAT_ASSETS';
            case 'BYPROD_MAT':
                return 'SUBCAT_BYPROD_MAT';
            case 'COPROD_MAT':
                return 'SUBCAT_COPROD_MAT';
            case 'MTHLQR_MAT':
                return 'SUBCAT_MTHLQR_MAT';
            case 'IMPSTD_MAT':
                return 'SUBCAT_IMPSTD_MAT';
            case 'FIN_DOSMAT':
                return;
            default:
                return code;
        }
    }
}

export class CategoryCodeList {
    public static GetSamplePlanAssignUnAssign() {
        return [{ code: 'SAMPLE_PLAN_ACTIVITI' }]
    }
    public static GetMobilePhaseCategories() {
        return [{ code: 'PREPARATION_TYPE' }, { code: 'MPHASE_PREP_TYPES' }];
    }
    public static GetManageRinsingSolutionCategories() {
        return [{ code: 'USAGE_TYPE' }]
    }
    public static GetManageIndicatorCategories() {
        return [{ code: 'INDICATOR_TYPE' }]
    }
    public static GetManageStockSolutionsCategories() {
        return [{ code: "QCINST_TYPE" }]
    }
    public static GetManageSpecValidationsCategories() {
        return [{ code: "ANALYSIS_MODES" }]
    }
    public static GetManageDataReviewCategories() {
        return [{ code: "ARDS_SOURCES" }, { code: "CHK_CTRL_TYPE" }]
    }
    public static GetManageLabInventoryCategories() {
        return [{ code: "GRADE" }, { code: "NATURE_OF_CHEMICAL" }];
    }
    public static GetManageSampleDestructionCategories() {
        return [{ code: "SAM_DEST_SOURCE" }, { code: "SAM_DEST_TYPE" }, { code: "SAM_DEST_NATURE" }, { code: "SAM_DEST_MODE" }]
    }
    public static GetManageCalibrationParameterSetsCategories() {
        return [{ code: "QCINST_TYPE" }]
    }
    public static GetMaterialCategories() {
        return ['FIN_MAT', 'RAW_MAT', 'INTER_MAT'];
    }
    public static GetMngAnalystQualificationCategories() {
        return [{ code: 'CONCLUSION' }, { code: 'ANA_TYPE' }, { code: 'RE_QUALIF_PURPOSE' }, { code: 'QUAL_REQUEST_TYPE' }];
    }
    public static GetSearchAnalystQualificationCategories() {
        return [{ code: 'CONCLUSION' }, { code: 'QUAL_TYPE' }];
    }
    public static GetInvalidationReqTabCategories() {
        return [{ code: 'INVALID_IMPACT_TYPE' }, { code: 'INVALID_INSTRU_TYPE' }, { code: "QCINST_TYPE" }];
    }
    public static GetCloseShiftCategories() {
        return [{ code: 'SHIFT_TASK_STATUS' }];
    }
    public static GetSearchQCInventoryCategories() {
        return [{ code: "NATURE_OF_CHEMICAL" }, { code: "GRADE" }]
    }
    public static GetSearchSampleDestructionCategories() {
        return [{ code: "SAM_DEST_SOURCE" }, { code: "SAM_DEST_TYPE" }, { code: "SAM_DEST_NATURE" }, { code: "SAM_DEST_MODE" }]
    }
}


export class SamplePlanLocalKeys {
    public static Anal_PlanningKey = "Call_Planning";
    public static Samples_SpecKey = "Call_Spec";
    public static Samples_SampleTestKey = "Call_SampleTest";
}

export enum PageTypeSection {
    ANALYSIS = 'ANALYSIS',
    ARDS = 'ARDS',
    MAPPING_ARDS = 'MAPPING_ARDS',
    CLIBRATION_ARDS = "CLIBRATION_ARDS"
}

export type ErrorCodes = "USR_UN_AUTH" | "TOKEN_INVALID" | "LOG_OUT";

export class CustString {

    public static Empty = "";

    public static isEmptyString(val: any): boolean {
        return val == "" || val == null || val == undefined;
    }
}

export class SectionCodes {
    public static MP_REQ = "MP_REQ";
    public static IND_REQ = "IND_REQ";
    public static VOL_REQ = "VOL_REQ";
    public static VOL_STAND_REQ = "VOL_STAND_REQ";
    public static STOCK_SOL = "STOCK_SOL";
    public static RINSING_SOL = "RINSING_SOL";
    public static TSTDOCS = "TSTDOCS";
    public static QCSAMPASYS = "QCSAMPASYS";
    public static CONT_WISE_ANA = "CONT_WISE_ANA";
    public static SA = "SA";
    public static SPEC_VALID = "SPEC_VALID";
    public static CALIB_VALIDATION = "CALIB_VALIDATION";
    public static ENGGMNT = "ENGGMNT";

}
