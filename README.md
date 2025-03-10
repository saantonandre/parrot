# Parrot
Voice detection based recorder, will play back your sentence whenever you stop speaking.
It will trim off the initial silence from the recording using `ffmpeg` `silenceremove`.

## How it works
Uses puppeteer to spawn a browser instance and launches an https server to get access to access some useful APIs:
- MediaRecorder (to access the microphone)
- AudioContext (to playback the sounds)
- SpeechRecognition (to get to know when the user starts/stops speaking)

And there's some messaging to handle the business logic
-> start recording
-> notify whenever speech ends
-> restart recording, send input audio to ffmpeg
-> trim up to the speechstart timestamp
-> send the audio to audioContext and play it
-> repeat

## Launch
Launch with the `yarn start` command.

## Requirements
`ffmpeg` should be accessible as a PATH variable.
