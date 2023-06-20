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

  const { numPlayers, maxScore } = getGameMenuFormData();

  toggleGameBoardAndMenu();
};

const handleNewGameButton = () => {
  if (!window.confirm("Are you sure you want to start a new game?")) {
    return;
  }

  toggleGameBoardAndMenu();
};

const getGameMenuFormData = () => {
  const formData = new FormData(g("gameMenu"));
  const numPlayers = Number(formData.get("numPlayers"));
  const maxScore = Number(formData.get("maxScore"));

  return { numPlayers, maxScore };
};
