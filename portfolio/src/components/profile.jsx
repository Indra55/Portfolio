import React from 'react';
import profilePic from '../assets/profilepic.jpg';
import { Typewriter } from 'react-simple-typewriter';
import './profile.css'; // Import the CSS file for styles

const Profile = () => {
  return (
    <div className="p-4  rounded-box-radii w-[611px] h-[302px] relative scale-[85%] bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-xl ">
      <img 
        src={profilePic} 
        alt="Profile" 
        className="absolute top-4 left-4 h-profilepicH w-profilepicW rounded-profile-radii object-cover" 
      />
      <div id='atw' className="absolute  ml-32 flex items-center bg-boxbox-color text-white rounded-box-radii p-2 w-atwW h-atwH">
        <div className="pointer mr-2"></div>
        <div className="text-content">
          Available To Work
        </div>
      </div>

      <div id='profilename' className='mt-7 mr-20 text-center'>Hitanshu Gala</div>

      <div id='bd' className='mb-20 ml-32 text-2xl'>
        Being{' '}
        <span className='text-highlight'>
          <Typewriter
            words={['Developer', 'Problem-Solver', 'Coder', 'Tech Enthusiast']}
            loop={0} 
            cursor
            cursorStyle="_"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </span>
      </div>

      <div className="tag-container  mt-8 p-4 ">
        <div className="tag-item">📍 Mumbai</div>
        <div className="tag-item">💻 B.Tech in IT</div>
        <div className="tag-item">🎓 DJ Sanghvi</div>
        <div className="tag-item">🐈 Cat Person</div>
        <div className="tag-item">🎸 Guitarist</div>
        <div className="tag-item">✍️ Book-Worm</div>
        
      </div>
    </div>
  );
};

export default Profile;