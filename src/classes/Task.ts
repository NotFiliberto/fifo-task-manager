/**
 * Generic task, you have to override run method, and if you need extra data during the execution save it in data property of Task class
 */
export default abstract class Task<T> {
    /**
     * Local data of the task
     *
     * @protected
     * @type {*}
     * @memberof Task
     */
    protected data!: T

    /**
     * Deep recursive clone of data passed to the constructor
     * @param data data to store in the task
     */
    constructor(data?: T) {
        if (data) this.data = structuredClone(data)
        else data = undefined
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
    public setData(data: T) {
        this.data = structuredClone(data)
    }
    /**
     * Method to run the task, you have to OVERRIDE it
     * @param args any argouments to the funciont
     */
    abstract run(...args: any): any
}

/**
 * Generic typesafe task wrapper to have data into task with types
 */
export abstract class GenericTypesafeTask<K> extends Task<K> {
    constructor(data?: K) {
        super(data)
    }
}
