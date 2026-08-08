const messageInput = document.getElementById("message-input");
const characterCount = document.getElementById("character-count");
const rotorButtons = document.querySelectorAll(".rotor");
const positionDisplays = document.querySelectorAll(".position-readout strong");
const actionButtons = document.querySelectorAll(".action-button");
const resetButton = document.getElementById("reset-button");
const copyButton = document.getElementById("copy-button");
const resultOutput = document.getElementById("result-output");
const feedback = document.getElementById("machine-feedback");
const machineStage = document.querySelector(".machine-stage");
const rotorTypeSelects = document.querySelectorAll(".rotor-select");
const positionSelects = document.querySelectorAll(".position-select");
const resetConfigurationButton = document.getElementById("reset-configuration");
const stateRotorPositions = document.querySelectorAll(".state-rotor-position");
const stateStatus = document.getElementById("machine-state-status");
const stateOperation = document.getElementById("machine-state-operation");
const stateCharacter = document.getElementById("machine-state-character");
const stateProgress = document.getElementById("machine-state-progress");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const clearHistoryButton = document.getElementById("clear-history");

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const historyStorageKey = "cypher-operation-history";
const maxHistoryEntries = 12;
const rotorPositions = [0, 0, 0];
const rotorVisualTurns = [0, 0, 0];
const defaultRotorTypes = ["I", "II", "III"];
const selectedRotorTypes = [...defaultRotorTypes];
const machineState = {
  operation: "IDLE",
  character: "—",
  processed: 0,
  total: 0,
  status: "READY",
};
let machineIsRunning = false;
let operationHistory = [];

/*
 * Each named string is a complete, one-to-one alphabet substitution for one rotor.
 * For example, rotor I maps A to E, B to K, and so on when its window shows A.
 * The positions selected in the UI rotate the alphabet entering and leaving a
 * rotor; they do not change its wiring. This makes every starting-position
 * combination a distinct, reversible configuration.
 */
const rotorWirings = {
  I: "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
  II: "AJDKSIRUXBLHWTMCQGZNPYFVOE",
  III: "BDFHJLCPRTXVZNYEIWGAKMUSQO",
  IV: "ESOVPZJAYQUIRHXLNFTGKDCMWB",
  V: "VZBRGITYUPSDNHLXAWMJQOFECK",
};

const rotorCipher = {
  transform(message, mode, positions) {
    const rotors = selectedRotorTypes.map((rotorType, index) => ({
      wiring: rotorWirings[rotorType],
      position: positions[index],
    }));
    const path = mode === "decrypt" ? [...rotors].reverse() : rotors;

    return [...message]
      .map((character) => this.transformCharacter(character, path, mode))
      .join("");
  },

  transformCharacter(character, rotors, mode) {
    const uppercaseCharacter = character.toUpperCase();
    const characterIndex = alphabet.indexOf(uppercaseCharacter);

    // Only letters travel through the rotors; all other characters pass through unchanged.
    if (characterIndex === -1) return character;

    const transformedIndex = rotors.reduce(
      (index, rotor) => this.passThroughRotor(index, rotor, mode),
      characterIndex,
    );
    const transformedCharacter = alphabet[transformedIndex];
    return character === uppercaseCharacter ? transformedCharacter : transformedCharacter.toLowerCase();
  },

  passThroughRotor(index, rotor, mode) {
    // Shift into the rotor's frame of reference before consulting its wiring.
    const enteredIndex = (index + rotor.position) % alphabet.length;
    let wiredIndex;

    if (mode === "decrypt") {
      // Decryption follows the same wiring backwards, using its inverse lookup.
      wiredIndex = rotor.wiring.indexOf(alphabet[enteredIndex]);
    } else {
      wiredIndex = alphabet.indexOf(rotor.wiring[enteredIndex]);
    }

    // Shift back to the machine's fixed alphabet after leaving the rotor.
    return (wiredIndex - rotor.position + alphabet.length) % alphabet.length;
  },
};

