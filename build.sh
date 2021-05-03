VERSION=$(jq -r ".version" common/manifest.json)

mkdir -p builds/$VERSION
zip -r builds/$VERSION/build-$VERSION.zip ./common/*
