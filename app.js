// app.js

"use strict";

// handleNewGame starts a new cribbage game
const handleNewGame = (event) => {
  event.preventDefault();

  const { target: gameMenuForm } = event;
  const { numTracks, maxScore } = getGameData(gameMenuForm);

  initializeGameState(numTracks, maxScore);

  GameState.setState("playing");
  RenderGame();
};

// handleGameMenu returns to the game menu
const handleGameMenu = (event) => {
  event.preventDefault();

  renderConfirm({
    title: "New Game?",
    onConfirm: () => {
      GameState.setState("menu");
      RenderGame();
    },
  });
};

// GameState stores the global game state.
const GameState = {
  state: null,
  numTracks: null,
  maxScore: null,
  tracks: {},

  setState(state) {
    this.state = state;
  },
  setNumTracks(n) {
    this.numTracks = n;
  },
  setMaxScore(n) {
    this.maxScore = n;
  },
  setTrackData(trackId, data) {
    if (data.total >= this.maxScore) {
      data.peggingDisabled = true;
    }

    this.tracks[trackId] = { ...data };
  },
  getTrackData(trackId) {
    return { ...this.tracks[trackId] };
  },
  getTrackIds() {
    return Object.keys(this.tracks);
  },
  reset() {
    this.state = null;
    this.numTracks = null;
    this.maxScore = null;
    this.tracks = {};
  },
};

const initializeGameState = (numTracks, maxScore) => {
  GameState.reset();
  GameState.setNumTracks(numTracks);
  GameState.setMaxScore(maxScore);

  for (let i = 1; i < numTracks + 1; i++) {
    const trackId = `track-${i}`;

    const trackData = {
      next: 0,
      prev: 0,
      total: 0,
      history: [],
      peggingDisabled: true,
      trackName: `Track ${i}`,
      accentClass: `accent-${i}`,
    };

    GameState.setTrackData(trackId, trackData);
  }
};

const getGameData = (gameMenuForm) => {
  const formData = new FormData(gameMenuForm);
  const numTracks = Number(formData.get("numTracks"));
  const maxScore = Number(formData.get("maxScore"));

  return { numTracks, maxScore };
};

const RenderGame = () => {
  renderGameMenu();
  renderGameBoard();
};

const renderGameMenu = () => {
  const playBtn = g("#playBtn");

  switch (GameState.state) {
  case "menu":
    playBtn.disabled = false;
    showGameMenu();
    return;

  case "playing":
    playBtn.disabled = true;
    hideGameMenu();
    return;

    default:
    window.alert(`Unknown game state: '${GameState.state}'`);
  }
};

const renderGameBoard = () => {
  switch (GameState.state) {
  case "menu":
    hideGameBoard();
    g("#gameProgress").textContent = "";
    g("#gameTracks").textContent = "";
    return;

  case "playing":
    g("#gameMaxScore").textContent = GameState.maxScore;

    GameState.getTrackIds().forEach((trackId) => {
      renderTrackProgress(trackId);
      renderTrackScore(trackId);
    });

    showGameBoard();
    return;

    default:
    window.alert(`Unknown game state: '${GameState.state}'`);
  }
};

// renderTrackProgress updates the progress for a trackId if it exists.
// Otherwise, it creates a new empty progress node.
const renderTrackProgress = (trackId) => {
  // Update existing score
  const trackProgress = g("#gameProgress").querySelector(`[data-track-id="${trackId}"]`);
  if (trackProgress) {
    const { total } = GameState.getTrackData(trackId);

    trackProgress.value = total;
    return;
  }

  // Create new progress node
  const tmpl = g("#trackProgressTmpl");
  const node = tmpl.content.cloneNode(true);

  const { trackName, accentClass } = GameState.getTrackData(trackId);
  node.querySelector('[data-name="trackName"]').textContent = trackName;

  const progress = node.querySelector("progress");
  progress.dataset.trackId = trackId;
  progress.max = GameState.maxScore;
  progress.value = 0;
  progress.classList.add(accentClass);

  // Add to DOM
  g("#gameProgress").appendChild(node);
};

