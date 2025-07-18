import MagneticButton from "@/components/MagneticButton";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full font-space bg-black text-white flex items-center justify-center p-4 py-12 overflow-x-hidden">
      <div className="flex flex-col md:flex-row items-center max-w-5xl gap-8 md:gap-12 w-full">
        {/* Text content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 md:gap-6 md:w-1/2">
          <h1 className="text-3xl md:text-5xl font-bold text-primary">
            VFriend
          </h1>

          <p className="text-lg md:text-xl max-w-2xl">
            Your personal VIT companion app that helps you navigate campus life,
            access resources, and stay connected with everything at VIT
          </p>

          <a href="https://github.com/ppmpreetham/vfriend/releases/download/v0.5.3/app-universal-release.apk">
            <MagneticButton className="bg-primary text-black py-2.5 md:py-3 px-5 md:px-6 rounded-xl text-base md:text-lg font-medium mt-2">
              Download VFriend
            </MagneticButton>
          </a>
        </div>

        {/* Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end mt-6 md:mt-0">
          <Image
            src={"nextjs-github-pages/home.png"}
            alt="VIT Friend App"
            width={500}
            height={400}
            className="w-4/5 md:w-auto h-full md:max-h-none object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
