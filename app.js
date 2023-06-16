const g = (selector) => {
  const el = document.getElementById(selector);
  return el;
};

const toggleDisplayNone = (selector) => {
  const el = g(selector);
  el.classList.toggle("display-none");
};

const toggleGameBoardAndMenu = () => {
  toggleDisplayNone("game-menu");
  toggleDisplayNone("game-board");
};

const handlePlayButton = () => {
  toggleGameBoardAndMenu();
};

const handleNewGameButton = () => {
  toggleGameBoardAndMenu();
};
