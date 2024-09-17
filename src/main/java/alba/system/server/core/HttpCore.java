package alba.system.server.core;

import alba.system.server.utils.Logger;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpMessage;
import org.apache.http.NameValuePair;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Getter
@Setter
public class HttpCore {
    public static final String STATEFULLPAGE_COOKIE_KEY = "ugur";
    private static final String LOG_UNIT = "HttpCore";
    @Getter
    private static final StringDictionary<HttpCore> activePages = new StringDictionary();
    private static List<HttpCore.UrlMatcher> urlMatchers = new ArrayList();
    private static StringDictionary<HttpCore> statefullPages = new StringDictionary();
    private static boolean absoluteUrl = false;
    private static boolean hasAbsoluteUrl = false;
    private boolean isStatefull = false;
    private String statefullKey = RecordCore.b2H(RecordCore.guid());
    public String route = "";


    public static boolean hasAbsoluteUri() {
        return hasAbsoluteUrl;
    }
    public static void add(String uri, HttpCore page) {
        addPage(uri, page, false);
    }

    public static void add(HttpCore.UrlMatcher matcher) {
        addPage(matcher, false);
    }

    public static void addPage(HttpCore.UrlMatcher matcher, boolean absoluteUri) {
        if (matcher != null) {
            urlMatchers.add(matcher);
            if (absoluteUri) {
                HttpCore.absoluteUrl = absoluteUri;
                matcher.getPage().hasAbsoluteUrl = true;
            }
        }
    }
    public static void addPage(String uri, Class<? extends HttpCore> pageClass) {
        addPage(uri, pageClass, false);
    }

    public static void addPage(String uri, Class<? extends HttpCore> pageClass, boolean absolute) {
        try {
            Constructor<? extends HttpCore> constructor = pageClass.getConstructor();
            HttpCore page = constructor.newInstance();
            page.setStatefull(true);
            addPage(uri, page, absolute);
        } catch (Exception e) {
            Logger.Error(e, "Can not create page instance: " + pageClass.getName(), true);
        }
    }
    public static void addPage(String uri, HttpCore page, boolean absoluteUri) {
        activePages.computeIfAbsent(uri, k -> {
            if (absoluteUri) {
                HttpCore.absoluteUrl = absoluteUri;
                page.hasAbsoluteUrl = true;
            }
            return page;
        });
    }


    public static HttpCore getPage(String uri) {
        HttpCore page = (HttpCore) activePages.get(uri);
        if (page == null) {
            Iterator it = urlMatchers.iterator();
            while (it.hasNext()) {
                HttpCore.UrlMatcher matcher = (HttpCore.UrlMatcher) it.next();
                if (matcher.isMatch(uri)) {
                    return matcher.getPage();
                }
            }
        }
        return page;
    }

    public static HttpCore getStatefullPage(HttpCore page, HttpCore.ActivePageParameters params) {
        if (params.cookies.containsKey(STATEFULLPAGE_COOKIE_KEY)) {
            String key = ((HttpCore.ActivePageCookie) params.cookies.get("spck")).value;
            if (statefullPages.containsKey(key)) {
                return (HttpCore) statefullPages.get(key);
            } else {
                try {
                    HttpCore newPage = (HttpCore) page.getClass().newInstance();
                    newPage.setStatefull(true);
                    statefullPages.put((String) newPage.statefullKey, newPage);
                    return newPage;
                } catch (Exception e) {
                    Logger.Error(e, "Can not create statefull page instance: " + page.getClass().getName(), true);
                    return null;
                }
            }
        } else {
            try {
                HttpCore newPage = (HttpCore) page.getClass().newInstance();
                newPage.setStatefull(true);
                statefullPages.put((String) newPage.statefullKey, newPage);
                return newPage;
            } catch (Exception e) {
                Logger.Error(e, "Can not create statefull page instance without cookie: " + page.getClass().getName(), true);
                return null;
            }
        }
    }

