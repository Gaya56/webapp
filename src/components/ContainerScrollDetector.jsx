import React, { useEffect, useRef } from "react";

function ContainerScrollDetector({ onScrollUp, children }) {
  const divRef = useRef(null);

  useEffect(() => {
    const container = divRef.current;
    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;

      // Check if scrolling up
      if (currentScrollTop < lastScrollTop) {
        onScrollUp(currentScrollTop);
      }

      lastScrollTop = currentScrollTop;
    };

    // Add event listener to the container
    container.addEventListener("scroll", handleScroll, { passive: true });

    // Clean up
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [onScrollUp]);

  return (
    <div
      ref={divRef}
      className="h-full border-[1.5px] border-zinc-200 dark:border-zinc-900 rounded-lg overflow-auto"
    >
      {children}
    </div>
  );
}

export default ContainerScrollDetector;
