#include <WiFi.h>
#include <PubSubClient.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server = "192.168.1.100";  // Ganti dengan IP Address broker
const int mqtt_port = 1883;
const char* mqtt_client_id = "bedroom_two";

// MQTT Topics
const char* lamp_status_topic = "home/bedrooms/two/lamp/status";
const char* lamp_set_topic = "home/bedrooms/two/lamp/set";
const char* occupancy_topic = "home/bedrooms/two/occupancy";

// Pin Configuration
const int RELAY_PIN = 5;        // Pin relay untuk lampu
const int PIR_PIN = 4;          // Pin PIR sensor untuk deteksi okupansi
const int LED_INDICATOR = 2;    // LED indikator built-in

// Variables
bool lampState = false;
bool occupancyState = false;
unsigned long lastPublish = 0;
const long publishInterval = 5000;  // Publish setiap 5 detik

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_INDICATOR, OUTPUT);
  
  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(LED_INDICATOR, LOW);
  
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Hanya izinkan kontrol lampu jika tidak ada okupansi
  if (String(topic) == lamp_set_topic) {
    if (!occupancyState) {  // Lampu hanya bisa dikontrol saat tidak berpenghuni
      if (message == "ON") {
        lampState = true;
        digitalWrite(RELAY_PIN, HIGH);
        digitalWrite(LED_INDICATOR, HIGH);
      } else if (message == "OFF") {
        lampState = false;
        digitalWrite(RELAY_PIN, LOW);
        digitalWrite(LED_INDICATOR, LOW);
      }
      publishStatus();
    } else {
      Serial.println("Cannot control lamp: Room is occupied");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(mqtt_client_id)) {
      Serial.println("connected");
      client.subscribe(lamp_set_topic);
      publishStatus();
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void publishStatus() {
  client.publish(lamp_status_topic, lampState ? "ON" : "OFF", true);
  client.publish(occupancy_topic, occupancyState ? "ON" : "OFF", true);
}

void checkOccupancy() {
  bool currentOccupancy = digitalRead(PIR_PIN);
  
  if (currentOccupancy != occupancyState) {
    occupancyState = currentOccupancy;
    Serial.print("Occupancy changed: ");
    Serial.println(occupancyState ? "ON" : "OFF");
    publishStatus();
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  checkOccupancy();

  unsigned long now = millis();
  if (now - lastPublish > publishInterval) {
    lastPublish = now;
    publishStatus();
  }
}
