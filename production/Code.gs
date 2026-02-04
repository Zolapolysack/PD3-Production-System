/**
 * Google Apps Script สำหรับรับข้อมูลจาก pd3_production_v3.html
 * และสร้าง Google Sheet ตาม PERFECT_TEMPLATE.xlsx 100%
 * 
 * โครงสร้าง Sheet:
 * - Row 1-6: ส่วนหัว
 * - Row 7-34: ข้อมูล 7 PT machines (แต่ละ PT ใช้ 4 rows)
 * - Row 35-38: Footer
 */

// ===== CONFIGURATION =====
const SPREADSHEET_ID = '1OKrfXml5FKtJqInmlFt1ONUOibDP8jh640ughmY7WpQ';
const PT_MACHINES = [1, 2, 3, 4, 8, 9, 10];

// ===== UTILITY FUNCTIONS =====
function formatDate(dateString) {
  // ถ้ามีวันที่ส่งมา ให้ใช้เลย
  if (dateString) {
    return dateString;
  }
  
  // ถ้าไม่มี ให้สร้างวันที่ปัจจุบันในรูปแบบ DD/MM/YYYY
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

// ===== MAIN FUNCTION =====
function saveProductionData(data) {
  try {
    Logger.log('Starting saveProductionData...');
    Logger.log('Received data: ' + JSON.stringify(data));
    
    // Format วันที่ให้เป็น DD/MM/YYYY
    const formattedDate = formatDate(data.date);
    Logger.log('Formatted date: ' + formattedDate);
    
    const sheetName = `รายงาน ${formattedDate}`;
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.insertSheet(sheetName);
    
    setupColumnWidths(sheet);
    setupRowHeights(sheet);
    mergeCells(sheet);
    createHeader(sheet, formattedDate);
    fillShiftData(sheet, data.shiftA, 'A', 7);
    fillShiftData(sheet, data.shiftB, 'B', 7);
    createFooter(sheet);
    applyBorders(sheet);
    
    Logger.log('Sheet created: ' + ss.getUrl() + '#gid=' + sheet.getSheetId());
    
    // 🔥 TWIN SAVING: บันทึกข้อมูลลง Database Sheet ด้วย
    try {
      saveToDatabaseSheet(ss, data, formattedDate);
      Logger.log('✅ Data saved to Database sheet');
    } catch (dbError) {
      Logger.log('⚠️ Warning: Failed to save to Database: ' + dbError.toString());
      // ไม่ throw error เพราะไม่อยากให้ระบบหลักล้มเหลว
    }
    
    return {
      success: true,
      sheetUrl: ss.getUrl() + '#gid=' + sheet.getSheetId(),
      sheetId: ss.getId(),
      sheetName: sheetName,
      message: 'บันทึกสำเร็จ - เพิ่มแท็บ: ' + sheetName
    };
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return {
      success: false,
      message: 'เกิดข้อผิดพลาด: ' + error.toString()
    };
  }
}

// ===== SETUP FUNCTIONS =====
function setupColumnWidths(sheet) {
  sheet.setColumnWidth(1, 165);   // A = เพิ่มเป็น 165 เพื่อรองรับ 'ยอดผลิตประจำวันที่'
  sheet.setColumnWidth(2, 135);   // B = 18.00 chars
  sheet.setColumnWidth(3, 100);   // C = 13.00 chars
  sheet.setColumnWidth(4, 100);   // D = 13.00 chars
  sheet.setColumnWidth(5, 100);   // E = 12.10 chars
  sheet.setColumnWidth(6, 100);   // F = 13.00 chars
  sheet.setColumnWidth(7, 165);   // G = เพิ่ลเป็น 165 เพื่อรองรับ 'ยอดผลิตประจำวันที่'
  sheet.setColumnWidth(8, 100);   // H = 13.00 chars
  sheet.setColumnWidth(9, 100);   // I = 13.00 chars
  sheet.setColumnWidth(10, 100);  // J = 13.00 chars
  sheet.setColumnWidth(11, 100);  // K = 13.00 chars
  sheet.setColumnWidth(12, 100);  // L = 13.00 chars
}

function setupRowHeights(sheet) {
  for (let row = 7; row <= 38; row++) {
    sheet.setRowHeight(row, 21);  // 19.8 points ≈ 21 pixels
  }
}

function mergeCells(sheet) {
  const ranges = [
    'B1:C1', 'D1:E1', 'F1:J1',
    'B2:C2', 'D2:E2', 'F2:L2',
    'D3:E3', 'F3:L3',
    'D4:E4', 'F4:L4',
    'B5:F5', 'H5:L5',
    'E6:F6', 'K6:L6',
    'A7:A10', 'G7:G10',
    'A11:A14', 'G11:G14',
    'A15:A18', 'G15:G18',
    'A19:A22', 'G19:G22',
    'A23:A26', 'G23:G26',
    'A27:A30', 'G27:G30',
    'A31:A34', 'G31:G34'
  ];
  
  // S/O columns E:F และ K:L สำหรับทุกแถว 7-34
  for (let row = 7; row <= 34; row++) {
    ranges.push(`E${row}:F${row}`);
    ranges.push(`K${row}:L${row}`);
  }
  
  ranges.push('J35:L35', 'I37:J37');
  
  ranges.forEach(range => sheet.getRange(range).merge());
}

// ===== HEADER FUNCTIONS =====
function createHeader(sheet, dateStr) {
  // ROW 1
  sheet.getRange('B1').setValue('ยอดพิมพ์(ใบ)')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  sheet.getRange('D1').setValue('จำนวนพนักงานขาด')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  sheet.getRange('F1').setValue('หมายเหตุ/ปัญหาที่พบ')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // ROW 2
  sheet.getRange('A2').setValue('ยอดยกมา')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // ROW 3
  sheet.getRange('A3').setValue('ยอดผลิตประจำวัน')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  sheet.getRange('B3').setFormula('=D36+J36')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setNumberFormat('#,##0');
  
  // ROW 4
  sheet.getRange('A4').setValue('รวม')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // ROW 5 - ใช้ dateStr ที่ format แล้วจาก parameter
  // A5 - ยอดผลิตประจำวันที่ (กะ A) - ชิดซ้าย
  sheet.getRange('A5').setValue('ยอดผลิตประจำวันที่')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('left');
  
  // B5 - แสดงวันที่ + กะ A (ไม่ merge, ชิดซ้าย, ไม่มีขอบขวา)
  sheet.getRange('B5').setValue(`${dateStr} (กะ A)`)
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('left');
  
  // G5 - ยอดผลิตประจำวันที่ (กะ B)
  sheet.getRange('G5').setValue('ยอดผลิตประจำวันที่')
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('left');
  
  // H5 - แสดงวันที่ + กะ B (merged H5:L5)
  sheet.getRange('H5').setValue(`${dateStr} (กะ B)`)
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('left');
  
  // ROW 6 - Headers
  const headers = [
    {cell: 'A6', text: 'PT'},
    {cell: 'B6', text: 'ตรา'},
    {cell: 'C6', text: 'เวลา'},
    {cell: 'D6', text: 'จำนวน (ใบ)'},
    {cell: 'E6', text: 'เลขที่ S/O'},
    {cell: 'G6', text: 'PT'},
    {cell: 'H6', text: 'ตรา'},
    {cell: 'I6', text: 'เวลา'},
    {cell: 'J6', text: 'จำนวน (ใบ)'},
    {cell: 'K6', text: 'เลขที่ S/O'}
  ];
  
  headers.forEach(h => {
    sheet.getRange(h.cell).setValue(h.text)
      .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
      .setHorizontalAlignment('center');
  });
}

// ===== DATA FILL FUNCTIONS =====
function fillShiftData(sheet, shiftData, shiftLetter, startRow) {
  const colOffset = shiftLetter === 'A' ? 0 : 6;
  let currentRow = startRow;
  
  PT_MACHINES.forEach(pt => {
    const ptKey = `PT${pt}`;
    const ptData = shiftData[ptKey] || {};
    const brands = ptData.brands || [];
    const soData = ptData.soData || {};
    const timeData = ptData.timeData || {};
    const quantityData = ptData.quantityData || {};
    const employees = ptData.employees || [];
    
    // PT number (merged 4 rows) - ใส่เฉพาะแถวแรก
    const ptCol = shiftLetter === 'A' ? 1 : 7;
    sheet.getRange(currentRow, ptCol).setValue(pt)
      .setFontFamily('Angsana New').setFontSize(14)
      .setHorizontalAlignment('center').setVerticalAlignment('middle');
    
    // 3 แถวแรก: ตรา + ข้อมูล
    for (let i = 0; i < 3; i++) {
      const brand = brands[i] || '';
      const so = soData[brand] || '';
      const time = timeData[brand] || {};
      const timeStr = time.start && time.end ? `${time.start}-${time.end}` : '';
      const qty = quantityData[brand] || '';
      
      // ตรา
      sheet.getRange(currentRow, 2 + colOffset).setValue(brand)
        .setFontFamily('Angsana New').setFontSize(14)
        .setHorizontalAlignment('left');
      
      // เวลา
      sheet.getRange(currentRow, 3 + colOffset).setValue(timeStr)
        .setFontFamily('Angsana New').setFontSize(14)
        .setHorizontalAlignment('center');
      
      // จำนวน
      sheet.getRange(currentRow, 4 + colOffset).setValue(qty)
        .setFontFamily('Angsana New').setFontSize(14)
        .setHorizontalAlignment('center')
        .setNumberFormat('#,##0');
      
      // S/O (merged E:F หรือ K:L)
      sheet.getRange(currentRow, 5 + colOffset).setValue(so)
        .setFontFamily('Angsana New').setFontSize(14)
        .setHorizontalAlignment('center');
      
      currentRow++;
    }
    
    // แถวที่ 4: พนักงาน
    const employeeNames = employees.map(emp => {
      if (typeof emp === 'string') return emp;
      if (emp.name) return emp.name;
      if (emp.id && emp.name) return `${emp.id} - ${emp.name}`;
      return '';
    }).filter(name => name).join(', ');
    
    sheet.getRange(currentRow, 2 + colOffset).setValue(employeeNames)
      .setFontFamily('Angsana New').setFontSize(14)
      .setHorizontalAlignment('left').setWrap(true);
    
    currentRow++;
  });
}

function createFooter(sheet) {
  // ROW 35
  sheet.getRange('A35').setValue('รวม')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('center');
  
  // ROW 36
  sheet.getRange('D36').setFormula('=SUM(D7:D35)')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('right')
    .setNumberFormat('#,##0');
  
  sheet.getRange('H36').setValue('ลงชื่อ')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('right');
  
  sheet.getRange('J36').setFormula('=SUM(J7:J35)')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('right')
    .setNumberFormat('#,##0');
  
  // ROW 37
  sheet.getRange('I37').setValue('หัวหน้าแผนก PD3')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('left');
  
  // ROW 38
  sheet.getRange('I38').setValue('…../…../…..')
    .setFontFamily('Angsana New').setFontSize(14)
    .setHorizontalAlignment('center');
}

// ===== DATABASE FUNCTIONS (Twin Saving System) =====
/**
 * สร้างหรือดึง Database Sheet
 */
function getOrCreateDatabaseSheet(ss) {
  let dbSheet = ss.getSheetByName('Database');
  
  if (!dbSheet) {
    Logger.log('Creating new Database sheet...');
    dbSheet = ss.insertSheet('Database');
    
    // สร้างหัวตาราง
    const headers = [
      'Timestamp',      // A: เวลาบันทึก
      'Date',           // B: วันที่ผลิต (DD/MM/YYYY)
      'Shift',          // C: กะ (A/B)
      'PT',             // D: เครื่อง PT
      'Brand',          // E: ตรา
      'Time_Start',     // F: เวลาเริ่ม
      'Time_End',       // G: เวลาจบ
      'Quantity',       // H: จำนวน
      'SO_Number',      // I: เลขที่ S/O
      'Employees',      // J: พนักงาน (รวมเป็น string)
      'Notes'           // K: หมายเหตุ
    ];
    
    dbSheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontFamily('Arial').setFontSize(10).setFontWeight('bold')
      .setBackground('#4285f4').setFontColor('#ffffff')
      .setHorizontalAlignment('center');
    
    // ตั้งค่าความกว้างคอลัมน์
    dbSheet.setColumnWidth(1, 150);  // Timestamp
    dbSheet.setColumnWidth(2, 100);  // Date
    dbSheet.setColumnWidth(3, 60);   // Shift
    dbSheet.setColumnWidth(4, 60);   // PT
    dbSheet.setColumnWidth(5, 150);  // Brand
    dbSheet.setColumnWidth(6, 80);   // Time_Start
    dbSheet.setColumnWidth(7, 80);   // Time_End
    dbSheet.setColumnWidth(8, 100);  // Quantity
    dbSheet.setColumnWidth(9, 120);  // SO_Number
    dbSheet.setColumnWidth(10, 250); // Employees
    dbSheet.setColumnWidth(11, 200); // Notes
    
    // Freeze แถวแรก
    dbSheet.setFrozenRows(1);
    
    Logger.log('✅ Database sheet created with headers');
  }
  
  return dbSheet;
}

/**
 * บันทึกข้อมูลลง Database Sheet (แบบแถวยาว: 1 PT = 1 แถว)
 */
function saveToDatabaseSheet(ss, data, formattedDate) {
  const dbSheet = getOrCreateDatabaseSheet(ss);
  const timestamp = new Date();
  
  const rows = [];
  
  // ประมวลผลข้อมูลกะ A
  if (data.shiftA) {
    PT_MACHINES.forEach(pt => {
      const ptKey = `PT${pt}`;
      const ptData = data.shiftA[ptKey] || {};
      const brands = ptData.brands || [];
      const soData = ptData.soData || {};
      const timeData = ptData.timeData || {};
      const quantityData = ptData.quantityData || {};
      const employees = ptData.employees || [];
      
      // สร้างแถวสำหรับแต่ละตรา (สูงสุด 3 ตรา)
      brands.forEach(brand => {
        if (brand && brand.trim()) {
          const time = timeData[brand] || {};
          const qty = quantityData[brand] || '';
          const so = soData[brand] || '';
          
          // แปลง employees array เป็น string
          const employeeNames = employees.map(emp => {
            if (typeof emp === 'string') return emp;
            if (emp.name) return emp.name;
            if (emp.id && emp.name) return `${emp.id} - ${emp.name}`;
            return '';
          }).filter(name => name).join(', ');
          
          rows.push([
            timestamp,
            formattedDate,
            'A',
            pt,
            brand,
            time.start || '',
            time.end || '',
            qty,
            so,
            employeeNames,
            ptData.notes || ''
          ]);
        }
      });
    });
  }
  
  // ประมวลผลข้อมูลกะ B
  if (data.shiftB) {
    PT_MACHINES.forEach(pt => {
      const ptKey = `PT${pt}`;
      const ptData = data.shiftB[ptKey] || {};
      const brands = ptData.brands || [];
      const soData = ptData.soData || {};
      const timeData = ptData.timeData || {};
      const quantityData = ptData.quantityData || {};
      const employees = ptData.employees || [];
      
      brands.forEach(brand => {
        if (brand && brand.trim()) {
          const time = timeData[brand] || {};
          const qty = quantityData[brand] || '';
          const so = soData[brand] || '';
          
          const employeeNames = employees.map(emp => {
            if (typeof emp === 'string') return emp;
            if (emp.name) return emp.name;
            if (emp.id && emp.name) return `${emp.id} - ${emp.name}`;
            return '';
          }).filter(name => name).join(', ');
          
          rows.push([
            timestamp,
            formattedDate,
            'B',
            pt,
            brand,
            time.start || '',
            time.end || '',
            qty,
            so,
            employeeNames,
            ptData.notes || ''
          ]);
        }
      });
    });
  }
  
  // บันทึกข้อมูลลง Database Sheet
  if (rows.length > 0) {
    const lastRow = dbSheet.getLastRow();
    dbSheet.getRange(lastRow + 1, 1, rows.length, 11).setValues(rows);
    Logger.log(`💾 Saved ${rows.length} rows to Database sheet`);
  } else {
    Logger.log('⚠️ No data to save to Database');
  }
}

/**
 * ดึงข้อมูลจาก Database Sheet (สำหรับ Dashboard)
 */
function getDatabaseData(startDate, endDate) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const dbSheet = ss.getSheetByName('Database');
    
    if (!dbSheet) {
      return {
        status: 'error',
        message: 'Database sheet not found'
      };
    }
    
    const data = dbSheet.getDataRange().getValues();
    const headers = data[0];
    const records = [];
    
    // แปลงข้อมูลเป็น JSON
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const recordDate = row[1]; // Date column
      
      // กรองตามช่วงเวลา (ถ้ามี)
      if (startDate && endDate) {
        const recDate = new Date(recordDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (recDate < start || recDate > end) {
          continue;
        }
      }
      
      records.push({
        timestamp: row[0],
        date: row[1],
        shift: row[2],
        pt: row[3],
        brand: row[4],
        timeStart: row[5],
        timeEnd: row[6],
        quantity: row[7],
        soNumber: row[8],
        employees: row[9],
        notes: row[10]
      });
    }
    
    return {
      status: 'success',
      data: records,
      count: records.length
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

/**
 * ดึงรายการ S/O ทั้งหมด (สำหรับ Dropdown)
 * ดึงจาก Database Sheet เท่านั้น
 */
function getSOList() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const soMap = new Map(); // ใช้ Map เพื่อไม่ให้ซ้ำ
    
    // ดึงจาก Database Sheet (S/O ที่มีการผลิตจริง)
    const dbSheet = ss.getSheetByName('Database');
    if (dbSheet) {
      const dbData = dbSheet.getDataRange().getValues();
      for (let i = 1; i < dbData.length; i++) {
        const soNumber = dbData[i][8]; // SO_Number column
        const brand = dbData[i][4];     // Brand column
        if (soNumber) {
          const soStr = soNumber.toString().trim();
          // ใช้ Brand แรกที่พบเป็นชื่อสินค้า
          if (!soMap.has(soStr)) {
            soMap.set(soStr, brand || '');
          }
        }
      }
    }
    
    // แปลง Map เป็น Array
    const soList = Array.from(soMap).map(([soNumber, productName]) => ({
      soNumber: soNumber,
      productName: productName
    }));
    
    // เรียงตามเลข S/O
    soList.sort((a, b) => a.soNumber.localeCompare(b.soNumber));
    
    return {
      status: 'success',
      data: soList
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: error.toString()
    };
  }
}

