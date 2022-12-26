import { GenericTypesafeTask } from "../classes"
import { CustomTaskDataType } from "../types"

/**
 * Custom task, just extend Task abstract class and override run method
 *
 * you can store data in task.data with task.setData() and this will be passed to worker and
 */
export default class CustomTask extends GenericTypesafeTask<CustomTaskDataType> {
    constructor(data?: CustomTaskDataType) {
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
    async run({ threadId }: { threadId: number }) {
        //you can pass everything here
        const name = this.data.name //typesafe
        const n = this.getRandomNumber(1, 10)
        await this.asyncWork(n) //wait for n seconds

        console.log(
            `[WORKER #${threadId}] done! ${new Date()
                .toISOString()
                .slice(14, 19)} waited for ${n} seconds --> ${
                this.getData().name
            }`
        )
        return n
    }
}
