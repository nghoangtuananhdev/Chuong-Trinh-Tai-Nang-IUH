import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

const root = createRoot(document.getElementById("root"));

// Gallery thành phần: chỉ ở chế độ dev và khi URL có ?gallery (không đi vào bản build).
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("gallery")) {
  import("./dev/Gallery.jsx").then(({ default: Gallery }) => root.render(<StrictMode><Gallery /></StrictMode>));
} else {
  root.render(<StrictMode><App roleKey={document.body.dataset.role || "public"} /></StrictMode>);
}
