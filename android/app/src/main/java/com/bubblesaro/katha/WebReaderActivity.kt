package com.bubblesaro.katha

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

/** Opens a free story or textbook inside Katha (no external browser). */
class WebReaderActivity : AppCompatActivity() {
    private lateinit var web: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val d = resources.displayMetrics.density
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setBackgroundColor(Color.parseColor("#F3E7D3")) }
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#2A1D12")); setPadding((12 * d).toInt(), (10 * d).toInt(), (12 * d).toInt(), (10 * d).toInt())
        }
        val back = TextView(this).apply { text = "‹  Back"; textSize = 16f; setTextColor(Color.parseColor("#E0A96D")); setPadding(0, 0, (16 * d).toInt(), 0); setOnClickListener { finish() } }
        val title = TextView(this).apply { text = intent.getStringExtra("title") ?: ""; textSize = 16f; setTextColor(Color.parseColor("#F3E7D3")); maxLines = 1; ellipsize = android.text.TextUtils.TruncateAt.END }
        bar.addView(back); bar.addView(title, LinearLayout.LayoutParams(0, -2, 1f))
        val progress = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply { max = 100 }
        web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.settings.builtInZoomControls = true; web.settings.displayZoomControls = false
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest) = false
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, p: Int) { progress.progress = p; progress.alpha = if (p >= 100) 0f else 1f }
        }
        root.addView(bar, LinearLayout.LayoutParams(MATCH_PARENT, -2))
        root.addView(progress, LinearLayout.LayoutParams(MATCH_PARENT, (3 * d).toInt()))
        root.addView(web, LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))
        setContentView(root)
        if (savedInstanceState == null) web.loadUrl(intent.getStringExtra("url") ?: "about:blank") else web.restoreState(savedInstanceState)
    }

    override fun onSaveInstanceState(outState: Bundle) { super.onSaveInstanceState(outState); web.saveState(outState) }
    @Suppress("DEPRECATION", "OVERRIDE_DEPRECATION") override fun onBackPressed() { if (web.canGoBack()) web.goBack() else super.onBackPressed() }
}
