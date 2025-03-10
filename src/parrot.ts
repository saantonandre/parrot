export const parrot = async () => {
  // common variables
  let speechStart = Date.now();
  // start browser apis
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const audioContext = new AudioContext();
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  // Handle speech recognition
  const TOLERANCE_MS = 200;
  recognition.onspeechstart = () => (speechStart = Date.now() - TOLERANCE_MS);
  recognition.onend = recognition.start; // Restart on abrupt ends
  // handle recorder
  const audioChunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    audioChunks.push(e.data);
  };
  recognition.onresult = async (e) => {
    const value = e.results[0][0].transcript.trim();
    console.log(`[${e.results[0][0].confidence.toFixed(2)}]: ${value}`);
    const stopPromise = new Promise((res) => (mediaRecorder.onstop = res));
    mediaRecorder.stop();
    await stopPromise;
    // Audio trimming
    const speechEndOffset = Date.now() - speechStart;
    const arrayBuffer = await new Blob([...audioChunks]).arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.max(
      audioBuffer.length - (speechEndOffset / 1000) * sampleRate,
      0
    );
    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      sampleRate,
      sampleRate
    );
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      trimmedBuffer.copyToChannel(
        audioBuffer.getChannelData(channel).subarray(startSample),
        channel
      );
    }
    const source = audioContext.createBufferSource();
    source.buffer = trimmedBuffer;
    source.connect(audioContext.destination);
    source.start();

    audioChunks.length = 0;
    mediaRecorder.start();
  };
  // Start services
  recognition.start();
  mediaRecorder.start();
};
