import React, { useEffect, useState } from 'react';

export default function BalloonOverlay({ show }) {
  const [balloons, setBalloons] = useState([]);

  useEffect(() => {
    if (show) {
      const newBalloons = [];
      for (let i = 0; i < 15; i++) {
        newBalloons.push({
          id: i,
          left: Math.random() * 100 + '%',
          delay: Math.random() * 2 + 's'
        });
      }
      setBalloons(newBalloons);
    } else {
      setBalloons([]);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-[-100px] left-0 w-full h-full pointer-events-none z-[2000]">
      {balloons.map(balloon => (
        <div
          key={balloon.id}
          className="absolute bottom-[-50px] w-[40px] h-[50px] rounded-full opacity-80"
          style={{
            left: balloon.left,
            backgroundColor: '#ff003c',
            boxShadow: '0 0 15px #ff003c',
            animation: `floatUp 4s ease-in infinite`,
            animationDelay: balloon.delay
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
          100% { transform: translateY(-120vh) rotate(20deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}