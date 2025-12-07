import { useEffect, useState } from "react";
import { subscribeTopic, publishMessage } from "../../mqtt/mqttClient";
import { FaUserLarge } from "react-icons/fa6";

export default function Room1({ client }) {
    const [wmStatus, setWmStatus] = useState("UNKNOWN");
    const [pumpStatus, setPumpStatus] = useState("UNKNOWN");
    const [occupancy, setOccupancy] = useState(false);
    const [wmOccupancy, setWmOccupancy] = useState(false);
    const [pumpOccupancy, setPumpOccupancy] = useState(false);

    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("info"); // info | success | error

    // Auto-hide toast after 3s
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // RESET STATUS & TOAST SAAT CLIENT NULL
    useEffect(() => {
        if (!client) {
            setWmStatus("UNKNOWN");
            setPumpStatus("UNKNOWN");
            setOccupancy(false);
            setWmOccupancy(false);
            setPumpOccupancy(false);
            setToastMessage("");
            setToastType("info");
        }
    }, [client]);

    // Subscribe MQTT topics
    useEffect(() => {
        if (!client) return;

        // Subscribe topics
        subscribeTopic("home/backyard/wm/status");
        subscribeTopic("home/backyard/pump/status");
        subscribeTopic("home/backyard/occupancy");
        subscribeTopic("home/backyard/wm/occupancy");
        subscribeTopic("home/backyard/pump/occupancy");

        // Message handler
        const messageHandler = (topic, message) => {
            const payload = message.toString();
            console.log("Frontend received:", topic, payload);

            if (topic === "home/backyard/wm/status") {
                setWmStatus(payload);
            } else if (topic === "home/backyard/pump/status") {
                setPumpStatus(payload);
            } else if (topic === "home/backyard/occupancy") {
                setOccupancy(payload === "ON");
            } else if (topic === "home/backyard/wm/occupancy") {
                const occupied = payload === "ON";
                setWmOccupancy(occupied);
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Mesin Cuci sedang digunakan"
                        : "Mesin Cuci selesai digunakan"
                );
            } else if (topic === "home/backyard/pump/occupancy") {
                const occupied = payload === "ON";
                setPumpOccupancy(occupied);
                setToastType("info");
                setToastMessage(
                    occupied
                        ? "Pompa Air sedang digunakan"
                        : "Pompa Air selesai digunakan"
                );
            }
        };

        client.on("message", messageHandler);

        // Cleanup listener saat component unmount atau client berubah
        return () => {
            client.off("message", messageHandler);
        };
    }, [client]);

    const toggleWM = () => {
        if (!client) {
            setToastType("error");
            setToastMessage("Tidak bisa mengirim perintah, broker offline");
            return;
        }
        const next = wmStatus === "ON" ? "OFF" : "ON";
        publishMessage("home/backyard/wm/set", next);
        setWmStatus(next);
        setToastType("success");
        setToastMessage(`Mesin Cuci ${next === "ON" ? "dinyalakan" : "dimatikan"}`);
    };

    const togglePump = () => {
        if (!client) {
            setToastType("error");
            setToastMessage("Tidak bisa mengirim perintah, broker offline");
            return;
        }
        const next = pumpStatus === "ON" ? "OFF" : "ON";
        publishMessage("home/backyard/pump/set", next);
        setPumpStatus(next);
        setToastType("success");
        setToastMessage(`Pompa Air ${next === "ON" ? "dinyalakan" : "dimatikan"}`);
    };

    const getColor = (status) => {
        if (status === "ON") return "text-green-400";
        if (status === "OFF") return "text-red-400";
        return "text-gray-400";
    };

    return (
        <div className="flex flex-col space-y-4 rounded bg-white px-8 py-6">
            <h4>Backyard</h4>

            <aside className="space-y-4">
                {/* Mesin Cuci */}
                <div className="rooms flex flex-col justify-between bg-[url(/img/washing.png)] bg-cover bg-center">
                    <div className="flex items-center justify-between pr-5 ">
                        <h5>Mesin Cuci</h5>
                        {wmOccupancy && <FaUserLarge className="text-3xl text-white" />}
                    </div>
                        
                    <div className="flex items-center justify-between p-2 bgBlur">
                        <p>Status:
                            <span className={`pl-2 font-semibold ${getColor(wmStatus)}`}>
                                {wmStatus}
                            </span>
                        </p>

                        <input 
                            type="checkbox"
                            className="toggle switch"
                            checked={wmStatus === "ON"}
                            disabled={wmStatus === "UNKNOWN" || wmOccupancy}
                            onChange={toggleWM}
                        />
                    </div>
                </div>

                {/* Pompa Air */}
                <div className="rooms flex flex-col justify-between bg-[url(/img/pump.png)] bg-cover bg-center">
                    <div className="flex items-center justify-between pr-5 ">
                        <h5>Pompa Air</h5>
                        {pumpOccupancy && <FaUserLarge className="text-3xl text-white" />}
                    </div>
                    <div className="flex items-center justify-between p-2 bgBlur">
                        <p>Status:
                            <span className={`pl-2 font-semibold ${getColor(pumpStatus)}`}>
                                {pumpStatus}
                            </span>
                        </p>

                        <input 
                            type="checkbox"
                            className="toggle switch"
                            checked={pumpStatus === "ON"}
                            disabled={pumpStatus === "UNKNOWN" || pumpOccupancy}
                            onChange={togglePump}
                        />
                    </div>
                </div>
            </aside>

            {/* Toast */}
            {toastMessage && (
                <div className={`toast toast-top toast-center`}>
                    <div className={`alert ${toastType === "success" ? "alert-success" : toastType === "error" ? "alert-error" : "alert-info"}`}>
                        <span className="text-white">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
