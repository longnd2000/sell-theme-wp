import React from 'react';
import { Card, Button, Rate, Tag, Typography, Space } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { ThemeItem } from '../store/themeApi';

const { Paragraph } = Typography;

interface ThemeCardProps {
  themeItem: ThemeItem;
  onAddToCart: (theme: ThemeItem) => void;
  onViewDetails: (id: string) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ themeItem, onAddToCart, onViewDetails }) => {
  return (
    <Card
      hoverable
      cover={
        <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
          <img
            alt={themeItem.name}
            src={themeItem.image}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <Tag color="purple" style={{ fontWeight: 600, borderRadius: '4px' }}>v{themeItem.version}</Tag>
          </div>
        </div>
      }
      actions={[
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
      <Card.Meta
        title={
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
            {themeItem.name}
          </span>
        }
        description={
          <div style={{ minHeight: '120px' }}>
            <div style={{ marginBottom: '8px' }}>
              <Rate disabled defaultValue={themeItem.rating} allowHalf style={{ fontSize: '12px' }} />
              <span style={{ fontSize: '11px', color: '#8c8c8c', marginLeft: '6px' }}>
                ({themeItem.downloads} tải)
              </span>
            </div>
            <Paragraph ellipsis={{ rows: 3 }} style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
              {themeItem.description}
            </Paragraph>
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
