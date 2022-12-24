import { MessagePort } from "worker_threads"
import { Task } from "../classes"
import { TaskManagerDataType, TaskWorkerDataType } from "../types"

/**
 * Task worker class for rappresenti a worker that executes a task
 */
export default class TaskWorker<T extends Task> {
    /**
     * task to run
     *
     * @private
     * @type {T}
     * @memberof TaskWorker
     */
    private task: T

    /**
     * mark the worker as stopped or use this variable to stop the loop for executing the task
     *
     * @private
     * @type {boolean}
     * @memberof TaskWorker
     */
    private stopped: boolean = false

    /**
     *
     * @param parentPort used to communicate with task manager
     * @param task task to execute
     * @param threadId unique identifier for the worker
     */
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
     * listen for task manager's signals
     * @param taskManagerData data from task manager
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

    /**
     * start listening messages from main thread (task manager)
     */
    public startListening() {
        this.parentPort.on("message", (data) => this.listener(data))
    }

    /**
     * Notify task manager with a signal
     * @param data data to send to task manager
     */
    private notifyTaskManager(data: TaskWorkerDataType) {
        this.parentPort.postMessage(data)
    }

    /**
     * run task until receiving "stop" signal from task manager
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
