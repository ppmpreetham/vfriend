import { User } from "lucide-react";
import type { FormData } from "../OnboardingForm";

interface NameStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}

const NameStep = ({ formData, updateFormData }: NameStepProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <User size={32} className="text-black" />
      </div>

      <div className="w-full max-w-sm">
        <input
          type="text"
          value={formData.username}
          onChange={(e) => updateFormData({ username: e.target.value })}
          placeholder="Enter your name"
          className="w-full px-4 py-4 text-lg text-center border-none rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          maxLength={50}
          autoFocus
        />
      </div>

      <p className="text-gray-300 text-center px-4">
        This will be how your friends recognize you
      </p>
    </div>
  );
};

export default NameStep;
