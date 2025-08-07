'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AutoComplete } from 'primereact/autocomplete';
import toast from 'react-hot-toast';
import mapManagementStore from '../../stores/map-management';
import { calculateDeliveryData } from '../../actions/calculate-delivery-data';

interface RoutePoint {
    id: number;
    lat: number;
    lng: number;
    address: string;
}

interface MarkerData {
    id: number;
    marker: any;
    type: 'from' | 'to';
}

export interface RouteData {
    fromPoints: {
        id: number;
        coordinates: { lat: number; lng: number };
        address: string;
    }[];
    toPoints: {
        id: number;
        coordinates: { lat: number; lng: number };
        address: string;
    }[];
}

interface RoutePair {
    id: string;
    from: RoutePoint | null;
    to: RoutePoint | null;
}

type SelectionMode = 'from' | 'to';

declare global {
    interface Window {
        google: any;
    }
}


import { useTranslations } from 'next-intl';

const MapRouteSelector: React.FC = () => {
    const t = useTranslations('dashboard_orders_main.maproute_selector');

    // ZUSTAND
    const { setRouteData, calculatedDataDialog: {onShow, setCalculatedData, openingLoading, setKey} } = mapManagementStore();

    // MAP REFS AND STATES
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [directionsService, setDirectionsService] = useState<any>(null);
    const [directionsRenderers, setDirectionsRenderers] = useState<any[]>([]);
    const [fromPoints, setFromPoints] = useState<RoutePoint[]>([]);
    const [toPoints, setToPoints] = useState<RoutePoint[]>([]);
    const [selectedMode, setSelectedMode] = useState<SelectionMode>('from');
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

    // Function to switch to opposite mode
    const switchToOppositeMode = () => {
        setSelectedMode((prev) => (prev === 'from' ? 'to' : 'from'));
    };

    // Auto-switch logic based on route completion
    const autoSwitchMode = useCallback(() => {
        if (selectedMode === 'from') {
            // If we just added a start point, switch to end mode
            switchToOppositeMode();
        } else {
            // If we just added an end point, check if we need another route
            // Switch to start mode for the next route
            switchToOppositeMode();
        }
    }, [selectedMode]);

    // Create route pairs for display
    const createRoutePairs = (): RoutePair[] => {
        const pairs: RoutePair[] = [];
        const maxLength = Math.max(fromPoints.length, toPoints.length);

        for (let i = 0; i < maxLength; i++) {
            pairs.push({
                id: `pair-${i}`,
                from: fromPoints[i] || null,
                to: toPoints[i] || null
            });
        }

        return pairs;
    };

    // Draw routes on map
    const drawRoutes = useCallback(() => {
        if (!map || !directionsService) return;

        // Clear existing routes
        directionsRenderers.forEach((renderer) => renderer.setMap(null));
        setDirectionsRenderers([]);

        const pairs = createRoutePairs();
        const newRenderers: any[] = [];

        pairs.forEach((pair, index) => {
            if (pair.from && pair.to) {
                const directionsRenderer = new window.google.maps.DirectionsRenderer({
                    suppressMarkers: true, // We'll use our custom markers
                    polylineOptions: {
                        strokeColor: index % 2 === 0 ? '#3B82F6' : '#8B5CF6',
                        strokeWeight: 4,
                        strokeOpacity: 0.8
                    }
                });

                directionsRenderer.setMap(map);
                newRenderers.push(directionsRenderer);

                const request = {
                    origin: { lat: pair.from.lat, lng: pair.from.lng },
                    destination: { lat: pair.to.lat, lng: pair.to.lng },
                    travelMode: window.google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, (result: any, status: string) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(result);
                    }
                });
            }
        });

        setDirectionsRenderers(newRenderers);
    }, [map, directionsService, fromPoints, toPoints]);

    // Update routes when points change
    useEffect(() => {
        drawRoutes();
    }, [drawRoutes]);

    // Reverse geocoding to get address from coordinates
    const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
        if (!window.google) return 'العنوان غير متاح';

        const geocoder = new window.google.maps.Geocoder();

        try {
            const response = await new Promise<string>((resolve, reject) => {
                geocoder.geocode(
                    {
                        location: { lat, lng },
                        language: 'ar',
                        region: 'KW'
                    },
                    (results: any[], status: string) => {
                        if (status === 'OK' && results && results[0]) {
                            resolve(results[0].formatted_address);
                        } else {
                            reject('فشل في تحديد الموقع');
                        }
                    }
                );
            });
            return response;
        } catch (error) {
            return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
    };

    // Search for places
    const searchPlaces = (query: string) => {
        if (!window.google || !map || query.length < 3) {
            setSearchSuggestions([]);
            return;
        }

        const service = new window.google.maps.places.PlacesService(map);
        const request = {
            query: query,
            fields: ['name', 'formatted_address', 'geometry'],
            region: 'KW',
            language: 'ar'
        };

        service.textSearch(request, (results: any[], status: string) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const suggestions = results.slice(0, 5).map((place) => place.formatted_address);
                setSearchSuggestions(suggestions);
            }
        });
    };

    // Handle search selection
    const handleSearchSelect = (address: string) => {
        if (!window.google || !map) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            {
                address,
                language: 'ar',
                region: 'KW'
            },
            (results: any[], status: string) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    map.setCenter(location);
                    map.setZoom(15);

                    // Add point at searched location
                    handleMapClick(location, map);

                    // Clear search input and switch to opposite mode
                    setSearchValue('');
                    setSearchSuggestions([]);
                    switchToOppositeMode();
                }
            }
        );
    };

    // Remove a point
    const removePoint = (pointId: number, marker: any): void => {
        setFromPoints((prev) => prev.filter((p) => p.id !== pointId));
        setToPoints((prev) => prev.filter((p) => p.id !== pointId));

        marker.setMap(null);
        setMarkers((prev) => prev.filter((m) => m.id !== pointId));

        toast.success('تم حذف النقطة');
    };

    // Delete entire route pair
    const deleteRoute = (routeIndex: number): void => {
        const pairs = createRoutePairs();
        const routeToDelete = pairs[routeIndex];

        if (routeToDelete.from) {
            const fromMarker = markers.find((m) => m.id === routeToDelete.from!.id);
            if (fromMarker) {
                fromMarker.marker.setMap(null);
            }
            setFromPoints((prev) => prev.filter((p) => p.id !== routeToDelete.from!.id));
        }

        if (routeToDelete.to) {
            const toMarker = markers.find((m) => m.id === routeToDelete.to!.id);
            if (toMarker) {
                toMarker.marker.setMap(null);
            }
            setToPoints((prev) => prev.filter((p) => p.id !== routeToDelete.to!.id));
        }

        setMarkers((prev) => prev.filter((m) => (routeToDelete.from ? m.id !== routeToDelete.from.id : true) && (routeToDelete.to ? m.id !== routeToDelete.to.id : true)));

        toast.error(`تم حذف الطريق رقم ${routeIndex + 1}`);
    };

    // Handle map click to add points
    const handleMapClick = useCallback(
        async (latLng: any, mapInstance: any): Promise<void> => {
            const lat = latLng.lat();
            const lng = latLng.lng();

            setIsLoading(true);
            const address = await getAddressFromCoords(lat, lng);
            setIsLoading(false);

            const newPoint: RoutePoint = {
                id: Date.now() + Math.random(),
                lat,
                lng,
                address
            };

            // Create marker
            const marker = new window.google.maps.Marker({
                position: { lat, lng },
                map: mapInstance,
                title: address,
                icon: {
                    url:
                        selectedMode === 'from'
                            ? 'data:image/svg+xml;charset=UTF-8,' +
                              encodeURIComponent(`
                                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="16" cy="16" r="12" fill="#22C55E" stroke="white" stroke-width="3"/>
                                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">ب</text>
                                </svg>
                              `)
                            : 'data:image/svg+xml;charset=UTF-8,' +
                              encodeURIComponent(`
                                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                  <circle cx="16" cy="16" r="12" fill="#EF4444" stroke="white" stroke-width="3"/>
                                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">ن</text>
                                </svg>
                              `),
                    scaledSize: new window.google.maps.Size(32, 32)
                }
            });

            marker.addListener('click', () => {
                removePoint(newPoint.id, marker);
            });

            if (selectedMode === 'from') {
                setFromPoints((prev) => [...prev, newPoint]);
            } else {
                setToPoints((prev) => [...prev, newPoint]);
            }

            setMarkers((prev) => [...prev, { id: newPoint.id, marker, type: selectedMode }]);

            toast.success(`تم إضافة نقطة ${selectedMode === 'from' ? 'البداية' : 'النهاية'}`);

            // Auto-switch to opposite mode after adding a point
            autoSwitchMode();
        },
        [selectedMode, autoSwitchMode]
    );

    // Initialize Google Maps
    useEffect(() => {
        const initMap = (): void => {
            if (window.google && mapRef.current) {
                const mapInstance = new window.google.maps.Map(mapRef.current, {
                    center: { lat: 29.3759, lng: 47.9774 }, // Kuwait City center
                    zoom: 12,
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    language: 'ar',
                    region: 'KW'
                });

                const directionsServiceInstance = new window.google.maps.DirectionsService();
                setDirectionsService(directionsServiceInstance);

                mapInstance.addListener('click', (event: any) => {
                    if (event.latLng) {
                        handleMapClick(event.latLng, mapInstance);
                    }
                });

                setMap(mapInstance);
            }
        };

        if (!window.google) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBXtCo4Q7YG2xwkef6OklAOTXqatfK6n6M&libraries=places&language=ar&region=KW`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);
        } else {
            initMap();
        }
    }, [handleMapClick]);

    // Clear all points
    const clearAllPoints = (): void => {
        markers.forEach(({ marker }) => marker.setMap(null));
        directionsRenderers.forEach((renderer) => renderer.setMap(null));
        setMarkers([]);
        setFromPoints([]);
        setToPoints([]);
        setDirectionsRenderers([]);

        toast.error(t('allPointsCleared'));
    };

    const getAllData = (): RouteData => {
        return {
            fromPoints: fromPoints.map((point) => ({
                id: point.id,
                coordinates: { lat: point.lat, lng: point.lng },
                address: point.address
            })),
            toPoints: toPoints.map((point) => ({
                id: point.id,
                coordinates: { lat: point.lat, lng: point.lng },
                address: point.address
            }))
        };
    };

    const getShortAddress = (address: string) => {
        return address.length > 40 ? address.substring(0, 40) + '...' : address;
    };

    return (
        <div
            className="flex overflow-hidden rubik-font gap-2"
            style={{
                height: 'calc(100vh - 9rem)',
                borderRadius: '0.5rem',
                direction: 'rtl'
            }}
        >
            {/* Right Sidebar - Now on the right for RTL */}
            <div
                className="card w-22rem bg-white flex flex-column"
                style={{
                    height: 'calc(100vh - 9rem)',
                    borderRadius: '0.5rem',
                    direction: 'rtl'
                }}
            >
                {/* Mode Selection */}
                <div className="p-4 border-bottom-1 border-gray-200">
                    <div className="mb-3">
                        <div className="text-center mb-2">
                            <span className="text-sm text-600" style={{ fontFamily: `Rubik, sans-serif` }}>
                                {t('currentMode', { mode: t(selectedMode === 'from' ? 'addFromPoints' : 'addToPoints') })}
                            </span>
                        </div>
                    </div>
                    <div className="p-buttonset w-full flex-1 flex gap-2">
                        <Button
                            label={t('from')}
                            onClick={() => setSelectedMode('from')}
                            className={`flex-1 font-semibold ${selectedMode === 'from' ? '' : 'p-button-outlined'}`}
                            style={{
                                backgroundColor: selectedMode === 'from' ? '#22C55E' : 'transparent',
                                borderColor: '#22C55E',
                                color: selectedMode === 'from' ? 'white' : '#22C55E',
                                fontFamily: `Rubik, sans-serif`
                            }}
                        />
                        <Button
                            label={t('to')}
                            onClick={() => setSelectedMode('to')}
                            className={`flex-1 font-semibold ${selectedMode === 'to' ? '' : 'p-button-outlined'}`}
                            style={{
                                backgroundColor: selectedMode === 'to' ? '#EF4444' : 'transparent',
                                borderColor: '#EF4444',
                                color: selectedMode === 'to' ? 'white' : '#EF4444',
                                fontFamily: `Rubik, sans-serif`
                            }}
                        />
                    </div>
                    <div className="mt-2 text-center">
                        <Button
                            icon={
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M9 7C7.67392 7 6.40215 7.52678 5.46447 8.46447C4.52678 9.40215 4 10.6739 4 12C4 13.3261 4.52678 14.5979 5.46447 15.5355C6.40215 16.4732 7.67392 17 9 17H15C16.3261 17 17.5979 16.4732 18.5355 15.5355C19.4732 14.5979 20 13.3261 20 12C20 10.6739 19.4732 9.40215 18.5355 8.46447C17.5979 7.52678 16.3261 7 15 7H9ZM9 5H15C16.8565 5 18.637 5.7375 19.9497 7.05025C21.2625 8.36301 22 10.1435 22 12C22 13.8565 21.2625 15.637 19.9497 16.9497C18.637 18.2625 16.8565 19 15 19H9C7.14348 19 5.36301 18.2625 4.05025 16.9497C2.7375 15.637 2 13.8565 2 12C2 10.1435 2.7375 8.36301 4.05025 7.05025C5.36301 5.7375 7.14348 5 9 5V5ZM9 16C7.93913 16 6.92172 15.5786 6.17157 14.8284C5.42143 14.0783 5 13.0609 5 12C5 10.9391 5.42143 9.92172 6.17157 9.17157C6.92172 8.42143 7.93913 8 9 8C10.0609 8 11.0783 8.42143 11.8284 9.17157C12.5786 9.92172 13 10.9391 13 12C13 13.0609 12.5786 14.0783 11.8284 14.8284C11.0783 15.5786 10.0609 16 9 16ZM9 14C9.53043 14 10.0391 13.7893 10.4142 13.4142C10.7893 13.0391 11 12.5304 11 12C11 11.4696 10.7893 10.9609 10.4142 10.5858C10.0391 10.2107 9.53043 10 9 10C8.46957 10 7.96086 10.2107 7.58579 10.5858C7.21071 10.9609 7 11.4696 7 12C7 12.5304 7.21071 13.0391 7.58579 13.4142C7.96086 13.7893 8.46957 14 9 14Z"
                                        fill="hsla(46, 84%, 39%, 1)"
                                    />
                                </svg>
                            }
                            label={t('switchToOppositeMode')}
                            onClick={switchToOppositeMode}
                            className="p-button-text p-button-sm"
                            style={{
                                fontFamily: `Rubik, sans-serif`,
                                fontSize: '0.75rem'
                            }}
                            tooltip={t('switchToMode', { mode: t(selectedMode === 'from' ? 'to' : 'from') })}
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>

                {/* Selected Points Header */}
                <div className="px-4 py-3 bg-gray-50 border-bottom-1 border-gray-200">
                    <div className="flex align-items-center justify-content-between">
                        <h3 className="m-0 text-lg font-semibold text-900" style={{ fontFamily: `Rubik, sans-serif` }}>
                            {t('selectedPoints')}
                        </h3>
                        <div className="flex gap-2">
                            <Badge value={fromPoints.length} severity="success" className="bg-green-100 text-green-800" />
                            <Badge value={toPoints.length} severity="danger" className="bg-red-100 text-red-800" />
                        </div>
                    </div>
                </div>

                {/* Route Pairs - Compact Version */}
                <div className="flex-1 overflow-y-auto p-4">
                    {createRoutePairs().map((pair, index) => (
                        <div 
                            key={pair.id}
                            className="card mb-3 shadow-2 border-1 p-3"
                            style={{
                                borderRight: `4px solid ${index % 2 === 0 ? '#3B82F6' : '#8B5CF6'}`,
                                borderColor: '#E5E7EB'
                            }}
                        >
                            <div className="p-0">
                                {/* Route Header with Delete Button */}
                                <div className="flex align-items-center justify-content-between mb-2">
                                    <div className="flex align-items-center gap-2">
                                        <h4 className="m-0 text-sm font-semibold text-900" style={{ fontFamily: `Rubik, sans-serif` }}>
                                            {t('route', { index: index + 1 })}
                                        </h4>
                                        <div
                                            className="w-0-5rem h-0-5rem border-round"
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#3B82F6' : '#8B5CF6'
                                            }}
                                        ></div>
                                    </div>
                                    <Button
                                        icon={
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M13.314 11.8999L16.849 8.36394C16.9445 8.27169 17.0207 8.16135 17.0731 8.03935C17.1255 7.91734 17.1531 7.78612 17.1543 7.65334C17.1554 7.52056 17.1301 7.38888 17.0798 7.26599C17.0295 7.14309 16.9553 7.03144 16.8614 6.93755C16.7675 6.84365 16.6559 6.7694 16.533 6.71912C16.4101 6.66884 16.2784 6.64354 16.1456 6.64469C16.0128 6.64584 15.8816 6.67343 15.7596 6.72584C15.6376 6.77825 15.5273 6.85443 15.435 6.94994L11.899 10.4849L8.364 6.94994C8.27176 6.85443 8.16141 6.77825 8.03941 6.72584C7.9174 6.67343 7.78618 6.64584 7.6534 6.64469C7.52062 6.64354 7.38894 6.66884 7.26605 6.71912C7.14315 6.7694 7.0315 6.84365 6.93761 6.93755C6.84371 7.03144 6.76946 7.14309 6.71918 7.26599C6.6689 7.38888 6.6436 7.52056 6.64475 7.65334C6.64591 7.78612 6.67349 7.91734 6.7259 8.03935C6.77831 8.16135 6.85449 8.27169 6.95 8.36394L10.485 11.8989L6.95 15.4349C6.85449 15.5272 6.77831 15.6375 6.7259 15.7595C6.67349 15.8815 6.64591 16.0128 6.64475 16.1455C6.6436 16.2783 6.6689 16.41 6.71918 16.5329C6.76946 16.6558 6.84371 16.7674 6.93761 16.8613C7.0315 16.9552 7.14315 17.0295 7.26605 17.0798C7.38894 17.13 7.52062 17.1553 7.6534 17.1542C7.78618 17.153 7.9174 17.1255 8.03941 17.073C8.16141 17.0206 8.27176 16.9445 8.364 16.8489L11.899 13.3139L15.435 16.8489C15.5273 16.9445 15.6376 17.0206 15.7596 17.073C15.8816 17.1255 16.0128 17.153 16.1456 17.1542C16.2784 17.1553 16.4101 17.13 16.533 17.0798C16.6559 17.0295 16.7675 16.9552 16.8614 16.8613C16.9553 16.7674 17.0295 16.6558 17.0798 16.5329C17.1301 16.41 17.1554 16.2783 17.1543 16.1455C17.1531 16.0128 17.1255 15.8815 17.0731 15.7595C17.0207 15.6375 16.9445 15.5272 16.849 15.4349L13.314 11.8989V11.8999Z"
                                                    fill="black"
                                                />
                                            </svg>
                                        }
                                        onClick={() => deleteRoute(index)}
                                        className="p-button-text p-button-danger p-button-sm"
                                        style={{ padding: '0.25rem' }}
                                        tooltip={t('deleteRoute')}
                                        tooltipOptions={{ position: 'left' }}
                                    />
                                </div>

                                {/* Compact From/To Display */}
                                <div className="flex flex-column gap-2">
                                    {/* From Point */}
                                    <div className="flex align-items-center gap-2">
                                        <div className="w-1-5rem h-1-5rem border-round flex align-items-center justify-content-center bg-green-100 flex-shrink-0">
                                            <i className="pi pi-circle-fill text-green-600" style={{ fontSize: '0.5rem' }}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {pair.from ? (
                                                <div className="bg-green-50 p-2 border-round border-1 border-green-200">
                                                    <p className="m-0 text-xs text-900 line-height-2 font-medium" style={{ fontFamily: `Rubik, sans-serif` }}>
                                                        {getShortAddress(pair.from.address)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-2 border-round border-1 border-gray-200">
                                                    <span className="text-xs text-400 italic" style={{ fontFamily: `Rubik, sans-serif` }}>
                                                        {t('noFromPoint')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* To Point */}
                                    <div className="flex align-items-center gap-2">
                                        <div className="w-1-5rem h-1-5rem border-round flex align-items-center justify-content-center bg-red-100 flex-shrink-0">
                                            <i className="pi pi-circle-fill text-red-600" style={{ fontSize: '0.5rem' }}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {pair.to ? (
                                                <div className="bg-red-50 p-2 border-round border-1 border-red-200">
                                                    <p className="m-0 text-xs text-900 line-height-2 font-medium" style={{ fontFamily: `Rubik, sans-serif` }}>
                                                        {getShortAddress(pair.to.address)}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-2 border-round border-1 border-gray-200">
                                                    <span className="text-xs text-400 italic" style={{ fontFamily: `Rubik, sans-serif` }}>
                                                        {t('noToPoint')}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {fromPoints.length === 0 && toPoints.length === 0 && (
                        <div className="text-center p-6 text-500">
                            <i className="pi pi-map text-6xl mb-4 opacity-20"></i>
                            <h3 className="text-xl mb-3 text-700" style={{ fontFamily: `Rubik, sans-serif` }}>
                                {t('noRoutes')}
                            </h3>
                            <p className="text-sm line-height-3 mb-4" style={{ fontFamily: `Rubik, sans-serif` }}>
                                {t('noRoutesDesc', { mode: t(selectedMode) })}
                            </p>
                            <div className="flex justify-content-center gap-3">
                                <div className="flex align-items-center gap-2">
                                    <div className="w-1rem h-1rem bg-green-500 border-round"></div>
                                    <span className="text-xs" style={{ fontFamily: `Rubik, sans-serif` }}>
                                        {t('fromPoints')}
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="w-1rem h-1rem bg-red-500 border-round"></div>
                                    <span className="text-xs" style={{ fontFamily: `Rubik, sans-serif` }}>
                                        {t('toPoints')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                {(fromPoints.length > 0 || toPoints.length > 0) && (
                    <div className="p-4 border-top-1 border-gray-200 bg-gray-50">
                        <div className="flex flex-column gap-3">
                            <Button
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 13.5C21 16.5 19 21.5 12 21.5C5 21.5 3 16.5 3 13.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.0039 2.55029V16.5001" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6 8.5L12 2.5L18 8.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                }
                                loading={openingLoading}
                                label={t('continueCalculation')}
                                onClick={async () => {
                                    const data = getAllData();
                                    const result = await calculateDeliveryData('transportation', data);
                                    setKey('openingLoading', true);
                                    setRouteData(data);
                                    setCalculatedData(result);
                                    onShow();
                                }}
                                className="w-full font-semibold"
                                severity="info"
                                style={{ fontFamily: `Rubik, sans-serif` }}
                            />
                            <Button
                                icon={
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 16C13.671 16 15 14.669 15 13C15 11.331 13.671 10 12 10C10.329 10 9 11.331 9 13C9 14.669 10.329 16 12 16Z" fill="hsla(215, 16%, 47%, 1)" />
                                        <path
                                            d="M20.817 11.186C20.5814 10.0344 20.1209 8.94048 19.462 7.967C18.8146 7.00928 17.9897 6.18442 17.032 5.537C16.0584 4.87833 14.9646 4.41789 13.813 4.182C13.2081 4.05933 12.5922 3.99901 11.975 4.002V2L8 5L11.975 8V6.002C12.459 6 12.943 6.046 13.41 6.142C14.305 6.32541 15.1552 6.68321 15.912 7.195C16.6584 7.69824 17.3008 8.34063 17.804 9.087C18.5853 10.2422 19.002 11.6054 19 13C18.9998 13.9359 18.8128 14.8623 18.45 15.725C18.2735 16.1405 18.0579 16.5383 17.806 16.913C17.5531 17.2854 17.2659 17.6332 16.948 17.952C15.98 18.9182 14.7511 19.5809 13.412 19.859C12.4807 20.047 11.5213 20.047 10.59 19.859C9.69456 19.6754 8.84404 19.3173 8.087 18.805C7.34148 18.3022 6.6998 17.6605 6.197 16.915C5.41656 15.7585 4.9997 14.3952 5 13H3C3.00106 14.7937 3.53689 16.5463 4.539 18.034C5.18685 18.9901 6.01086 19.8142 6.967 20.462C8.45262 21.4675 10.2061 22.0033 12 22C12.6093 21.9999 13.217 21.9386 13.814 21.817C14.9647 21.5794 16.0579 21.1191 17.032 20.462C17.5103 20.1397 17.956 19.7717 18.363 19.363C18.7705 18.9544 19.1388 18.5084 19.463 18.031C20.4676 16.5458 21.0031 14.7931 21 13C20.9999 12.3907 20.9386 11.783 20.817 11.186Z"
                                            fill="hsla(215, 16%, 47%, 1)"
                                        />
                                    </svg>
                                }
                                label={t('clearAllRoutes')}
                                onClick={clearAllPoints}
                                className="w-full font-semibold"
                                severity="secondary"
                                outlined
                                style={{ fontFamily: `Rubik, sans-serif` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Map Section - Now on the left for RTL */}
            <div className="card flex-1 relative">
                <div ref={mapRef} className="w-full h-full" />

                {/* Search Input Overlay - Top Center */}
                <div
                    style={{
                        position: 'absolute',
                        top: '3rem',
                        left: '50%',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <div>
                        <AutoComplete
                            dir="rtl"
                            value={searchValue}
                            suggestions={searchSuggestions}
                            completeMethod={(e) => searchPlaces(e.query)}
                            onChange={(e) => setSearchValue(e.value)}
                            onSelect={(e) => handleSearchSelect(e.value)}
                            inputStyle={{
                                width: '360px',
                                border: '1px solid #ccc',
                                borderRadius: '0.25rem',
                                textAlign: 'right',
                                direction: 'rtl',
                                fontFamily: `Rubik, sans-serif`
                            }}
                            panelStyle={{
                                border: '1px solid #ccc',
                                borderRadius: '0.25rem',
                                direction: 'rtl',
                                width: '360px',
                                fontFamily: `Rubik, sans-serif`
                            }}
                            placeholder={t('searchPlaceholder')}
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                setSearchValue(target.value);
                                searchPlaces(target.value);
                            }}
                        />
                        {/* Mode indicator for search */}
                        <div className="mt-1 text-center">
                            <span
                                className="text-xs px-2 py-1 border-round"
                                style={{
                                    backgroundColor: selectedMode === 'from' ? '#22C55E20' : '#EF444420',
                                    color: selectedMode === 'from' ? '#22C55E' : '#EF4444',
                                    fontFamily: `Rubik, sans-serif`
                                }}
                            >
                                {t('searchAddPoint', { mode: t(selectedMode) })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black-alpha-20 flex align-items-center justify-content-center">
                        <Card className="shadow-3">
                            <div className="flex align-items-center gap-3 p-2">
                                <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                                <span style={{ fontFamily: `Rubik, sans-serif` }}>جاري الحصول على العنوان...</span>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapRouteSelector;
