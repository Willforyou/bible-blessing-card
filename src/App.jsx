import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { toPng } from 'html-to-image'
import verses from './verses.json'
import './index.css'

function App() {
  const [currentVerse, setCurrentVerse] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const cardRef = useRef(null)

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

  const drawCard = useCallback(() => {
    if (isAnimating) return

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

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !currentVerse) return

    const card = cardRef.current
    const verseTextEl = card.querySelector('.verse-text')
    const originalMaxHeight = verseTextEl ? verseTextEl.style.maxHeight : ''
    const originalOverflow = verseTextEl ? verseTextEl.style.overflow : ''

    try {
      // Temporarily expand to capture full text
      if (verseTextEl) {
        verseTextEl.style.maxHeight = 'none'
        verseTextEl.style.overflow = 'visible'
      }

      // Add a small delay for layout stabilization
      await new Promise(resolve => setTimeout(resolve, 300))

      const dataUrl = await toPng(card, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#b30000',
        style: {
          transform: 'none',
          borderRadius: '20px'
        },
        filter: (node) => {
          // Avoid capturing buttons if they accidentally get in the ref
          return !node.className || !node.className.toString().includes('button-group')
        }
      })

      if (verseTextEl) {
        verseTextEl.style.maxHeight = originalMaxHeight
        verseTextEl.style.overflow = originalOverflow
      }

      // Sanitize filename for Windows compatibility
      const sanitizedFilename = currentVerse.reference.replace(/:/g, '_')

      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `聖經祝福卡-${sanitizedFilename}.png`
      document.body.appendChild(link)

      try {
        link.click()
      } finally {
        setTimeout(() => {
          document.body.removeChild(link)
        }, 200)
      }

      // Fallback: If no download appeared, offer preview
      setTimeout(() => {
        const confirmResult = window.confirm('如果下載沒有自動開始，是否在網頁中開啟預覽圖片供您手動長按存檔？')
        if (confirmResult) {
          const newWin = window.open()
          if (newWin) {
            newWin.document.write(`
              <html>
                <body style="margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#1a1a1a; color:white; font-family:sans-serif;">
                  <p style="margin:20px;">長按圖片即可儲存到手機相簿 🧧</p>
                  <img src="${dataUrl}" style="max-width:90%; border-radius:15px; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
                  <button onclick="window.close()" style="margin:30px; padding:10px 20px; background:#ffd700; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">關閉預覽</button>
                </body>
              </html>
            `)
          }
        }
      }, 800)

    } catch (error) {
      console.error('Download failed:', error)
      alert('抱歉，製作圖片時發生錯誤。請嘗試重新整理網頁，或直接使用手機截圖。')
    }
  }, [currentVerse])

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
              <div className="card-face card-back" ref={cardRef}>
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
        <div className="button-group" style={{ marginTop: '2rem' }}>
          <button className="draw-button secondary" onClick={handleDownload}>
            <span>🧧 儲存為圖片</span>
          </button>
          <button className="draw-button" onClick={drawCard}>
            <span>再次領取祝福</span>
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
