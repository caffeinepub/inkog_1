import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ReportId = bigint;
export type StaffId = bigint;
export type Time = bigint;
export type SchoolId = bigint;
export interface School {
    id: SchoolId;
    name: string;
    address: string;
}
export interface StaffAccount {
    id: StaffId;
    principal: Principal;
    name: string;
    email: string;
    enabled: boolean;
    schoolId: SchoolId;
}
export interface Report {
    id: ReportId;
    status: ReportStatus;
    text: string;
    schoolId: SchoolId;
    timestamp: Time;
    category: ReportCategory;
}
export interface UserProfile {
    name: string;
    role: string;
    schoolId?: SchoolId;
}
export enum ReportCategory {
    other = "other",
    suggestion = "suggestion",
    mentalHealth = "mentalHealth",
    bullying = "bullying",
    harassment = "harassment"
}
export enum ReportStatus {
    resolved = "resolved",
    submitted = "submitted",
    reviewed = "reviewed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSchool(name: string, address: string): Promise<SchoolId>;
    createStaffAccount(principal: Principal, schoolId: SchoolId, name: string, email: string): Promise<StaffId>;
    deleteSchool(schoolId: SchoolId): Promise<void>;
    deleteStaffAccount(staffId: StaffId): Promise<void>;
    getAdminDiagnostics(): Promise<{
        userRole: string;
        totalAdmins: bigint;
        hasAdminPermission: boolean;
        totalUsers: bigint;
        callerPrincipal: string;
        isAdmin: boolean;
        hasUserPermission: boolean;
    }>;
    getAllSchools(): Promise<Array<School>>;
    getAllSchoolsStats(): Promise<Array<{
        totalReports: bigint;
        schoolId: SchoolId;
        schoolName: string;
    }>>;
    getAllStaff(): Promise<Array<StaffAccount>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyStaffAccount(): Promise<StaffAccount | null>;
    getReportsBySchool(schoolId: SchoolId): Promise<Array<Report>>;
    getReportsBySchoolAndCategory(schoolId: SchoolId, category: ReportCategory): Promise<Array<Report>>;
    getReportsBySchoolAndDateRange(schoolId: SchoolId, startTime: Time, endTime: Time): Promise<Array<Report>>;
    getSchool(id: SchoolId): Promise<School | null>;
    getSchoolStats(schoolId: SchoolId): Promise<{
        resolved: bigint;
        submitted: bigint;
        totalReports: bigint;
        reviewed: bigint;
    }>;
    getStaffBySchool(schoolId: SchoolId): Promise<Array<StaffAccount>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitAnonymousReport(schoolId: SchoolId, category: ReportCategory, text: string): Promise<void>;
    updateReportStatus(reportId: ReportId, status: ReportStatus): Promise<void>;
    updateSchool(schoolId: SchoolId, name: string, address: string): Promise<void>;
    updateStaffAccount(staffId: StaffId, name: string, email: string, enabled: boolean): Promise<void>;
}
