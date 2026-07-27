# API

## Endpoints list

- [POST `/api/change-procedure-state/`](#post-change-procedure-state-action)
- [POST `/api/self-test/`](#post-start-self-test-type)
- [POST `/api/self-test/stop`](#post-stop-self-test)
- [POST `/api/update-settings`](#post-settings)
- [POST `/api/config`](#post-config)
- [POST `/api/unlock`](#post-request-unlock)
- [POST `/api/unlock/check`](#post-check-unlock-code)
- [GET `/api/settings`](#get-settings)
- [GET `/api/config`](#get-config)

## Websocket events list

- [`sensors_data`]()
- [`event`]()
- [`controller_button_pressed`]()
- [`controller_button_released`]()
- [`machine_controls`]()
- [`steam_speed_control`]()


## DESCRIPTION

### `POST` CHANGE PROCEDURE STATE (action)

`/api/change-procedure-state/`

#### Request

```typescript
interface POST.ChangeProcedureState {
  action: "stop" | "pause" | "resume" | "start"
}
```

#### Response

`400` or `200`

`no body`

### `POST` START SELF-TEST (type)

`/api/self-test/`

#### Request

```typescript
interface POST.StartSelfTest{
  type: "dry" | "default"
}
```

#### Response

`400` or `200`

### `POST` STOP SELF-TEST

`/api/self-test/stop`

#### Request

`no body`

#### Response

`400` or `200`

### `POST` SETTINGS

`/api/update-settings`

#### Request

```typescript
interface POST.SettingsData {
  led_color?: string
  time_s1_sec?: number // работа 
  time_s2_sec?: number // ожидание
  time_s3_sec?: number // общая длительность процедуры
  temperature_sp1?: number // уставка s1
  temperature_sp2?: number // уставка s2
  wifi?: {
      ssid: string
      password_len: number
  }
}
```

#### Response

`400` or `200`

### `GET` SETTINGS

`/api/settings`

#### Request

`no body`

#### Response

```typescript
interface GET.SettingsData {
  led_color: string
  blocked: "yes" | "no" | "unlocking"
  time_s1_sec: number // работа 
  time_s2_sec: number // ожидание
  time_s3_sec: number // общая длительность процедуры
  temperature_sp1: number // уставка s1
  temperature_sp2: number // уставка s2
  wifi?: {
      ssid: string
      password_len: number
  }
}
```

### `GET` CONFIG

`/api/config`

```typescript
interface GET.SystemConfiguration {
  // whatever is happening here 
}
```


### `POST` CONFIG

`/api/config`

```typescript
interface POST.SystemConfiguration {
  // whatever is happening here 
}

```
### `POST` REQUEST UNLOCK

`/api/unlock`

#### Request

`no body`

#### Response

`400` or `200`

### `POST` CHECK UNLOCK CODE

`/api/unlock/check`

#### Request

```typescript
interface POST.CheckUnlockCode {
  code: string // this is generated code for unblock, we have time info in it as well
}
```

#### Response

`400` or `200`

```typescript
interface POST.CheckUnlockCodeResponse {
  accepted: boolean
  days_left: number
}
```


# WS EVENTS

## INCOMMING

#### Type: `sensors_data`

```typescript
interface WS.SensorsData {
    digital_inputs: {
        pipe_hoist: {
            lsw_top_emergency: boolean
            lsw_top_working: boolean
            lsw_bottom_working: boolean
            lsw_bottom_emergency: boolean
        }
        patient_hoist: {
            lsw_top_emergency: boolean
            lsw_top_working: boolean
            lsw_bottom_working: boolean
            lsw_bottom_emergency: boolean
            patient_present: boolean
        }
        safety: {
            estop_pressed: boolean
            cabinet_door_open: boolean
        }
    }
    stats: {
        patient_hoist: 0 | 1 | 2 | 3   // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
        pipe_hoist: 0 | 1 | 2 | 3    // 0 - стоп	1 - движение вверх 2 - движение вниз 3 - авария
        steam: 0 | 1 | 2 | 3          // 0 - стоп 1 - включение 2 - работа 3 - остановка 4 - авария
        charger: 0 | 1 | 2 | 3         // 0 - стоп 1 - работа 2 - авария
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
    }
    diagnostics: {
        test: {
            running: boolean
            type?: "self_test" | "dry_self_test"
            stage?: string
        }
    }

}
```

#### Type: `event`

```typescript
interface WS.Event {
  event_id: number // for digits code
}
```

## OUTGOING

#### Type: `controller_button_pressed`

```typescript
interface WS.ControllerButtonPressed {
  button: "OK" | "ESC" | "RESET" | "CONFIRM"
}
```

#### Type: `controller_button_released`

`no data`

#### Type: `machine_controls`

```typescript
interface WS.MachineControl {
  type: string
  value: boolean
}
```

#### Type: `steam_speed_control`

```typescript
interface WS.SteamSpeedControl {
  value: number // between 0 and 50
}
```