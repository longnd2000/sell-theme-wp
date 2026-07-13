import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, List, Avatar, Typography, Badge, Spin } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, UserOutlined, RobotOutlined, WifiOutlined, DisconnectOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

/**
 * Component Realtime Chat với WebSockets
 * Đây là bản thực hành kết nối mạng 2 chiều thực tế (không dùng setTimeout nữa).
 */
const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'msg-init', sender: 'bot', text: 'Xin chào! Tôi là Bot Echo. Bạn gửi gì tôi sẽ phản hồi lại y hệt qua WebSockets!', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  // Trạng thái kết nối của WebSocket
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // useRef lưu trữ kết nối WebSocket để không bị mất khi component render lại
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cuộn xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Hook useEffect quản lý Vòng đời (Lifecycle) của kết nối WebSocket
  useEffect(() => {
    // 1. Chỉ kết nối WebSocket khi user mở khung chat lên để tiết kiệm tài nguyên mạng
    if (!isOpen) return;

    // 2. Khởi tạo kết nối tới server Echo công khai
    const ws = new WebSocket('wss://echo.websocket.org');
    wsRef.current = ws;

    // Lắng nghe sự kiện kết nối thành công
    ws.onopen = () => {
      console.log('✅ Đã kết nối WebSocket thành công!');
      setIsConnected(true);
    };

    // Lắng nghe sự kiện nhận tin nhắn từ Server
    ws.onmessage = (event) => {
      console.log('📥 Nhận từ server:', event.data);
      
      // Do echo server đôi khi gửi những thông báo hệ thống dạng Text, ta cố gắng bóc tách JSON
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_message') {
          // Tắt hiệu ứng đang gõ
          setIsTyping(false);
          
          // Thêm tin nhắn của Bot vào state
          setMessages(prev => [...prev, {
            id: `msg-bot-${Date.now()}`,
            sender: 'bot',
            text: `(Bot nhại lại) ${data.text}`,
            timestamp: new Date()
          }]);
        }
      } catch (e) {
        // Bỏ qua các tin nhắn rác không phải JSON do server gửi
      }
    };

    // Lắng nghe sự kiện ngắt kết nối
    ws.onclose = () => {
      console.log('❌ Đã ngắt kết nối WebSocket!');
      setIsConnected(false);
    };

    // 3. CLEANUP FUNCTION: Vô cùng quan trọng trong React!
    // Khi component bị hủy (hoặc user tắt khung chat), phải đóng kết nối Socket để tránh rò rỉ bộ nhớ (Memory Leak)
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isOpen]); // Phụ thuộc vào biến isOpen, nếu isOpen thay đổi (true -> false), chạy cleanup và ngắt kết nối

  // Hàm xử lý khi bấm Gửi tin nhắn
  const handleSend = () => {
    if (!inputValue.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Tạo object tin nhắn của user
    const newUserMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    // Hiển thị tin nhắn của User lên màn hình
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true); // Bật hiệu ứng Bot đang gõ

    // Gửi dữ liệu dạng chuỗi JSON qua cổng WebSocket tới Server
    const payload = JSON.stringify({ type: 'chat_message', text: inputValue });
    console.log('📤 Đang gửi lên server:', payload);
    wsRef.current.send(payload);

    setInputValue('');
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Nút bật/tắt khung chat */}
      {!isOpen && (
        <Badge dot status="processing" offset={[-5, 5]}>
          <Button 
            type="primary" 
            shape="circle" 
            size="large" 
            icon={<MessageOutlined />} 
            style={{ width: '60px', height: '60px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)', background: '#6366f1' }}
            onClick={() => setIsOpen(true)}
          />
        </Badge>
      )}

      {/* Khung chat */}
      {isOpen && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined />
                <span>Hỗ trợ trực tuyến</span>
                {/* Trạng thái kết nối Socket */}
                {isConnected ? (
                  <Badge status="success" text={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Đã kết nối</span>} />
                ) : (
                  <Badge status="error" text={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Đang kết nối...</span>} />
                )}
              </div>
              <Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} size="small" />
            </div>
          }
          style={{ width: '340px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '16px', overflow: 'hidden' }}
          styles={{ body: { padding: 0 }, header: { background: '#6366f1', color: 'white', borderBottom: 'none' } }}
        >
          {/* Lịch sử tin nhắn */}
          <div style={{ height: '320px', overflowY: 'auto', padding: '16px', background: '#f8fafc' }}>
            <List
              dataSource={messages}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: 'none', padding: '6px 0', justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: item.sender === 'user' ? 'row-reverse' : 'row', gap: '8px', maxWidth: '85%' }}>
                    <Avatar 
                      icon={item.sender === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                      style={{ background: item.sender === 'user' ? '#1890ff' : '#10b981', flexShrink: 0 }}
                    />
                    <div style={{ 
                      background: item.sender === 'user' ? '#6366f1' : 'white', 
                      color: item.sender === 'user' ? 'white' : '#1e293b',
                      padding: '8px 12px', 
                      borderRadius: '12px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      wordBreak: 'break-word'
                    }}>
                      {item.text}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {/* Hiệu ứng gõ */}
            {isTyping && (
              <div style={{ padding: '8px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spin size="small" /> Bot đang phản hồi qua mạng...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung nhập văn bản */}
          <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Input 
              placeholder={isConnected ? "Nhập tin nhắn..." : "Đang chờ kết nối..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSend}
              disabled={!isConnected}
              style={{ borderRadius: '20px' }}
            />
            <Button 
              type="primary" 
              shape="circle" 
              icon={<SendOutlined />} 
              onClick={handleSend} 
              disabled={!isConnected || !inputValue.trim()}
              style={{ background: isConnected ? '#6366f1' : '#cbd5e1' }} 
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default LiveChat;
