import puppeteer, { LaunchOptions } from "puppeteer";
import { eventEmitter } from "./events";
import chalk from "chalk";
import { launchServer } from "./server";

const launchOptions: LaunchOptions = {
  executablePath: process.env["CHROME_PATH"]
    ? process.env["CHROME_PATH"]
    : undefined,
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--ignore-certificate-errors"],
  ignoreDefaultArgs: ["--mute-audio"],
};

/** Function exposed to the puppeteer page used to exhange data with node */
const emitEvent: typeof eventEmitter.emit = (name, ...args) =>
  eventEmitter.emit(name, ...args);

export const testAudioRecording = async () => {
  const url = await launchServer();
  const browser = await puppeteer.launch(launchOptions);
  const page = (await browser.pages())[0];
  await page.goto(url);
  page.on("console", (evt) => {
    console[evt.type()](chalk.green(...evt.args()));
  });
  page.exposeFunction("emitEvent", emitEvent);

  await page.evaluate(async () => {
    async function recordAndPlayAudio() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      const recordingComplete = new Promise<Blob>((resolve) => {
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => resolve(new Blob(audioChunks));
      });
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 3000);
      const audioBlob = await recordingComplete;
      console.log("Recording complete");
      const audioContext = new AudioContext();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      console.log("Playing recording");
      return new Promise((resolve) => {
        source.onended = () => {
          console.log("Playback complete");
          resolve(true);
        };
      });
    }

    // Run the function
    recordAndPlayAudio();
  });
};
