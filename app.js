const state = {
  questions: [],
  index: 0,
  score: 0,
  answered: false,
  wrong: [],
  bookmarks: new Set(),
};
const $ = (id) => document.getElementById(id);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
function start(qs = QUESTIONS) {
  state.questions = shuffle(qs).map((q) => {
    const choices = shuffle(q.choices);
    return { ...q, choices, answerIndex: choices.indexOf(q.answer) };
  });
  state.index = 0;
  state.score = 0;
  state.answered = false;
  state.wrong = [];
  $("quizScreen").hidden = false;
  $("resultScreen").hidden = true;
  render();
}
function render() {
  const q = state.questions[state.index];
  if (!q) return finish();
  state.answered = false;
  $("current").textContent = state.index + 1;
  $("progress").style.width =
    ((state.index + 1) / state.questions.length) * 100 + "%";
  $("word").textContent = q.word;
  $("bookmark").textContent = state.bookmarks.has(q.word) ? "★" : "☆";
  $("bookmark").classList.toggle("active", state.bookmarks.has(q.word));
  const choices = $("choices");
  choices.innerHTML = "";
  q.choices.forEach((text, i) => {
    const b = document.createElement("button");
    b.className = "choice";
    b.innerHTML = `<span class="num">${i + 1}</span>${text}`;
    b.onclick = () => answer(i);
    choices.appendChild(b);
  });
}
function answer(selected) {
  if (state.answered) return;
  state.answered = true;
  const q = state.questions[state.index],
    buttons = [...document.querySelectorAll(".choice")];
  buttons.forEach((b, i) => {
    b.classList.add("disabled");
    b.disabled = true;
    if (i === q.answerIndex) b.classList.add("correct");
    if (i === selected && i !== q.answerIndex) b.classList.add("wrong");
  });
  if (selected === q.answerIndex) {
    state.score++;
    setTimeout(() => {
      state.index++;
      render();
    }, 120);
  } else {
    state.wrong.push(q);
    setTimeout(() => {
      state.index++;
      render();
    }, 1400);
  }
}
function finish() {
  $("quizScreen").hidden = true;
  $("resultScreen").hidden = false;
  $("score").textContent = `${state.score} / ${state.questions.length}`;
  const r = state.score / state.questions.length;
  $("rank").textContent =
    r === 1
      ? "🏆 完全制覇！"
      : r >= 0.8
        ? "🔥 上級登山家レベル"
        : r >= 0.6
          ? "⛰️ もう一歩！"
          : "📚 復習して再挑戦！";
  $("resultText").textContent = state.wrong.length
    ? `あとで「間違えた問題を復習」から ${state.wrong.length} 問をやり直せます。`
    : "すべて正解しました！";
  $("reviewBtn").hidden = !state.wrong.length;
}
$("bookmark").onclick = () => {
  const w = state.questions[state.index].word;
  state.bookmarks.has(w) ? state.bookmarks.delete(w) : state.bookmarks.add(w);
  render();
};
$("retryBtn").onclick = () => start();
$("reviewBtn").onclick = () => start(state.wrong);
$("closeBtn").onclick = () => {
  if (confirm("クイズを終了しますか？")) location.reload();
};
$("menuBtn").onclick = () =>
  alert("50問をランダム出題します。☆を押すと問題を記録できます。");
start();
