import { useEffect, useMemo, useState } from 'react'
import { Card, Form, Input, Button, Table, Space, Modal, App as AntApp, Typography } from 'antd'

export default function CoursesPanelPro() {
  const { message, modal } = AntApp.useApp()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  // add form
  const [form] = Form.useForm()

  // search
  const [search, setSearch] = useState('')

  // edit modal state
  const [editRow, setEditRow] = useState(null)
  const [editForm] = Form.useForm()

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/courses')
      setCourses(await res.json())
    } catch {
      message.error('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (values) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(await res.text())
      form.resetFields()
      message.success('Course added')
      load()
    } catch (e) {
      message.error(`Create failed: ${e.message || 'error'}`)
    }
  }

  const onDelete = async (row) => {
    modal.confirm({
      title: `Delete ${row.code}?`,
      content: 'This action cannot be undone.',
      okType: 'danger',
      onOk: async () => {
        await fetch(`/api/courses/${row.id}`, { method: 'DELETE' })
        message.success('Deleted')
        load()
      }
    })
  }

  const onClickEdit = (row) => {
    setEditRow(row)
    editForm.setFieldsValue({ code: row.code, title: row.title })
  }

  const onSaveEdit = async () => {
    try {
      const values = await editForm.validateFields()
      await fetch(`/api/courses/${editRow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      message.success('Updated')
      setEditRow(null)
      editForm.resetFields()
      load()
    } catch (e) {
      if (e?.errorFields) return
      message.error(`Update failed: ${e.message || 'error'}`)
    }
  }

  const onCancelEdit = () => {
    setEditRow(null)
    editForm.resetFields()
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return courses.filter(c => (c.code + ' ' + c.title).toLowerCase().includes(q))
  }, [search, courses])

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Code', dataIndex: 'code', width: 140 },
    { title: 'Title', dataIndex: 'title' },
    {
      title: 'Actions',
      width: 200,
      render: (_, row) => (
        <Space>
          <Button onClick={() => onClickEdit(row)}>Edit</Button>
          <Button danger onClick={() => onDelete(row)}>Delete</Button>
        </Space>
      )
    },
  ]

  return (
    <>
      <Card title="Add Course" style={{ marginBottom: 16 }}>
        <Form form={form} layout="inline" onFinish={onCreate} style={{ rowGap: 8 }}>
          <Form.Item name="code" rules={[{ required: true, message: 'Code required' }]}>
            <Input placeholder="Code (e.g., CS405)" />
          </Form.Item>
          <Form.Item name="title" rules={[{ required: true, message: 'Title required' }]}>
            <Input placeholder="Title (e.g., Databases)" style={{ minWidth: 260 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add</Button>
          </Form.Item>
          <Form.Item style={{ marginLeft: 'auto' }}>
            <Input.Search
              allowClear
              placeholder="Search code/title…"
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: 260 }}
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
        />
      </Card>

      <Modal
        open={!!editRow}
        title={<Typography.Text strong>Edit course {editRow?.code}</Typography.Text>}
        onCancel={onCancelEdit}
        onOk={onSaveEdit}
        okText="Save"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: 'Code required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Title required' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
