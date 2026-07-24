import { useState } from "react";
import Dialog from "./Dialog";
import Toggle from "./Toggle";
import { Slider } from "./ui/slider";
import WiFiDialog from "./WiFiDialog";
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection } from "./ui/color-picker";
import LEDDialog from "./LEDDialog";

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

    const handleOpen = () => {
        onOpenChange()
    }

    const handleLEDDialog = () => {
        setIsLEDOpen(!ledOpen)
    }

    const handleWifiDialog = () => {
        setIsWiFiOpen(!wifiOpen)
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
                            <div className="flex gap-2">
                                <Toggle onChange={function () {
                                    console.log("");
                                }} ></Toggle>
                                <p>Выбранный цвет:</p>
                                <p onClick={handleLEDDialog} className="">123123</p>
                            </div>

                            <div className="flex items-center justify-center w-80 gap-3 rounded-xl py-6 border border-white/18 bg-white/10">
                                <div className="flex items-center justify-center">
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-23 h-8 rounded-lg bg-white/20 border border-white/18">OK
                                    </div>
                                </div>
                                <div className="flex flex-col gap-8">
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-23 h-8 rounded-lg bg-white/20 border border-white/18">ESC</div>
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-23 h-8 rounded-lg bg-white/20 border border-white/18">RESET</div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-23 h-8 rounded-lg bg-white/20 border border-white/18">CONFIRM</div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-80 h-8 rounded-lg bg-white/20 border border-white/18">Разблокировать установку
                                </div>
                                <div className="flex gap-4 justify-between w-80">
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-full h-8 rounded-lg bg-white/20 border border-white/18">Self-test
                                    </div>
                                    <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-full h-8 rounded-lg bg-white/20 border border-white/18">Dry self-test
                                    </div>
                                </div>
                                <div onClick={handleWifiDialog} className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-80 h-8 rounded-lg bg-white/20 border border-white/18">Настройка WiFi
                                </div>
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-80 h-8 rounded-lg bg-white/20 border border-white/18">Привязать контроллер / пульт
                                </div>
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
                            <div onClick={handleOpen} className="active:scale-[0.94] text-red-500 cursor-pointer hover:bg-red-800/50 transition-all flex items-center justify-center w-24 h-8 rounded-lg bg-red-800/30 border border-red-600/50">
                                Отменить
                            </div>
                            <div className="active:scale-[0.94] text-blue-500 hover:bg-blue-800/50 bg-blue-800/30 border border-blue-600/50 cursor-pointer transition-all flex items-center justify-center w-60 h-8 rounded-lg">Сохранить изменения
                            </div>
                        </div>

                    </div>
                </div>
            </Dialog>

            <WiFiDialog onOpenChange={handleWifiDialog} open={wifiOpen} />
            <LEDDialog onOpenChange={handleLEDDialog} open={ledOpen} />
        </>
    )
}

export default SettingsMenu