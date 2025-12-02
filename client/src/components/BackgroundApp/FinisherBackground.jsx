import { useEffect, useRef } from "react";

export default function FinisherBackground() {
  const hostRef = useRef(null);
  const initedRef = useRef(false);

  useEffect(() => {
    if (initedRef.current) return;  
    initedRef.current = true;

    const init = () => {
      if (!window.FinisherBackground) return;
      new window.FinisherBackground({
        count: 4,
        size: { min: 1000, max: 1200, pulse: 0 },
        speed: { x: { min: 0.1, max: 0.5 }, y: { min: 0.1, max: 0.5 } },
        colors: {
          background: "#FFFFFF",
          particles: ["#A2EFD9", "#83ECD3", '#ffd2e5', "#A2EFD9",],
          // 084c6f
        },
        blending: "overlay",
        opacity: { center: 1, edge: 0 },
        skew: 0,
        shapes: ["c"],
      });
    };

    if (window.FinisherBackground) {
      init();
    } else {

      const s = document.createElement("script");
      s.src = "/finisher-background.es5.min.js";
      s.defer = true;
      s.onload = init;
      document.head.appendChild(s);
    }

  }, []);

  return <div ref={hostRef} className="finisher-background" aria-hidden="true" />;
}
