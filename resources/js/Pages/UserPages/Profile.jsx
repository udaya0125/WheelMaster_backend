// import UserWrapper from '@/Wrapper/UserWrapper'
// import React from 'react'

// const Profile = () => {
//   return (
//     <>
//      <UserWrapper>
//         <div className='flex justify-center font-bold text-4xl items-center h-screen'>
//           <h2>Profile Page</h2>
//         </div>
//       </UserWrapper> 
//     </>
//   )
// }

// export default Profile


// import UserWrapper from '@/Wrapper/UserWrapper'
// import React, { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import axios from 'axios'
// import { User, Mail, Phone, MapPin, Navigation, Flag, Loader2, Pencil } from 'lucide-react'

// const Profile = () => {
//   const [isEditing, setIsEditing] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: '',
//       email: '',
//       phone_number: '',
//       area: '',
//       pickup_address: '',
//       dropoff_address: '',
//     },
//   })

//   const onSubmit = async (data) => {
//     setLoading(true)
//     try {
//       const response = await axios.post(route('profile.update'), {
//         ...data,
//         _method: 'PUT',
//       })

//       console.log(response.data.data)
//       setIsEditing(false)
//     } catch (error) {
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fields = [
//     {
//       name: 'name',
//       label: 'Full Name',
//       icon: User,
//       type: 'text',
//       placeholder: 'Enter your full name',
//       validation: { required: 'Name is required' },
//     },
//     {
//       name: 'email',
//       label: 'Email Address',
//       icon: Mail,
//       type: 'email',
//       placeholder: 'Enter your email',
//       validation: {
//         required: 'Email is required',
//         pattern: {
//           value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//           message: 'Enter a valid email address',
//         },
//       },
//     },
//     {
//       name: 'phone_number',
//       label: 'Phone Number',
//       icon: Phone,
//       type: 'text',
//       placeholder: 'Enter your phone number',
//       validation: {
//         required: 'Phone number is required',
//         pattern: {
//           value: /^[0-9+\-\s]{7,15}$/,
//           message: 'Enter a valid phone number',
//         },
//       },
//     },
//     {
//       name: 'area',
//       label: 'Area',
//       icon: MapPin,
//       type: 'text',
//       placeholder: 'Enter your area',
//       validation: { required: 'Area is required' },
//     },
//     {
//       name: 'pickup_address',
//       label: 'Pickup Address',
//       icon: Navigation,
//       type: 'text',
//       placeholder: 'Enter pickup address',
//       validation: { required: 'Pickup address is required' },
//     },
//     {
//       name: 'dropoff_address',
//       label: 'Dropoff Address',
//       icon: Flag,
//       type: 'text',
//       placeholder: 'Enter dropoff address',
//       validation: { required: 'Dropoff address is required' },
//     },
//   ]

//   return (
//     <>
//       <UserWrapper>
//         <div className='flex justify-center items-center'>
//           <div className='w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

//             {/* Header */}
//             <div className='bg-[#007dcc] px-8 py-8 flex items-center gap-4'>
//               <div className='h-16 w-16 rounded-full bg-white/20 flex items-center justify-center'>
//                 <User className='h-8 w-8 text-white' />
//               </div>
//               <div>
//                 <h2 className='text-2xl font-bold text-white'>Profile Page</h2>
//                 <p className='text-indigo-100 text-sm'>Manage your personal information</p>
//               </div>
//             </div>

//             {/* Body */}
//             <form onSubmit={handleSubmit(onSubmit)} className='px-8 py-8'>
//               <div className='flex justify-end mb-4'>
//                 <button
//                   type='button'
//                   onClick={() => setIsEditing((prev) => !prev)}
//                   className='inline-flex items-center gap-2 text-sm font-medium text-[#007dcc] transition'
//                 >
//                   <Pencil className='h-4 w-4' />
//                   {isEditing ? 'Cancel' : 'Edit Profile'}
//                 </button>
//               </div>

//               <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
//                 {fields.map(({ name, label, icon: Icon, type, placeholder, validation }) => (
//                   <div key={name} className='flex flex-col gap-1.5'>
//                     <label htmlFor={name} className='text-sm font-medium text-gray-700'>
//                       {label}
//                     </label>
//                     <div className='relative'>
//                       <Icon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
//                       <input
//                         id={name}
//                         type={type}
//                         disabled={!isEditing}
//                         placeholder={placeholder}
//                         {...register(name, validation)}
//                         className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none transition
//                           ${isEditing
//                             ? 'border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//                             : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'}
//                           ${errors[name] ? 'border-red-400 focus:ring-red-400' : ''}
//                         `}
//                       />
//                     </div>
//                     {errors[name] && (
//                       <span className='text-xs text-red-500'>{errors[name].message}</span>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {isEditing && (
//                 <div className='flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100'>
//                   <button
//                     type='button'
//                     onClick={() => setIsEditing(false)}
//                     className='px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition'
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type='submit'
//                     disabled={loading}
//                     className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#007dcc] hover:bg-[#005a87] disabled:opacity-60 transition'
//                   >
//                     {loading && <Loader2 className='h-4 w-4 animate-spin' />}
//                     Save Changes
//                   </button>
//                 </div>
//               )}
//             </form>
//           </div>
//         </div>
//       </UserWrapper>
//     </>
//   )
// }

// export default Profile

// import UserWrapper from '@/Wrapper/UserWrapper'
// import React, { useState, useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { usePage } from '@inertiajs/react'
// import axios from 'axios'
// import {
//   User,
//   Mail,
//   Phone,
//   MapPin,
//   Navigation,
//   Flag,
//   Loader2,
//   Pencil,
//   X,
//   Check,
// } from 'lucide-react'

// const Profile = () => {
//   const { user } = usePage().props
//   const [isEditing, setIsEditing] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: user?.name ?? '',
//       email: user?.email ?? '',
//       phone_number: user?.phone_number ?? '',
//       area: user?.profile?.area ?? '',
//       pickup_address: user?.profile?.pickup_address ?? '',
//       dropoff_address: user?.profile?.dropoff_address ?? '',
//     },
//   })

//   useEffect(() => {
//     reset({
//       name: user?.name ?? '',
//       email: user?.email ?? '',
//       phone_number: user?.phone_number ?? '',
//       area: user?.profile?.area ?? '',
//       pickup_address: user?.profile?.pickup_address ?? '',
//       dropoff_address: user?.profile?.dropoff_address ?? '',
//     })
//   }, [user, reset])

//   const name = watch('name')
//   const initials = name
//     ? name
//         .trim()
//         .split(/\s+/)
//         .map((part) => part[0])
//         .slice(0, 2)
//         .join('')
//         .toUpperCase()
//     : ''

//   const onSubmit = async (data) => {
//     setLoading(true)
//     try {
//       await axios.post(route('profile.update'), {
//         ...data,
//         _method: 'PATCH',
//       })

//       setIsEditing(false)
//     } catch (error) {
//       console.error(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleCancel = () => {
//     reset({
//       name: user?.name ?? '',
//       email: user?.email ?? '',
//       phone_number: user?.phone_number ?? '',
//       area: user?.profile?.area ?? '',
//       pickup_address: user?.profile?.pickup_address ?? '',
//       dropoff_address: user?.profile?.dropoff_address ?? '',
//     })
//     setIsEditing(false)
//   }

//   const sections = [
//     {
//       title: 'Personal details',
//       description: 'Your name and how we reach you',
//       fields: [
//         {
//           name: 'name',
//           label: 'Full Name',
//           icon: User,
//           type: 'text',
//           placeholder: 'Enter your full name',
//           validation: { required: 'Name is required' },
//         },
//         {
//           name: 'email',
//           label: 'Email Address',
//           icon: Mail,
//           type: 'email',
//           placeholder: 'Enter your email',
//           validation: {
//             required: 'Email is required',
//             pattern: {
//               value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//               message: 'Enter a valid email address',
//             },
//           },
//         },
//         {
//           name: 'phone_number',
//           label: 'Phone Number',
//           icon: Phone,
//           type: 'text',
//           placeholder: 'Enter your phone number',
//           validation: {
//             required: 'Phone number is required',
//             pattern: {
//               value: /^[0-9+\-\s]{7,15}$/,
//               message: 'Enter a valid phone number',
//             },
//           },
//         },
//       ],
//     },
//     {
//       title: 'Lesson locations',
//       description: 'Used to plan pickup and drop-off for your lessons',
//       fields: [
//         {
//           name: 'area',
//           label: 'Area',
//           icon: MapPin,
//           type: 'text',
//           placeholder: 'Enter your area',
//           validation: { required: 'Area is required' },
//         },
//         {
//           name: 'pickup_address',
//           label: 'Pickup Address',
//           icon: Navigation,
//           type: 'text',
//           placeholder: 'Enter pickup address',
//           validation: { required: 'Pickup address is required' },
//         },
//         {
//           name: 'dropoff_address',
//           label: 'Dropoff Address',
//           icon: Flag,
//           type: 'text',
//           placeholder: 'Enter dropoff address',
//           validation: { required: 'Dropoff address is required' },
//         },
//       ],
//     },
//   ]

//   return (
//     <UserWrapper>
//       <div className='flex justify-center items-start'>
//         <div className='w-full  bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

//           {/* Header */}
//           <div className='relative bg-[#007dcc] px-8 pt-8 pb-6 sm:pb-10'>
//             <div className='relative flex items-center justify-between'>
//               <div>
//                 <h2 className='text-2xl font-bold text-white'>My Profile</h2>
//                 <p className='text-white/70 text-sm mt-1'>
//                   Manage the details we use for your bookings
//                 </p>
//               </div>

//               {!isEditing && (
//                  <button
//                   type='button'
//                   onClick={() => setIsEditing(true)}
//                   className='inline-flex items-center gap-2 rounded-lg  shadow-sm border border-gray-200 px-3 py-2 text-sm font-medium text-white'
//                 >
//                   <Pencil className='h-4 w-4' />
//                   Edit
//                 </button>
//               )}
//             </div>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className='px-6 sm:px-8'>
//             {/* Sections */}
//             <div className='mt-16  pb-8 space-y-8'>
//               {sections.map((section) => (
//                 <div key={section.title}>
//                   <div className='mb-4'>
//                     <h3 className='text-sm font-semibold text-gray-900'>{section.title}</h3>
//                     <p className='text-xs text-gray-500 mt-0.5'>{section.description}</p>
//                   </div>

//                   <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
//                     {section.fields.map(({ name, label, icon: Icon, type, placeholder, validation }) => (
//                       <div key={name} className='flex flex-col gap-1.5'>
//                         <label htmlFor={name} className='text-sm font-medium text-gray-700'>
//                           {label}
//                         </label>
//                         <div className='relative'>
//                           <Icon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
//                           <input
//                             id={name}
//                             type={type}
//                             disabled={!isEditing}
//                             placeholder={placeholder}
//                             {...register(name, validation)}
//                             className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none transition
//                               ${isEditing
//                                 ? 'border-gray-300 bg-white focus:ring-2 focus:ring-[#007dcc]/40 focus:border-[#007dcc]'
//                                 : 'border-transparent bg-gray-50 text-gray-700 cursor-default'}
//                               ${errors[name] ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}
//                             `}
//                           />
//                         </div>
//                         {errors[name] && (
//                           <span className='text-xs text-red-500'>{errors[name].message}</span>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Actions */}
//             {isEditing && (
//               <div className='flex justify-end gap-3 pb-8 pt-6 border-t border-gray-100'>
//                 <button
//                   type='button'
//                   onClick={handleCancel}
//                   className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition'
//                 >
//                   <X className='h-4 w-4' />
//                   Cancel
//                 </button>
//                 <button
//                   type='submit'
//                   disabled={loading}
//                   className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#007dcc] hover:bg-[#005a87] disabled:opacity-60 transition'
//                 >
//                   {loading ? (
//                     <Loader2 className='h-4 w-4 animate-spin' />
//                   ) : (
//                     <Check className='h-4 w-4' />
//                   )}
//                   Save Changes
//                 </button>
//               </div>
//             )}
//           </form>
//         </div>
//       </div>
//     </UserWrapper>
//   )
// }

// export default Profile

import UserWrapper from '@/Wrapper/UserWrapper'
import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { usePage, router } from '@inertiajs/react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Navigation,
  Flag,
  Loader2,
  Pencil,
  X,
  Check,
} from 'lucide-react'
import Loader from './Loader'

