import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import InputError from "@/Components/InputError";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <div className=" bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

            <Head title="Register" />

            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <img
                            src="/images/logo2.png"
                            alt="Icon"
                            className="w-full h-12 object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        WheelMaster
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Driving Institute Portal
                    </p>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8 backdrop-blur-lg border border-gray-100 ">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Create an Account
                    </h2>

                    <form onSubmit={submit}>
                        <div className="space-y-5">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                                        required
                                        autoComplete="name"
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        id="password_confirmation"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-70 transition-all duration-200 flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Creating account...
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Already registered link */}
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Already have an account?{" "}
                        <Link
                            href={route("login")}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Sign in here
                        </Link>
                    </p>
                </div>

                {/* Footer Text */}
                {/* <p className="text-center text-xs text-gray-500 mt-6">
                    Protected by enterprise-grade security
                </p> */}
            </div>
        </div>
    );
}


// import InputError from '@/Components/InputError';
// import InputLabel from '@/Components/InputLabel';
// import PrimaryButton from '@/Components/PrimaryButton';
// import TextInput from '@/Components/TextInput';
// import GuestLayout from '@/Layouts/GuestLayout';
// import { Head, Link, useForm } from '@inertiajs/react';

// export default function Register() {
//     const { data, setData, post, processing, errors, reset } = useForm({
//         name: '',
//         email: '',
//         password: '',
//         password_confirmation: '',
//     });

//     const submit = (e) => {
//         e.preventDefault();

//         post(route('register'), {
//             onFinish: () => reset('password', 'password_confirmation'),
//         });
//     };

//     return (
//         <GuestLayout>
//             <Head title="Register" />

//             <form onSubmit={submit}>
//                 <div>
//                     <InputLabel htmlFor="name" value="Name" />

//                     <TextInput
//                         id="name"
//                         name="name"
//                         value={data.name}
//                         className="mt-1 block w-full"
//                         autoComplete="name"
//                         isFocused={true}
//                         onChange={(e) => setData('name', e.target.value)}
//                         required
//                     />

//                     <InputError message={errors.name} className="mt-2" />
//                 </div>

//                 <div className="mt-4">
//                     <InputLabel htmlFor="email" value="Email" />

//                     <TextInput
//                         id="email"
//                         type="email"
//                         name="email"
//                         value={data.email}
//                         className="mt-1 block w-full"
//                         autoComplete="username"
//                         onChange={(e) => setData('email', e.target.value)}
//                         required
//                     />

//                     <InputError message={errors.email} className="mt-2" />
//                 </div>

//                 <div className="mt-4">
//                     <InputLabel htmlFor="password" value="Password" />

//                     <TextInput
//                         id="password"
//                         type="password"
//                         name="password"
//                         value={data.password}
//                         className="mt-1 block w-full"
//                         autoComplete="new-password"
//                         onChange={(e) => setData('password', e.target.value)}
//                         required
//                     />

//                     <InputError message={errors.password} className="mt-2" />
//                 </div>

//                 <div className="mt-4">
//                     <InputLabel
//                         htmlFor="password_confirmation"
//                         value="Confirm Password"
//                     />

//                     <TextInput
//                         id="password_confirmation"
//                         type="password"
//                         name="password_confirmation"
//                         value={data.password_confirmation}
//                         className="mt-1 block w-full"
//                         autoComplete="new-password"
//                         onChange={(e) =>
//                             setData('password_confirmation', e.target.value)
//                         }
//                         required
//                     />

//                     <InputError
//                         message={errors.password_confirmation}
//                         className="mt-2"
//                     />
//                 </div>

//                 <div className="mt-4 flex items-center justify-end">
//                     <Link
//                         href={route('login')}
//                         className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//                     >
//                         Already registered?
//                     </Link>

//                     <PrimaryButton className="ms-4" disabled={processing}>
//                         Register
//                     </PrimaryButton>
//                 </div>
//             </form>
//         </GuestLayout>
//     );
// }
