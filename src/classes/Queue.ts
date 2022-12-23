export default class Queue<T> {
    private items: T[] = []

    /**
     *
     * @param item insert new item in the queue
     */
    public enqueue(item: T) {
        this.items.push(item)
    }

    /**
     * remove first item of the queue
     * @returns queue item
     */
    public dequeue(): T | undefined {
        return this.items.shift()
    }

    /**
     *
     * @returns size of the queue
     */
    public getSize() {
        return this.items.length
    }

    /**
     *
     * @returns if the queue is empty
     */
    public isEmpty() {
        return this.getSize() === 0
    }

    /**
     *
     * @returns first item in the queue
     */
    public peek() {
        const item = this.items.at(0)
        if (item === undefined) throw new Error("no items in the queue")
        return item
    }
}
