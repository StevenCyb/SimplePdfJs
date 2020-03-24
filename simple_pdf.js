/*
 * Author: Steven Cybinski
 * Repository: https://github.com/StevenCyb/SimplePdfJs
 * License: Apache License Version 2.0
 * Note: If you have improvements or additions, share your knowledge with others and merge your project :)
 */

 /*
  * Enum with standard page sizes
  */
const SimplePdfPageDimension = {
    A0: [841, 1189], A1: [594, 841], A2: [420, 594],
    A3: [297, 420], A4: [210, 297], A5: [148, 210], A6: [105, 148],
    A7: [74, 105], A8: [52, 74], A9: [37, 52], A10: [26, 37],
    LETTER: [215.9, 279.4], POSTCARD_MAX: [125, 245], POSTCARD_MIN: [90, 140],
    BUSINESS_CARD_85x55: [85, 55], BUSINESS_CARD_85x54: [85, 54],
    BUSINESS_CARD_90x55: [90, 55], BUSINESS_CARD_91x55: [91, 55],
    BUSINESS_CARD_90x54: [90, 54], BUSINESS_CARD_90x50: [90, 50],
    BUSINESS_CARD_89x51: [89, 51]
}
 /*
  *Enum with font encoding types
  */
const SimplePdfFontEncoding = {
    WIN_ANSI: '/WinAnsiEncoding',
    MAC_ROMAN: '/MacRomanEncoding',
    MAC_EXPERT: '/MacExpertEncoding'
};
/*
 * Enum with fonts
 */
const SimplePdfBaseFont = {
    TIMES_ROMAN: '/Times-Roman',
    TIMES_ITALIC: '/Times-Italic',
    TIMES_BOLD: '/Times-Bold',
    TIMES_BOLD_ITALIC: '/Times-BoldItalic',
    HELVETICA: '/Helvetica',
    HELVETICA_OBLIQUE: '/Helvetica-Oblique',
    HELVETICA_BOLD: '/Helvetica-Bold',
    HELVETICA_BOLD_OBLIQUE: '/Helvetica-BoldOblique',
    COURIER: '/Courier',
    COURIER_OBLIQUE: '/Courier-Oblique',
    COURIER_BOLD: '/Courier-Bold',
    COURIER_BOLD_OBLIQUE: '/Courier-BoldOblique',
    SYMBOL: '/Symbol',
    ZAPF_DINGBATS: '/ZapfDingbats'
};
/*
 * Enum with PDF-Object types (used internally only)
 */
const SimplePdfObjectType = {
    HEAD: 1, METADATA: 2, CATALOG: 3,
    PAGE_AREA: 4, FONT: 5, PAGE: 6,
    STREAM: 7, IMAGE_STREAM: 8, ANNOT: 9
};
/*
 * PDF-Object that contains attributes and references
 */
