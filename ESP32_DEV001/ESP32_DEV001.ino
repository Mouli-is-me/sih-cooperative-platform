#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// =====================================================
// WIFI
// =====================================================

const char* WIFI_SSID = "Mouli";
const char* WIFI_PASSWORD = "password illa";

// =====================================================
// BACKEND
// =====================================================

const char* API_BASE =
  "https://sih-cooperative-platform.onrender.com/api";

// =====================================================
// DEVICE IDENTITY
// =====================================================

const char* DEVICE_CODE = "DEV-001";
const char* DEVICE_KEY = "SIH-DEV001-2026";

// =====================================================
// HARDWARE PINS
// =====================================================

#define GREEN_LED_PIN 25
#define RED_LED_PIN   26
#define BUZZER_PIN    27

#define BUTTON_PREV_PIN 32
#define BUTTON_NEXT_PIN 33

#define OLED_SDA 21
#define OLED_SCL 22

// =====================================================
// OLED
// =====================================================

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define OLED_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  OLED_RESET
);

// =====================================================
// PAGES
// =====================================================

int currentPage = 0;

const int TOTAL_PAGES = 5;

// =====================================================
// DEVICE STATES
// =====================================================

enum DeviceState {
  AVAILABLE,
  JOB_REQUESTED,
  JOB_ACCEPTED
};

DeviceState deviceState = AVAILABLE;

// =====================================================
// BUTTON STATES
// =====================================================

bool prevRawState = HIGH;
bool nextRawState = HIGH;

bool prevStableState = HIGH;
bool nextStableState = HIGH;

unsigned long prevLastChange = 0;
unsigned long nextLastChange = 0;

bool bothHandled = false;

const unsigned long DEBOUNCE_TIME = 50;

// =====================================================
// BACKEND POLLING
// =====================================================

unsigned long lastBackendPoll = 0;

const unsigned long BACKEND_POLL_INTERVAL = 3000;

// =====================================================
// CURRENT JOB
// =====================================================

String currentJobId = "";

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  // ---------------------------------------------------
  // GPIO
  // ---------------------------------------------------

  pinMode(BUTTON_PREV_PIN, INPUT_PULLUP);
  pinMode(BUTTON_NEXT_PIN, INPUT_PULLUP);

  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // ---------------------------------------------------
  // OLED
  // ---------------------------------------------------

  Wire.begin(
    OLED_SDA,
    OLED_SCL
  );

  if (!display.begin(
        SSD1306_SWITCHCAPVCC,
        OLED_ADDRESS
      )) {

    Serial.println("OLED NOT FOUND!");

    while (true) {
      delay(100);
    }
  }

  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  // ---------------------------------------------------
  // INITIAL STATE
  // ---------------------------------------------------

  setAvailable();

  showStartup();

  delay(2000);

  // ---------------------------------------------------
  // WIFI
  // ---------------------------------------------------

  connectWiFi();

  delay(1000);

  // Initialize button states after startup
  prevRawState = digitalRead(BUTTON_PREV_PIN);
  nextRawState = digitalRead(BUTTON_NEXT_PIN);

  prevStableState = prevRawState;
  nextStableState = nextRawState;

  showPage(currentPage);
}

// =====================================================
// MAIN LOOP
// =====================================================

void loop() {

  // Handle physical buttons continuously
  handleButtons();

  // Poll backend every 3 seconds
  if (
    millis() - lastBackendPoll >=
    BACKEND_POLL_INTERVAL
  ) {

    lastBackendPoll = millis();

    pollBackend();
  }
}

// =====================================================
// WIFI CONNECTION
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  display.clearDisplay();

  display.setTextSize(1);

  display.setCursor(20, 15);
  display.println("CONNECTING");

  display.setCursor(20, 30);
  display.println("TO WIFI...");

  display.display();

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  int attempts = 0;

  while (
    WiFi.status() != WL_CONNECTED &&
    attempts < 30
  ) {

    delay(500);

    Serial.print(".");

    attempts++;
  }

  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println("WiFi connected!");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    display.clearDisplay();

    display.setTextSize(1);

    display.setCursor(25, 15);
    display.println("WIFI CONNECTED");

    display.setCursor(25, 30);
    display.println("DEVICE: DEV-001");

    display.setCursor(25, 45);
    display.println("ONLINE");

    display.display();

    delay(1500);

  } else {

    Serial.println(
      "WiFi connection failed"
    );

    display.clearDisplay();

    display.setTextSize(1);

    display.setCursor(25, 20);
    display.println("WIFI OFFLINE");

    display.setCursor(15, 38);
    display.println("Check credentials");

    display.display();

    delay(1500);
  }
}

