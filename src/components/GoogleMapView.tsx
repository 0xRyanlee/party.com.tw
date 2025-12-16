'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Loader2, Navigation, Maximize2, Minimize2, MapPin, Route, Users } from 'lucide-react';

export interface MapLocation {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    type?: 'event' | 'venue' | 'vendor' | 'start' | 'stop' | 'end';
    color?: string;
    info?: {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
    };
}

export interface MapRoute {
    id: string;
    name: string;
    locations: MapLocation[];
    color?: string;
}

interface GoogleMapViewProps {
    /** 單一地點或多個地點 */
    locations?: MapLocation[];
    /** 路線（多個地點連線） */
    routes?: MapRoute[];
    /** 預設中心點 */
    center?: { lat: number; lng: number };
    /** 預設縮放等級 */
    zoom?: number;
    /** 是否顯示用戶當前位置 */
    showUserLocation?: boolean;
    /** 地圖高度 */
    height?: string;
    /** 是否可全螢幕 */
    allowFullscreen?: boolean;
    /** 點擊地點時的回調 */
    onLocationClick?: (location: MapLocation) => void;
    /** 自訂 class */
    className?: string;
}

// 地點類型對應的顏色
const TYPE_COLORS: Record<string, string> = {
    event: '#EF4444',   // 紅色
    venue: '#8B5CF6',   // 紫色
    vendor: '#F59E0B',  // 橙色
    start: '#10B981',   // 綠色
    stop: '#3B82F6',    // 藍色
    end: '#EF4444',     // 紅色
    default: '#6B7280', // 灰色
};

// 地點類型對應的 Icon SVG
const markerIcon = (color: string, label?: string) => `
<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 0C8.954 0 0 8.954 0 20c0 15 20 28 20 28s20-13 20-28C40 8.954 31.046 0 20 0z" fill="${color}"/>
  <circle cx="20" cy="18" r="8" fill="white"/>
  ${label ? `<text x="20" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">${label}</text>` : ''}
