const characterServiceURL = "json/";
//const characterServiceURL = "api/character/";
const characterSheetURL = "https://dndbeyond.com/characters/";

var isChanged;
loadPlayersTable();
isChanged = false;

window.addEventListener("beforeunload", (e) => {
  savePlayersTable();
  if (isChanged && getPlayerIds()) {
    buttonSave.click();
    e.preventDefault();
    return e.returnValue = "You have unsaved changes.";
  }
});

function zoomPage() {
  document.body.style.transform = "scale(" + inputZoom.value + "%)";
}
inputZoom.addEventListener("change", () => { zoomPage(); });
// restore zoom on load
zoomPage();

buttonZoom.addEventListener("click", () => {
  inputZoom.style.display = (inputZoom.style.display == 'initial') ? 'none' : 'initial';
});

buttonNewPlayerAdd.addEventListener("click", inputNewPlayerSubmit);
inputNewPlayer.addEventListener("keyup", (e) => { if (e.key == "Enter") inputNewPlayerSubmit(); });
function inputNewPlayerSubmit() {
  let newPlayerMatch = inputNewPlayer.value.match(/\d+$/);
  if (newPlayerMatch) {
    let newPlayerId = newPlayerMatch[0];
    if (existingPlayerRow = document.getElementById(newPlayerId))
      highlightElement(existingPlayerRow);
    else
      addPlayer(newPlayerId);
    inputNewPlayer.value = "";
  }
}

function addPlayer(playerId, playerList = []) {
  let savedResponse = { 'ok': false, 'status': "" };
  fetch(characterServiceURL + playerId)
  .then((response) => {
    savedResponse.ok = response.ok;
    savedResponse.status = response.status;
    if (response.ok)
      return response.json();
    else
      return response.text();
  }).then((data) => {
    if (! savedResponse.ok) {
      errorMessage.innerHTML += "Server Status Error (" + savedResponse.status + ") during addPlayer(" + playerId + ")<br>";
      errorMessage.style.display = "block";
      throw 'serverError';
    }
    addPlayerRow(playerId, data, playerList);
  }).catch((error) => {
    if (error != 'serverError') {
      errorMessage.innerHTML += "Uhandled Error: " + error + " during addPlayer(" + playerId + ")<br>";
      errorMessage.style.display = "block";
      throw 'unhandledError';
    }
  });
}

function addPlayerRow(playerId, data, playerList) {
  let playerTableRow = createElement("tr");
  playerTableRow.id = playerId;
  playerTableRow.draggable = true;

  let playerNameCell = createCell("");

  let playerNameSpan = createElement("span", getCustomPlayerNames()[playerId] || data.data.name);
  playerNameSpan.classList.add("playerName");
  playerNameSpan.contentEditable = true;
  playerNameSpan.spellcheck = false;

  let playerLevelElement = createElement("sup", get_total_level(data));
  playerLevelElement.title = "Level";

  let playerNameLinkIcon = createElement("img");
  playerNameLinkIcon.src = "external.svg";
  playerNameLinkIcon.alt = "External Link";
  playerNameLinkIcon.width = "10";
  playerNameLinkIcon.height = "10";

  let playerNameLink = createLink("", characterSheetURL + playerId, playerId);
  playerNameLink.title = data.data.name + "'s DDB Character Sheet";
  playerNameLink.appendChild(playerNameLinkIcon);

  let playerNameLinkSup = createElement("sup");
  playerNameLinkSup.appendChild(playerNameLink);

  playerNameCell.appendChild(playerNameSpan);
  playerNameCell.appendChild(playerLevelElement);
  playerNameCell.appendChild(playerNameLinkSup);
  playerTableRow.appendChild(playerNameCell);

  playerTableRow.appendChild(createCell(get_hp(data)));
  playerTableRow.appendChild(createCell(get_sense(data, 'perception')));
  playerTableRow.appendChild(createCell(get_sense(data, 'investigation')));
  playerTableRow.appendChild(createCell(get_sense(data, 'insight')));
  playerTableRow.appendChild(createCell(get_ac(data)));

  let playerDeleteCell = createCell("")
  playerDeleteCell.classList.add("buttonCell");
  let playerDeleteButton = createElement("button", "❌");
  playerDeleteButton.title = "remove";

  playerDeleteCell.appendChild(playerDeleteButton);
  playerTableRow.appendChild(playerDeleteCell);
  playersTable.appendChild(playerTableRow);

  isChanged = true;

  // i'm sure there's a better way
  sortPlayers(playerList);
  savePlayersTable();
}

function createElement(elementType, elementText = false) {
  let returnElement = document.createElement(elementType);
  if (elementText)
    returnElement.innerText = elementText;
  return returnElement;
}

