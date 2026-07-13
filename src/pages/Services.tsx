import React, { useState, useEffect, useRef } from 'react';
// Import các UI Components từ thư viện Ant Design
import { Row, Col, Card, Button, Typography, Space, Divider, Select, Modal, Tag, Carousel, Checkbox, Form, Input, message } from 'antd';
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
  RightOutlined,
  PlusOutlined
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
 * Interface cấu trúc dữ liệu cho mỗi tùy chọn dịch vụ mở rộng thêm
 */
interface ExtraServiceOption {
  key: string;
  name: string;
  price: number;
  isStoreOnly?: boolean;
}

// Danh sách các dịch vụ mở rộng chọn thêm
const EXTRA_SERVICES: ExtraServiceOption[] = [
  { key: 'lang', name: 'Cài đặt đa ngôn ngữ', price: 100000 },
  { key: 'affiliate', name: 'Affiliate (Tiếp thị liên kết)', price: 100000, isStoreOnly: true },
  { key: 'wallet', name: 'Ví điện tử', price: 200000, isStoreOnly: true },
  { key: 'ordermng', name: 'Quản lý đơn hàng và thống kê cao cấp', price: 100000, isStoreOnly: true },
  { key: 'pdfinvoice', name: 'Xuất hóa đơn PDF / In máy', price: 100000, isStoreOnly: true },
  { key: 'flashsale', name: 'Flash Sale (Giờ vàng giá sốc)', price: 200000, isStoreOnly: true },
  { key: 'gglogin', name: 'Đăng nhập / Đăng ký bằng Google', price: 100000, isStoreOnly: true },
  { key: 'telesync', name: 'Gửi thông tin đơn hàng qua Tele', price: 50000, isStoreOnly: true },
];

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
  { key: 'basic01', name: 'Host Basic 01', price12m: 250000, extraPrice: 0, specs: 'CPU 2 Core | RAM 2GB | SSD 1GB' },
  { key: 'basic02', name: 'Host Basic 02', price12m: 500000, extraPrice: 250000, specs: 'CPU 2 Core | RAM 3GB | SSD 3GB' },
  { key: 'basic03', name: 'Host Basic 03', price12m: 1000000, extraPrice: 750000, specs: 'CPU 3 Core | RAM 3GB | SSD 6GB' },
  { key: 'basic04', name: 'Host Basic 04', price12m: 1400000, extraPrice: 1150000, specs: 'CPU 4 Core | RAM 4GB | SSD 10GB' },
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

