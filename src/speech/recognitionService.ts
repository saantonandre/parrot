import { type Page } from "puppeteer";
import { emitEvent } from "../main.ts";

export function recognitionService(page: Page) {
  page.evaluate(async () => {
    const TOLERANCE_MS = 200;
    let speechStart = Date.now();
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en";
    recognition.maxAlternatives = 1;
    type Handlers = {
      [Ev in keyof SpeechRecognitionEventMap]: (
        e: SpeechRecognitionEventMap[Ev]
      ) => void;
    };
    const eventHandlers: Partial<Handlers> = {
      speechstart: () => (speechStart = Date.now() - TOLERANCE_MS),
      result: (e) => {
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const res = e.results[i];
          const value = res[0].transcript.trim();
          if (!value) continue;
          console.log(`[${res[0].confidence.toFixed(2)}]: ${value}`);
          emitEvent("SPEECH_END", Date.now() - speechStart);
          return;
        }
      },
    };
    for (const type in eventHandlers) {
      recognition.addEventListener(type, eventHandlers[type]);
    }
    // Restarts the speech recognition when it abruptly ends
    recognition.addEventListener("end", recognition.start);
    recognition.start();
  });
}
