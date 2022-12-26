import { parentPort, MessagePort, workerData, threadId } from "worker_threads"
import { TaskWorker, CustomTask } from "./classes"
import { CustomTaskDataType } from "./types"

async function main() {
    const { data, command } = workerData //receveid when the thread is created

    if (command === "start") {
        //Object.setPrototypeOf(task, CustomTask.prototype) //NECESSARY when you want to create an object from scratch

        const taskData = data as CustomTaskDataType

        const taskWorker = new TaskWorker<CustomTask, CustomTaskDataType>(
            parentPort as MessagePort,
            new CustomTask(taskData),
            threadId
        )
        taskWorker.startListening()
        await taskWorker.doTask()

        //will not be executed if you terminate the worker with worker.terminate() from main thread
        console.log("ok")
    }
}

main()
