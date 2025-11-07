// ✅ عرض تاريخ اليوم تلقائي
const dateEl = document.getElementById("date");
if (dateEl) {
  const today = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateEl.textContent = `تاريخ اليوم: ${today}`;
}

// ✅ إنشاء صف جديد حسب نوع الصفحة
function autoResize(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function createRow(section) {
  const row = document.createElement("div");
  row.className = "card";

  const fields = {
    tasks: [
      { label: "الوقت", type: "time" },
      { label: "المشروع / الموقع", type: "textarea" },
      { label: "المهمة المنجزة", type: "textarea" },
      { label: "كم أنجزت", type: "textarea" },
    ],
    expenses: [
      { label: "المبلغ المدفوع", type: "textarea" },
      {
        label: "الموقع",
        type: "select",
        options: [
          "البدراني",
          "القبلتين حضرم",
          "القبلتين وقف البري",
          "الوكالة الذهبية",
          "قربان",
          "مصروفات عامة",
          "الفندق السحمان",
          "ينبع",
        ],
      },
      { label: "تفاصيل المدفوعات", type: "textarea" },
      { label: "لمن تم التسديد", type: "textarea" },
    ],
    feedback: [
      { label: "الصعوبات", type: "textarea" },
      { label: "الاحتياجات", type: "textarea" },
      { label: "الاقتراحات", type: "textarea" },
    ],
  };

  fields[section].forEach((f) => {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.textContent = f.label;
    let input;
    if (f.type === "textarea") {
      input = document.createElement("textarea");
      input.oninput = () => autoResize(input);
    } else if (f.type === "select") {
      input = document.createElement("select");
      f.options.forEach((o) => {
        const op = document.createElement("option");
        op.value = o;
        op.textContent = o;
        input.appendChild(op);
      });
    } else {
      input = document.createElement("input");
      input.type = f.type;
    }
    field.append(label, input);
    row.append(field);
  });

  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "حذف";
  del.onclick = () => row.remove();
  row.append(del);

  return row;
}

function addRow(section) {
  document.getElementById(`${section}-body`).appendChild(createRow(section));
}

// ✅ حفظ كل بيانات اليوم في نفس ملف بتاريخ اليوم
function saveToExcel(section, data) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const fileName = `تقرير_${today}.xlsx`;
  let wb;

  // لو الملف موجود في localStorage نحمله من الذاكرة
  const saved = localStorage.getItem(fileName);
  if (saved) {
    const bytes = Uint8Array.from(atob(saved), (c) => c.charCodeAt(0));
    wb = XLSX.read(bytes, { type: "array" });
  } else {
    wb = XLSX.utils.book_new();
  }

  // لو ورقة اليوم موجودة، نحملها ونكمل فيها
  let ws = wb.Sheets["اليوم"];
  let ws_data = [];

  if (ws) {
    ws_data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    ws_data.push([""]); // فراغ بين الأقسام
  } else {
    // أول مرة
    const todayText = new Date().toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    ws_data.push([`📅 تاريخ اليوم: ${todayText}`]);
    ws_data.push([""]);
  }

  // يضيف عنوان القسم حسب الصفحة
  const sectionTitles = {
    tasks: "📋 جدول المهام",
    expenses: "💰 جدول المصروفات",
    feedback: "💭 جدول الصعوبات والاقتراحات",
  };

  ws_data.push([sectionTitles[section]]);
  ws_data.push(Object.keys(data));
  ws_data.push(Object.values(data));

  // تحويل البيانات لورقة وتحديثها
  ws = XLSX.utils.aoa_to_sheet(ws_data);
  wb.Sheets["اليوم"] = ws;
  wb.SheetNames = ["اليوم"];

  // حفظ الملف في التخزين المحلي للجهاز (لأن المتصفح ما يقدر يدمج بين الصفحات)
  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  localStorage.setItem(fileName, wbout);

  // تنزيل الملف مباشرة
  XLSX.writeFile(wb, fileName);
}

// ✅ جمع بيانات الصفحة الحالية
function collectData(section) {
  const inputs = document.querySelectorAll(
    `#${section}-body input, #${section}-body textarea, #${section}-body select`
  );
  const data = {};
  inputs.forEach((i) => {
    const key = i.previousSibling.textContent || "بيان";
    data[key] = i.value || "";
  });
  return data;
}

// ✅ تهيئة الصفحة
function initPage(section) {
  addRow(section);
  const sendBtn = document.querySelector(`#send-${section}`);
  const statusEl = document.getElementById("status");

  sendBtn.addEventListener("click", () => {
    const data = collectData(section);
    statusEl.textContent = "📤 جاري إنشاء التقرير...";
    try {
      saveToExcel(section, data);
      statusEl.textContent = "✅ تم حفظ التقرير بنجاح.";
      statusEl.className = "status success";
      alert("✅ تم حفظ التقرير في ملف Excel بتاريخ اليوم.");
    } catch (e) {
      console.error(e);
      statusEl.textContent = "❌ حدث خطأ أثناء إنشاء الملف.";
      statusEl.className = "status error";
    }
  });
}
