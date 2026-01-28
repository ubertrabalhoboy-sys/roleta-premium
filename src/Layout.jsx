import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        :root {
          --primary: #6c5ce7; 
          --secondary: #a29bfe;
          --bg-color: #eef2f5;
          --text-dark: #2d3436;
          --text-light: #636e72;
          --white: #ffffff;
          --success: #00b894;
          --whatsapp-green: #25D366;
          --warning: #fdcb6e;
          --danger: #d63031;
          --cyber-dark: #1a0505;
          --cyber-panel: rgba(35, 10, 10, 0.95);
          --neon-red: #ff003c;
          --neon-gold: #ffd700;
          --neon-glow: #ff4d4d;
          --glass-border: rgba(255, 255, 255, 0.15);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        body {
          background-color: var(--bg-color);
          color: var(--text-dark);
        }

        /* Font Awesome icons styling */
        .fab, .fas, .far {
          font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands" !important;
        }
      `}</style>
      {children}
    </div>
  );
}