// =====================================================
// BACKEND POLLING
// =====================================================

void pollBackend() {

  // No WiFi
  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "WiFi disconnected. Reconnecting..."
    );

    connectWiFi();

    return;
  }

  WiFiClientSecure client;

  // Prototype only.
  // For production, use certificate validation.
  client.setInsecure();

  HTTPClient http;

  String url =
    String(API_BASE) +
    "/hardware/device/" +
    DEVICE_CODE +
    "/state";

  Serial.println();
  Serial.println("Polling backend:");
  Serial.println(url);

  if (!http.begin(client, url)) {

    Serial.println(
      "HTTP connection failed"
    );

    return;
  }

  http.addHeader(
    "X-Device-Code",
    DEVICE_CODE
  );

  http.addHeader(
    "X-Device-Key",
    DEVICE_KEY
  );

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  int httpCode =
    http.GET();

  Serial.print("HTTP Status: ");
  Serial.println(httpCode);

  if (httpCode == 200) {

    String response =
      http.getString();

    Serial.println(
      "Backend response:"
    );

    Serial.println(response);

    processBackendResponse(
      response
    );

  } else {

    Serial.print(
      "Backend error: "
    );

    Serial.println(
      http.errorToString(
        httpCode
      )
    );
  }

  http.end();
}

// =====================================================
// PROCESS BACKEND RESPONSE
// =====================================================

void processBackendResponse(
  String response
) {

  // ---------------------------------------------------
  // JOB REQUESTED
  // ---------------------------------------------------

  if (
    response.indexOf(
      "\"state\":\"JOB_REQUESTED\""
    ) >= 0
  ) {

    // Only trigger notification once
    if (
      deviceState !=
      JOB_REQUESTED
    ) {

      currentJobId =
        extractJobId(response);

      requestJob();
    }

    return;
  }

  // ---------------------------------------------------
  // JOB ACCEPTED
  // ---------------------------------------------------

  if (
    response.indexOf(
      "\"state\":\"JOB_ACCEPTED\""
    ) >= 0
  ) {

    if (
      deviceState !=
      JOB_ACCEPTED
    ) {

      deviceState =
        JOB_ACCEPTED;

      digitalWrite(
        GREEN_LED_PIN,
        HIGH
      );

      digitalWrite(
        RED_LED_PIN,
        LOW
      );

      digitalWrite(
        BUZZER_PIN,
        LOW
      );

      showJobAccepted();
    }

    return;
  }

  // ---------------------------------------------------
  // AVAILABLE
  // ---------------------------------------------------

  if (
    response.indexOf(
      "\"state\":\"AVAILABLE\""
    ) >= 0
  ) {

    if (
      deviceState !=
      AVAILABLE
    ) {

      setAvailable();

      showPage(
        currentPage
      );
    }
  }
}

// =====================================================
// EXTRACT JOB ID
// =====================================================

String extractJobId(
  String response
) {

  String key =
    "\"jobId\":\"";

  int start =
    response.indexOf(key);

  if (start < 0) {
    return "";
  }

  start += key.length();

  int end =
    response.indexOf(
      "\"",
      start
    );

  if (end < 0) {
    return "";
  }

  return response.substring(
    start,
    end
  );
}

// =====================================================
// BUTTON HANDLING
// =====================================================
// Button 1 = PREVIOUS
// Button 2 = NEXT
// Both = ACCEPT JOB
// =====================================================

