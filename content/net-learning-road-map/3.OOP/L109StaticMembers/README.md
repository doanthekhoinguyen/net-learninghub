## mục tiêu
  Sealed Classes
  Static class
  Static Methods
  Working with a Static Method
  Extension Methods and How to Use Them
## tài liệu tham khảo
  https://code-maze.com/csharp-static-members-constants-extension-methods/
## bài tập
  ### BT1- Tạo ra lớp user có thuộc tính UserName và Password
    0. nếu lưu trữ password trần trụi vậy thì sẽ rất nguy hiểm nên chúng ta sẽ tìm cách implement extention method HashPassword()
    ```
    var tempPassword = "this is my pass word";
    tempPassword.HashPassword(); // => thay đổi giá trị của tempPassword
    ```
    1. hãy tìm cách hash password để bảo vệ tài khoản của user bằng SHA-256
    2. nâng cấp bảo mật bằng "hash with salt"
    ```
    var tempPassword = "this is my pass word";
    tempPassword.HashPassword("salt"); // => thay đổi giá trị của tempPassword
    ```
    3. mỗi user sẽ có 1 salt riêng ;))
    
  ### tạo ra 1 static class sau đó định nghĩa 1 method. trong method đó in ra câu hello static!
    - gọi hàm vừa tạo ra trong hàm main

## thử nghiệm
  - tạo ra class A với từ khóa sealed. thử kết thừa class A?
## kết luận