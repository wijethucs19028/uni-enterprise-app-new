import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Typography, Alert } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const nav = useNavigate();
  const { user, signIn } = useAuth();
  const [params] = useSearchParams();
  const loc = useLocation();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const target = params.get("target") || "admin"; // "admin" | "student"

  useEffect(() => {
  
    if (user?.roles?.length) {
      if (user.roles.includes("ROLE_ADMIN") || user.roles.includes("ROLE_LECTURER")) {
        nav("/admin", { replace: true });
      } else if (user.roles.includes("ROLE_STUDENT")) {
        nav("/student", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onFinish = async ({ username, password }) => {
    setErr("");
    setLoading(true);
    try {
      const me = await signIn(username, password);
      // redirect by role OR by target hint
      if (target === "student" && me.roles?.includes("ROLE_STUDENT")) {
        nav("/student", { replace: true });
      } else if (me.roles?.includes("ROLE_ADMIN") || me.roles?.includes("ROLE_LECTURER")) {
        nav("/admin", { replace: true });
      } else if (me.roles?.includes("ROLE_STUDENT")) {
        nav("/student", { replace: true });
      } else {
        setErr("Your account does not have a supported role.");
      }
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f6fa", padding: 16 }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={4} style={{ marginBottom: 16 }}>
          {target === "student" ? "Student Sign In" : "Admin / Lecturer Sign In"}
        </Typography.Title>

        {err ? <Alert type="error" message={err} style={{ marginBottom: 16 }} /> : null}

        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            username: target === "student" ? "student" : "admin",
            password: target === "student" ? "student123" : "admin123",
          }}
        >
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Demo users: <b>admin/admin123</b> · <b>student/student123</b> · <b>lecturer/lecturer123</b>
        </Typography.Paragraph>

        <Typography.Paragraph style={{ fontSize: 12, color: "#999" }}>
          You were at: <code>{loc.state?.from || "/"}</code>
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
