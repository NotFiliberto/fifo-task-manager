//received from worker
export type TaskWorkerDataType = {
    code:
        | "RUNNING"
        | "WORK_DONE"
        | "FREEZING"
        | "FREEZED"
        | "SWAPPING_DATA"
        | "DATA_SWAPPED"
        | "STOPPING"
        | "STOPPED"
    message?: string
    threadId: number
    data?: any
}
