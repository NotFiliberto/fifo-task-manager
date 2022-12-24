import { Task } from "../classes"

/**
 * Custom task, just extend Task abstract class and override run method
 *
 * you can store data in task.data with task.setData() and this will be passed to worker and
 */
export default class CustomTask extends Task {
    constructor(data?: any) {
        super(data)
    }
    private async asyncWork(seconds: number) {
        await new Promise((resolve) =>
            setTimeout(() => resolve(10), seconds * 1000)
        )
    }
    private getRandomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    async run() {
        const n = this.getRandomNumber(1, 10)
        await this.asyncWork(n) //wait for n seconds
        return n
    }
}
