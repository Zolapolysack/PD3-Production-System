"""
Script สำหรับดึงข้อมูลจากคอลัมน์ I ของไฟล์ Color_Matching_Report.xlsx
และกรองข้อมูลที่ไม่ซ้ำกัน
"""

import pandas as pd
from pathlib import Path

def extract_unique_column_i(excel_file):
    """
    ดึงข้อมูลจากคอลัมน์ I และกรองให้ไม่ซ้ำกัน
    
    Parameters:
    excel_file (str): ชื่อไฟล์ Excel
    
    Returns:
    list: ข้อมูลที่ไม่ซ้ำกันจากคอลัมน์ I
    """
    try:
        # อ่านไฟล์ Excel
        print(f"กำลังอ่านไฟล์: {excel_file}")
        df = pd.read_excel(excel_file)
        
        # ตรวจสอบว่ามีคอลัมน์ I หรือไม่
        if 'I' not in df.columns:
            # ถ้าไม่มีชื่อคอลัมน์ ให้ใช้ index (คอลัมน์ I = index 8)
            if len(df.columns) >= 9:
                column_i_data = df.iloc[:, 8]  # คอลัมน์ที่ 9 (index 8)
                print(f"ใช้คอลัมน์ที่ 9 (index 8): {df.columns[8]}")
            else:
                print(f"❌ ไฟล์มีเพียง {len(df.columns)} คอลัมน์ ไม่มีคอลัมน์ I")
                return []
        else:
            column_i_data = df['I']
            print("ใช้คอลัมน์ 'I'")
        
        # ลบค่า null/NaN ออก
        column_i_data = column_i_data.dropna()
        
        # ดึงข้อมูลที่ไม่ซ้ำกัน
        unique_values = column_i_data.unique()
        
        # แปลงเป็น string ก่อนเรียงลำดับ (เพื่อหลีกเลี่ยง error เมื่อมีทั้งตัวเลขและข้อความ)
        unique_values = [str(v) for v in unique_values]
        
        # เรียงลำดับข้อมูล
        unique_values = sorted(unique_values)
        
        print(f"\n✅ พบข้อมูลทั้งหมด: {len(column_i_data)} รายการ")
        print(f"✅ ข้อมูลที่ไม่ซ้ำกัน: {len(unique_values)} รายการ")
        
        return unique_values
        
    except FileNotFoundError:
        print(f"❌ ไม่พบไฟล์: {excel_file}")
        print(f"   กรุณาตรวจสอบว่าไฟล์อยู่ในตำแหน่งเดียวกับ script นี้")
        return []
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาด: {str(e)}")
        return []


def save_to_file(data, output_file="column_i_unique.txt"):
    """
    บันทึกข้อมูลลงไฟล์
    
    Parameters:
    data (list): ข้อมูลที่จะบันทึก
    output_file (str): ชื่อไฟล์ output
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            for item in data:
                f.write(f"{item}\n")
        print(f"\n✅ บันทึกข้อมูลลงไฟล์: {output_file}")
    except Exception as e:
        print(f"❌ ไม่สามารถบันทึกไฟล์: {str(e)}")


def main():
    """
    ฟังก์ชันหลัก
    """
    print("=" * 60)
    print("  📊 ดึงข้อมูลจากคอลัมน์ I (ไม่ซ้ำกัน)")
    print("=" * 60)
    
    # ชื่อไฟล์ Excel (ปรับ path ให้ตรงกับตำแหน่งไฟล์จริง)
    excel_file = r"C:\Users\Zola Polysack\Desktop\PD3\Color_Matching_Report.xlsx"
    
    # ดึงข้อมูล
    unique_data = extract_unique_column_i(excel_file)
    
    if unique_data:
        print("\n" + "=" * 60)
        print("  📋 ข้อมูลที่ไม่ซ้ำกันจากคอลัมน์ I:")
        print("=" * 60)
        
        # แสดงข้อมูล
        for i, value in enumerate(unique_data, 1):
            print(f"{i:3d}. {value}")
        
        # บันทึกลงไฟล์
        save_to_file(unique_data)
        
        # บันทึกเป็น Excel (ถ้าต้องการ)
        try:
            output_excel = "column_i_unique.xlsx"
            df_output = pd.DataFrame(unique_data, columns=['Column I (Unique)'])
            df_output.to_excel(output_excel, index=False)
            print(f"✅ บันทึกข้อมูลลงไฟล์ Excel: {output_excel}")
        except Exception as e:
            print(f"⚠️  ไม่สามารถบันทึก Excel: {str(e)}")
        
    else:
        print("\n⚠️  ไม่พบข้อมูล")
    
    print("\n" + "=" * 60)
    print("  เสร็จสิ้น!")
    print("=" * 60)


if __name__ == "__main__":
    main()
