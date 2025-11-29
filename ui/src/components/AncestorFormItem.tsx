import React from 'react';
import { AncestorData } from '../App';
import { Dropdown } from './ui/Dropdown';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LocationSelector } from './LocationSelector';

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

      <LocationSelector
        countryLabel={t('step2.countryLabel')}
        regionLabel={t('step2.regionLabel')}
        cityLabel={t('step2.cityLabel')}
        countryValue={ancestor.country}
        regionValue={ancestor.region}
        cityValue={ancestor.city}
        onCountryChange={(value) => onChange({ ...ancestor, country: value, region: '', city: '' })}
        onRegionChange={(value) => onChange({ ...ancestor, region: value, city: '' })}
        onCityChange={(value) => onChange({ ...ancestor, city: value })}
        countryPlaceholder={t('step2.countryPlaceholder')}
        regionPlaceholder={t('step2.regionPlaceholder')}
        cityPlaceholder={t('step2.cityPlaceholder')}
        countryRequired
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
