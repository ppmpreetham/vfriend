import { Calendar, User, Users } from "lucide-react";
const Footer = () => {
  return (
    <div className="flex p-6 justify-between items-center bg-gray-100">
      <Calendar color="black" />
      <Users color="black" />
      <User color="black" />
    </div>
  );
};

export default Footer;
