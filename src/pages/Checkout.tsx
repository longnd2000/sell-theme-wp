import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Form, Input, Radio, Button, Typography, Space, Divider, Alert, Result, Table, message } from 'antd';
import { CheckCircleOutlined, KeyOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, CopyOutlined, WalletOutlined, BankOutlined } from '@ant-design/icons';
import { RootState } from '../store';
import { clearCart } from '../store/themeSlice';
import { usePurchaseThemesMutation, UserLicense } from '../store/themeApi';

const { Title, Text, Paragraph } = Typography;

const Checkout: React.FC = () => {
  const cart = useSelector((state: RootState) => state.themeUI.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'momo'>('bank');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedLicenses, setPurchasedLicenses] = useState<UserLicense[]>([]);

  // RTK Query Mutation
  const [purchaseThemes, { isLoading }] = usePurchaseThemesMutation();

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePlaceOrder = async (values: { fullName: string; email: string; phone: string }) => {
    if (cart.length === 0) {
      message.error('Giỏ hàng trống!');
      return;
    }

    try {
      const payload = cart.map(item => ({ id: item.id, name: item.name }));
      const response = await purchaseThemes({ themes: payload }).unwrap();
      
      if (response.success) {
        setPurchasedLicenses(response.licenses);
        setPurchaseSuccess(true);
        dispatch(clearCart()); // Clear Redux shopping cart
        message.success('Thanh toán thành công! Bản quyền đã được lưu vào hệ thống.');
      }
    } catch (err: any) {
      message.error(err?.data?.error || 'Gặp lỗi trong quá trình xử lý đơn hàng.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép key bản quyền!');
  };

  // Success view after checkout
  if (purchaseSuccess) {
    return (
      <div style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '60px' }}>
        <Card bordered={false} style={{ borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', padding: '24px' }}>
          <Result
            status="success"
            title="Thanh Toán Thành Công!"
            subTitle="Cảm ơn bạn đã mua hàng. Key bản quyền của bạn đã được khởi tạo tự động."
            extra={[
              <Button type="primary" size="large" onClick={() => navigate('/admin/licenses')} key="dashboard" icon={<SafetyCertificateOutlined />}>
                Đến Quản Lý Bản Quyền
              </Button>,
              <Button size="large" onClick={() => navigate('/')} key="market">
                Tiếp Tục Mua Sắm
              </Button>,
            ]}
          />

          <Divider />

          <Title level={4} style={{ fontWeight: 700, marginBottom: '16px' }}>
            <KeyOutlined style={{ marginRight: '8px', color: '#6366f1' }} />
            Danh Sách Key Bản Quyền Mới
          </Title>

          <Table
            dataSource={purchasedLicenses.map(lic => ({ ...lic, key: lic.id }))}
            pagination={false}
            columns={[
              {
                title: 'Theme',
                dataIndex: 'themeName',
                key: 'themeName',
                render: (text) => <Text strong>{text}</Text>
              },
              {
                title: 'Key Bản Quyền',
                dataIndex: 'licenseKey',
                key: 'licenseKey',
                render: (key) => (
                  <Space>
                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {key}
                    </code>
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<CopyOutlined />} 
                      onClick={() => copyToClipboard(key)}
                    />
                  </Space>
                )
              },
              {
                title: 'Hạn Sử Dụng',
                dataIndex: 'expiresAt',
                key: 'expiresAt',
                render: (val: string) => {
                  const parts = val.split('-');
                  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
                  return val;
                }
              }
            ]}
          />
        </Card>
      </div>
    );
  }

  // Guard: Redirect to homepage if no items in cart
  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Result
          status="warning"
          title="Không Có Sản Phẩm Trong Giỏ Hàng"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Quay Lại Cửa Hàng
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
          Thanh Toán Đơn Hàng
        </Title>
        <Text type="secondary">
          Vui lòng hoàn thành thông tin người mua và thực hiện chuyển khoản để kích hoạt key bản quyền.
        </Text>
      </div>

      <Row gutter={[32, 32]}>
        {/* Left Side: Form & Payment Instructions */}
        <Col xs={24} lg={14}>
          <Card bordered={false} className="glass-panel" style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '12px' }}>
            <Form form={form} layout="vertical" onFinish={handlePlaceOrder}>
              <Title level={4} style={{ fontWeight: 700, marginBottom: '20px' }}>1. Thông tin người mua</Title>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="fullName"
                    label="Họ và Tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn!' }]}
                  >
                    <Input placeholder="Nguyễn Văn A" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="email"
                    label="Địa chỉ Email (Nhận key bản quyền)"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email!' },
                      { type: 'email', message: 'Địa chỉ email không hợp lệ!' }
                    ]}
                  >
                    <Input placeholder="email@gmail.com" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                  >
                    <Input placeholder="0901234567" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider style={{ margin: '24px 0' }} />

              <Title level={4} style={{ fontWeight: 700, marginBottom: '20px' }}>2. Phương thức thanh toán</Title>
              <Form.Item name="paymentMethod" initialValue="bank">
                <Radio.Group 
                  onChange={(e) => setPaymentMethod(e.target.value)} 
                  value={paymentMethod}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Radio.Button 
                      value="bank" 
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        border: paymentMethod === 'bank' ? '2px solid #6366f1' : '1px solid #d9d9d9',
                        boxShadow: 'none'
                      }}
                    >
                      <BankOutlined style={{ fontSize: '20px', color: '#6366f1' }} />
                      <div style={{ textAlign: 'left' }}>
                        <Text strong style={{ display: 'block' }}>Chuyển khoản ngân hàng 24/7 (VietQR)</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Quét mã QR để chuyển khoản nhanh, kích hoạt key sau 1 phút.</Text>
                      </div>
                    </Radio.Button>

                    <Radio.Button 
                      value="momo"
                      style={{ 
                        width: '100%', 
                        height: 'auto', 
                        padding: '16px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        border: paymentMethod === 'momo' ? '2px solid #6366f1' : '1px solid #d9d9d9',
                        boxShadow: 'none'
                      }}
                    >
                      <WalletOutlined style={{ fontSize: '20px', color: '#a23f8f' }} />
                      <div style={{ textAlign: 'left' }}>
                        <Text strong style={{ display: 'block' }}>Thanh toán qua Ví MoMo</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Chuyển khoản trực tiếp sang ví điện tử MoMo.</Text>
                      </div>
                    </Radio.Button>
                  </Space>
                </Radio.Group>
              </Form.Item>

              {/* Payment details box based on selection */}
              {paymentMethod === 'bank' ? (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)', marginTop: '20px' }}>
                  <Row gutter={16} align="middle">
                    <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                      {/* Premium VietQR Mock */}
                      <div style={{ background: '#fff', padding: '8px', borderRadius: '8px', display: 'inline-block', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <img 
                          src="https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=WPHubTransferMock"
                          alt="VietQR Mock"
                          style={{ width: '120px', height: '120px' }}
                        />
                      </div>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Title level={5} style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Thông tin chuyển khoản</Title>
                      <Paragraph style={{ margin: 0, fontSize: '14px', lineHeight: 1.8 }}>
                        Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong><br />
                        Số tài khoản: <strong>090123456789</strong><br />
                        Chủ tài khoản: <strong>CONG TY CỔ PHẦN WPHUB VN</strong><br />
                        Số tiền chuyển: <strong style={{ color: '#6366f1' }}>{totalPrice.toLocaleString('vi-VN')} đ</strong><br />
                        Nội dung chuyển: <strong>WPHUB ORDER {Math.floor(1000 + Math.random() * 9000)}</strong>
                      </Paragraph>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div style={{ background: '#fff0f6', padding: '20px', borderRadius: '12px', border: '1px solid #ffd8e6', marginTop: '20px' }}>
                  <Title level={5} style={{ margin: '0 0 8px 0', color: '#a23f8f' }}>Hướng dẫn ví MoMo</Title>
                  <Paragraph style={{ margin: 0, fontSize: '14px' }}>
                    Vui lòng gửi số tiền <strong style={{ color: '#a23f8f' }}>{totalPrice.toLocaleString('vi-VN')} đ</strong> đến số điện thoại MoMo: <strong>0901234567</strong> (Chủ tài khoản: NGUYEN VAN A). <br />
                    Nội dung chuyển khoản ghi rõ: <strong>WPHUB {Math.floor(1000 + Math.random() * 9000)}</strong>.
                  </Paragraph>
                </div>
              )}

              <Form.Item style={{ marginTop: '28px', marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  icon={<CheckCircleOutlined />}
                  loading={isLoading}
                  style={{ height: '48px', fontSize: '16px', fontWeight: 600 }}
                >
                  Xác Nhận Đã Thanh Toán
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Side: Order Summary */}
        <Col xs={24} lg={10}>
          <Card 
            bordered={false} 
            style={{ 
              borderRadius: '20px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.05)',
              background: '#fff'
            }}
          >
            <Title level={4} style={{ fontWeight: 700, marginBottom: '20px' }}>Tóm tắt đơn hàng</Title>
            
            <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Space size={12}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }} 
                    />
                    <div>
                      <Text strong style={{ display: 'block', fontSize: '14px', maxWidth: '200px' }} ellipsis>{item.name}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>1 License Key</Text>
                    </div>
                  </Space>
                  <Text strong>{item.price.toLocaleString('vi-VN')} đ</Text>
                </div>
              ))}
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text type="secondary">Tạm tính</Text>
              <Text strong>{totalPrice.toLocaleString('vi-VN')} đ</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <Text type="secondary">Khuyến mãi / Giảm giá</Text>
              <Text strong style={{ color: '#52c41a' }}>-0 đ</Text>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Text strong style={{ fontSize: '16px' }}>Tổng thanh toán</Text>
              <Title level={3} style={{ margin: 0, color: '#6366f1', fontWeight: 800 }}>
                {totalPrice.toLocaleString('vi-VN')} đ
              </Title>
            </div>

            <Alert
              message="Chính sách bản quyền"
              description="Key bản quyền sẽ lập tức kích hoạt ở trạng thái 'Chưa dùng' (inactive) trong mục quản lý của bạn ngay sau khi hoàn thành thanh toán."
              type="info"
              showIcon
              style={{ borderRadius: '10px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Checkout;
