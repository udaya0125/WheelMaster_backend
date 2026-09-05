// import InputError from '@/Components/InputError';
// import PrimaryButton from '@/Components/PrimaryButton';
// import TextInput from '@/Components/TextInput';
// import GuestLayout from '@/Layouts/GuestLayout';
// import { Head, useForm } from '@inertiajs/react';

// export default function ForgotPassword({ status }) {
//     const { data, setData, post, processing, errors } = useForm({
//         email: '',
//     });

//     const submit = (e) => {
//         e.preventDefault();

//         post(route('password.email'));
//     };

//     return (
//         <GuestLayout>
//             <Head title="Forgot Password" />

//             <div className="mb-4 text-sm text-gray-600">
//                 Forgot your password? No problem. Just let us know your email
//                 address and we will email you a password reset link that will
//                 allow you to choose a new one.
//             </div>

//             {status && (
//                 <div className="mb-4 text-sm font-medium text-green-600">
//                     {status}
//                 </div>
//             )}

//             <form onSubmit={submit}>
//                 <TextInput
//                     id="email"
//                     type="email"
//                     name="email"
//                     value={data.email}
//                     className="mt-1 block w-full"
//                     isFocused={true}
//                     onChange={(e) => setData('email', e.target.value)}
//                 />

//                 <InputError message={errors.email} className="mt-2" />

//                 <div className="mt-4 flex items-center justify-end">
//                     <PrimaryButton className="ms-4" disabled={processing}>
//                         Email Password Reset Link
//                     </PrimaryButton>
//                 </div>
//             </form>
//         </GuestLayout>
//     );
// }

import { Mail } from "lucide-react";
import InputError from "@/Components/InputError";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

            <Head title="Forgot Password" />

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

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        WheelMaster
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Driving Academy Portal
                    </p>
                </div>

                {/* Forgot Password Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-blue-100/50 p-8 backdrop-blur-lg border border-gray-100">
                    {status && (
                        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm font-medium text-green-700">
                            {status}
                        </div>
                    )}

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Forgot Password?
                    </h2>
                    <p className="text-gray-500 text-sm mb-6">
                        No problem. Enter your email address and we'll send you
                        a link to reset your password.
                    </p>

                    <form onSubmit={submit}>
                        <div className="space-y-5">
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
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all duration-200 text-gray-900"
                                        required
                                        autoComplete="username"
                                        autoFocus
                                    />
                                </div>
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-70 transition-all duration-200 flex items-center justify-center"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    "Email Password Reset Link"
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-3 text-xs text-gray-400">OR</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    {/* Back to Login Link */}
                    <p className="text-center text-sm text-gray-600">
                        Remembered your password?{" "}
                        <Link
                            href={route("login")}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                            Back to Sign In
                        </Link>
                    </p>
                </div>

                {/* Footer Text */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    Protected by enterprise-grade security
                </p>
            </div>
        </div>
    );
}
