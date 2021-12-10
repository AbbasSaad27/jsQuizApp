"use strict";

// selecting elements
const questContainer = document.querySelector(".question-container");
const startingPage = document.querySelector(".starting-page");
const startBtn = document.querySelector(".btn-start");
const timerShow = document.querySelector(".timer");
const quizEndScreen = document.querySelector(".quiz-end");
const scoreShow = document.querySelector(".score");
const btnHome = document.querySelectorAll(".btn-home");
const btnRetry = document.querySelector(".btn-retry");
const btnHighScore = document.querySelector(".viewHighScoreButton");
const hsTableContainer = document.querySelector(".highScoreTable-container");
const hsTableBody = document.querySelector(".table-body");

// global variables

let allQuests;
let answeredQuestions = 0;
let gamePlaying = false;
let time = 100;
let answers = [];
let timerInterval;
let orderOfQuest;
let correctAns = 0;
let wrongAns;
let score;

// generate order
const generateOrder = function () {
  orderOfQuest = [];
  for (let i = 0; i < allQuests.length; i++) {
    let randNum = Math.floor(Math.random() * 10);
    if (!orderOfQuest.includes(randNum)) {
      orderOfQuest.push(randNum);
    } else {
      i -= 1;
    }
  }
};

// add question to the dom
const addToDom = function () {
  const questData = allQuests[orderOfQuest[answeredQuestions]];
  const quesHtml = generateQuestionHtml(questData);

  questContainer.insertAdjacentHTML("afterbegin", quesHtml);

  attachEvent(questData.answer);
};

// getting all the questions
const startQuiz = async function () {
  const data = await fetch("../questions.json");
  allQuests = await data.json();

  // random order generator
  generateOrder();

  // adding to the dom
  addToDom();
};

// adding event listener func
const attachEvent = function (ans) {
  document.querySelector(".options").addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-option")) {
      checkAns(e.target, ans);
    }
  });
};

const showEnd = function () {
  questContainer.style.display = "none";
  quizEndScreen.style.display = "block";

  scoreShow.innerHTML = `${score}/${allQuests.length * 10}`;
};

// function for checking ans
const checkAns = function (btn, ans) {
  let ansStatus = document.querySelector(".ans-status");
  if (btn.value === ans) {
    ansStatus.classList.add("ans-correct");
    ansStatus.classList.remove("ans-wrong");

    answers.push(1); // 1 is for correct ans
  } else {
    ansStatus.classList.add("ans-wrong");
    ansStatus.classList.remove("ans-correct");

    answers.push(0); // 0 is for wrong ans
    if (time > 10) {
      time -= 10;
      timerShow.innerHTML = time;
    } else {
      time = 0;
    }
  }
  answeredQuestions++;

  let currentQuestion = document.querySelector(".question-block");
  questContainer.removeChild(currentQuestion);

  if (answeredQuestions === 10) {
    clearInterval(timerInterval);
    setLocalStorage();
    showEnd();
    answers = [];
    answeredQuestions = 0;
    gamePlaying = false;
    return;
  }

  addToDom();
};

// for generating the question html block
const generateQuestionHtml = function (quest) {
  // html for options
  let optionsHtml = ``;
  quest.options.forEach((opt, i) => {
    optionsHtml += `
    <li class="option option${i + 1}">
      <button class="btn btn-option" type="button" value="${opt}">
        ${i + 1}. ${opt}
      </button>
    </li>`;
  });

  // full question block html
  const questHtml = `<div class="question-block">
                        <h1 class="question title">${quest.question}</h1>
                        <div class="option-n-nextBtn">
                          <ul class="options">
                            ${optionsHtml}
                          </ul>
                        </div>
                      </div>`;

  return questHtml;
};

const setLocalStorage = function () {
  const prevScores = JSON.parse(localStorage.getItem("quizScore"));
  correctAns = answers.filter((ans) => ans === 1).length;
  wrongAns = allQuests.length - correctAns;
  score = correctAns * 10;

  const date = new Date();
  let hour = date.getHours();
  let minute = date.getMinutes();
  let sec = date.getMinutes();

  const scoreObj = {
    correctAns,
    wrongAns,
    score,
    time: `${hour}:${minute}:${sec}`,
  };
  if (prevScores) {
    prevScores.push(scoreObj);
    localStorage.setItem("quizScore", JSON.stringify(prevScores));
  } else {
    localStorage.setItem("quizScore", JSON.stringify([scoreObj]));
  }
};

const getLocalStorage = function () {
  let allScores = JSON.parse(localStorage.getItem("quizScore"));
  let filteredSc = allScores.sort((a, b) => b.score - a.score);
  return filteredSc;
};

const showHighScores = function () {
  const scoresArr = getLocalStorage();
  hsTableBody.innerHTML = "";

  scoresArr.forEach((sc, i) => {
    const scTr = `<tr>
                    <td>${i + 1}</td>
                    <td>${sc.correctAns}</td>
                    <td>${sc.wrongAns}</td>
                    <td>${sc.score}</td>
                    <td>${sc.time}</td>
                  </tr>`;

    hsTableBody.insertAdjacentHTML("beforeend", scTr);
  });
};

const startTimer = function () {
  time = 100;
  timerShow.innerHTML = time;
  timerInterval = setInterval(function () {
    time--;
    timerShow.innerHTML = time;

    if (time === 0) {
      let currentQuestion = document.querySelector(".question-block");
      questContainer.removeChild(currentQuestion);
      clearInterval(timerInterval);
      gamePlaying = false;
      questContainer.style.display = "none";
      showEnd();
    }
  }, 1000);
};

// start button click handler
startBtn.addEventListener("click", function (e) {
  startingPage.style.display = "none";
  questContainer.style.display = "block";

  startQuiz();

  gamePlaying = true;
  startTimer();
});

btnHome.forEach((btn) =>
  btn.addEventListener("click", function (e) {
    quizEndScreen.style.display = hsTableContainer.style.display = "none";
    startingPage.style.display = "block";
  })
);

btnRetry.addEventListener("click", function (e) {
  quizEndScreen.style.display = "none";
  questContainer.style.display = "block";

  addToDom();
  startTimer();
});

btnHighScore.addEventListener("click", function (e) {
  e.preventDefault();
  if (gamePlaying) {
    alert("please finish the current quiz first");
    return;
  }

  quizEndScreen.style.display =
    questContainer.style.display =
    startingPage.style.display =
      "none";

  hsTableContainer.style.display = "block";
  showHighScores();
});
