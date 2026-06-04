# CryoCapsule Dashboard

Дашборд для экрана криокапсулы.

## Быстрый старт

Устанавливаем node.js последнюю версию. Главное v22+
Затем:

```bash
npm install
npm run dev
```

## Видео-фон

После сборки (`npm run build`) папка `dist/` содержит готовый сайт.

**Чтобы сменить видео:** положите файл `background.mp4` рядом с `index.html` в папке `dist/`:

```
dist/
  index.html
  background.mp4   ← заменяйте этот файл
  assets/
```

Видео загружается по относительному пути `./background.mp4`, поэтому достаточно заменить файл и обновить страницу.

> ⚠️ Браузер должен поддерживать автовоспроизведение без звука (muted autoplay). Chromium-based браузеры поддерживают это из коробки.

## Настройка источников данных

Скопируйте `.env.example` → `.env.local` и задайте адреса:

```env
VITE_WS_URL=ws://192.168.1.100:8765        # WebSocket сервер ивентов
VITE_PIXEL2_URL=http://192.168.1.100:8080/api/sensors  # Pixel2 API
VITE_POLL_INTERVAL=2000                     # Интервал опроса (мс)
```

## WebSocket протокол

Сервер отправляет JSON-сообщения:

```json
{ "type": "patient_lift_up" }
{ "type": "patient_lift_down" }
{ "type": "patient_lift_stop" }
{ "type": "tube_lift_up" }
{ "type": "tube_lift_down" }
{ "type": "tube_lift_stop" }
```

## Pixel2 API

Ожидается JSON-ответ вида:

```json
{
  "temperature": "-196.2",
  "nitrogenPressure": "101.5",
  "fillLevel": "78",
  "patientId": "CRY-2024-004",
  "systemStatus": "КРИОСОН",
  "humidity": "11",
  "coolantFlow": "4.8",
  "power": "2840",
  "storageTime": "847д 14ч",
  "temperatureTrend": "stable",
  "powerTrend": "up",
  "t1": "123",
  "t2": "123"
}
```

Если Pixel2 недоступен — дашборд показывает демо-данные с реалистичным дрожанием.

## Сборка для киоска

```bash
npm run build
# Скопировать dist/ на устройство
# Открыть dist/index.html в Chromium в kiosk-режиме:
# chromium --kiosk --app=file:///path/to/dist/index.html
```
