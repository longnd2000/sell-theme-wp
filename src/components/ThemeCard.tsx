import React from 'react';
// Import các UI Component (thành phần giao diện) có sẵn của thư viện Ant Design
import { Card, Button, Rate, Tag, Typography, Space } from 'antd';
// Import các Icon SVG dạng Component
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { ThemeItem } from '../store/themeApi';

// Lấy component Paragraph từ Typography để render đoạn văn bản có tính năng cắt gọn (ellipsis)
const { Paragraph } = Typography;

/**
 * Interface Props của ThemeCard:
 * Định nghĩa chính xác những dữ liệu (props) mà component cha cần phải truyền vào component này.
 * Giúp TypeScript bắt lỗi ngay nếu truyền thiếu hoặc sai kiểu dữ liệu.
 */
interface ThemeCardProps {
  themeItem: ThemeItem;                        // Dữ liệu chi tiết của 1 theme
  onAddToCart: (theme: ThemeItem) => void;     // Hàm callback (được gọi khi bấm nút Mua)
  onViewDetails: (id: string) => void;         // Hàm callback (được gọi khi bấm nút Chi tiết)
}

/**
 * Component ThemeCard (Thẻ hiển thị 1 Theme)
 * Đây là dạng Presentation Component (Component hiển thị), nó không tự gọi API hay lấy data từ Redux,
 * mà hoàn toàn phụ thuộc vào `props` do cha truyền xuống. Cách viết này giúp component dễ tái sử dụng và dễ test.
 */
const ThemeCard: React.FC<ThemeCardProps> = ({ themeItem, onAddToCart, onViewDetails }) => {
  return (
    <Card
      hoverable // Hiệu ứng nổi lên khi di chuột qua
      cover={   // Phần hiển thị phía trên cùng của thẻ Card (Thường là ảnh preview)
        <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
          <img
            alt={themeItem.name}
            src={themeItem.image}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Badge phiên bản đè lên góc phải của ảnh */}
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <Tag color="purple" style={{ fontWeight: 600, borderRadius: '4px' }}>v{themeItem.version}</Tag>
          </div>
        </div>
      }
      actions={[ // Mảng chứa các nút hành động nằm dưới cùng thẻ Card
        <Button type="text" icon={<EyeOutlined />} onClick={() => onViewDetails(themeItem.id)}>
          Chi tiết
        </Button>,
        <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => onAddToCart(themeItem)}>
          Mua ({themeItem.price.toLocaleString('vi-VN')} đ)
        </Button>,
      ]}
      style={{
        border: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Meta là phần nội dung chính giữa (Tiêu đề + Mô tả) */}
      <Card.Meta
        title={
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            {themeItem.name}
          </span>
        }
        description={
          <div style={{ minHeight: '120px' }}>
            {/* Vùng hiển thị sao đánh giá và lượt tải */}
            <div style={{ marginBottom: '8px' }}>
              <Rate disabled defaultValue={themeItem.rating} allowHalf style={{ fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: '6px' }}>
                ({themeItem.downloads} tải)
              </span>
            </div>
            
            {/* Mô tả theme, tự động cắt ngắn thêm dấu '...' nếu dài quá 3 dòng */}
            <Paragraph ellipsis={{ rows: 3 }} style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              {themeItem.description}
            </Paragraph>
            
            {/* Hiển thị tối đa 2 tag đầu tiên */}
            <Space wrap size={4}>
              {themeItem.tags.slice(0, 2).map((t) => (
                <Tag color="blue" key={t} style={{ fontSize: '11px', borderRadius: '4px' }}>
                  {t}
                </Tag>
              ))}
            </Space>
          </div>
        }
      />
    </Card>
  );
};

export default ThemeCard;
