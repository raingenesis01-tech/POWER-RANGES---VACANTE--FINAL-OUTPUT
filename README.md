# VACANTE — Smart Classroom IoT

**An IoT-based classroom occupancy monitoring system powered by ESP32, PIR motion sensing, Blynk Cloud, and a web dashboard.**

VACANTE is a Smart Classroom IoT prototype designed to help monitor classroom occupancy and provide information about room availability. By combining motion detection, cloud connectivity, and a web-based dashboard, the system offers a convenient way to identify whether a classroom is scheduled for use and whether movement has been detected.

---

## Project Overview

VACANTE integrates hardware and software components to provide classroom occupancy monitoring.

The system uses an **ESP32 microcontroller** connected to a **PIR (Passive Infrared) motion sensor** to detect movement inside a classroom. Sensor readings are sent to **Blynk Cloud**, where a Node.js backend retrieves the latest data and makes it available to the web dashboard.

The dashboard combines sensor information with a sample classroom timetable to display the classroom's current status.

## Key Features

- **Real-Time Motion Monitoring** — Uses a PIR sensor connected to an ESP32 to detect movement.
- **Cloud Connectivity** — Sends sensor readings to Blynk Cloud through an internet connection.
- **Web-Based Dashboard** — Displays classroom occupancy information through a responsive interface.
- **Schedule Integration** — Uses a classroom timetable to identify scheduled class sessions.
- **Demo Mode** — Allows the dashboard to be tested without physical hardware or a Blynk connection.
- **Secure Backend Configuration** — Keeps the Blynk authentication token on the server instead of exposing it in frontend code.

## Technologies Used

| Component | Technology |
|---|---|
| Microcontroller | ESP32 |
| Motion Sensor | PIR Sensor (HC-SR501 or compatible) |
| Cloud Platform | Blynk Cloud |
| Backend | Node.js |
| Frontend | HTML, CSS, JavaScript |
| Hardware Programming | Arduino IDE |
| Communication | Wi-Fi and HTTPS API |

## Project Structure

