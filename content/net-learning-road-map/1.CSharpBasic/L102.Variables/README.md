## mục tiêu
  nắm được kiểu dữ liệu cơ bản công dụng của từng cái, khoảng giá trị của từng kiểu dữ liệu.
- Data Types
  - values types: bool, char, decimal, double, float, int, uint, nint, nuint, long, ulong, short, ushort, byte, sbyte
    hay dùng: bool, char, decimal, double, float, int
    xem thêm: uint, nint, nuint, long, ulong, short, ushort, byte, sbyte

  - reference types:
    hay dùng: object, string
    xem thêm: dynamic

- Biến là gì (Variable)
- so sánh tham chếu và tham trị (Value and Reference Types)
- chuyển đổi kiểu dữ liệu (Type Conversion)
  - Implicit Conversion in C#
  - Explicit Conversion in C#
  - Using the Convert Class in C#
- nhập/xuất dữ liệu từ màn hình console (Input and Output in C# Console)
- từ khóa ```var```
- Constants
- sizeof operator
Literal
Data Type
Variables
How computer store variables
numeric types
datatype alias
sizeof Operator
Value type vs Referencess type
Stack vs Heap
ReferenceEquals method(how to compair reference type)
StackOverFlow vs OutOfMemory
Constants
keyword “var”
Implicit conversions
Explicit conversions (casts)
Conversions with helper classes(ToInt32, ToString, Parse, TryParse)
Boxing and Unboxing
## tài liệu tham khảo
  coding convention https://github.com/ktaranov/naming-convention/blob/master/C%23%20Coding%20Standards%20and%20Naming%20Conventions.md
  https://code-maze.com/csharp-data-types-variables/
  https://code-maze.com/csharp-linear-structures-input-output/
## bài tập
  ### BT1-declare variables
    - với mỗi kiểu dữ liệu tự đặt ra 5 biến có kiểu dữ liệu như sau(bool, char, decimal, double, float, int, string)
    => tổng cộng có 50 biến và 7 kiểu dữ liệu khác nhau:

    - thay đổi giá trị của các biến đã được tạo trước đó thành một giá trị mới.
    - in ra màn hình console các giá trị đó

  ### BT2 chuyển đổi kiểu dữ liệu (bool, char, decimal, double, float, int, string)
    => chuyển đổi kiểu dữ liệu từ char có giá trị là 'c' sang kiểu int
    => chuyển đổi kiểu dữ liệu từ int có giá trị là 100 sang kiểu char
    và cứ thế chuyển đổi toàn bộ kiểu dữ liệu này sang kiểu dữ liệu khác từ bool => char => decimal => double in ra màn hình xem chuyện gì sảy ra
  
  ### BT3 nhập xuất dữ liệu
    => nhập dữ liệu từ bàn phím sau đó lưu vào biến => in ra màn hình
    nhập vào tên, tuổi và in ra 2 câu dưới
    - in ra "My name's {tên của bạn}.";
    - in ra "I'm {tuổi của bạn} years old";
    - thử cố tình nhập sai dữ liệu giữa số và chữ xem chuyện gì sảy ra
  ### BT4 từ khóa var
    khởi tạo 10 biến có kiểu dữ liệu khác nhau bằng từ khóa var.
    
  ### BT5 const
    - khởi tạo 10 biến có kiểu dữ liệu khác nhau là hằng số;

## thử nghiệm
- nếu như khởi tạo biến bình thường mà không gán giá trị thì giá trị mặc định là gì?
- chuyện gì sảy ra nếu như khởi tạo bằng biến var mà không gán giá trị?
- chuyện gì sảy ra nếu chúng ta cố gắng thay đổi biến có kiểu là const
```
const int test = 10;
test = 3;
```

- chuyện gì xảy ra nếu lưu giá trị lớn hơn kiểu dữ liệu? chạy thử chương trình bên dưới
```
int test = 2_000_000_000;
int test2 = 1_000_000_000 + test;
Console.WriteLine(test2);
```

## kết luận