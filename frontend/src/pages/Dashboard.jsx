// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from "react";
import {
  Button,
  Select,
  Typography,
  Card,
  Space,
  Divider,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { TaskTable } from "../components/TaskTable";
import { TaskKanban } from "../components/TaskKanban";
import { TaskModal } from "../components/TaskModal";
import { useTasks } from "../hooks/useTasks";
import { AuthContext } from "../context/AuthContext";
import { connectSocket } from "../utils/socket";

const { Title, Text } = Typography;

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [view, setView] = useState("table");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const socket = connectSocket(user.token);
    socket.on("taskCreated", (task) => console.log("Task created:", task));
    return () => socket.disconnect();
  }, [user.token]);

  const handleAddEdit = (data) => {
    editingTask
      ? updateTask.mutate({ id: editingTask._id, data })
      : addTask.mutate(data);
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

  const filteredTasks = filterStatus
    ? tasks.filter((t) => t.status === filterStatus)
    : tasks;

  return (
    <div
      style={{
        padding: "40px 60px",
        background: "#f5f7fb",
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
          padding: 24,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 0 }}>
              Welcome, {user?.name || "User"} 👋
            </Title>
            <Text type="secondary">
              Manage your tasks efficiently with beautiful clarity.
            </Text>
          </div>
          <Tooltip title="Add New Task">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              shape="round"
              onClick={() => setModalVisible(true)}
            >
              Add Task
            </Button>
          </Tooltip>
        </div>

        <Divider style={{ margin: "20px 0" }} />

        <Space
          style={{
            display: "flex",
            justifyContent: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: 24,
          }}
        >
          <Select
            prefix={<FilterOutlined />}
            placeholder="Filter by Status"
            style={{ width: 220 }}
            onChange={setFilterStatus}
            allowClear
          >
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>

          <Select
            prefix={view === "table" ? <TableOutlined /> : <AppstoreOutlined />}
            value={view}
            style={{ width: 180 }}
            onChange={setView}
          >
            <Select.Option value="table">Table View</Select.Option>
            <Select.Option value="kanban">Kanban View</Select.Option>
          </Select>
        </Space>

        <div style={{ marginTop: 10 }}>
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
        </div>
      </Card>

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
