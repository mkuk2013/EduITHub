import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Edu IT Hub Academy",
    template: "%s | Edu IT Hub Academy",
  },
  description:
    "Edu IT Hub Academy — live online IT courses in web development, programming, design, marketing and AI. Learn practical skills from expert instructors.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 1. Prevent extensions from adding bis_* attributes
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, val) {
                    if (typeof name === 'string' && name.indexOf('bis_') === 0) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };

                  var origSetAttrNS = Element.prototype.setAttributeNS;
                  Element.prototype.setAttributeNS = function(ns, name, val) {
                    if (typeof name === 'string' && name.indexOf('bis_') === 0) {
                      return;
                    }
                    return origSetAttrNS.apply(this, arguments);
                  };

                  // 2. Suppress console.error if React reports bis_skin_checked mismatch
                  var origConsoleError = console.error;
                  console.error = function() {
                    for (var i = 0; i < arguments.length; i++) {
                      var arg = arguments[i];
                      if (typeof arg === 'string' && (arg.indexOf('bis_skin_checked') !== -1 || arg.indexOf('bis_') !== -1)) {
                        return;
                      }
                    }
                    return origConsoleError.apply(this, arguments);
                  };

                  // 3. Clean up any existing elements
                  var clean = function(el) {
                    if (el && el.removeAttribute) {
                      if (el.hasAttribute('bis_skin_checked')) el.removeAttribute('bis_skin_checked');
                      if (el.hasAttribute('bis_frame_id')) el.removeAttribute('bis_frame_id');
                    }
                  };
                  var obs = new MutationObserver(function(muts) {
                    for (var i = 0; i < muts.length; i++) {
                      var m = muts[i];
                      if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf('bis_') === 0) {
                        m.target.removeAttribute(m.attributeName);
                      }
                      if (m.addedNodes) {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node.nodeType === 1) {
                            clean(node);
                            if (node.querySelectorAll) {
                              var els = node.querySelectorAll('[bis_skin_checked], [bis_frame_id]');
                              for (var k = 0; k < els.length; k++) clean(els[k]);
                            }
                          }
                        }
                      }
                    }
                  });
                  obs.observe(document.documentElement, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked', 'bis_frame_id']
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased" suppressHydrationWarning>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
