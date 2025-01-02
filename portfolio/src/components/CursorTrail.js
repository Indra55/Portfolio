// CursorTrail.js
import React, { useEffect } from 'react';
import cat from '../assets/cat-cursor.png'; // Correct image import

const CursorTrail = () => {
  useEffect(() => {
    const catImage = document.createElement('img');
    catImage.src = cat; // Set the src to the imported image
    catImage.className = 'cursor-trail-cat';
    catImage.style.position = 'absolute';
    catImage.style.pointerEvents = 'none'; // Ensures the cat image doesn't block other elements
    catImage.style.zIndex = '9999';
    document.body.appendChild(catImage);

    const handleMouseMove = (e) => {
      catImage.style.left = `${e.clientX - catImage.width / 2}px`; // Center the cat image on the cursor
      catImage.style.top = `${e.clientY - catImage.height / 2}px`; // Center the cat image on the cursor
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      catImage.remove(); // Clean up the cat image when the component unmounts
    };
  }, []);

  return null;
};

export default CursorTrail;
