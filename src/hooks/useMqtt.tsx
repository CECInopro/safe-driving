import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://broker.emqx.io:8084/mqtt";
const MQTT_USER = import.meta.env.VITE_MQTT_USER || "";
const MQTT_PASS = import.meta.env.VITE_MQTT_PASS || "";

export type MqttOptions = {
    topicPub?: string;
    topicSub?: string;
    onMessage?: (topic: string, message: string) => void;
};

export const useMqtt = (options: MqttOptions = {}) => {
    const { topicPub = "esp32/write_card", topicSub = "esp32/write_status", onMessage } = options;
    const [client, setClient] = useState<mqtt.MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const onMessageRef = useRef(onMessage);

    // Cập nhật ref khi onMessage thay đổi
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        const mqttOptions = {
            username: MQTT_USER,
            password: MQTT_PASS,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
        };

        const mqttClient = mqtt.connect(MQTT_URL, mqttOptions);

        mqttClient.on("connect", () => {
            console.log("✅ MQTT connected");
            setIsConnected(true);
            mqttClient.subscribe(topicSub, { qos: 0 });
        });

        mqttClient.on("message", (topic, message) => {
            const msg = message.toString();
            console.log("📩 MQTT message:", topic, msg);
            
            if (onMessageRef.current) {
                onMessageRef.current(topic, msg);
            }
        });

        mqttClient.on("error", (err) => {
            console.error("❌ MQTT error:", err);
            mqttClient.end();
        });

        setClient(mqttClient);

        return () => {
            mqttClient.end();
        };
    }, [topicSub]);

    const publish = (message: string) => {
        if (client && isConnected) {
            client.publish(topicPub, message);
            return true;
        }
        return false;
    };

    return {
        client,
        isConnected,
        publish,
    };
};

