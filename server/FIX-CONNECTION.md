# Fix Database Connection - Step by Step

## Current Issue
❌ **MySQL server is not running** (ECONNREFUSED error on port 3306)

## Solution Options

### Option 1: Install MySQL (if not installed)

1. **Download MySQL:**
   - Visit: https://dev.mysql.com/downloads/mysql/
   - Download MySQL Installer for Windows
   - Run the installer

2. **During installation:**
   - Choose "Developer Default" or "Server only"
   - Set a root password (remember this!)
   - Port: 3306 (default)
   - Start MySQL as a Windows Service

3. **After installation, start MySQL:**
   ```powershell
   net start MySQL80
   ```
   (Service name might be `MySQL` or `MySQL80`)

### Option 2: Start MySQL Service (if already installed)

1. **Find MySQL service name:**
   ```powershell
   Get-Service | Where-Object { $_.DisplayName -match "mysql" }
   ```

2. **Start the service:**
   ```powershell
   net start MySQL80
   ```
   Or use Services app:
   - Press `Win + R`, type `services.msc`
   - Find "MySQL80" or "MySQL"
   - Right-click → Start

### Option 3: Use XAMPP/WAMP (if you have it)

1. **Start MySQL from XAMPP Control Panel:**
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

2. **Or start via command:**
   ```powershell
   & "C:\xampp\mysql_start.bat"
   ```

### Option 4: Use Docker (if you have Docker)

```powershell
docker run --name buyani-mysql -e MYSQL_ROOT_PASSWORD=yourpassword -e MYSQL_DATABASE=buyani -p 3306:3306 -d mysql:8.0
```

## After MySQL is Running

1. **Update `.env` file** in `server/` directory:
   ```env
   DB_URI=mysql://root:your_password@localhost:3306/buyani
   PORT=3000
   JWT_SECRET=your-secret-key-here
   ```
   Replace `your_password` with your actual MySQL root password.

2. **Create the database** (if it doesn't exist):
   ```sql
   CREATE DATABASE buyani;
   ```

3. **Test the connection:**
   ```powershell
   cd server
   npm run test:db
   ```

## Quick Test Commands

**Check if MySQL is running:**
```powershell
Test-NetConnection -ComputerName localhost -Port 3306
```

**Check MySQL service status:**
```powershell
Get-Service | Where-Object { $_.Name -like "*mysql*" }
```

**Start MySQL (if service exists):**
```powershell
net start MySQL80
```

## Need Help?

- If MySQL is not installed, install it first
- If MySQL is installed but not running, start the service
- Make sure port 3306 is not blocked by firewall
- Verify your MySQL root password is correct in the `.env` file

