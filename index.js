"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("uv-search-engine");

const startPage = "https://google.com";

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const url = search(address.value, searchEngine.value);
  address.value = "";
  
  showProxy();

  newTab("/tab?page=" + __uv$config.encodeUrl(url));
});

function goHome() {
  closeAllTabs();
  hideProxy();
}

function showProxy() {
  document.getElementById("proxy-div").classList = ["show-proxy-div"];
}

function hideProxy() {
  document.getElementById("proxy-div").classList = ["hide-proxy-div"];
}