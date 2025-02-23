import { Page } from "puppeteer";
/**
 * @param {Page} page
 */
export function startSpeechRecognition(page) {
  return page.evaluate(async () => {
    /** @type {SpeechRecognition} */
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en";
    recognition.addEventListener("result", (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        // if (!res.isFinal) continue;
        const value = res[0].transcript.trim();
        if (!value) continue;
        console.log(value);
        console.warn(`[${res[0].confidence.toFixed(2)}]: ${value}`);
      }
    });
    recognition.addEventListener("end", () => console.info("RESTART_SPEECH"));
    recognition.start();
  });
}
