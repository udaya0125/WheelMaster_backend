import React, { useEffect } from "react";
import {
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiClipboard,
    FiClock,
    FiEdit,
    FiGift,
    FiMail,
    FiMessageSquare,
    FiPackage,
    FiUser,
    FiUserCheck,
    FiX,
} from "react-icons/fi";

/* ---------- Helpers (shared with Voucher.jsx) ---------- */

export const money = (amount) =>
    new Intl.NumberFormat("en-AU", {
        style: "currency",
        currency: "AUD",
    }).format(Number(amount || 0));

export const formatDate = (value) =>
    value
        ? new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(
              new Date(value),
          )
        : "—";

export const formatDateTime = (value) =>
    value
        ? new Intl.DateTimeFormat("en-AU", {
              dateStyle: "medium",
              timeStyle: "short",
          }).format(new Date(value))
        : "—";

export const statusStyle = (status) =>
    ({
        active: "bg-emerald-100 text-emerald-800",
        used: "bg-gray-200 text-gray-700",
        expired: "bg-amber-100 text-amber-800",
        cancelled: "bg-red-100 text-red-800",
    })[status] || "bg-gray-100 text-gray-700";

const daysUntil = (value) =>
    value ? Math.ceil((new Date(value) - Date.now()) / 86400000) : null;

const barColor = (percent) =>
    percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-red-500";

/* redeemed_by can be a plain string (name / email) or a related user object */
const redeemedByLabel = (value) => {
    if (!value) return null;
    if (typeof value === "object") {
        return value.name || value.email || (value.id ? `#${value.id}` : null);
    }
    return String(value);
};

const redeemedByEmail = (value) =>
    value && typeof value === "object" && value.name ? value.email : null;

/* ---------- Modal shell (also used by the add / edit forms) ---------- */

