import Header from "./components/Header";
import "./App.css";
import Footer from "./components/Footer";
import FriendCard from "./components/friendCard";
const App = () => {
  return (
    <div className="w-screen h-screen flex flex-col justify-between bg-gray-950 text-white">
      <Header />
      <div className="h-full w-full">
        <FriendCard available={false} name="Preetham" location="AB-1" />
        <FriendCard
          available={false}
          name="Sreeyansh"
          location="AB-1"
          distance="3"
        />
      </div>

      <Footer />
    </div>
  );
};

export default App;
