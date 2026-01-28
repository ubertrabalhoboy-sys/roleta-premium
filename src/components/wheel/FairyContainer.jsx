import React, { useEffect, useState } from 'react';

export default function FairyContainer() {
  const [fairies, setFairies] = useState([]);

  useEffect(() => {
    const newFairies = [];
    for (let i = 0; i < 30; i++) {
      newFairies.push({
        id: i,
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        moveX: (Math.random() * 200 - 100) + 'px',
        moveY: (Math.random() * 200 - 100) + 'px',
        duration: (Math.random() * 3 + 4) + 's',
        delay: (Math.random() * 5) + 's'
      });
    }
    setFairies(newFairies);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]">
      {fairies.map(fairy => (
        <div
          key={fairy.id}
          className="absolute w-[3px] h-[3px] bg-white rounded-full opacity-0"
          style={{
            left: fairy.left,
            top: fairy.top,
            boxShadow: '0 0 6px #ff003c, 0 0 12px #ffd700',
            animation: `fairyFloat ${fairy.duration} infinite ease-in-out`,
            animationDelay: fairy.delay,
            '--moveX': fairy.moveX,
            '--moveY': fairy.moveY
          }}
        />
      ))}
      <style>{`
        @keyframes fairyFloat {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          20% { opacity: 0.8; }
          50% { transform: translate(var(--moveX), var(--moveY)) scale(1.5); opacity: 1; }
          100% { transform: translate(calc(var(--moveX) * 1.5), -100vh) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}