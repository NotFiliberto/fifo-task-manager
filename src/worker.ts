import { parentPort, MessagePort, workerData, threadId } from "worker_threads"
import { TaskWorker, CustomTask } from "./classes"

async function main() {
    const { data, command } = workerData //receveid when the thread is created

    if (command === "start") {
        //Object.setPrototypeOf(task, CustomTask.prototype) //NECESSARY when you want to create an object from scratch

        const taskWorker = new TaskWorker<CustomTask>(
            parentPort as MessagePort,
            new CustomTask(data), //TODO add constructor props received from workerData
            threadId
        )
        taskWorker.startListening()
        await taskWorker.doTask()

        //will not be executed if you terminate the worker with worker.terminate() from main thread
        console.log("ok")
    }
}

main()
