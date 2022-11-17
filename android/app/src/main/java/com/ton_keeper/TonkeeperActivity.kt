package com.ton_keeper;

import android.os.Build
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler
import com.ton_keeper.fragment.PasscodeFragment

class TonkeeperActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)

        setEdgeToEdge()
        setContentView(R.layout.activity_main)
        setRootFragment()
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    private fun setRootFragment() {
        supportFragmentManager
            .beginTransaction()
            .replace(R.id.root, PasscodeFragment())
            .commit();
    }

    override fun onBackPressed() {
        val app = application as ReactApplication
        val host = app.reactNativeHost
        if (host.hasInstance()) {
            host.reactInstanceManager.onBackPressed()
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
}
