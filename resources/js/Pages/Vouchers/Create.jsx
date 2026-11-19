import { useState } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import axios from 'axios';
import Select, { components } from 'react-select';
import { AlertCircle, ArrowLeft, ArrowRight, Car, CheckCircle2, Gift, LoaderCircle, Mail, Sparkles } from 'lucide-react';

const formatPrice = (price) => new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
}).format(Number(price));

const PackageOption = (props) => (
    <components.Option {...props}>
        <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 text-sm leading-relaxed">{props.data.description}</span>
            <span className="shrink-0 text-sm font-semibold">{formatPrice(props.data.price)}</span>
        </div>
    </components.Option>
);

const PackageSingleValue = (props) => (
    <components.SingleValue {...props}>
        <div className="flex items-center justify-between gap-3 pr-1">
            <span className="truncate text-sm text-slate-900">{props.data.description}</span>
            <span className="shrink-0 text-sm font-semibold text-slate-900">{formatPrice(props.data.price)}</span>
        </div>
    </components.SingleValue>
);

const selectStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: '48px',
        borderRadius: '12px',
        borderColor: state.isFocused ? '#2563EB' : '#CBD5E1',
        boxShadow: state.isFocused ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
        '&:hover': { borderColor: '#2563EB' },
        cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    }),
    valueContainer: (base) => ({ ...base, padding: '4px 12px' }),
    placeholder: (base) => ({ ...base, color: '#64748B', fontSize: '0.875rem' }),
    menu: (base) => ({
        ...base,
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 12px 28px -8px rgba(15,23,42,0.16)',
        overflow: 'hidden',
        zIndex: 20,
    }),
    option: (base, state) => ({
        ...base,
        padding: '12px',
        color: state.isSelected ? '#1D4ED8' : '#334155',
        backgroundColor: state.isSelected ? '#DBEAFE' : state.isFocused ? '#EFF6FF' : '#FFFFFF',
        cursor: 'pointer',
        ':active': { backgroundColor: '#DBEAFE' },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({ ...base, color: '#64748B' }),
};

const inputClassName = 'w-full rounded-xl border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-blue-600 disabled:bg-slate-50 disabled:text-slate-500';
const labelClassName = 'mb-2 block text-sm font-semibold text-slate-700';

const FieldError = ({ field, errors }) => errors[field] ? (
    <p id={`${field}-error`} className="mt-2 text-sm text-red-600" role="alert">
        {errors[field]}
    </p>
) : null;

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

    const selectedPackage = packageOptions.find((p) => String(p.id) === data.price_id);
    const canSubmit = data.buyer_name.trim() && data.buyer_email.trim() && selectedPackage;
    const deliveryEmail = data.recipient_email.trim() || data.buyer_email.trim();

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
            <Head title="Gift a Driving Lesson" />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="border-b border-slate-200 bg-white">
                    <nav aria-label="Gift card navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" aria-label="Wheelmaster Driving Academy home">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <Car className="h-6 w-6" aria-hidden="true" />
                            </span>
                            <span>
                                <span className="block text-sm font-extrabold tracking-wide sm:text-base">WHEELMASTER</span>
                                <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-500 sm:text-xs">Driving Academy</span>
                            </span>
                        </Link>
                        <Link href="/#pricing" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-slate-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4 sm:gap-2 sm:text-sm">
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            Back to pricing
                        </Link>
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
                    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                        <aside aria-label="Gift card preview" className="min-w-0 lg:sticky lg:top-8">
                            <div className="mb-7 sm:mb-9">
                                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                                    <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                                    A thoughtful gift, a new beginning
                                </p>
                                <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                                    A little gift.<br />
                                    <span className="text-blue-600">A big step forward.</span>
                                </h1>
                                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
                                    Give someone you love the confidence to get behind the wheel. Choose a driving lesson, add a personal note, and make their day.
                                </p>
                            </div>

                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="text-sm font-semibold text-slate-700">Your gift card</h2>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                                    Live preview
                                </span>
                            </div>
                            <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8">
                                <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5" />
                                <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5" />
                                <div className="flex items-center justify-between gap-4">
                                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-100">
                                        <Car className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        Wheelmaster
                                    </span>
                                    <Gift className="h-8 w-8 text-blue-200" strokeWidth={1.5} aria-hidden="true" />
                                </div>
                                <div className="py-8 sm:py-10">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-200">A gift of confidence</p>
                                    <p className="break-words text-2xl font-bold leading-snug sm:text-3xl">
                                        {selectedPackage?.description || 'Their next adventure starts here.'}
                                    </p>
                                    {selectedPackage ? (
                                        <p className="mt-4 flex flex-wrap items-baseline gap-2">
                                            <span className="text-4xl font-extrabold tracking-tight">{formatPrice(selectedPackage.price)}</span>
                                            <span className="text-sm font-medium text-blue-200">AUD</span>
                                        </p>
                                    ) : (
                                        <p className="mt-4 text-sm leading-relaxed text-blue-100">Choose a package to personalise your gift.</p>
                                    )}
                                </div>
                                <div className="flex items-end justify-between gap-4 border-t border-white/20 pt-5">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">With love, from</p>
                                        <p className="mt-1 break-words text-sm font-semibold">{data.buyer_name.trim() || 'Your name'}</p>
                                    </div>
                                    <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">Gift voucher</span>
                                </div>
                            </div>
                            {data.message.trim() && (
                                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">A note from you</p>
                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{data.message}</p>
                                </div>
                            )}
                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Mail className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-slate-900">Delivered by email</h3>
                                    <p className="mt-1 break-words text-sm leading-relaxed text-slate-500">
                                        {deliveryEmail ? <>After payment, we&apos;ll send the voucher to <span className="font-medium text-slate-700">{deliveryEmail}</span>.</> : 'Your voucher will be emailed after payment. Send it directly to them, or to yourself to give later.'}
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <section aria-labelledby="gift-form-heading" className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                            <div className="mb-7 border-b border-slate-100 pb-6">
                                <h2 id="gift-form-heading" className="text-xl font-bold tracking-tight sm:text-2xl">Make it theirs</h2>
                                <p className="mt-2 text-sm leading-relaxed text-slate-500">A few details to create something thoughtful.</p>
                                <p className="mt-3 text-xs text-slate-500">Fields marked <span className="font-semibold text-blue-600">*</span> are required.</p>
                            </div>
                            {flash?.success && (
                                <div role="status" className="mb-6 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span>{flash.success}</span>
                                </div>
                            )}
                            {generalError && (
                                <div role="alert" className="mb-6 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                                    <span>{generalError}</span>
                                </div>
                            )}

                            <form onSubmit={submit} aria-busy={processing}>
                                <fieldset disabled={processing} className="min-w-0">
                                    <legend className="mb-4 flex items-center gap-2.5 text-base font-bold text-slate-900">
                                        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">1</span>
                                        Choose their lesson
                                    </legend>
                                    <label htmlFor="price_id" className={labelClassName}>Package <span className="text-blue-600">*</span></label>
                                    <Select
                                        inputId="price_id"
                                        instanceId="gift-package"
                                        name="price_id"
                                        options={packageOptions}
                                        value={selectedPackage || null}
                                        onChange={(option) => setData('price_id', option ? String(option.id) : '')}
                                        getOptionValue={(option) => String(option.id)}
                                        getOptionLabel={(option) => option.description}
                                        components={{ Option: PackageOption, SingleValue: PackageSingleValue }}
                                        styles={selectStyles}
                                        placeholder={packageOptions.length === 0 ? 'No packages available' : 'Select a driving lesson'}
                                        isDisabled={processing || packageOptions.length === 0}
                                        isSearchable={false}
                                        required
                                        aria-invalid={Boolean(errors.price_id)}
                                        aria-describedby={errors.price_id ? 'price_id-error' : undefined}
                                    />
                                    <FieldError field="price_id" errors={errors} />
                                    {packageOptions.length === 0 && (
                                        <p role="status" className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                                            Gift packages are currently unavailable. Please check back later or <Link href="/#pricing" className="font-semibold text-blue-600 underline underline-offset-2">explore our pricing</Link>.
                                        </p>
                                    )}
                                </fieldset>

                                <fieldset disabled={processing} className="mt-7 min-w-0 border-t border-slate-100 pt-6">
                                    <legend className="float-left mb-4 flex w-full items-center gap-2.5 text-base font-bold text-slate-900">
                                        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">2</span>
                                        Your details
                                    </legend>
                                    <div className="clear-both grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                        <div className="min-w-0">
                                            <label htmlFor="buyer_name" className={labelClassName}>Your name <span className="text-blue-600">*</span></label>
                                            <input id="buyer_name" name="buyer_name" type="text" autoComplete="name" value={data.buyer_name} onChange={(e) => setData('buyer_name', e.target.value)} placeholder="Your full name" required maxLength={100} aria-invalid={Boolean(errors.buyer_name)} aria-describedby={errors.buyer_name ? 'buyer_name-error' : undefined} className={inputClassName} />
                                            <FieldError field="buyer_name" errors={errors} />
                                        </div>
                                        <div className="min-w-0">
                                            <label htmlFor="buyer_email" className={labelClassName}>Your email <span className="text-blue-600">*</span></label>
                                            <input id="buyer_email" name="buyer_email" type="email" autoComplete="email" value={data.buyer_email} onChange={(e) => setData('buyer_email', e.target.value)} placeholder="you@example.com" required aria-invalid={Boolean(errors.buyer_email)} aria-describedby={errors.buyer_email ? 'buyer_email-error' : undefined} className={inputClassName} />
                                            <FieldError field="buyer_email" errors={errors} />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs leading-relaxed text-slate-500">We&apos;ll send your purchase confirmation to this email.</p>
                                </fieldset>

                                <fieldset disabled={processing} className="mt-7 min-w-0 border-t border-slate-100 pt-6">
                                    <legend className="float-left mb-4 flex w-full items-center gap-2.5 text-base font-bold text-slate-900">
                                        <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">3</span>
                                        Add a personal touch
                                    </legend>
                                    <div className="clear-both">
                                        <label htmlFor="recipient_email" className={labelClassName}>Recipient&apos;s email <span className="font-normal text-slate-500">(optional)</span></label>
                                        <input id="recipient_email" name="recipient_email" type="email" autoComplete="off" value={data.recipient_email} onChange={(e) => setData('recipient_email', e.target.value)} placeholder="someone.special@example.com" aria-invalid={Boolean(errors.recipient_email)} aria-describedby={`recipient-email-help${errors.recipient_email ? ' recipient_email-error' : ''}`} className={inputClassName} />
                                        <p id="recipient-email-help" className="mt-2 text-xs leading-relaxed text-slate-500">Leave this blank to receive the voucher yourself and give it later.</p>
                                        <FieldError field="recipient_email" errors={errors} />
                                    </div>
                                    <div className="mt-5">
                                        <label htmlFor="message" className={labelClassName}>Personal message <span className="font-normal text-slate-500">(optional)</span></label>
                                        <textarea id="message" name="message" value={data.message} onChange={(e) => setData('message', e.target.value)} rows={3} placeholder="Here's to new adventures. Enjoy your driving lesson!" aria-invalid={Boolean(errors.message)} aria-describedby={`message-help${errors.message ? ' message-error' : ''}`} className={`${inputClassName} resize-y`} />
                                        <div id="message-help" className="mt-2 flex justify-between gap-3 text-xs text-slate-500">
                                            <span>A little note makes it extra special.</span>
                                        </div>
                                        <FieldError field="message" errors={errors} />
                                    </div>
                                </fieldset>

                                <div className="mt-7 border-t border-slate-100 pt-6">
                                    <div className="mb-4 flex items-baseline justify-between gap-3">
                                        <span className="text-sm font-semibold text-slate-600">Gift total</span>
                                        <span className="text-xl font-extrabold text-slate-900">
                                            {selectedPackage ? <>{formatPrice(selectedPackage.price)} <span className="text-xs font-medium text-slate-500">AUD</span></> : <span className="text-sm font-medium text-slate-500">Select a package</span>}
                                        </span>
                                    </div>
                                    <button type="submit" disabled={processing || !canSubmit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                        {processing ? <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Gift className="h-4 w-4" aria-hidden="true" />}
                                        {processing ? 'Redirecting to payment...' : 'Continue to payment'}
                                        {!processing && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                                    </button>
                                    <p className="mt-3 text-center text-xs leading-relaxed text-slate-500" role="status">
                                        {processing ? 'Opening the payment page. Please wait.' : 'Your gift voucher will be created after payment.'}
                                    </p>
                                </div>
                            </form>
                        </section>
                    </div>
                    <footer className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
                        A thoughtful gift from Wheelmaster Driving Academy.
                    </footer>
                </main>
            </div>
        </>
    );
}
