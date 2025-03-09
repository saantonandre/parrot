import { type Page } from "puppeteer";
import { eventEmitter } from "../events";
import { emitEvent } from "../main";
// Uncomment to save audio files
// import path from "path";
// import { randomUUID } from "crypto";
// import fs from "fs";

// const SAVE_LOCATION = path.join(path.dirname(__filename), "audios");

// eventEmitter.on("RECORDER_RESULT", async (base64) => {
//   const audioPath = path.join(SAVE_LOCATION, `${randomUUID()}.wav`);
//   const rawData = base64.split(";base64,").pop()!;
//   fs.writeFileSync(audioPath, rawData, { encoding: "base64" });
// });

/** Records audio and saves it locally on "RECORD_STOP" event */
export function inputService(page: Page) {
  eventEmitter.on("RECORDER_STOP", () =>
    page.evaluate(() => {
      postMessage({ type: "RECORDER_STOP" });
    })
  );
  page.evaluate(async () => {
    // Take the mic stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    addEventListener("message", async (e) => {
      switch (e.data.type) {
        case "RECORDER_STOP": {
          return mediaRecorder.stop();
        }
      }
    });
    mediaRecorder.onstop = () => {
      const fileReader = new FileReader();
      const blob = new Blob([...audioChunks]);
      fileReader.readAsDataURL(blob);
      fileReader.onloadend = () => {
        const base64data = String(fileReader.result);
        emitEvent("RECORDER_RESULT", base64data);
      };
      audioChunks.length = 0;
      mediaRecorder.start();
    };
    mediaRecorder.start();
  });
}
