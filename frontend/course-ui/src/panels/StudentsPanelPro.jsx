import { useEffect, useMemo, useState } from "react";
import {
  Card, Form, Input, Button, Table, Space, Modal, App as AntApp
} from "antd";

export default function StudentsPanelPro() {
  const { message, modal } = AntApp.useApp();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // edit modal
  const [edit, setEdit] = useState(null);
  const [editForm] = Form.useForm();

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/students");
      setRows(await res.json());
    } catch {
      message.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (values) => {
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      form.resetFields();
      message.success("Student added");
      load();
    } catch (e) {
      message.error(`Create failed: ${e.message || "error"}`);
    }
  };

  const onDelete = (row) => {
    modal.confirm({
      title: `Delete ${row.regNo}?`,
      content: row.fullName,
      okType: "danger",
      onOk: async () => {
        await fetch(`/api/students/${row.id}`, { method: "DELETE" });
        message.success("Deleted");
        load();
      },
    });
  };

  const openEdit = (row) => {
    setEdit(row);
    editForm.setFieldsValue({
      regNo: row.regNo,
      fullName: row.fullName,
      email: row.email,
    });
  };

  const saveEdit = async () => {
    const v = await editForm.validateFields();
    await fetch(`/api/students/${edit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(v),
    });
    message.success("Updated");
    setEdit(null);
    editForm.resetFields();
    load();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((s) =>
      (s.regNo + " " + s.fullName + " " + s.email).toLowerCase().includes(q)
    );
  }, [rows, search]);

  const columns = [
    { title: "ID", dataIndex: "id", width: 70, sorter: (a, b) => a.id - b.id },
    { title: "Reg No", dataIndex: "regNo", width: 150 },
    { title: "Full Name", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Actions",
      width: 180,
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
      <Card title="Add Student" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={onCreate} style={{ rowGap: 8 }}>
          <Form.Item name="regNo" rules={[{ required: true, message: "Reg No required" }]}>
            <Input placeholder="Reg No (e.g., IT2025-001)" />
          </Form.Item>
          <Form.Item name="fullName" rules={[{ required: true, message: "Full name required" }]}>
            <Input placeholder="Full Name" style={{ minWidth: 220 }} />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Email required" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="Email" style={{ minWidth: 220 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add</Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: "auto" }}>
            <Input.Search
              allowClear
              placeholder="Search regNo/name/email…"
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
          pagination={{ pageSize: 8, showSizeChanger: false }}
        />
      </Card>

      <Modal
        open={!!edit}
        title={`Edit ${edit?.regNo}`}
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
            label="Reg No"
            name="regNo"
            rules={[{ required: true, message: "Reg No required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Full name required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Email required" }, { type: "email", message: "Invalid email" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
