import { render } from "preact";
import "./index.css";
import App from "./app.tsx";
import About from "./about/page.tsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const paths = [
  { path: "/", component: App },
  { path: "/about", component: About },
] as const;

const Main = () => (
  <Router>
    <Routes>
      {paths.map(({ path, component: Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
  </Router>
);
render(<Main />, document.getElementById("app")!);
