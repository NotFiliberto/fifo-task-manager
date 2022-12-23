# fifo-task-manager

Task manager using FIFO method for choosing tasks to run and node worker threads for delegating the execution of a task.

# Limitations

-   You can't add different Task for the same Task Manager, because when the task swaps with another task, they only swap data and not any other information, this is a limitation of worker_threads, you can't pass any function or method when you create a worker from main thread
