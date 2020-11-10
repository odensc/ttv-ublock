rm extension.zip
rm -rf ./tmp
mkdir tmp

cp *.js ./tmp
cp manifest.json ./tmp

cd ./tmp
zip -r ../extension.zip *
cd ../

rm -rf ./tmp