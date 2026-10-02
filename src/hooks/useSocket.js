import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useUserProfile from "./useUserProfile";
import { SERVER_URL } from "../utils/envConfig";

export function useSocket(onNotification) {
  const socketRef = useRef(null);
  const onNotificationRef = useRef(onNotification);
  const { token } = useUserProfile();

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    if (!socketRef.current) {
      const socket = io(SERVER_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on("notification", (data) => {
        onNotificationRef.current?.(data);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return socketRef.current;
}
