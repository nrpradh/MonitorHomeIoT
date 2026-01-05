#include <WiFi.h>
#include <PubSubClient.h>

// WiFi Configuration
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server = "192.168.1.100";
const int mqtt_port = 1883;
const char* mqtt_client_id = "kitchen_fridge";

// MQTT Topics
const char* fridge_status_topic = "home/kitchen/fridge/status";
const char* fridge_set_topic = "home/kitchen/fridge/set";
const char* fridge_occupancy_topic = "home/kitchen/fridge/occupancy";

// Pin Configuration
const int RELAY_PIN = 5;
const int CURRENT_SENSOR_PIN = 34;  // Pin analog untuk sensor arus (ACS712)
const int LED_INDICATOR = 2;

// Variables
bool fridgeState = false;
bool occupancyState = false;
unsigned long lastPublish = 0;
const long publishInterval = 5000;
const int CURRENT_THRESHOLD = 100;  // Threshold untuk deteksi penggunaan

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

  if (String(topic) == fridge_set_topic) {
    if (message == "ON") {
      fridgeState = true;
      digitalWrite(RELAY_PIN, HIGH);
      digitalWrite(LED_INDICATOR, HIGH);
    } else if (message == "OFF") {
      fridgeState = false;
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
      client.subscribe(fridge_set_topic);
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
  client.publish(fridge_status_topic, fridgeState ? "ON" : "OFF", true);
  client.publish(fridge_occupancy_topic, occupancyState ? "ON" : "OFF", true);
}

void checkOccupancy() {
  int currentValue = analogRead(CURRENT_SENSOR_PIN);
  bool currentOccupancy = (currentValue > CURRENT_THRESHOLD);
  
  if (currentOccupancy != occupancyState) {
    occupancyState = currentOccupancy;
    Serial.print("Fridge usage changed: ");
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