/**
 * คำนวณความคืบหน้าของ S/O (Target vs Actual)
 * รองรับการกรองตามช่วงเวลา
 * รองรับ Custom Target เท่านั้น (ไม่ใช้ Targets Sheet)
 */
function getSOProgress(soNumber, startDate, endDate, customTarget) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // 1. ใช้ Custom Target เท่านั้น
    const targetQty = customTarget ? parseFloat(customTarget) : 0;
    let productName = '';
    
    // 2. ดึงข้อมูล Actual จาก Database
    const dbSheet = ss.getSheetByName('Database');
    if (!dbSheet) {
      return {
        status: 'error',
        message: 'Database sheet not found'
      };
    }
    
    const dbData = dbSheet.getDataRange().getValues();
    let actualQty = 0;
    const records = [];
    
    // แปลง date strings เป็น Date objects สำหรับการเปรียบเทียบ
    let filterStartDate = null;
    let filterEndDate = null;
    
    if (startDate) {
      filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);
    }
    
    if (endDate) {
      filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999);
    }
    
    for (let i = 1; i < dbData.length; i++) {
      const dbSO = dbData[i][8] ? dbData[i][8].toString().trim() : '';
      if (dbSO === soNumber) { // SO_Number column
        // กรองตามวันที่ถ้ามีการระบุ
        if (filterStartDate || filterEndDate) {
          const recordDateStr = dbData[i][1]; // Date column (DD/MM/YYYY)
          
          // แปลง DD/MM/YYYY เป็น Date object
          const dateParts = recordDateStr.toString().split('/');
          if (dateParts.length === 3) {
            const recordDate = new Date(
              parseInt(dateParts[2]), // year
              parseInt(dateParts[1]) - 1, // month (0-indexed)
              parseInt(dateParts[0]) // day
            );
            
            // ตรวจสอบว่าอยู่ในช่วงที่กำหนดหรือไม่
            if (filterStartDate && recordDate < filterStartDate) {
              continue; // ข้ามถ้าก่อนวันเริ่มต้น
            }
            
            if (filterEndDate && recordDate > filterEndDate) {
              continue; // ข้ามถ้าหลังวันสิ้นสุด
            }
          }
        }
        
        const qty = parseFloat(dbData[i][7]) || 0; // Quantity column
        actualQty += qty;
        
        // ใช้ Brand แรกเป็นชื่อสินค้า
        if (!productName) {
          productName = dbData[i][4] || '';
        }
        
        records.push({
          date: dbData[i][1],
          shift: dbData[i][2],
          pt: dbData[i][3],
          brand: dbData[i][4],
          quantity: dbData[i][7]
        });
      }
    }
  
  // ถ้าไม่มีข้อมูลการผลิตเลย
  if (records.length === 0) {
    return {
      status: 'warning',
      message: 'ไม่พบข้อมูลการผลิตสำหรับ S/O นี้',
      data: {
        target: targetQty,
        actual: 0,
        remaining: targetQty,
        progress: 0,
        dueDate: '',
        customer: '',
        productName: '',
        recordCount: 0,
        records: []
      }
    };
  }
  
  // 3. คำนวณ
  const remaining = targetQty - actualQty;
  const progress = targetQty > 0 ? (actualQty / targetQty * 100) : 0;
  
  return {
    status: 'success',
    data: {
      target: targetQty,
      actual: actualQty,
      remaining: remaining,
      progress: Math.round(progress * 10) / 10, // 1 ทศนิยม
      dueDate: '',
      customer: '',
      productName: productName,
      recordCount: records.length,
      records: records
    }
  };
  
} catch (error) {
  return {
    status: 'error',
    message: error.toString()
  };
}
}

