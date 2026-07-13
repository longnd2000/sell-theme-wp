import React, { useState } from 'react';
// Import các UI Component có sẵn của thư viện Ant Design
import { Card, Button, Tag, Typography, Space, Modal } from 'antd';
// Import các Icon SVG dạng Component
import { ShoppingCartOutlined, EyeOutlined, ZoomInOutlined } from '@ant-design/icons';
import { ThemeItem } from '../store/themeApi';

// Lấy component Paragraph từ Typography để render đoạn văn bản
const { Paragraph } = Typography;

/**
 * Interface Props của ThemeCard
 */
interface ThemeCardProps {
  themeItem: ThemeItem;                        // Dữ liệu chi tiết của 1 theme
  onAddToCart: (theme: ThemeItem) => void;     // Hàm callback khi bấm nút Mua
  onViewDetails: (id: string) => void;         // Hàm callback khi bấm nút Chi tiết
}

/**
 * Component ThemeCard (Thẻ hiển thị 1 Theme chuyên nghiệp)
 */
const ThemeCard: React.FC<ThemeCardProps> = ({ themeItem, onAddToCart, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <Card
        hoverable // Hiệu ứng nổi lên khi di chuột qua
        cover={
          <div 
            style={{ height: '180px', overflow: 'hidden', position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              alt={themeItem.name}
              src={themeItem.image}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transition: 'transform 0.5s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)'
              }}
            />
            {/* Lớp phủ Overlay và nút Xem nhanh xuất hiện mượt mà khi hover */}
            <div 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                backgroundColor: 'rgba(15, 23, 42, 0.45)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.3s ease',
                cursor: 'pointer',
                zIndex: 1
              }}
              onClick={() => setIsPreviewOpen(true)}
            >
              <Button 
                type="primary" 
                shape="round"
                icon={<ZoomInOutlined />} 
                style={{ 
                  background: '#4f46e5', 
                  borderColor: '#4f46e5', 
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}
              >
                Xem nhanh
              </Button>
            </div>
            
            {/* Badge phiên bản */}
            {themeItem.version && (
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                <Tag color="purple" style={{ fontWeight: 600, borderRadius: '4px' }}>v{themeItem.version}</Tag>
              </div>
            )}
          </div>
        }
        style={{
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        bodyStyle={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card.Meta
          title={
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
              {themeItem.name}
            </span>
          }
          description={
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', minHeight: '170px', marginTop: '8px' }}>
              <div>
                {/* Mô tả theme, tự động cắt ngắn thêm dấu '...' nếu dài quá 3 dòng */}
                <Paragraph ellipsis={{ rows: 3 }} style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', minHeight: '54px' }}>
                  {themeItem.description}
                </Paragraph>
                
                {/* Hiển thị tối đa 2 tag lĩnh vực theme */}
                <Space wrap size={4} style={{ marginBottom: '16px' }}>
                  {themeItem.tags.slice(0, 2).map((t) => (
                    <Tag 
                      key={t} 
                      style={{ 
                        fontSize: '11px', 
                        borderRadius: '4px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        padding: '2px 8px'
                      }}
                    >
                      {t}
                    </Tag>
                  ))}
                </Space>
              </div>

              {/* Dòng nút hành động sắp xếp cân đối và đồng điệu */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <Button 
                  style={{ 
                    flex: 1, 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    color: '#475569',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }} 
                  icon={<EyeOutlined />} 
                  onClick={() => onViewDetails(themeItem.id)}
                >
                  Chi tiết
                </Button>
                <Button 
                  type="primary" 
                  style={{ 
                    flex: 1.5, 
                    background: '#4f46e5', 
                    borderColor: '#4f46e5', 
                    borderRadius: '8px', 
                    fontWeight: 600,
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.15)',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }} 
                  icon={<ShoppingCartOutlined />} 
                  onClick={() => onAddToCart(themeItem)}
                >
                  Mua ({themeItem.price.toLocaleString('vi-VN')} đ)
                </Button>
              </div>
            </div>
          }
        />
      </Card>

      {/* Popup Modal Xem trước ảnh chụp trang chủ của Theme */}
      <Modal
        title={
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            Xem thử giao diện trang chủ: {themeItem.name}
          </span>
        }
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={1000}
        centered
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', background: '#f8fafc', padding: '20px', textAlign: 'center' }}>
          {themeItem.previewImage ? (
            <img 
              src={themeItem.previewImage} 
              alt={`Preview ${themeItem.name}`} 
              style={{ 
                width: '100%', 
                height: 'auto', 
                display: 'inline-block', 
                borderRadius: '8px', 
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}
            />
          ) : (
            <div style={{ padding: '60px 0', color: '#64748b', fontSize: '14px' }}>
              Chưa có hình ảnh preview trang chủ lớn cho theme này.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ThemeCard;
