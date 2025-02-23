import fs from "fs";
import { speak } from "./speechSynthesis.js";

const SANDBOX_FOLDER = "./sandbox/";
let active = true;
const commands = {
  stop: () => {
    console.log("Program: STOP");
    active = false;
  },
  start: () => {
    console.log("Program: START");
    active = true;
  },
};

/**
 *
 * @param {string} _sentence
 */
export const handleCommands = (_sentence) => {
  if (!fs.existsSync(SANDBOX_FOLDER)) {
    fs.mkdirSync(SANDBOX_FOLDER);
  }
  const sentence = _sentence.toLocaleLowerCase().trim();
  for (const key in commands) {
    if (sentence === key) {
      const param = sentence.split(key)[1].trim();
      try {
        commands[key](param);
      } catch (e) {
        console.error(e);
      }
      break;
    }
  }
  active && speak(sentence);
};
