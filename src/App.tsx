import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, Badge, theme, Row, Col, Typography, Drawer } from 'antd';
import { ShopOutlined, DashboardOutlined, ShoppingCartOutlined, ThunderboltOutlined, SettingOutlined, DatabaseOutlined, MenuOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import Market from './pages/Market';
import ThemeDetail from './pages/ThemeDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Services from './pages/Services';
import TemplatesPreview from './pages/TemplatesPreview';
import AdminThemes from './admin/Themes';
import AdminLicenses from './admin/Licenses';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

const App: React.FC = () => {
  // Trạng thái đóng/mở Drawer menu trên di động
  const [drawerVisible, setDrawerVisible] = useState(false);
  // Lấy danh sách sản phẩm trong Giỏ hàng từ Redux Store toàn cục
  const cart = useSelector((state: RootState) => state.themeUI.cart);
  // Sử dụng hook useLocation từ react-router-dom để lấy thông tin đường dẫn URL hiện tại
  const location = useLocation();

  // State cục bộ xác định xem người dùng hiện tại có phải là Admin hay không.
  // Khởi tạo giá trị bằng cách kiểm tra key 'admin_logged_in' trong localStorage.
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  // Sử dụng useEffect để lắng nghe sự kiện đăng nhập/đăng xuất thay đổi trên phạm vi window.
  // Cơ chế này giúp cập nhật ngay lập tức giao diện Menu Header (ẩn/hiện các tab quản trị).
  useEffect(() => {
    const handleLoginChange = () => {
      // Đọc lại trạng thái đăng nhập mới nhất từ localStorage và cập nhật lại state isAdmin
      setIsAdmin(localStorage.getItem('admin_logged_in') === 'true');
    };
    // Đăng ký lắng nghe sự kiện tự định nghĩa 'admin-login-change'
    window.addEventListener('admin-login-change', handleLoginChange);
    // Hàm cleanup: Hủy lắng nghe sự kiện khi Component bị unmount để tránh rò rỉ bộ nhớ (memory leak)
    return () => {
      window.removeEventListener('admin-login-change', handleLoginChange);
    };
  }, []);

  // Xác định menu item nào đang được active (in đậm trên header) dựa trên đường dẫn URL hiện tại
  const currentKey = 
    location.pathname === '/admin/licenses' ? 'licenses' : 
    location.pathname === '/admin/themes' ? 'admin-themes' : 
    location.pathname === '/themes' || location.pathname.startsWith('/theme/') ? 'market' : 
    location.pathname === '/' ? 'services' : 'services';

  return (
    // ConfigProvider của Ant Design dùng để thiết lập Design System chung cho toàn dự án
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm, // Sử dụng thuật toán giao diện sáng mặc định
        token: {
          colorPrimary: '#6366f1', // Thiết lập tông màu chủ đạo chính (Màu tím Indigo thời thượng)
          colorInfo: '#3b82f6',
          borderRadius: 12,        // Độ bo góc mặc định của các phần tử UI (Button, Card, Input...)
          fontFamily: "'Be Vietnam Pro', sans-serif", // Phông chữ mặc định toàn hệ thống
          colorBgContainer: '#ffffff',
          colorText: '#0f172a',
          colorTextDescription: '#334155',
        },
        components: { // Tùy biến chi tiết (Custom Design Token) cho từng Component cụ thể
          Button: {
            controlHeight: 40, // Chiều cao mặc định của nút bấm
            borderRadius: 8,   // Độ bo góc riêng của nút bấm
          },
          Card: {
            borderRadiusLG: 16, // Độ bo góc riêng cho thẻ Card lớn
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '0 24px',
            height: '64px',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'inherit', textDecoration: 'none' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <ThunderboltOutlined style={{ color: '#fff', fontSize: '18px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontWeight: 700, lineHeight: 1, background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                WPHub
              </Title>
              <Text type="secondary" className="logo-subtitle" style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>
                THEME HUB & LICENSE MANAGER
              </Text>
            </div>
          </Link>

          {/* Định nghĩa các mục menu dùng chung cho cả Bản Desktop và Bản Mobile Drawer */}
          {(() => {
            const menuItems = [
              {
                key: 'services',
                icon: <SettingOutlined />,
                label: <Link to="/">Dịch vụ Website</Link>,
              },
              {
                key: 'market',
                icon: <ShopOutlined />,
                label: <Link to="/themes">Theme Market</Link>,
              },
              isAdmin && {
                key: 'licenses',
                icon: <DashboardOutlined />,
                label: <Link to="/admin/licenses">License Manager</Link>,
              },
              isAdmin && {
                key: 'admin-themes',
                icon: <DatabaseOutlined />,
                label: <Link to="/admin/themes">Quản trị Theme</Link>,
              },
            ].filter(Boolean) as any;

            return (
              <>
                {/* Menu ngang dành riêng cho màn hình Desktop (Máy tính) */}
                <Menu
                  mode="horizontal"
                  selectedKeys={[currentKey]}
                  className="desktop-menu"
                  style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    background: 'transparent',
                    borderBottom: 'none',
                  }}
                  items={menuItems}
                />

                {/* Nút bấm giỏ hàng & nút Hamburger Menu (Mobile) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                  <Badge count={cart.length} offset={[-2, 2]} color="#ef4444">
                    <Link to="/cart" style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        type="text"
                        shape="circle"
                        icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      />
                    </Link>
                  </Badge>

                  {/* Nút Hamburger bật Drawer trên Mobile */}
                  <Button
                    type="text"
                    shape="circle"
                    className="mobile-menu-btn"
                    icon={<MenuOutlined style={{ fontSize: '20px' }} />}
                    onClick={() => setDrawerVisible(true)}
                  />
                </div>

                {/* Drawer Menu trượt dọc dành riêng cho thiết bị di động */}
                <Drawer
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ThunderboltOutlined style={{ color: '#6366f1', fontSize: '18px' }} />
                      <span style={{ fontWeight: 700 }}>Menu</span>
                    </div>
                  }
                  placement="right"
                  onClose={() => setDrawerVisible(false)}
                  open={drawerVisible}
                  width={260}
                  styles={{ body: { padding: 0 } }}
                >
                  <Menu
                    mode="vertical"
                    selectedKeys={[currentKey]}
                    onClick={() => setDrawerVisible(false)}
                    style={{ borderRight: 'none' }}
                    items={menuItems}
                  />
                </Drawer>
              </>
            );
          })()}
        </Header>

        <Content className="main-content-layout" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Services />} />
              <Route path="/themes" element={<Market />} />
              <Route path="/theme/:id" element={<ThemeDetail />} />
              <Route path="/templates-preview" element={<TemplatesPreview />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/admin/licenses" element={<AdminLicenses />} />
              <Route path="/admin/themes" element={<AdminThemes />} />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center', background: 'transparent', borderTop: '1px solid rgba(0, 0, 0, 0.05)', color: '#8c8c8c' }}>
          WPHub ©{new Date().getFullYear()} - Premium WordPress Themes & Activation Management System
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
