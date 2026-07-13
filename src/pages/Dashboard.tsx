import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Button, Input, Modal, Form, Space, Popconfirm, Typography, Tooltip, Spin, message } from 'antd';
import { KeyOutlined, LaptopOutlined, CheckCircleOutlined, PlusOutlined, DeleteOutlined, CopyOutlined, SafetyOutlined } from '@ant-design/icons';
import { useGetLicensesQuery, useActivateLicenseMutation, useDeactivateLicenseMutation, UserLicense } from '../store/themeApi';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch licenses dynamically via RTK Query
  const { data: licenses = [], isLoading, error } = useGetLicensesQuery();

  // Mutation hooks
  const [activateLicense, { isLoading: isActivating }] = useActivateLicenseMutation();
  const [deactivateLicense, { isLoading: isDeactivating }] = useDeactivateLicenseMutation();

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép key bản quyền!');
  };

  // Handle deactivating domain connection
  const handleDeactivate = async (licenseKey: string) => {
    try {
      await deactivateLicense({ licenseKey }).unwrap();
      message.warning('Đã ngắt kết nối domain thành công.');
    } catch (err: any) {
      message.error(err?.data?.error || 'Ngắt kết nối thất bại.');
    }
  };

  // Handle adding connection (activating a domain)
  const handleActivateConnection = async (values: { licenseKey: string; domain: string }) => {
    try {
      await activateLicense({ licenseKey: values.licenseKey, domain: values.domain }).unwrap();
      setIsModalOpen(false);
      form.resetFields();
      message.success(`Kích hoạt thành công theme cho domain ${values.domain}!`);
    } catch (err: any) {
      message.error(err?.data?.error || 'Kích hoạt key bản quyền thất bại.');
    }
  };

  // Data grid structure for Licenses
  const columns = [
    {
      title: 'Tên Theme',
      dataIndex: 'themeName',
      key: 'themeName',
      render: (text: string) => <Text strong style={{ color: '#1e293b' }}>{text}</Text>,
    },
    {
      title: 'Key Bản Quyền',
      dataIndex: 'licenseKey',
      key: 'licenseKey',
      render: (key: string) => (
        <Space>
          <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
            {key}
          </code>
          <Tooltip title="Sao chép">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined style={{ color: '#6366f1' }} />}
              onClick={() => copyToClipboard(key)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Website Kết Nối',
      dataIndex: 'domain',
      key: 'domain',
      render: (domain: string) => (
        <span style={{ fontStyle: domain === 'N/A' || !domain ? 'italic' : 'normal', color: domain === 'N/A' || !domain ? '#94a3b8' : '#1e293b' }}>
          {domain || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'expired' | 'suspended') => {
        let color = 'default';
        let text = 'Chưa dùng';
        if (status === 'active') {
          color = 'green';
          text = 'Đang Kích Hoạt';
        } else if (status === 'suspended') {
          color = 'orange';
          text = 'Tạm Ngưng';
        } else if (status === 'expired') {
          color = 'red';
          text = 'Hết Hạn';
        }
        return <Tag color={color} style={{ borderRadius: '4px', fontWeight: 600 }}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày Kích Hoạt',
      dataIndex: 'activatedAt',
      key: 'activatedAt',
      render: (val: string) => {
        if (!val) return '-';
        const parts = val.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return val;
      },
    },
    {
      title: 'Ngày Hết Hạn',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (val: string) => {
        if (!val) return '-';
        const parts = val.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return val;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_: any, record: UserLicense) => (
        <Space size="middle">
          {record.status === 'active' ? (
            <Popconfirm
              title="Ngắt kết nối theme?"
              description="Bạn có chắc chắn muốn ngắt kết nối bản quyền khỏi website này không?"
              onConfirm={() => handleDeactivate(record.licenseKey)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button type="text" danger icon={<DeleteOutlined />} loading={isDeactivating}>
                Gỡ Cài Đặt
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => {
                form.setFieldsValue({ licenseKey: record.licenseKey });
                setIsModalOpen(true);
              }}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const activeCount = licenses.filter(l => l.status === 'active').length;

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
          Quản Lý Key Bản Quyền & Theme Đã Mua
        </Title>
        <Text type="secondary">
          Kích hoạt domain, kiểm tra trạng thái active và quản lý bản quyền các theme WordPress của bạn.
        </Text>
      </div>

      {/* Metrics Row */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin>
            <div style={{ marginTop: '8px', color: '#6366f1', fontWeight: 600 }}>Đang tải dữ liệu báo cáo...</div>
          </Spin>
        </div>
      ) : (
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Statistic
                title="Tổng Theme Đã Mua"
                value={licenses.length}
                prefix={<SafetyOutlined style={{ color: '#6366f1' }} />}
                valueStyle={{ fontWeight: 800, color: '#1e293b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Statistic
                title="Website Đang Hoạt Động"
                value={activeCount}
                prefix={<LaptopOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ fontWeight: 800, color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card variant="borderless" className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Statistic
                title="Key Chưa Kích Hoạt"
                value={licenses.length - activeCount}
                prefix={<KeyOutlined style={{ color: '#f59e0b' }} />}
                valueStyle={{ fontWeight: 800, color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>Danh sách Theme bản quyền</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading || error !== undefined}
            >
              Kích Hoạt Domain Mới
            </Button>
          </div>
        }
        variant="borderless"
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          borderRadius: '16px',
        }}
      >
        <Table
          columns={columns}
          dataSource={licenses.map(lic => ({ ...lic, key: lic.id }))}
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: error ? 'Không thể kết nối đến máy chủ API.' : 'Bạn chưa mua hoặc sở hữu theme nào.' }}
        />
      </Card>

      {/* Activation Modal */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Kích Hoạt Theme Cho Website</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleActivateConnection}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="licenseKey"
            label="Chọn Theme hoặc Nhập Key bản quyền"
            rules={[{ required: true, message: 'Vui lòng chọn theme cần kích hoạt!' }]}
          >
            <Input.Search
              placeholder="Chọn Theme hoặc nhập key..."
              enterButton={<SafetyOutlined />}
              addonBefore="Key"
            />
          </Form.Item>

          <Form.Item
            name="domain"
            label="Địa Chỉ Domain Website (không bao gồm http/https)"
            rules={[
              { required: true, message: 'Vui lòng nhập tên miền của bạn!' },
              {
                pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
                message: 'Tên miền không hợp lệ (Ví dụ: mysite.com)',
              },
            ]}
          >
            <Input placeholder="mysite.com" prefix={<LaptopOutlined style={{ color: '#8c8c8c' }} />} />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0, marginTop: '24px' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />} loading={isActivating}>
                Kích Hoạt Ngay
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
