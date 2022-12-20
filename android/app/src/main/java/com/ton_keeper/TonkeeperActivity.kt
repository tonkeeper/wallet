package com.ton_keeper

import android.os.Build
import android.os.Bundle
import androidx.core.view.WindowCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler

class TonkeeperActivity : FragmentActivity(), DefaultHardwareBackBtnHandler {

    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        super.onCreate(savedInstanceState)

        setEdgeToEdge()
        setContentView(R.layout.activity_tonkeeper)
        setRootFragment()
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    private fun setRootFragment() {
        supportFragmentManager
            .beginTransaction()
            .replace(R.id.root, ReactComponent.Wallet.createFragment())
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