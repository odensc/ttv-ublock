rm extension.zip
rm -rf ./tmp
mkdir tmp

cp *.js ./tmp
cp manifest.json ./tmp

zip ./tmp/* ./extension.zip
rm -rf ./tmp