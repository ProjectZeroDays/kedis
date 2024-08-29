const availableComands: Command[] = ["PING", "ECHO", "SET", "GET"];

export default function readCommand(args: string[]) {
  const cmd = args[2].toUpperCase();

  if (!availableComands.includes(cmd as Command)) {
    throw new Error(`Invalid command: ${cmd}`);
  }

  return cmd as Command;
}
