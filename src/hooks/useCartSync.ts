import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setCart } from '../store/themeSlice';
import { ThemeItem } from '../store/themeApi';

const CART_CHANNEL_NAME = 'cart_sync_channel';

/**
 * Hook đồng bộ giỏ hàng giữa các Tab bằng BroadcastChannel
 */
export const useCartSync = (currentCart: ThemeItem[]) => {
  const dispatch = useDispatch();
  // Ref để cờ đánh dấu thay đổi này có phải từ tab khác đến hay không
  const isReceiving = useRef(false);

  useEffect(() => {
    const channel = new BroadcastChannel(CART_CHANNEL_NAME);

    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_CART') {
        const newCart = event.data.payload;
        if (JSON.stringify(newCart) !== JSON.stringify(currentCart)) {
          isReceiving.current = true; // Bật cờ để tránh phát lại broadcast
          dispatch(setCart(newCart));
        }
      }
    };

    return () => {
      channel.close();
    };
  }, [dispatch, currentCart]);

  // Tự động broadcast khi cart thay đổi cục bộ
  useEffect(() => {
    // Nếu thay đổi này là do nhận từ tab khác, ta bỏ qua và reset cờ
    if (isReceiving.current) {
      isReceiving.current = false;
      return;
    }
    const channel = new BroadcastChannel(CART_CHANNEL_NAME);
    channel.postMessage({ type: 'SYNC_CART', payload: currentCart });
    channel.close();
  }, [currentCart]);
};
