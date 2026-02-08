import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type ReportId = Nat;
  type SchoolId = Nat;
  type StaffId = Nat;

  type ReportCategory = {
    #bullying;
    #harassment;
    #mentalHealth;
    #suggestion;
    #other;
  };

  type ReportStatus = {
    #submitted;
    #reviewed;
    #resolved;
  };

  type School = {
    id : SchoolId;
    name : Text;
    address : Text;
  };

  type StaffAccount = {
    id : StaffId;
    principal : Principal;
    schoolId : SchoolId;
    name : Text;
    email : Text;
    enabled : Bool;
  };

  type Report = {
    id : ReportId;
    schoolId : SchoolId;
    category : ReportCategory;
    text : Text;
    timestamp : Time.Time;
    status : ReportStatus;
  };

  public type UserProfile = {
    name : Text;
    role : Text;
    schoolId : ?SchoolId;
  };

  module Report {
    public func compare(report1 : Report, report2 : Report) : Order.Order {
      compareByDate(report1, report2);
    };

    public func compareByDate(report1 : Report, report2 : Report) : Order.Order {
      if (report1.timestamp < report2.timestamp) { #less } else {
        if (report1.timestamp > report2.timestamp) { #greater } else { #equal };
      };
    };
  };

  var stableSchools : [(SchoolId, School)] = [];
  var stableStaffAccounts : [(StaffId, StaffAccount)] = [];
  var stablePrincipalToStaffId : [(Principal, StaffId)] = [];
  var stableReports : [(ReportId, Report)] = [];
  var stableUserProfiles : [(Principal, UserProfile)] = [];
  var stableUserRoles : [(Principal, AccessControl.UserRole)] = [];
  var stableNextSchoolId : Nat = 1;
  var stableNextStaffId : Nat = 1;
  var stableNextReportId : Nat = 1;

  let schools = Map.empty<SchoolId, School>();
  let staffAccounts = Map.empty<StaffId, StaffAccount>();
  let principalToStaffId = Map.empty<Principal, StaffId>();
  let reports = Map.empty<ReportId, Report>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextSchoolId = stableNextSchoolId;
  var nextStaffId = stableNextStaffId;
  var nextReportId = stableNextReportId;

  let accessControlState = AccessControl.initState();

  // Restore state from stable storage
  for ((k, v) in stableSchools.vals()) {
    schools.add(k, v);
  };
  for ((k, v) in stableStaffAccounts.vals()) {
    staffAccounts.add(k, v);
  };
  for ((k, v) in stablePrincipalToStaffId.vals()) {
    principalToStaffId.add(k, v);
  };
  for ((k, v) in stableReports.vals()) {
    reports.add(k, v);
  };
  for ((k, v) in stableUserProfiles.vals()) {
    userProfiles.add(k, v);
  };
  for ((k, v) in stableUserRoles.vals()) {
    accessControlState.userRoles.add(k, v);
  };

  include MixinAuthorization(accessControlState);

  // Pre-upgrade hook to save state
  system func preupgrade() {
    stableSchools := schools.entries().toArray();
    stableStaffAccounts := staffAccounts.entries().toArray();
    stablePrincipalToStaffId := principalToStaffId.entries().toArray();
    stableReports := reports.entries().toArray();
    stableUserProfiles := userProfiles.entries().toArray();
    stableUserRoles := accessControlState.userRoles.entries().toArray();
    stableNextSchoolId := nextSchoolId;
    stableNextStaffId := nextStaffId;
    stableNextReportId := nextReportId;
  };

  // Post-upgrade hook
  system func postupgrade() {
    stableSchools := [];
    stableStaffAccounts := [];
    stablePrincipalToStaffId := [];
    stableReports := [];
    stableUserProfiles := [];
    stableUserRoles := [];
  };

  // Admin diagnostics endpoint for debugging access control
  public query ({ caller }) func getAdminDiagnostics() : async {
    callerPrincipal : Text;
    isAdmin : Bool;
    userRole : Text;
    hasUserPermission : Bool;
    hasAdminPermission : Bool;
    totalAdmins : Nat;
    totalUsers : Nat;
  } {
    let role = AccessControl.getUserRole(accessControlState, caller);
    let roleText = switch (role) {
      case (#admin) { "admin" };
      case (#user) { "user" };
      case (#guest) { "guest" };
    };

    var adminCount = 0;
    var userCount = 0;
    for ((principal, userRole) in accessControlState.userRoles.entries()) {
      switch (userRole) {
        case (#admin) { adminCount += 1 };
        case (#user) { userCount += 1 };
        case (#guest) { };
      };
    };

    return {
      callerPrincipal = caller.toText();
      isAdmin = AccessControl.isAdmin(accessControlState, caller);
      userRole = roleText;
      hasUserPermission = AccessControl.hasPermission(accessControlState, caller, #user);
      hasAdminPermission = AccessControl.hasPermission(accessControlState, caller, #admin);
      totalAdmins = adminCount;
      totalUsers = userCount;
    };
  };

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // School Management (Admin only)
  public shared ({ caller }) func createSchool(name : Text, address : Text) : async SchoolId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create schools");
    };
    let schoolId = nextSchoolId;
    let school : School = { id = schoolId; name; address };
    schools.add(schoolId, school);
    nextSchoolId += 1;
    schoolId;
  };

  public shared ({ caller }) func updateSchool(schoolId : SchoolId, name : Text, address : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update schools");
    };
    switch (schools.get(schoolId)) {
      case (null) { Runtime.trap("School does not exist") };
      case (?_) {
        let school : School = { id = schoolId; name; address };
        schools.add(schoolId, school);
      };
    };
  };

  public shared ({ caller }) func deleteSchool(schoolId : SchoolId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete schools");
    };
    schools.remove(schoolId);
  };

  // Staff Account Management (Admin only)
  public shared ({ caller }) func createStaffAccount(
    principal : Principal,
    schoolId : SchoolId,
    name : Text,
    email : Text
  ) : async StaffId {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create staff accounts");
    };
    switch (schools.get(schoolId)) {
      case (null) { Runtime.trap("School does not exist") };
      case (?_) {
        // Check if principal already has a staff account
        switch (principalToStaffId.get(principal)) {
          case (?_) { Runtime.trap("Principal already has a staff account") };
          case (null) {
            let staffId = nextStaffId;
            let account : StaffAccount = {
              id = staffId;
              principal;
              schoolId;
              name;
              email;
              enabled = true;
            };
            staffAccounts.add(staffId, account);
            principalToStaffId.add(principal, staffId);

            // Assign user role to staff member
            AccessControl.assignRole(accessControlState, caller, principal, #user);

            nextStaffId += 1;
            staffId;
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateStaffAccount(
    staffId : StaffId,
    name : Text,
    email : Text,
    enabled : Bool
  ) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update staff accounts");
    };
    switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?account) {
        let updatedAccount : StaffAccount = {
          account with name; email; enabled;
        };
        staffAccounts.add(staffId, updatedAccount);
      };
    };
  };

  public shared ({ caller }) func deleteStaffAccount(staffId : StaffId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete staff accounts");
    };
    switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?account) {
        principalToStaffId.remove(account.principal);
        staffAccounts.remove(staffId);
      };
    };
  };

  // Anonymous Report Submission (No authentication required)
  public shared func submitAnonymousReport(
    schoolId : SchoolId,
    category : ReportCategory,
    text : Text
  ) : async () {
    // No authorization check - anonymous access allowed
    switch (schools.get(schoolId)) {
      case (null) { Runtime.trap("School does not exist") };
      case (?_) {
        let report : Report = {
          id = nextReportId;
          schoolId;
          category;
          text;
          timestamp = Time.now();
          status = #submitted;
        };
        reports.add(nextReportId, report);
        nextReportId += 1;
      };
    };
  };

  // Staff Report Management (Staff only, school-scoped)
  public shared ({ caller }) func updateReportStatus(reportId : ReportId, status : ReportStatus) : async () {
    // Verify caller is authenticated staff
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can update report status");
    };

    let staffId = switch (principalToStaffId.get(caller)) {
      case (null) { Runtime.trap("Staff account not found for caller") };
      case (?id) { id };
    };

    let staff = switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?s) {
        if (not s.enabled) {
          Runtime.trap("Staff account is disabled");
        };
        s;
      };
    };

    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        if (report.schoolId != staff.schoolId) {
          Runtime.trap("Unauthorized: Cannot access reports from other schools");
        };
        let updatedReport = {
          report with status
        };
        reports.add(reportId, updatedReport);
      };
    };
  };

  public query ({ caller }) func getReportsBySchool(schoolId : SchoolId) : async [Report] {
    // Verify caller is authenticated staff
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view reports");
    };

    let staffId = switch (principalToStaffId.get(caller)) {
      case (null) { Runtime.trap("Staff account not found for caller") };
      case (?id) { id };
    };

    let staff = switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?s) {
        if (not s.enabled) {
          Runtime.trap("Staff account is disabled");
        };
        s;
      };
    };

    if (staff.schoolId != schoolId) {
      Runtime.trap("Unauthorized: Cannot access reports from other schools");
    };

    reports.values()
      .filter(func(report : Report) : Bool { report.schoolId == schoolId })
      .toArray();
  };

  public query ({ caller }) func getReportsBySchoolAndCategory(
    schoolId : SchoolId,
    category : ReportCategory
  ) : async [Report] {
    // Verify caller is authenticated staff
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view reports");
    };

    let staffId = switch (principalToStaffId.get(caller)) {
      case (null) { Runtime.trap("Staff account not found for caller") };
      case (?id) { id };
    };

    let staff = switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?s) {
        if (not s.enabled) {
          Runtime.trap("Staff account is disabled");
        };
        s;
      };
    };

    if (staff.schoolId != schoolId) {
      Runtime.trap("Unauthorized: Cannot access reports from other schools");
    };

    reports.values()
      .filter(func(report : Report) : Bool {
        report.schoolId == schoolId and report.category == category
      })
      .toArray();
  };

  public query ({ caller }) func getReportsBySchoolAndDateRange(
    schoolId : SchoolId,
    startTime : Time.Time,
    endTime : Time.Time
  ) : async [Report] {
    // Verify caller is authenticated staff
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only staff can view reports");
    };

    let staffId = switch (principalToStaffId.get(caller)) {
      case (null) { Runtime.trap("Staff account not found for caller") };
      case (?id) { id };
    };

    let staff = switch (staffAccounts.get(staffId)) {
      case (null) { Runtime.trap("Staff account not found") };
      case (?s) {
        if (not s.enabled) {
          Runtime.trap("Staff account is disabled");
        };
        s;
      };
    };

    if (staff.schoolId != schoolId) {
      Runtime.trap("Unauthorized: Cannot access reports from other schools");
    };

    reports.values()
      .filter(func(report : Report) : Bool {
        report.schoolId == schoolId and
        report.timestamp >= startTime and
        report.timestamp <= endTime
      })
      .toArray();
  };

  // Admin Statistics (Admin only)
  public query ({ caller }) func getSchoolStats(schoolId : SchoolId) : async {
    totalReports : Nat;
    submitted : Nat;
    reviewed : Nat;
    resolved : Nat;
  } {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get school reports stats");
    };

    var totalReports = 0;
    var submitted = 0;
    var reviewed = 0;
    var resolved = 0;

    for (report in reports.values()) {
      if (report.schoolId == schoolId) {
        totalReports += 1;
        switch (report.status) {
          case (#submitted) { submitted += 1 };
          case (#reviewed) { reviewed += 1 };
          case (#resolved) { resolved += 1 };
        };
      };
    };

    return {
      totalReports;
      submitted;
      reviewed;
      resolved;
    };
  };

  public query ({ caller }) func getAllSchoolsStats() : async [{
    schoolId : SchoolId;
    schoolName : Text;
    totalReports : Nat;
  }] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get all schools stats");
    };

    let schoolStats = Map.empty<SchoolId, Nat>();

    for (report in reports.values()) {
      let count = switch (schoolStats.get(report.schoolId)) {
        case (null) { 0 };
        case (?c) { c };
      };
      schoolStats.add(report.schoolId, count + 1);
    };

    schools.values()
      .map(func(school : School) : {
        schoolId : SchoolId;
        schoolName : Text;
        totalReports : Nat;
      } {
        {
          schoolId = school.id;
          schoolName = school.name;
          totalReports = switch (schoolStats.get(school.id)) {
            case (null) { 0 };
            case (?count) { count };
          };
        }
      })
      .toArray();
  };

  // Public School Information (No authentication required for students)
  public query func getAllSchools() : async [School] {
    // No authorization check - public access for students to select school
    schools.values().toArray();
  };

  public query func getSchool(id : SchoolId) : async ?School {
    // No authorization check - public access for students
    schools.get(id);
  };

  // Staff Information (Admin only)
  public query ({ caller }) func getAllStaff() : async [StaffAccount] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all staff");
    };
    staffAccounts.values().toArray();
  };

  public query ({ caller }) func getStaffBySchool(schoolId : SchoolId) : async [StaffAccount] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view staff");
    };
    staffAccounts.values()
      .filter(func(staff : StaffAccount) : Bool { staff.schoolId == schoolId })
      .toArray();
  };

  // Staff self-information
  public query ({ caller }) func getMyStaffAccount() : async ?StaffAccount {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their staff account");
    };

    switch (principalToStaffId.get(caller)) {
      case (null) { null };
      case (?staffId) { staffAccounts.get(staffId) };
    };
  };
};
