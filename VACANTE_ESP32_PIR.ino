
#define BLYNK_TEMPLATE_ID "TMPL6dGw3Sww9"
#define BLYNK_TEMPLATE_NAME "VACANTE"
#define BLYNK_AUTH_TOKEN "YOUR_DEVICE_AUTH_TOKEN"




#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// LCD SETTINGS
LiquidCrystal_I2C lcd(0x27, 20, 4);

// WIFI SETTINGS
char ssid[] = "YOUR_CLASSROOM_WIFI";
char pass[] = "YOUR_WIFI_PASSWORD";

// PIR SENSOR
const int pirPin = 13;

// OCCUPANCY SETTINGS
bool roomOccupied = false;
bool lastDisplayedState = false;

unsigned long lastMotionTime = 0;

// 15 seconds of inactivity before marking the room unoccupied
const unsigned long OCCUPANCY_DELAY = 15000;

// TIMERS
unsigned long lastWiFiAttempt = 0;
unsigned long lastBlynkAttempt = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastBlynkUpdate = 0;

// Keep heartbeat frequent so the server can detect connection
const unsigned long HEARTBEAT_INTERVAL = 5000;

// Send occupancy updates every second
const unsigned long OCCUPANCY_INTERVAL = 1000;

// HEARTBEAT
bool heartbeatState = false;

// ==========================================
// LCD DISPLAY FUNCTION
// ==========================================

void updateLCD() {
  lcd.clear();

  lcd.setCursor(4, 1);
  lcd.print("THE ROOM IS");

  if (roomOccupied) {
    lcd.setCursor(6, 2);
    lcd.print("OCCUPIED");

    Serial.println("ROOM STATUS: OCCUPIED");
  } else {
    lcd.setCursor(5, 2);
    lcd.print("UNOCCUPIED");

    Serial.println("ROOM STATUS: UNOCCUPIED");
  }
}

// ==========================================
// SETUP
// ==========================================

void setup() {
  Serial.begin(115200);

  pinMode(pirPin, INPUT);

  delay(1000);

  Wire.begin(21, 22);

  lcd.init();
  lcd.backlight();
  lcd.clear();

  lcd.setCursor(3, 1);
  lcd.print("VACANTE SYSTEM");

  lcd.setCursor(3, 2);
  lcd.print("Starting...");

  // Initialize WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, pass);

  // Initialize Blynk
  Blynk.config(BLYNK_AUTH_TOKEN);

  lastMotionTime = millis();

  Serial.println("VACANTE started.");
}

// ==========================================
// MAIN LOOP
// ==========================================

void loop() {

  unsigned long now = millis();

  // ----------------------------------------
  // WIFI RECONNECTION
  // ----------------------------------------

  if (WiFi.status() != WL_CONNECTED) {

    if (now - lastWiFiAttempt >= 10000) {

      lastWiFiAttempt = now;

      WiFi.begin(ssid, pass);

      Serial.println("Connecting to WiFi...");
    }
  }

  // ----------------------------------------
  // BLYNK RECONNECTION
  // ----------------------------------------

  if (WiFi.status() == WL_CONNECTED) {

    if (!Blynk.connected() &&
        now - lastBlynkAttempt >= 5000) {

      lastBlynkAttempt = now;

      Blynk.connect(1000);
    }

    if (Blynk.connected()) {
      Blynk.run();
    }
  }

  // ----------------------------------------
  // PIR SENSOR DETECTION
  // ----------------------------------------

  int pirState = digitalRead(pirPin);

  // Motion detected
  if (pirState == HIGH) {

    // Reset inactivity timer
    lastMotionTime = now;

    // Immediately mark room as occupied
    if (!roomOccupied) {

      roomOccupied = true;

      Serial.println("Motion detected!");
      Serial.println("15-second inactivity timer reset.");

    }
  }

  // No motion detected
  else {

    // Check whether 15 seconds have passed
    // since the last detected movement
    if (roomOccupied &&
        now - lastMotionTime >= OCCUPANCY_DELAY) {

      roomOccupied = false;

      Serial.println("No motion for 15 seconds.");
      Serial.println("Room is now unoccupied.");
    }
  }

  // ----------------------------------------
  // UPDATE LCD WHEN STATUS CHANGES
  // ----------------------------------------

  if (roomOccupied != lastDisplayedState) {

    lastDisplayedState = roomOccupied;

    updateLCD();
  }

  // ----------------------------------------
  // SEND OCCUPANCY TO BLYNK V0
  // ----------------------------------------

  if (Blynk.connected() &&
      now - lastBlynkUpdate >= OCCUPANCY_INTERVAL) {

    lastBlynkUpdate = now;

    Blynk.virtualWrite(V0, roomOccupied ? 1 : 0);
  }

  // ----------------------------------------
  // SEND HEARTBEAT TO BLYNK V1
  // ----------------------------------------

  if (Blynk.connected() &&
      now - lastHeartbeat >= HEARTBEAT_INTERVAL) {

    lastHeartbeat = now;

    heartbeatState = !heartbeatState;

    Blynk.virtualWrite(V1, heartbeatState ? 1 : 0);

    Serial.print("Heartbeat: ");
    Serial.println(heartbeatState ? 1 : 0);
  }
}
