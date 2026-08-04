// import React, { useEffect, useRef } from 'react'
// import gsap from 'gsap'

// const Loader = () => {
//   const containerRef = useRef(null)
//   const wheelRef = useRef(null)
//   const wheelGroupRef = useRef(null)
//   const shadowRef = useRef(null)

//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       const distance = 220 // px the wheel travels
//       const radius = 28 // wheel radius in px
//       const circumference = 2 * Math.PI * radius
//       const rotations = distance / circumference // keeps roll physically accurate

//       const tl = gsap.timeline({ repeat: -1 })

//       tl.fromTo(
//         wheelGroupRef.current,
//         { x: -distance / 2 },
//         { x: distance / 2, duration: 1.6, ease: 'none' },
//         0
//       )
//       tl.fromTo(
//         wheelRef.current,
//         { rotate: 0 },
//         { rotate: rotations * 360, duration: 1.6, ease: 'none' },
//         0
//       )
//       tl.fromTo(
//         shadowRef.current,
//         { x: -distance / 2 },
//         { x: distance / 2, duration: 1.6, ease: 'none' },
//         0
//       )

//       // instant snap back for a seamless loop
//       tl.set(wheelGroupRef.current, { x: -distance / 2 })
//       tl.set(wheelRef.current, { rotate: 0 })
//       tl.set(shadowRef.current, { x: -distance / 2 })
//     }, containerRef)

//     return () => ctx.revert()
//   }, [])

//   return (
//     <div
//       ref={containerRef}
//       className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
//     >
//       <div className="relative w-72 h-40 flex flex-col items-center justify-end">
//         {/* Rolling wheel */}
//         <div ref={wheelGroupRef} className="relative mb-1">
//           <svg ref={wheelRef} width="56" height="56" viewBox="0 0 100 100">
//             {/* Tyre */}
//             <circle cx="50" cy="50" r="46" fill="#111827" />
//             <circle cx="50" cy="50" r="46" fill="none" stroke="#1f2937" strokeWidth="3" />
//             {/* Tread marks */}
//             {Array.from({ length: 16 }).map((_, i) => {
//               const angle = (i * 360) / 16
//               return (
//                 <rect
//                   key={i}
//                   x="48.5"
//                   y="4"
//                   width="3"
//                   height="8"
//                   rx="1"
//                   fill="#000"
//                   transform={`rotate(${angle} 50 50)`}
//                 />
//               )
//             })}
//             {/* Rim */}
//             <circle cx="50" cy="50" r="28" fill="#9ca3af" />
//             <circle cx="50" cy="50" r="28" fill="none" stroke="#6b7280" strokeWidth="1.5" />
//             {/* Spokes */}
//             {Array.from({ length: 5 }).map((_, i) => {
//               const angle = (i * 360) / 5
//               return (
//                 <rect
//                   key={i}
//                   x="47.5"
//                   y="24"
//                   width="5"
//                   height="26"
//                   rx="2"
//                   fill="#4b5563"
//                   transform={`rotate(${angle} 50 50)`}
//                 />
//               )
//             })}
//             {/* Hub */}
//             <circle cx="50" cy="50" r="8" fill="#374151" />
//             <circle cx="50" cy="50" r="8" fill="none" stroke="#9ca3af" strokeWidth="1" />
//           </svg>
//         </div>

//         {/* Ground shadow */}
//         <div ref={shadowRef} className="w-10 h-2 rounded-full bg-black/50 blur-[2px] mb-3" />

//         {/* Road */}
//         <div className="w-full h-[3px] bg-slate-700 relative overflow-hidden rounded-full">
//           <div
//             className="absolute inset-0"
//             style={{
//               backgroundImage:
//                 'repeating-linear-gradient(90deg, #facc15 0px, #facc15 14px, transparent 14px, transparent 28px)',
//             }}
//           />
//         </div>
//       </div>

//       <p className="mt-6 text-sm tracking-[0.25em] text-slate-400 uppercase">
//         Loading
//       </p>
//     </div>
//   )
// }

// export default Loader




import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

const SPOKE_COUNT = 12
const CYCLE_DURATION = 1.1 // seconds for one full chase around the spokes

const Loader = () => {
  const spokesRef = useRef([])

  useEffect(() => {
    const spokes = spokesRef.current
    const stepTime = CYCLE_DURATION / SPOKE_COUNT

    // set initial state via GSAP so nothing fights the animation
    gsap.set(spokes, { opacity: 1, scale: 1 })

    const tween = gsap.to(spokes, {
      opacity: 0.15,
      scale: 0.82,
      duration: stepTime * 3,
      ease: 'sine.inOut',
      stagger: {
        each: stepTime,
        repeat: -1,
        yoyo: true, // no restart pop — each spoke dims then brightens forever
      },
    })

    return () => {
      tween.kill()
      gsap.killTweensOf(spokes)
    }
  }, [])

  return (
    <div className="flex items-center justify-center py-24">
      <div className="relative w-14 h-14">
        {Array.from({ length: SPOKE_COUNT }).map((_, i) => {
          const rotation = (360 / SPOKE_COUNT) * i
          return (
            <div
              key={i}
              ref={(el) => (spokesRef.current[i] = el)}
              className="absolute left-1/2 top-1/2 w-[7%] h-[28%] bg-slate-700 rounded-full"
              style={{
                transform: `translateX(-50%) rotate(${rotation}deg) translateY(-140%)`,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default Loader