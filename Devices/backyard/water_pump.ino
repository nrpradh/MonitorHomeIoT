#include <WiFi.h>
#include <PubSubClient.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;
const char* mqtt_client_id = "backyard_pump";

// MQTT Topics
const char* pump_status_topic = "home/backyard/pump/status";
const char* pump_set_topic = "home/backyard/pump/set";
const char* pump_occupancy_topic = "home/backyard/pump/occupancy";

// Pin Configuration
const int RELAY_PIN = 5;
const int CURRENT_SENSOR_PIN = 34;
const int LED_INDICATOR = 2;

// Variables
bool pumpState = false;
bool occupancyState = false;
unsigned long lastPublish = 0;
const long publishInterval = 5000;
const int CURRENT_THRESHOLD = 200;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(CURRENT_SENSOR_PIN, INPUT);
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

  // Pompa air bisa dimatikan dari jauh kapan saja
  if (String(topic) == pump_set_topic) {
    if (message == "ON") {
      pumpState = true;
      digitalWrite(RELAY_PIN, HIGH);
      digitalWrite(LED_INDICATOR, HIGH);
    } else if (message == "OFF") {
      pumpState = false;
      digitalWrite(RELAY_PIN, LOW);
      digitalWrite(LED_INDICATOR, LOW);
    }
    publishStatus();
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(mqtt_client_id)) {
      Serial.println("connected");
      client.subscribe(pump_set_topic);
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
  client.publish(pump_status_topic, pumpState ? "ON" : "OFF", true);
  client.publish(pump_occupancy_topic, occupancyState ? "ON" : "OFF", true);
}

void checkOccupancy() {
  int currentValue = analogRead(CURRENT_SENSOR_PIN);
  bool currentOccupancy = (currentValue > CURRENT_THRESHOLD);
  
  if (currentOccupancy != occupancyState) {
    occupancyState = currentOccupancy;
    Serial.print("Water pump usage changed: ");
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
