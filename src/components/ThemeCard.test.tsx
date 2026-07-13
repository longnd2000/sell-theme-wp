import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ThemeCard from './ThemeCard';

const mockThemeItem = {
  id: '1',
  name: 'Test Theme',
  price: 500000,
  image: 'https://via.placeholder.com/150',
  description: 'Giao diện mẫu cho unit test.',
  rating: 4.5,
  downloads: 1200,
  category: 'E-commerce',
  tags: ['Shop', 'Modern'],
  features: [],
  version: '1.0.0',
};

describe('ThemeCard Component', () => {
  it('renders theme information correctly', () => {
    const mockAddToCart = vi.fn();
    const mockViewDetails = vi.fn();

    render(
      <ThemeCard
        themeItem={mockThemeItem}
        onAddToCart={mockAddToCart}
        onViewDetails={mockViewDetails}
      />
    );

    // Kiểm tra tên theme có hiển thị không
    expect(screen.getByText('Test Theme')).toBeInTheDocument();
    
    // Kiểm tra giá tiền đã được format đúng
    expect(screen.getByText(/500.000/i)).toBeInTheDocument();

    // Kiểm tra tag version
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('calls onAddToCart when "Mua" button is clicked', () => {
    const mockAddToCart = vi.fn();
    const mockViewDetails = vi.fn();

    render(
      <ThemeCard
        themeItem={mockThemeItem}
        onAddToCart={mockAddToCart}
        onViewDetails={mockViewDetails}
      />
    );

    // Tìm nút Mua dựa vào role hoặc text (có chữ Mua)
    const buyButton = screen.getByRole('button', { name: /Mua/i });
    
    // Giả lập người dùng click vào nút Mua
    fireEvent.click(buyButton);

    // Kiểm tra xem hàm onAddToCart có được gọi đúng 1 lần với tham số truyền vào là mockThemeItem không
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(mockThemeItem);
  });
});
