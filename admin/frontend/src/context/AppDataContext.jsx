import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useWebSocket } from './WebSocketContext';

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
    const [systemInfo, setSystemInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { events } = useWebSocket();

    // Initial fetch of dashboard summary and global state
    const fetchGlobalData = async () => {
        try {
            const { data } = await axios.get('/api/system/dashboard-summary');
            setSystemInfo(data);
        } catch (error) {
            console.error('Failed to fetch global data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGlobalData();
    }, []);

    // Sync state with websocket events (e.g. if a complaint is created, refresh summary)
    useEffect(() => {
        if (events.length > 0) {
            const latestEvent = events[events.length - 1];
            // For some events, we want to refetch the dashboard summary to keep it synced
            if (
                latestEvent.event === 'complaint_created' ||
                latestEvent.event === 'complaint_updated' ||
                latestEvent.event === 'complaints_bulk_action'
            ) {
                fetchGlobalData();
            }
        }
    }, [events]);

    return (
        <AppDataContext.Provider value={{ systemInfo, fetchGlobalData, loading }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => useContext(AppDataContext);
