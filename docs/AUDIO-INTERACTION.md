# AUDIO INTERACTION — current autoplay, mute, and sound behavior

**Audience:** anyone changing Web Audio, the intro, blog chrome, or audio controls.
**Last reviewed:** 2026-10-26 · **Source:** `_src/site.js` and the blog sound script in `_src/build.py`.
**Authority:** `docs/START-HERE.md` owns the user-facing sound requirements.

[ASSUMPTION] Sound is a quiet, optional part of the visual experience; visitors must always be able to mute it.

[DECISION NEEDED] Do not add any permission prompt, sound chip, banner, or forced interaction to enable sound. Browser policy may still prevent first-visit autoplay.

---

## 1 · Current contract

1. The landing-page intro keeps its authored 3.6-second choreography stretched to **4.7 seconds**; do not shorten it to improve a metric.
2. The preloader starts an automatic Web Audio attempt. There is no “tap for sound” chip, permission dialog, or autoplay banner.
3. The code silently retries while the intro runs and listens for ordinary input. If the browser blocks audio, the first available interaction attempts to resume the track at the current intro position rather than restarting it.
4. Hub and article pages use a matching, lightweight synthesized sound engine with a visible **সাউন্ড** mute toggle and subtle scroll sound.
5. Mute state is not persisted into a later visit. A separate record of audible playback is persisted so the site can remember that sound was wanted. That record is **not** browser autoplay permission.
6. `prefers-reduced-motion: reduce` starts audio muted and skips the motion-heavy preloader; the visitor can still use the sound control.

## 2 · Why autoplay is not guaranteed

Browsers decide whether a site may play *audible* audio. A site can try immediately, remember its own preference, and resume after an allowed user gesture; it cannot grant itself a browser permission. On a fresh profile or a browser with strict autoplay settings, the first-load attempt may be rejected until the user interacts. Do not describe the stored grant as a permission or claim that every browser must play sound on first paint.

References:

- Chrome autoplay policy: <https://developer.chrome.com/blog/autoplay>
- Chromium autoplay behavior: <https://www.chromium.org/audio-video/autoplay/>
- Web Audio and autoplay: <https://developer.chrome.com/blog/web-audio-autoplay/>

## 3 · Landing-page implementation

### 3.1 Synth engine

`SFX` in `_src/site.js` uses Web Audio oscillators/noise; it has no audio files, external URLs, or extra network request. The main cue set includes the preloader track, hover/press, slider, tab, scroll, toast, success and error sounds. A compressor and master gain keep cues controlled.

### 3.2 Automatic attempt and unlock path

- `runPreloader()` calls `startIntroSound()` as the preloader begins.
- The code tries to create/resume `AudioContext` immediately, silently retries during the intro, and re-attempts on visibility/pageshow events.
- If browser policy initially suspends the context, the first ordinary pointer, touch, key, wheel, scroll, focus or related input can arm it; the track joins at the current elapsed time.
- No permission UI is rendered. Do not restore `#preSound`, “tap for sound,” or any equivalent.

### 3.3 Grant record versus mute

The `PERM` module stores the audible-grant record under `ma.sound.v10` in localStorage and IndexedDB (`ma-store/kv`), and requests persistent storage where supported. It may also record visit/MEI timestamps. This state is a site-level preference/measurement record only; it cannot override browser autoplay rules. The mute toggle is in-memory and is not written as a future-visit mute choice.

## 4 · Blog implementation

The hub/article script is embedded by `_src/build.py` and uses Web Audio only. It attempts on load, silently listens for ordinary input when policy blocks it, and writes the same `ma.sound.v10` grant key after an audible cue. The mute choice uses `sessionStorage` (`ma.blog.muted`) so it can remain muted within the current tab session without silencing a later visit. Reduced-motion starts it muted.

The visible control is a real button (`#blogSoundBtn`) with `aria-pressed`, an updated label and title. There is no permission prompt. Scroll cues are throttled and deliberately quiet. Hub and article pages share the landing site's warm-paper/ink/red/teal visual family and footer credits/SSL mark.

## 5 · Sound palette and restraint

| Cue | Trigger | Character |
|---|---|---|
| `sweep`, `shutter`, `lock` | Preloader stages | Soft filtered noise and short rising arpeggio |
| `kick`, `hat`, `arp`, `riser`, `impact`, `chord`, `whoosh` | Intro sequence | Synthesized 128-BPM track synchronized to the 4.7-second sequence |
| `hover`, `press` | Interactive controls/links | Short, low-gain pitch cues |
| `slider`, `tab` | Lab input/tab changes | Short pitched blips |
| `scroll` | Meaningful scroll movement | Subtle paper-like tick; throttled/debounced |
| `toast`, `success`, `error` | Form/status feedback | Brief, distinct status cues |

Do not make scroll sound continuous or loud. Keep all sounds mutable and ensure muting stops future cues.

## 6 · QA procedure

1. Use a fresh browser context with normal autoplay policy. Confirm there is no prompt and the visible control starts in the expected state. A blocked first-load attempt is acceptable.
2. Trigger one ordinary interaction; confirm sound can resume when the browser allows it and `ma.sound.v10` is recorded after audible playback.
3. Toggle mute; verify `aria-pressed` and icon/label state change, and no further cues are scheduled while muted.
4. Navigate between hub/article pages and verify mute state remains tab-session scoped, while a later visit is not forced muted.
5. Test a context launched with autoplay allowed; confirm the automatic attempt can run without interaction.
6. Check reduced-motion behavior, the subtle scroll cue, the intro timing, console errors and the absence of any permission UI.
7. Test a real iOS Safari device before claiming iOS autoplay behavior; Chromium emulation does not prove iOS behavior.

**Current browser evidence:** the v10.3 candidate passed a 5-width route sweep and the blog mute-control interaction in Chromium with zero console/page errors. The dedicated fresh-profile autoplay/policy measurement and a real iOS Safari test remain separate evidence items; do not infer them from the route smoke test.

## 7 · Change guardrails

- Keep the intro choreography and synchronized cue timing intact.
- Do not introduce audio files, CDN assets, a browser permission prompt, or a persisted mute preference.
- Keep the user-facing control visible, keyboard-operable and clearly labelled.
- Update this file and `docs/COMPONENTS.md` whenever sound behavior or storage keys change.
- Update `docs/TEST-PLAN.md` with measured results, not assumptions.
