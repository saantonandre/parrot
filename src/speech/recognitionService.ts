import { type Page } from "puppeteer";
import { emitEvent } from "../main.ts";

export function recognitionService(page: Page) {
  page.evaluate(async () => {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en";
    type Handlers = {
      [Ev in keyof SpeechRecognitionEventMap]: (
        e: SpeechRecognitionEventMap[Ev]
      ) => void;
    };
    const eventHandlers: Partial<Handlers> = {
      result: (e) => {
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          const res = e.results[i];
          const value = res[0].transcript.trim();
          if (!value) continue;
          console.log(`[${res[0].confidence.toFixed(2)}]: ${value}`);
          emitEvent("SPEECH_END");
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
