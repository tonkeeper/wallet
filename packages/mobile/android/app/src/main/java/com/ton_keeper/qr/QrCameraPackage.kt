package com.ton_keeper.qr

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext

class QrCameraPackage : ReactPackage {

    override fun createNativeModules(context: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf()
    }

    override fun createViewManagers(context: ReactApplicationContext) =
        mutableListOf(ReactQrCameraManager(context))
}
