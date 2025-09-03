import { useEffect, useMemo, useState } from "react";
import { Card, Select, Table, Statistic, Row, Col, App as AntApp, Empty } from "antd";

export default function ResultsPanelPro() {
  const { message } = AntApp.useApp();
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      const s = await fetch("/api/students").then((r) => r.json());
      setStudents(s);
    } catch {
      message.error("Failed to load students");
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const loadTranscript = async (id) => {
    if (!id) return;
    try {
      setLoading(true);
      const d = await fetch(`/api/registrations/transcript/by-student/${id}`).then(
        (r) => r.json()
      );
      setData(d);
    } catch {
      message.error("Failed to load transcript");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTranscript(studentId);
  }, [studentId]);

  const columns = [
    { title: "Semester", dataIndex: "semester", width: 110 },
    {
      title: "Course",
      render: (_, it) => `${it.course.code} — ${it.course.title}`,
    },
    { title: "Score", dataIndex: "score", width: 90 },
    { title: "Grade", dataIndex: "grade", width: 90 },
    { title: "Points", dataIndex: "points", width: 90 },
  ];

  const items = useMemo(() => data?.items || [], [data]);

  return (
    <>
      <Card title="Transcript" style={{ marginBottom: 16 }}>
        <Select
          placeholder="Select student"
          style={{ minWidth: 420 }}
          showSearch
          optionFilterProp="label"
          value={studentId}
          onChange={setStudentId}
          options={students.map((s) => ({
            value: s.id,
            label: `${s.regNo} — ${s.fullName}`,
          }))}
        />
      </Card>

      {!data ? (
        <Empty description="Select a student to view transcript" />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Student" value={`${data.student?.fullName || ""}`} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="Completed Courses" value={data.completedCount} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic title="GPA" value={data.gpa} precision={2} />
              </Card>
            </Col>
          </Row>

          <Card loading={loading}>
            <Table
              rowKey="registrationId"
              columns={columns}
              dataSource={items}
              //pagination={{ pageSize: 8, showSizeChanger: false }}
              scroll={{ y: 360, x: 'max-content' }} 
            />
          </Card>
        </>
      )}
    </>
  );
}
