import React, { useState } from 'react';
import { Sparkles, MessageCircle, Heart, Zap } from 'lucide-react';

interface RobotMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showSpeech?: boolean;
  interactive?: boolean;
}

export const RobotMascot: React.FC<RobotMascotProps> = ({
  size = 'md',
  className = '',
  showSpeech = true,
  interactive = true,
}) => {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [isWaving, setIsWaving] = useState(true);
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);

  const dialogueList = [
    "Hi there! Welcome to MyBlog! 🚀",
    "Explore our latest Web Dev, Vector Art & AI stories!",
    "Ready to publish? Create an account in seconds ✨",
    "Precision is everything in modern tech & code 💡",
    "Need help writing? Live Markdown is ready for you!",
  ];

  const handleNextDialogue = () => {
    setDialogueIndex((prev) => (prev + 1) % dialogueList.length);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikes((l) => l + 1);
      setHasLiked(true);
    }
  };

  // Dimensions based on size
  const sizeMap = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-32 h-32 sm:w-36 sm:h-36',
    lg: 'w-44 h-44 sm:w-48 sm:h-48',
    hero: 'w-52 h-52 sm:w-68 sm:h-68 lg:w-80 lg:h-80',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} id="robot-mascot-root">
      
      {/* Interactive Speech Bubble */}
      {showSpeech && (
        <div
          onClick={handleNextDialogue}
          className={`mb-3 px-3.5 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md text-cyan-200 text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2 max-w-[260px] sm:max-w-xs transition-all ${
            interactive ? 'cursor-pointer hover:border-cyan-300 hover:bg-cyan-900/90 hover:scale-105' : ''
          }`}
          title="Click to hear what Robo has to say!"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
          <p className="font-medium text-[11px] sm:text-xs leading-tight">
            {dialogueList[dialogueIndex]}
          </p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-cyan-400/60" />
        </div>
      )}

      {/* Main Robot Graphic Container with Floating Animation */}
      <div
        onClick={handleNextDialogue}
        className={`relative ${sizeMap[size]} animate-float ${interactive ? 'cursor-pointer group' : ''}`}
      >
        {/* Soft Ambient Neon Glow Behind Robot */}
        <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-2xl animate-glow pointer-events-none" />

        {/* Scalable SVG Robot */}
        <svg
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_15px_25px_rgba(6,182,212,0.45)] transition-transform group-hover:scale-105"
        >
          <defs>
            {/* Gradients for 3D metallic-cyan look */}
            <linearGradient id="bodyGrad" x1="40" y1="20" x2="200" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e2f1f8" />
              <stop offset="35%" stopColor="#9ec9dd" />
              <stop offset="75%" stopColor="#5588a3" />
              <stop offset="100%" stopColor="#254b63" />
            </linearGradient>

            <linearGradient id="visorGrad" x1="60" y1="60" x2="180" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#041226" />
              <stop offset="100%" stopColor="#082846" />
            </linearGradient>

            <linearGradient id="cyanNeon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>

            <linearGradient id="antennaGrad" x1="120" y1="10" x2="120" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Antenna with glowing beacon */}
          <line x1="120" y1="25" x2="120" y2="52" stroke="url(#antennaGrad)" strokeWidth="5" strokeLinecap="round" />
          <circle cx="120" cy="20" r="8" fill="url(#cyanNeon)" filter="url(#neonGlow)" />
          <circle cx="120" cy="20" r="4" fill="#ffffff" />

          {/* 2. Left Ear / Headphone pod */}
          <rect x="42" y="80" width="12" height="34" rx="6" fill="#47697f" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="48" cy="97" r="3" fill="#22d3ee" filter="url(#neonGlow)" />

          {/* 3. Right Ear / Headphone pod */}
          <rect x="186" y="80" width="12" height="34" rx="6" fill="#47697f" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="192" cy="97" r="3" fill="#22d3ee" filter="url(#neonGlow)" />

          {/* 4. Main Head (Rounded 3D capsule) */}
          <rect
            x="50"
            y="48"
            width="140"
            height="104"
            rx="52"
            fill="url(#bodyGrad)"
            stroke="#c8e4f0"
            strokeWidth="2.5"
          />

          {/* Specular Highlight on head top */}
          <path
            d="M80 56 Q120 48 160 56"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* 5. Head Visor Screen (Dark Curved Screen) */}
          <rect
            x="64"
            y="66"
            width="112"
            height="68"
            rx="34"
            fill="url(#visorGrad)"
            stroke="#22d3ee"
            strokeWidth="2"
          />

          {/* 6. Glowing Animated Eyes & Smile */}
          {/* Left Eye */}
          <g filter="url(#neonGlow)">
            <ellipse cx="94" cy="98" rx="14" ry="12" fill="url(#cyanNeon)" />
            <ellipse cx="96" cy="96" rx="4" ry="4" fill="#ffffff" />
          </g>

          {/* Right Eye */}
          <g filter="url(#neonGlow)">
            <ellipse cx="146" cy="98" rx="14" ry="12" fill="url(#cyanNeon)" />
            <ellipse cx="148" cy="96" rx="4" ry="4" fill="#ffffff" />
          </g>

          {/* Cute Smile */}
          <path
            d="M112 116 Q120 125 128 116"
            stroke="#22d3ee"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#neonGlow)"
          />

          {/* 7. Neck connector */}
          <rect x="105" y="148" width="30" height="12" rx="4" fill="#254b63" stroke="#22d3ee" strokeWidth="1" />

          {/* 8. Body Torso */}
          <path
            d="M75 160 Q120 152 165 160 Q180 205 165 220 Q120 226 75 220 Q60 205 75 160 Z"
            fill="url(#bodyGrad)"
            stroke="#c8e4f0"
            strokeWidth="2"
          />

          {/* Chest emblem / glowing badge */}
          <circle cx="120" cy="184" r="10" fill="#0c2d48" stroke="#22d3ee" strokeWidth="1.5" />
          <circle cx="120" cy="184" r="5" fill="url(#cyanNeon)" filter="url(#neonGlow)" />

          {/* 9. Waving Left Arm */}
          <g className="animate-wave">
            <path
              d="M68 170 Q40 160 30 135 Q22 120 34 114 Q46 110 52 128 Q60 152 70 165"
              fill="url(#bodyGrad)"
              stroke="#c8e4f0"
              strokeWidth="2"
            />
            {/* Hand pod */}
            <circle cx="28" cy="120" r="9" fill="url(#bodyGrad)" stroke="#22d3ee" strokeWidth="1.5" />
            <circle cx="28" cy="120" r="3" fill="#22d3ee" filter="url(#neonGlow)" />
          </g>

          {/* 10. Right Resting Arm */}
          <path
            d="M172 170 Q195 180 202 205 Q205 215 195 218 Q185 220 180 208 Q174 192 168 178"
            fill="url(#bodyGrad)"
            stroke="#c8e4f0"
            strokeWidth="2"
          />
        </svg>

        {/* Floating Quick Action Badge */}
        <div className="absolute -bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-900/90 border border-cyan-400/60 backdrop-blur-md shadow-md text-cyan-200 text-[10px] font-semibold">
          <Zap className="w-3 h-3 text-cyan-300 fill-cyan-300" />
          <span>AI Mascot v2.4</span>
        </div>
      </div>

    </div>
  );
};
