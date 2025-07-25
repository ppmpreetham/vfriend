import React from "react";
import PixelChanger from "../PixelChanger";

const Chat = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center p-4 gap-4">
      <PixelChanger
        firstContent={
          <img
            src="/whatsapp_chat.png"
            alt="Aayush Shukla's Chat bruv lingan guli guli"
          />
        }
        secondContent={
          <img
            src="/whatsapp_chat_2.png"
            alt="Aayush Shukla's Chat bruv lingan guli guli"
          />
        }
        aspectRatio="206%"
        className="cursor-pointer"
        pixelColor="#ebff57"
        gridSize={24}
        animationStepDuration={0.4}
      />
      <div className="text-4xl">Busy Texter he is</div>
    </div>
  );
};

export default Chat;
