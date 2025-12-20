import React, { createContext, useContext, useState, useCallback } from 'react';

interface ApiNotification {
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ApiNotificationContextType {
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
    currentNotification: ApiNotification | null;
}

const ApiNotificationContext = createContext<ApiNotificationContextType>({
    showNotification: () => { },
    currentNotification: null,
});

export const useApiNotification = () => useContext(ApiNotificationContext);

export function ApiNotificationProvider({ children }: { children: React.ReactNode }) {
    const [currentNotification, setCurrentNotification] = useState<ApiNotification | null>(null);

    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setCurrentNotification({ message, type });

        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            setCurrentNotification(null);
        }, 3000);
    }, []);

    return (
        <ApiNotificationContext.Provider value={{ showNotification, currentNotification }}>
            {children}
        </ApiNotificationContext.Provider>
    );
}
