import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Button, Badge, theme, Row, Col, Typography } from 'antd';
import { ShopOutlined, DashboardOutlined, ShoppingCartOutlined, ThunderboltOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';
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
  const cart = useSelector((state: RootState) => state.themeUI.cart);
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  useEffect(() => {
    const handleLoginChange = () => {
      setIsAdmin(localStorage.getItem('admin_logged_in') === 'true');
    };
    window.addEventListener('admin-login-change', handleLoginChange);
    return () => {
      window.removeEventListener('admin-login-change', handleLoginChange);
    };
  }, []);

  // Determine current active menu item based on routing path
  const currentKey = 
    location.pathname === '/admin/licenses' ? 'licenses' : 
    location.pathname === '/admin/themes' ? 'admin-themes' : 
    location.pathname === '/services' ? 'services' : 'market';

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1', // Trendy premium Indigo
          colorInfo: '#3b82f6',
          borderRadius: 12,
          fontFamily: "'Be Vietnam Pro', sans-serif",
          colorBgContainer: '#ffffff',
          colorText: '#0f172a',
          colorTextDescription: '#334155',
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 16,
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
              <Text type="secondary" style={{ fontSize: '10px', display: 'block', marginTop: '2px' }}>
                THEME HUB & LICENSE MANAGER
              </Text>
            </div>
          </Link>

          <Menu
            mode="horizontal"
            selectedKeys={[currentKey]}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              background: 'transparent',
              borderBottom: 'none',
              minWidth: '240px',
            }}
            items={[
              {
                key: 'market',
                icon: <ShopOutlined />,
                label: <Link to="/">Theme Market</Link>,
              },
              {
                key: 'services',
                icon: <SettingOutlined />,
                label: <Link to="/services">Dịch vụ Website</Link>,
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
            ].filter(Boolean) as any}
          />

          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
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
          </div>
        </Header>

        <Content style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Market />} />
              <Route path="/theme/:id" element={<ThemeDetail />} />
              <Route path="/services" element={<Services />} />
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
