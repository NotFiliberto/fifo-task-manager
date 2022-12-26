import { TaskManager, CustomTask } from "./classes"
import { CustomTaskDataType } from "./types"
import path from "path"

async function main() {
    const WORKER_PATH = path.resolve(__dirname, "./worker")
    const MAX_TASKS_IN_PARALLEL = 2
    const tasks = [
        new CustomTask({ name: "mario" }),
        new CustomTask({ name: "doccia" }),
        /* new CustomTask("11111"),
        new CustomTask("22222"),
        new CustomTask("33333"),
        new CustomTask("44444"),
        new CustomTask("55555"),
        new CustomTask("lokita"), */
    ]

    const taskManager = new TaskManager<CustomTask, CustomTaskDataType>(
        WORKER_PATH,
        MAX_TASKS_IN_PARALLEL,
        tasks
    )

    setTimeout(
        () => taskManager.addTask(new CustomTask({ name: "homyatol" })),
        11000
    ) //send after 11 seconds
    /* setTimeout(() => {
        taskManager.stopFirstWorker()
    }, 5000) */
}

main()
