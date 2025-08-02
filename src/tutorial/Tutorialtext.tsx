import clsx from "clsx";
import MagneticButton from "../components/MagneticButton";
import { useState } from "react";

import vtoptimetable from "/tutorialimages/vtoptimetable.png";
import choosingsem from "/tutorialimages/choosingsem.png";
import downloadhtml from "/tutorialimages/downloading-html.jpg";
import fillInstructions from "/tutorialimages/fill.jpg";
import uploadtt from "/tutorialimages/upload.jpg";

interface Instruction {
  title: string;
  description: string;
  image: string;
}

const Tutorialtext = ({ isDesktop }: { isDesktop: boolean }) => {
  const [hoveredInstruction, setHoveredInstruction] = useState<number | null>(
    null
  );

  const instructions: Instruction[] = [
    {
      title: "Fill your details",
      description: "Provide the necessary information to set up your account.",
      image: fillInstructions,
    },
    {
      title: "Go to TimeTable portal from VTOP",
      description: "VTOP > Academics > TimeTable",
      image: vtoptimetable,
    },
    {
      title: "Choose your latest semester",
      description:
        "Select the most recent semester for which you want to view the TimeTable.",
      image: choosingsem,
    },
    {
      title: "Download as HTML",
      description:
        "Click on the download button to save the TimeTable as an HTML file.",
      image: downloadhtml,
    },
    {
      title: "Upload the timetable",
      description:
        "Click on the upload button to submit the TimeTable HTML file.",
      image: uploadtt,
    },
  ];

  return (
    <div className="flex flex-col px-8">
      <h1 className="text-6xl">Tutorial</h1>
      <h6 className="text-2xl text-primary/80">How to actually use the app</h6>
      <h4 className="text-2xl mt-4">
        Setting up the app is very easy and will only require a few steps
      </h4>
      <section className="flex flex-col-reverse md:flex-row justify-between mt-4">
        <ol className="w-full flex flex-col text-2xl md:text-4xl list-decimal">
          {instructions.map((instruction, index) => (
            <MagneticButton key={index}>
              <li
                key={index}
                className={clsx(
                  "border border-black bg-primary text-black flex text-start p-4 hover:text-black hover:bg-white",
                  { "bg-white": hoveredInstruction === index }
                )}
                onMouseEnter={() => setHoveredInstruction(index)}
                onTouchStart={() => setHoveredInstruction(index)}
              >
                <h5>{instruction.title}</h5>
              </li>
            </MagneticButton>
          ))}
          {isDesktop && (
            <div
              className="flex-grow border border-black bg-primary"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, black 25%, #ebff57 25%, #ebff57 50%, black 50%, black 75%, #ebff57 75%)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          )}
        </ol>
        <div
          className="w-full md:h-128 md:w-128 flex-shrink-0"
          style={{ aspectRatio: "1 / 1" }}
        >
          <img
            src={
              hoveredInstruction !== null
                ? instructions[hoveredInstruction].image
                : instructions[0].image
            }
            alt={
              hoveredInstruction !== null
                ? instructions[hoveredInstruction].description
                : instructions[0].description
            }
            className="w-full h-full object-contain"
          />
        </div>
      </section>
    </div>
  );
};

export default Tutorialtext;
