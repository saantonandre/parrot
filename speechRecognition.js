import { Page } from "puppeteer";
/**
 * @param {Page} page
 */
export function startSpeechRecognition(page) {
  return page.evaluate(async () => {
    console.info("Initializing speech recognition...");
    /** @type {SpeechRecognition} */
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "it";
    recognition.addEventListener("result", (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        console.log(event.results[i][0].transcript.trim());
      }
    });
    recognition.addEventListener("end", (event) => {
      console.info("ENDED speech recognition api");
      console.info("RESTART_SPEECH");
    });
    recognition.addEventListener("start", (event) => {
      console.info("STARTED speech recognition api");
    });
    recognition.start();
    console.info("Object:", recognition);
  });
}
