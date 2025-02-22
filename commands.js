import fs from "fs";
// import {speak} from "./speechSynthesis.js";

const SANDBOX_FOLDER = "./sandbox/";
const commands = {
  "crea file": createFile,
  "elimina": deleteFile,
  "metti dentro": (params) => {
    const [fileName, ...rest] = params.split(" ");
    createFile(fileName.trim(), rest.join(" ").trim());
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
    if (sentence.startsWith(key)) {
      const param = sentence.split(key)[1].trim();
      try{
        commands[key](param);
        // speak("Va bene socio")
      }catch(e){
        // speak("C'è stato un problemino, zi...")
        console.error(e)
      }
    }
  }
};
function createFile(fileName, content = "") {
  fs.writeFileSync(SANDBOX_FOLDER + fileName + ".txt", content);
}
function deleteFile(fileName) {
  fs.rmSync(SANDBOX_FOLDER + fileName + ".txt");
}
