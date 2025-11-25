import React from 'react';
import { ResultData } from '../App';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RegionCardProps {
  result: ResultData;
  rank: number;
}

export function RegionCard({ result, rank }: RegionCardProps) {
  const { t } = useLanguage();
  const probabilityPercent = (result.probability * 100).toFixed(1);
  
  // Color intensity based on probability
  const getColorIntensity = (probability: number) => {
    if (probability >= 0.3) return 'bg-amber-100 border-amber-300';
    if (probability >= 0.2) return 'bg-orange-50 border-orange-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className={`rounded-xl p-6 border-2 ${getColorIntensity(result.probability)} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center">
            {rank}
          </div>
          <h3 className="text-amber-900">{result.region_id}</h3>
        </div>
        <div className="text-right">
          <div className="text-amber-900">{probabilityPercent}%</div>
          <div className="text-gray-500">{t('results.probability')}</div>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${probabilityPercent}%` }}
          />
        </div>
      </div>
      
      <p className="text-gray-700 flex gap-2">
        <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <span>{result.explanation}</span>
      </p>
    </div>
  );
}