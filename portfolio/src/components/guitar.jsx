import React, { useRef } from 'react';
import strum from '../assets/strum.mp3';
import cursor from '../assets/guitar-cursor.png'

const GRID_SIZE = 50;
const PIXEL_SIZE = 10;

const MinimalisticPixelGuitar = () => {
  const audioRef = useRef(null);

  const handleHover = () => {
    playAudio();
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('Audio playback failed:', error);
      });
    }
  };

  const guitarPixels = [
    { x: 20, y: 30, width: 10, height: 15 },
    { x: 22, y: 28, width: 6, height: 2 },
    { x: 22, y: 45, width: 6, height: 2 },
    { x: 24, y: 10, width: 2, height: 20 },
    { x: 23, y: 5, width: 4, height: 5 },
    { x: 23, y: 35, width: 4, height: 4, color: '#f8c3b8' },
  ];

  return (
    <div
      id="guitar-container"
      className="bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-xl"
      onMouseEnter={handleHover}
    >
        <div className='rotate-45 scale-[85%]'>
          
      <div className="pixel-grid">
      <audio ref={audioRef} src={strum} />

        {guitarPixels.map((pixel, index) => (
          <div
            key={index}
            className="pixel"
            style={{
              gridColumn: `${pixel.x} / span ${pixel.width}`,
              gridRow: `${pixel.y} / span ${pixel.height}`,
              backgroundColor: pixel.color || '#FF69B4',
            }}
          />
        ))}
        </div>
      </div>
      <style jsx>{`
        #guitar-container {
          max-width: 325px;
          max-height: 430px;
          display: flex;
          justify-content: center;
          align-items: center;
          transform: scale(0.6);
          transform-origin: top left;
          overflow: hidden;
          cursor: url(${cursor}), auto;
        }
        .pixel-grid {
          display: grid;
          grid-template-columns: repeat(${GRID_SIZE}, ${PIXEL_SIZE}px);
          grid-template-rows: repeat(${GRID_SIZE}, ${PIXEL_SIZE}px);
          width: ${GRID_SIZE * PIXEL_SIZE}px;
          height: ${GRID_SIZE * PIXEL_SIZE}px;
        }
        .pixel {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default MinimalisticPixelGuitar;