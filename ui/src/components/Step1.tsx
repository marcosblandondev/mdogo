import React from 'react';
import { FormData, UpdateFormData } from '../App';
import { TextInput } from './ui/TextInput';
import { Button } from './ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LocationSelector } from './LocationSelector';

interface Step1Props {
  formData: FormData;
  updateFormData: UpdateFormData;
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
          <div className="space-y-1.5">
            <p className="text-sm text-gray-600">{t('step1.countryHelper')}</p>
            <LocationSelector
              countryLabel={t('step1.countryLabel')}
              regionLabel={t('step1.regionLabel')}
              cityLabel={t('step1.cityLabel')}
              countryValue={formData.country}
              regionValue={formData.region}
              cityValue={formData.city}
              onCountryChange={(value) => updateFormData({ country: value, region: '', city: '' })}
              onRegionChange={(value) => updateFormData({ region: value, city: '' })}
              onCityChange={(value) => updateFormData({ city: value })}
              countryPlaceholder={t('step1.countryPlaceholder')}
              regionPlaceholder={t('step1.regionPlaceholder')}
              cityPlaceholder={t('step1.colonyPlaceholder')}
              countryRequired
            />
            <p className="text-sm text-gray-600 mt-2">{t('step1.regionHelper')}</p>
          </div>

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
