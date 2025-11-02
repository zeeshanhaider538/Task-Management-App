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
  Switch,
} from "antd";
import {
  PlusOutlined,
  TableOutlined,
  AppstoreOutlined,
  FilterOutlined,
  MoonOutlined,
  SunOutlined,
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
  const [darkMode, setDarkMode] = useState(false);

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
    reorderTasks.mutate(reordered.map((t) => t._id));
  };

  const filteredTasks = filterStatus
    ? tasks.filter((t) => t.status === filterStatus)
    : tasks;

  const bgColor = darkMode ? "#121212" : "#f5f7fb";
  const cardColor = darkMode ? "#1f1f1f" : "#fff";
  const textColor = darkMode ? "#eaeaea" : "#333";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgColor,
        transition: "all 0.4s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: darkMode
            ? "linear-gradient(90deg, #434343 0%, #000000 100%)"
            : "linear-gradient(90deg, #4f46e5 0%, #3b82f6 100%)",
          color: "#fff",
          padding: "40px 60px 60px",
          borderBottomLeftRadius: "60px",
          borderBottomRightRadius: "60px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          transition: "all 0.4s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Title
              level={2}
              style={{ color: "#fff", marginBottom: 4, fontWeight: 700 }}
            >
              Dashboard
            </Title>
            <Text style={{ color: "#e0e0e0" }}>
              Welcome back, <b>{user?.name || "User"}</b> 👋 — stay productive
              today!
            </Text>
          </div>
          <Space>
            <Tooltip title="Toggle Dark Mode">
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </Tooltip>

            <Tooltip title="Add New Task">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                shape="round"
                style={{
                  background: "#fff",
                  color: "#4f46e5",
                  border: "none",
                  fontWeight: 600,
                }}
                onClick={() => setModalVisible(true)}
              >
                Add Task
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "30px 60px", transition: "all 0.3s ease" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: darkMode
              ? "0 6px 15px rgba(255,255,255,0.05)"
              : "0 6px 15px rgba(0,0,0,0.08)",
            padding: 24,
            background: cardColor,
            color: textColor,
          }}
        >
          {/* Controls */}
          <Space
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: 24,
            }}
          >
            <Select
              prefix={<FilterOutlined />}
              placeholder="Filter by Status"
              style={{ width: 220 }}
              onChange={setFilterStatus}
              allowClear
              size="large"
            >
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
            </Select>

            <Select
              prefix={
                view === "table" ? <TableOutlined /> : <AppstoreOutlined />
              }
              value={view}
              style={{ width: 180 }}
              onChange={setView}
              size="large"
            >
              <Select.Option value="table">Table View</Select.Option>
              <Select.Option value="kanban">Kanban View</Select.Option>
            </Select>
          </Space>

          <Divider style={{ margin: "10px 0 20px" }} />

          {/* Main View */}
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
        </Card>
      </div>

      {/* Task Modal */}
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
