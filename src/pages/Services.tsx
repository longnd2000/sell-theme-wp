import React, { useState } from 'react';
import { Row, Col, Card, Button, Typography, Space, Divider, Select, Modal, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  CheckOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
  MessageOutlined,
  PhoneOutlined,
  CopyOutlined,
  RocketOutlined
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

interface DomainOption {
  suffix: string;
  price: number;
  isFree: boolean;
}

interface HostingOption {
  key: string;
  name: string;
  price12m: number;
  extraPrice: number;
  specs: string;
}

// Cấu hình danh sách tên miền mới
const DOMAIN_OPTIONS: DomainOption[] = [
  // Miễn phí
  { suffix: '.top', price: 0, isFree: true },
  { suffix: '.us', price: 0, isFree: true },
  { suffix: '.name.vn', price: 0, isFree: true },
  { suffix: '.io.vn', price: 0, isFree: true },
  { suffix: '.id.vn', price: 0, isFree: true },
  { suffix: '.website', price: 0, isFree: true },
  { suffix: '.online', price: 0, isFree: true },
  { suffix: '.store', price: 0, isFree: true },
  // Tính phí thêm
  { suffix: '.com', price: 200000, isFree: false },
  { suffix: '.org', price: 200000, isFree: false },
  { suffix: '.net', price: 350000, isFree: false },
  { suffix: '.vn', price: 650000, isFree: false },
  { suffix: '.com.vn', price: 550000, isFree: false },
  { suffix: '.edu.vn', price: 400000, isFree: false },
];

// Cấu hình các gói hosting mới
const HOSTING_OPTIONS: HostingOption[] = [
  { key: 'basic01', name: 'Host Basic 01', price12m: 250000, extraPrice: 0, specs: 'CPU 2 Core / RAM 2GB / SSD 1GB' },
  { key: 'basic02', name: 'Host Basic 02', price12m: 500000, extraPrice: 250000, specs: 'CPU 2 Core / RAM 3GB / SSD 3GB' },
  { key: 'basic03', name: 'Host Basic 03', price12m: 1000000, extraPrice: 750000, specs: 'CPU 3 Core / RAM 3GB / SSD 6GB' },
  { key: 'basic04', name: 'Host Basic 04', price12m: 1400000, extraPrice: 1150000, specs: 'CPU 4 Core / RAM 4GB / SSD 10GB' },
];

const getCommitments = (
  deliveryTime: string,
  editorDesc: string = 'Giao diện chỉnh sửa trực quan (Sử dụng Elementor)',
  hasGsiGuarantee: boolean = true
) => {
  const commitments = [
    'Hỗ trợ dựng và quản lý tài nguyên',
    'Bảo hành 12 tháng (FREE fix tất cả lỗi do code mình gây ra)',
    `Thời gian hoàn thành (Bàn giao sau ${deliveryTime})`,
    'Hỗ trợ cập nhật và chỉnh sửa thông tin',
    editorDesc,
    'Tư vấn nhiệt tình (Đồng hành hỗ trợ 24/7)',
    'FREE gói cấu hình bảo mật website',
  ];
  if (hasGsiGuarantee) {
    commitments.push('FREE gói tối ưu điểm PageSpeed Insights (GSI > 80 khi sử dụng theme LX Landing)');
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
      ...getCommitments('3 - 5 ngày', 'Giao diện nhập liệu trực quan', false)
    ],
  },
  {
    title: 'Gói Landing Page',
    price: 900000,
    description: 'Tối ưu cho doanh nghiệp, cá nhân cần trang Landing Page đơn phục vụ chạy quảng cáo, giới thiệu sản phẩm, dịch vụ.',
    icon: <RocketOutlined style={{ fontSize: '28px', color: '#06b6d4' }} />,
    color: '#06b6d4',
    features: [
      'Thiết kế trực tiếp trên trang wordpress dùng theme LX Landing',
      '1 trang Landing Page chuyên nghiệp (đầy đủ các phần: Hero, Giới thiệu, Tính năng, Form đăng ký, Khách hàng, Liên hệ)',
      'Tương thích đa thiết bị',
      'Hỗ trợ cấu hình form gửi thông tin liên hệ về Email hoặc Zalo/Google Sheets',
      ...getCommitments('2 - 3 ngày')
    ],
  },
  {
    title: 'Gói Cơ Bản',
    price: 2000000,
    description: 'Phù hợp cho các dự án giới thiệu cá nhân, shop nhỏ hoặc landing page giới thiệu sản phẩm đơn giản.',
    icon: <ThunderboltOutlined style={{ fontSize: '28px', color: '#10b981' }} />,
    color: '#10b981',
    features: [
      'Thiết kế trực tiếp trên trang wordpress dùng theme LX Landing',
      '5 trang cơ bản: trang chủ, giới thiệu, liên hệ (có hỗ trợ Form), bài viết, danh mục bài viết',
      'Tương thích đa thiết bị',
      'Trang bài viết, sản phẩm & danh mục sử dụng template chuẩn SEO [Xem mẫu]',
      ...getCommitments('3 - 5 ngày')
    ],
  },
  {
    title: 'Gói Phổ Biến',
    price: 3000000,
    description: 'Giải pháp tối ưu cho việc mở các shop, cửa hàng bán hàng chuyên nghiệp có tích hợp giỏ hàng và thanh toán trực tuyến.',
    icon: <FireOutlined style={{ fontSize: '28px', color: '#6366f1' }} />,
    color: '#6366f1',
    isPopular: true,
    features: [
      'Thiết kế trực tiếp trên trang wordpress dùng theme LX Landing',
      '10 trang cơ bản: trang chủ, giới thiệu, liên hệ (có hỗ trợ Form), bài viết, danh mục bài viết, sản phẩm, danh mục sản phẩm, giỏ hàng, thanh toán, tài khoản',
      'Hỗ trợ kết nối cổng thanh toán VNPay và SePay',
      'Trang bài viết, sản phẩm & danh mục sử dụng template chuẩn SEO [Xem mẫu]',
      ...getCommitments('5 - 7 ngày')
    ],
  },
  {
    title: 'Gói Cao Cấp',
    price: 6000000,
    description: 'Thiết kế độc quyền, lập trình trực tiếp từ bản vẽ thiết kế Figma (chuyển thiết kế Figma thành Html/css/js). Tốc độ cực hạn.',
    icon: <CrownOutlined style={{ fontSize: '28px', color: '#f59e0b' }} />,
    color: '#f59e0b',
    features: [
      'Lập trình giao diện riêng biệt từ bản vẽ Figma (chuyển thiết kế Figma thành Html/css/js)',
      'Clone giao diện từ website mẫu hoặc thiết kế theo yêu cầu',
      'Không giới hạn số lượng trang nội dung',
      'Hỗ trợ cấu hình đa ngôn ngữ (+200.000 đ)',
      'Hỗ trợ kết nối cổng thanh toán VNPay và SePay',
      'Lập trình ghép Backend WordPress dễ nhập liệu',
      'Tương thích đa thiết bị',
      ...getCommitments('10 - 15 ngày')
    ],
  },
];