export const FormModal = ({
    title,
    subtitle,
    icon,
    onClose,
    footer,
    maxWidth = "max-w-2xl",
    children,
}) => {
    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onClose();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-6"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <div
                className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[90vh] sm:rounded-3xl`}
            >
                <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        {icon && (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">
                                {icon}
                            </span>
                        )}
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    >
                        <FiX />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    {children}
                </div>

                {footer && (
                    <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};

/* ---------- Small pieces ---------- */

const InfoRow = ({ icon, label, value, sub }) => (
    <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {icon}
        </span>
        <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {label}
            </p>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
                {value}
            </p>
            {sub && <p className="mt-0.5 break-all text-xs text-gray-500">{sub}</p>}
        </div>
    </div>
);

const ExpiryChip = ({ voucher }) => {
    const days = daysUntil(voucher.expires_at);
    if (days === null) return null;

    let text = `${days} day${days === 1 ? "" : "s"} left`;
    let tone = days <= 30 ? "bg-amber-400/20 text-amber-100" : "bg-white/15 text-indigo-100";

    if (days < 0 || voucher.status === "expired") {
        text = "Expired";
        tone = "bg-red-400/25 text-red-100";
    } else if (days === 0) {
        text = "Expires today";
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
        >
            <FiClock /> {text}
        </span>
    );
};

/* ---------- Voucher details popup ---------- */

const VoucherPopup = ({ voucher, copied, onCopy, onEdit, onClose }) => {
    const amount = Number(voucher.amount || 0);
    const balance = Number(voucher.balance || 0);
    const used = Math.max(0, amount - balance);
    const percentLeft =
        amount > 0 ? Math.min(100, Math.max(0, (balance / amount) * 100)) : 0;
    const packageName = voucher.price?.description || "Package unavailable";

    const redeemedBy = redeemedByLabel(voucher.redeemed_by);
    const redeemedByMail = redeemedByEmail(voucher.redeemed_by);
    const hasRedeemedBy = Boolean(redeemedBy);
    const hasRedeemedAt = Boolean(voucher.redeemed_at);

    return (
        <FormModal
            title="Voucher Details"
            subtitle={packageName}
            icon={<FiGift />}
            onClose={onClose}
            maxWidth="max-w-3xl"
            footer={
                <>
                    <button
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                        Close
                    </button>
                    <button
                        onClick={onEdit}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        <FiEdit /> Edit Voucher
                    </button>
                </>
            }
        >
            <div className="space-y-5">
                {/* Gift-card style hero */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-5 text-white shadow-lg">
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/5" />

                    <div className="relative flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                            Gift voucher
                        </p>
                        <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(voucher.status)}`}
                        >
                            {voucher.status}
                        </span>
                    </div>

                    <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
                        <code className="break-all font-mono text-xl font-bold tracking-[0.2em] sm:text-2xl">
                            {voucher.code}
                        </code>
                        <button
                            onClick={() => onCopy(voucher.code)}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold ring-1 ring-white/30 transition hover:bg-white/25"
                        >
                            {copied ? <FiCheck /> : <FiClipboard />}
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>

                    {/* Perforation */}
                    <div className="relative -mx-5 my-5 border-t border-dashed border-white/30" />

                    <div className="relative flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <p className="text-xs text-indigo-200">Remaining balance</p>
                            <p className="mt-0.5 text-3xl font-bold">{money(balance)}</p>
                        </div>
                        <ExpiryChip voucher={voucher} />
                    </div>
                </div>

                {/* Personal note (same as the Create page) */}
                {voucher.message && (
                     <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                            A note from {voucher.buyer_name || "the buyer"}
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                            {voucher.message}
                        </p>
                   </div>
                )}

                {/* Usage */}
                <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-800">Usage</span>
                        <span className="text-gray-500">
                            {Math.round(percentLeft)}% remaining
                        </span>
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor(percentLeft)}`}
                            style={{ width: `${percentLeft}%` }}
                        />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        {[
                            ["Original", money(amount)],
                            ["Used", money(used)],
                            ["Left", money(balance)],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-xl bg-gray-50 px-2 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                                    {label}
                                </p>
                                <p className="mt-0.5 text-sm font-bold text-gray-900">
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
                    <InfoRow icon={<FiPackage />} label="Package" value={packageName} />
                    <InfoRow
                        icon={<FiUser />}
                        label="Buyer"
                        value={voucher.buyer_name || "—"}
                        sub={voucher.buyer_email}
                    />
                    <InfoRow
                        icon={<FiMail />}
                        label="Recipient"
                        value={voucher.recipient_email || voucher.buyer_email || "—"}
                    />
                    <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        <InfoRow
                            icon={<FiCalendar />}
                            label="Created"
                            value={formatDate(voucher.created_at)}
                        />
                        <InfoRow
                            icon={<FiCalendar />}
                            label="Expires"
                            value={formatDate(voucher.expires_at)}
                        />
                    </div>
                    {(hasRedeemedBy || hasRedeemedAt) && (
                        <div
                            className={`grid grid-cols-1 divide-y divide-gray-100 ${
                                hasRedeemedBy && hasRedeemedAt
                                    ? "sm:grid-cols-2 sm:divide-x sm:divide-y-0"
                                    : ""
                            }`}
                        >
                            {hasRedeemedBy && (
                                <InfoRow
                                    icon={<FiUserCheck />}
                                    label="Redeemed by"
                                    value={redeemedBy}
                                    sub={redeemedByMail}
                                />
                            )}
                            {hasRedeemedAt && (
                                <InfoRow
                                    icon={<FiCheckCircle />}
                                    label="Redeemed at"
                                    value={formatDateTime(voucher.redeemed_at)}
                                />
                            )}
                        </div>
                    )}
                    {/* {voucher.message && (
                        <InfoRow
                            icon={<FiMessageSquare />}
                            label="Message"
                            value={voucher.message}
                        />
                    )} */}
                </div>
            </div>
        </FormModal>
    );
};

export default VoucherPopup;






// import React, { useEffect, useRef, useState } from "react";
// import {
//     FiCalendar,
//     FiCheck,
//     FiCheckCircle,
//     FiClipboard,
//     FiClock,
//     FiDownload,
//     FiEdit,
//     FiGift,
//     FiMail,
//     FiMessageSquare,
//     FiPackage,
//     FiUser,
//     FiUserCheck,
//     FiX,
// } from "react-icons/fi";
// import { Car, Gift } from "lucide-react";
// import { toPng } from "html-to-image";

// /* ---------- Helpers (shared with Voucher.jsx) ---------- */

// export const money = (amount) =>
//     new Intl.NumberFormat("en-AU", {
//         style: "currency",
//         currency: "AUD",
//     }).format(Number(amount || 0));

// export const formatDate = (value) =>
//     value
//         ? new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(
//               new Date(value),
//           )
//         : "—";

// export const formatDateTime = (value) =>
//     value
//         ? new Intl.DateTimeFormat("en-AU", {
//               dateStyle: "medium",
//               timeStyle: "short",
//           }).format(new Date(value))
//         : "—";

// export const statusStyle = (status) =>
//     ({
//         active: "bg-emerald-100 text-emerald-800",
//         used: "bg-gray-200 text-gray-700",
//         expired: "bg-amber-100 text-amber-800",
//         cancelled: "bg-red-100 text-red-800",
//     })[status] || "bg-gray-100 text-gray-700";

// const daysUntil = (value) =>
//     value ? Math.ceil((new Date(value) - Date.now()) / 86400000) : null;

// const barColor = (percent) =>
//     percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-red-500";

// /* ---------- Modal shell (also used by the add / edit forms) ---------- */

// export const FormModal = ({
//     title,
//     subtitle,
//     icon,
//     onClose,
//     footer,
//     maxWidth = "max-w-2xl",
//     children,
// }) => {
//     useEffect(() => {
//         const onKeyDown = (e) => e.key === "Escape" && onClose();
//         const previousOverflow = document.body.style.overflow;
//         document.body.style.overflow = "hidden";
//         document.addEventListener("keydown", onKeyDown);
//         return () => {
//             document.body.style.overflow = previousOverflow;
//             document.removeEventListener("keydown", onKeyDown);
//         };
//     }, [onClose]);

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-6"
//             onMouseDown={(e) => e.target === e.currentTarget && onClose()}
//             role="dialog"
//             aria-modal="true"
//             aria-label={title}
//         >
//             <div
//                 className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[90vh] sm:rounded-3xl`}
//             >
//                 <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4 sm:px-6">
//                     <div className="flex min-w-0 items-center gap-3">
//                         {icon && (
//                             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">
//                                 {icon}
//                             </span>
//                         )}
//                         <div className="min-w-0">
//                             <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
//                                 {title}
//                             </h2>
//                             {subtitle && (
//                                 <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
//                                     {subtitle}
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         aria-label="Close"
//                         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
//                     >
//                         <FiX />
//                     </button>
//                 </header>

