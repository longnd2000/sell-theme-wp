import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabaseClient';

export interface ThemeItem {
  id: string;
  name: string;
  version: string;
  description: string;
  price: number;
  image: string;
  demoUrl: string;
  features: string[];
  tags: string[];
  rating: number;
  downloads: number;
}

export interface UserLicense {
  id: string;
  themeId: string;
  themeName: string;
  licenseKey: string;
  status: 'active' | 'expired' | 'suspended';
  domain: string;
  activatedAt: string;
  expiresAt: string;
}

export const themeApi = createApi({
  reducerPath: 'themeApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Themes', 'Licenses'],
  endpoints: (builder) => ({
    // Lấy danh sách theme từ bảng 'themes' trên Supabase
    getThemes: builder.query<ThemeItem[], void>({
      async queryFn() {
        try {
          const { data, error } = await supabase
            .from('themes')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;
          
          if (data && data.length > 0) {
            console.log("RAW COLUMNS IN SUPABASE THEMES TABLE:", Object.keys(data[0]));
            console.log("FIRST ROW DATA:", data[0]);
          }
          
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

          return { data: mappedData };
        } catch (err: any) {
          return { 
            error: { 
              status: 'CUSTOM_ERROR', 
              error: err.message || 'Lỗi khi tải danh sách theme từ Supabase.' 
            } 
          };
        }
      },
      providesTags: ['Themes'],
    }),

    // Lấy chi tiết 1 theme bằng ID
    getThemeDetails: builder.query<ThemeItem, string>({
      async queryFn(id) {
        try {
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

    // Lấy danh sách licenses liên kết với themes
    getLicenses: builder.query<UserLicense[], void>({
      async queryFn() {
        try {
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
            themeName: item.themes?.name || 'Theme Không Xác Định',
            licenseKey: item.license_key,
            status: item.status,
            domain: item.domain || 'N/A',
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
      providesTags: ['Licenses'],
    }),

    // Kích hoạt license trên domain cụ thể
    activateLicense: builder.mutation<UserLicense, { licenseKey: string; domain: string }>({
      async queryFn({ licenseKey, domain }) {
        try {
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
      invalidatesTags: ['Licenses'],
    }),

    // Ngắt kết nối / Tạm ngưng license
    deactivateLicense: builder.mutation<{ success: boolean }, { licenseKey: string }>({
      async queryFn({ licenseKey }) {
        try {
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
      invalidatesTags: ['Licenses'],
    }),

    // Lưu giao dịch mua theme mới, tự sinh key bản quyền dạng 'inactive'
    purchaseThemes: builder.mutation<{ success: boolean; licenses: UserLicense[] }, { themes: { id: string; name: string }[] }>({
      async queryFn({ themes }) {
        // Hàm tự sinh key bản quyền ngẫu nhiên dạng: WPHUB-XX-XXXX-XXXX-XXXX
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
              status: 'inactive',
              domain: 'N/A',
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Hạn 1 năm
            };
          });

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
      invalidatesTags: ['Licenses'],
    }),

    // Thêm theme mới
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
      invalidatesTags: ['Themes'],
    }),

    // Sửa theme
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

    // Xóa theme
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
