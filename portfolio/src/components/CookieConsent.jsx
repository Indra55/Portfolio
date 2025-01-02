import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black backdrop-blur-md text-white p-4 flex justify-between items-center z-50">
      <div className="flex-1 mr-8">
        <p className="text-sm">
          This website uses cookies to enhance your chat experience. We use them to remember your conversation history and provide a better service.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-[#f8c3b8] text-black rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;