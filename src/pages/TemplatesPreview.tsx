import React from 'react';
import { Row, Col, Card, Typography, Button, Breadcrumb } from 'antd';
import { ShopOutlined, LeftOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface TemplateDemo {
  title: string;
  type: string;
  image: string;
  description: string;
  features: string[];
}

const TEMPLATES: TemplateDemo[] = [
  {
    title: 'Template Chi Tiết Sản Phẩm (Single Product)',
    type: 'Cửa Hàng / E-Commerce',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    description: 'Thiết kế bố cục hiện đại tối ưu hóa tỷ lệ chuyển đổi, bao gồm ảnh phóng to, thông số kỹ thuật, đánh giá và sản phẩm liên quan.',
    features: ['Chuẩn Schema Product', 'Tối ưu nút Thêm vào giỏ', 'Responsive 100%', 'Tải nhanh dưới 1.5s'],
  },
  {
    title: 'Template Chi Tiết Bài Viết (Single Post)',
    type: 'Tin Tức / Blog',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60',
    description: 'Tập trung vào trải nghiệm đọc của người dùng với font chữ Outfit sắc nét, thanh mục lục tự động, nút chia sẻ MXH và bài viết liên quan.',
    features: ['Mục lục tự động (TOC)', 'Chuẩn Schema Article', 'Tối ưu độ tương phản font', 'Tích hợp nút Share nhanh'],
  },
  {
    title: 'Template Trang Danh Mục (Category Archive)',
    type: 'Lưu Trữ / Phân Loại',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
    description: 'Bố cục dạng lưới (Grid) hoặc danh sách (List) trực quan giúp khách hàng dễ dàng tìm kiếm và phân loại thông tin.',
    features: ['Bộ lọc Ajax thông minh', 'Phân trang mượt mà', 'Tối ưu hóa thẻ Heading', 'Tải ảnh Lazy Load'],
  },
];

const TemplatesPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px', marginTop: '10px' }}>
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate('/')}>Trang chủ</a> },
            { title: <a onClick={() => navigate('/services')}>Dịch vụ Website</a> },
            { title: 'Xem Mẫu Template Chuẩn SEO' },
          ]}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
            Mẫu Template Bài Viết, Sản Phẩm & Danh Mục Chuẩn SEO
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
            Dành cho Gói Cơ Bản & Gói Phổ Biến. Các trang tin tức, chi tiết sản phẩm và danh mục lưu trữ sẽ áp dụng các mẫu giao diện chuẩn SEO tối ưu này.
          </Paragraph>
        </div>
        <Button 
          icon={<LeftOutlined />} 
          onClick={() => navigate('/services')}
          style={{ borderRadius: '8px' }}
        >
          Quay lại Bảng giá
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {TEMPLATES.map((tpl, idx) => (
          <Col xs={24} md={8} key={idx}>
            <Card
              hoverable
              bordered={false}
              cover={
                <div style={{ position: 'relative', overflow: 'hidden', height: '220px', borderRadius: '16px 16px 0 0' }}>
                  <img
                    alt={tpl.title}
                    src={tpl.image}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                    className="template-img"
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span style={{ background: '#6366f1', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                      {tpl.type}
                    </span>
                  </div>
                </div>
              }
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <Title level={4} style={{ fontWeight: 700, marginTop: 0, marginBottom: '12px', fontSize: '16px', color: '#1e293b' }}>
                    {tpl.title}
                  </Title>
                  <Paragraph style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '16px' }}>
                    {tpl.description}
                  </Paragraph>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tpl.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircleOutlined style={{ color: '#10b981', fontSize: '14px' }} />
                          <Text style={{ fontSize: '12.5px', color: '#475569' }}>{feat}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button 
                  type="primary" 
                  ghost 
                  block 
                  icon={<EyeOutlined />}
                  style={{ borderRadius: '8px' }}
                  onClick={() => window.open(tpl.image, '_blank')}
                >
                  Xem Ảnh Giao Diện Lớn
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TemplatesPreview;
