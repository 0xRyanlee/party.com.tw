'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2, X, Search } from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface LocationPickerProps {
    value?: {
        name: string;
        address: string;
        lat?: number;
        lng?: number;
    };
    onChange?: (location: {
        name: string;
        address: string;
        lat?: number;
        lng?: number;
    }) => void;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Google Maps State
    const [apiKeyError, setApiKeyError] = useState(false);
    const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);
    const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);

    const locationName = value?.name || '';
    const locationAddress = value?.address || '';

    // Load Google Maps API
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API Key not found');
            setApiKeyError(true);
            return;
        }

        // Initialize the loader with options
        // Note: In v2, we use setOptions or just importLibrary directly if we want singleton behavior,
        // but setOptions is the direct replacement for the Loader constructor options.
        // However, the error message specifically mentioned setOptions.
        // Let's try to use the Loader class if it exists in the import but maybe it's named differently?
        // No, the error said "Loader class is no longer available".
        // So we must use setOptions.

        // Wait, if I import Loader from '@googlemaps/js-api-loader', and it's not available, that import will fail or be empty?
        // The error was runtime: "The Loader class is no longer available...".
        // This means the symbol 'Loader' might still be exported but throws when instantiated, OR I should not import it.

        // Let's use the functional API as requested.

        setOptions({
            key: apiKey,
            v: 'weekly',
            libraries: ['places', 'geometry'],
            language: 'zh-TW',
            region: 'TW',
        });

        const loadLibraries = async () => {
            try {
                const { AutocompleteService, PlacesService } = await importLibrary('places') as google.maps.PlacesLibrary;
                const { Geocoder } = await importLibrary('geocoding') as google.maps.GeocodingLibrary;

                setAutocompleteService(new AutocompleteService());
                setGeocoder(new Geocoder());
                // PlacesService requires a DOM element, even if not displaying a map
                const dummyDiv = document.createElement('div');
                setPlacesService(new PlacesService(dummyDiv));
            } catch (e: unknown) {
                console.error('Failed to load Google Maps API', e);
                setApiKeyError(true);
            }
        };

        loadLibraries();
    }, []);

    // Search Predictions
    useEffect(() => {
        if (!autocompleteService || !searchQuery) {
            setPredictions([]);
            return;
        }

        if (searchQuery.length < 2) return;

        const request: google.maps.places.AutocompletionRequest = {
            input: searchQuery,
            componentRestrictions: { country: 'tw' },
            types: ['establishment', 'geocode'],
        };

        autocompleteService.getPlacePredictions(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setPredictions(results);
            } else {
                setPredictions([]);
            }
        });
    }, [searchQuery, autocompleteService]);

    // Handle Place Selection
    const handleSelectPlace = (placeId: string, description: string) => {
        if (!placesService) return;

        placesService.getDetails({
            placeId,
            fields: ['name', 'formatted_address', 'geometry']
        }, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                onChange?.({
                    name: place.name || description,
                    address: place.formatted_address || '',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                });
                setSearchQuery('');
                setShowSuggestions(false);
            }
        });
    };

    // Use Current Location
    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('您的瀏覽器不支援地理位置功能');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // If Geocoder is available, get address
                if (geocoder) {
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        if (status === 'OK' && results && results[0]) {
                            onChange?.({
                                name: '當前位置', // Or use results[0].formatted_address as name?
                                address: results[0].formatted_address,
                                lat: latitude,
                                lng: longitude,
                            });
                        } else {
                            // Fallback if geocoding fails
                            onChange?.({
                                name: '當前位置',
                                address: `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`,
                                lat: latitude,
                                lng: longitude,
                            });
                        }
                        setIsGettingLocation(false);
                    });
                } else {
                    // Fallback if API not loaded
                    onChange?.({
                        name: '當前位置',
                        address: `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`,
                        lat: latitude,
                        lng: longitude,
                    });
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                alert('無法獲取當前位置: ' + error.message);
            }
        );
    };

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div>
                <Label className="text-sm font-medium mb-2 block">搜尋地點</Label>
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder={apiKeyError ? "API 未連接，請手動輸入" : "搜尋地點名稱或地址..."}
                            className="pl-10 pr-10"
                            disabled={apiKeyError}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && predictions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {predictions.map((prediction) => (
                                <button
                                    key={prediction.place_id}
                                    type="button"
                                    onClick={() => handleSelectPlace(prediction.place_id, prediction.description)}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm text-gray-900">
                                                {prediction.structured_formatting.main_text}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {prediction.structured_formatting.secondary_text}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Current Location Button */}
            <Button
                type="button"
                variant="outline"
                onClick={useCurrentLocation}
                disabled={isGettingLocation}
                className="w-full gap-2"
            >
                {isGettingLocation ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        正在獲取位置...
                    </>
                ) : (
                    <>
                        <Navigation className="w-4 h-4" />
                        使用當前位置
                    </>
                )}
            </Button>

            {/* Selected Location Display */}
            {locationName && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-blue-900">{locationName}</p>
                            <p className="text-sm text-blue-700 mt-1">{locationAddress}</p>
                            {value?.lat && value?.lng && (
                                <p className="text-xs text-blue-600 mt-1">
                                    座標: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange?.({ name: '', address: '' })}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            清除
                        </button>
                    </div>
                </div>
            )}

            {/* Manual Input Fallback */}
            <div className="pt-4 border-t border-gray-200">
                <Label className="text-sm font-medium mb-2 block">手動輸入 (如果找不到地點)</Label>
                <div className="space-y-3">
                    <div>
                        <Label className="text-xs text-gray-600">地點名稱</Label>
                        <Input
                            type="text"
                            value={locationName}
                            onChange={(e) => onChange?.({
                                name: e.target.value,
                                address: locationAddress,
                                lat: value?.lat,
                                lng: value?.lng,
                            })}
                            placeholder="例如：某咖啡廳、某酒吧"
                        />
                    </div>
                    <div>
                        <Label className="text-xs text-gray-600">詳細地址</Label>
                        <Input
                            type="text"
                            value={locationAddress}
                            onChange={(e) => onChange?.({
                                name: locationName,
                                address: e.target.value,
                                lat: value?.lat,
                                lng: value?.lng,
                            })}
                            placeholder="例如：台北市大安區..."
                        />
                    </div>
                </div>
            </div>

            {apiKeyError && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-700">
                        ⚠️ Google Maps API 未連接，請使用手動輸入模式。
                    </p>
                </div>
            )}
        </div>
    );
}
