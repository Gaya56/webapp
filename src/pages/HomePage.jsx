import React, { useEffect } from "react";

function HomePage() {
  useEffect(() => {
    window.location.href = "https://home.combochat.ai";
  }, []);

  return <div></div>;
}

export default HomePage;
