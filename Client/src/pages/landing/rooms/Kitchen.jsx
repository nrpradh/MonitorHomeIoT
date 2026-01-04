import { useEffect, useState } from "react";
import { subscribeTopic, publishMessage } from "../../../mqtt/mqttClient";
import { FaUserLarge } from "react-icons/fa6";

export default function Kitchen({ client }) {
    const [fridgeStatus, setFridgeStatus] = useState("UNKNOWN");
    const [stoveStatus, setStoveStatus] = useState("UNKNOWN");
    const [fridgeOccupancy, setFridgeOccupancy] = useState(false);
    const [stoveOccupancy, setStoveOccupancy] = useState(false);

    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("info"); // info | success | error

    // Auto-hide toast after 3s
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Reset status when client is null
    useEffect(() => {
        if (!client) {
            setFridgeStatus("UNKNOWN");
            setStoveStatus("UNKNOWN");
            setFridgeOccupancy(false);
            setStoveOccupancy(false);
            setToastMessage("");
            setToastType("info");
        }
    }, [client]);

    // Subscribe MQTT topics
    useEffect(() => {
        if (!client) return;

        subscribeTopic("home/kitchen/fridge/status");
        subscribeTopic("home/kitchen/stove/status");
        subscribeTopic("home/kitchen/fridge/occupancy");
        subscribeTopic("home/kitchen/stove/occupancy");

        const messageHandler = (topic, message) => {
            const payload = message.toString();
            // console.log("Frontend received:", topic, payload);

            if (topic === "home/kitchen/fridge/status") {
                setFridgeStatus(payload);
            } else if (topic === "home/kitchen/stove/status") {
                setStoveStatus(payload);
            } else if (topic === "home/kitchen/fridge/occupancy") {
                const occupied = payload === "ON";
                setFridgeOccupancy(occupied);
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Kulkas sedang digunakan"
                        : "Kulkas selesai digunakan"
                );
            } else if (topic === "home/kitchen/stove/occupancy") {
                const occupied = payload === "ON";
                setStoveOccupancy(occupied);
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Kompor sedang digunakan"
                        : "Kompor selesai digunakan"
                );
            }
        };

        client.on("message", messageHandler);

        return () => {
            client.off("message", messageHandler);
        };
    }, [client]);

    const toggleFridge = () => {
        if (!client) {
            setToastType("error");
            setToastMessage("Tidak bisa mengirim perintah, broker offline");
            return;
        }
        const next = fridgeStatus === "ON" ? "OFF" : "ON";
        publishMessage("home/kitchen/fridge/set", next);
        setFridgeStatus(next);
        setToastType("success");
        setToastMessage(`Kulkas ${next === "ON" ? "dinyalakan" : "dimatikan"}`);
    };

    const toggleStove = () => {
        if (!client) {
            setToastType("error");
            setToastMessage("Tidak bisa mengirim perintah, broker offline");
            return;
        }
        const next = stoveStatus === "ON" ? "OFF" : "ON";
        publishMessage("home/kitchen/stove/set", next);
        setStoveStatus(next);
        setToastType("success");
        setToastMessage(`Kompor ${next === "ON" ? "dinyalakan" : "dimatikan"}`);
    };

    const getColor = (status) => {
        if (status === "ON") return "text-green-400";
        if (status === "OFF") return "text-red-400";
        return "text-gray-400";
    };

    return (
        <div className="flex flex-col space-y-4 rounded bg-white px-8 py-6">
            <h4>Kitchen</h4>

            <aside className="space-y-4">
                {/* Kulkas */}
                <div className="rooms flex flex-col justify-between bg-[url(/img/rooms/fridge.png)] bg-cover bg-center">
                    <div className="flex items-center justify-between pr-5">
                        <h5>Fridge</h5>
                        {fridgeOccupancy && <FaUserLarge className="text-3xl text-white" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bgBlur">
                        <p>Status:
                            <span className={`pl-2 font-semibold ${getColor(fridgeStatus)}`}>
                                {fridgeStatus}
                            </span>
                        </p>
                        <input
                            type="checkbox"
                            className="toggle switch"
                            checked={fridgeStatus === "ON"}
                            disabled={fridgeStatus === "UNKNOWN" || fridgeOccupancy}
                            onChange={toggleFridge}
                        />
                    </div>
                </div>

                {/* Kompor */}
                <div className="rooms flex flex-col justify-between bg-[url(/img/rooms/stove.png)] bg-cover bg-center">
                    <div className="flex items-center justify-between pr-5">
                        <h5>Stove</h5>
                        {stoveOccupancy && <FaUserLarge className="text-3xl text-white" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bgBlur">
                        <p>Status:
                            <span className={`pl-2 font-semibold ${getColor(stoveStatus)}`}>
                                {stoveStatus}
                            </span>
                        </p>
                        <input
                            type="checkbox"
                            className="toggle switch"
                            checked={stoveStatus === "ON"}
                            disabled={stoveStatus === "UNKNOWN" || stoveOccupancy}
                            onChange={toggleStove}
                        />
                    </div>
                </div>
            </aside>

            {/* Toast */}
            {toastMessage && (
                <div className="toast toast-top toast-center">
                    <div className={`alert ${toastType === "success" ? "alert-success" : toastType === "error" ? "alert-error" : "alert-info"}`}>
                        <span className="text-white">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
