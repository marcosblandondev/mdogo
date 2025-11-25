import React from 'react';
import { FormData } from '../App';
import { TextInput } from './ui/TextInput';
import { Button } from './ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Step1Props {
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step1({ formData, updateFormData, onNext, onBack }: Step1Props) {
  const { t } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-amber-900">{t('step1.title')}</h2>
          <p className="text-gray-600">
            {t('step1.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label={t('step1.countryLabel')}
            value={formData.country_of_birth}
            onChange={(value) => updateFormData({ country_of_birth: value })}
            placeholder={t('step1.countryPlaceholder')}
            required
            helperText={t('step1.countryHelper')}
          />

          <TextInput
            label={t('step1.regionLabel')}
            value={formData.americas_region}
            onChange={(value) => updateFormData({ americas_region: value })}
            placeholder={t('step1.regionPlaceholder')}
            helperText={t('step1.regionHelper')}
          />

          <TextInput
            label={t('step1.colonyLabel')}
            value={formData.colony_guess}
            onChange={(value) => updateFormData({ colony_guess: value })}
            placeholder={t('step1.colonyPlaceholder')}
            helperText={t('step1.colonyHelper')}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onBack} variant="ghost">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {t('common.continue')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}