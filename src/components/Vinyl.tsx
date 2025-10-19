import React from 'react';
import { useVinylContext } from '../context/AppContext';
import { useExportContext } from '../context/AppContext';

interface VinylProps {
  className?: string;
}

const Vinyl: React.FC<VinylProps> = ({ className = '' }) => {
  const {
    labelUrl,
    rpm,
    spinDirection,
    labelSize,
    selectedRatio,
    captureRotation,
    vinylRef
  } = useVinylContext();
  
  const { isExporting } = useExportContext();

  const aspectClasses = {
    '9x16': 'aspect-[9/16]',
    '4x5': 'aspect-[4/5]',
    '1x1': 'aspect-square'
  }[selectedRatio];

  const spinDuration = 60 / rpm;
  const holeSize = selectedRatio === '9x16' ? '3.7%' : '3%';

  const style = {
    '--spin-duration': `${spinDuration}s`,
    '--spin-direction': spinDirection === 'normal' ? 'normal' : 'reverse'
  } as React.CSSProperties;

  return (
    <div className={`relative mx-auto ${className}`} ref={vinylRef}>
      <div className={`relative ${aspectClasses} bg-gradient-to-br from-zinc-950 via-zinc-900 to-black overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/5`}>
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={isExporting ? { transform: `rotate(${captureRotation}deg)` } : style}
          >
            <div className={`absolute w-[200%] aspect-square rounded-full bg-gradient-to-br from-black via-zinc-950 to-black ${!isExporting ? 'animate-vinyl-spin' : ''} shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]`}>
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-black/30" />
                <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent_0px,transparent_1.5px,rgba(50,50,50,0.3)_2px,transparent_2.5px)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,120,120,0.1)_0%,transparent_65%)]" />
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(255,255,255,0.02),rgba(150,150,150,0.04),rgba(255,255,255,0.02))]" style={{ mixBlendMode: 'overlay' }} />
              </div>
              
              {labelUrl && (
                <div 
                  className="absolute top-1/2 left-1/2 rounded-full bg-cover bg-center transform -translate-x-1/2 -translate-y-1/2 shadow-lg transition-all duration-300"
                  style={{ 
                    backgroundImage: `url(${labelUrl})`,
                    width: `${labelSize}%`,
                    aspectRatio: '1/1'
                  }}
                  role="img"
                  aria-label="Vinyl record label"
                />
              )}
              
              <div 
                className="absolute top-1/2 left-1/2 aspect-square bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner"
                style={{ width: holeSize }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vinyl;