void handleButtons() {

  unsigned long now = millis();

  // ---------------------------------------------------
  // Read raw buttons
  // ---------------------------------------------------

  bool prevRaw =
    digitalRead(BUTTON_PREV_PIN);

  bool nextRaw =
    digitalRead(BUTTON_NEXT_PIN);

  // ---------------------------------------------------
  // Detect raw changes
  // ---------------------------------------------------

  if (prevRaw != prevRawState) {

    prevRawState = prevRaw;

    prevLastChange = now;
  }

  if (nextRaw != nextRawState) {

    nextRawState = nextRaw;

    nextLastChange = now;
  }

  // ---------------------------------------------------
  // Confirm stable PREVIOUS state
  // ---------------------------------------------------

  if (
    (now - prevLastChange >= DEBOUNCE_TIME) &&
    prevStableState != prevRawState
  ) {

    prevStableState =
      prevRawState;
  }

  // ---------------------------------------------------
  // Confirm stable NEXT state
  // ---------------------------------------------------

  if (
    (now - nextLastChange >= DEBOUNCE_TIME) &&
    nextStableState != nextRawState
  ) {

    nextStableState =
      nextRawState;
  }

  // ---------------------------------------------------
  // BOTH BUTTONS PRESSED
  // ---------------------------------------------------

  if (
    prevStableState == LOW &&
    nextStableState == LOW
  ) {

    if (!bothHandled) {

      bothHandled = true;

      Serial.println(
        "BOTH BUTTONS PRESSED"
      );

      // Only accept if there is a job
      if (
        deviceState ==
        JOB_REQUESTED
      ) {

        Serial.println(
          "ACCEPTING JOB"
        );

        acceptJob();

      } else {

        showConfirmation();
      }
    }

    return;
  }

  // ---------------------------------------------------
  // BOTH BUTTONS RELEASED
  // ---------------------------------------------------

  if (
    prevStableState == HIGH &&
    nextStableState == HIGH
  ) {

    bothHandled = false;

    return;
  }

  // ---------------------------------------------------
  // PREVIOUS BUTTON
  // ---------------------------------------------------

  if (
    prevStableState == LOW &&
    nextStableState == HIGH &&
    !bothHandled
  ) {

    currentPage--;

    if (currentPage < 0) {

      currentPage =
        TOTAL_PAGES - 1;
    }

    Serial.print(
      "PAGE: "
    );

    Serial.println(
      currentPage + 1
    );

    showPage(
      currentPage
    );

    // Wait for physical release
    while (
      digitalRead(
        BUTTON_PREV_PIN
      ) == LOW
    ) {

      delay(5);
    }

    // Reset debounce state
    prevRawState = HIGH;
    prevStableState = HIGH;
    prevLastChange = millis();

    return;
  }

  // ---------------------------------------------------
  // NEXT BUTTON
  // ---------------------------------------------------

  if (
    nextStableState == LOW &&
    prevStableState == HIGH &&
    !bothHandled
  ) {

    currentPage++;

    if (
      currentPage >=
      TOTAL_PAGES
    ) {

      currentPage = 0;
    }

    Serial.print(
      "PAGE: "
    );

    Serial.println(
      currentPage + 1
    );

    showPage(
      currentPage
    );

    // Wait for physical release
    while (
      digitalRead(
        BUTTON_NEXT_PIN
      ) == LOW
    ) {

      delay(5);
    }

    // Reset debounce state
    nextRawState = HIGH;
    nextStableState = HIGH;
    nextLastChange = millis();

    return;
  }
}

// =====================================================
// JOB REQUEST
// =====================================================

void requestJob() {

  deviceState =
    JOB_REQUESTED;

  Serial.println(
    "NEW JOB REQUEST!"
  );

  // Red ON
  digitalWrite(
    GREEN_LED_PIN,
    LOW
  );

  digitalWrite(
    RED_LED_PIN,
    HIGH
  );

  // Buzzer
  digitalWrite(
    BUZZER_PIN,
    HIGH
  );

  delay(250);

  digitalWrite(
    BUZZER_PIN,
    LOW
  );

  showJobRequest();
}

// =====================================================
// ACCEPT JOB
// =====================================================

void acceptJob() {

  Serial.println(
    "ACCEPTING JOB..."
  );

  deviceState =
    JOB_ACCEPTED;

  // Green ON
  digitalWrite(
    GREEN_LED_PIN,
    HIGH
  );

  // Red OFF
  digitalWrite(
    RED_LED_PIN,
    LOW
  );

  // Confirmation beep
  digitalWrite(
    BUZZER_PIN,
    HIGH
  );

  delay(120);

  digitalWrite(
    BUZZER_PIN,
    LOW
  );

  showJobAccepted();

  // ---------------------------------------------------
  // Tell backend
  // ---------------------------------------------------

  sendHeartbeat(
    "JOB_ACCEPTED"
  );

  delay(1500);

  showPage(
    currentPage
  );
}

// =====================================================
// HEARTBEAT / STATE UPDATE
// =====================================================

