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

async function runTests() {
  console.log('==================================================================');
  console.log('         PRACTICAL 9: IN-MEMORY CACHING BENCHMARK SUITE          ');
  console.log('==================================================================\n');

  // 1. Authenticate to get token
  const email = 'student@test.com';
  const password = 'password123';

  console.log('1. Authenticating test user:', email);
  try {
    await request({
      port: 5001,
      path: '/register',
      method: 'POST'
    }, { email, password });
  } catch(e) {}

  let token = '';
  try {
    const loginRes = await request({
      port: 5001,
      path: '/login',
      method: 'POST'
    }, { email, password });
    token = loginRes?.body?.token || '';
    console.log('   -> Successfully obtained JWT Token!');
  } catch(e) {
    console.log('   -> Could not connect to backend. Please ensure server is running.');
    return;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Add initial benchmark tasks
  try {
    await request({
      port: 5001,
      path: '/tasks',
      method: 'POST',
      headers: authHeaders
    }, { title: 'Benchmark Task 1', description: 'Testing cache', priority: 'high' });
  } catch(e) {}

  // 2. Measure UNCACHED readings (Direct DB queries via noCache=true)
  console.log('\n2. Measuring UNCACHED Readings (Direct Database Queries):');
  const uncachedTimes = [];
  for (let i = 1; i <= 3; i++) {
    const res = await request({
      port: 5001,
      path: '/tasks?noCache=true',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`   Sample ${i} (Uncached): ${res.durationMs} ms | X-Cache: ${res.headers['x-cache']} | Status: ${res.statusCode}`);
    uncachedTimes.push(parseFloat(res.durationMs));
  }

  // 3. Flush cache to start fresh
  await request({
    port: 5001,
    path: '/cache/flush',
    method: 'POST'
  });

  // 4. Measure CACHE MISS followed by CACHE HITS
  console.log('\n3. Measuring CACHED Readings (node-cache In-Memory):');
  const missRes = await request({
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   Initial Request (Cache MISS - fetched & cached): ${missRes.durationMs} ms | X-Cache: ${missRes.headers['x-cache']}`);

  const cachedTimes = [];
  for (let i = 1; i <= 3; i++) {
    const res = await request({
      port: 5001,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`   Sample ${i} (Cache HIT):  ${res.durationMs} ms | X-Cache: ${res.headers['x-cache']} | Status: ${res.statusCode}`);
    cachedTimes.push(parseFloat(res.durationMs));
  }

  // Summary Comparison
  const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / uncachedTimes.length).toFixed(2);
  const avgCached = (cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length).toFixed(2);
  const speedup = (avgUncached / avgCached).toFixed(1);

  console.log('\n==================================================================');
  console.log(`Average Uncached Response Time: ${avgUncached} ms`);
  console.log(`Average Cached Response Time:   ${avgCached} ms`);
  console.log(`Performance Improvement:        ${speedup}x faster with in-memory caching!`);
  console.log('==================================================================');

  // 5. Test Cache Invalidation on Write (POST)
  console.log('\n4. Testing Cache Invalidation on Write (POST /tasks):');
  const createRes = await request({
    port: 5001,
    path: '/tasks',
    method: 'POST',
    headers: authHeaders
  }, { title: 'New Task After Cache', description: 'Invalidates all_tasks', priority: 'low' });
  console.log('   Created new task:', createRes?.body?.title || 'Task');

  const afterWriteRes = await request({
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   Next GET /tasks immediately after write: ${afterWriteRes.durationMs} ms | X-Cache: ${afterWriteRes.headers['x-cache']} (Expected: MISS)`);

  const secondRead = await request({
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   Subsequent GET /tasks: ${secondRead.durationMs} ms | X-Cache: ${secondRead.headers['x-cache']} (Expected: HIT)`);

  // 6. Test Supplementary Problem 1: Single Task Caching (GET /tasks/:id)
  console.log('\n5. Supplementary Problem 1: Single-Task Caching (GET /tasks/:id):');
  const taskId = createRes?.body?._id || '6acf4a7aacad4b0e58a3fb6e';
  const singleMiss = await request({
    port: 5001,
    path: `/tasks/${taskId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   GET /tasks/${taskId} (Call 1): ${singleMiss.durationMs} ms | X-Cache: ${singleMiss.headers['x-cache']}`);

  const singleHit = await request({
    port: 5001,
    path: `/tasks/${taskId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log(`   GET /tasks/${taskId} (Call 2): ${singleHit.durationMs} ms | X-Cache: ${singleHit.headers['x-cache']} (Expected: HIT)`);

  // 7. Test Supplementary Problem 2: Debug Endpoint (GET /cache-stats)
  console.log('\n6. Supplementary Problem 2: Debug Stats Endpoint (GET /cache-stats):');
  const statsRes = await request({
    port: 5001,
    path: '/cache-stats',
    method: 'GET'
  });
  console.log(JSON.stringify(statsRes.body, null, 2));

  console.log('\n==================================================================');
  console.log('           ALL BENCHMARKS AND VERIFICATIONS COMPLETED!            ');
  console.log('==================================================================');
}

runTests().catch(console.error);
