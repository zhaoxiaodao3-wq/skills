# Native file picker (Windows). Run with powershell -STA.
# Owner form TopMost + SetForegroundWindow so dialog appears above Electron/browser.
param(
  [string]$Filter = "Markdown (*.md)|*.md|All files (*.*)|*.*",
  [string]$Title = "选择 SKILL_ROUTING.md"
)

Add-Type -AssemblyName System.Windows.Forms | Out-Null
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class Win32Fg {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool AllowSetForegroundWindow(int dwProcessId);
  public const int ASFW_ANY = -1;
}
"@

[void][Win32Fg]::AllowSetForegroundWindow([Win32Fg]::ASFW_ANY)

$owner = New-Object System.Windows.Forms.Form
$owner.Text = $Title
$owner.ShowInTaskbar = $false
$owner.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedToolWindow
$owner.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
$owner.Location = New-Object System.Drawing.Point(-32000, -32000)
$owner.Size = New-Object System.Drawing.Size(1, 1)
$owner.Opacity = 0
$owner.TopMost = $true
$owner.Show()
$owner.Activate()
[void][Win32Fg]::BringWindowToTop($owner.Handle)
[void][Win32Fg]::SetForegroundWindow($owner.Handle)

$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Filter = $Filter
$dialog.Title = $Title
$dialog.CheckFileExists = $true
$dialog.Multiselect = $false

try {
  $result = $dialog.ShowDialog($owner)
  if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $dialog.FileName) {
    [Console]::Out.Write($dialog.FileName)
    exit 0
  }
  exit 2
} finally {
  $owner.Close()
  $owner.Dispose()
}
