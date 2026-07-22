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
        // Удобные обертки
        getConfig: () => execute(() => api.getConfig()),
        getSystemInfo: () => execute(() => api.getSystemInfo()),
        getActuatorsStatus: () => execute(() => api.getActuatorsStatus()),
        getLog: (lines?: number) => execute(() => api.getLog(lines)),
        updateSettings: (settings: api.UpdateSettings) => execute(() => api.updateSettings(settings)),
        motionCommand: (cmd: api.MotionCommands) => execute(() => api.motionCommand(cmd)),
        uiButtons: (cmd: api.UiButtons) => execute(() => api.uiButtons(cmd)),
        securityUnlock: (cmd: api.Security) => execute(() => api.securityUnlock(cmd)),
        autocalibration: (cmd: api.AutocalibrationCommand) => execute(() => api.autocalibration(cmd)),
        actuatorCommand: (cmd: api.ActuatorCommand) => execute(() => api.actuatorCommand(cmd)),
        startProcedure: (cmd: api.StartProcedure) => execute(() => api.startProcedure(cmd)),
        pauseProcedure: (cmd: api.PauseProcedure) => execute(() => api.pauseProcedure(cmd)),
        stopProcedure: (cmd: api.StopProcedure) => execute(() => api.stopProcedure(cmd)),
        resumeProcedure: (cmd: api.ResumeProcedure) => execute(() => api.resumeProcedure(cmd)),
    };
}