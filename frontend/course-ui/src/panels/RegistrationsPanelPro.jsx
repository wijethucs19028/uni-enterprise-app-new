import { useEffect, useMemo, useState } from "react";
//import useTableY from "../ui/useTableY";
import {
  Card, Form, Select, Input, Button, Table, Space, Tag, Modal, App as AntApp,
  InputNumber
} from "antd";

const statusColors = {
  REGISTERED: "blue",
  COMPLETED: "green",
  DROPPED: "red",
};

export default function RegistrationsPanelPro() {
  const { message, modal } = AntApp.useApp();
  //const tableY = useTableY(380); // tweak offset until it feels right

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // edit modal
  const [edit, setEdit] = useState(null);
  const [editForm] = Form.useForm();

  const loadAll = async () => {
    try {
      setLoading(true);
      const [s, c, r] = await Promise.all([
        fetch("/api/students").then((r) => r.json()),
        fetch("/api/courses").then((r) => r.json()),
        fetch("/api/registrations").then((r) => r.json()),
      ]);
      setStudents(s);
      setCourses(c);
      setRows(r);
    } catch (e) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const onCreate = async (values) => {
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: values.studentId,
          courseId: values.courseId,
          semester: values.semester,
          status: "REGISTERED",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      form.resetFields();
      message.success("Registered");
      loadAll();
    } catch (e) {
      message.error(`Create failed: ${e.message || "error"}`);
    }
  };

  const onDelete = (row) => {
    modal.confirm({
      title: `Delete registration?`,
      content: `${row.student.fullName} → ${row.course.code} (${row.semester})`,
      okType: "danger",
      onOk: async () => {
        await fetch(`/api/registrations/${row.id}`, { method: "DELETE" });
        message.success("Deleted");
        loadAll();
      },
    });
  };

  const openEdit = (row) => {
    setEdit(row);
    editForm.setFieldsValue({
      status: row.status,
      score: row.score ?? null,
      grade: row.grade ?? "",
      semester: row.semester,
    });
  };

  const saveEdit = async () => {
    const values = await editForm.validateFields();
    await fetch(`/api/registrations/${edit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    message.success("Updated");
    setEdit(null);
    editForm.resetFields();
    loadAll();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((r) =>
      (
        r.student.fullName +
        " " +
        r.student.regNo +
        " " +
        r.course.code +
        " " +
        r.semester
      )
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const columns = [
    { title: "ID", dataIndex: "id", width: 70, sorter: (a, b) => a.id - b.id },
    {
      title: "Student",
      render: (_, r) => `${r.student.fullName} (${r.student.regNo})`,
      sorter: (a, b) =>
        a.student.fullName.localeCompare(b.student.fullName),
    },
    {
      title: "Course",
      render: (_, r) => `${r.course.code} — ${r.course.title}`,
      sorter: (a, b) => a.course.code.localeCompare(b.course.code),
    },
    { title: "Semester", dataIndex: "semester", width: 110 },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      render: (s) => <Tag color={statusColors[s] || "default"}>{s}</Tag>,
      filters: [
        { text: "REGISTERED", value: "REGISTERED" },
        { text: "COMPLETED", value: "COMPLETED" },
        { text: "DROPPED", value: "DROPPED" },
      ],
      onFilter: (v, r) => r.status === v,
    },
    { title: "Score", dataIndex: "score", width: 90 },
    { title: "Grade", dataIndex: "grade", width: 90 },
    {
      title: "Actions",
      width: 170,
      render: (_, row) => (
        <Space>
          <Button onClick={() => openEdit(row)}>Edit</Button>
          <Button danger onClick={() => onDelete(row)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title="Register Student to Course" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={onCreate}
          style={{ rowGap: 8, flexWrap: "wrap" }}
        >
          <Form.Item
            name="studentId"
            rules={[{ required: true, message: "Select student" }]}
          >
            <Select
              placeholder="Student"
              style={{ minWidth: 260 }}
              showSearch
              optionFilterProp="label"
              options={students.map((s) => ({
                value: s.id,
                label: `${s.regNo} — ${s.fullName}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="courseId"
            rules={[{ required: true, message: "Select course" }]}
          >
            <Select
              placeholder="Course"
              style={{ minWidth: 260 }}
              showSearch
              optionFilterProp="label"
              options={courses.map((c) => ({
                value: c.id,
                label: `${c.code} — ${c.title}`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="semester"
            placeholder="Course"
            //initialValue="2025S1"
            rules={[{ required: true, message: "Semester required" }]}
          >
            <Input placeholder="Semester (e.g., sem I,II..)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: "auto" }}>
            <Input.Search
              allowClear
              placeholder="Search by student/course/semester…"
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 300 }}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          //pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ y: 360, x: 'max-content' }} 
          sticky
        />
      </Card>

      <Modal
        open={!!edit}
        title={`Edit Registration #${edit?.id}`}
        onCancel={() => {
          setEdit(null);
          editForm.resetFields();
        }}
        onOk={saveEdit}
        okText="Save"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Semester"
            name="semester"
            rules={[{ required: true, message: "Semester required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: "REGISTERED", label: "REGISTERED" },
                { value: "COMPLETED", label: "COMPLETED" },
                { value: "DROPPED", label: "DROPPED" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Score" name="score">
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Grade" name="grade">
            <Input placeholder="A, B+, C- ..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
