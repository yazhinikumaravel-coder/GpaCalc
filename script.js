/* =====================================================================
   GradeCalc AI — script.js
   Pure vanilla JS. No build step, no frameworks.
===================================================================== */

(function () {
  "use strict";

  /* =====================================================================
     1. GRADE SCALES  (marks-range -> grade point / letter)
  ===================================================================== */
  const SCALES = {
    "10pt-anna": [
      { min: 91, max: 100, gp: 10, letter: "O" },
      { min: 81, max: 90,  gp: 9,  letter: "A+" },
      { min: 71, max: 80,  gp: 8,  letter: "A" },
      { min: 61, max: 70,  gp: 7,  letter: "B+" },
      { min: 56, max: 60,  gp: 6,  letter: "B" },
      { min: 50, max: 55,  gp: 5,  letter: "C" },
      { min: 0,  max: 49,  gp: 0,  letter: "U" }
    ],
    "10pt-vtu": [
      { min: 90, max: 100, gp: 10, letter: "O" },
      { min: 80, max: 89,  gp: 9,  letter: "A+" },
      { min: 70, max: 79,  gp: 8,  letter: "A" },
      { min: 60, max: 69,  gp: 7,  letter: "B+" },
      { min: 55, max: 59,  gp: 6,  letter: "B" },
      { min: 50, max: 54,  gp: 5,  letter: "C" },
      { min: 40, max: 49,  gp: 4,  letter: "P" },
      { min: 0,  max: 39,  gp: 0,  letter: "F" }
    ],
    "10pt-jntu": [
      { min: 90, max: 100, gp: 10, letter: "O" },
      { min: 80, max: 89,  gp: 9,  letter: "A+" },
      { min: 70, max: 79,  gp: 8,  letter: "A" },
      { min: 60, max: 69,  gp: 7,  letter: "B+" },
      { min: 50, max: 59,  gp: 6,  letter: "B" },
      { min: 40, max: 49,  gp: 5,  letter: "C" },
      { min: 0,  max: 39,  gp: 0,  letter: "F" }
    ],
    "10pt-generic": [
      { min: 90, max: 100, gp: 10, letter: "O" },
      { min: 80, max: 89,  gp: 9,  letter: "A+" },
      { min: 70, max: 79,  gp: 8,  letter: "A" },
      { min: 60, max: 69,  gp: 7,  letter: "B+" },
      { min: 50, max: 59,  gp: 6,  letter: "B" },
      { min: 40, max: 49,  gp: 5,  letter: "C" },
      { min: 0,  max: 39,  gp: 0,  letter: "F" }
    ]
  };

  /* =====================================================================
     2. UNIVERSITIES  (aliases used for auto-detection)
  ===================================================================== */
  const UNIVERSITIES = {
    anna: {
      name: "Anna University",
      aliases: ["anna university", "anna uni", "au chennai", "annauniv", "chennai anna", "cegc", "anna univ"],
      regulations: {
        "Regulation 2021": { semesters: 8, scale: "10pt-anna" },
        "Regulation 2017": { semesters: 8, scale: "10pt-anna" },
        "Regulation 2013": { semesters: 8, scale: "10pt-anna" }
      },
      percentage: (cgpa) => (cgpa - 0.5) * 10,
      percentLabel: "Percentage = (CGPA − 0.5) × 10"
    },
    vtu: {
      name: "VTU — Visvesvaraya Technological University",
      aliases: ["vtu", "visvesvaraya", "vtu belagavi", "vtu belgaum", "visvesvaraya technological"],
      regulations: {
        "2022 Scheme": { semesters: 8, scale: "10pt-vtu" },
        "2018 Scheme": { semesters: 8, scale: "10pt-vtu" },
        "2015 Scheme": { semesters: 8, scale: "10pt-vtu" }
      },
      percentage: (cgpa) => (cgpa - 0.75) * 10,
      percentLabel: "Percentage = (CGPA − 0.75) × 10"
    },
    jntuh: {
      name: "JNTU Hyderabad",
      aliases: ["jntuh", "jntu hyderabad", "jawaharlal nehru technological university hyderabad"],
      regulations: {
        "R22": { semesters: 8, scale: "10pt-jntu" },
        "R18": { semesters: 8, scale: "10pt-jntu" },
        "R16": { semesters: 8, scale: "10pt-jntu" }
      },
      percentage: (cgpa) => cgpa * 10 - 7.5,
      percentLabel: "Percentage = (CGPA × 10) − 7.5"
    },
    jntuk: {
      name: "JNTU Kakinada",
      aliases: ["jntuk", "jntu kakinada", "jawaharlal nehru technological university kakinada"],
      regulations: {
        "R20": { semesters: 8, scale: "10pt-jntu" },
        "R19": { semesters: 8, scale: "10pt-jntu" },
        "R16": { semesters: 8, scale: "10pt-jntu" }
      },
      percentage: (cgpa) => cgpa * 10 - 7.5,
      percentLabel: "Percentage = (CGPA × 10) − 7.5"
    },
    jntua: {
      name: "JNTU Anantapur",
      aliases: ["jntua", "jntu anantapur", "jawaharlal nehru technological university anantapur"],
      regulations: {
        "R20": { semesters: 8, scale: "10pt-jntu" },
        "R15": { semesters: 8, scale: "10pt-jntu" }
      },
      percentage: (cgpa) => cgpa * 10 - 7.5,
      percentLabel: "Percentage = (CGPA × 10) − 7.5"
    },
    generic: {
      name: "Generic 10-Point Scale",
      aliases: [],
      regulations: {
        "Standard": { semesters: 8, scale: "10pt-generic" }
      },
      percentage: (cgpa) => cgpa * 9.5,
      percentLabel: "Percentage = CGPA × 9.5"
    }
  };

  /* =====================================================================
     3. STATE + PERSISTENCE
  ===================================================================== */
  const STORAGE_KEY = "gradecalc_ai_state_v1";
  const THEME_KEY = "gradecalc_ai_theme";

  let uidCounter = 1;
  const nextId = () => "row" + uidCounter++;

  let state = {
    university: "anna",
    regulation: "Regulation 2021",
    semester: 1,
    entryMode: "marks",
    subjects: [],
    cgpaRows: [],
    result: null,
    history: []
  };

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable — fail silently */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(state, parsed);
      }
    } catch (e) { /* ignore corrupt data */ }
  }

  /* =====================================================================
     4. HELPERS
  ===================================================================== */
  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function currentUniversity() { return UNIVERSITIES[state.university]; }
  function currentRegulation() {
    const uni = currentUniversity();
    return uni.regulations[state.regulation] || Object.values(uni.regulations)[0];
  }
  function currentScaleKey() { return currentRegulation().scale; }
  function currentScale() { return SCALES[currentScaleKey()]; }

  function marksToGrade(marks) {
    const scale = currentScale();
    const m = clamp(Number(marks) || 0, 0, 100);
    for (const row of scale) {
      if (m >= row.min && m <= row.max) return row;
    }
    return scale[scale.length - 1];
  }

  function letterToGrade(letter) {
    const scale = currentScale();
    return scale.find((r) => r.letter === letter) || scale[scale.length - 1];
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* =====================================================================
     5. UNIVERSITY DETECTION
  ===================================================================== */
  function detectUniversity(text) {
    const q = (text || "").toLowerCase().trim();
    if (q.length < 3) return null;
    for (const key in UNIVERSITIES) {
      const uni = UNIVERSITIES[key];
      for (const alias of uni.aliases) {
        if (q.includes(alias)) return key;
      }
    }
    return null;
  }

  /* =====================================================================
     6. UNIVERSITY / REGULATION / SEMESTER SELECTS
  ===================================================================== */
  function populateUniversitySelect() {
    const sel = $("#universitySelect");
    sel.innerHTML = "";
    Object.keys(UNIVERSITIES).forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = UNIVERSITIES[key].name;
      sel.appendChild(opt);
    });
    sel.value = state.university;
  }

  function populateRegulationSelect() {
    const sel = $("#regulationSelect");
    sel.innerHTML = "";
    const uni = currentUniversity();
    Object.keys(uni.regulations).forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key;
      sel.appendChild(opt);
    });
    if (!uni.regulations[state.regulation]) {
      state.regulation = Object.keys(uni.regulations)[0];
    }
    sel.value = state.regulation;
  }

  function populateSemesterSelect() {
    const sel = $("#semesterSelect");
    sel.innerHTML = "";
    const total = currentRegulation().semesters;
    for (let i = 1; i <= total; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = "Semester " + i;
      sel.appendChild(opt);
    }
    if (state.semester > total) state.semester = total;
    sel.value = state.semester;
  }

  function updateGradeScaleNote() {
    const scale = currentScale();
    const parts = scale.map((r) => `${r.letter}=${r.gp}`).join("  ·  ");
    $("#gradeScaleNote").textContent = `Grade scale (${currentUniversity().name}): ${parts}`;
    $("#percentFormulaNote").textContent = currentUniversity().percentLabel;
  }

  function refreshUniversityContext() {
    populateRegulationSelect();
    populateSemesterSelect();
    updateGradeScaleNote();
    renderSubjectsTable();
    saveState();
  }

  /* =====================================================================
     7. SUBJECT ROWS (GPA TAB)
  ===================================================================== */
  function addSubjectRow(prefill) {
    state.subjects.push(Object.assign({
      id: nextId(),
      name: "",
      credits: "",
      value: ""
    }, prefill || {}));
    renderSubjectsTable();
  }

  function removeSubjectRow(id) {
    state.subjects = state.subjects.filter((s) => s.id !== id);
    if (state.subjects.length === 0) addSubjectRow();
    else renderSubjectsTable();
  }

  function computeRowGP(row) {
    if (state.entryMode === "marks") {
      if (row.value === "" || row.value === null) return null;
      return marksToGrade(row.value);
    }
    if (!row.value) return null;
    return letterToGrade(row.value);
  }

  function renderSubjectsTable() {
    const body = $("#subjectsBody");
    body.innerHTML = "";
    state.subjects.forEach((row, idx) => {
      const tr = document.createElement("tr");

      const gradeInfo = computeRowGP(row);
      const gpHtml = gradeInfo
        ? `<span class="gp-pill ${gradeInfo.gp === 0 ? "gp-fail" : ""}">${gradeInfo.letter} · ${gradeInfo.gp}</span>`
        : `<span class="gp-pill gp-fail" style="opacity:.45">—</span>`;

      let inputCell;
      if (state.entryMode === "marks") {
        inputCell = `<input type="number" min="0" max="100" step="1" placeholder="0–100" class="js-value" value="${row.value}">`;
      } else {
        const scale = currentScale();
        inputCell = `<select class="js-value"><option value="">Select grade</option>${scale
          .map((r) => `<option value="${r.letter}" ${row.value === r.letter ? "selected" : ""}>${r.letter} (${r.gp})</option>`)
          .join("")}</select>`;
      }

      tr.innerHTML = `
        <td class="col-idx">${idx + 1}</td>
        <td class="col-name"><input type="text" class="js-name" placeholder="e.g. Data Structures" value="${escapeHtml(row.name)}"></td>
        <td class="col-credits"><input type="number" min="0" max="10" step="0.5" class="js-credits" placeholder="Cr" value="${row.credits}"></td>
        <td class="col-input">${inputCell}</td>
        <td class="col-gp">${gpHtml}</td>
        <td class="col-remove"><button type="button" class="row-remove-btn js-remove" title="Remove subject" aria-label="Remove subject">×</button></td>
      `;

      tr.querySelector(".js-name").addEventListener("input", (e) => { row.name = e.target.value; saveState(); });
      tr.querySelector(".js-credits").addEventListener("input", (e) => { row.credits = e.target.value; saveState(); });
      tr.querySelector(".js-value").addEventListener(state.entryMode === "marks" ? "input" : "change", (e) => {
        row.value = e.target.value;
        renderSubjectsTable();
      });
      tr.querySelector(".js-remove").addEventListener("click", () => removeSubjectRow(row.id));

      body.appendChild(tr);
    });

    updateGpaTotals();
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function updateGpaTotals() {
    let totalCredits = 0;
    state.subjects.forEach((row) => { totalCredits += Number(row.credits) || 0; });
    $("#gpaTotalCredits").textContent = totalCredits.toFixed(1).replace(/\.0$/, "");
  }

  function calculateGPA() {
    let totalCredits = 0;
    let totalPoints = 0;
    let counted = 0;

    for (const row of state.subjects) {
      const credits = Number(row.credits);
      if (!row.name.trim() || !credits) continue;
      const grade = computeRowGP(row);
      if (!grade) continue;
      totalCredits += credits;
      totalPoints += credits * grade.gp;
      counted++;
    }

    if (counted === 0) {
      toast("Add at least one subject with a name, credits and marks/grade.");
      return null;
    }

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    $("#gpaTotalCredits").textContent = totalCredits.toFixed(1).replace(/\.0$/, "");
    const valueEl = $("#gpaResultValue");
    valueEl.textContent = gpa.toFixed(2);
    valueEl.classList.remove("pop");
    void valueEl.offsetWidth;
    valueEl.classList.add("pop");

    saveState();
    return { gpa, totalCredits };
  }

  /* =====================================================================
     8. CGPA ROWS (CGPA TAB)
  ===================================================================== */
  function addCgpaRow(prefill) {
    state.cgpaRows.push(Object.assign({
      id: nextId(),
      sem: state.cgpaRows.length + 1,
      gpa: "",
      credits: ""
    }, prefill || {}));
    renderCgpaTable();
  }

  function removeCgpaRow(id) {
    state.cgpaRows = state.cgpaRows.filter((r) => r.id !== id);
    renderCgpaTable();
  }

  function renderCgpaTable() {
    const body = $("#cgpaBody");
    body.innerHTML = "";
    state.cgpaRows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="col-idx">${idx + 1}</td>
        <td class="col-name"><input type="number" min="0" max="10" step="0.01" class="js-gpa" placeholder="e.g. 8.5" value="${row.gpa}"></td>
        <td class="col-credits"><input type="number" min="0" step="0.5" class="js-scredits" placeholder="optional" value="${row.credits}"></td>
        <td class="col-remove"><button type="button" class="row-remove-btn js-remove" title="Remove semester" aria-label="Remove semester">×</button></td>
      `;
      tr.querySelector(".js-gpa").addEventListener("input", (e) => { row.gpa = e.target.value; saveState(); });
      tr.querySelector(".js-scredits").addEventListener("input", (e) => { row.credits = e.target.value; saveState(); });
      tr.querySelector(".js-remove").addEventListener("click", () => removeCgpaRow(row.id));
      body.appendChild(tr);
    });
    $("#cgpaSemCount").textContent = state.cgpaRows.length;
  }

  function calculateCGPA() {
    const rows = state.cgpaRows.filter((r) => r.gpa !== "" && !isNaN(Number(r.gpa)));
    if (rows.length === 0) {
      toast("Add at least one semester GPA first.");
      return null;
    }

    const allHaveCredits = rows.every((r) => r.credits !== "" && Number(r.credits) > 0);
    let cgpa;
    if (allHaveCredits) {
      const totalCredits = rows.reduce((s, r) => s + Number(r.credits), 0);
      const totalPoints = rows.reduce((s, r) => s + Number(r.credits) * Number(r.gpa), 0);
      cgpa = totalPoints / totalCredits;
    } else {
      cgpa = rows.reduce((s, r) => s + Number(r.gpa), 0) / rows.length;
    }

    const percent = clamp(currentUniversity().percentage(cgpa), 0, 100);

    $("#cgpaResultValue").textContent = cgpa.toFixed(2);
    $("#cgpaResultValue").classList.remove("pop");
    void $("#cgpaResultValue").offsetWidth;
    $("#cgpaResultValue").classList.add("pop");
    $("#cgpaPercentValue").textContent = percent.toFixed(2) + "%";

    saveState();
    return { cgpa, percent };
  }

  /* =====================================================================
     9. RESULTS TAB
  ===================================================================== */
  function sendGpaToResults() {
    const calc = calculateGPA();
    if (!calc) return;

    state.result = state.result || {};
    state.result.subjects = state.subjects
      .filter((r) => r.name.trim() && r.credits)
      .map((r) => {
        const g = computeRowGP(r) || { letter: "—", gp: 0 };
        return { name: r.name, credits: r.credits, value: state.entryMode === "marks" ? r.value : g.letter, letter: g.letter, gp: g.gp };
      });
    state.result.totalCredits = calc.totalCredits;
    state.result.gpa = calc.gpa;
    state.result.university = currentUniversity().name;
    state.result.regulation = state.regulation;

    renderResults();
    pushHistory("GPA", calc.gpa);
    toast("Sent to Results ✓");
  }

  function sendCgpaToResults() {
    const calc = calculateCGPA();
    if (!calc) return;

    state.result = state.result || {};
    state.result.cgpa = calc.cgpa;
    state.result.percent = calc.percent;
    state.result.university = currentUniversity().name;
    state.result.regulation = state.regulation;

    renderResults();
    pushHistory("CGPA", calc.cgpa, calc.percent);
    toast("Sent to Results ✓");
  }

  function renderResults() {
    const r = state.result;
    const body = $("#resultSubjectsBody");

    if (!r || !r.subjects || r.subjects.length === 0) {
      body.innerHTML = `<tr><td colspan="5" class="empty-row">Nothing sent to Results yet. Calculate a GPA or CGPA, then use "Send to Results".</td></tr>`;
    } else {
      body.innerHTML = r.subjects.map((s, i) => `
        <tr>
          <td class="col-idx">${i + 1}</td>
          <td>${escapeHtml(s.name)}</td>
          <td>${s.credits}</td>
          <td>${escapeHtml(String(s.value))}</td>
          <td class="col-gp"><span class="gp-pill ${s.gp === 0 ? "gp-fail" : ""}">${s.letter} · ${s.gp}</span></td>
        </tr>
      `).join("");
    }

    $("#resTotalCredits").textContent = r && r.totalCredits != null ? r.totalCredits : "—";
    $("#resGpa").textContent = r && r.gpa != null ? r.gpa.toFixed(2) : "—";
    $("#resCgpa").textContent = r && r.cgpa != null ? r.cgpa.toFixed(2) : "—";
    $("#resPercent").textContent = r && r.percent != null ? r.percent.toFixed(2) + "%" : "—";

    $("#resultUniLine").textContent = r && r.university ? `${r.university} — ${r.regulation}` : "University — Regulation";
    $("#resultStampText").textContent = r && r.cgpa != null ? "CGPA\n" + r.cgpa.toFixed(2) : r && r.gpa != null ? "GPA\n" + r.gpa.toFixed(2) : "GPA";

    saveState();
  }

  function clearResults() {
    state.result = null;
    renderResults();
    toast("Results cleared");
  }

  /* =====================================================================
     10. HISTORY
  ===================================================================== */
  function pushHistory(type, value, percent) {
    state.history.unshift({
      id: nextId(),
      type,
      value,
      percent: percent || null,
      university: currentUniversity().name,
      regulation: state.regulation,
      date: new Date().toLocaleString()
    });
    state.history = state.history.slice(0, 20);
    renderHistory();
    saveState();
  }

  function renderHistory() {
    const list = $("#historyList");
    if (state.history.length === 0) {
      list.innerHTML = `<p class="history-empty">No saved calculations yet. Results you send are logged here automatically.</p>`;
      return;
    }
    list.innerHTML = state.history.map((h) => `
      <div class="history-item">
        <div>
          <strong>${h.type} ${Number(h.value).toFixed(2)}</strong>${h.percent ? ` · ${h.percent.toFixed(2)}%` : ""}
          <div class="hi-meta">${escapeHtml(h.university)} · ${escapeHtml(h.regulation)} · ${h.date}</div>
        </div>
      </div>
    `).join("");
  }

  /* =====================================================================
     11. EXPORT: PDF / IMAGE / SHARE
  ===================================================================== */
  async function captureResultCanvas() {
    const node = $("#resultCardCapture");
    if (typeof html2canvas === "undefined") {
      toast("Export library still loading — try again in a moment.");
      return null;
    }
    const bg = getComputedStyle(document.body).getPropertyValue("--surface").trim() || "#ffffff";
    return html2canvas(node, { backgroundColor: bg, scale: 2 });
  }

  async function downloadPdf() {
    const canvas = await captureResultCanvas();
    if (!canvas) return;
    if (typeof window.jspdf === "undefined") {
      toast("PDF library still loading — try again in a moment.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    pdf.addImage(imgData, "PNG", (pageWidth - w) / 2, 24, w, h);
    pdf.save("gradecalc-ai-report.pdf");
    toast("PDF downloaded ✓");
  }

  async function downloadImage() {
    const canvas = await captureResultCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gradecalc-ai-report.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Image downloaded ✓");
    }, "image/png");
  }

  async function shareResult() {
    const r = state.result;
    if (!r) { toast("Nothing to share yet."); return; }
    const text = `GradeCalc AI Report\n${r.university || ""} — ${r.regulation || ""}\n` +
      (r.gpa != null ? `GPA: ${r.gpa.toFixed(2)}\n` : "") +
      (r.cgpa != null ? `CGPA: ${r.cgpa.toFixed(2)}\n` : "") +
      (r.percent != null ? `Percentage: ${r.percent.toFixed(2)}%\n` : "");

    if (navigator.share) {
      try {
        await navigator.share({ title: "GradeCalc AI Report", text });
        toast("Shared ✓");
      } catch (e) { /* user cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast("Copied result to clipboard ✓");
    } else {
      toast("Sharing not supported on this browser.");
    }
  }

  /* =====================================================================
     12. AI ASSISTANT
  ===================================================================== */
  function addChatMessage(text, from) {
    const win = $("#chatWindow");
    const div = document.createElement("div");
    div.className = "msg " + (from === "user" ? "msg-user" : "msg-bot");
    div.textContent = text;
    win.appendChild(div);
    win.scrollTop = win.scrollHeight;
  }

  function getBotReply(raw) {
    const q = raw.toLowerCase();

    // university detection intent
    if (q.includes("detect") || q.includes("which university") || q.includes("my university")) {
      const key = detectUniversity(q) || detectUniversity($("#uniSearchInput").value);
      if (key) {
        return `That looks like ${UNIVERSITIES[key].name}. I've selected it in the University field — double check the Regulation dropdown matches your batch.`;
      }
      return `I couldn't confidently match a university from that. Type your college or university's full name in the search box above the calculators, or pick one manually from the University dropdown.`;
    }

    // direct university name mention
    const detected = detectUniversity(q);
    if (detected) {
      const uni = UNIVERSITIES[detected];
      const regs = Object.keys(uni.regulations).join(", ");
      return `${uni.name} uses a 10-point grading scale. Available regulations: ${regs}. ${uni.percentLabel}.`;
    }

    if (q.includes("cgpa") && !q.includes("gpa is") ) {
      return `CGPA (Cumulative GPA) is the credit-weighted average of your GPA across all completed semesters:\nCGPA = Σ(Semester GPA × Semester Credits) / Σ(Semester Credits)\nIf you don't enter credits per semester, I fall back to a simple average of your semester GPAs.`;
    }

    if (q.includes("gpa")) {
      return `GPA (Grade Point Average) for one semester is the credit-weighted average of grade points:\nGPA = Σ(Credits × Grade Point) / Σ(Credits)\nEnter each subject's credits and marks (or grade) in the Semester GPA tab and hit "Calculate GPA".`;
    }

    if (q.includes("percentage") || q.includes("percent")) {
      return `For ${currentUniversity().name}, ${currentUniversity().percentLabel}. Switch the University dropdown to see the formula used by other universities.`;
    }

    if (q.includes("scale") || q.includes("grading system") || q.includes("grade point")) {
      const parts = currentScale().map((r) => `${r.letter} = ${r.gp} (${r.min}-${r.max} marks)`).join("\n");
      return `Grading scale for ${currentUniversity().name}:\n${parts}`;
    }

    if (q.includes("credit")) {
      return `Credits reflect how many hours/weight a subject carries. They're multiplied by your grade point when computing GPA, so a 4-credit subject affects your GPA more than a 1-credit lab.`;
    }

    if (q.includes("arrear") || q.includes("fail") || q.includes("backlog")) {
      return `A subject with grade point 0 (U/F grade) is usually a fail/arrear. It still counts in your total credits attempted for GPA, but you'll need to clear it per your university's revaluation/supplementary rules.`;
    }

    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      return `Hi! I can help you pick the right university/regulation, explain GPA, CGPA and percentage formulas, or walk you through using the calculator. What would you like to know?`;
    }

    if (q.includes("thank")) {
      return `You're welcome — good luck with your semester!`;
    }

    return `I can help with: detecting your university, explaining GPA/CGPA/percentage formulas, and describing grading scales. Try asking "What is CGPA?" or "Detect my university" or type your college name.`;
  }

  function handleChatSubmit(e) {
    e.preventDefault();
    const input = $("#chatInput");
    const text = input.value.trim();
    if (!text) return;
    addChatMessage(text, "user");
    input.value = "";
    setTimeout(() => addChatMessage(getBotReply(text), "bot"), 300);
  }

  /* =====================================================================
     13. TABS
  ===================================================================== */
  function switchTab(tab) {
    $all(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    $all(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + tab));
  }

  /* =====================================================================
     14. THEME
  ===================================================================== */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $("#iconSun").style.display = theme === "dark" ? "none" : "block";
    $("#iconMoon").style.display = theme === "dark" ? "block" : "none";
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initTheme() {
    let theme = "light";
    try {
      theme = localStorage.getItem(THEME_KEY) ||
        (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch (e) {}
    applyTheme(theme);
  }

  /* =====================================================================
     15. INIT
  ===================================================================== */
  function init() {
    loadState();
    initTheme();

    populateUniversitySelect();
    populateRegulationSelect();
    populateSemesterSelect();
    updateGradeScaleNote();

    if (state.subjects.length === 0) addSubjectRow();
    else renderSubjectsTable();

    renderCgpaTable();
    renderResults();
    renderHistory();

    $all(".mode-btn").forEach((btn) => btn.dataset.mode === state.entryMode && btn.classList.add("active"));

    addChatMessage("Hi! I'm the GradeCalc AI assistant. Ask me about GPA, CGPA, percentage formulas, or type your university name and I'll help detect it.", "bot");

    /* ---- event wiring ---- */
    $("#themeToggle").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(cur);
    });

    $all(".tab-btn").forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

    $("#uniSearchInput").addEventListener("input", debounce((e) => {
      const val = e.target.value;
      const key = detectUniversity(val);
      const badge = $("#detectBadge");
      if (key) {
        state.university = key;
        $("#universitySelect").value = key;
        refreshUniversityContext();
        badge.hidden = false;
        $("#detectBadgeText").textContent = `Detected: ${UNIVERSITIES[key].name}`;
      } else if (val.trim().length >= 3) {
        badge.hidden = false;
        $("#detectBadgeText").textContent = `No confident match — please select your university manually below.`;
      } else {
        badge.hidden = true;
      }
    }, 350));

    $("#universitySelect").addEventListener("change", (e) => {
      state.university = e.target.value;
      refreshUniversityContext();
      $("#detectBadge").hidden = true;
    });
    $("#regulationSelect").addEventListener("change", (e) => {
      state.regulation = e.target.value;
      refreshUniversityContext();
    });
    $("#semesterSelect").addEventListener("change", (e) => {
      state.semester = Number(e.target.value);
      saveState();
    });

    $all(".mode-btn").forEach((btn) => btn.addEventListener("click", () => {
      if (btn.dataset.mode === state.entryMode) return;
      $all(".mode-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.entryMode = btn.dataset.mode;
      state.subjects.forEach((r) => (r.value = ""));
      renderSubjectsTable();
      saveState();
      toast("Switched to " + (state.entryMode === "marks" ? "marks" : "grade") + " entry — values reset.");
    }));

    $("#addSubjectBtn").addEventListener("click", () => addSubjectRow());
    $("#calcGpaBtn").addEventListener("click", () => calculateGPA());
    $("#saveSemesterBtn").addEventListener("click", () => {
      const calc = calculateGPA();
      if (!calc) return;
      const existing = state.cgpaRows.find((r) => r.sem === state.semester);
      if (existing) {
        existing.gpa = calc.gpa.toFixed(2);
        existing.credits = calc.totalCredits;
      } else {
        addCgpaRow({ sem: state.semester, gpa: calc.gpa.toFixed(2), credits: calc.totalCredits });
      }
      renderCgpaTable();
      saveState();
      toast(`Semester ${state.semester} GPA saved to CGPA list ✓`);
    });
    $("#sendToResultsBtn").addEventListener("click", sendGpaToResults);

    $("#addSemesterRowBtn").addEventListener("click", () => addCgpaRow());
    $("#calcCgpaBtn").addEventListener("click", () => calculateCGPA());
    $("#sendCgpaToResultsBtn").addEventListener("click", sendCgpaToResults);

    $("#chatForm").addEventListener("submit", handleChatSubmit);
    $all(".chip").forEach((chip) => chip.addEventListener("click", () => {
      $("#chatInput").value = chip.dataset.q;
      handleChatSubmit(new Event("submit", { cancelable: true }));
    }));

    $("#downloadPdfBtn").addEventListener("click", downloadPdf);
    $("#downloadImageBtn").addEventListener("click", downloadImage);
    $("#shareResultBtn").addEventListener("click", shareResult);
    $("#clearResultsBtn").addEventListener("click", clearResults);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
