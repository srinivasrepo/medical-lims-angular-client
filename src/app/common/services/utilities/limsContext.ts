export class LIMSContext {
    limsToken: string = "";
    userDetails: UserDetails = new UserDetails();
    capabilities: any;
}

export class UserDetails {
    userName: string;
    lastLogin: string;
    roleName: string;
    shortName: string;
    plantName: string;
    deptName: string;
    roleType:string;
}
