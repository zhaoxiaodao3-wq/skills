# Native folder picker (Windows). Must run with powershell -STA.
param(
  [string]$InitialPath = ""
)

Add-Type -AssemblyName System.Windows.Forms | Out-Null
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "选择 skill 所在文件夹"
$dialog.ShowNewFolderButton = $true
try {
  $dialog.UseDescriptionForTitle = $true
} catch {}

if ($InitialPath -and (Test-Path -LiteralPath $InitialPath -PathType Container)) {
  $dialog.SelectedPath = (Resolve-Path -LiteralPath $InitialPath).Path
}

$result = $dialog.ShowDialog((New-Object System.Windows.Forms.Form -Property @{ TopMost = $true }))

if ($result -eq [System.Windows.Forms.DialogResult]::OK -and $dialog.SelectedPath) {
  [Console]::Out.Write($dialog.SelectedPath)
  exit 0
}

exit 2
