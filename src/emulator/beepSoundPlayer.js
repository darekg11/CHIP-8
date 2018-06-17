import Logger from '../logger';

class BeepSoundPlayer {
  constructor() {
    const AudioContext = window.AudioContext || window.webkitAudioContext || window.audioContext;
    this.audioPlayer = new AudioContext();
  }
  playSound = () => {
    if (this.audioPlayer) {
      const oscilator = this.audioPlayer.createOscillator();
      oscilator.connect(this.audioPlayer.destination);
      oscilator.type = 'triangle';
      if (oscilator.noteOn) {
        oscilator.noteOn(0); // support for older browsers
      }
      if (oscilator.start) {
        oscilator.start(); // new browsers
      }
      setTimeout(() => {
        if (oscilator.noteOff) {
          oscilator.noteOff(0); // support for older browsers
        }
        if (oscilator.stop) {
          oscilator.stop(); // new browsers
        }
      }, 100);
    } else {
      Logger.logError('[beep-sound-player] Audio is not supported on your browser');
    }
  }
}
export default BeepSoundPlayer;
