// src/pages/Login.jsx
import { useState, useContext } from "react";
import { Form, Input, Button, message } from "antd";
import { login as loginApi } from "../api/taskApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await loginApi(values);
      login(data);
      message.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: "100%", margin: "" }}>
      <h2>Login</h2>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email" }]}
          style={{ color: "white!" }}
          // className=""
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
      <p>
        Don’t have an account? <Link to="/signup">Signup here</Link>
      </p>
    </div>
  );
};
