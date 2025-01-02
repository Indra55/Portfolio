import React from 'react';
import resumeFile from '../assets/resume.pdf';
import './resume.css';

const Resume = () => {
  const handleDownload = () => {
    const userConfirmed = window.confirm("Do you want to download the resume?");
    if (userConfirmed) {
      const link = document.createElement('a');
      link.href = resumeFile;
      link.download = 'resume.pdf';
      link.click();
    }
  };

  return (
    <div
      className="p-4   bg-[rgba(255, 255, 255, 0.1)] backdrop-blur p-4 rounded-box-radii w-250 h-302 relative scale-[85%] cursor-pointer"
      onClick={handleDownload}
    >
      <div id='resumetext' className="flex flex-col items-center justify-center">
        <div className="leading-tight font-bold">RE</div>
        <div className="leading-tight   font-bold">SU</div>
        <div className="leading-tight  font-bold">ME</div>
      </div>
    </div>
  );
};

export default Resume;
