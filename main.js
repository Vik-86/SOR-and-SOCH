let currentIndex = 0;
let answers = [];
let testType = "";
let timerInterval;

function startTest(type) {
  testType = type;
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("test-screen").style.display = "block";
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
      confirmFinish();
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

  // ==== НОВЫЙ КОД ДЛЯ УПРАВЛЕНИЯ КНОПКАМИ ====
  const nextBtn = document.querySelector('.next-question-btn');
  const finishBtn = document.querySelector('.finish-test-btn');

  if (currentIndex === questions.length - 1) {
    // Если это последний вопрос
    if (nextBtn) nextBtn.style.display = 'none'; // Скрываем кнопку "Далее"
    if (finishBtn) finishBtn.style.display = 'inline-block'; // Показываем кнопку "Завершить"
  } else {
    // Если это не последний вопрос
    if (nextBtn) nextBtn.style.display = 'inline-block'; // Показываем кнопку "Далее"
    if (finishBtn) finishBtn.style.display = 'none'; // Скрываем кнопку "Завершить"
  }
  // ===========================================
}

function prevQuestion() {
  if (currentIndex > 0) {
    answers[currentIndex] = document.getElementById("q-answer").value;
    currentIndex--;
    showQuestion();
  }
  // Можно добавить логику для скрытия/отображения кнопки "Назад" на первом вопросе,
  // но обычно она просто неактивна или невидима.
}

function confirmFinish() {
  answers[currentIndex] = document.getElementById("q-answer").value;
  document.getElementById("test-screen").style.display = "none";
  document.getElementById("result-screen").style.display = "block";
  clearInterval(timerInterval);
  let total = 0;
  questions.forEach((q, i) => {
    const userAnswer = answers[i]?.trim().toLowerCase();
    const correct = q.correctAnswer?.trim().toLowerCase();
    if (q.type === "КО" && correct && userAnswer === correct) {
      total += q.score;
    }
  });
  document.getElementById("result-fio").textContent = document.getElementById("fio").value;
  document.getElementById("result-klass").textContent = document.getElementById("klass").value;
  document.getElementById("total-score").textContent = total;
  document.getElementById("result-title").textContent = `${testType} завершен`;
}

function showAdminPanel() {
  alert("Раздел администратора в разработке");
}

function nextQuestion() {
  answers[currentIndex] = document.getElementById("q-answer").value;
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    // Если это был последний вопрос и нажата кнопка "Далее" (которая должна быть скрыта),
    // или если пользователь все равно пытается перейти далее после последнего вопроса
    // можно вызвать confirmFinish() здесь, или оставить поведение, где кнопка "Далее" скрыта.
    // Так как кнопка "Далее" будет скрыта на последнем вопросе, этот 'else' блок станет менее актуальным.
    // alert("Это был последний вопрос."); // Убрал alert, так как кнопка "Далее" будет скрыта.
    confirmFinish(); // Завершаем тест, если пытаемся перейти дальше последнего вопроса
  }
}
