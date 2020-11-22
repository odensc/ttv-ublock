VERSION=$(jq -r ".version" common/manifest.json)

mkdir -p tmp/chrome
mkdir -p tmp/firefox
mkdir -p builds/$VERSION

cd tmp/chrome

# Chrome
cp -r ../../common/* .
cp -r ../../chrome/* .
zip -r ../../builds/$VERSION/chrome-$VERSION.zip ./*

cd ../firefox

# Firefox

cp -r ../../common/* .
cp -r ../../firefox/* .
zip -r ../../builds/$VERSION/firefox-$VERSION.zip ./*