// renderTrackScore updates the current track score if it exists.
// Otherwise, it creates a new empty score node.
const renderTrackScore = (trackId) => {
  // Update track score
  const trackScore = g("#gameTracks").querySelector(`[data-track-id="${trackId}"]`);
  if (trackScore) {
    const {
      next,
      prev,
      total,
      history,
      peggingDisabled,
    } = GameState.getTrackData(trackId);

    trackScore.querySelector('[data-name="nextScore"]').textContent = next;
    trackScore.querySelector('[data-name="prevScore"]').textContent = prev;
    trackScore.querySelector('[data-name="totalScore"]').textContent = total;

    const range = trackScore.querySelector('input[type="range"]');
    range.value = next;

    trackScore.querySelector('button[type="submit"]').disabled = peggingDisabled;
    trackScore.querySelector('button[name="undo"]').disabled = (history.length === 0);

    trackScore.querySelectorAll('button[name="quickPeg"]').forEach((btn) => {
      btn.disabled = (next >= range.max);
    });

    return;
  }

  // Create track score node
  const tmpl = g("#trackScoreTmpl");
  const node = tmpl.content.cloneNode(true);

  const form = node.querySelector("form");
  form.dataset.trackId = trackId;

  const { trackName, accentClass } = GameState.getTrackData(trackId);
  node.querySelector('[data-name="trackName"]').textContent = trackName;

  // Handle dragging slider
  const slider = node.querySelector('input[type="range"]');
  slider.classList.add(accentClass);

  slider.addEventListener("input", (event) => {
    const trackData = GameState.getTrackData(trackId);
    trackData.next = Number(event.target.value);

    GameState.setTrackData(trackId, trackData);
    RenderGame();
  });

  // Handle slider selection
  slider.addEventListener("change", (event) => {
    const trackData = GameState.getTrackData(trackId);
    trackData.peggingDisabled = Number(event.target.value) === 0;

    GameState.setTrackData(trackId, trackData);
    RenderGame();
  });

  // Handle form submit
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const nextScore = Number(formData.get("nextScore"));

    const trackData = GameState.getTrackData(trackId);
    const { next, prev, total, trackName } = trackData;

    trackData.history.push({ next, prev, total });
    trackData.next = 0;
    trackData.prev = next;
    trackData.total += nextScore;
    trackData.peggingDisabled = true;

    if (trackData.total >= GameState.maxScore) {
      renderConfirm({
        title: `${trackName} Wins!`,
        confirmText: "New Game",
        onConfirm: () => {
          GameState.setState("menu");
          RenderGame();
        },
      });
    }

    GameState.setTrackData(trackId, trackData);
    RenderGame();
  });

  // Handle undo score
  form.querySelector('button[name="undo"]').addEventListener("click", (event) => {
    event.preventDefault();

    renderConfirm({
      title: "Undo?",
      onConfirm: () => {
        const trackData = GameState.getTrackData(trackId);
        const { next, prev, total } = trackData.history.pop();

        trackData.next = next;
        trackData.prev = prev;
        trackData.total = total;
        trackData.peggingDisabled = false;

        GameState.setTrackData(trackId, trackData);
        RenderGame();
      },
    });
  });

  node.querySelectorAll('button[name="quickPeg"]').forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();

      const { target: { value } } = event;

      const trackData = GameState.getTrackData(trackId);
      trackData.next += Number(value);
      trackData.peggingDisabled = false;

      GameState.setTrackData(trackId, trackData);
      RenderGame();
    });
  });

  // Add to DOM
  g("#gameTracks").appendChild(node);
};

const renderConfirm = (params) => {
  const {
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
  } = params;

  const dialog = g("#confirmDialog");
  const confirm = dialog.querySelector('button[type="submit"]');
  const cancel = dialog.querySelector('button[name="cancel"]');
  const dialogTitle = dialog.querySelector('[data-name="title"]');
  const dialogMessage = dialog.querySelector('[data-name="message"]');

  if (title) {
    dialogTitle.textContent = title;
  }

  if (message) {
    dialogMessage.textContent = message;
  }

  if (confirmText) {
    confirm.textContent = confirmText;
  }

  if (cancelText) {
    cancel.textContent = cancelText;
  }

  // Handle confirm
  confirm.addEventListener("click", onConfirm);

  // Cleanup
  dialog.addEventListener("close", () => {
    dialogTitle.textContent = "";
    dialogMessage.textContent = "";
    confirm.textContent = "OK";
    cancel.textContent = "Cancel"

    confirm.removeEventListener("click", onConfirm);
  });

  // Display dialog
  dialog.showModal();
};

const showGameMenu = () => showElement("#gameMenu");
const hideGameMenu = () => hideElement("#gameMenu");

const showGameBoard = () => {
  showElement("#gameBoard");
  showElement("#newGameBtn");
};

const hideGameBoard = () => {
  hideElement("#gameBoard");
  hideElement("#newGameBtn");
};

const showElement = (selector) => {
  g(selector).classList.remove("display-none");
};

const hideElement = (selector) => {
  g(selector).classList.add("display-none");
};

const g = (selector) => document.querySelector(selector);
