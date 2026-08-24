# Native file picker (Windows). Run with powershell -STA.
param(
  [string]$Filter = "Markdown (*.md)|*.md|All files (*.*)|*.*",
  [string]$Title = "选择 SKILL_ROUTING.md"
)

Add-Type -AssemblyName System.Windows.Forms | Out-Null
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Filter = $Filter
$dialog.Title = $Title
$dialog.CheckFileExists = $true
$dialog.Multiselect = $false

$result = $dialog.ShowDialog((New-Object System.Windows.Forms.Form -Property @{ TopMost = $true }))

if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $dialog.FileName) {
  [Console]::Out.Write($dialog.FileName)
  exit 0
}

exit 2
