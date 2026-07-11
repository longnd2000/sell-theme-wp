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
  name: string;        // Tên theme
  version: string;     // Phiên bản theme hiện tại (ví dụ: v1.0.0)
  description: string; // Mô tả tính năng theme
  price: number;       // Giá bán theme
  image: string;       // Link ảnh preview giao diện
  demoUrl: string;     // Đường dẫn xem thử demo trực tiếp
  features: string[];  // Danh sách các tính năng nổi bật
  tags: string[];      // Nhãn phân loại theme (ví dụ: Blog, Shop, Landing...)
  rating: number;      // Điểm đánh giá trung bình từ khách hàng
  downloads: number;   // Số lượt tải xuống/mua theme
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
          // Gọi Supabase truy vấn bảng 'themes', sắp xếp theo tên tăng dần
          const { data, error } = await supabase
            .from('themes')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;
          
          if (data && data.length > 0) {
            console.log("RAW COLUMNS IN SUPABASE THEMES TABLE:", Object.keys(data[0]));
            console.log("FIRST ROW DATA:", data[0]);
          }
          
          // Khớp nối dữ liệu thô (raw data) từ Supabase sang chuẩn cấu trúc ThemeItem của Frontend
          const mappedData: ThemeItem[] = (data || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            version: item.version,
            description: item.description,
            price: item.price,
            image: item.image_url || item.image || '',
            demoUrl: item.demo_url || item.demoUrl || '',
            features: item.features || [],
            tags: item.tags || [],
            rating: Number(item.rating || 5),
            downloads: Number(item.downloads || 0),
          }));

          // Trả về dữ liệu bọc trong trường { data } theo đúng chuẩn của RTK Query
          return { data: mappedData };
        } catch (err: any) {
          // Trả về lỗi bọc trong trường { error }
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi khi tải danh sách theme từ Supabase.' 
            } 
          };
        }
      },
      // Gắn tag 'Themes' cho cache này để có thể invalidate (làm mới) khi cần thiết
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
          // Truy vấn Supabase lọc theo ID, lấy duy nhất 1 bản ghi (.single())
          const { data, error } = await supabase
            .from('themes')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          const mappedData: ThemeItem = {
            id: data.id,
            name: data.name,
            version: data.version,
            description: data.description,
            price: data.price,
            image: data.image_url || data.image || '',
            demoUrl: data.demo_url || data.demoUrl || '',
            features: data.features || [],
            tags: data.tags || [],
            rating: Number(data.rating || 5),
            downloads: Number(data.downloads || 0),
          };

          return { data: mappedData };
        } catch (err: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err.message || 'Lỗi khi tải chi tiết theme từ Supabase.'
            }
          };
        }
      },
    }),

    /**
     * ENDPOINT 3: Lấy danh sách các key bản quyền (Licenses) liên kết với Themes
     * Trả về: Mảng các UserLicense[]
     * hook tương ứng: useGetLicensesQuery()
     */
    getLicenses: builder.query<UserLicense[], void>({
      async queryFn() {
        try {
          // Gọi Supabase truy vấn bảng 'licenses' và JOIN thông tin bảng 'themes' để lấy tên theme
          const { data, error } = await supabase
            .from('licenses')
            .select(`
              *,
              themes (
                name
              )
            `);

          if (error) throw error;

          const mappedData: UserLicense[] = (data || []).map((item: any) => ({
            id: item.id,
            themeId: item.theme_id,
            // Sử dụng cú pháp an toàn để lấy tên theme sau khi JOIN
            themeName: item.themes?.name || 'Theme Không Xác Định',
            licenseKey: item.license_key,
            status: item.status,
            domain: item.domain || 'N/A',
            // Rút gọn định dạng ngày tháng sang YYYY-MM-DD
            activatedAt: item.activated_at ? item.activated_at.split('T')[0] : '',
            expiresAt: item.expires_at ? item.expires_at.split('T')[0] : '',
          }));

          return { data: mappedData };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi khi tải thông tin bản quyền từ Supabase.' 
            } 
          };
        }
      },
      // Cung cấp tag 'Licenses' cho cache để tự động làm mới khi admin kích hoạt/hủy domain
      providesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 4: Đăng ký kích hoạt license trên tên miền (domain) cụ thể
     * Thay đổi dữ liệu -> builder.mutation
     * hook tương ứng: useActivateLicenseMutation()
     */
    activateLicense: builder.mutation<UserLicense, { licenseKey: string; domain: string }>({
      async queryFn({ licenseKey, domain }) {
        try {
          // Cập nhật thông tin domain và chuyển trạng thái key sang 'active'
          const { data, error } = await supabase
            .from('licenses')
            .update({
              domain,
              status: 'active',
              activated_at: new Date().toISOString(),
            })
            .eq('license_key', licenseKey)
            .select()
            .single();

          if (error) throw error;
          
          return { data: data as UserLicense };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi kích hoạt bản quyền trên Supabase.' 
            } 
          };
        }
      },
      // Invalidate tag 'Licenses' -> Ép buộc query getLicenses tải lại dữ liệu mới tức thì!
      invalidatesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 5: Ngắt kết nối domain khỏi key bản quyền (Deactivate/Suspended)
     * hook tương ứng: useDeactivateLicenseMutation()
     */
    deactivateLicense: builder.mutation<{ success: boolean }, { licenseKey: string }>({
      async queryFn({ licenseKey }) {
        try {
          // Cập nhật xóa domain kết nối và đổi trạng thái sang tạm ngưng 'suspended'
          const { error } = await supabase
            .from('licenses')
            .update({
              domain: 'N/A',
              status: 'suspended',
              activated_at: null,
            })
            .eq('license_key', licenseKey);

          if (error) throw error;
          
          return { data: { success: true } };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi ngắt kích hoạt bản quyền trên Supabase.' 
            } 
          };
        }
      },
      // Làm mới danh sách Licenses khi ngắt kết nối
      invalidatesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 6: Tạo key bản quyền mới tự động khi khách đặt hàng thành công
     * hook tương ứng: usePurchaseThemesMutation()
     */
    purchaseThemes: builder.mutation<{ success: boolean; licenses: UserLicense[] }, { themes: { id: string; name: string }[] }>({
      async queryFn({ themes }) {
        // Hàm sinh mã key ngẫu nhiên dạng: WPHUB-XX-XXXX-XXXX-XXXX
        const generateKey = (prefix: string) => {
          const rand = () => Math.random().toString(36).substring(2, 6).toUpperCase();
          return `WPHUB-${prefix}-${rand()}-${rand()}-${rand()}`;
        };

        try {
          const rows = themes.map(t => {
            const key = generateKey(t.id.substring(0, 2).toUpperCase());
            return {
              theme_id: t.id,
              license_key: key,
              status: 'inactive', // Ban đầu ở trạng thái chưa dùng
              domain: 'N/A',
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Hạn mặc định 1 năm
            };
          });

          // Insert dòng mới vào bảng 'licenses' trên Supabase
          const { data, error } = await supabase
            .from('licenses')
            .insert(rows)
            .select(`
              *,
              themes (
                name
              )
            `);

          if (error) throw error;

          const mapped: UserLicense[] = (data || []).map((item: any) => ({
            id: item.id,
            themeId: item.theme_id,
            themeName: item.themes?.name || 'Theme Không Xác Định',
            licenseKey: item.license_key,
            status: item.status,
            domain: item.domain || 'N/A',
            activatedAt: '',
            expiresAt: item.expires_at ? item.expires_at.split('T')[0] : '',
          }));

          return { data: { success: true, licenses: mapped } };
        } catch (err: any) {
          return {
            error: {
              status: 'CUSTOM_ERROR',
              error: err.message || 'Gặp lỗi trong quá trình xử lý lưu bản quyền lên Supabase.'
            }
          };
        }
      },
      // Invalidate licenses list cache
      invalidatesTags: ['Licenses'],
    }),

    /**
     * ENDPOINT 7: Thêm một theme mới vào cơ sở dữ liệu (Admin quản lý)
     * hook tương ứng: useCreateThemeMutation()
     */
    createTheme: builder.mutation<ThemeItem, Omit<ThemeItem, 'id' | 'rating' | 'downloads'>>({
      async queryFn(newTheme) {
        try {
          const { data, error } = await supabase
            .from('themes')
            .insert({
              name: newTheme.name,
              version: newTheme.version,
              description: newTheme.description,
              price: newTheme.price,
              image_url: newTheme.image,
              features: newTheme.features,
              tags: newTheme.tags,
              rating: 5,
              downloads: 0
            })
            .select();

          if (error) throw error;
          
          if (!data || data.length === 0) {
            throw new Error('Không thể thêm theme. Vui lòng kiểm tra RLS Policy (quyền INSERT) trên bảng themes ở Supabase Dashboard.');
          }
          
          const inserted = data[0];
          const mapped: ThemeItem = {
            id: inserted.id,
            name: inserted.name,
            version: inserted.version,
            description: inserted.description,
            price: inserted.price,
            image: inserted.image_url || inserted.image || '',
            demoUrl: inserted.demo_url || inserted.demoUrl || '',
            features: inserted.features || [],
            tags: inserted.tags || [],
            rating: Number(inserted.rating || 5),
            downloads: Number(inserted.downloads || 0),
          };

          return { data: mapped };
        } catch (err: any) {
          return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Lỗi khi thêm theme.' } };
        }
      },
      // Invalidate tags 'Themes' để danh sách theme hiển thị cập nhật ngay lập tức ở giao diện chính
      invalidatesTags: ['Themes'],
    }),

    /**
     * ENDPOINT 8: Cập nhật thông tin theme đang có sẵn (Admin quản lý)
     * hook tương ứng: useUpdateThemeMutation()
     */
    updateTheme: builder.mutation<ThemeItem, Partial<ThemeItem> & { id: string }>({
      async queryFn({ id, ...updates }) {
        try {
          const dbUpdates: any = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.version !== undefined) dbUpdates.version = updates.version;
          if (updates.description !== undefined) dbUpdates.description = updates.description;
          if (updates.price !== undefined) dbUpdates.price = updates.price;
          if (updates.image !== undefined) dbUpdates.image_url = updates.image;
          if (updates.features !== undefined) dbUpdates.features = updates.features;
          if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

          const { data, error } = await supabase
            .from('themes')
            .update(dbUpdates)
            .eq('id', id)
            .select();

          if (error) throw error;

          if (!data || data.length === 0) {
            throw new Error('Không thể cập nhật theme. Vui lòng kiểm tra RLS Policy (quyền UPDATE) trên bảng themes ở Supabase Dashboard.');
          }

          const updated = data[0];
          const mapped: ThemeItem = {
            id: updated.id,
            name: updated.name,
            version: updated.version,
            description: updated.description,
            price: updated.price,
            image: updated.image_url || updated.image || '',
            demoUrl: updated.demo_url || updated.demoUrl || '',
            features: updated.features || [],
            tags: updated.tags || [],
            rating: Number(updated.rating || 5),
            downloads: Number(updated.downloads || 0),
          };

          return { data: mapped };
        } catch (err: any) {
          return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Lỗi khi cập nhật theme.' } };
        }
      },
      invalidatesTags: ['Themes'],
    }),

    /**
     * ENDPOINT 9: Xóa theme khỏi danh mục đang bán (Admin quản lý)
     * hook tương ứng: useDeleteThemeMutation()
     */
    deleteTheme: builder.mutation<{ success: boolean; id: string }, string>({
      async queryFn(id) {
        try {
          const { error } = await supabase
            .from('themes')
            .delete()
            .eq('id', id);

          if (error) throw error;

          return { data: { success: true, id } };
        } catch (err: any) {
          return { error: { status: 'CUSTOM_ERROR', error: err.message || 'Lỗi khi xóa theme.' } };
        }
      },
      invalidatesTags: ['Themes'],
    }),
  }),
});

/**
 * 4. Xuất khẩu các Custom Hooks tự động sinh ra bởi RTK Query.
 * Cách đặt tên hook theo chuẩn: use + [Tên endpoint] + [Query/Mutation]
 * - query: Thích hợp cho việc đọc dữ liệu (GET), có cơ chế cache.
 * - mutation: Thích hợp cho việc viết/sửa/xóa dữ liệu (POST, PUT, DELETE).
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
