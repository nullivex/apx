@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\apex\app\index" %*
) ELSE (
  node  "%~dp0\..\apex\app\index" %*
)
