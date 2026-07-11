// Import các hàm cần thiết từ thư viện @reduxjs/toolkit để quản lý State toàn cục
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * 1. Khai báo Interface cấu trúc dữ liệu cho CartItem (Sản phẩm trong Giỏ hàng)
 * Giúp TypeScript kiểm soát chặt chẽ kiểu dữ liệu, tránh lỗi gán sai thuộc tính.
 */
interface CartItem {
  id: string;      // ID duy nhất của theme
  name: string;    // Tên theme
  price: number;   // Giá bán theme
  image: string;   // Link ảnh đại diện của theme
}

/**
 * 2. Khai báo Interface đại diện cho State của Slice 'themeUI'
 * Đây là nơi định nghĩa toàn bộ các biến lưu trữ toàn cục liên quan đến UI của dự án.
 */
interface ThemeUIState {
  searchQuery: string;          // Từ khóa tìm kiếm theme hiện tại
  selectedCategory: string;     // Danh mục theme đang được lọc (Ví dụ: 'All', 'Landing', 'Blog'...)
  cart: CartItem[];             // Danh sách các theme đã thêm vào Giỏ hàng
  currentDashboardTab: string;  // Tab đang hoạt động trong trang Dashboard quản trị
}

/**
 * 3. Thiết lập Giá trị khởi tạo (initialState) cho store
 * Khi ứng dụng khởi chạy lần đầu tiên, các biến state sẽ nhận các giá trị mặc định này.
 */
const initialState: ThemeUIState = {
  searchQuery: '',
  selectedCategory: 'All',
  cart: [],
  currentDashboardTab: 'themes',
};

/**
 * 4. Khởi tạo Slice quản lý State bằng createSlice
 * createSlice là tính năng cốt lõi của Redux Toolkit, tự động tạo ra:
 * - Reducers: Hàm xử lý thay đổi State.
 * - Actions: Các hàm kích hoạt (dispatch) thay đổi State.
 */
export const themeSlice = createSlice({
  name: 'themeUI', // Tên định danh của Slice, dùng để phân biệt các slice trong Redux Store
  initialState,    // Gán giá trị khởi tạo đã định nghĩa ở trên
  reducers: {      // Định nghĩa các hàm thay đổi State (Reducers)
    
    // Hàm cập nhật từ khóa tìm kiếm
    setSearchQuery: (state, action: PayloadAction<string>) => {
      // action.payload chứa chuỗi ký tự tìm kiếm mới được gửi lên từ ô Input
      state.searchQuery = action.payload;
    },

    // Hàm cập nhật danh mục theme được chọn để hiển thị
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      // action.payload chứa tên danh mục mới (ví dụ: 'E-commerce')
      state.selectedCategory = action.payload;
    },

    // Hàm thêm sản phẩm (theme) vào giỏ hàng
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa bằng hàm .find()
      const exists = state.cart.find(item => item.id === action.payload.id);
      if (!exists) {
        // Nếu chưa tồn tại, dùng phương thức .push() để thêm sản phẩm mới vào danh sách giỏ hàng
        // Redux Toolkit sử dụng thư viện Immer bên dưới nên ta có thể viết mutate state dạng push trực tiếp cực kỳ an toàn
        state.cart.push(action.payload);
      }
    },

    // Hàm xóa sản phẩm khỏi giỏ hàng dựa trên ID
    removeFromCart: (state, action: PayloadAction<string>) => {
      // Dùng hàm .filter() lọc ra các sản phẩm có ID khác với ID cần xóa, tạo mảng mới gán lại cho giỏ hàng
      state.cart = state.cart.filter(item => item.id !== action.payload);
    },

    // Hàm xóa sạch giỏ hàng (ví dụ sau khi thanh toán thành công)
    clearCart: (state) => {
      state.cart = []; // Gán giỏ hàng về mảng rỗng
    },

    // Hàm thay đổi tab đang được chọn trong bảng điều khiển Dashboard
    setDashboardTab: (state, action: PayloadAction<string>) => {
      state.currentDashboardTab = action.payload;
    },
  },
});

/**
 * 5. Xuất các Action Creators ra ngoài để sử dụng ở các Components
 * Khi muốn thay đổi state, component sẽ import các action này và truyền vào hàm useDispatch():
 * Ví dụ: dispatch(addToCart(themeItem))
 */
export const {
  setSearchQuery,
  setSelectedCategory,
  addToCart,
  removeFromCart,
  clearCart,
  setDashboardTab,
} = themeSlice.actions;

/**
 * 6. Xuất Reducer chính của slice ra ngoài để đăng ký vào Redux Store (tại src/store/index.ts)
 */
export default themeSlice.reducer;
