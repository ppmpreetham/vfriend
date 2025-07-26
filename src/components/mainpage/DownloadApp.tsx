import v from "/svg/letter v.svg";
import f from "/svg/letter f.svg";

const Footer = () => {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      <img src={v} alt="Letter V" className="w-full h-auto object-contain" />
      <img src={f} alt="Letter F" className="w-full h-auto object-contain" />
    </div>
  );
};

export default Footer;
