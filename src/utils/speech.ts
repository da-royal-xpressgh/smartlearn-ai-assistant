// Web Speech API text-to-speech helper for students

class SpeechService {
  private isSpeaking: boolean = false;
  private currentText: string = '';
  private onEndCallbacks: Set<() => void> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.isSupported()) return;

    this.stop();

    // Clean markdown symbols for cleaner audio narration
    const cleanText = text
      .replace(/[#*`_~>[\]()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    this.currentText = cleanText;
    this.isSpeaking = true;

    if (onEnd) {
      this.onEndCallbacks.add(onEnd);
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // Slightly slower, clear educational pace
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onEndCallbacks.forEach((cb) => cb());
      this.onEndCallbacks.clear();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onEndCallbacks.forEach((cb) => cb());
      this.onEndCallbacks.clear();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.isSpeaking = false;
    this.onEndCallbacks.forEach((cb) => cb());
    this.onEndCallbacks.clear();
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking && window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();
