// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  vapidPublicKey: 'BDA50k1xqwTDQGYFv0XLw8aNHXVyE56eZP1p3UPL2LvO6BwQmeP0NRbQ_GW8---lihmp7ncWzhv0MyzooxJhCmI',
  firebase: {
    apiKey: "AIzaSyB1BM8mPlkWOK78AfntrNZD1PPDylXYdbg",
    authDomain: "fi-go-web.firebaseapp.com",
    databaseURL: "https://fi-go-web.firebaseio.com",
    projectId: "fi-go-web",
    storageBucket: "fi-go-web.appspot.com",
    messagingSenderId: "38612462977",
    appId: "1:38612462977:web:911e393a16b59746730c80"
  },
  timer: {
    timeToWork: {hours: 7, minutes: 48},
    pause: {minutes: 30}
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
