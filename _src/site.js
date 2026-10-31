/* ============================================================
   MATH ACADEMY v2 — kinetic interactions
   ============================================================ */
(function(){
  /* ---------- font gate: no fallback paint, no swap, no CLS ---------- */
  (function(){
    var root = document.documentElement, done = false;
    root.classList.add('fonts-loading');
    function reveal(){ if(done) return; done = true; root.classList.remove('fonts-loading'); }
    if(document.fonts){
      if(document.fonts.load){ document.fonts.load('700 16px "Noto Sans Bengali"').then(reveal, reveal); }
      if(document.fonts.ready){ document.fonts.ready.then(reveal); }
    }
    setTimeout(reveal, 2500);   // safety net only — the face normally lands far sooner
  })();

  'use strict';

  var $  = function(s,c){ return (c||document).querySelector(s); };
  var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function initWhenVisible(el, init){
    if(!el) return;
    var started = false, observer;
    function run(){
      if(started) return;
      started = true;
      if(observer) observer.disconnect();
      init();
    }
    if('IntersectionObserver' in window){
      observer = new IntersectionObserver(function(entries){
        if(entries.some(function(entry){ return entry.isIntersecting; })) run();
      }, {rootMargin:'320px 0px', threshold:0});
      observer.observe(el);
    } else if('requestIdleCallback' in window){
      window.requestIdleCallback(run, {timeout:1200});
    } else window.setTimeout(run, 250);
  }
  var hasGSAP = typeof window.gsap !== 'undefined';
  if(hasGSAP) gsap.defaults({ease:'power3.out'});

  var BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  function toBn(v){ return String(v).replace(/[0-9]/g, function(d){ return BN[+d]; }); }
  function fromBn(v){ return String(v).replace(/[০-৯]/g, function(d){ return String(BN.indexOf(d)); }); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function degrees(a){ return (a*180/Math.PI); }

  var mockResultsData = {
    'MA-2026-084': {roll:'MA-2026-084', name:'তানভীর আহমেদ', batch:'SSC ২০২৭ ব্যাচ', test:'মক টেস্ট-০৪', marks:'৯৬ / ১০০', rank:'১ম', pct:'৯৯.২%', bars:[94,88,96],
      note:'বীজগণিত ও ত্রিকোণমিতিতে দারুণ দক্ষতা। জ্যামিতির উপপাদ্য প্রমাণে চিত্র আরও নিখুঁত করার পরামর্শ।'},
    'MA-2026-021': {roll:'MA-2026-021', name:'সাদিয়া আফরিন', batch:'প্রগ্রেস ব্যাচ (ক্লাস ৮–৯)', test:'মক টেস্ট-০৩', marks:'৮৮ / ১০০', rank:'৩য়', pct:'৯৪.৫%', bars:[90,82,92],
      note:'ধারাবাহিক উন্নতি সন্তোষজনক। সমীকরণ সমাধান ও লেখচিত্রে মনোযোগ দিলে নম্বর আরও বাড়বে।'},
    'MA-2026-112': {roll:'MA-2026-112', name:'রাকিব হাসান', batch:'ভিত্তি ব্যাচ (ক্লাস ৬–৭)', test:'মাসিক মূল্যায়ন-০২', marks:'৮২ / ১০০', rank:'৫ম', pct:'৮৮.০%', bars:[80,78,88],
      note:'পাটিগণিত ও মৌলিক ধারণায় ভালো দখল। নিয়মিত অনুশীলনে গতি বাড়ানো প্রয়োজন।'}
  };


  /* ============================================================
     SFX — synthesised UI audio. Web Audio only: no files, no network,
     nothing to preload, so the offline single-file build stays intact.
     It attempts automatically; browser policy may require an ordinary gesture.
     ============================================================ */
  var SFX = (function(){
    var Ctx = window.AudioContext || window.webkitAudioContext;
    var ctx = null, out = null, on = true, last = {}, reviving = null;
    /* The mute state exists only in memory. PERM below separately remembers that
       audible sound has played; that grant record is not a mute preference and
       does not itself override the browser's autoplay policy. */
    if(reduced) on = false;                       // the only thing that may start muted

    function boot(){
      if(ctx || !Ctx) return ctx;
      try{
        ctx = new Ctx();
        var comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16; comp.knee.value = 16; comp.ratio.value = 6;
        comp.attack.value = .003; comp.release.value = .25;
        out = ctx.createGain(); out.gain.value = .80;
        out.connect(comp); comp.connect(ctx.destination);
        /* Safari / iOS only honours audio inside a gesture — and only if a buffer
           has actually been played there. This 1-frame silent buffer is the
           standard "unlock", it is inaudible and costs nothing. */
        var b = ctx.createBuffer(1, 1, 22050);
        var src = ctx.createBufferSource();
        src.buffer = b; src.connect(ctx.destination); src.start(0);
        if(ctx.state === 'suspended'){ reviving = ctx.resume().catch(function(){}); }
      }catch(e){ ctx = null; }
      return ctx;
    }
    function gap(name, ms){
      var t = (window.performance && performance.now) ? performance.now() : Date.now();
      if(last[name] && t - last[name] < ms) return true;
      last[name] = t; return false;
    }
    var PENDING = 0;                       // set by CUE() for scheduled track notes
    function tone(freq, dur, o){
      if(!ctx || !out || ctx.state !== 'running') return;
      o = o || {};
      var t0 = ctx.currentTime + (o.delay || 0) + PENDING;
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if(o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(30, o.to), t0 + dur);
      g.gain.setValueAtTime(.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(.0003, o.gain || .05), t0 + (o.attack || .006));
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      osc.connect(g); g.connect(out);
      osc.start(t0); osc.stop(t0 + dur + .03);
    }
    function noise(dur, o){
      if(!ctx || !out || ctx.state !== 'running') return;
      o = o || {};
      var t0 = ctx.currentTime + (o.delay || 0) + PENDING;
      var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      var buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < len; i++) d[i] = (Math.random()*2 - 1) * (1 - i/len);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var flt = ctx.createBiquadFilter();
      flt.type = o.filter || 'bandpass';
      flt.frequency.setValueAtTime(o.freq || 1800, t0);
      if(o.to) flt.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), t0 + dur);
      flt.Q.value = o.q || 1.1;
      var g = ctx.createGain();
      g.gain.setValueAtTime(o.gain || .1, t0);
      g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      src.connect(flt); flt.connect(g); g.connect(out);
      src.start(t0); src.stop(t0 + dur + .03);
    }

    var VOICE = {
      /* micro-interactions — clear & audible on mobile without harshness */
      hover:  function(){ if(gap('hover', 95)) return; tone(1480, .05, {type:'sine', gain:.040, to:1770}); },
      slider: function(pos){
                if(gap('slider', 34)) return;
                var f = 420 + Math.max(0, Math.min(1, pos || 0)) * 760;
                tone(f, .045, {type:'triangle', gain:.065, to:f * 1.05});
                noise(.02, {freq: f * 2.4, gain:.025, q:3});
              },
      press:  function(){ tone(150, .10, {type:'triangle', gain:.085, to:72}); noise(.05, {freq:2400, gain:.080, q:2.2}); },
      tab:    function(){ tone(660, .06, {type:'triangle', gain:.065}); tone(990, .08, {type:'triangle', gain:.055, delay:.05}); },
      tick:   function(){ if(gap('tick', 85)) return; tone(1180, .035, {type:'square', gain:.025}); },
      /* page scroll — kept low & subtle per user request */
      scroll: function(){ if(gap('scroll', 190)) return;
                noise(.07, {freq: 1250 + Math.random()*750, filter:'bandpass', gain:.025, q:1.9});
                tone(210 + Math.random()*90, .035, {type:'sine', gain:.012}); },
      /* preloader choreography — substantially amplified & punchy */
      sweep:  function(){ noise(.28, {freq:4200, to:400, gain:.18, q:.9}); },
      shutter:function(){ noise(.40, {freq:1600, to:150, gain:.20, q:.7});
                          noise(.12, {freq:300, filter:'lowpass', gain:.10}); },
      lock:   function(){ [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){
                          tone(f, .42, {type:'triangle', gain:.14, delay:i*.075});
                          tone(f*2, .28, {type:'sine', gain:.045, delay:i*.075}); }); },
      /* ---- the intro "track" — significantly boosted for mobile clarity ---- */
      kick:   function(){ tone(118, .16, {type:'sine', gain:.28, to:44, attack:.002});
                          noise(.03, {freq:900, filter:'lowpass', gain:.09}); },
      hat:    function(){ noise(.035, {freq:7800, filter:'highpass', gain:.085, q:.7}); },
      arp:    function(f){ tone(f, .19, {type:'triangle', gain:.15});
                           tone(f*2, .12, {type:'sine', gain:.05}); },
      riser:  function(){ noise(1.05, {freq:320, to:6200, filter:'bandpass', gain:.18, q:.8}); },
      impact: function(){ noise(.34, {freq:2400, to:90, filter:'lowpass', gain:.32, q:.6});
                          tone(74, .45, {type:'sine', gain:.28, to:38, attack:.002}); },
      chord:  function(f){ tone(f, .85, {type:'triangle', gain:.16});
                           tone(f*1.5, .7, {type:'sine', gain:.07}); },
      whoosh: function(){ noise(.5, {freq:5600, to:500, filter:'bandpass', gain:.15, q:.7}); },
      /* feedback */
      toast:  function(){ tone(784, .16, {type:'sine', gain:.09}); tone(1046, .22, {type:'sine', gain:.08, delay:.10}); },
      success:function(){ [659.25, 880, 1174.7].forEach(function(f, i){ tone(f, .40, {type:'triangle', gain:.10, delay:i*.09}); }); },
      error:  function(){ tone(240, .14, {type:'square', gain:.075, to:176}); },
      open:   function(){ noise(.26, {freq:600, to:2400, gain:.10, q:1.4}); }
    };

    /* CUE(name, delaySeconds, arg) — used by the intro track scheduler */
    function CUE(name, delay, arg){
      if(!ctx || !out || ctx.state !== 'running') return;
      var v = VOICE[name]; if(!v) return;
      var prev = PENDING; PENDING = delay || 0;
      try{ v(arg); }catch(e){}
      PENDING = prev;
    }

    return {
      play: function(name, arg){
        if(!on) return;
        var v = VOICE[name]; if(!v) return;
        if(!boot()) return;
        if(ctx.state === 'suspended'){
          reviving = ctx.resume().then(function(){ try{ v(arg); }catch(e){} }, function(){});
        } else { try{ v(arg); }catch(e){} }
      },
      arm: function(){ if(!on) return; boot(); if(ctx && ctx.state === 'suspended') ctx.resume(); },
      isOn: function(){ return on; },
      /* "armed" must also mean "not muted" — the context can be running while
         the visitor has sound switched off, and the intro must respect that */
      isArmed: function(){ return !!(on && ctx && ctx.state === 'running'); },
      /* raw cue with an explicit delay, used by the intro track scheduler */
      cue: function(name, delay, arg){ CUE(name, delay, arg); },
      /* killing the context (not just suspending it) is the only way to drop
         notes that are already scheduled on the audio clock */
      stopAll: function(){
        if(!ctx) return;
        /* closing while a resume() is still in flight makes Chrome log
           "AudioContext closed before a pending resume() could complete", which
           costs a Lighthouse best-practice point. Wait for it to settle first. */
        var dead = ctx;
        ctx = null; out = null; last = {};
        var settle = reviving || Promise.resolve();
        reviving = null;
        settle.then(function(){ try{ dead.close(); }catch(e){} },
                    function(){ try{ dead.close(); }catch(e){} });
      },
      set: function(v){
        on = !!v;                                  // session only — never written to storage
        if(on){ this.arm(); } else if(ctx && ctx.state === 'running'){ ctx.suspend(); }
        return on;
      },
      toggle: function(){ return this.set(!on); }
    };
  })();

  /* the first real gesture unlocks audio (browser autoplay policy) */
  ['pointerdown','touchstart','keydown'].forEach(function(ev){
    window.addEventListener(ev, function(){
      SFX.arm();
      if(window.__joinTrack) window.__joinTrack();
    }, {once:true, passive:true});
  });

  /* ---------- toast ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(title, sub, type){
    if(!toastEl) return;
    $('#toastTitle').textContent = title;
    $('#toastSub').textContent = sub || '';
    toastEl.querySelector('svg').style.color = type === 'error' ? '#FF9F97' : 'var(--mint)';
    toastEl.classList.add('show');
    SFX.play(type === 'error' ? 'error' : 'toast');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 4200);
  }

  /* ---------- whatsapp links ---------- */
  var WA_NUMBER = '8801641045469';   // প্রান্ত রায় — আসল নম্বর
  $$('[data-wa]').forEach(function(a){
    var msg = a.getAttribute('data-wa');
    if(a.tagName === 'A'){
      a.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });

  /* ---------- scroll progress (below sticky header) ---------- */
  var prog = document.createElement('div');
  prog.className = 'scrollprog';
  document.body.appendChild(prog);
  function onScrollProgress(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0).toFixed(2) + '%';
  }

  /* ============================================================
     PRELOADER
     ============================================================ */
  var pre = $('#preloader');

  function hidePreloader(){
    if(!pre || pre.hidden) return;
    preLive = false;
    pre.hidden = true;
    document.documentElement.classList.remove('lock');
    document.body.classList.remove('lock');
    document.body.classList.add('intro-done');
    window.dispatchEvent(new Event('intro:done'));
  }

  /* Intro policy -----------------------------------------------------------------
     The intro plays on EVERY page load — repeat visits included. It used to be
     skipped once per session through sessionStorage, which made reloads flash
     straight into the page and left the visitor without the sound.
     ?fast=1 / ?nointro=1 → only for audits and share links.
     reduced-motion        → skipped by preference, not by accident.                       */
  var params = new URLSearchParams(location.search);
  var SKIP_INTRO = params.get('fast') === '1' || params.get('nointro') === '1';

  /* The kick/hat/arp/bass track that runs under the intro. Scheduled on the audio
     clock (not rAF) so the beats line up with the GSAP stages, and it only plays
     if the context is already unlocked — otherwise the "tap for sound" chip runs it. */
  var TRACK_BEAT = 0.469;                      // 128 BPM
  function playTrack(from){
    from = from || 0;
    var B = TRACK_BEAT, T = 3.35 * PRE_STRETCH;   // the track follows the stretched timeline
    function at(t){ return t * PRE_STRETCH - from; }   // schedule relative to now
    function future(t){ return t * PRE_STRETCH >= from - 0.02; }
    // kick on every beat
    for(var b = 0; b * B <= T; b++){
      if(future(b * B)) SFX.cue('kick', at(b * B));
    }
    // hats on the off-beats
    for(var h = 0; h * B / 2 <= T; h++){
      if(future(h * B / 2) && h % 2) SFX.cue('hat', at(h * B / 2));
    }
    // rising arp during ASSEMBLE
    var arp = [523.25, 659.25, 783.99, 880, 1046.5];
    for(var a = 0; a < arp.length; a++){
      var t = 1.35 + a * B / 2;
      if(future(t)) SFX.cue('arp', at(t), arp[a]);
    }
    // riser into the slam
    if(future(1.9)) SFX.cue('riser', at(1.9), 0.95);
    // impact + chord on the slam
    if(future(2.82)){ SFX.cue('impact', at(2.82)); }
    if(future(2.85)){ [392, 523.25, 659.25, 987.77].forEach(function(f, i){
        SFX.cue('chord', at(2.85) + i * 0.02, f); }); }
    // whoosh as the shutter opens
    if(future(3.0)) SFX.cue('whoosh', at(3.0));
  }

  var PRE_TOTAL = 3.6;     // the timeline is authored against 3.6 s …
  var PRE_SECONDS = 4.7;   // … and stretched to this many real seconds
  var PRE_STRETCH = PRE_SECONDS / PRE_TOTAL;   // 1.306 — also scales the audio cues
  var preStart = 0;
  var preLive  = false;    // is the preloader on screen right now?
  var trackOn  = false;    // has the intro track been started (once only)?
  /* arm audio and join the track mid-flight: the first tap should never cost
     the visitor the music, whatever element it lands on */
  function joinTrack(){
    if(trackOn || !preLive) return false;
    if(!SFX.isArmed()) return false;
    beginTrack(Math.max(0, (Date.now() - preStart) / 1000));
    return true;
  }
  window.__joinTrack = joinTrack;

  /* ==========================================================================
     AUTOPLAY — the intro must have sound from the first frame, no prompts
     --------------------------------------------------------------------------
     Browsers only allow audio after "user activation". No website can bypass
     that rule; what a site *can* do is stop asking. So:
        1. we ask the browser the moment the preloader mounts (works when the
           visitor has been here before, in an installed PWA, or on a policy
           that already allows sound);
        2. if it says "not yet", we listen for the FIRST sign of life anywhere
           — pointer, touch, key, wheel, scroll, focus — and start the track at
           the exact beat the intro is on, so it never feels like a click-to-play;
        3. while the intro runs we retry every 400 ms, and once more on
           visibilitychange / pageshow, so a paused tab still ends up musical.
     There is no chip or prompt. A persisted audible-grant record is a preference
     signal only; mute is never persisted, and every load attempts sound the same way.
     ========================================================================== */
  /* --------------------------------------------------------------------------
     DURABLE GRANT — v10
     A browser cannot be *given* sound permission by a website, so we do the two
     things that are actually possible:
       a) write a permanent record the first time unmuted audio really plays,
          so every later visit knows sound is wanted and can skip every gate;
       b) keep that record in localStorage AND IndexedDB (one surviving a
          partial "clear site data" is enough), and ask the browser to make the
          origin's storage persistent.
     It is a *preference* record, not a permission — see docs/AUDIO-INTERACTION.md.
     -------------------------------------------------------------------------- */
  var PERM = (function(){
    var K = 'ma.sound.v10', mem = null;
    function readLS(){ try{ return JSON.parse(localStorage.getItem(K) || 'null'); }catch(e){ return null; } }
    function writeLS(o){ try{ localStorage.setItem(K, JSON.stringify(o)); }catch(e){} }
    function idb(fn){
      try{
        var rq = indexedDB.open('ma-store', 1);
        rq.onupgradeneeded = function(){ rq.result.createObjectStore('kv'); };
        rq.onsuccess = function(){ fn(rq.result); };
      }catch(e){}
    }
    function readIDB(cb){
      idb(function(db){
        try{
          var t = db.transaction('kv', 'readonly').objectStore('kv').get(K);
          t.onsuccess = function(){ if(t.result){ mem = mem || t.result; cb(t.result); } };
        }catch(e){}
      });
    }
    function writeIDB(o){
      idb(function(db){
        try{ db.transaction('kv', 'readwrite').objectStore('kv').put(o, K); }catch(e){}
      });
    }
    var api = {
      load: function(){
        mem = readLS();
        readIDB(function(o){
          if(o && (!mem || (o.at || 0) > (mem.at || 0))) mem = o;
          if(mem && mem.granted) document.documentElement.setAttribute('data-snd', 'granted');
        });
        if(mem && mem.granted) document.documentElement.setAttribute('data-snd', 'granted');
        return mem;
      },
      get: function(){ return mem; },
      /* called the first time the track is actually audible */
      grant: function(){
        mem = mem || {};
        mem.granted = true;
        mem.at = Date.now();
        mem.visits = (mem.visits || 0) + 1;
        writeLS(mem); writeIDB(mem);
        document.documentElement.setAttribute('data-snd', 'granted');
        if(navigator.storage && navigator.storage.persist){
          try{ navigator.storage.persist().catch(function(){}); }catch(e){}
        }
        return mem;
      },
      /* ≥7 s of unmuted playback is what Chrome's Media Engagement Index counts,
         and MEI is the one thing that makes a *new* visit autoplay with sound. */
      mei: function(){
        if(!mem) mem = {};
        if(mem.mei) return;
        mem.mei = true; mem.meiAt = Date.now();
        writeLS(mem); writeIDB(mem);
      },
      visit: function(){
        mem = mem || {};
        mem.seen = Date.now();
        writeLS(mem); writeIDB(mem);
      }
    };
    return api;
  })();
  PERM.load(); PERM.visit();
  if(!(PERM.get() && PERM.get().granted)) document.documentElement.setAttribute('data-snd', 'new');

  var unlockBound = false, retryTimer = 0;
  function beginTrack(from){
    trackOn = true;
    playTrack(from || 0);
    PERM.grant();
    /* building MEI: the intro plus the first section tones easily pass 7 s */
    setTimeout(function(){ if(!document.hidden) PERM.mei(); }, 7600);
  }
  function startIntroSound(){
    if(trackOn || !preLive) return;
    if(!SFX.isArmed()) SFX.arm();
    if(SFX.isArmed()){ beginTrack(0); return; }
    /* the grant is a preference, not a permission: if the engine still says no,
       the first gesture starts the track exactly where the intro has reached */
    bindUnlock();
    if(!retryTimer){
      var tries = 0;
      retryTimer = setInterval(function(){
        tries++;
        if(trackOn || !preLive || tries > 15){ clearInterval(retryTimer); retryTimer = 0; return; }
        SFX.arm();
        if(SFX.isArmed()){ beginTrack(Math.max(0, (Date.now() - preStart) / 1000)); }
      }, 400);
    }
  }
  function bindUnlock(){
    if(unlockBound) return;
    unlockBound = true;
    var EVTS = ['pointerdown','pointerup','pointermove','mousedown','touchstart','touchend',
                'click','keydown','wheel','scroll','focus','mousemove'];
    var fire = function(){
      SFX.arm();
      if(SFX.isArmed()) joinTrack();
      if(SFX.isArmed() || !preLive) EVTS.forEach(function(e){ window.removeEventListener(e, fire, true); });
    };
    EVTS.forEach(function(e){ window.addEventListener(e, fire, {capture:true, passive:true}); });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) fire(); }, {passive:true});
    window.addEventListener('pageshow', fire, {passive:true});
  }
  /* ==========================================================================
     LIVE NUMBERS (v10.1) — progressive enhancement only
     --------------------------------------------------------------------------
     The HTML baseline is baked from the last validated Neon snapshot (or an
     explicitly reviewed seed for local preview). If /api/content answers, this
     module refreshes seat fills, remaining counts and meters after paint. Fees,
     schedules, labels, FAQ and JSON-LD are baked by the validated build; a data
     change to those values requires a new build. On error, keep the HTML baseline.
     ========================================================================== */
  /*__LIVE_START__*/
  var LIVE = (function(){
    var started = false;
    function bn(n){
      return String(n).replace(/\d/g, function(d){ return '০১২৩৪৫৬৭৮৯'[+d]; });
    }
    function bnMoney(n){
      var s = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return '৳' + bn(s);
    }
    function setText(el, v){
      if(el && el.textContent !== v) el.textContent = v;
    }
    function esc(s){
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function getDirectDownloadUrl(url){
      if(!url) return '';
      url = String(url).trim();
      var match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if(match && match[1]){
        return 'https://drive.google.com/uc?export=download&id=' + match[1];
      }
      return url;
    }

    function apply(d){
      if(!d || !Array.isArray(d.batches) || typeof d.seatsLeft !== 'number') return false;
      var changed = false;

      // Map incoming batches by ID
      var batchMap = {};
      d.batches.forEach(function(b){ batchMap[b.id] = b; });

      // 1. Update or toggle ALL table rows
      var allRows = document.querySelectorAll('tr[data-batch]');
      allRows.forEach(function(tr){
        var id = tr.getAttribute('data-batch');
        var b = batchMap[id];
        if(!b || b.active === false){
          // Inactive batch: hide from table
          tr.style.display = 'none';
          tr.hidden = true;
          return;
        }
        // Active batch: ensure visible
        tr.style.display = '';
        tr.hidden = false;

        if(tr.getAttribute('data-filled') !== String(b.filled)) changed = true;
        tr.setAttribute('data-filled', b.filled);
        tr.setAttribute('data-cap', b.cap);
        tr.setAttribute('data-left', b.left);

        // Name & badge in td 1
        var bname = tr.querySelector('.bname');
        if(bname){
          var badge = b.hot ? ' <em class="hot">সবচেয়ে চাহিদা</em>' : '';
          bname.innerHTML = esc(b.name_bn) + badge;
        }
        setText(tr.querySelector('.bcode'), b.code || '');

        // Classes in td 2
        if(tr.cells && tr.cells[1]){
          setText(tr.cells[1], b.classes_bn || '');
        }

        // Days & Time in td 3
        if(tr.cells && tr.cells[2]){
          tr.cells[2].innerHTML = esc(b.days_bn || '') + '<br><small>' + esc(b.time_bn || '') + '</small>';
        }

        // Fee in td 4
        var feeEl = tr.querySelector('.fee');
        if(feeEl && b.fee){
          setText(feeEl, bnMoney(b.fee));
        }

        // Meter & Seats count in td 5
        setText(tr.querySelector('[data-filled-txt]') || tr.querySelector('[data-count]'), bn(b.filled) + '/' + bn(b.cap));
        setText(tr.querySelector('[data-left-txt]'), bn(b.left) + ' সিট বাকি');
        var m = tr.querySelector('[data-meter]');
        if(m){
          var pctStr = b.pct + '%';
          m.style.setProperty('--w', pctStr);
          m.style.width = pctStr;
          var meterWrap = m.closest('.seats__meter');
          if(meterWrap){
            if(b.left === 0) meterWrap.classList.add('is-full');
            else meterWrap.classList.remove('is-full');
          }
        }

        // WhatsApp link attribute in td 6
        var waBtn = tr.querySelector('a[data-wa]');
        if(waBtn && b.wa_text){
          waBtn.setAttribute('data-wa', b.wa_text);
        }

        // Hot class
        if(b.hot) tr.classList.add('is-hot');
        else tr.classList.remove('is-hot');
      });

      // 2. Global seats counters across all places
      ['pillSeats', 'drawerSeats', 'ctaSeatNum', 'bookSeatNum', 'stickySeatNum', 'heroSeatsNum', 'ctaSeatNum2'].forEach(function(id){
        setText(document.getElementById(id), bn(d.seatsLeft));
      });
      var heroSeatsBadge = document.querySelector('.badge-seats b');
      if(heroSeatsBadge) setText(heroSeatsBadge, bn(d.seatsLeft));

      // 3. Featured batch in Hero (hot batch or first active)
      var activeBatches = d.batches.filter(function(x){ return x.active !== false; });
      var feat = activeBatches.filter(function(x){ return x.hot; })[0] || activeBatches[0];
      if(feat){
        var nextBatchName = (d.settings && d.settings.next_batch && d.settings.next_batch.label_bn) || feat.name_bn;
        var stripTxt = document.getElementById('heroStripText') || document.querySelector('.seatstrip__top span');
        if(stripTxt){
          stripTxt.innerHTML = '<b>' + esc(nextBatchName) + ' ব্যাচ</b> · ' + bn(feat.cap) + 'টির মধ্যে ' + bn(feat.filled) + 'টি সিট ইতিমধ্যে বুকড';
        }
        var stripLeft = document.getElementById('heroStripLeft') || document.querySelector('.seatstrip__left b');
        if(stripLeft) setText(stripLeft, bn(feat.left));

        var dots = document.getElementById('seatDots');
        if(dots){
          dots.setAttribute('data-cap', feat.cap);
          dots.setAttribute('data-filled', feat.filled);
          dots.setAttribute('data-batch', feat.id);
          var pips = dots.children;
          for(var i = 0; i < pips.length; i++){
            pips[i].className = (i >= feat.filled) ? 'free' : '';
          }
        }
      }

      // 4. Booking form dropdown options (#bkBatch)
      var bkBatch = document.getElementById('bkBatch');
      if(bkBatch && activeBatches.length > 0){
        var curVal = bkBatch.value;
        bkBatch.innerHTML = '';
        activeBatches.forEach(function(b){
          var opt = document.createElement('option');
          opt.value = b.name_bn;
          opt.textContent = b.name_bn + ' (' + b.classes_bn + ') — ' + bnMoney(b.fee) + '/মাস';
          if(curVal === b.name_bn || (!curVal && b.hot)) opt.selected = true;
          bkBatch.appendChild(opt);
        });
      }

      // 5. Next batch labels & countdown
      if(d.settings && d.settings.next_batch){
        var nb = d.settings.next_batch;
        var heroNb = document.getElementById('heroNextBatch') || document.querySelector('.badge-loc');
        if(heroNb && (nb.date_bn || nb.label_bn)){
          heroNb.innerHTML = '<span class="live-dot"></span> নতুন ব্যাচ: ' + esc(nb.date_bn || nb.label_bn);
        }
        var cd = document.getElementById('countdown');
        if(cd && nb.start_at){
          cd.setAttribute('data-target', nb.start_at);
        }
      }

      // 6. Live announcement notice board
      var notice = d.settings && d.settings.notice;
      var topNotice = document.getElementById('topNotice');
      var topNoticeTxt = document.getElementById('topNoticeTxt');
      if(topNotice && topNoticeTxt){
        if(notice && notice.active && notice.text_bn){
          setText(topNoticeTxt, notice.text_bn);
          topNotice.hidden = false;
        } else {
          topNotice.hidden = true;
        }
      }

      // 7. Contact numbers
      if(d.settings && d.settings.contact){
        var c = d.settings.contact;
        if(c.phone_display){
          document.querySelectorAll('a[href^="tel:"]').forEach(function(a){
            if(c.phone_raw) a.href = 'tel:' + c.phone_raw;
          });
        }
        if(c.whatsapp){
          document.querySelectorAll('a[href*="wa.me"]').forEach(function(a){
            a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + c.whatsapp);
          });
        }
      }

      // 8. Dynamic Download Library & PDF resources
      if(d.settings && d.settings.library){
        var lib = d.settings.library;
        var libKicker = document.getElementById('libKicker');
        if(libKicker && lib.section_kicker) setText(libKicker, lib.section_kicker);
        var libTitle = document.getElementById('libTitle');
        if(libTitle && lib.section_title) libTitle.innerHTML = esc(lib.section_title);
        var libLead = document.getElementById('libLead');
        if(libLead && lib.section_lead) setText(libLead, lib.section_lead);

        var vaultGrid = document.getElementById('vaultGrid');
        if(vaultGrid && Array.isArray(lib.items) && lib.items.length > 0){
          var cardsHtml = lib.items.map(function(item){
            var dlUrl = item.drive_url ? getDirectDownloadUrl(item.drive_url) : (item.file_url || '/assets/' + (item.local_file || 'english-dialogue-format.pdf'));
            var tagClass = item.tag_color === 'red' ? 'sheet__tag sheet__tag--red' : 'sheet__tag';
            var fname = item.filename || (item.title ? item.title.replace(/\s+/g, '-') + '.pdf' : 'download.pdf');
            return '<article class="sheet rv in" data-id="' + esc(item.id || '') + '">' +
              '<span class="' + tagClass + '">' + esc(item.tag || 'রিসোর্স') + '</span>' +
              '<div>' +
                '<div class="sheet__code"><svg class="ico" style="width:13px;height:13px"><use href="#i-dl"/></svg> ' + esc(item.code || 'PDF') + '</div>' +
                '<h3>' + esc(item.title || '') + '</h3>' +
                '<p>' + esc(item.desc || '') + '</p>' +
              '</div>' +
              '<div>' +
                '<div class="sheet__foot"><span>' + esc(item.meta_info || 'PDF ফাইল') + '</span><b>DIRECT DOWNLOAD</b></div>' +
                '<a class="btn btn--sm btn--block" href="' + esc(dlUrl) + '" target="_blank" rel="noopener noreferrer" download="' + esc(fname) + '" aria-label="' + esc(item.title || '') + ' সরাসরি ডাউনলোড করুন">PDF ডাউনলোড <svg class="ico"><use href="#i-dl"/></svg></a>' +
              '</div>' +
            '</article>';
          }).join('');
          vaultGrid.innerHTML = cardsHtml;
        }
      }

      // 9. Dynamic Mock Test Results
      if(d.settings && d.settings.mock_results && typeof d.settings.mock_results === 'object'){
        var liveResults = d.settings.mock_results;
        var rKeys = Object.keys(liveResults);
        if(rKeys.length > 0){
          for(var k in mockResultsData){ delete mockResultsData[k]; }
          for(var i = 0; i < rKeys.length; i++){
            var rKey = rKeys[i].toUpperCase();
            var item = liveResults[rKeys[i]];
            if(item && typeof item === 'object'){
              item.roll = rKey;
              mockResultsData[rKey] = item;
            }
          }
          if(typeof window.__updateMockResultsUI === 'function'){
            window.__updateMockResultsUI();
          }
        }
      }

      // 10. Dynamic Hall of Fame Marquee
      if(d.settings && Array.isArray(d.settings.hall_of_fame) && d.settings.hall_of_fame.length > 0){
        var fameRow = document.getElementById('fameRow');
        if(fameRow){
          var fameHtml = d.settings.hall_of_fame.map(function(it){
            var col = (it.badge_color || '').trim().toLowerCase();
            var colCls = (col === 'red' || col === 'brass') ? ' ' + col : '';
            var bText = esc(it.badge_text || 'A+\nSSC').replace(/\n/g, '<br>');
            return '<div class="fame-card"><div class="inst' + colCls + '">' + bText + '</div><div><b>' + esc(it.name || '') + '</b><small>' + esc(it.meta || '') + '</small></div></div>';
          }).join('');
          fameRow.innerHTML = fameHtml + fameHtml;
        }
      }

      document.documentElement.setAttribute('data-live', changed ? 'updated' : 'synced');
      return changed;
    }

    function run(){
      if(started) return;
      if(location.protocol === 'file:' || !window.fetch) return;
      started = true;
      fetch('/api/content?t=' + Date.now(), { cache: 'no-cache', credentials: 'omit' })
        .then(function(r){ return r.ok ? r.json() : Promise.reject(new Error('http ' + r.status)); })
        .then(apply)
        .catch(function(){ document.documentElement.setAttribute('data-live', 'offline'); });
    }
    return { run: run, apply: apply };
  })();
  window.__applyLive = LIVE.apply;
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LIVE.run, { once: true });
  } else {
    LIVE.run();
  }
  /*__LIVE_END__*/

  /* ==========================================================================
     PWA (v10.1) — install the site and the browser grants sound permanently.
     Chrome/Android and iOS allow unmuted autoplay for an *installed* app, which
     is the only durable permission that exists. Registration is silent, never
     in the offline file, and never affects the page if it fails.
     ========================================================================== */
  (function(){
    if(!('serviceWorker' in navigator)) return;
    if(location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
    window.addEventListener('load', function(){
      setTimeout(function(){
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(function(reg){
            document.documentElement.setAttribute('data-pwa', 'ready');
            /* a brand-new worker takes over on the next load, no reload prompt */
            if(reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          })
          .catch(function(){ document.documentElement.setAttribute('data-pwa', 'off'); });
      }, 2600);          // well after the intro: never competes with it
    }, { once: true });
  })();

  window.__startIntroSound = startIntroSound;

  function runPreloader(force){
    if(!pre) return;
    if(!force && (reduced || SKIP_INTRO)){ hidePreloader(); return; }
    if(pre._tl){ try{ pre._tl.kill(); }catch(e){} pre._tl = null; }
    if(hasGSAP) gsap.killTweensOf('#preloader, .pre__mark, .pre__rings i, .pre__sweep, #sliceTop, #sliceBot, #preSlash, .pre__cx, .pre__cy, .pre__dots i');
    pre.hidden = false;
    trackOn = false;               // a replay gets its own soundtrack
    heroRan = false;               // … and its own hero entrance
    document.documentElement.classList.add('lock');

    var bar   = $('#preBar');
    var pctEl = $('#prePct');
    var stageEl = $('#preStage');
    var angleEl = $('#preAngle');
    var ticks = $$('#preTicks i');
    var dots  = $$('#preDots i');
    var beats = $$('#preBeat i');
    ticks.forEach(function(t){ t.classList.remove('on'); });
    if(bar) bar.style.width = '0%';
    preStart = Date.now();
    preLive = true;

    if(!hasGSAP){
      if(bar) bar.style.width = '100%';
      setTimeout(hidePreloader, 1800);
      return;
    }

    /* ---- 1. reset every layer so a replay always starts clean ---- */
    gsap.set('.pre__rings i', {scale:.5, opacity:0, transformOrigin:'50% 50%'});
    gsap.set('.pre__mark',   {scale:.32, rotation:-210, opacity:0, transformOrigin:'50% 50%'});
    gsap.set('.pre__sweep',  {opacity:0, scale:.7});
    gsap.set('.pre__flash',  {opacity:0, scale:.2});
    gsap.set('#preloader',   {clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', backgroundColor:'#0A0A0A'});
    gsap.set('#sliceTop',    {xPercent:-118, opacity:1});
    gsap.set('#sliceBot',    {xPercent:118, opacity:1});
    gsap.set('#preSlash',    {scaleX:0, opacity:1});
    gsap.set('.pre__cx',     {scaleX:0});
    gsap.set('.pre__cy',     {scaleY:0});
    gsap.set(ticks,          {opacity:0, rotation:function(i){ return i * 15; }, transformOrigin:'50% 0'});
    gsap.set(dots,           {opacity:0, x:0, y:0, scale:1});
    gsap.set(beats,          {scaleY:.25, opacity:.35});
    gsap.set('.pre__slice',  {opacity:1});
    gsap.set(['.pre__brand','.pre__bn','.pre__sub','.pre__bar','.pre__beat'],
             {opacity:0, y:14});

    /* the tick ring: 24 marks around the compass */
    if(ticks.length && !ticks[0].dataset.built){
      // geometry is set once; each mark points outward from the centre
      ticks.forEach(function(t, i){
        var deg = i * 15;
        t.style.transform = 'rotate(' + deg + 'deg) translateY(-96px)';
      });
      ticks[0].dataset.built = '1';
    }

    /* ---- 2. the track starts on its own ---- */
    startIntroSound();

    /* ---- 3. the timeline ---- */
    var tl = gsap.timeline({onComplete:hidePreloader});
    var clock = {v:0};                                   // drives % + stage labels
    var STAGES = [[0,'BOOT'],[.5,'SPIN-UP'],[1.35,'ASSEMBLE'],[2.35,'CHARGE'],[2.8,'LOCK']];
    function stageFor(t){ var s = 'BOOT'; for(var i = 0; i < STAGES.length; i++){ if(t >= STAGES[i][0]) s = STAGES[i][1]; } return s; }
    var lastPaint = 0;
    tl.to(clock, {v:100, duration:PRE_TOTAL - 0.3, ease:'none', onUpdate:function(){
      var now = performance.now();
      // The intro clock/audio keep full precision; decorative meters paint at 20 fps.
      // Avoid thousands of redundant style writes on the first, CPU-limited render.
      if(now - lastPaint < 50 && clock.v < 100) return;
      lastPaint = now;
      var t = tl.time();
      var pct = Math.round(clock.v);
      if(pct !== clock._lastPct){
        clock._lastPct = pct;
        if(bar) bar.style.width = pct + '%';
        var pc = String(pct).padStart(3, '0');
        if(pctEl && pctEl.textContent !== pc) pctEl.textContent = pc;
      }
      var st = stageFor(t);
      if(stageEl && stageEl.textContent !== st) stageEl.textContent = st;
      // the bar "breathes" with the same timeline beat while it loads
      var phase = (t % (TRACK_BEAT * 2)) / (TRACK_BEAT * 2);
      if(beats.length){
        var k = phase < .5 ? Math.sin(phase * Math.PI * 2) : 0;
        beats.forEach(function(b, i){
          b.style.transform = 'scaleY(' + (0.25 + Math.abs(k) * (i % 2 ? 0.9 : 1) * 1.9) + ')';
          b.style.opacity = (0.35 + Math.abs(k) * 0.5).toFixed(2);
        });
      }
    }}, 0);

    /* compass angle: 0 → 360 across the whole intro */
    var ang = {v:0}, lastDeg = -1, lastLit = 0;
    tl.to(ang, {v:360, duration:PRE_TOTAL - 0.45, ease:'none', onUpdate:function(){
      var raw = Math.min(360, Math.round(ang.v));
      var deg = raw >= 360 ? 360 : Math.floor(raw / 5) * 5;
      if(deg === lastDeg) return;
      lastDeg = deg;
      if(angleEl) angleEl.textContent = 'ANGLE: ' + (deg >= 360 ? '360° // LOCK' : deg + '°');
      var lit = Math.floor(deg / 15);
      if(lit !== lastLit){
        for(var i = Math.min(lit, lastLit); i < Math.max(lit, lastLit); i++){
          if(ticks[i]) ticks[i].classList.toggle('on', i < lit);
        }
        lastLit = lit;
      }
    }}, 0);

    /* 0.00 — BOOT: crosshair draws, ticks fade in */
    tl.to('.pre__cx', {scaleX:1, duration:.55, ease:'expo.out'}, 0)
      .to('.pre__cy', {scaleY:1, duration:.55, ease:'expo.out'}, .05)
      .to(ticks, {opacity:1, duration:.5, stagger:{each:.008, from:'start'}, ease:'power2.out'}, .1)
      .set('.pre__slices', {opacity:1}, 0);

    /* 0.40 — SPIN-UP: the mark rotates in, rings bloom, sweep starts */
    tl.to('.pre__mark', {scale:1, rotation:0, opacity:1, duration:1.05, ease:'expo.out'}, .4)
      .to('.pre__rings i', {scale:1, opacity:1, duration:.7, stagger:.14, ease:'expo.out'}, .5)
      .to('.pre__sweep', {opacity:1, scale:1, duration:.4}, .8)
      .to('.pre__sweep', {rotation:'+=1080', duration:2.4, ease:'none'}, .8);

    /* 1.35 — ASSEMBLE: band slides in, name + bar reveal */
    tl.to('#sliceTop', {xPercent:-3, duration:.55, ease:'expo.out'}, 1.35)
      .to('#sliceBot', {xPercent:3, duration:.55, ease:'expo.out'}, 1.35)
      .to('.pre__brand', {opacity:1, y:0, duration:.4}, 1.45)
      .to('.pre__bn',    {opacity:1, y:0, duration:.35}, 1.55)
      .to('.pre__sub',   {opacity:1, y:0, duration:.35}, 1.62)
      .to('.pre__bar',   {opacity:1, y:0, duration:.25}, 1.55)
      .to('.pre__beat',  {opacity:1, y:0, duration:.25}, 1.6);

    /* 2.35 — CHARGE: the lockup pulls in, dots charge, bar slows to a crawl */
    tl.to('.pre__lockup', {scale:.96, duration:.45, ease:'sine.inOut'}, 2.35)
      .to('.pre__lockup', {scale:1.04, duration:.3, ease:'sine.inOut'}, 2.8)
      .to(dots, {opacity:1, duration:.2}, 2.45)
      .to(dots, {
        x:function(i){ return Math.cos(i / dots.length * Math.PI * 2) * (120 + (i % 3) * 34); },
        y:function(i){ return Math.sin(i / dots.length * Math.PI * 2) * (120 + (i % 3) * 34); },
        scale:.4, opacity:0, duration:.85, ease:'expo.out', stagger:.02
      }, 2.5);

    /* 2.82 — LOCK: flash, slash slams, band rips, colour flashes */
    tl.to('#preSlash', {scaleX:1, duration:.12, ease:'power4.out'}, 2.8)
      .to('.pre__flash', {opacity:1, scale:1.1, duration:.12, ease:'power2.out'}, 2.82)
      .to('.pre__flash', {opacity:0, scale:1.5, duration:.4, ease:'power2.out'}, 2.94)
      .to('.pre__mark', {scale:1.14, duration:.1, ease:'power2.out'}, 2.82)
      .to('.pre__mark', {scale:1, duration:.35, ease:'elastic.out(1,.4)'}, 2.92)
      .to('#preloader', {backgroundColor:'#0E4B43', duration:.07}, 2.84)
      .to('#preloader', {backgroundColor:'#D42C24', duration:.07}, 2.91)
      .to('#preloader', {backgroundColor:'#0A0A0A', duration:.07}, 2.98);

    /* 3.02 — the band rips sideways and the shutter opens on a settled hero */
    tl.to('#sliceTop', {xPercent:-125, duration:.32, ease:'expo.in'}, 3.02)
      .to('#sliceBot', {xPercent:125, duration:.32, ease:'expo.in'}, 3.02)
      .to('#preSlash', {opacity:0, duration:.12}, 3.14)
      .to('.pre__slices', {opacity:0, duration:.1}, 3.2)
      .call(heroIntro, null, 0)
      .to('#preloader', {clipPath:'polygon(100% 0%,100% 0%,100% 100%,100% 100%)',
                         duration:.62, ease:'expo.inOut'}, 3.02);

    /* stretch, do not re-author: every position above stays in design time,
       the timeline just runs slower, so the beats and the stage labels still line up */
    tl.timeScale(1 / PRE_STRETCH);
    pre._tl = tl;
  }

  var heroRan = false;
  function heroIntro(){
    if(heroRan || !hasGSAP || reduced) return;
    heroRan = true;
    var t = gsap.timeline();
    t.from('.hero h1 .w',{yPercent:130,duration:.62,stagger:.055,ease:'expo.out'},0)
     .from('.hero__badges > *',{y:12,duration:.38,stagger:.05},0)
     .from('.hero__en',{y:10,duration:.38},.16)
     .from('.hero__lead',{y:12,duration:.42},.2)
     .from('.hero__cta .btn',{y:12,stagger:.06,duration:.4},.26)
     .from('.hero__stats .stat',{y:14,stagger:.06,duration:.4},.3)
     .from('.seatstrip',{y:12,duration:.4},.36)
     .from('#teacherCard',{y:20,rotate:.9,duration:.7,ease:'expo.out'},.05);
  }

  if(pre){
    var skip = $('#preSkip');
    if(skip) skip.addEventListener('click', function(){
      if(pre._tl) pre._tl.kill();
      if(hasGSAP) gsap.killTweensOf('#preloader, .pre__mark, .pre__rings i, .pre__sweep, #sliceTop, #sliceBot, #preSlash, .pre__cx, .pre__cy');
      SFX.stopAll();                    // silence the remaining scheduled notes instantly
      heroIntro();
      hidePreloader();
    });
    if(reduced || SKIP_INTRO){
      runPreloader();
    } else {
      // Let the first frame paint before constructing the staged GSAP timeline;
      // the complete intro still runs for its authored duration and its sound
      // starts with that timeline.
      requestAnimationFrame(function(){ if(pre && !pre.hidden) runPreloader(); });
    }
  }
  var replay = $('#replayBtn');
  if(replay) replay.addEventListener('click', function(){
    SFX.set(true);                     // an explicit gesture: turn sound back on for the replay
    paintSound(true);
    if(pre) pre.hidden = false;
    runPreloader(true);                // force: the replay must not hit the skip guards
  });
  window.addEventListener('intro:done', heroIntro, {once:true});
  if(document.body.classList.contains('intro-done')) heroIntro();

  /* ============================================================
     HEADER (always visible) + drawer
     ============================================================ */
  var burger = $('#burger');
  function setMenu(open){
    var wasOpen = document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    if(wasOpen !== open) SFX.play(open ? 'open' : 'press');
    if(burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    var d = $('#drawer');
    if(d){
      d.setAttribute('aria-hidden', open ? 'false' : 'true');
      if(open){ d.removeAttribute('inert'); } else { d.setAttribute('inert', ''); }
    }
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(!document.body.classList.contains('menu-open')); });
  $$('#drawer a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });

  var sticky = $('#stickyCta'), lastScrollY = window.scrollY;
  function onScroll(){
    onScrollProgress();
    if(Math.abs(window.scrollY - lastScrollY) > 8){ SFX.play('scroll'); lastScrollY = window.scrollY; }
    if(sticky){
      var nearBook = false;
      var bk = $('#book');
      if(bk){
        var r = bk.getBoundingClientRect();
        nearBook = r.top < window.innerHeight * 0.92 && r.bottom > 0;
      }
      sticky.classList.toggle('show', window.scrollY > 620 && !nearBook);
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ onScroll(); ticking = false; });
  }, {passive:true});
  onScroll();

  var navLinks = $$('.nav a');
  if('IntersectionObserver' in window){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var id = en.target.id;
          navLinks.forEach(function(a){ a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
        }
      });
    },{rootMargin:'-45% 0px -50% 0px'});
    ['why','method','lab','teacher','batches','library','results'].forEach(function(id){
      var el = document.getElementById(id); if(el) spy.observe(el);
    });
  }

  /* The earlier ink-spill hover is retired. Instructor portraits now use the
     separate maths-veil treatment near the end of this file; keep no second
     pointer-driven image effect active here. */


  /* ============================================================
     REVEALS
     ============================================================ */
  var revealEls = $$('.rv, .rv-l, .mask-line');
  if('IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en, i){
        if(en.isIntersecting){
          var el = en.target;
          setTimeout(function(){ el.classList.add('in'); }, Math.min(i * 60, 200));
          io.unobserve(el);
        }
      });
    },{threshold:.1, rootMargin:'0px 0px -6% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else revealEls.forEach(function(el){ el.classList.add('in'); });

  /* ============================================================
     COUNTERS
     ============================================================ */
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (String(target).split('.')[1] || '').length;
    var start = performance.now(), dur = 1200;
    function frame(now){
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = toBn((target * e).toFixed(dec)) + suffix;
      if(p < 1) requestAnimationFrame(frame);
      else el.textContent = toBn(target.toFixed(dec)) + suffix;
    }
    requestAnimationFrame(frame);
  }
  var counters = $$('.stat__num[data-count]');
  if('IntersectionObserver' in window && !reduced){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCount(en.target); cio.unobserve(en.target); }
      });
    },{threshold:.5});
    counters.forEach(function(c){ cio.observe(c); });
  } else counters.forEach(function(c){
    c.textContent = toBn(parseFloat(c.getAttribute('data-count')) || 0) + (c.getAttribute('data-suffix') || '');
  });

  /* ---------- seat dots ----------
     Drawn from the same numbers as the strip above them ({{CAP}} / {{FEAT_FILLED}}), so a
     change in the database can never leave a strip saying "১৬ out of ২০" next to twelve
     pips — which is exactly what the hard-coded 12/9 pair did. */
  (function(){
    var dots = $('#seatDots');
    if(!dots) return;
    var cap = parseInt(dots.getAttribute('data-cap'), 10) || 0;
    var filled = parseInt(dots.getAttribute('data-filled'), 10) || 0;
    for(var i = 0; i < cap; i++){
      var d = document.createElement('i');
      if(i >= filled) d.className = 'free';
      dots.appendChild(d);
    }
  })();

  /* ---------- counting seats in table meters ---------- */
  if('IntersectionObserver' in window){
    var mio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var bar = en.target;
          bar.style.width = bar.style.getPropertyValue('--w') || '0%';
          mio.unobserve(bar);
        }
      });
    },{threshold:.4});
    $$('.seats__meter i').forEach(function(b){ mio.observe(b); });
  } else {
    $$('.seats__meter i').forEach(function(b){ b.style.width = b.style.getPropertyValue('--w') || '0%'; });
  }

  /* ============================================================
     HERO — teacher card tilt
     ============================================================ */
  (function(){
    var card = $('#teacherCard');
    if(!card || reduced || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'perspective(900px) rotateY(' + (x*5).toFixed(2) + 'deg) rotateX(' + (-y*5).toFixed(2) + 'deg) translate(-3px,-3px)';
      card.style.boxShadow = (13 + x*-4) + 'px ' + (13 + y*-4) + 'px 0 var(--ink)';
    });
    card.addEventListener('pointerleave', function(){ card.style.transform = ''; card.style.boxShadow = ''; });
  })();

  /* ============================================================
     METHOD LAB — 4 simple examples (initialized as the section approaches)
     ============================================================ */
  initWhenVisible($('#methodLab'), function(){
  var labData = [
    {
      q:'১ থেকে ১০০ পর্যন্ত সব সংখ্যার যোগফল কত?',
      badTime:'সময়: ৫ মিনিট', goodTime:'সময়: ২০ সেকেন্ড',
      bad:[
        '১ + ২ = ৩, +৩ = ৬, +৪ = ১০ … এভাবে একটার পর একটা যোগ করতে হবে',
        '১০০টি সংখ্যা — প্রতি লাইনে একটা ভুল হলে পুরো উত্তর ভুল',
        'খাতায় ২০ লাইন লেখা, শেষে মিলিয়ে দেখার সময়ও নেই'
      ],
      good:[
        'প্রথম + শেষ: <b>১ + ১০০ = ১০১</b>',
        'এভাবে জোড়া হয় <b>৫০টি</b> — প্রতিটির যোগফল একই <b>১০১</b>',
        'তাহলে <b style="color:var(--teal)">৫০ × ১০১ = ৫,০৫০</b> — এক লাইনে উত্তর'
      ],
      badRisk:60, goodRisk:2, badW:100, goodW:7,
      save:'৪ মিনিট ৪০ সেকেন্ড', risk:'৫৮%',
      why:'প্রথম আর শেষ সংখ্যা জুড়লে সব জোড়ায় একই যোগফল আসে — তাই ১০০টি সংখ্যা যোগ না করে ৫০টি জোড়ার যোগফল একবার বের করলেই হয়।'
    },
    {
      q:'৮০০-এর ১২.৫% কত?',
      badTime:'সময়: ২ মিনিট', goodTime:'সময়: ৫ সেকেন্ড',
      bad:[
        'প্রথমে ৮০০ × ১২ = ৯৬০০ বের করতে হবে',
        'তারপর ৯৬০০ ÷ ১০০ — দশমিকের দিকে খেয়াল রাখতে হবে',
        'শতকরা অঙ্কে ছোট ভুল হলেও পুরো উত্তর ভুল'
      ],
      good:[
        '১২.৫% মানে <b>১/৮</b> — এটা মনে রাখলেই অর্ধেক কাজ শেষ',
        '<b>৮০০ ÷ ৮ = ১০০</b>',
        'হিসেব নয়, শুধু একবার ভাগ — <b style="color:var(--teal)">উত্তর ১০০</b>'
      ],
      badRisk:45, goodRisk:3, badW:100, goodW:4,
      save:'১ মিনিট ৫৫ সেকেন্ড', risk:'৪২%',
      why:'শতকরাকে ভগ্নাংশে বদলালে হিসেব সহজ হয়। ১২.৫% = ১/৮, ২৫% = ১/৪, ২০% = ১/৫ — মুখস্থ নয়, ভগ্নাংশটা দেখলেই বোঝা যায়।'
    },
    {
      q:'৭৫-এর বর্গ কত? (৭৫ × ৭৫)',
      badTime:'সময়: ১ মিনিট ৩০ সেকেন্ড', goodTime:'সময়: ৫ সেকেন্ড',
      bad:[
        '৭৫ × ৫ = ৩৭৫, তারপর ৭৫ × ৭ = ৫২৫ — দুটো সাজিয়ে যোগ',
        'সারিতে বসানোয় একটা ঘর এদিক-ওদিক হলেই উত্তর ভুল',
        'পরীক্ষায় এই সময়টা অন্য প্রশ্নে লাগানো যেত'
      ],
      good:[
        'যে সংখ্যা ৫-এ শেষ হয়, তার আগের অঙ্কটা নাও: <b>৭</b>',
        '<b>৭ × ৮ = ৫৬</b> (৮ হলো পরের সংখ্যা)',
        'শেষে <b>২৫</b> বসাও: <b style="color:var(--teal)">৫৬২৫</b> — শেষ!'
      ],
      badRisk:55, goodRisk:2, badW:100, goodW:5,
      save:'১ মিনিট ২৫ সেকেন্ড', risk:'৫৩%',
      why:'৫-এ শেষ হওয়া সংখ্যাকে (10a+5) ধরে বর্গ করলে সবসময় a(a+1) এর পরে ২৫ বসে। ৮৫² = ৮×৯=৭২, তারপর ২৫ → ৭২২৫।'
    },
    {
      q:'বৃত্তের কেন্দ্র (0,0), ব্যাসার্ধ ৫। (3,4) বিন্দু দিয়ে স্পর্শকের সমীকরণ কী?',
      badTime:'সময়: ৪ মিনিট', goodTime:'সময়: ৪৫ সেকেন্ড',
      bad:[
        'স্পর্শকের সমীকরণ ধরো: <b>y − 4 = m(x − 3)</b>',
        'এটাকে বৃত্তের সমীকরণে বসিয়ে দ্বিঘাত বানাও',
        'নিশ্চায়ক <b>D = 0</b> বসিয়ে m-এর আরেক দ্বিঘাত সমাধান করো',
        'দুই ধাপের হিসেব — এক জায়গায় চিহ্ন ভুল হলে উত্তর ভুল'
      ],
      good:[
        'ছবি আঁকো: ব্যাসার্ধ <b>OP</b>-এর ঢাল = <b>৪/৩</b>',
        'স্পর্শক ব্যাসার্ধের উপর লম্ব, তাই ঢাল = <b>−৩/৪</b>',
        '<b style="color:var(--teal)">৩x + ৪y = ২৫</b> — এক লাইনেই উত্তর'
      ],
      badRisk:50, goodRisk:3, badW:100, goodW:18,
      save:'৩ মিনিট ১৫ সেকেন্ড', risk:'৪৭%',
      why:'স্পর্শক সবসময় ব্যাসার্ধের উপর লম্ব হয়। ছবিতে সেটা দেখা যায়, তাই ঢাল উল্টে-বিপরীত করলেই সমীকরণ তৈরি — বড় দ্বিঘাত লাগেই না।'
    }
  ];

  var lab = $('#methodLab');
  if(lab){
    var badSteps = $('#badSteps'), goodSteps = $('#goodSteps');
    var badTime = $('#badTime'), goodTime = $('#goodTime');
    var labQ = $('#labQ p'), labWhy = $('#labWhy p');
    var labSave = $('#labTimeSave'), labErrSave = $('#labErrSave');
    var goodTimePct = $('#goodTimePct'), goodRiskPct = $('#goodRiskPct'), badRiskPct = $('#badRiskPct');

    function paintMeters(){
      $$('[data-meter]', lab).forEach(function(bar){
        var w = bar.getAttribute('data-w');
        bar.style.width = '0%';
        setTimeout(function(){ bar.style.width = w + '%'; }, 50);
      });
    }

    function renderProblem(i){
      var p = labData[i]; if(!p) return;
      labQ.textContent = p.q;
      labWhy.textContent = p.why;
      badTime.textContent = p.badTime; goodTime.textContent = p.goodTime;
      badSteps.innerHTML = p.bad.map(function(t,n){
        return '<div class="lab__step' + (n === p.bad.length-1 ? ' cross' : '') + '"><i>' + toBn(n+1) + '</i><span>' + t + '</span></div>';
      }).join('');
      goodSteps.innerHTML = p.good.map(function(t,n){
        return '<div class="lab__step"><i>' + toBn(n+1) + '</i><span>' + t + '</span></div>';
      }).join('');
      var badBars = $$('[data-meter]', lab.querySelector('.lab__panel--bad'));
      var goodBars = $$('[data-meter]', lab.querySelector('.lab__panel--good'));
      if(badBars[0]) badBars[0].setAttribute('data-w', 100);
      if(badBars[1]) badBars[1].setAttribute('data-w', p.badRisk);
      if(goodBars[0]) goodBars[0].setAttribute('data-w', p.goodW);
      if(goodBars[1]) goodBars[1].setAttribute('data-w', p.goodRisk);
      if(badRiskPct) badRiskPct.textContent = toBn(p.badRisk) + '%';
      if(goodTimePct) goodTimePct.textContent = toBn(p.goodW) + '%';
      if(goodRiskPct) goodRiskPct.textContent = toBn(p.goodRisk) + '%';
      labSave.textContent = p.save;
      labErrSave.textContent = p.risk + ' ভুলের ঝুঁকি কমে';
      paintMeters();
    }

    $$('.lab__switch button', lab).forEach(function(btn){
      btn.addEventListener('click', function(){
        $$('.lab__switch button', lab).forEach(function(b){ b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
        renderProblem(+btn.getAttribute('data-problem'));
      });
    });
    renderProblem(0);

    var labSeen = false;
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        if(en[0].isIntersecting && !labSeen){ labSeen = true; paintMeters(); }
      },{threshold:.2}).observe(lab);
    } else paintMeters();
  }
  });

  /* ============================================================
     TOOL TABS
     ============================================================ */
  var tabs = $$('.tab');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      if(tab.getAttribute('aria-selected') !== 'true') SFX.play('tab');
      tabs.forEach(function(t){
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if(panel) panel.hidden = !on;
      });
    });
  });

  initWhenVisible($('#panel-circle'), function(){
  /* ============================================================
     TOOL 1 — circle & line
     ============================================================ */
  (function(){
    var svg = $('#demoSvg'); if(!svg) return;
    var K = 19, CX = 300, CY = 210;
    var circle = $('#demoCircle'), line = $('#demoLine'), perp = $('#demoPerp');
    var ptA = $('#ptA'), ptB = $('#ptB'), radius = $('#demoRadius');
    var lblD = $('#lblD'), lblR = $('#lblR'), stateTag = $('#stateTag');
    var rRange = $('#rRange'), dRange = $('#dRange');
    var rVal = $('#rVal'), dVal = $('#dVal');
    var outD = $('#outD'), outR = $('#outR'), outDiff = $('#outDiff'), outState = $('#outState');
    function f1(n){ return (Math.round(n*10)/10).toFixed(1); }

    function update(){
      var r = parseFloat(rRange.value), d = parseFloat(dRange.value);
      var rp = r*K, dp = d*K, y = CY - dp;
      rVal.textContent = toBn(f1(r)); dVal.textContent = toBn(f1(d));
      outD.textContent = toBn(f1(d)); outR.textContent = toBn(f1(r));
      var diff = Math.abs(d-r);
      outDiff.textContent = (d > r ? '+' : d === r ? '' : '−') + toBn(f1(diff));

      circle.setAttribute('r', rp);
      line.setAttribute('y1', y); line.setAttribute('y2', y);
      perp.setAttribute('y2', y);
      lblD.setAttribute('x', CX + 9);
      lblD.setAttribute('y', (CY + y)/2 + 4);
      lblR.setAttribute('x', CX + rp*0.62);
      lblR.setAttribute('y', CY - rp*0.3);

      var ang = -Math.PI/5;
      radius.setAttribute('x2', CX + Math.cos(ang)*rp);
      radius.setAttribute('y2', CY + Math.sin(ang)*rp);

      var dx = 0;
      if(Math.abs(d-r) < 0.01) dx = 0;
      else if(d < r) dx = Math.sqrt(Math.max(0, rp*rp - dp*dp));

      if(d < r){
        ptA.setAttribute('cx', CX+dx); ptA.setAttribute('cy', y);
        ptB.setAttribute('cx', CX-dx); ptB.setAttribute('cy', y);
        ptA.style.display = ptB.style.display = '';
        line.setAttribute('stroke', '#D42C24');
        stateTag.textContent = 'STATE: SECANT · 2 POINTS';
        stateTag.setAttribute('fill', '#D42C24');
        outState.textContent = 'ছেদক — ২টি বিন্দু';
        outState.className = 'state';
      } else if(Math.abs(d-r) < 0.01){
        ptA.setAttribute('cx', CX); ptA.setAttribute('cy', y);
        ptB.style.display = 'none'; ptA.style.display = '';
        line.setAttribute('stroke', '#0E4B43');
        stateTag.textContent = 'STATE: TANGENT · 1 POINT';
        stateTag.setAttribute('fill', '#0E4B43');
        outState.textContent = 'স্পর্শক — ১টি বিন্দু (d = r)';
        outState.className = 'state ok';
      } else {
        ptA.style.display = 'none'; ptB.style.display = 'none';
        line.setAttribute('stroke', '#9A9E9C');
        stateTag.textContent = 'STATE: NO INTERSECTION';
        stateTag.setAttribute('fill', '#8A8E8C');
        outState.textContent = 'ছেদ নেই — রেখা বাইরে';
        outState.className = 'state bad';
      }
    }
    rRange.addEventListener('input', update);
    dRange.addEventListener('input', update);
    $('#demoTangent').addEventListener('click', function(){
      dRange.value = rRange.value; update();
      toast('স্পর্শক তৈরি হলো', 'd = r — রেখা বৃত্তকে ঠিক এক বিন্দুতে ছুঁয়েছে', 'ok');
    });
    $('#demoReset').addEventListener('click', function(){ rRange.value = 5; dRange.value = 3.5; update(); });
    update();
  })();

  /* ============================================================
     TOOL 2 — triangle angles
     ============================================================ */
  (function(){
    var svg = $('#triSvg'); if(!svg) return;
    var aR = $('#aRange'), bR = $('#bRange');
    var poly = $('#triPoly'), arcA = $('#arcA'), arcB = $('#arcB'), arcC = $('#arcC');
    var tA = $('#tA'), tB = $('#tB'), tC = $('#tC');
    var sumTxt = $('#triSum'), kindTxt = $('#triKind');
    var aVal = $('#aVal'), bVal = $('#bVal');
    var outA = $('#outA'), outB = $('#outB'), outC = $('#outC'), outKind = $('#outKind');

    function arcAt(P, Q, R, rad){
      // interior arc at vertex P between edges P->Q and P->R
      var a1 = Math.atan2(Q[1]-P[1], Q[0]-P[0]);
      var a2 = Math.atan2(R[1]-P[1], R[0]-P[0]);
      var d = a2 - a1;
      while(d > Math.PI) d -= Math.PI*2;
      while(d < -Math.PI) d += Math.PI*2;
      var x1 = P[0] + rad*Math.cos(a1), y1 = P[1] + rad*Math.sin(a1);
      var x2 = P[0] + rad*Math.cos(a1 + d), y2 = P[1] + rad*Math.sin(a1 + d);
      var large = Math.abs(d) > Math.PI ? 1 : 0;
      var sweep = d > 0 ? 1 : 0;
      return 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + rad + ' ' + rad + ' 0 ' + large + ' ' + sweep + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1);
    }

    function update(){
      var A = parseFloat(aR.value), B = parseFloat(bR.value);
      if(A + B > 174){ B = 174 - A; bR.value = B; }
      var C = 180 - A - B;

      var R = 120;
      var a = 2*R*Math.sin(A*Math.PI/180);
      var b = 2*R*Math.sin(B*Math.PI/180);
      var Bx = 0, By = 0;
      var Cx = a, Cy = 0;
      var Ax = b*Math.cos(B*Math.PI/180), Ay = -b*Math.sin(B*Math.PI/180);

      var minX = Math.min(Ax,Bx,Cx), maxX = Math.max(Ax,Bx,Cx);
      var minY = Math.min(Ay,By,Cy), maxY = Math.max(Ay,By,Cy);
      var sc = Math.min(430/(maxX-minX), 250/(maxY-minY));
      var offX = 300 - (minX+maxX)/2*sc, offY = 238 - (minY+maxY)/2*sc;
      function P(x,y){ return [x*sc+offX, y*sc+offY]; }
      var pA = P(Ax,Ay), pB = P(Bx,By), pC = P(Cx,Cy);

      poly.setAttribute('points', [pA,pB,pC].map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '));
      tA.setAttribute('x', (pA[0]-9).toFixed(1)); tA.setAttribute('y', (pA[1]-12).toFixed(1));
      tB.setAttribute('x', (pB[0]-16).toFixed(1)); tB.setAttribute('y', (pB[1]+24).toFixed(1));
      tC.setAttribute('x', (pC[0]+10).toFixed(1)); tC.setAttribute('y', (pC[1]+24).toFixed(1));

      var rad = Math.max(22, Math.min(40, 2200/Math.max(A,B,C)));
      arcA.setAttribute('d', arcAt(pA, pB, pC, rad));
      arcB.setAttribute('d', arcAt(pB, pC, pA, rad));
      arcC.setAttribute('d', arcAt(pC, pA, pB, rad));

      var kind = (A===B && B===C) ? 'সমবাহু ত্রিভুজ' :
                 (A===B || B===C || A===C) ? 'সমদ্বিবাহু ত্রিভুজ' :
                 (A>90||B>90||C>90) ? 'স্থূলকোণী ত্রিভুজ' :
                 (A===90||B===90||C===90) ? 'সমকোণী ত্রিভুজ' : 'বিষমবাহু ত্রিভুজ';

      aVal.textContent = toBn(A)+'°'; bVal.textContent = toBn(B)+'°';
      outA.textContent = toBn(A)+'°'; outB.textContent = toBn(B)+'°'; outC.textContent = toBn(C)+'°';
      outKind.textContent = kind; kindTxt.textContent = kind;
      sumTxt.textContent = 'A + B + C = ' + (A+B+C) + ' deg';
    }
    aR.addEventListener('input', update);
    bR.addEventListener('input', update);
    $$('[data-preset]').forEach(function(b){
      b.addEventListener('click', function(){
        var v = b.getAttribute('data-preset').split(',');
        aR.value = v[0]; bR.value = v[1]; update();
      });
    });
    update();
  })();

  /* ============================================================
     TOOL 3 — Pythagoras
     ============================================================ */
  (function(){
    var svg = $('#pythSvg'); if(!svg) return;
    var aR = $('#paRange'), bR = $('#pbRange');
    var sqA = $('#sqA'), sqB = $('#sqB'), sqC = $('#sqC'), tri = $('#pTri');
    var lblA = $('#lblA'), lblB = $('#lblB'), lblC = $('#lblC'), sumTxt = $('#pythSum');
    var paVal = $('#paVal'), pbVal = $('#pbVal');
    var outA2 = $('#outA2'), outB2 = $('#outB2'), outSum = $('#outSum'), outC2 = $('#outC2');

    function pts(arr){ return arr.map(function(p){ return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); }

    function update(){
      var a = parseFloat(aR.value), b = parseFloat(bR.value);
      var c = Math.sqrt(a*a + b*b);

      // geometry in units: right angle at origin, a along +x, b along +y (up)
      // squares: on a -> below, on b -> left, on c -> outside (upper-right)
      var totalW = a + 2*b, totalH = 2*a + b;      // full bbox incl. all three squares
      var sc = Math.min(400/totalW, 292/totalH);
      var O  = [0, 0], Bv = [a, 0], Av = [0, b];
      var cx = a/2, cy = b/2;                       // bbox centre in math coords
      var ox = 300 - cx*sc;
      var oy = 232 + cy*sc;
      function M(p){ return [ox + p[0]*sc, oy - p[1]*sc]; }

      tri.setAttribute('points', pts([M(O), M(Bv), M(Av)]));
      sqA.setAttribute('points', pts([M([0,-a]), M([a,-a]), M([a,0]), M([0,0])]));
      sqB.setAttribute('points', pts([M([-b,0]), M([-b,b]), M([0,b]), M([0,0])]));
      // hypotenuse square: from A(0,b) to B(a,0), outward (away from O)
      sqC.setAttribute('points', pts([M([0,b]), M([a,0]), M([a+b, b]), M([b, a+b])]));

      lblA.setAttribute('x', (ox + a*sc/2 - 5).toFixed(1)); lblA.setAttribute('y', (oy + 18).toFixed(1));
      lblB.setAttribute('x', (ox - 18).toFixed(1)); lblB.setAttribute('y', (oy - b*sc/2 + 4).toFixed(1));
      lblC.setAttribute('x', (ox + a*sc/2 + 10).toFixed(1)); lblC.setAttribute('y', (oy - b*sc/2 - 4).toFixed(1));
      sumTxt.textContent = a + '^2 + ' + b + '^2 = ' + (a*a+b*b) + '   |   c = ' + (+c.toFixed(2));

      paVal.textContent = toBn(a); pbVal.textContent = toBn(b);
      outA2.textContent = toBn(a*a); outB2.textContent = toBn(b*b);
      outSum.textContent = toBn(a*a + b*b);
      outC2.textContent = toBn(+c.toFixed(2));
    }
    aR.addEventListener('input', update);
    bR.addEventListener('input', update);
    $$('[data-preset2]').forEach(function(b){
      b.addEventListener('click', function(){
        var v = b.getAttribute('data-preset2').split(',');
        aR.value = clamp(+v[0], 2, 6); bR.value = clamp(+v[1], 2, 6); update();
      });
    });
    update();
  })();

  /* ============================================================
     TOOL 4 — unit circle
     ============================================================ */
  (function(){
    var svg = $('#unitSvg'); if(!svg) return;
    var R = 140, CX = 300, CY = 210;
    var theta = $('#thetaRange');
    var radius = $('#uRadius'), sinL = $('#uSin'), cosL = $('#uCos'), pt = $('#uPoint'), arc = $('#uArc'), angLbl = $('#uAngLbl');
    var tVal = $('#thetaVal');
    var outSin = $('#outSin'), outCos = $('#outCos'), outTan = $('#outTan'), outQuad = $('#outQuad');

    function f2(n){ return (Math.round(n*100)/100).toFixed(2); }
    function update(){
      var deg = parseFloat(theta.value);
      var rad = deg*Math.PI/180;
      var x = CX + R*Math.cos(rad);
      var y = CY - R*Math.sin(rad);
      radius.setAttribute('x2', x); radius.setAttribute('y2', y);
      sinL.setAttribute('x1', x); sinL.setAttribute('x2', x); sinL.setAttribute('y1', y); sinL.setAttribute('y2', CY);
      cosL.setAttribute('x1', CX); cosL.setAttribute('x2', x); cosL.setAttribute('y1', CY); cosL.setAttribute('y2', CY);
      pt.setAttribute('cx', x); pt.setAttribute('cy', y);
      arc.setAttribute('d', 'M' + (CX+54) + ' ' + CY + ' A 54 54 0 ' + (deg > 180 ? 1 : 0) + ' 0 ' + (CX + 54*Math.cos(rad)).toFixed(1) + ' ' + (CY - 54*Math.sin(rad)).toFixed(1));
      angLbl.setAttribute('x', CX + 62*Math.cos(rad/2) + 6);
      angLbl.setAttribute('y', CY - 62*Math.sin(rad/2) + 4);
      angLbl.textContent = 'angle = ' + deg + ' deg';

      var s = Math.sin(rad), c = Math.cos(rad);
      var tv = Math.abs(c) < 0.001 ? null : s/c;
      tVal.textContent = toBn(deg) + '°';
      outSin.textContent = toBn(f2(s));
      outCos.textContent = toBn(f2(c));
      outTan.textContent = tv === null ? '—' : toBn(f2(tv));
      outQuad.textContent = (deg === 0 || deg === 90 || deg === 180 || deg === 270 || deg === 360) ? 'অক্ষের উপর' :
        (deg < 90 ? '১ম চতুর্থাংশ' : deg < 180 ? '২য় চতুর্থাংশ' : deg < 270 ? '৩য় চতুর্থাংশ' : '৪র্থ চতুর্থাংশ');
      // sign colouring
      outSin.style.color = s >= 0 ? 'var(--mint)' : '#FF9F97';
      outCos.style.color = c >= 0 ? 'var(--mint)' : '#FF9F97';
    }
    theta.addEventListener('input', update);
    $$('[data-theta]').forEach(function(b){
      b.addEventListener('click', function(){ theta.value = b.getAttribute('data-theta'); update(); });
    });
    update();
  })();
  });

  /* ============================================================
     RESULT LOOKUP — attach as the section approaches
     ============================================================ */
  initWhenVisible($('#results'), function(){
  (function(){
    var form = $('#lookupForm'); if(!form) return;
    var input = $('#rollInput'), card = $('#resultCard');
    var resName = $('#resName'), resId = $('#resId'), resBatch = $('#resBatch');
    var resTest = $('#resTest'), resMarks = $('#resMarks'), resRank = $('#resRank'), resPct = $('#resPct'), resNote = $('#resNote');
    var chipsContainer = $('#mockRollChips');

    function renderChips(){
      if(!chipsContainer) return;
      var keys = Object.keys(mockResultsData);
      if(!keys.length) return;
      var html = keys.map(function(k){
        return '<button class="chip chip--mini" type="button" data-roll="' + k + '">' + k + '</button>';
      }).join(' ');
      chipsContainer.innerHTML = html;
      $$('[data-roll]', chipsContainer).forEach(function(b){
        b.addEventListener('click', function(){
          input.value = b.getAttribute('data-roll');
          lookup(input.value);
        });
      });
    }

    function fill(rec, code){
      resId.textContent = code;
      resName.textContent = rec.name || 'শিক্ষার্থী';
      resBatch.textContent = rec.batch || 'ম্যাথ একাডেমি';
      resTest.textContent = rec.test || 'মক টেস্ট';
      resMarks.textContent = rec.marks || '—';
      resRank.textContent = rec.rank || '—';
      resPct.textContent = rec.pct || '—';
      resNote.textContent = rec.note || 'নিয়মিত অনুশীলনে দক্ষতা আরও বৃদ্ধি পাবে।';

      $$('.rbar', card).forEach(function(rbar, i){
        var bar = rbar.querySelector('.track i');
        var valEl = rbar.querySelector('b');
        var v = (rec.bars && rec.bars[i] != null) ? Number(rec.bars[i]) : 0;
        if(valEl) valEl.textContent = toBn(v);
        if(bar){
          bar.style.width = '0%';
          setTimeout(function(){ bar.style.width = v + '%'; }, 120 + i*120);
        }
      });
      card.classList.remove('done');
      requestAnimationFrame(function(){ card.classList.add('done'); });
    }

    function lookup(code){
      var key = code.trim().toUpperCase();
      var rec = mockResultsData[key];
      if(rec){
        fill(rec, key);
        toast('ফলাফল পাওয়া গেছে', key + ' · ' + (rec.name || ''), 'ok');
      } else {
        var sampleKeys = Object.keys(mockResultsData).slice(0, 3).join(' / ');
        toast('রোল খুঁজে পাওয়া যায়নি', 'যাচাইকৃত রোল: ' + (sampleKeys || 'MA-2026-084'), 'error');
        input.focus(); input.select();
      }
    }

    form.addEventListener('submit', function(e){ e.preventDefault(); lookup(input.value); });
    renderChips();

    var firstKey = Object.keys(mockResultsData)[0] || 'MA-2026-084';
    if(mockResultsData[firstKey]) fill(mockResultsData[firstKey], firstKey);

    window.__updateMockResultsUI = function(){
      renderChips();
      var currentKey = (input.value || '').trim().toUpperCase();
      if(mockResultsData[currentKey]){
        fill(mockResultsData[currentKey], currentKey);
      } else {
        var first = Object.keys(mockResultsData)[0];
        if(first && mockResultsData[first]) fill(mockResultsData[first], first);
      }
    };
  })();
  });

  /* ============================================================
     BOOKING FORM — attach as the form approaches
     ============================================================ */
  initWhenVisible($('#bookForm'), function(){
  (function(){
    var form = $('#bookForm'); if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var nameEl = $('#bkName'), phoneEl = $('#bkPhone');
      var name = nameEl.value.trim();
      var phone = fromBn(phoneEl.value).replace(/[^0-9]/g,'');
      if(name.length < 2){ toast('নাম লিখুন', 'শিক্ষার্থীর নাম লিখুন', 'error'); nameEl.focus(); return; }
      if(phone.length < 11){ toast('মোবাইল নম্বর ঠিক নয়', '১১ সংখ্যার নম্বর দিন (০১৭xxxxxxxx)', 'error'); phoneEl.focus(); return; }
      /* build the WhatsApp message from the form, then hand off (no server involved) */
      var cls = ($('#bkClass') && $('#bkClass').value) || '';
      var batch = ($('#bkBatch') && $('#bkBatch').value) || '';
      var msg = 'আসসালামু আলাইকুম স্যার,\nনাম: ' + name + '\nশ্রেণি: ' + cls +
                (batch ? '\nব্যাচ: ' + batch : '') +
                '\nমোবাইল: ' + phone + '\nবর্তমান আসন ও ভর্তি-প্রক্রিয়া জানতে চাই।';
      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; btn.style.opacity = '.7'; btn.innerHTML = 'পাঠানো হচ্ছে…';
      setTimeout(function(){
        btn.disabled = false; btn.style.opacity = '';
        btn.innerHTML = 'WhatsApp-এ তথ্য জানতে পাঠান <svg class="ico ar"><use href="#i-arrow"/></svg>';
        /* open in a new tab via a real anchor: popup-blocker friendly and it never
           steals the current page (window.open with 'noopener' returns null, which
           used to trigger an unwanted same-tab redirect) */
        var a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
        SFX.play('success');
        toast('WhatsApp খুলেছে', 'বার্তাটি পাঠিয়ে বর্তমান আসন ও ভর্তি-প্রক্রিয়া নিশ্চিত করুন।', 'ok');
        form.reset();
      }, 700);
    });
  })();
  });

  /* ============================================================
     COUNTDOWN — only shown when Neon/config supplies a real start_at value
     ============================================================ */
  (function(){
    var el = $('#countdown'); if(!el) return;
    var raw = el.getAttribute('data-target') || '';
    var target = Date.parse(raw);
    if(!Number.isFinite(target) || target <= Date.now()) return;
    el.hidden = false;
    var timer = null;
    function pad(n){ return toBn(String(n).padStart(2,'0')); }
    function tick(){
      var remaining = target - Date.now();
      if(remaining <= 0){ el.hidden = true; if(timer) clearInterval(timer); return; }
      var d = Math.floor(remaining/86400000), h = Math.floor(remaining%86400000/3600000),
          m = Math.floor(remaining%3600000/60000), s = Math.floor(remaining%60000/1000);
      $('#cdD').textContent = pad(d); $('#cdH').textContent = pad(h);
      $('#cdM').textContent = pad(m); $('#cdS').textContent = pad(s);
    }
    tick(); timer = setInterval(tick, 1000);
  })();

  /* ============================================================
     MICRO-INTERACTIONS
     ============================================================ */
  // magnetic buttons (pointer devices only)
  if(!reduced && window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.btn--red, .hero__cta .btn, .book__form .btn').forEach(function(btn){
      btn.addEventListener('pointermove', function(e){
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2)/r.width;
        var y = (e.clientY - r.top - r.height/2)/r.height;
        btn.style.transform = 'translate(' + (x*6-2).toFixed(1) + 'px,' + (y*5-2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function(){ btn.style.transform = ''; });
    });
  }

  // tactile press feedback on touch — delegated
  if(window.matchMedia('(hover:none)').matches){
    var touchTarget = null;
    document.addEventListener('touchstart', function(e){
      var el2 = e.target.closest && e.target.closest('.btn, .sheet, .thabit, .fame-card, .tab');
      if(!el2) return;
      touchTarget = el2;
      el2.style.transition = 'transform .12s ease';
      el2.style.transform = 'scale(.975)';
    }, {passive:true});
    function releaseTouch(){
      var el2 = touchTarget; touchTarget = null;
      if(el2) setTimeout(function(){ el2.style.transform = ''; }, 60);
    }
    document.addEventListener('touchend', releaseTouch, {passive:true});
    document.addEventListener('touchcancel', releaseTouch, {passive:true});
  }

  // Interactive pillar cards (.pillar) on mobile and desktop
  $$('.pillar').forEach(function(card){
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-pressed', 'false');
    function togglePillar(){
      var wasActive = card.classList.contains('is-active');
      $$('.pillar').forEach(function(c){
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      if(!wasActive){
        card.classList.add('is-active');
        card.setAttribute('aria-pressed', 'true');
        SFX.play('tab');
      } else {
        SFX.play('press');
      }
    }
    card.addEventListener('click', togglePillar);
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        togglePillar();
      }
    });
  });


  /* ============================================================
     SOUND TOGGLE + HOVER/PRESS AUDIO
     ============================================================ */
  var sndBtns = [$('#sndBtn'), $('#sndBtn2')].filter(Boolean);
  function paintSound(force){
    var on = SFX.isOn();
    document.documentElement.classList.toggle('snd-off', !on);
    sndBtns.forEach(function(b){
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', on ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন');
      b.title = on ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন';
    });
  }
  paintSound();
  sndBtns.forEach(function(b){
    b.addEventListener('click', function(){
      var on = SFX.toggle();
      paintSound();
      if(on){ SFX.play('lock'); toast('সাউন্ড চালু', 'হোভার, ক্লিক ও ইন্ট্রোয় শব্দ — চাইলে আবার বন্ধ করুন', 'ok'); }
      else { toast('সাউন্ড বন্ধ', 'সাইট এখন নীরব', 'ok'); }
    });
  });

  /* sliders: a short pitched blip per step while dragging (lab + any future range) */
  var sliderInputs = $$('input[type=range]');
  sliderInputs.forEach(function(r){
    function blip(){
      var min = parseFloat(r.min || '0'), max = parseFloat(r.max || '100');
      var pos = (parseFloat(r.value) - min) / ((max - min) || 1);
      SFX.play('slider', pos);
    }
    r.addEventListener('input', blip);
    r.addEventListener('pointerdown', function(){ SFX.arm(); }, {passive:true});
  });


  /* ============================================================
     MATH VEIL — the hover on the instructor portraits
     Nothing ripples, nothing wobbles: on hover the photo stays exactly as it is
     and a layer of bold maths glyphs fades in around it (sin, cos, √, π, φ …).
     Once the spans exist the layer is pure CSS. Hover on desktop; a 1.8 s flash
     on touch; the same reveal for keyboard focus. Build the decorative layer
     only as the instructor photo approaches the viewport.
     ============================================================ */
  initWhenVisible($('#teacherCard'), function(){
  (function(){
    /* Two edge columns only: the centre stays the photograph's, and the top and
       bottom HUD strips (INSTRUCTOR FILE / academy label / teaching note) stay clear. */
    var SYMS = [
      ['sin','13%','26%',0],  ['√','13%','42%',1],  ['β','13%','58%',2],  ['±','13%','74%',3],
      ['θ','24%','33%',4],    ['Δ','24%','50%',5],  ['∑','24%','67%',6],  ['ω','24%','83%',7],
      ['cos','87%','26%',8],  ['π','87%','42%',9],  ['γ','87%','58%',10], ['∫','87%','74%',11],
      ['φ','76%','33%',12],   ['λ','76%','50%',13], ['tan','76%','67%',14],['∞','76%','83%',15]
    ];
    var figs = $$('.tphoto, .tport');
    if(!figs.length) return;
    var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

    figs.forEach(function(fig){
      if(fig.querySelector('.mveil')) return;
      var veil = document.createElement('span');
      veil.className = 'mveil';
      veil.setAttribute('aria-hidden', 'true');
      var html = '<span class="mveil__wash"></span>' +
                 '<span class="mveil__frame"><i></i><i></i><i></i><i></i></span>';
      for(var i = 0; i < SYMS.length; i++){
        var S = SYMS[i];
        var rot = ((i * 37) % 17) - 8;             // -8…+8°, stable per slot
        html += '<span class="mveil__sym" style="--x:' + S[1] + ';--y:' + S[2] +
                ';--i:' + S[3] + ';--rot:' + rot + 'deg">' + S[0] + '</span>';
      }
      veil.innerHTML = html;
      fig.appendChild(veil);

      var timer = 0;
      var on  = function(){ fig.classList.add('is-math'); };
      var off = function(){ fig.classList.remove('is-math'); };

      if(fine){
        fig.addEventListener('pointerenter', on, {passive:true});
        fig.addEventListener('pointerleave', function(){ clearTimeout(timer); off(); }, {passive:true});
      } else {
        fig.addEventListener('pointerdown', function(){
          on(); clearTimeout(timer); timer = setTimeout(off, 1800);
        }, {passive:true});
      }
      fig.setAttribute('tabindex', '0');
      fig.addEventListener('focus', on);
      fig.addEventListener('blur',  off);
    });
  })();
  });

  /* hover + press: delegated, so dynamically-created links are covered too */
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine && !reduced){
    var hovered = null;
    document.addEventListener('pointerover', function(e){
      var t = e.target.closest && e.target.closest('a,button,.tab,.pillar,.sheet,.fame-card,.thabit');
      if(!t || t === hovered) return;
      hovered = t;
      SFX.play('hover');
    }, {passive:true});
  }

  // Mobile Web Audio unlock on user touch/click gesture
  function unlockMobileAudio(){
    SFX.arm();
  }
  ['touchstart','touchend','pointerdown','click'].forEach(function(evt){
    document.addEventListener(evt, unlockMobileAudio, {passive:true});
  });

  document.addEventListener('pointerdown', function(e){
    var t = e.target.closest && e.target.closest('a, button, summary, .faq__q, .tab, .chip, .pillar, .sheet a, .fame-card, .thabit, input[type=range], .top-notice__close');
    if(t) SFX.play('press');
  }, {passive:true});

  // Sound on accordion open/close
  document.addEventListener('toggle', function(e){
    if(e.target && e.target.classList && e.target.classList.contains('faq__item')){
      if(e.target.open) SFX.play('open');
      else SFX.play('tick');
    }
  }, true);

  /* ============================================================
     ANCHORS
     ============================================================ */
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(!id || id === '#') return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var hd = document.getElementById('header');
      var off = (hd ? hd.getBoundingClientRect().height : 76) + 22;
      var top = target.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({top: top, behavior: reduced ? 'auto' : 'smooth'});
      try { history.replaceState(null, '', id); } catch(err){}
    });
  });

  /* ============================================================
     PRIVACY POLICY MODAL (Option 1: Zero-Tracking Transparency)
     ============================================================ */
  var privModal = document.getElementById('privacyModal');
  var privBtn = document.getElementById('privacyBtn');
  var closePrivBtn = document.getElementById('closePrivacyBtn');
  var confirmPrivBtn = document.getElementById('confirmPrivacyBtn');

  function openPrivacyModal(){
    if(privModal){
      if(typeof privModal.showModal === 'function') privModal.showModal();
      else privModal.setAttribute('open', '');
    }
  }
  function closePrivacyModal(){
    if(privModal){
      if(typeof privModal.close === 'function') privModal.close();
      else privModal.removeAttribute('open');
    }
  }
  window.__openPrivacyModal = openPrivacyModal;
  if(privBtn) privBtn.addEventListener('click', openPrivacyModal);
  if(closePrivBtn) closePrivBtn.addEventListener('click', closePrivacyModal);
  if(confirmPrivBtn) confirmPrivBtn.addEventListener('click', closePrivacyModal);
  if(privModal){
    privModal.addEventListener('click', function(e){
      if(e.target === privModal) closePrivacyModal();
    });
  }

  var year = $('#year');
  if(year) year.textContent = toBn(new Date().getFullYear());
})();
