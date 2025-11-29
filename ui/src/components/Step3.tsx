import React from 'react';
import { FormData, UpdateFormData } from '../App';
import { TagSelector } from './ui/TagSelector';
import { Button } from './ui/Button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Step3Props {
  formData: FormData;
  updateFormData: UpdateFormData;
  onNext: () => void;
  onBack: () => void;
}

const culturalTags = [
  'Yoruba',
  'Kongo',
  'Fon',
  'Akan',
  'Igbo',
  'Mandinka',
  'Wolof',
  'Gullah',
  'Candomblé',
  'Santería',
  'Vodou',
  'Obeah',
  'Capoeira',
  'Samba',
  'Bantu',
  'Ashanti',
  'Ewe',
  'Hausa',
];

export function Step3({ formData, updateFormData, onNext, onBack }: Step3Props) {
  const { t } = useLanguage();
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-amber-900">{t('step3.title')}</h2>
          <p className="text-gray-600">
            {t('step3.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TagSelector
            label={t('step3.culturalLabel')}
            tags={culturalTags}
            selectedTags={formData.cultural_tags}
            onChange={(tags) => updateFormData({ cultural_tags: tags })}
            helperText={t('step3.culturalHelper')}
          />

          <div className="space-y-2">
            <label className="block text-gray-700">
              {t('step3.additionalLabel')}
            </label>
            <p className="text-gray-500">
              {t('step3.additionalDescription')}
            </p>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t('step3.additionalPlaceholder')}
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-gray-700">
              <strong className="text-amber-900">{t('step3.tip')}</strong> {t('step3.tipText')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onBack} variant="ghost">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              {t('common.continueToReview')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
