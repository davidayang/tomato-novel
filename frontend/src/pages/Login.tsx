import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('12345');
  const [showError, setShowError] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [loginStage, setLoginStage] = useState<'idle' | 'success_pass' | 'collapse_charge' | 'shatter' | 'pitch_black'>('idle');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.fromLogout) {
      setShowLogout(true);
      setTimeout(() => setShowLogout(false), 3500);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const shatterShards = React.useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 100 + Math.random() * 200; 
        const endX = Math.cos(angle) * velocity;
        const endY = Math.sin(angle) * velocity;
        const size = 2 + Math.random() * 18;
        const rot = Math.random() * 2000 - 1000;
        const color = Math.random() > 0.7 ? '#ff3c64' : (Math.random() > 0.3 ? '#00e3fd' : '#ffffff');
        const shapes = [
          'polygon(50% 0%, 0% 100%, 100% 100%)',
          'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)',
          'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
        ];
        const clipPath = shapes[Math.floor(Math.random() * shapes.length)];
          
        return {
           id: i, endX, endY, size, rot, color, clipPath,
           duration: 0.4 + Math.random() * 1.2,
           heightMult: 0.6 + Math.random() * 2
        };
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((email === 'admin' || email === 'admin@example.com') && password === '12345') {
      setLoginStage('success_pass');
      setTimeout(() => setLoginStage('collapse_charge'), 2000);
      setTimeout(() => setLoginStage('shatter'), 4000);
      setTimeout(() => setLoginStage('pitch_black'), 4800); 
      setTimeout(() => navigate('/', { state: { fromLogin: true } }), 5500);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div className={`stars-bg ${loginStage === 'collapse_charge' ? 'screen-shake-accelerate' : ''}`} style={{ minHeight: '100vh', width: '100vw', color: '#f1f3fc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 🚨 Full Viewport Browser Border (Triggered during success) */}
      <div className={loginStage === 'collapse_charge' ? 'cyber-global-border' : ''} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 99995 }} />

      {/* 🌑 Full Blackout Layer */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', zIndex: 99990, opacity: (loginStage === 'shatter' || loginStage === 'pitch_black') ? 1 : 0, pointerEvents: 'none' }} />
      
      {/* 💥 Flying Splinters (Individual random shards) */}
      {(loginStage === 'shatter') && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100000, pointerEvents: 'none' }}>
           {shatterShards.map(shard => (
              <div 
                key={shard.id}
                className="shard-particle"
                style={{
                  width: shard.size,
                  height: shard.size * shard.heightMult,
                  background: shard.color,
                  clipPath: shard.clipPath,
                  color: shard.color,
                  '--tx': `${shard.endX}vw`,
                  '--ty': `${shard.endY}vh`,
                  '--rot': `${shard.rot}deg`,
                  '--dur': `${shard.duration}s`
                } as React.CSSProperties}
              />
           ))}
        </div>
      )}


      
      {/* 🟥 Fantasy Logout Popup Card */}
      <div 
        style={{
          position: 'fixed',
          top: '48px',
          left: '50%',
          transform: `translate(-50%, 0) scale(${showLogout ? 1 : 0.95})`,
          opacity: showLogout ? 1 : 0,
          pointerEvents: showLogout ? 'all' : 'none',
          width: '80vw',
          maxWidth: '800px',
          height: '48px',
          background: 'linear-gradient(90deg, rgba(30,5,10,0) 0%, rgba(50,10,20,0.8) 20%, rgba(70,15,25,0.9) 50%, rgba(50,10,20,0.8) 80%, rgba(30,5,10,0) 100%)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255, 60, 100, 0.5)',
          borderBottom: '1px solid rgba(255, 60, 100, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          boxShadow: '0 0 30px rgba(255, 60, 100, 0.2)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 1100,
        }}
      >
        <span style={{ color: '#ff3c64', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600 }}>Disconnecting...</span>
        
        {/* EKG / Heartbeat Flatline Animation */}
        <div style={{ flex: 1, margin: '0 32px', position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 1000 48" preserveAspectRatio="none" style={{ position: 'absolute', width: '100%', height: '100%' }}>
               <polyline fill="none" stroke="#ff3c64" strokeWidth="2" strokeDasharray="1500" strokeDashoffset="1500"
                 className={showLogout ? 'logout-ekg-anim' : ''}
                 points="0,24 300,24 320,8 350,40 380,24 500,24 530,5 560,43 590,24 1000,24" 
               />
               <polyline fill="none" stroke="rgba(255,60,100,0.2)" strokeWidth="1" points="0,24 1000,24" />
            </svg>
        </div>

        <span style={{ color: '#ffb2b9', fontSize: '13px', fontWeight: 500, letterSpacing: '0.05em' }}>正在脱离超新星网络，意识连接已切断。</span>
      </div>

      {/* 🔴 Fantasy Error Popup Card */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          left: showError ? '40px' : '-400px',
          width: '240px',
          height: '380px',
          background: 'linear-gradient(135deg, rgba(20,5,10,0.9) 0%, rgba(30,10,20,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 60, 100, 0.4)',
          borderRadius: '16px',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(255, 60, 100, 0.3), inset 0 0 20px rgba(255, 60, 100, 0.1)',
          transition: 'left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 1000,
        }}
      >
        {/* Warning Tape */}
        <div style={{ width: '100%', height: '8px', background: 'repeating-linear-gradient(45deg, #ff3c64, #ff3c64 10px, transparent 10px, transparent 20px)', borderRadius: '4px', marginBottom: '24px' }} />
        
        {/* Avatar Placeholder */}
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,60,100,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px dashed rgba(255,60,100,0.5)' }}>
          <span className="material-symbols-outlined" style={{ color: '#ff3c64', fontSize: '42px', textShadow: '0 0 16px rgba(255,60,100,0.8)' }}>person_off</span>
        </div>

        {/* Text Info */}
        <span style={{ color: '#ff3c64', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Status: Denied</span>
        <span style={{ color: '#f1f3fc', fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em', marginBottom: '16px' }}>通行证失效</span>
        
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
        
        <span style={{ color: '#a8abb3', fontSize: '12px', lineHeight: 1.5, marginBottom: 'auto' }}>
          检测到非法时空引力波动。<br/>您的终端凭证无法接入超新星网络。
        </span>

        {/* Barcode Deco */}
        <div style={{ width: '100%', marginTop: '24px', height: '40px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 6px, rgba(255,255,255,0.2) 6px, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 12px)', opacity: 0.5 }} />
      </div>

      {/* 🟢 Fantasy Success Popup Card */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          right: loginStage !== 'idle' ? '40px' : '-400px',
          width: '240px',
          height: '380px',
          background: 'linear-gradient(135deg, rgba(5,20,10,0.9) 0%, rgba(10,30,20,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(60, 255, 120, 0.4)',
          borderRadius: '16px',
          padding: '32px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 12px 48px rgba(60, 255, 120, 0.3), inset 0 0 20px rgba(60, 255, 120, 0.1)',
          transition: 'right 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 1000,
        }}
      >
        <div style={{ width: '100%', height: '8px', background: 'repeating-linear-gradient(45deg, #3cff78, #3cff78 10px, transparent 10px, transparent 20px)', borderRadius: '4px', marginBottom: '24px' }} />
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(60,255,120,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '2px dashed rgba(60,255,120,0.5)' }}>
          <span className="material-symbols-outlined" style={{ color: '#3cff78', fontSize: '42px', textShadow: '0 0 16px rgba(60,255,120,0.8)' }}>verified_user</span>
        </div>
        <span style={{ color: '#3cff78', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>Status: Granted</span>
        <span style={{ color: '#f1f3fc', fontSize: '18px', fontWeight: 900, letterSpacing: '0.05em', marginBottom: '16px' }}>准许可通行</span>
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
        <span style={{ color: '#a8abb3', fontSize: '12px', lineHeight: 1.5, marginBottom: 'auto' }}>
          时空引力场同步完毕。<br/>欢迎接入超新星网络，创作者。
        </span>
        <div style={{ width: '100%', marginTop: '24px', height: '40px', background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 2px, transparent 2px, transparent 6px, rgba(255,255,255,0.2) 6px, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 12px)', opacity: 0.5 }} />
      </div>
      
      {/* 🌌 Background Explosive Elements: 1:1 Match from Source */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(255,122,251,0.08)', filter: 'blur(120px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(0,227,253,0.08)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <main 
        className={`w-full max-w-md px-6 z-10 position-relative ${loginStage === 'collapse_charge' ? 'glitch-shake cyber-charge-border' : ''}`}
        style={{ width: '100%', maxWidth: 420, padding: '0 24px', zIndex: 10, position: 'relative', borderRadius: '16px', transition: 'all 0.2s', background: loginStage === 'collapse_charge' ? 'rgba(0,0,0,0.5)' : 'transparent', border: loginStage === 'collapse_charge' ? '4px solid #ff3c64' : '4px solid transparent', boxShadow: loginStage === 'collapse_charge' ? 'inset 0 0 40px #ff3c64, 0 0 50px rgba(255,60,100,0.4)' : 'none' }}
      >
        
        {/* ☄️ Brand Identity */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
           <h1 className="serif-text" style={{ fontSize: 48, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right, #ff7afb, #00e3fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, filter: 'drop-shadow(0 0 15px rgba(255, 122, 251, 0.4))' }}>
              短篇大爆炸！
           </h1>
           <p style={{ color: '#00e3fd', fontSize: 10, letterSpacing: '0.2em', fontWeight: 600, textTransform: 'uppercase', marginTop: 8 }}>
              指引之超新星
           </p>
        </div>

        {/* 🧊 Login Card */}
        <div style={{ background: 'rgba(32, 38, 47, 0.6)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 40, boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)' }}>
          <h2 className="serif-text" style={{ fontSize: 28, color: '#f1f3fc', marginBottom: 32, textAlign: 'center', fontWeight: 500 }}>欢迎回来</h2>
          
          <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
               <label style={{ fontSize: 11, fontWeight: 700, color: '#a8abb3', marginLeft: 4 }}>邮箱地址 / 账号</label>
               <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#0a1018', borderBottom: '2px solid rgba(68, 72, 79, 0.3)', padding: '12px 16px', borderRadius: '12px 12px 0 0', transition: 'all 0.3s' }}>
                  <span className="material-symbols-outlined" style={{ color: '#72757d', marginRight: 12, fontSize: 20 }}>mail</span>
                  <input 
                    type="text" 
                    placeholder="admin" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="off"
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f3fc', width: '100%', fontSize: 15, caretColor: '#00e3fd' }} 
                  />
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
               <label style={{ fontSize: 11, fontWeight: 700, color: '#a8abb3', marginLeft: 4 }}>密码</label>
               <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: '#0a1018', borderBottom: '2px solid rgba(68, 72, 79, 0.3)', padding: '12px 16px', borderRadius: '12px 12px 0 0', transition: 'all 0.3s' }}>
                  <span className="material-symbols-outlined" style={{ color: '#72757d', marginRight: 12, fontSize: 20 }}>lock</span>
                  <input 
                    type="password" 
                    placeholder="12345" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="new-password"
                    style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f3fc', width: '100%', fontSize: 15, caretColor: '#00e3fd' }} 
                  />
               </div>
            </div>

            <button 
              type="submit"
              className="login-btn"
              style={{ background: '#ff7afb', color: '#57005a', padding: '16px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'all 0.3s', marginTop: 12, boxShadow: '0 8px 24px -4px rgba(255,122,251,0.4)' }}
            >
               开始创作之火
            </button>
          </form>
        </div>

        {/* 🔗 Footer Links */}
        <footer style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#a8abb3' }}>
              <span style={{ cursor: 'pointer' }}>忘记密码？</span>
              <span style={{ opacity: 0.2 }}>|</span>
              <span style={{ cursor: 'pointer' }}>隐私政策</span>
           </div>
           <p style={{ fontSize: 11, color: '#a8abb3' }}>
              还没有账号？ <span style={{ color: '#ff7afb', fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}>立即注册</span>
           </p>
        </footer>
      </main>

      {/* 🌠 Aesthetic Decorative Side Image */}
      <div className={`lg:block hidden ${loginStage === 'collapse_charge' ? 'blackhole-implode' : ''}`} style={{ position: 'absolute', right: '-2%', top: '50%', transform: 'translateY(-50%)', width: '40vw', minWidth: 500, height: '40vw', borderRadius: '50%', overflow: 'hidden', opacity: 0.35, mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 0, WebkitMaskImage: loginStage === 'collapse_charge' ? 'none' : 'radial-gradient(circle at center, black 30%, transparent 70%)', maskImage: loginStage === 'collapse_charge' ? 'none' : 'radial-gradient(circle at center, black 30%, transparent 70%)', filter: 'blur(1px)' }}>
         <img 
           className="galaxy-spin"
           src="/assets/images/galaxy.png" 
           style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
         />
      </div>

      <style>{`
        .stars-bg {
            background-color: #0a0e14;
        }
        .stars-bg::before {
            content: '';
            position: absolute;
            top: -50vh;
            left: -50vw;
            width: 200vw;
            height: 200vh;
            background-image: 
              radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 90px 40px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.5), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 250px 90px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 280px 200px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 150px 50px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 100px 250px, rgba(255,255,255,0.4), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 50px 150px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 200px 280px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 220px 20px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 120px 150px, rgba(255,255,255,0.5), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 260px 180px, rgba(255,255,255,0.7), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 10px 220px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 180px 260px, rgba(255,255,255,0.6), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 70px 180px, rgba(255,255,255,0.4), rgba(0,0,0,0)),
              radial-gradient(2px 2px at 140px 10px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 290px 110px, rgba(255,255,255,0.5), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 30px 290px, rgba(255,255,255,0.9), rgba(0,0,0,0)),
              radial-gradient(1px 1px at 230px 140px, rgba(255,255,255,0.6), rgba(0,0,0,0));
            background-repeat: repeat;
            background-size: 300px 300px;
            animation: rotateStars 240s linear infinite;
            z-index: 0;
            pointer-events: none;
        }
        @keyframes rotateStars {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spinGalaxy {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes blackholeSuck {
            0% { transform: translateY(-50%) scale(1) rotate(0deg); filter: contrast(1) brightness(1); }
            50% { transform: translateY(-50%) scale(1.5) rotate(1000deg); filter: contrast(1.5) brightness(3); }
            100% { transform: translateY(-50%) scale(0) rotate(5000deg); filter: contrast(3) brightness(10); }
        }
        @keyframes blackholeSuckStars {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.2) rotate(1000deg); }
            100% { transform: scale(0) rotate(5000deg); }
        }
        @keyframes cyberPulseGlobal {
            0% { box-shadow: inset 0 0 10px #ff3c64, inset 0 0 10px #ff3c64; }
            50% { box-shadow: inset 0 0 40px #ff3c64, inset 0 0 15px #fff; }
            100% { box-shadow: inset 0 0 10px #ff3c64, inset 0 0 10px #ff3c64; }
        }
        @keyframes intensifyingShake {
            0%   { transform: translate(0, 0); filter: blur(0); }
            50%  { transform: translate(0.5px, -0.3px); filter: blur(0); }
            60%  { transform: translate(-1px, 0.8px); filter: blur(0); }
            70%  { transform: translate(2px, -1.5px); filter: blur(0.3px); }
            80%  { transform: translate(-5px, 4px); filter: blur(1px); }
            88%  { transform: translate(12px, -10px); filter: blur(3px); }
            94%  { transform: translate(-30px, 25px); filter: blur(8px); }
            100% { transform: translate(60px, -50px); filter: blur(20px); }
        }
        @keyframes eyelidTremble {
            0%   { transform: translateY(0); }
            25%  { transform: translateY(-2px); }
            50%  { transform: translateY(1px); }
            75%  { transform: translateY(-3px); }
            100% { transform: translateY(0); }
        }
        .eyelid-tremble {
            animation: eyelidTremble 0.15s infinite;
        }
        .cyber-global-border {
            border: 4px solid #ff3c64 !important;
            box-sizing: border-box !important;
            animation: cyberPulseGlobal 0.1s infinite !important;
        }
        .screen-shake-accelerate {
            animation: intensifyingShake 2s linear forwards !important;
        }
        @keyframes glitchShake {
            0% { transform: translate(0) skew(0deg); filter: blur(0px) contrast(1); }
            20% { transform: translate(-2px, 1px) skew(2deg); filter: blur(2px) contrast(1.5) hue-rotate(90deg); }
            40% { transform: translate(4px, -2px) skew(-3deg); filter: blur(0px) contrast(1.2) invert(10%); }
            60% { transform: translate(-1px, 3px) skew(1deg); filter: blur(1px) contrast(2) hue-rotate(180deg); }
            80% { transform: translate(3px, -1px) skew(-2deg); filter: blur(0px) hue-rotate(0deg); }
            100% { transform: translate(0) skew(0deg); filter: blur(0px); }
        }
        @keyframes shake {
          0% { transform: translate(1px, 1px); }
          25% { transform: translate(-4px, -4px); }
          50% { transform: translate(4px, -2px); }
          75% { transform: translate(-2px, 4px); }
          100% { transform: translate(1px, 1px); }
        }
        @keyframes drawEkg {
            0% { stroke-dashoffset: 1500; filter: drop-shadow(0 0 2px #ff3c64); }
            80% { stroke-dashoffset: 0; filter: drop-shadow(0 0 8px #ff3c64); }
            100% { stroke-dashoffset: 0; filter: drop-shadow(0 0 1px #ff3c64); opacity: 0.3; }
        }
        .logout-ekg-anim { animation: drawEkg 3s cubic-bezier(0.2, 0.8, 0.3, 1) forwards; }
        
        .galaxy-spin { animation: spinGalaxy 60s linear infinite; }
        
        .blackhole-implode { animation: blackholeSuck 2s cubic-bezier(0.7, 0, 1, 1) forwards !important; }
        .galaxy-spin { animation: spinGalaxy 60s linear infinite; }
        
        .blackhole-implode { animation: blackholeSuck 2s cubic-bezier(0.7, 0, 1, 1) forwards !important; }
        .stars-bg.screen-shake-accelerate::before { animation: blackholeSuckStars 2s cubic-bezier(0.7, 0, 1, 1) forwards !important; }
        .glitch-shake { animation: glitchShake 0.15s infinite !important; }

        @keyframes flyShard {
            0% { transform: translate(-50%, -50%) rotate(0deg) scale(1.5); opacity: 1; filter: brightness(2.5) drop-shadow(0 0 10px currentColor); }
            100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(0.2); opacity: 0; filter: brightness(1) drop-shadow(0 0 0px currentColor); }
        }
        .shard-particle {
            position: absolute; top: 50%; left: 50%;
            animation: flyShard var(--dur) cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
            box-shadow: 0 0 15px currentColor;
        }

        .input-group:focus-within { border-bottom-color: #00e3fd !important; filter: drop-shadow(0 4px 12px rgba(0, 227, 253, 0.15)); }
        .login-btn:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .login-btn:active { transform: scale(0.98); }
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #f1f3fc !important;
          -webkit-box-shadow: 0 0 0px 1000px #0a1018 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
}
