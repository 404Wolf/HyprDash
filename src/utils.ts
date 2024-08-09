import { exec } from "child_process";
import { Client } from "./types";

const uuid = () => Math.floor(Math.random() * 90000) + 10000;

export function runCommand(command: string): Promise<string> {
  console.log(`Running command ${command}`);
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve(stdout);
    });
  });
}

export async function activeWorkspace() {
  const workspace = JSON.parse(await runCommand("hyprctl activeWorkspace -j"));
  return workspace as any;
}

async function getClients(): Promise<Client[]> {
  return JSON.parse(await runCommand("hyprctl clients -j"));
}

async function getClientTags() {
  const clients = await getClients();
  const clientTags = clients
    .map((client: any) => client.tags)
    .flat() as string[];
  console.log(clientTags);
  return clientTags;
}

async function waitUntilTagged(pid: number, tag: string) {
  console.log(`Waiting for tag ${tag} on pid ${pid}`);
  let clients = await getClientTags();
  while (!clients.includes(tag)) {
    clients = await getClientTags();
    await runCommand(`hyprctl dispatch tagwindow +${tag} pid:${pid}`);
  }
}

export async function launchTaggedClient(
  launchCommand: string,
  tag: string,
  rules: string[] = [],
  matcher = /\w/,
) {
  const stringifiedRules = rules.join(";");
  await runCommand(
    `hyprctl "dispatch exec [${stringifiedRules}] ${launchCommand}"`,
  );
  const pidGetterOutput = (
    await runCommand("ps aux --sort +start_time | tail -n 4")
  ).split("\n")[0];

  // Raise error if matcher is not found
  if (!matcher.test(pidGetterOutput))
    throw new Error("No PID found for the application.");

  const pids = pidGetterOutput.match(/\d+/g);
  if (!pids) throw new Error("No PID found for the application.");
  const pid = pids[0];

  await waitUntilTagged(parseInt(pid), tag);

  return pid;
}

export async function getClientByTag(tag: string): Promise<Client | false> {
  const clients = await getClients();
  const client = clients.find((client: any) => client.tags.includes(tag));
  if (client === undefined) return false;
  return client;
}

export async function hyprctlDispatch(command: string) {
  return await runCommand(`hyprctl dispatch ${command}`);
}
