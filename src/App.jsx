import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Mic, MicOff, PhoneOff, MessageSquare, Phone, Download, Info, Loader2 } from 'lucide-react'
import { RetellWebClient } from 'retell-client-js-sdk'

const PASSWORD = 'empowerai'

// ─────────────────────────────────────────────────────────────────────────────
// Disclaimer Mark — top left info icon with dropdown
// ─────────────────────────────────────────────────────────────────────────────
function DisclaimerMark() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative" style={{ zIndex: 50 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Disclaimer"
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors duration-200"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Info size={13} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-10 left-0 w-72 rounded-2xl p-4 text-white/60 text-xs leading-relaxed"
            style={{
              background: 'rgba(10,10,20,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            }}
          >
            <p className="text-white/80 text-[11px] font-medium tracking-widest uppercase mb-2">Heads up</p>
            Let Darren search News, Web, or Email after you instruct it to — without interrupting. If you interrupt, Darren will answer your interrupted message first and not the query you told it to carry out, like searching News, Web, or Email.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Install Button — native prompt on Chrome/Edge, instructions tooltip on iOS
// ─────────────────────────────────────────────────────────────────────────────
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches

function InstallButton() {
  const [prompt, setPrompt]       = useState(null)
  const [installed, setInstalled] = useState(isInStandaloneMode)
  const [showTip, setShowTip]     = useState(false)
  const tipRef = useRef(null)

  useEffect(() => {
    function handler(e) { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (tipRef.current && !tipRef.current.contains(e.target)) setShowTip(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (installed) return null

  const handleClick = async () => {
    if (prompt) {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') { setInstalled(true); setPrompt(null) }
    } else {
      // iOS or browser without native prompt — show instructions
      setShowTip((s) => !s)
    }
  }

  return (
    <div ref={tipRef} className="relative" style={{ zIndex: 50 }}>
      <button
        onClick={handleClick}
        title="Install Darren"
        className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors duration-200"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Download size={13} />
      </button>

      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-10 right-0 w-64 rounded-2xl p-4 text-white/60 text-xs leading-relaxed"
            style={{
              background: 'rgba(10,10,20,0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            }}
          >
            {isIOS ? (
              <>
                <p className="text-white/80 text-[11px] font-medium tracking-widest uppercase mb-2">Add to Home Screen</p>
                Tap the <span className="text-white/80">Share</span> button in Safari, then tap <span className="text-white/80">Add to Home Screen</span>.
              </>
            ) : (
              <>
                <p className="text-white/80 text-[11px] font-medium tracking-widest uppercase mb-2">Install Darren</p>
                Open this page in <span className="text-white/80">Chrome</span> or <span className="text-white/80">Edge</span> and the install prompt will appear automatically.
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated background — lightweight distinct blobs, GPU-friendly
// ─────────────────────────────────────────────────────────────────────────────
function BackgroundCanvas({ speaking }) {
  const d1 = speaking ? 7  : 24
  const d2 = speaking ? 8  : 28
  const d3 = speaking ? 6  : 20
  const d4 = speaking ? 9  : 32

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>

      {/* ── Centre pulse — opacity only, no scale (cheaper) ── */}
      <motion.div
        animate={{ opacity: speaking ? [0.04, 0.10, 0.04] : [0.01, 0.03, 0.01] }}
        transition={{ duration: speaking ? 2.8 : 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: '15%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(80,0,180,0.85) 0%, transparent 55%)',
          filter: 'blur(50px)',
        }}
      />

      {/* ── Blob 1 — top left, purple ── */}
      <motion.div
        animate={{ x: ['-5%', '8%', '-3%', '-5%'], y: ['4%', '-5%', '8%', '4%'] }}
        transition={{ duration: d1, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: '40vw', height: '40vw', top: '-8%', left: '-6%',
          background: speaking
            ? 'radial-gradient(circle, rgba(100,0,210,0.45) 0%, transparent 55%)'
            : 'radial-gradient(circle, rgba(38,0,90,0.20) 0%, transparent 55%)',
          filter: 'blur(45px)',
          transition: 'background 1s ease',
        }}
      />

      {/* ── Blob 2 — bottom right, blue ── */}
      <motion.div
        animate={{ x: ['5%', '-8%', '3%', '5%'], y: ['-4%', '7%', '-8%', '-4%'] }}
        transition={{ duration: d2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: '38vw', height: '38vw', bottom: '-8%', right: '-6%',
          background: speaking
            ? 'radial-gradient(circle, rgba(0,50,200,0.42) 0%, transparent 52%)'
            : 'radial-gradient(circle, rgba(0,18,70,0.20) 0%, transparent 52%)',
          filter: 'blur(42px)',
          transition: 'background 1s ease',
        }}
      />

      {/* ── Blob 3 — mid left, indigo ── */}
      <motion.div
        animate={{ x: ['-3%', '5%', '-5%', '-3%'], y: ['5%', '-3%', '4%', '5%'] }}
        transition={{ duration: d3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: '32vw', height: '32vw', top: '32%', left: '4%',
          background: speaking
            ? 'radial-gradient(circle, rgba(40,0,150,0.38) 0%, transparent 52%)'
            : 'radial-gradient(circle, rgba(0,20,50,0.16) 0%, transparent 52%)',
          filter: 'blur(38px)',
          transition: 'background 1s ease',
        }}
      />

      {/* ── Blob 4 — top right, violet ── */}
      <motion.div
        animate={{ x: ['3%', '-6%', '5%', '3%'], y: ['-3%', '5%', '-6%', '-3%'] }}
        transition={{ duration: d4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', width: '30vw', height: '30vw', top: '-4%', right: '4%',
          background: speaking
            ? 'radial-gradient(circle, rgba(70,0,160,0.35) 0%, transparent 50%)'
            : 'radial-gradient(circle, rgba(20,0,50,0.14) 0%, transparent 50%)',
          filter: 'blur(35px)',
          transition: 'background 1s ease',
        }}
      />

      {/* ── Vignette ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Gate
// ─────────────────────────────────────────────────────────────────────────────
function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (value === PASSWORD) {
      onUnlock()
    } else {
      setShake(true)
      setValue('')
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <BackgroundCanvas speaking={false} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-10"
        style={{ zIndex: 1 }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-20 h-20 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
          />
          <div
            className="w-12 h-12 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #c0c0c0 18%, #707070 45%, #1a1a1a 80%)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7), inset 0 -6px 12px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.15)',
            }}
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-white text-xl font-light tracking-[0.45em] uppercase">Darren</h1>
          <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase">AI Voice Agent</p>
        </div>
        <motion.form
          onSubmit={submit}
          animate={shake ? { x: [-10, 10, -7, 7, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-5"
        >
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Access code"
            autoFocus
            className="bg-transparent border border-white/15 rounded-full px-7 py-3 text-white/80 text-sm text-center tracking-[0.25em] placeholder:text-white/15 focus:outline-none focus:border-white/35 w-56 transition-colors duration-200"
          />
          <button type="submit" className="text-white/25 text-[11px] tracking-[0.3em] uppercase hover:text-white/60 transition-colors duration-200">
            Enter →
          </button>
        </motion.form>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Ripple Ring
// ─────────────────────────────────────────────────────────────────────────────
function Ripple({ delay }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{ width: 190, height: 190, border: '1px solid rgba(255,255,255,0.06)' }}
      initial={{ scale: 0.85, opacity: 0.45 }}
      animate={{ scale: 3.4, opacity: 0 }}
      transition={{ duration: 2.8, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D Orb Visualizer
// ─────────────────────────────────────────────────────────────────────────────
function OrbVisualizer({ callState, agentState }) {
  const speaking   = agentState === 'speaking'
  const connecting = callState  === 'connecting'
  const active     = callState  === 'active'

  const coreCtrl = useAnimation()
  const ringCtrl = useAnimation()
  const haloCtrl = useAnimation()

  useEffect(() => {
    if (speaking) {
      coreCtrl.start({ scale: [1, 1.16, 1.06, 1.20, 1.04, 1], transition: { duration: 0.72, repeat: Infinity, ease: 'easeInOut' } })
      ringCtrl.start({ scale: [1, 1.13, 1], opacity: [0.28, 0.55, 0.28], transition: { duration: 0.68, repeat: Infinity, ease: 'easeInOut' } })
      haloCtrl.start({ scale: [1, 1.18, 1], opacity: [0.08, 0.18, 0.08], transition: { duration: 0.72, repeat: Infinity, ease: 'easeInOut' } })
    } else if (connecting) {
      coreCtrl.start({ scale: [1, 1.10, 1], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } })
      ringCtrl.start({ scale: [1, 1.06, 1], opacity: [0.15, 0.28, 0.15], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } })
      haloCtrl.start({ scale: [1, 1.07, 1], opacity: [0.04, 0.09, 0.04], transition: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } })
    } else if (active) {
      coreCtrl.start({ scale: [1, 1.055, 1], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } })
      ringCtrl.start({ scale: [1, 1.04, 1], opacity: [0.12, 0.22, 0.12], transition: { duration: 3.0, repeat: Infinity, ease: 'easeInOut' } })
      haloCtrl.start({ scale: [1, 1.05, 1], opacity: [0.03, 0.07, 0.03], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } })
    } else {
      coreCtrl.start({ scale: [1, 1.03, 1], transition: { duration: 3.8, repeat: Infinity, ease: 'easeInOut' } })
      ringCtrl.start({ scale: [1, 1.025, 1], opacity: [0.08, 0.16, 0.08], transition: { duration: 4.0, repeat: Infinity, ease: 'easeInOut' } })
      haloCtrl.start({ scale: [1, 1.03, 1], opacity: [0.02, 0.05, 0.02], transition: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' } })
    }
  }, [speaking, connecting, active])

  const sphereGradient = speaking
    ? 'radial-gradient(circle at 33% 28%, #ffffff 0%, #e8e8e8 12%, #a0a0a0 32%, #484848 62%, #0d0d0d 100%)'
    : active
    ? 'radial-gradient(circle at 33% 28%, #f0f0f0 0%, #cccccc 14%, #888888 36%, #303030 65%, #080808 100%)'
    : 'radial-gradient(circle at 33% 28%, #d0d0d0 0%, #aaaaaa 16%, #606060 40%, #1a1a1a 70%, #050505 100%)'

  const sphereShadow = speaking
    ? '0 0 55px rgba(255,255,255,0.35), 0 28px 55px rgba(0,0,0,0.75), inset 0 -18px 28px rgba(0,0,0,0.5), inset 0 6px 18px rgba(255,255,255,0.18)'
    : active
    ? '0 0 28px rgba(255,255,255,0.16), 0 22px 44px rgba(0,0,0,0.72), inset 0 -14px 22px rgba(0,0,0,0.45), inset 0 5px 12px rgba(255,255,255,0.10)'
    : '0 0 14px rgba(255,255,255,0.06), 0 18px 36px rgba(0,0,0,0.7), inset 0 -12px 20px rgba(0,0,0,0.4), inset 0 4px 10px rgba(255,255,255,0.06)'

  const isListening = callState === 'active' && !speaking
  const statusLabel =
    callState === 'idle'         ? 'Ready'
    : callState === 'connecting' ? 'Connecting…'
    : callState === 'ended'      ? 'Call Ended'
    : speaking                   ? 'Darren Speaking'
    : 'Listening, searching and surfing..'

  const orbitDuration = speaking ? 3.5 : active ? 7 : 11

  return (
    <motion.div
      animate={{ y: [0, -18, 0] }}
      transition={{ duration: 4.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      className="relative flex items-center justify-center"
      style={{ width: 340, height: 340 }}
    >
      <AnimatePresence>
        {speaking && (
          <>
            <Ripple delay={0} />
            <Ripple delay={0.9} />
            <Ripple delay={1.8} />
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={haloCtrl}
        className="absolute rounded-full pointer-events-none"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%)' }}
      />

      <motion.div
        animate={ringCtrl}
        className="absolute rounded-full pointer-events-none"
        style={{ width: 168, height: 168, border: '1px solid rgba(255,255,255,0.16)' }}
      />

      <motion.div animate={coreCtrl} style={{ position: 'relative', width: 112, height: 112 }}>
        <div style={{
          position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)',
          width: 90, height: 18, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.65) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }} />

        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          background: sphereGradient, boxShadow: sphereShadow,
          overflow: 'hidden', position: 'relative',
          transition: 'background 0.7s ease, box-shadow 0.7s ease',
        }}>
          <motion.div
            animate={{
              x: [14, 4, -16, -22, -14, -4, 14, 22, 14],
              y: [-18, -24, -18, -4, 14, 20, 14, -2, -18],
              opacity: speaking ? [0.9, 1, 0.85, 0.9, 1, 0.88, 0.9, 1, 0.9] : [0.75, 0.85, 0.7, 0.75, 0.85, 0.72, 0.75, 0.85, 0.75],
            }}
            transition={{ duration: orbitDuration, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '10%', left: '15%', width: '38%', height: '30%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 50%, transparent 72%)',
              filter: 'blur(3.5px)',
            }}
          />
          <motion.div
            animate={{
              x: [-14, -4, 16, 22, 14, 4, -14, -22, -14],
              y: [18, 24, 18, 4, -14, -20, -14, 2, 18],
              opacity: [0.18, 0.28, 0.15, 0.2, 0.28, 0.16, 0.18, 0.28, 0.18],
            }}
            transition={{ duration: orbitDuration * 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: '14%', right: '10%', width: '32%', height: '26%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(180,210,255,0.7) 0%, transparent 70%)',
              filter: 'blur(4px)',
            }}
          />
          <div style={{
            position: 'absolute', top: '38%', left: '-5%', width: '110%', height: '30%',
            background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.18) 50%, transparent)',
          }} />
        </div>
      </motion.div>

      <div className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
        <motion.p
          key={statusLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-white/20 text-[10px] tracking-[0.35em] uppercase"
        >
          {statusLabel}
        </motion.p>
        {isListening && (
          <Loader2 size={10} className="text-white/20 animate-spin" />
        )}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Transcript Halo — text floats above / below the orb, never on top of it
// ─────────────────────────────────────────────────────────────────────────────
function TranscriptHalo({ transcript }) {
  const agentMsgs    = transcript.filter((m) => m.role === 'agent')
  const lastUserMsg  = [...transcript].reverse().find((m) => m.role === 'user')
  const visibleAgent = agentMsgs.slice(-2)

  return (
    <>
      <div className="flex flex-col items-center justify-end gap-3 pointer-events-none" style={{ minHeight: 110, width: 360 }}>
        <AnimatePresence>
          {visibleAgent.map((msg, i) => {
            const isNewest = i === visibleAgent.length - 1
            return (
              <motion.p
                key={msg.content.slice(0, 40)}
                initial={{ opacity: 0 }}
                animate={{ opacity: isNewest ? 0.75 : 0.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-white text-sm leading-relaxed text-center max-w-xs"
                style={{ willChange: 'opacity' }}
              >
                {msg.content}
              </motion.p>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center justify-start pointer-events-none" style={{ minHeight: 72, width: 360 }}>
        <AnimatePresence>
          {lastUserMsg && (
            <motion.p
              key={lastUserMsg.content.slice(0, 40)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white text-xs leading-relaxed text-center max-w-xs mt-4 italic"
              style={{ willChange: 'opacity' }}
            >
              {lastUserMsg.content}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Control Dock
// ─────────────────────────────────────────────────────────────────────────────
function ControlDock({ callState, isMuted, showTranscript, onStart, onEnd, onMute, onToggleTranscript }) {
  const isActive     = callState === 'active'
  const isConnecting = callState === 'connecting'

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center" style={{ zIndex: 30 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center gap-3 px-5 py-3 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        {!isActive && !isConnecting && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={onStart}
            className="flex items-center gap-2.5 bg-white text-black text-[11px] tracking-[0.25em] uppercase font-medium px-7 py-2.5 rounded-full hover:bg-white/90 transition-colors"
          >
            <Phone size={13} /> Start Call
          </motion.button>
        )}

        {isConnecting && (
          <div className="flex items-center gap-2.5 text-white/35 text-[11px] tracking-[0.25em] uppercase px-4 py-1">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              className="w-3.5 h-3.5 rounded-full border border-white/20"
              style={{ borderTopColor: 'rgba(255,255,255,0.7)' }}
            />
            Connecting
          </div>
        )}

        {isActive && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onToggleTranscript}
              title={showTranscript ? 'Hide transcript' : 'Show transcript'}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${showTranscript ? 'bg-white/15 text-white' : 'bg-transparent text-white/30 hover:text-white/60'}`}
            >
              <MessageSquare size={15} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={onMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${isMuted ? 'bg-white/12 text-white/40' : 'bg-transparent text-white/50 hover:text-white/80'}`}
            >
              {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={onEnd}
              className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase font-medium px-5 py-2.5 rounded-full transition-colors duration-200"
              style={{ background: 'rgba(200,40,40,0.18)', border: '1px solid rgba(220,60,60,0.25)', color: 'rgba(255,110,110,0.9)' }}
            >
              <PhoneOff size={13} /> End
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked,       setUnlocked]       = useState(false)
  const [callState,      setCallState]      = useState('idle')
  const [agentState,     setAgentState]     = useState('idle')
  const [isMuted,        setIsMuted]        = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [transcript,     setTranscript]     = useState([])
  const [error,          setError]          = useState(null)

  const retellRef        = useRef(null)
  const agentDoneRef     = useRef(false)   // true after agent_stop_talking fires
  const stopTimerRef     = useRef(null)    // fallback safety timeout
  const silenceFramesRef = useRef(0)       // consecutive near-silent frames counter

  const scheduleStop = () => {
    agentDoneRef.current = true
    // Fallback: if audio-level detection never fires, stop after 5s
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    stopTimerRef.current = setTimeout(() => {
      setAgentState('listening')
      agentDoneRef.current = false
    }, 5000)
  }

  useEffect(() => {
    const client = new RetellWebClient()
    retellRef.current = client

    client.on('call_started', () => { setCallState('active'); setAgentState('listening'); setError(null) })
    client.on('call_ended',   () => { setCallState('ended'); setAgentState('idle'); setTimeout(() => setCallState('idle'), 2200) })

    client.on('agent_start_talking', () => {
      // Cancel any pending stop — agent is speaking again
      agentDoneRef.current = false
      silenceFramesRef.current = 0
      if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null }
      setAgentState('speaking')
    })

    // Server says agent is done — but audio buffer may still be playing
    client.on('agent_stop_talking', scheduleStop)

    // Raw audio samples from agent's audio track (enabled via emitRawAudioSamples)
    // Fires every animation frame — require 20 consecutive silent frames (~333ms)
    // before stopping, to avoid false triggers from brief inter-chunk dips
    client.on('audio', (samples) => {
      if (!agentDoneRef.current) {
        silenceFramesRef.current = 0
        return
      }
      const rms = Math.sqrt(samples.reduce((sum, s) => sum + s * s, 0) / samples.length)
      if (rms < 0.003) {
        silenceFramesRef.current++
        if (silenceFramesRef.current >= 20) {
          if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null }
          agentDoneRef.current = false
          silenceFramesRef.current = 0
          setAgentState('listening')
        }
      } else {
        // Audio still playing — reset counter
        silenceFramesRef.current = 0
      }
    })

    client.on('update', (u) => { if (u.transcript) setTranscript(u.transcript) })
    client.on('error',  (err) => { console.error('Retell error:', err); setError('Connection issue — please try again.'); setCallState('idle'); setAgentState('idle') })

    return () => {
      try { client.stopCall() } catch {}
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current)
    }
  }, [])

  const startCall = async () => {
    setCallState('connecting')
    setTranscript([])
    setError(null)
    try {
      const res = await fetch('/api/create-call', { method: 'POST' })
      if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
      const { access_token } = await res.json()
      if (!access_token) throw new Error('No access token returned.')
      // emitRawAudioSamples: true — lets us read the agent's actual audio level
      await retellRef.current.startCall({ accessToken: access_token, emitRawAudioSamples: true })
    } catch (err) {
      setError(`Could not start call: ${err.message}`)
      setCallState('idle')
    }
  }

  const endCall = () => {
    try { retellRef.current?.stopCall() } catch {}
    setCallState('ended')
    setAgentState('idle')
    setTimeout(() => setCallState('idle'), 2200)
  }

  const toggleMute = () => {
    isMuted ? retellRef.current?.unmute?.() : retellRef.current?.mute?.()
    setIsMuted((m) => !m)
  }

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden select-none">

      <BackgroundCanvas speaking={agentState === 'speaking'} />

      {/* Top bar — disclaimer left, wordmark centre, install right */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-6" style={{ zIndex: 10 }}>
        <DisclaimerMark />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none"
        >
          <h1 className="text-white/70 text-sm tracking-[0.55em] uppercase font-light">Darren</h1>
          <p className="text-white/25 text-[9px] tracking-[0.35em] uppercase mt-1">AI Phone Agent</p>
        </motion.div>
        <InstallButton />
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute top-28 text-red-400/60 text-xs tracking-widest text-center px-6 pointer-events-none"
            style={{ zIndex: 2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Centre column */}
      <div className="flex flex-col items-center" style={{ zIndex: 2 }}>
        <AnimatePresence>
          {showTranscript ? (
            <motion.div
              key="on"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <TranscriptHalo transcript={transcript} />
            </motion.div>
          ) : (
            <div key="off" style={{ height: 110 }} />
          )}
        </AnimatePresence>

        <OrbVisualizer callState={callState} agentState={agentState} />

        {!showTranscript && <div style={{ height: 72 }} />}
      </div>

      <ControlDock
        callState={callState}
        isMuted={isMuted}
        showTranscript={showTranscript}
        onStart={startCall}
        onEnd={endCall}
        onMute={toggleMute}
        onToggleTranscript={() => setShowTranscript((s) => !s)}
      />
    </div>
  )
}
