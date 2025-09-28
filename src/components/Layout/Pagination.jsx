// Vo Lam Thuy Vi
import React from "react";
import catBrown from "@/assets/cat_brown.png"; // nhớ import ảnh mèo nâu

const Pagination = ({ page, totalPages, onPageChange }) => {
    const getPages = () => {
        const pages = [];
        const maxVisible = 5;

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
        <div className="flex justify-center items-center space-x-3 py-6">
            <div className="flex relative justify-center items-center">

                <button
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="w-14 h-14 bg-no-repeat bg-center bg-contain disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-110 transition"
                    style={{ backgroundImage: `url(${catBrown})` }}
                    title="Prev"
                />
                <p className="absolute inset-0 flex justify-center items-center 
                     text-white font-bold text-xs pointer-events-none">Pre</p>
            </div>


            {/* Page numbers */}
            {getPages().map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-14 h-14 bg-no-repeat bg-center bg-contain transform transition ${p === page ? "scale-125" : "hover:scale-110"
                        }`}
                    style={{ backgroundImage: `url(${catBrown})` }}
                >
                    <span className="sr-only">{p}</span>
                    <span className="relative -top-1 text-xs font-bold text-white drop-shadow">
                        {p}
                    </span>
                </button>
            ))}

            {/* Next button */}
            <div className="flex relative justify-center items-center">
                <button
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="w-14 h-14 bg-no-repeat bg-center bg-contain disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-110 transition"
                    style={{ backgroundImage: `url(${catBrown})` }}
                    title="Next"
                />
                <p className="absolute inset-0 flex justify-center items-center 
                     text-white font-bold text-xs pointer-events-none">Next</p>
            </div>

        </div>
    );
};

export default Pagination;
