// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from "react-query";
import * as api from "../api/taskApi";
import { getSocket } from "../utils/socket";

export const useTasks = () => {
  const queryClient = useQueryClient();

  // fetch tasks
  const { data: tasks = [], ...query } = useQuery(
    ["tasks"],
    () => api.getTasks(),
    { refetchOnWindowFocus: false }
  );
  //   const tasks = task?.data ?? [];

  // add task
  const addTask = useMutation(api.createTask, {
    onSuccess: (newTask) => {
      queryClient.setQueryData(["tasks"], (old = []) => [...old, newTask]);
      getSocket()?.emit("taskCreated", newTask);
    },
  });

  // update task
  const updateTask = useMutation(({ id, data }) => api.updateTask(id, data), {
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  // delete task
  const deleteTask = useMutation(api.deleteTask, {
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  // reorder tasks
  const reorderTasks = useMutation(api.reorderTasks, {
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  return { tasks, addTask, updateTask, deleteTask, reorderTasks, ...query };
};
