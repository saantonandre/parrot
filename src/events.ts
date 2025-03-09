import EventEmitter from "node:events";

export const eventEmitter = new EventEmitter<{
  SPEECH_END: [];
  RECORDER_STOP: [];
  RECORDER_RESULT: [string];
  ENCODER_RESULT: [string];
  RECORDER_START: [];
  PLAYER_START: [];
  PLAYER_STOP: [];
}>();
