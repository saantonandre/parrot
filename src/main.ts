import puppeteer, { LaunchOptions } from "puppeteer";
import { eventEmitter } from "./events.ts";
import chalk from "chalk";
import { launchServer } from "./server.ts";
import { recognitionService } from "./speech/recognitionService.ts";
import { inputService } from "./audioIO/inputService.ts";
import { outputService } from "./audioIO/outputService.ts";
import { encoderService } from "./audioIO/encoderService.ts";

const launchOptions: LaunchOptions = {
  executablePath: process.env["CHROME_PATH"]
    ? process.env["CHROME_PATH"]
    : undefined,
  headless: true,
  args: ["--use-fake-ui-for-media-stream", "--ignore-certificate-errors"],
  ignoreDefaultArgs: ["--mute-audio"],
};

/** Function exposed to the puppeteer page used to exhange data with node */
export const emitEvent: typeof eventEmitter.emit = (name, ...args) =>
  eventEmitter.emit(name, ...args);

export async function main() {
  const url = await launchServer();
  const page = await startPuppeteer(url);
  page.on("console", (evt) => {
    console[evt.type()](chalk.green(...evt.args()));
  });
  page.exposeFunction("emitEvent", emitEvent);
  encoderService();
  recognitionService(page);
  eventEmitter.on("SPEECH_END", () => emitEvent("RECORDER_STOP"));
  inputService(page);
  outputService(page);
  return;
}
export async function startPuppeteer(url: string) {
  const browser = await puppeteer.launch(launchOptions);
  const page = (await browser.pages())[0];
  await page.goto(url);
  return page;
}
