# FIFO-task-manager

Task manager using FIFO policy for choosing tasks to run and node worker threads for delegating the execution of the tasks.

## Installation

```bash
    git clone NotFiliberto/fifo-task-manager #clone the example
    cd fifo-task-manager
    npm install #install dependecies
```

## Run example

```bash
    npm run dev
```

Or if you want to debug it with chrome nodejs inspector

```bash
    npm run dev-inspect
```

## How it works

The only thing that you need to do is create your custom Task (in this example we created CustomTask) extending abstract Task class and overriding it's run method.

```typescript
/* 
    CustomTask.ts 

    this task will cause the assigned worker to wait for a random amount of time
*/

import { Task } from "../classes"

export default class CustomTask extends Task {
    constructor(data?: any) {
        super(data)
    }
    private async asyncWork(seconds: number) {
        await new Promise((resolve) =>
            setTimeout(() => resolve(10), seconds * 1000)
        )
    }
    private getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    async run() {
        const n = this.getRandomNumber(1, 10)
        await this.asyncWork(n) //wait for n seconds
        return n
    }
}
```

Then you have to import your custom task in the worker file and create a new TaskWorker instance like this

```typescript
/* worker.ts */

import { parentPort, MessagePort, workerData, threadId } from "worker_threads"
import { TaskWorker, CustomTask } from "./classes"

async function main() {
    const { data, command } = workerData
    if (command === "start") {
        const taskWorker = new TaskWorker<CustomTask>(
            parentPort as MessagePort,
            new CustomTask(data),
            threadId
        )
        taskWorker.startListening()
        await taskWorker.doTask()

        console.log("ok")
    }
}

main()
```

Eventually in your index.ts you can create your task manager instance passing three parameters:

-   worker path (relative path)
-   maximum number of concurrent tasks
-   tasks to run

example:

```typescript
/* index.ts */

import { TaskManager, CustomTask } from "./classes"
import path from "path"

async function main() {
    const WORKER_PATH = path.resolve(__dirname, "./worker")
    const MAX_TASKS_IN_PARALLEL = 2 //max 2 concurrent task at the same time
    const tasks = [new CustomTask("mario"), new CustomTask("doccia")]

    const taskManager = new TaskManager<CustomTask>(
        WORKER_PATH,
        MAX_TASKS_IN_PARALLEL,
        tasks
    )

    // add new task after 11 seconds from starting the script
    setTimeout(() => taskManager.addTask(new CustomTask("homyatol")), 11000)
}

main()
```

## Assumption

1. when a task is stopped the task manager will save its updated data
2. if there are any pending task in the waiting list the task manager will stop the oldest running task (always the first item in the active task manager queue) and insert the first oldest waiting task in the waiting task queue

## Limitations

-   You can't add different Task for the same Task Manager, because when the task swaps with another task, they only swap data and not any other information, this is a limitation of worker_threads, you can't pass any function or method inside your custom task when you create a worker from main thread
