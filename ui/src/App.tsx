import React, { useState } from 'react';
import { Landing } from './components/Landing';
import { Step1 } from './components/Step1';
import { Step2 } from './components/Step2';
import { Step3 } from './components/Step3';
import { Review } from './components/Review';
import { Results } from './components/Results';
import { Stepper } from './components/Stepper';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';

export interface AncestorData {
  relation: string;
  country: string;
  region: string;
  city: string;
  notes: string;
}

export interface FormData {
  country: string;
  region: string;
  city: string;
  ancestors: AncestorData[];
  cultural_tags: string[];
}

export type UpdateFormData = (updates: Partial<FormData> | ((prev: FormData) => Partial<FormData>)) => void;

export interface ResultData {
  region_id: string;
  probability: number;
  explanation: string;
}

export interface ApiResponse {
  results: ResultData[];
  narrative: string;
}

type Page = 'landing' | 'step1' | 'step2' | 'step3' | 'review' | 'results';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [formData, setFormData] = useState<FormData>({
    country: '',
    region: '',
    city: '',
    ancestors: [],
    cultural_tags: [],
  });
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData: UpdateFormData = (updates) => {
    setFormData(prev => {
      const computed = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...computed };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare the API request body
      const requestBody = {
        country: formData.country,
        region: formData.region || null,
        city: formData.city || null,
        ancestors: formData.ancestors.map(ancestor => ({
          relation: ancestor.relation,
          country: ancestor.country,
          region: ancestor.region || null,
          city: ancestor.city || null,
          notes: ancestor.notes || null,
        })),
        cultural_tags: formData.cultural_tags,
      };

      console.log('Submitting form data:', requestBody);

      // Replace with your actual API endpoint
      const API_ENDPOINT = 'http://127.0.0.1:8000/estimate-origins';
      
      // Mock response for demonstration
      // In production, uncomment the fetch call below
      // const mockResponse: ApiResponse = {
      //   results: [
      //     {
      //       region_id: 'West Africa - Yoruba',
      //       probability: 0.45,
      //       explanation: 'Strong cultural markers and historical migration patterns from Yoruba regions align with your family history.'
      //     },
      //     {
      //       region_id: 'West Central Africa - Kongo',
      //       probability: 0.28,
      //       explanation: 'Geographic and cultural indicators suggest significant connections to Kongo peoples.'
      //     },
      //     {
      //       region_id: 'West Africa - Akan',
      //       probability: 0.15,
      //       explanation: 'Some cultural practices and regional patterns indicate Akan ancestry.'
      //     },
      //     {
      //       region_id: 'Senegambia',
      //       probability: 0.12,
      //       explanation: 'Historical records and family locations show possible connections to Senegambia region.'
      //     }
      //   ],
      //   narrative: `Based on your family history in ${formData.country} and the cultural markers you've shared, our analysis suggests your ancestors most likely originated from West African regions, particularly areas associated with Yoruba peoples (45% probability). The combination of your family's settlement patterns, cultural practices, and historical migration routes from these regions during the transatlantic period strongly support this estimate. West Central African connections, particularly to Kongo peoples, also appear significant (28% probability). Please note this is a probabilistic estimate based on historical data, not genetic testing.`
      // };

      // // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 2000));
      // setResults(mockResponse);

      
      // Actual API call - uncomment for production:
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to estimate origins. Please try again.');
      }

      const data: ApiResponse = await response.json();
      setResults(data);
      

      setCurrentPage('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    console.log('Resetting form to initial state');
    setFormData({
      country: '',
      region: '',
      city: '',
      ancestors: [],
      cultural_tags: [],
    });
    setResults(null);
    setError(null);
    setCurrentPage('landing');
  };

  const goToStep = (page: Page) => {
    setCurrentPage(page);
    setError(null);
  };

  const stepNumber = {
    landing: 0,
    step1: 1,
    step2: 2,
    step3: 3,
    review: 4,
    results: 5,
  }[currentPage];

  const showStepper = currentPage !== 'landing' && currentPage !== 'results';

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {showStepper && (
          <div className="bg-white border-b border-amber-200">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {/* Language Selector and Stepper - stacked layout */}
              <div className="flex justify-end mb-4">
                <LanguageSelector />
              </div>
              <Stepper currentStep={stepNumber} totalSteps={4} />
            </div>
          </div>
        )}

        {/* Language Selector for landing and results pages */}
        {!showStepper && (
          <div className="absolute top-4 right-4 z-10">
            <LanguageSelector />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {currentPage === 'landing' && (
            <Landing onStart={() => goToStep('step1')} />
          )}

          {currentPage === 'step1' && (
            <Step1
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => goToStep('step2')}
              onBack={() => goToStep('landing')}
            />
          )}

          {currentPage === 'step2' && (
            <Step2
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => goToStep('step3')}
              onBack={() => goToStep('step1')}
            />
          )}

          {currentPage === 'step3' && (
            <Step3
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => goToStep('review')}
              onBack={() => goToStep('step2')}
            />
          )}

          {currentPage === 'review' && (
            <Review
              formData={formData}
              onEdit={(step) => goToStep(step as Page)}
              onSubmit={handleSubmit}
              onBack={() => goToStep('step3')}
              loading={loading}
            />
          )}

          {currentPage === 'results' && results && (
            <Results
              results={results}
              onReset={resetForm}
            />
          )}
        </div>
      </div>
    </LanguageProvider>
  );
}
