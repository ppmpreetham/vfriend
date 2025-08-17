// src/index.tsx
import { type JSX } from "preact";
import { hydrate, prerender as ssr } from "preact-iso";
import "./index.css";

import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./lib/utils.ts";
import App from "./app.tsx";
import About from "./about/page.tsx";
import Tutorial from "./tutorial/page.tsx";
import Privacy from "./privacy/page.tsx";

const routes = [
  { path: "/", component: App },
  { path: "/about", component: About },
  { path: "/tutorial", component: Tutorial },
  { path: "/privacy", component: Privacy },
] as const;

function Main() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {routes.map(({ path, component: Component }) => (
          <Route key={path} path={path} element={<Component />} />
        ))}
      </Routes>
    </Router>
  );
}

export async function prerender(data: JSX.IntrinsicAttributes) {
  return await ssr(<Main {...data} />);
}

if (typeof window !== "undefined") {
  const appElement = document.getElementById("app");
  if (appElement) {
    hydrate(<Main />, appElement);
  }
}
