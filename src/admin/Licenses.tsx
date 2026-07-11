import React, { useState } from 'react';
// Import các Component UI từ thư viện Ant Design để phục vụ xây dựng giao diện nhanh & đẹp
import { Row, Col, Card, Statistic, Table, Tag, Button, Input, Modal, Form, Space, Popconfirm, Typography, Tooltip, Spin, message } from 'antd';
// Import các Icon từ Ant Design để tăng tính trực quan cho các nút bấm & đề mục
import { 
  KeyOutlined, 
  LaptopOutlined, 
  CheckCircleOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  CopyOutlined, 
  SafetyOutlined, 
  LockOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
// Import các hooks gọi API từ themeApi (đã xây dựng bằng RTK Query)
import { useGetLicensesQuery, useActivateLicenseMutation, useDeactivateLicenseMutation, UserLicense } from '../store/themeApi';

// Giải cấu trúc (destructuring) các sub-component của Typography để code gọn hơn
const { Title, Text } = Typography;

/**
 * Interface biểu diễn cấu trúc dữ liệu gửi lên từ form đăng ký kích hoạt key
 */
interface ActivateFormValues {
  licenseKey: string;
  domain: string;
}

/**
 * Component chính Quản lý License dành cho quản trị viên
 */
const AdminLicenses: React.FC = () => {
  // State quản lý ẩn/hiện popup Modal dùng để kích hoạt tên miền mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Khởi tạo đối tượng form của Antd để có thể can thiệp dữ liệu nhập và reset form dễ dàng
  const [form] = Form.useForm();

  // Đọc và quản lý trạng thái đăng nhập admin từ localStorage
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  // Truy vấn danh sách license thời gian thực thông qua Custom Hook tự sinh của RTK Query.
  // data: Danh sách license trả về từ server, mặc định là mảng rỗng [] nếu chưa có dữ liệu.
  // isLoading: Trạng thái đang tải dữ liệu từ API.
  // error: Chứa thông tin lỗi nếu cuộc gọi API thất bại.
  const { data: licenses = [], isLoading, error } = useGetLicensesQuery();

  // Đăng ký các mutation hooks để ghi/sửa dữ liệu:
  // activateLicense: Hàm gửi request kích hoạt domain lên Supabase.
  // isActivating: Biến boolean biểu diễn trạng thái đang xử lý kích hoạt để hiển thị nút Loading.
  const [activateLicense, { isLoading: isActivating }] = useActivateLicenseMutation();
  // deactivateLicense: Hàm gửi request gỡ kết nối domain khỏi key bản quyền.
  const [deactivateLicense, { isLoading: isDeactivating }] = useDeactivateLicenseMutation();

  /**
   * Xử lý đăng nhập bằng tài khoản admin cứng
   */
  const handleLoginSubmit = (values: Record<string, string>) => {
    if (values.username === 'admin' && values.password === 'abc123') {
      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      // Phát đi sự kiện toàn cục để Header (App.tsx) nhận biết được và hiển thị các menu admin
      window.dispatchEvent(new Event('admin-login-change'));
      message.success('Đăng nhập thành công với quyền Quản trị viên!');
    } else {
      message.error('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  /**
   * Xử lý đăng xuất tài khoản quản trị
   */
  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    // Phát đi sự kiện toàn cục để Header ẩn các menu admin đi ngay lập tức
    window.dispatchEvent(new Event('admin-login-change'));
    message.success('Đã đăng xuất tài khoản quản trị!');
  };

  /**
   * Hàm tiện ích hỗ trợ sao chép key bản quyền vào khay nhớ tạm (Clipboard) của máy tính
   */
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép key bản quyền!');
  };

  /**
   * Gửi yêu cầu ngắt kết nối domain của key bản quyền
   */
  const handleDeactivate = async (licenseKey: string) => {
    try {
      // unwrap() giúp trích xuất kết quả thực tế hoặc ném ra lỗi trực tiếp từ Promise để khối catch có thể xử lý
      await deactivateLicense({ licenseKey }).unwrap();
      message.warning('Đã ngắt kết nối domain thành công.');
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'data' in err
        ? (err as { data: { error: string } }).data?.error
        : 'Ngắt kết nối thất bại.';
      message.error(errorMsg);
    }
  };

  /**
   * Gửi yêu cầu kích hoạt một domain mới liên kết với key bản quyền
   */
  const handleActivateConnection = async (values: ActivateFormValues) => {
    try {
      await activateLicense({ licenseKey: values.licenseKey, domain: values.domain }).unwrap();
      setIsModalOpen(false); // Đóng modal kích hoạt
      form.resetFields();    // Reset sạch các trường nhập liệu của Form
      message.success(`Kích hoạt thành công theme cho domain ${values.domain}!`);
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'data' in err
        ? (err as { data: { error: string } }).data?.error
        : 'Kích hoạt key bản quyền thất bại.';
      message.error(errorMsg);
    }
  };

  // Cấu hình các cột (columns) hiển thị dữ liệu của thẻ bảng (Table) Ant Design
  const columns = [
    {
      title: 'Tên Theme',
      dataIndex: 'themeName',
      key: 'themeName',
      // In đậm tên theme để tăng tính nổi bật
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
          {/* Nút bấm sao chép nhanh key */}
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
      // Định dạng nghiêng và đổi màu xám nếu chưa kết nối website nào
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
      // Hiển thị nhãn Tag màu sắc tương ứng theo từng trạng thái của key bản quyền
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
      // Chuyển đổi hiển thị định dạng ngày chuẩn Việt Nam DD/MM/YYYY
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
      // Chuyển đổi hiển thị định dạng ngày chuẩn Việt Nam DD/MM/YYYY
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
      // Nút ngắt kết nối domain hoặc kích hoạt tùy theo trạng thái hiện tại của key
      render: (_: unknown, record: UserLicense) => (
        <Space size="middle">
          {record.status === 'active' ? (
            // Popconfirm yêu cầu xác nhận trước khi thực hiện thao tác xóa nhạy cảm
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
                // Điền trước key bản quyền vào trường nhập liệu của Form
                form.setFieldsValue({ licenseKey: record.licenseKey });
                setIsModalOpen(true); // Mở Modal
              }}
            >
              Kích hoạt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Tính số lượng key đang kích hoạt để làm số liệu thống kê
  const activeCount = licenses.filter(l => l.status === 'active').length;

  /**
   * GIAO DIỆN 1: Nếu chưa đăng nhập quyền quản trị viên, render Form Đăng Nhập
   */
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '75vh',
        background: 'transparent'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            borderRadius: '24px', 
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}>
              <LockOutlined style={{ color: '#fff', fontSize: '24px' }} />
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Đăng Nhập Quản Trị</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Vui lòng đăng nhập để quản lý license</Text>
          </div>

          {/* Form đăng nhập quản trị */}
          <Form
            name="admin_login"
            layout="vertical"
            onFinish={handleLoginSubmit}
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản!' }]}
            >
              <Input 
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Tài khoản (admin)" 
                style={{ height: '40px', borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Mật khẩu (abc123)" 
                style={{ height: '40px', borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                style={{ height: '40px', borderRadius: '8px', fontWeight: 600, background: '#6366f1', marginTop: '8px' }}
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }

  /**
   * GIAO DIỆN 2: Giao diện quản lý license sau khi đã xác thực admin thành công
   */
  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header đề mục trang */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', marginTop: '10px', width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Quản Lý Key Bản Quyền & Theme Đã Bán
          </Title>
          <Text type="secondary">
            Kích hoạt domain, kiểm tra trạng thái active và quản lý bản quyền các theme WordPress đã bán cho khách hàng.
          </Text>
        </div>
        <Button
          type="default"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ borderRadius: '8px', fontWeight: 600 }}
        >
          Đăng xuất
        </Button>
      </div>

      {/* Hàng thẻ thống kê chỉ số (Metrics cards) */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <Spin tip="Đang tải dữ liệu báo cáo..." />
        </div>
      ) : (
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Statistic
                title="Tổng Key Bản Quyền"
                value={licenses.length}
                prefix={<SafetyOutlined style={{ color: '#6366f1' }} />}
                valueStyle={{ fontWeight: 800, color: '#1e293b' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <Statistic
                title="Website Đang Hoạt Động"
                value={activeCount}
                prefix={<LaptopOutlined style={{ color: '#10b981' }} />}
                valueStyle={{ fontWeight: 800, color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} className="glass-panel" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
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

      {/* Thẻ chứa Bảng danh sách License */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ fontWeight: 700, fontSize: '18px' }}>Danh sách Key Bản Quyền của Khách hàng</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading || error !== undefined}
              style={{ borderRadius: '8px', fontWeight: 600, background: '#6366f1' }}
            >
              Kích Hoạt Domain Mới
            </Button>
          </div>
        }
        bordered={false}
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          borderRadius: '16px',
        }}
      >
        <Table
          columns={columns}
          // Ánh xạ id làm thuộc tính key bắt buộc cho mỗi dòng dữ liệu của bảng
          dataSource={licenses.map(lic => ({ ...lic, key: lic.id }))}
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: error ? 'Không thể kết nối đến máy chủ API.' : 'Không có key bản quyền nào.' }}
        />
      </Card>

      {/* Modal Popup để kích hoạt tên miền mới */}
      <Modal
        title={
          <Space>
            <KeyOutlined style={{ color: '#6366f1' }} />
            <span style={{ fontWeight: 700 }}>Kích Hoạt Theme Cho Website</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false); // Đóng modal
          form.resetFields();    // Reset form nhập liệu
        }}
        footer={null}
        destroyOnClose // Hủy toàn bộ DOM con trong modal sau khi đóng để tránh cache form cũ
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
              // Ràng buộc định dạng Regex kiểm tra tên miền hợp lệ (ví dụ: mydomain.com)
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

export default AdminLicenses;
