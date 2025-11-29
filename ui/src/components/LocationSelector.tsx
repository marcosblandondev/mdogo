import React, { useState, useEffect } from 'react';
import { Dropdown } from './ui/Dropdown';

interface LocationSelectorProps {
  countryLabel: string;
  regionLabel: string;
  cityLabel: string;
  countryValue: string;
  regionValue: string;
  cityValue: string;
  onCountryChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  onCityChange: (value: string) => void;
  countryPlaceholder?: string;
  regionPlaceholder?: string;
  cityPlaceholder?: string;
  countryRequired?: boolean;
  regionRequired?: boolean;
  cityRequired?: boolean;
}

interface Country {
  id: number;
  name: string;
  iso2: string;
}

interface State {
  id: number;
  name: string;
  state_code: string;
  country_code: string;
}

interface City {
  id: number;
  name: string;
}

interface CountryOption {
  value: string;
  label: string;
  iso2: string;
}

interface StateOption {
  value: string;
  label: string;
  code: string;
}

interface CityOption {
  value: string;
  label: string;
}

const API_BASE = 'https://api.countrystatecity.in/v1';
// Note: This API requires an API key. For demo purposes, we'll use mock data
// Users should get their free API key from https://countrystatecity.in/

export function LocationSelector({
  countryLabel,
  regionLabel,
  cityLabel,
  countryValue,
  regionValue,
  cityValue,
  onCountryChange,
  onRegionChange,
  onCityChange,
  countryPlaceholder = 'Select country',
  regionPlaceholder = 'Select region/state',
  cityPlaceholder = 'Select city/town',
  countryRequired = false,
  regionRequired = false,
  cityRequired = false,
}: LocationSelectorProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Initialize selectedCountryCode when countries are loaded and countryValue exists
  useEffect(() => {
    if (countries.length > 0 && countryValue && !selectedCountryCode) {
      const country = countries.find(c => c.value === countryValue);
      if (country && country.iso2) {
        setSelectedCountryCode(country.iso2);
      }
    }
  }, [countries, countryValue]);

  // Initialize selectedStateCode when states are loaded and regionValue exists
  useEffect(() => {
    if (states.length > 0 && regionValue && !selectedStateCode) {
      const state = states.find(s => s.value === regionValue);
      if (state && state.code) {
        setSelectedStateCode(state.code);
      }
    }
  }, [states, regionValue]);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryCode) {
      fetchStates(selectedCountryCode);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountryCode]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedCountryCode && selectedStateCode) {
      fetchCities(selectedCountryCode, selectedStateCode);
    } else {
      setCities([]);
    }
  }, [selectedStateCode]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      // Using mock data for demonstration
      // In production, use: 
      // const response = await fetch(`${API_BASE}/countries`, {
      //   headers: { 'X-CAPI-KEY': 'YOUR_API_KEY_HERE' }
      // });
      
      const mockCountries = [
        { id: 1, name: 'United States', iso2: 'US' },
        { id: 2, name: 'Brazil', iso2: 'BR' },
        { id: 3, name: 'Jamaica', iso2: 'JM' },
        { id: 4, name: 'Haiti', iso2: 'HT' },
        { id: 5, name: 'Cuba', iso2: 'CU' },
        { id: 6, name: 'Dominican Republic', iso2: 'DO' },
        { id: 7, name: 'Trinidad and Tobago', iso2: 'TT' },
        { id: 8, name: 'Barbados', iso2: 'BB' },
        { id: 9, name: 'Mexico', iso2: 'MX' },
        { id: 10, name: 'Colombia', iso2: 'CO' },
        { id: 11, name: 'Venezuela', iso2: 'VE' },
        { id: 12, name: 'United Kingdom', iso2: 'GB' },
        { id: 13, name: 'Canada', iso2: 'CA' },
        { id: 14, name: 'France', iso2: 'FR' },
        { id: 15, name: 'Spain', iso2: 'ES' },
      ];

      const formattedCountries: CountryOption[] = mockCountries.map(country => ({
        value: country.name,
        label: country.name,
        iso2: country.iso2,
      }));

      setCountries(formattedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryCode: string) => {
    setLoadingStates(true);
    try {
      // Using mock data for demonstration
      const mockStates: { [key: string]: State[] } = {
        'US': [
          { id: 1, name: 'Alabama', state_code: 'AL', country_code: 'US' },
          { id: 2, name: 'Alaska', state_code: 'AK', country_code: 'US' },
          { id: 3, name: 'Arizona', state_code: 'AZ', country_code: 'US' },
          { id: 4, name: 'Arkansas', state_code: 'AR', country_code: 'US' },
          { id: 5, name: 'California', state_code: 'CA', country_code: 'US' },
          { id: 6, name: 'Colorado', state_code: 'CO', country_code: 'US' },
          { id: 7, name: 'Connecticut', state_code: 'CT', country_code: 'US' },
          { id: 8, name: 'Delaware', state_code: 'DE', country_code: 'US' },
          { id: 9, name: 'Florida', state_code: 'FL', country_code: 'US' },
          { id: 10, name: 'Georgia', state_code: 'GA', country_code: 'US' },
          { id: 11, name: 'Louisiana', state_code: 'LA', country_code: 'US' },
          { id: 12, name: 'Maryland', state_code: 'MD', country_code: 'US' },
          { id: 13, name: 'Mississippi', state_code: 'MS', country_code: 'US' },
          { id: 14, name: 'New York', state_code: 'NY', country_code: 'US' },
          { id: 15, name: 'North Carolina', state_code: 'NC', country_code: 'US' },
          { id: 16, name: 'South Carolina', state_code: 'SC', country_code: 'US' },
          { id: 17, name: 'Texas', state_code: 'TX', country_code: 'US' },
          { id: 18, name: 'Virginia', state_code: 'VA', country_code: 'US' },
        ],
        'BR': [
          { id: 1, name: 'Bahia', state_code: 'BA', country_code: 'BR' },
          { id: 2, name: 'Rio de Janeiro', state_code: 'RJ', country_code: 'BR' },
          { id: 3, name: 'São Paulo', state_code: 'SP', country_code: 'BR' },
          { id: 4, name: 'Minas Gerais', state_code: 'MG', country_code: 'BR' },
          { id: 5, name: 'Pernambuco', state_code: 'PE', country_code: 'BR' },
        ],
        'JM': [
          { id: 1, name: 'Kingston', state_code: 'KIN', country_code: 'JM' },
          { id: 2, name: 'Saint Andrew', state_code: 'AND', country_code: 'JM' },
          { id: 3, name: 'Saint Catherine', state_code: 'CAT', country_code: 'JM' },
          { id: 4, name: 'Clarendon', state_code: 'CLA', country_code: 'JM' },
          { id: 5, name: 'Manchester', state_code: 'MAN', country_code: 'JM' },
        ],
        'CA': [
          { id: 1, name: 'Ontario', state_code: 'ON', country_code: 'CA' },
          { id: 2, name: 'Quebec', state_code: 'QC', country_code: 'CA' },
          { id: 3, name: 'British Columbia', state_code: 'BC', country_code: 'CA' },
          { id: 4, name: 'Alberta', state_code: 'AB', country_code: 'CA' },
          { id: 5, name: 'Nova Scotia', state_code: 'NS', country_code: 'CA' },
        ],
        'HT': [
          { id: 1, name: 'Ouest', state_code: 'OU', country_code: 'HT' },
          { id: 2, name: 'Nord', state_code: 'ND', country_code: 'HT' },
          { id: 3, name: 'Artibonite', state_code: 'AR', country_code: 'HT' },
        ],
        'CU': [
          { id: 1, name: 'Havana', state_code: 'HAV', country_code: 'CU' },
          { id: 2, name: 'Santiago de Cuba', state_code: 'SCU', country_code: 'CU' },
          { id: 3, name: 'Matanzas', state_code: 'MAT', country_code: 'CU' },
        ],
        'DO': [
          { id: 1, name: 'Santo Domingo', state_code: 'SD', country_code: 'DO' },
          { id: 2, name: 'Santiago', state_code: 'ST', country_code: 'DO' },
          { id: 3, name: 'La Vega', state_code: 'LV', country_code: 'DO' },
        ],
        'TT': [
          { id: 1, name: 'Port of Spain', state_code: 'POS', country_code: 'TT' },
          { id: 2, name: 'San Fernando', state_code: 'SF', country_code: 'TT' },
          { id: 3, name: 'Arima', state_code: 'ARI', country_code: 'TT' },
        ],
        'MX': [
          { id: 1, name: 'Veracruz', state_code: 'VER', country_code: 'MX' },
          { id: 2, name: 'Oaxaca', state_code: 'OAX', country_code: 'MX' },
          { id: 3, name: 'Guerrero', state_code: 'GRO', country_code: 'MX' },
        ],
        'CO': [
          { id: 1, name: 'Chocó', state_code: 'CHO', country_code: 'CO' },
          { id: 2, name: 'Valle del Cauca', state_code: 'VAC', country_code: 'CO' },
          { id: 3, name: 'Bolívar', state_code: 'BOL', country_code: 'CO' },
        ],
      };

      const stateData = mockStates[countryCode] || [];
      const formattedStates: StateOption[] = stateData.map(state => ({
        value: state.name,
        label: state.name,
        code: state.state_code,
      }));

      setStates(formattedStates);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (countryCode: string, stateCode: string) => {
    setLoadingCities(true);
    try {
      // Using mock data for demonstration
      const mockCities: { [key: string]: City[] } = {
        'US-GA': [
          { id: 1, name: 'Atlanta' },
          { id: 2, name: 'Savannah' },
          { id: 3, name: 'Augusta' },
          { id: 4, name: 'Columbus' },
          { id: 5, name: 'Macon' },
        ],
        'US-LA': [
          { id: 1, name: 'New Orleans' },
          { id: 2, name: 'Baton Rouge' },
          { id: 3, name: 'Lafayette' },
          { id: 4, name: 'Shreveport' },
        ],
        'US-NY': [
          { id: 1, name: 'New York City' },
          { id: 2, name: 'Brooklyn' },
          { id: 3, name: 'Harlem' },
          { id: 4, name: 'Buffalo' },
          { id: 5, name: 'Albany' },
        ],
        'US-SC': [
          { id: 1, name: 'Charleston' },
          { id: 2, name: 'Columbia' },
          { id: 3, name: 'Beaufort' },
          { id: 4, name: 'Georgetown' },
        ],
        'BR-BA': [
          { id: 1, name: 'Salvador' },
          { id: 2, name: 'Feira de Santana' },
          { id: 3, name: 'Vitória da Conquista' },
        ],
        'BR-RJ': [
          { id: 1, name: 'Rio de Janeiro' },
          { id: 2, name: 'Niterói' },
          { id: 3, name: 'Duque de Caxias' },
        ],
        'JM-KIN': [
          { id: 1, name: 'Kingston' },
          { id: 2, name: 'Portmore' },
        ],
        'CA-ON': [
          { id: 1, name: 'Toronto' },
          { id: 2, name: 'Ottawa' },
          { id: 3, name: 'Mississauga' },
          { id: 4, name: 'Hamilton' },
        ],
        'US-AL': [
          { id: 1, name: 'Birmingham' },
          { id: 2, name: 'Montgomery' },
          { id: 3, name: 'Mobile' },
        ],
        'US-FL': [
          { id: 1, name: 'Miami' },
          { id: 2, name: 'Jacksonville' },
          { id: 3, name: 'Tampa' },
          { id: 4, name: 'Orlando' },
        ],
        'US-TX': [
          { id: 1, name: 'Houston' },
          { id: 2, name: 'Dallas' },
          { id: 3, name: 'Austin' },
          { id: 4, name: 'San Antonio' },
        ],
        'BR-SP': [
          { id: 1, name: 'São Paulo' },
          { id: 2, name: 'Campinas' },
          { id: 3, name: 'Santos' },
        ],
        'JM-AND': [
          { id: 1, name: 'Half Way Tree' },
          { id: 2, name: 'Papine' },
        ],
        'HT-OU': [
          { id: 1, name: 'Port-au-Prince' },
          { id: 2, name: 'Pétionville' },
          { id: 3, name: 'Carrefour' },
        ],
        'CU-HAV': [
          { id: 1, name: 'Havana' },
          { id: 2, name: 'Guanabacoa' },
        ],
        'DO-SD': [
          { id: 1, name: 'Santo Domingo' },
          { id: 2, name: 'Los Alcarrizos' },
        ],
        'TT-POS': [
          { id: 1, name: 'Port of Spain' },
          { id: 2, name: 'Laventille' },
        ],
        'MX-VER': [
          { id: 1, name: 'Veracruz' },
          { id: 2, name: 'Xalapa' },
          { id: 3, name: 'Coatzacoalcos' },
        ],
        'CO-CHO': [
          { id: 1, name: 'Quibdó' },
          { id: 2, name: 'Bahía Solano' },
        ],
        'CO-VAC': [
          { id: 1, name: 'Cali' },
          { id: 2, name: 'Buenaventura' },
          { id: 3, name: 'Palmira' },
        ],
      };

      const cityKey = `${countryCode}-${stateCode}`;
      const cityData = mockCities[cityKey] || [];
      const formattedCities: CityOption[] = cityData.map(city => ({
        value: city.name,
        label: city.name,
      }));

      setCities(formattedCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleCountryChange = (value: string) => {
    console.log('Country changed to:', value);
    onCountryChange(value);
    
    // Find the country code
    const country = countries.find(c => c.value === value);
    if (country && country.iso2) {
      setSelectedCountryCode(country.iso2);
    } else {
      setSelectedCountryCode('');
    }
    setSelectedStateCode('');
  };

  const handleStateChange = (value: string) => {
    onRegionChange(value);
    
    // Find the state code
    const state = states.find(s => s.value === value);
    if (state && state.code) {
      setSelectedStateCode(state.code);
    } else {
      setSelectedStateCode('');
    }
  };

  return (
    <div className="space-y-4">
      <Dropdown
        label={countryLabel}
        value={countryValue}
        onChange={handleCountryChange}
        options={countries}
        placeholder={loadingCountries ? 'Loading countries...' : countryPlaceholder}
        required={countryRequired}
        disabled={loadingCountries}
      />

      <Dropdown
        label={regionLabel}
        value={regionValue}
        onChange={handleStateChange}
        options={states}
        placeholder={loadingStates ? 'Loading regions...' : regionPlaceholder}
        required={regionRequired}
        disabled={!countryValue || loadingStates}
      />

      <Dropdown
        label={cityLabel}
        value={cityValue}
        onChange={onCityChange}
        options={cities}
        placeholder={loadingCities ? 'Loading cities...' : cityPlaceholder}
        required={cityRequired}
        disabled={!regionValue || loadingCities}
      />
      
      {/* Debug info - remove in production */}
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <div>Country Value: {countryValue || 'none'}</div>
        <div>Selected Country Code: {selectedCountryCode || 'none'}</div>
        <div>States Count: {states.length}</div>
        <div>Loading States: {loadingStates ? 'yes' : 'no'}</div>
        <div>Region Disabled: {(!countryValue || loadingStates) ? 'yes' : 'no'}</div>
      </div>
    </div>
  );
}
