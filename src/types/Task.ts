export abstract class Task {
    protected data: any

    constructor(data?: any) {
        if (data) this.data = structuredClone(data)
        else data = {}
    }
    public getData() {
        return this.data
    }
    public setData(data: any) {
        this.data = structuredClone(data)
    }
    abstract run(...args: any): any
}
