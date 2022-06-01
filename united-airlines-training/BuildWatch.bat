@echo off
echo delete cache files
del /F /S /Q wwwroot
echo cache files cleaned
cd ClientApp
echo generate Angular files
@ng build --watch=true
@cd ..
echo files generated