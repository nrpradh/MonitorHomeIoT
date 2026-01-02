import { useEffect, useState } from "react";
import { subscribeTopic, publishMessage } from "../../../mqtt/mqttClient";
import { FaUserLarge } from "react-icons/fa6";

const BEDROOMS = [
    { key: "one", label: "#1", bg: "/img/bedrooms/one.png" },
    { key: "two", label: "#2", bg: "/img/bedrooms/two.png" },
    { key: "three", label: "#3", bg: "/img/bedrooms/three.png" },
];

export default function Bedrooms({ client }) {
    const [states, setStates] = useState({});
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("info");

    // Auto-hide toast
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Reset when client disconnects
    useEffect(() => {
        if (!client) {
            setStates({});
            setToastMessage("");
            setToastType("info");
        }
    }, [client]);

    // Subscribe to MQTT topics
    useEffect(() => {
        if (!client) return;

        BEDROOMS.forEach(({ key }) => {
            subscribeTopic(`home/bedrooms/${key}/lamp/status`);
            subscribeTopic(`home/bedrooms/${key}/occupancy`);
        });

        const handler = (topic, message) => {
            const payload = message.toString();

            BEDROOMS.forEach(({ key }) => {
                if (topic === `home/bedrooms/${key}/lamp/status`) {
                    setStates(prev => ({
                        ...prev,
                        [key]: {
                            ...prev[key],
                            status: payload,
                        },
                    }));
                }

                if (topic === `home/bedrooms/${key}/occupancy`) {
                    const occupied = payload === "ON";
                    setStates(prev => ({
                        ...prev,
                        [key]: {
                            ...prev[key],
                            occupancy: occupied,
                        },
                    }));

                    setToastType("info");
                    setToastMessage(
                        occupied
                            ? `${key.toUpperCase()} bedroom is occupied`
                            : `${key.toUpperCase()} bedroom is now free`
                    );
                }
            });
        };

        client.on("message", handler);
        return () => client.off("message", handler);
    }, [client]);

    const toggleLamp = (key, status) => {
        if (!client) {
            setToastType("error");
            setToastMessage("Broker offline");
            return;
        }

        const next = status === "ON" ? "OFF" : "ON";
        publishMessage(`home/bedrooms/${key}/lamp/set`, next);

        setStates(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                status: next,
            },
        }));

        setToastType("success");
        setToastMessage(
            `${key.toUpperCase()} lamp ${next === "ON" ? "turned on" : "turned off"}`
        );
    };

    const getColor = (status) => {
        if (status === "ON") return "text-green-400";
        if (status === "OFF") return "text-red-400";
        return "text-gray-400";
    };

    return (
        <div className="flex flex-col space-y-4 rounded bg-white px-8 py-6">
            <h4>Bedrooms</h4>

            <aside className="space-y-4">
                {BEDROOMS.map(({ key, label, bg }) => {
                    const room = states[key] || {};
                    const status = room.status || "UNKNOWN";
                    const occupied = room.occupancy || false;

                    return (
                        <div
                            key={key}
                            className="bedrooms flex flex-col justify-between bg-cover bg-center"
                            style={{ backgroundImage: `url(${bg})` }}
                        >
                            <div className="flex items-center justify-between pr-5">
                                <h5>{label}</h5>
                                {occupied && (
                                    <FaUserLarge className="text-3xl text-white" />
                                )}
                            </div>

                            <div className="flex items-center justify-between p-2 bgBlur">
                                <p>
                                    Lamp:
                                    <span className={`pl-2 font-semibold ${getColor(status)}`}>
                                        {status}
                                    </span>
                                </p>

                                <input
                                    type="checkbox"
                                    className="toggle switch"
                                    checked={status === "ON"}
                                    disabled={status === "UNKNOWN" || occupied}
                                    onChange={() => toggleLamp(key, status)}
                                />
                            </div>
                        </div>
                    );
                })}
            </aside>

            {/* Toast */}
            {toastMessage && (
                <div className="toast toast-top toast-center">
                    <div
                        className={`alert ${
                            toastType === "success"
                                ? "alert-success"
                                : toastType === "error"
                                ? "alert-error"
                                : "alert-info"
                        }`}
                    >
                        <span className="text-white">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
