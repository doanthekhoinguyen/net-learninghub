## mục tiêu
  Class là gì? Member trong class?
  instance là gì
  Constructors là gì?
  Overloading là gì?
  Constructors Overloading là gì?
  Private Constructor
  partial class
  new operator
  Anonymous Classes
## tài liệu tham khảo
  https://code-maze.com/csharp-classes-constructors/
## bài tập
  ### BT1: định nghĩa ra class Student
    - có 2 thuộc tính FirstName và LastName
    - có 3 hàm khởi tạo,
      - constructor không có tham số
      - constructor không có 1 tham số là FirstName(tự động gán giá trị vào property tương ứng)
      - constructor không có 1 tham số lần lượt là FirstName và LastName(tự động gán giá trị vào property tương ứng)
    - hàm GetFullName() sau khi thực hiện thì trả về chuỗi nối FirstName và LastName có dấu cách ở giữa
    - tự tạo ra 5 bạn sinh viên bất kì
    - gọi hàm GetFullName() và in kết quả ra màn hình console.

  ### BT2 Tạo ra 1 class QuanLySinhVien
    - lớp này sẽ quản lý sinh viên
    - tạo ra những hàm thêm, xóa, sửa, sắp xếp sinh viên trong lớp này.
    - thực hiện mỗi hàm bên trên 5 lần.

## thử nghiệm
- chứng minh instance là kiểu reference type
- c# constructor chaining
- sử dụng partial class để tách hàm GetFullName() ra file khác mà không ảnh hưởng đến kết quả chạy của chương trình
## kết luận