```text
VACANTE/
│
├── hardware/
│   └── VACANTE_ESP32_PIR.ino
│
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
│
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

### File Descriptions

- `hardware/` — Contains the Arduino firmware for the ESP32 and PIR sensor.
- `public/` — Contains the web dashboard, styling, and frontend JavaScript.
- `.gitignore` — Prevents sensitive files and unnecessary dependencies from being uploaded.
- `server.js` — Runs the Node.js backend and communicates with Blynk Cloud.
- `package.json` — Defines the project's dependencies and start command.
- `package-lock.json` — Records the installed dependency versions.
- `README.md` — Contains project documentation and setup instructions.

---

## How the System Works

1. **Motion Detection:** The PIR sensor detects changes in infrared energy caused by movement inside the classroom.
2. **ESP32 Processing:** The ESP32 reads the sensor signal through GPIO 13 and applies a 25 seconds motion hold window.
3. **Cloud Communication:** The ESP32 sends an occupancy signal (`1` or `0`) to Blynk Virtual Pin V0.
4. **Backend Processing:** The Node.js server retrieves the latest sensor value through Blynk's HTTPS API.
5. **Dashboard Updates:** The web dashboard requests updated information from the backend every three seconds.
6. **Occupancy Display:** The dashboard combines the sensor reading with the sample timetable to display the classroom's current status.

### Occupancy Status Logic

- **In Use — Scheduled:** A class is currently listed in the timetable.
- **Occupied:** No class is scheduled, but recent movement has been detected.
- **Unoccupied:** No class is scheduled and no recent movement has been detected.

**Important:** Scheduled status is based on timetable information, while occupied or unoccupied status is estimated using motion detection.

---

## Hardware Requirements

- ESP32 development board
- PIR motion sensor (HC-SR501 or compatible)
- I2C LCD display (if used in the firmware)
- Breadboard
- Jumper wires
- USB cable
- Wi-Fi connection

## Hardware Connections

### PIR Sensor to ESP32

| PIR Sensor Pin | ESP32 Connection |
|---|---|
| VCC | 5V / suitable power supply |
| GND | GND |
| OUT | GPIO 13 |

### I2C LCD to ESP32

| LCD Pin | ESP32 Connection |
|---|---|
| GND | GND |
| VCC | 5V / suitable power supply |
| SDA | GPIO 21 |
| SCL | GPIO 22 |

**Hardware Safety:** Check the specifications of your exact PIR and LCD modules before connecting them. Never apply a 5V signal directly to an ESP32 GPIO pin.

---

## Software Requirements

Install the following before running the project:

- [Node.js](https://nodejs.org/) version 18 or newer
- [Arduino IDE](https://www.arduino.cc/en/software)
- [Blynk Console](https://blynk.cloud/)
- Git (optional, for version control)

### Required Arduino Libraries

Install the compatible libraries through the Arduino IDE Library Manager:

- Blynk
- LiquidCrystal_I2C (if using the I2C LCD firmware)

Also install the ESP32 board package through the Arduino IDE Boards Manager.

---

## Running the Web Dashboard in Demo Mode

Demo mode allows the web dashboard to operate without a physical ESP32 device or Blynk Cloud connection.

### Step 1: Clone the Repository

```bash
git clone https://github.com/raingenesis01-tech/POWER-RANGES---FINAL-OUTPUT-VACANTE.git
```

### Step 2: Open the Project Folder

```bash
cd POWER-RANGES---FINAL-OUTPUT-VACANTE
```

### Step 3: Install Dependencies

```bash
npm.cmd install
```

### Step 4: Configure Environment Variables

Create a local file named `.env` in the project root and use the following configuration for demo mode:

```env
PORT=3000
BLYNK_AUTH_TOKEN=
BLYNK_SERVER=https://blynk.cloud
BLYNK_VPIN=V0
DEMO_MODE=true
OCCUPANCY_HOLD_MS=120000
```

Do not upload this `.env` file to GitHub.

### Step 5: Start the Server

```bash
npm start
```

### Step 6: Open the Dashboard

Visit:

http://localhost:3000

Use the **Simulate Movement** and **Clear Movement** controls to test the dashboard.

The sample classroom timetable is defined in `public/app.js`. Update the schedule to match your demonstration requirements.

---

## Configuring Blynk Cloud

To connect the actual ESP32 hardware to Blynk Cloud:

1. Log in to [Blynk Console](https://blynk.cloud/).
2. Create a new device template for the ESP32.
3. Add an Integer Datastream.
4. Configure the datastream to use Virtual Pin V0.
5. Set the minimum value to `0` and maximum value to `1`.
6. Create a device using the template.
7. Obtain the Template ID, Template Name, and Device Auth Token.

### Blynk Datastream

| Setting | Value |
|---|---|
| Datastream Type | Integer |
| Virtual Pin | V0 |
| Minimum Value | 0 |
| Maximum Value | 1 |
| `0` | No recent motion detected |
| `1` | Recent motion detected |

Blynk API documentation:

[Get Datastream Value](https://docs.blynk.io/en/blynk.cloud/device-https-api/get-datastream-value)

---

## Uploading the ESP32 Firmware

1. Open Arduino IDE.
2. Install the ESP32 board package.
3. Install the required Arduino libraries.
4. Open `hardware/VACANTE_ESP32_PIR.ino`.
5. Configure the Blynk Template ID and Template Name.
6. Enter the device authentication token and Wi-Fi information locally.
7. Connect the PIR sensor signal wire to GPIO 13.
8. Connect the ESP32 to your computer.
9. Select the correct ESP32 board and COM port.
10. Upload the firmware.
11. Open Serial Monitor and set the baud rate to 115200.

**Security Reminder:** Never upload real Blynk tokens or Wi-Fi passwords to GitHub. Keep actual credentials in your local configuration and use placeholders in the shared firmware. Never commit your actual `.env` file.

---

## Connecting the Dashboard to Blynk

To use live sensor data, configure the backend environment variables in the local `.env` file:

```env
PORT=3000
BLYNK_AUTH_TOKEN=your_device_auth_token
BLYNK_SERVER=https://blynk.cloud
BLYNK_VPIN=V0
DEMO_MODE=false
OCCUPANCY_HOLD_MS=120000
```

Replace the example token with your actual device authentication token.

Restart the backend:

```bash
npm start
```

The Node.js server retrieves the latest V0 datastream value from Blynk Cloud and provides it to the dashboard.

**Never place the Blynk authentication token in `public/app.js`, HTML, CSS, or any other frontend file. Never commit your actual `.env` file to GitHub.**

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | Retrieves the current classroom sensor status. |
| POST | `/api/demo/motion` | Simulates motion detection in demo mode. |

The demo motion endpoint is available only when demo mode is enabled and no Blynk authentication token is configured.

---

## Limitations

VACANTE is a prototype and has limitations that should be considered before real-world deployment.

- **Motion-Based Detection:** PIR sensors detect movement rather than the continuous presence of a person.
- **Stationary Occupants:** A person sitting still for an extended period may not trigger the sensor.
- **Schedule Dependency:** Scheduled occupancy depends on the accuracy of the timetable configured in the dashboard.
- **Internet Dependency:** Live cloud monitoring requires a working internet connection.
- **Single-Room Prototype:** The current implementation is designed around a single classroom.

Therefore, an unoccupied reading should be interpreted as an estimate based on the absence of recent motion, not confirmation that the classroom is completely empty.

---

## Future Improvements

Potential improvements for future versions include:

- Multiple classroom monitoring with individual ESP32 devices.
- Centralized database integration for classroom schedules.
- Improved occupancy accuracy using additional sensors.
- Device connectivity monitoring and offline alerts.
- Historical occupancy reports and analytics.
- Administrator and teacher accounts.
- Improved dashboard notifications.
- Combining PIR with additional sensors for more reliable vacancy detection.

---

## Project Purpose

VACANTE demonstrates how Internet of Things technology can support smarter classroom management by combining physical sensors, cloud-based communication, and accessible web interfaces.

By providing estimated classroom occupancy information, the project explores a practical approach to improving room utilization and supporting more informed classroom scheduling decisions.

**VACANTE — Making classroom availability smarter, simpler, and more accessible.**