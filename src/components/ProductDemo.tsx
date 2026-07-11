import React, { useState } from 'react';
import { Row, Col, Typography, Button, Space, InputNumber, Rate, Tag, Tabs, Table, Divider, Alert } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, SafetyCertificateOutlined, TruckOutlined, SyncOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface ProductDemoProps {
  onBack: () => void;
}

export const ProductDemo: React.FC<ProductDemoProps> = ({ onBack }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Đen Space');

  const colors = ['Đen Space', 'Trắng Bạc', 'Xanh Coral'];

  const specsData = [
    { key: '1', param: 'Thương hiệu', value: 'Bose' },
    { key: '2', param: 'Dòng sản phẩm', value: 'QuietComfort Ultra' },
    { key: '3', param: 'Loại tai nghe', value: 'Chụp tai (Over-ear) Không dây' },
    { key: '4', param: 'Thời lượng pin', value: 'Lên đến 24 giờ liên tục' },
    { key: '5', param: 'Chống ồn chủ động (ANC)', value: 'Có (Công nghệ CustomTune)' },
    { key: '6', param: 'Chuẩn kết nối', value: 'Bluetooth 5.3 aptX Adaptive' },
  ];

  const columns = [
    { title: 'Thông số', dataIndex: 'param', key: 'param', width: '40%', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Chi tiết', dataIndex: 'value', key: 'value' },
  ];

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      <Alert
        message={<Text strong style={{ color: '#4f46e5' }}>Chế độ xem thử (Live Demo)</Text>}
        description="Bạn đang trải nghiệm giao diện thực tế của Template Chi Tiết Sản Phẩm (Single Product) chuẩn SEO, được thiết kế tối ưu tỷ lệ chuyển đổi."
        type="info"
        showIcon
        action={
          <Button size="small" type="primary" onClick={onBack} style={{ borderRadius: '6px', background: '#6366f1' }}>
            Quay lại
          </Button>
        }
        style={{ marginBottom: '24px', borderRadius: '12px', border: '1px solid #e0e7ff', backgroundColor: '#eef2ff' }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.03)' }}>
        <Row gutter={[40, 40]}>
          {/* Cột trái: Hình ảnh */}
          <Col xs={24} md={10}>
            <div style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', background: '#fafafa', textAlign: 'center', padding: '30px' }}>
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                alt="Tai Nghe Bose QuietComfort Ultra"
                style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain' }}
              />
            </div>
            <Row gutter={12} style={{ marginTop: '16px' }}>
              {[
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=150&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=150&auto=format&fit=crop&q=80'
              ].map((img, i) => (
                <Col span={8} key={i}>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', padding: '8px', background: '#fafafa' }}>
                    <img src={img} alt="thumbnail" style={{ width: '100%', height: '50px', objectFit: 'contain' }} />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          {/* Cột phải: Thông tin sản phẩm */}
          <Col xs={24} md={14}>
            <span style={{ color: '#6366f1', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Âm Thanh Cao Cấp / Headphones
            </span>
            <Title level={2} style={{ margin: '8px 0 12px 0', fontWeight: 800, fontSize: '28px' }}>
              Tai Nghe Không Dây Bose QuietComfort Ultra
            </Title>

            <Space align="center" split={<Divider type="vertical" />} style={{ marginBottom: '16px' }}>
              <Space size={4}>
                <Rate disabled defaultValue={5} style={{ fontSize: '14px' }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>(48 đánh giá)</Text>
              </Space>
              <Text style={{ color: '#10b981', fontWeight: 600 }}><SafetyCertificateOutlined /> Hàng sẵn có</Text>
            </Space>

            <div style={{ background: '#f8fafc', padding: '16px 24px', borderRadius: '16px', marginBottom: '24px' }}>
              <Space align="baseline" size={16}>
                <Title level={2} style={{ margin: 0, color: '#ef4444', fontWeight: 800 }}>
                  8.490.000 đ
                </Title>
                <Text delete type="secondary" style={{ fontSize: '16px' }}>
                  9.990.000 đ
                </Text>
                <Tag color="red" style={{ borderRadius: '4px', fontWeight: 600 }}>Giảm 15%</Tag>
              </Space>
            </div>

            <Paragraph style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              Trải nghiệm chống ồn đỉnh cao thế hệ mới cùng Bose Immersive Audio mang lại không gian âm nhạc sống động 3 chiều như thật. Thiết kế đệm tai siêu êm, ôm trọn vành tai tạo cảm giác thoải mái khi đeo cả ngày dài.
            </Paragraph>

            <Divider style={{ margin: '16px 0' }} />

            {/* Lựa chọn màu sắc */}
            <div style={{ marginBottom: '20px' }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Màu sắc: {selectedColor}</Text>
              <Space>
                {colors.map(color => (
                  <Button
                    key={color}
                    type={selectedColor === color ? 'primary' : 'default'}
                    onClick={() => setSelectedColor(color)}
                    style={{ borderRadius: '6px' }}
                  >
                    {color}
                  </Button>
                ))}
              </Space>
            </div>

            {/* Lựa chọn số lượng & nút CTA */}
            <div style={{ marginBottom: '32px' }}>
              <Space size="middle" wrap>
                <InputNumber min={1} max={10} value={quantity} onChange={(val) => setQuantity(val || 1)} style={{ height: '42px', borderRadius: '8px', lineHeight: '42px' }} />
                <Button type="primary" size="large" icon={<ShoppingCartOutlined />} style={{ background: '#4f46e5', height: '42px', borderRadius: '8px', fontWeight: 600 }}>
                  Thêm Vào Giỏ
                </Button>
                <Button type="primary" danger size="large" style={{ height: '42px', borderRadius: '8px', fontWeight: 700, paddingLeft: '28px', paddingRight: '28px' }}>
                  MUA NGAY (Giao nhanh 2h)
                </Button>
              </Space>
            </div>

            {/* Cam kết bán hàng */}
            <Row gutter={[16, 16]} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
              <Col span={8}>
                <Space><TruckOutlined style={{ color: '#4f46e5' }} /><Text style={{ fontSize: '12.5px' }}>Free ship toàn quốc</Text></Space>
              </Col>
              <Col span={8}>
                <Space><SyncOutlined style={{ color: '#4f46e5' }} /><Text style={{ fontSize: '12.5px' }}>Đổi trả trong 7 ngày</Text></Space>
              </Col>
              <Col span={8}>
                <Space><SafetyCertificateOutlined style={{ color: '#4f46e5' }} /><Text style={{ fontSize: '12.5px' }}>Bảo hành 12 tháng</Text></Space>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider style={{ margin: '40px 0' }} />

        {/* Tabs Thông tin chi tiết */}
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: <span style={{ fontWeight: 600, fontSize: '15px' }}>Thông số kỹ thuật</span>,
              children: <Table dataSource={specsData} columns={columns} pagination={false} size="middle" bordered={false} style={{ marginTop: '10px' }} />
            },
            {
              key: '2',
              label: <span style={{ fontWeight: 600, fontSize: '15px' }}>Mô tả sản phẩm</span>,
              children: (
                <div style={{ padding: '10px 0', lineHeight: 1.7, color: '#334155' }}>
                  <Paragraph>
                    Bose QuietComfort Ultra là mẫu tai nghe chống ồn mới nhất, thay thế cho chiếc Noise Cancelling Headphones 700 danh tiếng. Hãng âm thanh Mỹ mang đến thiết kế gập gọn tiện dụng và chất âm nâng cấp đáng kinh ngạc.
                  </Paragraph>
                  <Paragraph>
                    Đặc biệt nhất là tính năng Immersive Audio (Âm thanh Không gian) tạo hiệu ứng sân khấu rộng mở trước mặt người nghe, nâng tầm trải nghiệm giải trí xem phim, nghe nhạc chất lượng cao.
                  </Paragraph>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