function createCell(elementText) {
  return createElement("td", elementText);
}

function createLink(linkText, linkHref, linkTarget = "_blank") {
  let linkElement = createElement("a", linkText);
  linkElement.href = linkHref;
  linkElement.target = linkTarget;
  return linkElement;
}

playersTable.addEventListener("click", (e) => {
  if (e.target && e.target.nodeName == "BUTTON")
    deletePlayerRow(e.target.parentNode.parentNode);
});

playersTable.addEventListener("keydown", (e) => {
  if (e.target && e.target.nodeName == "SPAN" && e.key == "Enter") {
    e.preventDefault();
    e.target.blur();
  }
});

playersTable.addEventListener("focusout", (e) => {
  if (e.target && e.target.nodeName == "SPAN")
    saveCustomPlayerName(e.target.parentNode.parentNode.id, e.target.innerText);
});

function saveCustomPlayerName(playerId, playerName) {
  let customPlayerNames = getCustomPlayerNames();
  customPlayerNames[playerId] = playerName;
  localStorage.setItem('playerNames', JSON.stringify(customPlayerNames));
}
function getCustomPlayerNames() {
  return localStorage.hasOwnProperty('playerNames') ? JSON.parse(localStorage.getItem('playerNames')) : {};
}

function deletePlayerRow(playerRow) {
  playerRow.remove();
  isChanged = true;
  savePlayersTable();
}

// https://www.therogerlab.com/sandbox/pages/how-to-reorder-table-rows-in-javascript?s=0ea4985d74a189e8b7b547976e7192ae.4122809346f6a15e41c9a43f6fcb5fd5
var draggedRow;
playersTable.addEventListener("dragstart", (e) => {
  if (e.target && e.target.nodeName == "TR")
    draggedRow = e.target;
});
playersTable.addEventListener("dragover", (e) => {
  if (e.target && e.target.nodeName == "TD")
    rowDragOver(e.target.parentNode);
});
function rowDragOver(targetRow) {
  let children = Array.from(playersTable.children);
  if(children.indexOf(targetRow) > children.indexOf(draggedRow))
    targetRow.after(draggedRow);
  else
    targetRow.before(draggedRow);
  savePlayersTable();
}

buttonExport.addEventListener("click", (e) => {
  let exportJSON = generateExportJSON();
  exportJSON = JSON.stringify(exportJSON);
  let downloadLink = createLink("", "data:application/json;charset=UTF-8," + encodeURIComponent(exportJSON), "_self");
  downloadLink.setAttribute("download", "party.json");

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
});

function getPlayerIds() {
  let playerIds = [];
  for (playerRow of playersTable.children)
    playerIds.push(playerRow.id);
  return playerIds;
}

buttonReload.addEventListener("click", (e) => {
  let playerIds = getPlayerIds();
  clearPlayersTable();
  playerIds.forEach(playerId => addPlayer(playerId, playerIds));
});

function clearPlayersTable() {
  playersTable.innerHTML = "";
  isChanged = false;
  savePlayersTable();
}

buttonDeleteAllPlayers.addEventListener("click", (e) => {
  if (! getPlayerIds())
    return;
  confirmationDialogTitle.innerText = "Delete All Players";
  confirmationDialog.dataset.caller = "buttonDeleteAllPlayers";
  confirmationDialog.dataset.argument = "";
  confirmationDialog.showModal();
});

confirmationDialog.addEventListener("close", (e) => {
  let confirmationCaller = confirmationDialog.dataset.caller;
  if (confirmationCaller == "buttonDeleteAllPlayers") {
    if (e.target.returnValue == "default")
      clearPlayersTable();
  } else if (confirmationCaller == "buttonDeleteCampaign") {
    if (e.target.returnValue == "default")
      deleteCampaign();
  }
});

buttonSave.addEventListener("click", (e) => {
  campaignsDetails.open = true;
  newCampaignListitem.style.display = "list-item";
  inputNewCampaign.focus();
});

buttonNewCampaignCancel.addEventListener("click",  (e) => { hideNewCampaignInput(); });
inputNewCampaign.addEventListener("keyup", (e) => { if (e.key == "Escape") hideNewCampaignInput(); });
function hideNewCampaignInput() {
  newCampaignListitem.style.display = "none";
  campaignsDetails.open = false;
}

buttonNewCampaignSave.addEventListener("click", (e) => { newCampaignInputSubmit(); });
inputNewCampaign.addEventListener("keyup", (e) => { if (e.key == "Enter") newCampaignInputSubmit(); });
function newCampaignInputSubmit() {
  let inputNewCampaignValue = inputNewCampaign.value.trim();
  if (! inputNewCampaignValue)
    return;
  let campaignsObject = loadCampaigns();

  campaignsObject[inputNewCampaignValue] = getPlayerIds();
  localStorage.setItem('campaigns', JSON.stringify(campaignsObject));

  isChanged = false;
  hideNewCampaignInput();

  campaignsDetails.open = false;
  campaignsDetails.open = true;
};

