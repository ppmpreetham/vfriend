import { Menu } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="text-3xl">VFriend</div>
      <div>
        <Menu color="white" className="cursor-pointer" />
      </div>
    </div>
  );
};

export default Header;