    public static StringDictionary<HttpCore.ActivePageCookie> collectCookies(HttpMessage httpMessage) {
        StringDictionary<HttpCore.ActivePageCookie> output = new StringDictionary();
        Header[] cookies = httpMessage.getHeaders("Cookie");
        for (int i = 0; i < cookies.length; ++i) {
            Header h = cookies[i];
            HeaderElement[] cHeaderElements = h.getElements();
            for (int k = 0; k < cHeaderElements.length; ++k) {
                HeaderElement he = cHeaderElements[k];
                NameValuePair[] nvps = he.getParameters();
                if (nvps.length > 0) {
                    for (int j = 0; j < nvps.length; ++j) {
                        NameValuePair nvp = nvps[j];
                        HttpCore.ActivePageCookie cookie = new HttpCore.ActivePageCookie(nvp.getName(), nvp.getValue(), -1);
                        output.put((String) cookie.getKey(), cookie);
                    }
                }
                HttpCore.ActivePageCookie cookie = new HttpCore.ActivePageCookie(he.getName(), he.getValue(), -1);
                output.put((String) cookie.getKey(), cookie);
            }
        }
        return output;
    }
    public HttpCore.ActivePageResponse run2R(HttpCore.ActivePageParameters parameters) {
        HttpCore.ActivePageResponse output = new HttpCore.ActivePageResponse(this.run(parameters),"");
        return output;
    }
    public String run(HttpCore.ActivePageParameters parameters) {
        return "OK";
    }

    @Getter
    @Setter
    public static class ActivePageCookie {
        private final String key;
        private final String value;
        private final int expires;
        public ActivePageCookie(String key, String value, int expiresInSeconds) {
            this.key = key;
            this.value = value;
            this.expires = expiresInSeconds;
        }
    }

    @Getter
    @Setter
    public static class ActivePageParameters {
        public String pageData = "";
        public String query = "";
        public StringDictionary<String> queryValues = new StringDictionary();
        public StringDictionary<String> formValues = new StringDictionary();
        public StringDictionary<PostFile> files = new StringDictionary();
        public StringDictionary<HttpCore.ActivePageCookie> cookies = new StringDictionary();
        public String uri = "";
        public String clientIP = "";
        public HttpMessage httpMessage;
        public Object secretData;
    }

    @Getter
    @Setter
    public static class ActivePageResponse {
        private String responseText = "";
        private byte[] responseOutput = null;
        private StringDictionary<HttpCore.ActivePageCookie> cookies = new StringDictionary();
        private String contentType = "text/html";
        private String title = "";
        private int cacheAge;
        private List<String> headers = new ArrayList();
        public ActivePageResponse(String responseText, String title_ ) {
            setResponseText(responseText);
            if(!title_.isEmpty()){
                setTitle(title_);
            }
        }
        public ActivePageResponse(String responseText, String contentType, String title_) {
            setResponseText(responseText);
            setContentType(contentType);
            if(!title_.isEmpty()){
                setTitle(title_);
            }
        }

        public ActivePageResponse(byte[] responseOutput) {
            setResponseOutput(responseOutput);
        }


        public void addCookie(HttpCore.ActivePageCookie cookie) {
            getCookies().put(cookie.getKey(), cookie);
        }

        public void addHeader(String header) {
            getHeaders().add(header);
        }

        public String getHeader() {
            StringBuilder output = new StringBuilder();
            if (this.responseOutput != null) {
                output.append("HTTP/1.0 200 OK\r\nContent-Length: ").append(getResponseOutput().length)
                        .append("\r\nCache-Control: ").append(this.cacheAge == 0 ? "no-cache" : "max-age=" + this.cacheAge + ", public")
                        .append("\r\nContent-Type: ").append(this.contentType).append("; charset=utf-8\r\n");
            } else {
                int length = getResponseText().length();
                try {
                    length = getResponseText().getBytes("UTF8").length;
                } catch (Exception e) {
                    Logger.Error(e, "Can not get byte length of response text", true);
                }
                output.append("HTTP/1.0 200 OK\r\nContent-Length: ").append(length)
                        .append("\r\nCache-Control: ").append(this.cacheAge == 0 ? "no-cache" : "max-age=" + this.cacheAge + ", public")
                        .append("\r\nContent-Type: ").append(this.contentType).append("; charset=utf-8\r\n");
            }

            if (!this.cookies.isEmpty()) {
                for (HttpCore.ActivePageCookie cookie : this.cookies.values()) {
                    output.append("Set-Cookie: ").append(cookie.getKey()).append("=").append(cookie.getValue())
                            .append("; Path=/; Max-Age=").append(cookie.getExpires()).append("\r\n");
                }
            }
            return output.toString() + "\r\n";
        }

        public void setCacheAge(int days) {
            this.cacheAge = days * 24 * 3600;
        }
    }

    @Getter
    @Setter
    public abstract static class UrlMatcher {
        private HttpCore page;
        public UrlMatcher(HttpCore page) {
            setPage(page);
        }
        public abstract boolean isMatch(String e);
    }

}
