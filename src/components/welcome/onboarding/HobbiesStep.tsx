import { useState } from "react";
import { Heart, Plus, X } from "lucide-react";
import type { FormData } from "../OnboardingForm";

interface HobbiesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const HobbiesStep = ({ formData, updateFormData }: HobbiesStepProps) => {
  const [inputValue, setInputValue] = useState("");

  const addHobby = () => {
    const trimmed = inputValue.trim();
    if (
      trimmed &&
      formData.hobbies.length < 4 &&
      !formData.hobbies.includes(trimmed)
    ) {
      updateFormData({ hobbies: [...formData.hobbies, trimmed] });
      setInputValue("");
    }
  };

  const removeHobby = (index: number) => {
    const newHobbies = formData.hobbies.filter((_, i) => i !== index);
    updateFormData({ hobbies: newHobbies });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addHobby();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <Heart size={32} className="text-black" />
      </div>

      {/* Current hobbies */}
      {formData.hobbies.length > 0 && (
        <div className="w-full max-w-sm space-y-3">
          {formData.hobbies.map((hobby, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-white/10 rounded-xl p-3"
            >
              <span className="flex-1 text-white">{hobby}</span>
              <button
                onClick={() => removeHobby(index)}
                className="p-1 text-gray-400 hover:text-primary"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add hobby input */}
      {formData.hobbies.length < 4 && (
        <div className="w-full max-w-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hostel, Gazebo, etc..."
              className="flex-1 px-4 py-3 text-lg border-none rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none"
              maxLength={30}
              autoFocus={formData.hobbies.length === 0}
            />
            <button
              onClick={addHobby}
              disabled={!inputValue.trim()}
              className={`px-4 py-3 rounded-xl transition-all ${
                inputValue.trim()
                  ? "bg-primary hover:bg-white text-black"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      )}

      <p className="text-gray-300 text-center px-4">
        Add up to 4 places you will be when you are free
        <br />
        <span className="text-sm opacity-75">
          ({formData.hobbies.length}/4 added)
        </span>
      </p>
    </div>
  );
};

export default HobbiesStep;