// This boundary lets a future stepping/reflector machine replace rotorCipher without UI changes.
const cipherEngine = {
  transform(message, mode, positions) {
    return rotorCipher.transform(message, mode, positions);
  },
};

function updateCharacterCount() {
  characterCount.textContent = `${messageInput.value.length} / 500`;
}

function getMachineConfiguration() {
  return {
    rotorTypes: [...selectedRotorTypes],
    startingPositions: rotorPositions.map((position) => alphabet[position]),
  };
}

function loadOperationHistory() {
  try {
    const savedHistory = window.localStorage.getItem(historyStorageKey);
    const parsedHistory = JSON.parse(savedHistory);
    if (!Array.isArray(parsedHistory)) return [];

    return parsedHistory
      .filter((entry) => (
        entry
        && typeof entry.operation === "string"
        && typeof entry.input === "string"
        && typeof entry.output === "string"
        && entry.configuration
        && Array.isArray(entry.configuration.rotorTypes)
        && Array.isArray(entry.configuration.startingPositions)
      ))
      .slice(0, maxHistoryEntries);
  } catch {
    // History is optional; the cipher remains usable if browser storage is unavailable.
    return [];
  }
}

function saveOperationHistory() {
  try {
    window.localStorage.setItem(historyStorageKey, JSON.stringify(operationHistory));
  } catch {
    // Keep the current-session history visible if localStorage is blocked or full.
  }
}

function createHistoryText(label, value) {
  const row = document.createElement("p");
  const labelElement = document.createElement("span");
  const valueElement = document.createElement("strong");

  row.className = "history-message";
  labelElement.textContent = label;
  valueElement.textContent = value;
  valueElement.title = value;
  row.append(labelElement, valueElement);
  return row;
}

function renderOperationHistory() {
  historyList.textContent = "";
  historyEmpty.hidden = operationHistory.length > 0;
  clearHistoryButton.disabled = operationHistory.length === 0 || machineIsRunning;

  operationHistory.forEach((entry) => {
    const item = document.createElement("li");
    const heading = document.createElement("div");
    const operation = document.createElement("strong");
    const timestamp = document.createElement("time");
    const configuration = document.createElement("p");
    const recordedTime = new Date(entry.timestamp);

    item.className = "history-item";
    heading.className = "history-item-heading";
    operation.textContent = entry.operation.toUpperCase();
    timestamp.dateTime = entry.timestamp;
    timestamp.textContent = Number.isNaN(recordedTime.getTime())
      ? "UNKNOWN TIME"
      : recordedTime.toLocaleString();
    configuration.className = "history-configuration";
    configuration.textContent = `ROTORS ${entry.configuration.rotorTypes.join("/")} · START ${entry.configuration.startingPositions.join("-")}`;

    heading.append(operation, timestamp);
    item.append(
      heading,
      configuration,
      createHistoryText("IN", entry.input),
      createHistoryText("OUT", entry.output),
    );
    historyList.append(item);
  });
}

function recordOperation(operation, input, output, configuration) {
  operationHistory.unshift({
    timestamp: new Date().toISOString(),
    operation,
    input,
    output,
    configuration,
  });
  operationHistory = operationHistory.slice(0, maxHistoryEntries);
  saveOperationHistory();
  renderOperationHistory();
}

// The display reads rotorPositions directly, so it always mirrors the cipher's live state.
function renderMachineState() {
  stateRotorPositions.forEach((display, index) => {
    display.textContent = alphabet[rotorPositions[index]];
  });
  stateStatus.textContent = machineState.status;
  stateOperation.textContent = machineState.operation;
  stateCharacter.textContent = machineState.character;
  stateProgress.textContent = `${machineState.processed} / ${machineState.total}`;
}

function updateMachineState(changes) {
  Object.assign(machineState, changes);
  renderMachineState();
}