//                 <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
//                     {children}
//                 </div>

//                 {footer && (
//                     <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
//                         {footer}
//                     </footer>
//                 )}
//             </div>
//         </div>
//     );
// };

// /* ---------- Small pieces ---------- */

// const InfoRow = ({ icon, label, value, sub }) => (
//     <div className="flex items-start gap-3 px-4 py-3.5">
//         <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
//             {icon}
//         </span>
//         <div className="min-w-0 flex-1">
//             <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 {label}
//             </p>
//             <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
//                 {value}
//             </p>
//             {sub && <p className="mt-0.5 break-all text-xs text-gray-500">{sub}</p>}
//         </div>
//     </div>
// );

// const ExpiryChip = ({ voucher }) => {
//     const days = daysUntil(voucher.expires_at);
//     if (days === null) return null;

//     let text = `${days} day${days === 1 ? "" : "s"} left`;
//     let tone = days <= 30 ? "bg-amber-400/20 text-amber-100" : "bg-white/15 text-blue-100";

//     if (days < 0 || voucher.status === "expired") {
//         text = "Expired";
//         tone = "bg-red-400/25 text-red-100";
//     } else if (days === 0) {
//         text = "Expires today";
//     }

//     return (
//         <span
//             className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
//         >
//             <FiClock /> {text}
//         </span>
//     );
// };

