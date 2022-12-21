package com.tonkeeper.devkit

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.lifecycleScope
import com.tonkeeper.devkit.data.settingsDataStore
import com.tonkeeper.devkit.navigation.MainNavigation
import com.tonkeeper.devkit.theme.SampleTheme
import com.tonkeeper.feature.localauth.result.AuthResult
import com.tonkeeper.feature.localauth.Authenticator
import com.tonkeeper.feature.localauth.AuthenticatorBiometryError
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setEdgeToEdge()
        setScreen()

        val authenticator = Authenticator(
            activity = this,
            config = Authenticator.Config(),
            datastore = settingsDataStore
        )

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
