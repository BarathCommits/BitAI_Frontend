import { useEffect, useRef, useState } from 'react';

interface CyberpunkAudioTrack {
  id: string;
  name: string;
  url: string;
  volume: number;
}

const CYBERPUNK_TRACKS: CyberpunkAudioTrack[] = [
  {
    id: 'background',
    name: 'Cyberpunk Background Music',
    url: '/audio/cyberpunk/cyberpunk-metaverse-event-background-music-391980.mp3',
    volume: 0.3
  },
  {
    id: 'action',
    name: 'Action Beat',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-casino-notification-212.mp3',
    volume: 0.5
  },
  {
    id: 'connection',
    name: 'Connection Sound',
    url: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-game-over-213.mp3',
    volume: 0.6
  }
];

export const useCyberpunkAudio = (
  isEnabled: boolean,
  options: { enableBackground?: boolean } = {}
) => {
  const { enableBackground = true } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      // Stop all audio when disabled
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    if (!enableBackground) {
      // Ensure any previous background audio is stopped if background is disabled
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTrack(null);
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }

    // Play background music when cyberpunk theme is enabled
    const backgroundTrack = CYBERPUNK_TRACKS.find(t => t.id === 'background');
    if (backgroundTrack && !backgroundAudioRef.current) {
      const audio = new Audio(backgroundTrack.url);
      audio.volume = backgroundTrack.volume;
      audio.loop = true; // Loop the background music
      audio.play().catch(error => {
        console.log('Background music playback failed:', error);
      });
      
      backgroundAudioRef.current = audio;
      setIsPlaying(true);
      setCurrentTrack('background');
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
    };
  }, [isEnabled, enableBackground]);

  const playTrack = (trackId: string) => {
    if (!isEnabled) return;

    const track = CYBERPUNK_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    // Don't play if it's background track (already playing)
    if (trackId === 'background') return;

    // Stop previous short track (but keep background music playing)
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Create and play new audio
    const audio = new Audio(track.url);
    audio.volume = track.volume;
    audio.play().catch(error => {
      console.log('Audio playback failed:', error);
    });

    audioRef.current = audio;

    audio.onended = () => {
      audioRef.current = null;
    };
  };

  const stopTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  // Play connection sound when wallet connects
  const playConnectionSound = () => {
    playTrack('connection');
  };

  // Play action sound for user actions
  const playActionSound = () => {
    playTrack('action');
  };

  return {
    isPlaying,
    currentTrack,
    playTrack,
    stopTrack,
    playConnectionSound,
    playActionSound,
  };
};

