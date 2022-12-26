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

You can pass to this class a data type, so you can access the data inside the task in typesafety way.

```typescript
/* 
    CustomTask.ts 

    this task will cause the assigned worker to wait for a random amount of time
*/

type CustomTaskDataType = {
    name: string
}

export default class CustomTask extends GenericTypesafeTask<CustomTaskDataType> {
    constructor(data?: CustomTaskDataType) {
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
    async run({ threadId }: { threadId: number }) {
        //you can pass everything here
        const name = this.data.name //TYPESAFE
        const n = this.getRandomNumber(1, 10)
        await this.asyncWork(n) //wait for n seconds

        console.log(
            `[WORKER #${threadId}] done! ${new Date()
                .toISOString()
                .slice(14, 19)} waited for ${n} seconds --> ${
                this.getData().name
            }`
        )
        return n
    }
}
```

Then you have to import your custom task and your custom task data type in the worker file and create a new TaskWorker instance like this

```typescript
/* worker.ts */

import { parentPort, MessagePort, workerData, threadId } from "worker_threads"
import { TaskWorker, CustomTask } from "./classes"

type CustomTaskDataType = {
    name: string
}

async function main() {
    const { data, command } = workerData //receveid when the thread is created

    if (command === "start") {
        const taskData = data as CustomTaskDataType

        const taskWorker = new TaskWorker<CustomTask, CustomTaskDataType>(
            parentPort as MessagePort,
            new CustomTask(taskData),
            threadId
        )
        taskWorker.startListening()
        await taskWorker.doTask()
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
import { CustomTaskDataType } from "./types"
import path from "path"

type CustomTaskDataType = {
    name: string
}

async function main() {
    const WORKER_PATH = path.resolve(__dirname, "./worker")
    const MAX_TASKS_IN_PARALLEL = 2
    const tasks = [
        new CustomTask({ name: "mario" }), //CustomTaskDataType
        new CustomTask({ name: "doccia" }),

    const taskManager = new TaskManager<CustomTask, CustomTaskDataType>(
        WORKER_PATH,
        MAX_TASKS_IN_PARALLEL,
        tasks
    )

    setTimeout(
        () => taskManager.addTask(new CustomTask({ name: "homyatol" })),
        11000
    ) //add new task after 11 secodns
}

main()
```

## Assumption

1. when a task is stopped the task manager will save its updated data
2. if there are any pending task in the waiting list the task manager will stop the oldest running task (always the first item in the active task manager queue) and insert the first oldest waiting task in the waiting task queue

## Limitations

-   You can't add different Task for the same Task Manager, because when the task swaps with another task, they only swap data and not any other information, this is a limitation of worker_threads, you can't pass any function or method inside your custom task when you create a worker from main thread
