// Simple Audio Test - DIAGNOSTIC VERSION
class GameMusic {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.musicRunning = false;
        this.testSoundPlayed = false;
        
        // Try to initialize audio context immediately
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.5; // Higher volume for testing
            
            console.log('AudioContext created successfully');
        } catch (error) {
            console.error('Failed to create AudioContext:', error);
        }
    }

    async initializeAudio() {
        if (!this.audioContext) {
            console.error('No audio context available');
            return;
        }
        
        try {
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            this.isInitialized = true;
            console.log('Audio context initialized successfully, state:', this.audioContext.state);
            
            // Play a test sound immediately to verify audio works
            setTimeout(() => {
                this.playTestSound();
            }, 500);
            
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }

    playTestSound() {
        if (!this.isInitialized || this.testSoundPlayed) return;
        
        console.log('Playing test sound...');
        this.testSoundPlayed = true;
        
        // Simple test tone
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.5); // Glide to A5
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.0);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1.0);
        
        console.log('Test sound completed');
    }

    createOscillator(frequency, startTime, duration, type = 'sawtooth', volume = 0.3) {
        if (!this.isInitialized) {
            console.warn('Audio not initialized, cannot play oscillator');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            
            // Simple envelope
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
            
        } catch (error) {
            console.error('Error creating oscillator:', error);
        }
    }

    // Simple game melody - major key, upbeat
    playMainMelody() {
        if (!this.isInitialized) {
            console.warn('Cannot play melody - audio not initialized');
            return;
        }
        
        console.log('Playing main melody...');
        
        const notes = [
            { freq: 523.25, duration: 0.4 }, // C5
            { freq: 659.25, duration: 0.4 }, // E5
            { freq: 783.99, duration: 0.4 }, // G5
            { freq: 1046.50, duration: 0.8 }, // C6
        ];
        
        let currentTime = this.audioContext.currentTime + 0.1;
        
        notes.forEach((note, index) => {
            this.createOscillator(note.freq, currentTime, note.duration, 'square', 0.25);
            currentTime += note.duration;
        });
        
        // Schedule next loop
        setTimeout(() => {
            if (this.musicRunning) {
                this.playMainMelody();
            }
        }, 2000);
    }

    playMoveSound() {
        if (!this.isInitialized) return;
        
        const startTime = this.audioContext.currentTime + 0.1;
        this.createOscillator(800, startTime, 0.1, 'square', 0.2);
    }

    playVictorySound(player) {
        if (!this.isInitialized) return;
        
        console.log('Playing victory sound for:', player);
        const startTime = this.audioContext.currentTime + 0.1;
        
        if (player === 'X') {
            // Bulldogs victory
            const victoryNotes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
            victoryNotes.forEach((freq, index) => {
                this.createOscillator(freq, startTime + index * 0.3, 0.25, 'triangle', 0.4);
            });
        } else if (player === 'O') {
            // UMN victory
            const victoryNotes = [440.00, 554.37, 659.25, 880.00]; // A, C#, E, A
            victoryNotes.forEach((freq, index) => {
                this.createOscillator(freq, startTime + index * 0.3, 0.25, 'square', 0.4);
            });
        }
    }

    startMusic() {
        if (!this.isInitialized) {
            console.warn('Cannot start music - audio not initialized');
            return;
        }
        
        this.musicRunning = true;
        console.log('Starting background music...');
        this.playMainMelody();
    }

    stopMusic() {
        this.musicRunning = false;
        console.log('Music stopped');
    }
}

// Create global instance
const gameMusic = new GameMusic();

// Make it globally available
if (typeof window !== 'undefined') {
    window.gameMusic = gameMusic;
    console.log('Audio system loaded and ready');
}

// Auto-initialize when possible
window.addEventListener('load', () => {
    console.log('Window loaded, attempting audio initialization...');
    gameMusic.initializeAudio();
});