function updateRotorDisplay(rotorIndex) {
  const letter = alphabet[rotorPositions[rotorIndex]];
  const rotorUnit = rotorButtons[rotorIndex].closest(".rotor-unit");

  positionDisplays[rotorIndex].textContent = letter;
  rotorUnit.querySelector(".rotor-window").textContent = letter;
  positionSelects[rotorIndex].value = letter;
  renderMachineState();
}

function updateRotorRotation(rotorIndex) {
  // Keep a continuous turn count so Z → A still rotates forward by one notch.
  const degreesPerStep = 360 / alphabet.length;
  rotorButtons[rotorIndex].style.setProperty(
    "--rotor-angle",
    `${rotorVisualTurns[rotorIndex] * degreesPerStep}deg`,
  );
}

function updateRotorTypeDisplay(rotorIndex) {
  const rotorUnit = rotorButtons[rotorIndex].closest(".rotor-unit");
  const rotorType = selectedRotorTypes[rotorIndex];

  rotorTypeSelects[rotorIndex].value = rotorType;
  rotorUnit.querySelector(".rotor-code").textContent = `TYPE-${rotorType}`;
}

function setRotorPosition(rotorIndex, letter, announce = true) {
  rotorPositions[rotorIndex] = alphabet.indexOf(letter);
  rotorVisualTurns[rotorIndex] = rotorPositions[rotorIndex];
  updateRotorDisplay(rotorIndex);
  updateRotorRotation(rotorIndex);

  if (announce) {
    feedback.textContent = `ROTOR ${rotorIndex + 1} START POSITION SET TO ${letter}`;
  }
}

function advanceRotor(rotorIndex, announce = true) {
  rotorPositions[rotorIndex] = (rotorPositions[rotorIndex] + 1) % alphabet.length;
  rotorVisualTurns[rotorIndex] += 1;
  updateRotorDisplay(rotorIndex);
  updateRotorRotation(rotorIndex);
  if (announce) {
    feedback.textContent = `ROTOR ${rotorIndex + 1} POSITION SET TO ${alphabet[rotorPositions[rotorIndex]]}`;
  }

  return rotorPositions[rotorIndex] === 0;
}

function stepRotors() {
  // Rotor III is the fast rotor. Its full turn carries into II, then into I.
  const steppedRotors = [2];
  const fastRotorWrapped = advanceRotor(2, false);

  if (fastRotorWrapped) {
    steppedRotors.push(1);
    const middleRotorWrapped = advanceRotor(1, false);
    if (middleRotorWrapped) {
      steppedRotors.push(0);
      advanceRotor(0, false);
    }
  }

  steppedRotors.forEach((index) => {
    const rotor = rotorButtons[index];
    rotor.classList.remove("is-stepping");
    // Restart the CSS animation even when the same rotor steps consecutively.
    void rotor.offsetWidth;
    rotor.classList.add("is-stepping");
  });
}

function setMachineRunning(isRunning) {
  machineIsRunning = isRunning;
  machineStage.classList.toggle("is-running", isRunning);
  rotorButtons.forEach((button) => { button.disabled = isRunning; });
  actionButtons.forEach((button) => { button.disabled = isRunning; });
  resetButton.disabled = isRunning;
  resetConfigurationButton.disabled = isRunning;
  clearHistoryButton.disabled = isRunning || operationHistory.length === 0;
  rotorTypeSelects.forEach((select) => { select.disabled = isRunning; });
  positionSelects.forEach((select) => { select.disabled = isRunning; });
  messageInput.readOnly = isRunning;
  messageInput.classList.toggle("is-processing", isRunning);
}

function getStagePoint(element) {
  const stageBounds = machineStage.getBoundingClientRect();
  const bounds = element.getBoundingClientRect();
  return {
    x: bounds.left - stageBounds.left + (bounds.width / 2),
    y: bounds.top - stageBounds.top + (bounds.height / 2),
  };
}

