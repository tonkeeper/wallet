package com.tonkeeper.devkit

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.core.view.WindowCompat
import com.tonkeeper.ton.mnemonic.Mnemonic
import com.tonkeeper.ton.mnemonic.Wordlist

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setEdgeToEdge()
        setContentView(R.layout.activity_main)
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }
}
