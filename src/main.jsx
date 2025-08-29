import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import TagManager from "react-gtm-module";
import { PostHogProvider } from "posthog-js/react";
import ReactPixel from "react-facebook-pixel";

import router from "./lib/router";

import "./assets/css/app.css";
import "highlight.js/scss/github.scss";
import "highlight.js/scss/github-dark.scss";

// this line is just for the speech synthesis to load the voices
if (typeof speechSynthesis !== "undefined") speechSynthesis?.getVoices();

// Initialize GTM with the correct container ID
TagManager.initialize({ gtmId: "GTM-WCMQJQ4V" });

ReactPixel.init(
  "1237847590811521", // Combochat AI Meta Pixel ID
  {},
  {
    autoConfig: true,
    debug: false,
  }
);

if (window.location.pathname == "/") ReactPixel.pageView();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <PostHogProvider
    apiKey={import.meta.env.VITE_POSTHOG_KEY}
    options={{
      api_host: import.meta.env.VITE_POSTHOG_HOST,
    }}
  >
    <RouterProvider router={router} />
  </PostHogProvider>
);
