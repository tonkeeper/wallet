package com.tonkeeper.devkit

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.ui.Modifier
import androidx.core.view.WindowCompat
import androidx.fragment.app.FragmentActivity
import com.tonkeeper.devkit.navigation.MainNavigation
import com.tonkeeper.devkit.theme.SampleTheme

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setEdgeToEdge()
        setScreen()
    }

    private fun setScreen() {
        setContent {
            SampleTheme {
                Scaffold(
                    modifier = Modifier,
                    content = { MainNavigation(it) }
                )
            }
        }
    }

    private fun setEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
    }
}
