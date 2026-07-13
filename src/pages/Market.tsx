import React from 'react';
import { Row, Col, Input, Tag, Typography, Space, Empty, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
// Hooks của Redux để tương tác với Store
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addToCart, setSearchQuery, setSelectedCategory } from '../store/themeSlice';
import { ThemeItem, useGetThemesQuery } from '../store/themeApi';
import ThemeCard from '../components/ThemeCard';

const { Title, Text, Paragraph } = Typography;

const CATEGORIES = ['All', 'E-Commerce', 'SaaS', 'Portfolio', 'News'];

const Market: React.FC = () => {
  // dispatch: Dùng để bắn (gửi) các action lên Redux Store để thay đổi state
  const dispatch = useDispatch();
  // navigate: Dùng để chuyển hướng trang bằng code (VD: bấm nút -> chuyển sang trang chi tiết)
  const navigate = useNavigate();
  
  // useSelector: Lấy state hiện tại từ Redux Store. Ở đây ta lấy từ khóa tìm kiếm và danh mục đang chọn.
  // Mỗi khi state trong store thay đổi, component này sẽ tự động re-render (cập nhật lại UI).
  const { searchQuery, selectedCategory } = useSelector((state: RootState) => state.themeUI);

  // RTK Query Hook: Tự động fetch dữ liệu danh sách theme từ API (Supabase/Mock)
  // Tính năng xịn: Tự động quản lý cờ trạng thái `isLoading` (đang tải) và `error` (lỗi mạng) cho ta.
  const { data: themes = [], isLoading, error } = useGetThemesQuery();

  // Hàm xử lý khi người dùng gõ vào ô tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lưu từ khóa tìm kiếm vào Redux Store để filter
    dispatch(setSearchQuery(e.target.value));
  };

  // Hàm xử lý khi người dùng bấm chọn 1 danh mục (Tag)
  const handleCategorySelect = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  // Hàm xử lý khi người dùng bấm nút "Mua" trên 1 thẻ Theme
  const handleAddToCart = (theme: ThemeItem) => {
    dispatch(addToCart({ id: theme.id, name: theme.name, price: theme.price, image: theme.image }));
    message.success(`Đã thêm ${theme.name} vào giỏ hàng thành công!`);
  };

  // Filter (Lọc) danh sách themes dựa trên từ khóa tìm kiếm HOẶC danh mục đã chọn
  // Đây là Derived Data (Dữ liệu phái sinh), tính toán lại mỗi khi `themes`, `searchQuery` hoặc `selectedCategory` thay đổi
  const filteredThemes = themes.filter((t) => {
    // So sánh không phân biệt hoa thường bằng toLowerCase()
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.tags.includes(selectedCategory) || t.tags.some(tag => tag.includes(selectedCategory));
    
    // Theme phải thỏa mãn CẢ HAI điều kiện: khớp tên/mô tả VÀ khớp danh mục
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          marginBottom: '40px',
          border: '1px solid rgba(99, 102, 241, 0.1)',
        }}
      >
        <Title level={1} style={{ margin: 0, fontWeight: 800, fontSize: '38px', color: '#1e1b4b' }}>
          Premium WordPress Themes Marketplace
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#475569', marginTop: '12px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          Tải các theme WordPress chất lượng cao, chuẩn SEO, đạt điểm Core Web Vitals tuyệt đối và dễ dàng kích hoạt, quản lý key bản quyền tại đây.
        </Paragraph>
      </div>

      {/* Filter and Search Bar */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }} align="middle" justify="space-between">
        <Col xs={24} md={10}>
          <Input
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="Tìm kiếm theme..."
            value={searchQuery}
            onChange={handleSearch}
            size="large"
            allowClear
            style={{ borderRadius: '10px' }}
          />
        </Col>
        <Col xs={24} md={14} style={{ textAlign: 'right' }}>
          <Space wrap size={8}>
            {CATEGORIES.map((cat) => (
              <Tag.CheckableTag
                key={cat}
                checked={selectedCategory === cat}
                onChange={() => handleCategorySelect(cat)}
                style={{
                  fontSize: '14px',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat ? '#6366f1' : 'transparent',
                  color: selectedCategory === cat ? '#fff' : '#595959',
                }}
              >
                {cat}
              </Tag.CheckableTag>
            ))}
          </Space>
        </Col>
      </Row>

      {/* Loading & Error States */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large">
            <div style={{ marginTop: '16px', color: '#6366f1', fontWeight: 600 }}>Đang tải danh sách theme...</div>
          </Spin>
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Text danger>Lỗi tải dữ liệu. Vui lòng kiểm tra cấu hình kết nối.</Text>
        </div>
      )}

      {/* Themes Grid */}
      {!isLoading && !error && (
        filteredThemes.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredThemes.map((themeItem) => (
              <Col xs={24} sm={12} lg={6} key={themeItem.id}>
                <ThemeCard
                  themeItem={themeItem}
                  onAddToCart={handleAddToCart}
                  onViewDetails={(id) => navigate(`/theme/${id}`)}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="Không tìm thấy theme phù hợp với điều kiện lọc." style={{ marginTop: '60px' }} />
        )
      )}
    </div>
  );
};

export default Market;