const Services: React.FC = () => {
  const navigate = useNavigate();

  // State quản lý đuôi tên miền được chọn cho từng gói
  const [selectedDomains, setSelectedDomains] = useState<Record<string, string>>({
    'Gói Clone & Vibe': '.top',
    'Gói Landing Page': '.top',
    'Gói Cơ Bản': '.top',
    'Gói Phổ Biến': '.top',
    'Gói Cao Cấp': '.top',
  });

  // State quản lý gói hosting được chọn cho từng gói
  const [selectedHostings, setSelectedHostings] = useState<Record<string, string>>({
    'Gói Clone & Vibe': 'basic01',
    'Gói Landing Page': 'basic01',
    'Gói Cơ Bản': 'basic01',
    'Gói Phổ Biến': 'basic01',
    'Gói Cao Cấp': 'basic01',
  });

  const [openModalPlan, setOpenModalPlan] = useState<PricingPlan | null>(null);

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
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const selectedSuffix = selectedDomains[plan.title] || '.top';
          const domainOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
          const domainPrice = domainOpt ? domainOpt.price : 0;

          const selectedHostKey = selectedHostings[plan.title] || 'basic01';
          const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
          const hostingExtraPrice = hostingOpt ? hostingOpt.extraPrice : 0;

          const totalPrice = plan.price + domainPrice + hostingExtraPrice;

          // Tạo nội dung tin nhắn gửi Zalo soạn sẵn
          const zaloMessage = `Chào WPHub, mình muốn đăng ký tư vấn ${plan.title} sử dụng tên miền đuôi ${selectedSuffix} và gói ${hostingOpt?.name}. Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`;
          const zaloUrl = `https://zalo.me/0815483669?text=${encodeURIComponent(zaloMessage)}`;

          // Hợp nhất các cam kết và các thông số được chọn động
          const displayFeatures = [
            `Tặng kèm ${hostingOpt?.name} (${hostingOpt?.specs})`,
            `Hỗ trợ tên miền miễn phí đuôi ${selectedSuffix}`,
            ...plan.features
          ];

          return (
            <div key={plan.title} style={{ display: 'flex', width: '100%' }}>
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

                  {/* Giá và Tên miền & Hosting */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                      TỔNG CHI PHÍ TẠM TÍNH
                    </Text>
                    <Title level={2} style={{ margin: 0, color: plan.color, fontWeight: 800, fontSize: '26px' }}>
                      {totalPrice.toLocaleString('vi-VN')} đ
                    </Title>

                    <Space direction="vertical" size={0} style={{ width: '100%', marginTop: '4px' }}>
                      {domainPrice > 0 ? (
                        <Text type="secondary" style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                          • Tên miền {selectedSuffix}: +{domainPrice.toLocaleString('vi-VN')} đ
                        </Text>
                      ) : (
                        <Text type="secondary" style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'block' }}>
                          • Tên miền {selectedSuffix}: Miễn phí
                        </Text>
                      )}

                      {hostingExtraPrice > 0 ? (
                        <Text type="secondary" style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                          • {hostingOpt?.name}: +{hostingExtraPrice.toLocaleString('vi-VN')} đ
                        </Text>
                      ) : (
                        <Text type="secondary" style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'block' }}>
                          • {hostingOpt?.name}: Miễn phí
                        </Text>
                      )}
                    </Space>
                  </div>

                  {/* Dropdowns Cấu hình Tên miền & Hosting */}
                  <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: '#475569' }}>
                        Đuôi tên miền đi kèm:
                      </Text>
                      <Select
                        value={selectedSuffix}
                        onChange={(val) => setSelectedDomains(prev => ({ ...prev, [plan.title]: val }))}
                        style={{ width: '100%' }}
                        options={DOMAIN_OPTIONS.map(d => ({
                          value: d.suffix,
                          label: d.isFree ? `${d.suffix} (Miễn phí)` : `${d.suffix} (+${d.price.toLocaleString('vi-VN')} đ)`
                        }))}
                      />
                    </div>

                    <div>
                      <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: '#475569' }}>
                        Gói Hosting (12 tháng):
                      </Text>
                      <Select
                        value={selectedHostKey}
                        onChange={(val) => setSelectedHostings(prev => ({ ...prev, [plan.title]: val }))}
                        style={{ width: '100%' }}
                        options={HOSTING_OPTIONS.map(h => ({
                          value: h.key,
                          label: h.extraPrice === 0
                            ? `${h.name} (Miễn phí)`
                            : `${h.name} (+${h.extraPrice.toLocaleString('vi-VN')} đ)`
                        }))}
                      />
                      {/* Hiển thị thông số dạng danh sách tag nổi bật */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {hostingOpt?.specs.split(' / ').map((spec, idx) => (
                          <Tag 
                            key={idx} 
                            style={{ 
                              fontSize: '10px', 
                              margin: 0, 
                              borderRadius: '4px', 
                              border: `1px solid ${plan.color}25`, 
                              background: `${plan.color}08`, 
                              color: plan.color,
                              fontWeight: 600,
                              padding: '1px 6px'
                            }}
                          >
                            {spec}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  {/* Features List */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {displayFeatures.map((feat, i) => {
                      const isHighlighted =
                        feat.startsWith('FREE') ||
                        feat.startsWith('MIỄN PHÍ') ||
                        feat.startsWith('Tặng kèm') ||
                        feat.startsWith('Thiết kế trực tiếp') ||
                        feat.startsWith('5 trang cơ bản') ||
                        feat.startsWith('10 trang cơ bản') ||
                        feat.startsWith('1 trang Landing') ||
                        feat.startsWith('Clone giao diện') ||
                        feat.startsWith('Lập trình ghép Backend') ||
                        feat.startsWith('Tùy chỉnh giao diện') ||
                        feat.startsWith('Tối đa 15 trang') ||
                        feat.startsWith('Lập trình giao diện riêng biệt');

                      // Render custom click popup handler
                      if (feat.includes('[Xem mẫu]')) {
                        const parts = feat.split('[Xem mẫu]');
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckOutlined style={{ color: plan.color, fontSize: '12px', marginTop: '4px' }} />
                            <Text style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                              {parts[0]}
                              <span
                                onClick={() => navigate('/templates-preview')}
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
                            {isHighlighted ? <strong style={{ color: plan.color }}>{feat}</strong> : feat}
                          </Text>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Button
                    type="default"
                    size="middle"
                    block
                    onClick={() => setOpenModalPlan(plan)}
                    style={{
                      height: '38px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      borderColor: plan.color,
                      color: plan.color,
                      background: `${plan.color}08`,
                    }}
                  >
                    Xem Chi Tiết
                  </Button>
                  <Button
                    type={plan.isPopular ? 'primary' : 'default'}
                    size="middle"
                    block
                    href={zaloUrl}
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
            </div>
          );
        })}
      </div>

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

      {/* Modal hiển thị chi tiết gói dịch vụ */}
      <Modal
        title={
          openModalPlan ? (
            <Space align="center" style={{ paddingBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${openModalPlan.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {openModalPlan.icon}
              </div>
              <Text strong style={{ fontSize: '16px', display: 'block', color: '#1e293b' }}>
                Chi Tiết Dịch Vụ - {openModalPlan.title}
              </Text>
            </Space>
          ) : null
        }
        open={!!openModalPlan}
        onCancel={() => setOpenModalPlan(null)}
        footer={null}
        width={950}
        centered
        styles={{
          body: {
            padding: '16px 8px 8px 8px',
          }
        }}
      >
        {openModalPlan && (() => {
          const plan = openModalPlan;
          const selectedSuffix = selectedDomains[plan.title] || '.top';
          const domainOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
          const domainPrice = domainOpt ? domainOpt.price : 0;

          const selectedHostKey = selectedHostings[plan.title] || 'basic01';
          const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
          const hostingExtraPrice = hostingOpt ? hostingOpt.extraPrice : 0;

          const totalPrice = plan.price + domainPrice + hostingExtraPrice;

          const displayFeatures = [
            `Tặng kèm ${hostingOpt?.name} (${hostingOpt?.specs})`,
            `Hỗ trợ tên miền miễn phí đuôi ${selectedSuffix}`,
            ...plan.features
          ];

          const isCommitment = (feat: string) => {
            const commitmentKeywords = [
              'Hỗ trợ dựng và quản lý',
              'Bảo hành 12 tháng',
              'Thời gian hoàn thành',
              'Hỗ trợ cập nhật',
              'Giao diện nhập liệu',
              'Giao diện chỉnh sửa',
              'Tư vấn nhiệt tình',
              'FREE gói cấu hình bảo mật',
              'FREE gói tối ưu điểm PageSpeed'
            ];
            return commitmentKeywords.some(kw => feat.includes(kw));
          };

          const col1Features = displayFeatures.filter(f => !isCommitment(f));
          const col2Features = displayFeatures.filter(f => isCommitment(f));

          const renderFeatureList = (features: string[], titleText: string, iconColor: string) => {
            return (
              <div>
                <Title level={5} style={{ marginBottom: '12px', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '6px', fontSize: '14px' }}>
                  {titleText}
                </Title>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {features.map((feat, i) => {
                    const isHighlighted =
                      feat.startsWith('FREE') ||
                      feat.startsWith('MIỄN PHÍ') ||
                      feat.startsWith('Tặng kèm') ||
                      feat.startsWith('Thiết kế trực tiếp') ||
                      feat.startsWith('5 trang cơ bản') ||
                      feat.startsWith('10 trang cơ bản') ||
                      feat.startsWith('1 trang Landing') ||
                      feat.startsWith('Clone giao diện') ||
                      feat.startsWith('Lập trình ghép Backend') ||
                      feat.startsWith('Tùy chỉnh giao diện') ||
                      feat.startsWith('Tối đa 15 trang') ||
                      feat.startsWith('Lập trình giao diện riêng biệt');

                    if (feat.includes('[Xem mẫu]')) {
                      const parts = feat.split('[Xem mẫu]');
                      return (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <CheckOutlined style={{ color: iconColor, fontSize: '12px', marginTop: '4px' }} />
                          <Text style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                            {parts[0]}
                            <span
                              onClick={() => {
                                setOpenModalPlan(null);
                                navigate('/templates-preview');
                              }}
                              style={{
                                color: iconColor,
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
                        <CheckOutlined style={{ color: iconColor, fontSize: '12px', marginTop: '4px' }} />
                        <Text style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                          {isHighlighted ? <strong style={{ color: iconColor }}>{feat}</strong> : feat}
                        </Text>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          };

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                    Tổng Chi Phí Tạm Tính
                  </Text>
                  <Title level={4} style={{ margin: 0, color: plan.color, fontWeight: 800, fontSize: '20px' }}>
                    {totalPrice.toLocaleString('vi-VN')} đ
                  </Title>
                  <Text type="secondary" style={{ fontSize: '11px', color: '#64748b' }}>
                    Bao gồm: {hostingOpt?.name} & Tên miền {selectedSuffix}
                  </Text>
                </div>
                <Button
                  type="primary"
                  size="middle"
                  href={`https://zalo.me/0815483669?text=${encodeURIComponent(`Chào WPHub, mình muốn đăng ký tư vấn ${plan.title} sử dụng tên miền đuôi ${selectedSuffix} và gói ${hostingOpt?.name}. Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`)}`}
                  target="_blank"
                  style={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    height: '38px',
                    background: plan.color,
                    borderColor: plan.color,
                  }}
                >
                  Đăng Ký Tư Vấn Ngay
                </Button>
              </div>

              {/* Dropdowns Cấu hình Tên miền & Hosting (dàn ngang) */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1, background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <Text strong style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#475569' }}>
                    Đuôi tên miền đi kèm:
                  </Text>
                  <Select
                    value={selectedSuffix}
                    onChange={(val) => setSelectedDomains(prev => ({ ...prev, [plan.title]: val }))}
                    style={{ width: '100%' }}
                    options={DOMAIN_OPTIONS.map(d => ({
                      value: d.suffix,
                      label: d.isFree ? `${d.suffix} (Miễn phí)` : `${d.suffix} (+${d.price.toLocaleString('vi-VN')} đ)`
                    }))}
                  />
                </div>

                <div style={{ flex: 1, background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <Text strong style={{ fontSize: '11px', display: 'block', marginBottom: '4px', color: '#475569' }}>
                    Gói Hosting (12 tháng):
                  </Text>
                  <Select
                    value={selectedHostKey}
                    onChange={(val) => setSelectedHostings(prev => ({ ...prev, [plan.title]: val }))}
                    style={{ width: '100%' }}
                    options={HOSTING_OPTIONS.map(h => ({
                      value: h.key,
                      label: h.extraPrice === 0
                        ? `${h.name} (Miễn phí)`
                        : `${h.name} (+${h.extraPrice.toLocaleString('vi-VN')} đ)`
                    }))}
                  />
                  {/* Hiển thị thông số dạng danh sách tag nổi bật */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {hostingOpt?.specs.split(' / ').map((spec, idx) => (
                      <Tag 
                        key={idx} 
                        style={{ 
                          fontSize: '9.5px', 
                          margin: 0, 
                          borderRadius: '4px', 
                          border: `1px solid ${plan.color}25`, 
                          background: `${plan.color}08`, 
                          color: plan.color,
                          fontWeight: 600,
                          padding: '1px 6px'
                        }}
                      >
                        {spec}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>

              <Row gutter={24}>
                <Col span={12}>
                  {renderFeatureList(col1Features, 'Cấu Hình & Tính Năng', plan.color)}
                </Col>
                <Col span={12}>
                  {renderFeatureList(col2Features, 'Cam Kết Dịch Vụ', plan.color)}
                </Col>
              </Row>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default Services;
