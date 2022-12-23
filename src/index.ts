import { TaskManager } from "./classes/TaskManager"
import { CustomTask, TaskManagerDataType } from "./types"

async function main() {
    const taskManager = new TaskManager<CustomTask>("./src/worker.ts", 2, [
        new CustomTask("mario"),
        new CustomTask("doccia"),
        //new CustomTask("lokita"),
    ])

    const message: TaskManagerDataType<CustomTask> = {
        message: "<CUSTOM MESSAGE HERE>",
        command: "stop",
    }

    //await taskManager.stopWorker(1)
    setTimeout(() => taskManager.addTask(new CustomTask("homyatol")), 11000) //send after 2 seconds
}

main()