function wait(duration) {
  return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function moveSignal(signal, point, duration) {
  const animation = signal.animate(
    [
      { left: signal.style.left, top: signal.style.top },
      { left: `${point.x}px`, top: `${point.y}px` },
    ],
    { duration, easing: "ease-in-out", fill: "forwards" },
  );

  return animation.finished.then(() => {
    signal.style.left = `${point.x}px`;
    signal.style.top = `${point.y}px`;
  });
}

async function highlightRotor(rotorIndex, duration) {
  const rotor = rotorButtons[rotorIndex];
  rotor.classList.add("is-processing");
  await wait(duration);
  rotor.classList.remove("is-processing");
}

async function animateSignal(inputCharacter, outputCharacter, mode, messageLength, isLetter) {
  const rotorOrder = mode === "decrypt" ? [2, 1, 0] : [0, 1, 2];
  const stageHeight = machineStage.clientHeight / 2;
  const inputPoint = { x: 8, y: stageHeight };
  const outputPoint = { x: machineStage.clientWidth - 8, y: stageHeight };
  const signal = document.createElement("span");
  const moveDuration = messageLength > 80 ? 75 : 180;
  const processingDelay = messageLength > 80 ? 35 : 95;

  signal.className = "signal-pulse is-input";
  signal.textContent = inputCharacter;
  signal.style.left = `${inputPoint.x}px`;
  signal.style.top = `${inputPoint.y}px`;
  machineStage.appendChild(signal);

  try {
    // Pause at the source so the selected input character is easy to identify.
    await wait(processingDelay);

    if (isLetter) {
      for (const rotorIndex of rotorOrder) {
        await moveSignal(signal, getStagePoint(rotorButtons[rotorIndex]), moveDuration);
        await highlightRotor(rotorIndex, processingDelay);
      }
    }

    // The signal changes to the computed character only after it has completed the rotor path.
    signal.classList.remove("is-input");
    signal.classList.add("is-output");
    signal.textContent = outputCharacter;
    await moveSignal(signal, outputPoint, moveDuration);
    await wait(processingDelay);
  } finally {
    signal.remove();
  }
}

function appendOutputCharacter(character) {
  resultOutput.querySelector(".is-latest")?.classList.remove("is-latest");
  const outputCharacter = document.createElement("span");
  outputCharacter.className = "output-character is-latest";
  outputCharacter.textContent = character;
  resultOutput.append(outputCharacter);
}

async function runCipher(mode) {
  if (machineIsRunning) return;
  const message = messageInput.value;

  if (!message.trim()) {
    feedback.textContent = "ENTER A MESSAGE BEFORE STARTING A TRANSMISSION";
    messageInput.focus();
    return;
  }

  setMachineRunning(true);
  resultOutput.textContent = "";
  copyButton.disabled = true;
  const operationConfiguration = getMachineConfiguration();

  try {
    let inputOffset = 0;
    let output = "";
    const characters = [...message];
    const operation = mode === "encrypt" ? "ENCRYPTING" : "DECRYPTING";
    updateMachineState({ operation, character: "—", processed: 0, total: characters.length, status: "RUNNING" });

    for (const [index, character] of characters.entries()) {
      const isLetter = alphabet.includes(character.toUpperCase());
      const transformedCharacter = cipherEngine.transform(character, mode, rotorPositions);

      feedback.textContent = `${mode.toUpperCase()} — CHARACTER ${index + 1} OF ${[...message].length}`;
      updateMachineState({ character, processed: index });
      // Highlight the exact source character before it enters the matching cipher state.
      messageInput.focus({ preventScroll: true });
      messageInput.setSelectionRange(inputOffset, inputOffset + character.length);
      // The signal uses the same rotor positions that transform this exact character.
      await animateSignal(character, transformedCharacter, mode, message.length, isLetter);

      appendOutputCharacter(transformedCharacter);
      output += transformedCharacter;

      // Advance only after the character has passed the configured rotor path.
      if (isLetter) stepRotors();
      updateMachineState({ processed: index + 1 });
      inputOffset += character.length;
    }

    messageInput.setSelectionRange(message.length, message.length);
    copyButton.disabled = false;
    recordOperation(mode, message, output, operationConfiguration);
    updateMachineState({ operation: "IDLE", character: "—", status: `${mode.toUpperCase()} COMPLETE` });
    feedback.textContent = `${mode.toUpperCase()} COMPLETE — ROTORS ${rotorPositions
      .map((position) => alphabet[position])
      .join("-")}`;
  } finally {
    setMachineRunning(false);
  }
}

function resetMachine() {
  if (machineIsRunning) return;
  messageInput.value = "";
  rotorPositions.forEach((_, index) => setRotorPosition(index, "A", false));
  updateCharacterCount();
  resultOutput.innerHTML = '<span class="result-placeholder">Awaiting a message transmission.</span>';
  feedback.textContent = "MACHINE RESET — ENGINE IDLE";
  updateMachineState({ operation: "IDLE", character: "—", processed: 0, total: 0, status: "READY" });
  copyButton.disabled = true;
}

function resetConfiguration() {
  if (machineIsRunning) return;

  selectedRotorTypes.splice(0, selectedRotorTypes.length, ...defaultRotorTypes);
  rotorPositions.forEach((_, index) => {
    setRotorPosition(index, "A", false);
    updateRotorTypeDisplay(index);
  });
  feedback.textContent = "CONFIGURATION RESET — I / II / III AT A-A-A";
  updateMachineState({ operation: "IDLE", character: "—", processed: 0, total: 0, status: "READY" });
}

function populateConfigurationControls() {
  rotorTypeSelects.forEach((select, rotorIndex) => {
    Object.keys(rotorWirings).forEach((rotorType) => {
      const option = new Option(`ROTOR ${rotorType}`, rotorType);
      select.add(option);
    });
    updateRotorTypeDisplay(rotorIndex);
  });

  positionSelects.forEach((select, rotorIndex) => {
    [...alphabet].forEach((letter) => {
      const option = new Option(letter, letter);
      select.add(option);
    });
    updateRotorDisplay(rotorIndex);
  });
}

async function copyResult() {
  const result = resultOutput.textContent;
  if (!result || resultOutput.querySelector(".result-placeholder")) return;

  await navigator.clipboard.writeText(result);
  copyButton.textContent = "COPIED";
  setTimeout(() => { copyButton.textContent = "COPY RESULT"; }, 1500);
}

messageInput.addEventListener("input", updateCharacterCount);
rotorButtons.forEach((button, index) => button.addEventListener("click", () => advanceRotor(index)));
actionButtons.forEach((button) => button.addEventListener("click", () => runCipher(button.dataset.mode)));
resetButton.addEventListener("click", resetMachine);
rotorTypeSelects.forEach((select, index) => select.addEventListener("change", () => {
  selectedRotorTypes[index] = select.value;
  updateRotorTypeDisplay(index);
  feedback.textContent = `ROTOR ${index + 1} TYPE SET TO ${select.value}`;
}));
positionSelects.forEach((select, index) => select.addEventListener("change", () => {
  setRotorPosition(index, select.value);
}));
resetConfigurationButton.addEventListener("click", resetConfiguration);
clearHistoryButton.addEventListener("click", () => {
  operationHistory = [];
  try {
    window.localStorage.removeItem(historyStorageKey);
  } catch {
    // The in-memory list is still cleared if browser storage is unavailable.
  }
  renderOperationHistory();
});
copyButton.addEventListener("click", copyResult);
populateConfigurationControls();
renderMachineState();
operationHistory = loadOperationHistory();
renderOperationHistory();
