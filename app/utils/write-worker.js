import { parentPort } from "worker_threads";
import Parser from "./parser";
import DBStore from "../db-store";
import fs from "fs";
import logger from "./logger";

// interface KDBInfoData {
//   id: string;
//   path: string;
//   snapshottime: string;
//   csum: number;
//   size: number;
// }

// interface WorkerData {
//   getStore: () => DBStore;
//   savePeriod: number;
//   path: string;
// }

let writing = false;

function stringData(store) {
  const commands = Array(store.setCommands);
  const commandsContent = commands.join("<-KCOMMAND->");
  return [commandsContent];
}

function buildInfo(
  id,
  data,
  path
) {
  const snapshottime = Date.now();
  const size = Buffer.byteLength(data);

  return {
    id,
    path,
    snapshottime: snapshottime.toString(),
    size,
  };
}

function write(store, path) {
  if (writing) return;
  logger.info("[write-worker]: writing snapshot");

  try {
    writing = true;
    let now = Date.now();
    let content = "";
    const [data] = stringData(store); // Adjust this if stringData is a method
    const id = `${store.id}-${store.role}-${now}`;

    // info part
    content += `--KDB-INFO-START--\r\n`;
    content += Parser.toKDBJson(buildInfo(id, data, path));
    content += `--KDB-INFO-END--\r\n`;

    // data part
    content += `--KDB-DATA-START--\r\n`;
    content += data;
    content += `--KDB-DATA-END--\r\n`;

    // collections part
    content += `--KDB-COLLECTIONS-START--\r\n`;
    content += Parser.toKDBJson(store.collections);
    content += `--KDB-COLLECTIONS-END--\r\n`;

    const buffer = Buffer.from(content, "utf8");

    logger.info(`[write-worker]: built snapshot in ${Date.now() - now}ms`);

    now = Date.now();

    fs.writeFileSync(path, buffer, "binary");
    logger.info(
      `[write-worker]: wrote ${buffer.length} bytes to ${path} in ${Date.now() - now}ms`
    );
  } catch (err) {
    logger.error(`[write-worker]: error writing snapshot: ${err}`);
  } finally {
    writing = false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

parentPort?.on("message", ({ store, path }) => {
  write(store, path);
});