// /* ---------- Gift card (same design as the Create page preview) ---------- */

// const GiftCard = React.forwardRef(({ voucher, packageName, balance }, ref) => (
//     <div
//         ref={ref}
//         className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8"
//     >
//         <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5"
//         />
//         <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5"
//         />

//         <div className="flex items-center justify-between gap-4">
//             <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-100">
//                 <Car className="h-5 w-5 shrink-0" aria-hidden="true" />
//                 Wheelmaster
//             </span>
//             <Gift className="h-8 w-8 text-blue-200" strokeWidth={1.5} aria-hidden="true" />
//         </div>

//         <div className="py-7 sm:py-8">
//             <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-200">
//                 A gift of confidence
//             </p>
//             <p className="break-words text-2xl font-bold leading-snug sm:text-3xl">
//                 {packageName}
//             </p>
//             <p className="mt-4 flex flex-wrap items-baseline gap-2">
//                 <span className="text-4xl font-extrabold tracking-tight">
//                     {money(balance)}
//                 </span>
//                 <span className="text-sm font-medium text-blue-200">AUD remaining</span>
//             </p>
//         </div>

//         <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 px-4 py-3">
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
//                 Voucher code
//             </p>
//             <code className="mt-1 block break-all font-mono text-xl font-bold tracking-[0.2em] sm:text-2xl">
//                 {voucher.code}
//             </code>
//         </div>

//         <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
//             <span
//                 className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(voucher.status)}`}
//             >
//                 {voucher.status}
//             </span>
//             <ExpiryChip voucher={voucher} />
//         </div>

//         <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/20 pt-5">
//             <div className="min-w-0">
//                 <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
//                     With love, from
//                 </p>
//                 <p className="mt-1 break-words text-sm font-semibold">
//                     {voucher.buyer_name || "—"}
//                 </p>
//             </div>
//             <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
//                 Gift voucher
//             </span>
//         </div>
//     </div>
// ));

// /* ---------- Voucher details popup ---------- */

// const VoucherPopup = ({ voucher, copied, onCopy, onEdit, onClose }) => {
//     const cardRef = useRef(null);
//     const [downloading, setDownloading] = useState(false);

//     const amount = Number(voucher.amount || 0);
//     const balance = Number(voucher.balance || 0);
//     const used = Math.max(0, amount - balance);
//     const percentLeft =
//         amount > 0 ? Math.min(100, Math.max(0, (balance / amount) * 100)) : 0;
//     const packageName = voucher.price?.description || "Package unavailable";
//     const hasRedemption = Boolean(voucher.redeemed_by || voucher.redeemed_at);

//     const handleDownload = async () => {
//         if (!cardRef.current || downloading) return;
//         setDownloading(true);
//         try {
//             const dataUrl = await toPng(cardRef.current, {
//                 pixelRatio: 2,
//                 cacheBust: true,
//             });
//             const link = document.createElement("a");
//             link.download = `wheelmaster-gift-voucher-${voucher.code}.png`;
//             link.href = dataUrl;
//             link.click();
//         } catch (error) {
//             console.error("Failed to download voucher card:", error);
//         } finally {
//             setDownloading(false);
//         }
//     };

