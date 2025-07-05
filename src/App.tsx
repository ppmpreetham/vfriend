import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/home/Home";
import Calendar from "./components/calendar/Calendar";
import Friends from "./components/friends/Friends";
import Profile from "./components/profile/Profile";
import useNavStore from "./store/useNavStore";
import WelcomePage from "./components/welcome/welcomePage";
import Settings from "./components/settings/Settings";

const App = () => {
  const { activeTab } = useNavStore();
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "calendar":
        return <Calendar />;
      case "friends":
        return <Friends />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <WelcomePage>
      <div className="w-screen h-screen flex flex-col justify-between bg-gray-950 text-white font-space">
        <Header />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
        <Footer />
      </div>
    </WelcomePage>
  );
};

export default App;
