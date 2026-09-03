// import Pricing from '@/Components/Price/Pricing';
// import React from 'react';


// const Welcome = () => {
//   return (
//     <>
//       <section className="relative overflow-hidden h-[60vh]">
//         {/* Background Image */}
//         <div className="absolute inset-0 w-full h-full">
//           <img
//             src="/images/bg.jpg"
//             alt="Banner background"
//             className="w-full h-full object-cover object-center"
//             loading="eager"
//           />
          
//           {/* Gradient overlay */}
//           <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-transparent" />
//         </div>

//         {/* Content container */}
//         <div className="relative container mx-auto h-full flex justify-center items-center px-4">
//           <div className="max-w-2xl text-white text-center">
//             <h1 className="text-4xl md:text-5xl font-bold mb-4">Wheel Master Driving Academy</h1>
//             <p className="text-xl md:text-2xl opacity-90">
//               Affordable packages for every learning stage
//             </p>
//           </div>
//         </div>
//       </section>
      
//       <Pricing />
//     </>
//   );
// };

// export default Welcome;



// import Pricing from '@/Components/Price/Pricing';
// import { Link, usePage } from '@inertiajs/react';
// import { Star, Award, Users, LayoutDashboard, ArrowRight } from 'lucide-react';
// import React from 'react';

// const stats = [
//   { icon: Award, label: '15+ Years Experience' },
//   { icon: Users, label: '5,000+ Students Passed' },
//   { icon: Star, label: '4.9/5 Average Rating' },
// ];

// const getDashboardHref = (user) => {
//   if (!user) return null;

//   try {
//     return user.role === 'admin' ? route('dashboard') : route('user-dashboard');
//   } catch (e) {
//     // Route not registered in Ziggy yet — fall back to a plain path
//     // so the page never crashes even if the backend route/name is missing.
//     return user.role === 'admin' ? '/dashboard' : '/user-dashboard';
//   }
// };

// const Welcome = () => {
//   const { auth } = usePage().props;
//   const user = auth?.user;
//   const dashboardHref = getDashboardHref(user);

//   return (
//     <>
//       <section className="relative overflow-hidden min-h-[10vh] flex items-center">
//         <div className="absolute inset-0 w-full h-full">
//           <img
//             src="/images/bg.jpg"
//             alt="Banner background"
//             className="w-full h-[450px] object-cover object-center"
//             loading="eager"
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/75 to-gray-900/40" />
//         </div>

//         <div className="relative container mx-auto px-4 py-16">
//           <div className="max-w-2xl text-white text-center mx-auto">
//             <span className="inline-block bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
//               Trusted Driving Academy
//             </span>

//             <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
//               Wheel Master <span className="text-blue-400">Driving Academy</span>
//             </h1>

//             <p className="text-md md:text-xl text-gray-200 mb-8">
//               Affordable, structured lessons for every stage from your first
//               turn of the wheel to test day.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Dashboard button — sits with clear gap below the hero.
//           Centered on mobile, right-aligned on laptop/desktop. Always expanded. */}
//       {dashboardHref && (
//         <div className="relative z-20 container mx-auto px-4 mt-6 sm:mt-8">
//           <div className="flex justify-center sm:justify-end">
//             <Link
//               href={dashboardHref}
//               className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold pl-5 pr-4 sm:pl-6 sm:pr-5 py-3 sm:py-3.5 rounded-full shadow-lg shadow-blue-900/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base"
//             >
//               <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" />
//               Dashboard
//               <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
//             </Link>
//           </div>
//         </div>
//       )}

//       <div id="pricing">
//         <Pricing />
//       </div>
//     </>
//   );
// };

// export default Welcome;


import Pricing from '@/Components/Price/Pricing';
import { Link } from '@inertiajs/react';
import { Star, Award, Users, ArrowRight } from 'lucide-react';
import React from 'react';

const stats = [
  { icon: Award, label: '15+ Years Experience' },
  { icon: Users, label: '5,000+ Students Passed' },
  { icon: Star, label: '4.9/5 Average Rating' },
];

const Welcome = () => {
  return (
    <>
      <section className="relative overflow-hidden min-h-[10vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/bg.jpg"
            alt="Banner background"
            className="w-full h-[450px] object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/75 to-gray-900/40" />
        </div>

        {/* Content container */}
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-2xl text-white text-center mx-auto">
            <span className="inline-block bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
             Trusted Driving Academy
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
              Wheel Master <span className="text-blue-400">Driving Academy</span>
            </h1>

            <p className="text-md md:text-xl text-gray-200 mb-8">
              Affordable, structured lessons for every stage from your first
              turn of the wheel to test day.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View Pricing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl backdrop-blur-sm transition-all duration-300"
              >
                Call Us
              </a>
            </div> */}

            {/* Trust strip */}
            {/* <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-300">
              {stats.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-blue-400" />
                  <span>{label}</span>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </section>

      <div id="pricing">
        <Pricing />
      </div>
    </>
  );
};

export default Welcome;