import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import { ClerkProvider } from "@clerk/react";
import { CartProvider } from "./contexts/CartContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <CartProvider>
        <App />
      </CartProvider>
    </ClerkProvider>
  </StrictMode>,
);