campaignsList.addEventListener("click", (e) => {
  e.preventDefault();
  if (e.target && e.target.nodeName == "SPAN")
    loadCampaign(e.target.innerText);
  else if (e.target && e.target.nodeName == "BUTTON")
    deleteCampaignButton(e.target.parentNode);
});
function loadCampaign(campaignName) {
  let campaignsObject = loadCampaigns();
  let playersList = campaignsObject[campaignName];
  playersList.forEach(playerId => {
    if (! document.getElementById(playerId))
      addPlayer(playerId, playersList);
  });
}
function deleteCampaignButton(campaignListElement) {
  let campaignName = campaignListElement.querySelector("span").innerText;

  confirmationDialogTitle.innerText = "Delete Campaign '" + campaignName + "'";
  confirmationDialog.dataset.caller = "buttonDeleteCampaign";
  confirmationDialog.dataset.argument = campaignListElement.id;
  confirmationDialog.showModal();
}
function deleteCampaign() {
  let campaignListElementId = confirmationDialog.dataset.argument;
  let campaignListElement = document.getElementById(campaignListElementId);
  let campaignName = campaignListElement.querySelector("span").innerText;
  let campaignsObject = loadCampaigns();
  delete campaignsObject[campaignName];
  campaignListElement.remove();
  localStorage.setItem('campaigns', JSON.stringify(campaignsObject));
};

campaignsDetails.addEventListener("toggle", (e) => {
  if (e.target.open) {
    let campaignsObject = loadCampaigns();
    campaignsList.innerHTML = "";
    for (const campaignName in campaignsObject) {
      let campaignListitem = createElement("li");
      campaignListitem.id = "campaign-" + campaignName;
      let spanCampaignName = createElement("span", campaignName)
      let campaignDeleteButton = createElement("button", "🗑️");
      campaignDeleteButton.title = "delete";
      campaignListitem.appendChild(spanCampaignName);
      campaignListitem.innerHTML += " ";
      campaignListitem.appendChild(campaignDeleteButton);
      campaignsList.appendChild(campaignListitem);
    }
  }
});
function loadCampaigns() {
  return JSON.parse(localStorage.hasOwnProperty('campaigns') ? localStorage.getItem('campaigns') : "{}");
}

function sortPlayers(playersList) {
  let previousPlayerRow = document.getElementById(playersList[0]);
  for (let i = 1; i < playersList.length; i++) {
    nextPlayerRow = document.getElementById(playersList[i]);
    if (previousPlayerRow && nextPlayerRow) {
      playersTable.removeChild(nextPlayerRow);
      previousPlayerRow.after(nextPlayerRow);
      previousPlayerRow = nextPlayerRow;
    }
  }
}

function savePlayersTable() {
  let encodedHTML = "";
  encodedHTML = encodeURIComponent(playersTable.innerHTML);
  encodedHTML = btoa(encodedHTML);
  localStorage.setItem('playersTable', encodedHTML);
}

function loadPlayersTable() {
  let decodedHTML = "";
  decodedHTML = (localStorage.hasOwnProperty('playersTable') ? localStorage.getItem('playersTable') : "");
  decodedHTML = atob(decodedHTML);
  decodedHTML = decodeURIComponent(decodedHTML);
  playersTable.innerHTML = decodedHTML;
}

function highlightElement(element) {
  let intervalCounter = 0;
  let intervalID = setInterval(() => {
    element.classList.toggle("highlight");
    intervalCounter++;
    if (intervalCounter == 6)
      clearInterval(intervalID);
  }, 200);
}

/* column indices */
const PLAYER_NAME = 0;
const PLAYER_HP = 1;
const PLAYER_AC = 5;
function generateExportJSON() {
  let exportJSON = {
    'isAdvanced': true,
    'colsExtraAdvanced': [
      {'name': 'AC'},
      {'name': 'HP'}
    ],
    'playersAdvanced': []
  };

  for (const playerRow of playersTable.children) {
    let playerName = playerRow.children[PLAYER_NAME].querySelector("span").innerText;
    let playerLevel = playerRow.children[PLAYER_NAME].querySelector("sup").innerText;
    let playerAC = playerRow.children[PLAYER_AC].innerText;
    let playerHP = playerRow.children[PLAYER_HP].innerText;

    exportJSON.playersAdvanced.push({
      'name': playerName,
      'level': playerLevel,
      'extras': [
        {'value': playerAC},
        {'value': playerHP}
      ]
    });
  }
  return exportJSON;
}