//     return (
//         <FormModal
//             title="Voucher Details"
//             subtitle={packageName}
//             icon={<FiGift />}
//             onClose={onClose}
//             maxWidth="max-w-3xl"
//             footer={
//                 <>
//                     <button
//                         onClick={onClose}
//                         className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
//                     >
//                         Close
//                     </button>
//                     <button
//                         onClick={handleDownload}
//                         disabled={downloading}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         <FiDownload />
//                         {downloading ? "Preparing..." : "Download Card"}
//                     </button>
//                     <button
//                         onClick={onEdit}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
//                     >
//                         <FiEdit /> Edit Voucher
//                     </button>
//                 </>
//             }
//         >
//             <div className="space-y-5">
//                 {/* Gift card (same as the Create page) */}
//                 <GiftCard
//                     ref={cardRef}
//                     voucher={voucher}
//                     packageName={packageName}
//                     balance={balance}
//                 />

//                 {/* Card actions */}
//                 <div className="flex flex-wrap gap-2">
//                     <button
//                         onClick={() => onCopy(voucher.code)}
//                         className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
//                     >
//                         {copied ? <FiCheck /> : <FiClipboard />}
//                         {copied ? "Copied" : "Copy code"}
//                     </button>
//                     <button
//                         onClick={handleDownload}
//                         disabled={downloading}
//                         className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         <FiDownload />
//                         {downloading ? "Preparing..." : "Download as image"}
//                     </button>
//                 </div>

//                 {/* Personal note (same as the Create page) */}
//                 {voucher.message && (
//                     <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
//                         <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
//                             A note from {voucher.buyer_name || "the buyer"}
//                         </p>
//                         <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
//                             {voucher.message}
//                         </p>
//                     </div>
//                 )}

//                 {/* Usage */}
//                 <div className="rounded-2xl border border-gray-200 p-4">
//                     <div className="flex items-center justify-between text-sm">
//                         <span className="font-semibold text-gray-800">Usage</span>
//                         <span className="text-gray-500">
//                             {Math.round(percentLeft)}% remaining
//                         </span>
//                     </div>
//                     <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
//                         <div
//                             className={`h-full rounded-full transition-all duration-500 ${barColor(percentLeft)}`}
//                             style={{ width: `${percentLeft}%` }}
//                         />
//                     </div>
//                     <div className="mt-3 grid grid-cols-3 gap-2 text-center">
//                         {[
//                             ["Original", money(amount)],
//                             ["Used", money(used)],
//                             ["Left", money(balance)],
//                         ].map(([label, value]) => (
//                             <div key={label} className="rounded-xl bg-gray-50 px-2 py-2">
//                                 <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                                     {label}
//                                 </p>
//                                 <p className="mt-0.5 text-sm font-bold text-gray-900">
//                                     {value}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Details */}
//                 <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
//                     <InfoRow icon={<FiPackage />} label="Package" value={packageName} />
//                     <InfoRow
//                         icon={<FiUser />}
//                         label="Buyer"
//                         value={voucher.buyer_name || "—"}
//                         sub={voucher.buyer_email}
//                     />
//                     <InfoRow
//                         icon={<FiMail />}
//                         label="Recipient"
//                         value={voucher.recipient_email || voucher.buyer_email || "—"}
//                     />
//                     <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
//                         <InfoRow
//                             icon={<FiCalendar />}
//                             label="Created"
//                             value={formatDate(voucher.created_at)}
//                         />
//                         <InfoRow
//                             icon={<FiCalendar />}
//                             label="Expires"
//                             value={formatDate(voucher.expires_at)}
//                         />
//                     </div>
//                     {hasRedemption && (
//                         <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
//                             <InfoRow
//                                 icon={<FiUserCheck />}
//                                 label="Redeemed by"
//                                 value={voucher.redeemed_by || "—"}
//                             />
//                             <InfoRow
//                                 icon={<FiCheckCircle />}
//                                 label="Redeemed at"
//                                 value={formatDateTime(voucher.redeemed_at)}
//                             />
//                         </div>
//                     )}
//                     {/* {voucher.message && (
//                         <InfoRow
//                             icon={<FiMessageSquare />}
//                             label="Message"
//                             value={voucher.message}
//                         />
//                     )} */}
//                 </div>
//             </div>
//         </FormModal>
//     );
// };

