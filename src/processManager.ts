import { spawn } from "cross-spawn";
import { BufferList } from "bl";
import { performance } from "perf_hooks";

import { start, info, success, error } from "./utils/trace";

/**
 * Constructor
 * @param {string} taskName
 */
export class ProcessManager {
  private taskName: string;
  private processes: string[];
  private startTime: number;
  private endTime: number;

  constructor(taskName) {
    start(`Init ${taskName} task`);
    this.taskName = taskName;
    this.processes = [];
    this.startTime = performance.now();
  }

  /**
   * @param  {...process} processes
   */
  public async queue(...processes) {
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

  private onError(err) {
    error(err);
    error(
      `An error occurred in ${this.taskName}. Killing all ${this.processes.length} processes...`
    );

    const processesToKill = this.processes
      .filter((p) => Boolean(p))
      .map((p) => p.child);

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
  public static promiseSpawn(...args) {
    const child = spawn(...args);
    const stderr = child.stderr ? new BufferList() : "";

    if (child.stderr) {
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
            code: string;
            stderr: string;
          };
          err.code = code;
          err.stderr = stderr;
          reject(err);
        }
      });
    });

    promise.child = child;

    return promise;
  }

  public static addFlags(
    args: Record<string, unknown>,
    processFlags: string[]
  ) {
    const _processFlags = processFlags;

    Object.keys(args).forEach((key) => {
      if (args[key]) {
        _processFlags.push(`--${key}`);
      }
    });

    return _processFlags;
  }
}
