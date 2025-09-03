import { Card, Row, Col, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { CrownOutlined, UserOutlined } from "@ant-design/icons";

export default function HomeLanding() {
  const nav = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>Welcome to U-CMS</Typography.Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => nav("/login?target=admin")}
            style={{ minHeight: 160 }}
            title={<span><CrownOutlined /> Admin Panel</span>}
          >
            Manage Courses, Students, Registrations, Results.
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => nav("/login?target=student")}
            style={{ minHeight: 160 }}
            title={<span><UserOutlined /> Student Portal</span>}
          >
            View your transcript and results.
          </Card>
        </Col>
      </Row>
    </div>
  );
}
