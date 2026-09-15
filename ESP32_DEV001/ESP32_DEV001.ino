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
// DEVICE
// =====================================================

const char* DEVICE_CODE = "DEV-001";
const char* DEVICE_KEY = "SIH-DEV001-2026";

// =====================================================
// PINS
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
#define OLED_ADDRESS 0x3C

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  -1
);

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
// PAGE SYSTEM
// =====================================================

int currentPage = 0;

const int TOTAL_PAGES = 5;

// =====================================================
// BUTTON SETTINGS
// =====================================================

const unsigned long DEBOUNCE_TIME = 30;

bool lastButton1State = HIGH;
bool lastButton2State = HIGH;

unsigned long lastButton1Time = 0;
unsigned long lastButton2Time = 0;

// =====================================================
// BACKEND POLLING
// =====================================================

unsigned long lastBackendPoll = 0;

const unsigned long BACKEND_POLL_INTERVAL = 3000;

// =====================================================
// JOB REQUEST
// =====================================================

bool jobRequestAlerted = false;

// =====================================================
// SETUP
// =====================================================

void setup() {

  Serial.begin(115200);

  // ---------------------------------------------------
  // GPIO
  // ---------------------------------------------------

  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(BUTTON_PREV_PIN, INPUT_PULLUP);
  pinMode(BUTTON_NEXT_PIN, INPUT_PULLUP);

  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

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

    Serial.println(
      "OLED initialization failed"
    );

    while (true) {
      delay(100);
    }
  }

  display.clearDisplay();

  display.setTextColor(
    SSD1306_WHITE
  );

  // ---------------------------------------------------
  // STARTUP
  // ---------------------------------------------------

  showStartup();

  delay(1500);

  // ---------------------------------------------------
  // INITIAL STATE
  // ---------------------------------------------------

  deviceState = AVAILABLE;

  updateLEDs();

  // ---------------------------------------------------
  // WIFI
  // ---------------------------------------------------

  connectWiFi();

  delay(1000);

  // ---------------------------------------------------
  // FIRST PAGE
  // ---------------------------------------------------

  showCurrentPage();
}

// =====================================================
// LOOP
// =====================================================

void loop() {

  // Handle physical buttons
  handleButtons();

  // Poll backend
  if (
    millis() - lastBackendPoll >=
    BACKEND_POLL_INTERVAL
  ) {

    lastBackendPoll = millis();

    pollBackend();
  }

  delay(5);
}

// =====================================================
// WIFI CONNECTION
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println(
    "Connecting to WiFi..."
  );

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

  if (
    WiFi.status() == WL_CONNECTED
  ) {

    Serial.println(
      "WiFi connected!"
    );

    Serial.print(
      "IP address: "
    );

    Serial.println(
      WiFi.localIP()
    );

  } else {

    Serial.println(
      "WiFi connection FAILED"
    );
  }
}

// =====================================================
// LED CONTROL
// =====================================================

void updateLEDs() {

  if (
    deviceState == JOB_REQUESTED
  ) {

    // Red = new job waiting
    digitalWrite(
      RED_LED_PIN,
      HIGH
    );

    digitalWrite(
      GREEN_LED_PIN,
      LOW
    );

  } else {

    // Green = normal/accepted
    digitalWrite(
      RED_LED_PIN,
      LOW
    );

    digitalWrite(
      GREEN_LED_PIN,
      HIGH
    );
  }
}

// =====================================================
// SHORT BUTTON BEEP
// =====================================================

void beepShort() {

  digitalWrite(
    BUZZER_PIN,
    HIGH
  );

  delay(80);

  digitalWrite(
    BUZZER_PIN,
    LOW
  );
}

// =====================================================
// ACCEPTED BEEP
// =====================================================

void beepAccepted() {

  beepShort();

  delay(100);

  beepShort();
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
    32
  );

  display.println(
    "WORKER DEVICE"
  );

  display.setCursor(
    43,
    48
  );

  display.println(
    "DEV-001"
  );

  display.display();
}

// =====================================================
// PAGE 1 - WORKER PROFILE
// =====================================================

void showWorkerProfile() {

  display.clearDisplay();

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

  display.display();
}

// =====================================================
// PAGE 2 - DEVICE STATUS
// =====================================================

