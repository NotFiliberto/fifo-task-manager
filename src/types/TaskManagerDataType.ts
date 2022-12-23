import { Task } from "./Task"

export type TaskManagerDataType<T extends Task> = {
    command: "start" | "stop" | "freeze" | "swap_data" | "OTHER_CUSTOM_COMMAND"
    message?: string
    data?: any
}
