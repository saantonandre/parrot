import { type Page } from "puppeteer";
import { eventEmitter } from "../events";

export const outputService = async (page: Page) => {
  eventEmitter.on("ENCODER_RESULT", (data) => {
    page.evaluate((data) => {
      postMessage({ type: "ENCODER_RESULT", data });
    }, data);
  });
  page.evaluate(async () => {
    addEventListener("message", async (e) => {
      switch (e?.data?.type) {
        case "ENCODER_RESULT": {
          return playAudio(e?.data?.data);
        }
      }
    });
    const audioContext = new AudioContext();
    const playAudio = async (base64: string) => {
      const audioBlob = await fetch(base64).then((res) => res.blob());
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    };
  });
};
