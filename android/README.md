## Requirements

The most straightforward way to build and run this application is to:

- Install Android Studio: https://developer.android.com/studio/install
- Clone the repository. You have two options:
    - Use the `Project from version control` in Android Studio, or
    - Use the `git clone` command and import it into Android Studio
- Install React Native: https://reactnative.dev/docs/environment-setup
- Reverse ADB port (you may need add ADB to PATH): `yarn adb_reverse`
- Build and run. You have two options:
    - Build and run the app directly in Android Studio
    - Build and run viad yarn: `yarn android`

## Structure
Main android app is in [android/app](android/app)
All libraries and sample is in [android/app/devkit](android/app/devkit)


[Sample in devkit](android/app/devkit/sample) runs without react native dependencies, you can use it as test environment

## DevKit (Tonkeeper android SDK) dependencies
For adding dependecy from devkit you need:
- In app settings.gradle include devkit build
```
includeBuild("devkit")
```

- In app settings.gradle add module dependecy with path
```
include(":libs-ton:crypto")
project(":libs-ton:crypto").projectDir = file("./devkit/libs-ton/crypto")
```

- Include dependency in app/build.gradle
```
implementation(project(":libs-ton:crypto"))
```