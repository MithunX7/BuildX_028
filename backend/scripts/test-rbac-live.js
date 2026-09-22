const http = require('http');

function post(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data || {});
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body || '{}') }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log("=== 1. Test Unauthenticated Access to /api/admin/users ===");
  const res1 = await get('/api/admin/users');
  console.log(`Status Code: ${res1.statusCode} (Expected: 401)`);

  console.log("\n=== 2. Login as Citizen User ===");
  const loginCitizen = await post('/api/auth/login', {
    email: 'citizen.nagpur@gmail.com',
    password: 'nagpur123'
  });
  console.log(`Citizen Login Status: ${loginCitizen.statusCode}`);
  const citizenToken = loginCitizen.data.data.token;
  const citizenRole = loginCitizen.data.data.user.role;
  console.log(`Citizen Role: ${citizenRole}`);

  console.log("\n=== 3. Citizen Attempt to Access /api/admin/users ===");
  const res3 = await get('/api/admin/users', citizenToken);
  console.log(`Status Code: ${res3.statusCode} (Expected: 403 Forbidden)`);
  console.log(`Message: ${res3.data.error?.message}`);

  console.log("\n=== 4. Login as Municipal Administrator ===");
  const loginAdmin = await post('/api/auth/login', {
    email: 'admin@nmc.nagpur.gov.in',
    password: 'nagpur123'
  });
  console.log(`Admin Login Status: ${loginAdmin.statusCode}`);
  const adminToken = loginAdmin.data.data.token;
  const adminRole = loginAdmin.data.data.user.role;
  console.log(`Admin Role: ${adminRole}`);

  console.log("\n=== 5. Admin Access to /api/admin/users ===");
  const res5 = await get('/api/admin/users', adminToken);
  console.log(`Status Code: ${res5.statusCode} (Expected: 200 OK)`);
  console.log(`Found ${res5.data.data?.users?.length || 0} users in system`);

  console.log("\n=== 6. Create Real Issue as Citizen ===");
  const createRes = await post('/api/issues', {
    category: 'POTHOLE',
    title: 'Damaged asphalt on West High Court Road near coffee shop',
    description: 'Crater measuring 40cm wide causing two-wheelers to swerve dangerously.',
    coordinates: [79.0682, 21.1415],
    addressText: 'West High Court Road, Dharampeth, Nagpur',
  }, citizenToken);
  console.log(`Create Issue Status: ${createRes.statusCode} (Expected: 201)`);
  const createdIssue = createRes.data.data;
  console.log(`Created Defect ID: ${createdIssue.referenceCode}, Priority: ${createdIssue.priorityLevel}`);

  console.log("\n=== 7. Verify in Citizen's /api/issues/my-reports ===");
  const myReportsRes = await get('/api/issues/my-reports', citizenToken);
  console.log(`My Reports Status: ${myReportsRes.statusCode}`);
  const foundInMyReports = myReportsRes.data.data.some(i => i.referenceCode === createdIssue.referenceCode);
  console.log(`Issue ${createdIssue.referenceCode} found in citizen my-reports: ${foundInMyReports}`);

  console.log("\n=== 8. Verify Admin can view the new issue in /api/admin/issues ===");
  const adminIssuesRes = await get('/api/admin/issues?search=' + encodeURIComponent(createdIssue.referenceCode), adminToken);
  console.log(`Admin Issues Status: ${adminIssuesRes.statusCode}`);
  const foundInAdmin = adminIssuesRes.data.data?.issues?.some(i => i.referenceCode === createdIssue.referenceCode);
  console.log(`Issue ${createdIssue.referenceCode} visible to Admin: ${foundInAdmin}`);
}

run().catch(console.error);
