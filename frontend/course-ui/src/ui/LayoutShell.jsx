import { Layout, Menu, Typography, Row, Col, Space, Button } from "antd";
import {
  BookOutlined,
  UsergroupAddOutlined,
  DiffOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import SidebarStats from "./SidebarStats";
import { useAuth } from "../auth/AuthContext";

const { Header, Content, Footer } = Layout;

/**
 * Props:
 * - title?: string
 * - active: "courses" | "registrations" | "students" | "results"
 * - onChange: (key) => void
 * - visibleTabs?: { courses?: boolean, registrations?: boolean, students?: boolean, results?: boolean }
 * - onSignOut?: () => Promise<void> | void   // <-- NEW (admin uses this)
 */
export default function LayoutShell({
  title = "U-CMS",
  active,
  onChange,
  visibleTabs = {},
  onSignOut,
  children,
}) {
  const { user, signOut } = useAuth();

  const allItems = [
    { key: "courses", icon: <BookOutlined />, label: "Courses", show: visibleTabs.courses ?? true },
    { key: "registrations", icon: <UsergroupAddOutlined />, label: "Registrations", show: visibleTabs.registrations ?? true },
    { key: "students", icon: <DiffOutlined />, label: "Students", show: visibleTabs.students ?? true },
    { key: "results", icon: <BarChartOutlined />, label: "Results", show: visibleTabs.results ?? true },
  ];

  const items = allItems.filter(i => i.show).map(({ show, ...x }) => x);

  const handleSignOut = async () => {
    if (onSignOut) {
      await onSignOut();               // Admin flow
    } else {
      signOut();                       // Student flow
      window.location.replace("/");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", gap: 16, paddingInline: 24 }}>
        <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
          {title}
        </Typography.Title>

        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[active]}
          onClick={(e) => onChange(e.key)}
          items={items}
          style={{ flex: 1 }}
        />

        <Space style={{ color: "#fff" }}>
          <span style={{ opacity: 0.85 }}>
            {user ? `${user.username} (${(user.roles || []).map(r => r.replace('ROLE_', '')).join(', ')})` : ""}
          </span>
          <Button size="small" icon={<LogoutOutlined />} onClick={handleSignOut}>
            Sign out
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: 24 }}>
        <Row gutter={16}>
          <Col xs={24} md={7} lg={6} xl={5}>
            <SidebarStats />
          </Col>
          <Col xs={24} md={17} lg={18} xl={19}>
            {children}
          </Col>
        </Row>
      </Content>

      <Footer style={{ textAlign: "center", background: "#f9f9f9", padding: "16px 24px" }}>
        <Typography.Text type="secondary">
          © {new Date().getFullYear()} University Course Management System (U-CMS). Built with React, Spring Boot & MySQL.
        </Typography.Text>
      </Footer>
    </Layout>
  );
}
