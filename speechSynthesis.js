import { Page } from "puppeteer";

/** @type {Page|undefined} */
let page = undefined;
/** @param {Page} _page */
export const setPage = (_page) => (page = _page);

/** @param {string} text */
export const speak = (_text) => {
  if (!page) return console.error("Can't speak, page not loaded yet");
  return page.evaluate(async (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang="en-GB"
    synth.speak(utter);
  }, _text);
};