// ===== BORDER FUNCTIONS =====
function applyBorders(sheet) {
  // Border ทั้ง range A1:L35 (ไม่ใส่ขอบแถว 36-38)
  sheet.getRange('A1:L35').setBorder(
    true, true, true, true, true, true,
    '#000000', SpreadsheetApp.BorderStyle.SOLID
  );
  
  // ลบเส้นขอบขวาของ B5 (เพราะไม่ merge กับ C5 แล้ว)
  sheet.getRange('B5').setBorder(
    true, null, true, true, null, null,
    '#000000', SpreadsheetApp.BorderStyle.SOLID
  );
}

// ===== WEB APP FUNCTIONS =====
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || 'status';
    
    // ตรวจสอบว่าเรียก action อะไร
    if (action === 'getDatabaseData') {
      const startDate = params.startDate || '';
      const endDate = params.endDate || '';
      const result = getDatabaseData(startDate, endDate);
      
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ดึงรายการ S/O ทั้งหมด
    if (action === 'getSOList') {
      const result = getSOList();
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ดึงความคืบหน้าของ S/O เฉพาะ
    if (action === 'getSOProgress') {
      const soNumber = params.soNumber || '';
      const startDate = params.startDate || '';
      const endDate = params.endDate || '';
      const customTarget = params.customTarget || '';
      
      if (!soNumber) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Missing soNumber parameter'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      const result = getSOProgress(soNumber, startDate, endDate, customTarget);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ถ้าไม่ระบุ action หรือเรียก status
    return ContentService.createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'PD3 Production System API - Database Only',
      timestamp: new Date().toISOString(),
      availableActions: [
        'getDatabaseData',
        'getSOList',
        'getSOProgress?soNumber=MK123456&customTarget=15000'
      ]
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function testCreateSheet() {
  const testData = {
    date: "31/01/2026",
    shiftA: {
      PT1: {
        brands: ["เบทาโกร 124", "BS(2หน้า)", "918พี"],
        soData: {"เบทาโกร 124": "SO-12345", "BS(2หน้า)": "SO-67890", "918พี": "SO-11111"},
        timeData: {
          "เบทาโกร 124": {start: "08:30", end: "15:00"},
          "BS(2หน้า)": {start: "09:00", end: "16:00"},
          "918พี": {start: "10:00", end: "17:00"}
        },
        quantityData: {"เบทาโกร 124": 500, "BS(2หน้า)": 300, "918พี": 200},
        employees: ["นายสมชาย ใจดี", "นางสาวสมหญิง รักงาน"],
        notes: "ทดสอบระบบ"
      },
      PT2: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT3: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT4: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT8: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT9: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT10: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""}
    },
    shiftB: {
      PT1: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT2: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT3: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT4: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT8: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT9: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""},
      PT10: {brands: [], soData: {}, timeData: {}, quantityData: {}, employees: [], notes: ""}
    }
  };
  
  Logger.log('Testing saveProductionData...');
  const result = saveProductionData(testData);
  Logger.log('Result: ' + JSON.stringify(result));
  
  if (result.success) {
    Logger.log('✅ Test successful!');
    Logger.log('Sheet URL: ' + result.sheetUrl);
  } else {
    Logger.log('❌ Test failed: ' + result.message);
  }
  
  return result;
}

function doPost(e) {
  try {
    Logger.log('=== POST Request ===');
    Logger.log('Event: ' + JSON.stringify(e));
    
    let data;
    
    if (e && e.parameter && e.parameter.data) {
      Logger.log('Parsing from parameter');
      try {
        data = JSON.parse(e.parameter.data);
        Logger.log('Success: parameter');
      } catch (err) {
        Logger.log('Failed: ' + err);
      }
    }
    
    if (!data && e && e.postData && e.postData.contents) {
      Logger.log('Parsing from postData');
      try {
        data = JSON.parse(e.postData.contents);
        Logger.log('Success: postData');
      } catch (err) {
        Logger.log('Failed: ' + err);
      }
    }
    
    if (!data && e && e.postData && e.postData.contents) {
      Logger.log('Parsing form data');
      try {
        const params = e.postData.contents.split('&');
        for (let param of params) {
          const [key, value] = param.split('=');
          if (key === 'data') {
            data = JSON.parse(decodeURIComponent(value));
            Logger.log('Success: form');
            break;
          }
        }
      } catch (err) {
        Logger.log('Failed: ' + err);
      }
    }
    
    if (!data) {
      throw new Error('No data found');
    }
    
    Logger.log('Final data: ' + JSON.stringify(data));
    
    if (!data.date) throw new Error('Missing date');
    if (!data.shiftA || !data.shiftB) throw new Error('Missing shifts');
    
    const result = saveProductionData(data);
    Logger.log('Save result: ' + JSON.stringify(result));
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('=== ERROR ===');
    Logger.log('Message: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error: ' + error.toString(),
        error: error.stack || error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
