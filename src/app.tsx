import MagneticButton from "./components/MagneticButton";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen w-full font-space bg-black text-white flex flex-col items-center justify-center p-4 overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col md:flex-row items-center max-w-5xl gap-8 md:gap-12 w-full justify-center">
        <div className="flex flex-col items-center text-center gap-4 md:gap-6 md:w-1/2">
          <h1 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">
            <span className="font-against">VF</span>
            riend
          </h1>

          <p className="text-lg md:text-xl">
            Your personal VIT companion app that helps you navigate campus life,
            access resources, and stay connected with everything at VIT
          </p>

          <a
            href="https://github.com/ppmpreetham/vfriend/releases/download/v0.5.3/app-universal-release.apk"
            className="cursor-pointer"
          >
            <MagneticButton className="bg-primary text-black py-2.5 md:py-3 px-5 md:px-6 rounded-xl text-base md:text-lg font-medium mt-2">
              Download VFriend
            </MagneticButton>
          </a>
        </div>
      </div>
    </div>
  );
}
