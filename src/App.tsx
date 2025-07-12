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
import { useUserProfile } from "./hooks/useUserProfile";
import { useEffect } from "react";

const App = () => {
  const { activeTab } = useNavStore();
  const { data: userData } = useUserProfile();

  // theme
  useEffect(() => {
    const localStorageTheme = localStorage.getItem("theme");
    const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
    let theme = "light";
    if (localStorageTheme) {
      theme = localStorageTheme;
    } else if (userData?.theme) {
      theme = userData.theme;
      // sync to localStorage
      localStorage.setItem("theme", theme);
    } else if (systemSettingDark.matches) {
      theme = "dark";
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.setAttribute("data-theme", theme);
  }, [userData?.theme, activeTab]);

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
    <div className="bg-background h-fit">
      <WelcomePage>
        <div className="w-screen h-screen flex flex-col justify-between bg-background text-foreground font-space">
          <Header />
          <main className="flex-1 overflow-hidden">{renderContent()}</main>
          <Footer />
        </div>
      </WelcomePage>
    </div>
  );
};

export default App;
