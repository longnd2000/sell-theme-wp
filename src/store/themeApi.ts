// Import các hàm và class từ Redux Toolkit Query để xây dựng API Layer
// createApi: Hàm khởi tạo API service của RTK Query
// fakeBaseQuery: Dùng khi ta không gọi API qua URL HTTP thông thường mà tự xử lý bất đồng bộ (ở đây là gọi Supabase SDK)
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
// Import đối tượng supabase đã cấu hình để giao tiếp với cơ sở dữ liệu Supabase
import { supabase } from '../lib/supabaseClient';

/**
 * 1. Khai báo Interface ThemeItem (Cấu trúc của một Theme WordPress)
 * Giúp TypeScript kiểm soát chặt chẽ kiểu dữ liệu của đối tượng Theme.
 */
export interface ThemeItem {
  id: string;          // ID duy nhất của theme
  name: string;        // Tên theme (Lấy từ title của WP)
  version: string;     // Phiên bản theme hiện tại (Không còn dùng, trả về rỗng)
  description: string; // Mô tả tính năng theme (Lấy từ content của WP)
  price: number;       // Giá sale theme (Lấy từ price của WP)
  originalPrice?: number; // Giá gốc theme (Lấy từ original_price của WP)
  image: string;       // Link ảnh đại diện (Lấy từ featured_image của WP)
  previewImage?: string; // Link ảnh xem trước trang chủ (Lấy từ preview_image của WP)
  demoUrl: string;     // Đường dẫn xem thử demo trực tiếp (Không còn dùng, trả về rỗng)
  features: string[];  // Danh sách các tính năng nổi bật (Không còn dùng, trả về rỗng)
  tags: string[];      // Nhãn phân loại theme (Lấy từ fields/taxonomy của WP)
  activeProjects?: string; // Các dự án thực tế đang dùng theme này (Lấy từ active_projects của WP)
  servicePackage?: string; // Gói dịch vụ thiết kế website liên kết (Lấy từ service_package của WP)
  rating: number;      // Điểm đánh giá trung bình từ khách hàng (Mặc định 5)
  downloads: number;   // Số lượt tải xuống/mua theme (Mặc định 0)
}

/**
 * 2. Khai báo Interface UserLicense (Cấu trúc Key Bản Quyền)
 * Quản lý trạng thái và tên miền kết nối của từng key bản quyền mà khách hàng sở hữu.
 */
export interface UserLicense {
  id: string;                             // ID bản ghi license
  themeId: string;                        // ID của theme liên kết
  themeName: string;                      // Tên theme tương ứng
  licenseKey: string;                     // Mã key bản quyền (ví dụ: WPHUB-LX-ABCD-...)
  status: 'active' | 'expired' | 'suspended'; // Trạng thái key: Đang hoạt động, Hết hạn, Tạm ngưng
  domain: string;                         // Website đang kết nối sử dụng key này
  activatedAt: string;                    // Ngày kích hoạt key
  expiresAt: string;                      // Ngày hết hạn key
}

const getApiUrl = (url: string): string => {
  if (url.includes('free.nf') || url.includes('infinityfree')) {
    // Sử dụng CORS Proxy của corsproxy.io để lách luật JS Challenge và CORS của InfinityFree
    return `https://corsproxy.io/?${encodeURIComponent(url)}`;
  }
  return url;
};

/**
 * 3. Tạo API Service chính bằng createApi
 * RTK Query hoạt động dựa trên cơ chế cấu hình tập trung. Nó sẽ tự động tạo ra
 * các Custom React Hooks dựa trên các endpoints mà ta khai báo bên dưới.
 */
