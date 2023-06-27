package com.apkinstall;

import androidx.annotation.NonNull;

import android.net.Uri;
import android.os.Build;
import androidx.core.content.FileProvider;
import android.content.Intent;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.IOException;

@ReactModule(name = ApkInstallModule.NAME)
public class ApkInstallModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ApkInstall";
  private ReactApplicationContext _context = null;
  public ApkInstallModule(ReactApplicationContext reactContext) {
    super(reactContext);
    _context = reactContext;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }


    @ReactMethod
    public void installApk(String path) throws IOException {
      String cmd = "chmod 777 " + path;
      try {
        Runtime.getRuntime().exec(cmd);
      } catch (Exception e) {
        e.printStackTrace();
      }
      File file = new File(path);
      Intent intent = new Intent(Intent.ACTION_VIEW);
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      if (Build.VERSION.SDK_INT>= Build.VERSION_CODES.N) {
        Uri apkUri =
          FileProvider.getUriForFile(_context, _context.getApplicationContext().getPackageName() + ".provider", file);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
      } else {
        intent.setDataAndType(Uri.parse("file://" + path), "application/vnd.android.package-archive");
      }
      _context.startActivity(intent);
    }
}
