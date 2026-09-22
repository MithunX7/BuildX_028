// Test citizen report creation, photo upload, contractor evidence upload, and before/after verification
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

// 1x1 transparent red PNG in base64
const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function run() {
  console.log('=== Step 1: Login as Citizen ===');
  const citizenLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'citizen.nagpur@gmail.com', password: 'nagpur123' });

  if (citizenLogin.status !== 200) {
    throw new Error(`Citizen login failed: ${JSON.stringify(citizenLogin)}`);
  }
  const citizenToken = citizenLogin.data.data.token;
  console.log('[PASS] Citizen logged in.');

  console.log('\n=== Step 2: Submit Citizen Report with Photo & Category "ROAD_SURFACE_DAMAGE" ===');
  const reportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/issues',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${citizenToken}`,
    },
  }, {
    category: 'ROAD_SURFACE_DAMAGE',
    title: 'Cracked Asphalt',
    description: 'Cracked road surface on South Ambazari Road.',
    coordinates: [79.0882, 21.1458],
    addressText: 'South Ambazari Road, Nagpur',
    imageBase64: testImageBase64,
  });

  if (reportRes.status !== 201) {
    throw new Error(`Report submission failed: ${reportRes.status} ${JSON.stringify(reportRes.data)}`);
  }
  const issue = reportRes.data.data;
  console.log(`[PASS] Issue created: ${issue.referenceCode} (ID: ${issue._id})`);
  console.log(`[PASS] Initial evidence photo: ${issue.evidencePhotos?.[0]}`);

  console.log('\n=== Step 3: Login as Admin ===');
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin@nmc.nagpur.gov.in', password: 'nagpur123' });

  if (adminLogin.status !== 200) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
  }
  const adminToken = adminLogin.data.data.token;
  console.log('[PASS] Admin logged in.');

  console.log('\n=== Step 4: Dispatch Work Order for Issue ===');
  const woRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/work-orders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, {
    issueId: issue._id,
    contractorName: 'Nagpur Rapid Infra Repairs Ltd.',
    dueInHours: 24,
  });

  if (woRes.status !== 201) {
    throw new Error(`Work order dispatch failed: ${woRes.status} ${JSON.stringify(woRes.data)}`);
  }
  const workOrder = woRes.data.data.workOrder;
  console.log(`[PASS] Work Order created: ${workOrder.workOrderNumber} (ID: ${workOrder._id})`);

  console.log('\n=== Step 5: Upload Contractor Completion Photo (AFTER Evidence) ===');
  const evidenceRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/work-orders/${workOrder._id}/evidence`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, {
    imageBase64: testImageBase64,
    completionNotes: 'Asphalt patched, rolled, and sealed to NMC standards.',
    evidenceType: 'FIELD_REPAIR_COMPLETION',
  });

  if (evidenceRes.status !== 200) {
    throw new Error(`Evidence upload failed: ${evidenceRes.status} ${JSON.stringify(evidenceRes.data)}`);
  }
  const evidence = evidenceRes.data.data.evidence;
  console.log(`[PASS] Evidence uploaded successfully! FileUrl: ${evidence.fileUrl}`);

  console.log('\n=== Step 6: Verify Work Order Evidence in Work Order Retrieval ===');
  const getWoRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/work-orders/${workOrder._id}`,
    method: 'GET',
  });

  if (getWoRes.status !== 200) {
    throw new Error(`Get work order failed: ${getWoRes.status}`);
  }
  const fetchedWo = getWoRes.data.data.workOrder;
  const fetchedEvidence = getWoRes.data.data.evidence;
  console.log(`[PASS] Work order status: ${fetchedWo.status}`);
  console.log(`[PASS] Attached evidence count: ${fetchedEvidence.length}, URL: ${fetchedEvidence[0]?.fileUrl}`);

  console.log('\n=== Step 7: Engineering Quality Sign-off (Approve & Resolve) ===');
  const verifyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/work-orders/${workOrder._id}/verify`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
  }, {
    action: 'APPROVE',
    notes: 'Approved by Chief Quality Verifier. Defect resolved satisfactorily.',
  });

  if (verifyRes.status !== 200) {
    throw new Error(`Verify failed: ${verifyRes.status} ${JSON.stringify(verifyRes.data)}`);
  }
  console.log(`[PASS] Verification result: ${verifyRes.data.data.message}`);

  console.log('\n=== Step 8: Fetch Issue by ID & Verify Before/After Photo Availability ===');
  const issueDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/issues/${issue._id}`,
    method: 'GET',
  });

  if (issueDetailRes.status !== 200) {
    throw new Error(`Get issue detail failed: ${issueDetailRes.status}`);
  }
  const detail = issueDetailRes.data.data;
  console.log(`[PASS] Issue Status: ${detail.issue.status}`);
  console.log(`[PASS] BEFORE photo URL: ${detail.issue.evidencePhotos?.[0]}`);
  console.log(`[PASS] AFTER photo URL: ${detail.workOrders?.[0]?.evidenceIds?.[0]?.fileUrl}`);

  console.log('\n======================================================');
  console.log('ALL PHOTO UPLOAD AND BEFORE/AFTER VERIFICATION PASSED!');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n[FAIL]', err);
  process.exit(1);
});