export const themeApi = createApi({
  reducerPath: 'themeApi', // Định danh reducer này trong Redux Store toàn cục
  
  // Dùng fakeBaseQuery vì chúng ta gọi dữ liệu qua Supabase Client SDK thay vì dùng axios/fetch thông thường
  baseQuery: fakeBaseQuery(), 
  
  // Định nghĩa các thẻ quản lý Cache (Tag Types). 
  // Dùng để đồng bộ dữ liệu: Khi thực hiện ghi/sửa dữ liệu (Mutation), ta sẽ "hủy" tag này
  // để các câu truy vấn (Query) có cùng tag tự động tải lại dữ liệu mới nhất (Auto-refetch).
  tagTypes: ['Themes', 'Licenses'], 

  endpoints: (builder) => ({
    
    /**
     * ENDPOINT 1: Lấy danh sách toàn bộ theme đang bán
     * Trả về: Mảng các ThemeItem[]
     * hook tương ứng: useGetThemesQuery()
     */
    getThemes: builder.query<ThemeItem[], void>({
      async queryFn() {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/themes`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            headers: {
              'X-LX-API-Token': apiToken
            }
          });

          if (!response.ok) {
            throw new Error(`Lỗi kết nối API WordPress: ${response.status} ${response.statusText}`);
          }

          const rawData = await response.json();

          // Map dữ liệu từ WordPress REST API trả về sang chuẩn ThemeItem của React JS
          const mappedData: ThemeItem[] = (rawData || []).map((item: any) => ({
            id: item.id.toString(),
            name: item.title || '',
            version: '',
            description: item.excerpt || item.content || '',
            price: Number(item.price || 0),
            originalPrice: Number(item.original_price || 0),
            image: item.featured_image || '',
            previewImage: item.preview_image || '',
            demoUrl: '',
            features: [],
            tags: item.fields || [],
            activeProjects: item.active_projects || '',
            servicePackage: item.service_package || 'landing',
            rating: 5,
            downloads: 0,
          }));

          return { data: mappedData };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi khi tải danh sách theme từ WordPress REST API.' 
            } 
          };
        }
      },
      providesTags: ['Themes'],
    }),

    /**
     * ENDPOINT 2: Lấy thông tin chi tiết của 1 Theme bằng ID
     * Trả về: Đối tượng ThemeItem
     * hook tương ứng: useGetThemeDetailsQuery(id)
     */
    getThemeDetails: builder.query<ThemeItem, string>({
      async queryFn(id) {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/themes/${id}`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            headers: {
              'X-LX-API-Token': apiToken
            }
          });

          if (!response.ok) {
            throw new Error(`Lỗi kết nối API WordPress: ${response.status} ${response.statusText}`);
          }

          const rawData = await response.json();

          const mappedData: ThemeItem = {
            id: rawData.id.toString(),
            name: rawData.title || '',
            version: '',
            description: rawData.content || '',
            price: Number(rawData.price || 0),
            originalPrice: Number(rawData.original_price || 0),
            image: rawData.featured_image || '',
            previewImage: rawData.preview_image || '',
            demoUrl: '',
            features: [],
            tags: rawData.fields || [],
            activeProjects: rawData.active_projects || '',
            servicePackage: rawData.service_package || 'landing',
            rating: 5,
            downloads: 0,
          };

          return { data: mappedData };
        } catch (err: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err.message || 'Lỗi khi tải chi tiết theme từ WordPress REST API.'
            }
          };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Themes', id }],
    }),

    /**
     * ENDPOINT 3: Lấy danh sách các key bản quyền (Licenses) liên kết với Themes từ WordPress
     * Trả về: Mảng các UserLicense[]
     * hook tương ứng: useGetLicensesQuery()
     */
    getLicenses: builder.query<UserLicense[], void>({
      async queryFn() {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/licenses`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            headers: {
              'X-LX-API-Token': apiToken
            }
          });

          if (!response.ok) {
            throw new Error(`Lỗi kết nối API WordPress: ${response.status} ${response.statusText}`);
          }

          const rawData = await response.json();
          return { data: rawData as UserLicense[] };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi khi tải thông tin bản quyền từ WordPress.' 
            } 
          };
        }
      },
      providesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 4: Đăng ký kích hoạt license trên tên miền (domain) cụ thể
     * hook tương ứng: useActivateLicenseMutation()
     */
    activateLicense: builder.mutation<UserLicense, { licenseKey: string; domain: string }>({
      async queryFn({ licenseKey, domain }) {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/licenses/activate`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-LX-API-Token': apiToken
            },
            body: JSON.stringify({ licenseKey, domain })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Lỗi kích hoạt: ${response.status}`);
          }

          const data = await response.json();
          return { data: data as UserLicense };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi kích hoạt bản quyền từ WordPress REST API.' 
            } 
          };
        }
      },
      invalidatesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 5: Ngắt kết nối domain khỏi key bản quyền
     * hook tương ứng: useDeactivateLicenseMutation()
     */
    deactivateLicense: builder.mutation<{ success: boolean }, { licenseKey: string }>({
      async queryFn({ licenseKey }) {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/licenses/deactivate`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-LX-API-Token': apiToken
            },
            body: JSON.stringify({ licenseKey })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Lỗi hủy kích hoạt: ${response.status}`);
          }

          const data = await response.json();
          return { data: data as { success: boolean } };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi ngắt kích hoạt bản quyền từ WordPress REST API.' 
            } 
          };
        }
      },
      invalidatesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 6: Tạo key bản quyền mới tự động khi khách đặt hàng thành công
     * hook tương ứng: usePurchaseThemesMutation()
     */
    purchaseThemes: builder.mutation<{ success: boolean; licenses: UserLicense[] }, { themes: { id: string; name: string }[] }>({
      async queryFn({ themes }) {
        try {
          const wpSiteUrl = import.meta.env.VITE_WP_URL ? import.meta.env.VITE_WP_URL.replace(/\/$/, '') : 'http://localhost/wp';
          const wpApiUrl = `${wpSiteUrl}/wp-json/lx/v1/licenses/purchase`;
          const apiToken = import.meta.env.VITE_LX_API_TOKEN || '';

          const response = await fetch(getApiUrl(wpApiUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-LX-API-Token': apiToken
            },
            body: JSON.stringify({ themes })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `Lỗi đặt mua: ${response.status}`);
          }

          const data = await response.json();
          return { data: data as { success: boolean; licenses: UserLicense[] } };
        } catch (err: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err.message || 'Lỗi tạo bản quyền trên WordPress REST API.'
            }
          };
        }
      },
      invalidatesTags: ['Licenses'],
    }),

    // Các Mock Mutations bổ sung để tương thích ngược và đảm bảo ứng dụng compile thành công
    createTheme: builder.mutation<any, any>({
      queryFn() { return { data: null }; }
    }),
    updateTheme: builder.mutation<any, any>({
      queryFn() { return { data: null }; }
    }),
    deleteTheme: builder.mutation<any, any>({
      queryFn() { return { data: null }; }
    }),
  }),
});

/**
 * 4. Xuất khẩu các Custom Hooks tự động sinh ra bởi RTK Query.
 */
export const {
  useGetThemesQuery,
  useGetThemeDetailsQuery,
  useGetLicensesQuery,
  useActivateLicenseMutation,
  useDeactivateLicenseMutation,
  usePurchaseThemesMutation,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useDeleteThemeMutation,
} = themeApi;
