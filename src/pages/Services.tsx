import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography, Space, Divider, Modal } from 'antd';
import { 
  CheckOutlined, 
  ThunderboltOutlined, 
  FireOutlined, 
  CrownOutlined, 
  MessageOutlined, 
  PhoneOutlined,
  CheckCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PricingPlan {
  title: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  features: string[];
  isPopular?: boolean;
  color: string;
}

const getCommitments = (
  deliveryTime: string, 
  hostingDesc: string, 
  editorDesc: string = 'Giao diện chỉnh sửa trực quan (Sử dụng Elementor)',
  hasGsiGuarantee: boolean = true
) => {
  const commitments = [
    `FREE Tên miền & Hosting ${hostingDesc} (12 tháng, hỗ trợ đuôi .com/.org/.info/.top)`,
    'Hỗ trợ dựng và quản lý tài nguyên',
    'Bảo hành 12 tháng (FREE fix tất cả lỗi do code mình gây ra)',
    `Thời gian hoàn thành (Bàn giao sau ${deliveryTime})`,
    'Hỗ trợ cập nhật và chỉnh sửa thông tin',
    editorDesc,
    'Tư vấn nhiệt tình (Đồng hành hỗ trợ 24/7)',
    'FREE gói cấu hình bảo mật website',
  ];
  if (hasGsiGuarantee) {
    commitments.push('FREE gói tối ưu điểm PageSpeed Insights (GSI > 80)');
  }
  return commitments;
};

const PLANS: PricingPlan[] = [
  {
    title: 'Gói Clone & Vibe',
    price: 1500000,
    description: 'Dành riêng cho đơn vị cần clone giao diện theo mẫu và ghép backend WordPress để khách tự nhập liệu dễ dàng.',
    icon: <CopyOutlined style={{ fontSize: '28px', color: '#8b5cf6' }} />,
    color: '#8b5cf6',
    features: [
      'Clone giao diện từ website mẫu yêu cầu',
      'Lập trình ghép Backend WordPress dễ nhập liệu',
      'Tương thích đa thiết bị',
      ...getCommitments('3 - 5 ngày', 'cơ bản 1G', 'Giao diện nhập liệu trực quan', false)
    ],
  },
  {
    title: 'Gói Cơ Bản',
    price: 2000000,
    description: 'Phù hợp cho các dự án giới thiệu cá nhân, shop nhỏ hoặc landing page giới thiệu sản phẩm đơn giản.',
    icon: <ThunderboltOutlined style={{ fontSize: '28px', color: '#10b981' }} />,
    color: '#10b981',
    features: [
      'Sử dụng giao diện theme WordPress có sẵn',
      'Cấu hình tối đa 5 trang nội dung',
      'Tương thích đa thiết bị',
      'Trang bài viết, sản phẩm & danh mục sử dụng template chuẩn SEO [Xem mẫu]',
      ...getCommitments('3 - 5 ngày', 'cơ bản 1G')
    ],
  },
  {
    title: 'Gói Phổ Biến',
    price: 4000000,
    description: 'Giải pháp tối ưu cho việc mở các shop, cửa hàng bán hàng chuyên nghiệp có tích hợp giỏ hàng và thanh toán trực tuyến.',
    icon: <FireOutlined style={{ fontSize: '28px', color: '#6366f1' }} />,
    color: '#6366f1',
    isPopular: true,
    features: [
      'Tùy chỉnh giao diện nâng cao theo yêu cầu',
      'Tối đa 15 trang nội dung + Danh mục sản phẩm',
      'Tích hợp công cụ SEO tiêu chuẩn',
      'Hỗ trợ kết nối cổng thanh toán VNPay và SePay',
      'Trang bài viết, sản phẩm & danh mục sử dụng template chuẩn SEO [Xem mẫu]',
      ...getCommitments('5 - 7 ngày', 'cơ bản 1G')
    ],
  },
  {
    title: 'Gói Cao Cấp',
    price: 6000000,
    description: 'Thiết kế độc quyền, lập trình trực tiếp từ bản vẽ thiết kế Figma (Cắt Figma sang code). Tốc độ cực hạn.',
    icon: <CrownOutlined style={{ fontSize: '28px', color: '#f59e0b' }} />,
    color: '#f59e0b',
    features: [
      'Lập trình giao diện riêng biệt từ bản vẽ Figma (Cắt Figma)',
      'Không giới hạn số lượng trang nội dung',
      'Tối ưu Core Web Vitals (Đạt 95-100 điểm xanh)',
      'Hỗ trợ cấu hình đa ngôn ngữ (Multi-language)',
      ...getCommitments('10 - 15 ngày', 'VIP tốc độ cao 3G')
    ],
  },
];

const TEMPLATE_DEMOS = [
  {
    title: 'Template Chi Tiết Sản Phẩm (Single Product)',
    type: 'Cửa Hàng / E-Commerce',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    description: 'Bố cục hiện đại tối ưu tỷ lệ chuyển đổi, bao gồm ảnh phóng to, thông số kỹ thuật, đánh giá và sản phẩm liên quan.',
    features: ['Chuẩn Schema Product', 'Tối ưu nút Mua ngay', 'Tải nhanh dưới 1.5s'],
  },
  {
    title: 'Template Chi Tiết Bài Viết (Single Post)',
    type: 'Tin Tức / Blog',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60',
    description: 'Tập trung vào trải nghiệm đọc của người dùng với font chữ sắc nét, thanh mục lục tự động và bài viết liên quan.',
    features: ['Mục lục tự động (TOC)', 'Chuẩn Schema Article', 'Độ tương phản font tốt'],
  },
  {
    title: 'Template Trang Danh Mục (Category Archive)',
    type: 'Lưu Trữ / Phân Loại',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    description: 'Bố cục dạng lưới (Grid) trực quan giúp khách hàng dễ dàng tìm kiếm và phân loại thông tin bài viết/sản phẩm.',
    features: ['Bộ lọc Ajax thông minh', 'Phân trang mượt mà', 'Tải ảnh Lazy Load'],
  },
];

const Services: React.FC = () => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '48px', marginTop: '20px' }}>
        <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: '36px' }}>
          Dịch Vụ Thiết Kế Website Chuyên Nghiệp
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#64748b', marginTop: '12px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Lựa chọn gói dịch vụ tối ưu cho nhu cầu của bạn. Tất cả các gói đều miễn phí đăng ký tên miền, hosting lưu trữ và bộ combo cam kết dịch vụ vàng.
        </Paragraph>
      </div>

      {/* Pricing Cards Grid */}
      <Row gutter={[16, 16]} justify="center" align="stretch" style={{ marginBottom: '48px' }}>
        {PLANS.map((plan) => {
          return (
            <Col xs={24} sm={12} lg={6} key={plan.title} style={{ display: 'flex' }}>
              <Card
                hoverable
                bordered={false}
                style={{
                  width: '100%',
                  borderRadius: '24px',
                  boxShadow: plan.isPopular ? '0 12px 30px rgba(99, 102, 241, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
                  border: plan.isPopular ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.04)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: plan.isPopular ? 'scale(1.02)' : 'none',
                  zIndex: plan.isPopular ? 2 : 1,
                }}
                styles={{
                  body: {
                    padding: '20px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }
                }}
              >
                <div>
                  {plan.isPopular && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(to right, #6366f1, #a855f7)',
                        color: '#fff',
                        padding: '4px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Phổ Biến Nhất
                    </div>
                  )}

                  <Space align="center" style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `${plan.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {plan.icon}
                    </div>
                    <Title level={4} style={{ margin: 0, fontWeight: 700, fontSize: '18px' }}>
                      {plan.title}
                    </Title>
                  </Space>

                  <Paragraph type="secondary" style={{ minHeight: '60px', fontSize: '12.5px', marginBottom: '12px', lineHeight: 1.5 }}>
                    {plan.description}
                  </Paragraph>

                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', display: 'block' }}>CHI PHÍ TRỌN GÓI</Text>
                    <Title level={2} style={{ margin: 0, color: plan.color, fontWeight: 800, fontSize: '26px' }}>
                      {plan.price.toLocaleString('vi-VN')} đ
                    </Title>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  {/* Features List */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.features.map((feat, i) => {
                      const isFree = feat.startsWith('FREE') || feat.startsWith('MIỄN PHÍ');
                      
                      // Render custom click popup handler
                      if (feat.includes('[Xem mẫu]')) {
                        const parts = feat.split('[Xem mẫu]');
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckOutlined style={{ color: plan.color, fontSize: '12px', marginTop: '4px' }} />
                            <Text style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                              {parts[0]}
                              <span 
                                onClick={() => setIsTemplateModalOpen(true)}
                                style={{ 
                                  color: plan.color, 
                                  fontWeight: 700, 
                                  textDecoration: 'underline',
                                  marginLeft: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                xem mẫu
                              </span>
                              {parts[1]}
                            </Text>
                          </li>
                        );
                      }

                      return (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <CheckOutlined style={{ color: plan.color, fontSize: '12px', marginTop: '4px' }} />
                          <Text style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                            {isFree ? <strong style={{ color: plan.color }}>{feat}</strong> : feat}
                          </Text>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <Button
                    type={plan.isPopular ? 'primary' : 'default'}
                    size="middle"
                    block
                    href="https://zalo.me/0815483669"
                    target="_blank"
                    style={{
                      height: '38px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      borderColor: plan.isPopular ? undefined : plan.color,
                      color: plan.isPopular ? undefined : plan.color,
                    }}
                  >
                    Đăng Ký Tư Vấn
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Trust section / banner */}
      <Card
        bordered={false}
        className="glass-panel"
        style={{
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          padding: '24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(245, 158, 11, 0.02) 100%)',
          border: '1px solid rgba(0,0,0,0.03)',
        }}
      >
        <Space size="large" wrap justify="center">
          <Text strong style={{ fontSize: '15px' }}><Space><PhoneOutlined /> Hotline tư vấn nhanh: 0815.483.669</Space></Text>
          <Divider type="vertical" style={{ background: '#d9d9d9', height: '20px' }} />
          <Text strong style={{ fontSize: '15px' }}>
            <Space>
              <MessageOutlined /> Zalo hỗ trợ: <a href="https://zalo.me/0815483669" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>zalo.me/0815483669</a>
            </Space>
          </Text>
        </Space>
      </Card>

      {/* Template Demos Modal Popup */}
      <Modal
        title={<span style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b' }}>Mẫu Template Bài Viết, Sản Phẩm & Danh Mục Chuẩn SEO</span>}
        open={isTemplateModalOpen}
        onCancel={() => setIsTemplateModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsTemplateModalOpen(false)} style={{ borderRadius: '8px' }}>
            Đóng
          </Button>
        ]}
        width={1000}
        centered
        destroyOnClose
      >
        <div style={{ marginTop: '20px' }}>
          <Row gutter={[16, 16]}>
            {TEMPLATE_DEMOS.map((tpl, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card
                  bordered
                  cover={
                    <div style={{ overflow: 'hidden', height: '140px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                      <img 
                        alt={tpl.title} 
                        src={tpl.image} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                        onClick={() => window.open(tpl.image, '_blank')}
                      />
                    </div>
                  }
                  style={{ borderRadius: '12px', height: '100%', border: '1px solid rgba(0,0,0,0.06)' }}
                  styles={{ body: { padding: '16px' } }}
                >
                  <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{tpl.type}</span>
                  <Title level={5} style={{ margin: '4px 0 8px 0', fontSize: '14px', fontWeight: 700, minHeight: '40px' }}>{tpl.title}</Title>
                  <Paragraph type="secondary" style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '12px', minHeight: '54px' }}>
                    {tpl.description}
                  </Paragraph>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                    {tpl.features.map((f, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <CheckCircleOutlined style={{ color: '#10b981', fontSize: '12px' }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default Services;
