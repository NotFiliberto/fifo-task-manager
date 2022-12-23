import { Worker } from "worker_threads"
import Queue from "./Queue"
import { Task, TaskManagerDataType, TaskWorkerDataType } from "../types"

export class ActiveTask<T, W> {
    constructor(public task: T, public worker: W) {}
}

export class TaskManager<T extends Task> {
    // static data
    private workerPath: string = "./worker.ts"
    private capacity: number = 2 //default

    private active: Queue<ActiveTask<T, Worker>> = new Queue<
        ActiveTask<T, Worker>
    >()
    private waiting: Queue<T> = new Queue<T>()

    constructor(workerPath: string, capacity: number, tasks?: T[]) {
        this.workerPath = workerPath
        this.capacity = capacity

        if (tasks && tasks.length > 0) {
            this.init(tasks)
        }
    }

    /**
     * init, initialize TaskManager with all task provided in the constructor fill up active
     */
    private async init(tasks?: T[]) {
        if (tasks) {
            const tasksToadd = tasks.map((t) => this.addTask(t))
            await Promise.all(tasksToadd)
        }
    }

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

    private async handleWorkDone(taskWorkerData: TaskWorkerDataType) {
        /* 
        waiting piena ? freeza il job corrente, dovrei prendere i dati dal worker che potrebbero essere stati modificati e salvari qui mettendo il job nella waiting con i nuovi dati

        per freezzarlo prima devo dirgli che lo voglio freezzare, perchè magari ha ricominciato la sua esecuzione
        
        */
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

    private sendCommand(
        worker: Worker,
        command: Pick<TaskManagerDataType<T>, "command">["command"]
    ) {
        this.sendDataToWorker(worker, { command })
    }

    public async stopWorker(worker: Worker) {
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
            const worker = oldestActiveTask.worker
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

    /*     public async swapTask(workerIndex: number, task: T) {
        const worker = this.workers.at(workerIndex)
        if (worker === undefined) throw new Error("Undefined worker")

        this.sendDataToWorker(worker, {
            command: "swap_data",
            data: task.getData(),
            message: "wanna swap data!",
        }) //send new data to worker

        worker.on("DATA_SWAPPED", (taskWorkerData: TaskWorkerDataType) => {
            this.handleDataSwapped(taskWorkerData)
            console.log("zzz")
        })

        worker.off("DATA_SWAPPPED", () => {})
    } */

    /*     private async handleDataSwapped(taskWorkerData: TaskWorkerDataType) {
        const { threadId, data } = taskWorkerData

        const workerIndex = this.getWorkerIndexByThreadId(threadId)

        const task = this.active.at(workerIndex)
        if (task === undefined) throw new Error("Undefined task")

        task.setData(data)
    } */

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

    private sendDataToWorker(worker: Worker, data: TaskManagerDataType<T>) {
        worker.postMessage(data)
    }

    /**
     * Add and start worker doing specific task
     * @param task Custom Task to add in worker array
     */
    private createWorker(task: T) {
        // create new worker to execute task
        const workerData: TaskManagerDataType<T> = {
            command: "start",
            data: task.getData(),
        }

        const worker = new Worker(this.workerPath, { workerData })

        // push to workers array
        //this.workers.push(worker)

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
