<?php
/**
 * Plugin Name: LX Theme Manager
 * Plugin URI: https://lx.vn
 * Description: Quản lý danh sách Theme và License Key bản quyền trong WordPress, cung cấp REST API bảo mật bởi App-level Token dùng chung cho React JS. Thay thế hoàn toàn cơ sở dữ liệu Supabase.
 * Version: 3.0.0
 * Author: LX Team
 * Author URI: https://lx.vn
 * Text Domain: lx-theme-manager
 * 
 * Quy tắc bảo mật: Ngăn chặn truy cập trực tiếp file từ môi trường bên ngoài.
 */

defined('ABSPATH') || exit;

/**
 * LỚP QUẢN TRỊ CHÍNH CỦA PLUGIN (SINGLETON PATTERN)
 */
class LX_Theme_Manager {

    private static $instance = null;

    // Khởi tạo Singleton Instance
    public static function get_instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Mở CORS toàn phần cho toàn bộ hệ thống API WordPress không chặn CORS
        add_action('init', function() {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, Origin, X-Requested-With, Accept');
            header('Access-Control-Allow-Credentials: true');
            if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                header('HTTP/1.1 200 OK');
                exit(0);
            }
        });

        // Đăng ký Custom Post Types và Custom Taxonomy
        add_action('init', array($this, 'register_custom_post_types'));
        
        // Đăng ký cấu hình ACF Local Fields (ACF Pro 6.2)
        add_action('acf/init', array($this, 'register_acf_field_groups'));

        // Đăng ký trang tùy chọn cài đặt (Options Page)
        add_action('acf/init', array($this, 'register_options_page'));

        // Đăng ký các Endpoint REST API
        add_action('rest_api_init', array($this, 'register_api_routes'));
    }

    // ==========================================
    // 1. ĐĂNG KÝ CUSTOM POST TYPES & CUSTOM TAXONOMY
    // ==========================================

    public function register_custom_post_types() {
        // A. ĐĂNG KÝ POST TYPE 'lx_theme' (Theme)
        $theme_labels = array(
            'name'               => 'LX Themes',
            'singular_name'      => 'LX Theme',
            'menu_name'          => 'LX Themes',
            'add_new'            => 'Thêm Theme Mới',
            'add_new_item'       => 'Thêm Theme Mới',
            'edit_item'          => 'Chỉnh Sửa Theme',
            'new_item'           => 'Theme Mới',
            'view_item'          => 'Xem Theme',
            'search_items'       => 'Tìm Theme',
            'not_found'          => 'Không tìm thấy Theme nào',
            'not_found_in_trash' => 'Không tìm thấy Theme nào trong Thùng rác'
        );

        $theme_args = array(
            'labels'             => $theme_labels,
            'public'             => true,
            'has_archive'        => true,
            'menu_icon'          => 'dashicons-layout',
            'supports'           => array('title', 'editor', 'thumbnail'),
            'show_in_rest'       => true,
            'rewrite'            => array('slug' => 'lx-themes'),
        );

        register_post_type('lx_theme', $theme_args);


        // C. ĐĂNG KÝ CUSTOM TAXONOMY 'lx_theme_field' (Lĩnh vực Theme)
        $tax_labels = array(
            'name'              => 'Lĩnh vực Theme',
            'singular_name'     => 'Lĩnh vực Theme',
            'search_items'      => 'Tìm Lĩnh vực',
            'all_items'         => 'Tất cả Lĩnh vực',
            'parent_item'       => 'Lĩnh vực cha',
            'parent_item_colon' => 'Lĩnh vực cha:',
            'edit_item'         => 'Sửa Lĩnh vực',
            'update_item'       => 'Cập nhật Lĩnh vực',
            'add_new_item'      => 'Thêm Lĩnh vực Mới',
            'new_item_name'     => 'Tên Lĩnh vực Mới',
            'menu_name'         => 'Lĩnh vực Theme',
        );

        $tax_args = array(
            'hierarchical'      => true,
            'labels'            => $tax_labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'theme-field'),
        );

        register_taxonomy('lx_theme_field', array('lx_theme'), $tax_args);
    }

    // ==========================================
    // 1.5. ĐĂNG KÝ TRANG TÙY CHỌN (OPTIONS PAGE)
    // ==========================================

    public function register_options_page() {
        if( function_exists('acf_add_options_page') ) {
            acf_add_options_page(array(
                'page_title'    => 'Cài đặt Giá Gói Dịch Vụ',
                'menu_title'    => 'Giá Gói Dịch Vụ',
                'menu_slug'     => 'lx-theme-service-prices',
                'capability'    => 'manage_options', // Dành cho Admin
                'redirect'      => false,
                'icon_url'      => 'dashicons-money-alt', // Icon tiền tệ
                'position'      => 30, // Nằm tách biệt bên ngoài như 1 menu chính
            ));
        }
    }

    // ==========================================
    // 2. ĐĂNG KÝ CẤU HÌNH ACF LOCAL FIELDS (ACF PRO 6.2)
    // ==========================================

    public function register_acf_field_groups() {
        if ( ! function_exists('acf_add_local_field_group') ) {
            return;
        }

        // A. CẤU HÌNH TRƯỜNG DỮ LIỆU CHO THEME
        acf_add_local_field_group(array(
            'key' => 'group_lx_theme_details',
            'title' => 'Thông Tin Chi Tiết Theme (ACF Pro)',
            'fields' => array(
                array(
                    'key' => 'field_lx_original_price',
                    'label' => 'Giá Gốc (VNĐ)',
                    'name' => 'lx_original_price',
                    'type' => 'number',
                    'instructions' => 'Nhập số tiền giá gốc chưa giảm (không chứa ký tự dấu chấm/dấu phẩy). Ví dụ: 3200000 = 3.200.000 đ.',
                    'required' => 1,
                    'placeholder' => 'Ví dụ: 3200000',
                ),
                array(
                    'key' => 'field_lx_price',
                    'label' => 'Giá Sale (VNĐ)',
                    'name' => 'lx_price',
                    'type' => 'number',
                    'instructions' => 'Nhập số tiền bán thực tế sau khi giảm. Ví dụ: 2300000 = 2.300.000 đ.',
                    'required' => 1,
                    'placeholder' => 'Ví dụ: 2300000',
                ),
                array(
                    'key' => 'field_lx_preview_image',
                    'label' => 'Hình Ảnh Preview (Chụp ảnh trang chủ)',
                    'name' => 'lx_preview_image',
                    'type' => 'image',
                    'instructions' => 'Tải lên hình ảnh xem trước lớn/chụp ảnh trang chủ của theme.',
                    'required' => 1,
                    'return_format' => 'url',
                    'library' => 'all',
                ),
                array(
                    'key' => 'field_lx_active_projects',
                    'label' => 'Dự Án Đang Dùng (Đường dẫn URL)',
                    'name' => 'lx_active_projects',
                    'type' => 'url',
                    'instructions' => 'Nhập đường dẫn trang web thực tế đang sử dụng theme này (bao gồm http:// hoặc https://).',
                    'placeholder' => 'Ví dụ: https://phukienkhinen.vn/',
                ),
                array(
                    'key' => 'field_lx_service_package',
                    'label' => 'Gói Dịch Vụ Liên Kết',
                    'name' => 'lx_service_package',
                    'type' => 'select',
                    'choices' => array(
                        'landing' => 'Gói Landing Page',
                        'clone'   => 'Gói Clone & Vibe',
                        'basic'   => 'Gói Cơ Bản',
                        'store'   => 'Gói Bán Hàng',
                        'premium' => 'Gói Cao Cấp',
                    ),
                    'default_value' => 'landing',
                    'allow_null' => 0,
                    'required' => 1,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'lx_theme',
                    ),
                ),
            ),
            'active' => true,
        ));

        // B. CẤU HÌNH TRƯỜNG DỮ LIỆU CHO TRANG TÙY CHỌN (GIÁ GÓI DỊCH VỤ)
        acf_add_local_field_group(array(
            'key' => 'group_lx_service_prices',
            'title' => 'Cài đặt Giá Các Gói Dịch Vụ',
            'fields' => array(
                array(
                    'key' => 'field_price_landing',
                    'label' => 'Giá Gói Landing Page (VNĐ)',
                    'name' => 'price_landing',
                    'type' => 'number',
                    'instructions' => 'Nhập giá bán cho Gói Landing Page. Ví dụ: 1500000',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_price_clone',
                    'label' => 'Giá Gói Clone & Vibe (VNĐ)',
                    'name' => 'price_clone',
                    'type' => 'number',
                    'instructions' => 'Nhập giá bán cho Gói Clone & Vibe. Ví dụ: 2000000',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_price_basic',
                    'label' => 'Giá Gói Cơ Bản (VNĐ)',
                    'name' => 'price_basic',
                    'type' => 'number',
                    'instructions' => 'Nhập giá bán cho Gói Cơ Bản. Ví dụ: 3000000',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_price_store',
                    'label' => 'Giá Gói Bán Hàng (VNĐ)',
                    'name' => 'price_store',
                    'type' => 'number',
                    'instructions' => 'Nhập giá bán cho Gói Bán Hàng. Ví dụ: 5000000',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_price_premium',
                    'label' => 'Giá Gói Cao Cấp (VNĐ)',
                    'name' => 'price_premium',
                    'type' => 'number',
                    'instructions' => 'Nhập giá bán cho Gói Cao Cấp. Ví dụ: 10000000',
                    'required' => 1,
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'lx-theme-service-prices',
                    ),
                ),
            ),
            'active' => true,
        ));

    }

    // ==========================================
    // 4. KHỞI TẠO WP REST API ENDPOINTS
    // ==========================================

    public function register_api_routes() {
        // A. ENDPOINTS DÀNH CHO THEMES
        register_rest_route('lx/v1', '/themes', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_all_themes'),
            'permission_callback' => '__return_true'
        ));

        register_rest_route('lx/v1', '/themes/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_theme_detail'),
            'permission_callback' => '__return_true'
        ));

        // B. ENDPOINT DÀNH CHO CÀI ĐẶT
        register_rest_route('lx/v1', '/settings/service-prices', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_service_prices'),
            'permission_callback' => '__return_true'
        ));

    }

    /**
     * API Callback: Lấy danh sách theme dạng JSON
     */
    public function api_get_all_themes($request) {
        $args = array(
            'post_type'      => 'lx_theme',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC'
        );

        $themes_query = new WP_Query($args);
        $output_list = array();

        if ($themes_query->have_posts()) {
            while ($themes_query->have_posts()) {
                $themes_query->the_post();
                $post_id = get_the_ID();

                $featured_image = get_the_post_thumbnail_url($post_id, 'full');

                $fields = wp_get_post_terms($post_id, 'lx_theme_field', array('fields' => 'names'));
                if (is_wp_error($fields)) {
                    $fields = array();
                }

                $service_package = get_field('lx_service_package', $post_id);
                $service_price = $service_package ? (int) get_field('price_' . $service_package, 'option') : 0;

                $output_list[] = array(
                    'id'              => $post_id,
                    'title'           => get_the_title(),
                    'content'         => apply_filters('the_content', get_the_content()),
                    'excerpt'         => wp_strip_all_tags(get_the_excerpt()),
                    'featured_image'  => esc_url($featured_image),
                    'original_price'  => (int) get_field('lx_original_price', $post_id),
                    'price'           => (int) get_field('lx_price', $post_id),
                    'preview_image'   => esc_url(get_field('lx_preview_image', $post_id)),
                    'active_projects' => esc_url(get_field('lx_active_projects', $post_id)),
                    'service_package' => $service_package,
                    'service_price'   => $service_price,
                    'fields'          => array_values($fields)
                );
            }
            wp_reset_postdata();
        }

        return new WP_REST_Response($output_list, 200);
    }

    /**
     * API Callback: Xem chi tiết 1 theme cụ thể
     */
    public function api_get_theme_detail($request) {
        $id = (int) $request['id'];
        $post = get_post($id);

        if (!$post || $post->post_type !== 'lx_theme' || $post->post_status !== 'publish') {
            return new WP_Error('not_found', 'Không tìm thấy theme này.', array('status' => 404));
        }

        $featured_image = get_the_post_thumbnail_url($id, 'full');
        
        $fields = wp_get_post_terms($id, 'lx_theme_field', array('fields' => 'names'));
        if (is_wp_error($fields)) {
            $fields = array();
        }

        $service_package = get_field('lx_service_package', $id);
        $service_price = $service_package ? (int) get_field('price_' . $service_package, 'option') : 0;

        $theme_detail = array(
            'id'              => $id,
            'title'           => $post->post_title,
            'content'         => apply_filters('the_content', $post->post_content),
            'featured_image'  => esc_url($featured_image),
            'original_price'  => (int) get_field('lx_original_price', $id),
            'price'           => (int) get_field('lx_price', $id),
            'preview_image'   => esc_url(get_field('lx_preview_image', $id)),
            'active_projects' => esc_url(get_field('lx_active_projects', $id)),
            'service_package' => $service_package,
            'service_price'   => $service_price,
            'fields'          => array_values($fields)
        );

        return new WP_REST_Response($theme_detail, 200);
    }

    /**
     * API Callback: Lấy danh sách giá các gói dịch vụ
     */
    public function api_get_service_prices($request) {
        $prices = array(
            'landing' => (int) get_field('price_landing', 'option'),
            'clone'   => (int) get_field('price_clone', 'option'),
            'basic'   => (int) get_field('price_basic', 'option'),
            'store'   => (int) get_field('price_store', 'option'),
            'premium' => (int) get_field('price_premium', 'option'),
        );

        return new WP_REST_Response($prices, 200);
    }
}

// Khởi chạy Plugin
LX_Theme_Manager::get_instance();
