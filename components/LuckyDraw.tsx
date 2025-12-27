
import React, { useState, useEffect, useRef } from 'react';
import { Participant } from '../types';

interface LuckyDrawProps {
  participants: Participant[];
}

const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState('準備好了嗎？');
  const [winners, setWinners] = useState<Participant[]>([]);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to fix namespace error in browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const startDraw = () => {
    if (participants.length === 0) return;
    
    let pool = participants;
    if (!allowDuplicates) {
      pool = participants.filter(p => !winners.find(w => w.id === p.id));
    }

    if (pool.length === 0) {
      alert("池中已無可抽取的名單！");
      return;
    }

    setIsSpinning(true);
    let counter = 0;
    const duration = 2000;
    const interval = 80;

    timerRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setCurrentDisplay(pool[randomIndex].name);
      counter += interval;

      if (counter >= duration) {
        if (timerRef.current) clearInterval(timerRef.current);
        const finalWinner = pool[Math.floor(Math.random() * pool.length)];
        setCurrentDisplay(finalWinner.name);
        setWinners(prev => [finalWinner, ...prev]);
        setIsSpinning(false);
        setShowConfetti(true);
      }
    }, interval);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Draw Area */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative border-4 border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 text-center">
          <h2 className="text-white text-2xl font-bold tracking-widest uppercase">
            <i className="fas fa-trophy mr-2 text-yellow-300"></i>
            幸運大抽獎
          </h2>
        </div>

        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[350px] relative">
          {showConfetti && (
             <div className="absolute inset-0 pointer-events-none">
                {[...Array(50)].map((_, i) => (
                  <div 
                    key={i} 
                    className="confetti" 
                    style={{
                      left: `${Math.random() * 100}%`,
                      backgroundColor: ['#ff0', '#f0f', '#0ff', '#f00', '#0f0'][Math.floor(Math.random() * 5)],
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
             </div>
          )}

          <div className={`text-6xl md:text-8xl font-black mb-12 transition-all duration-100 ${
            isSpinning ? 'text-indigo-400 blur-[1px] scale-110' : 'text-indigo-900 scale-100'
          }`}>
            {currentDisplay}
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            <button
              onClick={startDraw}
              disabled={isSpinning || participants.length === 0}
              className={`group relative px-12 py-5 rounded-2xl text-xl font-bold transition-all transform active:scale-95 shadow-lg ${
                isSpinning || participants.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'
              }`}
            >
              <span className="flex items-center">
                {isSpinning ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-3"></i>
                    抽獎中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-play mr-3"></i>
                    開始抽獎
                  </>
                )}
              </span>
            </button>

            <label className="flex items-center cursor-pointer select-none">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={allowDuplicates}
                  onChange={() => setAllowDuplicates(!allowDuplicates)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${allowDuplicates ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${allowDuplicates ? 'translate-x-6' : ''}`}></div>
              </div>
              <span className="ml-3 text-gray-700 font-medium">允許重複中獎</span>
            </label>
          </div>
        </div>
      </div>

      {/* Winners History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <i className="fas fa-medal text-yellow-500 mr-2"></i>
            中獎名單 ({winners.length})
          </h3>
          {winners.length > 0 && (
            <button 
              onClick={() => setWinners([])}
              className="text-gray-400 hover:text-red-500 text-sm transition-colors"
            >
              <i className="fas fa-eraser mr-1"></i>清空紀錄
            </button>
          )}
        </div>

        {winners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {winners.map((winner, idx) => (
              <div 
                key={`${winner.id}-${idx}`} 
                className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between animate-fadeIn"
              >
                <div className="flex items-center">
                  <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">
                    NO. {winners.length - idx}
                  </span>
                  <span className="text-indigo-900 font-semibold">{winner.name}</span>
                </div>
                <i className="fas fa-check-circle text-indigo-400"></i>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>尚未有人中獎，快按下開始抽獎按鈕！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyDraw;
