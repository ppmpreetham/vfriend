import { Quote } from "lucide-react";
import { useState, useEffect } from "react";
import type { FormData } from "../OnboardingForm";

interface TaglineStepProps {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onValidationChange?: (isValid: boolean) => void;
  goToNextStep?: () => void;
}

const TaglineStep = ({
  formData,
  updateFormData,
  onValidationChange,
  goToNextStep, // Updated prop name here
}: TaglineStepProps) => {
  const [error, setError] = useState<string | null>(null);

  // Validate whenever tagline changes
  useEffect(() => {
    const isValid = formData.tagline.trim().length > 0;
    setError(isValid ? null : "Please enter a tagline");
    onValidationChange?.(isValid);
  }, [formData.tagline, onValidationChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey && // shift + enter shouldn't trigger next step
      formData.tagline.trim().length > 0
    ) {
      e.preventDefault();
      goToNextStep?.();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
        <Quote size={32} className="text-black" />
      </div>

      <div className="w-full max-w-sm">
        <textarea
          value={formData.tagline}
          onChange={(e) => updateFormData({ tagline: e.target.value })}
          onKeyPress={handleKeyPress}
          placeholder="Write something about yourself..."
          className={`w-full px-4 py-4 text-lg text-center border-none rounded-xl bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:outline-none resize-none h-32 ${
            error && !formData.tagline ? "ring-2 ring-red-500" : ""
          }`}
          maxLength={100}
          autoFocus
          required
        />
        <div className="flex justify-between text-sm mt-2">
          {error && !formData.tagline ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <div className="invisible">Placeholder</div>
          )}
          <div className="text-gray-400">{formData.tagline.length}/100</div>
        </div>
      </div>

      <p className="text-gray-300 text-center px-4">
        Share a fun fact, motto, or anything that describes you
      </p>
    </div>
  );
};

export default TaglineStep;
