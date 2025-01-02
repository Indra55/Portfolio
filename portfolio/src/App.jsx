import { useState } from 'react';
import './App.css';
import Profile from './components/profile';
import Resume from './components/resume';
import Skills from './components/techskills';
import Guitar from './components/guitar';
import CursorTrail from './components/CursorTrail'; 
import SocialMedia from './components/SocialMedia'
import Projects from './components/projects';
import Chatbot from './components/chatbot';
import CookieConsent from './components/CookieConsent';
 
function App() {
  const [count, setCount] = useState(0);

  return (
    <div id="app" className="relative overflow-hidden">
      <CursorTrail /> {/* Add this here */}
      <div className="absolute" style={{ top: '13px', left: '19px' }}>
        <Projects />
      </div>
      <div className='scale-[128%] mr-[1800px] mt-[90px]'>

     
     
      <div className="absolute" style={{ top: '193px', left: '201px' }}>
        <Profile />
      </div>

      <div className="absolute" style={{ top: '193px', left: '0px' }}>
        <Resume />
      </div>
       
      <div className="relative" style={{ top: '490px', left: '35px' }}>
        <Skills />
      </div>

      <div className="absolute" style={{ top: '480px', left: '355px' }}>
        <Guitar />
      </div>
      
      <div className="relative" style={{ top: '230px', left: '555px',scale:'93%' }}>
        <SocialMedia />
      </div>

      </div>
      <div className="relative" style={{ top: '-620px', left: '945px',scale:'93%' }}>
        <Chatbot /> 
      </div>
      <CookieConsent />

    </div>
  );
}

export default App;
