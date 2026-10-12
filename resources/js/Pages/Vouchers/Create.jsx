import { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import axios from 'axios';
import Select, { components } from 'react-select';
import { Car, CheckCircle2, AlertCircle } from 'lucide-react';

const PackageOption = (props) => {
    const { data, isSelected } = props;
    return (
        <components.Option {...props}>
            <div className="flex items-center justify-between gap-3">
                <span className={`text-sm truncate ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                    {data.description}
                </span>
                <span className="text-sm font-medium text-gray-900 shrink-0">${data.price}</span>
            </div>
        </components.Option>
    );
};

const PackageSingleValue = (props) => {
    const { data } = props;
    return (
        <components.SingleValue {...props}>
            <div className="flex items-center justify-between gap-3 pr-2">
                <span className="text-sm text-gray-900 truncate">{data.description}</span>
                <span className="text-sm font-medium text-gray-900 shrink-0">${data.price}</span>
            </div>
        </components.SingleValue>
    );
};

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '38px',
        borderRadius: '6px',
        borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(17,24,39,0.1)' : 'none',
        '&:hover': { borderColor: '#9CA3AF' },
        cursor: 'pointer',
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 12px' }),
    placeholder: (base) => ({ ...base, color: '#9CA3AF', fontSize: '0.875rem' }),
    menu: (base) => ({
        ...base,
        borderRadius: '6px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 4px 16px -4px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        zIndex: 20,
    }),
    option: (base, state) => ({
        ...base,
        padding: '10px 12px',
        backgroundColor: state.isSelected ? '#F9FAFB' : state.isFocused ? '#F9FAFB' : '#FFFFFF',
        cursor: 'pointer',
        ':active': { backgroundColor: '#F3F4F6' },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({ ...base, color: '#9CA3AF' }),
};

export default function Create({ flash, packageOptions = [] }) {
    const { data, setData, errors, setError, clearErrors } = useForm({
        buyer_name: '',
        buyer_email: '',
        price_id: '',
        recipient_email: '',
        message: '',
    });

    const [processing, setProcessing] = useState(false);
    const [generalError, setGeneralError] = useState(null);

    const selectedPackage = packageOptions.find((p) => p.id === Number(data.price_id));

    const canSubmit = data.buyer_name.trim() && data.buyer_email.trim() && data.price_id;

    const submit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setGeneralError(null);
        clearErrors();

        try {
            const res = await axios.post(route('vouchers.checkout'), data);
            window.location.href = res.data.checkout_url;
        } catch (err) {
            setProcessing(false);

            if (err.response?.status === 422 && err.response.data.errors) {
                Object.entries(err.response.data.errors).forEach(([field, messages]) => {
                    setError(field, Array.isArray(messages) ? messages[0] : messages);
                });
                return;
            }

            setGeneralError(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <Head title="Gift a Voucher" />

            <div className="min-h-screen bg-white py-14 px-4">
                <div className="max-w-md mx-auto">

                    <div className="flex items-center gap-2 mb-1.5">
                        <Car className="w-4.5 h-4.5 text-gray-400" />
                        <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
                            Wheelmaster Driving Academy
                        </span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                        Gift a driving lesson
                    </h1>
                    <p className="text-sm text-gray-500 mb-8">
                        We'll email the voucher right after payment.
                    </p>

                    {flash?.success && (
                        <div className="mb-6 flex items-start gap-2 rounded-lg bg-green-50 border border-green-100 text-green-700 p-3 text-sm">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {generalError && (
                        <div className="mb-6 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 text-red-700 p-3 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{generalError}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    For <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.buyer_name}
                                    onChange={(e) => setData('buyer_name', e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                                />
                                {errors.buyer_name && <p className="text-red-600 text-xs mt-1">{errors.buyer_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Your email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.buyer_email}
                                    onChange={(e) => setData('buyer_email', e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                                />
                                {errors.buyer_email && <p className="text-red-600 text-xs mt-1">{errors.buyer_email}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Package <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={packageOptions}
                                value={selectedPackage || null}
                                onChange={(option) => setData('price_id', option ? String(option.id) : '')}
                                getOptionValue={(option) => String(option.id)}
                                getOptionLabel={(option) => option.description}
                                components={{ Option: PackageOption, SingleValue: PackageSingleValue }}
                                styles={selectStyles}
                                placeholder={packageOptions.length === 0 ? 'No packages available' : 'Select a package…'}
                                isDisabled={packageOptions.length === 0}
                                isSearchable={false}
                            />
                            {errors.price_id && <p className="text-red-600 text-xs mt-1">{errors.price_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Send to <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <input
                                type="email"
                                value={data.recipient_email}
                                onChange={(e) => setData('recipient_email', e.target.value)}
                                placeholder="friend@example.com"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                            />
                            {errors.recipient_email && <p className="text-red-600 text-xs mt-1">{errors.recipient_email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Message <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={data.message}
                                onChange={(e) => setData('message', e.target.value)}
                                rows={3}
                                placeholder="Happy birthday — go learn to drive!"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                            />
                            {errors.message && <p className="text-red-600 text-xs mt-1">{errors.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !canSubmit}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {processing
                                ? 'Redirecting to payment…'
                                : `Send the gift${selectedPackage ? ` — $${selectedPackage.price}` : ''}`}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}