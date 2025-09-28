import http from 'k6/http';
import { check, sleep } from 'k6';

// Make BASE_URL configurable; default to localhost for local testing
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const COLD_CACHE = __ENV.COLD_CACHE === '1'; // set to 1 to force origin fetches

// Allow overriding stages via env vars for quick local runs
const TARGET_VUS = Number(__ENV.TARGET_VUS) || 5;
const DURATION = __ENV.DURATION || '2m';

export let options = {
  stages: [
    { duration: '30s', target: Math.min(2, TARGET_VUS) },
    { duration: DURATION, target: TARGET_VUS },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  // 1) main page
  let res = http.get(BASE_URL + '/');
  check(res, {
    'index ok (200)': (r) => r.status === 200,
    'index < 2s': (r) => r.timings.duration < 2000,
  });

  // 2) parse asset URLs from HTML (simple regex covers common hashed assets)
  let html = res.body || '';
  let assetRegex = /(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css|map|woff2|png|jpg|svg))["']/g;
  let assets = [];
  let m;
  while ((m = assetRegex.exec(html)) !== null) {
    assets.push(BASE_URL + m[1]);
  }

  // fallback: you can add known assets if none found
  if (assets.length === 0) {
    assets = [
      `${BASE_URL}/assets/index.js`,
      `${BASE_URL}/assets/index.css`,
    ];
  }

  // 3) optionally force cold-cache by adding a unique query param
  if (COLD_CACHE) {
    const ts = Date.now();
    assets = assets.map(u => u + (u.includes('?') ? '&' : '?') + '_cb=' + ts);
  }

  // 4) fetch assets concurrently to simulate a browser
  let responses = http.batch(assets);

  // 5) check that we got cache headers (X-Cache usually present for CloudFront)
  for (let i = 0; i < responses.length; i++) {
    let r = responses[i];
    check(r, {
      'asset status 200': (res) => res && res.status === 200,
      'asset fast (<2s)': (res) => res && res.timings && res.timings.duration < 2000,
      'asset X-Cache header exists': (res) => !!(res && res.headers && (res.headers['X-Cache'] || res.headers['x-cache'])),
      'asset X-Cache Hit': (res) => {
        const h = (res && res.headers && (res.headers['X-Cache'] || res.headers['x-cache'])) || '';
        return h.toLowerCase().indexOf('hit') !== -1;
      },
    });
  }

  // 6) simulate user think time
  sleep(1);
}
