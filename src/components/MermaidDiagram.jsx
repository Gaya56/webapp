import { useEffect, useRef } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "base",
  securityLevel: "loose",
  themeCSS: `
    text {
      fill: #f8f8f2 !important;
    }`,
});

const MermaidDiagram = ({ chart }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div
      className="mermaid"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: chart }}
    />
  );
};

export default MermaidDiagram;
