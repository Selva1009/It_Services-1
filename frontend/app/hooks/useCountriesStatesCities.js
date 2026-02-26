import { useState, useEffect, useCallback } from "react";
import { fetchCachedJson } from "@/lib/cache/client-cache";

const API_KEY = "MHlWWnpWRG9WMWtNbnRBOVZvVmVGUWhyVXJ4em5JYlBKSTZleFk5MQ==";

export const useCountriesStatesCities = (selectedCountry, selectedState) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch Countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await fetchCachedJson(
          "geo:countries",
          async () => {
            const response = await fetch(
              "https://restcountries.com/v2/all?fields=name,alpha2Code"
            );

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
          },
          24 * 60 * 60 * 1000
        );

        const sortedCountries = data
          .map((country) => ({
            name: country.name,
            code: country.alpha2Code,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sortedCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  // Fetch States
  const fetchStates = useCallback(async () => {
    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      return;
    }

    try {
      const country = countries.find((c) => c.name === selectedCountry);
      if (!country) return;
      const data = await fetchCachedJson(
        `geo:states:${country.code}`,
        async () => {
          const response = await fetch(
            `https://api.countrystatecity.in/v1/countries/${country.code}/states`,
            { headers: { "X-CSCAPI-KEY": API_KEY } }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          return response.json();
        },
        24 * 60 * 60 * 1000
      );
      setStates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    }
  }, [selectedCountry, countries]);

  // Fetch Cities
  const fetchCities = useCallback(async () => {
    if (!selectedState) {
      setCities([]);
      return;
    }

    try {
      const country = countries.find((c) => c.name === selectedCountry);
      if (!country) return;

      const stateObj = states.find((state) => state.name === selectedState);
      if (!stateObj) return;

      const data = await fetchCachedJson(
        `geo:cities:${country.code}:${stateObj.iso2}`,
        async () => {
          const response = await fetch(
            `https://api.countrystatecity.in/v1/countries/${country.code}/states/${stateObj.iso2}/cities`,
            { headers: { "X-CSCAPI-KEY": API_KEY } }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          return response.json();
        },
        24 * 60 * 60 * 1000
      );
      setCities(Array.isArray(data) ? data.map((city) => city.name) : []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  }, [selectedState, states, countries, selectedCountry]);

  useEffect(() => {
    fetchStates();
  }, [fetchStates]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  return { countries, states, cities, fetchStates, fetchCities };
};
