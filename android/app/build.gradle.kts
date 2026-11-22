plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
android {
    namespace = "com.bubblesaro.katha"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.bubblesaro.katha"
        minSdk = 24
        targetSdk = 34
        versionCode = (System.getenv("KATHA_VERSION_CODE") ?: "1").toInt()
        versionName = System.getenv("KATHA_VERSION") ?: "1.0.0"
    }
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("KATHA_KS") ?: "../katha.jks")
            storePassword = System.getenv("KATHA_KS_PASS") ?: ""
            keyAlias = "kathora"
            keyPassword = System.getenv("KATHA_KS_PASS") ?: ""
        }
    }
    buildTypes { release { isMinifyEnabled = false; signingConfig = signingConfigs.getByName("release") } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.webkit:webkit:1.11.0")
}
