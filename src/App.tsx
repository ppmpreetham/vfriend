import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/home/home";
import Calendar from "./components/calendar/calendar";
import Friends from "./components/friends/Friends";
import Profile from "./components/profile/Profile";
import useNavStore from "./store/useNavStore";

const App = () => {
  const { activeTab } = useNavStore();
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "calendar":
        return <Calendar />;
      case "users":
        return <Friends />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-between bg-gray-950 text-white">
      <Header />
      <main className="flex-1 overflow-hidden">{renderContent()}</main>
      <Footer />
    </div>
  );
};

export default App;
