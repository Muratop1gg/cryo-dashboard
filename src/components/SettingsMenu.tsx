import { useState } from "react";
import Dialog from "./Dialog";
import Toggle from "./Toggle";
import { Slider } from "./ui/slider";
import WiFiDialog from "./WiFiDialog";
import LEDDialog from "./LEDDialog";
import Button from "./button";
import UnlockDialog from "./UnlockDialog";

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
}

function SettingsMenu({ open = false, onOpenChange }: SettingsMenuProps) {


    const [wifiOpen, setIsWiFiOpen] = useState(false);
    const [ledOpen, setIsLEDOpen] = useState(false);
    const [unlockOpen, setIsUnlockOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState<string>("#ffffff");

    const handleColorSave = (color: string) => {
        setSelectedColor(color);
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

    const data: AdminInfo = {
        "digital_inputs": {
            "pipe_hoist": {
                "lsw_top_emergency": false,
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
        }
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
                        <p className="text-2xl">Статусы</p>
                        <div className="border border-white/18 my-3" />
                        <div className="grid grid-cols-2 gap-2">
                            <p>Лебёдка подъемника пациента:</p>
                            <p className={`${getStatusColor(getHoistStatusText(data.stats.patient_hoist))} font-bold`}>{getHoistStatusText(data.stats.patient_hoist)}</p>
                            <p>Лебёдка трубоподъемника:</p>
                            <p className={`${getStatusColor(getHoistStatusText(data.stats.pipe_hoist))} font-bold`}>{getHoistStatusText(data.stats.pipe_hoist)}</p>
                            <p>Парогенератор:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.steam))} font-bold`}>{getSteamExhaustStatusText(data.stats.steam)}</p>
                            <p>Турбонагнетатель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.charger))} font-bold`}>{getHeaterChargerStatusText(data.stats.charger)}</p>
                            <p>Обогреватель:</p>
                            <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.heater))} font-bold`}>{getHeaterChargerStatusText(data.stats.heater)}</p>
                            <p>Вытяжка:</p>
                            <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.exhaust))} font-bold`}>{getSteamExhaustStatusText(data.stats.exhaust)}</p>

                        </div>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 mt-2 gap-2">
                            <p>Температура t1:</p>
                            <p>20</p>
                            <p>Температура t2:</p>
                            <p>20</p>
                            <p>Температура t3:</p>
                            <p>20</p>
                            <p>Температура t4:</p>
                            <p>20</p>
                            <p>Влажность:</p>
                            <p>20%</p>
                            <p>Кислород:</p>
                            <p>Есть</p>
                            <p>Масса азота:</p>
                            <p>20 кг</p>
                        </div>
                        <div className="border border-white/18 my-3" />
                        <p className="text-2xl">Концевики</p>
                        <div className="border border-white/18 my-3" />
                        <p className="text-xl">Лебёдка трубоподъемника</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p>status</p>
                            <p>Концевик низ:</p>
                            <p>status</p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Лебёдка подъемника пациента</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Концевик верх:</p>
                            <p>status</p>
                            <p>Концевик низ:</p>
                            <p>status</p>
                            <p>Есть пациент:</p>
                            <p>Да</p>
                        </div>
                        <div className="border border-white/18 my-2" />
                        <p className="text-xl">Безопасность</p>
                        <div className="border border-white/18 my-2" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Кнопка аварии:</p>
                            <p>Да</p>
                            <p>Дверца эл. щита:</p>
                            <p>Открыта</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-2xl">Управление</p>
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
                                <Button onClick={handleWifiDialog} className="w-full">Настройка WiFI</Button>
                                <Button className="w-full" disabled>Привязать контроллер / пульт</Button>
                            </div>
                        </div>
                        <div className="border border-white/18 my-3" />
                        <p className="text-2xl">Уставки</p>
                        <div className="border border-white/18 my-3" />
                        <div className="grid grid-cols-4 gap-2">
                            <p>Работа</p>
                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                            </div>
                            <p>Время ожидания</p>
                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                            </div>
                            <p>Общая длительность процедуры</p>
                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                            </div>
                            <p>Уставка s1</p>
                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                            </div>
                            <p>Уставка s2</p>
                            <div className="flex p-1 h-7 bg-white/20 border border-white/18 rounded-lg w-22.5">
                                <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                            </div>
                        </div>
                        <div className="border border-white/18 my-3" />
                        <div className="gap-4 mt-6 flex justify-end">
                            <Button variant="destructive" onClick={handleOpen}>
                                Отменить
                            </Button>
                            <Button variant="primary" onClick={handleOpen}>
                                Сохранить изменения
                            </Button>

                        </div>

                    </div>
                </div>
            </Dialog>

            <WiFiDialog onOpenChange={handleWifiDialog} open={wifiOpen} />
            <LEDDialog defaultColor={selectedColor} onOpenChange={handleLEDDialog} open={ledOpen} onColorSave={handleColorSave} />
            <UnlockDialog onOpenChange={handleUnlockDialog} open={unlockOpen} />
        </>
    )
}

export default SettingsMenu