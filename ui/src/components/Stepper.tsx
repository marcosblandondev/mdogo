import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
  const { t } = useLanguage();
  
  const steps = [
    { number: 1, label: t('stepper.step1') },
    { number: 2, label: t('stepper.step2') },
    { number: 3, label: t('stepper.step3') },
    { number: 4, label: t('stepper.step4') },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentStep > step.number
                  ? 'bg-amber-600 text-white'
                  : currentStep === step.number
                  ? 'bg-amber-600 text-white ring-4 ring-amber-200'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{step.number}</span>
              )}
            </div>
            <span
              className={`mt-2 text-sm ${
                currentStep >= step.number ? 'text-amber-900' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 mb-6">
              <div
                className={`h-full rounded transition-all ${
                  currentStep > step.number ? 'bg-amber-600' : 'bg-gray-200'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}