import { PassThrough } from "stream";
import { eventEmitter } from "../events";
import ffmpeg from "fluent-ffmpeg";

export const encoderService = () => {
  eventEmitter.on("RECORDER_RESULT", async (base64) => {
    const buffers: Buffer[] = [];
    const stream = new PassThrough();
    ffmpeg({ source: base64 }).pipe(stream, { end: true });
    stream.on("data", (buf) => buffers.push(buf));

    await new Promise((res) => stream.on("end", res));
    const processedBuffer = Buffer.concat(buffers);
    const b64 = processedBuffer.toString("base64");
    const url = processedBuffer.toString("base64url");
    console.log(b64, url);
  });
};
