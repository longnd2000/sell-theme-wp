import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, List, Button, Typography, Space, Empty, Divider, Avatar, message } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, ArrowLeftOutlined, CreditCardOutlined, SafetyOutlined } from '@ant-design/icons';
import { RootState } from '../store';
import { removeFromCart } from '../store/themeSlice';

const { Title, Text, Paragraph } = Typography;

const Cart: React.FC = () => {
  const cart = useSelector((state: RootState) => state.themeUI.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemoveItem = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    message.warning(`Đã xóa ${name} khỏi giỏ hàng.`);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
          Giỏ Hàng Của Bạn
        </Title>
        <Text type="secondary">
          Xem lại danh sách theme bạn đã chọn trước khi tiến hành thanh toán bản quyền.
        </Text>
      </div>

      {cart.length > 0 ? (
        <Row gutter={[32, 32]}>
          {/* Left: Cart Items List */}
          <Col xs={24} lg={16}>
            <Card bordered={false} className="glass-panel" style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <List
                itemLayout="horizontal"
                dataSource={cart}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveItem(item.id, item.name)}
                      >
                        Xóa
                      </Button>
                    ]}
                    style={{ padding: '20px 0' }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.image}
                          shape="square"
                          size={64}
                          style={{ borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}
                        />
                      }
                      title={
                        <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>
                          {item.name}
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">Bản quyền sử dụng trọn đời cho 1 domain</Text>
                          <Text strong style={{ color: '#6366f1' }}>{item.price.toLocaleString('vi-VN')} đ</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ textAlign: 'left', marginTop: '16px' }}>
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/themes')}
                  style={{ display: 'inline-flex', alignItems: 'center', paddingLeft: 0 }}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </Card>
          </Col>

          {/* Right: Order Summary */}
          <Col xs={24} lg={8}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)',
                background: '#fff',
              }}
            >
              <Title level={4} style={{ fontWeight: 700, margin: '0 0 20px 0' }}>Tóm tắt đơn hàng</Title>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Số lượng sản phẩm</Text>
                  <Text strong>{cart.length} theme</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Tạm tính</Text>
                  <Text strong>{totalPrice.toLocaleString('vi-VN')} đ</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">Thuế (VAT)</Text>
                  <Text strong>0 đ</Text>
                </div>
                
                <Divider style={{ margin: '12px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ fontSize: '16px' }}>Tổng thanh toán</Text>
                  <Title level={3} style={{ margin: 0, color: '#6366f1', fontWeight: 800 }}>
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </Title>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                icon={<CreditCardOutlined />}
                onClick={() => navigate('/checkout')}
                style={{ height: '48px', fontSize: '16px', fontWeight: 600, marginTop: '24px' }}
              >
                Tiến Hành Thanh Toán
              </Button>

              <div style={{ marginTop: '20px', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                <Space>
                  <SafetyOutlined style={{ color: '#10b981' }} />
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>Bảo mật & Kích hoạt bản quyền tức thì</Text>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card bordered={false} className="glass-panel" style={{ borderRadius: '20px', padding: '60px 0', textAlign: 'center' }}>
          <Empty
            image={<ShoppingCartOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            description="Giỏ hàng của bạn đang trống."
          >
            <Button type="primary" onClick={() => navigate('/themes')} size="large" icon={<ArrowLeftOutlined />}>
              Quay lại cửa hàng
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default Cart;
