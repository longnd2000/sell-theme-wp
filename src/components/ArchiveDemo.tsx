import React, { useState } from 'react';
import { Row, Col, Typography, Button, Space, Divider, Alert, Card, Select, Checkbox, Slider, Rate, Pagination } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, FilterOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ArchiveDemoProps {
  onBack: () => void;
}

export const ArchiveDemo: React.FC<ArchiveDemoProps> = ({ onBack }) => {
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  const mockProducts = [
    { id: 1, name: 'Tai nghe Bluetooth không dây Sony WH-1000XM5', price: 6890000, oldPrice: 8490000, rating: 5, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80', tag: 'Headphone' },
    { id: 2, name: 'Bàn phím cơ không dây Keychron K2 V2', price: 1890000, oldPrice: 2200000, rating: 4.5, img: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80', tag: 'Keyboard' },
    { id: 3, name: 'Chuột không dây Logitech MX Master 3S', price: 2490000, oldPrice: 2990000, rating: 5, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80', tag: 'Mouse' },
    { id: 4, name: 'Loa không dây Bluetooth Marshall Emberton II', price: 3950000, oldPrice: 4500000, rating: 4.5, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&auto=format&fit=crop&q=80', tag: 'Speaker' },
    { id: 5, name: 'Đồng hồ thông minh Apple Watch Series 9 GPS', price: 9290000, oldPrice: 10490000, rating: 5, img: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&auto=format&fit=crop&q=80', tag: 'Smartwatch' },
    { id: 6, name: 'Đế sạc nhanh không dây 3-in-1 Belkin MagSafe', price: 2150000, oldPrice: 2500000, rating: 4, img: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=300&auto=format&fit=crop&q=80', tag: 'Accessory' },
  ];

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <Alert
        message={<Text strong style={{ color: '#4f46e5' }}>Chế độ xem thử (Live Demo)</Text>}
        description="Bạn đang trải nghiệm giao diện thực tế của Template Trang Danh Mục (Category Archive) chuẩn SEO, tích hợp bộ lọc sản phẩm thông minh."
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
          {/* Cột trái: Bộ lọc sản phẩm (Sidebar Filter) */}
          <Col xs={24} md={6}>
            <Card 
              title={<span style={{ fontWeight: 800, fontSize: '15px' }}><FilterOutlined /> Bộ lọc sản phẩm</span>}
              bordered={false} 
              style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.04)' }}
            >
              {/* Danh mục */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>Danh mục</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox defaultChecked>Tai nghe & Âm thanh</Checkbox>
                  <Checkbox>Bàn phím cơ</Checkbox>
                  <Checkbox>Chuột máy tính</Checkbox>
                  <Checkbox>Đồng hồ thông minh</Checkbox>
                  <Checkbox>Phụ kiện công nghệ</Checkbox>
                </Space>
              </div>

              <Divider style={{ margin: '20px 0' }} />

              {/* Lọc theo giá */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Khoảng giá (đ)</Text>
                <Slider 
                  range 
                  min={0} 
                  max={12000000} 
                  step={500000}
                  defaultValue={[0, 10000000]}
                  value={priceRange}
                  onChange={(val) => setPriceRange(val as [number, number])}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>{priceRange[0].toLocaleString()} đ</Text>
                  <Text type="secondary" style={{ fontSize: '11px' }}>{priceRange[1].toLocaleString()} đ</Text>
                </div>
              </div>

              <Divider style={{ margin: '20px 0' }} />

              {/* Lọc theo đánh giá */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>Đánh giá</Text>
                <Space direction="vertical">
                  <Checkbox><Rate disabled defaultValue={5} style={{ fontSize: '12px' }} /> <Text style={{ fontSize: '12px' }}>5 sao</Text></Checkbox>
                  <Checkbox><Rate disabled defaultValue={4} style={{ fontSize: '12px' }} /> <Text style={{ fontSize: '12px' }}>Từ 4 sao</Text></Checkbox>
                </Space>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Grid sản phẩm */}
          <Col xs={24} md={18}>
            {/* Header của Archive */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.01)', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div>
                <Title level={4} style={{ margin: 0, fontWeight: 800 }}>Phụ kiện công nghệ cao cấp</Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>Hiển thị 6 sản phẩm</Text>
              </div>

              {/* Sắp xếp & Layout */}
              <Space size="middle">
                <Select defaultValue="newest" style={{ width: 160, borderRadius: '8px' }}>
                  <Select.Option value="newest">Mới nhất</Select.Option>
                  <Select.Option value="price-asc">Giá tăng dần</Select.Option>
                  <Select.Option value="price-desc">Giá giảm dần</Select.Option>
                  <Select.Option value="popular">Bán chạy nhất</Select.Option>
                </Select>

                <Space size={4}>
                  <Button 
                    type={layoutMode === 'grid' ? 'primary' : 'default'} 
                    icon={<AppstoreOutlined />} 
                    onClick={() => setLayoutMode('grid')}
                    style={{ borderRadius: '6px' }}
                  />
                  <Button 
                    type={layoutMode === 'list' ? 'primary' : 'default'} 
                    icon={<UnorderedListOutlined />} 
                    onClick={() => setLayoutMode('list')}
                    style={{ borderRadius: '6px' }}
                  />
                </Space>
              </Space>
            </div>

            {/* Grid sản phẩm */}
            <Row gutter={[16, 16]}>
              {mockProducts.map((p) => (
                <Col xs={24} sm={12} lg={8} key={p.id}>
                  <Card
                    hoverable
                    bordered={false}
                    cover={
                      <div style={{ height: '180px', overflow: 'hidden', padding: '16px', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          alt={p.name} 
                          src={p.img} 
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} 
                        />
                      </div>
                    }
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.01)',
                      border: '1px solid rgba(0, 0, 0, 0.03)',
                      height: '100%',
                    }}
                    styles={{ body: { padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'calc(100% - 180px)' } }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600, textTransform: 'uppercase' }}>{p.tag}</span>
                      <Title level={5} style={{ fontSize: '13.5px', fontWeight: 700, margin: '4px 0 8px 0', minHeight: '40px', lineHeight: 1.4 }}>
                        {p.name}
                      </Title>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <Rate disabled defaultValue={p.rating} style={{ fontSize: '12px' }} />
                      </div>

                      <Space align="baseline" size={8} style={{ marginBottom: '12px' }}>
                        <Text strong style={{ color: '#ef4444', fontSize: '15px' }}>{p.price.toLocaleString()} đ</Text>
                        <Text delete type="secondary" style={{ fontSize: '12px' }}>{p.oldPrice.toLocaleString()} đ</Text>
                      </Space>
                    </div>

                    <Button 
                      type="primary" 
                      ghost 
                      block 
                      size="middle" 
                      icon={<ShoppingCartOutlined />} 
                      style={{ borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}
                    >
                      Thêm Vào Giỏ
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Phân trang */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Pagination defaultCurrent={1} total={30} pageSize={6} showSizeChanger={false} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};