class SimplePdfObject {
    /*
     * Constructor of the class
     * Parameters: 
     * type: Object type (see SimplePdfObjectType enum)
     * attributes: List of attributes
     * parent: Reference to the parent object of type SimplePdfObject (defualt=null)
     * active: Defines if the object is in use (default=true)
     */
    constructor(type, attributes, parent=null, active=true) {
        this.id = -1;
        this.reference = null;
        this.type = type;
        this.attributes = attributes;
        this.parent = parent;
        this.active = active;
        this.childs = [];
    }
    /*
     * Checks if the attributes contain a certain attribute
     * Parameters:
     * attribute: The attribute searched for
     * Return:
     * boolean
     */
    attributesContains(attribute) {
        for(var i=0; i < this.attributes.length; i++) {
            if(this.attributes[i] == attribute) { return true; }
        }
        return false;
    }
    /*
     * Get the newest child with or without a certain type
     * Parameters:
     * withType: If needed, child of which type (see SimplePdfObjectType enum, default=null)
     * Return:
     * Newest child of type SimplePdfObject or null if not found
     */
    getNewestChild(withType=null) {
        for(var i=(this.childs.length - 1); i>=0; i--) {
            if(this.childs[i].active && (withType == null || this.childs[i].type == withType)) {
                return this.childs[i];
            }
        }
        return null;
    }
    /*
     * Encode a string to Ascii85
     * Parameters:
     * a: String to encode
     * Return:
     * Encoded string
     */
    stringEncodeAscii85(a) {
        // Derived from answer https://stackoverflow.com/questions/17184813/how-to-encode-decode-ascii85-in-javascript
        var b, c, d, e, f, g, h, i, j, k;
        for (!/[^\x00-\xFF]/.test(a), b = "\x00\x00\x00\x00".slice(a.length % 4 || 4), a += b, c = [], d = 0, e = a.length; e > d; d += 4) 
            f = (a.charCodeAt(d) << 24) + (a.charCodeAt(d + 1) << 16) + (a.charCodeAt(d + 2) << 8) + a.charCodeAt(d + 3), 
            0 !== f ? (k = f % 85, f = (f - k) / 85, j = f % 85, f = (f - j) / 85, i = f % 85, 
            f = (f - i) / 85, h = f % 85, f = (f - h) / 85, g = f % 85, c.push(g + 33, h + 33, i + 33, j + 33, k + 33)) :c.push(122);
         return function(a, b) {
            for (var c = b; c > 0; c--) a.pop();
        } (c, b.length), String.fromCharCode.apply(String, c) + "~>";
    }
    /*
     * Compose the PDF-String out of the object
     * Return:
     * PDF-String
     */
    getComposed() {
        var composed = '';
        if (this.type == SimplePdfObjectType.HEAD) {
            composed = '%PDF-' + this.attributes[0] + '\n';
        } else if(this.type == SimplePdfObjectType.METADATA) {
            composed = String(this.id) + ' 0 obj <<\n';
            composed += '/Title (' + this.attributes[0] + ')\n';
            composed += '/Author (' + this.attributes[1] + ')\n';
            composed += '/Creator (' + this.attributes[2] + ')\n';
            composed += '/Producer (' + this.attributes[3] + ')\n';
            composed += '/Subject (' + this.attributes[4] + ')\n';
            composed += '/Keywords (' + this.attributes[5] + ')\n';
            composed += '/CreationDate (' + this.attributes[6] + ')\n';
            composed += '/ModDate (' + this.attributes[7] + ')\n';
            composed += '>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.CATALOG) {
            composed = String(this.id) + ' 0 obj <<\n/Type /Catalog\n/Pages 3 0 R\n>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.PAGE_AREA) {
            composed = String(this.id) + ' 0 obj <<\n';
            composed += '/Type /Pages\n';
            composed += '/MediaBox [0 0 ' + this.attributes[0] + ' ' + this.attributes[1] + ']\n';
            composed += '/Resources <<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n';
            var fontIdCount = 1;
            composed += '/Font <<\n';
            for(var k=0; k < this.childs.length; k++) {
                if(this.childs[k].active && this.childs[k].type == SimplePdfObjectType.FONT) {
                    composed += '/F' + String(fontIdCount) + ' ' + String(this.childs[k].id) + ' 0 R \n';
                    this.childs[k].reference = '/F' + String(fontIdCount);
                    fontIdCount += 1;
                }
            }
            composed += '>>\n';
            var imageIdCount = 1;
            composed += '/XObject <<\n';
            for(var k=0; k < this.childs.length; k++) {
                if(this.childs[k].active && this.childs[k].reference != 'alpha' && this.childs[k].type == SimplePdfObjectType.IMAGE_STREAM) {
                    composed += '/I' + String(imageIdCount) + ' ' + String(this.childs[k].id) + ' 0 R \n';
                    this.childs[k].reference = '/I' + String(imageIdCount);
                    imageIdCount += 1;
                }
            }
            composed += '>>\n>>\n';
            var kids = '[';
            for(var k=0; k < this.childs.length; k++) {
                if(this.childs[k].active && this.childs[k].type == SimplePdfObjectType.PAGE) {
                    kids += String(this.childs[k].id) + ' 0 R ';
                }
            }
            composed += ('/Kids ' + (kids.length > 1?kids.substr(0, kids.length - 1) + ']':'[]') + '\n');
            var count = 0;
            for(var k=0; k < this.childs.length; k++) {
                if(this.childs[k].active && this.childs[k].type == SimplePdfObjectType.PAGE) { count += 1; }
            }
            composed += '/Count ' + String(count) + '\n>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.PAGE) {
            composed = String(this.id) + ' 0 obj <<\n/Type /Page\n';
            composed += ('/Parent ' + String(this.parent.id) + ' 0 R\n');
            composed += '/Annots [';
            for(var k=0; k<this.childs.length; k++) {
                if(this.childs[k].active && this.childs[k].type == SimplePdfObjectType.ANNOT) {
                    composed += String(this.childs[k].id) + ' 0 R ';
                }
            }
            composed += ']\n';
            var content = this.getNewestChild(SimplePdfObjectType.STREAM);
            if(content != null) {
                composed += '/Contents ';
                composed += String(content.id) + ' 0 R';
            }
            composed += '>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.FONT) {
            composed = String(this.id) + ' 0 obj <<\n';
            composed += '/Type /Font\n/Subtype /Type1\n';
            composed += '/BaseFont ' + this.attributes[0] + '\n';
            composed += '/Encoding ' + this.attributes[1] + '\n';
            composed += '>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.STREAM) {
            var streamContent = "";
            for(var i=0; i < this.attributes.length; i++) {
                if(typeof this.attributes[i] == 'object' && this.attributes[i].type == SimplePdfObjectType.FONT) {
                    streamContent += (this.attributes[i].reference + ' ' + this.attributes[i + 1] + ' Tf\n');
                    i += 1;
                } else if(typeof this.attributes[i] == 'object' && this.attributes[i].type == SimplePdfObjectType.IMAGE_STREAM) {
                    streamContent += (this.attributes[i].reference + ' Do\n');
                } else {
                    streamContent += (this.attributes[i] + '\n');
                }
            }
            composed = String(this.id) + ' 0 obj <<\n/Filter /ASCII85Decode\n';
            composed += '/Length ' + String(streamContent.length) + '\n';
            composed += '>>\nstream\n';
            composed += this.stringEncodeAscii85(streamContent) + '\n';
            composed += 'endstream\nendobj\n';
        } else if(this.type == SimplePdfObjectType.ANNOT) {
            composed = String(this.id) + ' 0 obj\n<<\n/Type /Annot\n/Subtype /Link\n';
            composed += '/Rect [' + this.attributes[0] + ']\n';
            composed += '/A <<\n/S /URI\n';
            composed += '/URI (' + this.attributes[1] + ')\n';
            composed += '>>\n/Border [0 0 0]\n/H /N\n>>\nendobj\n';
        } else if(this.type == SimplePdfObjectType.IMAGE_STREAM) {
            var streamContent = "", 
                canvas = this.attributes[0],
                alphaImageObject = this.attributes[1],
                imageData = Array.isArray(canvas)?canvas:canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data,
                hasAlpha = alphaImageObject != null && alphaImageObject.active,
                alphaData = [],
                filterFkt = function(r, g, b, alpha=null) {
                    var r=Number(r).toString(16),
                        g=Number(g).toString(16),
                        b=Number(b).toString(16);
                    if(alpha != null) {
                        var alpha=Number(alpha).toString(16);
                        return (alpha.length<2?'0':'') + alpha;
                    }
                    return (r.length<2?'0':'') + r + (g.length<2?'0':'') + g + (b.length<2?'0':'') + b;
                };
            for (var i = 0; i < imageData.length; i += (Array.isArray(canvas)?1:4)) {
                if(Array.isArray(canvas)) {
                    streamContent += filterFkt(0, 0, 0, imageData[i]) + ' ';
                } else {
                    streamContent += filterFkt(imageData[i], imageData[i + 1], imageData[i + 2]) + ' ';
                }
                if(hasAlpha) { alphaData.push(imageData[i + 3]); }                
            }
            streamContent += '>'
            composed = String(this.id) + ' 0 obj\n<<\n/Type /XObject\n/Subtype /Image\n';
            composed += '/Width ' + (Array.isArray(canvas)?this.attributes[2]:String(canvas.width)) + '\n';
            composed += '/Height ' + (Array.isArray(canvas)?this.attributes[3]:String(canvas.height)) + '\n';
            composed += '/ColorSpace ' + (Array.isArray(canvas)?'/DeviceGray':'/DeviceRGB') + '\n';
            composed += '/BitsPerComponent 8\n';
            if(hasAlpha) {
                alphaImageObject.attributes.push(alphaData, null, String(canvas.width), String(canvas.height));
                composed += '/SMask ' + String(alphaImageObject.id) + ' 0 R\n';
            }
            composed += '/Filter /ASCIIHexDecode\n';
            composed += '/Length ' + String(streamContent.length) + '\n';
            composed += '>>\nstream\n';
            composed += streamContent + '\n';
            composed += 'endstream\nendobj\n';
        }
        return composed;
    }
}
/*
 * The class to define, open and save a PDF
 */
