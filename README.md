# simple-nodejs-threader

A basic package for multithreading (multiple processes) in NodeJs

## Why?

To simplify `node` build processes, used for better development experience or to spead up build pipelines, by utilizing node's multicore processing.

## Download

- With yarn: `yarn add -D simple-nodejs-threader`
- With npm: `npm install simple-nodejs-threader --save-dev`

## Getting started

1. Create a new Process manager 

```
const manager = new ProcessManager(taskName);
```

2. Create one or more processes that can run in parallell

```
const backendProcess = ProcessManager.promiseSpawn(
  'yarn start:backend',
  [processFlags],
  {
    stdio: 'inherit',
    shell: true
  }
);

const frontendProcess = ProcessManager.promiseSpawn(
  'yarn start:frontend',
  [processFlags],
  {
    stdio: 'inherit',
    shell: true
  }
);
```

3. Add processes to the manager queue

```
manager.queue(frontendProcess, backendProcess);
```

4. Await for completion

```
await manager.complete();
```


