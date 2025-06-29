let currentIndex = 0;
let answers = [];
let testType = "";
let timerInterval;

function startTest(type) {
  testType = type;
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("test-screen").style.display = "block";
  // Устанавливаем таймер в зависимости от типа теста
  startTimer(type === "SOR" ? 20 : 40);
  showQuestion();
}

function startTimer(minutes) {
  let timeLeft = minutes * 60;
  const timerEl = document.getElementById("timer");
  timerInterval = setInterval(() => {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const sec = String(timeLeft % 60).padStart(2, "0");
    timerEl.textContent = `Осталось: ${min}:${sec}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      confirmFinish(); // Автоматическое завершение по истечении времени
    }
    timeLeft--;
  }, 1000);
}

function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById("q-type").textContent = q.type;
  document.getElementById("q-text").textContent = q.question;
  document.getElementById("q-answer").value = answers[currentIndex] || "";
  document.getElementById("question-score").textContent = "Балл: " + q.score;

  const nextBtn = document.querySelector('.next-question-btn');
  const finishBtn = document.querySelector('.finish-test-btn');

  if (nextBtn && finishBtn) {
    if (currentIndex === questions.length - 1) {
      nextBtn.style.display = 'none';
      finishBtn.style.display = 'inline-block';
    } else {
      nextBtn.style.display = 'inline-block';
      finishBtn.style.display = 'none';
    }
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    answers[currentIndex] = document.getElementById("q-answer").value;
    currentIndex--;
    showQuestion();
  }
}

function nextQuestion() {
  answers[currentIndex] = document.getElementById("q-answer").value;
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    confirmFinish(); // Завершаем тест, если это был последний вопрос
  }
}

// ==== КОРРЕКТИРОВКА: Обновленная confirmFinish для сохранения в localStorage ====
function confirmFinish() {
  answers[currentIndex] = document.getElementById("q-answer").value; // Сохраняем последний ответ

  document.getElementById("test-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  clearInterval(timerInterval);

  let autoScore = 0;
  // Подсчитываем баллы только за КО вопросы автоматически
  questions.forEach((q, i) => {
    const userAnswer = answers[i]?.trim().toLowerCase();
    const correct = q.correctAnswer?.trim().toLowerCase();
    if (q.type === "КО" && correct && userAnswer === correct) {
      autoScore += q.score;
    }
  });

  const studentFio = document.getElementById("fio").value;
  const studentKlass = document.getElementById("klass").value;
  // Генерируем уникальный ID для каждой попытки (ФИО + Класс + метка времени)
  const submissionId = `${studentFio}-${studentKlass}-${Date.now()}`;

  const submissionData = {
    id: submissionId,
    fio: studentFio,
    klass: studentKlass,
    testType: testType,
    answers: answers,
    autoScore: autoScore, // Баллы за вопросы КО
    manualScoresRO: Array(questions.length).fill(0), // Массив для ручных баллов РО, инициализируем нулями
    finalScore: autoScore, // Итоговый балл, пока только авто, обновится после ручной проверки
    isGraded: false, // Флаг, указывающий, была ли ручная проверка РО вопросов
    timestamp: new Date().toISOString()
  };

  let submissions = JSON.parse(localStorage.getItem('testSubmissions')) || [];
  submissions.push(submissionData);
  localStorage.setItem('testSubmissions', JSON.stringify(submissions));

  // Отображаем на экране результатов только то, что знаем сразу (ФИО, Класс, Авто-балл)
  document.getElementById("result-fio").textContent = studentFio;
  document.getElementById("result-klass").textContent = studentKlass;
  document.getElementById("total-score").textContent = autoScore; // Пока показываем только авто-балл
  document.getElementById("result-title").textContent = `${testType} завершен`;
  // Можно добавить примечание, что окончательный балл будет доступен после проверки.
}

// ==== КОРРЕКТИРОВКА: Функции для админ-панели ====
function showAdminPanel() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("test-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "none";
  document.getElementById("admin-panel-screen").style.display = "block"; // Показываем админ-панель
  document.getElementById("admin-submission-details").style.display = "none"; // Скрываем детали конкретной сдачи

  loadAdminSubmissionsList();
}

function loadAdminSubmissionsList() {
  document.getElementById("admin-submissions-list").style.display = "block"; // Показываем список
  document.getElementById("admin-submission-details").style.display = "none"; // Скрываем детали

  let submissions = JSON.parse(localStorage.getItem('testSubmissions')) || [];
  const adminSubmissionsListEl = document.getElementById('admin-submissions-list');
  adminSubmissionsListEl.innerHTML = '<h2>Список сданных тестов</h2>'; // Очищаем и добавляем заголовок

  if (submissions.length === 0) {
    adminSubmissionsListEl.innerHTML += '<p>Нет сданных тестов.</p>';
    return;
  }

  const listUl = document.createElement('ul');
  submissions.forEach((sub, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <p><b>${sub.fio}</b>, Класс: ${sub.klass}, Тип: ${sub.testType}</p>
        <p>Дата сдачи: ${new Date(sub.timestamp).toLocaleString()}</p>
        <p>Авто-баллы (КО): ${sub.autoScore}</p>
        <p>Итоговые баллы: ${sub.finalScore} ${sub.isGraded ? '(Проверено)' : '(Ожидает проверки)'}</p>
        <button onclick="viewSubmission(${index})">Просмотреть / Оценить</button>
    `;
    listUl.appendChild(listItem);
  });
  adminSubmissionsListEl.appendChild(listUl);
}