// export default VoucherPopup;









// import React, { useEffect, useRef, useState } from "react";
// import {
//     FiCalendar,
//     FiCheck,
//     FiClipboard,
//     FiClock,
//     FiDownload,
//     FiEdit,
//     FiGift,
//     FiMail,
//     FiMessageSquare,
//     FiPackage,
//     FiUser,
//     FiX,
// } from "react-icons/fi";
// import { Car, Gift } from "lucide-react";
// import { toPng } from "html-to-image";

// /* ---------- Helpers (shared with Voucher.jsx) ---------- */

// export const money = (amount) =>
//     new Intl.NumberFormat("en-AU", {
//         style: "currency",
//         currency: "AUD",
//     }).format(Number(amount || 0));

// export const formatDate = (value) =>
//     value
//         ? new Intl.DateTimeFormat("en-AU", { dateStyle: "medium" }).format(
//               new Date(value),
//           )
//         : "—";

// export const statusStyle = (status) =>
//     ({
//         active: "bg-emerald-100 text-emerald-800",
//         used: "bg-gray-200 text-gray-700",
//         expired: "bg-amber-100 text-amber-800",
//         cancelled: "bg-red-100 text-red-800",
//     })[status] || "bg-gray-100 text-gray-700";

// const daysUntil = (value) =>
//     value ? Math.ceil((new Date(value) - Date.now()) / 86400000) : null;

// const barColor = (percent) =>
//     percent > 50 ? "bg-emerald-500" : percent > 20 ? "bg-amber-500" : "bg-red-500";

// /* ---------- Modal shell (also used by the add / edit forms) ---------- */

// export const FormModal = ({
//     title,
//     subtitle,
//     icon,
//     onClose,
//     footer,
//     maxWidth = "max-w-2xl",
//     children,
// }) => {
//     useEffect(() => {
//         const onKeyDown = (e) => e.key === "Escape" && onClose();
//         const previousOverflow = document.body.style.overflow;
//         document.body.style.overflow = "hidden";
//         document.addEventListener("keydown", onKeyDown);
//         return () => {
//             document.body.style.overflow = previousOverflow;
//             document.removeEventListener("keydown", onKeyDown);
//         };
//     }, [onClose]);

//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-6"
//             onMouseDown={(e) => e.target === e.currentTarget && onClose()}
//             role="dialog"
//             aria-modal="true"
//             aria-label={title}
//         >
//             <div
//                 className={`flex max-h-[92vh] w-full ${maxWidth} flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-black/5 sm:max-h-[90vh] sm:rounded-3xl`}
//             >
//                 <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4 sm:px-6">
//                     <div className="flex min-w-0 items-center gap-3">
//                         {icon && (
//                             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white shadow-sm">
//                                 {icon}
//                             </span>
//                         )}
//                         <div className="min-w-0">
//                             <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
//                                 {title}
//                             </h2>
//                             {subtitle && (
//                                 <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
//                                     {subtitle}
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         aria-label="Close"
//                         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
//                     >
//                         <FiX />
//                     </button>
//                 </header>

//                 <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
//                     {children}
//                 </div>

//                 {footer && (
//                     <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
//                         {footer}
//                     </footer>
//                 )}
//             </div>
//         </div>
//     );
// };

// /* ---------- Small pieces ---------- */

// const InfoRow = ({ icon, label, value, sub }) => (
//     <div className="flex items-start gap-3 px-4 py-3.5">
//         <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
//             {icon}
//         </span>
//         <div className="min-w-0 flex-1">
//             <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                 {label}
//             </p>
//             <p className="mt-0.5 whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
//                 {value}
//             </p>
//             {sub && <p className="mt-0.5 break-all text-xs text-gray-500">{sub}</p>}
//         </div>
//     </div>
// );

// const ExpiryChip = ({ voucher }) => {
//     const days = daysUntil(voucher.expires_at);
//     if (days === null) return null;

