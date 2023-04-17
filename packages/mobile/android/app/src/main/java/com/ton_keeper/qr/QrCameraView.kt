package com.ton_keeper.qr

import android.content.Context
import android.util.AttributeSet
import android.view.View
import com.google.zxing.qrcode.QRCodeReader

class QrCameraView @JvmOverloads constructor(
    context: Context,
    attr: AttributeSet? = null,
    defStyleAttr: Int = 0,
    defStyleRes: Int = 0
) : View(context, attr, defStyleAttr, defStyleRes) {

    private val qrReader: QRCodeReader = QRCodeReader()

    init {
    }

}