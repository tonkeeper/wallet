package com.ton_keeper.qr

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class ReactQrCameraManager(
    private val callerContext: ReactApplicationContext
) : SimpleViewManager<QrCameraView>() {

    override fun createViewInstance(reactContext: ThemedReactContext): QrCameraView {
        return QrCameraView(reactContext)
    }

    override fun getName(): String = REACT_CLASS

    companion object {
        const val REACT_CLASS = "RCTQrCameraView"
    }
}