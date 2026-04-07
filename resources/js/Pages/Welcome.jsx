import Pricing from '@/Components/Price/Pricing';
import React from 'react';


const Welcome = () => {
  return (
    <>
      <section className="relative overflow-hidden h-[60vh]">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/bg.jpg"
            alt="Banner background"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
        </div>

        {/* Content container */}
        <div className="relative container mx-auto h-full flex justify-center items-center px-4">
          <div className="max-w-2xl text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Driving Lesson Welcome</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Affordable packages for every learning stage
            </p>
          </div>
        </div>
      </section>
      
      <Pricing />
    </>
  );
};

export default Welcome;


// import React, {useState} from 'react'
// import {Calendar} from '@/Components/ui/calendar'

// const Welcome = () => {
//     const [selectedDate, setSelectedDate] = useState(new Date())

//     console.log(selectedDate)
//   return (
//     <div>
//       <Calendar selected={selectedDate} onSelect={setSelectedDate} mode="single" />
//     </div>
//   )
// }

// export default Welcome
