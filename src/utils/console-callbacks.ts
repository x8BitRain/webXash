export const SHUTDOWN_MESSAGE = 'CL_Shutdown()';

const originalLog = window.console.log;

export type ConsoleCallback = {
  id: string;
  match: string;
  callback: () => void;
};

export const onConsoleMessage = (logs: ConsoleCallback[]): void => {
  const oldLog = (...args: any[]): void => {
    originalLog(...args);
    const logMessage = args[0];
    const matchingLog = logs.find(
      (log) => typeof logMessage === 'string' && logMessage?.match(log.match),
    );
    debugger
    if (matchingLog) {
      matchingLog.callback();
      return;
    }
  };

  window.console.log = oldLog;
};
