import { Menu } from "lucide-react";

const Header = () => {
  return (
    <div className="flex items-center justify-between p-4">
      <div>VFriend</div>
      <div>
        <Menu color="black" className="cursor-pointer" />
      </div>
    </div>
  );
};

export default Header;
