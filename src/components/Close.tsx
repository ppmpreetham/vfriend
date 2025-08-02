import { type FunctionalComponent } from "preact";

interface CloseProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

const Close: FunctionalComponent<CloseProps> = ({ isOpen, toggleOpen }) => {
  const spanStyles = [
    { base: "top-0 left-0", open: "rotate-45 top-[7px] left-[5px]" },
    {
      base: "top-0 left-1/2",
      open: "-rotate-45 top-[7px] left-[calc(50%-5px)]",
    },
    { base: "top-[18px] left-0 opacity-100", open: "opacity-0 -left-1/2" },
    { base: "top-[18px] left-1/2 opacity-100", open: "opacity-0 left-full" },
    { base: "top-[36px] left-0", open: "-rotate-45 top-[29px] left-[5px]" },
    {
      base: "top-[36px] left-1/2",
      open: "rotate-45 top-[29px] left-[calc(50%-5px)]",
    },
  ];

  return (
    <div
      onClick={toggleOpen}
      className="relative cursor-pointer w-[60px] h-[45px] scale-[0.6]"
      role="button"
      aria-label="Toggle menu"
      tabIndex={0}
    >
      {spanStyles.map(({ base, open }, i) => (
        <span
          key={i}
          className={`hamburger-bar block absolute bg-white transition-all duration-[250ms] ease-in-out rounded-${
            i % 2 ? "r" : "l"
          }-[4.5px] ${isOpen ? open : base} h-[9px] w-[30px]`}
        />
      ))}
    </div>
  );
};

export default Close;
