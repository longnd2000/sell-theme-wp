import React, { useState, useEffect, useRef } from 'react';
// Import các UI Components từ thư viện Ant Design
import { Row, Col, Card, Button, Typography, Space, Divider, Select, Modal, Tag, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
// Import các Icons từ Ant Design để minh họa tính năng trực quan
import {
  CheckOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CrownOutlined,
  MessageOutlined,
  PhoneOutlined,
  CopyOutlined,
  RocketOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * Interface cấu trúc dữ liệu cho mỗi tùy chọn tên miền đi kèm
 */
interface DomainOption {
  suffix: string;
  price: number;
  isFree: boolean;
}

/**
 * Interface cấu trúc dữ liệu cho mỗi tùy chọn SSD Hosting đi kèm
 */
interface HostingOption {
  key: string;
  name: string;
  price12m: number;
  extraPrice: number;
  specs: string;
}

/**
 * Interface cấu trúc dữ liệu cho mỗi gói dịch vụ thiết kế website
 */
interface PricingPlan {
  title: string;
  price: number;
  originalPrice?: number; // Giá gốc ban đầu trước khi giảm giá
  description: string;
  icon: React.ReactNode;
  features: string[];
  isPopular?: boolean;
  color: string;
  slotsLeftText?: string; // Dòng chữ thông báo khan hiếm số suất ưu đãi
}

// Danh sách các đuôi tên miền được hỗ trợ đăng ký đi kèm website
const DOMAIN_OPTIONS: DomainOption[] = [
  { suffix: '.top', price: 0, isFree: true },
  { suffix: '.us', price: 0, isFree: true },
  { suffix: '.name.vn', price: 0, isFree: true },
  { suffix: '.io.vn', price: 0, isFree: true },
  { suffix: '.id.vn', price: 0, isFree: true },
  { suffix: '.website', price: 0, isFree: true },
  { suffix: '.online', price: 0, isFree: true },
  { suffix: '.store', price: 0, isFree: true },
  { suffix: '.com', price: 200000, isFree: false },
  { suffix: '.org', price: 200000, isFree: false },
  { suffix: '.net', price: 220000, isFree: false },
  { suffix: '.vn', price: 550000, isFree: false },
  { suffix: '.com.vn', price: 450000, isFree: false },
];

// Danh sách các gói Hosting đi kèm từ nhà cung cấp
const HOSTING_OPTIONS: HostingOption[] = [
  { key: 'pro01', name: 'Host Pro 01', price12m: 900000, extraPrice: 0, specs: 'CPU 2 Core | RAM 2GB | SSD 5GB' },
  { key: 'pro02', name: 'Host Pro 02', price12m: 1400000, extraPrice: 500000, specs: 'CPU 3 Core | RAM 3GB | SSD 10GB' },
  { key: 'business01', name: 'Host Business 01', price12m: 2000000, extraPrice: 1100000, specs: 'CPU 4 Core | RAM 4GB | SSD 20GB' },
];

/**
 * Hàm sinh ra các cam kết dịch vụ vàng mặc định để tái sử dụng nhanh cho các gói
 */
const getCommitments = (timeFrame: string, editor = 'Giao diện Elementor Pro chính hãng dễ sửa đổi', speedUp = true): string[] => {
  const commitments = [
    'Hỗ trợ dựng và quản lý nội dung cơ bản',
    'Bảo hành 12 tháng hệ thống, sao lưu định kỳ hàng tuần',
    `Thời gian hoàn thành: ${timeFrame}`,
    'Hỗ trợ cập nhật plugin, theme trọn đời miễn phí',
    editor,
    'Tư vấn nhiệt tình, bàn giao toàn bộ source code và tài khoản quản trị tối cao',
    'FREE gói cấu hình bảo mật cơ bản chống brute force, spam form',
  ];
  if (speedUp) {
    commitments.push('FREE gói tối ưu điểm PageSpeed Insights (GSI > 80 khi sử dụng theme LX Landing)');
  }
  return commitments;
};

// Định nghĩa 5 gói dịch vụ thiết kế website với giá bán thực tế tối thiểu và giá gốc chiết khấu 25%
const PLANS: PricingPlan[] = [
  {
    title: 'Gói Landing Page',
    price: 900000,
    originalPrice: 1200000, // Chiết khấu 25%
    description: 'Tối ưu cho doanh nghiệp, cá nhân cần trang Landing Page đơn phục vụ chạy quảng cáo, giới thiệu sản phẩm, dịch vụ.',
    icon: <RocketOutlined style={{ fontSize: '28px', color: '#06b6d4' }} />,
    color: '#06b6d4',
    slotsLeftText: 'Đã nhận 8/10 suất ưu đãi (Còn 2 slot)!',
    features: [
      'Thiết kế trực tiếp trên trang wordpress dùng theme LX Landing',
      '1 trang Landing Page chuyên nghiệp (đầy đủ các phần: Hero, Giới thiệu, Tính năng, Form đăng ký, Khách hàng, Liên hệ)',
      'Tương thích đa thiết bị',
      'Hỗ trợ cấu hình form gửi thông tin liên hệ về Email hoặc Zalo/Google Sheets',
      ...getCommitments('2 - 3 ngày')
    ],
  },
  {
    title: 'Gói Clone & Vibe',
    price: 1500000,
    originalPrice: 2000000, // Chiết khấu 25%
    description: 'Dành riêng cho đơn vị cần clone giao diện theo mẫu và ghép backend WordPress để khách tự nhập liệu dễ dàng.',
    icon: <CopyOutlined style={{ fontSize: '28px', color: '#8b5cf6' }} />,
    color: '#8b5cf6',
    slotsLeftText: 'Đã nhận 7/10 suất ưu đãi (Còn 3 slot)!',
    features: [
      'Clone giao diện từ website mẫu yêu cầu',
      'Lập trình ghép Backend WordPress dễ nhập liệu',
      'Tương thích đa thiết bị',
      ...getCommitments('3 - 5 ngày', 'Giao diện nhập liệu trực quan', false)
    ],
  },
  {
    title: 'Gói Cơ Bản',
    price: 2000000,
    originalPrice: 2700000, // Chiết khấu ~26%
    description: 'Phù hợp cho các dự án giới thiệu cá nhân, shop nhỏ hoặc landing page giới thiệu sản phẩm đơn giản.',
    icon: <ThunderboltOutlined style={{ fontSize: '28px', color: '#10b981' }} />,
    color: '#10b981',
    slotsLeftText: 'Đã nhận 8/10 suất ưu đãi (Còn 2 slot)!',
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
    originalPrice: 4000000, // Chiết khấu 25%
    description: 'Giải pháp tối ưu cho việc mở các shop, cửa hàng bán hàng chuyên nghiệp có tích hợp giỏ hàng và thanh toán trực tuyến.',
    icon: <FireOutlined style={{ fontSize: '28px', color: '#6366f1' }} />,
    color: '#6366f1',
    isPopular: true,
    slotsLeftText: 'Đã nhận 17/20 suất ưu đãi (Còn 3 slot)!',
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
    originalPrice: 8000000, // Chiết khấu 25%
    description: 'Thiết kế độc quyền, lập trình trực tiếp từ bản vẽ thiết kế Figma (chuyển thiết kế Figma thành Html/css/js). Tốc độ cực hạn.',
    icon: <CrownOutlined style={{ fontSize: '28px', color: '#f59e0b' }} />,
    color: '#f59e0b',
    slotsLeftText: 'Đã nhận 4/5 suất ưu đãi (Còn 1 slot)!',
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
  // Khởi tạo ref để điều khiển slider của Ant Design Carousel programmatically
  const carouselRef = useRef<any>(null);

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
    'Gói Clone & Vibe': 'pro01',
    'Gói Landing Page': 'pro01',
    'Gói Cơ Bản': 'pro01',
    'Gói Phổ Biến': 'pro01',
    'Gói Cao Cấp': 'pro01',
  });

  const [openModalPlan, setOpenModalPlan] = useState<PricingPlan | null>(null);

  // Hàm tính toán số giây còn lại từ thời điểm hiện tại đến cuối tháng hiện tại (23:59:59 của ngày cuối tháng)
  const getSecondsToEndOfMonth = () => {
    const now = new Date();
    // Tạo mốc thời gian cuối cùng của tháng hiện tại (ngày 0 của tháng tiếp theo = ngày cuối cùng tháng này)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return Math.max(0, Math.floor((endOfMonth.getTime() - now.getTime()) / 1000));
  };

  // State lưu trữ số giây còn lại đến cuối tháng
  const [timeLeft, setTimeLeft] = useState(getSecondsToEndOfMonth());

  useEffect(() => {
    const timer = setInterval(() => {
      // Cập nhật lại số giây liên tục mỗi giây
      setTimeLeft(getSecondsToEndOfMonth());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Chuyển đổi số giây tổng thành các đại lượng: Ngày, Giờ, Phút, Giây
  const getDuration = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  // Tính toán tự động ngày cuối cùng của tháng hiện tại để hiển thị thời hạn ưu đãi động
  const getLastDayOfMonthString = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const dd = String(lastDay.getDate()).padStart(2, '0');
    const mm = String(lastDay.getMonth() + 1).padStart(2, '0');
    const yyyy = lastDay.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const duration = getDuration(timeLeft);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '32px', marginTop: '20px' }}>
        <Title level={1} className="services-main-title" style={{ margin: 0, fontWeight: 800 }}>
          Dịch Vụ Thiết Kế Website Chuyên Nghiệp
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#64748b', marginTop: '12px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
          Lựa chọn gói dịch vụ tối ưu cho nhu cầu của bạn. Tất cả các gói đều miễn phí đăng ký tên miền, hosting lưu trữ và bộ combo cam kết dịch vụ vàng.
        </Paragraph>

        {/* Bảng đếm ngược thời gian khuyến mãi khẩn cấp tạo hiệu ứng FOMO mạnh */}
        <div className="countdown-banner">
          {/* Tiêu đề chương trình */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
            <FireOutlined className="animate-pulse" style={{ fontSize: '20px' }} />
            <span className="countdown-title-text">
              CHƯƠNG TRÌNH ƯU ĐÃI LỚN ĐẾN 30% - HẠN CHÓT {getLastDayOfMonthString()}!
            </span>
          </div>
          
          {/* Hàng các ô đếm ngược (Ngày : Giờ : Phút : Giây) */}
          <div className="countdown-row">
            {/* Ô Số Ngày */}
            <div style={{ textAlign: 'center' }}>
              <div className="countdown-box">
                {duration.days.toString().padStart(2, '0')}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Ngày</span>
            </div>

            <span className="countdown-separator">:</span>

            {/* Ô Số Giờ */}
            <div style={{ textAlign: 'center' }}>
              <div className="countdown-box">
                {duration.hours.toString().padStart(2, '0')}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Giờ</span>
            </div>

            <span className="countdown-separator">:</span>

            {/* Ô Số Phút */}
            <div style={{ textAlign: 'center' }}>
              <div className="countdown-box">
                {duration.minutes.toString().padStart(2, '0')}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Phút</span>
            </div>

            <span className="countdown-separator">:</span>

            {/* Ô Số Giây */}
            <div style={{ textAlign: 'center' }}>
              <div className="countdown-box">
                {duration.seconds.toString().padStart(2, '0')}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Giây</span>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, fontStyle: 'italic' }}>
            * Số lượng suất nhận ưu đãi có giới hạn. Hãy đăng ký ngay để giữ giá khuyến mãi!
          </div>
        </div>
      </div>

      {/* Container của Slider (Carousel) kèm theo các nút điều hướng Left/Right */}
      <div className="pricing-carousel-container">
        {/* Nút lướt sang Trái */}
        <Button
          className="pricing-carousel-arrow"
          shape="circle"
          icon={<LeftOutlined />}
          onClick={() => carouselRef.current?.prev()}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {/* Nút lướt sang Phải */}
        <Button
          className="pricing-carousel-arrow"
          shape="circle"
          icon={<RightOutlined />}
          onClick={() => carouselRef.current?.next()}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />

        {/* Carousel chính của Ant Design cấu hình hiển thị 3.5 gói cùng lúc (hé lộ gói tiếp theo) */}
        <Carousel 
          ref={carouselRef}
          dots={true}
          infinite={false}
          speed={500}
          slidesToShow={3.5}
          slidesToScroll={1}
          responsive={[
            {
              breakpoint: 1200, // Dưới 1200px hiển thị 2.5 gói để kích thích cuộn
              settings: {
                slidesToShow: 2.5,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 768, // Dưới 768px hiển thị 1.2 gói trên Mobile giúp nhận biết có thể swipe
              settings: {
                slidesToShow: 1.2,
                slidesToScroll: 1,
              }
            }
          ]}
          style={{ paddingBottom: '30px' }} // Khoảng trống cho các dấu chấm điều hướng dots bên dưới
        >
          {PLANS.map((plan) => {
            const selectedSuffix = selectedDomains[plan.title] || '.top';
            const domainOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
            const domainPrice = domainOpt ? domainOpt.price : 0;

            const selectedHostKey = selectedHostings[plan.title] || 'pro01';
            const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
            const hostingExtraPrice = hostingOpt ? hostingOpt.extraPrice : 0;

            const totalPrice = plan.price + domainPrice + hostingExtraPrice;
            const totalOriginalPrice = (plan.originalPrice || plan.price) + domainPrice + hostingExtraPrice;
            const discountPercent = plan.originalPrice 
              ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) 
              : 0;

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
              <div key={plan.title} style={{ height: '100%' }}>
                <Card
                  hoverable
                  bordered={false}
                  className="pricing-card"
                  style={{
                    borderRadius: '24px',
                    boxShadow: plan.isPopular ? '0 12px 30px rgba(99, 102, 241, 0.15)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
                    border: plan.isPopular ? '2px solid #6366f1' : '1px solid rgba(0,0,0,0.04)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    zIndex: plan.isPopular ? 2 : 1,
                    height: 'calc(100% - 40px)', // Bắt buộc chiều cao card lấp đầy slide trừ đi lề margin
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Title level={2} style={{ margin: 0, color: plan.color, fontWeight: 800, fontSize: '26px' }}>
                          {totalPrice.toLocaleString('vi-VN')} đ
                        </Title>
                        {plan.originalPrice && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Text delete type="secondary" style={{ fontSize: '13px', color: '#94a3b8' }}>
                              {totalOriginalPrice.toLocaleString('vi-VN')} đ
                            </Text>
                            <Tag color="red" style={{ fontSize: '10px', fontWeight: 700, borderRadius: '4px', margin: 0, padding: '0 4px', border: 'none' }}>
                              -{discountPercent}%
                            </Tag>
                          </div>
                        )}
                      </div>
                      {plan.originalPrice && (
                        <div style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: 700, marginTop: '2px' }}>
                          Tiết kiệm ngay {(totalOriginalPrice - totalPrice).toLocaleString('vi-VN')} đ!
                        </div>
                      )}

                      <Space direction="vertical" size={0} style={{ width: '100%', marginTop: '6px' }}>
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
                      <Text type="secondary" style={{ fontSize: '10.5px', color: '#64748b', display: 'block', marginTop: '6px', fontStyle: 'italic', fontWeight: 500 }}>
                        * Nhận bộ quà tặng trị giá 750.000 đ đi kèm!
                      </Text>
                    </div>

                    {/* Thanh tiến trình hiển thị số suất giới hạn đồng nhất (Scarcity Progress Bar) */}
                    {plan.slotsLeftText && (() => {
                      // Trích xuất phần trăm lấp đầy dựa trên thông điệp
                      let percent = 80;
                      if (plan.title === 'Gói Landing Page') percent = 80;
                      else if (plan.title === 'Gói Clone & Vibe') percent = 70;
                      else if (plan.title === 'Gói Cơ Bản') percent = 80;
                      else if (plan.title === 'Gói Phổ Biến') percent = 85;
                      else if (plan.title === 'Gói Cao Cấp') percent = 80;

                      return (
                        <div style={{ marginTop: '10px', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11.5px', color: plan.color, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ThunderboltOutlined className="animate-pulse" />
                              {plan.slotsLeftText}
                            </span>
                          </div>
                          {/* Thanh tiến trình lấp đầy đẹp mắt */}
                          <div style={{ width: '100%', height: '6px', background: `${plan.color}15`, borderRadius: '4px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${percent}%`, 
                                height: '100%', 
                                background: `linear-gradient(90deg, ${plan.color}cc 0%, ${plan.color} 100%)`, 
                                borderRadius: '4px',
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })()}

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
                            label: `${d.suffix} ${d.isFree ? '(Miễn phí)' : `(+${d.price.toLocaleString('vi-VN')} đ)`}`
                          }))}
                        />
                      </div>

                      <div>
                        <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: '#475569' }}>
                          Gói Hosting đi kèm:
                        </Text>
                        <Select
                          value={selectedHostings[plan.title] || 'pro01'}
                          onChange={(val) => setSelectedHostings(prev => ({ ...prev, [plan.title]: val }))}
                          style={{ width: '100%' }}
                          options={HOSTING_OPTIONS.map(h => ({
                            value: h.key,
                            label: `${h.name} ${h.extraPrice === 0 ? '(Miễn phí)' : `(+${h.extraPrice.toLocaleString('vi-VN')} đ)`}`
                          }))}
                        />
                        {/* Specs info tag list */}
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {hostingOpt?.specs.split(' | ').map((spec: string, idx: number) => {
                            let color = 'default';
                            if (spec.toLowerCase().includes('ssd') || spec.toLowerCase().includes('nvme')) color = 'cyan';
                            else if (spec.toLowerCase().includes('gb') || spec.toLowerCase().includes('ram')) color = 'geekblue';
                            else if (spec.toLowerCase().includes('core') || spec.toLowerCase().includes('cpu')) color = 'gold';
                            return (
                              <Tag key={idx} color={color} style={{ fontSize: '10px', margin: 0, borderRadius: '4px', fontWeight: 600 }}>
                                {spec}
                              </Tag>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Tạm ẩn danh sách tính năng dài dòng trên slide card (đã hiển thị chi tiết trong Modal) */}
                  </div>

                  {/* Nút Hành động */}
                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        </Carousel>
      </div>

      {/* Trust section / banner */}
      <Card
        bordered={false}
        className="glass-panel"
        style={{
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          padding: '20px 16px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(245, 158, 11, 0.02) 100%)',
          border: '1px solid rgba(0,0,0,0.03)',
        }}
      >
        <div className="trust-row-container">
          <div className="trust-item">
            <PhoneOutlined style={{ color: '#6366f1', fontSize: '16px' }} />
            <Text strong style={{ fontSize: '14.5px', color: '#1e293b' }}>
              Hotline tư vấn nhanh: <span style={{ color: '#6366f1' }}>0815.483.669</span>
            </Text>
          </div>
          <Divider className="trust-divider" type="vertical" style={{ background: '#cbd5e1', height: '20px', margin: 0 }} />
          <div className="trust-item">
            <MessageOutlined style={{ color: '#10b981', fontSize: '16px' }} />
            <Text strong style={{ fontSize: '14.5px', color: '#1e293b' }}>
              Zalo hỗ trợ: <a href="https://zalo.me/0815483669" target="_blank" rel="noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>zalo.me/0815483669</a>
            </Text>
          </div>
        </div>
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

          const selectedHostKey = selectedHostings[plan.title] || 'pro01';
          const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
          const hostingExtraPrice = hostingOpt ? hostingOpt.extraPrice : 0;

          const totalPrice = plan.price + domainPrice + hostingExtraPrice;
          const totalOriginalPrice = (plan.originalPrice || plan.price) + domainPrice + hostingExtraPrice;
          const discountPercent = plan.originalPrice 
            ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) 
            : 0;

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
                      feat.includes('yêu cầu') ||
                      feat.includes('độc quyền');

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
              <div className="modal-header-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9', gap: '12px' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '10px', textTransform: 'uppercase', display: 'block', letterSpacing: '0.5px' }}>
                    Tổng Chi Phí Tạm Tính
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <Title level={4} style={{ margin: 0, color: plan.color, fontWeight: 800, fontSize: '20px' }}>
                      {totalPrice.toLocaleString('vi-VN')} đ
                    </Title>
                    {plan.originalPrice && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Text delete type="secondary" style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {totalOriginalPrice.toLocaleString('vi-VN')} đ
                        </Text>
                        <Tag color="red" style={{ fontSize: '9px', fontWeight: 700, borderRadius: '4px', margin: 0, padding: '0 4px', border: 'none' }}>
                          -{discountPercent}%
                        </Tag>
                      </div>
                    )}
                  </div>
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

              {/* Dropdowns Cấu hình Tên miền & Hosting */}
              <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col xs={24} sm={12}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9', height: '100%' }}>
                    <Text strong style={{ fontSize: '11.5px', display: 'block', marginBottom: '4px', color: '#475569' }}>Tên miền:</Text>
                    <Select
                      value={selectedSuffix}
                      onChange={(val) => setSelectedDomains(prev => ({ ...prev, [plan.title]: val }))}
                      style={{ width: '100%' }}
                      options={DOMAIN_OPTIONS.map(d => ({
                        value: d.suffix,
                        label: `${d.suffix} ${d.isFree ? '(Miễn phí)' : `(+${d.price.toLocaleString('vi-VN')} đ)`}`
                      }))}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9', height: '100%' }}>
                    <Text strong style={{ fontSize: '11.5px', display: 'block', marginBottom: '4px', color: '#475569' }}>SSD Hosting (12 tháng):</Text>
                    <Select
                      value={selectedHostings[plan.title] || 'pro01'}
                      onChange={(val) => setSelectedHostings(prev => ({ ...prev, [plan.title]: val }))}
                      style={{ width: '100%' }}
                      options={HOSTING_OPTIONS.map(h => ({
                        value: h.key,
                        label: `${h.name} ${h.extraPrice === 0 ? '(Miễn phí)' : `(+${h.extraPrice.toLocaleString('vi-VN')} đ)`}`
                      }))}
                    />
                  </div>
                </Col>
              </Row>

              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  {renderFeatureList(col1Features, 'TÍNH NĂNG GIAO DIỆN & KỸ THUẬT', plan.color)}
                </Col>
                <Col xs={24} md={12}>
                  {renderFeatureList(col2Features, 'DỊCH VỤ & CAM KẾT VÀNG', plan.color)}
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
