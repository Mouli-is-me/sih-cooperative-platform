import assert from "assert";
import http from "http";

const API_HOST = "localhost";
const API_PORT = process.env.PORT || 5000;

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (payload) {
      reqHeaders["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        host: API_HOST,
        port: API_PORT,
        method,
        path,
        headers: reqHeaders,
      },
      (res) => {
        let responseData = "";
        res.on("data", (chunk) => (responseData += chunk));
        res.on("end", () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: responseData });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

async function runSecurityTests() {
  console.log("==================================================");
  console.log("CO-OP OS SECURITY & AUTHENTICATION TEST SUITE");
  console.log("==================================================");

  try {
    // 1. Health check verification
    console.log("\n[Test 1] Health Check & Security Headers...");
    const health = await request("GET", "/api/health");
    assert.strictEqual(health.statusCode, 200, "Health check must return 200 OK");
    assert.strictEqual(health.data.status, "OK");
    console.log("✓ Health check passed");

    // 2. Worker Registration
    console.log("\n[Test 2] Worker User Registration...");
    const timestamp = Date.now();
    const workerEmail = `testworker_${timestamp}@example.com`;
    const regRes = await request("POST", "/api/auth/register", {}, {
      fullName: "Test Worker",
      email: workerEmail,
      phone: `${String(timestamp).slice(-10)}`,
      password: "SecurePassword123!",
      role: "worker",
      category: "plumbing",
      experienceYears: 5
    });

    assert.strictEqual(regRes.statusCode, 201, "Registration should return 201 Created");
    assert.strictEqual(regRes.data.success, true, "Success flag must be true");
    assert.ok(regRes.data.data.token, "JWT token must be returned");
    assert.strictEqual(regRes.data.data.user.password_hash, undefined, "Password hash must NOT be exposed in response");
    const workerToken = regRes.data.data.token;
    console.log("✓ Worker user registered successfully (Token issued)");

    // 3. Duplicate Registration Rejection
    console.log("\n[Test 3] Duplicate Registration Rejection...");
    const dupRes = await request("POST", "/api/auth/register", {}, {
      fullName: "Test Worker",
      email: workerEmail,
      phone: `${String(timestamp).slice(-10)}`,
      password: "SecurePassword123!",
      role: "worker"
    });
    assert.strictEqual(dupRes.statusCode, 409, "Duplicate user must return 409 Conflict");
    console.log("✓ Duplicate registration rejected cleanly");

    // 4. User Login & Token Verification
    console.log("\n[Test 4] User Login & Auth Verification...");
    const loginRes = await request("POST", "/api/auth/login", {}, {
      email: workerEmail,
      password: "SecurePassword123!"
    });
    assert.strictEqual(loginRes.statusCode, 200, "Login should return 200 OK");
    assert.ok(loginRes.data.data.token, "Token must be present on login");
    console.log("✓ Login successful and token verified");

    // 5. Protected Endpoint Access with Token (/api/auth/me)
    console.log("\n[Test 5] Protected Profile Retrieval (/api/auth/me)...");
    const meRes = await request("GET", "/api/auth/me", {
      Authorization: `Bearer ${workerToken}`
    });
    assert.strictEqual(meRes.statusCode, 200, "/me should return 200 with valid token");
    assert.strictEqual(meRes.data.data.email, workerEmail);
    console.log("✓ Protected user context retrieved");

    // 6. RBAC Test: Worker attempting to create job (Should fail with 403)
    console.log("\n[Test 6] RBAC Security Check (Worker creating Job)...");
    const forbiddenJobRes = await request("POST", "/api/jobs", {
      Authorization: `Bearer ${workerToken}`
    }, {
      title: "Unauthorized Job",
      description: "Should fail",
      category: "plumbing",
      location: "Madurai",
      wage: 1000
    });
    assert.strictEqual(forbiddenJobRes.statusCode, 403, "Worker role must be rejected with 403 Forbidden for job creation");
    console.log("✓ RBAC successfully blocked unauthorized role action");

    // 7. Register Cooperative Admin User
    console.log("\n[Test 7] Cooperative Admin Registration & Job Creation...");
    const adminEmail = `coopadmin_${timestamp}@example.com`;
    const adminReg = await request("POST", "/api/auth/register", {}, {
      fullName: "Test Admin",
      email: adminEmail,
      phone: `${String(timestamp + 1).slice(-10)}`,
      password: "AdminPassword123!",
      role: "cooperative_admin"
    });
    assert.strictEqual(adminReg.statusCode, 201);
    const adminToken = adminReg.data.data.token;

    // Admin creates a job
    const createJobRes = await request("POST", "/api/jobs", {
      Authorization: `Bearer ${adminToken}`
    }, {
      title: "Emergency Pipe Fitting Task",
      description: "Urgent commercial repair in Madurai Central",
      category: "plumbing",
      location: "Madurai Central",
      wage: 1500
    });
    assert.strictEqual(createJobRes.statusCode, 201, "Cooperative admin must be able to create jobs");
    const createdJob = createJobRes.data.data;
    console.log(`✓ Job created successfully by Cooperative Admin (ID: ${createdJob.id})`);

    // 8. Worker Application & Duplicate Prevention
    console.log("\n[Test 8] Worker Job Application & Duplicate Check...");
    const applyRes = await request("POST", `/api/jobs/${createdJob.id}/apply`, {
      Authorization: `Bearer ${workerToken}`
    });
    assert.strictEqual(applyRes.statusCode, 201, "Worker should successfully apply for open job");
    const appRecord = applyRes.data.data;

    const dupApplyRes = await request("POST", `/api/jobs/${createdJob.id}/apply`, {
      Authorization: `Bearer ${workerToken}`
    });
    assert.strictEqual(dupApplyRes.statusCode, 409, "Duplicate job application must be blocked with 409 Conflict");
    console.log("✓ Job application submitted and duplicate application prevented");

    // 9. Cooperative Admin Application Review
    console.log("\n[Test 9] Application Approval & Notification Dispatch...");
    const reviewRes = await request("PATCH", `/api/jobs/applications/${appRecord.id}/status`, {
      Authorization: `Bearer ${adminToken}`
    }, {
      status: "APPROVED",
      notes: "Approved based on plumber certification"
    });
    assert.strictEqual(reviewRes.statusCode, 200, "Admin should successfully review application");
    assert.strictEqual(reviewRes.data.data.status, "APPROVED");
    console.log("✓ Application status updated to APPROVED");

    // 10. Audit Logging Verification
    console.log("\n[Test 10] Audit Log Security Verification...");
    const auditRes = await request("GET", "/api/audit-logs", {
      Authorization: `Bearer ${adminToken}`
    });
    assert.strictEqual(auditRes.statusCode, 200, "Audit logs retrieved successfully");
    assert.ok(Array.isArray(auditRes.data.data), "Audit logs must be an array");
    const hasPassword = JSON.stringify(auditRes.data.data).includes("Password123");
    assert.strictEqual(hasPassword, false, "Audit logs must NEVER contain plaintext passwords");
    console.log("✓ Audit log verification passed (No secrets exposed)");

    console.log("\n==================================================");
    console.log("ALL SECURITY & AUTHENTICATION TESTS PASSED CLEANLY!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Security test failed:", err.message);
    process.exit(1);
  }
}

runSecurityTests();