//     let text = `${days} day${days === 1 ? "" : "s"} left`;
//     let tone = days <= 30 ? "bg-amber-400/20 text-amber-100" : "bg-white/15 text-blue-100";

//     if (days < 0 || voucher.status === "expired") {
//         text = "Expired";
//         tone = "bg-red-400/25 text-red-100";
//     } else if (days === 0) {
//         text = "Expires today";
//     }

//     return (
//         <span
//             className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
//         >
//             <FiClock /> {text}
//         </span>
//     );
// };

// /* ---------- Gift card (same design as the Create page preview) ---------- */

// const GiftCard = React.forwardRef(({ voucher, packageName, balance }, ref) => (
//     <div
//         ref={ref}
//         className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-6 text-white shadow-xl shadow-blue-900/15 sm:p-8"
//     >
//         <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -right-16 -top-20 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5"
//         />
//         <div
//             aria-hidden="true"
//             className="pointer-events-none absolute -bottom-32 -left-16 -z-10 h-72 w-72 rounded-full border-[35px] border-white/5"
//         />

//         <div className="flex items-center justify-between gap-4">
//             <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-100">
//                 <Car className="h-5 w-5 shrink-0" aria-hidden="true" />
//                 Wheelmaster
//             </span>
//             <Gift className="h-8 w-8 text-blue-200" strokeWidth={1.5} aria-hidden="true" />
//         </div>

//         <div className="py-7 sm:py-8">
//             <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-blue-200">
//                 A gift of confidence
//             </p>
//             <p className="break-words text-2xl font-bold leading-snug sm:text-3xl">
//                 {packageName}
//             </p>
//             <p className="mt-4 flex flex-wrap items-baseline gap-2">
//                 <span className="text-4xl font-extrabold tracking-tight">
//                     {money(balance)}
//                 </span>
//                 <span className="text-sm font-medium text-blue-200">AUD remaining</span>
//             </p>
//         </div>

//         <div className="rounded-2xl border border-dashed border-white/30 bg-white/10 px-4 py-3">
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
//                 Voucher code
//             </p>
//             <code className="mt-1 block break-all font-mono text-xl font-bold tracking-[0.2em] sm:text-2xl">
//                 {voucher.code}
//             </code>
//         </div>

//         <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
//             <span
//                 className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(voucher.status)}`}
//             >
//                 {voucher.status}
//             </span>
//             <ExpiryChip voucher={voucher} />
//         </div>

//         <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/20 pt-5">
//             <div className="min-w-0">
//                 <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
//                     With love, from
//                 </p>
//                 <p className="mt-1 break-words text-sm font-semibold">
//                     {voucher.buyer_name || "—"}
//                 </p>
//             </div>
//             <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">
//                 Gift voucher
//             </span>
//         </div>
//     </div>
// ));

// /* ---------- Voucher details popup ---------- */

// const VoucherPopup = ({ voucher, copied, onCopy, onEdit, onClose }) => {
//     const cardRef = useRef(null);
//     const [downloading, setDownloading] = useState(false);

//     const amount = Number(voucher.amount || 0);
//     const balance = Number(voucher.balance || 0);
//     const used = Math.max(0, amount - balance);
//     const percentLeft =
//         amount > 0 ? Math.min(100, Math.max(0, (balance / amount) * 100)) : 0;
//     const packageName = voucher.price?.description || "Package unavailable";

//     const handleDownload = async () => {
//         if (!cardRef.current || downloading) return;
//         setDownloading(true);
//         try {
//             const dataUrl = await toPng(cardRef.current, {
//                 pixelRatio: 2,
//                 cacheBust: true,
//             });
//             const link = document.createElement("a");
//             link.download = `wheelmaster-gift-voucher-${voucher.code}.png`;
//             link.href = dataUrl;
//             link.click();
//         } catch (error) {
//             console.error("Failed to download voucher card:", error);
//         } finally {
//             setDownloading(false);
//         }
//     };

