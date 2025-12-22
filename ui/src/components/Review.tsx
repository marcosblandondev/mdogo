import React from 'react';
import { FormData } from '../App';
import { Button } from './ui/Button';
import { ArrowLeft, Edit2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ReviewProps {
  formData: FormData;
  onEdit: (step: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export function Review({ formData, onEdit, onSubmit, onBack, loading }: ReviewProps) {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <div className="space-y-2">
          <h2 className="text-amber-900">{t('review.title')}</h2>
          <p className="text-gray-600">
            {t('review.description')}
          </p>
        </div>

        {/* Your Birth Information */}
        <div className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-900 mb-3">{t('review.birthInfoTitle')}</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-gray-500">{t('review.countryOfBirth')}</dt>
                  <dd className="text-gray-900">{formData.country || t('review.notProvided')}</dd>
                </div>
                {formData.region && (
                  <div>
                    <dt className="text-gray-500">{t('review.city')}</dt>
                    <dd className="text-gray-900">{formData.region}</dd>
                  </div>
                )}
                {formData.city && (
                  <div>
                    <dt className="text-gray-500">{t('review.colony')}</dt>
                    <dd className="text-gray-900">{formData.city}</dd>
                  </div>
                )}
              </dl>
            </div>
            <Button
              type="button"
              onClick={() => onEdit('step1')}
              variant="ghost"
              size="small"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {t('review.editButton')}
            </Button>
          </div>
        </div>

        {/* Ancestors */}
        <div className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-amber-900 mb-3">{t('review.ancestorsTitle')}</h3>
              {formData.ancestors.length === 0 ? (
                <p className="text-gray-500">{t('review.noAncestors')}</p>
              ) : (
                <div className="space-y-4">
                  {formData.ancestors.map((ancestor, index) => (
                    <div key={index} className="bg-amber-50 rounded-lg p-4">
                      <p className="text-amber-900 mb-2">
                        {t('step2.ancestorTitle')} {index + 1}
                      </p>
                      <dl className="space-y-1 text-sm">
                        <div>
                          <dt className="text-gray-500 inline">{t('review.relation')}: </dt>
                          <dd className="text-gray-900 inline">{ancestor.relation || t('review.notSpecified')}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500 inline">{t('review.country')}: </dt>
                          <dd className="text-gray-900 inline">{ancestor.country || t('review.notSpecified')}</dd>
                        </div>
                        {ancestor.region && (
                          <div>
                            <dt className="text-gray-500 inline">{t('review.region')}: </dt>
                            <dd className="text-gray-900 inline">{ancestor.region}</dd>
                          </div>
                        )}
                        {ancestor.city && (
                          <div>
                            <dt className="text-gray-500 inline">{t('review.city')}: </dt>
                            <dd className="text-gray-900 inline">{ancestor.city}</dd>
                          </div>
                        )}
                        {ancestor.notes && (
                          <div>
                            <dt className="text-gray-500">{t('review.notes')}: </dt>
                            <dd className="text-gray-700">{ancestor.notes}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={() => onEdit('step2')}
              variant="ghost"
              size="small"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {t('review.editButton')}
            </Button>
          </div>
        </div>

        {/* Cultural Markers */}
        <div className="border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-amber-900 mb-3">{t('review.culturalTitle')}</h3>
              {formData.cultural_tags.length === 0 ? (
                <p className="text-gray-500">{t('review.noCultural')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.cultural_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={() => onEdit('step3')}
              variant="ghost"
              size="small"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {t('review.editButton')}
            </Button>
          </div>
        </div>

        {/* Submit */}
        <div className="space-y-4 pt-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
            <p className="text-gray-700">
              {t('review.submitDescription')}
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="button" onClick={onBack} variant="ghost" disabled={loading}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('common.back')}
            </Button>
            <Button
              type="button"
              onClick={onSubmit}
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t('review.calculating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t('review.submitButton')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}