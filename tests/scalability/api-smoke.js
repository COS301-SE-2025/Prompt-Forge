import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Use /actuator/health on local Spring Boot dev; production may expose /api/health
const HEALTH_PATH = (__ENV.HEALTH_PATH) || (BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1') ? '/actuator/health' : '/api/health');

// Test credentials: prefer env vars, otherwise fall back to placeholder values you can replace.
// Replace these with a real test user before running large-scale tests.
const TEST_USER_EMAIL = __ENV.TEST_USER_EMAIL || 'mositi';
const TEST_USER_PASSWORD = __ENV.TEST_USER_PASSWORD || 'Katlego@123';

export function setup() {
  // run a single health check at test startup (avoids counting health as a per-iteration failure)
  const healthUrl = `${BASE_URL}${HEALTH_PATH}`;
  const headers = { Accept: 'application/json' };
  const res = http.get(healthUrl, { headers });
  check(res, { 'health 200': (r) => r.status === 200 });
  return { healthStatus: res.status };
}

export default function () {
  // If credentials were provided via env, exercise login. Otherwise skip to avoid generating 401s.
  if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
    // nothing to do in the default iteration when no creds are available
    return;
  }

  const payload = JSON.stringify({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  const login = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });
  check(login, {
    'login success (200|201|204)': (r) => r.status === 200 || r.status === 201 || r.status === 204,
  });
}
