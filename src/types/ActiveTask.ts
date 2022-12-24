/**
 * rappresents a pair with worker and its task
 */
export class ActiveTask<T, W> {
    /**
     *
     * @param task task to store
     * @param worker worker to store
     */
    constructor(public task: T, public worker: W) {}
}
