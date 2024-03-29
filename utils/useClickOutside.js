import React, { useEffect } from "react";

export const useClickOutside = (ref, cb) => {
    const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            cb();
        }
    };
    useEffect(() => {
        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    });
};