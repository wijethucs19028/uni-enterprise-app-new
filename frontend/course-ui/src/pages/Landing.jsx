import { Button, Card, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f6fa" }}>
      <Card style={{ width: 520 }}>
        <Typography.Title level={3}>University CMS</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Choose how you want to sign in:
        </Typography.Paragraph>
        <Space>
          <Button type="primary" onClick={() => nav("/admin")} size="large">
            Admin Panel
          </Button>
          <Button onClick={() => nav("/student/login")} size="large">
            Student Portal
          </Button>
        </Space>
        <Typography.Paragraph style={{ marginTop: 16 }} type="secondary">
          Admin/Lecturer uses the browser’s built-in Basic Authentication dialog.
          Students use the in-app sign-in form.
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
