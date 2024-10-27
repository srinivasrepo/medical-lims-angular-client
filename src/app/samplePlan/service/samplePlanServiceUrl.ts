export class SamplePlanUrls {
    public static createSampleplan = "CreatePlan?shiftID={0}";
    public static getPlantDetailsByID = "GetPlantDetailsByID?encSamplePlanID={0}";
    public static getAnalysts = "GetAnalystDetails?encPlanID={0}";
    public static saveAnalysts = "SaveAnalyst";
    public static getAnalystsOccupancyDetails = "GetAnalystOccupancyDetails?encUserRoleID={0}";
    public static getSamples = "GetSampleDetails?encPlanID={0}";
    public static manageSamples = "SavePlanSamples";
    public static getSamplesmultiSpec = "GetSampleSpecificationsDet?encPlanID={0}";
    public static manageSamplesSpec = "ManageSampleSpecification";
    public static getSampleDetailsByID = "GetSampleDetailsByID?encSampleID"
    public static getTestActivitySamples = "GetTestsAndActivitySamples?encPlanID={0}";
    public static manageTestActivitySamples = "ManageTestActivities";
    public static getPlanningDetails = "GetPlanningDetails?encPlanID={0}";
    public static autoPlan = "AutoPlan?encPlanID={0}&type={1}";
    public static planDetails = "PlanDetails?encPlanID={0}";
    public static deleteTestSample = "DeleteTestSample";

    public static planActivitiesDetails = "PlanActivities";
    public static unAssignUserTests = "UnAssignUserTests";
    public static assignActivityToUser = "AssignActivityToUser";

    public static getShiftCloseActivities = "GetShiftCloseActivities?encShiftID={0}";
    public static manageShiftCloseActivities = "ManageShiftCloseActivities";
    public static viewSamplePlanDetailsByID = "ViewSamplePlanDetailsByID?encPlanID={0}";
    public static searchSamplePlan = "SearchSamplePlan";
    public static changeUserPlanTest = "ChangeUserPlanTest";

    public static testOccupancy = "ManageTestOccupancy";
    public static searchCloseShift = "SearchCloseShiftActivities";
    public static viewShiftClosed = "GetCloseShiftActivitiesByID?encShiftID={0}";
    public static manageUserTestActivityStatus = "ManageUserTestActivityStatus";
}