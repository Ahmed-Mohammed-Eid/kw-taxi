import { create } from 'zustand';

import type { RouteData } from '../components/map-points/map-route-selector';
import type { LocationsData } from '../actions/calculate-delivery-data';

type MapManagementStore = {
    routeData: RouteData;
    setRouteData: (data: RouteData) => void;
    calculatedDataDialog: {
        openingLoading?: boolean;
        data: LocationsData | null;
        visible: boolean;
        onHide: () => void;
        onShow: () => void;
        setCalculatedData: (data: LocationsData | null) => void;
        setKey: (key: string, value: any) => void;
    };
};

const mapManagementStore = create<MapManagementStore>((set) => ({
    routeData: {
        fromPoints: [],
        toPoints: []
    },
    setRouteData: (data: RouteData) => set({ routeData: data }),
    calculatedDataDialog: {
        openingLoading: false,
        data: null,
        visible: false,
        onHide: () =>
            set({
                calculatedDataDialog: {
                    ...mapManagementStore.getState().calculatedDataDialog,
                    visible: false,
                    data: null,
                    openingLoading: false
                }
            }),
        onShow: () =>
            set({
                calculatedDataDialog: {
                    ...mapManagementStore.getState().calculatedDataDialog,
                    visible: true
                }
            }),
        setCalculatedData: (data: LocationsData | null) => {
            set({
                calculatedDataDialog: {
                    ...mapManagementStore.getState().calculatedDataDialog,
                    data
                }
            });
        },
        setKey: (key: string, value: any) => {
            set({
                calculatedDataDialog: {
                    ...mapManagementStore.getState().calculatedDataDialog,
                    [key]: value
                }
            });
        }
    }
}));

export default mapManagementStore;
