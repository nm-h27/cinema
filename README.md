# Galaxy Royal Cinema 3D — Multiplayer Realtime Web

## Cách chạy bản Web nhiều người xem thời gian thực
1. Cài đặt thư viện:
   ```bash
   npm install
   ```
2. Khởi chạy Server:
   ```bash
   npm start
   ```
3. Mở trình duyệt tại `http://localhost:3000` (hoặc deploy lên Render, Railway, VPS, Glitch).
4. Ngoài ra, file `public/index.html` cũng tích hợp sẵn `BroadcastChannel` + `localStorage` nên có thể mở nhiều tab trên cùng máy để test nhiều nhân vật tức thì mà không cần cài đặt server.
