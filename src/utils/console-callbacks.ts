export const SHUTDOWN_MESSAGE = 'CL_Shutdown()';

const originalLog = window.console.log;

export type ConsoleCallback = {
  match: string;
  callback: () => void;
};

export const onConsoleMessage = (logs: ConsoleCallback[]): void => {
  // Store the previous implementation of console.log
  const oldLog = (...args: any[]): void => {
    originalLog(...args);
    const logMessage = args[0];
    const matchingLog = logs.find((log) => logMessage.match(log.match));
    if (matchingLog) {
      matchingLog.callback();
      return;
    }
  };
  // Override console.log with the custom implementation
  window.console.log = oldLog;
};