void sendHeartbeat(
  String state
) {

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "Cannot send heartbeat - WiFi offline"
    );

    return;
  }

  WiFiClientSecure client;

  client.setInsecure();

  HTTPClient http;

  String url =
    String(API_BASE) +
    "/hardware/device/" +
    DEVICE_CODE +
    "/heartbeat";

  Serial.println(
    "Sending heartbeat:"
  );

  Serial.println(url);

  if (!http.begin(
        client,
        url
      )) {

    Serial.println(
      "Heartbeat connection failed"
    );

    return;
  }

  http.addHeader(
    "X-Device-Code",
    DEVICE_CODE
  );

  http.addHeader(
    "X-Device-Key",
    DEVICE_KEY
  );

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  String body =
    "{\"state\":\"" +
    state +
    "\"}";

  int httpCode =
    http.POST(body);

  Serial.print(
    "Heartbeat HTTP: "
  );

  Serial.println(
    httpCode
  );

  Serial.println(
    http.getString()
  );

  http.end();
}

// =====================================================
// AVAILABLE
// =====================================================

void setAvailable() {

  deviceState =
    AVAILABLE;

  digitalWrite(
    GREEN_LED_PIN,
    HIGH
  );

  digitalWrite(
    RED_LED_PIN,
    LOW
  );

  digitalWrite(
    BUZZER_PIN,
    LOW
  );
}

// =====================================================
// STARTUP SCREEN
// =====================================================

void showStartup() {

  display.clearDisplay();

  display.setTextSize(2);

  display.setCursor(
    8,
    5
  );

  display.println(
    "CO-OP OS"
  );

  display.setTextSize(1);

  display.setCursor(
    25,
    30
  );

  display.println(
    "WORKER DEVICE"
  );

  display.setCursor(
    45,
    45
  );

  display.println(
    "DEV-001"
  );

  display.display();
}

// =====================================================
// NORMAL PAGES
// =====================================================

void showPage(
  int page
) {

  display.clearDisplay();

  // ===================================================
  // PAGE 1 - WORKER PROFILE
  // ===================================================

  if (page == 0) {

    display.setTextSize(1);

    display.setCursor(
      0,
      0
    );

    display.println(
      "WORKER PROFILE"
    );

    display.drawLine(
      0,
      10,
      127,
      10,
      SSD1306_WHITE
    );

    display.setTextSize(2);

    display.setCursor(
      15,
      18
    );

    display.println(
      "KUMAR M."
    );

    display.setTextSize(1);

    display.setCursor(
      20,
      42
    );

    display.println(
      "Worker: WRK-001"
    );

    display.setCursor(
      20,
      54
    );

    display.println(
      "Device: DEV-001"
    );
  }

  // ===================================================
  // PAGE 2 - DEVICE STATUS
  // ===================================================

  else if (page == 1) {

    display.setTextSize(1);

    display.setCursor(
      0,
      0
    );

    display.println(
      "DEVICE STATUS"
    );

    display.drawLine(
      0,
      10,
      127,
      10,
      SSD1306_WHITE
    );

    display.setTextSize(2);

    display.setCursor(
      25,
      17
    );

    display.println(
      WiFi.status() ==
      WL_CONNECTED
        ? "ONLINE"
        : "OFFLINE"
    );

    display.setTextSize(1);

    display.setCursor(
      20,
      42
    );

    display.println(
      "DEV-001"
    );

    display.setCursor(
      20,
      54
    );

    display.println(
      "ESP32 MODULE"
    );
  }

  // ===================================================
  // PAGE 3 - SAFETY STATUS
  // ===================================================

  else if (page == 2) {

    display.setTextSize(1);

    display.setCursor(
      0,
      0
    );

    display.println(
      "SAFETY STATUS"
    );

    display.drawLine(
      0,
      10,
      127,
      10,
      SSD1306_WHITE
    );

    display.setTextSize(2);

    if (
      deviceState ==
      JOB_REQUESTED
    ) {

      display.setCursor(
        25,
        18
      );

      display.println(
        "ALERT"
      );

      display.setTextSize(1);

      display.setCursor(
        15,
        43
      );

      display.println(
        "Job requested"
      );

      display.setCursor(
        18,
        55
      );

      display.println(
        "B1+B2 = ACCEPT"
      );

    } else {

      display.setCursor(
        40,
        18
      );

      display.println(
        "SAFE"
      );

      display.setTextSize(1);

      display.setCursor(
        17,
        43
      );

      display.println(
        "No active alerts"
      );

      display.setCursor(
        22,
        55
      );

      display.println(
        "System OK"
      );
    }
  }

  // ===================================================
  // PAGE 4 - WORK STATUS
  // ===================================================

  else if (page == 3) {

    display.setTextSize(1);

    display.setCursor(
      0,
      0
    );

    display.println(
      "WORK STATUS"
    );

    display.drawLine(
      0,
      10,
      127,
      10,
      SSD1306_WHITE
    );

    display.setTextSize(2);

    if (
      deviceState ==
      JOB_ACCEPTED
    ) {

      display.setCursor(
        30,
        18
      );

      display.println(
        "ACTIVE"
      );

      display.setTextSize(1);

      display.setCursor(
        15,
        43
      );

      display.println(
        "Job accepted"
      );

      display.setCursor(
        25,
        55
      );

      display.println(
        "Work in progress"
      );

    } else {

      display.setCursor(
        30,
        18
      );

      display.println(
        "READY"
      );

      display.setTextSize(1);

      display.setCursor(
        20,
        43
      );

      display.println(
        "Waiting for job"
      );

      display.setCursor(
        25,
        55
      );

      display.println(
        "Worker ready"
      );
    }
  }

  // ===================================================
  // PAGE 5 - DEVICE INFO
  // ===================================================

  else if (page == 4) {

    display.setTextSize(1);

    display.setCursor(
      0,
      0
    );

    display.println(
      "DEVICE INFO"
    );

    display.drawLine(
      0,
      10,
      127,
      10,
      SSD1306_WHITE
    );

    display.setCursor(
      10,
      18
    );

    display.println(
      "ID: DEV-001"
    );

    display.setCursor(
      10,
      30
    );

    display.println(
      "MCU: ESP32"
    );

    display.setCursor(
      10,
      42
    );

    display.println(
      WiFi.status() ==
      WL_CONNECTED
        ? "WiFi: CONNECTED"
        : "WiFi: OFFLINE"
    );

    display.setCursor(
      10,
      54
    );

    display.println(
      "Server: API"
    );
  }

  display.display();
}

