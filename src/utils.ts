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

export async function launchTaggedClient(
  launchCommand: string,
  tag: string,
  rules: string[] = [],
  matcher = /\w/,
) {
  const creationWorkspaceId = uuid().toString();
  rules.push(`workspace special:${creationWorkspaceId}`);
  const stringifiedRules = rules.join(";");
  await runCommand(
    `hyprctl "dispatch exec [${stringifiedRules}] ${launchCommand}"`,
  );

  let tries = 0;
  while (true) {
    if (tries > 10) {
      throw new Error("Could not find the client after 10 tries");
    }
    tries++;
    const clients = await getClients();
    if (
      clients.find((client: Client) =>
        client.workspace.name.includes(creationWorkspaceId),
      )
    ) {
      hyprctlDispatch(`tagwindow ${tag}`);
    }
  }
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
