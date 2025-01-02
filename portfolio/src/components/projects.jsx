import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Github } from 'lucide-react';

import readwise from '../assets/projects/bookrecom.png';
import kk from '../assets/projects/kk.png';
import aes from '../assets/projects/autoes.png';
import gitfnd from '../assets/projects/gitfind.png'
import nirvanaai from '../assets/projects/nirvanaai.png'
import coldconnect from '../assets/projects/coldconnect.png'


const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const projectData = [
    {
      title: "Read Wise",
      description: "A Book Recommendation Platform",
      image: readwise,
      longDescription: "",
      technologies: ["Python", "Streamlit", "Pandas", "Plotly"],
      website: "https://readwiser.streamlit.app/",
      github: "https://github.com/Indra55/book_recommendation_system_streamlitt",
    },
    {
      title: "Katha Kritique",
      description: "A Book Review Website",
      image: kk,
      longDescription: [
        "Leverages Google's Generative AI to generate initial book reviews based on user-provided titles and word counts.",
        "Empowers users to refine and personalize the AI-generated drafts, adding their own insights and perspectives.",
        "Provides a platform for users to publish their reviews and engage in discussions about literature.",
        "Built using the MERN stack (MongoDB, Express.js, React.js, Node.js) for a robust and scalable architecture.",
      ],
      technologies: ["React", "Express.js", "Node.js", "MongoDB", "Google Generative AI"],
      website: "https://katha-kritique.vercel.app",
      github: "https://github.com/Indra55/Katha-Kritique/",
    },
    {
      title: "AutoEstimatr",
      description: "A web app to predict used car prices.",
      image: aes,
      longDescription: [
        "Uses a pre-trained Linear Regression model to estimate used car prices.",
        "Collects user input for car company, model, year, fuel type, and kilometers driven.",
        "Processes the input data and generates a price prediction.",
        "Built with Python and the Flask web framework.",
      ],
      technologies: ["Python", "Flask", "Pandas", "Pickle", "NumPy", "HTML", "CSS"],
      website: "https://autoestimatr.onrender.com/",
      github: "https://github.com/Indra55/AutoEstimatr/",
    },
    {
      title: "GitFind",
      description: "GitHub profile search tool",
      image: gitfnd,
      longDescription: ["A web app to search and explore GitHub profiles, repositories, followers, and more, with an easy-to-use interface."],
      technologies: ["HTML", "CSS", "JavaScript"],
      website: "https://git-find-omega.vercel.app/",
      github: "https://github.com/Indra55/Git_Find"
    },
    {
      title: "Nirvana AI",
      description: "AI-driven mental health support chatbot",
      image: nirvanaai,
      longDescription: [
        "Nirvana AI is a chatbot designed to provide empathetic and intelligent conversations to support users dealing with mental health issues. It offers real-time guidance, emotional support, and helpful resources."
      ],
      technologies: ["React.js", "Node.js", "Express", "MongoDB", "Google Generative AI"],
      website: "https://google-genai-hackathon.vercel.app/main",
      github: "https://github.com/Indra55/google-genai-hackathon"
    },
    {
      title: "Cold Connect",
      description: "AI-powered cold email generator with resume parsing and job data extraction.",
      image: coldconnect,
      longDescription: [
        "Cold Connect is a web app that simplifies cold emailing for job applications by extracting job descriptions directly from URLs and generating personalized emails. It parses PDF resumes to pull relevant details like skills and experience, aligning them with job requirements to craft tailored emails."
      ],
      technologies: ["Streamlit", "Python", "LangChain", "Spacy", "PyPDF2", "Llama 3"],
      website: "https://coldconnect.app",
      github: "https://github.com/Indra55/Cold-Email-Generator"
    }
    
    
  
  ];

  useEffect(() => {
    let interval;
    if (!isHovered && !isModalOpen) {
      interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === projectData.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isHovered, isModalOpen, projectData.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === projectData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projectData.length - 1 : prevIndex - 1
    );
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
  };

  return (
    <div className="relative">
      <div
        className="p-4 text-white w-[950px] h-[250px] relative bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-xl overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between h-full">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="flex-1 overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {projectData.map((project, index) => (
                <div
                  key={index}
                  className="min-w-full flex items-center gap-8 px-12"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-64 h-48 rounded-lg object-cover"
                  />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold">
                      {project.title}
                    </h3>
                    <p className="text-gray-300 text-lg">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full hover:bg-white/10 transition-colors z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 text-base font-medium flex items-center gap-3 group"
          >
            View More
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 w-full h-full flex items-center justify-center z-[9999]"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            height: '100%'
          }}
        >
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setIsModalOpen(false)}
            style={{ position: 'absolute', inset: 0 }}
          />
          <div 
            className="relative w-[95%] max-w-7xl max-h-[95vh] bg-[rgba(255, 255, 255, 0.1)] backdrop-blur-md rounded-xl p-8 overflow-y-auto"
            style={{ margin: 'auto' }}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-white hover:bg-white/10"
            >
              <X className="w-8 h-8" />
            </button>

            {selectedProject ? (
              <div className="text-white max-w-5xl mx-auto">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="mb-6 text-lg text-white/70 hover:text-white transition-colors"
                >
                  ← Back to All Projects
                </button>
                <div className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-xl p-8">
                  <img
                    src={selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-96 rounded-lg object-cover mb-8"
                  />
                  <h2 className="text-3xl font-bold mb-6">{selectedProject.title}</h2>
                  <p className="text-white/80 text-lg mb-8">{selectedProject.longDescription}</p>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Technologies Used</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedProject.technologies.map((tech, index) => (
                        <span key={index} className="px-4 py-2 bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-full text-base">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    {selectedProject.website && (
                      <a
                        href={selectedProject.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors text-lg"
                      >
                        <ExternalLink className="w-6 h-6" />
                        Visit Website
                      </a>
                    )}
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-6 py-3 bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-lg hover:bg-white/20 transition-colors text-lg"
                      >
                        <Github className="w-6 h-6" />
                        View Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-8">My Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projectData.map((project, index) => (
                    <div
                      key={index}
                      className="bg-[rgba(255,255,255,0.1)] backdrop-blur-md rounded-xl p-6 cursor-pointer hover:bg-white/20 transition-colors"
                      onClick={() => openProjectDetails(project)}
                    >
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-64 rounded-lg object-cover mb-6"
                      />
                      <h3 className="text-xl font-semibold text-white mb-3">{project.title}</h3>
                      <p className="text-white/70 text-lg">{project.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;