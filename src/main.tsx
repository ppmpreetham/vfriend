import { render } from "preact";
import "./index.css";
import App from "./app.tsx";
import About from "./about/page.tsx";
import Tutorial from "./tutorial/page.tsx";
import Privacy from "./privacy/page.tsx";

import { HashRouter as Router, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./lib/utils.ts";

const paths = [
  { path: "/", component: App },
  { path: "/about", component: About },
  { path: "/tutorial", component: Tutorial },
  { path: "/privacy", component: Privacy },
] as const;

const Main = () => (
  <Router>
    {" "}
    <ScrollToTop />
    <Routes>
      {paths.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
  </Router>
);

render(<Main />, document.getElementById("app")!);
