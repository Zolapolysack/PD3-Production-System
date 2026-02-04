# 📘 คู่มือการติดตั้งระบบ Dashboard การผลิต PD3

## 📋 สารบัญ
1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [เตรียมความพร้อม](#เตรียมความพร้อม)
3. [STEP 1: สร้าง Google Sheet](#step-1-สร้าง-google-sheet)
4. [STEP 2: สร้าง Google Apps Script](#step-2-สร้าง-google-apps-script)
5. [STEP 3: Deploy Apps Script](#step-3-deploy-apps-script)
6. [STEP 4: แก้ไขระบบส่งข้อมูล](#step-4-แก้ไขระบบส่งข้อมูล)
7. [STEP 5: สร้าง Dashboard](#step-5-สร้าง-dashboard)
8. [STEP 6: ทดสอบระบบ](#step-6-ทดสอบระบบ)
9. [แก้ไขปัญหา](#แก้ไขปัญหา)
10. [การใช้งาน](#การใช้งาน)

---

## 🎯 ภาพรวมระบบ

### โครงสร้างระบบ
```
┌─────────────────────────────────────────────────────────────┐
│                    ระบบบันทึกการผลิต PD3                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ POST (ส่งข้อมูล)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Apps Script Web API                      │
│  URL: https://script.google.com/macros/s/.../exec          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SAVE
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Sheets                             │
│  Sheet 1: ProductionData (ข้อมูลการผลิต)                   │
│  Sheet 2: Employees (รายชื่อพนักงานแต่ละงาน)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ GET (ดึงข้อมูล)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard หน้าวิเคราะห์                   │
│  - สรุปยอดรวม                                                │
│  - กราฟแสดงผล                                                │
│  - ตารางรายละเอียด                                           │
└─────────────────────────────────────────────────────────────┘
```

### ไฟล์ที่จะสร้าง
```
PD3/
├── pd3_production_v3.html    (มีอยู่แล้ว - จะแก้ไข)
├── dashboard.html             (ใหม่ - จะสร้าง)
├── SETUP_GUIDE.md            (ไฟล์นี้)
└── Google Sheets + Apps Script (ออนไลน์)
```

---

## 🛠️ เตรียมความพร้อม

### สิ่งที่ต้องมี
- [ ] บัญชี Google (Gmail)
- [ ] เว็บเบราว์เซอร์ (Chrome แนะนำ)
- [ ] Text Editor (VS Code หรือ Notepad++)
- [ ] ไฟล์ `pd3_production_v3.html` ที่มีอยู่

### ความรู้พื้นฐานที่ควรมี
- [ ] HTML/JavaScript พื้นฐาน
- [ ] การใช้ Google Sheets
- [ ] คัดลอก-วาง code

### เวลาที่ใช้โดยประมาณ
- ⏱️ **STEP 1-3**: 30-45 นาที
- ⏱️ **STEP 4-5**: 15-20 นาที
- ⏱️ **STEP 6**: 10-15 นาที
- 📌 **รวมทั้งหมด**: ประมาณ 1-1.5 ชั่วโมง

---

## 📝 STEP 1: สร้าง Google Sheet

### 1.1 สร้าง Spreadsheet ใหม่

1. เปิดเว็บเบราว์เซอร์ ไปที่ [https://sheets.google.com](https://sheets.google.com)
2. คลิก **+ Blank** (สร้างชีทใหม่)
3. ตั้งชื่อ Spreadsheet: `PD3_Production_Records`
   - คลิกที่ชื่อ "Untitled spreadsheet" ด้านบนซ้าย
   - พิมพ์ชื่อใหม่: `PD3_Production_Records`
   - กด Enter

### 1.2 สร้าง Sheet ที่ 1: ProductionData

1. **เปลี่ยนชื่อ Sheet**
   - คลิกขวาที่ "Sheet1" ด้านล่างซ้าย
   - เลือก **Rename**
   - ตั้งชื่อ: `ProductionData`

2. **สร้างหัวตาราง** (Row 1)
   - คลิกที่เซลล์ A1 แล้วพิมพ์: `Date`
   - B1: `Shift`
   - C1: `PT_Machine`
   - D1: `Brand`
   - E1: `Time_Start`
   - F1: `Time_End`
   - G1: `Quantity`
   - H1: `SO_Number`
   - I1: `Notes`
   - J1: `Timestamp`

3. **จัดรูปแบบหัวตาราง**
   - เลือกแถวที่ 1 ทั้งหมด (คลิกเลข 1 ด้านซ้าย)
   - คลิก **Bold** (Ctrl+B)
   - คลิก **Fill color** → เลือกสีฟ้าอ่อน
   - คลิก **Align center**

4. **ตั้งค่าคอลัมน์**
   - เลือกคอลัมน์ A (Date): คลิกขวา → Format cells → Date
   - เลือกคอลัมน์ G (Quantity): คลิกขวา → Format cells → Number
   - ปรับความกว้างคอลัมน์ให้เหมาะสม (ดับเบิลคลิกที่ขอบคอลัมน์)

### 1.3 สร้าง Sheet ที่ 2: Employees

1. **สร้าง Sheet ใหม่**
   - คลิกปุ่ม **+** ด้านล่างซ้าย (ข้าง ProductionData)
   - เปลี่ยนชื่อเป็น: `Employees`

2. **สร้างหัวตาราง** (Row 1)
   - A1: `Record_ID`
   - B1: `Row_Number`
   - C1: `Employee_ID`
   - D1: `Employee_Name`

3. **จัดรูปแบบ**
   - เลือกแถวที่ 1 → Bold → สีฟ้าอ่อน → Center

### 1.4 ตัวอย่างข้อมูล (ทดสอบ)

ใส่ข้อมูลตัวอย่างใน Sheet ProductionData (Row 2):

| Date       | Shift | PT_Machine | Brand        | Time_Start | Time_End | Quantity | SO_Number | Notes | Timestamp           |
|------------|-------|------------|--------------|------------|----------|----------|-----------|-------|---------------------|
| 2026-01-24 | A     | 1          | เบทาโกร 124  | 08:30      | 15:00    | 250      | SO123     | ปกติ  | 2026-01-24 15:00:00|

**✅ Checkpoint 1**: คุณควรมี Google Sheet ที่มี 2 sheets พร้อมหัวตาราง

---

## 💻 STEP 2: สร้าง Google Apps Script

### 2.1 เปิด Script Editor

1. ในหน้า Google Sheet ที่เพิ่งสร้าง
2. ไปที่เมนู **Extensions** → **Apps Script**
3. หน้าต่างใหม่จะเปิดขึ้น (Apps Script Editor)
4. จะมีไฟล์ `Code.gs` อยู่แล้ว

### 2.2 ลบ Code เก่า

1. ลบ code ทั้งหมดที่มีอยู่ใน `Code.gs`
2. หน้าจอควรว่างเปล่า

### 2.3 วาง Code ใหม่

**คัดลอก Code ด้านล่างทั้งหมด แล้ววางใน `Code.gs`:**

```javascript
// ============================================================
// PD3 Production System - Google Apps Script
// Version: 1.0
// Description: รับและบันทึกข้อมูลการผลิตจาก HTML Form
// ============================================================

// ============================================================
// ฟังก์ชันหลัก: รับข้อมูลจาก HTML (HTTP POST)
// ============================================================
function doPost(e) {
  try {
    // 1. อ่านข้อมูล JSON ที่ส่งมา
    const data = JSON.parse(e.postData.contents);
    console.log('Received data:', data);
    
    // 2. เปิด Spreadsheet และ Sheets
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const mainSheet = ss.getSheetByName('ProductionData');
    const employeeSheet = ss.getSheetByName('Employees');
    
    // ตรวจสอบว่า Sheet มีอยู่จริง
    if (!mainSheet) {
      throw new Error('ไม่พบ Sheet ชื่อ ProductionData');
    }
    if (!employeeSheet) {
      throw new Error('ไม่พบ Sheet ชื่อ Employees');
    }
    
    // 3. บันทึกข้อมูลกะ A
    let recordCount = 0;
    if (data.shiftA && Array.isArray(data.shiftA)) {
      data.shiftA.forEach(record => {
        if (saveRecord(mainSheet, employeeSheet, record, 'A')) {
          recordCount++;
        }
      });
    }
    
    // 4. บันทึกข้อมูลกะ B
    if (data.shiftB && Array.isArray(data.shiftB)) {
      data.shiftB.forEach(record => {
        if (saveRecord(mainSheet, employeeSheet, record, 'B')) {
          recordCount++;
        }
      });
    }
    
    // 5. ส่งผลลัพธ์กลับ
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: `บันทึกข้อมูลสำเร็จ ${recordCount} รายการ`,
        timestamp: new Date().toISOString(),
        recordCount: recordCount
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // กรณีเกิด error
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// ฟังก์ชัน: บันทึก 1 record ลง Sheet
// ============================================================
function saveRecord(mainSheet, employeeSheet, record, shift) {
  try {
    // ตรวจสอบว่ามีข้อมูลตราหรือไม่
    let brands = record.brands || [];
    if (!Array.isArray(brands)) {
      brands = [];
    }
    
    // ถ้าไม่มีตรา ข้ามการบันทึก
    if (brands.length === 0) {
      console.log('Skip record - no brands');
      return false;
    }
    
    // สำหรับแต่ละตรา ให้บันทึก 1 row
    brands.forEach(brand => {
      const rowData = [
        record.date || '',                    // A: Date
        shift,                                // B: Shift
        record.pt || '',                      // C: PT_Machine
        brand,                                // D: Brand
        record.timeStart || '',               // E: Time_Start
        record.timeEnd || '',                 // F: Time_End
        parseFloat(record.quantity) || 0,     // G: Quantity
        record.so_number || '',               // H: SO_Number
        record.notes || '',                   // I: Notes
        new Date()                            // J: Timestamp
      ];
      
      // บันทึกลง Sheet ProductionData
      mainSheet.appendRow(rowData);
      const lastRow = mainSheet.getLastRow();
      
      console.log(`Saved record at row ${lastRow}: ${brand}`);
      
      // บันทึกข้อมูลพนักงาน (ถ้าม)
      if (record.employees && Array.isArray(record.employees) && record.employees.length > 0) {
        const recordId = `${record.date}_${shift}_${record.pt}_${brand}`;
        
        record.employees.forEach(emp => {
          employeeSheet.appendRow([
            recordId,           // A: Record_ID
            lastRow,            // B: Row_Number (อ้างอิงแถวใน ProductionData)
            emp.id || '',       // C: Employee_ID
            emp.name || ''      // D: Employee_Name
          ]);
        });
        
        console.log(`Saved ${record.employees.length} employees for record ${recordId}`);
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('Error in saveRecord:', error);
    return false;
  }
}

// ============================================================
// ฟังก์ชันหลัก: ส่งข้อมูลให้ Dashboard (HTTP GET)
// ============================================================
function doGet(e) {
  try {
    const action = e.parameter.action || 'getSummary';
    
    switch(action) {
      case 'getSummary':
        return getSummary(e.parameter.startDate, e.parameter.endDate);
      
      case 'getByBrand':
        return getByBrand(e.parameter.brand, e.parameter.startDate, e.parameter.endDate);
      
      case 'getAllBrands':
        return getAllBrands();
      
      default:
        throw new Error(`Invalid action: ${action}`);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================
// ฟังก์ชัน: ดึงข้อมูลสรุปตามช่วงเวลา
// ============================================================
function getSummary(startDate, endDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ProductionData');
    const data = sheet.getDataRange().getValues();
    
    // ข้ามแถวหัวตาราง
    const records = data.slice(1);
    
    let brandSummary = {};
    let total = 0;
    
    // วนลูปแต่ละแถว
    records.forEach(row => {
      const [date, shift, pt, brand, timeStart, timeEnd, quantity] = row;
      
      // ตรวจสอบว่าอยู่ในช่วงเวลาที่ต้องการหรือไม่
      if (startDate && endDate) {
        const recordDate = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (recordDate < start || recordDate > end) {
          return; // ข้ามแถวนี้
        }
      }
      
      // รวมข้อมูลแต่ละตรา
      if (!brandSummary[brand]) {
        brandSummary[brand] = {
          brand: brand,
          totalQuantity: 0,
          count: 0,
          records: []
        };
      }
      
      const qty = parseFloat(quantity) || 0;
      brandSummary[brand].totalQuantity += qty;
      brandSummary[brand].count++;
      brandSummary[brand].records.push({
        date: date,
        shift: shift,
        pt: pt,
        quantity: qty
      });
      
      total += qty;
    });
    
    // คำนวณค่าเฉลี่ย
    const summaryArray = Object.values(brandSummary).map(item => ({
      brand: item.brand,
      totalQuantity: item.totalQuantity,
      count: item.count,
      avgPerDay: item.totalQuantity / item.count
    }));
    
    // เรียงตามจำนวนมากไปน้อย
    summaryArray.sort((a, b) => b.totalQuantity - a.totalQuantity);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: {
          summary: summaryArray,
          total: total,
          brandCount: summaryArray.length
        }
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    throw new Error(`Error in getSummary: ${error.toString()}`);
  }
}

// ============================================================
// ฟังก์ชัน: ดึงข้อมูลของตราเฉพาะ
// ============================================================
function getByBrand(brand, startDate, endDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ProductionData');
    const data = sheet.getDataRange().getValues();
    
    const records = data.slice(1)
      .filter(row => {
        const [date, shift, pt, recordBrand] = row;
        
        // ตรวจสอบตรา
        if (recordBrand !== brand) return false;
        
        // ตรวจสอบวันที่
        if (startDate && endDate) {
          const recordDate = new Date(date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (recordDate < start || recordDate > end) return false;
        }
        
        return true;
      })
      .map(row => ({
        date: row[0],
        shift: row[1],
        pt: row[2],
        brand: row[3],
        timeStart: row[4],
        timeEnd: row[5],
        quantity: row[6],
        soNumber: row[7],
        notes: row[8],
        timestamp: row[9]
      }));
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: records,
        count: records.length
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    throw new Error(`Error in getByBrand: ${error.toString()}`);
  }
}

// ============================================================
// ฟังก์ชัน: ดึงรายชื่อตราทั้งหมด (สำหรับ dropdown)
// ============================================================
function getAllBrands() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('ProductionData');
    const data = sheet.getDataRange().getValues();
    
    // ดึงคอลัมน์ Brand (index 3)
    const brands = data.slice(1)
      .map(row => row[3])
      .filter(brand => brand && brand.trim())
      .filter((brand, index, self) => self.indexOf(brand) === index) // unique
      .sort();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        data: brands
      }))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    throw new Error(`Error in getAllBrands: ${error.toString()}`);
  }
}

// ============================================================
// ฟังก์ชันทดสอบ (สำหรับ debug ใน Apps Script Editor)
// ============================================================
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        shiftA: [{
          date: '2026-01-24',
          pt: '1',
          brand: 'เบทาโกร 124',
          timeStart: '08:30',
          timeEnd: '15:00',
          quantity: '250',
          so_number: 'SO123',
          notes: 'ทดสอบระบบ',
          employees: [
            { id: 'ZP9371', name: 'นาย ภาณุมาส คงอินทร์' }
          ]
        }],
        shiftB: []
      })
    }
  };
  
  const result = doPost(testData);
  console.log(result.getContent());
}
```

### 2.4 บันทึก Code

1. คลิกปุ่ม **💾 Save** (หรือกด Ctrl+S)
2. ตั้งชื่อโปรเจกต์: `PD3_Production_API`
3. คลิก **OK**

**✅ Checkpoint 2**: Code ถูกบันทึกแล้ว ไม่มี error สีแดง

---

## 🚀 STEP 3: Deploy Apps Script

### 3.1 ทดสอบ Function ก่อน Deploy

1. ในหน้า Apps Script Editor
2. เลือก function: `testDoPost` จาก dropdown ด้านบน
3. คลิกปุ่ม **▶ Run**
4. **ครั้งแรก**: จะมีหน้าต่างขออนุญาต
   - คลิก **Review permissions**
   - เลือกบัญชี Google ของคุณ
   - คลิก **Advanced** → **Go to PD3_Production_API (unsafe)**
   - คลิก **Allow**
5. ดูผลลัพธ์ใน **Execution log** ด้านล่าง
6. เปิด Google Sheet ตรวจสอบว่ามีข้อมูลทดสอบเพิ่มขึ้นหรือไม่

### 3.2 Deploy as Web App

1. คลิกปุ่ม **Deploy** ► **New deployment**
2. **Settings**:
   - Type: เลือก **Web app**
   - Description: `PD3 Production API v1`
   - Execute as: **Me** (อีเมลของคุณ)
   - Who has access: **Anyone** ⚠️ **สำคัญมาก!**
3. คลิก **Deploy**
4. **อนุญาต** (ถ้าขึ้นหน้าต่างอีกครั้ง)
   - คลิก **Authorize access**
   - เลือกบัญชี
   - Advanced → Allow
5. **คัดลอก URL**:
   - จะได้ URL แบบนี้:
     ```
     https://script.google.com/macros/s/AKfycbx.../exec
     ```
   - 📋 **คัดลอกเก็บไว้** (จะใช้ใน STEP 4)

### 3.3 ทดสอบ API ด้วย URL

1. เปิดเบราว์เซอร์ tab ใหม่
2. วาง URL ที่คัดลอกมา แล้วเพิ่ม `?action=getAllBrands`
3. กด Enter
4. ควรเห็น JSON response:
   ```json
   {
     "status": "success",
     "data": ["เบทาโกร 124", ...]
   }
   ```

**✅ Checkpoint 3**: ได้ URL และทดสอบแล้วใช้งานได้

---

## 🔧 STEP 4: แก้ไขระบบส่งข้อมูล

### 4.1 เปิดไฟล์ pd3_production_v3.html

1. เปิดด้วย Text Editor (VS Code, Notepad++, etc.)

### 4.2 เพิ่ม Google Script URL

**หาบรรทัดนี้** (ประมาณบรรทัด 1705):
```javascript
const GOOGLE_SCRIPT_URL = '';
```

**แทนที่ URL:**
```javascript
const GOOGLE_SCRIPT_URL = 'วาง_URL_ที่คัดลอกมา_ตรงนี้';
// ตัวอย่าง: 'https://script.google.com/macros/s/AKfycbx.../exec'
```

### 4.3 ฟังก์ชันใหม่: ระบบเพิ่มตราแบบ Chips

เราเพิ่มฟังก์ชันใหม่ 3 แบบ:
- `addBrand()` - เพิ่มตราเดี่ยว
- `removeBrand()` - ลบตราออก
- `renderBrandTags()` - แสดงตรา chips

**ลักษณะการใช้:**
- เลือกตรา หรือพิมพ์ชื่อตราเอง
- คลิกปุ่ม "เพิ่ม"
- ตราจะปรากฏเป็น chip สีส้ม
- สามารถเพิ่มได้สูงสุด 10 ตรา
- คลิก X บน chip เพื่อลบ

### 4.4 บันทึกไฟล์

1. บันทึก `pd3_production_v3.html` (Ctrl+S)

---

## 📊 STEP 5: สร้าง Dashboard

### 5.1 สร้างไฟล์ dashboard.html

1. สร้างไฟล์ใหม่: `dashboard.html` ในโฟลเดอร์เดียวกับ `pd3_production_v3.html`
2. คัดลอก Code ด้านล่างทั้งหมดวางลงไป:

```html
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - การผลิต PD3</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Sarabun', sans-serif;
        }
        
        .card {
            transition: all 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .loading {
            display: none;
        }
        
        .loading.active {
            display: flex;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <!-- Header -->
    <nav class="bg-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">📊 Dashboard การผลิต PD3</h1>
                    <p class="text-sm text-gray-500 mt-1">ระบบวิเคราะห์ข้อมูลการผลิต</p>
                </div>
                <div>
                    <a href="pd3_production_v3.html" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        📝 บันทึกการผลิต
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-6 py-8">
        <!-- ฟิลเตอร์ -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8 card">
            <h2 class="text-xl font-bold text-gray-800 mb-4">🔍 เลือกช่วงเวลาและตรา</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">วันที่เริ่ม</label>
                    <input type="date" id="startDate" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">วันที่สิ้นสุด</label>
                    <input type="date" id="endDate" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">เลือกตรา</label>
                    <select id="brandFilter" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">ทั้งหมด</option>
                    </select>
                </div>
                <div class="flex items-end">
                    <button onclick="loadData()" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg px-4 py-2 hover:from-blue-700 hover:to-indigo-700 transition font-medium">
                        🔍 ค้นหา
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading -->
        <div id="loading" class="loading active fixed inset-0 bg-black bg-opacity-50 justify-center items-center z-50">
            <div class="bg-white rounded-lg p-8 text-center">
                <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-700">กำลังโหลดข้อมูล...</p>
            </div>
        </div>

        <!-- สรุปภาพรวม -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm mb-1">ผลิตรวม</p>
                        <p class="text-4xl font-bold" id="totalProduced">-</p>
                        <p class="text-blue-100 text-sm mt-1">ใบ</p>
                    </div>
                    <div class="bg-blue-400 bg-opacity-30 rounded-full p-4">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm mb-1">ค่าเฉลี่ยต่อวัน</p>
                        <p class="text-4xl font-bold" id="avgPerDay">-</p>
                        <p class="text-green-100 text-sm mt-1">ใบ/วัน</p>
                    </div>
                    <div class="bg-green-400 bg-opacity-30 rounded-full p-4">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white card">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm mb-1">จำนวนตรา</p>
                        <p class="text-4xl font-bold" id="brandCount">-</p>
                        <p class="text-purple-100 text-sm mt-1">ตรา</p>
                    </div>
                    <div class="bg-purple-400 bg-opacity-30 rounded-full p-4">
                        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- กราฟ -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8 card">
            <h2 class="text-xl font-bold text-gray-800 mb-6">📈 การผลิตแต่ละตรา (Top 10)</h2>
            <div style="height: 400px;">
                <canvas id="brandChart"></canvas>
            </div>
        </div>

        <!-- ตารางรายละเอียด -->
        <div class="bg-white rounded-xl shadow-lg p-6 card">
            <h2 class="text-xl font-bold text-gray-800 mb-6">📋 รายละเอียดแต่ละตรา</h2>
            <div id="brandTable" class="overflow-x-auto"></div>
            <div id="noData" class="text-center py-12 text-gray-500" style="display: none;">
                <svg class="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-xl">ไม่พบข้อมูล</p>
                <p class="mt-2">ลองเปลี่ยนช่วงเวลาหรือบันทึกข้อมูลใหม่</p>
            </div>
        </div>
    </div>

    <script>
        // ============================================================
        // Configuration
        // ============================================================
        const GOOGLE_SCRIPT_URL = 'วาง_URL_ที่คัดลอกมา_ตรงนี้';
        // ตัวอย่าง: 'https://script.google.com/macros/s/AKfycbx.../exec'
        
        let chartInstance = null;

        // ============================================================
        // ตั้งค่าเริ่มต้นเมื่อโหลดหน้า
        // ============================================================
        window.onload = function() {
            const today = new Date();
            const twentyDaysAgo = new Date(today);
            twentyDaysAgo.setDate(today.getDate() - 20);
            
            document.getElementById('startDate').value = formatDate(twentyDaysAgo);
            document.getElementById('endDate').value = formatDate(today);
            
            loadData();
        };

        // ============================================================
        // โหลดข้อมูลจาก Google Sheets
        // ============================================================
        async function loadData() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            if (!startDate || !endDate) {
                alert('กรุณาเลือกวันที่');
                return;
            }
            
            showLoading(true);
            
            try {
                const url = `${GOOGLE_SCRIPT_URL}?action=getSummary&startDate=${startDate}&endDate=${endDate}`;
                console.log('Fetching:', url);
                
                const response = await fetch(url);
                const result = await response.json();
                
                console.log('Response:', result);
                
                if (result.status === 'success') {
                    displaySummary(result.data);
                    displayChart(result.data.summary);
                    displayTable(result.data.summary);
                    document.getElementById('noData').style.display = 
                        result.data.summary.length === 0 ? 'block' : 'none';
                } else {
                    throw new Error(result.message || 'เกิดข้อผิดพลาด');
                }
            } catch (error) {
                console.error('Error loading data:', error);
                alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
            } finally {
                showLoading(false);
            }
        }

        // ============================================================
        // แสดงสรุปภาพรวม
        // ============================================================
        function displaySummary(data) {
            document.getElementById('totalProduced').textContent = 
                data.total.toLocaleString();
            
            const daysDiff = getDaysDiff(
                document.getElementById('startDate').value,
                document.getElementById('endDate').value
            );
            
            const avgPerDay = daysDiff > 0 ? data.total / daysDiff : 0;
            document.getElementById('avgPerDay').textContent = 
                Math.round(avgPerDay).toLocaleString();
            
            document.getElementById('brandCount').textContent = 
                data.brandCount;
        }

        // ============================================================
        // แสดงกราฟ
        // ============================================================
        function displayChart(summary) {
            const ctx = document.getElementById('brandChart');
            
            if (chartInstance) {
                chartInstance.destroy();
            }
            
            // เอา Top 10
            const top10 = summary.slice(0, 10);
            
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: top10.map(item => item.brand),
                    datasets: [{
                        label: 'จำนวนที่ผลิต (ใบ)',
                        data: top10.map(item => item.totalQuantity),
                        backgroundColor: 'rgba(59, 130, 246, 0.6)',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString() + ' ใบ';
                                }
                            }
                        }
                    }
                }
            });
        }

        // ============================================================
        // แสดงตาราง
        // ============================================================
        function displayTable(summary) {
            if (summary.length === 0) {
                document.getElementById('brandTable').innerHTML = '';
                return;
            }
            
            const table = `
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ตรา</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรวม</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ค่าเฉลี่ย/ครั้ง</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนครั้ง</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${summary.map((item, index) => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${index + 1}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.brand}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-semibold">${item.totalQuantity.toLocaleString()} ใบ</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">${Math.round(item.avgPerDay).toLocaleString()} ใบ</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">${item.count} ครั้ง</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            
            document.getElementById('brandTable').innerHTML = table;
        }

        // ============================================================
        // Helper Functions
        // ============================================================
        function showLoading(show) {
            document.getElementById('loading').classList.toggle('active', show);
        }

        function formatDate(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        function getDaysDiff(startDate, endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = Math.abs(end - start);
            return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        }
    </script>
</body>
</html>
```

### 5.2 แก้ไข Google Script URL

**หา 2 บรรทัดนี้** ใน dashboard.html:
```javascript
const GOOGLE_SCRIPT_URL = 'วาง_URL_ที่คัดลอกมา_ตรงนี้';
```

**แทนที่** ด้วย URL จริงจาก STEP 3.2

### 5.3 บันทึกไฟล์

1. บันทึก `dashboard.html` (Ctrl+S)

**✅ Checkpoint 5**: สร้าง Dashboard เสร็จแล้ว

---

## 🧪 STEP 6: ทดสอบระบบ

### 6.1 ทดสอบการส่งข้อมูล

1. เปิด `pd3_production_v3.html` ใน Browser
2. กรอกข้อมูลทดสอบ (อย่างน้อย 2-3 เครื่อง):
   - วันที่: วันนี้
   - กะ: A
   - PT: 1
   - ตรา: เลือกหรือพิมพ์เอง
   - เวลา: 0830 → 1500
   - จำนวน: 250
   - พนักงาน: เลือก 2-3 คน
   - S/O: SO123
3. คลิก **บันทึกข้อมูล**
4. ดูว่าขึ้น Success Modal หรือไม่

### 6.2 ตรวจสอบใน Google Sheet

1. เปิด Google Sheet ที่สร้างไว้
2. ไปที่ Sheet `ProductionData`
3. ควรเห็นข้อมูลที่เพิ่งบันทึก (แถวใหม่ล่างสุด)
4. ไปที่ Sheet `Employees`
5. ควรเห็นข้อมูลพนักงาน

### 6.3 ทดสอบ Dashboard

1. เปิด `dashboard.html` ใน Browser
2. ควรโหลดข้อมูลอัตโนมัติ (20 วันล่าสุด)
3. ดูว่า:
   - ผลิตรวม แสดงตัวเลข
   - กราฟแสดงข้อมูล
   - ตารางมีรายการ
4. ลองเปลี่ยนช่วงเวลา แล้วคลิก **🔍 ค้นหา**

### 6.4 ทดสอบหลายๆ ข้อมูล

1. กลับไปที่ `pd3_production_v3.html`
2. บันทึกข้อมูล 5-10 รอบ (ต่างวัน ต่างตรา)
3. ตรวจสอบใน Dashboard ว่าข้อมูลเพิ่มขึ้น

**✅ Checkpoint 6**: ทดสอบทุกอย่างแล้ว ใช้งานได้

---

## ❗ แก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. ส่งข้อมูลแล้ว ไม่มีใน Google Sheet

**สาเหตุ:**
- URL ผิด
- Apps Script ไม่ได้ Deploy
- Permission ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ URL ใน HTML ว่าถูกต้อง
2. ใน Apps Script → Deploy → ต้องเป็น **Anyone**
3. ลองเรียก URL ใน Browser ต้องไม่ error

#### 2. Dashboard โหลดไม่ขึ้น

**สาเหตุ:**
- URL ผิด
- Google Sheet ไม่มีข้อมูล

**วิธีแก้:**
1. เปิด Console (F12) ดู error
2. ตรวจสอบว่า `GOOGLE_SCRIPT_URL` ถูกต้อง
3. ลองเรียก URL ด้วย `?action=getSummary`

#### 3. CORS Error

**วิธีแก้:**
- ใช้ `mode: 'no-cors'` ใน fetch (มีอยู่แล้วใน code)
- ไม่ต้องแก้อะไร Apps Script จะจัดการเอง

#### 4. Data ไม่ถูกต้อง

**วิธีแก้:**
1. ลบข้อมูลใน Sheet แล้วลองใหม่
2. ตรวจสอบว่า field name ตรงกันหรือไม่
3. ดู Log ใน Apps Script → Executions

---

## 📖 การใช้งาน

### การบันทึกข้อมูลรายวัน

1. เปิด `pd3_production_v3.html`
2. กรอกข้อมูลทุกเครื่อง PT
3. คลิก **บันทึกข้อมูล**
4. ตรวจสอบใน Google Sheet

### การดู Dashboard

1. เปิด `dashboard.html`
2. เลือกช่วงเวลา
3. วิเคราะห์ข้อมูล

### การ Export ข้อมูล

1. เปิด Google Sheet
2. File → Download → Excel (.xlsx)
3. หรือ File → Download → PDF

### การแชร์ให้หัวหน้า

**วิธีที่ 1: แชร์ Google Sheet**
1. คลิก **Share** มุมขวาบน
2. ใส่อีเมลหัวหน้า
3. เลือก Viewer (ดูอย่างเดียว)

**วิธีที่ 2: แชร์ Dashboard**
1. Upload `dashboard.html` ไป Server/Hosting
2. ส่ง URL ให้หัวหน้า

---

## 🎉 สำเร็จแล้ว!

ตอนนี้คุณมี:
- ✅ ระบบบันทึกการผลิต
- ✅ ฐานข้อมูลใน Google Sheets
- ✅ Dashboard วิเคราะห์ข้อมูล

### ขั้นต่อไปที่แนะนำ

1. เพิ่มฟีเจอร์ตั้งเป้าหมาย
2. สร้างรายงานประจำสัปดาห์/เดือน
3. เพิ่ม Login System
4. Export ไป Excel อัตโนมัติ

---



---

