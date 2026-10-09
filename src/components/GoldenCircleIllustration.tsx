import React, { useState } from 'react';

interface GoldenCircleIllustrationProps {
  activeRing?: 'why' | 'how' | 'what' | null;
  onRingSelect?: (ring: 'why' | 'how' | 'what') => void;
  whyText?: string;
  howText?: string;
  whatText?: string;
}

export function GoldenCircleIllustration({
  activeRing = null,
  onRingSelect,
  whyText,
  howText,
  whatText,
}: GoldenCircleIllustrationProps) {
  const [hoveredRing, setHoveredRing] = useState<'why' | 'how' | 'what' | null>(null);

  const currentRing = hoveredRing || activeRing;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <svg
        viewBox="0 0 400 400"
        className="h-72 w-72 sm:h-84 sm:w-84 max-w-full drop-shadow-sm select-none transition-transform"
        role="img"
        aria-label="Golden Circle interactive concentric rings illustration"
      >
        <title>The Golden Circle: Why, How, What</title>
        <desc>
          Three concentric rings illustrating Simon Sinek's Golden Circle framework. The innermost ring is Why (Purpose), middle is How (Process), and outer is What (Result).
        </desc>

        {/* Outer Ring: WHAT */}
        <circle
          cx="200"
          cy="200"
          r="175"
          fill={currentRing === 'what' ? '#E9E7DF' : '#F6F3EC'}
          stroke={currentRing === 'what' ? '#171B1B' : '#D8D8CF'}
          strokeWidth={currentRing === 'what' ? '2.5' : '1.5'}
          className="cursor-pointer transition-colors duration-200"
          onClick={() => onRingSelect?.('what')}
          onMouseEnter={() => setHoveredRing('what')}
          onMouseLeave={() => setHoveredRing(null)}
          role="button"
          tabIndex={0}
          aria-label="What ring: Outcomes and tangible offerings"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRingSelect?.('what');
            }
          }}
        />

        {/* Middle Ring: HOW */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill={currentRing === 'how' ? '#DCE5D8' : '#ECE9DF'}
          stroke={currentRing === 'how' ? '#171B1B' : '#C2C2B8'}
          strokeWidth={currentRing === 'how' ? '2.5' : '1.5'}
          className="cursor-pointer transition-colors duration-200"
          onClick={() => onRingSelect?.('how')}
          onMouseEnter={() => setHoveredRing('how')}
          onMouseLeave={() => setHoveredRing(null)}
          role="button"
          tabIndex={0}
          aria-label="How ring: Principles, values, and practices"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRingSelect?.('how');
            }
          }}
        />

        {/* Center Ring: WHY */}
        <circle
          cx="200"
          cy="200"
          r="65"
          fill={currentRing === 'why' ? '#D64B37' : '#B83E2D'}
          stroke="#171B1B"
          strokeWidth="2"
          className="cursor-pointer transition-colors duration-200"
          onClick={() => onRingSelect?.('why')}
          onMouseEnter={() => setHoveredRing('why')}
          onMouseLeave={() => setHoveredRing(null)}
          role="button"
          tabIndex={0}
          aria-label="Why ring: Purpose, cause, and belief"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onRingSelect?.('why');
            }
          }}
        />

        {/* Labels on SVG */}
        <text
          x="200"
          y="50"
          textAnchor="middle"
          fill="#171B1B"
          className="pointer-events-none text-[11px] font-bold uppercase tracking-[0.25em]"
        >
          WHAT
        </text>

        <text
          x="200"
          y="108"
          textAnchor="middle"
          fill="#171B1B"
          className="pointer-events-none text-[11px] font-bold uppercase tracking-[0.25em]"
        >
          HOW
        </text>

        <text
          x="200"
          y="206"
          textAnchor="middle"
          fill="#FFFEFA"
          className="pointer-events-none font-serif text-[15px] font-bold tracking-[0.1em]"
        >
          WHY
        </text>
      </svg>

      {/* Dynamic Descriptor Card below SVG */}
      <div className="mt-4 w-full max-w-sm rounded-none border border-[#D8D8CF] bg-[#FFFEFA] p-3.5 text-center text-xs shadow-xs">
        {currentRing === 'why' ? (
          <div>
            <span className="font-bold uppercase tracking-wider text-[#D64B37]">The Core (WHY)</span>
            <p className="mt-1 text-[#666D68] leading-relaxed">
              {whyText?.trim() || 'Your purpose, cause, or belief. Why does your project or organization exist?'}
            </p>
          </div>
        ) : currentRing === 'how' ? (
          <div>
            <span className="font-bold uppercase tracking-wider text-[#171B1B]">The Process (HOW)</span>
            <p className="mt-1 text-[#666D68] leading-relaxed">
              {howText?.trim() || 'The specific guiding values, principles, and strengths that differentiate how you act.'}
            </p>
          </div>
        ) : currentRing === 'what' ? (
          <div>
            <span className="font-bold uppercase tracking-wider text-[#171B1B]">The Result (WHAT)</span>
            <p className="mt-1 text-[#666D68] leading-relaxed">
              {whatText?.trim() || 'The tangible products, services, actions, and deliverables you create as proof of your Why.'}
            </p>
          </div>
        ) : (
          <p className="text-[#666D68]">
            Click or tap any ring to highlight that dimension of your purpose framework.
          </p>
        )}
      </div>
    </div>
  );
}
