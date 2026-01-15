
# ZKTeco Data Center Sentinel 🛡️

A high-security, **on-premise** dashboard for **ZKTeco F22** devices.

## 🌟 Data Architecture
- **No Internet Required**: All communication happens over your Local Area Network (LAN).
- **Direct Pull**: This dashboard pulls logs directly from the device memory.
- **Local Storage**: Data is mirrored into a local SQLite database within the container.

## ⚙️ Hardware Setup (ZKTeco F22)
To ensure the dashboard can talk to your hardware:
1. Go to **Menu > Comm. > Ethernet** on the F22.
2. Set a static **IP Address** (e.g., 192.168.1.144).
3. Go to **Menu > Comm. > PC Connection**.
4. Set the **Comm Key** (Password). Default is usually `0`.
5. Ensure the F22 and the computer running this dashboard are on the same network subnet.

## 🐳 Docker Deployment
1. Build the image: `docker build -t zkteco-sentinel .`
2. Run it: `docker run -p 8080:80 zkteco-sentinel`
3. Open `http://localhost:8080` in your browser.

## 📊 Exporting Audits
The **Audit System** generates a PCI-DSS compliant CSV file directly in your browser. This works without an internet connection.
