import React from 'react';
import { Row, Col, Input, Tag, Typography, Space, Empty, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
// Hooks của Redux để tương tác với Store
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addToCart, setSearchQuery, setSelectedCategory, setSelectedPackage } from '../store/themeSlice';
import { ThemeItem, useGetThemesQuery } from '../store/themeApi';
import ThemeCard from '../components/ThemeCard';

const { Title, Text, Paragraph } = Typography;

const SERVICES_PACKAGES = [
  { key: 'All', name: 'Tất cả gói' },
  { key: 'landing', name: 'Gói Landing Page' },
  { key: 'clone', name: 'Gói Clone & Vibe' },
  { key: 'basic', name: 'Gói Cơ Bản' },
  { key: 'store', name: 'Gói Bán Hàng' },
  { key: 'premium', name: 'Gói Cao Cấp' },
];

const Market: React.FC = () => {
  // dispatch: Dùng để bắn (gửi) các action lên Redux Store để thay đổi state
  const dispatch = useDispatch();
  // navigate: Dùng để chuyển hướng trang bằng code (VD: bấm nút -> chuyển sang trang chi tiết)
  const navigate = useNavigate();
  
  // useSelector: Lấy state hiện tại từ Redux Store. Ở đây ta lấy từ khóa tìm kiếm và danh mục đang chọn.
  // Mỗi khi state trong store thay đổi, component này sẽ tự động re-render (cập nhật lại UI).
  const { searchQuery, selectedCategory, selectedPackage } = useSelector((state: RootState) => state.themeUI);

  // RTK Query Hook: Tự động fetch dữ liệu danh sách theme từ API
  const { data: themes = [], isLoading, error } = useGetThemesQuery();

  // Gom động danh mục từ tất cả các tags của themes đang có để hiển thị bộ lọc
  const categoriesList = React.useMemo(() => {
    const list = new Set<string>();
    themes.forEach(t => {
      if (t.tags && Array.isArray(t.tags)) {
        t.tags.forEach(tag => {
          if (tag) list.add(tag);
        });
      }
    });
    return ['All', ...Array.from(list)];
  }, [themes]);

  // Reset danh mục lọc nếu danh mục đang chọn không còn nằm trong danh sách danh mục thực tế
  React.useEffect(() => {
    if (selectedCategory !== 'All' && !categoriesList.includes(selectedCategory)) {
      dispatch(setSelectedCategory('All'));
    }
  }, [categoriesList, selectedCategory, dispatch]);

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

  // Filter (Lọc) danh sách themes dựa trên từ khóa tìm kiếm HOẶC danh mục đã chọn HOẶC gói dịch vụ
  const filteredThemes = themes.filter((t) => {
    // So sánh không phân biệt hoa thường bằng toLowerCase()
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                          (t.tags && t.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase()));
    const matchesPackage = selectedPackage === 'All' || t.servicePackage === selectedPackage;
    
    // Theme phải thỏa mãn CẢ BA điều kiện: khớp tên/mô tả VÀ khớp danh mục VÀ khớp gói
    return matchesSearch && matchesCategory && matchesPackage;
  });

  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Filter and Search Bar */}
      {/* Hàng 1: Tìm kiếm và Lọc Lĩnh vực */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }} align="middle">
        <Col xs={24} md={8}>
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
        <Col xs={24} md={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Lĩnh vực:</span>
            <Space wrap size={4}>
              {categoriesList.map((cat) => (
                <Tag.CheckableTag
                  key={cat}
                  checked={selectedCategory === cat}
                  onChange={() => handleCategorySelect(cat)}
                  style={{
                    fontSize: '13px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat ? '#6366f1' : '#fff',
                    color: selectedCategory === cat ? '#fff' : '#64748b',
                  }}
                >
                  {cat}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
        </Col>
      </Row>

      {/* Hàng 2: Lọc Gói dịch vụ thiết kế */}
      <Row style={{ marginBottom: '32px' }}>
        <Col span={24}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            flexWrap: 'wrap', 
            background: 'rgba(99, 102, 241, 0.03)', 
            padding: '12px 16px', 
            borderRadius: '12px', 
            border: '1px solid rgba(99, 102, 241, 0.08)' 
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#4f46e5' }}>Gói dịch vụ:</span>
            <Space wrap size={4}>
              {SERVICES_PACKAGES.map((pkg) => (
                <Tag.CheckableTag
                  key={pkg.key}
                  checked={selectedPackage === pkg.key}
                  onChange={() => dispatch(setSelectedPackage(pkg.key))}
                  style={{
                    fontSize: '13px',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    backgroundColor: selectedPackage === pkg.key ? '#4f46e5' : '#fff',
                    color: selectedPackage === pkg.key ? '#fff' : '#64748b',
                  }}
                >
                  {pkg.name}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
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
