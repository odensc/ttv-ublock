del extension.zip
rmdir /s /q .\tmp
mkdir .\tmp

copy *.js .\tmp
copy manifest.json .\tmp

powershell Compress-Archive -Path ".\tmp\*" -DestinationPath ".\extension.zip"
rmdir /s /q .\tmp