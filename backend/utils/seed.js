require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Issue.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@trackshield.io', password: 'admin123', role: 'admin' },
      { name: 'Alice Developer', email: 'alice@trackshield.io', password: 'password123', role: 'developer' },
      { name: 'Bob QA', email: 'bob@trackshield.io', password: 'password123', role: 'qa' },
      { name: 'Carol Security', email: 'carol@trackshield.io', password: 'password123', role: 'security_analyst' },
      { name: 'Dave Manager', email: 'dave@trackshield.io', password: 'password123', role: 'manager' },
    ]);
    console.log(`Created ${users.length} users`);

    const [admin, alice, bob, carol, dave] = users;

    // Create issues
    const issuesData = [
      {
        title: 'SQL Injection vulnerability in login endpoint',
        description: 'The login form is vulnerable to SQL injection attacks. An attacker can bypass authentication by injecting malicious SQL code into the username field. This is a critical security issue that needs immediate attention.\n\n**Steps to reproduce:**\n1. Navigate to /login\n2. Enter `\' OR 1=1--` in username field\n3. Enter any password\n4. Access is granted without valid credentials\n\n**Impact:** Full authentication bypass, potential data exfiltration.',
        type: 'security_vulnerability',
        priority: 'critical',
        status: 'open',
        environment: 'production',
        assignedTo: carol._id,
        reportedBy: bob._id,
        approvalStatus: 'approved',
        cvssScore: 9.8,
        cveId: 'CVE-2024-0001',
        tags: ['sql-injection', 'auth', 'critical']
      },
      {
        title: 'Dashboard charts not loading on Firefox',
        description: 'The analytics charts on the dashboard page fail to render when using Firefox browser version 120+. The charts show a blank area with no error message to the user.\n\n**Browser:** Firefox 120.0.1\n**OS:** Windows 11\n**Expected:** Charts should render\n**Actual:** Blank white area',
        type: 'bug',
        priority: 'high',
        status: 'in_progress',
        environment: 'production',
        assignedTo: alice._id,
        reportedBy: bob._id,
        approvalStatus: 'approved',
        tags: ['firefox', 'dashboard', 'charts']
      },
      {
        title: 'Add bulk issue assignment feature',
        description: 'Users need the ability to select multiple issues from the list view and assign them to a team member in bulk. This will significantly improve workflow efficiency for managers.\n\n**Acceptance Criteria:**\n- Checkbox on each issue row\n- "Select All" option\n- Bulk assign dropdown\n- Confirmation dialog before bulk action',
        type: 'feature',
        priority: 'medium',
        status: 'open',
        environment: 'staging',
        assignedTo: alice._id,
        reportedBy: dave._id,
        approvalStatus: 'pending',
        tags: ['feature', 'bulk-action', 'ux']
      },
      {
        title: 'XSS vulnerability in comment section',
        description: 'User-submitted comments are not properly sanitized before rendering. An attacker can inject malicious JavaScript through the comment field which executes when other users view the issue.\n\n**Proof of Concept:** `<script>alert(document.cookie)</script>`\n\n**Affected:** All users who view issues with malicious comments.',
        type: 'security_vulnerability',
        priority: 'critical',
        status: 'in_progress',
        environment: 'production',
        assignedTo: carol._id,
        reportedBy: carol._id,
        approvalStatus: 'approved',
        cvssScore: 8.2,
        tags: ['xss', 'comments', 'security']
      },
      {
        title: 'Password reset emails not being sent',
        description: 'Users report that password reset emails are not arriving. The system returns a success message but no email is delivered. This has been reported by 15+ users over the past week.',
        type: 'bug',
        priority: 'high',
        status: 'open',
        environment: 'production',
        assignedTo: alice._id,
        reportedBy: bob._id,
        approvalStatus: 'approved',
        tags: ['email', 'auth', 'password-reset']
      },
      {
        title: 'Implement two-factor authentication',
        description: 'Add 2FA support using TOTP (Time-based One-Time Password) to enhance account security. Support Google Authenticator and Authy apps.\n\n**Requirements:**\n- QR code setup flow\n- Backup recovery codes\n- Optional enforcement per role',
        type: 'feature',
        priority: 'high',
        status: 'open',
        environment: 'staging',
        assignedTo: null,
        reportedBy: dave._id,
        approvalStatus: 'approved',
        tags: ['security', '2fa', 'auth', 'feature']
      },
      {
        title: 'Slow page load on issue list with 1000+ issues',
        description: 'The issue listing page takes 8-12 seconds to load when there are more than 1000 issues. Users experience significant slowdown and sometimes timeouts.\n\n**Performance test results:**\n- 100 issues: 0.8s\n- 500 issues: 3.2s\n- 1000 issues: 11.4s',
        type: 'bug',
        priority: 'medium',
        status: 'open',
        environment: 'production',
        assignedTo: alice._id,
        reportedBy: bob._id,
        approvalStatus: 'pending',
        tags: ['performance', 'pagination', 'database']
      },
      {
        title: 'Insecure direct object reference in file download',
        description: 'The file download endpoint does not verify that the requesting user has permission to access the file. By manipulating the file ID in the URL, users can download files belonging to other issues they should not have access to.',
        type: 'security_vulnerability',
        priority: 'high',
        status: 'resolved',
        environment: 'production',
        assignedTo: carol._id,
        reportedBy: carol._id,
        approvalStatus: 'approved',
        cvssScore: 7.5,
        tags: ['idor', 'file-access', 'security']
      },
      {
        title: 'Add CSV export for issue reports',
        description: 'Managers need to export issue data to CSV for reporting purposes. The export should respect current filters and include all relevant fields.',
        type: 'feature',
        priority: 'low',
        status: 'open',
        environment: 'staging',
        assignedTo: null,
        reportedBy: dave._id,
        approvalStatus: 'pending',
        tags: ['export', 'reporting', 'csv']
      },
      {
        title: 'Mobile responsive layout broken on iOS Safari',
        description: 'Several UI components break on iOS Safari 17. The sidebar overlaps content, and the modal dialogs extend beyond the viewport.',
        type: 'bug',
        priority: 'medium',
        status: 'closed',
        environment: 'production',
        assignedTo: alice._id,
        reportedBy: bob._id,
        approvalStatus: 'approved',
        tags: ['mobile', 'safari', 'responsive']
      },
    ];

    const issues = await Issue.create(issuesData);
    console.log(`Created ${issues.length} issues`);

    // Create comments
    const commentsData = [
      { issue: issues[0]._id, author: carol._id, content: 'Confirmed this vulnerability. I was able to reproduce it in under 2 minutes. Escalating to P0 immediately. Will prepare a patch today.' },
      { issue: issues[0]._id, author: admin._id, content: 'WAF rule has been deployed as a temporary mitigation. Permanent fix in progress by @carol.' },
      { issue: issues[0]._id, author: bob._id, content: 'Also found a similar injection point in the registration endpoint. Adding that to the scope of this fix.' },
      { issue: issues[1]._id, author: alice._id, content: 'Investigated - the issue is with our Recharts version not supporting the new Firefox canvas API. Upgrading to v2.10 should fix it.' },
      { issue: issues[1]._id, author: bob._id, content: 'Can confirm the upgrade on staging environment fixed the rendering issue. Ready for production deployment.' },
      { issue: issues[3]._id, author: carol._id, content: 'Implementing DOMPurify for HTML sanitization. Also adding Content-Security-Policy headers to prevent script execution.' },
      { issue: issues[3]._id, author: admin._id, content: 'Good approach. Make sure to sanitize on both input (save) and output (render) paths for defense in depth.' },
      { issue: issues[4]._id, author: alice._id, content: 'Checked the mail server logs - our SMTP provider flagged the sending domain. Need to update SPF and DKIM records.' },
      { issue: issues[6]._id, author: alice._id, content: 'Root cause: N+1 query problem when loading assignee details. Will implement aggregation pipeline and add Redis caching.' },
    ];

    await Comment.create(commentsData);
    console.log(`Created ${commentsData.length} comments`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:    admin@trackshield.io    / admin123');
    console.log('  Dev:      alice@trackshield.io    / password123');
    console.log('  QA:       bob@trackshield.io      / password123');
    console.log('  Security: carol@trackshield.io    / password123');
    console.log('  Manager:  dave@trackshield.io     / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
