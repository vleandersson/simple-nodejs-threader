const { performance } = require("perf_hooks");
const { success, error, start, info } = require("./messages");

/**
 * Constructor
 * @param {string} taskName
 */
class ProcessManager {
  constructor(taskName) {
    start(`Init ${taskName} task`);
    this.taskName = taskName;
    this.processes = [];
    this.startTime = performance.now();
    this.endTime;
  }

  /**
   * @param  {...process} processes
   */
  async queue(...processes) {
    const filteredProcesses = processes.filter(p => Boolean(p));
    this.processes.push(...filteredProcesses);
    try {
      await Promise.all(this.processes);
      return info("Queue chunk completed");
    } catch (err) {
      this.onError(err);
    }
  }

  async complete() {
    try {
      await Promise.all(this.processes);
      this.endTime = performance.now();
      success(`Finish ${this.taskName} task`);
      return {
        taskName: this.taskName,
        taskTime: `${(this.endTime - this.startTime) / 1000}s`
      };
    } catch (err) {
      this.onError(err);
    }
  }

  onError(err) {
    error(err);
    error(
      `An error occurred in ${this.taskName}. Killing all ${this.processes.length} processes...`
    );

    const processesToKill = this.processes
      .filter(p => Boolean(p))
      .map(p => p.child);

    killProcesses(processesToKill);
    success("Processes killed");
    process.exit(1);
  }
}

/**
 *
 * @param {process[]} _processesToKill Array of processes to kill
 */
function killProcesses(_processesToKill) {
  if (!_processesToKill || !Array.isArray(_processesToKill)) {
    throw new Error("killProcesses input is not valid");
  }

  const processesToKill = _processesToKill.filter(p => Boolean(p));

  processesToKill.forEach(p => {
    try {
      p.kill();
    } catch (err) {
      error("Tried to kill process but received an error");
      error(err);
    }
  });
}

module.exports = { ProcessManager };
