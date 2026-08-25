# Native folder picker (Windows). Must run with powershell -STA.
# Owner form TopMost + SetForegroundWindow so dialog appears above Electron/browser.
param(
  [string]$InitialPath = ""
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
$owner.Text = "选择文件夹"
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

$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "选择 skill 所在文件夹"
$dialog.ShowNewFolderButton = $true
try {
  $dialog.UseDescriptionForTitle = $true
} catch {}

if ($InitialPath -and (Test-Path -LiteralPath $InitialPath -PathType Container)) {
  $dialog.SelectedPath = (Resolve-Path -LiteralPath $InitialPath).Path
}

try {
  $result = $dialog.ShowDialog($owner)
  if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $dialog.SelectedPath) {
    [Console]::Out.Write($dialog.SelectedPath)
    exit 0
  }
  exit 2
} finally {
  $owner.Close()
  $owner.Dispose()
}
