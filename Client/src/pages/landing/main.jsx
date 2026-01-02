import { useState, useEffect } from "react";
import { connectToBroker, disconnectBroker } from "../../mqtt/mqttClient";

// pages or rooms
import Backyard from "./rooms/Backyard";
import Kitchen from "./rooms/Kitchen";
import Bedrooms  from "./rooms/Bedrooms";

export default function Home() {
    const [brokerUrl, setBrokerUrl] = useState("ws://192.168.10.28:9001");
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(""), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const handleConnect = () => {
        if (isConnected) {
            disconnectBroker();
            setClient(null);
            setIsConnected(false);
            setToastMessage("Disconnected from broker.");
            return;
        }

        if (isConnecting) return; // prevent abuse
        setIsConnecting(true);
        setToastMessage("Connecting to broker...");

        const c = connectToBroker(
            brokerUrl,
            () => {
                setIsConnected(true);
                setIsConnecting(false);
                setClient(c);
                setToastMessage("Connected successfully!");
            },
            () => {}
        );

        // handle connection failure after a short timeout
        setTimeout(() => {
            if (!c.connected) {
                setIsConnected(false);
                setIsConnecting(false);
                setClient(null);
                setToastMessage("Failed to connect. Broker may be offline.");
            }
        }, 3000); // 3 detik timeout
    };

    return (
        <main className="page-container">
            {/* Header Section */}
            <header className="lg:flex space-y-4 lg:space-y-0 items-center justify-between">
                <div className="flex flex-col">
                    <h3 id="hero-title" className="leading-none">
                        Monitor Home
                    </h3>
                </div>

                {/* Broker Settings */}
                <form
                    className="lg:flex space-x-4  space-y-4 lg:space-y-0 rounded bg-white px-4 py-2 items-center"
                    onSubmit={(e) => e.preventDefault()}
                    aria-label="Broker Connection Settings"
                >
                    <label htmlFor="broker-input" className="font-antonio-regular text-xl uppercase">
                        Broker:
                    </label>

                    <input
                        id="broker-input"
                        title="Broker input"
                        placeholder="Enter broker URL"
                        className="border px-2 py-1 font-dm-sans-regular "
                        value={brokerUrl}
                        onChange={(e) => setBrokerUrl(e.target.value)}
                        disabled={isConnecting} // disable input saat connect
                    />

                    <span
                        className={isConnected ? "text-green-600" : "text-red-600"}
                        role="status"
                    >
                        {isConnected ? "Online" : "Offline"}
                    </span>

                    <button
                            type="button"
                            className={`btn text-white ${
                                isConnecting
                                ? "btn-info"      // connecting or disconnecting
                                : isConnected
                                ? "btn-error"   // connected
                                : "btn-success"     // disconnected
                            }`}
                            onClick={handleConnect}
                            disabled={isConnecting}
                            >
                            {isConnecting
                                ? "Connecting..."
                                : isConnected
                                ? "Disconnect"
                                : "Connect"}
                            </button>
                </form>
            </header>

            {/* Toast Section */}
            {toastMessage && (
                <div className="toast toast-top toast-center">
                    <div className="alert alert-success">
                        <span className="text-white">{toastMessage}</span>
                    </div>
                </div>
            )}

            {/* Rooms Section */}
            <section className="lg:flex w-full space-y-6 lg:space-y-0 bg-gray-300 rounded-lg p-6 space-x-5 mt-6" aria-label="Rooms Overview">
                <article aria-label="Bedrooms">
                    <Bedrooms  />
                </article>
                <article aria-label="Kitchen">
                    <Kitchen client={client}/>
                </article>
                <article aria-label="Backyard">
                    <Backyard client={client}/>
                </article>

                
            </section>
        </main>
    );
}
