package com.ton_keeper

import android.content.Intent
import android.content.res.Configuration
import android.os.Build
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.bridge.Callback
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener

class TonkeeperActivity : AppCompatActivity(),
    DefaultHardwareBackBtnHandler,
    PermissionAwareActivity {

    private val reactNativeHost: ReactNativeHost
        get() {
            val app = application as ReactApplication
            return app.reactNativeHost
        }

    private var permissionListener: PermissionListener? = null
    private var permissionsCallback: Callback? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_tonkeeper)
        setRootFragment()
    }

    override fun onResume() {
        super.onResume()
        if (permissionsCallback != null) {
            permissionsCallback?.invoke()
            permissionsCallback = null
        }
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    private fun setRootFragment() {
        supportFragmentManager
            .beginTransaction()
            .replace(R.id.root, ReactComponent.Wallet.createFragment())
            .commit()
    }

    override fun onBackPressed() {
        if (reactNativeHost.hasInstance()) {
            reactNativeHost.reactInstanceManager.onBackPressed()
            return
        }
        super.onBackPressed()
    }

    override fun invokeDefaultOnBackPressed() {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
            if (!moveTaskToBack(false)) {
                super.onBackPressed()
            }
            return
        }
        super.onBackPressed()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        if (reactNativeHost.hasInstance()) {
            reactNativeHost.reactInstanceManager.onNewIntent(intent)
            return
        }
    }

    override fun requestPermissions(
        permissions: Array<String>,
        requestCode: Int,
        listener: PermissionListener?
    ) {
        permissionListener = listener
        requestPermissions(permissions, requestCode)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        permissionsCallback = Callback {
            val listener = permissionListener ?: return@Callback
            val remove = listener.onRequestPermissionsResult(requestCode, permissions, grantResults)
            if (remove) permissionListener = null
        }
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        if (reactNativeHost.hasInstance()) {
            reactNativeHost.reactInstanceManager.onConfigurationChanged(this, newConfig)
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (reactNativeHost.hasInstance()) {
            reactNativeHost.reactInstanceManager.onWindowFocusChange(hasFocus)
        }
    }
}