import { useState, useEffect } from "react";
import Dialog from "./Dialog";
import Toggle from "./Toggle";
import { Slider } from "./ui/slider";
import WiFiDialog from "./WiFiDialog";
import LEDDialog from "./LEDDialog";
import Button from "./button";
import UnlockDialog from "./UnlockDialog";
import { Loader2 } from "lucide-react";
import { useApi } from "../hooks/useApi";
import * as api from "../lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface SettingsMenuProps {
    open?: boolean
    onOpenChange(): void
}


function SettingsMenu({ open = false, onOpenChange }: SettingsMenuProps) {
    const api = useApi();

    // Состояния для данных
    const [adminInfo, setAdminInfo] = useState<api.WS.SensorsData | null>(null);
    const [currentSettings, setCurrentSettings] = useState<api.GET.SettingsData | null>(null);
    const [originalSettings, setOriginalSettings] = useState<api.GET.SettingsData | null>(null);
    const [selectedColor, setSelectedColor] = useState<string>("#121212");
    const [selfTestRunning, setSelfTestRunning] = useState(false);
    const [testStage, setTestStage] = useState<string | undefined>(undefined);

    // Состояния для диалогов
    const [wifiOpen, setIsWiFiOpen] = useState(false);
    const [ledOpen, setIsLEDOpen] = useState(false);
    const [unlockOpen, setIsUnlockOpen] = useState(false);

    // Состояния загрузки и ошибок
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { sensorData } = useWebSocket();

    useEffect(() => {
        setAdminInfo(sensorData)
    }, [sensorData])

    // Загрузка данных при открытии
    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        setInitialLoading(true);
        setError(null);
        try {
            // Загружаем настройки
            const settings = await api.getSettings();
            if (settings) {
                const formattedSettings: api.GET.SettingsData = {
                    led_color: settings.led_color || "#121212",
                    led_active: settings.led_active || false,
                    blocked: settings.blocked || "no",
                    time_s1_sec: settings.time_s1_sec || 0,
                    time_s2_sec: settings.time_s2_sec || 0,
                    time_s3_sec: settings.time_s3_sec || 0,
                    temperature_sp1: settings.temperature_sp1 || 0,
                    temperature_sp2: settings.temperature_sp2 || 0,
                    wifi: settings.wifi || undefined
                };
                setCurrentSettings(formattedSettings);
                setOriginalSettings(formattedSettings);
                setSelectedColor(formattedSettings.led_color);
            }


            setSelfTestRunning(false);
            setTestStage(undefined);
        } catch (err) {
            setError('Ошибка загрузки данных');
            console.error('Error loading data:', err);
        } finally {
            setInitialLoading(false);
        }
    };

    const getChangedSettings = (): api.POST.SettingsData => {
        if (!currentSettings || !originalSettings) return {};

        const changes: api.POST.SettingsData = {};

        if (currentSettings.led_color !== originalSettings.led_color) {
            changes.led_color = currentSettings.led_color;
        }

        if (currentSettings.led_active !== originalSettings.led_active) {
            changes.led_active = currentSettings.led_active;
        }

        if (currentSettings.time_s1_sec !== originalSettings.time_s1_sec) {
            changes.time_s1_sec = currentSettings.time_s1_sec;
        }

        if (currentSettings.time_s2_sec !== originalSettings.time_s2_sec) {
            changes.time_s2_sec = currentSettings.time_s2_sec;
        }

        if (currentSettings.time_s3_sec !== originalSettings.time_s3_sec) {
            changes.time_s3_sec = currentSettings.time_s3_sec;
        }

        if (currentSettings.temperature_sp1 !== originalSettings.temperature_sp1) {
            changes.temperature_sp1 = currentSettings.temperature_sp1;
        }

        if (currentSettings.temperature_sp2 !== originalSettings.temperature_sp2) {
            changes.temperature_sp2 = currentSettings.temperature_sp2;
        }

        if (
            JSON.stringify(currentSettings.wifi) !==
            JSON.stringify(originalSettings.wifi)
        ) {
            changes.wifi = {
                ssid: currentSettings.wifi?.ssid ?? "",
                password: currentSettings.wifi?.password ?? ""
            };
        }

        return changes;
    };

    const changedSettings = getChangedSettings();
    const hasChanges = Object.keys(changedSettings).length > 0;

    const handleColorSave = (color: string) => {
        setSelectedColor(color);
        setCurrentSettings(prev => prev ? {
            ...prev,
            led_color: color
        } : null);
        setIsLEDOpen(false);
    };

    const handleOpen = () => {
        onOpenChange();
    };

    const handleLEDDialog = () => {
        setIsLEDOpen(!ledOpen);
    };

    const handleWifiDialog = () => {
        setIsWiFiOpen(!wifiOpen);
    };

    const handleUnlockDialog = () => {
        setIsUnlockOpen(!unlockOpen);
    };

    const handleCancel = () => {
        if (originalSettings) {
            setCurrentSettings({ ...originalSettings });
            setSelectedColor(originalSettings.led_color);
        }
        setError(null);
        // onOpenChange()
    };

    const handleSave = async () => {
        if (!currentSettings || !originalSettings) return;

        const changes = getChangedSettings();

        if (Object.keys(changes).length === 0) {
            onOpenChange();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const settingsToSave: api.POST.SettingsData = {};

            if (changes.led_color !== undefined) {
                settingsToSave.led_color = changes.led_color;
            }

            if (changes.led_active !== undefined) {
                settingsToSave.led_active = changes.led_active;
            }

            if (changes.time_s1_sec !== undefined) {
                settingsToSave.time_s1_sec = changes.time_s1_sec;
            }
            if (changes.time_s2_sec !== undefined) {
                settingsToSave.time_s2_sec = changes.time_s2_sec;
            }
            if (changes.time_s3_sec !== undefined) {
                settingsToSave.time_s3_sec = changes.time_s3_sec;
            }
            if (changes.temperature_sp1 !== undefined) {
                settingsToSave.temperature_sp1 = changes.temperature_sp1;
            }
            if (changes.temperature_sp2 !== undefined) {
                settingsToSave.temperature_sp2 = changes.temperature_sp2;
            }
            if (changes.wifi !== undefined) {
                settingsToSave.wifi = {
                    ssid: changes.wifi.ssid,
                    password: changes.wifi.password
                };
            }

            const result = await api.updateSettings(settingsToSave);

            if (result) {
                setOriginalSettings({ ...currentSettings });
                // onOpenChange();
            } else {
                setError('Ошибка при сохранении настроек');
            }
        } catch (err) {
            setError('Ошибка при сохранении настроек');
            console.error('Error saving settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWiFiSave = (wifiData: { ssid: string, password: string }) => {
        setCurrentSettings(prev => prev ? {
            ...prev,
            wifi: {
                ssid: wifiData.ssid,
                password: wifiData.password,
            }
        } : null);
    };

    const handleSelfTest = async (type: "self_test" | "dry_self_test") => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (type === "self_test") {
                result = await api.startSelfTest();
            } else {
                result = await api.startSelfTestDry();
            }

            if (result) {
                setSelfTestRunning(true);
            } else {
                setError('Ошибка запуска теста');
            }
        } catch (err) {
            setError('Ошибка запуска теста');
            console.error('Error starting test:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStopSelfTest = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.stopSelfTest();
            if (result) {
                setSelfTestRunning(false);
                setTestStage(undefined);
            } else {
                setError('Ошибка остановки теста');
            }
        } catch (err) {
            setError('Ошибка остановки теста');
            console.error('Error stopping test:', err);
        } finally {
            setLoading(false);
        }
    };

    const isChanged = (key: keyof api.POST.SettingsData) => {
        return key in changedSettings;
    };

    // Вспомогательные функции
    const getHoistStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Стоп"
            case 1:
                return "Движение вверх"
            case 2:
                return "Движение вниз"
            case 3:
                return "Авария"
            default:
                return "Авария"
        }
    };

    const getSteamExhaustStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Стоп"
            case 1:
                return "Включение"
            case 2:
                return "Работа"
            case 3:
                return "Остановка"
            case 4:
                return "Авария"
            default:
                return "Авария"
        }
    };

    const getHeaterChargerStatusText = (status: number) => {
        switch (status) {
            case 0:
                return "Стоп"
            case 1:
                return "Работа"
            case 2:
                return "Авария"
            default:
                return "Авария"
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Стоп":
                return "text-white/40"
            case "Работа":
            case "Движение вверх":
            case "Движение вниз":
                return "text-green-500"
            case "Включение":
            case "Остановка":
                return "text-yellow-500"
            case "Авария":
                return "text-red-500"
            default:
                return "text-red-500"
        }
    };

    // Если данные еще загружаются
    if (initialLoading) {
        return (
            <Dialog z={20} className="py-4 px-4 h-[90vh] top-[5vh] left-[5vh] right-[5vh]" onOpenChange={handleOpen} open={open}>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-white size-16" />
                        <p className="text-white text-xl">Загрузка данных...</p>
                    </div>
                </div>
            </Dialog>
        );
    }

    // Если данные не загрузились или произошла ошибка
    if (!currentSettings || !adminInfo) {
        return (
            <Dialog z={20} className="py-4 px-4 h-[90vh] top-[5vh] left-[5vh] right-[5vh]" onOpenChange={handleOpen} open={open}>
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-red-500 text-xl">Ошибка загрузки данных</p>
                        <Button onClick={loadData}>Повторить</Button>
                    </div>
                </div>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog z={20} className="py-4 px-4 h-[90vh] top-[5vh] left-[5vh] right-[5vh]" onOpenChange={handleOpen} open={open}>
                {/* Оверлей загрузки */}
                {(loading || initialLoading) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-xl">
                        <Loader2 className="animate-spin text-white size-12" />
                    </div>
                )}

                {/* Отображение ошибок */}
                {error && (
                    <div className="absolute top-4 right-4 bg-red-500/20 border border-red-500 text-red-500 px-4 py-2 rounded-lg z-50">
                        {error}
                        <button
                            className="ml-4 text-white hover:text-red-300"
                            onClick={() => setError(null)}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 w-full text-white gap-4">
                    {/* Левая колонка - статусы */}
                    <div>
                        <p className="text-2xl font-bold">Статусы</p>
                        <div className="border border-white/18 my-3" />
                        <div className="grid grid-cols-2 gap-2">
                            <p>Лебёдка подъемника пациента:</p>
                            <p className={`${getStatusColor(getHoistStatusText(adminInfo.stats.patient_hoist))} font-medium`}>
                                {getHoistStatusText(adminInfo.stats.patient_hoist)}
                            </p>
                            <p>Лебёдка трубоподъемника:</p>
                            <p className={`${getStatusColor(getHoistStatusText(adminInfo.stats.pipe_hoist))} font-medium`}>
                                {getHoistStatusText(adminInfo.stats.pipe_hoist)}
                            </p>
                            <p>Парогенератор:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(adminInfo.stats.steam))} font-medium`}>
                                {getSteamExhaustStatusText(adminInfo.stats.steam)}
                            </p>
                            <p>Турбонагнетатель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(adminInfo.stats.charger))} font-medium`}>
                                {getHeaterChargerStatusText(adminInfo.stats.charger)}
                            </p>
                            <p>Обогреватель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(adminInfo.stats.heater))} font-medium`}>
                                {getHeaterChargerStatusText(adminInfo.stats.heater)}
                            </p>
                            <p>Вытяжка:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(adminInfo.stats.exhaust))} font-medium`}>
                                {getSteamExhaustStatusText(adminInfo.stats.exhaust)}
                            </p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 mt-2 gap-2">
                            <p>Температура t1:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.t1}</p>
                            <p>Температура t2:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.t2}</p>
                            <p>Температура t3:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.t3}</p>
                            <p>Температура t4:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.t4}</p>
                            <p>Влажность:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.humidity}</p>
                            <p>Кислород:</p>
                            <p className="font-medium text-white/50">{adminInfo.sensor_data.oxygen}</p>
                            {adminInfo.sensor_data.nitrogen_mass && (<>
                                <p>Масса азота:</p>
                                <p className="font-medium text-white/50">{adminInfo.sensor_data.nitrogen_mass}</p>
                            </>)}
                        </div>
                        <div className="border border-white/18 my-3" />
                        <p className="text-2xl font-bold">Концевики</p>
                        <div className="border border-white/18 my-3" />
                        <p className="text-xl">Лебёдка трубоподъемника</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.pipe_hoist.lsw_top_emergency ? "text-red-500" : adminInfo.digital_inputs.pipe_hoist.lsw_top_working ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.pipe_hoist.lsw_top_emergency ? "Сработал аварийный" : adminInfo.digital_inputs.pipe_hoist.lsw_top_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Концевик низ:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.pipe_hoist.lsw_bottom_emergency ? "text-red-500" : adminInfo.digital_inputs.pipe_hoist.lsw_bottom_working ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.pipe_hoist.lsw_bottom_emergency ? "Сработал аварийный" : adminInfo.digital_inputs.pipe_hoist.lsw_bottom_working ? "Сработал" : "Не сработал"}
                            </p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Лебёдка подъемника пациента</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.patient_hoist.lsw_top_emergency ? "text-red-500" : adminInfo.digital_inputs.patient_hoist.lsw_top_working ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.patient_hoist.lsw_top_emergency ? "Сработал аварийный" : adminInfo.digital_inputs.patient_hoist.lsw_top_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Концевик низ:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.patient_hoist.lsw_bottom_emergency ? "text-red-500" : adminInfo.digital_inputs.patient_hoist.lsw_bottom_working ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.patient_hoist.lsw_bottom_emergency ? "Сработал аварийный" : adminInfo.digital_inputs.patient_hoist.lsw_bottom_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Есть пациент:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.patient_hoist.patient_present ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.patient_hoist.patient_present ? "Да" : "Нет"}
                            </p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Безопасность</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Кнопка аварии:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.safety.estop_pressed ? "text-green-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.safety.estop_pressed ? "Да" : "Нет"}
                            </p>
                            <p>Дверца эл. щита:</p>
                            <p className={`font-medium ${adminInfo.digital_inputs.safety.cabinet_door_open ? "text-red-500" : "text-white/50"}`}>
                                {adminInfo.digital_inputs.safety.cabinet_door_open ? "Открыта" : "Закрыта"}
                            </p>
                        </div>
                    </div>

                    {/* Правая колонка - управление */}
                    <div>
                        {selfTestRunning ? (
                            <>
                                <p className="text-2xl font-bold">Выполняется тестирование системы</p>
                                <div className="border border-white/18 my-3" />
                                <div className="rounded-lg flex flex-col gap-4 p-6 h-140 w-full border border-white/18 bg-white/10">
                                    <div className="flex gap-2">
                                        <p className="text-white/40 animate-pulse">101 - Сработал верхний концевик лебёдки трубоподъемника</p>
                                        -
                                        <p className="text-green-500"> Пройдено</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-white/40 animate-pulse">102 - Сработал нижний концевик лебёдки трубоподъемника</p>
                                        -
                                        <p className="text-green-500"> Пройдено</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-white/40 animate-pulse">103 - Сработал верхний концевик лебёдки подъемника пациента</p>
                                        -
                                        <p className="text-green-500"> Пройдено</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-white/40 animate-pulse">104 - Сработал нижний концевик лебёдки подъемника пациента</p>
                                        -
                                        <p className="text-green-500"> Пройдено</p>
                                    </div>
                                    <div className="flex gap-2 items-center animate-pulse justify-center">
                                        <Loader2 className="animate-spin text-white/40 size-10" />
                                    </div>
                                </div>
                                <div className="flex justify-between gap-4 mt-3">
                                    {testStage && (
                                        <div className="border rounded-lg border-white/18 bg-white/10 px-2 gap-2 flex items-center justify-center">
                                            Стадия:
                                            <p className="text-white/40">{testStage}</p>
                                        </div>
                                    )}
                                    <Button
                                        variant="destructive"
                                        onClick={handleStopSelfTest}
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin size-4" /> : "Остановить тестирование"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Tabs defaultValue="settings">
                                    <TabsList className="bg-white/20 border border-white/18 m-0">
                                        <TabsTrigger className="data-active:bg-white/70 bg-transparent data-active:text-black text-white hover:text-white cursor-pointer hover:bg-white/10" value="settings"><p className="text-xl font-bold">Уставки</p></TabsTrigger>
                                        <TabsTrigger className="data-active:bg-white/70 bg-transparent data-active:text-black text-white  hover:text-white cursor-pointer hover:bg-white/10" value="controls"> <p className="text-xl font-bold">Управление</p></TabsTrigger>

                                    </TabsList>
                                    <TabsContent className="mt-0" value="controls">
                                        <div className="border border-white/18 mb-3" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <p>Двигатель нагнетателя</p>
                                            <div className="flex gap-2 items-center">
                                                <Toggle onChange={() => console.log("Toggle")} />
                                            </div>
                                            <p>Двигатель парогенератора</p>
                                            <div className="flex gap-2 items-center justify-center">
                                                <Toggle onChange={() => console.log("Toggle")} />
                                                <Slider max={50} step={1} defaultValue={0} />
                                            </div>
                                            <p>Двигатель лебедки подъёмника пациента</p>
                                            <div className="flex gap-2">
                                                <Toggle onChange={() => console.log("Toggle")} />
                                                <Toggle textDisplayed texts={["вверх", "вниз"]} width={68} onChange={() => console.log("Toggle")} />
                                            </div>
                                            <p>Двигатель трубоподъемника</p>
                                            <div className="flex gap-2">
                                                <Toggle onChange={() => console.log("Toggle")} />
                                                <Toggle textDisplayed texts={["вверх", "вниз"]} width={68} onChange={() => console.log("Toggle")} />
                                            </div>
                                            <p>ТЭН</p>
                                            <Toggle onChange={() => console.log("Toggle")} />
                                            <p>Вентилятор Вытяжки</p>
                                            <Toggle onChange={() => console.log("Toggle")} />
                                            <div className="flex items-center justify-center w-80 gap-3 rounded-xl py-6 border border-white/18 bg-white/10">
                                                <div className="flex items-center justify-center">
                                                    <Button className="w-22">OK</Button>
                                                </div>
                                                <div className="flex flex-col gap-8">
                                                    <Button className="w-22">ESC</Button>
                                                    <Button className="w-22">RESET</Button>
                                                </div>
                                                <div className="flex items-center justify-center">
                                                    <Button className="w-22">CONFIRM</Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button onClick={handleUnlockDialog}>Разблокировать установку</Button>
                                                <div className="flex gap-4 justify-between">
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => handleSelfTest("self_test")}
                                                        disabled={loading}
                                                    >
                                                        {loading ? <Loader2 className="animate-spin size-4" /> : "Self Test"}
                                                    </Button>
                                                    <Button
                                                        className="w-full"
                                                        onClick={() => handleSelfTest("dry_self_test")}
                                                        disabled={loading}
                                                    >
                                                        {loading ? <Loader2 className="animate-spin size-4" /> : "Dry Self Test"}
                                                    </Button>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="border border-white/18 my-3" />
                                    </TabsContent>
                                    <TabsContent value="settings">
                                        <div className="border border-white/18 mb-3" />
                                        <div className="grid grid-cols-4 gap-2">
                                            <p>Работа</p>
                                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                                <input
                                                    value={currentSettings.time_s1_sec}
                                                    onChange={(e) =>
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            time_s1_sec: Number(e.target.value)
                                                        } : null)
                                                    }
                                                    type="number"
                                                    className="focus-visible:outline-none bg-transparent w-full"
                                                />
                                            </div>
                                            <p>Время ожидания</p>
                                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                                <input
                                                    value={currentSettings.time_s2_sec}
                                                    onChange={(e) =>
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            time_s2_sec: Number(e.target.value)
                                                        } : null)
                                                    }
                                                    type="number"
                                                    className="focus-visible:outline-none bg-transparent w-full"
                                                />
                                            </div>
                                            <p>Общая длительность процедуры</p>
                                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                                <input
                                                    value={currentSettings.time_s3_sec}
                                                    onChange={(e) =>
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            time_s3_sec: Number(e.target.value)
                                                        } : null)
                                                    }
                                                    type="number"
                                                    className="focus-visible:outline-none bg-transparent w-full"
                                                />
                                            </div>
                                            <p>Уставка s1</p>
                                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                                <input
                                                    value={currentSettings.temperature_sp1}
                                                    onChange={(e) =>
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            temperature_sp1: Number(e.target.value)
                                                        } : null)
                                                    }
                                                    type="number"
                                                    className="focus-visible:outline-none bg-transparent w-full"
                                                />
                                            </div>
                                            <p>Уставка s2</p>
                                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                                <input
                                                    value={currentSettings.temperature_sp2}
                                                    onChange={(e) =>
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            temperature_sp2: Number(e.target.value)
                                                        } : null)
                                                    }
                                                    type="number"
                                                    className="focus-visible:outline-none bg-transparent w-full"
                                                />
                                            </div>

                                        </div>
                                        <div className="flex flex-col gap-2 mt-3">
                                            <div className="border border-white/18 my-3" />
                                            <div className="gap-2 flex items-center">
                                                {isChanged("led_active") &&
                                                    <span className="ml-2 text-yellow-400">●</span>
                                                }
                                                <p>Подсветка:</p>
                                                <div className="flex gap-2 items-center">

                                                    <Toggle value={currentSettings.led_active} onChange={() => {
                                                        setCurrentSettings(prev => prev ? {
                                                            ...prev,
                                                            led_active: !prev.led_active
                                                        } : null)
                                                    }
                                                    } />
                                                </div>
                                                <Button disabled={!currentSettings.led_active} onClick={handleLEDDialog}>
                                                    <p>Выбранный цвет:</p>
                                                    {isChanged("led_color") &&
                                                        <span className="ml-2 text-yellow-400">●</span>
                                                    }
                                                    <div className="w-12 h-5 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                                                </Button>
                                            </div>

                                            <Button onClick={handleWifiDialog} className="w-full">
                                                Настройка WiFI {isChanged("wifi") &&
                                                    <span className="ml-2 text-yellow-400">●</span>
                                                }
                                            </Button>
                                            <Button className="w-full" disabled>Привязать контроллер / пульт</Button>
                                        </div>
                                        <div className="border border-white/18 my-3" />
                                        <div className="gap-4 mt-6 flex justify-end">
                                            <Button
                                                variant="destructive"
                                                onClick={handleCancel}
                                                disabled={loading || !hasChanges}
                                            >
                                                Отменить
                                            </Button>
                                            <Button
                                                variant="primary"
                                                disabled={!hasChanges || loading}
                                                onClick={handleSave}
                                            >
                                                {loading ? <Loader2 className="animate-spin size-4" /> :
                                                    hasChanges ? "Сохранить изменения" : "Нет изменений"
                                                }
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </>
                        )}
                    </div>
                </div>
            </Dialog>

            <WiFiDialog
                data={currentSettings.wifi}
                onOpenChange={handleWifiDialog}
                open={wifiOpen}
                onWiFiSave={handleWiFiSave}
            />
            <LEDDialog
                defaultColor={selectedColor}
                onOpenChange={handleLEDDialog}
                open={ledOpen}
                onColorSave={handleColorSave}
            />
            <UnlockDialog onOpenChange={handleUnlockDialog} open={unlockOpen} />
        </>
    );
}

export default SettingsMenu;