// // src/components/TaskModal.jsx
// import { Modal, Form, Input, DatePicker, Select } from "antd";
// import dayjs from "dayjs";

// export const TaskModal = ({ visible, onCancel, onSubmit, task }) => {
//   const [form] = Form.useForm();

//   return (
//     <Modal
//       open={visible}
//       title={task ? "Edit Task" : "Add Task"}
//       onCancel={onCancel}
//       onOk={() => form.submit()}
//     >
//       <Form
//         form={form}
//         initialValues={{
//           title: task?.title,
//           description: task?.description,
//           dueDate: task?.dueDate ? dayjs(task.dueDate) : null,
//           status: task?.status || "Pending",
//         }}
//         onFinish={onSubmit}
//         layout="vertical"
//       >
//         <Form.Item name="title" label="Title" rules={[{ required: true }]}>
//           <Input />
//         </Form.Item>
//         <Form.Item name="description" label="Description">
//           <Input.TextArea />
//         </Form.Item>
//         <Form.Item name="dueDate" label="Due Date">
//           <DatePicker />
//         </Form.Item>
//         <Form.Item name="status" label="Status">
//           <Select>
//             <Select.Option value="Pending">Pending</Select.Option>
//             <Select.Option value="In Progress">In Progress</Select.Option>
//             <Select.Option value="Completed">Completed</Select.Option>
//           </Select>
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// };

// src/components/TaskModal.jsx
import { Modal, Form, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";

export const TaskModal = ({ visible, onCancel, onSubmit, task }) => {
  const [form] = Form.useForm();

  // update form fields when task changes
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        status: task.status || "Pending",
      });
    } else {
      form.resetFields(); // clear form for new task
    }
  }, [task, form]);

  return (
    <Modal
      open={visible}
      title={task ? "Edit Task" : "Add Task"}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={onSubmit} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date">
          <DatePicker />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Select>
            <Select.Option value="Pending">Pending</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="Completed">Completed</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