void showDeviceStatus() {

  display.clearDisplay();

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

  if (
    WiFi.status() == WL_CONNECTED
  ) {

    display.println(
      "ONLINE"
    );

  } else {

    display.println(
      "OFFLINE"
    );
  }

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

  display.display();
}

// =====================================================
// PAGE 3 - SAFETY STATUS
// =====================================================

void showSafetyStatus() {

  display.clearDisplay();

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

  display.setCursor(
    40,
    18
  );

  display.println(
    "SAFE"
  );

  display.setTextSize(1);

  display.setCursor(
    15,
    43
  );

  display.println(
    "Safety module active"
  );

  display.setCursor(
    25,
    55
  );

  display.println(
    "System OK"
  );

  display.display();
}

// =====================================================
// PAGE 4 - WORK STATUS
// =====================================================

void showWorkStatus() {

  display.clearDisplay();

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

  display.setCursor(
    25,
    18
  );

  if (
    deviceState == JOB_ACCEPTED
  ) {

    display.println(
      "ACTIVE"
    );

  } else {

    display.println(
      "READY"
    );
  }

  display.setTextSize(1);

  display.setCursor(
    18,
    43
  );

  if (
    deviceState == JOB_ACCEPTED
  ) {

    display.println(
      "Job accepted"
    );

  } else {

    display.println(
      "Waiting for job"
    );
  }

  display.setCursor(
    18,
    55
  );

  if (
    deviceState == JOB_ACCEPTED
  ) {

    display.println(
      "Work in progress"
    );

  } else {

    display.println(
      "Worker ready"
    );
  }

  display.display();
}

// =====================================================
// PAGE 5 - DEVICE INFO
// =====================================================

void showDeviceInfo() {

  display.clearDisplay();

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

  if (
    WiFi.status() == WL_CONNECTED
  ) {

    display.println(
      "WiFi: CONNECTED"
    );

  } else {

    display.println(
      "WiFi: OFFLINE"
    );
  }

  display.setCursor(
    10,
    54
  );

  display.println(
    "CO-OP OS MODULE"
  );

  display.display();
}

// =====================================================
// SHOW CURRENT PAGE
// =====================================================

void showCurrentPage() {

  switch (currentPage) {

    case 0:
      showWorkerProfile();
      break;

    case 1:
      showDeviceStatus();
      break;

    case 2:
      showSafetyStatus();
      break;

    case 3:
      showWorkStatus();
      break;

    case 4:
      showDeviceInfo();
      break;

    default:

      currentPage = 0;

      showWorkerProfile();

      break;
  }
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
    8,
    17
  );

  display.println(
    "New job for:"
  );

  display.setTextSize(2);

  display.setCursor(
    25,
    27
  );

  display.println(
    "KUMAR M."
  );

  display.setTextSize(1);

  display.setCursor(
    18,
    45
  );

  display.println(
    "Plumbing Work"
  );

  display.setCursor(
    2,
    57
  );

  display.println(
    "B1 Reject  B1+B2 Accept"
  );

  display.display();
}

// =====================================================
// ACCEPTED SCREEN
// =====================================================

void showAccepted() {

  display.clearDisplay();

  display.setTextSize(2);

  display.setCursor(
    15,
    7
  );

  display.println(
    "ACCEPTED"
  );

  display.drawLine(
    0,
    29,
    127,
    29,
    SSD1306_WHITE
  );

  display.setTextSize(1);

  display.setCursor(
    20,
    39
  );

  display.println(
    "Job confirmed"
  );

  display.setCursor(
    20,
    52
  );

  display.println(
    "Status: ACTIVE"
  );

  display.display();
}

// =====================================================
// REJECTED SCREEN
// =====================================================

void showRejected() {

  display.clearDisplay();

  display.setTextSize(2);

  display.setCursor(
    15,
    7
  );

  display.println(
    "REJECTED"
  );

  display.drawLine(
    0,
    29,
    127,
    29,
    SSD1306_WHITE
  );

  display.setTextSize(1);

  display.setCursor(
    28,
    40
  );

  display.println(
    "JOB RESET"
  );

  display.setCursor(
    17,
    53
  );

  display.println(
    "Returning..."
  );

  display.display();
}

// =====================================================
// ACCEPT JOB
// =====================================================

