import React, { useState } from 'react';
import { Row, Col, Typography, Button, Space, Divider, Alert, Card, Input, List, Tag, Pagination } from 'antd';
import { SearchOutlined, CalendarOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PostArchiveDemoProps {
  onBack: () => void;
}

export const PostArchiveDemo: React.FC<PostArchiveDemoProps> = ({ onBack }) => {
  const [searchVal, setSearchVal] = useState('');

  const mockPosts = [
    {
      id: 1,
      title: 'Hướng dẫn tối ưu tốc độ website WordPress đạt 100 điểm PageSpeed Insights',
      excerpt: 'Tốc độ tải trang là một trong những yếu tố xếp hạng quan trọng hàng đầu của Google. Bài viết này hướng dẫn chi tiết từng bước nén ảnh, lưu cache, trì hoãn JS...',
      date: '10/07/2026',
      views: '1,250',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
      category: 'Thủ Thuật'
    },
    {
      id: 2,
      title: 'Top 5 plugin bảo mật WordPress tốt nhất và cách cấu hình an toàn chống mã độc',
      excerpt: 'Bảo mật website là điều kiện kiên quyết để bảo vệ dữ liệu khách hàng. Cùng điểm qua 5 plugin bảo mật hàng đầu như Wordfence, iThemes Security và cách thiết lập...',
      date: '08/07/2026',
      views: '980',
      img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80',
      category: 'Bảo Mật'
    },
    {
      id: 3,
      title: 'WooCommerce là gì? Hướng dẫn thiết lập cửa hàng online từ A-Z cho người mới',
      excerpt: 'Từng bước xây dựng một trang web bán hàng chuyên nghiệp bằng WooCommerce. Hướng dẫn thêm sản phẩm, thiết lập cổng thanh toán và quản lý đơn hàng hiệu quả...',
      date: '05/07/2026',
      views: '2,110',
      img: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?w=400&auto=format&fit=crop&q=80',
      category: 'E-Commerce'
    },
    {
      id: 4,
      title: 'Cách viết bài chuẩn SEO giúp từ khóa lên top Google nhanh chóng và bền vững',
      excerpt: 'Bí quyết tối ưu hóa On-page cho bài viết: Phân bổ từ khóa chính phụ, tối ưu thẻ tiêu đề Title, thẻ mô tả Meta Description và cấu trúc Heading H1-H4 hợp lý...',
      date: '02/07/2026',
      views: '1,540',
      img: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=80',
      category: 'SEO Marketing'
    }
  ];

  const popularPosts = [
    { id: 1, title: 'Hướng dẫn cài đặt SSL miễn phí Let\'s Encrypt' },
    { id: 2, title: 'Cách khắc phục lỗi trắng trang (WSOD) trong WordPress' },
    { id: 3, title: 'CSS Flexbox và Grid: Khi nào nên sử dụng?' }
  ];

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <Alert
        message={<Text strong style={{ color: '#4f46e5' }}>Chế độ xem thử (Live Demo)</Text>}
        description="Bạn đang trải nghiệm giao diện thực tế của Template Trang Danh Mục Bài Viết (Post Category Archive) chuẩn SEO, được tối ưu bố cục và tốc độ tải trang."
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
          {/* Cột trái: Danh sách bài viết */}
          <Col xs={24} lg={17}>
            <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)', marginBottom: '20px' }}>
              <div style={{ marginBottom: '28px' }}>
                <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '12.5px', textTransform: 'uppercase' }}>Chuyên mục bài viết</span>
                <Title level={2} style={{ margin: '4px 0 0 0', fontWeight: 800 }}>Thủ Thuật & Hướng Dẫn WordPress</Title>
              </div>

              {/* List bài viết */}
              <List
                itemLayout="vertical"
                size="large"
                dataSource={mockPosts}
                renderItem={(post) => (
                  <List.Item
                    key={post.id}
                    style={{ padding: '24px 0', borderBottom: '1px solid #f1f5f9' }}
                    extra={
                      <div style={{ width: '200px', height: '120px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                        <img
                          alt="thumbnail"
                          src={post.img}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    }
                  >
                    <Space style={{ marginBottom: '8px' }}>
                      <Tag color="blue" style={{ borderRadius: '4px' }}>{post.category}</Tag>
                    </Space>
                    <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '17px', lineHeight: 1.4 }}>
                      <a style={{ color: '#1e293b' }}>{post.title}</a>
                    </Title>
                    <Paragraph style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '12px' }}>
                      {post.excerpt}
                    </Paragraph>
                    <Space size="large" style={{ color: '#94a3b8', fontSize: '12px' }}>
                      <Space><CalendarOutlined />{post.date}</Space>
                      <Space><EyeOutlined />{post.views} lượt xem</Space>
                    </Space>
                  </List.Item>
                )}
              />

              {/* Phân trang */}
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Pagination defaultCurrent={1} total={24} pageSize={4} showSizeChanger={false} />
              </div>
            </div>
          </Col>

          {/* Cột phải: Sidebar (Tìm kiếm & Chuyên mục nổi bật) */}
          <Col xs={24} lg={7}>
            <Space direction="vertical" size="middle" style={{ width: '100%', position: 'sticky', top: '90px' }}>
              {/* Ô tìm kiếm */}
              <Card variant="borderless" style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <Input
                  prefix={<SearchOutlined style={{ color: '#cbd5e1' }} />}
                  placeholder="Tìm bài viết..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  style={{ borderRadius: '8px', height: '38px' }}
                />
              </Card>

              {/* Bài viết nổi bật */}
              <Card 
                title={<span style={{ fontWeight: 800, fontSize: '14.5px' }}>Xem nhiều nhất</span>}
                variant="borderless" 
                style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <List
                  dataSource={popularPosts}
                  renderItem={(item, idx) => (
                    <List.Item style={{ padding: '12px 0', borderBottom: idx === popularPosts.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <Space align="start" size="small">
                        <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          {idx + 1}
                        </span>
                        <a style={{ color: '#334155', fontSize: '13px', fontWeight: 500, lineHeight: 1.4 }}>{item.title}</a>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Tất cả chuyên mục */}
              <Card 
                title={<span style={{ fontWeight: 800, fontSize: '14.5px' }}>Chuyên mục</span>}
                variant="borderless" 
                style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}
              >
                <List
                  dataSource={[
                    { name: 'Thủ Thuật WordPress', count: 12 },
                    { name: 'Cấu hình Server/Hosting', count: 8 },
                    { name: 'Tối ưu SEO Website', count: 15 },
                    { name: 'Thiết kế Giao diện', count: 6 },
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                      <a style={{ color: '#475569', fontSize: '13px' }}><RightOutlined style={{ fontSize: '10px', marginRight: '6px' }} />{item.name}</a>
                      <Text type="secondary" style={{ fontSize: '12px' }}>({item.count})</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};
