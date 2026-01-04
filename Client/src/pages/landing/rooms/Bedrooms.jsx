import { useEffect, useState } from "react";
import { subscribeTopic, publishMessage } from "../../../mqtt/mqttClient";
import { FaUserLarge } from "react-icons/fa6";

const BEDROOMS = [
    { key: "one", label: "#1", bg: "/img/rooms/bedrooms/one.png" },
    { key: "two", label: "#2", bg: "/img/rooms/bedrooms/two.png" },
    { key: "three", label: "#3", bg: "/img/rooms/bedrooms/three.png" },
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

    useEffect(() => {
        if (!client) return;

        // Explicitly subscribe all topics
        const topics = [
            "home/bedrooms/one/lamp/status",
            "home/bedrooms/one/occupancy",
            "home/bedrooms/two/lamp/status",
            "home/bedrooms/two/occupancy",
            "home/bedrooms/three/lamp/status",
            "home/bedrooms/three/occupancy",
        ];

        topics.forEach(topic => client.subscribe(topic));

        // Message handler
        const handler = (topic, message) => {
            const payload = message.toString();

            if (topic === "home/bedrooms/one/lamp/status") {
                setStates(prev => ({ ...prev, one: { ...prev.one, status: payload } }));
            } else if (topic === "home/bedrooms/one/occupancy") {
                const occupied = payload === "ON";
                setStates(prev => ({ ...prev, one: { ...prev.one, occupancy: occupied } }));
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Bedroom #1 sedang digunakan"
                        : "Bedroom #1 selesai digunakan"
                );
            } else if (topic === "home/bedrooms/two/lamp/status") {
                setStates(prev => ({ ...prev, two: { ...prev.two, status: payload } }));
            } else if (topic === "home/bedrooms/two/occupancy") {
                const occupied = payload === "ON";
                setStates(prev => ({ ...prev, two: { ...prev.two, occupancy: occupied } }));
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Bedroom #2 sedang digunakan"
                        : "Bedroom #2 selesai digunakan"
                );
            } else if (topic === "home/bedrooms/three/lamp/status") {
                setStates(prev => ({ ...prev, three: { ...prev.three, status: payload } }));
            } else if (topic === "home/bedrooms/three/occupancy") {
                const occupied = payload === "ON";
                setStates(prev => ({ ...prev, three: { ...prev.three, occupancy: occupied } }));
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Bedroom #3 sedang digunakan"
                        : "Bedroom #3 selesai digunakan"
                );
            }
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

        // Get label for natural sentence
        const label = BEDROOMS.find(b => b.key === key)?.label || key;

        setToastType("success");
        setToastMessage(
            `Lampu di Bedroom ${label} ${next === "ON" ? "dinyalakan" : "dimatikan"}`
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
