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

import UserWrapper from '@/Wrapper/UserWrapper'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { usePage } from '@inertiajs/react'
import axios from 'axios'
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

const Profile = () => {
  const { user } = usePage().props
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
  }, [user, reset])

  const name = watch('name')
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const onSubmit = async (data) => {
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
    {
      title: 'Lesson locations',
      description: 'Used to plan pickup and drop-off for your lessons',
      fields: [
        {
          name: 'area',
          label: 'Area',
          icon: MapPin,
          type: 'text',
          placeholder: 'Enter your area',
          validation: { required: 'Area is required' },
        },
        {
          name: 'pickup_address',
          label: 'Pickup Address',
          icon: Navigation,
          type: 'text',
          placeholder: 'Enter pickup address',
          validation: { required: 'Pickup address is required' },
        },
        {
          name: 'dropoff_address',
          label: 'Dropoff Address',
          icon: Flag,
          type: 'text',
          placeholder: 'Enter dropoff address',
          validation: { required: 'Dropoff address is required' },
        },
      ],
    },
  ]

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

// import UserWrapper from '@/Wrapper/UserWrapper'
// import React, { useState } from 'react'
// import { useForm } from 'react-hook-form'
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
//   ShieldCheck,
// } from 'lucide-react'

// const Profile = () => {
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
//       name: '',
//       email: '',
//       phone_number: '',
//       area: '',
//       pickup_address: '',
//       dropoff_address: '',
//     },
//   })

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

//   const handleCancel = () => {
//     reset()
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
//                 <button
//                   type='button'
//                   onClick={() => setIsEditing(true)}
//                   className='hidden sm:inline-flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 px-4 py-2 text-sm font-medium text-white transition'
//                 >
//                   <Pencil className='h-4 w-4' />
//                   Edit Profile
//                 </button>
//               )}
//             </div>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className='px-6 sm:px-8'>
//             {/* Avatar, overlapping header/body */}
//             <div className='-mt-12 sm:-mt-14 flex items-end justify-between'>
//               {!isEditing && (
//                 <button
//                   type='button'
//                   onClick={() => setIsEditing(true)}
//                   className='sm:hidden inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#007dcc]'
//                 >
//                   <Pencil className='h-4 w-4' />
//                   Edit
//                 </button>
//               )}
//             </div>

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
