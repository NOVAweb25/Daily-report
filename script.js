const API_BASE = "https://github.com/NOVAweb25/daily-back"; // ← عدليه برابطك في Render

// ✅ تسجيل جديد
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      first_name: regForm.first_name.value,
      last_name: regForm.last_name.value,
      phone: regForm.phone.value,
      password: regForm.password.value,
    };
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    regForm.querySelector("#status").textContent = `✅ تم التسجيل، اسم المستخدم الخاص بك: ${result.username}`;
  });
}

// ✅ تسجيل الدخول
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      username: loginForm.username.value,
      password: loginForm.password.value,
    };
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem("employee_id", result.employee_id);
      window.location.href = "tasks.html";
    } else {
      loginForm.querySelector("#status").textContent = "❌ بيانات غير صحيحة";
    }
  });
}

// ✅ إرسال التقارير
async function sendReport(section, data, total = 0) {
  const employee_id = localStorage.getItem("employee_id");
  const payload = {
    employee_id,
    section,
    data,
    total_cost: total,
  };
  const res = await fetch(`${API_BASE}/reports/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

// ✅ واجهة عرض التقارير للمسؤول
async function loadAdminData() {
  const container = document.getElementById("adminContainer");
  if (!container) return;
  const res = await fetch(`${API_BASE}/reports/weekly-summary`);
  const data = await res.json();

  let html = "<h2>ملخص التقارير الأسبوعي</h2><table><tr><th>الموظف</th><th>عدد المهام</th><th>عدد المصروفات</th><th>المجموع</th></tr>";
  for (const emp in data) {
    const r = data[emp];
    html += `<tr><td>${emp}</td><td>${r.tasks}</td><td>${r.expenses}</td><td>${r.total_cost} ريال</td></tr>`;
  }
  html += "</table>";
  container.innerHTML = html;
}
