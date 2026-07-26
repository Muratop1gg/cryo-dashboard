import { useState } from "react";
import Dialog from "./Dialog";
import Toggle from "./Toggle";
import { Slider } from "./ui/slider";
import WiFiDialog from "./WiFiDialog";
import LEDDialog from "./LEDDialog";
import Button from "./button";
import UnlockDialog from "./UnlockDialog";
import { Loader2 } from "lucide-react";

interface SettingsMenuProps {
    open?: boolean
    onOpenChange(): void

}

interface AdminInfo {
    digital_inputs: {
        pipe_hoist: {
            lsw_top_emergency: boolean
            lsw_top_working: boolean
            lsw_bottom_working: boolean
            lsw_bottom_emergency: boolean
        },
        patient_hoist: {
            lsw_top_emergency: boolean
            lsw_top_working: boolean
            lsw_bottom_working: boolean
            lsw_bottom_emergency: boolean
            patient_present: boolean
        },
        safety: {
            estop_pressed: boolean
            cabinet_door_open: boolean
        }
    }
    stats: {
        patient_hoist: 0 | 1 | 2 | 3   // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
        pipe_hoist: 0 | 1 | 2 | 3    // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
        steam: 0 | 1 | 2 | 3,           // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
        charger: 0 | 1 | 2 | 3,         // 0 - стоп 1 - работа 2 - авария
        heater: 0 | 1 | 2 | 3,          // 0 - стоп 1 - работа 2 - авария
        exhaust: 0 | 1 | 2 | 3         // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
    }
    sensor_data: {
        t1: number
        t2: number
        t3: number
        t4: number
        humidity: number
        oxygen: number
        nitrogen_mass?: number
    },
    diagnostics: {
        test: {
            running: boolean
            type?: "self_test" | "dry_self_test"
            stage?: string
        }
    }

}

interface SettingsData {
    led_color: string
    blocked: "yes" | "no" | "unlocking"
    time_s1_sec: number, // работа 
    time_s2_sec: number, // ожидание
    time_s3_sec: number, // общая длительность процедуры
    temperature_sp1: number, // уставка s1
    temperature_sp2: number // уставка s2
    wifi?: {
        ssid: string
        password_len: number
    }
}

type ChangedSettings = Partial<{
    led_color: string
    time_s1_sec: number
    time_s2_sec: number
    time_s3_sec: number
    temperature_sp1: number
    temperature_sp2: number
    wifi: {
        ssid: string
        password: string
    }
}>