const MEETPOINT_AREA = 'meetpoint-mandurah-dot'
const MEETPOINT_LOCATION_LABEL = 'Ranceby Avenue, Mandurah, Western Australia 6210'

const SERVICE_AREAS = [
  ['mandurah', 'Mandurah'],
  ['meadow-springs', 'Meadow Springs'],
  ['silver-sands', 'Silver Sands'],
  ['lakelands', 'Lakelands'],
  ['dudley-park', 'Dudley Park'],
  ['halls-head', 'Halls Head'],
  ['madora-bay', 'Madora Bay'],
  ['greenfields', 'Greenfields'],
  ['erskine', 'Erskine'],
  ['singleton', 'Singleton'],
  ['parklands', 'Parklands'],
  ['stake-hill', 'Stake Hill'],
  ['san-remo', 'San Remo'],
  [MEETPOINT_AREA, 'Meetpoint Mandurah Dot'],
]

const MEETPOINT_LOCATION = {
  label: MEETPOINT_LOCATION_LABEL,
  name: 'Mandurah',
  housenumber: null,
  postcode: '6210',
  city: 'Mandurah',
  district: null,
  state: 'Western Australia',
  source: 'fixed',
}

const normaliseAddressText = (text = '') => {
  const ordinals = {
    '1st': 'first',
    '2nd': 'second',
    '3rd': 'third',
    '4th': 'fourth',
    '5th': 'fifth',
    '6th': 'sixth',
    '7th': 'seventh',
    '8th': 'eighth',
    '9th': 'ninth',
    '10th': 'tenth',
    '11th': 'eleventh',
    '12th': 'twelfth',
    '13th': 'thirteenth',
    '14th': 'fourteenth',
    '15th': 'fifteenth',
    '16th': 'sixteenth',
    '17th': 'seventeenth',
    '18th': 'eighteenth',
    '19th': 'nineteenth',
    '20th': 'twentieth',
  }

  return text
    .toLowerCase()
    .replace(/\b([0-9]{1,2}(?:st|nd|rd|th))\b/g, (match) => ordinals[match] || match)
    .replace(/\bav\b|\bave\b/g, 'avenue')
    .replace(/\brd\b/g, 'road')
    .replace(/\bst\b/g, 'street')
    .replace(/\bdr\b/g, 'drive')
    .replace(/\bct\b/g, 'court')
    .replace(/\bpde\b/g, 'parade')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const locationMatchesTypedAddress = (location, typedAddress) => {
  if (!location || !typedAddress?.trim()) return false

  const typed = normaliseAddressText(typedAddress)
  const anchors = [
    location.label,
    location.street,
    location.name,
    location.city,
    location.district,
    location.postcode,
  ]
    .filter(Boolean)
    .map(normaliseAddressText)

  return anchors.some((anchor) => anchor && (typed.includes(anchor) || anchor.includes(typed)))
}

const makeSavedLocation = (label) => (label ? { label, source: 'saved' } : null)

const LocationAutocomplete = ({
  id,
  name,
  label,
  value,
  error,
  selectedLocation,
  placeholder,
  onInputChange,
  onLocationSelect,
  action,
  disabled,
  locked,
  icon: Icon,
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const blurTimeout = useRef(null)

  useEffect(() => {
    if (disabled || locked) {
      setSuggestions([])
      setSearchError('')
      setLoading(false)
      return undefined
    }

    const query = value.trim()
    if (query.length < 3 || locationMatchesTypedAddress(selectedLocation, query)) {
      setSuggestions([])
      setSearchError('')
      setLoading(false)
      return undefined
    }

    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        setLoading(true)
        setSearchError('')
        const response = await axios.get(route('locations.search'), {
          params: { q: query },
          signal: controller.signal,
        })
        setSuggestions(response.data.suggestions || [])
        setIsOpen(true)
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') {
          setSuggestions([])
          setSearchError('Address search is unavailable. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [value, selectedLocation, disabled, locked])

  useEffect(
    () => () => {
      if (blurTimeout.current) clearTimeout(blurTimeout.current)
    },
    [],
  )

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setIsOpen(false), 150)
  }

  const shouldShowSuggestions =
    !disabled &&
    !locked &&
    isOpen &&
    value.trim().length >= 3 &&
    !locationMatchesTypedAddress(selectedLocation, value)

  return (
    <div className='flex flex-col gap-1.5'>
      <div className='flex items-center justify-between gap-3'>
        <label htmlFor={id} className='text-sm font-medium text-gray-700'>
          {label}
        </label>
        {!disabled && !locked && action}
      </div>
      <div className='relative'>
        {Icon && <Icon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />}
        <input
          id={id}
          name={name}
          type='text'
          value={value}
          disabled={disabled}
          readOnly={locked}
          placeholder={placeholder}
          autoComplete='off'
          onChange={(e) => !disabled && !locked && onInputChange(name, e.target.value)}
          onFocus={() => !disabled && !locked && setIsOpen(true)}
          onBlur={handleBlur}
          className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none transition
            ${disabled || locked
              ? 'border-transparent bg-gray-50 text-gray-700 cursor-default'
              : 'border-gray-300 bg-white focus:ring-2 focus:ring-[#007dcc]/40 focus:border-[#007dcc]'}
            ${error ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}
          `}
        />
        {shouldShowSuggestions && (
          <div className='absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg'>
            {loading && <div className='px-4 py-3 text-sm text-gray-500'>Searching service area...</div>}
            {!loading &&
              suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.source}-${suggestion.label}`}
                  type='button'
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onLocationSelect(name, suggestion)
                    setIsOpen(false)
                  }}
                  className='block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none'
                >
                  <span className='block font-medium'>{suggestion.label}</span>
                  {suggestion.postcode && (
                    <span className='block text-xs text-gray-500'>Postcode {suggestion.postcode}</span>
                  )}
                </button>
              ))}
            {!loading && suggestions.length === 0 && !searchError && (
              <div className='px-4 py-3 text-sm text-gray-500'>No service-area address found.</div>
            )}
            {!loading && searchError && <div className='px-4 py-3 text-sm text-red-600'>{searchError}</div>}
          </div>
        )}
      </div>
      {error ? (
        <span className='text-xs text-red-500'>{error.message}</span>
      ) : !disabled && !locked ? (
        <span className='text-xs text-gray-500'>Choose a service-area suggestion</span>
      ) : locked ? (
        <span className='text-xs text-gray-400'>Set by meetpoint selection.</span>
      ) : null}
    </div>
  )
}

