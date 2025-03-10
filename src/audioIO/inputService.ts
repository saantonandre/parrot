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
  eventEmitter.on("SPEECH_END", (e) => {
    page.evaluate((e) => {
      postMessage({ type: "SPEECH_END", data: e });
    }, e);
  });
  page.evaluate(async () => {
    // Take the mic stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };
    let recordingStart = Date.now();
    mediaRecorder.onstart = () => (recordingStart = Date.now());

    addEventListener("message", async (e) => {
      const { data, type } = e.data;
      if (type !== "SPEECH_END") return;
      // Offset from end time

      const stopPromise = new Promise((res) => (mediaRecorder.onstop = res));
      mediaRecorder.stop();
      await stopPromise;

      const speechEndOffset = data;
      const recordingDuration = Date.now() - recordingStart;

      const fileReader = new FileReader();
      const blob = new Blob([...audioChunks]);
      fileReader.readAsDataURL(blob);
      await new Promise((res) => (fileReader.onloadend = res));
      const base64data = String(fileReader.result);
      emitEvent(
        "RECORDER_RESULT",
        base64data,
        recordingDuration - speechEndOffset
      );
      audioChunks.length = 0;
      mediaRecorder.start();
    });

    mediaRecorder.start();
  });
}
