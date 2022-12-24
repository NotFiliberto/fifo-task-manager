/**
 * Generic task, you have to override run method, and if you need extra data during the execution save it in data property of Task class
 */
export default abstract class Task {
    /**
     * Local data of the task
     *
     * @protected
     * @type {*}
     * @memberof Task
     */
    protected data: any

    /**
     * Deep recursive clone of data passed to the constructor
     * @param data data to store in the task
     */
    constructor(data?: any) {
        if (data) this.data = structuredClone(data)
        else data = {}
    }

    /**
     *
     * @returns task's data
     */
    public getData() {
        return this.data
    }

    /**
     *
     * @param data data to store in the task
     */
    public setData(data: any) {
        this.data = structuredClone(data)
    }
    /**
     * Method to run the task, you have to OVERRIDE it
     * @param args any argouments to the funciont
     */
    abstract run(...args: any): any
}
