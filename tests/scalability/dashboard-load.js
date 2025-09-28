import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const EMAIL = __ENV.TEST_USER_EMAIL || 'mositi';
const PASSWORD = __ENV.TEST_USER_PASSWORD || 'Katlego@123';

export const options = {
  // keep short iterations; we'll control VUs via CLI
};

function extractFirstCookie(res) {
  if (!res || !res.cookies) return '';
  for (const name in res.cookies) {
    if (res.cookies[name] && res.cookies[name].length > 0) {
      return `${name}=${res.cookies[name][0].value}`;
    }
  }
  return '';
}

export default function () {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

  // 1) login (get auth cookie)
  const payload = JSON.stringify({ email: EMAIL, password: PASSWORD });
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, payload, { headers });
  check(loginRes, { 'login status 200': (r) => r.status === 200 || r.status === 201 || r.status === 204 });

  const cookie = extractFirstCookie(loginRes);
  const authHeaders = cookie ? { Accept: 'application/json', Cookie: cookie } : { Accept: 'application/json' };

  // 2) dashboard user card
  const card = http.get(`${BASE_URL}/api/user/me/card`, { headers: authHeaders });
  check(card, { 'card 200': (r) => r.status === 200 });

  // 3) monthly prompt counts
  const monthly = http.get(`${BASE_URL}/api/dashboard/monthly-prompt-counts`, { headers: authHeaders });
  check(monthly, { 'monthly 200': (r) => r.status === 200 });

  // 4) category breakdown
  const cat = http.get(`${BASE_URL}/api/dashboard/category-breakdown`, { headers: authHeaders });
  check(cat, { 'category 200': (r) => r.status === 200 });

  // 5) dashboard main
  const dash = http.get(`${BASE_URL}/api/dashboard`, { headers: authHeaders });
  check(dash, { 'dashboard 200': (r) => r.status === 200 });

  // 6) badges
  const badges = http.get(`${BASE_URL}/api/badges/me`, { headers: authHeaders });
  check(badges, { 'badges 200': (r) => r.status === 200 });

  // optional: small sample of store prompt reviews isn't included because IDs vary

  // pace iterations so each VU simulates one user viewing the dashboard occasionally
  sleep(1);
}
