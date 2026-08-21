const state = {
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  wrong: [],
  bookmarks: new Set(),
  reviewMode: false
};

const $ = id => document.getElementById(id);
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

function start(questions = QUESTIONS) {
  state.questions = shuffle(questions).map(q => {
    const choices = shuffle(q.choices);
    return {...q, choices, answerIndex: choices.indexOf(q.answer)};
  });
  state.index = 0;
  state.score = 0;
  state.answered = false;
  state.wrong = [];
  state.reviewMode = false;
  $("quizScreen").hidden = false;
  $("resultScreen").hidden = true;
  render();
}

function render() {
  const q = state.questions[state.index];
  if (!q) return finish();
  $("current").textContent = state.index + 1;
  $("progress").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
  $("word").textContent = q.word;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("nextBtn").hidden = true;
  state.answered = false;
  $("bookmark").textContent = state.bookmarks.has(q.word) ? "★" : "☆";
  $("bookmark").classList.toggle("active", state.bookmarks.has(q.word));

  const choices = $("choices");
  choices.innerHTML = "";
  q.choices.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.innerHTML = `<span class="num">${i + 1}</span>${text}`;
    btn.addEventListener("click", () => answer(i));
    choices.appendChild(btn);
  });
}

function answer(selected) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.index];
  const buttons = [...document.querySelectorAll(".choice")];
  buttons.forEach((b, i) => {
    b.classList.add("disabled");
    b.disabled = true;
    if (i === q.answerIndex) b.classList.add("correct");
    if (i === selected && i !== q.answerIndex) b.classList.add("wrong");
  });

  if (selected === q.answerIndex) {
    state.score++;
    $("feedback").textContent = "✓ 正解！ " + q.answer;
    $("feedback").className = "feedback good";
  } else {
    state.wrong.push(q);
    $("feedback").textContent = "✕ 不正解。正解は「" + q.answer + "」";
    $("feedback").className = "feedback bad";
  }
  $("nextBtn").hidden = false;
  $("nextBtn").textContent = state.index === state.questions.length - 1 ? "結果を見る" : "次の問題 →";
}

$("nextBtn").addEventListener("click", () => {
  state.index++;
  render();
});
$("bookmark").addEventListener("click", () => {
  const word = state.questions[state.index].word;
  if (state.bookmarks.has(word)) state.bookmarks.delete(word);
  else state.bookmarks.add(word);
  $("bookmark").textContent = state.bookmarks.has(word) ? "★" : "☆";
  $("bookmark").classList.toggle("active", state.bookmarks.has(word));
});
$("retryBtn").addEventListener("click", () => start());
$("reviewBtn").addEventListener("click", () => {
  if (!state.wrong.length) return;
  start(state.wrong);
});
$("closeBtn").addEventListener("click", () => {
  if (confirm("クイズを終了しますか？")) location.reload();
});
$("menuBtn").addEventListener("click", () => {
  alert("50問をランダム出題します。☆を押すと問題を記録できます。");
});

function finish() {
  $("quizScreen").hidden = true;
  $("resultScreen").hidden = false;
  $("score").textContent = `${state.score} / ${state.questions.length}`;
  const rate = state.score / state.questions.length;
  $("rank").textContent =
    rate === 1 ? "🏆 完全制覇！" :
    rate >= .8 ? "🔥 上級登山家レベル" :
    rate >= .6 ? "⛰️ もう一歩！" :
    "📚 復習して再挑戦！";
  $("resultText").textContent =
    state.wrong.length
      ? `あとで「間違えた問題を復習」から ${state.wrong.length} 問をやり直せます。`
      : "すべて正解しました！";
  $("reviewBtn").hidden = state.wrong.length === 0;
}

start();