void acceptJob() {

  Serial.println();
  Serial.println(
    "================================"
  );
  Serial.println(
    "JOB ACCEPTED BY WORKER"
  );
  Serial.println(
    "================================"
  );

  deviceState =
    JOB_ACCEPTED;

  jobRequestAlerted =
    false;

  updateLEDs();

  showAccepted();

  // Confirmation sound
  beepAccepted();

  // Tell backend
  sendHeartbeat(
    "JOB_ACCEPTED"
  );

  delay(1200);

  // Return to same page
  showCurrentPage();
}

// =====================================================
// REJECT JOB
// =====================================================

void rejectJob() {

  Serial.println();
  Serial.println(
    "================================"
  );
  Serial.println(
    "JOB REJECTED / RESET"
  );
  Serial.println(
    "================================"
  );

  deviceState =
    AVAILABLE;

  jobRequestAlerted =
    false;

  updateLEDs();

  showRejected();

  // Button/reject sound
  beepShort();

  // Tell backend
  sendHeartbeat(
    "AVAILABLE"
  );

  delay(1200);

  // Return to same page
  showCurrentPage();
}

// =====================================================
// BUTTON HANDLING
// =====================================================

void handleButtons() {

  bool button1 =
    digitalRead(
      BUTTON_PREV_PIN
    );

  bool button2 =
    digitalRead(
      BUTTON_NEXT_PIN
    );

  unsigned long now =
    millis();

  bool button1Pressed =
    (
      lastButton1State == HIGH &&
      button1 == LOW
    );

  bool button2Pressed =
    (
      lastButton2State == HIGH &&
      button2 == LOW
    );

  // ===================================================
  // JOB REQUEST MODE
  // ===================================================

  if (
    deviceState ==
    JOB_REQUESTED
  ) {

    // -------------------------------------------------
    // BOTH BUTTONS = ACCEPT
    // -------------------------------------------------

    if (
      button1 == LOW &&
      button2 == LOW
    ) {

      if (
        now - lastButton1Time >
        DEBOUNCE_TIME
      ) {

        lastButton1Time = now;
        lastButton2Time = now;

        // Button feedback
        beepShort();

        acceptJob();
      }

      lastButton1State = button1;
      lastButton2State = button2;

      return;
    }

    // -------------------------------------------------
    // B1 = REJECT
    // -------------------------------------------------

    if (
      button1Pressed
    ) {

      if (
        now - lastButton1Time >
        DEBOUNCE_TIME
      ) {

        lastButton1Time = now;

        // Button feedback
        beepShort();

        rejectJob();
      }

      lastButton1State = button1;
      lastButton2State = button2;

      return;
    }

    // -------------------------------------------------
    // B2 ALONE = NO ACTION
    // -------------------------------------------------

    lastButton1State = button1;
    lastButton2State = button2;

    return;
  }

  // ===================================================
  // NORMAL PAGE NAVIGATION
  // ===================================================

  // ---------------------------------------------------
  // B1 = PREVIOUS PAGE
  // ---------------------------------------------------

  if (
    button1Pressed
  ) {

    if (
      now - lastButton1Time >
      DEBOUNCE_TIME
    ) {

      lastButton1Time = now;

      // Button feedback
      beepShort();

      currentPage--;

      if (
        currentPage < 0
      ) {

        currentPage =
          TOTAL_PAGES - 1;
      }

      Serial.print(
        "Previous page: "
      );

      Serial.println(
        currentPage + 1
      );

      showCurrentPage();
    }
  }

  // ---------------------------------------------------
  // B2 = NEXT PAGE
  // ---------------------------------------------------

  if (
    button2Pressed
  ) {

    if (
      now - lastButton2Time >
      DEBOUNCE_TIME
    ) {

      lastButton2Time = now;

      // Button feedback
      beepShort();

      currentPage++;

      if (
        currentPage >= TOTAL_PAGES
      ) {

        currentPage = 0;
      }

      Serial.print(
        "Next page: "
      );

      Serial.println(
        currentPage + 1
      );

      showCurrentPage();
    }
  }

  // ---------------------------------------------------
  // SAVE BUTTON STATES
  // ---------------------------------------------------

  lastButton1State = button1;
  lastButton2State = button2;
}

// =====================================================
// POLL BACKEND
// =====================================================

