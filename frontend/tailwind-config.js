/* Tailwind theme (brand colours, fonts, shadows, animations).
   Used by the Tailwind CDN script in index.html. */
/* guarded so the page still loads if the CDN is blocked/offline */
if (window.tailwind) tailwind.config = {
  "theme": {
    "extend": {
      "colors": {
        "ivory": {
          "2": "#F6EFE7",
          "DEFAULT": "#FBF7F2"
        },
        "pink": {
          "DEFAULT": "#F6DEE3",
          "soft": "#FAEDEF"
        },
        "rose": {
          "DEFAULT": "#B76E79",
          "deep": "#A05762"
        },
        "gold": {
          "DEFAULT": "#C6A15B",
          "soft": "#EFE3CE"
        },
        "ink": {
          "DEFAULT": "#3B302C",
          "soft": "#7A6A63"
        },
        "line": "#EADDD4",
        "cream": "#FFFDFB",
        "lowstock": {
          "bg": "#FBEAE5",
          "text": "#B3543D"
        }
      },
      "fontFamily": {
        "serif": [
          "var(--font-fraunces)",
          "Fraunces",
          "serif"
        ],
        "sans": [
          "var(--font-jost)",
          "Jost",
          "sans-serif"
        ]
      },
      "borderRadius": {
        "card": "22px"
      },
      "boxShadow": {
        "soft": "0 18px 40px rgba(59,48,44,.09)",
        "lift": "0 18px 40px rgba(59,48,44,.12)",
        "rose": "0 10px 24px rgba(183,110,121,.28)",
        "menu": "0 24px 60px rgba(59,48,44,.14)",
        "drawer": "-20px 0 50px rgba(59,48,44,.15)"
      },
      "letterSpacing": {
        "brand": "0.22em",
        "wide2": "0.16em"
      },
      "keyframes": {
        "fadeup": {
          "from": {
            "opacity": "0",
            "transform": "translateY(18px)"
          },
          "to": {
            "opacity": "1",
            "transform": "none"
          }
        },
        "floaty": {
          "0%,100%": {
            "transform": "translateY(0)"
          },
          "50%": {
            "transform": "translateY(-10px)"
          }
        },
        "marquee": {
          "from": {
            "transform": "translateX(0)"
          },
          "to": {
            "transform": "translateX(-50%)"
          }
        },
        "pop": {
          "0%": {
            "transform": "scale(.6)",
            "opacity": "0"
          },
          "70%": {
            "transform": "scale(1.08)"
          },
          "100%": {
            "transform": "scale(1)",
            "opacity": "1"
          }
        },
        "shimmer": {
          "from": {
            "backgroundPosition": "-400px 0"
          },
          "to": {
            "backgroundPosition": "400px 0"
          }
        },
        "slide-in": {
          "from": {
            "transform": "translateX(105%)"
          },
          "to": {
            "transform": "translateX(0)"
          }
        }
      },
      "animation": {
        "fadeup": "fadeup .7s ease both",
        "floaty": "floaty 5s ease-in-out infinite",
        "marquee": "marquee 60s linear infinite",
        "pop": "pop .4s ease",
        "shimmer": "shimmer 1.4s infinite linear"
      }
    }
  }
};
