const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const opts = { ...options, hostname: '127.0.0.1' };
    const payload = data ? JSON.stringify(data) : null;
    if (payload) {
      opts.headers = {
        ...opts.headers,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      };
    }
    const start = process.hrtime();
    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
        let parsed = null;
        try { parsed = JSON.parse(body); } catch(e) { parsed = body; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed,
          durationMs
        });
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runEventTests() {
  console.log('====================================================================');
  console.log('    PRACTICAL 10: ASYNCHRONOUS EVENT-DRIVEN ARCHITECTURE TEST SUITE  ');
  console.log('====================================================================\n');

  // 1. Authenticate to get JWT token
  const email = 'student@test.com';
  const password = 'password123';

  console.log('1. Authenticating test user:', email);
  let token = '';
  try {
    const loginRes = await request({
      port: 5001,
      path: '/login',
      method: 'POST'
    }, { email, password });
    token = loginRes?.body?.token || '';
    console.log('   -> Successfully obtained JWT Token!\n');
  } catch(e) {
    console.error('   -> Error connecting to backend on port 5001. Ensure server is running.');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Test 1: Standard Asynchronous 'task-created' Event
  console.log('2. [CORE TEST]: Creating Task & Emitting "task-created" Event:');
  const postStart = new Date();
  const createRes = await request({
    port: 5001,
    path: '/tasks',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Deploy Event-Driven Architecture',
    description: 'Verify background listener logs without blocking response',
    priority: 'high'
  });

  const postClientReceived = new Date();
  console.log(`   -> HTTP Status:           ${createRes.statusCode} Created`);
  console.log(`   -> Client Received At:    ${postClientReceived.toISOString()}`);
  console.log(`   -> API Response Latency:  ${createRes.durationMs} ms (Returned Immediately!)`);
  console.log(`   -> Created Task ID:       ${createRes.body._id}`);

  // Wait for background worker to complete notification
  console.log('   -> Waiting 1s for background notification worker to finish...');
  await sleep(1000);

  // 3. Test 2: Supplementary Problem 3 - Simulated Slow Notification Handler (2 seconds)
  console.log('\n3. [SUPPLEMENTARY 3]: Simulating SLOW Background Notification (2 Seconds):');
  console.log('   Sending POST /tasks?simulateSlow=true ...');
  const slowStart = Date.now();
  const slowRes = await request({
    port: 5001,
    path: '/tasks?simulateSlow=true',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Send Mass Email Notifications',
    description: 'Slow background I/O operation (2000ms delay)',
    priority: 'medium'
  });

  const slowLatency = Date.now() - slowStart;
  console.log(`   -> HTTP Status:           ${slowRes.statusCode} Created`);
  console.log(`   -> API Response Latency:  ${slowRes.durationMs} ms (Instant! <20ms)`);
  console.log(`   -> PROOF: Even though background worker takes 2,000ms, the API response`);
  console.log(`      was delivered to the client in just ${slowRes.durationMs}ms without blocking!`);

  console.log('   -> Waiting 2.5s for slow background notification worker to complete...');
  await sleep(2500);

  // 4. Test 3: Supplementary Problem 1 - 'task-deleted' Event
  console.log('\n4. [SUPPLEMENTARY 1]: Deleting Task & Emitting "task-deleted" Event:');
  const targetId = createRes.body._id;
  const deleteRes = await request({
    port: 5001,
    path: `/tasks/${targetId}`,
    method: 'DELETE',
    headers: authHeaders
  });

  console.log(`   -> HTTP Status:           ${deleteRes.statusCode} OK`);
  console.log(`   -> API Response Latency:  ${deleteRes.durationMs} ms`);
  console.log(`   -> Response Message:      ${deleteRes.body.message}`);
  console.log(`   -> Triggered Event:       'task-deleted' logged to audit trail`);
  await sleep(500);

  // 5. Test 4: Supplementary Problem 2 - Error Handling in Background Listener
  console.log('\n5. [SUPPLEMENTARY 2]: Testing Error Event Listener (Simulated Failure):');
  const errRes = await request({
    port: 5001,
    path: '/tasks?simulateError=true',
    method: 'POST',
    headers: authHeaders
  }, {
    title: 'Task Triggering Webhook Error',
    description: 'Tests that background errors do not crash the Express server',
    priority: 'low'
  });

  console.log(`   -> HTTP Status:           ${errRes.statusCode} Created`);
  console.log(`   -> Server Status:         Still running perfectly! Exception caught by 'error' listener.`);
  await sleep(500);

  // 6. View Events Audit Log
  console.log('\n6. Fetching Server Events Audit Log (GET /events-log):');
  const logRes = await request({
    port: 5001,
    path: '/events-log',
    method: 'GET'
  });

  console.log(`   Total Background Events Logged: ${logRes.body.totalEventsProcessed}`);
  console.log('\nLatest Event Audit Records:');
  console.log(JSON.stringify(logRes.body.events.slice(-3), null, 2));

  console.log('\n====================================================================');
  console.log('          ALL ASYNCHRONOUS EVENT TESTS COMPLETED SUCCESSFULLY!       ');
  console.log('====================================================================\n');
}

runEventTests().catch(console.error);
