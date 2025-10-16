// src/components/TaskTable.jsx
import { Table, Tag, Button } from "antd";

export const TaskTable = ({ tasks, onEdit, onDelete, onComplete }) => {
  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => date?.slice(0, 10),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Completed" ? "green" : "blue"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => onDelete(record._id)}>
            Delete
          </Button>
          {record.status !== "Completed" && (
            <Button type="link" onClick={() => onComplete(record._id)}>
              Complete
            </Button>
          )}
        </>
      ),
    },
  ];

  return <Table rowKey="_id" dataSource={tasks} columns={columns} />;
};
