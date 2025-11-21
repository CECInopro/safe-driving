import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

const MQTT_URL = import.meta.env.VITE_MQTT_URL || "wss://8f3867bbff29467db818d8c01ceb8a7b.s1.eu.hivemq.cloud:8884/mqtt";
const MQTT_USER = import.meta.env.VITE_MQTT_USER || "10112003dtc";
const MQTT_PASS = import.meta.env.VITE_MQTT_PASS || "10112003Dtc";

export type MqttOptions = {
    topicPub?: string;
    topicSub?: string;
    onMessage?: (topic: string, message: string) => void;
};

export const useMqtt = (options: MqttOptions = {}) => {
    const { topicPub = "esp32/write", topicSub = "esp32/status", onMessage } = options;
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
            console.log("✅ MQTT Connected!");
            setIsConnected(true);
            mqttClient.subscribe(topicSub);
            console.log("📡 Subscribed to:", topicSub);
        });

        mqttClient.on("error", (err) => {
            console.error("❌ MQTT Error:", err);
        });

        mqttClient.on("message", (topic, message) => {
            const msg = message.toString();
            console.log("📩 Nhận:", topic, msg);
            
            if (onMessageRef.current) {
                onMessageRef.current(topic, msg);
            }
        });

        setClient(mqttClient);

        return () => {
            if (mqttClient) {
                mqttClient.end();
            }
        };
    }, [topicSub]);

    const publish = (message: string) => {
        if (client && isConnected) {
            console.log("📤 Gửi:", message, "vào topic:", topicPub);
            client.publish(topicPub, message);
            return true;
        }
        console.error("❌ Không thể gửi: client hoặc connection không sẵn sàng");
        return false;
    };

    return {
        client,
        isConnected,
        publish,
    };
};