// =====================================================
// JOB REQUEST SCREEN
// =====================================================

void showJobRequest() {

  display.clearDisplay();

  display.setTextSize(1);

  display.setCursor(
    25,
    0
  );

  display.println(
    "JOB REQUEST"
  );

  display.drawLine(
    0,
    10,
    127,
    10,
    SSD1306_WHITE
  );

  display.setCursor(
    10,
    17
  );

  display.println(
    "New job for:"
  );

  display.setTextSize(2);

  display.setCursor(
    28,
    27
  );

  display.println(
    "KUMAR M."
  );

  display.setTextSize(1);

  display.setCursor(
    18,
    47
  );

  display.println(
    "Plumbing Work"
  );

  display.setCursor(
    18,
    57
  );

  display.println(
    "B1+B2 = ACCEPT"
  );

  display.display();
}

// =====================================================
// JOB ACCEPTED SCREEN
// =====================================================

void showJobAccepted() {

  display.clearDisplay();

  display.setTextSize(2);

  display.setCursor(
    15,
    5
  );

  display.println(
    "ACCEPTED"
  );

  display.drawLine(
    0,
    28,
    127,
    28,
    SSD1306_WHITE
  );

  display.setTextSize(1);

  display.setCursor(
    20,
    36
  );

  display.println(
    "KUMAR M."
  );

  display.setCursor(
    20,
    48
  );

  display.println(
    "STATUS: ACTIVE"
  );

  display.setCursor(
    20,
    59
  );

  display.println(
    "DEV-001"
  );

  display.display();
}

// =====================================================
// CONFIRMATION
// =====================================================

void showConfirmation() {

  display.clearDisplay();

  display.setTextSize(2);

  display.setCursor(
    25,
    5
  );

  display.println(
    "CONFIRM"
  );

  display.drawLine(
    0,
    28,
    127,
    28,
    SSD1306_WHITE
  );

  display.setTextSize(1);

  display.setCursor(
    18,
    40
  );

  display.println(
    "No pending job"
  );

  display.display();

  delay(800);

  showPage(
    currentPage
  );
}