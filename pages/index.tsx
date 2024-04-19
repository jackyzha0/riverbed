import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { type ServiceSurface } from "../server";
import { WebSocketClientTransport } from "@replit/river/transport/ws/client";
import { createClient } from "@replit/river";
import WebSocket from "isomorphic-ws";
import { bindLogger, setLevel } from "@replit/river/logging";
import { useEffect, useState } from "react";
import { nanoid } from 'nanoid';

const useRiverClient = (id: string) => {
  const [ctx, setCtx] = useState<[ClientType, WebSocketClientTransport] | []>([]);
  useEffect(() => {
    bindLogger(console.log);
    setLevel("info");
    const websocketUrl = `ws://${window.location.hostname}:3001`;
    const transport = new WebSocketClientTransport(
      async () => new WebSocket(websocketUrl),
      id,
    );

    const client = createClient<ServiceSurface>(transport, "SERVER");
    setCtx(() => [client, transport]);
    return () => {
      transport.close();
    };
  }, [id]);
  return ctx;
};

const RiverComponent = ({ id }: { id: string }) => {
  const [count, setCount] = useState(0);
  const [client, transport] = useRiverClient(id);

  useEffect(() => {
    if (!client || !transport) return;

    let close: (() => void) | undefined = undefined
    transport.addEventListener('sessionStatus', async (evt) => {
      if (evt.status === 'connect') {
        // setup state + listeners
        setCount(0)
        const [subscription, closeHandler] = await client.subscribable.value.subscribe({});
        close = closeHandler
        for await (const value of subscription) {
          if (value.ok) {
            setCount(value.payload.result);
          }
        }
      } else {
        // cleanup stale listeners
        close?.()
      }
    });

    return close
  }, [client, transport]);

  return (
    <div className={styles.card}>
      <h2 suppressHydrationWarning>{id}</h2>
      <p>Count: {count}</p>
      <button
        className={styles.button}
        onClick={() => client?.subscribable.add.rpc({ n: 1 })}
      >
        Increment
      </button>
    </div>
  );
};

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>Next.js + River + Replit</h2>
        <p>Open a new tab and watch them sync :)</p>
        <div className={styles.grid}>
          <RiverComponent id={`client-${nanoid(4)}`} />
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="/__repl" target="_blank" rel="noopener noreferrer">
          Built on
          <span className={styles.logo}>
            <Image src="/replit.svg" alt="Replit Logo" width={20} height={18} />
          </span>
          Replit
        </a>
      </footer>
    </div>
  );
};

export default Home;
type ClientType = ReturnType<typeof createClient<ServiceSurface>>;
