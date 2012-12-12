;
(function (scope) {

    var f = function (what) {
        return parseFloat(what) || 0;
    };

    var miw = "minWidth",
        maw = "maxWidth",
        mih = "minHeight",
        mah = "maxHeight";

    scope.BorderBox = function (elm, val) {
        elm.style.behavior = "none";

        new scope.BorderBox.Item(elm, val);

    };

    scope.BorderBoxWidth = function (elm) {
        return BorderBox(elm, "width");
    };
    scope.BorderBoxHeight = function (elm) {
        return BorderBox(elm, "height");
    };

    function setComputed(elm, prop, Prop, val, min, max, gap) {
        if (val < gap)  elm.style[prop] = "0px";
        else if (val - gap <= min) elm.style[prop] = Math.max(0, max - gap) + "px";
        else if (val - gap >= max) elm.style[prop] = Math.max(0, max - gap) + "px";
        else elm.style[prop] = val - gap * 2 + "px";
        return elm["offset" + Prop];
    }

    /**
     * @constructor
     */
    scope.BorderBox.Item = function (el, val) {

        if (!val) {
            this.lockWidth = false;
            this.lockHeight = false;
        }
        else if (val == "width") {
            this.lockHeight = true;
            this.lockWidth = false;
        }
        else if (val == "height") {
            this.lockWidth = true;
            this.lockHeight = false;
        }

        this.setPixelsInStyle(el);

        var _this = this,
            cS = el.currentStyle;

        // set datas
        this.el = el;

        // min-width and min-height will be manage by script, reset to default
        // and keep original value
        this.oMnW = f(cS[miw]);
        this.oMnH = f(cS[mih]);
        if (!this.lockWidth) el.style[miw] = 0;
        if (!this.lockHeight)  el.style[mih] = 0;

        this.oMxW = f(cS[maw]) || Infinity;
        this.oMxH = f(cS[mah]) || Infinity;
        if (!this.lockWidth) el.style[maw] = "none";
        if (!this.lockHeight) el.style[mah] = "none";

        this.vGap = getVBorder(this.el) + getVPadding(this.el);
        this.hGap = getHBorder(this.el) + getHPadding(this.el);

        this.isLocked = false;
        this.oldW = 0;
        this.oldH = 0;

        // listen property change
        this.el.attachEvent("onpropertychange", function (e) {
            _this.computeSize();
        });

        // set
        this.computeSize();
    }

    scope.BorderBox.Item.prototype = {
        computeSize:function () {

            if (this.isLocked) return;



            // set lock to prevent unwanted recursivity (set width -> propertychange -> set width -> propertychange ....)
            this.isLocked = true;

            // get values
            var w = this.el.offsetWidth,
                h = this.el.offsetHeight;

            if (this.oldW != w && !this.lockWidth) {
                this.oldW = setComputed(this.el, "width", "Width", w, this.oMnW, this.oMxW, this.hGap);
            }
            if (this.oldH != h && !this.lockHeight) {
                this.oldH = setComputed(this.el, "height", "Height", h, this.oMnH, this.oMxH, this.vGap);
            }

            // free lock
            this.isLocked = false;
        }
    }


    scope.getElementFontSize = function (elm) {
        if(!elm) return 10;
        var cS = elm.currentStyle;
        var fs = cS.fontSize;

        if (/px/.test(cS["fontSize"])) {
            return f(fs);
        }


        // ~1em = 100% = 16px
        var oldPadding, oldWidth, oldMinWidth, oldDisplay, oldBorderL, oldBorderR;
        var oldStyle = elm.currentStyle.cssText;
        if (elm != document.body) {

            elm.style.cssText = "font-size:1em !important;width:1em !important;padding:0 !important;border:0 !important;position:absolute;behavior:none !important";
            fontSize = elm.offsetWidth;

            elm.style.cssText = oldStyle;

            return fontSize;
        } else {
            if (/pt/.test(fs)) {
                return parseFloat(fs) * 4 / 3;
            }
            else if (/em/.test(fs)) {
                return parseFloat(fs) * 16;
            }
            else if (/%/.test(fs)) {
                return parseFloat(fs) * 16 / 100;
            }
            else {
                return parseFloat(fs);
            }
        }


    }

    scope.BorderBox.Item.prototype.setPixelsInStyle = function (elm) {

        var r = /(.)+(em|%)/g,
            m,
            fs = false,
            pc = false;

        for (var p in elm.currentStyle) {
            var v = "" + (elm.currentStyle[p]);

            if (!v) continue;
            m = v.match(r);
            if (m) {
                for (var i = 0, l = m.length; i < l; i++) {
                    var o = m[i];
                    if (p == "fontSize") {
                        (!fs) && (fs = getElementFontSize(elm));
                        v = fs + "px";
                    }
                    else if (/em/.test(o)) {
                        (!fs) && (fs = getElementFontSize(elm));
                        v = v.replace(o, parseFloat(o) * fs);
                    }
                    else {
                        (!pc) && (pc = getElementPercentBase(elm));
                        v = v.replace(o, parseFloat(o) * pc);
                    }
                }
                if(p == "width" && this.lockWidth) return;
                if(p == "height" && this.lockHeight) return;
                elm.style[p] = v;
            }
        }
        if (fs) elm.style.fontSize = fs + "px";
    }

    // HELPERS
    
    function getElementPercentBase(elm) {
        var p = elm.parentNode;
        return (p.offsetWidth - getHPadding(p) - getHBorder(p)) / 100;
    }

    function getHPadding(elm) {
        return (f(elm.currentStyle.paddingLeft) + f(elm.currentStyle.paddingRight)) || 0;
    }

    function getVPadding(elm) {
        return (f(elm.currentStyle.paddingTop) + f(elm.currentStyle.paddingBottom)) || 0;
    }

    function getHBorder(elm) {
        return (f(elm.currentStyle.borderLeftWidth) + f(elm.currentStyle.borderRightWidth)) || 0;
    }

    function getVBorder(elm) {
        return (f(elm.currentStyle.borderTopWidth) + f(elm.currentStyle.borderBottomWidth)) || 0;
    }
})(this);



