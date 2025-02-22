import pup from "puppeteer";
import { handleCommands } from "./commands.js";
import { setPage } from "./speechSynthesis.js";
import { startSpeechRecognition } from "./speechRecognition.js";

const customArgs = [
  "--use-fake-ui-for-media-stream",
  "--window-size=0,0", // Launch baby window for fun.
  "--window-position=0,0",
];

async function main() {
  const browser = await pup.launch({
    executablePath: process.env["CHROME_PATH"]
      ? process.env["CHROME_PATH"]
      : null,
    headless: true,
    args: customArgs,
    ignoreDefaultArgs: ["--mute-audio"],
  });
  const page = (await browser.pages())[0];
  setPage(page);
  page.on("console", (msg) => {
    const type = msg.type();
    const content = msg.text();
    switch (type) {
      case "log": {
        console.log(content);
        handleCommands(content);
        // speechData.push(content);
        return;
      }
      case "info": {
        console.log(`${type}: ${content}`);
        if (content === "RESTART_SPEECH") {
          startSpeechRecognition(page);
        }
        return;
      }
      default: {
        console.log(`${type}: ${content}`);
        return;
      }
    }
  });
  await startSpeechRecognition(page);
}
main();
