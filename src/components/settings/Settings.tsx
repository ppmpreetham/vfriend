import useNavStore from "../../store/useNavStore";

const Settings = () => {
  const { activeTab } = useNavStore();

  if (activeTab !== "settings") return null;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Settings</h2>

      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">Account</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white">
              Profile Settings
            </button>
            <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white">
              Notification Preferences
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">App Settings</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white">
              Theme
            </button>
            <button className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white">
              Language
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
