import { useState } from "react";
import { Heart, Plus, X } from "lucide-react";
import type { FormData } from "../OnboardingForm";

interface HobbiesStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  goToNextStep?: () => void;
}

const HobbiesStep = ({
  formData,
  updateFormData,
  goToNextStep,
}: HobbiesStepProps) => {
  const [inputValue, setInputValue] = useState("");

  // common places
  const commonPlaces = [
    "North Square",
    "Library",
    "Gazebo",
    "GymKhana",
    "Aavins",
    "Clock Court",
    "Hostel",
    "Gym",
    "Sports",
  ];

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

  const addCommonPlace = (place: string) => {
    if (formData.hobbies.length < 4 && !formData.hobbies.includes(place)) {
      updateFormData({ hobbies: [...formData.hobbies, place] });
    }
  };

  const removeHobby = (index: number) => {
    const newHobbies = formData.hobbies.filter((_, i) => i !== index);
    updateFormData({ hobbies: newHobbies });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHobby();
    } else if (
      e.key === "Enter" &&
      formData.hobbies.length > 0 &&
      !inputValue.trim()
    ) {
      // If input is empty and we have hobbies selected, try to go to next step
      goToNextStep?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <Heart size={32} className="text-black" />
      </div>

      {/* Current hobbies */}
      {formData.hobbies.length > 0 && (
        <div className="w-full max-w-sm">
          <div className="flex flex-wrap gap-2">
            {formData.hobbies.map((hobby, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-primary rounded-full px-3 py-1 text-sm text-black"
              >
                <span>{hobby}</span>
                <button
                  onClick={() => removeHobby(index)}
                  className="hover:bg-black/10 rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common places chips */}
      <div className="w-full max-w-sm">
        <div className="text-gray-300 text-sm mb-2">Common places:</div>
        <div className="flex flex-wrap gap-2">
          {commonPlaces.map((place) => {
            const isSelected = formData.hobbies.includes(place);

            return (
              <button
                key={place}
                onClick={() =>
                  isSelected
                    ? removeHobby(formData.hobbies.indexOf(place))
                    : addCommonPlace(place)
                }
                disabled={!isSelected && formData.hobbies.length >= 4}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  isSelected
                    ? "bg-primary text-black"
                    : formData.hobbies.length >= 4
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {place}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add custom hobby input */}
      {formData.hobbies.length < 4 && (
        <div className="w-full max-w-sm">
          <div className="text-gray-300 text-sm mb-2">Or add your own:</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter custom place..."
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
