import Dialog from "./Dialog";
import Slider from "./Slider";
import Toggle from "./Toggle";

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

    const handleOpen = () => {
        onOpenChange()
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
        <Dialog onOpenChange={handleOpen} open={open} >
            <div className="grid grid-cols-2 w-full text-white gap-4">
                <div>
                    <p className="text-2xl">Статусы</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Лебёдка подъемника пациента:</p>
                        <p className={`${getStatusColor(getHoistStatusText(data.stats.patient_hoist))} font-bold`}>{getHoistStatusText(data.stats.patient_hoist)}</p>
                        <p>Лебёдка трубоподъемника:</p>
                        <p className={`${getStatusColor(getHoistStatusText(data.stats.pipe_hoist))} font-bold`}>{getHoistStatusText(data.stats.pipe_hoist)}</p>
                        <p>steam:</p>
                        <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.steam))} font-bold`}>{getSteamExhaustStatusText(data.stats.steam)}</p>
                        <p>charger:</p>
                        <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.charger))} font-bold`}>{getHeaterChargerStatusText(data.stats.charger)}</p>
                        <p>Обогреватель:</p>
                        <p className={`${getStatusColor(getHeaterChargerStatusText(data.stats.heater))} font-bold`}>{getHeaterChargerStatusText(data.stats.heater)}</p>
                        <p>Вытяжка:</p>
                        <p className={`${getStatusColor(getSteamExhaustStatusText(data.stats.exhaust))} font-bold`}>{getSteamExhaustStatusText(data.stats.exhaust)}</p>
                    </div>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <p className="text-2xl">Концевики</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <p className="text-xl">Лебёдка трубоподъемника:</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-2" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Концевик верх:</p>
                        <p>status</p>
                        <p>Концевик низ:</p>
                        <p>status</p>
                    </div>
                    <div className="border border-[rgba(255,255,255,0.18)] my-2" />
                    <p className="text-xl">Лебёдка подъемника пациента:</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-2" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Концевик верх:</p>
                        <p>status</p>
                        <p>Концевик низ:</p>
                        <p>status</p>
                        <p>Есть пациент:</p>
                        <p>Да</p>
                    </div>
                    <div className="border border-[rgba(255,255,255,0.18)] my-2" />
                    <p className="text-xl">Безопасность</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-2" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Кнопка аварии:</p>
                        <p>Да</p>
                        <p>Дверь открыта:</p>
                        <p>Да</p>
                    </div>
                </div>
                <div>
                    <p className="text-2xl">Управление</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Двигатель нагнетателя</p>
                        <div className="flex gap-2 items-center"
                        >
                            <Toggle onChange={function () {
                                console.log("");
                            }} ></Toggle>
                            <Slider range={50} onValueChange={function (number: number) {
                                console.log(number);
                            }} />
                        </div>
                        <p>Двигатель парогенератора</p>
                        <div className="flex gap-2">
                            <Toggle onChange={function () {
                                console.log("");
                            }} ></Toggle>
                            <Slider range={50} onValueChange={function (number: number) {
                                console.log(number);
                            }} />
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
                        <p>Заслонка вытяжки</p>
                        <Toggle textDisplayed texts={["закр", "откр"]} width={68} onChange={function () {
                            console.log("");
                        }} ></Toggle>
                        <p>Светодиодная лента</p>
                        <Toggle onChange={function () {
                            console.log("");
                        }} ></Toggle>
                        <div className="flex items-center justify-center w-[400px] gap-6 rounded-xl py-6 border border-[rgba(255,255,255,0.18)] bg-white/10">
                            <div className="flex items-center justify-center">
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-[110px] h-8 rounded-lg bg-white/20 border border-[rgba(255,255,255,0.18)]">OK
                                </div>
                            </div>
                            <div className="flex flex-col gap-6">
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-[110px] h-8 rounded-lg bg-white/20 border border-[rgba(255,255,255,0.18)]">ESC</div>
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-[110px] h-8 rounded-lg bg-white/20 border border-[rgba(255,255,255,0.18)]">RESET</div>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="active:scale-[0.94] cursor-pointer hover:bg-black/10 transition-all flex items-center justify-center w-[110px] h-8 rounded-lg bg-white/20 border border-[rgba(255,255,255,0.18)]">CONFIRM</div>
                            </div>
                        </div>
                    </div>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <p className="text-2xl">Уставки</p>
                    <div className="border border-[rgba(255,255,255,0.18)] my-3" />
                    <div className="grid grid-cols-2 gap-2">
                        <p>Работа</p>
                        <div className="flex p-1 h-7 bg-white/20 border border-[rgba(255,255,255,0.18)] rounded-lg w-[90px]">
                            <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                        </div>
                        <p>Время ожидания</p>
                        <div className="flex p-1 h-7 bg-white/20 border border-[rgba(255,255,255,0.18)] rounded-lg w-[90px]">
                            <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                        </div>
                        <p>Общая длительность процедуры</p>
                        <div className="flex p-1 h-7 bg-white/20 border border-[rgba(255,255,255,0.18)] rounded-lg w-[90px]">
                            <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                        </div>
                        <p>Уставка s1</p>
                        <div className="flex p-1 h-7 bg-white/20 border border-[rgba(255,255,255,0.18)] rounded-lg w-[90px]">
                            <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                        </div>
                        <p>Уставка s2</p>
                        <div className="flex p-1 h-7 bg-white/20 border border-[rgba(255,255,255,0.18)] rounded-lg w-[90px]">
                            <input type="number" className="focus-visible:outline-none bg-transparent w-full" />
                        </div>
                    </div>
                </div>
            </div>

        </Dialog>
    )
}

export default SettingsMenu