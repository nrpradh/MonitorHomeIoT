import mqtt from "mqtt";

// Store client globally in this module
let client = null;

export function connectToBroker(brokerUrl, onConnect, onMessage) {
    if (client) {
        console.warn("Already connected to broker");
        return client;
    }

    // Create MQTT client via WebSocket
    client = mqtt.connect(brokerUrl, {
        reconnectPeriod: 2000, // auto-reconnect
        clean: true,
    });

    client.on("connect", () => {
        console.log("MQTT Connected");
        onConnect && onConnect();
    });

    client.on("message", (topic, message) => {
        const payload = message.toString();
        console.log("MQTT Message:", topic, payload);
        onMessage && onMessage(topic, payload);
    });

    client.on("error", (err) => {
        console.error("MQTT Error:", err);
    });

    client.on("close", () => {
        console.log("MQTT Disconnected");
    });

    return client;
}

export function subscribeTopic(topic) {
    if (!client) return console.warn("Client not connected");
    client.subscribe(topic, (err) => {
        if (err) console.error("Subscribe error:", err);
    });
}

export function publishMessage(topic, message) {
    if (!client) return console.warn("Client not connected");
    client.publish(topic, message);
}

export function disconnectBroker() {
    if (!client) return;
    client.end();
    client = null;
}
