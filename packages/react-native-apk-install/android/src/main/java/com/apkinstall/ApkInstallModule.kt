package com.apkinstall

import android.content.Intent
import android.net.Uri
import android.os.Binder
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File


class ApkInstallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private var _context: ReactApplicationContext = reactContext

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun installApk(path: String, promise: Promise) {

  }


  companion object {
    const val NAME = "ApkInstall"
  }
}
