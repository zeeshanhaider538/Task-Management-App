// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from "react";
import { Button, Select } from "antd";
import { TaskTable } from "../components/TaskTable";
import { TaskKanban } from "../components/TaskKanban";
import { TaskModal } from "../components/TaskModal";
import { useTasks } from "../hooks/useTasks";
import { AuthContext } from "../context/AuthContext";
import { connectSocket, getSocket } from "../utils/socket";

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState("table"); // table or kanban
  const [filterStatus, setFilterStatus] = useState("");

  // connect socket
  useEffect(() => {
    const socket = connectSocket(user.token);
    socket.on("taskCreated", (task) => {
      console.log("Task created via socket:", task);
    });
    socket.on("taskUpdated", () => {});
    socket.on("taskDeleted", () => {});
    socket.on("tasksReordered", () => {});
    return () => socket.disconnect();
  }, [user.token]);

  const handleAddEdit = (data) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask._id, data });
    } else {
      addTask.mutate(data);
    }
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleDelete = (id) => deleteTask.mutate(id);
  const handleComplete = (id) =>
    updateTask.mutate({ id, data: { status: "Completed" } });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const orderedIds = reordered.map((t) => t._id);
    reorderTasks.mutate(orderedIds);
  };
  console.log("tasks from API:", tasks);

  const filteredTasks = filterStatus
    ? tasks.filter((t) => t.status === filterStatus)
    : tasks;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add Task
        </Button>
        <Select
          placeholder="Filter Status"
          style={{ width: 200 }}
          onChange={setFilterStatus}
          allowClear
        >
          <Select.Option value="Pending">Pending</Select.Option>
          <Select.Option value="In Progress">In Progress</Select.Option>
          <Select.Option value="Completed">Completed</Select.Option>
        </Select>
        <Select
          placeholder="View"
          value={view}
          style={{ width: 150 }}
          onChange={setView}
        >
          <Select.Option value="table">Table</Select.Option>
          <Select.Option value="kanban">Kanban</Select.Option>
        </Select>
      </div>

      {view === "table" ? (
        <TaskTable
          tasks={filteredTasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onComplete={handleComplete}
        />
      ) : (
        <TaskKanban tasks={filteredTasks} onDragEnd={handleDragEnd} />
      )}

      <TaskModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTask(null);
        }}
        onSubmit={handleAddEdit}
        task={editingTask}
      />
    </div>
  );
};
