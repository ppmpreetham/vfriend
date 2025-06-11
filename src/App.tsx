import Header from "./components/Header";
import "./App.css";
import Footer from "./components/Footer";
const App = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <Header />
      <Footer />
    </div>
  );
};

export default App;