</svg>
`;

export default function GoogleMapView({
    locations = [],
    routes = [],
    center,
    zoom = 13,
    showUserLocation = true,
    height = '400px',
    allowFullscreen = true,
    onLocationClick,
    className = '',
}: GoogleMapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    const polylinesRef = useRef<google.maps.Polyline[]>([]);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // 預設中心點（台北）
    const defaultCenter = center || { lat: 25.0330, lng: 121.5654 };

    // 初始化 Google Maps
    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setError('Google Maps API Key 未設定');
            setIsLoading(false);
            return;
        }

        const initMap = async () => {
            try {
                setOptions({
                    key: apiKey,
                    v: 'weekly',
                    libraries: ['places', 'marker'],
                });

                await importLibrary('maps');
                await importLibrary('marker');

                if (mapRef.current) {
                    const map = new google.maps.Map(mapRef.current, {
                        center: defaultCenter,
                        zoom,
                        mapId: 'party_map', // 需要 Map ID 才能使用 Advanced Markers
                        disableDefaultUI: false,
                        zoomControl: true,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                    });

                    googleMapRef.current = map;
                    infoWindowRef.current = new google.maps.InfoWindow();

                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load Google Maps:', err);
                setError('無法載入地圖');
                setIsLoading(false);
            }
        };

        initMap();
    }, []);

    // 渲染標記
    const renderMarkers = useCallback(() => {
        if (!googleMapRef.current) return;

        // 清除現有標記
        markersRef.current.forEach(marker => marker.map = null);
        markersRef.current = [];

        // 添加地點標記
        locations.forEach((location) => {
            const color = location.color || TYPE_COLORS[location.type || 'default'] || TYPE_COLORS.default;

            const markerContent = document.createElement('div');
            markerContent.innerHTML = markerIcon(color);
            markerContent.style.cursor = 'pointer';

            const marker = new google.maps.marker.AdvancedMarkerElement({
                map: googleMapRef.current,
                position: { lat: location.lat, lng: location.lng },
                content: markerContent,
                title: location.name,
            });

            marker.addListener('click', () => {
                if (infoWindowRef.current && googleMapRef.current) {
                    const content = `
                        <div style="padding: 8px; max-width: 200px;">
                            ${location.info?.image ? `<img src="${location.info.image}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />` : ''}
                            <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
                            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${location.address}</p>
                            ${location.info?.description ? `<p style="font-size: 12px; margin-bottom: 8px;">${location.info.description}</p>` : ''}
                            ${location.info?.url ? `<a href="${location.info.url}" style="color: #3B82F6; font-size: 12px;">查看詳情</a>` : ''}
                        </div>
                    `;
                    infoWindowRef.current.setContent(content);
                    infoWindowRef.current.open(googleMapRef.current, marker);
                }
                onLocationClick?.(location);
            });

            markersRef.current.push(marker);
        });

        // 添加路線標記
        routes.forEach((route, routeIndex) => {
            route.locations.forEach((location, locIndex) => {
                const color = route.color || TYPE_COLORS[location.type || 'default'] || TYPE_COLORS.default;
                const label = `${routeIndex + 1}-${locIndex + 1}`;

                const markerContent = document.createElement('div');
                markerContent.innerHTML = markerIcon(color, label);
                markerContent.style.cursor = 'pointer';

                const marker = new google.maps.marker.AdvancedMarkerElement({
                    map: googleMapRef.current,
                    position: { lat: location.lat, lng: location.lng },
                    content: markerContent,
                    title: `${route.name} - ${location.name}`,
                });

                markersRef.current.push(marker);
            });
        });

        // 自動調整視野
        if (locations.length > 0 || routes.length > 0) {
            const bounds = new google.maps.LatLngBounds();

            locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
            routes.forEach(route => {
                route.locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
            });

            googleMapRef.current?.fitBounds(bounds, 50);
        }
    }, [locations, routes, onLocationClick]);

    // 渲染路線
    const renderPolylines = useCallback(() => {
        if (!googleMapRef.current) return;

        // 清除現有路線
        polylinesRef.current.forEach(polyline => polyline.setMap(null));
        polylinesRef.current = [];

        // 繪製路線
        routes.forEach((route) => {
            if (route.locations.length < 2) return;

            const path = route.locations.map(loc => ({ lat: loc.lat, lng: loc.lng }));
            const color = route.color || '#3B82F6';

            const polyline = new google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: googleMapRef.current,
            });

            polylinesRef.current.push(polyline);
        });
    }, [routes]);

    // 監聽地點和路線變化
    useEffect(() => {
        if (!isLoading && googleMapRef.current) {
            renderMarkers();
            renderPolylines();
        }
    }, [isLoading, locations, routes, renderMarkers, renderPolylines]);

    // 獲取用戶位置
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(pos);
                googleMapRef.current?.panTo(pos);
                googleMapRef.current?.setZoom(15);
            },
            (error) => {
                console.error('Failed to get user location:', error);
            }
        );
    }, []);

    // 添加用戶位置標記
    useEffect(() => {
        if (userLocation && googleMapRef.current) {
            const userMarkerContent = document.createElement('div');
            userMarkerContent.innerHTML = `
                <div style="width: 16px; height: 16px; background: #3B82F6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
            `;

            new google.maps.marker.AdvancedMarkerElement({
                map: googleMapRef.current,
                position: userLocation,
                content: userMarkerContent,
                title: '您的位置',
            });
        }
    }, [userLocation]);

    // 全螢幕切換
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`} style={{ height }}>
                <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-xl ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
            style={{ height: isFullscreen ? '100vh' : height }}
        >
            {/* 載入中 */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            )}

            {/* 地圖容器 */}
            <div ref={mapRef} className="w-full h-full" />

            {/* 控制按鈕 */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                {showUserLocation && (
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={getUserLocation}
                        className="bg-white shadow-md hover:bg-gray-50"
                    >
                        <Navigation className="w-4 h-4" />
                    </Button>
                )}
                {allowFullscreen && (
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="bg-white shadow-md hover:bg-gray-50"
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </Button>
                )}
            </div>

            {/* 圖例 */}
            {(locations.length > 0 || routes.length > 0) && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-xs">
                    <div className="flex flex-wrap gap-3">
                        {locations.some(l => l.type === 'event') && (
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>活動</span>
                            </div>
                        )}
                        {locations.some(l => l.type === 'venue') && (
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>場地</span>
                            </div>
                        )}
                        {locations.some(l => l.type === 'vendor') && (
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>供應商</span>
                            </div>
                        )}
                        {routes.length > 0 && (
                            <div className="flex items-center gap-1">
                                <Route className="w-3 h-3 text-blue-500" />
                                <span>路線</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
