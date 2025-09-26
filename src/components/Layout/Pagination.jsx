// Vo Lam Thuy Vi
import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
    const getPages = () => {
        const pages = [];
        const maxVisible = 5; // số trang hiển thị cùng lúc

        let start = Math.max(1, page - 2);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="flex justify-center items-center space-x-2 py-6">
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow 
                  hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev
            </button>

            {getPages().map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-4 py-2 rounded-lg font-bold shadow-md transition 
            ${p === page
                            ? "bg-[#846551] text-white scale-110"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                >
                    {p}
                </button>
            ))}

            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold shadow 
                  hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
