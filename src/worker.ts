import { parentPort, MessagePort, workerData, threadId } from "worker_threads"
import { TaskWorker } from "./classes"
import { CustomTask } from "./types"

async function main() {
    const { data, command } = workerData //receveid when the thread is created

    if (command === "start") {
        //Object.setPrototypeOf(task, CustomTask.prototype) //NECESSARY when you want to create an object from scratch

        const taskWorker = new TaskWorker<CustomTask>(
            parentPort as MessagePort,
            new CustomTask(data), //TODO add constructor props received from workerData
            threadId
        )
        taskWorker.init()
        taskWorker.doTask()
    }
}

main()
