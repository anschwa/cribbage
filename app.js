// app.js

const g = (selector) => {
  const el = document.getElementById(selector);
  return el;
};

const toggleDisplayNone = (selector) => {
  const el = g(selector);
  el.classList.toggle("display-none");
};

const toggleGameBoardAndMenu = () => {
  toggleDisplayNone("gameMenu");
  toggleDisplayNone("gameBoard");
  toggleDisplayNone("newGameButton");
};

const handlePlayButton = (event) => {
  event.preventDefault();

  const { numTracks, maxScore } = getGameMenuFormData(event.target);

  const gameProgress = g("gameProgress");
  const gameScores = g("gameScores");

  const progressTmpl = g("progressTmpl");
  const scoreTmpl = g("scoreTmpl");

  for (let i = 0; i < numTracks; i++) {
    const trackId = `track-${i+1}`;
    const trackName = `Track ${i+1}`;
    const accentName = `accent-${i+1}`;

    const progress = progressTmpl.content.cloneNode(true);
    progress.querySelector(".track-name").textContent = trackName;

    progress.querySelector("progress").id = trackId;
    progress.querySelector("progress").classList.add(accentName);
    progress.querySelector("progress").max = maxScore;

    gameProgress.appendChild(progress);

    const score = scoreTmpl.content.cloneNode(true);
    score.querySelector('input[type="hidden"]').value = trackId;
    score.querySelector("legend").textContent = trackName;
    score.querySelector('input[type="range"]').classList.add(accentName);

    gameScores.appendChild(score);
  }

  g("maxScore").textContent = maxScore;

  toggleGameBoardAndMenu();
};

const handleNewGameButton = () => {
  if (!window.confirm("New game?")) {
    return;
  }

  const gameProgress = g("gameProgress");
  gameProgress.textContent = "";

  const gameScores = g("gameScores");
  gameScores.textContent = "";

  toggleGameBoardAndMenu();
};

const getGameMenuFormData = (gameMenuForm) => {
  const formData = new FormData(gameMenuForm);
  const numTracks = Number(formData.get("numTracks"));
  const maxScore = Number(formData.get("maxScore"));

  return { numTracks, maxScore };
};

const handleScoreSubmit = (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const nextScore = Number(formData.get("nextScore"));

  const previousScore = form.querySelector(".previous-score");
  previousScore.textContent = nextScore;

  const totalScore = form.querySelector(".total-score");
  const newScore = Number(totalScore.textContent) + Number(nextScore);;
  totalScore.textContent = newScore;

  const progress = g(formData.get("progressId"));
  progress.value = newScore;

  form.querySelector(".next-score").textContent = 0;
  form.querySelector('input[type="range"]').value = 0;

  const pegButton = form.querySelector(".peg-button");
  pegButton.disabled = true;

  const undoButton = form.querySelector(".undo-button");
  undoButton.disabled = false;
};

const handleSlidingScore = (event) => {
  const { target } = event;
  const { value, form } = target;

  const nextScore = form.querySelector(".next-score");
  nextScore.textContent = value;
};

const handleScoreSelected = (event) => {
  const { target } = event;
  const { value, form } = target;

  const pegButton = form.querySelector(".peg-button");
  pegButton.disabled = Number(value) === 0;
};

const handleQuickPegButton = (event) => {
  event.preventDefault();

  const { target } = event;
  const { value, form } = target;

  const slider = form.querySelector('input[type="range"]');
  slider.value = Number(value);

  const nextScore = form.querySelector(".next-score");
  nextScore.textContent = slider.value;

  const pegButton = form.querySelector(".peg-button");
  pegButton.disabled = false;
};

const handleUndoButton = (event) => {
  event.preventDefault();

  if (!window.confirm("Undo score?")) {
    return;
  }
}
