import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Card,
  Col,
  Row,
  Typography,
  Button,
  Space,
  Divider,
  Empty,
} from "antd";
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Users,
  FileBarChart,
  ArrowRight,
} from "lucide-react";
import dayjs from "dayjs";

const { Title, Text } = Typography;

function Feature({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: "rgba(0,0,0,0.55)" }}>{desc}</div>
      </div>
    </div>
  );
}

export default function HomeDashboard() {
  const nav = useNavigate();

  return (
    <div className="home-wrap">
      {/* Header */}
      <div className="home-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            U-CMS
          </Title>
          <Text type="secondary">
            University Course Management System — manage courses, students,
            registrations, and results.
          </Text>
        </div>
        <Space wrap>
          <Button
            type="primary"
            icon={<ShieldCheck size={16} />}
            onClick={() => nav("/admin")}
          >
            Admin Panel
          </Button>
          <Button icon={<GraduationCap size={16} />} onClick={() => nav("/login")}>
            Student Portal
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN */}
        <Col xs={24} lg={16}>
          {/* Portals */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Admin Panel"
                extra={
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => nav("/admin")}
                    icon={<ArrowRight size={14} />}
                  >
                    Enter
                  </Button>
                }
              >
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Feature
                    icon={<BookOpen size={18} />}
                    title="Courses"
                    desc="Create, update, and organize course offerings."
                  />
                  <Feature
                    icon={<Users size={18} />}
                    title="Registrations"
                    desc="Manage enrollments and allocations."
                  />
                  <Feature
                    icon={<FileBarChart size={18} />}
                    title="Results"
                    desc="Publish and review student results."
                  />
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card
                title="Student Portal"
                extra={
                  <Button size="small" onClick={() => nav("/login")} icon={<ArrowRight size={14} />}>
                    Enter
                  </Button>
                }
              >
                <Space direction="vertical" size={10} style={{ width: "100%" }}>
                  <Feature
                    icon={<GraduationCap size={18} />}
                    title="Transcript & GPA"
                    desc="View your results and academic summary."
                  />
                  <Feature
                    icon={<ShieldCheck size={18} />}
                    title="Secure Access"
                    desc="Sign in privately to see your information."
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Announcements / Updates */}
          <Card title="Announcements" style={{ marginTop: 16 }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary">No announcements at the moment</Text>}
            />
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col xs={24} lg={8}>
          {/* Compact Calendar */}
          <Card title="Calendar">
            <Calendar
              fullscreen={false}
              value={dayjs()}
              headerRender={({ value, onChange }) => {
                const curr = value || dayjs();
                const prev = () => onChange(curr.subtract(1, "month"));
                const next = () => onChange(curr.add(1, "month"));
                return (
                  <div className="cal-header">
                    <Button size="small" onClick={prev}>
                      Prev
                    </Button>
                    <Text strong>{curr.format("MMMM YYYY")}</Text>
                    <Button size="small" onClick={next}>
                      Next
                    </Button>
                  </div>
                );
              }}
            />
            <Divider style={{ margin: "12px 0" }} />
            <Text type="secondary">
              Use the calendar to plan registrations and assessments.
            </Text>
          </Card>

          {/* Quick Links */}
          <Card style={{ marginTop: 16 }} title="Quick Links">
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Button block onClick={() => nav("/student")}>
                Student: View Results
              </Button>
              <Button block onClick={() => nav("/admin")}>
                Admin: Manage Courses
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
