import { Calendar } from "lucide-react";
import { useState } from "react";
import type { FormData } from "../OnboardingForm";

interface SemesterStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const SemesterStep = ({ formData, updateFormData }: SemesterStepProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers between 1-10
    if (!value || (parseInt(value) >= 1 && parseInt(value) <= 10)) {
      updateFormData({ semester: value ? parseInt(value) : undefined });
      setError(null);
    } else {
      setError("Please enter a semester between 1 and 10");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <Calendar size={32} className="text-black" />
      </div>

      <div className="w-full max-w-sm">
        <input
          type="number"
          min={1}
          max={10}
          value={formData.semester || ""}
          onChange={handleChange}
          placeholder="Enter your semester (1-10)"
          className="w-full px-4 py-4 text-lg text-center border-none rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
      </div>

      <p className="text-gray-300 text-center px-4">
        Which semester are you currently in?
        <br />
        <span className="text-sm text-gray-400">
          This helps you find friends in the same semester
        </span>
      </p>
    </div>
  );
};

export default SemesterStep;