// Định nghĩa 5 gói dịch vụ thiết kế website với giá bán thực tế tối thiểu và giá gốc chiết khấu 25-29%
const PLANS: PricingPlan[] = [
  {
    title: 'Gói Landing Page',
    price: 800000, // Giá bán mới: 800k (phù hợp phễu thu hút khách chạy QC, giới thiệu sản phẩm đơn giản)
    originalPrice: 1100000, // Giá gốc: 1.1M (~27% giảm giá)
    description: 'Tối ưu cho doanh nghiệp, cá nhân cần trang Landing Page đơn phục vụ chạy quảng cáo, giới thiệu sản phẩm, dịch vụ.',
    icon: <RocketOutlined style={{ fontSize: '28px', color: '#06b6d4' }} />,
    color: '#06b6d4',
    isPopular: true,
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
    price: 1300000, // Giá bán mới: 1tr3 (tối ưu cho khách hàng muốn làm web sao chép giao diện mẫu có sẵn)
    originalPrice: 1800000, // Giá gốc: 1.8M (~28% giảm giá)
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
    price: 1500000, // Giá bán mới: 1tr5 (lựa chọn cân bằng nhất cho các website giới thiệu công ty/dịch vụ)
    originalPrice: 2100000, // Giá gốc: 2.1M (~28% giảm giá)
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
    title: 'Gói Bán Hàng',
    price: 2300000, // Giá bán mới: 2tr3 (giá siêu cạnh tranh cho cửa hàng eCommerce tích hợp thanh toán tự động)
    originalPrice: 3200000, // Giá gốc: 3.2M (~28% giảm giá)
    description: 'Giải pháp tối ưu cho việc mở các shop, cửa hàng bán hàng chuyên nghiệp có tích hợp giỏ hàng và thanh toán trực tuyến.',
    icon: <FireOutlined style={{ fontSize: '28px', color: '#6366f1' }} />,
    color: '#6366f1',
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
    price: 6000000, // Giá bán mới: 6tr (gói thiết kế độc quyền Figma, custom từ A-Z cho phân khúc VIP)
    originalPrice: 8500000, // Giá gốc: 8.5M (~29% giảm giá)
    description: 'Thiết kế độc quyền, lập trình trực tiếp từ bản vẽ thiết kế Figma (chuyển thiết kế Figma thành Html/css/js). Tốc độ cực hạn.',
    icon: <CrownOutlined style={{ fontSize: '28px', color: '#f59e0b' }} />,
    color: '#f59e0b',
    slotsLeftText: 'Đã nhận 4/5 suất ưu đãi (Còn 1 slot)!',
    features: [
      'Lập trình giao diện riêng biệt từ bản vẽ Figma (chuyển thiết kế Figma thành Html/css/js)',
      'Clone giao diện từ website mẫu hoặc thiết kế theo yêu cầu',
      'Không giới hạn số lượng trang nội dung',
      'Hỗ trợ cấu hình đa ngôn ngữ miễn phí', // Đổi từ (+200k) thành miễn phí để khớp đồng bộ với bảng so sánh tính năng
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
    'Gói Bán Hàng': '.top',
    'Gói Cao Cấp': '.top',
  });

  // State quản lý gói hosting được chọn cho từng gói
  const [selectedHostings, setSelectedHostings] = useState<Record<string, string>>({
    'Gói Clone & Vibe': 'basic01',
    'Gói Landing Page': 'basic01',
    'Gói Cơ Bản': 'basic01',
    'Gói Bán Hàng': 'basic01',
    'Gói Cao Cấp': 'basic01',
  });

  // State quản lý xem gói dịch vụ đó khách hàng đã có tên miền & hosting hay chưa để trừ 200k
  const [hasDomainHosting, setHasDomainHosting] = useState<Record<string, boolean>>({
    'Gói Clone & Vibe': false,
    'Gói Landing Page': false,
    'Gói Cơ Bản': false,
    'Gói Bán Hàng': false,
    'Gói Cao Cấp': false,
  });

  const [openModalPlan, setOpenModalPlan] = useState<PricingPlan | null>(null);
  // State quản lý gói đang được chọn để đăng ký nhanh qua Form
  const [openRegisterPlan, setOpenRegisterPlan] = useState<PricingPlan | null>(null);
  // State ẩn/hiện Modal báo cáo đăng ký thành công
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // State lưu trữ dữ liệu tóm tắt đăng ký để hiển thị lên popup thành công
  const [registerSummary, setRegisterSummary] = useState<any>(null);
  // State quản lý trạng thái đang gửi form để tránh click liên tục nhiều lần (double submit)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State quản lý các dịch vụ mở rộng được chọn cho từng gói
  const [selectedExtras, setSelectedExtras] = useState<Record<string, string[]>>({
    'Gói Clone & Vibe': [],
    'Gói Landing Page': [],
    'Gói Cơ Bản': [],
    'Gói Bán Hàng': [],
    'Gói Cao Cấp': [],
  });

  // State điều khiển gói đang được mở popup chọn dịch vụ mở rộng
  const [activeExtraPlan, setActiveExtraPlan] = useState<PricingPlan | null>(null);

  // Hàm tính toán số giây còn lại từ thời điểm hiện tại đến cuối tháng hiện tại (23:59:59 của ngày cuối tháng)
  const getSecondsToEndOfMonth = () => {
    const now = new Date();
    // Tạo mốc thời gian cuối cùng của tháng hiện tại (ngày 0 của tháng tiếp theo = ngày cuối cùng tháng này)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return Math.max(0, Math.floor((endOfMonth.getTime() - now.getTime()) / 1000));
  };

  // Hàm gửi thông báo đăng ký qua Telegram Bot sử dụng Fetch API, trả về trạng thái gửi thành công
  const sendTelegramNotification = (data: any): Promise<boolean> => {
    const token = '8619393926:AAHdWD6I1foQ507QXud0r2rrpnlljWq6ANM';
    const chatId = '-5578329672';
    
    const messageText = `<b>🔔 YÊU CẦU ĐĂNG KÝ WEBSITE MỚI</b>\n` +
      `──────────────────\n` +
      `<b>📦 Gói dịch vụ:</b> ${data.planTitle}\n` +
      `<b>👤 Khách hàng:</b> ${data.fullName}\n` +
      `<b>🌐 Tên miền đăng ký:</b> ${data.domain}\n` +
      `<b>ℹ️ Chi tiết tên miền:</b> ${data.domainDetail}\n` +
      `<b>🚀 Gói Hosting đi kèm:</b> ${data.hostingDetail}\n` +
      `<b>➕ Dịch vụ mở rộng:</b> ${data.extrasDetail}\n` +
      `<b>📱 Số Zalo:</b> ${data.zaloPhone}\n` +
      `<b>💼 Lĩnh vực:</b> ${data.websiteField}\n` +
      `<b>💰 Tạm tính:</b> ${data.price.toLocaleString('vi-VN')} đ\n` +
      `<b>📝 Ghi chú:</b> ${data.notes}\n` +
      `──────────────────\n` +
      `<i>Hệ thống WPHub Auto-Notification</i>`;

    return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    })
    .then(response => {
      if (!response.ok) {
        console.error('Lỗi gửi tin nhắn Telegram:', response.statusText);
        return false;
      }
      return true;
    })
    .catch(error => {
      console.error('Lỗi kết nối Telegram API:', error);
      return false;
    });
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
            const isOwned = hasDomainHosting[plan.title] || false;
            const selectedSuffix = selectedDomains[plan.title] || '.top';
            const domainOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
            const domainPrice = isOwned ? 0 : (domainOpt ? domainOpt.price : 0);

            const selectedHostKey = selectedHostings[plan.title] || 'basic01';
            const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
            const hostingExtraPrice = isOwned ? 0 : (hostingOpt ? hostingOpt.extraPrice : 0);

            const basePrice = isOwned ? (plan.price - 200000) : plan.price;
            const baseOriginalPrice = isOwned ? ((plan.originalPrice || plan.price) - 200000) : (plan.originalPrice || plan.price);

            const extraServicesPrice = (selectedExtras[plan.title] || []).reduce((sum, key) => {
              const svc = EXTRA_SERVICES.find(s => s.key === key);
              return sum + (svc ? svc.price : 0);
            }, 0);

            const totalPrice = basePrice + domainPrice + hostingExtraPrice + extraServicesPrice;
            const totalOriginalPrice = baseOriginalPrice + domainPrice + hostingExtraPrice + extraServicesPrice;
            const discountPercent = plan.originalPrice 
              ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) 
              : 0;

            const selectedExtrasNames = (selectedExtras[plan.title] || [])
              .map(key => EXTRA_SERVICES.find(s => s.key === key)?.name)
              .filter(Boolean)
              .join(', ');
            const extrasMessagePart = selectedExtrasNames ? `, kèm dịch vụ thêm: ${selectedExtrasNames}` : '';

            // Tạo nội dung tin nhắn gửi Zalo soạn sẵn
            const zaloMessage = isOwned
              ? `Chào WPHub, mình muốn đăng ký tư vấn ${plan.title}${extrasMessagePart}. Mình đã tự chuẩn bị tên miền & hosting (Giảm trừ gói hạ tầng 200k). Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`
              : `Chào WPHub, mình muốn đăng ký tư vấn ${plan.title} sử dụng tên miền đuôi ${selectedSuffix} và gói ${hostingOpt?.name}${extrasMessagePart}. Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`;
            const zaloUrl = `https://zalo.me/0815483669?text=${encodeURIComponent(zaloMessage)}`;

            // Hợp nhất các cam kết và các thông số được chọn động
            const displayFeatures = isOwned ? plan.features : [
              `Tặng kèm ${hostingOpt?.name} (${hostingOpt?.specs})`,
              `Hỗ trợ tên miền miễn phí đuôi ${selectedSuffix}`,
              ...plan.features
            ];

            return (
              <div key={plan.title} style={{ height: '100%' }}>
                <Card
                  hoverable
                  variant="borderless"
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
                      else if (plan.title === 'Gói Bán Hàng') percent = 85; // Thay thế Gói Phổ Biến bằng Gói Bán Hàng để khớp với cấu trúc gói thực tế
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

                    {/* Checkbox Đã có Tên miền & Hosting */}
                    <div style={{ marginBottom: '12px' }}>
                      <Checkbox
                        checked={isOwned}
                        onChange={(e) => setHasDomainHosting(prev => ({ ...prev, [plan.title]: e.target.checked }))}
                        style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}
                      >
                        Tôi đã có Tên miền & Hosting riêng
                      </Checkbox>
                    </div>

                    {isOwned && (
                      <div style={{ marginBottom: '14px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px dashed #10b981' }}>
                        <Text style={{ fontSize: '11.5px', color: '#047857', fontWeight: 600, display: 'block' }}>
                          ✓ Giảm trừ gói hạ tầng 200.000 đ
                        </Text>
                      </div>
                    )}

                    {/* Dropdowns Cấu hình Tên miền & Hosting */}
                    <div style={{ 
                      marginBottom: '16px', 
                      background: '#f8fafc', 
                      padding: '12px', 
                      borderRadius: '12px', 
                      border: '1px solid #f1f5f9', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      opacity: isOwned ? 0.5 : 1,
                      pointerEvents: isOwned ? 'none' : 'auto'
                    }}>
                      <div>
                        <Text strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px', color: '#475569' }}>
                          Đuôi tên miền đi kèm:
                        </Text>
                        <Select
                          disabled={isOwned}
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
                          disabled={isOwned}
                          value={selectedHostings[plan.title] || 'basic01'}
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

                    {/* Dịch vụ mở rộng (Chọn thêm) */}
                    <div style={{ marginBottom: '16px' }}>
                      <Button
                        type="dashed"
                        block
                        onClick={() => setActiveExtraPlan(plan)}
                        icon={<PlusOutlined />}
                        style={{
                          height: '38px',
                          borderRadius: '12px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          color: plan.color,
                          borderColor: plan.color,
                          background: `${plan.color}03`,
                        }}
                      >
                        {selectedExtras[plan.title]?.length > 0 
                          ? `Đã chọn ${selectedExtras[plan.title].length} dịch vụ mở rộng`
                          : 'Dịch vụ mở rộng (Chọn thêm)'
                        }
                      </Button>
                      {/* Hiển thị các tag tính năng đã chọn nếu có */}
                      {selectedExtras[plan.title]?.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {selectedExtras[plan.title].map(key => {
                            const svc = EXTRA_SERVICES.find(s => s.key === key);
                            return svc ? (
                              <Tag key={key} closable onClose={(e) => {
                                e.preventDefault();
                                setSelectedExtras(prev => ({
                                  ...prev,
                                  [plan.title]: prev[plan.title].filter(k => k !== key)
                                }));
                              }} color="purple" style={{ fontSize: '10.5px', borderRadius: '4px', margin: 0 }}>
                                {svc.name}
                              </Tag>
                            ) : null;
                          })}
                        </div>
                      )}
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
                      type="default"
                      size="middle"
                      block
                      href={zaloUrl}
                      target="_blank"
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        borderColor: plan.color,
                        color: plan.color,
                      }}
                    >
                      Tư Vấn Ngay
                    </Button>
                    <Button
                      type="primary"
                      size="middle"
                      block
                      onClick={() => setOpenRegisterPlan(plan)}
                      style={{
                        height: '38px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        background: plan.color,
                        borderColor: plan.color,
                      }}
                    >
                      Đăng Ký Ngay
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </Carousel>
      </div>

      <style>{`
        .comparison-table-wrapper {
          overflow-x: auto;
          margin-bottom: 48px;
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          background: #fff;
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 800px;
        }
        .comparison-table th, .comparison-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 13px;
        }
        .comparison-table th {
          background: #f8fafc;
          font-weight: 700;
          color: #1e293b;
        }
        .comparison-table tr.category-row td {
          background: #f1f5f9 !important;
          font-weight: 800;
          color: #475569;
          font-size: 11.5px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 10px 16px;
        }
        .comparison-table td.feature-name {
          font-weight: 600;
          color: #334155;
          background: #fff;
        }
        .comparison-table th.feature-name-header {
          background: #f8fafc;
        }
        .comparison-table td.plan-cell {
          text-align: center;
          color: #475569;
        }
        .comparison-table tr:hover td {
          background-color: #f8fafc;
        }
        .comparison-table tr:hover td.feature-name {
          background-color: #f8fafc;
        }
      `}</style>

      {/* Bảng so sánh chi tiết các gói */}
      <div style={{ marginTop: '32px', marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={3} style={{ fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
            Bảng So Sánh Chi Tiết Các Gói
          </Title>
          <Text type="secondary" style={{ fontSize: '14px', color: '#64748b' }}>
            So sánh chi tiết từng hạng mục thiết kế, tính năng và cam kết dịch vụ giữa các gói để đưa ra lựa chọn phù hợp nhất
          </Text>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th className="feature-name-header" style={{ width: '220px' }}>Hạng mục so sánh</th>
                <th style={{ textAlign: 'center', color: '#06b6d4' }}>Gói Landing Page</th>
                <th style={{ textAlign: 'center', color: '#8b5cf6' }}>Gói Clone & Vibe</th>
                <th style={{ textAlign: 'center', color: '#10b981' }}>Gói Cơ Bản</th>
                <th style={{ textAlign: 'center', color: '#6366f1' }}>Gói Bán Hàng</th>
                <th style={{ textAlign: 'center', color: '#f59e0b' }}>Gói Cao Cấp</th>
              </tr>
            </thead>
            <tbody>
              {/* Category: THIẾT KẾ & LAYOUT */}
              <tr className="category-row">
                <td colSpan={6} className="feature-name">Thiết kế & Layout</td>
              </tr>
              <tr>
                <td className="feature-name">Số lượng trang tối đa</td>
                <td className="plan-cell">1 trang Landing Page</td>
                <td className="plan-cell">Tùy theo mẫu clone</td>
                <td className="plan-cell">5 trang cơ bản</td>
                <td className="plan-cell">10 trang bán hàng</td>
                <td className="plan-cell">Không giới hạn</td>
              </tr>
              <tr>
                <td className="feature-name">Nền tảng & Theme sử dụng</td>
                <td className="plan-cell">WordPress + Theme LX Landing</td>
                <td className="plan-cell">WordPress (Custom/Clone)</td>
                <td className="plan-cell">WordPress + Theme LX Landing</td>
                <td className="plan-cell">WordPress + Theme LX Landing</td>
                <td className="plan-cell">Figma to Code hoặc Thiết kế riêng</td>
              </tr>
              <tr>
                <td className="feature-name">Tương thích di động (Responsive)</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Giao diện kéo thả trực quan</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell" style={{ color: '#94a3b8' }}>Nhập liệu qua Custom Fields</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell">Custom Fields & Elementor</td>
              </tr>

              {/* Category: TÍNH NĂNG TÍCH HỢP */}
              <tr className="category-row">
                <td colSpan={6} className="feature-name">Tính năng tích hợp</td>
              </tr>
              <tr>
                <td className="feature-name">Liên hệ / Đăng ký qua Form</td>
                <td className="plan-cell">Gửi Email, Zalo hoặc Google Sheets</td>
                <td className="plan-cell">Gửi Email / Form cơ bản</td>
                <td className="plan-cell">Gửi Email / Form liên hệ</td>
                <td className="plan-cell">Form liên hệ & Tài khoản khách hàng</td>
                <td className="plan-cell">Đa dạng, kết nối CRM/API yêu cầu</td>
              </tr>
              <tr>
                <td className="feature-name">Tích hợp giỏ hàng & đặt hàng</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Thanh toán tự động QR (VNPay, SePay)</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell" style={{ color: '#cbd5e1' }}>—</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Đa ngôn ngữ (Polylang)</td>
                <td className="plan-cell" style={{ color: '#64748b' }}>Hỗ trợ (+200k)</td>
                <td className="plan-cell" style={{ color: '#64748b' }}>Hỗ trợ (+200k)</td>
                <td className="plan-cell" style={{ color: '#64748b' }}>Hỗ trợ (+200k)</td>
                <td className="plan-cell" style={{ color: '#64748b' }}>Hỗ trợ (+200k)</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>

              {/* Category: HẠ TẦNG & QUÀ TẶNG */}
              <tr className="category-row">
                <td colSpan={6} className="feature-name">Hạ tầng & Quà tặng</td>
              </tr>
              <tr>
                <td className="feature-name">Tên miền quốc tế miễn phí</td>
                <td className="plan-cell">Tặng đuôi .top (1 năm đầu)</td>
                <td className="plan-cell">Tặng đuôi .top (1 năm đầu)</td>
                <td className="plan-cell">Tặng đuôi .top (1 năm đầu)</td>
                <td className="plan-cell">Tặng đuôi .top (1 năm đầu)</td>
                <td className="plan-cell">Tặng đuôi .top (1 năm đầu)</td>
              </tr>
              <tr>
                <td className="feature-name">Hosting SSD tốc độ cao</td>
                <td className="plan-cell">Tặng gói Basic 01 (12 tháng)</td>
                <td className="plan-cell">Tặng gói Basic 01 (12 tháng)</td>
                <td className="plan-cell">Tặng gói Basic 01 (12 tháng)</td>
                <td className="plan-cell">Tặng gói Basic 01 (12 tháng)</td>
                <td className="plan-cell">Tặng gói Basic 01 (12 tháng)</td>
              </tr>

              {/* Category: BẢO HÀNH & HỖ TRỢ */}
              <tr className="category-row">
                <td colSpan={6} className="feature-name">Bảo hành & Hỗ trợ</td>
              </tr>
              <tr>
                <td className="feature-name">Thời gian hoàn thành dự tính</td>
                <td className="plan-cell" style={{ fontWeight: 600 }}>2 - 3 ngày</td>
                <td className="plan-cell" style={{ fontWeight: 600 }}>3 - 5 ngày</td>
                <td className="plan-cell" style={{ fontWeight: 600 }}>3 - 5 ngày</td>
                <td className="plan-cell" style={{ fontWeight: 600 }}>5 - 7 ngày</td>
                <td className="plan-cell" style={{ fontWeight: 600 }}>10 - 15 ngày</td>
              </tr>
              <tr>
                <td className="feature-name">Bảo hành & Hỗ trợ kỹ thuật</td>
                <td className="plan-cell">12 tháng</td>
                <td className="plan-cell">12 tháng</td>
                <td className="plan-cell">12 tháng</td>
                <td className="plan-cell">12 tháng</td>
                <td className="plan-cell">12 tháng</td>
              </tr>
              <tr>
                <td className="feature-name">Sao lưu (Backup) hàng tuần</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Tối ưu tốc độ PageSpeed (GSI &gt; 80)</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Cấu hình bảo mật chống Spam/Brute force</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
              <tr>
                <td className="feature-name">Bàn giao toàn bộ Source code & Quản trị</td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
                <td className="plan-cell"><CheckOutlined style={{ color: '#10b981', fontSize: '15px', fontWeight: 900 }} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust section / banner */}
      <Card
        variant="borderless"
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

      {/* Modal lựa chọn Dịch vụ mở rộng (Chọn thêm) */}
      <Modal
        title={
          activeExtraPlan ? (
            <Space align="center" style={{ paddingBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${activeExtraPlan.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <PlusOutlined style={{ color: activeExtraPlan.color, fontSize: '16px' }} />
              </div>
              <Text strong style={{ fontSize: '16px', display: 'block', color: '#1e293b' }}>
                Chọn Dịch Vụ Mở Rộng - {activeExtraPlan.title}
              </Text>
            </Space>
          ) : null
        }
        open={!!activeExtraPlan}
        onCancel={() => setActiveExtraPlan(null)}
        footer={[
          <Button 
            key="ok" 
            type="primary" 
            onClick={() => setActiveExtraPlan(null)} 
            style={{ 
              borderRadius: '8px', 
              background: activeExtraPlan?.color, 
              borderColor: activeExtraPlan?.color,
              fontWeight: 600,
              padding: '0 24px',
              height: '38px'
            }}
          >
            Đồng ý
          </Button>
        ]}
        centered
        width={500}
        zIndex={1100}
      >
        {activeExtraPlan && (() => {
          const plan = activeExtraPlan;
          const currentSelected = selectedExtras[plan.title] || [];
          
          const handleToggle = (key: string) => {
            setSelectedExtras(prev => {
              const list = prev[plan.title] || [];
              if (list.includes(key)) {
                return { ...prev, [plan.title]: list.filter(k => k !== key) };
              } else {
                return { ...prev, [plan.title]: [...list, key] };
              }
            });
          };

          const isStorePlan = plan.title === 'Gói Bán Hàng' || plan.title === 'Gói Cao Cấp';
          const availableServices = EXTRA_SERVICES.filter(svc => !svc.isStoreOnly || isStorePlan);

          return (
            <div style={{ padding: '12px 0 4px 0' }}>
              <Paragraph style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Vui lòng tích chọn các tính năng, giải pháp nâng cấp bạn mong muốn tích hợp thêm cho website của mình:
              </Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {availableServices.map(svc => {
                  const isChecked = currentSelected.includes(svc.key);
                  return (
                    <div 
                      key={svc.key} 
                      onClick={() => handleToggle(svc.key)}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        background: isChecked ? `${plan.color}08` : '#f8fafc', 
                        borderRadius: '12px', 
                        border: isChecked ? `1.5px solid ${plan.color}` : '1.5px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        userSelect: 'none'
                      }}
                      className="extra-service-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Custom checkbox box */}
                        <div style={{ 
                          width: '18px', 
                          height: '18px', 
                          border: isChecked ? `2px solid ${plan.color}` : '2px solid #cbd5e1', 
                          borderRadius: '4px',
                          background: isChecked ? plan.color : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          transition: 'all 0.15s'
                        }}>
                          {isChecked && <CheckOutlined style={{ color: '#fff', fontSize: '10px', fontWeight: 900 }} />}
                        </div>
                        <span style={{ fontWeight: 650, color: '#1e293b', fontSize: '13.5px' }}>{svc.name}</span>
                      </div>
                      <Tag color={isChecked ? 'purple' : 'default'} style={{ fontSize: '12.5px', fontWeight: 700, borderRadius: '6px', margin: 0, padding: '2px 8px' }}>
                        +{svc.price.toLocaleString('vi-VN')} đ
                      </Tag>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Modal>

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
          const isOwned = hasDomainHosting[plan.title] || false;
          const selectedSuffix = selectedDomains[plan.title] || '.top';
          const domainOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
          const domainPrice = isOwned ? 0 : (domainOpt ? domainOpt.price : 0);

          const selectedHostKey = selectedHostings[plan.title] || 'basic01';
          const hostingOpt = HOSTING_OPTIONS.find(h => h.key === selectedHostKey);
          const hostingExtraPrice = isOwned ? 0 : (hostingOpt ? hostingOpt.extraPrice : 0);

          const basePrice = isOwned ? (plan.price - 200000) : plan.price;
          const baseOriginalPrice = isOwned ? ((plan.originalPrice || plan.price) - 200000) : (plan.originalPrice || plan.price);

          const extraServicesPrice = (selectedExtras[plan.title] || []).reduce((sum, key) => {
            const svc = EXTRA_SERVICES.find(s => s.key === key);
            return sum + (svc ? svc.price : 0);
          }, 0);

          const totalPrice = basePrice + domainPrice + hostingExtraPrice + extraServicesPrice;
          const totalOriginalPrice = baseOriginalPrice + domainPrice + hostingExtraPrice + extraServicesPrice;
          const discountPercent = plan.originalPrice 
            ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) 
            : 0;

          const selectedExtrasNames = (selectedExtras[plan.title] || [])
            .map(key => EXTRA_SERVICES.find(s => s.key === key)?.name)
            .filter(Boolean)
            .join(', ');
          const extrasMessagePart = selectedExtrasNames ? `, kèm dịch vụ thêm: ${selectedExtrasNames}` : '';

          const zaloMessage = isOwned 
            ? `Chào WPHub, mình muốn đăng ký tư vấn ${plan.title}${extrasMessagePart}. Mình đã tự chuẩn bị tên miền & hosting (Giảm trừ gói hạ tầng 200k). Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`
            : `Chào WPHub, mình muốn đăng ký tư vấn ${plan.title} sử dụng tên miền đuôi ${selectedSuffix} và gói ${hostingOpt?.name}${extrasMessagePart}. Tổng chi phí dự tính là ${totalPrice.toLocaleString('vi-VN')} đ.`;
          const zaloUrl = `https://zalo.me/0815483669?text=${encodeURIComponent(zaloMessage)}`;

          const displayFeatures = isOwned ? plan.features : [
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
              {plan.description && (
                <div style={{ marginBottom: '16px', padding: '0 8px' }}>
                  <Text style={{ fontSize: '13.5px', color: '#475569', display: 'block', lineHeight: 1.5 }}>
                    {plan.description}
                  </Text>
                </div>
              )}
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
                    {isOwned ? 'Tự chuẩn bị Tên miền & Hosting (Giảm trừ gói hạ tầng 200k)' : `Bao gồm: ${hostingOpt?.name} & Tên miền ${selectedSuffix}`}
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    type="default"
                    size="middle"
                    href={zaloUrl}
                    target="_blank"
                    style={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      height: '38px',
                      borderColor: plan.color,
                      color: plan.color,
                    }}
                  >
                    Tư Vấn Ngay
                  </Button>
                  <Button
                    type="primary"
                    size="middle"
                    onClick={() => {
                      setOpenModalPlan(null);
                      setOpenRegisterPlan(plan);
                    }}
                    style={{
                      borderRadius: '8px',
                      fontWeight: 600,
                      height: '38px',
                      background: plan.color,
                      borderColor: plan.color,
                    }}
                  >
                    Đăng Ký Ngay
                  </Button>
                </div>
              </div>

              {/* Checkbox Đã có Tên miền & Hosting riêng */}
              <div style={{ marginBottom: '12px' }}>
                <Checkbox
                  checked={isOwned}
                  onChange={(e) => setHasDomainHosting(prev => ({ ...prev, [plan.title]: e.target.checked }))}
                  style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}
                >
                  Tôi đã có Tên miền & Hosting riêng
                </Checkbox>
              </div>

              {isOwned && (
                <div style={{ marginBottom: '14px', padding: '8px 12px', background: '#ecfdf5', borderRadius: '8px', border: '1px dashed #10b981' }}>
                  <Text style={{ fontSize: '12px', color: '#047857', fontWeight: 600, display: 'block' }}>
                    ✓ Giảm trừ gói hạ tầng 200.000 đ vào tổng chi phí tạm tính
                  </Text>
                </div>
              )}

              {/* Dropdowns Cấu hình Tên miền & Hosting */}
              <Row gutter={[16, 16]} style={{ marginBottom: '16px', opacity: isOwned ? 0.5 : 1, pointerEvents: isOwned ? 'none' : 'auto' }}>
                <Col xs={24} sm={12}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '12px', border: '1px solid #f1f5f9', height: '100%' }}>
                    <Text strong style={{ fontSize: '11.5px', display: 'block', marginBottom: '4px', color: '#475569' }}>Tên miền:</Text>
                    <Select
                      disabled={isOwned}
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
                      disabled={isOwned}
                      value={selectedHostings[plan.title] || 'basic01'}
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

              {/* Dịch vụ mở rộng (Chọn thêm) */}
              <div style={{ marginBottom: '16px' }}>
                <Button
                  type="dashed"
                  block
                  onClick={() => setActiveExtraPlan(plan)}
                  icon={<PlusOutlined />}
                  style={{
                    height: '38px',
                    borderRadius: '12px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: plan.color,
                    borderColor: plan.color,
                    background: `${plan.color}03`,
                  }}
                >
                  {selectedExtras[plan.title]?.length > 0 
                    ? `Đã chọn ${selectedExtras[plan.title].length} dịch vụ mở rộng`
                    : 'Dịch vụ mở rộng (Chọn thêm)'
                  }
                </Button>
                {/* Hiển thị các tag tính năng đã chọn nếu có */}
                {selectedExtras[plan.title]?.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedExtras[plan.title].map(key => {
                      const svc = EXTRA_SERVICES.find(s => s.key === key);
                      return svc ? (
                        <Tag key={key} closable onClose={(e) => {
                          e.preventDefault();
                          setSelectedExtras(prev => ({
                            ...prev,
                            [plan.title]: prev[plan.title].filter(k => k !== key)
                          }));
                        }} color="purple" style={{ fontSize: '10.5px', borderRadius: '4px', margin: 0 }}>
                          {svc.name}
                        </Tag>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

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

      {/* Modal đăng ký gói dịch vụ (Form nhập thông tin chi tiết) */}
      <Modal
        title={
          openRegisterPlan ? (
            <Space align="center" style={{ paddingBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: `${openRegisterPlan.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <RocketOutlined style={{ color: openRegisterPlan.color, fontSize: '16px' }} />
              </div>
              <Text strong style={{ fontSize: '16px', display: 'block', color: '#1e293b' }}>
                Đăng Ký Dịch Vụ - {openRegisterPlan.title}
              </Text>
            </Space>
          ) : null
        }
        open={!!openRegisterPlan}
        onCancel={() => setOpenRegisterPlan(null)}
        footer={null}
        destroyOnHidden
        centered
        width={520}
      >
        {openRegisterPlan && (() => {
          const plan = openRegisterPlan;
          const isOwned = hasDomainHosting[plan.title] || false;
          const selectedSuffix = selectedDomains[plan.title] || '.top';

          const onFinish = (values: any) => {
            // Hạn chế người dùng spam form: Kiểm tra Cooldown 60 giây lưu ở LocalStorage
            const lastSubmit = localStorage.getItem('wphub_last_submit');
            const now = Date.now();
            if (lastSubmit && now - parseInt(lastSubmit) < 60000) {
              const secondsLeft = Math.ceil((60000 - (now - parseInt(lastSubmit))) / 1000);
              message.warning(`Bạn đang thao tác quá nhanh. Vui lòng đợi ${secondsLeft} giây trước khi gửi lại yêu cầu.`);
              return;
            }

            setIsSubmitting(true);
            
            const extraServicesPrice = (selectedExtras[plan.title] || []).reduce((sum, key) => {
              const svc = EXTRA_SERVICES.find(s => s.key === key);
              return sum + (svc ? svc.price : 0);
            }, 0);

            const selectedExtrasNames = (selectedExtras[plan.title] || [])
              .map(key => EXTRA_SERVICES.find(s => s.key === key)?.name)
              .filter(Boolean)
              .join(', ');

            // Tính toán chi phí tạm tính để truyền sang popup kết quả
            const domainPrice = isOwned ? 0 : (DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix)?.price || 0);
            const hostingExtraPrice = isOwned ? 0 : (HOSTING_OPTIONS.find(h => h.key === (selectedHostings[plan.title] || 'basic01'))?.extraPrice || 0);
            const basePrice = isOwned ? (plan.price - 200000) : plan.price;
            const finalPrice = basePrice + domainPrice + hostingExtraPrice + extraServicesPrice;

            // Tính toán chi tiết đuôi tên miền & hosting
            let domainDetail = '';
            if (isOwned) {
              domainDetail = 'Khách tự chuẩn bị (Không đăng ký)';
            } else {
              const domOpt = DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix);
              if (domOpt) {
                domainDetail = `${domOpt.suffix} ${domOpt.isFree ? '(Miễn phí đi kèm)' : `(+${domOpt.price.toLocaleString('vi-VN')} đ)`}`;
              } else {
                domainDetail = selectedSuffix;
              }
            }

            let hostingDetail = '';
            if (isOwned) {
              hostingDetail = 'Khách tự chuẩn bị (Không đăng ký)';
            } else {
              const hostOpt = HOSTING_OPTIONS.find(h => h.key === (selectedHostings[plan.title] || 'basic01'));
              if (hostOpt) {
                hostingDetail = `${hostOpt.name} ${hostOpt.extraPrice === 0 ? '(Miễn phí đi kèm)' : `(+${hostOpt.extraPrice.toLocaleString('vi-VN')} đ)`} [${hostOpt.specs}]`;
              }
            }

            const summary = {
              planTitle: plan.title,
              fullName: values.fullName,
              domain: isOwned ? 'Đã có sẵn (Tự chuẩn bị)' : `${values.domainPrefix}${selectedSuffix}`,
              domainDetail,
              hostingDetail,
              extrasDetail: selectedExtrasNames || 'Không chọn',
              zaloPhone: values.zaloPhone,
              websiteField: values.websiteField,
              notes: values.notes || 'Không có',
              price: finalPrice
            };

            // Thực hiện gửi thông tin đăng ký về Telegram Bot
            sendTelegramNotification(summary).then((success) => {
              setIsSubmitting(false);
              if (success) {
                // Chỉ thiết lập thời gian gửi để hạn chế spam khi gửi Telegram thành công
                localStorage.setItem('wphub_last_submit', Date.now().toString());
                setRegisterSummary(summary);
                setOpenRegisterPlan(null);
                setShowSuccessModal(true);
              } else {
                message.error('Gửi yêu cầu đăng ký website thất bại do sự cố mạng. Bạn vui lòng chụp màn hình hoặc gửi tin nhắn trực tiếp qua Zalo/Hotline.');
              }
            });
          };

          // Tính toán chi phí tạm tính để hiển thị trên Form
          const extraServicesPrice = (selectedExtras[plan.title] || []).reduce((sum, key) => {
            const svc = EXTRA_SERVICES.find(s => s.key === key);
            return sum + (svc ? svc.price : 0);
          }, 0);
          const domainPrice = isOwned ? 0 : (DOMAIN_OPTIONS.find(d => d.suffix === selectedSuffix)?.price || 0);
          const hostingExtraPrice = isOwned ? 0 : (HOSTING_OPTIONS.find(h => h.key === (selectedHostings[plan.title] || 'basic01'))?.extraPrice || 0);
          const basePrice = isOwned ? (plan.price - 200000) : plan.price;
          const finalPrice = basePrice + domainPrice + hostingExtraPrice + extraServicesPrice;

          return (
            <div style={{ marginTop: '16px' }}>
              {/* Thẻ hiển thị giá tạm tính trực quan */}
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chi Phí Tạm Tính</Text>
                  <Title level={4} style={{ margin: 0, color: '#ef4444', fontWeight: 800, fontSize: '18px' }}>
                    {finalPrice.toLocaleString('vi-VN')} đ
                  </Title>
                </div>
                <Tag color={plan.isPopular ? 'indigo' : 'default'} style={{ margin: 0, borderRadius: '4px', fontWeight: 600 }}>
                  {plan.title}
                </Tag>
              </div>

              <Form
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item
                  label={<Text strong style={{ fontSize: '13px' }}>Họ và tên</Text>}
                  name="fullName"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên của bạn' }]}
                >
                  <Input placeholder="Ví dụ: Nguyễn Văn A" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>

                {!isOwned && (
                  <Form.Item
                    label={<Text strong style={{ fontSize: '13px' }}>Tên miền đăng ký</Text>}
                    name="domainPrefix"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên miền mong muốn' },
                      { pattern: /^[a-zA-Z0-9-.]+$/, message: 'Tên miền chỉ được chứa chữ, số, dấu gạch ngang' }
                    ]}
                  >
                    <Input 
                      placeholder="Ví dụ: webcuatoi" 
                      addonAfter={selectedSuffix} 
                      size="large"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label={<Text strong style={{ fontSize: '13px' }}>Số Zalo liên hệ</Text>}
                  name="zaloPhone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại Zalo' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải gồm 10 - 11 chữ số' }
                  ]}
                >
                  <Input placeholder="Ví dụ: 0815483669" size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  label={<Text strong style={{ fontSize: '13px' }}>Lĩnh vực làm website</Text>}
                  name="websiteField"
                  rules={[{ required: true, message: 'Vui lòng nhập chủ đề / ngành nghề của website' }]}
                >
                  <Input placeholder="Ví dụ: Shop quần áo, Khách sạn, Bất động sản..." size="large" style={{ borderRadius: '8px' }} />
                </Form.Item>

                <Form.Item
                  label={<Text strong style={{ fontSize: '13px' }}>Ghi chú / Yêu cầu thêm (Không bắt buộc)</Text>}
                  name="notes"
                >
                  <Input.TextArea placeholder="Mô tả thêm các mong muốn hoặc tính năng bạn cần..." rows={3} style={{ borderRadius: '8px' }} />
                </Form.Item>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <Button size="large" onClick={() => setOpenRegisterPlan(null)} style={{ borderRadius: '8px' }} disabled={isSubmitting}>
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large" 
                    loading={isSubmitting} 
                    style={{ background: plan.color, borderColor: plan.color, borderRadius: '8px', fontWeight: 600 }}
                  >
                    Xác nhận Đăng ký
                  </Button>
                </div>
              </Form>
            </div>
          );
        })()}
      </Modal>

      {/* Modal thông báo kết quả Đăng ký thành công */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
            <CheckOutlined style={{ fontSize: '18px', background: '#ecfdf5', padding: '6px', borderRadius: '50%' }} />
            <span style={{ fontWeight: 800 }}>GỬI YÊU CẦU THÀNH CÔNG!</span>
          </div>
        }
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setShowSuccessModal(false)} style={{ background: '#10b981', borderColor: '#10b981', borderRadius: '8px', fontWeight: 600 }}>
            Đóng cửa sổ
          </Button>
        ]}
        centered
        width={480}
      >
        {registerSummary && (
          <div style={{ marginTop: '16px' }}>
            <Paragraph style={{ fontSize: '14px', color: '#475569' }}>
              Chúc mừng <strong>{registerSummary.fullName}</strong>! WPHub đã tiếp nhận đầy đủ thông tin đăng ký dịch vụ của bạn.
            </Paragraph>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>GÓI DỊCH VỤ</Text>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{registerSummary.planTitle}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>TÊN MIỀN MONG MUỐN</Text>
                <Text strong style={{ fontSize: '14px', color: '#6366f1' }}>{registerSummary.domain}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>SỐ ĐIỆN THOẠI ZALO</Text>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{registerSummary.zaloPhone}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>CHỦ ĐỀ WEBSITE</Text>
                <Text strong style={{ fontSize: '14px', color: '#1e293b' }}>{registerSummary.websiteField}</Text>
              </div>
              {registerSummary.extrasDetail !== 'Không chọn' && (
                <div>
                  <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>DỊCH VỤ MỞ RỘNG</Text>
                  <Text strong style={{ fontSize: '13.5px', color: '#1e293b' }}>{registerSummary.extrasDetail}</Text>
                </div>
              )}
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>TỔNG CHI PHÍ TẠM TÍNH</Text>
                <Text strong style={{ fontSize: '15px', color: '#ef4444' }}>{registerSummary.price.toLocaleString('vi-VN')} đ</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', color: '#64748b' }}>GHI CHÚ KÈM THEO</Text>
                <Text style={{ fontSize: '13px', fontStyle: 'italic', color: '#475569' }}>{registerSummary.notes}</Text>
              </div>
            </div>
            <Paragraph style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
              * Chuyên viên hỗ trợ của WPHub sẽ liên hệ trực tiếp qua số Zalo <strong>{registerSummary.zaloPhone}</strong> của bạn trong vòng 15 phút để hoàn tất thủ tục bàn giao website.
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Services;
