import React from 'react';

const Carrot = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.3,3.3C13.8,1.8,11.3,1.8,9.8,3.3l-1.9,1.9c-0.1,0.1-0.2,0.2-0.2,0.3L6.2,8.9c-0.6,1.4-0.1,3.1,1.1,4.3l6.5,6.5c1.2,1.2,2.9,1.7,4.3,1.1l3.4-1.5c0.1-0.1,0.2-0.2,0.3-0.2l1.9-1.9c1.5-1.5,1.5-4,0-5.5L15.3,3.3z" />
    <path d="M10,5l3,3" />
    <path d="M12,9l3,3" />
    <path d="M14,13l3,3" />
    <path d="M10,2C9,1,7,1,6,2L5,3" />
    <path d="M12,4c1-1,1-3,0-4l-1-1" />
    <path d="M8,4c-1-1-3-1-4,0L3,5" />
  </svg>
);

const Broccoli = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12,14c1.1,0,2,0.9,2,2v4c0,1.1-0.9,2-2,2s-2-0.9-2-2v-4C10,14.9,10.9,14,12,14z" />
    <path d="M8,12c-2.2,0-4-1.8-4-4s1.8-4,4-4s4,1.8,4,4c0,0.4-0.1,0.8-0.2,1.2c1.2-0.7,2.7-1.2,4.2-1.2c3.3,0,6,2.7,6,6s-2.7,6-6,6c-1,0-1.9-0.2-2.7-0.7c-0.6,1.4-2,2.3-3.6,2.3c-2.2,0-4-1.8-4-4c0-0.3,0-0.6,0.1-0.9C5.3,11.5,4.6,11.2,4,11.2" />
    <circle cx="7" cy="7" r="1.5" />
    <circle cx="15" cy="11" r="1.5" />
    <circle cx="10" cy="15" r="1.5" />
  </svg>
);

const Tomato = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8" />
    <path d="M12,5V2" />
    <path d="M10,4l2,1l2-1" />
    <path d="M9,3l3,2l3-2" />
    <path d="M12,9c-1.7,0-3,1.3-3,3" />
  </svg>
);

const Leafy = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12,22c0,0-8-4-8-12s4-8,8-8s8,4,8,8S12,22,12,22z" />
    <path d="M12,2v20" />
    <path d="M12,6c3,1,5,4,5,6" />
    <path d="M12,10c3,1,5,4,5,6" />
    <path d="M12,6c-3,1-5,4-5,6" />
    <path d="M12,10c-3,1-5,4-5,6" />
  </svg>
);

const FloatingVeggies = () => {
  const veggies = [
    { component: Carrot, top: '10%', left: '5%', delay: '0s', size: '150px', rotate: '15deg', color: 'text-orange-500' },
    { component: Broccoli, top: '25%', left: '85%', delay: '1s', size: '180px', rotate: '-10deg', color: 'text-green-500' },
    { component: Tomato, top: '55%', left: '12%', delay: '2s', size: '130px', rotate: '20deg', color: 'text-red-500' },
    { component: Leafy, top: '75%', left: '88%', delay: '1.5s', size: '140px', rotate: '-15deg', color: 'text-emerald-500' },
    { component: Carrot, top: '85%', left: '18%', delay: '3s', size: '160px', rotate: '45deg', color: 'text-orange-400' },
    { component: Broccoli, top: '15%', left: '45%', delay: '2.5s', size: '150px', rotate: '0deg', color: 'text-green-400' },
    { component: Tomato, top: '40%', left: '78%', delay: '0.5s', size: '145px', rotate: '-30deg', color: 'text-red-400' },
    { component: Leafy, top: '65%', left: '38%', delay: '4s', size: '135px', rotate: '10deg', color: 'text-emerald-400' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[100]">
      {veggies.map((Veg, index) => (
        <div
          key={index}
          className={`bg-veggie animate-floating ${Veg.color}`}
          style={{
            top: Veg.top,
            left: Veg.left,
            animationDelay: Veg.delay,
            width: Veg.size,
            height: Veg.size,
            transform: `rotate(${Veg.rotate})`,
            opacity: 0.15, /* High visibility but low enough to not distract */
          }}
        >
          <Veg.component />
        </div>
      ))}
    </div>
  );
};

export default FloatingVeggies;
