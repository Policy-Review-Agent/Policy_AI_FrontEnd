import React, { useState, useRef } from "react";
import { Upload, AlertCircle, X, FileText, CheckCircle } from "lucide-react";
import { UploadCSVFile } from "../../api/apisCall";
import { navigate } from "../../../store/slices/navigationSlice";
import { useDispatch } from "react-redux";
const UploadFile = () => {
    const dispatch = useDispatch()
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const [fileError, setFileError] = useState("");
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null); // { type: "success"|"error", msg }
    const fileInputRef = useRef(null);   // 👈 ref to reset input

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
                setFile(selectedFile);
                setFileName(selectedFile.name);
                setFileError("");
            } else {
                setFileError("Please upload only CSV files.");
            }
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv"))) {
            setFile(droppedFile);
            setFileName(droppedFile.name);
            setFileError("");
        } else {
            setFileError("Only CSV files are allowed.");
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    const handleCancel = () => {
        setFile(null);
        setFileName("");
        setFileError("");
        // 👇 reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleProcess = async () => {
        if (!file) { setFileError("Please select a CSV file to upload."); return; }
        setUploading(true);
        setFileError("");
        try {
            const response = await UploadCSVFile(file);
            if (response?.data?.status === true || response?.status === 200) {
                showToast("success", response?.data?.message || "File uploaded successfully.");
                handleCancel();
                setTimeout(() => {
                    dispatch(navigate("dashboard"));
                }, 2000); // wait 2s for toast to show then navigate
            } else {
                const errMsg = response?.data?.message || "Upload failed. Please try again.";
                showToast("error", errMsg);
            }
        } catch (err) {
            showToast("error", "Something went wrong. Please try again.",err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-w-0 w-full">

            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-[13px] font-medium transition-all
        ${toast.type === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-700"}`}
                >
                    {toast.type === "success"
                        ? <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                        : <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                    }
                    {toast.msg}
                    <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100">
                        <X size={13} />
                    </button>
                </div>
            )}

            {/* Page header */}
            <span className="text-gray-500 font-medium text-sm">Upload CSV</span>
            <div className="mt-2 mb-6">
                <h1 className="text-xl font-bold text-gray-800 tracking-tight">Upload Policy Data</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                    Upload a CSV file to process policy data manually and queue it for batch processing.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">

                {/* ── Left: Upload card ── */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <h2 className="text-[15px] font-semibold text-gray-800">File Upload</h2>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-200">
                                CSV Only
                            </span>
                        </div>

                        <div className="p-5">
                            <label
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragging
                                    ? "bg-blue-50 border-blue-400"
                                    : "bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-blue-400"}`}
                            >
                                <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm mb-3">
                                    <Upload size={22} className="text-gray-500" />
                                </div>
                                <p className="text-[14px] font-semibold text-gray-800">Drag & drop your CSV here</p>
                                <p className="text-[12px] text-gray-500 mt-1">or click to browse files</p>
                                <span className="text-[11px] text-gray-400 font-medium bg-gray-100 px-3 py-1 rounded-full mt-3">
                                    .csv files only
                                </span>
                                {/* 👇 ref added here */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Selected file */}
                            {fileName && (
                                <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 w-fit">
                                    <FileText size={14} className="text-green-600 flex-shrink-0" />
                                    <span className="text-[12px] font-medium text-green-700 truncate flex-1">{fileName}</span>
                                    <button onClick={handleCancel} className="text-green-400 hover:text-red-500 transition-colors flex-shrink-0">
                                        <X size={13} />
                                    </button>
                                </div>
                            )}

                            {/* Error */}
                            {fileError && (
                                <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                                    <span className="text-[12px] text-red-600">{fileError}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap sm:justify-end justify-start items-center gap-3 mt-3">
                        <button
                            onClick={handleCancel}
                            disabled={uploading}
                            className="text-[13px] font-semibold text-gray-600 border border-gray-200 bg-white hover:bg-blue-100 hover:border-blue-300 px-10 py-2 rounded-lg transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleProcess}
                            disabled={uploading}
                            className="flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#6B55E8] hover:bg-[#5a45d4] px-5 py-2 rounded-lg transition-all disabled:opacity-60"
                        >
                            {uploading
                                ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                                : <><Upload size={13} /> Upload & Process</>
                            }
                        </button>
                    </div>
                </div>

                {/* ── Right: Info cards ── */}
                <div className="flex flex-col gap-3 lg:w-[320px] xl:w-[360px] flex-shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={16} className="text-blue-600" />
                            </div>
                            <span className="text-[14px] font-semibold text-gray-800">Processing Info</span>
                        </div>
                        <p className="text-[13px] text-gray-600 leading-relaxed">
                            This upload will trigger a <strong className="text-gray-800">batch process</strong> and queue the uploaded data for processing. Large files may take a few minutes.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <p className="text-[13px] font-semibold text-gray-700 mb-2.5">Expected CSV File Name Format</p>
                        <div className="flex flex-col gap-1">
                            {["policy_number.csv", "report.csv", "agent_report_2024-08-01.csv", "premium_amount.csv"].map((f) => (
                                <div key={f} className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B55E8] flex-shrink-0" />
                                    <p className="text-[12px] text-gray-600 font-medium">{f}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UploadFile;