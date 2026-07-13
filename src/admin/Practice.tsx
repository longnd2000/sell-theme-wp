import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Divider, Select, Tabs, Tag, Alert, Input, Progress, Badge, List, Switch, Tooltip, message } from 'antd';
import { 
  RocketOutlined, 
  DatabaseOutlined, 
  SyncOutlined, 
  CodeOutlined, 
  BulbOutlined, 
  SendOutlined, 
  InfoCircleOutlined, 
  LockOutlined, 
  UserOutlined, 
  LogoutOutlined,
  CheckCircleOutlined,
  WarningOutlined,
   ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// Mock REST API database state for simulation
interface MockData {
  id: number;
  name: string;
  version: string;
  downloads: number;
}

const INITIAL_MOCK_DATA: MockData[] = [
  { id: 1, name: 'LX Landing Theme', version: '1.2.0', downloads: 142 },
  { id: 2, name: 'WP Portfoli-X', version: '2.0.1', downloads: 89 },
  { id: 3, name: 'BizGrow WordPress', version: '1.0.4', downloads: 54 },
];

const AdminPractice: React.FC = () => {
  // Quản lý trạng thái Đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('admin_logged_in') === 'true';
  });

  const handleLoginSubmit = (values: Record<string, string>) => {
    if (values.username === 'admin' && values.password === 'abc123') {
      localStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('admin-login-change'));
      message.success('Đăng nhập thành công với quyền Quản trị viên!');
    } else {
      message.error('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('admin-login-change'));
    message.success('Đã đăng xuất tài khoản quản trị!');
  };

  // --- RTK QUERY SIMULATION STATES ---
  const [apiData, setApiData] = useState<MockData[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [cacheTime, setCacheTime] = useState(0); // seconds remaining in cache
  const [isCached, setIsCached] = useState(false);
  const [providedTags, setProvidedTags] = useState<string[]>([]);
  const cacheTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Mock Query
  const triggerQuery = () => {
    if (isCached && apiData) {
      message.info('RTK Query: Lấy dữ liệu từ Cache (Không tạo HTTP Request mới!)');
      // Reset cache timer back to 10s (simulating keepUnusedDataFor)
      setCacheTime(10);
      return;
    }

    setIsFetching(true);
    message.loading({ content: 'REST API: GET /api/themes - Đang tạo HTTP Request...', key: 'fetching' });

    setTimeout(() => {
      setApiData(INITIAL_MOCK_DATA);
      setIsFetching(false);
      setIsCached(true);
      setProvidedTags(['Themes', 'LIST']);
      setCacheTime(10); // Cache stays alive for 10 seconds in this simulator
      message.success({ content: 'REST API: GET /api/themes thành công! Dữ liệu đã lưu vào Redux Cache.', key: 'fetching', duration: 2 });
    }, 800);
  };

  // Cache countdown timer
  useEffect(() => {
    if (isCached && cacheTime > 0) {
      cacheTimerRef.current = setTimeout(() => {
        setCacheTime(prev => prev - 1);
      }, 1000);
    } else if (cacheTime === 0 && isCached) {
      setIsCached(false);
      setProvidedTags([]);
      message.warning('RTK Query Cache: Hết hạn sử dụng (Unused Cache Expired)! Cache đã bị xóa khỏi Redux Store.');
    }
    return () => {
      if (cacheTimerRef.current) clearTimeout(cacheTimerRef.current);
    };
  }, [cacheTime, isCached]);

  // Trigger Mock Mutation (Invalidate Cache)
  const triggerMutation = () => {
    message.loading({ content: 'REST API: POST /api/themes/add - Đang cập nhật dữ liệu...', key: 'mutating' });
    
    setTimeout(() => {
      // Add a mock item
      if (apiData) {
        const newItem: MockData = {
          id: apiData.length + 1,
          name: `New Theme ${apiData.length + 1}`,
          version: '1.0.0',
          downloads: 0
        };
        INITIAL_MOCK_DATA.push(newItem);
        setApiData([...apiData, newItem]);
      }

      // RTK Query Cache Invalidation Logic
      message.success({ content: 'REST API: POST thành công! Đã phát hiện tag [Themes] bị thay đổi.', key: 'mutating', duration: 2 });
      
      // Invalidate cache immediately!
      setIsCached(false);
      setCacheTime(0);
      setProvidedTags([]);
      
      // Trigger auto refetch
      setTimeout(() => {
        message.info('RTK Query: Tự động tải lại dữ liệu mới (Auto Refetch) do cache tag [Themes] bị Invalidate!');
        triggerQuery();
      }, 600);

    }, 800);
  };

  // --- WEBSOCKET SIMULATION STATES ---
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketLogs, setSocketLogs] = useState<string[]>([
    'System: WebSocket Client initialized. Nhấn Kết nối để mở kết nối real-time.'
  ]);
  const [customMsg, setCustomMsg] = useState('');

  const toggleSocket = () => {
    if (socketConnected) {
      setSocketConnected(false);
      addSocketLog('System: Đã ngắt kết nối WebSocket.');
    } else {
      setSocketConnected(true);
      addSocketLog('System: Đang bắt tay kết nối (WebSocket Handshake)...');
      setTimeout(() => {
        addSocketLog('System: Đã kết nối thành công tới ws://api.wphub.vn/realtime');
        addSocketLog('Server: Chào mừng Admin! Lắng nghe các sự kiện kích hoạt bản quyền...');
      }, 600);
    }
  };

  const addSocketLog = (log: string) => {
    setSocketLogs(prev => [...prev, `[${new Date().toLocaleTimeString('vi-VN')}] ${log}`]);
  };

  const sendSocketMessage = () => {
    if (!customMsg.trim()) return;
    addSocketLog(`Client: Emit event [admin_action] -> "${customMsg}"`);
    setCustomMsg('');
    
    // Simulate server response
    setTimeout(() => {
      addSocketLog(`Server: Đã nhận dữ liệu từ admin -> "Đã xử lý thành công!"`);
    }, 400);
  };

  // Simulate server pushing real-time notification via WebSocket
  useEffect(() => {
    let pushInterval: NodeJS.Timeout;
    if (socketConnected) {
      pushInterval = setInterval(() => {
        const randomEvents = [
          'Server [PUSH]: Khách hàng *Nguyễn Văn A* vừa mua gói "Landing Page" thành công!',
          'Server [PUSH]: Key WP-7729-XX vừa được kích hoạt tại domain: "site-cua-toi.com"',
          'Server [PUSH]: Phát hiện 1 lượt tải mới cho theme "LX Landing"',
        ];
        const randomLog = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addSocketLog(randomLog);
        
        // Dynamic RTK Invalidation simulator on WebSockets message!
        if (randomLog.includes('mua gói') || randomLog.includes('tải mới')) {
          addSocketLog('Socket Sync: Phát hiện dữ liệu DB thay đổi! Tự động Invalidate Cache của RTK Query...');
          setIsCached(false);
          setCacheTime(0);
          setProvidedTags([]);
        }
      }, 5000);
    }
    return () => clearInterval(pushInterval);
  }, [socketConnected]);

  // --- TAILWIND PLAYGROUND CODE ---
  const [tailwindBg, setTailwindBg] = useState('bg-indigo-600');
  const [tailwindRounded, setTailwindRounded] = useState('rounded-xl');
  const [tailwindHover, setTailwindHover] = useState('hover:scale-105');

  // Giao diện Đăng nhập nếu chưa đăng nhập
  if (!isLoggedIn) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '75vh',
        background: 'transparent'
      }}>
        <Card 
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            borderRadius: '24px', 
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}
          styles={{ body: { padding: '32px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
            }}>
              <LockOutlined style={{ color: '#fff', fontSize: '24px' }} />
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Đăng Nhập Quản Trị</Title>
            <Text type="secondary" style={{ fontSize: '13px' }}>Vui lòng đăng nhập để vào phòng thực hành (Labs)</Text>
          </div>

          <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = (formData.get('username') as string) || '';
            const password = (formData.get('password') as string) || '';
            handleLoginSubmit({ username, password });
          }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Input 
                name="username"
                prefix={<UserOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Tài khoản (admin)" 
                style={{ height: '40px', borderRadius: '8px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Input.Password 
                name="password"
                prefix={<LockOutlined style={{ color: '#94a3b8' }} />} 
                placeholder="Mật khẩu (abc123)" 
                style={{ height: '40px', borderRadius: '8px' }}
                required
              />
            </div>

            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              style={{ height: '40px', borderRadius: '8px', fontWeight: 600, background: '#6366f1' }}
            >
              Đăng Nhập
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header section with Tech Stack Badge */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl mb-8">
        <div>
          <Space align="center" style={{ marginBottom: '8px' }}>
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400">
              <ThunderboltOutlined style={{ fontSize: '20px' }} />
            </span>
            <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#fff' }}>
              WP Tech Stack Labs & Practice
            </Title>
          </Space>
          <Text className="text-slate-400 block max-w-2xl">
            Khu vực thực hành, mô phỏng trực quan cơ chế quản lý trạng thái, caching của RTK Query, truyền tải Socket real-time, và ứng dụng Tailwind CSS vào Next.js.
          </Text>
          <div className="flex flex-wrap gap-2 mt-4">
            <Tag color="blue" className="font-semibold">TypeScript</Tag>
            <Tag color="cyan" className="font-semibold">React 19</Tag>
            <Tag color="geekblue" className="font-semibold">Next.js App Router</Tag>
            <Tag color="purple" className="font-semibold">Redux Toolkit</Tag>
            <Tag color="indigo" className="font-semibold">RTK Query</Tag>
            <Tag color="magenta" className="font-semibold">Ant Design 5</Tag>
            <Tag color="gold" className="font-semibold">Tailwind CSS</Tag>
            <Tag color="green" className="font-semibold">WebSockets</Tag>
          </div>
        </div>
        <Button
          type="default"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="mt-4 md:mt-0 font-semibold"
          style={{ borderRadius: '8px' }}
        >
          Đăng xuất Labs
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: RTK Query Cache Visualizer */}
        <div className="flex flex-col gap-8">
          
          {/* RTK Query Cache Live Simulator */}
          <Card 
            title={
              <Space>
                <SyncOutlined spin={isFetching} className="text-indigo-500" />
                <span className="font-bold text-slate-800">RTK Query & REST API Cache Simulator</span>
              </Space>
            }
            variant="borderless"
            className="shadow-md rounded-2xl border border-slate-100"
          >
            <Alert
              message="Cách thức hoạt động của Cache & Invalidation trong RTK Query"
              description="Khi bạn gọi Query (GET), RTK Query sẽ lưu kết quả vào Redux cache kèm theo tag 'Themes'. Các lần gọi tiếp theo sẽ lấy dữ liệu ngay từ Cache mà không tạo HTTP request. Khi bạn chạy Mutation (POST), tag 'Themes' bị invalidate (hủy), ép buộc RTK Query tự động phát HTTP request mới để lấy dữ liệu cập nhật nhất!"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              className="mb-6 rounded-xl"
            />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <Text type="secondary" className="text-xs block mb-1">TRẠNG THÁI CACHE</Text>
                {isCached ? (
                  <Tag color="success" className="font-bold uppercase text-xs py-1 px-3 m-0 rounded-full">
                    Active (Đang lưu cache)
                  </Tag>
                ) : (
                  <Tag color="default" className="font-bold uppercase text-xs py-1 px-3 m-0 rounded-full">
                    Expired / No Cache
                  </Tag>
                )}
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <Text type="secondary" className="text-xs block mb-1">THỜI GIAN SỐNG CỦA CACHE (TTL)</Text>
                <Progress 
                  percent={cacheTime * 10} 
                  format={() => `${cacheTime}s`} 
                  status={cacheTime > 0 ? 'active' : 'normal'}
                  strokeColor={{ '0%': '#10b981', '100%': '#6366f1' }}
                  className="m-0"
                />
              </div>
            </div>

            <div className="mb-6 p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <Text strong className="text-slate-800 text-sm">Redux Store Cache Status:</Text>
                <div>
                  <Text className="text-xs text-slate-500 mr-2">Tags cung cấp:</Text>
                  {providedTags.length > 0 ? (
                    providedTags.map(t => <Tag key={t} color="purple" className="m-0 font-semibold">{t}</Tag>)
                  ) : (
                    <Text italic className="text-xs text-slate-400">Không có</Text>
                  )}
                </div>
              </div>

              {apiData ? (
                <List
                  size="small"
                  bordered
                  dataSource={apiData}
                  className="bg-white rounded-xl overflow-hidden"
                  renderItem={item => (
                    <List.Item className="hover:bg-slate-50 transition-all">
                      <div className="flex justify-between w-100 items-center">
                        <Space>
                          <Badge color="#6366f1" />
                          <Text strong className="text-slate-700">{item.name}</Text>
                        </Space>
                        <Space>
                          <Tag color="cyan">v{item.version}</Tag>
                          <Text type="secondary" className="text-xs">{item.downloads} downloads</Text>
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                  <DatabaseOutlined className="text-4xl text-slate-300 mb-2 block" />
                  <Text type="secondary" italic>Chưa có dữ liệu trong Redux Store. Vui lòng bấm "Trigger Query (GET)" dưới đây.</Text>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button 
                type="primary" 
                icon={<SyncOutlined />} 
                loading={isFetching}
                onClick={triggerQuery}
                className="flex-1 h-10 font-semibold bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Trigger Query (GET /api/themes)
              </Button>
              <Button 
                type="default" 
                danger
                icon={<RocketOutlined />} 
                disabled={!apiData}
                onClick={triggerMutation}
                className="flex-1 h-10 font-semibold rounded-xl"
              >
                Trigger Mutation (POST /invalidate)
              </Button>
            </div>
          </Card>

          {/* Tailwind CSS & Ant Design Integration Sandbox */}
          <Card
            title={
              <Space>
                <CodeOutlined className="text-cyan-500" />
                <span className="font-bold text-slate-800">Tailwind CSS + Ant Design 5 Playground</span>
              </Space>
            }
            variant="borderless"
            className="shadow-md rounded-2xl border border-slate-100"
          >
            <Alert
              message="Tailwind CSS CDN & Ant Design 5 (CSS-in-JS)"
              description="Để tránh Tailwind CSS reset làm ảnh hưởng đến layout của Ant Design, chúng tôi đã cấu hình tailwind.config tắt corePlugins.preflight. Giờ đây bạn có thể tự do dùng các class tiện ích của Tailwind (như flex, grid, hover, transform, shadows) kết hợp với antd!"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              className="mb-6 rounded-xl"
            />

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <Text strong className="text-xs block mb-2 text-slate-500">1. CHỌN MÀU NỀN TAILWIND (Tailwind BG Class):</Text>
                <Select
                  value={tailwindBg}
                  onChange={setTailwindBg}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'bg-indigo-600', label: 'bg-indigo-600 (Xanh Indigo)' },
                    { value: 'bg-emerald-500', label: 'bg-emerald-500 (Xanh Ngọc)' },
                    { value: 'bg-rose-500', label: 'bg-rose-500 (Hồng Đỏ)' },
                    { value: 'bg-slate-900', label: 'bg-slate-900 (Đen Slate)' },
                    { value: 'bg-gradient-to-r from-indigo-500 to-purple-600', label: 'bg-gradient-to-r from-indigo-500 to-purple-600 (Gradients)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text strong className="text-xs block mb-2 text-slate-500">2. BO GÓC (Border Radius):</Text>
                  <Select
                    value={tailwindRounded}
                    onChange={setTailwindRounded}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'rounded-none', label: 'rounded-none (Vuông)' },
                      { value: 'rounded-lg', label: 'rounded-lg (Bo vừa)' },
                      { value: 'rounded-xl', label: 'rounded-xl (Bo nhiều)' },
                      { value: 'rounded-3xl', label: 'rounded-3xl (Bo cực đại)' },
                      { value: 'rounded-full', label: 'rounded-full (Tròn vo)' },
                    ]}
                  />
                </div>
                <div>
                  <Text strong className="text-xs block mb-2 text-slate-500">3. HOVER EFFECT (Transform/Scale):</Text>
                  <Select
                    value={tailwindHover}
                    onChange={setTailwindHover}
                    style={{ width: '100%' }}
                    options={[
                      { value: 'hover:scale-100', label: 'hover:scale-100 (Không biến đổi)' },
                      { value: 'hover:scale-105', label: 'hover:scale-105 (Phóng to nhẹ)' },
                      { value: 'hover:scale-110', label: 'hover:scale-110 (Phóng to mạnh)' },
                      { value: 'hover:-translate-y-2', label: 'hover:-translate-y-2 (Bay lên)' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Sandbox Render Box */}
            <div className="p-8 bg-slate-100 rounded-2xl flex justify-center items-center border border-slate-200">
              <div 
                className={`p-6 text-white text-center shadow-2xl transition-all duration-300 cursor-pointer ${tailwindBg} ${tailwindRounded} ${tailwindHover}`}
                style={{ width: '100%', maxWidth: '320px' }}
              >
                <RocketOutlined style={{ fontSize: '32px' }} className="mb-2 block animate-bounce" />
                <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0', fontWeight: 700 }}>Tailwind Card</Title>
                <Paragraph className="text-white/80 text-xs m-0">
                  Phần tử được thiết lập hoàn toàn bằng các Tailwind Utility Classes cực kỳ linh hoạt!
                </Paragraph>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: WebSockets Simulator & Next.js Guide */}
        <div className="flex flex-col gap-8">
          
          {/* WebSocket Real-time Log Simulator */}
          <Card
            title={
              <Space>
                <Badge dot status={socketConnected ? 'success' : 'default'} />
                <span className="font-bold text-slate-800">WebSocket Real-Time Event Simulator</span>
              </Space>
            }
            extra={
              <Switch 
                checkedChildren="ON" 
                unCheckedChildren="OFF" 
                checked={socketConnected}
                onChange={toggleSocket}
              />
            }
            variant="borderless"
            className="shadow-md rounded-2xl border border-slate-100"
          >
            <Alert
              message="WebSocket (Socket.io) Sync trong Next.js"
              description="WebSocket giúp Client và Server giữ kết nối liên tục. Khi Server có sự kiện mới (ví dụ khách hàng mua theme), nó đẩy trực tiếp qua Socket về Client. Client có thể cập nhật giao diện ngay lập tức hoặc kích hoạt RTK Query refetch để tự làm mới cache."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              className="mb-6 rounded-xl"
            />

            {/* Logs console */}
            <div className="p-4 bg-slate-900 text-green-400 font-mono text-xs rounded-2xl mb-6 shadow-inner border border-slate-800" style={{ height: '220px', overflowY: 'auto' }}>
              {socketLogs.map((log, idx) => (
                <div key={idx} className="mb-2 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={socketConnected ? "Gửi tin nhắn hoặc event qua Socket..." : "Bật ON kết nối WebSocket để gửi tin nhắn..."}
                disabled={!socketConnected}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onPressEnter={sendSocketMessage}
                className="rounded-xl h-10 border-slate-200"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                disabled={!socketConnected}
                onClick={sendSocketMessage}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700"
              >
                Emit
              </Button>
            </div>
          </Card>

          {/* Next.js & Redux Toolkit Architecture Guide */}
          <Card
            title={
              <Space>
                <BulbOutlined className="text-yellow-500" />
                <span className="font-bold text-slate-800">Next.js + Redux Architecture Guide</span>
              </Space>
            }
            variant="borderless"
            className="shadow-md rounded-2xl border border-slate-100"
          >
            <Tabs
              defaultActiveKey="appRouter"
              items={[
                {
                  key: 'appRouter',
                  label: 'App Router (Next.js 14/15)',
                  children: (
                    <div className="text-xs">
                      <Paragraph className="text-slate-600 font-medium">
                        Trong Next.js App Router (sử dụng React Server Components mặc định), chúng ta phải bọc Redux Provider trong một Client Component chuyên biệt:
                      </Paragraph>
                      <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono overflow-x-auto leading-relaxed mb-3">
{`// src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}`}
                      </pre>
                      <Paragraph className="text-slate-600 font-medium">
                        Sau đó, bọc component này tại `layout.tsx` (Server Component):
                      </Paragraph>
                      <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono overflow-x-auto leading-relaxed">
{`// src/app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`}
                      </pre>
                    </div>
                  )
                },
                {
                  key: 'rtkQueryNext',
                  label: 'Server Prefetch & Hydration',
                  children: (
                    <div className="text-xs">
                      <Paragraph className="text-slate-600 font-medium">
                        Để tải trước dữ liệu ở Server (SEO tối ưu) và đồng bộ (hydrate) sang Redux ở Client trong Next.js:
                      </Paragraph>
                      <ol className="list-decimal pl-4 text-slate-600 mb-3 flex flex-col gap-1">
                        <li>Sử dụng Next.js Server Component để gọi dữ liệu (ví dụ trực tiếp bằng `fetch` hoặc RTK Query Server Instance).</li>
                        <li>Đẩy dữ liệu qua props cho Client Component.</li>
                        <li>Sử dụng cơ chế `hydrate` hoặc đưa dữ liệu vào store khởi tạo tại Client để đồng bộ trạng thái và tiếp tục cache ở Client.</li>
                      </ol>
                      <pre className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono overflow-x-auto leading-relaxed">
{`// Ví dụ Gọi API trực tiếp trên Server (Next.js layout/page)
export default async function Page() {
  const res = await fetch('https://api.wphub.vn/themes');
  const initialThemes = await res.json();

  // Truyền dữ liệu vào Client Component chứa RTK Query
  return <ThemeListClient initialData={initialThemes} />;
}`}
                      </pre>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AdminPractice;
