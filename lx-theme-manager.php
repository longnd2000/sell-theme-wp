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
        // Xử lý CORS và Preflight OPTIONS sớm nhất để tránh lỗi CORS trên mọi máy chủ
        add_action('init', function() {
            if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
                header("Access-Control-Allow-Origin: $origin");
                header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
                header('Access-Control-Allow-Headers: Authorization, Content-Type, X-LX-API-Token, x-lx-api-token');
                header('Access-Control-Allow-Credentials: true');
                header('HTTP/1.1 200 OK');
                exit(0);
            }
        });

        add_action('send_headers', function() {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-LX-API-Token, x-lx-api-token');
            header('Access-Control-Allow-Credentials: true');
        });

        // Đăng ký Custom Post Types và Custom Taxonomy
        add_action('init', array($this, 'register_custom_post_types'));
        
        // Đăng ký cấu hình ACF Local Fields (ACF Pro 6.2)
        add_action('acf/init', array($this, 'register_acf_field_groups'));

        // Đăng ký Meta Boxes dự phòng (Chỉ hoạt động khi hệ thống KHÔNG cài đặt ACF Pro)
        add_action('add_meta_boxes', array($this, 'add_custom_meta_boxes'));
        add_action('save_post_lx_theme', array($this, 'save_theme_meta_data'), 10, 2);
        add_action('save_post_lx_license', array($this, 'save_license_meta_data'), 10, 2);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_media_uploader'));

        // Đăng ký các Endpoint REST API và cấu hình CORS
        add_action('rest_api_init', array($this, 'register_api_routes'));
        add_action('rest_api_init', array($this, 'setup_cors_headers'), 15);

        // Tạo trang cấu hình settings trong WordPress Dashboard
        add_action('admin_menu', array($this, 'create_admin_menu'));
        add_action('admin_init', array($this, 'register_plugin_settings'));

        // Thêm liên kết cấu hình "Cài đặt" trực tiếp ngay dưới tên plugin trong trang Plugins
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_plugin_settings_action_link'));
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

        // B. ĐĂNG KÝ POST TYPE 'lx_license' (License Key Bản Quyền)
        $license_labels = array(
            'name'               => 'LX Licenses',
            'singular_name'      => 'LX License',
            'menu_name'          => 'LX Licenses',
            'add_new'            => 'Thêm License Mới',
            'add_new_item'       => 'Thêm License Mới',
            'edit_item'          => 'Chỉnh Sửa License',
            'new_item'           => 'License Mới',
            'view_item'          => 'Xem License',
            'search_items'       => 'Tìm License',
            'not_found'          => 'Không tìm thấy License nào',
            'not_found_in_trash' => 'Không tìm thấy License nào trong Thùng rác'
        );

        $license_args = array(
            'labels'             => $license_labels,
            'public'             => false, // Ẩn khỏi Front-end, chỉ truy xuất qua API
            'show_ui'            => true,
            'has_archive'        => false,
            'menu_icon'          => 'dashicons-shield',
            'supports'           => array('title'), // Lưu license key làm Post Title
            'show_in_rest'       => false,
        );

        register_post_type('lx_license', $license_args);

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

        // B. CẤU HÌNH TRƯỜNG DỮ LIỆU CHO LICENSE KEY
        acf_add_local_field_group(array(
            'key' => 'group_lx_license_details',
            'title' => 'Thông Tin Key Bản Quyền (ACF Pro)',
            'fields' => array(
                array(
                    'key' => 'field_lx_license_key',
                    'label' => 'Mã License Key',
                    'name' => 'lx_license_key',
                    'type' => 'text',
                    'required' => 1,
                    'placeholder' => 'Hệ thống tự động sinh hoặc nhập dạng: WPHUB-XX-XXXX-XXXX-XXXX',
                ),
                array(
                    'key' => 'field_lx_associated_theme',
                    'label' => 'Theme Liên Kết',
                    'name' => 'lx_associated_theme',
                    'type' => 'post_object',
                    'post_type' => array('lx_theme'),
                    'required' => 1,
                    'return_format' => 'id',
                    'ui' => 1,
                ),
                array(
                    'key' => 'field_lx_license_status',
                    'label' => 'Trạng Thái Key',
                    'name' => 'lx_license_status',
                    'type' => 'select',
                    'choices' => array(
                        'inactive'  => 'Chưa kích hoạt',
                        'active'    => 'Đang hoạt động',
                        'suspended' => 'Tạm khóa / Ngừng sử dụng',
                    ),
                    'default_value' => 'inactive',
                    'required' => 1,
                ),
                array(
                    'key' => 'field_lx_license_domain',
                    'label' => 'Tên Miền Kích Hoạt',
                    'name' => 'lx_license_domain',
                    'type' => 'text',
                    'default_value' => 'N/A',
                ),
                array(
                    'key' => 'field_lx_activated_at',
                    'label' => 'Ngày Kích Hoạt',
                    'name' => 'lx_activated_at',
                    'type' => 'text',
                    'placeholder' => 'Ví dụ: YYYY-MM-DD',
                ),
                array(
                    'key' => 'field_lx_expires_at',
                    'label' => 'Ngày Hết Hạn',
                    'name' => 'lx_expires_at',
                    'type' => 'text',
                    'placeholder' => 'Ví dụ: YYYY-MM-DD',
                ),
            ),
            'location' => array(
                array(
                    array(
                        'param' => 'post_type',
                        'operator' => '==',
                        'value' => 'lx_license',
                    ),
                ),
            ),
            'active' => true,
        ));
    }

    // ==========================================
    // 3. META BOXES DỰ PHÒNG (FALLBACK - CHỈ CHẠY KHI KHÔNG CÓ ACF PRO)
    // ==========================================

    public function add_custom_meta_boxes() {
        if ( ! function_exists('acf_add_local_field_group') ) {
            // Meta box cho Theme
            add_meta_box(
                'lx_theme_details_box',
                'Thông Tin Chi Tiết Theme',
                array($this, 'render_theme_meta_box_html'),
                'lx_theme',
                'normal',
                'high'
            );

            // Meta box cho License Key
            add_meta_box(
                'lx_license_details_box',
                'Thông Tin Key Bản Quyền',
                array($this, 'render_license_meta_box_html'),
                'lx_license',
                'normal',
                'high'
            );
        }
    }

    public function enqueue_admin_media_uploader($hook) {
        if ( function_exists('acf_add_local_field_group') ) {
            return;
        }
        global $post;
        if ($hook === 'post.php' || $hook === 'post-new.php') {
            if (isset($post->post_type) && ($post->post_type === 'lx_theme' || $post->post_type === 'lx_license')) {
                wp_enqueue_media();
            }
        }
    }

    /**
     * Giao diện HTML Meta Box dự phòng cho Theme
     */
    public function render_theme_meta_box_html($post) {
        wp_nonce_field('lx_save_theme_meta', 'lx_theme_meta_nonce');

        $original_price = get_post_meta($post->ID, '_lx_original_price', true);
        $price = get_post_meta($post->ID, '_lx_price', true);
        $preview_image = get_post_meta($post->ID, '_lx_preview_image', true);
        $active_projects = get_post_meta($post->ID, '_lx_active_projects', true);
        $service_package = get_post_meta($post->ID, '_lx_service_package', true);

        if (empty($service_package)) {
            $service_package = 'landing';
        }

        ?>
        <style>
            .lx-form-table { width: 100%; border-spacing: 0 12px; }
            .lx-form-table th { text-align: left; width: 180px; font-weight: 600; color: #1e293b; vertical-align: top; padding-top: 6px; }
            .lx-form-table td input[type="text"], 
            .lx-form-table td input[type="number"], 
            .lx-form-table td textarea { width: 100%; max-width: 600px; border-radius: 6px; padding: 6px 10px; border: 1px solid #cbd5e1; }
            .lx-uploader-wrapper { display: flex; gap: 8px; max-width: 600px; }
            .lx-uploader-wrapper input[type="text"] { flex-grow: 1; }
            .lx-select-btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; color: #334155; transition: all 0.2s; }
            .lx-select-btn:hover { background: #e2e8f0; }
        </style>
        <table class="lx-form-table">
            <tr>
                <th>Giá Gốc (VNĐ) *:</th>
                <td>
                    <input type="number" name="lx_original_price" value="<?php echo esc_attr($original_price); ?>" placeholder="Ví dụ: 3200000" required />
                </td>
            </tr>
            <tr>
                <th>Giá Sale (VNĐ) *:</th>
                <td>
                    <input type="number" name="lx_price" value="<?php echo esc_attr($price); ?>" placeholder="Ví dụ: 2300000" required />
                </td>
            </tr>
            <tr>
                <th>Hình Ảnh Preview (URL) *:</th>
                <td>
                    <div class="lx-uploader-wrapper">
                        <input type="text" id="lx_preview_image_url" name="lx_preview_image" value="<?php echo esc_attr($preview_image); ?>" placeholder="Chọn hoặc dán link ảnh xem trước..." required />
                        <button type="button" class="lx-select-btn" id="lx_media_upload_btn">Chọn Tệp</button>
                    </div>
                </td>
            </tr>
            <tr>
                <th>Dự Án Đang Dùng (URL):</th>
                <td>
                    <input type="url" name="lx_active_projects" value="<?php echo esc_url($active_projects); ?>" placeholder="Ví dụ: https://phukienkhinen.vn/" style="width: 100%; max-width: 600px; padding: 6px 10px; border-radius: 6px; border: 1px solid #cbd5e1;" />
                </td>
            </tr>
            <tr>
                <th>Gói Dịch Vụ Liên Kết *:</th>
                <td>
                    <select name="lx_service_package" style="width: 100%; max-width: 600px; padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1;">
                        <option value="landing" <?php selected($service_package, 'landing'); ?>>Gói Landing Page</option>
                        <option value="clone" <?php selected($service_package, 'clone'); ?>>Gói Clone & Vibe</option>
                        <option value="basic" <?php selected($service_package, 'basic'); ?>>Gói Cơ Bản</option>
                        <option value="store" <?php selected($service_package, 'store'); ?>>Gói Bán Hàng</option>
                        <option value="premium" <?php selected($service_package, 'premium'); ?>>Gói Cao Cấp</option>
                    </select>
                </td>
            </tr>
        </table>

        <script>
            jQuery(document).ready(function($){
                $('#lx_media_upload_btn').click(function(e) {
                    e.preventDefault();
                    var custom_uploader = wp.media({
                        title: 'Chọn Ảnh Preview',
                        button: { text: 'Sử dụng ảnh này' },
                        multiple: false
                    })
                    .on('select', function() {
                        var attachment = custom_uploader.state().get('selection').first().toJSON();
                        $('#lx_preview_image_url').val(attachment.url);
                    })
                    .open();
                });
            });
        </script>
        <?php
    }

    /**
     * Giao diện HTML Meta Box dự phòng cho License Key
     */
    public function render_license_meta_box_html($post) {
        wp_nonce_field('lx_save_license_meta', 'lx_license_meta_nonce');

        $license_key = get_post_meta($post->ID, '_lx_license_key', true);
        $associated_theme = get_post_meta($post->ID, '_lx_associated_theme', true);
        $status = get_post_meta($post->ID, '_lx_license_status', true);
        $domain = get_post_meta($post->ID, '_lx_license_domain', true);
        $activated_at = get_post_meta($post->ID, '_lx_activated_at', true);
        $expires_at = get_post_meta($post->ID, '_lx_expires_at', true);

        if (empty($domain)) $domain = 'N/A';
        if (empty($status)) $status = 'inactive';

        // Lấy tất cả theme để hiển thị danh mục chọn
        $themes = get_posts(array(
            'post_type'      => 'lx_theme',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC'
        ));

        ?>
        <table class="lx-form-table">
            <tr>
                <th>Mã License Key *:</th>
                <td>
                    <input type="text" name="lx_license_key" value="<?php echo esc_attr($license_key); ?>" placeholder="Ví dụ: WPHUB-XX-XXXX-XXXX-XXXX" required />
                </td>
            </tr>
            <tr>
                <th>Theme Liên Kết *:</th>
                <td>
                    <select name="lx_associated_theme" style="width: 100%; max-width: 600px; padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1;">
                        <option value="">-- Chọn Theme --</option>
                        <?php foreach ($themes as $theme): ?>
                            <option value="<?php echo $theme->ID; ?>" <?php selected($associated_theme, $theme->ID); ?>>
                                <?php echo esc_html($theme->post_title); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </td>
            </tr>
            <tr>
                <th>Trạng Thái Key *:</th>
                <td>
                    <select name="lx_license_status" style="width: 100%; max-width: 600px; padding: 6px; border-radius: 6px; border: 1px solid #cbd5e1;">
                        <option value="inactive" <?php selected($status, 'inactive'); ?>>Chưa kích hoạt</option>
                        <option value="active" <?php selected($status, 'active'); ?>>Đang hoạt động</option>
                        <option value="suspended" <?php selected($status, 'suspended'); ?>>Tạm khóa / Ngừng sử dụng</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th>Tên Miền Kích Hoạt:</th>
                <td>
                    <input type="text" name="lx_license_domain" value="<?php echo esc_attr($domain); ?>" />
                </td>
            </tr>
            <tr>
                <th>Ngày Kích Hoạt:</th>
                <td>
                    <input type="text" name="lx_activated_at" value="<?php echo esc_attr($activated_at); ?>" placeholder="Ví dụ: YYYY-MM-DD" />
                </td>
            </tr>
            <tr>
                <th>Ngày Hết Hạn:</th>
                <td>
                    <input type="text" name="lx_expires_at" value="<?php echo esc_attr($expires_at); ?>" placeholder="Ví dụ: YYYY-MM-DD" />
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * Lưu trữ dữ liệu meta theme dự phòng khi lưu bài viết
     */
    public function save_theme_meta_data($post_id, $post) {
        if ( function_exists('acf_add_local_field_group') ) {
            return;
        }
        if (!isset($_POST['lx_theme_meta_nonce']) || !wp_verify_nonce($_POST['lx_theme_meta_nonce'], 'lx_save_theme_meta')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if (isset($_POST['lx_original_price'])) {
            update_post_meta($post_id, '_lx_original_price', sanitize_text_field($_POST['lx_original_price']));
        }
        if (isset($_POST['lx_price'])) {
            update_post_meta($post_id, '_lx_price', sanitize_text_field($_POST['lx_price']));
        }
        if (isset($_POST['lx_preview_image'])) {
            update_post_meta($post_id, '_lx_preview_image', esc_url_raw($_POST['lx_preview_image']));
        }
        if (isset($_POST['lx_active_projects'])) {
            update_post_meta($post_id, '_lx_active_projects', esc_url_raw($_POST['lx_active_projects']));
        }
        if (isset($_POST['lx_service_package'])) {
            update_post_meta($post_id, '_lx_service_package', sanitize_text_field($_POST['lx_service_package']));
        }
    }

    /**
     * Lưu trữ dữ liệu meta license dự phòng khi lưu bài viết
     */
    public function save_license_meta_data($post_id, $post) {
        if ( function_exists('acf_add_local_field_group') ) {
            return;
        }
        if (!isset($_POST['lx_license_meta_nonce']) || !wp_verify_nonce($_POST['lx_license_meta_nonce'], 'lx_save_license_meta')) {
            return;
        }
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        if (isset($_POST['lx_license_key'])) {
            update_post_meta($post_id, '_lx_license_key', sanitize_text_field($_POST['lx_license_key']));
        }
        if (isset($_POST['lx_associated_theme'])) {
            update_post_meta($post_id, '_lx_associated_theme', sanitize_text_field($_POST['lx_associated_theme']));
        }
        if (isset($_POST['lx_license_status'])) {
            update_post_meta($post_id, '_lx_license_status', sanitize_text_field($_POST['lx_license_status']));
        }
        if (isset($_POST['lx_license_domain'])) {
            update_post_meta($post_id, '_lx_license_domain', sanitize_text_field($_POST['lx_license_domain']));
        }
        if (isset($_POST['lx_activated_at'])) {
            update_post_meta($post_id, '_lx_activated_at', sanitize_text_field($_POST['lx_activated_at']));
        }
        if (isset($_POST['lx_expires_at'])) {
            update_post_meta($post_id, '_lx_expires_at', sanitize_text_field($_POST['lx_expires_at']));
        }
    }

    // ==========================================
    // 4. KHỞI TẠO WP REST API ENDPOINTS
    // ==========================================

    public function register_api_routes() {
        // A. ENDPOINTS DÀNH CHO THEMES
        register_rest_route('lx/v1', '/themes', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_all_themes'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));

        register_rest_route('lx/v1', '/themes/(?P<id>\d+)', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_theme_detail'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));

        // B. ENDPOINTS DÀNH CHO LICENSES (Thay thế hoàn toàn Supabase)
        register_rest_route('lx/v1', '/licenses', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'api_get_all_licenses'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));

        register_rest_route('lx/v1', '/licenses/activate', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'api_activate_license'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));

        register_rest_route('lx/v1', '/licenses/deactivate', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'api_deactivate_license'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));

        register_rest_route('lx/v1', '/licenses/purchase', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'api_purchase_themes'),
            'permission_callback' => array($this, 'validate_app_api_token')
        ));
    }

    public function validate_app_api_token($request) {
        // Cho phép Preflight Request (OPTIONS) luôn thông qua mà không cần check token để tránh lỗi CORS
        if ($request->get_method() === 'OPTIONS') {
            return true;
        }

        $saved_token = get_option('lx_api_token');
        
        if (empty($saved_token)) {
            return true;
        }

        $client_token = $request->get_header('X-LX-API-Token');

        if (empty($client_token)) {
            $client_token = $request->get_param('api_token');
        }

        if ($client_token === $saved_token) {
            return true;
        }

        return new WP_Error('forbidden_api', 'Mã API Token không hợp lệ. Vui lòng kiểm tra lại cấu hình kết nối của React JS.', array('status' => 403));
    }

    // ==========================================
    // HÀM TIỆN ÍCH TRUY XUẤT DỮ LIỆU CÓ HỖ TRỢ ACF HOẶC FALLBACK POST META
    // ==========================================
    
    private function get_theme_field($post_id, $field_name) {
        if ( function_exists('get_field') ) {
            return get_field($field_name, $post_id);
        }
        return get_post_meta($post_id, '_' . $field_name, true);
    }

    private function update_theme_field($post_id, $field_name, $value) {
        if ( function_exists('update_field') ) {
            update_field($field_name, $value, $post_id);
        } else {
            update_post_meta($post_id, '_' . $field_name, $value);
        }
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

                $output_list[] = array(
                    'id'              => $post_id,
                    'title'           => get_the_title(),
                    'content'         => apply_filters('the_content', get_the_content()),
                    'excerpt'         => wp_strip_all_tags(get_the_excerpt()),
                    'featured_image'  => esc_url($featured_image),
                    'original_price'  => (int) $this->get_theme_field($post_id, 'lx_original_price'),
                    'price'           => (int) $this->get_theme_field($post_id, 'lx_price'),
                    'preview_image'   => esc_url($this->get_theme_field($post_id, 'lx_preview_image')),
                    'active_projects' => esc_url($this->get_theme_field($post_id, 'lx_active_projects')),
                    'service_package' => $this->get_theme_field($post_id, 'lx_service_package'),
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

        $theme_detail = array(
            'id'              => $id,
            'title'           => $post->post_title,
            'content'         => apply_filters('the_content', $post->post_content),
            'featured_image'  => esc_url($featured_image),
            'original_price'  => (int) $this->get_theme_field($id, 'lx_original_price'),
            'price'           => (int) $this->get_theme_field($id, 'lx_price'),
            'preview_image'   => esc_url($this->get_theme_field($id, 'lx_preview_image')),
            'active_projects' => esc_url($this->get_theme_field($id, 'lx_active_projects')),
            'service_package' => $this->get_theme_field($id, 'lx_service_package'),
            'fields'          => array_values($fields)
        );

        return new WP_REST_Response($theme_detail, 200);
    }

    // ==========================================
    // REST API FOR LICENSES IMPLEMENTATION
    // ==========================================

    /**
     * REST API Callback: Lấy danh sách toàn bộ Key bản quyền
     */
    public function api_get_all_licenses($request) {
        $args = array(
            'post_type'      => 'lx_license',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
        );

        $query = new WP_Query($args);
        $output = array();

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $post_id = get_the_ID();

                $theme_id = $this->get_theme_field($post_id, 'lx_associated_theme');
                $theme_name = $theme_id ? get_the_title($theme_id) : 'Theme Không Xác Định';

                $output[] = array(
                    'id'          => $post_id,
                    'themeId'     => $theme_id,
                    'themeName'   => $theme_name,
                    'licenseKey'  => $this->get_theme_field($post_id, 'lx_license_key'),
                    'status'      => $this->get_theme_field($post_id, 'lx_license_status'),
                    'domain'      => $this->get_theme_field($post_id, 'lx_license_domain'),
                    'activatedAt' => $this->get_theme_field($post_id, 'lx_activated_at'),
                    'expiresAt'   => $this->get_theme_field($post_id, 'lx_expires_at'),
                );
            }
            wp_reset_postdata();
        }

        return new WP_REST_Response($output, 200);
    }

    /**
     * REST API Callback: Kích hoạt License Key cho tên miền
     */
    public function api_activate_license($request) {
        $license_key = sanitize_text_field($request->get_param('licenseKey'));
        $domain = sanitize_text_field($request->get_param('domain'));

        if (empty($license_key) || empty($domain)) {
            return new WP_Error('missing_params', 'Vui lòng cung cấp mã license key và tên miền.', array('status' => 400));
        }

        // Tìm kiếm license post bằng meta query
        $meta_key = function_exists('acf_add_local_field_group') ? 'lx_license_key' : '_lx_license_key';
        
        $args = array(
            'post_type'      => 'lx_license',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'meta_query'     => array(
                array(
                    'key'   => $meta_key,
                    'value' => $license_key
                )
            )
        );

        $query = new WP_Query($args);

        if (!$query->have_posts()) {
            return new WP_Error('not_found', 'Mã Key bản quyền không chính xác hoặc không tồn tại.', array('status' => 404));
        }

        $post_id = $query->posts[0]->ID;

        // Lưu thông tin kích hoạt mới
        $this->update_theme_field($post_id, 'lx_license_domain', $domain);
        $this->update_theme_field($post_id, 'lx_license_status', 'active');
        $this->update_theme_field($post_id, 'lx_activated_at', date('Y-m-d'));

        $theme_id = $this->get_theme_field($post_id, 'lx_associated_theme');
        $theme_name = $theme_id ? get_the_title($theme_id) : 'Theme Không Xác Định';

        $result = array(
            'id'          => $post_id,
            'themeId'     => $theme_id,
            'themeName'   => $theme_name,
            'licenseKey'  => $license_key,
            'status'      => 'active',
            'domain'      => $domain,
            'activatedAt' => date('Y-m-d'),
            'expiresAt'   => $this->get_theme_field($post_id, 'lx_expires_at'),
        );

        return new WP_REST_Response($result, 200);
    }

    /**
     * REST API Callback: Hủy kích hoạt License Key
     */
    public function api_deactivate_license($request) {
        $license_key = sanitize_text_field($request->get_param('licenseKey'));

        if (empty($license_key)) {
            return new WP_Error('missing_params', 'Vui lòng cung cấp mã license key.', array('status' => 400));
        }

        $meta_key = function_exists('acf_add_local_field_group') ? 'lx_license_key' : '_lx_license_key';
        
        $args = array(
            'post_type'      => 'lx_license',
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'meta_query'     => array(
                array(
                    'key'   => $meta_key,
                    'value' => $license_key
                )
            )
        );

        $query = new WP_Query($args);

        if (!$query->have_posts()) {
            return new WP_Error('not_found', 'Mã Key bản quyền không chính xác hoặc không tồn tại.', array('status' => 404));
        }

        $post_id = $query->posts[0]->ID;

        // Reset thông tin kích hoạt
        $this->update_theme_field($post_id, 'lx_license_domain', 'N/A');
        $this->update_theme_field($post_id, 'lx_license_status', 'suspended');
        $this->update_theme_field($post_id, 'lx_activated_at', '');

        return new WP_REST_Response(array('success' => true), 200);
    }

    /**
     * REST API Callback: Tự động tạo key khi Front-end React checkout thành công
     */
    public function api_purchase_themes($request) {
        $themes = $request->get_param('themes');

        if (empty($themes) || !is_array($themes)) {
            return new WP_Error('invalid_data', 'Dữ liệu giỏ hàng theme trống hoặc không hợp lệ.', array('status' => 400));
        }

        $created_licenses = array();
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        foreach ($themes as $t) {
            $theme_id = (int) $t['id'];
            $theme_post = get_post($theme_id);

            if (!$theme_post || $theme_post->post_type !== 'lx_theme') {
                continue;
            }

            // Sinh key ngẫu nhiên dạng: WPHUB-XX-XXXX-XXXX-XXXX
            $rand_chunk = function() use ($chars) {
                $str = '';
                for ($i = 0; $i < 4; $i++) {
                    $str .= $chars[rand(0, strlen($chars) - 1)];
                }
                return $str;
            };

            $prefix = strtoupper(substr(md5($theme_id), 0, 2));
            $license_key = 'WPHUB-' . $prefix . '-' . $rand_chunk() . '-' . $rand_chunk() . '-' . $rand_chunk();
            $expires_date = date('Y-m-d', strtotime('+1 year')); // Hạn sử dụng 1 năm

            // Tạo bài viết mới Post Type 'lx_license'
            $new_post_id = wp_insert_post(array(
                'post_title'   => $license_key,
                'post_type'    => 'lx_license',
                'post_status'  => 'publish',
                'post_author'  => 1
            ));

            if (is_wp_error($new_post_id)) {
                continue;
            }

            // Lưu các metadata tương ứng
            $this->update_theme_field($new_post_id, 'lx_license_key', $license_key);
            $this->update_theme_field($new_post_id, 'lx_associated_theme', $theme_id);
            $this->update_theme_field($new_post_id, 'lx_license_status', 'inactive');
            $this->update_theme_field($new_post_id, 'lx_license_domain', 'N/A');
            $this->update_theme_field($new_post_id, 'lx_activated_at', '');
            $this->update_theme_field($new_post_id, 'lx_expires_at', $expires_date);

            $created_licenses[] = array(
                'id'          => $new_post_id,
                'themeId'     => $theme_id,
                'themeName'   => $theme_post->post_title,
                'licenseKey'  => $license_key,
                'status'      => 'inactive',
                'domain'      => 'N/A',
                'activatedAt' => '',
                'expiresAt'   => $expires_date,
            );
        }

        return new WP_REST_Response(array('success' => true, 'licenses' => $created_licenses), 200);
    }

    // ==========================================
    // 5. TRANG CẤU HÌNH CÀI ĐẶT PLUGIN (ADMIN UI)
    // ==========================================

    public function create_admin_menu() {
        add_options_page(
            'Cấu Hình API Token',
            'LX Settings',
            'manage_options',
            'lx-settings',
            array($this, 'render_settings_page_html')
        );
    }

    public function register_plugin_settings() {
        register_setting('lx_settings_options_group', 'lx_api_token');
    }

    /**
     * Hiển thị giao diện trang cài đặt
     */
    public function render_settings_page_html() {
        ?>
        <div class="wrap" style="max-width: 800px; margin-top: 20px;">
            <style>
                .lx-card { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; margin-bottom: 24px; }
                .lx-title { color: #4f46e5; font-size: 20px; font-weight: 700; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
                .lx-btn { background: #4f46e5 !important; border-color: #4f46e5 !important; color: #fff !important; font-weight: 600 !important; border-radius: 6px !important; padding: 6px 16px !important; height: auto !important; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.15); transition: all 0.2s; }
                .lx-btn:hover { background: #4338ca !important; border-color: #4338ca !important; }
                .lx-control-group { display: flex; gap: 8px; max-width: 480px; }
                .lx-control-group input[type="text"] { flex-grow: 1; }
                .lx-sub-btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; color: #334155; transition: all 0.2s; }
                .lx-sub-btn:hover { background: #e2e8f0; }
                .form-table th { width: 220px; font-weight: 600; color: #334155; }
                .form-table td input[type="text"] { width: 100%; max-width: 480px; border-radius: 6px; border: 1px solid #cbd5e1; padding: 6px 12px; }
            </style>

            <h1 style="font-weight: 800; font-size: 26px; color: #0f172a; margin-bottom: 24px;">Cài Đặt Hệ Thống LX Theme Manager</h1>

            <div class="lx-card">
                <div class="lx-title">
                    <span class="dashicons dashicons-admin-network" style="font-size:24px; width:24px; height:24px; line-height:1;"></span>
                    Cấu Hình API Token
                </div>
                <form method="post" action="options.php">
                    <?php settings_fields('lx_settings_options_group'); ?>
                    <table class="form-table">
                        <tr>
                            <th>LX API Token (Cho React JS):</th>
                            <td>
                                <div class="lx-control-group">
                                    <input type="text" id="lx_api_token_input" name="lx_api_token" value="<?php echo esc_attr(get_option('lx_api_token')); ?>" placeholder="Tạo mã Token bảo mật..." />
                                    <button type="button" class="lx-sub-btn" id="lx_gen_token_btn">Tạo Mã</button>
                                    <button type="button" class="lx-sub-btn" id="lx_copy_token_btn">Copy</button>
                                </div>
                                <p class="description">Mã API Token dùng chung để React JS có quyền call API. copy mã này khai báo vào biến môi trường <code>VITE_LX_API_TOKEN</code> của Frontend.</p>
                            </td>
                        </tr>
                    </table>
                    <?php submit_button('Lưu Cài Đặt', 'primary lx-btn'); ?>
                </form>
            </div>
        </div>

        <script>
            jQuery(document).ready(function($){
                $('#lx_gen_token_btn').click(function(e) {
                    e.preventDefault();
                    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    var rand_str = '';
                    for (var i = 0; i < 32; i++) {
                        rand_str += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    var token = 'lx_tok_' + rand_str;
                    $('#lx_api_token_input').val(token);
                });

                $('#lx_copy_token_btn').click(function(e) {
                    e.preventDefault();
                    var copyText = document.getElementById("lx_api_token_input");
                    if (copyText && copyText.value) {
                        copyText.select();
                        copyText.setSelectionRange(0, 99999);
                        navigator.clipboard.writeText(copyText.value).then(function() {
                            alert("Đã sao chép API Token vào bộ nhớ tạm!");
                        });
                    } else {
                        alert("Không có mã API Token nào để sao chép. Vui lòng bấm 'Tạo Mã' trước.");
                    }
                });
            });
        </script>
        <?php
    }

    /**
     * Thêm liên kết cấu hình "Cài đặt" trực tiếp ngay dưới tên Plugin tại danh sách Plugins
     */
    public function add_plugin_settings_action_link($links) {
        $settings_url = admin_url('options-general.php?page=lx-settings');
        $settings_link = sprintf('<a href="%s" style="font-weight: 600; color: #4f46e5;">%s</a>', esc_url($settings_url), 'Cài đặt');
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Cấu hình CORS Headers cho WordPress REST API để hỗ trợ gọi từ React JS
     */
    public function setup_cors_headers() {
        // Cho phép custom headers X-LX-API-Token đi qua bộ lọc CORS mặc định của WordPress REST Server
        add_filter('rest_allowed_cors_headers', function($allowed_headers) {
            $allowed_headers[] = 'x-lx-api-token';
            $allowed_headers[] = 'X-LX-API-Token';
            return $allowed_headers;
        });

        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
        add_filter('rest_pre_serve_request', function($value) {
            $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
            header("Access-Control-Allow-Origin: $origin");
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-LX-API-Token, x-lx-api-token');
            header('Access-Control-Allow-Credentials: true');
            return $value;
        });
    }
}

// Khởi chạy Plugin
LX_Theme_Manager::get_instance();
