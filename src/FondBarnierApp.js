import React, { useState, useCallback } from 'react';
import './App.css'

const FondsBarnierApp = () => {
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState([0, 0]);
    const [isTRI, setIsTRI] = useState(null);
    const [isPPRN, setIsPPRN] = useState(null);
    const [isPAPI, setIsPAPI] = useState(null);
    const [result, setResult] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const resetResults = () => {
        setIsTRI(null);
        setIsPPRN(null);
        setIsPAPI(null);
        setResult(null);
    };

    const fetchSuggestions = useCallback(async (query) => {
        console.log(`Fetching suggestions for query: ${query}`);
        try {
            const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=${process.env.api_key}`)
            const data = await response.json();
            console.log('Suggestions received:', data);
            setSuggestions(data.features || []);
        } catch (error) {
            console.log('Error fetching suggestions:', error);
        }
    }, []);

    const fetchIsTRI = useCallback(async (coords) => {
        console.log(`Fetching TRI status for coordinates: ${coords}`);
        try {
            const response = await fetch(`https://georisques.gouv.fr/api/v1/gaspar/tri?rayon=100&latlon=${coords[0]}%2C${coords[1]}&page=1&page_size=10`);
            const data = await response.json();
            console.log('TRI data received:', data);
            return data.data && data.data.length > 0 && data.data[0].code_national_tri !== null;
        } catch (error) {
            console.log('Error fetching TRI status:', error);
            return false;
        }
    }, []);

    const fetchIsPPRI = useCallback(async (coords) => {
        console.log(`Fetching PPRI status for coordinates: ${coords}`);
        try {
            const response = await fetch(`https://georisques.gouv.fr/api/v1/ppr?rayon=100&latlon=${coords[0]}%2C${coords[1]}&page=1&page_size=10`);
            const data = await response.json();
            console.log('PPRI data received:', data);
            return data.data && data.data.some(item => item.etat.code_etat !== "03");
        } catch (error) {
            console.log('Error fetching PPRI status:', error);
            return false;
        }
    }, []);

    const fetchIsPAPI = useCallback(async (coords) => {
        console.log(`Fetching PAPI status for coordinates: ${coords}`);
        try {
            const response = await fetch(`https://georisques.gouv.fr/api/v1/gaspar/papi?rayon=100&latlon=${coords[0]}%2C${coords[1]}&page=1&page_size=10`);
            const data = await response.json();
            console.log('PAPI data received:', data);
            return data.data && data.data.some(item => item.code_national_papi !== null);
        } catch (error) {
            console.log('Error fetching PAPI status:', error);
            return false;
        }
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        console.log(`Address input changed: ${value}`);
        setAddress(value);
        resetResults();
        if (value.length > 2) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        console.log('Suggestion clicked:', suggestion);
        setAddress(suggestion.properties.formatted);
        setSuggestions([]);
        setCoordinates(suggestion.geometry.coordinates);
        console.log('Coordinates set to:', suggestion.geometry.coordinates);
    };

    const checkEligibility = useCallback(async () => {
        console.log('Checking eligibility...');
        setIsLoading(true);
        resetResults();

        const triStatus = await fetchIsTRI(coordinates);
        setIsTRI(triStatus);
        console.log('TRI status:', triStatus);

        if (triStatus) {
            const ppriStatus = await fetchIsPPRI(coordinates);
            setIsPPRN(ppriStatus);
            console.log('PPRI status:', ppriStatus);

            if (ppriStatus) {
                const papiStatus = await fetchIsPAPI(coordinates);
                setIsPAPI(papiStatus);
                console.log('PAPI status:', papiStatus);

                setResult(papiStatus ? 'eligible' : 'not-eligible');
            } else {
                setResult('not-eligible');
            }
        } else {
            setResult('not-eligible');
        }
        setIsLoading(false);
    }, [coordinates, fetchIsTRI, fetchIsPPRI, fetchIsPAPI]);

    return (
        <div className="card w-full max-w-md mx-auto p-4 shadow-lg">
            <div className="card-header mb-4">
                <h2 className="text-2xl font-bold">Éligibilité au Fonds Barnier</h2>
            </div>
            <div className="card-content">
                <input
                    type="text"
                    placeholder="Entrez votre adresse"
                    value={address}
                    onChange={handleInputChange}
                    className="input mb-4 p-2 border border-gray-300 rounded w-full"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list border border-gray-300 rounded mt-2">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="suggestion-item p-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion.properties.formatted}
                            </li>
                        ))}
                    </ul>
                )}
                <button
                    onClick={checkEligibility}
                    className="btn p-2 bg-blue-500 text-white rounded w-full mt-4"
                    disabled={coordinates[0] === 0 && coordinates[1] === 0 || isLoading}
                >
                    {isLoading ? 'Vérification en cours...' : 'Vérifier l\'éligibilité'}
                </button>
            </div>
            {result && (
                <div className="card-footer mt-4 p-4 border-t border-gray-300">
                    <div className="alert p-4 bg-blue-100 rounded">
                        <p className="alert-description">
                            {result === 'eligible' && "Vous êtes éligible au Fonds Barnier !"}
                            {result === 'potentially' && "Vous êtes potentiellement éligible. Un diagnostic de vulnérabilité est nécessaire."}
                            {result === 'not-eligible' && "Vous n'êtes pas éligible au Fonds Barnier."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FondsBarnierApp;