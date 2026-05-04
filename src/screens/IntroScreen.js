import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playTrack } from '../services/musicService';
import { STORAGE_KEYS } from '../config/storageKeys';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, MONO } from '../styles';
import Button from '../components/Button';

// ─────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────
const FULL_TEXT =
`The world didn't end in fire.

It ended slowly.

First the power grids failed. Then the cities emptied. Then the roads filled with people who had nowhere left to go.

Now… there's only what you can carry.

You've heard rumors — whispers passed between survivors, traded like currency:

A place called Haven.

Safe. Stable. Real.

Maybe it exists. Maybe it doesn't.

But staying where you are?

That's a death sentence.

You gather what little you have left.
Fuel. Food. Scrap. Hope.

The road ahead is long.

And it will take everything.`;

const TYPING_SPEED_MS = 22; // ms per character

// ─────────────────────────────────────────────
// SCREEN
// ─────────────────────────────────────────────
export default function IntroScreen({ navigation }) {
  const [displayed, setDisplayed]   = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [cursorOn, setCursorOn]     = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const indexRef    = useRef(0);
  const intervalRef = useRef(null);
  const scrollRef   = useRef(null);

  useEffect(() => {
    playTrack('tense');
    AsyncStorage.getItem(STORAGE_KEYS.INTRO_SEEN).then(val => {
      if (val === 'true') setHasSeenIntro(true);
    });
  }, []);

  // ── Typewriter ────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      const next = FULL_TEXT.slice(0, indexRef.current);
      setDisplayed(next);

      if (indexRef.current >= FULL_TEXT.length) {
        clearInterval(intervalRef.current);
        setTypingDone(true);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Blinking cursor ───────────────────────
  useEffect(() => {
    if (typingDone) return;
    const blink = setInterval(() => setCursorOn(v => !v), 500);
    return () => clearInterval(blink);
  }, [typingDone]);

  // ── Auto-scroll as text grows ─────────────
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [displayed]);

  // ── Tap handler ───────────────────────────
  function goToMenu() {
    AsyncStorage.setItem(STORAGE_KEYS.INTRO_SEEN, 'true');
    navigation.replace('MainMenu');
  }

  function handleTap() {
    if (!typingDone) {
      clearInterval(intervalRef.current);
      setDisplayed(FULL_TEXT);
      setTypingDone(true);
    } else {
      goToMenu();
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.outer} onPress={!typingDone ? handleTap : undefined}>
        {/* ── Scrolling text area ─────────── */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={typingDone}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.body}>
            {displayed}
            {!typingDone && (
              <Text style={[styles.cursor, !cursorOn && styles.cursorHidden]}>
                {'█'}
              </Text>
            )}
          </Text>
        </ScrollView>

        {/* ── Bottom prompt ───────────────── */}
        <View style={styles.footer}>
          {typingDone ? (
            <Button label="Continue" onPress={goToMenu} variant="primary" />
          ) : hasSeenIntro ? (
            <Button label="Skip" onPress={goToMenu} variant="secondary" />
          ) : (
            <Text style={styles.hint}>TAP TO SKIP</Text>
          )}
        </View>

      </Pressable>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: colors.background,
  },
  outer: {
    flex:    1,
    padding: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  body: {
    fontFamily: MONO,
    fontSize:   15,
    color:      colors.secondary,
    lineHeight: 26,
  },
  cursor: {
    color:   colors.primary,
    opacity: 1,
  },
  cursorHidden: {
    opacity: 0,
  },
  footer: {
    paddingTop:    16,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
    alignItems:    'center',
  },
  hint: {
    fontFamily:    MONO,
    fontSize:      10,
    color:         colors.textMuted,
    letterSpacing: 3,
  },
});
