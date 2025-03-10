import { PassThrough, Readable } from "stream";
import { eventEmitter } from "../events";
import ffmpeg from "fluent-ffmpeg";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

const SAVE_LOCATION = path.join(path.dirname(__filename), "audios");

export const encoderService = () => {
  eventEmitter.on("RECORDER_RESULT", async (base64,speechStartMs) => {
    const audioPath = writeBase64(base64);
    const buffers: Buffer[] = [];
    const outputStream = new PassThrough();
    ffmpeg()
      .input(audioPath)
      .setStartTime(speechStartMs/1000)
      .format("wav")
      .on("error", (err) => console.error("FFmpeg Error:", err))
      .pipe(outputStream, { end: true });
    outputStream.on("data", (buf) => {
      buffers.push(buf);
    });
    await new Promise((res) => outputStream.on("end", res));
    const processedBuffer = Buffer.concat(buffers);
    const data = processedBuffer.toString("base64");
    eventEmitter.emit(
      "ENCODER_RESULT",
      "data:application/octet-stream;base64," + data
    );
    fs.rmSync(audioPath);
  });
};

const writeBase64 = (base64: string) => {
  const audioPath = path.join(SAVE_LOCATION, `${randomUUID()}.wav`);
  const rawData = base64.split(";base64,").pop()!;
  const a = fs.writeFileSync(audioPath, rawData, { encoding: "base64" });
  return audioPath;
};
