package com.example.birthdayscrap

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import java.io.InputStream

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WebView.setWebContentsDebuggingEnabled(true)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = true
            settings.allowContentAccess = true
            settings.databaseEnabled = true
            
            webChromeClient = object : android.webkit.WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                    android.util.Log.d("WebViewConsole", "[${consoleMessage?.messageLevel()}] ${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}")
                    return true
                }
            }

            webViewClient = object : WebViewClient() {
                // Intercept all requests to solve Next.js absolute asset and routing paths
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest
                ): WebResourceResponse? {
                    val url = request.url.toString()
                    val prefix = "https://appassets.androidplatform.net/"
                    val prefixWithoutSlash = "https://appassets.androidplatform.net"
                    
                    if (url.startsWith(prefix) || url == prefixWithoutSlash) {
                        var path = if (url == prefixWithoutSlash) "" else url.substring(prefix.length)
                        
                        // Strip query parameters and fragment identifiers
                        path = path.substringBefore('?').substringBefore('#')
                        
                        // Strip trailing slash
                        if (path.endsWith("/")) {
                            path = path.substring(0, path.length - 1)
                        }

                        // Default to index.html for root
                        if (path.isEmpty()) {
                            path = "index.html"
                        }
                        
                        // Handle Next.js page links (e.g., /timeline -> timeline.html)
                        if (!path.contains(".") && !path.endsWith("/")) {
                            path = "$path.html"
                        }
                        
                        try {
                            val assetManager = this@MainActivity.assets
                            val inputStream: InputStream = assetManager.open("out/$path")
                            
                            val pathLower = path.lowercase()
                            // Map extensions to appropriate MIME types
                            val mimeType = when {
                                pathLower.endsWith(".html") -> "text/html"
                                pathLower.endsWith(".css") -> "text/css"
                                pathLower.endsWith(".js") -> "application/javascript"
                                pathLower.endsWith(".png") -> "image/png"
                                pathLower.endsWith(".jpg") || pathLower.endsWith(".jpeg") -> "image/jpeg"
                                pathLower.endsWith(".webp") -> "image/webp"
                                pathLower.endsWith(".svg") -> "image/svg+xml"
                                pathLower.endsWith(".woff") -> "font/woff"
                                pathLower.endsWith(".woff2") -> "font/woff2"
                                pathLower.endsWith(".json") -> "application/json"
                                else -> "application/octet-stream"
                            }
                            
                            return WebResourceResponse(mimeType, "UTF-8", inputStream)
                        } catch (e: Exception) {
                            // File not found in assets, let webview load from web or fail gracefully
                        }
                    }
                    return null
                }

                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest
                ): Boolean {
                    return false
                }
            }
        }

        // Intercept back button clicks to support WebView back navigation
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        setContentView(webView)

        // Load Next.js static output main entry file
        webView.loadUrl("https://appassets.androidplatform.net/")
    }
}
