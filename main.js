let current = 0;
let timerInterval;
let seconds = 0;
let totalScore = 0;
let currentMode = "";
let answers = [];
let testSubmitted = false;

function startTest(mode) {
  const fioInput = document.getElementById("fio");
  const klassInput = document.getElementById("klass");

  if (!fioInput.value.trim()) {
    alert("Введите ФИО");
    return;
  }
  if (!klassInput.value.trim()) {
    alert("Введите класс");
    return;
  }

  currentMode = mode;
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("test-screen").style.display = "block";

  seconds = mode === "SOR" ? 20 * 60 : 45 * 60;
  updateTimer();
  timerInterval = setInterval(() => {
    seconds--;
    updateTimer();
    if (seconds <= 0) {
      clearInterval(timerInterval);
      finishTest();
    }
  }, 1000);

  renderQuestion();
}

function updateTimer() {
  const min = Math.floor(seconds / 60);
  const sec = ("0" + (seconds % 60)).slice(-2);
  document.getElementById("timer").innerText = `Осталось: ${min}:${sec}`;
}

function renderQuestion() {
  const q = questions[current];
  document.getElementById("q-type").innerText = q.type;
  document.getElementById("q-text").innerText = q.question;
  document.getElementById("q-options").innerHTML = "";
  document.getElementById("q-answer").style.display = "block";
  document.getElementById("q-answer").value = "";
  document.getElementById("question-score").innerText = `Балл: ${q.score}`;
}

function nextQuestion() {
  const q = questions[current];
  const written = document.getElementById("q-answer").value;
  answers.push(`${q.question}\nОтвет: ${written}`);

  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    finishTest();
  }
}

function prevQuestion() {
  if (current > 0) {
    current--;
    renderQuestion();
  }
}

function confirmFinish() {
  if (confirm("Вы точно хотите завершить тест?")) {
    finishTest();
  }
}

function finishTest() {
  if (testSubmitted) return;
  testSubmitted = true;
  clearInterval(timerInterval);

  const q = questions[current];
  const written = document.getElementById("q-answer").value;
  answers.push(`${q.question}\nОтвет: ${written}`);

  document.getElementById("test-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  document.getElementById("result-fio").innerText = document.getElementById("fio").value;
  document.getElementById("result-klass").innerText = document.getElementById("klass").value;
  document.getElementById("total-score").innerText = totalScore;
  document.getElementById("result-title").innerText = currentMode === "SOR" ? "СОР завершен" : "СОЧ завершен";

  saveResultLocally();
}

function saveResultLocally() {
  const result = {
    fio: document.getElementById("fio").value,
    klass: document.getElementById("klass").value,
    mode: currentMode,
    score: totalScore,
    answers: answers,
    timestamp: new Date().toISOString()
  };
  const existing = JSON.parse(localStorage.getItem("biology_results") || "[]");
  existing.push(result);
  localStorage.setItem("biology_results", JSON.stringify(existing));
}

function showAdminPanel() {
  const pass = prompt("Введите пароль администратора:");
  if (pass !== "admin123") return;
  const results = JSON.parse(localStorage.getItem("biology_results") || "[]");
  let html = `<h2>Результаты</h2>
    <table border="1" cellpadding="5">
      <tr><th>ФИО</th><th>Класс</th><th>Тип</th><th>Дата</th><th>Ответы</th></tr>
      ${results.map(r => `
        <tr>
          <td>${r.fio}</td>
          <td>${r.klass}</td>
          <td>${r.mode}</td>
          <td>${new Date(r.timestamp).toLocaleString()}</td>
          <td>${r.answers.map(ans => `<div>${ans.replace(/\n/g, "<br>")}</div>`).join("<hr>")}</td>
        </tr>
      `).join("")}
    </table>`;
  const w = window.open();
  w.document.write(`<html><head><title>Админ-панель</title></head><body>${html}</body></html>`);
}
