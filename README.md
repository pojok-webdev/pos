# Seed Cordova

Seed for cordova project. Uses angular-material UI framework.
Develop your project using TDD style.

## How to use

Clone this repo, rename it to `new-project-name`.

```
git clone https://github.com/louislarry/seed-cordova.git
mv seed-cordova new-project-name
cd new-project-name
npm install
npm start
```

Modify the project to your need. Start with `index.html`,
`components/home/home.ts`, `components/home/home.html`.

To add new component, modify `router.ts` and create
`components/newcomponent/newcomponent.html` and `newcomponent.ts`

## To test for ios and android

```
npm install -g cordova ios-sim ios-deploy
npm run android
npm run ios
```

## Using AWS

Webpack reads AWS credential from `~/.aws/config.json`
and make the credential available as ACCESS_KEY_ID and SECRET_ACCESS_KEY

```
{
  "accessKeyId": "xxxxxxxxxxxxx",
  "secretAccessKey": "yyyyyyyyyyyyyyy",
  "region": "us-east-1"
}
```

## Project development

`npm start` will run webpack-dev-server, open chrome, and
test continuously.


`npm test` will run mocha test.

`npm run build` builds and copy all necessary files
into the `dist` folder. Then do `http-server dist`

`npm run publish` will publish the dist folder to s3,
and will be available as https://project-name.bagubagu.com/

## License

(C) 2015 Louis Larry   
MIT License
