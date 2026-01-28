import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

const WheelCanvas = forwardRef(({ prizes, onSpinEnd }, ref) => {
  const canvasRef = useRef(null);
  const [startAngle, setStartAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinTimeoutRef = useRef(null);
  const spinTimeRef = useRef(0);
  const spinTimeTotalRef = useRef(0);
  const spinAngleStartRef = useRef(10);
  const startAngleRef = useRef(0);

  const arc = prizes.length > 0 ? (Math.PI * 2) / prizes.length : 0;

  useImperativeHandle(ref, () => ({
    spin: () => {
      if (isSpinning || prizes.length === 0) return;
      setIsSpinning(true);
      spinAngleStartRef.current = Math.random() * 10 + 10;
      spinTimeRef.current = 0;
      spinTimeTotalRef.current = Math.random() * 3000 + 4000;
      rotateWheel();
    }
  }));

  const easeOut = (t, b, c, d) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const rotateWheel = () => {
    spinTimeRef.current += 30;
    if (spinTimeRef.current >= spinTimeTotalRef.current) {
      stopRotateWheel();
      return;
    }
    const spinAngle = spinAngleStartRef.current - easeOut(spinTimeRef.current, 0, spinAngleStartRef.current, spinTimeTotalRef.current);
    startAngleRef.current += (spinAngle * Math.PI / 180);
    setStartAngle(startAngleRef.current);
    spinTimeoutRef.current = setTimeout(rotateWheel, 30);
  };

  const stopRotateWheel = () => {
    clearTimeout(spinTimeoutRef.current);
    setIsSpinning(false);
    
    const degrees = startAngleRef.current * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd) % prizes.length;
    let prize = prizes[index];
    
    // Check if prize is available
    if (prize) {
      const isExpired = prize.expiration_date && new Date(prize.expiration_date) < new Date();
      const hasReachedLimit = prize.limit_count && (prize.current_count || 0) >= prize.limit_count;
      
      if (isExpired || hasReachedLimit) {
        // Find alternative available prize
        const availablePrizes = prizes.filter(p => {
          const pExpired = p.expiration_date && new Date(p.expiration_date) < new Date();
          const pLimitReached = p.limit_count && (p.current_count || 0) >= p.limit_count;
          return !pExpired && !pLimitReached;
        });
        
        if (availablePrizes.length > 0) {
          prize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
        }
      }
    }
    
    if (onSpinEnd && prize) {
      onSpinEnd(prize);
    }
  };

  useEffect(() => {
    drawWheel();
  }, [startAngle, prizes]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    const outsideRadius = 145;
    const textRadius = 110;
    const insideRadius = 30;

    ctx.clearRect(0, 0, 300, 300);
    ctx.strokeStyle = "#bc13fe";
    ctx.lineWidth = 1;

    for (let i = 0; i < prizes.length; i++) {
      const angle = startAngle + i * arc;
      ctx.fillStyle = (i % 2 === 0) ? '#050510' : '#1a0b2e';
      ctx.beginPath();
      ctx.arc(150, 150, outsideRadius, angle, angle + arc, false);
      ctx.arc(150, 150, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.translate(
        150 + Math.cos(angle + arc / 2) * textRadius,
        150 + Math.sin(angle + arc / 2) * textRadius
      );
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const text = prizes[i].name;
      ctx.font = 'bold 14px Rajdhani, sans-serif';
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      id="wheel-canvas"
      width="300"
      height="300"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        transition: 'transform 0.1s ease'
      }}
    />
  );
});

WheelCanvas.displayName = 'WheelCanvas';

export default WheelCanvas;