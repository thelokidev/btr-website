import React, { useState, useEffect } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import debounce from 'lodash/debounce';

const defaultCities = [
  { description: 'New York, United States', city: 'New York', state: 'New York', country: 'United States' },
  { description: 'London, United Kingdom', city: 'London', state: 'England', country: 'United Kingdom' },
  { description: 'Tokyo, Japan', city: 'Tokyo', state: 'Tokyo', country: 'Japan' },
  { description: 'Paris, France', city: 'Paris', state: 'Île-de-France', country: 'France' },
  { description: 'Mumbai, India', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
];

const LocationInput = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState(defaultCities);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  // Fetch predictions with debounce
  const fetchPlacePredictions = debounce(async (input) => {
    if (!input) {
      setOptions(defaultCities);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}`
      );
      const data = await response.json();
      const predictions = data.map((item) => ({
        description: item.display_name,
        lat: item.lat,
        lon: item.lon,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        country: item.address?.country,
      }));
      setOptions(predictions);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  // Initialize component with value
  useEffect(() => {
    const initialize = async () => {
      if (value) {
        setInputValue(value);
        const defaultMatch = defaultCities.find((city) => city.description === value);
        if (defaultMatch) {
          setSelectedOption(defaultMatch);
        } else {
          // Fetch initial value details
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
            );
            const data = await response.json();
            const predictions = data.map((item) => ({
              description: item.display_name,
              lat: item.lat,
              lon: item.lon,
              city: item.address?.city || item.address?.town || item.address?.village,
              state: item.address?.state,
              country: item.address?.country,
            }));
            setOptions(predictions);
            const match = predictions.find((p) => p.description === value);
            if (match) setSelectedOption(match);
          } catch (error) {
            console.error('Error initializing location:', error);
          }
        }
      }
    };
    initialize();
  }, [value]);

  // Sync selected option when value or options change
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find((opt) => opt.description === value);
      setSelectedOption(option || null);
    }
  }, [value, options]);

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    fetchPlacePredictions(newInputValue);
  };

  const handleChange = (event, newValue) => {
    setSelectedOption(newValue);
    onChange(newValue ? newValue.description : '');
  };

  return (
    <Autocomplete
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={(option) => (option ? option.description : '')}
      isOptionEqualToValue={(option, value) => option?.description === value?.description}
      autoComplete
      autoHighlight
      openOnFocus
      renderOption={(props, option) => (
        <li {...props}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 500 }}>{option.city || option.state || option.country}</div>
            <div style={{ fontSize: '0.8em', color: '#666' }}>{option.description}</div>
          </div>
        </li>
      )}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Birth Location"
          placeholder="Enter a city name"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};

export default LocationInput;