'use client'

import React, { useEffect, useState } from 'react'

const skills = [
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/html5.svg', name: 'HTML5' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/css3.svg', name: 'CSS3' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/javascript.svg', name: 'JavaScript' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/react.svg', name: 'React' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/git.svg', name: 'Git' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/github.svg', name: 'GitHub' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/node-dot-js.svg', name: 'Node.js' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mysql.svg', name: 'SQL' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/visualstudio.svg', name: 'VS Code' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/c.svg', name: 'C' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/cplusplus.svg', name: 'C++' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/python.svg', name: 'Python' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/java.svg', name: 'Java' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/express.svg', name: 'Express' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/flask.svg', name: 'Flask' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/flutter.svg', name: 'Flutter' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/numpy.svg', name: 'Numpy' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/pandas.svg', name: 'Pandas' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tailwindcss.svg', name: 'Tailwind' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/streamlit.svg', name: 'Streamlit' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/kubernetes.svg', name: 'Kubernetes' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/autocad.svg', name: 'AutoCad' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/figma.svg', name: 'Figma' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/canva.svg', name: 'Canva' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/jupyter.svg', name: 'Jupyter NB' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/firebase.svg', name: 'Firebase' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/docker.svg', name: 'Docker' },
  { icon: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlecloud.svg', name: 'GCP' },
]

export default function TechnicalSkills() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % skills.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const getSkillAtIndex = (index) => skills[(index + skills.length) % skills.length]

  return (
    <div className="bg-[rgba(255, 255, 255, 0.1)] backdrop-blur p-4 rounded-lg relative w-[300px] mx-auto scale-[108%]">
      <div className="relative h-48 overflow-hidden mb-4">
        <div className="absolute inset-0 flex items-center justify-center">
          {[-1, 0, 1].map((offset) => {
            const skill = getSkillAtIndex(currentIndex + offset)
            return (
              <div
                key={skill.name}
                className="absolute transition-all duration-500 ease-in-out flex flex-col items-center"
                style={{
                  transform: `translateX(${offset * 100}%) rotateY(${offset * -45}deg)`,
                  opacity: offset === 0 ? 1 : 0.5,
                  zIndex: 10 - Math.abs(offset),
                }}
              >
                <div className="w-20 h-20 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-zinc-600 transition-colors flex items-center justify-center mb-1">
                  <img src={skill.icon} alt={skill.name} className="h-14 w-14 object-contain" />
                </div>
                <span className="text-white text-2xs">{skill.name}</span>
              </div>
            )
          })}
        </div>
      </div>
      {/* Centered "Technical Skills" Text */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-20">
        <h2 className="text-3xl font-bold text-[#f8c3b8] font-[Silkscreen] px-3 py-1 ">
          Skills
        </h2>
      </div>
    </div>
  )
}
