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

const COUNTRIES_NOW_BASE = 'https://countriesnow.space/api/v0.1';

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
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [selectedStateName, setSelectedStateName] = useState('');

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Initialize selectedCountryName when countries are loaded and countryValue exists
  useEffect(() => {
    if (countries.length > 0 && countryValue && !selectedCountryName) {
      const country = countries.find(c => c.value === countryValue);
      if (country) {
        setSelectedCountryName(country.value);
      }
    }
  }, [countries, countryValue, selectedCountryName]);

  // Initialize selectedStateName when states are loaded and regionValue exists
  useEffect(() => {
    if (states.length > 0 && regionValue && !selectedStateName) {
      const state = states.find(s => s.value === regionValue);
      if (state) {
        setSelectedStateName(state.value);
      }
    }
  }, [states, regionValue, selectedStateName]);

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountryName) {
      fetchStates(selectedCountryName);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountryName]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedCountryName && selectedStateName) {
      fetchCities(selectedCountryName, selectedStateName);
    } else {
      setCities([]);
    }
  }, [selectedStateName, selectedCountryName]);

  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      const response = await fetch(`${COUNTRIES_NOW_BASE}/countries/iso`);
      const data = await response.json();

      const formattedCountries: CountryOption[] = Array.isArray(data?.data)
        ? data.data.map((country: any) => ({
            value: country.name,
            label: country.name,
            iso2: country.Iso2 || country.iso2 || '',
          }))
        : [];

      setCountries(formattedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  const fetchStates = async (countryName: string) => {
    setLoadingStates(true);
    try {
      const response = await fetch(`${COUNTRIES_NOW_BASE}/countries/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName }),
      });
      const data = await response.json();

      const formattedStates: StateOption[] = Array.isArray(data?.data?.states)
        ? data.data.states.map((state: any) => ({
            value: state.name,
            label: state.name,
            code: state.state_code || state.name,
          }))
        : [];

      setStates(formattedStates);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (countryName: string, stateName: string) => {
    setLoadingCities(true);
    try {
      const response = await fetch(`${COUNTRIES_NOW_BASE}/countries/state/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName, state: stateName }),
      });
      const data = await response.json();

      const formattedCities: CityOption[] = Array.isArray(data?.data)
        ? data.data.map((city: string) => ({
            value: city,
            label: city,
          }))
        : [];

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

    const country = countries.find(c => c.value === value);
    setSelectedCountryName(country ? country.value : '');
    setSelectedStateName('');
  };

  const handleStateChange = (value: string) => {
    onRegionChange(value);

    const state = states.find(s => s.value === value);
    setSelectedStateName(state ? state.value : '');
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
        <div>Selected Country: {selectedCountryName || 'none'}</div>
        <div>States Count: {states.length}</div>
        <div>Loading States: {loadingStates ? 'yes' : 'no'}</div>
        <div>Region Disabled: {(!countryValue || loadingStates) ? 'yes' : 'no'}</div>
      </div>
    </div>
  );
}
