## mục tiêu
  deep dive with api
  Minimal APIs
## tài liệu tham khảo
  https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-6.0
  https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview?view=aspnetcore-6.0
## bài tập
viết REST API cho hệ thống quản lý note với yêu cầu như sau. - user có thể
    - đăng ký tài khoản (1 điểm)
    - đăng nhập, mỗi lần user đăng nhập thì sẽ được lưu lại lịch sử đăng nhập. (1 điểm)
- user có thể
    - thêm xóa sửa các note của mình(ngày tạo, ngày sửa, nội dung note, tạo bởi ai) (1 điểm)
- admin có thể
    - xem danh sách user trong hệ thống(username, lần cuối đăng nhập, số noted đã lưu, ngày tạo account, avatarURL) (1 điểm)
    - gán quyền admin cho user được trở thành admin.(1 điểm)
    - xem tất cả các noted theo user . (1 điểm)
    - khóa tài khoản user không cho phép thêm note(nhưng vẫn có thể đăng nhập và thay đổi avatar được) (1 điểm)
    - xuất ra file excel 10 noted được tạo mới nhất(username, noted, ngày tạo note) (1 điểm) - tự động gửi email vào lúc 8h sáng(giờ việt nam) cho toàn bộ user trong hệ thống với nội dung "xin chào chúc bạn ngày mới vui vẻ". (1 điểm)
- user upload file ảnh avatar (1 điểm) - bonus: viết unit test > 50% line coverrage + 1 điểm

- yêu cầu: sử dụng postman để document API lại
- sử dụng database và fluent api bằng code first
- dependency injection và Dependency Inversion
- sử dụng repository và unitOfWork
- sử dụng validation fluent validation để kiểm tra dữ liệu
- gợi ý:
    - sử dụng json web token để authenticate & authorization
    - sử dụng hangfire để chạy cron job.
## thử nghiệm
## kết luận