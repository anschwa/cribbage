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

  const { numTracks, maxScore } = getGameMenuFormData();

  const gameProgress = g("gameProgress");
  const gameScores = g("gameScores");

  const progressTmpl = g("progressTmpl");
  const scoreTmpl = g("scoreTmpl");

  for (let i = 0; i < numTracks; i++) {
    const trackName = `Track ${i+1}`;

    const progress = progressTmpl.content.cloneNode(true);
    progress.querySelector(".track-name").textContent = trackName;

    gameProgress.appendChild(progress);

    const score = scoreTmpl.content.cloneNode(true);
    score.querySelector("legend").textContent = trackName;

    gameScores.appendChild(score);
  }

  g("maxScore").textContent = maxScore;

  toggleGameBoardAndMenu();
};

const handleNewGameButton = () => {
  if (!window.confirm("Are you sure you want to start a new game?")) {
    return;
  }

  const gameProgress = g("gameProgress");
  gameProgress.textContent = "";

  const gameScores = g("gameScores");
  gameScores.textContent = "";

  toggleGameBoardAndMenu();
};

const getGameMenuFormData = () => {
  const formData = new FormData(g("gameMenu"));
  const numTracks = Number(formData.get("numTracks"));
  const maxScore = Number(formData.get("maxScore"));

  return { numTracks, maxScore };
};

const handleScoreSubmit = (event) => {
  event.preventDefault();

  console.log(event);
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
