'use client';

import React, { useState, useEffect, useRef } from 'react';

type PetType = 'dog' | 'cat' | 'duck' | 'capybara' | 'penguin';
type PetState = 'walk' | 'sit' | 'sleep' | 'wave' | 'follow';

interface PetInstance {
  id: string;
  type: PetType;
  x: number; // position in pixels (0 to 240)
  state: PetState;
  direction: 'left' | 'right';
  targetX: number;
  frame: number;
  stateTimer: number; // seconds remaining in current state
  name: string;
}

// Pixel Grids (12x12)
// . = transparent
// Colors defined per pet
const SPRITES: Record<PetType, Record<PetState, string[][]>> = {
  cat: {
    walk: [
      [
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "..C.C....C.C",
        "..C.C....C.C"
      ],
      [
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "...C.C..C.C.",
        "...C.C..C.C."
      ]
    ],
    sit: [
      [
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "..CC......CC",
        "..CC......CC"
      ]
    ],
    sleep: [
      [
        "............",
        "............",
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.Z.WW.Z.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        ".CCCCCCCCCC."
      ]
    ],
    wave: [
      [
        "...CC......C",
        "...CCC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "..CC......CC",
        "..CC......CC"
      ],
      [
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "...C.CCCCCC..",
        "..C..CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "..CC......CC",
        "..CC......CC"
      ]
    ],
    follow: [
      [
        "....C......C",
        "....CC....CC",
        "...CCCCWWCCC",
        "...C.B.WW.B.",
        "...CCCCWWCCC",
        "....CCCCCC..",
        "....CCCCCC..",
        "...CCCCCCCC.",
        "..CCCCCCCCC.",
        "..C.C....C.C",
        "..C.C....C.C"
      ]
    ]
  },
  dog: {
    walk: [
      [
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "..D.D....D.D",
        "..D.D....D.D"
      ],
      [
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "...D.D..D.D.",
        "...D.D..D.D."
      ]
    ],
    sit: [
      [
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "..DD......DD",
        "..DD......DD"
      ]
    ],
    sleep: [
      [
        "............",
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.Z.LL.Z..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        "DDDDDDDDDDDD",
        "DDDDDDDDDDDD"
      ]
    ],
    wave: [
      [
        "..DD....D...",
        "..DDD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "..DD......DD",
        "..DD......DD"
      ],
      [
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "..D.DDDDDD...",
        ".D..DDDDDDDD.",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "..DD......DD",
        "..DD......DD"
      ]
    ],
    follow: [
      [
        "...D....D...",
        "...DD..DD...",
        "..DDDDDDDD..",
        "..D.B.LL.B..",
        "..DDDDLLDD..",
        "...DDDDDD...",
        "..DDDDDDDD..",
        ".DDDDDDDDDD.",
        ".DDDDDDDDDD.",
        "..D.D....D.D",
        "..D.D....D.D"
      ]
    ]
  },
  duck: {
    walk: [
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        "....O..O....",
        "....OO.OO..."
      ],
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        ".....O..O...",
        "....OO..OO.."
      ]
    ],
    sit: [
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        "....OOOO...."
      ]
    ],
    sleep: [
      [
        "............",
        "....YYYY....",
        "...Y.Z.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY...."
      ]
    ],
    wave: [
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        "....O..O....",
        "....OO.OO..."
      ],
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "..Y.YYYYYY..",
        ".Y.YYYYYYYY.",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        "....O..O....",
        "....OO.OO..."
      ]
    ],
    follow: [
      [
        "....YYYY....",
        "...Y.B.YY...",
        "...YYYYOO...",
        "....YYYY....",
        "...YYYYYY...",
        "..YYYYYYYY..",
        "..YYYYYYYY..",
        "...YYYYYY...",
        "....YYYY....",
        "....O..O....",
        "....OO.OO..."
      ]
    ]
  },
  capybara: {
    walk: [
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        "....C....C..",
        "....C....C.."
      ],
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        ".....C....C.",
        ".....C....C."
      ]
    ],
    sit: [
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        "....CC..CC.."
      ]
    ],
    sleep: [
      [
        "............",
        ".....CCCC...",
        "....CCCCCC..",
        "...C.Z.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "CCCCCCCCCCCC"
      ]
    ],
    wave: [
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        "....C....C.."
      ],
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "..C.CCCCCCCC",
        ".C.CCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        "....C....C.."
      ]
    ],
    follow: [
      [
        ".....CCCC...",
        "....CCCCCC..",
        "...C.B.CCCC.",
        "...CCCCCCCCC",
        "....CCCCCCC.",
        "...CCCCCCCCC",
        "..CCCCCCCCCC",
        "..CCCCCCCCCC",
        "...CCCCCCCC.",
        "....C....C.."
      ]
    ]
  },
  penguin: {
    walk: [
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        "....O...O...",
        "....OO..OO.."
      ],
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        ".....O...O..",
        "....OO..OO.."
      ]
    ],
    sit: [
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        "....OOOO...."
      ]
    ],
    sleep: [
      [
        "............",
        "....KKKK....",
        "...K.Z.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK..."
      ]
    ],
    wave: [
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        "....O...O...",
        "....OO..OO.."
      ],
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "..K.KKKWWKK.",
        ".K.KKKKWWKKK",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        "....O...O..."
      ]
    ],
    follow: [
      [
        "....KKKK....",
        "...K.B.WKK..",
        "...KKKWWW...",
        "....KKWWW...",
        "...KKKWWKK..",
        "..KKKKWWKKK.",
        "..KKKKWWKKK.",
        "...KKKWWKK..",
        "....KKKKK...",
        "....O...O...",
        "....OO..OO.."
      ]
    ]
  }
};

