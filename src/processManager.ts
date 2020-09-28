import { spawn } from "cross-spawn";
import BufferList from "bl";
import { performance } from "perf_hooks";

import { start, info, success, error } from "./utils/trace";

interface Process {
  child?: unknown;
}

type PromiseWithChild = Promise<unknown> & { child?: unknown };

/**
 * Constructor
 * @param {string} taskName
 */
export class ProcessManager {
  private taskName: string;
  private processes: Process[];
  private startTime: number;
  private endTime: number | undefined;

  constructor(taskName: string) {
    start(`Init ${taskName} task`);
    this.taskName = taskName;
    this.processes = [];
    this.startTime = performance.now();
  }

  /**
   * @param  {...process} processes
   */
  public async queue(...processes: Process[]) {
    const filteredProcesses = processes.filter((p) => Boolean(p));
    this.processes.push(...filteredProcesses);
    try {
      await Promise.all(this.processes);
      return info("Queue chunk completed");
    } catch (err) {
      this.onError(err);
    }
  }

  public async complete() {
    try {
      await Promise.all(this.processes);
      this.endTime = performance.now();
      success(`Finish ${this.taskName} task`);
      return {
        taskName: this.taskName,
        taskTime: `${(this.endTime - this.startTime) / 1000}s`,
      };
    } catch (err) {
      this.onError(err);
    }
  }

  private onError(err: string) {
    error(err);

    const processesToKill = this.processes
      .filter((p) => Boolean(p))
      .map((p) => p.child);

    error(
      `An error occurred in ${this.taskName}. Killing all ${processesToKill.length} processes...`
    );

    this.killProcesses(processesToKill);
    success("Processes killed");
    process.exit(1);
  }

  private killProcesses(_processesToKill: {}) {
    if (!_processesToKill || !Array.isArray(_processesToKill)) {
      throw new Error("killProcesses input is not valid");
    }

    const processesToKill = _processesToKill.filter((p) => Boolean(p));

    processesToKill.forEach((p) => {
      try {
        p.kill();
      } catch (err) {
        error("Tried to kill process but received an error");
        error(err);
      }
    });
  }

  /**
   * Wraps spawned processes in a promise, so that the stream can be managed
   * with js async functionality
   */
  public static promiseSpawn(command: string, ...args: any[]) {
    const child = spawn(command, ...args);
    const stderr = child.stderr ? new BufferList() : null;

    if (child.stderr && stderr) {
      child.stderr.on("data", (data) => {
        stderr.append(data);
      });
    }

    const promise = new Promise((resolve, reject) => {
      child.on("error", reject);

      child.on("exit", (code, signal) => {
        if (code === 0 || Boolean(signal)) {
          resolve();
        } else {
          const err = new Error(`child exited with code ${code}`) as Error & {
            code: number | null;
            stderr: BufferList | null;
          };
          err.code = code;
          err.stderr = stderr;
          reject(err);
        }
      });
    }) as PromiseWithChild;

    promise.child = child;

    return promise;
  }

  public static addFlags(flags: Record<string, string>) {
    const processFlags: string[] = [];

    Object.keys(flags).forEach((key) => {
      if (flags[key]) {
        processFlags.push(`--${key}`);
      }
    });

    return processFlags;
  }
}
