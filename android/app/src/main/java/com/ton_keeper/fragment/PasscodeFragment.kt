package com.ton_keeper.fragment

import android.os.Bundle
import android.view.View
import android.widget.Button
import androidx.fragment.app.Fragment
import com.ton_keeper.R

class PasscodeFragment : Fragment(R.layout.fragment_passcode) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val button = view.findViewById<Button>(R.id.btn_correct_passcode)
        button.setOnClickListener { openWallet() }
    }

    private fun openWallet() {
        requireActivity().supportFragmentManager
            .beginTransaction()
            .replace(R.id.root, ReactComponent.Wallet.createFragment())
            .commit()
    }
}
