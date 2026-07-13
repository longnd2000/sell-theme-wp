import React, { useState } from 'react';
import { Table, Button, Space, Typography, Card, Tag, Drawer, Form, Input, InputNumber, Select, Popconfirm, message, Image, Row, Col, AutoComplete } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileTextOutlined, 
  StarFilled, 
  DownloadOutlined, 
  LockOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';
import { 
  useGetThemesQuery, 
  useCreateThemeMutation, 
  useUpdateThemeMutation, 
  useDeleteThemeMutation, 
  ThemeItem 
} from '../store/themeApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminThemes: React.FC = () => {
  const { data: themes = [], isLoading, error } = useGetThemesQuery();
  const [createTheme, { isLoading: isCreating }] = useCreateThemeMutation();
  const [updateTheme, { isLoading: isUpdating }] = useUpdateThemeMutation();
  const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeItem | null>(null);
  const [form] = Form.useForm();

  // Quản lý trạng thái Đăng nhập (Lưu vào localStorage để duy trì trạng thái khi refresh)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  const handleLoginSubmit = (values: any) => {
    if (values.username === 'admin' && values.password === 'abc123') {
      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('admin-login-change'));
      message.success('Đăng nhập thành công với quyền Quản trị viên!');
    } else {
      message.error('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('admin-login-change'));
    message.success('Đã đăng xuất tài khoản quản trị!');
  };

  // Mở Drawer để thêm mới
  const handleAddClick = () => {
    setEditingTheme(null);
    form.resetFields();
    setDrawerVisible(true);
  };

  // Mở Drawer để cập nhật
  const handleEditClick = (theme: ThemeItem) => {
    setEditingTheme(theme);
    form.setFieldsValue({
      name: theme.name,
      version: theme.version,
      description: theme.description,
      price: theme.price,
      image: theme.image,
      demoUrl: theme.demoUrl,
      tags: theme.tags,
      features: theme.features,
    });
    setDrawerVisible(true);
  };

  // Xác nhận Xóa theme
  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteTheme(id).unwrap();
      message.success('Đã xóa theme thành công!');
    } catch (err: any) {
      message.error(err?.error || 'Xảy ra lỗi khi xóa theme.');
    }
  };

  // Submit Form (Thêm/Sửa)
  const handleFormSubmit = async (values: any) => {
    try {
      const themeData = {
        name: values.name,
        version: values.version,
        description: values.description || '',
        price: Number(values.price),
        image: values.image || '',
        demoUrl: values.demoUrl || '',
        tags: values.tags || [],
        features: values.features || [],
      };

      if (editingTheme) {
        // Cập nhật
        await updateTheme({ id: editingTheme.id, ...themeData }).unwrap();
        message.success('Cập nhật thông tin theme thành công!');
      } else {
        // Thêm mới
        await createTheme(themeData).unwrap();
        message.success('Thêm mới theme thành công!');
      }
      setDrawerVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.error || 'Lưu thông tin theme thất bại.');
    }
  };

  // Cấu hình các cột của bảng danh sách
  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      key: 'image',
      width: '100px',
      render: (imgUrl: string, record: ThemeItem) => (
        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imgUrl ? (
            <Image src={imgUrl} alt={record.name} width={60} height={60} style={{ objectFit: 'cover' }} />
          ) : (
            <FileTextOutlined style={{ fontSize: '20px', color: '#94a3b8' }} />
          )}
        </div>
      )
    },
    {
      title: 'Tên Theme',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ThemeItem) => (
        <div>
          <Text strong style={{ fontSize: '14.5px', color: '#1e293b', display: 'block' }}>{name}</Text>
          <Space size={4} style={{ marginTop: '4px' }}>
            {record.tags.map(tag => (
              <Tag key={tag} color="blue" style={{ fontSize: '11px', borderRadius: '4px' }}>{tag}</Tag>
            ))}
          </Space>
        </div>
      )
    },
    {
      title: 'Phiên bản',
      dataIndex: 'version',
      key: 'version',
      width: '100px',
      render: (ver: string) => <Tag color="purple">v{ver}</Tag>
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      width: '140px',
      render: (price: number) => <Text strong style={{ color: '#ef4444' }}>{price.toLocaleString('vi-VN')} đ</Text>
    },
    {
      title: 'Đánh giá & Tải',
      key: 'stats',
      width: '150px',
      render: (record: ThemeItem) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: '12px' }}><StarFilled style={{ color: '#f59e0b', marginRight: '4px' }} />{record.rating} / 5</Text>
          <Text style={{ fontSize: '12px' }} type="secondary"><DownloadOutlined style={{ marginRight: '4px' }} />{record.downloads} lượt</Text>
        </Space>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '150px',
      render: (record: ThemeItem) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#6366f1' }} />} 
            onClick={() => handleEditClick(record)} 
            style={{ borderRadius: '6px' }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa theme"
            description="Bạn có chắc chắn muốn xóa theme này khỏi danh sách đang bán không? Hành động này không thể hoàn tác."
            onConfirm={() => handleDeleteConfirm(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              style={{ borderRadius: '6px' }}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Giao diện Đăng nhập nếu chưa đăng nhập
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
            <Text type="secondary" style={{ fontSize: '13px' }}>Vui lòng đăng nhập để quản lý danh sách theme</Text>
          </div>

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

  // Giao diện chính của Quản trị Theme khi đã đăng nhập
  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', marginTop: '10px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>Quản Lý Danh Sách Theme Bán</Title>
          <Paragraph type="secondary" style={{ margin: '6px 0 0 0' }}>
            Thêm mới, sửa đổi thông tin hoặc xóa các template, giao diện WordPress đang trưng bày trên cửa hàng.
          </Paragraph>
        </div>
        <Space>
          <Button 
            type="default"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ height: '40px', borderRadius: '8px', fontWeight: 600 }}
          >
            Đăng xuất
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddClick} 
            style={{ height: '40px', borderRadius: '8px', fontWeight: 600, background: '#6366f1' }}
          >
            Thêm Theme Mới
          </Button>
        </Space>
      </div>

      {/* Bảng danh sách */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: '24px', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.02)', border: '1px solid rgba(0,0,0,0.03)' }}
        styles={{ body: { padding: '12px' } }}
      >
        <Table 
          columns={columns} 
          dataSource={themes} 
          rowKey="id" 
          loading={isLoading || isDeleting} 
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: 'Chưa có theme nào trong cửa hàng.' }}
        />
      </Card>

      {/* Drawer Thêm / Sửa */}
      <Drawer
        title={<Title level={4} style={{ margin: 0, fontWeight: 700 }}>{editingTheme ? 'Cập Nhật Thông Tin Theme' : 'Thêm Theme Bán Mới'}</Title>}
        width={560}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        destroyOnHidden
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>Hủy</Button>
            <Button 
              type="primary" 
              onClick={() => form.submit()} 
              loading={isCreating || isUpdating}
              style={{ background: '#6366f1' }}
            >
              Lưu lại
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label={<Text strong>Tên Theme</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập tên theme' }]}
          >
            <Input placeholder="Ví dụ: WP E-Commerce Super Fast" style={{ borderRadius: '6px' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label={<Text strong>Giá bán (đ)</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn giá bán' }]}
              >
                <AutoComplete
                  style={{ width: '100%' }}
                  placeholder="Chọn mốc giá hoặc tự nhập..."
                  options={[
                    { value: '199000', label: '199.000 đ (199k)' },
                    { value: '299000', label: '299.000 đ (299k)' },
                    { value: '399000', label: '399.000 đ (399k)' },
                    { value: '499000', label: '499.000 đ (499k)' },
                    { value: '599000', label: '599.000 đ (599k)' },
                    { value: '699000', label: '699.000 đ (699k)' },
                    { value: '799000', label: '799.000 đ (799k)' },
                    { value: '899000', label: '899.000 đ (899k)' },
                    { value: '999000', label: '999.000 đ (999k)' },
                    { value: '1499000', label: '1.499.000 đ (1.49M)' },
                    { value: '1999000', label: '1.999.000 đ (1.99M)' },
                    { value: '2499000', label: '2.499.000 đ (2.49M)' },
                    { value: '2999000', label: '2.999.000 đ (2.99M)' },
                  ]}
                  filterOption={(inputValue, option) =>
                    (option?.label ?? '').toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 ||
                    (option?.value ?? '').toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="version"
                label={<Text strong>Phiên bản</Text>}
                rules={[{ required: true, message: 'Vui lòng nhập phiên bản' }]}
              >
                <Input placeholder="Ví dụ: 1.0.0" style={{ borderRadius: '6px' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image"
            label={<Text strong>Đường dẫn Ảnh đại diện (Image URL)</Text>}
            rules={[{ required: true, message: 'Vui lòng nhập đường dẫn ảnh' }]}
          >
            <Input placeholder="Nhập liên kết hình ảnh..." style={{ borderRadius: '6px' }} />
          </Form.Item>

          <Form.Item
            name="demoUrl"
            label={<Text strong>Đường dẫn Xem trước (Demo URL)</Text>}
          >
            <Input placeholder="Nhập liên kết demo (ví dụ: https://demo.wphub.vn/theme1)" style={{ borderRadius: '6px' }} />
          </Form.Item>

          <Form.Item
            name="tags"
            label={<Text strong>Nhãn phân loại (Tags)</Text>}
          >
            <Select 
              mode="tags" 
              style={{ width: '100%' }} 
              placeholder="Nhập nhãn và nhấn Enter (Ví dụ: E-Commerce, Blog, Landing Page...)" 
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="features"
            label={<Text strong>Tính năng nổi bật (Features)</Text>}
          >
            <Select 
              mode="tags" 
              style={{ width: '100%' }} 
              placeholder="Nhập tính năng và nhấn Enter (Ví dụ: Tối ưu điểm 100 GSI, Chuẩn Schema Product...)" 
              tokenSeparators={[',']}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<Text strong>Mô tả chi tiết</Text>}
          >
            <TextArea rows={4} placeholder="Nhập mô tả ngắn gọn về đặc điểm của theme..." style={{ borderRadius: '6px' }} />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminThemes;
