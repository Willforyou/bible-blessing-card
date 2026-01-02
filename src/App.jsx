import { useState, useCallback, useMemo } from 'react'
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

  const drawCard = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setShowCard(false)
    setIsFlipped(false)

    // Clear current to force re-render/animation if needed
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * verses.length)
      setCurrentVerse(verses[randomIndex])
      setShowCard(true)

      // Delay the flip slightly after card appears
      setTimeout(() => {
        setIsFlipped(true)
        setIsAnimating(false)

        // Trigger massive ribbon confetti
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;

        // Ribbon / Cannon effect
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          spread: 80,
          ticks: 400,
          gravity: 0.8,
          scalar: 1.2,
          colors: ['#FFD700', '#D40000', '#FF0000', '#C5A021', '#ffffff']
        };

        function fire(particleRatio, opts) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio)
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });

        // Sustained burst
        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);

          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#D40000']
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#D40000']
          });
        }, 150);
      }, 500);
    }, 400)
  }, [isAnimating])

  return (
    <div className="container">
      <div className="bg-effects">
        {lanterns.map(l => (
          <div
            key={l.id}
            className="lantern"
            style={{
              left: l.left,
              animationDelay: l.delay,
              animationDuration: l.duration,
              width: l.size,
              height: `calc(${l.size} * 1.4)`
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

      <button
        className="draw-button"
        onClick={drawCard}
        disabled={isAnimating}
      >
        {isAnimating ? '正在領取祝福...' : '領取每日金句'}
      </button>

      <div className="card-container">
        {showCard && currentVerse && (
          <div className={`flip-card ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="flip-card-inner">
              <div className="card-face card-front">
                <div className="card-front-hint">正在為您翻開祝福...</div>
              </div>
              <div className="card-face card-back">
                <div className="card">
                  <span className="card-category">{currentVerse.category}</span>
                  <div className="verse-icon">{currentVerse.icon}</div>
                  <div className="verse-text">「{currentVerse.verse}」</div>
                  <div className="verse-ref">{currentVerse.reference}</div>
                  {currentVerse.meaning && (
                    <div className="verse-meaning">
                      <strong>💡 寓意/異象：</strong><br />
                      {currentVerse.meaning}
                    </div>
                  )}
                  <div className="card-bg-pattern">福</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ marginTop: '4rem', opacity: 0.5, fontSize: '0.8rem', color: '#ffd700' }}>
        © 2026 聖經祝福小站 | 願主賜福與你
      </footer>
    </div>
  )
}

export default App
