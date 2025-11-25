import React from 'react';
import { MapPin, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="inline-block p-3 bg-amber-100 rounded-full mb-4">
          <MapPin className="w-12 h-12 text-amber-700" />
        </div>
        <h1 className="text-amber-900">
          {t('landing.title')}
        </h1>
        <p className="text-gray-700 max-w-2xl mx-auto">
          {t('landing.description')}
        </p>
        <div className="pt-4">
          <Button onClick={onStart} variant="primary" size="large">
            {t('landing.startButton')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 py-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-amber-900 mb-2">{t('landing.features.family.title')}</h3>
          <p className="text-gray-600">
            {t('landing.features.family.description')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-amber-900 mb-2">{t('landing.features.cultural.title')}</h3>
          <p className="text-gray-600">
            {t('landing.features.cultural.description')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-amber-100">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="text-amber-900 mb-2">{t('landing.features.analysis.title')}</h3>
          <p className="text-gray-600">
            {t('landing.features.analysis.description')}
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-white rounded-xl p-6 border-l-4 border-amber-600 shadow-sm">
        <h3 className="text-amber-900 mb-2">{t('landing.notice.title')}</h3>
        <p className="text-gray-700 mb-3">
          {t('landing.notice.description1')}
        </p>
        <p className="text-gray-600">
          {t('landing.notice.description2')}
        </p>
      </div>

      {/* Footer Links */}
      <div className="border-t border-amber-200 pt-8">
        <div className="flex flex-wrap justify-center gap-6 text-gray-600">
          <a href="#about" className="hover:text-amber-700 transition-colors">
            {t('landing.footer.about')}
          </a>
          <a href="#privacy" className="hover:text-amber-700 transition-colors">
            {t('landing.footer.privacy')}
          </a>
          <a href="#methodology" className="hover:text-amber-700 transition-colors">
            {t('landing.footer.methodology')}
          </a>
        </div>
      </div>
    </div>
  );
}