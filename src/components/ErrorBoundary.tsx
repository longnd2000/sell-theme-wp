import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary (Biên giới lỗi)
 * Component này dùng để bắt các lỗi JavaScript bất ngờ xảy ra trong các component con của nó,
 * ngăn không cho toàn bộ ứng dụng bị "trắng trang" (crash) và hiển thị giao diện fallback.
 * Đồng thời giả lập việc gửi log lỗi về server (Trace lỗi màn user).
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // Hàm lifecycle này được gọi khi có lỗi xảy ra. Dùng để cập nhật state.
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  // Hàm lifecycle này được dùng để bắt chi tiết lỗi và có thể gửi lên service tracking (như Sentry)
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Giả lập việc gửi lỗi lên Server để team Dev có thể xem lại "Trace lỗi màn user"
    console.group('🚨 [Gửi Log lỗi lên Server]');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo.componentStack);
    console.groupEnd();
    
    // Gửi báo cáo thông qua API ảo...
    // axios.post('/api/report-error', { error: error.message, stack: errorInfo.componentStack });
  }

  // Hàm reset lại trạng thái lỗi để thử render lại
  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      // Fallback UI khi có lỗi
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
          <Result
            status="error"
            title="Đã xảy ra lỗi hệ thống!"
            subTitle="Chúng tôi xin lỗi vì sự bất tiện này. Lỗi đã được ghi nhận và gửi đến bộ phận kỹ thuật."
            extra={[
              <Button type="primary" key="console" onClick={this.handleReset}>
                Tải lại trang
              </Button>,
              <Button key="buy" onClick={() => window.location.href = '/'}>
                Về trang chủ
              </Button>,
            ]}
          >
            <div style={{ textAlign: 'left', background: '#fee2e2', padding: '16px', borderRadius: '8px', marginTop: '20px' }}>
              <Paragraph>
                <Text strong>Chi tiết lỗi (Dành cho Dev):</Text>
              </Paragraph>
              <Paragraph style={{ color: '#ef4444' }}>
                <WarningOutlined style={{ marginRight: '8px' }} />
                {this.state.error?.toString()}
              </Paragraph>
            </div>
          </Result>
        </div>
      );
    }

    // Nếu không có lỗi, render các component con bình thường
    return this.props.children;
  }
}

export default ErrorBoundary;
