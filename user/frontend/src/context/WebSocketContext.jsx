import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const connect = () => {
            // Connect to the proxy URL
            ws.current = new WebSocket(`ws://${window.location.host}/ws`);

            ws.current.onopen = () => {
                setIsConnected(true);
                console.log('WebSocket connected');
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                console.log('WebSocket disconnected, retrying...');
                setTimeout(connect, 3000);
            };

            ws.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setEvents((prev) => [...prev, data]);

                    // Optionally trigger global events via standard JS CustomEvents for components to listen to
                    window.dispatchEvent(new CustomEvent('ws-event', { detail: data }));
                } catch (e) {
                    console.error('Failed to parse WebSocket message', e);
                }
            };
        };

        connect();

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ isConnected, ws: ws.current, events }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => useContext(WebSocketContext);
