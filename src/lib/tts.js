function speakLongText(text, callbackFn = () => {}) {
  window.speechSynthesis.cancel();

  const sentences = text.replace(/\*/g, "").split(/[\.\!]+\s*|\n+\s*/); // Split text into sentences
  if (sentences.length > 0) {
    speakSentence(sentences, 0, callbackFn);
  }
}

function speakSentence(
  sentences,
  index,
  callbackFn = () => {}
) {
  if (index < sentences.length) {
    console.log(sentences[index]);
    const utterance = new SpeechSynthesisUtterance(sentences[index]);

    utterance.onend = () => {
      if (index < sentences.length - 1) {
        speakSentence(sentences, index + 1, callbackFn); // Chain the next sentence
      } else {
        callbackFn(); // Call the callback function when the last sentence has been spoken
      }
    };

    const voice = speechSynthesis
      .getVoices()
      .find((voice) => voice.name == "Google UK English Female");
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }
}

export default speakLongText;
