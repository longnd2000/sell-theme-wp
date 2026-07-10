import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Rate, Tag, Typography, Space, Spin, Breadcrumb, Divider, message } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, GlobalOutlined, CheckCircleOutlined, StarFilled, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useGetThemeDetailsQuery } from '../store/themeApi';
import { addToCart } from '../store/themeSlice';

const { Title, Text, Paragraph } = Typography;

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch theme details dynamically using RTK Query
  const { data: themeItem, isLoading, error } = useGetThemeDetailsQuery(id || '');

  const handleAddToCart = () => {
    if (themeItem) {
      dispatch(addToCart({ 
        id: themeItem.id, 
        name: themeItem.name, 
        price: themeItem.price, 
        image: themeItem.image 
      }));
      message.success(`Đã thêm ${themeItem.name} vào giỏ hàng thành công!`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 0' }}>
        <Spin size="large" tip="Đang tải chi tiết theme..." />
      </div>
    );
  }

  if (error || !themeItem) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Title level={4} danger>Không tìm thấy theme hoặc có lỗi kết nối.</Title>
        <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
          Quay lại Cửa Hàng
        </Button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Breadcrumb
          items={[
            { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Theme Market</span> },
            { title: themeItem.name }
          ]}
        />
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center' }}
        >
          Quay lại
        </Button>
      </div>

      {/* Main Detail Grid */}
      <Row gutter={[32, 32]}>
        {/* Left Content Column */}
        <Col xs={24} lg={16}>
          <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
            <div style={{ height: '400px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={themeItem.image} 
                alt={themeItem.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                  Phiên bản {themeItem.version}
                </Tag>
              </div>
            </div>

            <div style={{ padding: '32px' }}>
              <Title level={2} style={{ margin: '0 0 16px 0', fontWeight: 800, color: '#1e293b' }}>
                {themeItem.name}
              </Title>
              
              <Space wrap size={8} style={{ marginBottom: '24px' }}>
                {themeItem.tags.map(t => (
                  <Tag color="blue" key={t} style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '6px' }}>
                    {t}
                  </Tag>
                ))}
              </Space>

              <Divider style={{ margin: '24px 0' }} />

              <Title level={4} style={{ fontWeight: 700, color: '#0f172a' }}>Giới thiệu Chi Tiết</Title>
              <Paragraph style={{ color: '#475569', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
                {themeItem.description}
              </Paragraph>

              <Divider style={{ margin: '24px 0' }} />

              <Title level={4} style={{ fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Tính Năng Kỹ Thuật Nổi Bật</Title>
              <Row gutter={[16, 16]}>
                {themeItem.features.map((feat, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px', marginTop: '4px' }} />
                      <Text style={{ color: '#334155', fontSize: '14px' }}>{feat}</Text>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </Col>

        {/* Right Sidebar Purchase Column */}
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: '88px' }}>
            <Card 
              bordered={false} 
              style={{ 
                borderRadius: '20px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '0.1em' }}>GIÁ KHỞI TẠO LICENSE</Text>
                <Title level={1} style={{ margin: '8px 0 0 0', color: '#6366f1', fontWeight: 800, fontSize: '32px' }}>
                  {themeItem.price.toLocaleString('vi-VN')} đ
                </Title>
              </div>

              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
                  onClick={handleAddToCart}
                  style={{ height: '48px', fontSize: '16px', fontWeight: 600 }}
                >
                  Mua Theme Ngay
                </Button>

                {themeItem.demoUrl && (
                  <Button 
                    size="large" 
                    block 
                    icon={<GlobalOutlined />}
                    href={themeItem.demoUrl}
                    target="_blank"
                    style={{ height: '48px', fontSize: '15px' }}
                  >
                    Xem Bản Demo Live
                  </Button>
                )}
              </Space>

              <Divider style={{ margin: '24px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary"><Space><SafetyCertificateOutlined /> Phiên bản hiện tại</Space></Text>
                  <Text strong>{themeItem.version}</Text>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary"><Space><DownloadOutlined /> Tổng lượt tải về</Space></Text>
                  <Text strong>{themeItem.downloads.toLocaleString()} lượt</Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary"><Space><StarFilled style={{ color: '#fadb14' }} /> Điểm đánh giá</Space></Text>
                  <span style={{ fontWeight: 700 }}>{themeItem.rating} / 5</span>
                </div>
              </div>

              <Divider style={{ margin: '24px 0 12px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  * Bao gồm 12 tháng hỗ trợ và nâng cấp miễn phí
                </Text>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ThemeDetail;
