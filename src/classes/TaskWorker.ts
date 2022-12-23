import { MessagePort } from "worker_threads"
import { Task, TaskManagerDataType, TaskWorkerDataType } from "../types"

export class TaskWorker<T extends Task> {
    private task: T
    private stopped: boolean = false

    constructor(
        private parentPort: MessagePort,
        task: T,
        private threadId: number
    ) {
        this.parentPort = parentPort
        this.task = task
        this.threadId = threadId
    }

    /**
     * init the worker, add listeners for TaskManager
     */
    private listener(taskManagerData: TaskManagerDataType<T>) {
        const { command, message } = taskManagerData

        if (command === "stop") {
            this.stopped = true
            this.notifyTaskManager({
                code: "STOPPING",
                threadId: this.threadId,
            })
        } else console.log(`message from TaskManager: ${message}`)
    }

    public init() {
        this.parentPort.on("message", (data) => this.listener(data))
    }

    private notifyTaskManager(data: TaskWorkerDataType) {
        this.parentPort.postMessage(data)
    }

    /**
     * doTask
     */
    public async doTask() {
        let repeat = true
        while (true && repeat) {
            const n = await this.task.run()

            repeat = repeat && !this.stopped
            this.notifyTaskManager({
                code: "WORK_DONE",
                message: `done! ${new Date()
                    .toISOString()
                    .slice(
                        14,
                        19
                    )} waited for ${n} seconds --> ${this.task.getData()}`,
                threadId: this.threadId,
                data: this.task.getData(),
            })
        }
        //notify task manager that I'm stopped
        if (this.stopped) {
            this.notifyTaskManager({
                code: "STOPPED",
                message: "",
                threadId: this.threadId,
                data: this.task.getData(),
            })
        }
    }
}
