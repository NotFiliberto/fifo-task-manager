//received from worker
export type TaskWorkerDataType = {
    code: "RUNNING" | "WORK_DONE" | "STOPPING" | "STOPPED"
    message?: string
    threadId: number
    data?: any
}
