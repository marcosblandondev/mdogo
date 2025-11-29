import React from 'react';
import { FormData, AncestorData, UpdateFormData } from '../App';
import { AncestorFormItem } from './AncestorFormItem';
import { Button } from './ui/Button';
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Step2Props {
  formData: FormData;
  updateFormData: UpdateFormData;
  onNext: () => void;
  onBack: () => void;
}

export function Step2({ formData, updateFormData, onNext, onBack }: Step2Props) {
  const { t } = useLanguage();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const addAncestor = () => {
    const newAncestor: AncestorData = {
      relation: '',
      country: '',
      region: '',
      city: '',
      notes: '',
    };
    updateFormData((prev) => ({
      ancestors: [...prev.ancestors, newAncestor],
    }));
  };

  const removeAncestor = (index: number) => {
    updateFormData((prev) => ({
      ancestors: prev.ancestors.filter((_, i) => i !== index),
    }));
  };

  const updateAncestor = (index: number, ancestor: AncestorData) => {
    console.log('Updating ancestor at index', index, ancestor);
    updateFormData((prev) => {
      const updatedAncestors = [...prev.ancestors];
      updatedAncestors[index] = ancestor;
      return { ancestors: updatedAncestors };
    });
  };

  // Ensure at least one ancestor form
  React.useEffect(() => {
    if (formData.ancestors.length === 0) {
      addAncestor();
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-amber-900">{t('step2.title')}</h2>
          <p className="text-gray-600">
            {t('step2.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {formData.ancestors.map((ancestor, index) => (
              <AncestorFormItem
                key={index}
                ancestor={ancestor}
                onChange={(updated) => updateAncestor(index, updated)}
                onRemove={() => removeAncestor(index)}
                index={index}
                canRemove={formData.ancestors.length > 1}
              />
            ))}
          </div>

          <Button
            type="button"
            onClick={addAncestor}
            variant="outline"
            fullWidth
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('step2.addButton')}
          </Button>

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