const Profile = () => {
  const { user } = usePage().props
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState({
    pickup_address: makeSavedLocation(user?.profile?.pickup_address ?? ''),
    dropoff_address: makeSavedLocation(user?.profile?.dropoff_address ?? ''),
  })

  useEffect(() => {
    const removeStart = router.on('start', () => setPageLoading(true))
    const removeFinish = router.on('finish', () => setPageLoading(false))

    return () => {
      removeStart()
      removeFinish()
    }
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone_number: user?.phone_number ?? '',
      area: user?.profile?.area ?? '',
      pickup_address: user?.profile?.pickup_address ?? '',
      dropoff_address: user?.profile?.dropoff_address ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone_number: user?.phone_number ?? '',
      area: user?.profile?.area ?? '',
      pickup_address: user?.profile?.pickup_address ?? '',
      dropoff_address: user?.profile?.dropoff_address ?? '',
    })
    setSelectedLocations({
      pickup_address:
        user?.profile?.area === MEETPOINT_AREA
          ? MEETPOINT_LOCATION
          : makeSavedLocation(user?.profile?.pickup_address ?? ''),
      dropoff_address:
        user?.profile?.area === MEETPOINT_AREA
          ? MEETPOINT_LOCATION
          : makeSavedLocation(user?.profile?.dropoff_address ?? ''),
    })
  }, [user, reset])

  const name = watch('name')
  const area = watch('area')
  const pickupAddress = watch('pickup_address') || ''
  const dropoffAddress = watch('dropoff_address') || ''
  const isMeetpoint = area === MEETPOINT_AREA
  const hasCustomArea = area && !SERVICE_AREAS.some(([value]) => value === area)
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const handleAreaChange = (value) => {
    if (value === MEETPOINT_AREA) {
      setValue('area', value, { shouldDirty: true, shouldValidate: true })
      setValue('pickup_address', MEETPOINT_LOCATION_LABEL, { shouldDirty: true, shouldValidate: true })
      setValue('dropoff_address', MEETPOINT_LOCATION_LABEL, { shouldDirty: true, shouldValidate: true })
      setSelectedLocations({
        pickup_address: MEETPOINT_LOCATION,
        dropoff_address: MEETPOINT_LOCATION,
      })
    } else {
      const pickupWasMeetpoint =
        pickupAddress === MEETPOINT_LOCATION_LABEL || selectedLocations.pickup_address?.source === 'fixed'
      const dropoffWasMeetpoint =
        dropoffAddress === MEETPOINT_LOCATION_LABEL || selectedLocations.dropoff_address?.source === 'fixed'

      setValue('area', value, { shouldDirty: true, shouldValidate: true })
      if (pickupWasMeetpoint) setValue('pickup_address', '', { shouldDirty: true, shouldValidate: true })
      if (dropoffWasMeetpoint) setValue('dropoff_address', '', { shouldDirty: true, shouldValidate: true })
      setSelectedLocations((prev) => ({
        pickup_address: pickupWasMeetpoint ? null : prev.pickup_address,
        dropoff_address: dropoffWasMeetpoint ? null : prev.dropoff_address,
      }))
    }

    clearErrors(['area', 'pickup_address', 'dropoff_address'])
  }

  const handleLocationInputChange = (field, value) => {
    setValue(field, value, { shouldDirty: true, shouldValidate: true })
    setSelectedLocations((prev) => ({
      ...prev,
      [field]: locationMatchesTypedAddress(prev[field], value) ? prev[field] : null,
    }))
    clearErrors(field)
  }

  const handleLocationSelect = (field, location) => {
    setValue(field, location.label, { shouldDirty: true, shouldValidate: true })
    setSelectedLocations((prev) => ({ ...prev, [field]: location }))
    clearErrors(field)
  }

  const setDropoffSameAsPickup = () => {
    if (pickupAddress && locationMatchesTypedAddress(selectedLocations.pickup_address, pickupAddress)) {
      setValue('dropoff_address', pickupAddress, { shouldDirty: true, shouldValidate: true })
      setSelectedLocations((prev) => ({
        ...prev,
        dropoff_address: prev.pickup_address,
      }))
      clearErrors('dropoff_address')
    } else {
      toast.error('Please select a pickup address from the suggestions first')
    }
  }

  const validateSelectedLocations = (data) => {
    const locationFields = [
      ['pickup_address', 'pickup address'],
      ['dropoff_address', 'dropoff address'],
    ]

    const invalidFields = locationFields.filter(([field]) => {
      if (!data[field]?.trim()) return true

      return (
        !selectedLocations[field] ||
        !locationMatchesTypedAddress(selectedLocations[field], data[field])
      )
    })

    invalidFields.forEach(([field, label]) => {
      setError(field, {
        type: 'manual',
        message: data[field]?.trim()
          ? `Please choose a service-area suggestion for the ${label}.`
          : `Please enter a ${label}.`,
      })
    })

    return invalidFields.length === 0
  }

  const onSubmit = async (data) => {
    if (!validateSelectedLocations(data)) return

    setLoading(true)
    try {
      await axios.post(route('profile.update'), {
        ...data,
        _method: 'PATCH',
      })

      setIsEditing(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone_number: user?.phone_number ?? '',
      area: user?.profile?.area ?? '',
      pickup_address: user?.profile?.pickup_address ?? '',
      dropoff_address: user?.profile?.dropoff_address ?? '',
    })
    setSelectedLocations({
      pickup_address:
        user?.profile?.area === MEETPOINT_AREA
          ? MEETPOINT_LOCATION
          : makeSavedLocation(user?.profile?.pickup_address ?? ''),
      dropoff_address:
        user?.profile?.area === MEETPOINT_AREA
          ? MEETPOINT_LOCATION
          : makeSavedLocation(user?.profile?.dropoff_address ?? ''),
    })
    clearErrors()
    setIsEditing(false)
  }

  const sections = [
    {
      title: 'Personal details',
      description: 'Your name and how we reach you',
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          icon: User,
          type: 'text',
          placeholder: 'Enter your full name',
          validation: { required: 'Name is required' },
        },
        {
          name: 'email',
          label: 'Email Address',
          icon: Mail,
          type: 'email',
          placeholder: 'Enter your email',
          validation: {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          },
        },
        {
          name: 'phone_number',
          label: 'Phone Number',
          icon: Phone,
          type: 'text',
          placeholder: 'Enter your phone number',
          validation: {
            required: 'Phone number is required',
            pattern: {
              value: /^[0-9+\-\s]{7,15}$/,
              message: 'Enter a valid phone number',
            },
          },
        },
      ],
    },
  ]

  if (pageLoading) {
    return (
      <UserWrapper>
        <Loader />
      </UserWrapper>
    )
  }

  return (
    <UserWrapper>
      <div className='flex justify-center items-start'>
        <div className='w-full  bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>

          {/* Header */}
          <div className='relative bg-[#007dcc] px-8 pt-8 pb-6 sm:pb-10'>
            <div className='relative flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-white'>My Profile</h2>
                <p className='text-white/70 text-sm mt-1'>
                  Manage the details we use for your bookings
                </p>
              </div>

              {!isEditing && (
                 <button
                  type='button'
                  onClick={() => setIsEditing(true)}
                  className='inline-flex items-center gap-2 rounded-lg  shadow-sm border border-gray-200 px-3 py-2 text-sm font-medium text-white'
                >
                  <Pencil className='h-4 w-4' />
                  Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='px-6 sm:px-8'>
            {/* Sections */}
            <div className='mt-16  pb-8 space-y-8'>
              {sections.map((section) => (
                <div key={section.title}>
                  <div className='mb-4'>
                    <h3 className='text-sm font-semibold text-gray-900'>{section.title}</h3>
                    <p className='text-xs text-gray-500 mt-0.5'>{section.description}</p>
                  </div>

                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                    {section.fields.map(({ name, label, icon: Icon, type, placeholder, validation }) => (
                      <div key={name} className='flex flex-col gap-1.5'>
                        <label htmlFor={name} className='text-sm font-medium text-gray-700'>
                          {label}
                        </label>
                        <div className='relative'>
                          <Icon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            id={name}
                            type={type}
                            disabled={!isEditing}
                            placeholder={placeholder}
                            {...register(name, validation)}
                            className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none transition
                              ${isEditing
                                ? 'border-gray-300 bg-white focus:ring-2 focus:ring-[#007dcc]/40 focus:border-[#007dcc]'
                                : 'border-transparent bg-gray-50 text-gray-700 cursor-default'}
                              ${errors[name] ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}
                            `}
                          />
                        </div>
                        {errors[name] && (
                          <span className='text-xs text-red-500'>{errors[name].message}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <div className='mb-4'>
                  <h3 className='text-sm font-semibold text-gray-900'>Lesson locations</h3>
                  <p className='text-xs text-gray-500 mt-0.5'>Used to plan pickup and drop-off for your lessons</p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <div className='flex flex-col gap-1.5'>
                    <label htmlFor='area' className='text-sm font-medium text-gray-700'>
                      Area
                    </label>
                    <div className='relative'>
                      <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                      <select
                        id='area'
                        disabled={!isEditing}
                        {...register('area', {
                          required: 'Area is required',
                          onChange: (e) => handleAreaChange(e.target.value),
                        })}
                        className={`w-full appearance-none pl-10 pr-3 py-2.5 rounded-lg border text-sm outline-none transition
                          ${isEditing
                            ? 'border-gray-300 bg-white focus:ring-2 focus:ring-[#007dcc]/40 focus:border-[#007dcc]'
                            : 'border-transparent bg-gray-50 text-gray-700 cursor-default'}
                          ${errors.area ? 'border-red-400 focus:ring-red-400/40 focus:border-red-400' : ''}
                        `}
                      >
                        <option value=''>Select your Area</option>
                        {hasCustomArea && <option value={area}>{area}</option>}
                        {SERVICE_AREAS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.area && <span className='text-xs text-red-500'>{errors.area.message}</span>}
                  </div>

                  <LocationAutocomplete
                    id='pickup_address'
                    name='pickup_address'
                    label='Pickup Address'
                    value={pickupAddress}
                    selectedLocation={selectedLocations.pickup_address}
                    error={errors.pickup_address}
                    placeholder='Start typing pickup address'
                    onInputChange={handleLocationInputChange}
                    onLocationSelect={handleLocationSelect}
                    disabled={!isEditing}
                    locked={isMeetpoint}
                    icon={Navigation}
                  />

                  <LocationAutocomplete
                    id='dropoff_address'
                    name='dropoff_address'
                    label='Dropoff Address'
                    value={dropoffAddress}
                    selectedLocation={selectedLocations.dropoff_address}
                    error={errors.dropoff_address}
                    placeholder='Start typing dropoff address'
                    onInputChange={handleLocationInputChange}
                    onLocationSelect={handleLocationSelect}
                    disabled={!isEditing}
                    locked={isMeetpoint}
                    icon={Flag}
                    action={
                      <button
                        type='button'
                        onClick={setDropoffSameAsPickup}
                        className='text-xs font-medium text-[#007dcc] hover:text-[#005a87] transition whitespace-nowrap'
                      >
                        Same as Pickup Address
                      </button>
                    }
                  />
                </div>

                {isEditing && (
                  <p className='mt-3 text-xs text-gray-500'>
                    Currently serving only these areas with postcode 6210, 6180, or 6175. If your address is not available,
                    select "Meetpoint Mandurah Dot" where you will meet the instructor.
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {isEditing && (
              <div className='flex justify-end gap-3 pb-8 pt-6 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition'
                >
                  <X className='h-4 w-4' />
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#007dcc] hover:bg-[#005a87] disabled:opacity-60 transition'
                >
                  {loading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Check className='h-4 w-4' />
                  )}
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </UserWrapper>
  )
}

export default Profile
