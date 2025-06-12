import { Calendar, User, Users, Home } from "lucide-react";
const Footer = () => {
  return (
    <div className="flex p-6 justify-between items-center">
      <Home color="white" />
      <Calendar color="white" />
      <Users color="white" />
      <User color="white" />
    </div>
  );
};

export default Footer;
