import React from 'react';
import { Row, Col, Typography, Button, Space, Divider, Alert, Card, Anchor } from 'antd';
import { CalendarOutlined, UserOutlined, EyeOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PostDemoProps {
  onBack: () => void;
}

export const PostDemo: React.FC<PostDemoProps> = ({ onBack }) => {
  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <Alert
        message={<Text strong style={{ color: '#4f46e5' }}>Chế độ xem thử (Live Demo)</Text>}
        description="Bạn đang trải nghiệm giao diện thực tế của Template Chi Tiết Bài Viết (Single Post) chuẩn SEO, tối ưu khả năng đọc và điều hướng cho độc giả."
        type="info"
        showIcon
        action={
          <Button size="small" type="primary" onClick={onBack} style={{ borderRadius: '6px', background: '#6366f1' }}>
            Quay lại
          </Button>
        }
        style={{ marginBottom: '24px', borderRadius: '12px', border: '1px solid #e0e7ff', backgroundColor: '#eef2ff' }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
          {/* Cột trái: Nội dung bài viết */}
          <Col xs={24} lg={17}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
              {/* Thẻ danh mục & Tiêu đề */}
              <Space style={{ marginBottom: '12px' }}>
                <span style={{ background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                  Thủ Thuật WordPress
                </span>
              </Space>
              
              <Title level={1} style={{ fontWeight: 800, fontSize: '32px', lineHeight: 1.3, marginBottom: '20px' }}>
                Hướng dẫn tối ưu tốc độ website WordPress đạt 100 điểm PageSpeed Insights
              </Title>

              {/* Thông tin Meta */}
              <Space size="large" wrap style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
                <Space><UserOutlined /><span>Bởi: Admin WPHub</span></Space>
                <Space><CalendarOutlined /><span>10/07/2026</span></Space>
                <Space><EyeOutlined /><span>1,250 lượt xem</span></Space>
                <Space><MessageOutlined /><span>8 bình luận</span></Space>
              </Space>

              <Divider style={{ margin: '0 0 24px 0' }} />

              {/* Nội dung bài viết */}
              <div style={{ fontSize: '15px', lineHeight: 1.8, color: '#334155' }}>
                <Paragraph style={{ fontSize: '16px', fontWeight: 500, color: '#1e293b' }}>
                  Tốc độ tải trang là một trong những yếu tố xếp hạng quan trọng hàng đầu của Google. Bài viết này sẽ hướng dẫn bạn chi tiết từng bước để tối ưu một trang web WordPress đạt điểm số tuyệt đối trên công cụ Google PageSpeed Insights.
                </Paragraph>

                <div id="section-1" style={{ paddingTop: '10px' }}>
                  <Title level={3} style={{ fontWeight: 700, marginTop: '24px' }}>1. Tối ưu dung lượng hình ảnh</Title>
                  <Paragraph>
                    Hình ảnh thường chiếm đến 60-70% dung lượng của một trang web thông thường. Để tối ưu hình ảnh tốt nhất, bạn nên thực hiện:
                  </Paragraph>
                  <ul>
                    <li>Chuyển đổi hình ảnh sang định dạng thế hệ mới như <strong>WebP</strong> hoặc <strong>AVIF</strong> thay thế cho JPEG/PNG.</li>
                    <li>Sử dụng các plugin nén ảnh tự động như Smush, Imagify hoặc EWWW Image Optimizer.</li>
                    <li>Kích hoạt tính năng <strong>Lazy Loading</strong> để hình ảnh chỉ được tải khi người dùng cuộn đến vị trí tương ứng.</li>
                  </ul>
                </div>

                <div id="section-2" style={{ paddingTop: '10px' }}>
                  <Title level={3} style={{ fontWeight: 700, marginTop: '24px' }}>2. Sử dụng giải pháp lưu trữ Cache (Bộ nhớ đệm)</Title>
                  <Paragraph>
                    Bộ nhớ đệm giúp giảm tải đáng kể cho database và CPU của máy chủ bằng cách lưu lại phiên bản HTML tĩnh của trang web và phục vụ ngay lập tức cho các lượt truy cập sau.
                  </Paragraph>
                  <blockquote style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '16px', fontStyle: 'italic', margin: '20px 0', color: '#475569', background: '#f8fafc', padding: '12px 16px', borderRadius: '0 8px 8px 0' }}>
                    "Kích hoạt Cache đúng cách có thể cải thiện thời gian phản hồi máy chủ (TTFB) từ trên 1 giây xuống dưới 0.2 giây."
                  </blockquote>
                </div>

                <div id="section-3" style={{ paddingTop: '10px' }}>
                  <Title level={3} style={{ fontWeight: 700, marginTop: '24px' }}>3. Tối ưu CSS và JavaScript</Title>
                  <Paragraph>
                    Việc gộp, nén và trì hoãn tải các file CSS/JS chưa cần thiết (Defer non-essential scripts) giúp trình duyệt hiển thị khung xương trang web (LCP) nhanh nhất có thể. Bạn có thể sử dụng plugin Autoptimize hoặc WP Rocket để tự động hóa công việc này.
                  </Paragraph>
                </div>
              </div>

              <Divider style={{ margin: '32px 0 20px 0' }} />

              {/* Share buttons */}
              <Row align="middle" justify="space-between">
                <Col>
                  <Space>
                    <Text strong>Chia sẻ:</Text>
                    <Button type="primary" shape="circle" icon={<FacebookOutlined />} style={{ background: '#3b5998', border: 'none' }} />
                    <Button type="primary" shape="circle" icon={<TwitterOutlined />} style={{ background: '#1da1f2', border: 'none' }} />
                    <Button type="primary" shape="circle" icon={<LinkedinOutlined />} style={{ background: '#0077b5', border: 'none' }} />
                  </Space>
                </Col>
                <Col>
                  <Tag color="blue">#WordPress</Tag>
                  <Tag color="cyan">#SEO</Tag>
                  <Tag color="purple">#Speed</Tag>
                </Col>
              </Row>
            </div>
          </Col>

          {/* Cột phải: Sticky Sidebar (TOC & Tác giả) */}
          <Col xs={24} lg={7}>
            <Space direction="vertical" size="middle" style={{ width: '100%', position: 'sticky', top: '90px' }}>
              {/* Box tác giả */}
              <Card variant="borderless" style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(to right, #6366f1, #a855f7)', margin: '0 auto 12px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: 700 }}>
                    <span style={{ margin: 'auto' }}>A</span>
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 700 }}>WPHub Admin</Title>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '12px' }}>Chuyên gia tối ưu hệ thống WordPress</Text>
                  <Paragraph style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                    Chia sẻ các bài viết, thủ thuật chuyên sâu về quản lý bản quyền theme và tối ưu hiệu suất web.
                  </Paragraph>
                </div>
              </Card>

              {/* Box Mục lục tự động (TOC) */}
              <Card 
                title={<span style={{ fontWeight: 700, fontSize: '14px' }}>Mục lục bài viết</span>} 
                variant="borderless" 
                style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}
                styles={{ body: { padding: '12px 20px' } }}
              >
                <Anchor
                  items={[
                    { key: '1', href: '#section-1', title: '1. Tối ưu dung lượng hình ảnh' },
                    { key: '2', href: '#section-2', title: '2. Sử dụng giải pháp lưu trữ Cache' },
                    { key: '3', href: '#section-3', title: '3. Tối ưu CSS và JavaScript' },
                  ]}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};
