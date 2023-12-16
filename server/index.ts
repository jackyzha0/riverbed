import http from "http";
import { WebSocketServer } from "ws";
import { WebSocketServerTransport } from "@replit/river/transport/ws/server";
import { createServer } from "@replit/river";
import { bindLogger, setLevel } from "@replit/river/logging";
import { serviceDefs } from "./river/services";

// bind river loggers
bindLogger(console.log);
setLevel("info");

// start websocket server on port 3001
const httpServer = http.createServer();
const port = 3001;
const wss = new WebSocketServer({ server: httpServer });
const transport = new WebSocketServerTransport(wss, "SERVER");
export const server = createServer(transport, serviceDefs);
export type ServiceSurface = typeof server;

httpServer.listen(port, () => {
  console.log(`starting wss on ${port}`);
});

httpServer.on("connect", (req) => {
  console.log("conn with req", req);
});
