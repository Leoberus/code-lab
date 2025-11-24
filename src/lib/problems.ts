// src/lib/problems.ts
export type TestCase = {
    id: string;
    input: string;
    expected: string;
};

export type Problem = {
    id: string;
    slug: string;
    title: string;
    description: string;
    starterCode: string;
    tests: TestCase[];
    difficulty: "easy" | "medium" | "hard";
    tags?: string[];
};

export type Lab = {
    id: string;
    slug: string;
    title: string;
    description: string;
    problems: Problem[];
};

export const labs: Lab[] = [
    {
        id: "lab01",
        slug: "lab-01-basic-operators",
        title: "Lab 01 - Basic Operators",
        description: "ฝึกพื้นฐานเรื่องการรับค่า การแสดงผล และตัวดำเนินการพื้นฐานใน C++ (เน้น format ของ output ให้ตรงกับที่กำหนดเป๊ะ ๆ)",
        problems: [
            {
                id: "lab01-p1",
                slug: "sum-two-integers",
                title: "Sum of Two Integers",
                description: `
เขียนโปรแกรมรับจำนวนเต็ม 2 ค่า แล้วแสดงผลรวมของทั้งสองค่า

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม 2 ค่า a และ b คั่นด้วยช่องว่าง 1 ช่อง
  เช่น "3 5" หรือ "10 2"

รูปแบบ Output:
- แสดงผลรวมของ a + b เป็นจำนวนเต็ม 1 ค่า
- พิมพ์ตัวเลขเพียงค่าเดียว ตามด้วย newline 1 ครั้ง
- ห้ามมีข้อความอื่น เช่น "Result =" หรือ space เกิน

ข้อกำหนดเพิ่มเติม:
- a และ b เป็นจำนวนเต็มในช่วงประมาณ -10^9 ถึง 10^9
- ให้ถือว่า input ถูกต้องเสมอ
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    // TODO: พิมพ์ผลรวมของ a + b ตามที่กำหนด
    return 0;
}`,
                tests: [
                    { id: "t1", input: "3 5", expected: "8" },
                    { id: "t2", input: "10 2", expected: "12" },
                    { id: "t3", input: "-5 7", expected: "2" }
                ],
                difficulty: "easy",
                tags: ["operators", "io"]
            },
            {
                id: "lab01-p2",
                slug: "area-of-rectangle",
                title: "Area of Rectangle",
                description: `
เขียนโปรแกรมคำนวณพื้นที่สี่เหลี่ยมผืนผ้า

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม 2 ค่า w และ h (ความกว้างและความสูง)
- แต่ละค่าคั่นด้วยช่องว่าง 1 ช่อง
- w > 0 และ h > 0

รูปแบบ Output:
- แสดงค่า w * h เป็นจำนวนเต็ม 1 ค่า ตามด้วย newline 1 ครั้ง
- ไม่ต้องพิมพ์ข้อความอื่น

ตัวอย่าง:
Input: 3 4
Output: 12
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int w, h;
    cin >> w >> h;
    // TODO: พิมพ์พื้นที่ w*h เป็นจำนวนเต็มเพียงค่าเดียว
    return 0;
}`,
                tests: [
                    { id: "t1", input: "3 4", expected: "12" },
                    { id: "t2", input: "5 5", expected: "25" },
                    { id: "t3", input: "10 2", expected: "20" }
                ],
                difficulty: "easy",
                tags: ["operators"]
            },
            {
                id: "lab01-p3",
                slug: "fahrenheit-to-celsius",
                title: "Fahrenheit to Celsius",
                description: `
เขียนโปรแกรมแปลงอุณหภูมิจากฟาเรนไฮต์ (F) เป็นองศาเซลเซียส (C) โดยใช้สูตร

    C = (F - 32) × 5 / 9

ให้คำนวณและแสดงค่า C เป็นจำนวนเต็ม โดย **ปัดเศษทศนิยมทิ้ง** (ใช้ integer arithmetic ปกติ)

รูปแบบ Input:
- บรรทัดเดียว ประกอบด้วยจำนวนเต็ม F

รูปแบบ Output:
- แสดงค่า C เป็นจำนวนเต็ม 1 ค่า ตามด้วย newline 1 ครั้ง
- ไม่ต้องมีข้อความอื่น

ตัวอย่าง:
- Input: 32  → Output: 0
- Input: 50  → Output: 10
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int F;
    cin >> F;
    // TODO: แปลงเป็นเซลเซียสแบบจำนวนเต็ม ปัดเศษทศนิยมทิ้ง
    return 0;
}`,
                tests: [
                    { id: "t1", input: "32", expected: "0" },
                    { id: "t2", input: "50", expected: "10" },
                    { id: "t3", input: "68", expected: "20" }
                ],
                difficulty: "easy",
                tags: ["operators"]
            },
            {
                id: "lab01-p4",
                slug: "last-digit",
                title: "Last Digit of Number",
                description: `
เขียนโปรแกรมรับจำนวนเต็มบวก 1 ค่า แล้วพิมพ์ "หลักหน่วย" ของจำนวนนั้น

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็มบวก n (n >= 0)

รูปแบบ Output:
- แสดงหลักหน่วยของ n (เลข 0–9) หนึ่งค่า ตามด้วย newline 1 ครั้ง
- ไม่ต้องมีข้อความอื่น

ข้อกำหนด:
- ให้ใช้ตัวดำเนินการ % (modulus)
- ไม่ต้องสนใจเลขติดลบในโจทย์นี้ (input รับประกันว่าเป็นค่าศูนย์หรือบวก)

ตัวอย่าง:
- Input: 123 → Output: 3
- Input: 89  → Output: 9
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: พิมพ์หลักหน่วยของ n (n % 10)
    return 0;
}`,
                tests: [
                    { id: "t1", input: "123", expected: "3" },
                    { id: "t2", input: "89", expected: "9" },
                    { id: "t3", input: "0", expected: "0" }
                ],
                difficulty: "easy",
                tags: ["operators"]
            },
            {
                id: "lab01-p5",
                slug: "average-three-numbers",
                title: "Average of 3 Numbers",
                description: `
เขียนโปรแกรมคำนวณค่าเฉลี่ยของจำนวนเต็ม 3 ค่า โดยผลลัพธ์เป็นจำนวนเต็ม (ปัดทศนิยมทิ้ง)

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม 3 ค่า a, b, c
- คั่นด้วยช่องว่าง 1 ช่อง

รูปแบบ Output:
- แสดงค่าเฉลี่ย (a + b + c) / 3 โดยใช้การหารแบบจำนวนเต็ม
- แสดงเพียงตัวเลข 1 ค่า ตามด้วย newline 1 ครั้ง

ตัวอย่าง:
- Input: 1 2 3    → (1+2+3)/3 = 2   → Output: 2
- Input: 10 20 31 → (10+20+31)/3 = 61/3 = 20 (ปัดเศษทิ้ง) → Output: 20
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int a, b, c;
    cin >> a >> b >> c;
    // TODO: คำนวณค่าเฉลี่ยแบบจำนวนเต็ม แล้วพิมพ์ผลลัพธ์
    return 0;
}`,
                tests: [
                    { id: "t1", input: "1 2 3", expected: "2" },
                    { id: "t2", input: "10 20 30", expected: "20" },
                    { id: "t3", input: "10 20 31", expected: "20" }
                ],
                difficulty: "easy",
                tags: ["operators"]
            }
        ]
    }
    ,
    {
        id: "lab02",
        slug: "lab-02-conditions",
        title: "Lab 02 - Conditions",
        description: "ฝึกใช้คำสั่งเงื่อนไข IF, ELSE, ELSE IF, และ SWITCH-CASE (เน้น output ให้ตรงตามตัวอักษรที่กำหนด)",
        problems: [
            {
                id: "lab02-p1",
                slug: "positive-or-negative",
                title: "Positive or Negative",
                description: `
เขียนโปรแกรมตรวจสอบประเภทของจำนวนเต็ม โดยแบ่งเป็น 3 กรณี:
- ถ้ามากกว่า 0 ให้แสดงคำว่า "positive"
- ถ้าน้อยกว่า 0 ให้แสดงคำว่า "negative"
- ถ้าเท่ากับ 0 ให้แสดงคำว่า "zero"

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม n หนึ่งค่า

รูปแบบ Output:
- แสดงคำว่า "positive" หรือ "negative" หรือ "zero"
- ใช้ตัวอักษรตัวพิมพ์เล็กทั้งหมด (case-sensitive)
- ตามด้วย newline 1 ครั้ง
- ห้ามมีข้อความอื่น หรือเว้นวรรคเกิน

ตัวอย่าง:
- Input: 5   → Output: positive
- Input: -2  → Output: negative
- Input: 0   → Output: zero
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ if-else ตรวจค่า n แล้วพิมพ์ positive, negative หรือ zero
    return 0;
}`,
                tests: [
                    { id: "t1", input: "5", expected: "positive" },
                    { id: "t2", input: "-2", expected: "negative" },
                    { id: "t3", input: "0", expected: "zero" }
                ],
                difficulty: "easy",
                tags: ["if"]
            },
            {
                id: "lab02-p2",
                slug: "even-or-odd",
                title: "Even or Odd",
                description: `
เขียนโปรแกรมตรวจสอบว่าจำนวนเต็มเป็นเลขคู่ (even) หรือเลขคี่ (odd)

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม n หนึ่งค่า

รูปแบบ Output:
- ถ้า n เป็นเลขคู่ (หาร 2 ลงตัว) ให้แสดงคำว่า "even"
- ถ้า n เป็นเลขคี่ ให้แสดงคำว่า "odd"
- ใช้ตัวพิมพ์เล็กทั้งหมด ตามด้วย newline 1 ครั้ง

ตัวอย่าง:
- Input: 4 → Output: even
- Input: 7 → Output: odd
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ if-else เช็ค n%2 == 0 หรือไม่ แล้วพิมพ์ even/odd
    return 0;
}`,
                tests: [
                    { id: "t1", input: "4", expected: "even" },
                    { id: "t2", input: "7", expected: "odd" },
                    { id: "t3", input: "0", expected: "even" }
                ],
                difficulty: "easy",
                tags: ["if"]
            },
            {
                id: "lab02-p3",
                slug: "max-of-three",
                title: "Find the Maximum of Three",
                description: `
เขียนโปรแกรมรับจำนวนเต็ม 3 ค่า แล้วหาค่าที่มากที่สุดจากทั้งสามค่า

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม 3 ค่า a, b, c

รูปแบบ Output:
- แสดงค่ามากที่สุดเพียงค่าเดียว ตามด้วย newline 1 ครั้ง
- หากมีค่ามากที่สุดซ้ำกันหลายตัว ให้แสดงค่าจำนวนนั้นเพียงครั้งเดียว (เช่น a=5, b=5, c=3 → แสดง 5)

ข้อกำหนด:
- แนะนำให้ใช้ if-else-if หรือ nested if
- ไม่ต้องพิมพ์ข้อความอื่น เช่น "max ="

ตัวอย่าง:
- Input: 3 7 5 → Output: 7
- Input: 10 2 9 → Output: 10
- Input: 5 5 3 → Output: 5
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int a, b, c;
    cin >> a >> b >> c;
    // TODO: ใช้ if-else-if / nested if หาเลขที่มีค่ามากที่สุด แล้วพิมพ์ค่าดังกล่าว
    return 0;
}`,
                tests: [
                    { id: "t1", input: "3 7 5", expected: "7" },
                    { id: "t2", input: "10 2 9", expected: "10" },
                    { id: "t3", input: "5 5 3", expected: "5" }
                ],
                difficulty: "medium",
                tags: ["if-else", "comparison"]
            },
            {
                id: "lab02-p4",
                slug: "grade-calculation",
                title: "Grade Calculation",
                description: `
เขียนโปรแกรมแปลงคะแนนสอบ (0–100) เป็นเกรดตัวอักษร ตามเงื่อนไขต่อไปนี้:

- A: คะแนนตั้งแต่ 80 ถึง 100
- B: คะแนนตั้งแต่ 70 ถึง 79
- C: คะแนนตั้งแต่ 60 ถึง 69
- D: คะแนนตั้งแต่ 50 ถึง 59
- F: คะแนนน้อยกว่า 50 (0–49)

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม score หนึ่งค่า (0 ≤ score ≤ 100)

รูปแบบ Output:
- แสดงเกรดตัวอักษรหนึ่งตัว: "A", "B", "C", "D" หรือ "F"
- ตามด้วย newline 1 ครั้ง
- ใช้ตัวอักษรพิมพ์ใหญ่เท่านั้น (case-sensitive)

ตัวอย่าง:
- Input: 85 → Output: A
- Input: 74 → Output: B
- Input: 42 → Output: F
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int score;
    cin >> score;
    // TODO: ใช้ if-else-if แปลงคะแนนเป็นเกรดตัวอักษร
    return 0;
}`,
                tests: [
                    { id: "t1", input: "85", expected: "A" },
                    { id: "t2", input: "70", expected: "B" },
                    { id: "t3", input: "60", expected: "C" },
                    { id: "t4", input: "50", expected: "D" },
                    { id: "t5", input: "42", expected: "F" }
                ],
                difficulty: "medium",
                tags: ["if-else"]
            },
            {
                id: "lab02-p5",
                slug: "weekday-switch",
                title: "Weekday Name (Switch)",
                description: `
เขียนโปรแกรมรับตัวเลข 1–7 แล้วแสดงชื่อวันเป็นภาษาอังกฤษ โดยใช้คำสั่ง switch-case

การแมปหมายเลขวัน:
- 1 → Monday
- 2 → Tuesday
- 3 → Wednesday
- 4 → Thursday
- 5 → Friday
- 6 → Saturday
- 7 → Sunday

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม d หนึ่งค่า (1–7)

รูปแบบ Output:
- แสดงชื่อวันตรงตามข้างบน 1 คำ ตามด้วย newline 1 ครั้ง
- ตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่ ตัวอื่นเป็นตัวพิมพ์เล็ก (เช่น "Monday", "Friday")
- ในโจทย์นี้ให้ถือว่า input อยู่ในช่วง 1–7 เสมอ ไม่ต้องเช็คกรณีอื่น

ตัวอย่าง:
- Input: 1 → Output: Monday
- Input: 5 → Output: Friday
- Input: 7 → Output: Sunday
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int d;
    cin >> d;
    // TODO: ใช้ switch-case แปลงตัวเลข d เป็นชื่อวันตามที่กำหนด
    return 0;
}`,
                tests: [
                    { id: "t1", input: "1", expected: "Monday" },
                    { id: "t2", input: "5", expected: "Friday" },
                    { id: "t3", input: "7", expected: "Sunday" }
                ],
                difficulty: "medium",
                tags: ["switch", "conditions"]
            }
        ]
    },
    {
        id: "lab03",
        slug: "lab-03-for-loops",
        title: "Lab 03 - For Loops",
        description: "ฝึกการใช้คำสั่งวนซ้ำ for loop พื้นฐาน (เน้นการวนรอบตามจำนวนที่กำหนด)",
        problems: [
            {
                id: "lab03-p1",
                slug: "print-1-to-n",
                title: "Print 1 to N",
                description: `
เขียนโปรแกรมรับจำนวนเต็มบวก n แล้วพิมพ์ตัวเลขตั้งแต่ 1 ถึง n

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็มบวก n (n >= 1)

รูปแบบ Output:
- แสดงตัวเลขตั้งแต่ 1 ถึง n
- แต่ละตัวเลขคั่นด้วยช่องว่าง 1 ช่อง (ตัวสุดท้ายไม่ต้องมีช่องว่างต่อท้ายก็ได้ หรือจะมีก็ได้ แล้วแต่สะดวก แต่ต้องมี newline ปิดท้าย)
- หรือจะพิมพ์บรรทัดละตัวก็ได้ (แต่โจทย์มักนิยมเว้นวรรค) -> เอาเป็นเว้นวรรคละกัน
- เพื่อความง่าย: พิมพ์ตัวเลขแล้วตามด้วยเว้นวรรคทุกตัวได้เลย หรือจะพิมพ์เว้นวรรคคั่นก็ได้
- **ข้อกำหนดของโจทย์นี้**: ให้พิมพ์ตัวเลขแล้วตามด้วยช่องว่าง 1 ช่องทุกตัว (รวมถึงตัวสุดท้าย) แล้วขึ้นบรรทัดใหม่ 1 ครั้ง

ตัวอย่าง:
- Input: 5
- Output: 1 2 3 4 5 
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ for loop พิมพ์ 1 ถึง n
    return 0;
}`,
                tests: [
                    { id: "t1", input: "5", expected: "1 2 3 4 5 " },
                    { id: "t2", input: "1", expected: "1 " },
                    { id: "t3", input: "10", expected: "1 2 3 4 5 6 7 8 9 10 " }
                ],
                difficulty: "easy",
                tags: ["loop", "for"]
            },
            {
                id: "lab03-p2",
                slug: "sum-1-to-n",
                title: "Sum 1 to N",
                description: `
เขียนโปรแกรมหาผลรวมของตัวเลขตั้งแต่ 1 ถึง n

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็มบวก n (n >= 1)

รูปแบบ Output:
- แสดงผลรวมเป็นจำนวนเต็ม 1 ค่า
- ตามด้วย newline 1 ครั้ง

ตัวอย่าง:
- Input: 5  → 1+2+3+4+5 = 15 → Output: 15
- Input: 10 → Output: 55
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ for loop หาผลรวม 1 ถึง n
    return 0;
}`,
                tests: [
                    { id: "t1", input: "5", expected: "15" },
                    { id: "t2", input: "10", expected: "55" },
                    { id: "t3", input: "100", expected: "5050" }
                ],
                difficulty: "easy",
                tags: ["loop", "math"]
            },
            {
                id: "lab03-p3",
                slug: "multiplication-table",
                title: "Multiplication Table",
                description: `
เขียนโปรแกรมพิมพ์สูตรคูณแม่ n (ตั้งแต่แม่ n x 1 ถึง n x 12)

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็มบวก n

รูปแบบ Output:
- แสดง 12 บรรทัด
- แต่ละบรรทัดแสดงรูปแบบ "n x i = result"
- โดย n คือแม่สูตรคูณ, i คือตัวคูณ (1-12), result คือผลลัพธ์
- เว้นวรรคให้ถูกต้องตามตัวอย่าง

ตัวอย่าง:
Input: 2
Output:
2 x 1 = 2
2 x 2 = 4
...
2 x 12 = 24
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ for loop พิมพ์สูตรคูณแม่ n
    return 0;
}`,
                tests: [
                    {
                        id: "t1",
                        input: "2",
                        expected: "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20\n2 x 11 = 22\n2 x 12 = 24"
                    },
                    {
                        id: "t2",
                        input: "12",
                        expected: "12 x 1 = 12\n12 x 2 = 24\n12 x 3 = 36\n12 x 4 = 48\n12 x 5 = 60\n12 x 6 = 72\n12 x 7 = 84\n12 x 8 = 96\n12 x 9 = 108\n12 x 10 = 120\n12 x 11 = 132\n12 x 12 = 144"
                    }
                ],
                difficulty: "easy",
                tags: ["loop"]
            },
            {
                id: "lab03-p4",
                slug: "even-numbers-to-n",
                title: "Even Numbers to N",
                description: `
เขียนโปรแกรมพิมพ์เลขคู่ทั้งหมดตั้งแต่ 1 ถึง n

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็มบวก n

รูปแบบ Output:
- แสดงเลขคู่ทุกตัวที่ <= n
- คั่นด้วยช่องว่าง 1 ช่อง (รวมถึงตัวสุดท้าย)
- ตามด้วย newline 1 ครั้ง

ตัวอย่าง:
- Input: 10 → Output: 2 4 6 8 10 
- Input: 7  → Output: 2 4 6 
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: ใช้ for loop พิมพ์เลขคู่ตั้งแต่ 1 ถึง n
    return 0;
}`,
                tests: [
                    { id: "t1", input: "10", expected: "2 4 6 8 10 " },
                    { id: "t2", input: "7", expected: "2 4 6 " },
                    { id: "t3", input: "1", expected: "" }
                ],
                difficulty: "medium",
                tags: ["loop", "if"]
            },
            {
                id: "lab03-p5",
                slug: "factorial",
                title: "Factorial",
                description: `
เขียนโปรแกรมคำนวณหาค่า Factorial ของ n (n!)
โดย n! = 1 * 2 * 3 * ... * n
(กำหนดให้ 0! = 1)

รูปแบบ Input:
- บรรทัดเดียว มีจำนวนเต็ม n (0 <= n <= 12) 
*หมายเหตุ: n สูงสุด 12 เพราะ 13! จะเกินค่า int

รูปแบบ Output:
- แสดงค่า n! เป็นจำนวนเต็ม 1 ค่า
- ตามด้วย newline 1 ครั้ง

ตัวอย่าง:
- Input: 5 → Output: 120
- Input: 0 → Output: 1
`.trim(),
                starterCode: `#include <iostream>
using namespace std;
int main() {
    int n;
    cin >> n;
    // TODO: คำนวณ n!
    return 0;
}`,
                tests: [
                    { id: "t1", input: "5", expected: "120" },
                    { id: "t2", input: "3", expected: "6" },
                    { id: "t3", input: "0", expected: "1" }
                ],
                difficulty: "medium",
                tags: ["loop", "math"]
            }
        ]
    }
];
