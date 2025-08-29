import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics as DubAnalytics } from "@dub/analytics/react";

import AppLayout from "./AppLayout";

function Layout() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppLayout />

      <DubAnalytics />
    </GoogleOAuthProvider>
  );
}

export default Layout;
