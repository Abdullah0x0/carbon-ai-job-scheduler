class SoundManager {
  constructor() {
    this.sounds = {
      submit: new Audio('/sounds/submit.mp3'),
      success: new Audio('/sounds/success.mp3')
    };

    // Pre-load sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5; // Set default volume to 50%
    });
  }

  play(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      // Stop and reset the sound if it's already playing
      sound.pause();
      sound.currentTime = 0;
      // Play the sound
      sound.play().catch(error => {
        // Silently handle autoplay restrictions
        console.debug('Sound playback prevented:', error);
      });
    }
  }

  setVolume(volume) {
    // Set volume for all sounds (0.0 to 1.0)
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

export const soundManager = new SoundManager(); 