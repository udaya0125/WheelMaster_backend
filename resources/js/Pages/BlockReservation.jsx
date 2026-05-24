import Wrapper from "@/AdminWrapper/Wrapper";
import MyTable from "@/MyTable/MyTable";
import axios from "axios";
import { X, Clock, Calendar, Trash2, Pencil, Edit } from "lucide-react";
import React, { useState, useMemo, useEffect, useRef } from "react";

// ─── Outside component so it's never recreated on re-render ───────
const ModalShell = ({ title, onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
        </div>
    </div>
);

const BlockReservation = () => {
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBlockSlotForm, setShowBlockSlotForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [blockMode, setBlockMode] = useState("single");
    const [blockAction, setBlockAction] = useState("block_time");
    const [editBlockAction, setEditBlockAction] = useState("block_time");
    const [formData, setFormData] = useState({
        date: "",
        endDate: "",
        startTime: "07:00",
        endTime: "08:00",
        reason: "",
    });
    const [editFormData, setEditFormData] = useState({
        date: "",
        startTime: "07:00",
        endTime: "08:00",
        reason: "",
    });
    const [formError, setFormError] = useState("");
    const [editFormError, setEditFormError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(false);

    // ─── Fetch ─────────────────────────────────────────────────────
    useEffect(() => {
        const fetchBlockReservations = async () => {
            try {
                setLoading(true);
                const response = await axios.get(route("ourblockreservations.index"));
                const sorted = [...response.data.data].sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setBlockedSlots(sorted);
            } catch (err) {
                console.error("Error fetching reservations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlockReservations();
    }, [reloadTrigger]);

    // ─── Lock body scroll when any modal is open ──────────────────
    useEffect(() => {
        if (showBlockSlotForm || showEditForm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showBlockSlotForm, showEditForm]);

    // ─── Helpers ───────────────────────────────────────────────────
    const calculateDuration = (startTime, endTime) => {
        const [startHours, startMinutes] = startTime.split(":").map(Number);
        const [endHours, endMinutes] = endTime.split(":").map(Number);
        const durationMinutes =
            endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
        return (durationMinutes / 60).toFixed(2);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(route("ourblockreservations.destroy", { id }));
            setReloadTrigger((prev) => !prev);
        } catch (error) {
            console.error("Error deleting block reservation:", error);
        }
    };

    // ─── Stable refs for table callbacks ──────────────────────────
    const handleDeleteRef = useRef(handleDelete);
    handleDeleteRef.current = handleDelete;
    const openEditFormRef = useRef(null);

    // ─── Create Form ───────────────────────────────────────────────
    const openBlockSlotForm = () => {
        setShowBlockSlotForm(true);
        setBlockMode("single");
        setBlockAction("block_time");
        setFormData({ date: "", endDate: "", startTime: "07:00", endTime: "08:00", reason: "" });
        setFormError("");
    };

    const closeBlockSlotForm = () => {
        setShowBlockSlotForm(false);
        setBlockAction("block_time");
        setFormData({ date: "", endDate: "", startTime: "07:00", endTime: "08:00", reason: "" });
        setFormError("");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name !== "reason") setFormError("");
    };

    const validateCreateForm = () => {
        if (!formData.date) return "Please select a start date.";
        if (blockMode === "range" && !formData.endDate) return "Please select an end date.";
        if (blockMode === "range" && formData.endDate < formData.date)
            return "End date must be on or after start date.";
        if (!formData.startTime || !formData.endTime)
            return "Please select both start and end time.";
        if (formData.startTime >= formData.endTime)
            return "End time must be after start time.";
        if (blockAction === "open_window" && (formData.startTime < "07:00" || formData.endTime > "18:00"))
            return "Open windows must be between 7:00 AM and 6:00 PM.";
        return "";
    };

    const handleBlockSlotSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateCreateForm();
        if (validationError) { setFormError(validationError); return; }
        try {
            setSubmitting(true);
            const duration = calculateDuration(formData.startTime, formData.endTime);
            await axios.post(route("ourblockreservations.store"), {
                start_date: formData.date,
                end_date: blockMode === "range" ? formData.endDate : formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                duration,
                reason: formData.reason || "No reason provided",
                block_action: blockAction,
            });
            setReloadTrigger((prev) => !prev);
            closeBlockSlotForm();
        } catch (err) {
            console.error("Error blocking time slot:", err);
            setFormError(err.response?.data?.message || "Failed to block time slot. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Edit Form ─────────────────────────────────────────────────
    const openEditForm = (slot) => {
        setEditingSlot(slot);
        setEditFormData({
            date: slot.date,
            startTime: slot.start_time,
            endTime: slot.end_time,
            reason: slot.reason === "No reason provided" ? "" : slot.reason || "",
        });
        setEditBlockAction("block_time");
        setEditFormError("");
        setShowEditForm(true);
    };
    openEditFormRef.current = openEditForm;

    const closeEditForm = () => {
        setShowEditForm(false);
        setEditingSlot(null);
        setEditBlockAction("block_time");
        setEditFormData({ date: "", startTime: "07:00", endTime: "08:00", reason: "" });
        setEditFormError("");
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
        if (name !== "reason") setEditFormError("");
    };

    const validateEditForm = () => {
        if (!editFormData.date) return "Please select a date.";
        if (!editFormData.startTime || !editFormData.endTime)
            return "Please select both start and end time.";
        if (editFormData.startTime >= editFormData.endTime)
            return "End time must be after start time.";
        if (editBlockAction === "open_window" && (editFormData.startTime < "07:00" || editFormData.endTime > "18:00"))
            return "Open windows must be between 7:00 AM and 6:00 PM.";
        const hasOverlap = editBlockAction === "block_time" && blockedSlots.some(
            (slot) =>
                slot.id !== editingSlot.id &&
                slot.date === editFormData.date &&
                (
                    (editFormData.startTime >= slot.start_time && editFormData.startTime < slot.end_time) ||
                    (editFormData.endTime > slot.start_time && editFormData.endTime <= slot.end_time) ||
                    (editFormData.startTime <= slot.start_time && editFormData.endTime >= slot.end_time)
                )
        );
        if (hasOverlap) return "This time slot overlaps with an existing blocked slot.";
        return "";
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateEditForm();
        if (validationError) { setEditFormError(validationError); return; }
        try {
            setEditSubmitting(true);
            const duration = calculateDuration(editFormData.startTime, editFormData.endTime);
            await axios.put(route("ourblockreservations.update", { id: editingSlot.id }), {
                date: editFormData.date,
                start_time: editFormData.startTime,
                end_time: editFormData.endTime,
                duration,
                reason: editFormData.reason || "No reason provided",
                block_action: editBlockAction,
            });
            setReloadTrigger((prev) => !prev);
            closeEditForm();
        } catch (err) {
            console.error("Error updating block reservation:", err);
            setEditFormError(err.response?.data?.message || "Failed to update. Please try again.");
        } finally {
            setEditSubmitting(false);
        }
    };

    // ─── Table Columns ─────────────────────────────────────────────
    const columns = useMemo(() => [
        {
            Header: "ID",
            accessor: (row, i) => i + 1,
            id: "rowIndex",
        },
        {
            Header: "Date",
            accessor: "date",
            Cell: ({ value }) => (
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{value}</span>
                </div>
            ),
        },
        {
            Header: "Time Slot",
            accessor: (row) => `${row.start_time} - ${row.end_time}`,
            id: "timeSlot",
            Cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium truncate">
                        {row.original.start_time} - {row.original.end_time}
                    </span>
                </div>
            ),
        },
        {
            Header: "Duration",
            accessor: (row) => {
                const duration = calculateDuration(row.start_time, row.end_time);
                const hours = Math.floor(duration);
                const minutes = Math.round((duration - hours) * 60);
                if (hours === 0) return `${minutes} min${minutes !== 1 ? "s" : ""}`;
                if (minutes === 0) return `${hours} hr${hours !== 1 ? "s" : ""}`;
                return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`;
            },
            id: "duration",
        },
        {
            Header: "Reason",
            accessor: "reason",
            Cell: ({ value }) => (
                <span className="truncate" title={value}>{value || "—"}</span>
            ),
        },
        {
            Header: "Actions",
            disableSortBy: true,
            Cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => openEditFormRef.current(row.original)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                        title="Edit"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => handleDeleteRef.current(row.original.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ),
        },
    ], []);

    return (
        <Wrapper>
            {/* ── Create Modal ── */}
            {showBlockSlotForm && (
                <ModalShell title="Manage Availability" onClose={closeBlockSlotForm}>
                    <form onSubmit={handleBlockSlotSubmit} className="space-y-4">

                        {/* Action Toggle */}
                        <div className="grid grid-cols-2 rounded-lg border border-gray-200 overflow-hidden">
                            {[
                                { value: "block_time", label: "Block time" },
                                { value: "open_window", label: "Open only" },
                            ].map((action) => (
                                <button
                                    key={action.value}
                                    type="button"
                                    onClick={() => {
                                        setBlockAction(action.value);
                                        setFormError("");
                                    }}
                                    className={`py-2 px-3 text-sm font-medium transition-colors ${
                                        blockAction === action.value
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                            {blockAction === "open_window"
                                ? "Customers can book only inside the selected time window. The rest of the day is blocked automatically."
                                : "Customers cannot book inside the selected time window."}
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            {["single", "range"].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setBlockMode(mode)}
                                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                        blockMode === mode
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {mode === "single" ? "Single Date" : "Date Range"}
                                </button>
                            ))}
                        </div>

                        {/* Date Fields */}
                        <div className={`grid gap-4 ${blockMode === "range" ? "grid-cols-2" : "grid-cols-1"}`}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {blockMode === "range" ? "Start Date *" : "Date *"}
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            {blockMode === "range" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        min={formData.date || new Date().toISOString().split("T")[0]}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* Time Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Start Time *", name: "startTime", value: formData.startTime },
                                { label: "End Time *",   name: "endTime",   value: formData.endTime   },
                            ].map(({ label, name, value }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {blockAction === "open_window"
                                            ? label.replace("Time", "Open")
                                            : label}
                                    </label>
                                    <input
                                        type="time"
                                        name={name}
                                        value={value}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason (Optional)
                            </label>
                            <input
                                type="text"
                                name="reason"
                                value={formData.reason}
                                onChange={handleInputChange}
                                placeholder="e.g., Staff meeting, Holiday"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {formError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{formError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeBlockSlotForm}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {submitting
                                    ? "Saving..."
                                    : blockAction === "open_window"
                                      ? "Open This Window"
                                      : "Block Time Slot"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* ── Edit Modal ── */}
            {showEditForm && editingSlot && (
                <ModalShell title="Edit Blocked Time Slot" onClose={closeEditForm}>
                    <form onSubmit={handleEditSubmit} className="space-y-4">

                        {/* Action Toggle */}
                        <div className="grid grid-cols-2 rounded-lg border border-gray-200 overflow-hidden">
                            {[
                                { value: "block_time", label: "Block time" },
                                { value: "open_window", label: "Open only" },
                            ].map((action) => (
                                <button
                                    key={action.value}
                                    type="button"
                                    onClick={() => {
                                        setEditBlockAction(action.value);
                                        setEditFormError("");
                                    }}
                                    className={`py-2 px-3 text-sm font-medium transition-colors ${
                                        editBlockAction === action.value
                                            ? "bg-indigo-600 text-white"
                                            : "bg-white text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                            {editBlockAction === "open_window"
                                ? "This will replace the selected block with automatic blocks before and after the open window."
                                : "Customers cannot book inside the selected time window."}
                        </div>

                        {/* Info badge */}
                        {/* <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-md text-sm text-indigo-700">
                            <Edit size={14} />
                            <span>Editing slot for <strong>{editingSlot.date}</strong></span>
                        </div> */}

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={editFormData.date}
                                onChange={handleEditInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        {/* Time Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Start Time *", name: "startTime", value: editFormData.startTime },
                                { label: "End Time *",   name: "endTime",   value: editFormData.endTime   },
                            ].map(({ label, name, value }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editBlockAction === "open_window"
                                            ? label.replace("Time", "Open")
                                            : label}
                                    </label>
                                    <input
                                        type="time"
                                        name={name}
                                        value={value}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason (Optional)
                            </label>
                            <input
                                type="text"
                                name="reason"
                                value={editFormData.reason}
                                onChange={handleEditInputChange}
                                placeholder="e.g., Staff meeting, Holiday"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {editFormError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{editFormError}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={closeEditForm}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {editSubmitting
                                    ? "Saving..."
                                    : editBlockAction === "open_window"
                                      ? "Open This Window"
                                      : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {/* ── Page Content ── */}
            <div className="px-2 sm:px-6 lg:px-8 py-6 lg:py-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                        Time Slot Management
                    </h1>
                    <button
                        onClick={openBlockSlotForm}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-800 transition-colors w-full sm:w-auto"
                    >
                        <Clock size={18} />
                        <span>Block Time Slot</span>
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                        <p className="mt-2 text-gray-600">Loading blocked time slots...</p>
                    </div>
                ) : blockedSlots.length === 0 ? (
                    <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-12 text-center">
                        <div className="flex flex-col items-center">
                            <Calendar size={48} className="text-gray-300 mb-3" />
                            <p className="text-lg font-medium text-gray-700 mb-2">No blocked time slots</p>
                            <p className="text-sm text-gray-500 mb-4">Block time slots to manage reservations</p>
                            <button
                                onClick={openBlockSlotForm}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                            >
                                Block Your First Time Slot
                            </button>
                        </div>
                    </div>
                ) : (
                    <MyTable columns={columns} data={blockedSlots} />
                )}
            </div>
        </Wrapper>
    );
};

export default BlockReservation;
