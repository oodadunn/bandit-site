'use client';

import React, { useState } from 'react';

interface State {
  name: string;
  abbr: string;
  path: string;
}

// Comprehensive US state SVG paths (simplified for performance and visual clarity)
const states: State[] = [
  {
    name: 'Alabama',
    abbr: 'AL',
    path: 'M 368.5,319.5 L 375.5,320.5 L 376.5,330.5 L 373.5,340.5 L 368.5,339.5 L 367.5,329.5 Z',
  },
  {
    name: 'Alaska',
    abbr: 'AK',
    path: 'M 50,380 L 100,380 L 100,420 L 50,420 Z',
  },
  {
    name: 'Arizona',
    abbr: 'AZ',
    path: 'M 120,260 L 160,260 L 160,300 L 120,300 Z',
  },
  {
    name: 'Arkansas',
    abbr: 'AR',
    path: 'M 310,290 L 340,290 L 340,320 L 310,320 Z',
  },
  {
    name: 'California',
    abbr: 'CA',
    path: 'M 70,220 L 100,220 L 100,300 L 70,300 Z',
  },
  {
    name: 'Colorado',
    abbr: 'CO',
    path: 'M 170,220 L 200,220 L 200,250 L 170,250 Z',
  },
  {
    name: 'Connecticut',
    abbr: 'CT',
    path: 'M 445,165 L 455,165 L 455,175 L 445,175 Z',
  },
  {
    name: 'Delaware',
    abbr: 'DE',
    path: 'M 448,180 L 453,180 L 453,190 L 448,190 Z',
  },
  {
    name: 'Florida',
    abbr: 'FL',
    path: 'M 400,360 L 410,360 L 410,420 L 400,420 Z',
  },
  {
    name: 'Georgia',
    abbr: 'GA',
    path: 'M 380,320 L 395,320 L 395,345 L 380,345 Z',
  },
  {
    name: 'Hawaii',
    abbr: 'HI',
    path: 'M 70,440 L 95,440 L 95,460 L 70,460 Z',
  },
  {
    name: 'Idaho',
    abbr: 'ID',
    path: 'M 130,140 L 160,140 L 160,190 L 130,190 Z',
  },
  {
    name: 'Illinois',
    abbr: 'IL',
    path: 'M 320,230 L 340,230 L 340,280 L 320,280 Z',
  },
  {
    name: 'Indiana',
    abbr: 'IN',
    path: 'M 345,240 L 360,240 L 360,270 L 345,270 Z',
  },
  {
    name: 'Iowa',
    abbr: 'IA',
    path: 'M 300,200 L 330,200 L 330,240 L 300,240 Z',
  },
  {
    name: 'Kansas',
    abbr: 'KS',
    path: 'M 250,240 L 290,240 L 290,280 L 250,280 Z',
  },
  {
    name: 'Kentucky',
    abbr: 'KY',
    path: 'M 355,280 L 385,280 L 385,310 L 355,310 Z',
  },
  {
    name: 'Louisiana',
    abbr: 'LA',
    path: 'M 320,340 L 345,340 L 345,375 L 320,375 Z',
  },
  {
    name: 'Maine',
    abbr: 'ME',
    path: 'M 460,130 L 475,130 L 475,160 L 460,160 Z',
  },
  {
    name: 'Maryland',
    abbr: 'MD',
    path: 'M 430,200 L 450,200 L 450,220 L 430,220 Z',
  },
  {
    name: 'Massachusetts',
    abbr: 'MA',
    path: 'M 450,155 L 465,155 L 465,170 L 450,170 Z',
  },
  {
    name: 'Michigan',
    abbr: 'MI',
    path: 'M 355,200 L 380,200 L 380,260 L 355,260 Z',
  },
  {
    name: 'Minnesota',
    abbr: 'MN',
    path: 'M 310,160 L 340,160 L 340,210 L 310,210 Z',
  },
  {
    name: 'Mississippi',
    abbr: 'MS',
    path: 'M 330,310 L 350,310 L 350,350 L 330,350 Z',
  },
  {
    name: 'Missouri',
    abbr: 'MO',
    path: 'M 310,270 L 345,270 L 345,310 L 310,310 Z',
  },
  {
    name: 'Montana',
    abbr: 'MT',
    path: 'M 160,120 L 210,120 L 210,170 L 160,170 Z',
  },
  {
    name: 'Nebraska',
    abbr: 'NE',
    path: 'M 250,200 L 290,200 L 290,240 L 250,240 Z',
  },
  {
    name: 'Nevada',
    abbr: 'NV',
    path: 'M 100,230 L 130,230 L 130,280 L 100,280 Z',
  },
  {
    name: 'New Hampshire',
    abbr: 'NH',
    path: 'M 455,140 L 468,140 L 468,160 L 455,160 Z',
  },
  {
    name: 'New Jersey',
    abbr: 'NJ',
    path: 'M 445,185 L 453,185 L 453,200 L 445,200 Z',
  },
  {
    name: 'New Mexico',
    abbr: 'NM',
    path: 'M 160,280 L 190,280 L 190,330 L 160,330 Z',
  },
  {
    name: 'New York',
    abbr: 'NY',
    path: 'M 440,150 L 470,150 L 470,190 L 440,190 Z',
  },
  {
    name: 'North Carolina',
    abbr: 'NC',
    path: 'M 400,310 L 425,310 L 425,340 L 400,340 Z',
  },
  {
    name: 'North Dakota',
    abbr: 'ND',
    path: 'M 260,140 L 300,140 L 300,180 L 260,180 Z',
  },
  {
    name: 'Ohio',
    abbr: 'OH',
    path: 'M 365,250 L 390,250 L 390,280 L 365,280 Z',
  },
  {
    name: 'Oklahoma',
    abbr: 'OK',
    path: 'M 270,290 L 310,290 L 310,330 L 270,330 Z',
  },
  {
    name: 'Oregon',
    abbr: 'OR',
    path: 'M 70,170 L 110,170 L 110,220 L 70,220 Z',
  },
  {
    name: 'Pennsylvania',
    abbr: 'PA',
    path: 'M 420,200 L 445,200 L 445,230 L 420,230 Z',
  },
  {
    name: 'Rhode Island',
    abbr: 'RI',
    path: 'M 453,168 L 460,168 L 460,175 L 453,175 Z',
  },
  {
    name: 'South Carolina',
    abbr: 'SC',
    path: 'M 410,340 L 428,340 L 428,365 L 410,365 Z',
  },
  {
    name: 'South Dakota',
    abbr: 'SD',
    path: 'M 280,170 L 320,170 L 320,210 L 280,210 Z',
  },
  {
    name: 'Tennessee',
    abbr: 'TN',
    path: 'M 340,300 L 395,300 L 395,320 L 340,320 Z',
  },
  {
    name: 'Texas',
    abbr: 'TX',
    path: 'M 280,330 L 340,330 L 340,400 L 280,400 Z',
  },
  {
    name: 'Utah',
    abbr: 'UT',
    path: 'M 130,220 L 160,220 L 160,260 L 130,260 Z',
  },
  {
    name: 'Vermont',
    abbr: 'VT',
    path: 'M 455,130 L 468,130 L 468,145 L 455,145 Z',
  },
  {
    name: 'Virginia',
    abbr: 'VA',
    path: 'M 415,250 L 438,250 L 438,280 L 415,280 Z',
  },
  {
    name: 'Washington',
    abbr: 'WA',
    path: 'M 70,130 L 110,130 L 110,170 L 70,170 Z',
  },
  {
    name: 'West Virginia',
    abbr: 'WV',
    path: 'M 405,260 L 425,260 L 425,290 L 405,290 Z',
  },
  {
    name: 'Wisconsin',
    abbr: 'WI',
    path: 'M 340,190 L 365,190 L 365,240 L 340,240 Z',
  },
  {
    name: 'Wyoming',
    abbr: 'WY',
    path: 'M 200,160 L 250,160 L 250,210 L 200,210 Z',
  },
];

