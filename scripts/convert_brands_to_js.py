"""
แปลงรายการสินค้าเป็น JavaScript array สำหรับใช้ใน pd3_production_v3.html
"""

import json

# อ่านไฟล์ Excel เพื่อดึงข้อมูลที่ถูกต้อง
import pandas as pd

excel_file = r"C:\Users\Zola Polysack\Desktop\PD3\Color_Matching_Report.xlsx"
df = pd.read_excel(excel_file)

# ดึงคอลัมน์ I (index 8)
column_i_data = df.iloc[:, 8]

# ลบค่า null
column_i_data = column_i_data.dropna()

# ดึงข้อมูลที่ไม่ซ้ำ
unique_values = column_i_data.unique()

# แปลงเป็น string และเรียงลำดับ
unique_values = [str(v) for v in unique_values]
unique_values = sorted(unique_values)

print(f"จำนวนรายการทั้งหมด: {len(unique_values)}")

# สร้าง JavaScript array
js_code = "        const brands = [\n"
for brand in unique_values:
    # Escape quotes ในชื่อสินค้า
    brand_escaped = brand.replace('\\', '\\\\').replace('"', '\\"')
    js_code += f'            "{brand_escaped}",\n'
js_code += "        ];"

# บันทึกลงไฟล์
output_file = "brands_array.js"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f"\n✅ สร้างไฟล์ {output_file} เรียบร้อยแล้ว")
print(f"จำนวนรายการสินค้า: {len(unique_values)} รายการ")
print("\nตัวอย่างรายการแรก 10 รายการ:")
for i, brand in enumerate(unique_values[:10], 1):
    print(f"{i}. {brand}")
