'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation, Loader2, X } from 'lucide-react';
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

// 台灣熱門地點預設列表（降級使用）
const POPULAR_LOCATIONS = [
    { name: '台北101', address: '台北市信義區信義路五段7號', lat: 25.0339639, lng: 121.5644722 },
    { name: '西門町', address: '台北市萬華區成都路', lat: 25.042436, lng: 121.506913 },
    { name: '東區', address: '台北市大安區忠孝東路四段', lat: 25.041583, lng: 121.543611 },
    { name: '師大夜市', address: '台北市大安區師大路', lat: 25.026039, lng: 121.528139 },
    { name: '信義商圈', address: '台北市信義區', lat: 25.033611, lng: 121.564444 },
    { name: '中山站', address: '台北市中山區南京西路', lat: 25.052381, lng: 121.520444 },
    { name: '士林夜市', address: '台北市士林區基河路', lat: 25.087778, lng: 121.524167 },
    { name: '台大校園', address: '台北市大安區羅斯福路四段1號', lat: 25.017472, lng: 121.539583 },
];

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [useGoogleMaps, setUseGoogleMaps] = useState(false);
    const [showPopularLocations, setShowPopularLocations] = useState(false);

    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const geocoder = useRef<google.maps.Geocoder | null>(null);

    const locationName = value?.name || '';
    const locationAddress = value?.address || '';

    // 初始化 Google Maps API
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.log('Google Maps API Key not found, using fallback mode');
            setIsLoading(false);
            setUseGoogleMaps(false);
            return;
        }

        (async () => {
            try {
                setOptions({
                    key: apiKey,
                    v: 'weekly',
                    libraries: ['places', 'geocoding'],
                });

                await importLibrary('places');
                autocompleteService.current = new google.maps.places.AutocompleteService();
                const div = document.createElement('div');
                placesService.current = new google.maps.places.PlacesService(div);
                geocoder.current = new google.maps.Geocoder();

                setUseGoogleMaps(true);
                setIsLoading(false);
                console.log('Google Maps API loaded successfully');
            } catch (err) {
                console.error('Failed to load Google Maps:', err);
                setUseGoogleMaps(false);
                setIsLoading(false);
            }
        })();
    }, []);

    // Google Maps 搜索
    const searchWithGoogleMaps = useCallback(async (query: string) => {
        if (!query || query.length < 2 || !autocompleteService.current) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        const request: google.maps.places.AutocompletionRequest = {
            input: query,
            componentRestrictions: { country: 'tw' },
            language: 'zh-TW',
        };

        autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
            }
            setIsSearching(false);
        });
    }, []);

    // 選擇 Google Maps 地點
    const selectGoogleMapsLocation = useCallback((prediction: google.maps.places.AutocompletePrediction) => {
        if (!placesService.current) return;

        const request: google.maps.places.PlaceDetailsRequest = {
            placeId: prediction.place_id,
            fields: ['name', 'formatted_address', 'geometry'],
        };

        placesService.current.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                onChange?.({
                    name: place.name || prediction.structured_formatting.main_text,
                    address: place.formatted_address || prediction.description,
                    lat: place.geometry?.location?.lat(),
                    lng: place.geometry?.location?.lng(),
                });
                setShowSuggestions(false);
                setSearchQuery('');
            }
        });
    }, [onChange]);

    // 使用當前位置
    const useCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            alert('您的瀏覽器不支援地理位置功能');
            return;
        }

        setIsSearching(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // 如果有 Google Maps，使用反向地理編碼
                if (useGoogleMaps && geocoder.current) {
                    const request: google.maps.GeocoderRequest = {
                        location: { lat: latitude, lng: longitude },
                        language: 'zh-TW',
                    };

                    geocoder.current.geocode(request, (results, status) => {
                        setIsSearching(false);
                        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                            onChange?.({
                                name: results[0].address_components[0]?.long_name || '當前位置',
                                address: results[0].formatted_address,
                                lat: latitude,
                                lng: longitude,
                            });
                        } else {
                            onChange?.({
                                name: '當前位置',
                                address: `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`,
                                lat: latitude,
                                lng: longitude,
                            });
                        }
                    });
                } else {
                    setIsSearching(false);
                    onChange?.({
                        name: '當前位置',
                        address: `緯度: ${latitude.toFixed(6)}, 經度: ${longitude.toFixed(6)}`,
                        lat: latitude,
                        lng: longitude,
                    });
                }
            },
            (error) => {
                setIsSearching(false);
                alert('無法獲取當前位置: ' + error.message);
            }
        );
    }, [useGoogleMaps, onChange]);

    // 篩選熱門地點
    const filteredPopularLocations = searchQuery.length > 0
        ? POPULAR_LOCATIONS.filter(loc =>
            loc.name.includes(searchQuery) || loc.address.includes(searchQuery)
        )
        : POPULAR_LOCATIONS;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">載入地圖服務中...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* API 狀態提示 */}
            {!useGoogleMaps && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                        提示：目前使用簡化模式（熱門地點）。如需更精確搜索，請配置 Google Maps API Key。
                    </p>
                </div>
            )}

            {/* 搜索框 */}
            <div className="relative">
                <Label className="text-sm font-medium mb-2 block">搜索地點</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (useGoogleMaps) {
                                searchWithGoogleMaps(e.target.value);
                            } else {
                                setShowPopularLocations(true);
                            }
                        }}
                        onFocus={() => {
                            if (useGoogleMaps && suggestions.length > 0) {
                                setShowSuggestions(true);
                            } else {
                                setShowPopularLocations(true);
                            }
                        }}
                        placeholder={useGoogleMaps ? "輸入任何地點名稱或地址..." : "搜索熱門地點..."}
                        className="pl-10 pr-10"
                    />
                    {isSearching ? (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                    ) : searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                                setShowPopularLocations(false);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Google Maps 建議 */}
                {useGoogleMaps && showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.place_id}
                                type="button"
                                onClick={() => selectGoogleMapsLocation(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">
                                            {suggestion.structured_formatting.main_text}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {suggestion.structured_formatting.secondary_text}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* 熱門地點建議 */}
                {!useGoogleMaps && showPopularLocations && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredPopularLocations.length > 0 ? (
                            filteredPopularLocations.map((location, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        onChange?.(location);
                                        setShowPopularLocations(false);
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{location.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{location.address}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                沒有找到匹配的地點
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 當前位置 */}
            <Button
                type="button"
                variant="outline"
                onClick={useCurrentLocation}
                disabled={isSearching}
                className="w-full gap-2"
            >
                {isSearching ? (
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

            {/* 已選地點 */}
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
            )}        </div>
    );
}
