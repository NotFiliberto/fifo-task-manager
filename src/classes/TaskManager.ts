import { Worker } from "worker_threads"
import { Queue, Task } from "../classes"
import { ActiveTask, TaskManagerDataType, TaskWorkerDataType } from "../types"
import path from "path"

/**
 * Task manager class for custom task execution in parallel
 */
export default class TaskManager<T extends Task> {
    /**
     * maximum number of concurrent tasks
     *
     * @private
     * @type {string}
     * @memberof TaskManager
     */
    private workerPath: string = path.resolve(__dirname, "./worker.ts")

    /**
     * max simultaneusly
     *
     * @private
     * @type {number}
     * @memberof TaskManager
     */
    private capacity: number = 2 //default

    /**
     * active tasks queue, we assume that the first element is always the oldest, so we add new task at the end  ofthe queue and we extract from the head the oldest (FIFO strategy)
     *
     * @private
     * @type {Queue<ActiveTask<T, Worker>>}
     * @memberof TaskManager
     */
    private active: Queue<ActiveTask<T, Worker>> = new Queue<
        ActiveTask<T, Worker>
    >()

    /**
     * waiting task queue we assume that the first element is always the oldest, so we add new task at the end of the queue and we extract from the head the oldest (FIFO strategy)
     *
     * @private
     * @type {Queue<T>}
     * @memberof TaskManager
     */
    private waiting: Queue<T> = new Queue<T>()

    /**
     *
     * @param workerPath custom path for worker
     * @param capacity maximum number of concurrent tasks
     * @param tasks initial tasks to run
     */
    constructor(workerPath: string, capacity: number, tasks?: T[]) {
        this.workerPath = workerPath
        this.capacity = capacity

        if (tasks && tasks.length > 0) {
            this.init(tasks)
        }
    }

    /**
     * start tasks provided to the function following the constraints
     * @param tasks tasks to run
     */
    private async init(tasks?: T[]) {
        if (tasks) {
            const tasksToadd = tasks.map((t) => this.addTask(t))
            await Promise.all(tasksToadd)
        }
    }

    /**
     * Add task to active task list if number of active tasks is less than capacity
     * @param task task to add
     */
    public addTask(task: T) {
        if (this.active.getSize() < this.capacity) {
            /* this.active.push(task)
            this.addWorker(task) */
            const worker = this.createWorker(task)
            this.active.enqueue(new ActiveTask(task, worker))
        } else {
            //push to waiting list
            this.waiting.enqueue(task)
        }
    }

    /**
     * Stop the first worker if it has finished his job and there are tasks in waiting list
     * @param taskWorkerData data received from worker
     */
    private async handleWorkDone(taskWorkerData: TaskWorkerDataType) {
        const { threadId } = taskWorkerData

        if (this.waiting.getSize() > 0) {
            // tasks in waiting list
            const oldestActiveTask = this.active.peek()

            if (threadId === oldestActiveTask.worker.threadId) {
                const worker = oldestActiveTask.worker
                this.stopWorker(worker)
            }
        }
    }

    /**
     * Send data and commands to worker
     * @param worker worker where send data too
     * @param data data to send to worker
     */
    private sendDataToWorker(worker: Worker, data: TaskManagerDataType<T>) {
        worker.postMessage(data)
    }

    /**
     * Send command to worker
     *
     * general method to wrap functions
     *
     * @param worker thread where to send command
     * @param command command to send (you can edit the list from TaskManagerDataType type in tyypes folder)
     */
    private sendCommand(
        worker: Worker,
        command: Pick<TaskManagerDataType<T>, "command">["command"]
    ) {
        this.sendDataToWorker(worker, { command })
    }

    /**
     * send signal "stop" to worker thread for stopping it
     * @param worker worker to stop
     */
    private async stopWorker(worker: Worker) {
        this.sendCommand(worker, "stop")
    }

    /**
     * We assume that this method is called only by the first element of our active task queue because we are managing it with FIFO rules
     * @param taskWorkerData data received from worker
     * @returns
     */
    private async handleStop(taskWorkerData: TaskWorkerDataType) {
        const { threadId, data } = taskWorkerData
        const oldestActiveTask = this.active.peek()

        if (threadId === oldestActiveTask.worker.threadId) {
            let worker: Worker = oldestActiveTask.worker
            const stopped = await worker.terminate()

            if (stopped) {
                worker.removeAllListeners()

                console.log(
                    `worker #${threadId} stopped at ${new Date()
                        .toISOString()
                        .slice(14, 19)}`
                )

                const removedActiveTask = this.active.dequeue() //remove oldest active task

                if (removedActiveTask) {
                    const { task: oldTask } = removedActiveTask

                    //waiting not empty
                    if (!this.waiting.isEmpty()) {
                        oldTask.setData(structuredClone(data)) // update old task saved in TaskManager with new Data from worker

                        //add old Task To waiting and
                        this.waiting.enqueue(oldTask)

                        // execute create a new worker with first task in the queue
                        const newTask = this.waiting.dequeue()

                        if (newTask) {
                            this.addTask(newTask)
                        }
                    }
                }
            }
        }
    }

    /**
     * listeners for workers
     * @param taskWorkerData data received from worker
     */
    private async workerListener(taskWorkerData: TaskWorkerDataType) {
        const { code, message, threadId } = taskWorkerData

        if (code === "STOPPED") {
            await this.handleStop(taskWorkerData)
        }

        if (code !== "STOPPED" && code !== "STOPPING") {
            console.log(`[MESSAGE from WORKER #${threadId}]: ${message}`) // show response from worker

            if (code === "WORK_DONE") this.handleWorkDone(taskWorkerData)
        }
    }

    /**
     * create a worker and run its task
     * @param task Custom Task to add in worker array
     */
    private createWorker(task: T) {
        // create new worker to execute task
        const workerData: TaskManagerDataType<T> = {
            command: "start",
            data: structuredClone(task.getData()),
        }

        const worker = new Worker(this.workerPath, { workerData })

        console.log(
            `worker #${worker.threadId} created at ${new Date()
                .toISOString()
                .slice(14, 19)}`
        )

        //register listener for current worker
        worker.addListener(
            "message",
            async (data) => await this.workerListener(data)
        )

        return worker
    }
}
