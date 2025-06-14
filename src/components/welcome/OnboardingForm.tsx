import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  useInitializeProfile,
  useCompleteOnboarding,
} from "../../hooks/useUserQueries";
import NameStep from "./onboarding/NameStep";
import HobbiesStep from "./onboarding/HobbiesStep";
import TaglineStep from "./onboarding/TaglineStep";
import TimetableStep from "./onboarding/TimetableStep";

interface OnboardingFormProps {
  onComplete: () => void;
}

export interface FormData {
  username: string;
  hobbies: string[];
  tagline: string;
  timetableUploaded: boolean;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    hobbies: [],
    tagline: "",
    timetableUploaded: false,
  });

  const initializeProfileMutation = useInitializeProfile();
  const completeOnboardingMutation = useCompleteOnboarding();

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = [
    {
      component: NameStep,
      title: "What's your name?",
      canProceed: () => formData.username.trim().length > 0,
    },
    {
      component: HobbiesStep,
      title: "What are your hobbies?",
      canProceed: () => formData.hobbies.length > 0,
    },
    {
      component: TaglineStep,
      title: "Tell us about yourself",
      canProceed: () => formData.hobbies.length > 0,
    },
    {
      component: TimetableStep,
      title: "Upload your timetable",
      canProceed: () => formData.timetableUploaded,
    },
  ];

  const currentStepData = steps[currentStep];
  const CurrentStepComponent = currentStepData.component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Initialize profile
      await initializeProfileMutation.mutateAsync({
        username: formData.username.trim(),
        hobbies: formData.hobbies,
        tagline: formData.tagline.trim(),
      });

      // Mark onboarding as complete
      await completeOnboardingMutation.mutateAsync(formData.username.trim());

      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  const isLoading =
    initializeProfileMutation.isPending || completeOnboardingMutation.isPending;
  const canProceed = currentStepData.canProceed();
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950">
      {/* Header with progress */}
      <div className="flex items-center justify-between p-6 pt-12">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`p-2 rounded-full ${
            currentStep === 0
              ? "text-gray-600 cursor-not-allowed"
              : "text-white hover:bg-white/10"
          }`}
        >
          <ChevronLeft size={24} />
        </button>
        <div className="text-white text-center">
          <div className="text-sm opacity-75">
            Step {currentStep + 1} of {steps.length}
          </div>
          <div className="w-32 h-1 bg-white/20 rounded-full mt-2">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Title */}
      <div className="px-6 mb-8">
        <h1 className="text-3xl font-bold text-white text-center">
          {currentStepData.title}
        </h1>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6">
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>

      {/* Navigation */}
      <div className="p-6 pb-8">
        {isLastStep ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed || isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              canProceed && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
              canProceed
                ? "bg-primary hover:bg-white text-black"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continue
            <ChevronRight size={20} />
          </button>
        )}

        {/* Error Messages */}
        {(initializeProfileMutation.isError ||
          completeOnboardingMutation.isError) && (
          <div className="text-red-400 text-center mt-4">
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;
