## mục tiêu
directory(GetCurrentDirectory(), CreateDirectory(), Exists(), GetDirectories, GetFiles())
Files(Exists(), ReadAllText(), WriteAllText())
  Creating Objects for StreamWriter and StreamReader
  StreamReader Methods
  StreamWriter Methods
  Using Block
## tài liệu tham khảo
  https://code-maze.com/csharp-basics-streamwriter-streamreader/
  https://code-maze.com/csharp-basics-file-directory/
## bài tập
  
1. Create a program that attempts to read a file that does not exist. Catch the FileNotFoundException and print out an error message that says "File not found".


2. Create a program that divides two numbers, but if the second number is zero, catch the DivideByZeroException and print out an error message that says "Cannot divide by zero".


3. Create a program that tries to convert a string to an integer, but if the string cannot be converted, catch the FormatException and print out an error message that says "Invalid input".


4. Create a program that reads user input, but if the input is empty, catch the ArgumentNullException and print out an error message that says "Input cannot be empty".

5. Create a program that creates an array, but if the array size is negative, catch the ArgumentOutOfRangeException and print out an error message that says "Array size must be positive".


6. Create a program that reads a text file and converts the contents to upper case, but if the file cannot be read, catch the IOException and print out an error message that says "Cannot read file".


7. Create a program that performs a calculation, but if the result is too large to fit in an integer, catch the OverflowException and print out an error message that says "Result too large".

Note: These exercises are intended to be done using try-catch blocks, where the code inside the try block is expected to throw the specified exception. The expected output is the error message that should be printed out when the exception is caught.

## thử nghiệm
## kết luận