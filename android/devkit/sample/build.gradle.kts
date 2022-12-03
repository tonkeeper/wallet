plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.tonkeeper.devkit"
    compileSdk = 33

    defaultConfig {
        applicationId = "com.tonkeeper.devkit"
        minSdk = 23
        targetSdk = 33
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
}

dependencies {
    implementation(project(":libs-ton:crypto"))
    implementation(project(":libs-ton:mnemonic"))

    implementation("androidx.core:core-ktx:1.9.0")
    implementation("androidx.appcompat:appcompat:1.5.1")

    implementation("com.google.android.material:material:1.7.0")
    implementation("androidx.compose.material3:material3:1.0.1")

    val compose = "1.3.2"
    implementation("androidx.compose.ui:ui:$compose")
    implementation("androidx.compose.ui:ui-util:$compose")
    implementation("androidx.compose.ui:ui-text:$compose")
    implementation("androidx.compose.ui:ui-tooling-preview:$compose")
    implementation("androidx.compose.foundation:foundation:$compose")
    implementation("androidx.compose.foundation:foundation-layout:$compose")
    implementation("androidx.compose.animation:animation:$compose")
    implementation("androidx.compose.material:material-icons-core:$compose")
    implementation("androidx.compose.material:material-icons-extended:$compose")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}