import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Statistic, Space, Typography, Skeleton, App as AntApp } from "antd";

const POLL_SECONDS = 30;

export default function SidebarStats() {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);

  const timerRef = useRef(null);

  const load = async (signal) => {
    try {
      setLoading(true);
      const [c, s, r] = await Promise.all([
        fetch("/api/courses", { signal }).then((res) => res.json()),
        fetch("/api/students", { signal }).then((res) => res.json()),
        fetch("/api/registrations", { signal }).then((res) => res.json()),
      ]);
      setCourses(c || []);
      setStudents(s || []);
      setRegistrations(r || []);
      setUpdatedAt(new Date());
    } catch (e) {
      if (e.name !== "AbortError") {
        message.error("Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    // poll
    timerRef.current = setInterval(() => {
      const c2 = new AbortController();
      load(c2.signal);
    }, POLL_SECONDS * 1000);

    return () => {
      controller.abort();
      clearInterval(timerRef.current);
    };
  }, []);

  const totals = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = students.length;
    const totalRegs = registrations.length;
    const resultsPublished = registrations.filter((r) => r.status === "COMPLETED").length;
    return { totalCourses, totalStudents, totalRegs, resultsPublished };
  }, [courses, students, registrations]);

  return (
    <Space direction="vertical" size={16} style={{ display: "flex" }}>
      <Card title="System Overview">
        <Typography.Paragraph style={{ marginBottom: 8 }}>
          <strong>U-CMS</strong> manages <strong>Courses</strong>,{" "}
          <strong>Students</strong>, <strong>Registrations</strong> and{" "}
          <strong>Results</strong>.
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          {updatedAt ? `Last update: ${updatedAt.toLocaleTimeString()}` : "Loading…"}
        </Typography.Text>
      </Card>

      <Card>
        {loading ? (
          <Skeleton active paragraph={{ rows: 0 }} />
        ) : (
          <Statistic title="Total Courses" value={totals.totalCourses} />
        )}
      </Card>

      <Card>
        {loading ? (
          <Skeleton active paragraph={{ rows: 0 }} />
        ) : (
          <Statistic title="Total Students" value={totals.totalStudents} />
        )}
      </Card>

      <Card>
        {loading ? (
          <Skeleton active paragraph={{ rows: 0 }} />
        ) : (
          <Statistic title="Registrations" value={totals.totalRegs} />
        )}
      </Card>

      <Card>
        {loading ? (
          <Skeleton active paragraph={{ rows: 0 }} />
        ) : (
          <Statistic title="Results Published" value={totals.resultsPublished} />
        )}
      </Card>
    </Space>
  );
}
