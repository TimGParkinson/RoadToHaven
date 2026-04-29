import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUSIC_ENABLED_KEY = '@rth_music_enabled';

const TRACKS = {
  travel:   require('../../assets/music/travel.mp3'),
  tense:    require('../../assets/music/tense.mp3'),
  gameover: require('../../assets/music/gameover.mp3'),
};

let _sound        = null;
let _currentTrack = null;
let _enabled      = true;
let _gen          = 0; // incremented on every playTrack call to detect races

export async function loadMusicSetting() {
  try {
    const stored = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
    _enabled = stored === null ? true : stored === 'true';
  } catch {
    _enabled = true;
  }
  return _enabled;
}

export async function setMusicEnabled(enabled) {
  _enabled = enabled;
  await AsyncStorage.setItem(MUSIC_ENABLED_KEY, String(enabled));
  if (_sound) {
    try {
      if (enabled) {
        await _sound.playAsync();
      } else {
        await _sound.pauseAsync();
      }
    } catch (e) {
      console.log('[music] toggle error:', e.message);
    }
  }
}

export function isMusicEnabled() {
  return _enabled;
}

export async function playTrack(trackName) {
  const myGen = ++_gen;

  if (_currentTrack === trackName) {
    if (_sound && _enabled) {
      try { await _sound.playAsync(); } catch { /* ignore */ }
    }
    return;
  }

  // Stop whatever is currently playing
  if (_sound) {
    try {
      await _sound.stopAsync();
      await _sound.unloadAsync();
    } catch { /* ignore */ }
    _sound        = null;
    _currentTrack = null;
  }

  // Abort if a newer playTrack call came in while we were stopping
  if (myGen !== _gen) return;
  if (!_enabled) return;

  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    // Abort again if superseded during setAudioModeAsync
    if (myGen !== _gen) return;

    const { sound } = await Audio.Sound.createAsync(TRACKS[trackName], {
      shouldPlay: true,
      isLooping:  true,
      volume:     0.5,
    });

    // If a newer call finished first, unload this orphaned sound and bail
    if (myGen !== _gen) {
      try { await sound.unloadAsync(); } catch { /* ignore */ }
      return;
    }

    _sound        = sound;
    _currentTrack = trackName;
  } catch (e) {
    console.log('[music] playTrack error:', e.message);
  }
}

export async function stopMusic() {
  if (_sound) {
    try {
      await _sound.stopAsync();
      await _sound.unloadAsync();
    } catch { /* ignore */ }
    _sound        = null;
    _currentTrack = null;
  }
}
