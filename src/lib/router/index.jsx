import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";

import Layout from "@/components/Layout";
import MultiBotChatPanel from "@/pages/MultiBotChatPanel";
import ChatPage from "@/pages/ChatPage";
import SettingsPage from "@/pages/SettingsPage";
import VerifyMagicLink from "@/pages/VerifyMagicLink";
import ImageGeneration from "@/pages/image-generation";
import ImageGenerationHistory from "@/pages/image-generation/History";
import HomePage from "@/pages/HomePage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<MultiBotChatPanel />} />
      <Route path="/chat/:botId" element={<ChatPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/generate-image/:botId" element={<ImageGeneration />} />
      <Route path="/generate-image/:botId/history" element={<ImageGenerationHistory />} />
      <Route path="/auth/verify-magic-link" element={<VerifyMagicLink />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Route>
  )
);

export default router;
