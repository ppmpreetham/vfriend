import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { initializeUserStore } from "../../store/newtimeTableStore";
import NameStep from "./onboarding/NameStep";
import HobbiesStep from "./onboarding/HobbiesStep";
import TaglineStep from "./onboarding/TaglineStep";
import SemesterStep from "./onboarding/SemesterStep";
import TimetableStep from "./onboarding/TimetableStep";

interface OnboardingFormProps {
  onComplete: () => void;
}

export interface FormData {
  username: string;
  hobbies: string[];
  tagline: string;
  semester?: number;
  timetableUploaded: boolean;
  registrationNumber: string;
  timetableData: any;
}

const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    hobbies: [],
    tagline: "",
    registrationNumber: "",
    timetableUploaded: false,
    timetableData: null,
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Change steps order to name, semester, hobbies, tagline, timetable
  const steps = [
    {
      component: NameStep,
      title: "Enter your name",
      canProceed: () => formData.username.trim().length > 0,
    },
    {
      component: SemesterStep,
      title: "Select your semester",
      canProceed: () =>
        formData.semester !== undefined &&
        formData.semester >= 1 &&
        formData.semester <= 10,
    },
    {
      component: HobbiesStep,
      title: "Where do you spend your free time at?",
      canProceed: () => formData.hobbies.length > 0,
    },
    {
      component: TaglineStep,
      title: "Tell us about yourself",
      canProceed: () => formData.tagline.trim().length > 0,
    },
    {
      component: TimetableStep,
      title: "Upload your timetable",
      canProceed: () => formData.timetableUploaded && formData.timetableData,
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
      console.log("Form data being submitted:", formData);
      setIsInitializing(true);
      setInitError(null);

      // Use initializeUserStore which now sets welcome flag to true
      const result = await initializeUserStore({
        u: formData.username.trim(),
        r: formData.registrationNumber.trim(),
        s: formData.semester || 0,
        h: formData.hobbies,
        q: [formData.tagline.trim()],
        t: new Date().toISOString(),
        o: formData.timetableData,
      });

      if (!result.success) {
        throw new Error(
          result.error ? String(result.error) : "Failed to initialize user"
        );
      }

      // Call onComplete directly instead of using the mutation
      onComplete();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setInitError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsInitializing(false);
    }
  };

  const isLoading = isInitializing;
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
        <div className="w-10" />
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
          goToNextStep={canProceed ? handleNext : undefined}
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
        {initError && (
          <div className="text-red-400 text-center mt-4">{initError}</div>
        )}
      </div>
    </div>
  );
};

export default OnboardingForm;
