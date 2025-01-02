/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
      '611': '611px',
      '222':'222px',
      '250':'250px',
      
      'profilepicW':'120px',
      'atwW':'170px',
      '30':'30px'
    },
    height: {
      '302': '303px',
     
      'profilepicH':'120px',
      'atwH':'32px'
    },
    borderRadius: {
      'box-radii': '30px'  , 
      'profile-radii':'30px'
    },
    colors:{
      'box-color':'#101010',
      'boxbox-color':'#1f1f1f'
    },
    fonts:{
      

    }
  },
  },
  plugins: [],
}

