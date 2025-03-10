import EventEmitter from "node:events";

export const eventEmitter = new EventEmitter<{
  SPEECH_END: [number];
  RECORDER_RESULT: [string, number];
  ENCODER_RESULT: [string];
  RECORDER_START: [];
  PLAYER_START: [];
  PLAYER_STOP: [];
}>();
