# VACANTE — Smart Classroom IoT

A hackathon prototype that combines an **ESP32 + PIR motion sensor + Blynk Cloud + web dashboard** to show whether a classroom is in use.

## What is included

- `public/` — responsive web dashboard, sample daily schedule, live status card and demo controls.
- `server.js` — small Node.js backend that reads the Blynk datastream. The Blynk auth token stays on the server.
- `hardware/VACANTE_ESP32_PIR.ino` — Arduino IDE firmware for ESP32 + PIR.
- `.env.example` — backend configuration template.

## How the system works

1. The PIR sensor detects movement and sends a HIGH/LOW signal to ESP32 GPIO 27.
2. The ESP32 applies a 2-minute motion hold window and writes `1` or `0` to Blynk Virtual Pin **V0**.
3. The Node.js backend reads V0 through Blynk's HTTPS API.
4. The website checks the backend every 3 seconds.
5. If a class is scheduled now, the dashboard shows **In use — scheduled**. During an unscheduled period, it uses the sensor signal to show **Occupied** or **Unoccupied**.

**Important limitation:** a PIR sensor detects changes in infrared energy caused by movement. A person sitting still may not trigger it. Therefore, “no motion detected” is not proof that a room is empty. For a real deployment, consider a longer timeout, door/seat sensors, or a second sensing method, and label the result as estimated availability.

## 1. Run the website in demo mode

Install Node.js 18 or newer.

```bash
npm install
```

Copy `.env.example` to `.env`. Leave `DEMO_MODE=true` and leave the Blynk token blank.

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Use **Simulate movement** and **Clear movement** to test the dashboard without hardware. The sample timetable is in `public/app.js`; edit it for your hackathon demo.

## 2. Configure Blynk

In Blynk.Console:

1. Create a Template for ESP32.
2. Add a device based on that template.
3. Create an **Integer** Datastream with Virtual Pin **V0**, minimum `0`, maximum `1`.
4. Copy the Template ID, Template Name and Device Auth Token.

Blynk API reference: [Get Datastream Value](https://docs.blynk.io/en/blynk.cloud/device-https-api/get-datastream-value).

## 3. Upload the ESP32 program

In Arduino IDE:

1. Install the ESP32 board package and select your ESP32 board.
2. Install the **Blynk** **LiquidCrystal** library from Library Manager.
3. Open `hardware/VACANTE_ESP32_PIR.ino`.
4. Replace `YOUR_TEMPLATE_ID`, `YOUR_TEMPLATE_NAME` (in the define), `YOUR_DEVICE_AUTH_TOKEN`, Wi-Fi name and password.
5. Wire the PIR sensor as shown below.
6. Upload the sketch and open Serial Monitor at **115200 baud**.

### Wiring

| PIR module | BREADBOARD| ESP32 |
|---|---|
| VCC | RED + |
| GND | BLUE -|
| OUT | GPIO 13 |

LCD I2C | BREADBOARD |
GND | BLUE - |
VCC | RED + |
SDA | GPIO 21 |
SCL | GPIO 22 |
LED | 

Most HC-SR501 modules accept 5V power and produce a 3.3V-compatible output, but check the exact module. Never feed 5V into an ESP32 GPIO.

## 4. Connect the website to Blynk

On the computer/server running the website, edit `.env`:

```env
PORT=3000
BLYNK_AUTH_TOKEN=your_device_auth_token
BLYNK_SERVER=https://blynk.cloud
BLYNK_VPIN=V0
DEMO_MODE=false
OCCUPANCY_HOLD_MS=120000
```

Restart the server:

```bash
npm start
```

The backend requests the current V0 value from Blynk. Do not put the auth token in `public/app.js`, HTML, or any client-side code. Do not commit `.env` to GitHub.

## 5. Publish / share

Push the repository to GitHub. The Node.js backend must run on a Node-capable hosting service for other people to use the live Blynk dashboard. GitHub Pages alone only hosts static files and cannot safely store the Blynk token or run `server.js`.

Set the same environment variables in your hosting provider's dashboard. Deploy the repository as a Node.js web service with start command `npm start`.

## API routes

- `GET /api/status` — returns current sensor status.
- `POST /api/demo/motion` — demo-only sensor simulator; available only when `DEMO_MODE=true` and no Blynk token is configured.

## Demo timetable

The sample timetable uses the browser's local time and is defined in `public/app.js`. It is sample data, not a real school timetable. Change the session times, subjects, teachers and sections before presenting.

## Suggested improvements

- Add multiple classrooms with one Blynk device/datastream per room.
- Store actual room schedules in a database instead of hard-coded demo data.
- Add sensor heartbeat / device-offline detection and a last-updated indicator.
- Add user roles for administrators and teachers.
- For reliable vacancy detection, combine PIR with another sensor and validate with real classroom trials.
