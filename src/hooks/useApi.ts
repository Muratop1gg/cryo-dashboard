// hooks/useApi.ts
import { useCallback, useState } from 'react';
import * as api from '../lib/api.ts';

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async <T>(
        apiCall: () => Promise<T>
    ): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        execute,

        // GET запросы
        getConfig: () => execute(() => api.getConfig()),
        getSettings: () => execute(() => api.getSettings()),

        // Управление процедурой
        startProcedure: () => execute(() => api.StartProcedure()),
        pauseProcedure: () => execute(() => api.PauseProcedure()),
        stopProcedure: () => execute(() => api.StopProcedure()),
        resumeProcedure: () => execute(() => api.ResumeProcedure()),

        // Управление тестами
        startSelfTest: () => execute(() => api.StartSelfTest()),
        startSelfTestDry: () => execute(() => api.StartSelfTestDry()),
        stopSelfTest: () => execute(() => api.StopSelfTest()),

        // Управление настройками
        updateSettings: (settings: api.POST.SettingsData) =>
            execute(() => api.UpdateSettings(settings)),

        updateConfiguration: (config: api.POST.SystemConfiguration) =>
            execute(() => api.UpdateConfiguration(config)),

        // Управление разблокировкой
        requestUnlock: () => execute(() => api.RequestUnlock()),
        checkUnlockCode: (code: string) =>
            execute(() => api.CheckUnlockCode(code)),
    };
}