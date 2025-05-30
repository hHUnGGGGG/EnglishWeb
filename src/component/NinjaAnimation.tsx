import React, {useEffect, useRef} from "react";
import "./Ninja.css";

const NinjaAnimation: React.FC<{ onAnimationEnd: () => void }> = ({ onAnimationEnd }) => {
    const trailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            if (trailRef.current) {
                trailRef.current.style.width = "100vw"; // Mở rộng vệt sáng theo ninja
            }
        }, 50);
        setTimeout(onAnimationEnd, 2000); // Ẩn ninja sau 2s
    }, [onAnimationEnd]);

    return (
        <div className="ninja-container">
            <div className="ninja"></div>
            <div ref={trailRef} className="ninja-trail"></div>
        </div>
    );
};


export default NinjaAnimation;

export {};
