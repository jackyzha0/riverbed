import http from "http";
import { WebSocketServer } from "ws";
import { WebSocketServerTransport } from "@replit/river/transport/ws/server";
import { createServer } from "@replit/river";
import { coloredStringLogger as log } from "@replit/river/logging";
import { serviceDefs } from "./river/services";

// start websocket server on port 3001
const httpServer = http.createServer();
const port = 3001;
const wss = new WebSocketServer({ server: httpServer });
const transport = new WebSocketServerTransport(wss, "SERVER");
transport.bindLogger(log);
export const server = createServer(transport, serviceDefs);
export type ServiceSurface = typeof serviceDefs;

httpServer.listen(port, () => {
  log(`starting wss on ${port}`);
});
