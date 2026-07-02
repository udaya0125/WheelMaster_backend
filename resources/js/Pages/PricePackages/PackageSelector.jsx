import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { ChevronDown, Package } from "lucide-react";

const getPackageHref = (packageOption) => {
    const category = (packageOption?.category || "").toLowerCase();

    if (category.includes("test")) {
        return `/calendar/test/${packageOption.slug}`;
    }

    return `/calendar/${packageOption.slug}`;
};

// const getPackageLabel = (packageOption) => {
//     const pieces = [
//         packageOption.duration,
//     ].filter(Boolean);

//     return pieces.join(" - ");
// };

const getPackageLabel = (packageOption) => {
    const duration = packageOption.duration;
    if (!duration) return "Lesson";
    const isPlural = !duration.startsWith("1 ");
    return `${duration} ${isPlural ? "Lesson" : "Lesson"}`;
};

const PackageSelector = ({
    price,
    activePrice = price,
    packageOptions = [],
    className = "",
    onPackageChange,
}) => {
    const [isChanging, setIsChanging] = useState(false);

    const packages = useMemo(() => {
        const packageMap = new Map();

        [price, ...packageOptions].forEach((packageOption) => {
            if (packageOption?.id && packageOption?.slug) {
                packageMap.set(packageOption.id, packageOption);
            }
        });

        return Array.from(packageMap.values());
    }, [price, packageOptions]);

    const groupedPackages = useMemo(
        () =>
            packages.reduce((groups, packageOption) => {
                const key = packageOption.category || "Driving Lessons";
                if (!groups[key]) groups[key] = [];
                groups[key].push(packageOption);
                return groups;
            }, {}),
        [packages],
    );

    const handlePackageChange = (event) => {
        const selectedId = Number(event.target.value);
        const nextPackage = packages.find(
            (packageOption) => packageOption.id === selectedId,
        );

        if (!nextPackage || nextPackage.id === activePrice?.id) return;

        if (onPackageChange) {
            onPackageChange(nextPackage);
            return;
        }

        setIsChanging(true);
        router.visit(getPackageHref(nextPackage), {
            preserveScroll: false,
            preserveState: false,
            onFinish: () => setIsChanging(false),
        });
    };

    if (packages.length <= 1) return null;

    return (
        <div className={className}>
            <label
                htmlFor="package-selector"
                className="block text-sm font-medium text-gray-700 mb-2"
            >
                Lesson Type
            </label>
            <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <select
                    id="package-selector"
                    value={activePrice?.id || ""}
                    onChange={handlePackageChange}
                    disabled={isChanging}
                    className="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 pl-10 pr-10 transition disabled:opacity-60 disabled:cursor-wait"
                >
                    {Object.entries(groupedPackages).map(
                        ([category, options]) => (
                            <optgroup key={category} label={category}>
                                {options.map((packageOption) => (
                                    <option
                                        key={packageOption.id}
                                        value={packageOption.id}
                                    >
                                        {getPackageLabel(packageOption)}
                                    </option>
                                ))}
                            </optgroup>
                        ),
                    )}
                </select>
                {/* <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" /> */}
            </div>
        </div>
    );
};

export default PackageSelector;
