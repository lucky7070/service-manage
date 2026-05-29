import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { colors } from "../../theme/colors";

type HtmlContentProps = {
    html: string;
};

function wrapHtml(body: string) {
    return `<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
        <style>
            ol,p,ul{margin:0 0 1em}*{box-sizing:border-box}body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.65;color:#1c1917;background:0 0}h1,h2,h3,h4{color:#111;line-height:1.3;margin-top:1.25em;margin-bottom:.5em}ol,ul{padding-left:1.25em}li{margin-bottom:.35em}a{color:#f0741a;text-decoration:none}img{max-width:100%;height:auto;border-radius:8px}table{width:100%;border-collapse:collapse;margin-bottom:1em}td,th{border:1px solid #e7e5e4;padding:8px;text-align:left}
        </style>
    </head>
    <body>
        ${body}
    </body>
</html>`;
}

export default function HtmlContent({ html }: HtmlContentProps) {
    const [height, setHeight] = useState(320);

    const onMessage = useCallback((event: { nativeEvent: { data: string } }) => {
        const next = Number(event.nativeEvent.data);
        if (Number.isFinite(next) && next > 0) setHeight(next + 50);
    }, []);

    if (!html?.trim()) return null;

    return (
        <View style={styles.wrap}>
            <WebView
                originWhitelist={["*"]}
                source={{ html: wrapHtml(html) }}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                style={[styles.webview, { height }]}
                onMessage={onMessage}
                injectedJavaScript={`
                    setTimeout(function() {
                        window.ReactNativeWebView.postMessage(String(document.body.scrollHeight));
                    }, 100);
                    true;
                `}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        overflow: "hidden",
        backgroundColor: colors.background,
    },
    webview: {
        backgroundColor: "transparent",
        elevation: 0,
    },
});
