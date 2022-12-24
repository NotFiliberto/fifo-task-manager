import { TaskManager, CustomTask } from "./classes"

async function main() {
    const taskManager = new TaskManager<CustomTask>("./src/worker.ts", 2, [
        new CustomTask("mario"),
        new CustomTask("doccia"),
        /* new CustomTask("11111"),
        new CustomTask("22222"),
        new CustomTask("33333"),
        new CustomTask("44444"),
        new CustomTask("55555"),
        new CustomTask("lokita"), */
    ])

    setTimeout(() => taskManager.addTask(new CustomTask("homyatol")), 11000) //send after 2 seconds
    /* setTimeout(() => {
        taskManager.stopFirstWorker()
    }, 5000) */
}

main()