let currentAdminSubmissionIndex = -1; // Для отслеживания текущей просматриваемой работы

function viewSubmission(index) {
  currentAdminSubmissionIndex = index;
  let submissions = JSON.parse(localStorage.getItem('testSubmissions')) || [];
  const sub = submissions[index];

  document.getElementById("admin-submissions-list").style.display = "none"; // Скрываем список
  document.getElementById("admin-submission-details").style.display = "block"; // Показываем детали

  const detailsDiv = document.getElementById('admin-question-view');
  detailsDiv.innerHTML = `
    <h3>Работа: ${sub.fio}, ${sub.klass} (${sub.testType})</h3>
    <p>Авто-баллы (КО): ${sub.autoScore}</p>
    <div id="questions-for-grading"></div>
    <button onclick="saveManualGrades()">Сохранить оценки</button>
    <button onclick="backToAdminList()">Назад к списку</button>
  `;

  const questionsForGradingDiv = document.getElementById('questions-for-grading');
  questionsForGradingDiv.innerHTML = ''; // Очищаем предыдущие вопросы

  questions.forEach((q, qIndex) => {
    const questionBlock = document.createElement('div');
    questionBlock.classList.add('question-block-admin'); // Для стилизации
    
    let answerContent = sub.answers[qIndex] || 'Нет ответа';
    // Для развернутых ответов можно использовать <pre> или стили для сохранения форматирования
    answerContent = answerContent.replace(/\n/g, '<br>'); // Сохраняем переносы строк для отображения в HTML

    if (q.type === 'РО') {
      questionBlock.innerHTML = `
        <h4>Вопрос ${qIndex + 1} (${q.type}, ${q.score} балла):</h4>
        <p>${q.question.replace(/\n/g, '<br>')}</p>
        <p><b>Ответ ученика:</b></p>
        <div style="white-space: pre-wrap; background: #eee; padding: 10px; border-radius: 5px;">${answerContent}</div>
        <p>Оценка за РО: <input type="number" class="ro-score-input" data-q-index="${qIndex}" min="0" max="${q.score}" value="${sub.manualScoresRO[qIndex] || 0}"></p>
      `;
    } else { // Для КО вопросов
      questionBlock.innerHTML = `
        <h4>Вопрос ${qIndex + 1} (${q.type}, ${q.score} балла):</h4>
        <p>${q.question.replace(/\n/g, '<br>')}</p>
        <p><b>Ответ ученика:</b> ${answerContent}</p>
        <p>Правильный ответ: ${q.correctAnswer}</p>
        <p>Авто-оценка: ${ (sub.answers[qIndex]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) ? q.score : 0 } балла</p>
      `;
    }
    questionsForGradingDiv.appendChild(questionBlock);
  });
}

function saveManualGrades() {
  if (currentAdminSubmissionIndex === -1) return;

  let submissions = JSON.parse(localStorage.getItem('testSubmissions')) || [];
  const sub = submissions[currentAdminSubmissionIndex];

  let newManualScoresRO = Array(questions.length).fill(0); // Сбрасываем и пересчитываем РО баллы
  let totalManualROScore = 0;

  document.querySelectorAll('.ro-score-input').forEach(input => {
    const qIndex = parseInt(input.dataset.qIndex);
    const score = parseInt(input.value) || 0;
    // Проверяем, чтобы введенный балл не превышал максимальный для вопроса
    const maxScore = questions[qIndex].score;
    newManualScoresRO[qIndex] = Math.min(score, maxScore);
    totalManualROScore += newManualScoresRO[qIndex];
  });

  sub.manualScoresRO = newManualScoresRO;
  sub.finalScore = sub.autoScore + totalManualROScore;
  sub.isGraded = true; // Отмечаем как проверенное

  submissions[currentAdminSubmissionIndex] = sub; // Обновляем объект в массиве
  localStorage.setItem('testSubmissions', JSON.stringify(submissions));

  alert('Оценки сохранены!');
  backToAdminList(); // Возвращаемся к списку после сохранения
}

function backToAdminList() {
  currentAdminSubmissionIndex = -1; // Сбрасываем индекс
  loadAdminSubmissionsList(); // Загружаем список заново
}
// ===================================================

function showResultOfGradedTest(submissionId) {
    // Эта функция может быть вызвана из start-screen, если студент хочет просмотреть свои оценки
    // (потребует дополнительного UI для ввода ФИО/Класс и поиска в localStorage)
    let submissions = JSON.parse(localStorage.getItem('testSubmissions')) || [];
    const gradedSubmission = submissions.find(s => s.id === submissionId && s.isGraded);

    if (gradedSubmission) {
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("test-screen").style.display = "none";
        document.getElementById("admin-panel-screen").style.display = "none";
        document.getElementById("result-screen").style.display = "block";

        document.getElementById("result-fio").textContent = gradedSubmission.fio;
        document.getElementById("result-klass").textContent = gradedSubmission.klass;
        document.getElementById("total-score").textContent = gradedSubmission.finalScore;
        document.getElementById("result-title").textContent = `${gradedSubmission.testType} - Проверено!`;
        // Можно добавить детализированный разбор по вопросам, если нужно
    } else {
        alert('Результаты для данной работы пока недоступны или не проверены.');
    }
}

// Функции showAdminPanel, viewSubmission, saveManualGrades, backToAdminList, showResultOfGradedTest
// должны быть доступны глобально, как и остальные функции.