void pollBackend() {

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected."
    );

    connectWiFi();

    return;
  }

  WiFiClientSecure client;

  // Prototype HTTPS
  client.setInsecure();

  HTTPClient http;

  String url =
    String(API_BASE) +
    "/hardware/device/" +
    DEVICE_CODE +
    "/state";

  Serial.println();
  Serial.println(
    "================================"
  );

  Serial.println(
    "Polling backend"
  );

  Serial.println(
    url
  );

  if (
    !http.begin(
      client,
      url
    )
  ) {

    Serial.println(
      "ERROR: HTTP begin failed"
    );

    return;
  }

  // Device authentication
  http.addHeader(
    "X-Device-Code",
    DEVICE_CODE
  );

  http.addHeader(
    "X-Device-Key",
    DEVICE_KEY
  );

  int httpCode =
    http.GET();

  Serial.print(
    "HTTP Status: "
  );

  Serial.println(
    httpCode
  );

  if (
    httpCode == 200
  ) {

    String response =
      http.getString();

    Serial.println(
      "Server response:"
    );

    Serial.println(
      response
    );

    // ===============================================
    // JOB REQUESTED
    // ===============================================

    if (
      response.indexOf(
        "JOB_REQUESTED"
      ) >= 0
    ) {

      Serial.println(
        ">>> JOB REQUEST RECEIVED <<<"
      );

      if (
        deviceState !=
        JOB_REQUESTED
      ) {

        deviceState =
          JOB_REQUESTED;

        jobRequestAlerted =
          false;

        updateLEDs();

        showJobRequest();
      }

      // Alert only once
      if (
        !jobRequestAlerted
      ) {

        beepShort();

        jobRequestAlerted =
          true;
      }
    }

    // ===============================================
    // JOB ACCEPTED
    // ===============================================

    else if (
      response.indexOf(
        "JOB_ACCEPTED"
      ) >= 0
    ) {

      Serial.println(
        ">>> JOB ACCEPTED STATE <<<"
      );

      if (
        deviceState !=
        JOB_ACCEPTED
      ) {

        deviceState =
          JOB_ACCEPTED;

        jobRequestAlerted =
          false;

        updateLEDs();

        showAccepted();
      }
    }

    // ===============================================
    // AVAILABLE
    // ===============================================

    else if (
      response.indexOf(
        "AVAILABLE"
      ) >= 0
    ) {

      Serial.println(
        ">>> DEVICE AVAILABLE <<<"
      );

      if (
        deviceState !=
        AVAILABLE
      ) {

        deviceState =
          AVAILABLE;

        jobRequestAlerted =
          false;

        updateLEDs();

        showCurrentPage();
      }
    }

    else {

      Serial.println(
        "No recognized hardware state."
      );
    }
  }

  else {

    Serial.print(
      "Backend request failed: "
    );

    Serial.println(
      httpCode
    );

    String errorResponse =
      http.getString();

    Serial.println(
      errorResponse
    );
  }

  http.end();
}

// =====================================================
// SEND HEARTBEAT
// =====================================================

bool sendHeartbeat(
  const char* state
) {

  if (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    Serial.println(
      "Cannot send heartbeat - WiFi offline"
    );

    return false;
  }

  WiFiClientSecure client;

  // Prototype HTTPS
  client.setInsecure();

  HTTPClient http;

  String url =
    String(API_BASE) +
    "/hardware/device/" +
    DEVICE_CODE +
    "/heartbeat";

  Serial.println();
  Serial.println(
    "Sending heartbeat"
  );

  Serial.println(
    url
  );

  if (
    !http.begin(
      client,
      url
    )
  ) {

    Serial.println(
      "ERROR: HTTP begin failed"
    );

    return false;
  }

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "X-Device-Code",
    DEVICE_CODE
  );

  http.addHeader(
    "X-Device-Key",
    DEVICE_KEY
  );

  String body =
    "{\"state\":\"" +
    String(state) +
    "\"}";

  Serial.print(
    "Heartbeat body: "
  );

  Serial.println(
    body
  );

  int httpCode =
    http.POST(body);

  Serial.print(
    "Heartbeat HTTP Status: "
  );

  Serial.println(
    httpCode
  );

  String response =
    http.getString();

  Serial.println(
    "Heartbeat response:"
  );

  Serial.println(
    response
  );

  http.end();

  return (
    httpCode >= 200 &&
    httpCode < 300
  );
}