//     return (
//         <FormModal
//             title="Voucher Details"
//             subtitle={packageName}
//             icon={<FiGift />}
//             onClose={onClose}
//             maxWidth="max-w-2xl"
//             footer={
//                 <>
//                     <button
//                         onClick={onClose}
//                         className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
//                     >
//                         Close
//                     </button>
//                     <button
//                         onClick={handleDownload}
//                         disabled={downloading}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         <FiDownload />
//                         {downloading ? "Preparing..." : "Download Card"}
//                     </button>
//                     <button
//                         onClick={onEdit}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
//                     >
//                         <FiEdit /> Edit Voucher
//                     </button>
//                 </>
//             }
//         >
//             <div className="space-y-5">
//                 {/* Gift card (same as the Create page) */}
//                 <GiftCard
//                     ref={cardRef}
//                     voucher={voucher}
//                     packageName={packageName}
//                     balance={balance}
//                 />

//                 {/* Card actions */}
//                 <div className="flex flex-wrap gap-2">
//                     <button
//                         onClick={() => onCopy(voucher.code)}
//                         className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
//                     >
//                         {copied ? <FiCheck /> : <FiClipboard />}
//                         {copied ? "Copied" : "Copy code"}
//                     </button>
//                     <button
//                         onClick={handleDownload}
//                         disabled={downloading}
//                         className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
//                     >
//                         <FiDownload />
//                         {downloading ? "Preparing..." : "Download as image"}
//                     </button>
//                 </div>

//                 {/* Personal note (same as the Create page) */}
//                 {voucher.message && (
//                     <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
//                         <p className="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700">
//                             A note from {voucher.buyer_name || "the buyer"}
//                         </p>
//                         <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
//                             {voucher.message}
//                         </p>
//                     </div>
//                 )}

//                 {/* Usage */}
//                 <div className="rounded-2xl border border-gray-200 p-4">
//                     <div className="flex items-center justify-between text-sm">
//                         <span className="font-semibold text-gray-800">Usage</span>
//                         <span className="text-gray-500">
//                             {Math.round(percentLeft)}% remaining
//                         </span>
//                     </div>
//                     <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
//                         <div
//                             className={`h-full rounded-full transition-all duration-500 ${barColor(percentLeft)}`}
//                             style={{ width: `${percentLeft}%` }}
//                         />
//                     </div>
//                     <div className="mt-3 grid grid-cols-3 gap-2 text-center">
//                         {[
//                             ["Original", money(amount)],
//                             ["Used", money(used)],
//                             ["Left", money(balance)],
//                         ].map(([label, value]) => (
//                             <div key={label} className="rounded-xl bg-gray-50 px-2 py-2">
//                                 <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
//                                     {label}
//                                 </p>
//                                 <p className="mt-0.5 text-sm font-bold text-gray-900">
//                                     {value}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Details */}
//                 <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200">
//                     <InfoRow icon={<FiPackage />} label="Package" value={packageName} />
//                     <InfoRow
//                         icon={<FiUser />}
//                         label="Buyer"
//                         value={voucher.buyer_name || "—"}
//                         sub={voucher.buyer_email}
//                     />
//                     <InfoRow
//                         icon={<FiMail />}
//                         label="Recipient"
//                         value={voucher.recipient_email || voucher.buyer_email || "—"}
//                     />
//                     <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
//                         <InfoRow
//                             icon={<FiCalendar />}
//                             label="Created"
//                             value={formatDate(voucher.created_at)}
//                         />
//                         <InfoRow
//                             icon={<FiCalendar />}
//                             label="Expires"
//                             value={formatDate(voucher.expires_at)}
//                         />
//                     </div>
//                     {/* {voucher.message && (
//                         <InfoRow
//                             icon={<FiMessageSquare />}
//                             label="Message"
//                             value={voucher.message}
//                         />
//                     )} */}
//                 </div>
//             </div>
//         </FormModal>
//     );
// };

// export default VoucherPopup;

