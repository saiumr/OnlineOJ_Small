'use strict';
(function (p) {
    "object" == typeof exports && "object" == typeof module ? p(require("../../lib/codemirror")) : "function" == typeof define && define.amd ? define(["../../lib/codemirror"], p) : p(CodeMirror)
})(function (p) {
    function D(a, b, c, d, f, l) {
        this.indented = a;
        this.column = b;
        this.type = c;
        this.info = d;
        this.align = f;
        this.prev = l
    }

    function z(a, b, c, d) {
        var I = a.indented;
        a.context && "statement" == a.context.type && "statement" != c && (I = a.context.indented);
        return a.context = new D(I, b, c, d, null, a.context)
    }

    function w(a) {
        var b = a.context.type;
        if (")" == b || "]" == b || "}" == b) a.indented = a.context.indented;
        return a.context = a.context.prev
    }

    function J(a, b, c) {
        if ("variable" == b.prevToken || "type" == b.prevToken || /\S(?:[^- ]>|[*\]])\s*$|\*$/.test(a.string.slice(0, c)) || b.typeAtEndOfLine && a.column() == a.indentation()) return !0
    }

    function K(a) {
        for (;;) {
            if (!a || "top" == a.type) return !0;
            if ("}" == a.type && "namespace" != a.prev.info) return !1;
            a = a.prev
        }
    }

    function d(a) {
        var b = {};
        a = a.split(" ");
        for (var c = 0; c < a.length; ++c) b[a[c]] = !0;
        return b
    }

    function n(a, b) {
        return "function" === typeof a ?
            a(b) : a.propertyIsEnumerable(b)
    }

    function q(a) {
        return n(E, a) || /.+_t$/.test(a)
    }

    function m(a, b) {
        if (!b.startOfLine) return !1;
        for (var c, d = null; c = a.peek();) {
            if ("\\" == c && a.match(/^.$/)) {
                d = m;
                break
            } else if ("/" == c && a.match(/^\/[\/\*]/, !1)) break;
            a.next()
        }
        b.tokenize = d;
        return "meta"
    }

    function x(a, b) {
        return "type" == b.prevToken ? "type" : !1
    }

    function r(a) {
        return !a || 2 > a.length || "_" != a[0] ? !1 : "_" == a[1] || a[1] !== a[1].toLowerCase()
    }

    function h(a) {
        a.eatWhile(/[\w\.']/);
        return "number"
    }

    function t(a, b) {
        a.backUp(1);
        if (a.match(/(R|u8R|uR|UR|LR)/)) {
            var c =
                a.match(/"([^\s\\()]{0,16})\(/);
            if (!c) return !1;
            b.cpp11RawStringDelim = c[1];
            b.tokenize = A;
            return A(a, b)
        }
        if (a.match(/(u8|u|U|L)/)) return a.match(/["']/, !1) ? "string" : !1;
        a.next();
        return !1
    }

    function B(a, b) {
        for (var c; null != (c = a.next());)
            if ('"' == c && !a.eat('"')) {
                b.tokenize = null;
                break
            } return "string"
    }

    function A(a, b) {
        var c = b.cpp11RawStringDelim.replace(/[^\w\s]/g, "\\$&");
        a.match(new RegExp(".*?\\)" + c + '"')) ? b.tokenize = null : a.skipToEnd();
        return "string"
    }

    function k(a, b) {
        function c(a) {
            if (a)
                for (var b in a) a.hasOwnProperty(b) &&
                    d.push(b)
        }
        "string" == typeof a && (a = [a]);
        var d = [];
        c(b.keywords);
        c(b.types);
        c(b.builtin);
        c(b.atoms);
        d.length && (b.helperType = a[0], p.registerHelper("hintWords", a[0], d));
        for (var f = 0; f < a.length; ++f) p.defineMIME(a[f], b)
    }

    function F(a, b) {
        for (var c = !1; !a.eol();) {
            if (!c && a.match('"""')) {
                b.tokenize = null;
                break
            }
            c = "\\" == a.next() && !c
        }
        return "string"
    }

    function y(a) {
        return function (b, c) {
            for (var d; d = b.next();)
                if ("*" == d && b.eat("/"))
                    if (1 == a) {
                        c.tokenize = null;
                        break
                    } else return c.tokenize = y(a - 1), c.tokenize(b, c);
            else if ("/" ==
                d && b.eat("*")) return c.tokenize = y(a + 1), c.tokenize(b, c);
            return "comment"
        }
    }

    function G(a) {
        return function (b, d) {
            for (var c = !1, f, l = !1; !b.eol();) {
                if (!a && !c && b.match('"')) {
                    l = !0;
                    break
                }
                if (a && b.match('"""')) {
                    l = !0;
                    break
                }
                f = b.next();
                !c && "$" == f && b.match("{") && b.skipTo("}");
                c = !c && "\\" == f && !a
            }
            if (l || !a) d.tokenize = null;
            return "string"
        }
    }

    function C(a) {
        return function (b, d) {
            for (var c = !1, f, l = !1; !b.eol();) {
                if (!c && b.match('"') && ("single" == a || b.match('""'))) {
                    l = !0;
                    break
                }
                if (!c && b.match("``")) {
                    u = C(a);
                    l = !0;
                    break
                }
                f = b.next();
                c = "single" ==
                    a && !c && "\\" == f
            }
            l && (d.tokenize = null);
            return "string"
        }
    }
    p.defineMode("clike", function (a, b) {
        function d(a, b) {
            var d = a.next();
            if (v[d]) {
                var c = v[d](a, b);
                if (!1 !== c) return c
            }
            if ('"' == d || "'" == d) return b.tokenize = k(d), b.tokenize(a, b);
            if (E.test(d)) return g = d, null;
            if (F.test(d)) {
                a.backUp(1);
                if (a.match(G)) return "number";
                a.next()
            }
            if ("/" == d) {
                if (a.eat("*")) return b.tokenize = f, f(a, b);
                if (a.eat("/")) return a.skipToEnd(), "comment"
            }
            if (M.test(d)) {
                for (; !a.match(/^\/[\/*]/, !1) && a.eat(M););
                return "operator"
            }
            a.eatWhile(N);
            if (O)
                for (; a.match(O);) a.eatWhile(N);
            a = a.current();
            return n(t, a) ? (n(r, a) && (g = "newstatement"), n(y, a) && (H = !0), "keyword") : n(u, a) ? "type" : n(x, a) || P && P(a) ? (n(r, a) && (g = "newstatement"), "builtin") : n(A, a) ? "atom" : "variable"
        }

        function k(a) {
            return function (b, d) {
                for (var c = !1, e, L = !1; null != (e = b.next());) {
                    if (e == a && !c) {
                        L = !0;
                        break
                    }
                    c = !c && "\\" == e
                }
                if (L || !c && !B) d.tokenize = null;
                return "string"
            }
        }

        function f(a, b) {
            for (var d = !1, c; c = a.next();) {
                if ("/" == c && d) {
                    b.tokenize = null;
                    break
                }
                d = "*" == c
            }
            return "comment"
        }

        function l(a, d) {
            b.typeFirstDefinitions && a.eol() && K(d.context) &&
                (d.typeAtEndOfLine = J(a, d, a.pos))
        }
        var h = a.indentUnit,
            m = b.statementIndentUnit || h,
            q = b.dontAlignCalls,
            t = b.keywords || {},
            u = b.types || {},
            x = b.builtin || {},
            r = b.blockKeywords || {},
            y = b.defKeywords || {},
            A = b.atoms || {},
            v = b.hooks || {},
            B = b.multiLineStrings,
            C = !1 !== b.indentStatements,
            O = b.namespaceSeparator,
            E = b.isPunctuationChar || /[\[\]{}\(\),;:\.]/,
            F = b.numberStart || /[\d\.]/,
            G = b.number || /^(?:0x[a-f\d]+|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)(u|ll?|l|f)?/i,
            M = b.isOperatorChar || /[+\-*&%=<>!?|\/]/,
            N = b.isIdentifierChar || /[\w\$_\xa1-\uffff]/,
            P = b.isReservedIdentifier || !1,
            g, H;
        return {
            startState: function (a) {
                return {
                    tokenize: null,
                    context: new D((a || 0) - h, 0, "top", null, !1),
                    indented: 0,
                    startOfLine: !0,
                    prevToken: null
                }
            },
            token: function (a, c) {
                var e = c.context;
                a.sol() && (null == e.align && (e.align = !1), c.indented = a.indentation(), c.startOfLine = !0);
                if (a.eatSpace()) return l(a, c), null;
                g = H = null;
                var f = (c.tokenize || d)(a, c);
                if ("comment" == f || "meta" == f) return f;
                null == e.align && (e.align = !0);
                if (";" == g || ":" == g || "," == g && a.match(/^\s*(?:\/\/.*)?$/, !1))
                    for (;
                        "statement" == c.context.type;) w(c);
                else if ("{" == g) z(c, a.column(), "}");
                else if ("[" == g) z(c, a.column(), "]");
                else if ("(" == g) z(c, a.column(), ")");
                else if ("}" == g) {
                    for (;
                        "statement" == e.type;) e = w(c);
                    for ("}" == e.type && (e = w(c));
                        "statement" == e.type;) e = w(c)
                } else g == e.type ? w(c) : C && (("}" == e.type || "top" == e.type) && ";" != g || "statement" == e.type && "newstatement" == g) && z(c, a.column(), "statement", a.current());
                "variable" == f && ("def" == c.prevToken || b.typeFirstDefinitions && J(a, c, a.start) && K(c.context) && a.match(/^\s*\(/, !1)) && (f = "def");
                v.token && (e = v.token(a, c, f),
                    void 0 !== e && (f = e));
                "def" == f && !1 === b.styleDefs && (f = "variable");
                c.startOfLine = !1;
                c.prevToken = H ? "def" : f || g;
                l(a, c);
                return f
            },
            indent: function (a, c) {
                if (a.tokenize != d && null != a.tokenize || a.typeAtEndOfLine) return p.Pass;
                var e = a.context,
                    f = c && c.charAt(0),
                    g = f == e.type;
                "statement" == e.type && "}" == f && (e = e.prev);
                if (b.dontIndentStatements)
                    for (;
                        "statement" == e.type && b.dontIndentStatements.test(e.info);) e = e.prev;
                if (v.indent && (a = v.indent(a, e, c, h), "number" == typeof a)) return a;
                a = e.prev && "switch" == e.prev.info;
                if (b.allmanIndentation &&
                    /[{(]/.test(f)) {
                    for (;
                        "top" != e.type && "}" != e.type;) e = e.prev;
                    return e.indented
                }
                return "statement" == e.type ? e.indented + ("{" == f ? 0 : m) : !e.align || q && ")" == e.type ? ")" != e.type || g ? e.indented + (g ? 0 : h) + (g || !a || /^(?:case|default)\b/.test(c) ? 0 : h) : e.indented + m : e.column + (g ? 0 : 1)
            },
            electricInput: !1 !== b.indentSwitch ? /^\s*(?:case .*?:|default:|\{\}?|\})$/ : /^\s*[{}]$/,
            blockCommentStart: "/*",
            blockCommentEnd: "*/",
            blockCommentContinue: " * ",
            lineComment: "//",
            fold: "brace"
        }
    });
    var E = d("int long char short double float unsigned signed void bool"),
        Q = d("SEL instancetype id Class Protocol BOOL");
    k(["text/x-csrc", "text/x-c", "text/x-chdr"], {
        name: "clike",
        keywords: d("auto if break case register continue return default do sizeof static else struct switch extern typedef union for goto while enum const volatile inline restrict asm fortran"),
        types: q,
        blockKeywords: d("case do else for if switch while struct enum union"),
        defKeywords: d("struct enum union"),
        typeFirstDefinitions: !0,
        atoms: d("NULL true false"),
        isReservedIdentifier: r,
        hooks: {
            "#": m,
            "*": x
        },
        modeProps: {
            fold: ["brace",
                "include"
            ]
        }
    });
    k(["text/x-c++src", "text/x-c++hdr", "text/x-c++"], {
        name: "clike",
        keywords: d("auto if break case register continue return default do sizeof static else struct switch extern typedef union for goto while enum const volatile inline restrict asm fortranalignas alignof and and_eq audit axiom bitand bitor catch class compl concept constexpr const_cast decltype delete dynamic_cast explicit export final friend import module mutable namespace new noexcept not not_eq operator or or_eq override private protected public reinterpret_cast requires static_assert static_cast template this thread_local throw try typeid typename using virtual xor xor_eq"),
        types: q,
        blockKeywords: d("case do else for if switch while struct enum union class try catch"),
        defKeywords: d("struct enum union class namespace"),
        typeFirstDefinitions: !0,
        atoms: d("true false NULL nullptr"),
        dontIndentStatements: /^template$/,
        isIdentifierChar: /[\w\$_~\xa1-\uffff]/,
        isReservedIdentifier: r,
        hooks: {
            "#": m,
            "*": x,
            u: t,
            U: t,
            L: t,
            R: t,
            0: h,
            1: h,
            2: h,
            3: h,
            4: h,
            5: h,
            6: h,
            7: h,
            8: h,
            9: h,
            token: function (a, b, c) {
                if (b = "variable" == c && "(" == a.peek() && (";" == b.prevToken || null == b.prevToken || "}" == b.prevToken)) a = a.current(),
                    b = (a = /(\w+)::~?(\w+)$/.exec(a)) && a[1] == a[2];
                if (b) return "def"
            }
        },
        namespaceSeparator: "::",
        modeProps: {
            fold: ["brace", "include"]
        }
    });
    k("text/x-java", {
        name: "clike",
        keywords: d("abstract assert break case catch class const continue default do else enum extends final finally float for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while @interface"),
        types: d("byte short int long float double boolean char void Boolean Byte Character Double Float Integer Long Number Object Short String StringBuffer StringBuilder Void"),
        blockKeywords: d("catch class do else finally for if switch try while"),
        defKeywords: d("class interface enum @interface"),
        typeFirstDefinitions: !0,
        atoms: d("true false null"),
        number: /^(?:0x[a-f\d_]+|0b[01_]+|(?:[\d_]+\.?\d*|\.\d+)(?:e[-+]?[\d_]+)?)(u|ll?|l|f)?/i,
        hooks: {
            "@": function (a) {
                if (a.match("interface", !1)) return !1;
                a.eatWhile(/[\w\$_]/);
                return "meta"
            }
        },
        modeProps: {
            fold: ["brace", "import"]
        }
    });
    k("text/x-csharp", {
        name: "clike",
        keywords: d("abstract as async await base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using virtual void volatile while add alias ascending descending dynamic from get global group into join let orderby partial remove select set value var yield"),
        types: d("Action Boolean Byte Char DateTime DateTimeOffset Decimal Double Func Guid Int16 Int32 Int64 Object SByte Single String Task TimeSpan UInt16 UInt32 UInt64 bool byte char decimal double short int long object sbyte float string ushort uint ulong"),
        blockKeywords: d("catch class do else finally for foreach if struct switch try while"),
        defKeywords: d("class interface namespace struct var"),
        typeFirstDefinitions: !0,
        atoms: d("true false null"),
        hooks: {
            "@": function (a, b) {
                if (a.eat('"')) return b.tokenize =
                    B, B(a, b);
                a.eatWhile(/[\w\$_]/);
                return "meta"
            }
        }
    });
    k("text/x-scala", {
        name: "clike",
        keywords: d("abstract case catch class def do else extends final finally for forSome if implicit import lazy match new null object override package private protected return sealed super this throw trait try type val var while with yield _ assert assume require print println printf readLine readBoolean readByte readShort readChar readInt readLong readFloat readDouble"),
        types: d("AnyVal App Application Array BufferedIterator BigDecimal BigInt Char Console Either Enumeration Equiv Error Exception Fractional Function IndexedSeq Int Integral Iterable Iterator List Map Numeric Nil NotNull Option Ordered Ordering PartialFunction PartialOrdering Product Proxy Range Responder Seq Serializable Set Specializable Stream StringBuilder StringContext Symbol Throwable Traversable TraversableOnce Tuple Unit Vector Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable Compiler Double Exception Float Integer Long Math Number Object Package Pair Process Runtime Runnable SecurityManager Short StackTraceElement StrictMath String StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void"),
        multiLineStrings: !0,
        blockKeywords: d("catch class enum do else finally for forSome if match switch try while"),
        defKeywords: d("class enum def object package trait type val var"),
        atoms: d("true false null"),
        indentStatements: !1,
        indentSwitch: !1,
        isOperatorChar: /[+\-*&%=<>!?|\/#:@]/,
        hooks: {
            "@": function (a) {
                a.eatWhile(/[\w\$_]/);
                return "meta"
            },
            '"': function (a, b) {
                if (!a.match('""')) return !1;
                b.tokenize = F;
                return b.tokenize(a, b)
            },
            "'": function (a) {
                a.eatWhile(/[\w\$_\xa1-\uffff]/);
                return "atom"
            },
            "=": function (a, b) {
                var c =
                    b.context;
                return "}" == c.type && c.align && a.eat(">") ? (b.context = new D(c.indented, c.column, c.type, c.info, null, c.prev), "operator") : !1
            },
            "/": function (a, b) {
                if (!a.eat("*")) return !1;
                b.tokenize = y(1);
                return b.tokenize(a, b)
            }
        },
        modeProps: {
            closeBrackets: {
                pairs: '()[]{}""',
                triples: '"'
            }
        }
    });
    k("text/x-kotlin", {
        name: "clike",
        keywords: d("package as typealias class interface this super val operator var fun for is in This throw return annotation break continue object if else while do try when !in !is as? file import where by get set abstract enum open inner override private public internal protected catch finally out final vararg reified dynamic companion constructor init sealed field property receiver param sparam lateinit data inline noinline tailrec external annotation crossinline const operator infix suspend actual expect setparam"),
        types: d("Boolean Byte Character CharSequence Class ClassLoader Cloneable Comparable Compiler Double Exception Float Integer Long Math Number Object Package Pair Process Runtime Runnable SecurityManager Short StackTraceElement StrictMath String StringBuffer System Thread ThreadGroup ThreadLocal Throwable Triple Void Annotation Any BooleanArray ByteArray Char CharArray DeprecationLevel DoubleArray Enum FloatArray Function Int IntArray Lazy LazyThreadSafetyMode LongArray Nothing ShortArray Unit"),
        intendSwitch: !1,
        indentStatements: !1,
        multiLineStrings: !0,
        number: /^(?:0x[a-f\d_]+|0b[01_]+|(?:[\d_]+(\.\d+)?|\.\d+)(?:e[-+]?[\d_]+)?)(u|ll?|l|f)?/i,
        blockKeywords: d("catch class do else finally for if where try while enum"),
        defKeywords: d("class val var object interface fun"),
        atoms: d("true false null this"),
        hooks: {
            "@": function (a) {
                a.eatWhile(/[\w\$_]/);
                return "meta"
            },
            "*": function (a, b) {
                return "." == b.prevToken ? "variable" : "operator"
            },
            '"': function (a, b) {
                b.tokenize = G(a.match('""'));
                return b.tokenize(a, b)
            },
            indent: function (a, b,
                c, d) {
                var f = c && c.charAt(0);
                if (("}" == a.prevToken || ")" == a.prevToken) && "" == c) return a.indented;
                if ("operator" == a.prevToken && "}" != c || "variable" == a.prevToken && "." == f || ("}" == a.prevToken || ")" == a.prevToken) && "." == f) return 2 * d + b.indented;
                if (b.align && "}" == b.type) return b.indented + (a.context.type == (c || "").charAt(0) ? 0 : d)
            }
        },
        modeProps: {
            closeBrackets: {
                triples: '"'
            }
        }
    });
    k(["x-shader/x-vertex", "x-shader/x-fragment"], {
        name: "clike",
        keywords: d("sampler1D sampler2D sampler3D samplerCube sampler1DShadow sampler2DShadow const attribute uniform varying break continue discard return for while do if else struct in out inout"),
        types: d("float int bool void vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 mat2 mat3 mat4"),
        blockKeywords: d("for while do if else struct"),
        builtin: d("radians degrees sin cos tan asin acos atan pow exp log exp2 sqrt inversesqrt abs sign floor ceil fract mod min max clamp mix step smoothstep length distance dot cross normalize ftransform faceforward reflect refract matrixCompMult lessThan lessThanEqual greaterThan greaterThanEqual equal notEqual any all not texture1D texture1DProj texture1DLod texture1DProjLod texture2D texture2DProj texture2DLod texture2DProjLod texture3D texture3DProj texture3DLod texture3DProjLod textureCube textureCubeLod shadow1D shadow2D shadow1DProj shadow2DProj shadow1DLod shadow2DLod shadow1DProjLod shadow2DProjLod dFdx dFdy fwidth noise1 noise2 noise3 noise4"),
        atoms: d("true false gl_FragColor gl_SecondaryColor gl_Normal gl_Vertex gl_MultiTexCoord0 gl_MultiTexCoord1 gl_MultiTexCoord2 gl_MultiTexCoord3 gl_MultiTexCoord4 gl_MultiTexCoord5 gl_MultiTexCoord6 gl_MultiTexCoord7 gl_FogCoord gl_PointCoord gl_Position gl_PointSize gl_ClipVertex gl_FrontColor gl_BackColor gl_FrontSecondaryColor gl_BackSecondaryColor gl_TexCoord gl_FogFragCoord gl_FragCoord gl_FrontFacing gl_FragData gl_FragDepth gl_ModelViewMatrix gl_ProjectionMatrix gl_ModelViewProjectionMatrix gl_TextureMatrix gl_NormalMatrix gl_ModelViewMatrixInverse gl_ProjectionMatrixInverse gl_ModelViewProjectionMatrixInverse gl_TexureMatrixTranspose gl_ModelViewMatrixInverseTranspose gl_ProjectionMatrixInverseTranspose gl_ModelViewProjectionMatrixInverseTranspose gl_TextureMatrixInverseTranspose gl_NormalScale gl_DepthRange gl_ClipPlane gl_Point gl_FrontMaterial gl_BackMaterial gl_LightSource gl_LightModel gl_FrontLightModelProduct gl_BackLightModelProduct gl_TextureColor gl_EyePlaneS gl_EyePlaneT gl_EyePlaneR gl_EyePlaneQ gl_FogParameters gl_MaxLights gl_MaxClipPlanes gl_MaxTextureUnits gl_MaxTextureCoords gl_MaxVertexAttribs gl_MaxVertexUniformComponents gl_MaxVaryingFloats gl_MaxVertexTextureImageUnits gl_MaxTextureImageUnits gl_MaxFragmentUniformComponents gl_MaxCombineTextureImageUnits gl_MaxDrawBuffers"),
        indentSwitch: !1,
        hooks: {
            "#": m
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    });
    k("text/x-nesc", {
        name: "clike",
        keywords: d("auto if break case register continue return default do sizeof static else struct switch extern typedef union for goto while enum const volatile inline restrict asm fortran as atomic async call command component components configuration event generic implementation includes interface module new norace nx_struct nx_union post provides signal task uses abstract extends"),
        types: q,
        blockKeywords: d("case do else for if switch while struct enum union"),
        atoms: d("null true false"),
        hooks: {
            "#": m
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    });
    k("text/x-objectivec", {
        name: "clike",
        keywords: d("auto if break case register continue return default do sizeof static else struct switch extern typedef union for goto while enum const volatile inline restrict asm fortran bycopy byref in inout oneway out self super atomic nonatomic retain copy readwrite readonly strong weak assign typeof nullable nonnull null_resettable _cmd @interface @implementation @end @protocol @encode @property @synthesize @dynamic @class @public @package @private @protected @required @optional @try @catch @finally @import @selector @encode @defs @synchronized @autoreleasepool @compatibility_alias @available"),
        types: function (a) {
            return q(a) || n(Q, a)
        },
        builtin: d("FOUNDATION_EXPORT FOUNDATION_EXTERN NS_INLINE NS_FORMAT_FUNCTION NS_RETURNS_RETAINED NS_ERROR_ENUM NS_RETURNS_NOT_RETAINED NS_RETURNS_INNER_POINTER NS_DESIGNATED_INITIALIZER NS_ENUM NS_OPTIONS NS_REQUIRES_NIL_TERMINATION NS_ASSUME_NONNULL_BEGIN NS_ASSUME_NONNULL_END NS_SWIFT_NAME NS_REFINED_FOR_SWIFT"),
        blockKeywords: d("case do else for if switch while struct enum union @synthesize @try @catch @finally @autoreleasepool @synchronized"),
        defKeywords: d("struct enum union @interface @implementation @protocol @class"),
        dontIndentStatements: /^@.*$/,
        typeFirstDefinitions: !0,
        atoms: d("YES NO NULL Nil nil true false nullptr"),
        isReservedIdentifier: r,
        hooks: {
            "#": m,
            "*": x
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    });
    k("text/x-squirrel", {
        name: "clike",
        keywords: d("base break clone continue const default delete enum extends function in class foreach local resume return this throw typeof yield constructor instanceof static"),
        types: q,
        blockKeywords: d("case catch class else for foreach if switch try while"),
        defKeywords: d("function local class"),
        typeFirstDefinitions: !0,
        atoms: d("true false null"),
        hooks: {
            "#": m
        },
        modeProps: {
            fold: ["brace", "include"]
        }
    });
    var u = null;
    k("text/x-ceylon", {
        name: "clike",
        keywords: d("abstracts alias assembly assert assign break case catch class continue dynamic else exists extends finally for function given if import in interface is let module new nonempty object of out outer package return satisfies super switch then this throw try value void while"),
        types: function (a) {
            a = a.charAt(0);
            return a === a.toUpperCase() && a !== a.toLowerCase()
        },
        blockKeywords: d("case catch class dynamic else finally for function if interface module new object switch try while"),
        defKeywords: d("class dynamic function interface module object package value"),
        builtin: d("abstract actual aliased annotation by default deprecated doc final formal late license native optional sealed see serializable shared suppressWarnings tagged throws variable"),
        isPunctuationChar: /[\[\]{}\(\),;:\.`]/,
        isOperatorChar: /[+\-*&%=<>!?|^~:\/]/,
        numberStart: /[\d#$]/,
        number: /^(?:#[\da-fA-F_]+|\$[01_]+|[\d_]+[kMGTPmunpf]?|[\d_]+\.[\d_]+(?:[eE][-+]?\d+|[kMGTPmunpf]|)|)/i,
        multiLineStrings: !0,
        typeFirstDefinitions: !0,
        atoms: d("true false null larger smaller equal empty finished"),
        indentSwitch: !1,
        styleDefs: !1,
        hooks: {
            "@": function (a) {
                a.eatWhile(/[\w\$_]/);
                return "meta"
            },
            '"': function (a, b) {
                b.tokenize = C(a.match('""') ? "triple" : "single");
                return b.tokenize(a, b)
            },
            "`": function (a, b) {
                if (!u || !a.match("`")) return !1;
                b.tokenize = u;
                u = null;
                return b.tokenize(a, b)
            },
            "'": function (a) {
                a.eatWhile(/[\w\$_\xa1-\uffff]/);
                return "atom"
            },
            token: function (a, b, c) {
                if (("variable" == c || "type" == c) && "." == b.prevToken) return "variable-2"
            }
        },
        modeProps: {
            fold: ["brace", "import"],
            closeBrackets: {
                triples: '"'
            }
        }
    })
});