class SimplePdf {
    /*
     * Constructor of the class
     * Parameters: 
     * metadata: Object with metainformations (see doc or examples)
     * pageDdimension: Dimensions/Size of the pages (mm unit)
     * version: PDF-Version (leave it on deafult, default=1.6)
     */
    constructor(metadata, pageDdimension, version='1.6') {
        if(!Array.isArray(pageDdimension) || pageDdimension.length != 2) {
            throw "Dimension must be a array with two elements [width_mm, height_mm].";
        }
        var now = new Date();
        metadata = (metadata == null || metadata == undefined)?{}:metadata;
        this.root = new SimplePdfObject(SimplePdfObjectType.HEAD, [version]);
        this.root.childs.push(new SimplePdfObject(SimplePdfObjectType.METADATA, [
            (('title' in metadata)?metadata.title:''),
            (('author' in metadata)?metadata.author:''),
            (('creator' in metadata)?metadata.creator:''),
            (('producer' in metadata)?metadata.producer:''),
            (('subject' in metadata)?metadata.subject:''),
            (('keywords' in metadata)?metadata.keywords:''),
            (('creation_date' in metadata)?metadata.creation_date:(
                'D:' + //(D:YYYYMMDDHHmmSSOHH'mm')
                this.numPad(now.getFullYear(), 4) +
                this.numPad(now.getMonth(), 2) +
                this.numPad(now.getDate(), 2) +
                this.numPad(now.getHours(), 2) +
                this.numPad(now.getMinutes(), 2) +
                this.numPad(now.getSeconds(), 2) +
                "-08'00'"
            )),
            (('mod_date' in metadata)?metadata.mod_date:(
                'D:' + //(D:YYYYMMDDHHmmSSOHH'mm')
                this.numPad(now.getFullYear(), 4) +
                this.numPad(now.getMonth(), 2) +
                this.numPad(now.getDate(), 2) +
                this.numPad(now.getHours(), 2) +
                this.numPad(now.getMinutes(), 2) +
                this.numPad(now.getSeconds(), 2) +
                "-08'00'"
            ))
        ], this.root));
        this.root.childs[0].childs.push(new SimplePdfObject(SimplePdfObjectType.CATALOG, [], this.root.childs[0]));
        this.currentPageDimensions = pageDdimension;
        this.root.childs[0].childs[0].childs.push(new SimplePdfObject(SimplePdfObjectType.PAGE_AREA, [
            (pageDdimension[0] * 2.83464567).toFixed(5),
            (pageDdimension[1] * 2.83464567).toFixed(5)
        ], this.root.childs[0].childs[0]));
        this.currentFontObject = null;
    }
    /*
     *
     */
    addPage() {
        var parent = this.root.childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE_AREA);
        parent.childs.push(new SimplePdfObject(SimplePdfObjectType.PAGE, [], parent));
        this.currentFontObject = null;
    }
    /*
     * Set a font by given parameters
     * Parameters:
     * baseFont: Font type based on the enum SimplePdfBaseFont
     * encoding: Encoding type based on the enum SimplePdfFontEncoding (leave it on default, default=WIN_ANSI)
     */
    setFont(baseFont, encoding=SimplePdfFontEncoding.WIN_ANSI) { 
        if(! baseFont in SimplePdfBaseFont) { throw "Unknown basefont."; }
        if(! encoding in SimplePdfFontEncoding) { throw "Unknown font encoding."; }
        var parent = this.root.childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE_AREA),
            newFontObject = null;
        for(var i=0; i < parent.childs.length; i++) {
            if(parent.childs[i].type != SimplePdfObjectType.FONT) { break; }
            if(parent.childs[i].attributesContains('/BaseFont ' + baseFont) && parent.childs[i].attributesContains('/Encoding ' + encoding)) {
                newFontObject = parent.childs[i]; break;
            }
        }
        if(newFontObject == null) {
            newFontObject = new SimplePdfObject(SimplePdfObjectType.FONT, [
                baseFont,
                encoding
            ], parent);
            parent.childs.unshift(newFontObject);
        }
        this.currentFontObject = newFontObject;
    }
    /*
     * Search and return the newest stream object or create if one if not exists
     * Return:
     * Newest stream object
     */
    __getNewestStreamObject() {
        parent = this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE);
        if(parent == null) { throw 'You must first add a page.'; }
        var streamObject = parent.getNewestChild(SimplePdfObjectType.STREAM);
        if(streamObject == null) {
            streamObject = new SimplePdfObject(SimplePdfObjectType.STREAM, [], parent);
            parent.childs.push(streamObject);
        }
        return streamObject;
    }
    /*
     * Set fill color
     * Parameters:
     * r: Red part of the color
     * g: Green part of the color
     * b: Blue part of the color
     */
    setFillColor(r, g, b) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject();
        streamObject.attributes.push(String(r / 255) + ' ' + String(g / 255) + ' ' + String(b / 255) + ' rg');
    }
    /*
     * Set font color (function is equal to setFillColor(r, g, b))
     * Parameters:
     * r: Red part of the color
     * g: Green part of the color
     * b: Blue part of the color
     */
    setFontColor(r, g, b) { this.setFillColor(r, g, b); }
    /*
     * Set line color
     * Parameters:
     * r: Red part of the color
     * g: Green part of the color
     * b: Blue part of the color
     */
    setLineColor(r, g, b) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject();
        streamObject.attributes.push(String(r / 255) + ' ' + String(g / 255) + ' ' + String(b / 255) + ' RG');
    }
    /*
     * Adds a text to current page with the last defined font and the given font size, at the specified position
     * Parameters:
     * text: Text to add
     * fontSize: Size of the font (px unit)
     * x: x-Position to palce the text (mm unit)
     * y: y-Position to palce the text (mm unit)
     */
    addText(text, fontSize, x, y) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        if(this.currentFontObject == null) { throw"You must first set a font."; }
        var streamObject = this.__getNewestStreamObject();
        streamObject.attributes.push(
            this.currentFontObject, fontSize, 'BT',
            String((x * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - y) * 2.83464567 - fontSize).toFixed(5)) + ' Td',
            '(' + (String(text).split('(').join('\\(')).split(')').join('\\)').split('\\').join('\\\\') + ') Tj',
            'ET'
        );
    }
    /*
     *
     * Parameters:
     * text: URL-Text to add
     * url: URL to open
     * fontSize: Size of the font (px unit)
     * x: x-Position to palce the text (mm unit)
     * y: y-Position to palce the text (mm unit)
     */
    addLink(text, url, fontSize, x, y) {
        this.addText(text, fontSize, x, y);
        x = (x * 2.83464567);
        y = ((this.currentPageDimensions[1] - y) * 2.83464567);
        var div = document.createElement('div'),
            size = [];
        document.body.appendChild(div);
        div.style.fontSize = "" + fontSize + "px";
        div.style.position = "absolute";
        div.style.left = -1000;
        div.style.top = -1000;
        div.innerHTML = text;
        size = [div.clientWidth, div.clientHeight];
        document.body.removeChild(div);
        var parent = this.__getNewestStreamObject().parent,
            obj = new SimplePdfObject(SimplePdfObjectType.ANNOT, [
                String(x.toFixed(5)) + ' ' + String((y - fontSize).toFixed(5)) + ' ' + 
                String((x + size[0]).toFixed(5)) + ' ' + String(((y - fontSize + size[1])).toFixed(5)),
                url.split('(').join('\\(').split(')').join('\\)').split('\\').join('\\\\')
            ], parent);
        if(parent.childs.length == 0) { parent.childs.push(obj); return; }
        for(var i=(parent.childs.length - 1); i >= 0; i--) {
            if(parent.childs[i].type != SimplePdfObjectType.PAGE) {
                if(i == parent.childs.length - 1) { parent.childs.push(obj); } 
                else { parent.childs.splice(i, 0, obj); }
                return;
            }
        }
    }
    /*
     * Draw a line over the set of points
     * Parameters:
     * points: List of points (must be at least two, mm unit)
     * lineWidth: Width of the line (px unit, default=1)
     * style: Line style (0=Butt-Cap ]|, 1=Round-Cap |), 2=Square-Cap |], default=1)
     * phase: Phases in line ([] => _____, [1] => _ __ __ __, [2, 3] => __   ____   ____, default=[])
     * shift: Shift the line phase (default=0)
     */
    drawLine(points=[], lineWidth=1, style=0, phase=[], shift=0) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject(),
            path = '';
        for(var i=0; i < points.length; i++) {
            path += String((points[i][0] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - points[i][1]) * 2.83464567).toFixed(5)) + (i==0?' m ':' l ');
        }
        streamObject.attributes.push(
            String(lineWidth) + ' w ' + String(style) + ' j ' + String(style) + ' J [' + phase.join(' ') + '] ' + String(shift) + ' d', path + 'S'
        );
    }
    /*
     * Draw a curve with given points. This function is quite complicated to explain. 
     * You can get a german explanation in the following website:
     * http://www.p2501.ch/pdf-howto/grundlagen/seiteninhalt/linien
     * Parameters:
     * startpoint: First point (mm unit, P0)
     * points: List with lists of points [[P1_x,P1_y,P2_x,P2_y,P3_x,P3_y]] (mm unit)
     * lineWidth: Width of the line (px unit, default=1)
     * style: Line style (0=Butt-Cap ]|, 1=Round |), 2=Square-Cap |], default=1)
     * phase: Phases in line ([] => _____, [1] => _ __ __ __, [2, 3] => __   ____   ____, default=[])
     * shift: Shift the line phase (default=0)
     */
    drawCurve(startpoint, points=[], lineWidth=1, style=0, phase=[], shift=0) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject(),
            path = String((startpoint[0] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - startpoint[1]) * 2.83464567).toFixed(5)) + ' m ';
        for(var i=0; i < points.length; i++) {
            path += String((points[i][0] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - points[i][1]) * 2.83464567).toFixed(5))  + ' ' + 
                    String((points[i][2] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - points[i][3]) * 2.83464567).toFixed(5)) + ' ' +
                    String((points[i][4] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - points[i][5]) * 2.83464567).toFixed(5)) + ' c ';
        }
        streamObject.attributes.push(
            String(lineWidth) + ' w ' + String(style) + ' j ' + String(style) + ' J [' + phase.join(' ') + '] ' + String(shift) + ' d', path + 'S'
        );
    }
    /*
     * Draw a polygon
     * Parameters:
     * points: Array with the corner points
     * border: Should the border be drawn (default=true)
     * fill: Should the area be filled (default=false)
     * lineWidth: Width of the line (px unit, default=1)
     * style: Line style (0=Butt-Cap ]|, 1=Round-Cap |), 2=Square-Cap |], default=1)
     * phase: Phases in line ([] => _____, [1] => _ __ __ __, [2, 3] => __   ____   ____, default=[])
     * shift: Shift the line phase (default=0)
     */
    drawPolygon(points=[], border=true, fill=false, lineWidth=1, style=0, phase=[], shift=0) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject(),
            drawFunction = '',
            path = '';
        if(!border && !fill) { return; }
        if(border && !fill) { drawFunction = 's'; }
        if(!border && fill) { drawFunction = 'f'; }
        if(border && fill) { drawFunction = 'b'; }
        for(var i=0; i < points.length; i++) {
            path += String((points[i][0] * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - points[i][1]) * 2.83464567).toFixed(5)) + (i==0?' m ':' l ');
        }
        streamObject.attributes.push(
            String(lineWidth) + ' w ' + String(style) + ' j ' + String(style) + ' J [' + phase.join(' ') + '] ' + String(shift) + ' d', path + drawFunction
        );
    }
    /*
     * Draw a rectangle 
     * x: x-Coordinate of the lower left corner 
     * y: y-Coordinate of the lower left corner 
     * width: Width of the rectangle (mm unit)
     * height: Height of the rectangle (mm unit)
     * border: Should the border be drawn (default=true)
     * fill: Should the area be filled (default=false)
     * lineWidth: Width of the line (px unit, default=1)
     * style: Line style (0=Butt-Cap ]|, 1=Round-Cap |), 2=Square-Cap |], default=1)
     * phase: Phases in line ([] => _____, [1] => _ __ __ __, [2, 3] => __   ____   ____, default=[])
     * shift: Shift the line phase (default=0)
     */
    drawRectangle(x, y, width, height, border=true, fill=false, lineWidth=1, style=0, phase=[], shift=0) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var streamObject = this.__getNewestStreamObject(),
            drawFunction = '';
        if(!border && !fill) { return; }
        if(border && !fill) { drawFunction = 's'; }
        if(!border && fill) { drawFunction = 'f'; }
        if(border && fill) { drawFunction = 'b'; }
        streamObject.attributes.push(
            String(lineWidth) + ' w ' + String(style) + ' j ' + String(style) + ' J [' + phase.join(' ') + '] ' + String(shift) + ' d',
            String((x * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - height - y) * 2.83464567).toFixed(5)) + ' ' + String((width * 2.83464567).toFixed(5)) + ' ' + String((height * 2.83464567).toFixed(5)) + ' re ' + drawFunction
        );
    }
    /*
     * Add a image 
     * Parameters:
     * imageData: Image data (canvas, image-element or URL)
     * x: x-Coordinate of the lower left corner 
     * y: y-Coordinate of the lower left corner
     * width: Width of the image (mm unit)
     * height: Height of the image (mm unit)
     * callback: Callback function if image is loaded from URL (asynchronously)
     */
    addImage(imageData, x, y, width, height, callback=null) {
        if(this.root.childs[0].childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE) == null) { throw 'You must first add a page.'; }
        var parent = this.root.childs[0].childs[0].getNewestChild(SimplePdfObjectType.PAGE_AREA),
            streamObject = this.__getNewestStreamObject(),
            canvas = document.createElement("canvas"),
            context = canvas.getContext('2d'),
            obj = null, obj2 = null,
            img = new Image();
        height = height * 2.83464567;
        width = width * 2.83464567;
        obj = new SimplePdfObject(SimplePdfObjectType.IMAGE_STREAM, [], parent);
        obj2 = new SimplePdfObject(SimplePdfObjectType.IMAGE_STREAM, [], parent, false);
        for(var i=0; i<=parent.childs.length; i++) {
            if(parent.childs.length == i) {
                parent.childs.push(obj);
                parent.childs.push(obj2);
                break;
            } else if(parent.childs.type != SimplePdfObjectType.FONT) {
                parent.childs.splice(i, 0, obj);
                parent.childs.splice(i + 1, 0, obj2);
                break;
            }
        }
        streamObject.attributes.push(
            'q', '1 0 0 1 ' + String((x * 2.83464567).toFixed(5)) + ' ' + String(((this.currentPageDimensions[1] - y) * 2.83464567 - height).toFixed(5)) + ' cm',
            String(width.toFixed(5)) +' 0 0 ' + String(height.toFixed(5)) + ' 0 0 cm', obj, 'Q'
        );
        var hasAlpha = function(canvas) {
            var imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
            for (var i = 3; i < imageData.length; i += 4) { if (imageData[i] < 255) { return true; } }
            return false;
        };
        canvas.height = height;
        canvas.width = width;
        context.clearRect(0, 0, canvas.width, canvas.height);
        if(imageData instanceof HTMLImageElement) {
            context.drawImage(imageData, 0, 0, width, height);
            if(hasAlpha(canvas)) { obj2.active = true; obj2.reference = 'alpha'; }
            obj.attributes.push(canvas, obj2);
            if(callback != null) { callback(); }
        } else if(imageData instanceof HTMLCanvasElement) {
            if(hasAlpha(canvas)) { obj2.active = true; obj2.reference = 'alpha'; } 
            context.drawImage(imageData, 0, 0, width, height);
            obj.attributes.push(canvas, obj2);
            if(callback != null) { callback(); }
        } else {
            img.crossOrigin = "Anonymous";
            img.onload = function() {
                context.drawImage(img, 0, 0, width, height);
                if(hasAlpha(canvas)) { obj2.active = true; obj2.reference = 'alpha'; }
                obj.attributes.push(canvas, obj2);
                if(callback != null) { callback(); }
            };
            img.src = imageData;
        }
    }
    /*
     * Add padding to a number to match a given total size
     * Parameters:
     * number: The number to mainpolated
     * size: Sizre of the result
     * pad: Char to use as pad (default=0)
     * Return:
     * Number with padding
     */
    numPad(number, size, pad='0') {
        var sn = String(number);
        while(sn.length < size) { sn = pad + sn; }
        return sn;
    }
    /*
     * Compose a PDF document out of object tree
     * Return:
     * Composed PDF string
     */
    compose() {
        var objectPositions = [],
            objectIdCounter = 3;
        // Indexing objects
        this.root.id = 0;
        this.root.childs[0].id = 1;
        this.root.childs[0].childs[0].id = 2;
        for(var i=0; i < this.root.childs[0].childs[0].childs.length; i++) {
            if(!this.root.childs[0].childs[0].childs[i].active) { continue; }
            this.root.childs[0].childs[0].childs[i].id = objectIdCounter;
            objectIdCounter += 1;
            for(var j=0; j<this.root.childs[0].childs[0].childs[i].childs.length; j++) {
                if(!this.root.childs[0].childs[0].childs[i].childs[j].active) { continue; }
                this.root.childs[0].childs[0].childs[i].childs[j].id = objectIdCounter;
                objectIdCounter += 1;
                if(this.root.childs[0].childs[0].childs[i].childs[j].type == SimplePdfObjectType.PAGE) {
                    for(var k=0; k < this.root.childs[0].childs[0].childs[i].childs[j].childs.length; k++) {
                        if(!this.root.childs[0].childs[0].childs[i].childs[j].childs[k].active) { continue; }
                        this.root.childs[0].childs[0].childs[i].childs[j].childs[k].id = objectIdCounter;
                        objectIdCounter += 1;
                    }
                }
            }
        } 
        // Compose a PDF document
        // Head
        var pdf = this.root.getComposed();
        // Body (Metadata)
        objectPositions.push(pdf.length);
        pdf += this.root.childs[0].getComposed();
        // Body (Root/Catalog)
        objectPositions.push(pdf.length);
        pdf += this.root.childs[0].childs[0].getComposed();
        // Body (Page-Area)
        for(var i=0; i < this.root.childs[0].childs[0].childs.length; i++) {
            if(!this.root.childs[0].childs[0].childs[i].active) { continue; }
            objectPositions.push(pdf.length);
            pdf += this.root.childs[0].childs[0].childs[i].getComposed();
            // Body (Pages|Fonts)
            for(var j=0; j<this.root.childs[0].childs[0].childs[i].childs.length; j++) {
                if(!this.root.childs[0].childs[0].childs[i].childs[j].active) { continue; }
                objectPositions.push(pdf.length);
                pdf += this.root.childs[0].childs[0].childs[i].childs[j].getComposed();
                if(this.root.childs[0].childs[0].childs[i].childs[j].type == SimplePdfObjectType.PAGE) {
                    // Body (Streams)
                    for(var k=0; k < this.root.childs[0].childs[0].childs[i].childs[j].childs.length; k++) {
                        if(!this.root.childs[0].childs[0].childs[i].childs[j].childs[k].active) { continue; }
                        objectPositions.push(pdf.length);
                        pdf += this.root.childs[0].childs[0].childs[i].childs[j].childs[k].getComposed();
                    }
                }
            }
        }
        // Reference-Table
        var xrefPosition = pdf.length;
        pdf += ('xref\n0 ' + String(objectIdCounter) + '\n0000000000 65535 f\n');
        for(var i=0; i < objectPositions.length; i++) {
            pdf += (this.numPad(objectPositions[i], 10) + ' 00000 n \n');
        }
        // Trailer
        pdf += ('trailer\n<< /Size ' + String(objectIdCounter) + '\n/Info 1 0 R\n/Root 2 0 R\n>>\nstartxref\n' + String(xrefPosition) + '\n%%EOF');
        return pdf;
    }
    /*
     * Compose and open the PDF file
     */
    open() {
        var pdfCompose = this.compose(),
            file = new Blob([pdfCompose], {type: 'application/pdf'});
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(file, filename);
        } else {
            window.open(URL.createObjectURL(file), '_blank');
        }
    }
    /*
     * Compose and save the PDF file
     * Parameters:
     * filename: Name of the file (default=simple_pdf_js.pdf)
     */
    save(filename='simple_pdf_js.pdf') {
        var pdfCompose = this.compose(),
            file = new Blob([pdfCompose], {type: 'pdf'});
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(file, filename);
        } else {
            var a = document.createElement('a'),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 10);
        }
    }
}