const COLOR_MAPS: Record<PetType, Record<string, string>> = {
  cat: {
    'C': '#f97316', // Orange body
    'W': '#ffffff', // White face patches
    'B': '#000000', // Black eyes
    'Z': '#3b82f6', // Sleeping eyes
  },
  dog: {
    'D': '#d97706', // Brown Shiba body
    'LL': '#fef3c7', // Cream belly/face
    'L': '#fef3c7', 
    'B': '#000000', // Black eyes
    'Z': '#ef4444', 
  },
  duck: {
    'Y': '#facc15', // Yellow body
    'O': '#f97316', // Orange beak/feet
    'B': '#000000', // Black eyes
    'Z': '#3b82f6',
  },
  capybara: {
    'C': '#78350f', // Brown body
    'B': '#000000', // Black eyes
    'Z': '#a855f7',
  },
  penguin: {
    'K': '#1e293b', // Dark Slate body
    'W': '#ffffff', // White belly
    'O': '#f59e0b', // Orange beak/feet
    'B': '#000000', // Black eyes
    'Z': '#10b981',
  }
};

const NAMES: Record<PetType, string[]> = {
  cat: ['Milo', 'Luna', 'Oliver', 'Leo'],
  dog: ['Shiba', 'Rocky', 'Hachi', 'Teddy'],
  duck: ['Waddles', 'Daisy', 'Quacky', 'Puddles'],
  capybara: ['Capy', 'Bara', 'Gort', 'Coconut'],
  penguin: ['Pingu', 'Pip', 'Chilly', 'Waddler']
};

