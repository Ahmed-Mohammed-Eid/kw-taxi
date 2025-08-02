'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { AutoComplete } from 'primereact/autocomplete';

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

interface RouteData {
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

const MapRouteSelector: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const toast = useRef<Toast>(null);
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
    const autoSwitchMode = () => {
        if (selectedMode === 'from') {
            // If we just added a start point, switch to end mode
            switchToOppositeMode();
        } else {
            // If we just added an end point, check if we need another route
            // Switch to start mode for the next route
            switchToOppositeMode();
        }
    };

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

        toast.current?.show({
            severity: 'info',
            summary: 'تم حذف النقطة',
            detail: 'تم حذف نقطة الطريق من الخريطة',
            life: 3000
        });
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

        toast.current?.show({
            severity: 'warn',
            summary: 'تم حذف الطريق',
            detail: `تم حذف الطريق رقم ${routeIndex + 1}`,
            life: 3000
        });
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

            toast.current?.show({
                severity: 'success',
                summary: `تم إضافة نقطة ${selectedMode === 'from' ? 'البداية' : 'النهاية'}`,
                detail: 'تم إضافة نقطة طريق جديدة على الخريطة',
                life: 3000
            });

            // Auto-switch to opposite mode after adding a point
            autoSwitchMode();
        },
        [selectedMode]
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

        toast.current?.show({
            severity: 'warn',
            summary: 'تم مسح جميع النقاط',
            detail: 'تم حذف جميع نقاط الطرق',
            life: 3000
        });
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
            <Toast ref={toast} />

            {/* Right Sidebar - Now on the right for RTL */}
            <div className="card w-22rem bg-white flex flex-column" 
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
                                الوضع الحالي: {selectedMode === 'from' ? 'إضافة نقاط البداية' : 'إضافة نقاط النهاية'}
                            </span>
                        </div>
                    </div>
                    <div className="p-buttonset w-full flex-1 flex gap-2">
                        <Button
                            label="بداية"
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
                            label="نهاية"
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
                            icon="pi pi-refresh"
                            label="التبديل إلى الوضع المقابل"
                            onClick={switchToOppositeMode}
                            className="p-button-text p-button-sm"
                            style={{
                                fontFamily: `Rubik, sans-serif`,
                                fontSize: '0.75rem'
                            }}
                            tooltip={`التبديل إلى وضع ${selectedMode === 'from' ? 'النهاية' : 'البداية'}`}
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>

                {/* Selected Points Header */}
                <div className="px-4 py-3 bg-gray-50 border-bottom-1 border-gray-200">
                    <div className="flex align-items-center justify-content-between">
                        <h3 className="m-0 text-lg font-semibold text-900" style={{ fontFamily: `Rubik, sans-serif` }}>
                            النقاط المحددة
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
                        <Card
                            key={pair.id}
                            className="mb-3 shadow-2 border-1"
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
                                            طريق رقم {index + 1}
                                        </h4>
                                        <div
                                            className="w-0-5rem h-0-5rem border-round"
                                            style={{
                                                backgroundColor: index % 2 === 0 ? '#3B82F6' : '#8B5CF6'
                                            }}
                                        ></div>
                                    </div>
                                    <Button icon="pi pi-trash" onClick={() => deleteRoute(index)} className="p-button-text p-button-danger p-button-sm" style={{ padding: '0.25rem' }} tooltip="حذف الطريق" tooltipOptions={{ position: 'left' }} />
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
                                                        لا توجد نقطة بداية
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
                                                        لا توجد نقطة نهاية
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Empty State */}
                    {fromPoints.length === 0 && toPoints.length === 0 && (
                        <div className="text-center p-6 text-500">
                            <i className="pi pi-map text-6xl mb-4 opacity-20"></i>
                            <h3 className="text-xl mb-3 text-700" style={{ fontFamily: `Rubik, sans-serif` }}>
                                لا توجد طرق محددة
                            </h3>
                            <p className="text-sm line-height-3 mb-4" style={{ fontFamily: `Rubik, sans-serif` }}>
                                اضغط على الخريطة أو ابحث عن مكان لإضافة نقطة {selectedMode === 'from' ? 'البداية' : 'النهاية'}. سيتم التبديل تلقائياً للوضع التالي بعد كل إضافة.
                            </p>
                            <div className="flex justify-content-center gap-3">
                                <div className="flex align-items-center gap-2">
                                    <div className="w-1rem h-1rem bg-green-500 border-round"></div>
                                    <span className="text-xs" style={{ fontFamily: `Rubik, sans-serif` }}>
                                        نقاط البداية
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="w-1rem h-1rem bg-red-500 border-round"></div>
                                    <span className="text-xs" style={{ fontFamily: `Rubik, sans-serif` }}>
                                        نقاط النهاية
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
                                icon="pi pi-download"
                                label="تصدير بيانات الطريق"
                                onClick={() => {
                                    const data = getAllData();
                                    console.log('Route Data:', data);
                                    toast.current?.show({
                                        severity: 'info',
                                        summary: 'تم تصدير البيانات',
                                        detail: 'تم حفظ بيانات الطريق في وحدة التحكم',
                                        life: 3000
                                    });
                                }}
                                className="w-full font-semibold"
                                severity="info"
                                style={{ fontFamily: `Rubik, sans-serif` }}
                            />
                            <Button icon="pi pi-trash" label="مسح جميع الطرق" onClick={clearAllPoints} className="w-full font-semibold" severity="secondary" outlined style={{ fontFamily: `Rubik, sans-serif` }} />
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
                            placeholder="ابحث عن الأماكن في الكويت"
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
                                البحث لإضافة نقطة {selectedMode === 'from' ? 'البداية' : 'النهاية'}
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