function SettingsMenu({ open = false, onOpenChange }: SettingsMenuProps) {

    const data: AdminInfo = {
        "digital_inputs": {
            "pipe_hoist": {
                "lsw_top_emergency": true,
                "lsw_top_working": false,
                "lsw_bottom_working": true,
                "lsw_bottom_emergency": false
            },
            "patient_hoist": {
                "lsw_top_emergency": false,
                "lsw_top_working": false,
                "lsw_bottom_working": true,
                "lsw_bottom_emergency": false,
                "patient_present": true
            },
            "safety": {
                "estop_pressed": false,
                "cabinet_door_open": true
            }
        },
        "stats": {
            "patient_hoist": 1,   // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
            "pipe_hoist": 2,      // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
            "steam": 2,           // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
            "charger": 0,         // 0 - стоп 1 - работа 2 - авария
            "heater": 2,          // 0 - стоп 1 - работа 2 - авария
            "exhaust": 3          // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
        },
        "sensor_data": {
            "t1": 20,
            "t2": 20,
            "t3": 20,
            "t4": 20,
            "humidity": 20,
            "oxygen": 20,
            "nitrogen_mass": 20
        },
        "diagnostics": {
            "test": {
                "running": false
            }
        }
    }

    const settings: SettingsData = {
        led_color: "#121212",
        blocked: "no",
        time_s1_sec: 10,
        time_s2_sec: 20,
        time_s3_sec: 30,
        temperature_sp1: 100,
        temperature_sp2: 200,
        wifi: {
            ssid: "MyWiFi",
            password_len: 8
        }
    }

    const [wifiOpen, setIsWiFiOpen] = useState(false);
    const [ledOpen, setIsLEDOpen] = useState(false);
    const [unlockOpen, setIsUnlockOpen] = useState(false);

    const [originalSettings, setOriginalSettings] = useState<SettingsData>(settings);

    const [currentSettings, setCurrentSettings] = useState<SettingsData>({
        ...settings
    });

    const [selectedColor, setSelectedColor] = useState(settings.led_color);

    const getChangedSettings = (): ChangedSettings => {
        const changes: ChangedSettings = {};

        if (currentSettings.led_color !== originalSettings.led_color) {
            changes.led_color = currentSettings.led_color;
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
                password: ""
            };
        }

        return changes;
    };

    const changedSettings = getChangedSettings();

    const hasChanges = Object.keys(changedSettings).length > 0;

    const [selfTestRunning, setSelfTestRunning] = useState(data.diagnostics.test.running);

    const handleColorSave = (color: string) => {

        setSelectedColor(color);

        setCurrentSettings(prev => ({
            ...prev,
            led_color: color
        }));

        setIsLEDOpen(false);
    };

    const handleOpen = () => {
        onOpenChange()
    }

    const handleLEDDialog = () => {
        setIsLEDOpen(!ledOpen)
    }

    const handleWifiDialog = () => {
        setIsWiFiOpen(!wifiOpen)
    }

    const handleUnlockDialog = () => {
        setIsUnlockOpen(!unlockOpen)
    }

    const handleCancel = () => {

        setCurrentSettings(originalSettings);
        setSelectedColor(originalSettings.led_color);

    }


    const handleSave = async () => {

        const changes = getChangedSettings();

        if (Object.keys(changes).length === 0)
            return;


        console.log("SAVE", changes);

        // await save(changes)


        setOriginalSettings(currentSettings);

        onOpenChange();
    }

    const handleWiFiSave = (
        wifiData: { ssid: string, password: string }
    ) => {

        setCurrentSettings(prev => ({
            ...prev,
            wifi: {
                ssid: wifiData.ssid,
                password_len: wifiData.password.length
            }
        }));

    };

    const handleControlleButton = (type: string) => {
        //TODO: Implement controller button logic
    }

    const handleToggle = (type: string, value: boolean) => {
        //TODO: Implement toggle logic
    }

    const handleSliderChange = (type: string, value: number) => {
        //TODO: Implement slider change logic
    }

    const handleSelfTest = (type: "self_test" | "dry_self_test") => {
        setSelfTestRunning(true);
        //TODO: Implement self-test api logic
    }

    const isChanged = (key: keyof SettingsData) => {

        return key in changedSettings;

    }

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
    }

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
    }

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
    }

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
    }

    return (
        <>
            <Dialog z={20} className="py-4 px-4 h-[90vh] top-[5vh] left-[5vh] right-[5vh]" onOpenChange={handleOpen} open={open} >
                <div className="grid grid-cols-2 w-full text-white gap-4">
                    <div>
                        <p className="text-2xl font-bold">Статусы</p>
                        <div className="border border-white/18 my-3" />
                        <div className="grid grid-cols-2 gap-2">
                            <p>Лебёдка подъемника пациента:</p>
                            <p className={`${getStatusColor(getHoistStatusText(data.stats.patient_hoist))} font-medium`}>{getHoistStatusText(data.stats.patient_hoist)}</p>
                            <p>Лебёдка трубоподъемника:</p>
                            <p className={`${getStatusColor(getHoistStatusText(data.stats.pipe_hoist))} font-medium`}>{getHoistStatusText(data.stats.pipe_hoist)}</p>
                            <p>Парогенератор:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.steam))} font-medium`}>{getSteamExhaustStatusText(data.stats.steam)}</p>
                            <p>Турбонагнетатель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.charger))} font-medium`}>{getHeaterChargerStatusText(data.stats.charger)}</p>
                            <p>Обогреватель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.heater))} font-medium`}>{getHeaterChargerStatusText(data.stats.heater)}</p>
                            <p>Вытяжка:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.exhaust))} font-medium`}>{getSteamExhaustStatusText(data.stats.exhaust)}</p>

                        </div>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 mt-2 gap-2">
                            <p>Температура t1:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.t1}</p>
                            <p>Температура t2:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.t2}</p>
                            <p>Температура t3:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.t3}</p>
                            <p>Температура t4:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.t4}</p>
                            <p>Влажность:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.humidity}</p>
                            <p>Кислород:</p>
                            <p className="font-medium text-white/50">{data.sensor_data.oxygen}</p>
                            {data.sensor_data.nitrogen_mass && (<>
                                <p>Масса азота:</p>
                                <p className="font-medium text-white/50">{data.sensor_data.nitrogen_mass}</p>
                            </>)}
                        </div>
                        <div className="border border-white/18 my-3" />
                        <p className="text-2xl font-bold">Концевики</p>
                        <div className="border border-white/18 my-3" />
                        <p className="text-xl">Лебёдка трубоподъемника</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p className={`font-medium ${data.digital_inputs.pipe_hoist.lsw_top_emergency ? "text-red-500" : data.digital_inputs.pipe_hoist.lsw_top_working ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.pipe_hoist.lsw_top_emergency ? "Сработал аварийный" : data.digital_inputs.pipe_hoist.lsw_top_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Концевик низ:</p>
                            <p className={`font-medium ${data.digital_inputs.pipe_hoist.lsw_bottom_emergency ? "text-red-500" : data.digital_inputs.pipe_hoist.lsw_bottom_working ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.pipe_hoist.lsw_bottom_emergency ? "Сработал аварийный" : data.digital_inputs.pipe_hoist.lsw_bottom_working ? "Сработал" : "Не сработал"}
                            </p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Лебёдка подъемника пациента</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p className={`font-medium ${data.digital_inputs.patient_hoist.lsw_top_emergency ? "text-red-500" : data.digital_inputs.patient_hoist.lsw_top_working ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.patient_hoist.lsw_top_emergency ? "Сработал аварийный" : data.digital_inputs.patient_hoist.lsw_top_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Концевик низ:</p>
                            <p className={`font-medium ${data.digital_inputs.patient_hoist.lsw_bottom_emergency ? "text-red-500" : data.digital_inputs.patient_hoist.lsw_bottom_working ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.patient_hoist.lsw_bottom_emergency ? "Сработал аварийный" : data.digital_inputs.patient_hoist.lsw_bottom_working ? "Сработал" : "Не сработал"}
                            </p>
                            <p>Есть пациент:</p>
                            <p className={`font-medium ${data.digital_inputs.patient_hoist.patient_present ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.patient_hoist.patient_present ? "Да" : "Нет"}
                            </p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Безопасность</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Кнопка аварии:</p>
                            <p className={`font-medium ${data.digital_inputs.safety.estop_pressed ? "text-green-500" : "text-white/50"}`}>
                                {data.digital_inputs.safety.estop_pressed ? "Да" : "Нет"}
                            </p>
                            <p>Дверца эл. щита:</p>
                            <p className={`font-medium ${data.digital_inputs.safety.cabinet_door_open ? "text-red-500" : "text-white/50"}`}>
                                {data.digital_inputs.safety.cabinet_door_open ? "Открыта" : "Закрыта"}
                            </p>
                        </div>
                    </div>
                    <div>
                        {selfTestRunning ? (<>
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
                                {data.diagnostics.test.stage &&
                                    <div className="border rounded-lg border-white/18 bg-white/10 px-2 gap-2 flex items-center justify-center">
                                        Стадия:
                                        <p className="text-white/40">{data.diagnostics.test.stage}</p>
                                    </div>}
                                <Button variant="destructive" >
                                    Остановить тестирование
                                </Button>

                            </div>
                        </>) : (<>
                            <p className="text-2xl font-bold">Управление</p>
                            <div className="border border-white/18 my-3" />
                            <div className="grid grid-cols-2 gap-2">
                                <p>Двигатель нагнетателя</p>
                                <div className="flex gap-2 items-center"
                                >
                                    <Toggle onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                </div>
                                <p>Двигатель парогенератора</p>
                                <div className="flex gap-2 items-center justify-center">
                                    <Toggle onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                    <Slider max={50} step={1} defaultValue={0} />
                                </div>
                                <p>Двигатель лебедки подъёмника пациента</p>
                                <div className="flex gap-2">
                                    <Toggle onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                    <Toggle textDisplayed texts={["вверх", "вниз"]} width={68} onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                </div>

                                <p>Двигатель трубоподъемника</p>
                                <div className="flex gap-2">
                                    <Toggle onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                    <Toggle textDisplayed texts={["вверх", "вниз"]} width={68} onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                </div>
                                <p>ТЭН</p>
                                <Toggle onChange={function () {
                                    console.log("");
                                }} ></Toggle>
                                <p>Вентилятор Вытяжки</p>
                                <Toggle onChange={function () {
                                    console.log("");
                                }} ></Toggle>
                                {/* <p>Заслонка вытяжки</p>
                        <Toggle textDisplayed texts={["закр", "откр"]} width={68} onChange={function () {
                            console.log("");
                        }} ></Toggle> */}
                                <p>Светодиодная лента</p>
                                <div className="flex gap-2 items-center">
                                    <Toggle onChange={function () {
                                        console.log("");
                                    }} ></Toggle>
                                    <Button onClick={handleLEDDialog}>
                                        <p>Выбранный цвет:</p>
                                        {isChanged("led_color") &&
                                            <span className="ml-2 text-yellow-400">
                                                ●
                                            </span>
                                        }
                                        <div className="w-12 h-5 rounded-md" style={{ backgroundColor: selectedColor }}></div>
                                    </Button>


                                </div>

                                <div className="flex items-center justify-center w-80 gap-3 rounded-xl py-6 border border-white/18 bg-white/10">
                                    <div className="flex items-center justify-center">
                                        <Button className="w-22">OK</Button>
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        <Button className="w-22">ESC</Button>
                                        <Button className="w-22" >RESET</Button>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Button className="w-22">CONFIRM</Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={handleUnlockDialog}>Разблокировать установку</Button>
                                    <div className="flex gap-4 justify-between">
                                        <Button className="w-full">Self Test</Button>
                                        <Button className="w-full">Dry Self Test</Button>
                                    </div>
                                    <Button onClick={handleWifiDialog} className="w-full">Настройка WiFI {isChanged("wifi") &&
                                        <span className="ml-2 text-yellow-400">
                                            ●
                                        </span>
                                    }</Button>
                                    <Button className="w-full" disabled>Привязать контроллер / пульт</Button>
                                </div>
                            </div>
                            <div className="border border-white/18 my-3" />
                            <p className="text-2xl font-bold">Уставки</p>
                            <div className="border border-white/18 my-3" />
                            <div className="grid grid-cols-4 gap-2">
                                <p>Работа</p>
                                <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                    <input value={currentSettings.time_s1_sec} onChange={(e) =>
                                        setCurrentSettings(prev => ({
                                            ...prev,
                                            time_s1_sec: Number(e.target.value)
                                        }))
                                    } type="number" className="focus-visible:outline-none bg-transparent w-full" />
                                </div>
                                <p>Время ожидания</p>
                                <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                    <input value={currentSettings.time_s2_sec} onChange={(e) =>
                                        setCurrentSettings(prev => ({
                                            ...prev,
                                            time_s2_sec: Number(e.target.value)
                                        }))
                                    } type="number" className="focus-visible:outline-none bg-transparent w-full" />
                                </div>
                                <p>Общая длительность процедуры</p>
                                <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                    <input value={currentSettings.time_s3_sec} onChange={(e) =>
                                        setCurrentSettings(prev => ({
                                            ...prev,
                                            time_s3_sec: Number(e.target.value)
                                        }))
                                    } type="number" className="focus-visible:outline-none bg-transparent w-full" />
                                </div>
                                <p>Уставка s1</p>
                                <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                    <input value={currentSettings.temperature_sp1} onChange={(e) =>
                                        setCurrentSettings(prev => ({
                                            ...prev,
                                            temperature_sp1: Number(e.target.value)
                                        }))
                                    } type="number" className="focus-visible:outline-none bg-transparent w-full" />
                                </div>
                                <p>Уставка s2</p>
                                <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                    <input value={currentSettings.temperature_sp2} onChange={(e) =>
                                        setCurrentSettings(prev => ({
                                            ...prev,
                                            temperature_sp2: Number(e.target.value)
                                        }))
                                    } type="number" className="focus-visible:outline-none bg-transparent w-full" />
                                </div>
                            </div>
                        </>)}

                        <div className="border border-white/18 my-3" />
                        <div className="gap-4 mt-6 flex justify-end">
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                            >
                                Отменить
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!hasChanges}
                                onClick={handleSave}
                            >
                                {hasChanges
                                    ? "Сохранить изменения"
                                    : "Нет изменений"
                                }
                            </Button>

                        </div>

                    </div>
                </div>
            </Dialog>

            <WiFiDialog
                data={currentSettings.wifi}
                onOpenChange={handleWifiDialog}
                open={wifiOpen}
                onWiFiSave={handleWiFiSave}
            />
            <LEDDialog defaultColor={selectedColor} onOpenChange={handleLEDDialog} open={ledOpen} onColorSave={handleColorSave} />
            <UnlockDialog onOpenChange={handleUnlockDialog} open={unlockOpen} />
        </>
    )
}

export default SettingsMenu