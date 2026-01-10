import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface MusicPlayerProps {
  isEnabled: boolean;
  className?: string;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isEnabled, className = '' }) => {
  const { isCyberpunk } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isEnabled || !isCyberpunk) {
      // Stop music when disabled or not cyberpunk theme
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    // Create audio element and auto-play
    const audio = new Audio('/audio/cyberpunk/cyberpunk-metaverse-event-background-music-391980.mp3');
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    // Auto-play on mount
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(error => {
      console.log('Auto-play failed:', error);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isEnabled, isCyberpunk]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.log('Music playback failed:', error);
      });
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Don't render if not cyberpunk theme
  if (!isCyberpunk || !isEnabled) {
    return null;
  }

  return (
    <div className={`fixed bottom-20 right-4 z-50 bg-black/95 backdrop-blur-md rounded-lg px-3 py-2 border-2 border-cyan-400/40 shadow-xl shadow-cyan-400/20 hover:bg-green-500/20 hover:border-green-400/60 hover:text-white transition-all duration-200 ${className}`}>
      <style>{`
        .music-player input[type="range"] {
          accent-color: var(--cyber-primary-cyan);
        }
        .music-player input[type="range"]::-webkit-slider-thumb {
          background: var(--cyber-primary-cyan);
          box-shadow: 0 0 10px var(--cyber-primary-cyan);
        }
        .music-player input[type="range"]::-moz-range-thumb {
          background: var(--cyber-primary-cyan);
          box-shadow: 0 0 10px var(--cyber-primary-cyan);
        }
        .music-player:hover button {
          color: var(--cyber-accent-green);
        }
      `}</style>
      
      <div className="flex items-center gap-2 music-player">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:text-white hover:border-green-400/60 transition-all duration-200"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} strokeWidth={2.5} /> : <Play size={16} strokeWidth={2.5} />}
        </button>
        
        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-cyan-400 hover:text-white transition-all duration-200"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer border border-cyan-400/30"
            style={{
              background: `linear-gradient(to right, var(--cyber-primary-cyan) 0%, var(--cyber-primary-cyan) ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
            }}
            title="Volume"
          />
          
          <span className="text-xs text-cyan-400 font-bold w-8 text-right">
            {Math.round(volume * 100)}
          </span>
        </div>
      </div>
    </div>
  );
};

