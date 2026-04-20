const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3001;

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const USERS = [
  { id: 1, username: 'john.doe', email: 'john.doe@company.com', createdAt: '2024-01-15T08:00:00Z', firstName: 'John', lastName: 'Doe', displayName: 'John Doe', avatarUrl: 'https://i.pravatar.cc/40?img=1', phoneNumber: '+1-555-0101', department: 'Engineering', jobTitle: 'Senior QA Engineer', lastLoginAt: '2026-04-18T09:30:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: true, passwordChangedAt: '2026-01-01T00:00:00Z', groups: [{ id: 1, name: 'QA Team', description: 'Quality Assurance', isActive: true, isSystemGroup: false }] },
  { id: 2, username: 'jane.smith', email: 'jane.smith@company.com', createdAt: '2024-02-10T08:00:00Z', firstName: 'Jane', lastName: 'Smith', displayName: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/40?img=2', phoneNumber: '+1-555-0102', department: 'DevOps', jobTitle: 'DevOps Lead', lastLoginAt: '2026-04-17T14:22:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2026-02-01T00:00:00Z', groups: [{ id: 2, name: 'DevOps', description: 'DevOps Team', isActive: true, isSystemGroup: false }] },
  { id: 3, username: 'bob.wilson', email: 'bob.wilson@company.com', createdAt: '2024-03-05T08:00:00Z', firstName: 'Bob', lastName: 'Wilson', displayName: 'Bob Wilson', avatarUrl: 'https://i.pravatar.cc/40?img=3', phoneNumber: '+1-555-0103', department: 'Engineering', jobTitle: 'Frontend Developer', lastLoginAt: '2026-04-16T11:15:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2026-01-15T00:00:00Z', groups: [{ id: 3, name: 'Frontend', description: 'Frontend Dev Team', isActive: true, isSystemGroup: false }] },
  { id: 4, username: 'alice.johnson', email: 'alice.johnson@company.com', createdAt: '2024-04-01T08:00:00Z', firstName: 'Alice', lastName: 'Johnson', displayName: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/40?img=5', phoneNumber: '+1-555-0104', department: 'Management', jobTitle: 'Engineering Manager', lastLoginAt: '2026-04-18T08:00:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: true, passwordChangedAt: '2026-03-01T00:00:00Z', groups: [{ id: 4, name: 'Admins', description: 'Admin Group', isActive: true, isSystemGroup: true }] },
  { id: 5, username: 'charlie.brown', email: 'charlie.brown@company.com', createdAt: '2024-05-20T08:00:00Z', firstName: 'Charlie', lastName: 'Brown', displayName: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/40?img=6', phoneNumber: '+1-555-0105', department: 'QA', jobTitle: 'QA Analyst', lastLoginAt: '2026-04-10T09:00:00Z', isActive: false, isLocked: true, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2025-12-01T00:00:00Z', groups: [{ id: 1, name: 'QA Team', description: 'Quality Assurance', isActive: true, isSystemGroup: false }] },
  { id: 6, username: 'diana.prince', email: 'diana.prince@company.com', createdAt: '2024-06-11T08:00:00Z', firstName: 'Diana', lastName: 'Prince', displayName: 'Diana Prince', avatarUrl: 'https://i.pravatar.cc/40?img=9', phoneNumber: '+1-555-0106', department: 'Backend', jobTitle: 'Backend Engineer', lastLoginAt: '2026-04-18T10:45:00Z', isActive: true, isLocked: false, emailVerified: false, twoFactorEnabled: true, passwordChangedAt: '2026-04-01T00:00:00Z', groups: [{ id: 5, name: 'Backend', description: 'Backend Dev Team', isActive: true, isSystemGroup: false }] },
  { id: 7, username: 'ethan.hunt', email: 'ethan.hunt@company.com', createdAt: '2024-07-14T08:00:00Z', firstName: 'Ethan', lastName: 'Hunt', displayName: 'Ethan Hunt', avatarUrl: 'https://i.pravatar.cc/40?img=11', phoneNumber: '+1-555-0107', department: 'Security', jobTitle: 'Security Engineer', lastLoginAt: '2026-04-15T16:30:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: true, passwordChangedAt: '2026-02-15T00:00:00Z', groups: [{ id: 4, name: 'Admins', description: 'Admin Group', isActive: true, isSystemGroup: true }] },
  { id: 8, username: 'fiona.green', email: 'fiona.green@company.com', createdAt: '2024-08-22T08:00:00Z', firstName: 'Fiona', lastName: 'Green', displayName: 'Fiona Green', avatarUrl: 'https://i.pravatar.cc/40?img=12', phoneNumber: '+1-555-0108', department: 'QA', jobTitle: 'Automation Engineer', lastLoginAt: '2026-04-17T13:10:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2026-01-20T00:00:00Z', groups: [{ id: 1, name: 'QA Team', description: 'Quality Assurance', isActive: true, isSystemGroup: false }] },
  { id: 9, username: 'george.miller', email: 'george.miller@company.com', createdAt: '2024-09-30T08:00:00Z', firstName: 'George', lastName: 'Miller', displayName: 'George Miller', avatarUrl: 'https://i.pravatar.cc/40?img=13', phoneNumber: '+1-555-0109', department: 'DevOps', jobTitle: 'SRE', lastLoginAt: '2026-04-16T08:45:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: true, passwordChangedAt: '2026-03-10T00:00:00Z', groups: [{ id: 2, name: 'DevOps', description: 'DevOps Team', isActive: true, isSystemGroup: false }] },
  { id: 10, username: 'hannah.lee', email: 'hannah.lee@company.com', createdAt: '2024-10-18T08:00:00Z', firstName: 'Hannah', lastName: 'Lee', displayName: 'Hannah Lee', avatarUrl: 'https://i.pravatar.cc/40?img=14', phoneNumber: '+1-555-0110', department: 'Frontend', jobTitle: 'UI Developer', lastLoginAt: '2026-04-18T07:55:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2026-04-05T00:00:00Z', groups: [{ id: 3, name: 'Frontend', description: 'Frontend Dev Team', isActive: true, isSystemGroup: false }] },
  { id: 11, username: 'ivan.petrov', email: 'ivan.petrov@company.com', createdAt: '2024-11-05T08:00:00Z', firstName: 'Ivan', lastName: 'Petrov', displayName: 'Ivan Petrov', avatarUrl: 'https://i.pravatar.cc/40?img=15', phoneNumber: '+1-555-0111', department: 'Backend', jobTitle: 'API Developer', lastLoginAt: '2026-04-13T12:00:00Z', isActive: false, isLocked: false, emailVerified: true, twoFactorEnabled: false, passwordChangedAt: '2025-11-01T00:00:00Z', groups: [{ id: 5, name: 'Backend', description: 'Backend Dev Team', isActive: true, isSystemGroup: false }] },
  { id: 12, username: 'julia.roberts', email: 'julia.roberts@company.com', createdAt: '2024-12-01T08:00:00Z', firstName: 'Julia', lastName: 'Roberts', displayName: 'Julia Roberts', avatarUrl: 'https://i.pravatar.cc/40?img=16', phoneNumber: '+1-555-0112', department: 'Management', jobTitle: 'Product Manager', lastLoginAt: '2026-04-18T11:20:00Z', isActive: true, isLocked: false, emailVerified: true, twoFactorEnabled: true, passwordChangedAt: '2026-04-10T00:00:00Z', groups: [{ id: 4, name: 'Admins', description: 'Admin Group', isActive: true, isSystemGroup: true }] },
];

const GROUPS = [
  { id: 1, name: 'QA Team', description: 'Quality Assurance engineers responsible for testing', isActive: true, isSystemGroup: false, createdAt: '2024-01-01T00:00:00Z', parentGroupId: null, parentGroupName: null, users: USERS.filter(u => u.groups.some(g => g.id === 1)).map(u => ({ id: u.id, username: u.username, email: u.email, displayName: u.displayName, isActive: u.isActive })), permissions: [{ id: 1, name: 'View Tests', code: 'VIEW_TESTS', category: 'Testing', isActive: true }, { id: 2, name: 'Run Tests', code: 'RUN_TESTS', category: 'Testing', isActive: true }], childGroups: [] },
  { id: 2, name: 'DevOps', description: 'DevOps and infrastructure team', isActive: true, isSystemGroup: false, createdAt: '2024-01-01T00:00:00Z', parentGroupId: null, parentGroupName: null, users: USERS.filter(u => u.groups.some(g => g.id === 2)).map(u => ({ id: u.id, username: u.username, email: u.email, displayName: u.displayName, isActive: u.isActive })), permissions: [{ id: 3, name: 'Manage Pipelines', code: 'MANAGE_PIPELINES', category: 'CI/CD', isActive: true }, { id: 4, name: 'View Analytics', code: 'VIEW_ANALYTICS', category: 'Dashboard', isActive: true }], childGroups: [] },
  { id: 3, name: 'Frontend', description: 'Frontend development team', isActive: true, isSystemGroup: false, createdAt: '2024-01-01T00:00:00Z', parentGroupId: null, parentGroupName: null, users: USERS.filter(u => u.groups.some(g => g.id === 3)).map(u => ({ id: u.id, username: u.username, email: u.email, displayName: u.displayName, isActive: u.isActive })), permissions: [{ id: 1, name: 'View Tests', code: 'VIEW_TESTS', category: 'Testing', isActive: true }], childGroups: [] },
  { id: 4, name: 'Admins', description: 'System administrators with full access', isActive: true, isSystemGroup: true, createdAt: '2024-01-01T00:00:00Z', parentGroupId: null, parentGroupName: null, users: USERS.filter(u => u.groups.some(g => g.id === 4)).map(u => ({ id: u.id, username: u.username, email: u.email, displayName: u.displayName, isActive: u.isActive })), permissions: [{ id: 1, name: 'View Tests', code: 'VIEW_TESTS', category: 'Testing', isActive: true }, { id: 2, name: 'Run Tests', code: 'RUN_TESTS', category: 'Testing', isActive: true }, { id: 3, name: 'Manage Pipelines', code: 'MANAGE_PIPELINES', category: 'CI/CD', isActive: true }, { id: 4, name: 'View Analytics', code: 'VIEW_ANALYTICS', category: 'Dashboard', isActive: true }, { id: 5, name: 'Manage Users', code: 'MANAGE_USERS', category: 'Admin', isActive: true }, { id: 6, name: 'Manage Groups', code: 'MANAGE_GROUPS', category: 'Admin', isActive: true }], childGroups: [{ id: 1, name: 'QA Team', description: 'QA engineers', isActive: true, isSystemGroup: false }, { id: 2, name: 'DevOps', description: 'DevOps team', isActive: true, isSystemGroup: false }] },
  { id: 5, name: 'Backend', description: 'Backend engineering team', isActive: true, isSystemGroup: false, createdAt: '2024-01-01T00:00:00Z', parentGroupId: null, parentGroupName: null, users: USERS.filter(u => u.groups.some(g => g.id === 5)).map(u => ({ id: u.id, username: u.username, email: u.email, displayName: u.displayName, isActive: u.isActive })), permissions: [{ id: 1, name: 'View Tests', code: 'VIEW_TESTS', category: 'Testing', isActive: true }, { id: 3, name: 'Manage Pipelines', code: 'MANAGE_PIPELINES', category: 'CI/CD', isActive: true }], childGroups: [] },
];

const PERMISSIONS = [
  { id: 1, name: 'View Tests', code: 'VIEW_TESTS', description: 'Allows viewing test results and reports', category: 'Testing', isSystemPermission: false, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 2, name: 'Run Tests', code: 'RUN_TESTS', description: 'Allows triggering and running test suites', category: 'Testing', isSystemPermission: false, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [{ id: 1, name: 'View Tests', code: 'VIEW_TESTS', category: 'Testing', isActive: true }] },
  { id: 3, name: 'Manage Pipelines', code: 'MANAGE_PIPELINES', description: 'Full control over CI/CD pipelines', category: 'CI/CD', isSystemPermission: false, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 4, name: 'View Analytics', code: 'VIEW_ANALYTICS', description: 'Access to dashboard analytics and reports', category: 'Dashboard', isSystemPermission: false, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 5, name: 'Manage Users', code: 'MANAGE_USERS', description: 'Create, update and delete users', category: 'Admin', isSystemPermission: true, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 6, name: 'Manage Groups', code: 'MANAGE_GROUPS', description: 'Create, update and delete groups', category: 'Admin', isSystemPermission: true, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 7, name: 'View Audit Logs', code: 'VIEW_AUDIT_LOGS', description: 'Access to audit trail data', category: 'Admin', isSystemPermission: true, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
  { id: 8, name: 'Export Data', code: 'EXPORT_DATA', description: 'Export reports and data to file', category: 'Dashboard', isSystemPermission: false, isActive: true, createdAt: '2024-01-01T00:00:00Z', parentPermissionId: null, parentPermissionName: null, childPermissions: [] },
];

const AUDIT_LOGS = [
  { id: 1, tableName: 'Users', operation: 'INSERT', primaryKeyValue: '12', timestamp: '2026-04-18T11:20:00Z', ipAddress: '192.168.1.42', userAgent: 'Mozilla/5.0 Chrome/123', username: 'alice.johnson', oldValues: null, newValues: '{"username":"julia.roberts","email":"julia.roberts@company.com","isActive":true}' },
  { id: 2, tableName: 'Users', operation: 'UPDATE', primaryKeyValue: '5', timestamp: '2026-04-17T15:10:00Z', ipAddress: '192.168.1.15', userAgent: 'Mozilla/5.0 Firefox/122', username: 'alice.johnson', oldValues: '{"isActive":true,"isLocked":false}', newValues: '{"isActive":false,"isLocked":true}' },
  { id: 3, tableName: 'Groups', operation: 'UPDATE', primaryKeyValue: '2', timestamp: '2026-04-17T12:05:00Z', ipAddress: '192.168.1.42', userAgent: 'Mozilla/5.0 Chrome/123', username: 'ethan.hunt', oldValues: '{"description":"Infra Team"}', newValues: '{"description":"DevOps and infrastructure team"}' },
  { id: 4, tableName: 'Permissions', operation: 'INSERT', primaryKeyValue: '8', timestamp: '2026-04-16T09:30:00Z', ipAddress: '10.0.0.5', userAgent: 'PostmanRuntime/7.32', username: 'alice.johnson', oldValues: null, newValues: '{"name":"Export Data","code":"EXPORT_DATA","category":"Dashboard"}' },
  { id: 5, tableName: 'Users', operation: 'DELETE', primaryKeyValue: '3', timestamp: '2026-04-15T16:45:00Z', ipAddress: '192.168.1.10', userAgent: 'Mozilla/5.0 Safari/17', username: 'julia.roberts', oldValues: '{"username":"temp.user","email":"temp@company.com"}', newValues: null },
  { id: 6, tableName: 'Groups', operation: 'INSERT', primaryKeyValue: '5', timestamp: '2026-04-14T10:00:00Z', ipAddress: '192.168.1.42', userAgent: 'Mozilla/5.0 Chrome/123', username: 'alice.johnson', oldValues: null, newValues: '{"name":"Backend","description":"Backend engineering team"}' },
  { id: 7, tableName: 'Preferences', operation: 'UPDATE', primaryKeyValue: 'theme', timestamp: '2026-04-13T14:22:00Z', ipAddress: '192.168.1.33', userAgent: 'Mozilla/5.0 Chrome/123', username: 'john.doe', oldValues: '{"value":"light"}', newValues: '{"value":"dark"}' },
  { id: 8, tableName: 'Users', operation: 'UPDATE', primaryKeyValue: '6', timestamp: '2026-04-12T11:11:00Z', ipAddress: '192.168.1.50', userAgent: 'Mozilla/5.0 Edge/123', username: 'alice.johnson', oldValues: '{"emailVerified":false}', newValues: '{"emailVerified":true}' },
  { id: 9, tableName: 'Permissions', operation: 'UPDATE', primaryKeyValue: '3', timestamp: '2026-04-11T09:05:00Z', ipAddress: '10.0.0.5', userAgent: 'PostmanRuntime/7.32', username: 'ethan.hunt', oldValues: '{"isActive":true}', newValues: '{"isActive":false}' },
  { id: 10, tableName: 'Groups', operation: 'DELETE', primaryKeyValue: '6', timestamp: '2026-04-10T17:30:00Z', ipAddress: '192.168.1.42', userAgent: 'Mozilla/5.0 Chrome/123', username: 'alice.johnson', oldValues: '{"name":"Temp Group","description":"Temporary"}', newValues: null },
];

const BUILDS = [
  { id: 'build-001', buildNumber: '1042', branch: 'main', commitSha: 'a1b2c3d', commitMessage: 'feat: add retry mechanism for flaky tests', status: 'passed', triggeredBy: 'john.doe', startedAt: '2026-04-18T08:00:00Z', finishedAt: '2026-04-18T08:45:00Z', duration: 2700, totalTests: 412, passed: 398, failed: 8, skipped: 6 },
  { id: 'build-002', buildNumber: '1041', branch: 'main', commitSha: 'b2c3d4e', commitMessage: 'fix: resolve null pointer in auth service', status: 'failed', triggeredBy: 'jane.smith', startedAt: '2026-04-17T14:00:00Z', finishedAt: '2026-04-17T14:52:00Z', duration: 3120, totalTests: 412, passed: 375, failed: 32, skipped: 5 },
  { id: 'build-003', buildNumber: '1040', branch: 'feature/dashboard-v2', commitSha: 'c3d4e5f', commitMessage: 'feat: new analytics dashboard widgets', status: 'passed', triggeredBy: 'bob.wilson', startedAt: '2026-04-17T10:00:00Z', finishedAt: '2026-04-17T10:38:00Z', duration: 2280, totalTests: 388, passed: 385, failed: 2, skipped: 1 },
  { id: 'build-004', buildNumber: '1039', branch: 'main', commitSha: 'd4e5f6g', commitMessage: 'chore: upgrade jest to v30', status: 'passed', triggeredBy: 'fiona.green', startedAt: '2026-04-16T09:00:00Z', finishedAt: '2026-04-16T09:42:00Z', duration: 2520, totalTests: 400, passed: 397, failed: 0, skipped: 3 },
  { id: 'build-005', buildNumber: '1038', branch: 'hotfix/login-bug', commitSha: 'e5f6g7h', commitMessage: 'hotfix: fix login session expiry issue', status: 'running', triggeredBy: 'diana.prince', startedAt: '2026-04-18T11:00:00Z', finishedAt: null, duration: null, totalTests: null, passed: null, failed: null, skipped: null },
];

const TEST_RESULTS = [
  { id: 1, buildId: 'build-001', testName: 'should authenticate user with valid credentials', className: 'AuthServiceTest', outcome: 'Passed', duration: 120, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:10:00Z' },
  { id: 2, buildId: 'build-001', testName: 'should return 401 for invalid password', className: 'AuthServiceTest', outcome: 'Passed', duration: 95, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:10:30Z' },
  { id: 3, buildId: 'build-001', testName: 'should load dashboard stats within 2 seconds', className: 'DashboardPerformanceTest', outcome: 'Failed', duration: 3200, errorMessage: 'AssertionError: Expected response time < 2000ms but got 3200ms', stackTrace: 'at DashboardPerformanceTest.testLoadTime (DashboardPerformanceTest.java:45)\nat sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)', runAt: '2026-04-18T08:15:00Z' },
  { id: 4, buildId: 'build-001', testName: 'should paginate users correctly', className: 'UserApiTest', outcome: 'Passed', duration: 88, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:20:00Z' },
  { id: 5, buildId: 'build-001', testName: 'should filter users by group', className: 'UserApiTest', outcome: 'Passed', duration: 102, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:20:30Z' },
  { id: 6, buildId: 'build-001', testName: 'should export users to CSV', className: 'UserApiTest', outcome: 'Failed', duration: 450, errorMessage: 'IOException: Unable to write to temp file: permission denied', stackTrace: 'at UserApiTest.testExport (UserApiTest.java:122)\nat java.base/java.nio.file.Files.write(Files.java:3498)', runAt: '2026-04-18T08:21:00Z' },
  { id: 7, buildId: 'build-001', testName: 'should create group with permissions', className: 'GroupApiTest', outcome: 'Passed', duration: 135, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:25:00Z' },
  { id: 8, buildId: 'build-001', testName: 'should delete group and cascade users', className: 'GroupApiTest', outcome: 'Failed', duration: 220, errorMessage: 'ForeignKeyConstraintException: Cannot delete group with active users', stackTrace: 'at GroupApiTest.testDeleteGroup (GroupApiTest.java:88)\nat org.springframework.test.context.junit4.SpringRunner', runAt: '2026-04-18T08:25:45Z' },
  { id: 9, buildId: 'build-001', testName: 'should validate pipeline status changes', className: 'PipelineFlowTest', outcome: 'Passed', duration: 310, errorMessage: null, stackTrace: null, runAt: '2026-04-18T08:30:00Z' },
  { id: 10, buildId: 'build-001', testName: 'should send notification on pipeline failure', className: 'PipelineNotificationTest', outcome: 'Skipped', duration: 0, errorMessage: 'Test skipped: notification service not configured in test env', stackTrace: null, runAt: '2026-04-18T08:35:00Z' },
  { id: 11, buildId: 'build-002', testName: 'should authenticate user with valid credentials', className: 'AuthServiceTest', outcome: 'Failed', duration: 5000, errorMessage: 'TimeoutException: Connection to auth service timed out after 5000ms', stackTrace: 'at AuthServiceTest.testLogin (AuthServiceTest.java:33)', runAt: '2026-04-17T14:05:00Z' },
  { id: 12, buildId: 'build-002', testName: 'should return 401 for invalid password', className: 'AuthServiceTest', outcome: 'Failed', duration: 4800, errorMessage: 'TimeoutException: Connection to auth service timed out after 5000ms', stackTrace: 'at AuthServiceTest.testInvalidPassword (AuthServiceTest.java:55)', runAt: '2026-04-17T14:05:30Z' },
  { id: 13, buildId: 'build-003', testName: 'should render analytics widgets', className: 'DashboardUITest', outcome: 'Passed', duration: 890, errorMessage: null, stackTrace: null, runAt: '2026-04-17T10:10:00Z' },
  { id: 14, buildId: 'build-003', testName: 'should display trend chart correctly', className: 'DashboardUITest', outcome: 'Failed', duration: 1100, errorMessage: 'ElementNotFoundException: Could not find element #trend-chart after 1000ms', stackTrace: 'at DashboardUITest.testTrendChart (DashboardUITest.java:76)', runAt: '2026-04-17T10:11:00Z' },
];

const PIPELINE_DETAILS = [
  { id: 1, buildNumber: '1042', pipelineName: 'main-pipeline', status: 'passed', startedAt: '2026-04-18T08:00:00Z', finishedAt: '2026-04-18T08:45:00Z', stages: [{ name: 'Build', status: 'passed', duration: 480 }, { name: 'Unit Tests', status: 'passed', duration: 900 }, { name: 'Integration Tests', status: 'passed', duration: 720 }, { name: 'Deploy Staging', status: 'passed', duration: 600 }], triggeredBy: 'john.doe', branch: 'main', commitSha: 'a1b2c3d' },
  { id: 2, buildNumber: '1041', pipelineName: 'main-pipeline', status: 'failed', startedAt: '2026-04-17T14:00:00Z', finishedAt: '2026-04-17T14:52:00Z', stages: [{ name: 'Build', status: 'passed', duration: 510 }, { name: 'Unit Tests', status: 'failed', duration: 1500 }, { name: 'Integration Tests', status: 'skipped', duration: 0 }, { name: 'Deploy Staging', status: 'skipped', duration: 0 }], triggeredBy: 'jane.smith', branch: 'main', commitSha: 'b2c3d4e' },
  { id: 3, buildNumber: '1040', pipelineName: 'feature-pipeline', status: 'passed', startedAt: '2026-04-17T10:00:00Z', finishedAt: '2026-04-17T10:38:00Z', stages: [{ name: 'Build', status: 'passed', duration: 450 }, { name: 'Unit Tests', status: 'passed', duration: 870 }, { name: 'Integration Tests', status: 'passed', duration: 660 }], triggeredBy: 'bob.wilson', branch: 'feature/dashboard-v2', commitSha: 'c3d4e5f' },
  { id: 4, buildNumber: '1039', pipelineName: 'main-pipeline', status: 'passed', startedAt: '2026-04-16T09:00:00Z', finishedAt: '2026-04-16T09:42:00Z', stages: [{ name: 'Build', status: 'passed', duration: 520 }, { name: 'Unit Tests', status: 'passed', duration: 880 }, { name: 'Integration Tests', status: 'passed', duration: 700 }, { name: 'Deploy Staging', status: 'passed', duration: 420 }], triggeredBy: 'fiona.green', branch: 'main', commitSha: 'd4e5f6g' },
  { id: 5, buildNumber: '1038', pipelineName: 'hotfix-pipeline', status: 'running', startedAt: '2026-04-18T11:00:00Z', finishedAt: null, stages: [{ name: 'Build', status: 'passed', duration: 490 }, { name: 'Unit Tests', status: 'running', duration: null }], triggeredBy: 'diana.prince', branch: 'hotfix/login-bug', commitSha: 'e5f6g7h' },
];

const SCREENZAA = [
  { id: 1, featureName: 'User Authentication', team: 'Backend', status: 'Live', month: '2026-01', personResponsible: 'Diana Prince', remarks: 'Fully covered with regression tests', totalTests: 45, liveTests: 42, atTests: 38, ttTests: 40, nfTests: 5, attcTests: 35, link: 'https://jira.company.com/SEC-101', configuration: 'prod', dependent: 'Database, Auth Service', jiraDetails: 'SEC-101, SEC-102', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-04-01T00:00:00Z' },
  { id: 2, featureName: 'Pipeline Dashboard', team: 'Frontend', status: 'In Progress', month: '2026-02', personResponsible: 'Bob Wilson', remarks: 'Widgets in testing phase', totalTests: 78, liveTests: 60, atTests: 55, ttTests: 58, nfTests: 8, attcTests: 50, link: 'https://jira.company.com/DASH-201', configuration: 'staging', dependent: 'Dashboard API, Analytics Service', jiraDetails: 'DASH-201, DASH-202, DASH-203', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-04-15T00:00:00Z' },
  { id: 3, featureName: 'User Management Module', team: 'Backend', status: 'Live', month: '2026-01', personResponsible: 'Ethan Hunt', remarks: 'Complete CRUD operations tested', totalTests: 92, liveTests: 90, atTests: 88, ttTests: 89, nfTests: 10, attcTests: 85, link: 'https://jira.company.com/USR-301', configuration: 'prod', dependent: 'Users API, Groups API', jiraDetails: 'USR-301, USR-302', createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z' },
  { id: 4, featureName: 'Audit Logging System', team: 'Backend', status: 'Live', month: '2026-03', personResponsible: 'Ivan Petrov', remarks: 'All table operations tracked', totalTests: 34, liveTests: 34, atTests: 32, ttTests: 33, nfTests: 3, attcTests: 30, link: 'https://jira.company.com/AUD-401', configuration: 'prod', dependent: 'Database Triggers, AuditLogs API', jiraDetails: 'AUD-401', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z' },
  { id: 5, featureName: 'Real-time Verification Engine', team: 'QA', status: 'In Progress', month: '2026-04', personResponsible: 'John Doe', remarks: 'WebSocket implementation pending', totalTests: 28, liveTests: 10, atTests: 8, ttTests: 10, nfTests: 2, attcTests: 7, link: 'https://jira.company.com/RTV-501', configuration: 'dev', dependent: 'WebSocket Server, Redis', jiraDetails: 'RTV-501, RTV-502, RTV-503', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-18T00:00:00Z' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function paginate(arr, page = 1, limit = 10) {
  const p = parseInt(page), l = parseInt(limit);
  const start = (p - 1) * l;
  return { data: arr.slice(start, start + l), total: arr.length, page: p, totalPages: Math.ceil(arr.length / l) };
}

let nextId = { users: 13, groups: 6, permissions: 9, screenzaa: 6 };

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post('/api/Auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(u => u.username === username);
  if (!user || password !== 'password') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'OK', user: { id: user.id, username: user.username, displayName: user.displayName, email: user.email } });
});

app.get('/api/Auth/validate', (req, res) => res.json({ message: 'OK', valid: true }));
app.post('/api/Auth/logout', (req, res) => res.json({ message: 'OK' }));

// ─── Dashboard ───────────────────────────────────────────────────────────────

app.get('/api/Dashboard/builds', (req, res) => res.json(BUILDS));

app.get('/api/Dashboard/stats', (req, res) => {
  const build = BUILDS.find(b => b.id === req.query.buildId) || BUILDS[0];
  res.json({
    buildId: build.id,
    buildNumber: build.buildNumber,
    branch: build.branch,
    status: build.status,
    totalTests: build.totalTests || 412,
    passed: build.passed || 398,
    failed: build.failed || 8,
    skipped: build.skipped || 6,
    passRate: build.totalTests ? Math.round((build.passed / build.totalTests) * 100) : 96.6,
    duration: build.duration || 2700,
    triggeredBy: build.triggeredBy,
    startedAt: build.startedAt,
    finishedAt: build.finishedAt,
  });
});

app.get('/api/Dashboard/trends', (req, res) => {
  res.json({
    buildId: req.query.buildId || 'build-001',
    trend: BUILDS.filter(b => b.totalTests).map(b => ({
      buildNumber: b.buildNumber,
      date: b.startedAt,
      passed: b.passed,
      failed: b.failed,
      skipped: b.skipped,
      total: b.totalTests,
      passRate: Math.round((b.passed / b.totalTests) * 100),
    })),
  });
});

app.get('/api/Dashboard/analytics', (req, res) => {
  res.json({
    totalBuilds: BUILDS.length,
    successfulBuilds: BUILDS.filter(b => b.status === 'passed').length,
    failedBuilds: BUILDS.filter(b => b.status === 'failed').length,
    runningBuilds: BUILDS.filter(b => b.status === 'running').length,
    avgPassRate: 94.2,
    avgDuration: 2655,
    totalTestsRun: 1612,
    mostFailedClass: 'AuthServiceTest',
    topBranches: [
      { branch: 'main', builds: 3, passRate: 96.1 },
      { branch: 'feature/dashboard-v2', builds: 1, passRate: 99.5 },
      { branch: 'hotfix/login-bug', builds: 1, passRate: null },
    ],
  });
});

app.get('/api/Dashboard/analytics/:buildId', (req, res) => {
  const build = BUILDS.find(b => b.id === req.params.buildId) || BUILDS[0];
  const results = TEST_RESULTS.filter(t => t.buildId === build.id);
  const classes = [...new Set(results.map(t => t.className))];
  res.json({
    buildId: build.id,
    buildNumber: build.buildNumber,
    testsByClass: classes.map(cls => ({
      className: cls,
      total: results.filter(t => t.className === cls).length,
      passed: results.filter(t => t.className === cls && t.outcome === 'Passed').length,
      failed: results.filter(t => t.className === cls && t.outcome === 'Failed').length,
      skipped: results.filter(t => t.className === cls && t.outcome === 'Skipped').length,
    })),
    outcomes: {
      Passed: results.filter(t => t.outcome === 'Passed').length,
      Failed: results.filter(t => t.outcome === 'Failed').length,
      Skipped: results.filter(t => t.outcome === 'Skipped').length,
    },
  });
});

app.get('/api/Dashboard/debug-data', (req, res) => {
  res.json({ serverTime: new Date().toISOString(), uptime: process.uptime(), memoryUsage: process.memoryUsage(), nodeVersion: process.version, mockDataCounts: { users: USERS.length, groups: GROUPS.length, builds: BUILDS.length, testResults: TEST_RESULTS.length } });
});

app.get('/api/Dashboard/real-time-verification', (req, res) => {
  res.json({
    status: 'active',
    checkedAt: new Date().toISOString(),
    services: [
      { name: 'Auth Service', status: 'healthy', latency: 12 },
      { name: 'Database', status: 'healthy', latency: 5 },
      { name: 'Pipeline Runner', status: 'healthy', latency: 28 },
      { name: 'Notification Service', status: 'degraded', latency: 250 },
      { name: 'Analytics Engine', status: 'healthy', latency: 45 },
    ],
  });
});

app.get('/api/Dashboard/recent-runs', (req, res) => {
  const runs = (req.query.buildId ? BUILDS.filter(b => b.id === req.query.buildId) : BUILDS).slice(0, 5);
  res.json(runs);
});

app.get('/api/Dashboard/latest-failures', (req, res) => {
  const failures = TEST_RESULTS.filter(t => t.outcome === 'Failed' && (!req.query.buildId || t.buildId === req.query.buildId));
  res.json(failures.slice(0, 10));
});

// ─── AuditLogs ───────────────────────────────────────────────────────────────

app.get('/api/AuditLogs', (req, res) => {
  let logs = [...AUDIT_LOGS];
  const { Search, TableName, Page = 1, Limit = 10 } = req.query;
  if (Search) logs = logs.filter(l => l.username.includes(Search) || l.operation.includes(Search));
  if (TableName) logs = logs.filter(l => l.tableName === TableName);
  const result = paginate(logs, Page, Limit);
  res.json(result);
});

app.get('/api/AuditLogs/tables', (req, res) => {
  res.json([...new Set(AUDIT_LOGS.map(l => l.tableName))]);
});

// ─── Groups ──────────────────────────────────────────────────────────────────

app.get('/api/Groups', (req, res) => res.json(GROUPS));

app.post('/api/Groups', (req, res) => {
  const group = { id: nextId.groups++, ...req.body, isSystemGroup: false, createdAt: new Date().toISOString(), parentGroupName: null, users: [], permissions: [], childGroups: [] };
  GROUPS.push(group);
  res.json(group);
});

app.get('/api/Groups/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=groups.json');
  res.json(GROUPS);
});

app.get('/api/Groups/:id', (req, res) => {
  const group = GROUPS.find(g => g.id === parseInt(req.params.id));
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

app.put('/api/Groups/:id', (req, res) => {
  const idx = GROUPS.findIndex(g => g.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Group not found' });
  GROUPS[idx] = { ...GROUPS[idx], ...req.body };
  res.json(GROUPS[idx]);
});

app.delete('/api/Groups/:id', (req, res) => {
  const idx = GROUPS.findIndex(g => g.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Group not found' });
  GROUPS.splice(idx, 1);
  res.json({ message: 'OK' });
});

// ─── Master ──────────────────────────────────────────────────────────────────

app.get('/api/Master/test-results', (req, res) => {
  let results = [...TEST_RESULTS];
  if (req.query.buildId) results = results.filter(t => t.buildId === req.query.buildId);
  if (req.query.outcome) results = results.filter(t => t.outcome === req.query.outcome);
  if (req.query.className) results = results.filter(t => t.className === req.query.className);
  if (req.query.search) results = results.filter(t => t.testName.toLowerCase().includes(req.query.search.toLowerCase()));
  res.json({ data: results, total: results.length });
});

app.get('/api/Master/test-error/:id', (req, res) => {
  const test = TEST_RESULTS.find(t => t.id === parseInt(req.params.id));
  if (!test) return res.status(404).json({ message: 'Test not found' });
  res.json(test);
});

app.get('/api/Master/pipeline-details', (req, res) => {
  let pipelines = [...PIPELINE_DETAILS];
  if (req.query.status) pipelines = pipelines.filter(p => p.status === req.query.status);
  if (req.query.buildNumber) pipelines = pipelines.filter(p => p.buildNumber === req.query.buildNumber);
  if (req.query.fromDate) pipelines = pipelines.filter(p => new Date(p.startedAt) >= new Date(req.query.fromDate));
  if (req.query.toDate) pipelines = pipelines.filter(p => new Date(p.startedAt) <= new Date(req.query.toDate));
  res.json({ data: pipelines, total: pipelines.length });
});

// ─── Permissions ─────────────────────────────────────────────────────────────

app.get('/api/Permissions', (req, res) => res.json(PERMISSIONS));

app.post('/api/Permissions', (req, res) => {
  const perm = { id: nextId.permissions++, ...req.body, isSystemPermission: false, isActive: true, createdAt: new Date().toISOString(), parentPermissionName: null, childPermissions: [] };
  PERMISSIONS.push(perm);
  res.json(perm);
});

app.get('/api/Permissions/categories', (req, res) => {
  res.json([...new Set(PERMISSIONS.map(p => p.category))]);
});

app.get('/api/Permissions/:id', (req, res) => {
  const perm = PERMISSIONS.find(p => p.id === parseInt(req.params.id));
  if (!perm) return res.status(404).json({ message: 'Permission not found' });
  res.json(perm);
});

app.put('/api/Permissions/:id', (req, res) => {
  const idx = PERMISSIONS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Permission not found' });
  PERMISSIONS[idx] = { ...PERMISSIONS[idx], ...req.body };
  res.json(PERMISSIONS[idx]);
});

app.delete('/api/Permissions/:id', (req, res) => {
  const idx = PERMISSIONS.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Permission not found' });
  PERMISSIONS.splice(idx, 1);
  res.json({ message: 'OK' });
});

// ─── Preferences ─────────────────────────────────────────────────────────────

const PREFS = { theme: 'dark', language: 'en', timezone: 'UTC', dashboardLayout: 'grid', notificationsEnabled: 'true', defaultBuildId: 'build-001', pageSize: '10' };

app.get('/api/Preferences/:key', (req, res) => {
  const val = PREFS[req.params.key];
  if (!val) return res.status(404).json({ message: 'Preference not found' });
  res.json({ key: req.params.key, value: val });
});

app.post('/api/Preferences', (req, res) => {
  PREFS[req.body.key] = req.body.value;
  res.json({ message: 'OK' });
});

// ─── Screenzaa ───────────────────────────────────────────────────────────────

app.get('/api/Screenzaa', (req, res) => res.json(SCREENZAA));

app.post('/api/Screenzaa', (req, res) => {
  const entry = { id: nextId.screenzaa++, ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  SCREENZAA.push(entry);
  res.json(entry);
});

app.get('/api/Screenzaa/sample', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=screenzaa_sample.json');
  res.json([{ featureName: 'Sample Feature', team: 'QA', status: 'Live', month: '2026-01', personResponsible: 'Jane Doe', remarks: 'Sample remarks', totalTests: 10, liveTests: 8, atTests: 7, ttTests: 8, nfTests: 1, attcTests: 6, link: 'https://jira.company.com/SAM-001', configuration: 'prod', dependent: 'API Service', jiraDetails: 'SAM-001' }]);
});

app.post('/api/Screenzaa/import', (req, res) => res.json({ message: 'OK', imported: 3 }));

app.get('/api/Screenzaa/:id', (req, res) => {
  const item = SCREENZAA.find(s => s.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

app.put('/api/Screenzaa/:id', (req, res) => {
  const idx = SCREENZAA.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  SCREENZAA[idx] = { ...SCREENZAA[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json(SCREENZAA[idx]);
});

app.delete('/api/Screenzaa/:id', (req, res) => {
  const idx = SCREENZAA.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  SCREENZAA.splice(idx, 1);
  res.json({ message: 'OK' });
});

// ─── Users ───────────────────────────────────────────────────────────────────

app.get('/api/Users', (req, res) => {
  let users = [...USERS];
  const { search, groupId, isActive, sortBy = 'id', sortDirection = 'asc', page = 1, limit = 10 } = req.query;
  if (search) users = users.filter(u => u.username.includes(search) || u.email.includes(search) || u.displayName.includes(search));
  if (groupId) users = users.filter(u => u.groups.some(g => g.id === parseInt(groupId)));
  if (isActive !== undefined) users = users.filter(u => u.isActive === (isActive === 'true'));
  users.sort((a, b) => {
    const dir = sortDirection === 'desc' ? -1 : 1;
    return String(a[sortBy]).localeCompare(String(b[sortBy])) * dir;
  });
  res.json(paginate(users, page, limit));
});

app.post('/api/Users', (req, res) => {
  const user = { id: nextId.users++, ...req.body, displayName: `${req.body.firstName} ${req.body.lastName}`, avatarUrl: `https://i.pravatar.cc/40?img=${nextId.users}`, createdAt: new Date().toISOString(), lastLoginAt: null, isLocked: false, emailVerified: false, twoFactorEnabled: false, passwordChangedAt: new Date().toISOString(), groups: [] };
  USERS.push(user);
  res.json(user);
});

app.get('/api/Users/export', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=users.json');
  res.json(USERS.map(u => ({ username: u.username, email: u.email, firstName: u.firstName, lastName: u.lastName, department: u.department, jobTitle: u.jobTitle, createdAt: u.createdAt, lastLoginAt: u.lastLoginAt, groups: u.groups.map(g => g.name).join(', ') })));
});

app.post('/api/Users/bulk-delete', (req, res) => {
  const { ids } = req.body;
  ids.forEach(id => { const idx = USERS.findIndex(u => u.id === id); if (idx !== -1) USERS.splice(idx, 1); });
  res.json({ message: 'OK', deleted: ids.length });
});

app.get('/api/Users/:id', (req, res) => {
  const user = USERS.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

app.put('/api/Users/:id', (req, res) => {
  const idx = USERS.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  USERS[idx] = { ...USERS[idx], ...req.body, displayName: `${req.body.firstName || USERS[idx].firstName} ${req.body.lastName || USERS[idx].lastName}` };
  res.json(USERS[idx]);
});

app.delete('/api/Users/:id', (req, res) => {
  const idx = USERS.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  USERS.splice(idx, 1);
  res.json({ message: 'OK' });
});

// ─── Settings ────────────────────────────────────────────────────────────────

app.get('/api/Settings', (req, res) => {
  res.json({
    appName: 'Pipeline Dashboard',
    version: '2.4.1',
    environment: 'mock-local',
    features: { auditLogging: true, twoFactorAuth: true, realTimeVerification: true, exportData: true, bulkOperations: true },
    limits: { maxUsersPerGroup: 100, maxGroupsPerUser: 10, sessionTimeoutMinutes: 60, maxPageSize: 100 },
    maintenance: { enabled: false, message: null, scheduledAt: null },
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n✅  Mock API server running at http://localhost:${PORT}`);
  console.log(`\n📋  Available endpoints:`);
  console.log(`    Auth:        POST /api/Auth/login  (username: john.doe, password: password)`);
  console.log(`    Dashboard:   GET  /api/Dashboard/builds`);
  console.log(`    Users:       GET  /api/Users`);
  console.log(`    Groups:      GET  /api/Groups`);
  console.log(`    Permissions: GET  /api/Permissions`);
  console.log(`    AuditLogs:   GET  /api/AuditLogs`);
  console.log(`    Master:      GET  /api/Master/test-results`);
  console.log(`    Screenzaa:   GET  /api/Screenzaa`);
  console.log(`    Settings:    GET  /api/Settings`);
  console.log(`\n📖  OpenAPI spec: openapi.yaml`);
  console.log(`\n💡  All data is in-memory — changes reset on server restart.\n`);
});
