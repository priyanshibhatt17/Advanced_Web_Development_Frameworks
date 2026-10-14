const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? (body.startsWith('{') || body.startsWith('[') ? JSON.parse(body) : body) : null,
          durationMs
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- PRACTICAL 9: CACHING & BENCHMARK SUITE ---');

  // 1. Authenticate to get token
  const email = 'cachetest_' + Date.now() + '@test.com';
  const password = 'password123';

  console.log('\n1. Registering test user:', email);
  await request({
    hostname: 'localhost',
    port: 5001,
    path: '/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  console.log('Logging in...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email, password });

  const token = loginRes.body.token;
  console.log('Obtained JWT token successfully.');

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Ensure there are some tasks in the database
  await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'POST',
    headers: authHeaders
  }, { title: 'Benchmark Task 1', description: 'Testing cache', priority: 'high' });

  await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'POST',
    headers: authHeaders
  }, { title: 'Benchmark Task 2', description: 'Testing cache hit rate', priority: 'medium' });

  // 2. Measure UNCACHED readings (using ?noCache=true or fresh queries after flush)
  console.log('\n--- MEASURING UNCACHED (MONGODB DIRECT) READINGS ---');
  const uncachedTimes = [];
  for (let i = 1; i <= 3; i++) {
    const res = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/tasks?noCache=true',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`Sample ${i} (Uncached): ${res.durationMs} ms | X-Cache: ${res.headers['x-cache']} | Status: ${res.statusCode}`);
    uncachedTimes.push(parseFloat(res.durationMs));
  }

  // 3. Flush cache to start fresh
  await request({
    hostname: 'localhost',
    port: 5001,
    path: '/cache/flush',
    method: 'POST'
  });

  // 4. Measure CACHE MISS (initial read) followed by CACHE HITS
  console.log('\n--- MEASURING CACHED (NODE-CACHE IN-MEMORY) READINGS ---');
  const missRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Initial Call (Cache MISS - fetched from DB): ${missRes.durationMs} ms | X-Cache: ${missRes.headers['x-cache']}`);

  const cachedTimes = [];
  for (let i = 1; i <= 3; i++) {
    const res = await request({
      hostname: 'localhost',
      port: 5001,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    console.log(`Sample ${i} (Cache HIT): ${res.durationMs} ms | X-Cache: ${res.headers['x-cache']} | Status: ${res.statusCode}`);
    cachedTimes.push(parseFloat(res.durationMs));
  }

  // Summary Comparison
  const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / uncachedTimes.length).toFixed(2);
  const avgCached = (cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length).toFixed(2);
  const speedup = (avgUncached / avgCached).toFixed(1);

  console.log('\n=============================================');
  console.log(`Average Uncached Response Time: ${avgUncached} ms`);
  console.log(`Average Cached Response Time:   ${avgCached} ms`);
  console.log(`Performance Improvement:        ${speedup}x faster with node-cache!`);
  console.log('=============================================');

  // 5. Test Cache Invalidation on Write (POST)
  console.log('\n--- TESTING CACHE INVALIDATION (POST /tasks) ---');
  const createRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'POST',
    headers: authHeaders
  }, { title: 'New Task After Cache', description: 'Invalidates all_tasks', priority: 'low' });
  console.log('Created new task:', createRes.body.title);

  const afterWriteRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Next GET /tasks immediately after write: ${afterWriteRes.durationMs} ms | X-Cache: ${afterWriteRes.headers['x-cache']} (Expected: MISS because cache was invalidated)`);

  const secondRead = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/tasks',
    method: 'GET',
    headers: authHeaders
  });
  console.log(`Subsequent GET /tasks: ${secondRead.durationMs} ms | X-Cache: ${secondRead.headers['x-cache']} (Expected: HIT)`);

  // 6. Test Supplementary Problem 1: Single Task Caching (GET /tasks/:id)
  console.log('\n--- SUPPLEMENTARY PROBLEM 1: SINGLE-TASK CACHING (GET /tasks/:id) ---');
  const taskId = createRes.body._id;
  const singleMiss = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/tasks/${taskId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log(`GET /tasks/${taskId} (First call): ${singleMiss.durationMs} ms | X-Cache: ${singleMiss.headers['x-cache']}`);

  const singleHit = await request({
    hostname: 'localhost',
    port: 5001,
    path: `/tasks/${taskId}`,
    method: 'GET',
    headers: authHeaders
  });
  console.log(`GET /tasks/${taskId} (Second call): ${singleHit.durationMs} ms | X-Cache: ${singleHit.headers['x-cache']} (Expected: HIT)`);

  // 7. Test Supplementary Problem 2: Debug Endpoint (GET /cache-stats)
  console.log('\n--- SUPPLEMENTARY PROBLEM 2: DEBUG STATS ENDPOINT (GET /cache-stats) ---');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5001,
    path: '/cache-stats',
    method: 'GET'
  });
  console.log('Cache Stats Response:\n', JSON.stringify(statsRes.body, null, 2));

  console.log('\nAll tests completed successfully!');
}

runTests().catch(console.error);
