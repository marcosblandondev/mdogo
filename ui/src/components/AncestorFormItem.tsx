import React from 'react';
import { AncestorData } from '../App';
import { TextInput } from './ui/TextInput';
import { Dropdown } from './ui/Dropdown';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AncestorFormItemProps {
  ancestor: AncestorData;
  onChange: (ancestor: AncestorData) => void;
  onRemove: () => void;
  index: number;
  canRemove: boolean;
}

export function AncestorFormItem({
  ancestor,
  onChange,
  onRemove,
  index,
  canRemove,
}: AncestorFormItemProps) {
  const { t } = useLanguage();
  
  const relationOptions = [
    { value: 'parent', label: t('step2.relations.parent') },
    { value: 'grandparent', label: t('step2.relations.grandparent') },
    { value: 'great-grandparent', label: t('step2.relations.greatGrandparent') },
    { value: 'great-great-grandparent', label: t('step2.relations.greatGreatGrandparent') },
  ];

  return (
    <div className="bg-amber-50 rounded-xl p-6 space-y-4 relative border border-amber-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-amber-900">{t('step2.ancestorTitle')} {index + 1}</h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Remove ancestor"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <Dropdown
        label={t('step2.relationLabel')}
        value={ancestor.relation}
        onChange={(value) => onChange({ ...ancestor, relation: value })}
        options={relationOptions}
        placeholder={t('step2.relationPlaceholder')}
        required
      />

      <TextInput
        label={t('step2.countryLabel')}
        value={ancestor.country}
        onChange={(value) => onChange({ ...ancestor, country: value })}
        placeholder={t('step2.countryPlaceholder')}
        required
      />

      <TextInput
        label={t('step2.regionLabel')}
        value={ancestor.region}
        onChange={(value) => onChange({ ...ancestor, region: value })}
        placeholder={t('step2.regionPlaceholder')}
      />

      <TextInput
        label={t('step2.cityLabel')}
        value={ancestor.city}
        onChange={(value) => onChange({ ...ancestor, city: value })}
        placeholder={t('step2.cityPlaceholder')}
      />

      <div className="space-y-1.5">
        <label className="block text-gray-700">
          {t('step2.notesLabel')}
        </label>
        <textarea
          value={ancestor.notes}
          onChange={(e) => onChange({ ...ancestor, notes: e.target.value })}
          placeholder={t('step2.notesPlaceholder')}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
        />
      </div>
    </div>
  );
}