function PixelSprite({ type, state, frame, direction }: { type: PetType; state: PetState; frame: number; direction: 'left' | 'right' }) {
  const animations = SPRITES[type][state];
  const activeFrame = animations[frame % animations.length] || animations[0];
  const colors = COLOR_MAPS[type];

  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 12 12" 
      className={`transition-transform duration-300 ${direction === 'left' ? 'scale-x-[-1]' : ''}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {activeFrame.map((row, y) => 
        row.split('').map((char, x) => {
          if (char === '.' || char === ' ') return null;
          const color = colors[char] || '#ccc';
          return (
            <rect 
              key={`${x}-${y}`} 
              x={x} 
              y={y} 
              width="1.05" 
              height="1.05" 
              fill={color} 
            />
          );
        })
      )}
    </svg>
  );
}

export function PixelWorld() {
  const [pets, setPets] = useState<PetInstance[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number | null }>({ x: null });

  // Initialize pets on mount
  useEffect(() => {
    const types: PetType[] = ['cat', 'dog', 'duck', 'capybara', 'penguin'];
    const initialPets: PetInstance[] = [];

    // Spawn 2 random pets
    for (let i = 0; i < 2; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const names = NAMES[type];
      initialPets.push({
        id: Math.random().toString(36).substring(2, 9),
        type,
        x: 40 + i * 100,
        state: 'sit',
        direction: Math.random() > 0.5 ? 'right' : 'left',
        targetX: 40 + i * 100,
        frame: 0,
        stateTimer: 3 + Math.floor(Math.random() * 5),
        name: names[Math.floor(Math.random() * names.length)]
      });
    }
    setPets(initialPets);
  }, []);

  // Track Mouse Movement for "follow" behavior
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        // Keep inside boundary
        if (relativeX >= 0 && relativeX <= rect.width) {
          mouseRef.current.x = relativeX;
        } else {
          mouseRef.current.x = null;
        }
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Update Game Tick (updates frame animations and state clocks)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setPets((prevPets) =>
        prevPets.map((pet) => {
          let { x, state, direction, targetX, frame, stateTimer } = pet;
          const containerWidth = containerRef.current?.clientWidth || 240;

          // Increment animation frame if walking or waving
          if (state === 'walk' || state === 'wave') {
            frame = (frame + 1) % 2;
          } else {
            frame = 0;
          }

          // Decrement state timer
          stateTimer -= 0.2;

          // State Logic
          if (stateTimer <= 0) {
            // Pick a new state randomly
            const states: PetState[] = ['walk', 'sit', 'sleep', 'wave', 'follow'];
            state = states[Math.floor(Math.random() * states.length)];
            stateTimer = 4 + Math.floor(Math.random() * 8); // 4-12 seconds

            if (state === 'walk') {
              targetX = Math.floor(Math.random() * (containerWidth - 40)) + 10;
            }
          }

          // Cursor Follow Overrides
          if (state === 'follow') {
            if (mouseRef.current.x !== null) {
              // Set target to mouse
              targetX = mouseRef.current.x;
            } else {
              // Fallback to sit if mouse left header
              state = 'sit';
              stateTimer = 3;
            }
          }

          // Move Pet towards targetX
          if (state === 'walk' || state === 'follow') {
            const diff = targetX - x;
            if (Math.abs(diff) > 2) {
              const step = state === 'follow' ? 3 : 1.5; // Walk faster when following cursor
              x += diff > 0 ? step : -step;
              direction = diff > 0 ? 'right' : 'left';
            } else if (state === 'walk') {
              // Arrived!
              state = 'sit';
              stateTimer = 2 + Math.floor(Math.random() * 4);
            }
          }

          // Prevent boundaries overflow
          if (x < 5) x = 5;
          if (x > containerWidth - 40) x = containerWidth - 40;

          return {
            ...pet,
            x,
            state,
            direction,
            targetX,
            frame,
            stateTimer
          };
        })
      );
    }, 200);

    return () => clearInterval(tickInterval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="hidden sm:flex h-12 w-60 relative overflow-hidden bg-navy-950/20 dark:bg-navy-950/40 rounded-xl border border-border/40 select-none group"
      title="Pixel World: Hover to see your study pets!"
    >
      {/* Grass Ground Level */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/20 border-t border-emerald-500/10" />

      {/* Renders Pets */}
      {pets.map((pet) => (
        <div
          key={pet.id}
          className="absolute bottom-0.5 transition-all duration-200 ease-out flex flex-col items-center group/pet"
          style={{ 
            left: `${pet.x}px`,
          }}
        >
          {/* Bubble dialog indicating state */}
          <div className="absolute bottom-9 bg-popover text-[8px] text-popover-foreground px-1.5 py-0.5 rounded border border-border/80 shadow-md opacity-0 scale-75 group-hover/pet:opacity-100 group-hover/pet:scale-100 transition-all pointer-events-none whitespace-nowrap font-semibold">
            {pet.name} ({pet.state})
          </div>
          
          <PixelSprite 
            type={pet.type} 
            state={pet.state} 
            frame={pet.frame} 
            direction={pet.direction} 
          />
        </div>
      ))}
    </div>
  );
}
