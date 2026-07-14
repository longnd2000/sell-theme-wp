import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Rate, Tag, Typography, Space, Spin, Breadcrumb, Divider, message, Modal } from 'antd';
import { ArrowLeftOutlined, ShoppingCartOutlined, GlobalOutlined, CheckCircleOutlined, StarFilled, DownloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useGetThemeDetailsQuery } from '../store/themeApi';
import { addToCart } from '../store/themeSlice';

const { Title, Text, Paragraph } = Typography;

const ThemeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

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
        <Spin size="large">
          <div style={{ marginTop: '16px', color: '#6366f1', fontWeight: 600 }}>Đang tải chi tiết theme...</div>
        </Spin>
      </div>
    );
  }

  if (error || !themeItem) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Title level={4} danger>Không tìm thấy theme hoặc có lỗi kết nối.</Title>
        <Button type="primary" onClick={() => navigate('/themes')} style={{ marginTop: '16px' }}>
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
            { title: <span style={{ cursor: 'pointer' }} onClick={() => navigate('/themes')}>Theme Market</span> },
            { title: themeItem.name }
          ]}
        />
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/themes')}
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
              {themeItem.version && (
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <Tag color="purple" style={{ fontSize: '14px', padding: '4px 12px', borderRadius: '6px', fontWeight: 600 }}>
                    Phiên bản {themeItem.version}
                  </Tag>
                </div>
              )}
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
              <div 
                dangerouslySetInnerHTML={{ __html: themeItem.description }}
                style={{ 
                  color: '#475569', 
                  fontSize: '15px', 
                  lineHeight: 1.7, 
                  marginBottom: '24px' 
                }}
                className="wp-content-introduction"
              />

              {themeItem.features && themeItem.features.length > 0 && (
                <>
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
                </>
              )}

              {themeItem.activeProjects && (
                <>
                  <Divider style={{ margin: '24px 0' }} />
                  <Title level={4} style={{ fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Các Dự Án Thực Tế Đang Sử Dụng</Title>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }}></span>
                    <a 
                      href={themeItem.activeProjects} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: '#6366f1', 
                        fontWeight: 600, 
                        fontSize: '14px', 
                        textDecoration: 'underline' 
                      }}
                    >
                      {themeItem.activeProjects}
                    </a>
                  </div>
                </>
              )}

              {themeItem.previewImage && (
                <>
                  <Divider style={{ margin: '24px 0' }} />
                  <div style={{ 
                    background: '#f8fafc', 
                    border: '1px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    padding: '24px', 
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.01)' 
                  }}>
                    <Title level={4} style={{ fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Giao Diện Trang Chủ Bản Thiết Kế</Title>
                    <Paragraph style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                      Nhấn vào nút bên dưới để mở toàn bộ ảnh chụp giao diện trang chủ dài của theme này.
                    </Paragraph>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<GlobalOutlined />} 
                      onClick={() => setIsPreviewOpen(true)}
                      style={{ background: '#6366f1', borderColor: '#6366f1', fontWeight: 600, borderRadius: '8px' }}
                    >
                      Xem Ảnh Chụp Trang Chủ
                    </Button>
                  </div>

                  {/* Modal Popup Xem ảnh chụp trang chủ lớn */}
                  <Modal
                    title={
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                        Ảnh chụp giao diện trang chủ: {themeItem.name}
                      </span>
                    }
                    open={isPreviewOpen}
                    onCancel={() => setIsPreviewOpen(false)}
                    footer={null}
                    width={1100}
                    centered
                    styles={{ body: { padding: 0 } }}
                  >
                    <div style={{ maxHeight: '75vh', overflowY: 'auto', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
                      <img 
                        src={themeItem.previewImage} 
                        alt={`Preview Full ${themeItem.name}`} 
                        style={{ 
                          width: '100%', 
                          height: 'auto', 
                          display: 'inline-block', 
                          borderRadius: '8px', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      />
                    </div>
                  </Modal>
                </>
              )}
            </div>
          </div>
        </Col>

        {/* Right Sidebar Purchase Column */}
        <Col xs={24} lg={8}>
          <div style={{ position: 'sticky', top: '88px' }}>
            <Card 
              variant="borderless" 
              style={{ 
                borderRadius: '20px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'uppercase', tracking: '0.1em' }}>GIÁ KHỞI TẠO WEBSITE</Text>
                {themeItem.originalPrice && themeItem.originalPrice > themeItem.price ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                    <Text delete type="secondary" style={{ fontSize: '16px' }}>
                      {themeItem.originalPrice.toLocaleString('vi-VN')} đ
                    </Text>
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '12px', background: '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>
                      Khuyến mãi
                    </span>
                  </div>
                ) : null}
                <Title level={1} style={{ margin: '8px 0 0 0', color: '#6366f1', fontWeight: 800, fontSize: '32px' }}>
                  {themeItem.price.toLocaleString('vi-VN')} đ
                </Title>
                {themeItem.servicePackage && (
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '13px' }}>Gói dịch vụ áp dụng: </Text>
                    <Tag 
                      color={
                        themeItem.servicePackage === 'premium' ? 'gold' :
                        themeItem.servicePackage === 'store' ? 'volcano' :
                        themeItem.servicePackage === 'basic' ? 'green' :
                        themeItem.servicePackage === 'clone' ? 'purple' : 'blue'
                      } 
                      style={{ fontWeight: 600, fontSize: '12px', padding: '2px 8px', borderRadius: '4px' }}
                    >
                      {
                        themeItem.servicePackage === 'landing' ? 'Gói Landing Page' :
                        themeItem.servicePackage === 'clone' ? 'Gói Clone & Vibe' :
                        themeItem.servicePackage === 'basic' ? 'Gói Cơ Bản' :
                        themeItem.servicePackage === 'store' ? 'Gói Bán Hàng' :
                        themeItem.servicePackage === 'premium' ? 'Gói Cao Cấp' : 'Gói Landing Page'
                      }
                    </Tag>
                    {themeItem.servicePrice ? (
                      <div style={{ marginTop: '10px', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>Phí dịch vụ trọn gói:</Text>
                        <Text strong style={{ color: '#10b981', fontSize: '15px' }}>
                          + {themeItem.servicePrice.toLocaleString('vi-VN')} đ
                        </Text>
                      </div>
                    ) : null}
                  </div>
                )}
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: '16px', marginTop: '3px' }} />
                  <div>
                    <Text strong style={{ fontSize: '13px', display: 'block', color: '#1e293b' }}>Cam kết bản quyền 100%</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Mã nguồn sạch, tuyệt đối không chứa mã độc hoặc nulled.</Text>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <CheckCircleOutlined style={{ color: '#10b981', fontSize: '16px', marginTop: '3px' }} />
                  <div>
                    <Text strong style={{ fontSize: '13px', display: 'block', color: '#1e293b' }}>Tối ưu SEO & Tốc độ</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Giao diện nhẹ, load cực nhanh, đạt chuẩn Core Web Vitals của Google.</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <GlobalOutlined style={{ color: '#10b981', fontSize: '16px', marginTop: '3px' }} />
                  <div>
                    <Text strong style={{ fontSize: '13px', display: 'block', color: '#1e293b' }}>Hỗ trợ setup nhanh chóng</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Đội ngũ kỹ thuật hỗ trợ cài đặt giống 100% bản demo hoàn toàn miễn phí.</Text>
                  </div>
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
