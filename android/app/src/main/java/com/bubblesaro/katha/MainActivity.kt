package com.bubblesaro.katha

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import java.util.Locale

/** Katha: the web app in a WebView, with Android's own text-to-speech (English, Hindi and Telugu voices). */
class MainActivity : AppCompatActivity() {
    private lateinit var web: WebView
    private var tts: TextToSpeech? = null
    private var ttsReady = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val loader = WebViewAssetLoader.Builder().addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this)).build()
        web = WebView(this)
        setContentView(web)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.mediaPlaybackRequiresUserGesture = false
        web.setBackgroundColor(0xFF0C0716.toInt())
        web.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? = loader.shouldInterceptRequest(request.url)
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.host == "appassets.androidplatform.net") return false
                startActivity(Intent(Intent.ACTION_VIEW, u)); return true
            }
        }
        web.addJavascriptInterface(Bridge(), "KathaAndroid")
        tts = TextToSpeech(this) { ttsReady = it == TextToSpeech.SUCCESS }
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(id: String?) {}
            override fun onDone(id: String?) { runOnUiThread { web.evaluateJavascript("window.__ttsDone&&__ttsDone()", null) } }
            @Suppress("OVERRIDE_DEPRECATION") override fun onError(id: String?) { runOnUiThread { web.evaluateJavascript("window.__ttsDone&&__ttsDone()", null) } }
        })
        if (savedInstanceState == null) web.loadUrl("https://appassets.androidplatform.net/assets/www/app/index.html")
        else web.restoreState(savedInstanceState)
    }

    inner class Bridge {
        @JavascriptInterface fun speak(text: String, lang: String, rate: Double) {
            val t = tts ?: return
            if (!ttsReady) return
            val loc = when (lang) { "hi" -> Locale("hi", "IN"); "te" -> Locale("te", "IN"); else -> Locale("en", "IN") }
            if (t.setLanguage(loc) < 0) t.setLanguage(Locale.ENGLISH)
            t.setSpeechRate(rate.toFloat())
            t.speak(text, TextToSpeech.QUEUE_FLUSH, null, "k" + System.currentTimeMillis())
        }
        @JavascriptInterface fun stop() { tts?.stop() }
        @JavascriptInterface fun openUrl(url: String) { runOnUiThread { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } }
    }

    override fun onSaveInstanceState(outState: Bundle) { super.onSaveInstanceState(outState); web.saveState(outState) }
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION") override fun onBackPressed() { if (web.canGoBack()) web.goBack() else super.onBackPressed() }
    override fun onPause() { tts?.stop(); super.onPause() }
    override fun onDestroy() { tts?.shutdown(); super.onDestroy() }
}