// States that are large enough to display abbreviations
const statesWithLabels = ['CA', 'TX', 'MT', 'CO', 'FL', 'NY', 'PA', 'OH', 'MI', 'NC', 'GA', 'AZ', 'NV', 'OR', 'WA', 'ID', 'WY', 'MN', 'MO', 'TN', 'AK', 'HI'];

interface TooltipState {
  name: string | null;
  x: number;
  y: number;
}

export default function USMap({ className = '' }: { className?: string }) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ name: null, x: 0, y: 0 });

  const handleMouseEnter = (state: State, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredState(state.name);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      name: state.name,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredState(null);
    setTooltip({ name: null, x: 0, y: 0 });
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 480 470"
        className="w-full max-w-4xl h-auto"
        style={{ maxHeight: '600px' }}
      >
        {/* Background */}
        <rect width="480" height="470" fill="var(--bg-primary, #0A0A0A)" />

        {/* States */}
        {states.map((state) => (
          <path
            key={state.name}
            d={state.path}
            fill={hoveredState === state.name ? 'var(--green-accent, #39FF14)' : 'var(--border-default, #1F2937)'}
            stroke="var(--bg-primary, #0A0A0A)"
            strokeWidth="1"
            className="cursor-pointer transition-all duration-200"
            onMouseEnter={(e) => handleMouseEnter(state, e)}
            onMouseLeave={handleMouseLeave}
          />
        ))}

        {/* State Labels for larger states */}
        {states
          .filter((state) => statesWithLabels.includes(state.abbr))
          .map((state) => {
            // Calculate center point of bounding box
            const match = state.path.match(/M\s+([\d.]+),([\d.]+)/);
            if (!match) return null;

            const baseX = parseFloat(match[1]);
            const baseY = parseFloat(match[2]);

            // Extract all coordinates to find rough center
            const coords = state.path.match(/[\d.]+/g) || [];
            const numbers = coords.map((n) => parseFloat(n));
            const xs = [];
            const ys = [];

            for (let i = 0; i < numbers.length; i += 2) {
              xs.push(numbers[i]);
              if (i + 1 < numbers.length) ys.push(numbers[i + 1]);
            }

            const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
            const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;

            return (
              <text
                key={`label-${state.abbr}`}
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none text-xs font-bold"
                fill={hoveredState === state.name ? 'var(--green-dark, #0A0A0A)' : 'var(--text-tertiary, #6B7280)'}
                style={{
                  transition: 'fill 0.2s',
                  fontSize: '10px',
                }}
              >
                {state.abbr}
              </text>
            );
          })}
      </svg>

      {/* Tooltip */}
      {tooltip.name && (
        <div
          className="fixed bg-gray-900 text-neon-green px-3 py-2 rounded-md text-sm font-medium pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            color: 'var(--green-accent, #39FF14)',
            backgroundColor: 'var(--bg-card, #1F2937)',
            border: '1px solid var(--green-accent, #39FF14)',
            boxShadow: '0 0 10px var(--green-glow, rgba(57, 255, 20, 0.3))',
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
