package com.apkinstall

import android.content.Intent
import android.net.Uri
import android.os.Binder
import android.os.Build
import androidx.core.content.FileProvider
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
    val toInstall: File = File(path)
    if (Build.VERSION.SDK_INT >= 24) {
      val callingPackageName: String? = _context.getPackageManager().getNameForUid(Binder.getCallingUid())
      val apkUri = FileProvider.getUriForFile(_context, "$callingPackageName.fileprovider", toInstall)
      val intent = Intent(Intent.ACTION_INSTALL_PACKAGE)
      intent.setData(apkUri)
      intent.setFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      _context.startActivity(intent)
    } else {
      val apkUri = Uri.fromFile(toInstall)
      val intent = Intent(Intent.ACTION_VIEW)
      intent.setDataAndType(apkUri, "application/vnd.android.package-archive")
      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      _context.startActivity(intent)
    }
  }


  companion object {
    const val NAME = "ApkInstall"
  }
}
