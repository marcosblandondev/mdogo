import React from 'react';
import { ApiResponse } from '../App';
import { ProbabilityChart } from './ProbabilityChart';
import { RegionCard } from './RegionCard';
import { Button } from './ui/Button';
import { Download, Share2, RotateCcw, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ResultsProps {
  results: ApiResponse;
  onReset: () => void;
}

export function Results({ results, onReset }: ResultsProps) {
  const { t } = useLanguage();
  
  const handleDownload = () => {
    // Placeholder for PDF download functionality
    alert('PDF download functionality would be implemented here');
  };

  const handleShare = () => {
    // Placeholder for share functionality
    alert('Share functionality would be implemented here');
  };

  const sortedResults = [...results.results].sort((a, b) => b.probability - a.probability);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <div className="inline-block p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-2">
          <FileText className="w-12 h-12 text-amber-700" />
        </div>
        <h1 className="text-amber-900">{t('results.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('results.description')}
        </p>
      </div>

      {/* Narrative Explanation */}
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-lg p-8 border-2 border-amber-200">
        <h2 className="text-amber-900 mb-4">{t('results.summaryTitle')}</h2>
        <p className="text-gray-700 leading-relaxed">
          {results.narrative}
        </p>
      </div>

      {/* Chart */}
      <ProbabilityChart results={sortedResults} />

      {/* Region Cards */}
      <div className="space-y-4">
        <h2 className="text-amber-900">{t('results.breakdownTitle')}</h2>
        <div className="grid gap-4">
          {sortedResults.map((result, index) => (
            <RegionCard key={result.region_id} result={result} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-white rounded-xl p-6 border-l-4 border-amber-600">
        <h3 className="text-amber-900 mb-2">{t('results.understandingTitle')}</h3>
        <p className="text-gray-700 mb-2">
          {t('results.understandingText1')}
        </p>
        <p className="text-gray-600">
          {t('results.understandingText2')}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-amber-900 mb-4">{t('results.nextSteps')}</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Button onClick={handleDownload} variant="outline" fullWidth>
            <Download className="w-5 h-5 mr-2" />
            {t('results.downloadButton')}
          </Button>
          <Button onClick={handleShare} variant="outline" fullWidth>
            <Share2 className="w-5 h-5 mr-2" />
            {t('results.shareButton')}
          </Button>
          <Button onClick={onReset} variant="primary" fullWidth>
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('results.newEstimate')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 py-8">
        <p>
          {t('results.footer')}
        </p>
      </div>
    </div>
  );
}