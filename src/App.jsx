import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import verses from './verses.json'
import './index.css'

function App() {
  const [currentVerse, setCurrentVerse] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  // Generate random background elements
  const lanterns = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 20}s`,
    duration: `${20 + Math.random() * 15}s`,
    size: `${25 + Math.random() * 20}px`,
  })), [])

  const sparkles = useMemo(() => Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
  })), [])

  // Handle URL Parameters for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const verseId = params.get('v')
    if (verseId) {
      const targetVerse = verses.find(v => v.id.toString() === verseId)
      if (targetVerse) {
        setCurrentVerse(targetVerse)
        setShowCard(true)
        setIsFlipped(true)
      }
    }
  }, [])

  const drawCard = useCallback(() => {
    if (isAnimating) return

    // Clear URL params when drawing a new card
    if (window.location.search) {
      window.history.pushState({}, '', window.location.pathname)
    }

    setIsAnimating(true)
    setShowCard(false)
    setIsFlipped(false)

    // Selection animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * verses.length)
      setCurrentVerse(verses[randomIndex])
      setShowCard(true)
      setIsAnimating(false)

      // Auto-flip and confetti
      setTimeout(() => {
        setIsFlipped(true)
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff0000', '#ff4d4d', '#ffffff']
        })
      }, 500)
    }, 400)
  }, [isAnimating])

  const handleShare = async () => {
    if (!currentVerse) return

    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${currentVerse.id}`
    const shareText = `我在「新春蒙福」抽到了這份應許：『${currentVerse.verse}』(${currentVerse.reference})，你也來領取你的新年祝福吧！🧧`

    if (navigator.share) {
      try {
        await navigator.share({
          title: '新春蒙福 - 聖經金句祝福卡',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      // Fallback for desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert('連結已複製到剪貼簿，快分享給朋友吧！🧧')
      } catch (err) {
        alert('複製失敗，請手動分享網址')
      }
    }
  }

  return (
    <div className="container">
      <div className="bg-effects">
        {lanterns.map(l => (
          <div
            key={l.id}
            className="lantern"
            style={{
              left: l.left,
              width: l.size,
              height: l.size,
              animationDuration: l.duration,
              animationDelay: l.delay
            }}
          />
        ))}
        {sparkles.map(s => (
          <div
            key={s.id}
            className="sparkle"
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          />
        ))}
      </div>

      <h1 className="title">新春蒙福</h1>
      <p className="subtitle">領取神為你準備的新年祝福與應許</p>

      {!showCard && (
        <button
          className="draw-button"
          onClick={drawCard}
          disabled={isAnimating}
        >
          {isAnimating ? '正在領取祝福...' : '領取每日金句'}
        </button>
      )}

      <div className="card-container">
        {showCard && currentVerse && (
          <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="flip-card-inner">
              <div className="card-face card-front">
                <div className="card-front-hint">正在為您翻開祝福...</div>
              </div>
              <div className="card-face card-back">
                <div className="card">
                  <div className="card-bg-pattern">🧧</div>
                  <span className="card-category">{currentVerse.category}</span>
                  <div className="verse-icon">{currentVerse.icon}</div>
                  <div className="verse-text">{currentVerse.verse}</div>
                  <div className="verse-ref">{currentVerse.reference}</div>
                  {currentVerse.meaning && (
                    <div className="verse-meaning">
                      <strong>寓意：</strong>{currentVerse.meaning}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCard && (
        <div className="button-group">
          <button className="draw-button secondary" onClick={handleShare}>
            🧧 分享這份祝福
          </button>
          <button className="draw-button" onClick={drawCard}>
            再次領取祝福
          </button>
        </div>
      )}

      <footer style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.8rem', color: '#ffd700' }}>
        © 2026 聖經祝福小站 | 願主賜福與你
      </footer>
    </div>
  )
}
export default App
