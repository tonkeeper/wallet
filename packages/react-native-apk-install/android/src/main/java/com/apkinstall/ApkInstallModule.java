package com.apkinstall;

import androidx.annotation.NonNull;

import android.app.PendingIntent;
import android.app.admin.DevicePolicyManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.IntentSender;
import android.content.pm.PackageInfo;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
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

      File file = new File(path);
      InputStream in = new FileInputStream(file);

      PackageInstaller packageInstaller = _context.getPackageManager().getPackageInstaller();
      PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(
        PackageInstaller.SessionParams.MODE_FULL_INSTALL);
      params.setAppPackageName("com.jbig.tonkeeper");

      int sessionId = packageInstaller.createSession(params);
      PackageInstaller.Session session = packageInstaller.openSession(sessionId);
      OutputStream out = session.openWrite("COSU", 0, -1);
      byte[] buffer = new byte[65536];
      int c;
      while ((c = in.read(buffer)) != -1) {
        out.write(buffer, 0, c);
      }
      session.fsync(out);
      in.close();
      out.close();

      session.commit(IntentSender.NULL);
      session.close();


    }
}
