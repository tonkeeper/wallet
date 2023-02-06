package com.ton_keeper

import android.os.Bundle
import androidx.fragment.app.Fragment
import com.facebook.react.ReactFragment

sealed interface ReactComponent {

    val name: String
    val arguments: Bundle

    object Wallet : ReactComponent {
        override val name: String = "ton_keeper"
        override val arguments: Bundle = Bundle.EMPTY
    }
}

fun ReactComponent.createFragment(): Fragment {
    return with(ReactFragment.Builder()) {
        setComponentName(name)
        setLaunchOptions(arguments)
        build()
    }
}
