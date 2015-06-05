/*
 * ixelfGrid v1.3 
 * Mickael Desgranges mickael@mkdgs.fr
 * 
 * Forked from Flexigrid for jQuery
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 */
(function ($) {
    "use strict";
    var pluginName = 'ixelfGrid';
    var docloaded = false;

    /*
     * jQuery 1.9 support. browser object has been removed in 1.9 
     */
    var browser = $.browser;
    if (!browser) {
        var uaMatch = function (ua) {
            ua = ua.toLowerCase();
            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                    [];
            return {
                browser: match[ 1 ] || "",
                version: match[ 2 ] || "0"
            };
        };
        var matched = uaMatch(navigator.userAgent);
        browser = {};
        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }
        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome || browser.webkit)
            browser.safari = browser.webkit = true;
    };

    /*!
     * START code from jQuery UI
     *
     * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
     * Dual licensed under the MIT or GPL Version 2 licenses.
     * http://jquery.org/license
     *
     * http://docs.jquery.com/UI
     */
    if (typeof $.support.selectstart != 'function') {
        $.support.selectstart = "onselectstart" in document.createElement("div");
    }

    if (typeof $.fn.disableSelection != 'function') {
        $.fn.disableSelection = function () {
            return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
                    ".ui-disableSelection", function (event) {
                        event.preventDefault();
                    });
        };
    }

    $(document).ready(function () {
        docloaded = true;
    });

    var methods = {};
    methods.init = function (params) {
        return this.each(function () {
            var op = $(this).data(pluginName);
            if (!op) {
                var options = {//apply default properties
                    //buttons: [ buttonFunction: function() {}, name: 'name', hide: false}, {separator:true, hide:false} ]
                    searchitems: [],
                    singleSelect: false,
                    height: 200, //default height
                    width: 'auto', //auto width
                    striped: true, //apply odd even stripes
                    novstripe: false,
                    minwidth: 30, //min width of columns
                    minheight: 80, //min height of columns
                    resizable: true, //allow table resizing
                    errormsg: 'Connection Error',
                    usepager: false,
                    nowrap: true,
                    page: 1, //current page
                    total: 1, //total pages
                    useRp: true, //use the results per page select box
                    rp: 15, //results per page
                    rpOptions: [10, 15, 20, 30, 50], //allowed per-page values 
                    title: false,
                    pagestat: 'page {from} sur {to} pour {total} lignes',
                    pagetext: 'Page',
                    outof: 'sur',
                    findtext: 'Chercher',
                    procmsg: 'Veuillez patienter ...',
                    query: '',
                    qtype: '',
                    nomsg: 'Vide',
                    minColToggle: 1, //minimum allowed column to be hidden
                    showToggleBtn: true, //show or hide column toggle popup
                    showTableToggleBtn: true, //Minimize/Maximize Table
                    hideOnSubmit: true,
                    autoload: true,
                    blockOpacity: 0.5,
                    preProcess: false,
                    onDragCol: false,
                    onToggleCol: false,
                    onChangeSort: false,
                    onSuccess: false,
                    onError: false,
                    onSubmit: false, //using a custom populate function
                    rowFunction: null, // apply function on row, args: (tr, linedata);
                    colDefault: {display: '',
                        hide: false,
                        width: false,
                        sortable: false,
                        align: 'left',
                        cellFunction: null, // apply function on cell, args: (td, linedata, tr);
                        columnFunction: null, // apply function on column (head), args: (th, g(grid class))
                        buttonShowHide: true, // not implemented
                        resize: true // not implemented								   
                    },
                    colResize: true, // disable column resize
                    colMove: true, // disable column move
                    url: false, //URL if using data from AJAX
                    jsonRpcMethod: '',
                    jsonRpcParams: {}, // parametre de recherche
                    jsonRpcParamsFixed: {}, // paramétre fixe pour la requete 
                    method: 'POST', //data sending method
                    dataType: 'json'//type of data for AJAX, either xml or json		           
                };
                op = jQuery.extend(options, params);
                op.$el = $(this);
                op.t = this;
                // set instance
                $(this).data(pluginName, op);
            }

            var t = op.t;
            if (!docloaded) {
                $(this).hide();
                $(document).ready(function () {
                    methods[pluginName].call(t, t, op); // @todo fix t/this
                });
            } else {
                methods[pluginName].call(t, t, op); // @todo fix t/this 
            }
        });
    }; //end flexigrid

    methods.flexigrid = function (t, p) {
        if (t.grid)
            return false; //return if already exist
        var op = $(this).data(pluginName);

        $(t).show() //show if hidden
                .attr({
                    cellPadding: 0,
                    cellSpacing: 0,
                    border: 0
                }) //remove padding and spacing
                .removeAttr('width'); //remove width properties

        //create grid class
        op.grid = {
            hideShowHide: function () {

            },
            hset: {},
            rePosDrag: function () {
                var cdleft = 0 - this.hDiv.scrollLeft;
                if (this.hDiv.scrollLeft > 0)
                    cdleft -= Math.floor(op.cgwidth / 2);
                $(op.grid.cDrag).css({
                    top: op.grid.hDiv.offsetTop + 1
                });
                var cdpad = this.cdpad;
                var cdcounter = 0;
                $('div', op.grid.cDrag).hide();
                $('thead tr:first th:visible', this.hDiv).each(function () {
                    var n = $('thead tr:first th:visible', op.grid.hDiv).index(this);
                    var cdpos = parseInt($('div', this).width());
                    if (cdleft == 0)
                        cdleft -= Math.floor(op.cgwidth / 2);
                    cdpos = cdpos + cdleft + cdpad;
                    if (isNaN(cdpos)) {
                        cdpos = 0;
                    }
                    $('div:eq(' + n + ')', op.grid.cDrag).css({
                        'left': (!(browser.mozilla) ? cdpos - cdcounter : cdpos) + 'px'
                    }).show();
                    cdleft = cdpos;
                    cdcounter++;
                });
            },
            fixHeight: function (newH) {
                newH = false;
                if (!newH)
                    newH = $(op.grid.bDiv).height();
                var hdHeight = $(this.hDiv).height();
                $('div', this.cDrag).each(
                        function () {
                            $(this).height(newH + hdHeight);
                        }
                );
                var nd = parseInt($(op.grid.nDiv).height(), 10);
                if (nd > newH)
                    $(op.grid.nDiv).height(newH).width(200);
                else
                    $(op.grid.nDiv).height('auto').width('auto');
                $(op.grid.block).css({
                    height: newH,
                    marginBottom: (newH * -1)
                });
                var hrH = op.grid.bDiv.offsetTop + newH;
                if (op.height != 'auto' && op.resizable)
                    hrH = op.grid.vDiv.offsetTop;
                $(op.grid.rDiv).css({
                    height: hrH
                });
            },
            dragStart: function (dragtype, e, obj) { //default drag function start
                if (dragtype == 'colresize' && op.colResize === true) {//column resize
                    $(op.grid.nDiv).hide();
                    $(op.grid.nBtn).hide();
                    var n = $('div', this.cDrag).index(obj);
                    var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
                    $(obj).addClass('dragging').siblings().hide();
                    $(obj).prev().addClass('dragging').show();
                    this.colresize = {
                        startX: e.pageX,
                        ol: parseInt(obj.style.left, 10),
                        ow: ow,
                        n: n
                    };
                    $('body').css('cursor', 'col-resize');
                } else if (dragtype == 'vresize') {//table resize
                    var hgo = false;
                    $('body').css('cursor', 'row-resize');
                    if (obj) {
                        hgo = true;
                        $('body').css('cursor', 'col-resize');
                    }
                    this.vresize = {
                        h: op.height,
                        sy: e.pageY,
                        w: op.width,
                        sx: e.pageX,
                        hgo: hgo
                    };
                } else if (dragtype == 'colMove') {//column header drag
                    $(e.target).disableSelection(); //disable selecting the column header
                    if ((op.colMove === true)) {
                        $(op.grid.nDiv).hide();
                        $(op.grid.nBtn).hide();
                        this.hset = $(this.hDiv).offset();
                        this.hset.right = this.hset.left + $('table', this.hDiv).width();
                        this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
                        this.dcol = obj;
                        this.dcoln = $('th', this.hDiv).index(obj);
                        this.colCopy = document.createElement("div");
                        this.colCopy.className = "colCopy";
                        this.colCopy.innerHTML = obj.innerHTML;
                        if (browser.msie) {
                            this.colCopy.className = "colCopy ie";
                        }
                        $(this.colCopy).css({
                            position: 'absolute',
                            'float': 'left',
                            display: 'none',
                            textAlign: obj.align
                        });
                        $('body').append(this.colCopy);
                        $(this.cDrag).hide();
                    }
                }
                methods.noSelect.call($('body'));
            },
            dragMove: function (e) {
                if (this.colresize) {//column resize
                    var n = this.colresize.n;
                    var diff = e.pageX - this.colresize.startX;
                    var nleft = this.colresize.ol + diff;
                    var nw = this.colresize.ow + diff;
                    if (nw > op.minwidth) {
                        $('div:eq(' + n + ')', this.cDrag).css('left', nleft);
                        this.colresize.nw = nw;
                    }
                } else if (this.vresize) {//table resize
                    var v = this.vresize;
                    var y = e.pageY;
                    var diff = y - v.sy;
                    if (!op.defwidth)
                        op.defwidth = op.width;
                    if (op.width != 'auto' && !op.nohresize && v.hgo) {
                        var x = e.pageX;
                        var xdiff = x - v.sx;
                        var newW = v.w + xdiff;
                        if (newW > op.defwidth) {
                            this.gDiv.style.width = newW + 'px';
                            op.width = newW;
                        }
                    }
                    var newH = v.h + diff;
                    if ((newH > op.minheight || op.height < op.minheight) && !v.hgo) {
                        this.bDiv.style.height = newH + 'px';
                        op.height = newH;
                        this.fixHeight(newH);
                    }
                    v = null;
                } else if (this.colCopy) {
                    $(this.dcol).addClass('thMove').removeClass('thOver');
                    if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
                        //this.dragEnd();
                        $('body').css('cursor', 'move');
                    } else {
                        $('body').css('cursor', 'pointer');
                    }
                    $(this.colCopy).css({
                        top: e.pageY + 10,
                        left: e.pageX + 20,
                        display: 'block'
                    });
                }
            },
            dragEnd: function () {
                if (this.colresize) {
                    var n = this.colresize.n;
                    var nw = this.colresize.nw;
                    $('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
                    $('tr', this.bDiv).each(
                            function () {
                                var $tdDiv = $('td:visible div:eq(' + n + ')', this);
                                $tdDiv.css('width', nw);
                                op.grid.addTitleToCell($tdDiv);
                            }
                    );
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                    $('div:eq(' + n + ')', this.cDrag).siblings().show();
                    $('.dragging', this.cDrag).removeClass('dragging');
                    this.rePosDrag();
                    this.fixHeight();
                    this.colresize = false;
                    if ($.cookies) {
                        var name = op.colModel[n].name;		// Store the widths in the cookies
                        $.cookie('flexiwidths/' + name, nw);  // @TODO fix collide when multiple table with the same row name
                    }
                } else if (this.vresize) {
                    this.vresize = false;
                } else if (this.colCopy) {
                    $(this.colCopy).remove();
                    if (this.dcolt !== null) {
                        if (this.dcoln > this.dcolt)
                            $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
                        else
                            $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
                        this.switchCol(this.dcoln, this.dcolt);
                        $(this.cdropleft).remove();
                        $(this.cdropright).remove();
                        this.rePosDrag();
                        if (op.onDragCol) {
                            op.onDragCol(this.dcoln, this.dcolt);
                        }
                    }
                    this.dcol = null;
                    this.hset = null;
                    this.dcoln = null;
                    this.dcolt = null;
                    this.colCopy = null;
                    $('.thMove', this.hDiv).removeClass('thMove');
                    $(this.cDrag).show();
                }
                $('body').css('cursor', 'default');
                methods.noSelect.call($('body'), false);
            },
            toggleCol: function (cid, visible) {
                var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
                var n = $('thead th', op.grid.hDiv).index(ncol);
                var cb = $('input[value=' + cid + ']', op.grid.nDiv)[0];
                if (visible == null) {
                    visible = ncol.hidden;
                }
                if ($('input:checked', op.grid.nDiv).length < op.minColToggle && !visible) {
                    return false;
                }
                if (visible) {
                    ncol.hidden = false;
                    $(ncol).show();
                    cb.checked = true;
                } else {
                    ncol.hidden = true;
                    $(ncol).hide();
                    cb.checked = false;
                }
                $('tbody tr', t).each(
                        function () {
                            if (visible) {
                                $('td:eq(' + n + ')', this).show();
                            } else {
                                $('td:eq(' + n + ')', this).hide();
                            }
                        }
                );
                this.rePosDrag();
                if (op.onToggleCol) {
                    op.onToggleCol(cid, visible);
                }
                return visible;
            },
            switchCol: function (cdrag, cdrop) { //switch columns
                $('tbody tr', t).each(
                        function () {
                            if (cdrag > cdrop)
                                $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
                            else
                                $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
                        }
                );
                //switch order in nDiv
                if (cdrag > cdrop) {
                    $('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
                } else {
                    $('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
                }
                
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
            },
            scroll: function () {
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                this.rePosDrag();
            },
            getTableBody: function () {
                // a singleton for tbody
                if (typeof this.tbody)
                    this.tbody = document.createElement('tbody');
                return this.tbody;
            },
            loadData: function (data) {
                $(t).empty();
                /* data map */
                var data_map = {list: [], total: 0, start: 0, end: 0, page: 0, total_page: 0};
                if (op.dataType == 'json') {
                    data = $.extend(data_map, data);
                }
                if (op.preProcess)
                    data = op.preProcess(data);
                $('.pReload', this.pDiv).removeClass('loading');
                this.loading = false;

                if (!data) {
                    $('.pPageStat', this.pDiv).html(op.errormsg);
                    return false;
                }

                /* paging */
                if (data.total) {
                    op.total = data.total;
                }

                if (op.total === 0) {
                    $('tr, a, td, div', t).unbind();
                    $(t).empty();
                    op.pages = 1;
                    op.page = 1;
                    this.buildpager();
                    $('.pPageStat', this.pDiv).html(op.nomsg);
                    return false;
                }
                op.rp = data.end;
                op.pages = Math.ceil(op.total / op.rp);
                op.page = data.page;
                this.buildpager();

                this.addLines(data.list);

                if (op.onSuccess) {
                    op.onSuccess(this);
                }
                if (op.hideOnSubmit) {
                    $(op.grid.block).remove();
                }
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                if (browser.opera)
                    $(t).css('visibility', 'visible');
            },
            updateLine: function (tr, coldata) {
                var column_id, td, line, old;
                if (tr) {
                    // met à jour les données de la ligne
                    line = $(tr).data('line');
                    jQuery.extend(line, coldata);
                    $(tr).data('line', line);
                    // met a jour les colonnes
                    for (column_id in coldata) {
                        if (!op.colModel[column_id] || typeof coldata[column_id] == 'undefined')
                            continue;

                        // la colonne est masquée
                        if (op.colModel[column_id].hide)
                            continue;

                        td = $('td[data-column-id=' + column_id + ']', tr);
                        $('div', td).html(coldata[column_id]);
                        if (typeof op.colModel[column_id].cellFunction == 'function') {
                            op.colModel[column_id].cellFunction(td, coldata, tr);
                        }
                    }
                }
            },
            addLines: function (lines) {
                //get body instance
                var tbody = this.getTableBody();
                // processing data
                if (op.dataType == 'json') {
                    var x, i, l = lines.length;
                    for (i = 0; l > i; i++) {
                        var line = lines[i];
                        var tr = document.createElement('tr');
                        if (i % 2 && op.striped)
                            tr.className = 'erow';
                        var row;
                        // accroche les données a une ligne
                        $(tr).data('line', line);
                        for (row in op.colModel) {
                            // la colonne est masquée
                            if (op.colModel[row].hide)
                                continue;

                            var td = $('<td />');
                            // necessaires pour update line
                            td.attr('data-column-id', row);
                            if (typeof line[row] != "undefined") {
                                td.html((line[row] != null) ? line[row] : '');//null-check for Opera-browser
                            }
                            else
                                td.html(row.display);

                            var div = $('<div />');
                            if (typeof op.colModel[row].element != 'undefined') {
                                $(div).width(op.colModel[row].element.find('div').width());
                            }
                            $(td).wrapInner(div);
                            $(tr).append($(td));

                            if (typeof op.colModel[row].cellFunction == 'function') {
                                op.colModel[row].cellFunction(td, line, tr);
                            }
                            td = null;
                        }
                        if (typeof op.rowFunction == 'function')
                            op.rowFunction(tr, line);
                        $(tbody).append(tr);
                        tr = null;
                    }
                }
                $('tr', t).unbind();
                $(t).append(tbody);

                this.addRowProp();
                this.rePosDrag();
            },
            changeSort: function (th) { //change sortorder
                if (this.loading) {
                    return true;
                }
                $(op.grid.nDiv).hide();
                $(op.grid.nBtn).hide();
                if (op.sortname == $(th).attr('abbr')) {
                    if (op.sortorder == 'asc') {
                        op.sortorder = 'desc';
                    } else {
                        op.sortorder = 'asc';
                    }
                }
                $(th).addClass('sorted').siblings().removeClass('sorted');
                $('.sdesc', this.hDiv).removeClass('sdesc');
                $('.sasc', this.hDiv).removeClass('sasc');
                $('div', th).addClass('s' + op.sortorder);
                op.sortname = $(th).attr('abbr');
                if (op.onChangeSort) {
                    op.onChangeSort(op.sortname, op.sortorder);
                } else {
                    methods.populate.call(op.t);
                }
            },
            buildpager: function () { //rebuild pager based on new properties
                $('.pcontrol input', this.pDiv).val(op.page);
                $('.pcontrol span', this.pDiv).html(op.pages);
                //var r1 = (op.page - 1) * op.rp + 1; wtf ??
                //var r2 = r1 + op.rp - 1;
                //if (op.total < r2) {	r2 = op.total; }
                var stat = op.pagestat;
                stat = stat.replace(/{from}/, op.page);
                stat = stat.replace(/{to}/, op.pages);
                stat = stat.replace(/{total}/, op.total);
                $('.pPageStat', this.pDiv).html(stat);
            },
            doSearch: function () {
                op.query = $('input[name=q]', op.grid.sDiv).val();
                op.qtype = $('select[name=qtype]', op.grid.sDiv).val();
                op.newp = 1;
                methods.populate.call(op.t);
            },
            changePage: function (ctype) { //change page
                if (this.loading) {
                    return true;
                }
                switch (ctype) {
                    case 'first':
                        op.newp = 1;
                        break;
                    case 'prev':
                        if (op.page > 1) {
                            op.newp = parseInt(op.page, 10) - 1;
                        }
                        break;
                    case 'next':
                        if (op.page < op.pages) {
                            op.newp = parseInt(op.page, 10) + 1;
                        }
                        break;
                    case 'last':
                        op.newp = op.pages;
                        break;
                    case 'input':
                        var nv = parseInt($('.pcontrol input', this.pDiv).val(), 10);
                        if (isNaN(nv)) {
                            nv = 1;
                        }
                        if (nv < 1) {
                            nv = 1;
                        } else if (nv > op.pages) {
                            nv = op.pages;
                        }
                        $('.pcontrol input', this.pDiv).val(nv);
                        op.newp = nv;
                        break;
                }
                if (op.newp == op.page) {
                    return false;
                }
                if (op.onChangePage) {
                    op.onChangePage(op.newp);
                } else {
                    methods.populate.call(op.t);
                }
            },
            addCellProp: function () {
                $('tbody tr td', op.grid.bDiv).each(function () {
                    var tdDiv = document.createElement('div');
                    var n = $('td', $(this).parent()).index(this);
                    var pth = $('th:eq(' + n + ')', op.grid.hDiv).get(0);
                    if (pth != null) {
                        if (op.sortname == $(pth).attr('abbr') && op.sortname) {
                            this.className = 'sorted';
                        }
                        $(tdDiv).css({
                            textAlign: pth.align,
                            width: $('div:first', pth)[0].style.width
                        });
                        if (pth.hidden) {
                            $(this).css('display', 'none');
                        }
                    }
                    if (op.nowrap == false) {
                        $(tdDiv).css('white-space', 'normal');
                    }
                    if (this.innerHTML == '') {
                        this.innerHTML = '&nbsp;';
                    }
                    tdDiv.innerHTML = this.innerHTML;
                    var prnt = $(this).parent()[0];
                    var pid = false;
                    if (prnt.id) {
                        pid = prnt.id.substr(3);
                    }
                    if (pth != null) {
                        if (pth.process)
                            pth.process(tdDiv, pid);
                    }
                    $(this).empty().append(tdDiv).removeAttr('width'); //wrap content
                    op.grid.addTitleToCell(tdDiv);
                });
            },
            getCellDim: function (obj) {// get cell prop for editable event
                var ht = parseInt($(obj).height(), 10);
                var pht = parseInt($(obj).parent().height(), 10);
                var wt = parseInt(obj.style.width, 10);
                var pwt = parseInt($(obj).parent().width(), 10);
                var top = obj.offsetParent.offsetTop;
                var left = obj.offsetParent.offsetLeft;
                var pdl = parseInt($(obj).css('paddingLeft'), 10);
                var pdt = parseInt($(obj).css('paddingTop'), 10);
                return {
                    ht: ht,
                    wt: wt,
                    top: top,
                    left: left,
                    pdl: pdl,
                    pdt: pdt,
                    pht: pht,
                    pwt: pwt
                };
            },
            addRowProp: function () {
                $('tbody tr', op.grid.bDiv).on('click', function (e) {
                    var obj = (e.target || e.srcElement);
                    if (obj.href || obj.type)
                        return true;
                    if (e.ctrlKey || e.metaKey)
                        return; // mousedown already took care of this case

                    $(this).toggleClass('trSelected');
                    if (op.singleSelect && !op.grid.multisel) {
                        $(this).siblings().removeClass('trSelected');
                    }
                }).on('mousedown', function (e) {
                    if (e.shiftKey) {
                        $(this).toggleClass('trSelected');
                        op.grid.multisel = true;
                        this.focus();
                        $(op.grid.gDiv).noSelect();
                    }
                    if (e.ctrlKey || e.metaKey) {
                        $(this).toggleClass('trSelected');
                        op.grid.multisel = true;
                        this.focus();
                    }
                }).on('mouseup', function (e) {
                    if (op.grid.multisel && !(e.ctrlKey || e.metaKey)) {
                        op.grid.multisel = false;
                        $(op.grid.gDiv).noSelect(false);
                    }
                }).on('dblclick', function () {
                    if (op.onDoubleClick) {
                        op.onDoubleClick(this, g, p);
                    }
                }).hover(function (e) {
                    if (op.grid.multisel && e.shiftKey) {
                        $(this).toggleClass('trSelected');
                    }
                }, function () {
                });
               
            },
            combo_flag: true,
            combo_resetIndex: function (selObj) {
                if (this.combo_flag) {
                    selObj.selectedIndex = 0;
                }
                this.combo_flag = true;
            },
            combo_doSelectAction: function (selObj) {
                eval(selObj.options[selObj.selectedIndex].value);
                selObj.selectedIndex = 0;
                this.combo_flag = false;
            },
            //Add title attribute to div if cell contents is truncated
            addTitleToCell: function (tdDiv) {
                if (op.addTitleToCell) {
                    var $span = $('<span />').css('display', 'none'),
                            $div = (tdDiv instanceof jQuery) ? tdDiv : $(tdDiv),
                            div_w = $div.outerWidth(),
                            span_w = 0;

                    $('body').children(':first').before($span);
                    $span.html($div.html());
                    $span.css('font-size', '' + $div.css('font-size'));
                    $span.css('padding-left', '' + $div.css('padding-left'));
                    span_w = $span.innerWidth();
                    $span.remove();

                    if (span_w > div_w) {
                        $div.attr('title', $div.text());
                    } else {
                        $div.removeAttr('title');
                    }
                }
            },
            autoResizeColumn: function (obj) {
                if (!op.dblClickResize)
                    return;
                var n = $('div', this.cDrag).index(obj),
                        $th = $('th:visible div:eq(' + n + ')', this.hDiv),
                        ol = parseInt(obj.style.left, 10),
                        ow = $th.width(),
                        nw = 0,
                        nl = 0,
                        $span = $('<span />');
                $('body').children(':first').before($span);
                $span.html($th.html());
                $span.css('font-size', '' + $th.css('font-size'));
                $span.css('padding-left', '' + $th.css('padding-left'));
                $span.css('padding-right', '' + $th.css('padding-right'));
                nw = $span.width();
                $('tr', this.bDiv).each(function () {
                    var $tdDiv = $('td:visible div:eq(' + n + ')', this),
                            spanW = 0;
                    $span.html($tdDiv.html());
                    $span.css('font-size', '' + $tdDiv.css('font-size'));
                    $span.css('padding-left', '' + $tdDiv.css('padding-left'));
                    $span.css('padding-right', '' + $tdDiv.css('padding-right'));
                    spanW = $span.width();
                    nw = (spanW > nw) ? spanW : nw;
                });
                $span.remove();
                nw = (op.minWidth > nw) ? op.minWidth : nw;
                nl = ol + (nw - ow);
                $('div:eq(' + n + ')', this.cDrag).css('left', nl);
                this.colresize = {
                    nw: nw,
                    n: n
                };
                op.grid.dragEnd();
            },
            pager: 0
        };

        /*
         * CREATE COLUMN 
         */
        if (op.colModel) { //create model if any
            thead = document.createElement('thead');
            var tr = document.createElement('tr');

            var col, i = 0;
            for (col in op.colModel) {
                var cm = {};
                jQuery.extend(cm, op.colDefault, op.colModel[col]);

                cm.name = col;
                var th = document.createElement('th');
                op.colModel[col].element = $(th);
                th.innerHTML = cm.display;
                if (cm.name && cm.sortable) {
                    $(th).attr('abbr', cm.name);
                }
                $(th).attr('axis', 'col' + i).attr('data-column-id', col);
                if (cm.align) {
                    th.align = cm.align;
                }

                if (cm.name && cm.sortable) {
                    $(th).attr('abbr', cm.name);
                }
                if (cm.align) {
                    th.align = cm.align;
                }
                if (cm.width) {
                    $(th).attr('width', cm.width);
                }
                if (cm.hide) {
                    th.hidden = true;
                }
                if (cm.process) {
                    th.process = cm.process; // @TODO remove because colFunction
                }
                $(tr).append(th);
                if (typeof op.colModel[col].columnFunction == 'function') {
                    op.colModel[col].columnFunction(th, t.grid);
                }
                i++;
            }
            $(thead).append(tr);
            $(t).prepend(thead);
            // end if op.colmodel
        }


        //init divs
        op.grid.gDiv = document.createElement('div'); //create global container
        op.grid.mDiv = document.createElement('div'); //create title container
        op.grid.hDiv = document.createElement('div'); //create header container
        op.grid.bDiv = document.createElement('div'); //create body container
        op.grid.vDiv = document.createElement('div'); //create grip
        op.grid.rDiv = document.createElement('div'); //create horizontal resizer
        op.grid.cDrag = document.createElement('div'); //create column drag
        op.grid.block = document.createElement('div'); //creat blocker
        op.grid.nDiv = document.createElement('div'); //create column show/hide popup
        op.grid.nBtn = document.createElement('div'); //create column show/hide button
        op.grid.iDiv = document.createElement('div'); //create editable layer
        op.grid.tDiv = document.createElement('div'); //create toolbar
        op.grid.sDiv = document.createElement('div');
        op.grid.pDiv = document.createElement('div'); //create pager container

        if (op.colResize === false) { //don't display column drag if we are not using it
            $(op.grid.cDrag).css('display', 'none');
        }

        if (!op.usepager) {
            op.grid.pDiv.style.display = 'none';
        }
        op.grid.hTable = document.createElement('table');
        op.grid.gDiv.className = 'flexigrid';
        if (op.width != 'auto') {
            op.grid.gDiv.style.width = op.width + isNaN(op.width) ? '' : 'px';
        }
        //add conditional classes
        if (browser.msie) {
            $(op.grid.gDiv).addClass('ie');
        }
        if (op.novstripe) {
            $(op.grid.gDiv).addClass('novstripe');
        }
        $(t).before(op.grid.gDiv);
        $(op.grid.gDiv).append(t);
        //set toolbar
        if (op.buttons.length) {
            var tDiv2 = methods.addToolbar(op.grid.gDiv);            
            tDiv2.className = 'tDiv2';            
            for (var i = 0; i < op.buttons.length; i++) {
                var btn = op.buttons[i];
                methods.addButton(tDiv2, btn);
            }            
        }
        
        op.grid.hDiv.className = 'hDiv';
        
        //
        // @TODO re-code according to colmodel
        //
        $(t).before(op.grid.hDiv);
        op.grid.hTable.cellPadding = 0;
        op.grid.hTable.cellSpacing = 0;
        $(op.grid.hDiv).append('<div class="hDivBox"></div>');
        $('div', op.grid.hDiv).append(op.grid.hTable);
        var thead = $("thead:first", t).get(0);
        if (thead)
            $(op.grid.hTable).append(thead);
        thead = null;
        if (!op.colmodel)
            var ci = 0;
        $('thead tr:first th', op.grid.hDiv).each(function () {
            var thdiv = document.createElement('div');
            if ($(this).attr('abbr')) {
                $(this).click(function (e) {
                    if (!$(this).hasClass('thOver'))
                        return false;
                    var obj = (e.target || e.srcElement);
                    if (obj.href || obj.type)
                        return true;
                    op.grid.changeSort(this);
                });
                if ($(this).attr('abbr') == op.sortname) {
                    this.className = 'sorted';
                    thdiv.className = 's' + op.sortorder;
                }
            }
            if (this.hidden) {
                $(this).hide();
            }
            if (!op.colmodel) {
                $(this).attr('axis', 'col' + ci++);
            }

            // if there isn't a default width, then the column headers don't match
            // i'm sure there is a better way, but this at least stops it failing
            if (this.width == '') {
                this.width = 100;
            }

            $(thdiv).css({
                textAlign: this.align,
                width: this.width + 'px'
            });
            thdiv.innerHTML = this.innerHTML;
            $(this).empty().append(thdiv).removeAttr('width').mousedown(function (e) {
                op.grid.dragStart('colMove', e, this);
            }).hover(function () {
                if (!op.grid.colresize && !$(this).hasClass('thMove') && !op.grid.colCopy) {
                    $(this).addClass('thOver');
                }
                if ($(this).attr('abbr') != op.sortname && !op.grid.colCopy && !op.grid.colresize && $(this).attr('abbr')) {
                    $('div', this).addClass('s' + op.sortorder);
                } else if ($(this).attr('abbr') == op.sortname && !op.grid.colCopy && !op.grid.colresize && $(this).attr('abbr')) {
                    var no = (op.sortorder == 'asc') ? 'desc' : 'asc';
                    $('div', this).removeClass('s' + op.sortorder).addClass('s' + no);
                }
                if (op.grid.colCopy) {
                    var n = $('th', op.grid.hDiv).index(this);
                    if (n == op.grid.dcoln) {
                        return false;
                    }
                    if (n < op.grid.dcoln) {
                        $(this).append(op.grid.cdropleft);
                    } else {
                        $(this).append(op.grid.cdropright);
                    }
                    op.grid.dcolt = n;
                } else if (!op.grid.colresize) {
                    var nv = $('th:visible', op.grid.hDiv).index(this);
                    var onl = parseInt($('div:eq(' + nv + ')', op.grid.cDrag).css('left'), 10);
                    var nw = jQuery(op.grid.nBtn).outerWidth();
                    var nl = onl - nw + Math.floor(op.cgwidth / 2);
                    $(op.grid.nDiv).hide();
                    $(op.grid.nBtn).hide();
                    $(op.grid.nBtn).css({
                        'left': nl,
                        top: op.grid.hDiv.offsetTop
                    }).show();
                    var ndw = parseInt($(op.grid.nDiv).width(), 10);
                    $(op.grid.nDiv).css({
                        top: op.grid.bDiv.offsetTop
                    });
                    if ((nl + ndw) > $(op.grid.gDiv).width()) {
                        $(op.grid.nDiv).css('left', onl - ndw + 1);
                    } else {
                        $(op.grid.nDiv).css('left', nl);
                    }
                    if ($(this).hasClass('sorted')) {
                        $(op.grid.nBtn).addClass('srtd');
                    } else {
                        $(op.grid.nBtn).removeClass('srtd');
                    }
                }
            }, function () {
                $(this).removeClass('thOver');
                if ($(this).attr('abbr') != op.sortname) {
                    $('div', this).removeClass('s' + op.sortorder);
                } else if ($(this).attr('abbr') == op.sortname) {
                    var no = (op.sortorder == 'asc') ? 'desc' : 'asc';
                    $('div', this).addClass('s' + op.sortorder).removeClass('s' + no);
                }
                if (op.grid.colCopy) {
                    $(op.grid.cdropleft).remove();
                    $(op.grid.cdropright).remove();
                    op.grid.dcolt = null;
                }
            }); //wrap content
        });
        //set bDiv
        op.grid.bDiv.className = 'bDiv';
        $(t).before(op.grid.bDiv);
        $(op.grid.bDiv).css({
            height: (op.height == 'auto') ? 'auto' : op.height + "px"
        }).scroll(function (e) {
            op.grid.scroll();
        }).append(t);
        if (op.height == 'auto') {
            $('table', op.grid.bDiv).addClass('autoht');
        }
        //add td & row properties
        op.grid.addCellProp();
        op.grid.addRowProp();
        //set cDrag only if we are using it
        if (op.colResize === true) {
            var cdcol = $('thead tr:first th:first', op.grid.hDiv).get(0);
            if (cdcol !== null) {
                op.grid.cDrag.className = 'cDrag';
                op.grid.cdpad = 0;
                op.grid.cdpad += parseInt($('div', cdcol).css('borderLeftWidth'), 10) || 0;
                op.grid.cdpad += parseInt($('div', cdcol).css('borderRightWidth'), 10) || 0;
                op.grid.cdpad += parseInt($('div', cdcol).css('paddingLeft'), 10) || 0;
                op.grid.cdpad += parseInt($('div', cdcol).css('paddingRight'), 10) || 0;
                op.grid.cdpad += parseInt($(cdcol).css('borderLeftWidth'), 10) || 0;
                op.grid.cdpad += parseInt($(cdcol).css('borderRightWidth'), 10) || 0;
                op.grid.cdpad += parseInt($(cdcol).css('paddingLeft'), 10) || 0;
                op.grid.cdpad += parseInt($(cdcol).css('paddingRight'), 10) || 0;
                $(op.grid.bDiv).before(op.grid.cDrag);
                var cdheight = $(op.grid.bDiv).height();
                var hdheight = $(op.grid.hDiv).height();
                $(op.grid.cDrag).css({
                    top: -hdheight + 'px'
                });
                $('thead tr:first th', op.grid.hDiv).each(function () {
                    var cgDiv = document.createElement('div');
                    $(op.grid.cDrag).append(cgDiv);
                    if (!op.cgwidth) {
                        op.cgwidth = $(cgDiv).width();
                    }
                    $(cgDiv).css({
                        height: cdheight + hdheight
                    }).mousedown(function (e) {
                        op.grid.dragStart('colresize', e, this);
                    }).dblclick(function (e) {
                        op.grid.autoResizeColumn(this);
                    });
                    
                });
            }
        }
        //add strip
        if (op.striped) {
            $('tbody tr:odd', op.grid.bDiv).addClass('erow');
        }
        if (op.resizable && op.height != 'auto') {
            op.grid.vDiv.className = 'vGrip';
            $(op.grid.vDiv).mousedown(function (e) {
                op.grid.dragStart('vresize', e);
            }).html('<span></span>');
            $(op.grid.bDiv).after(op.grid.vDiv);
        }
        if (op.resizable && op.width != 'auto' && !op.nohresize) {
            op.grid.rDiv.className = 'hGrip';
            $(op.grid.rDiv).mousedown(function (e) {
                op.grid.dragStart('vresize', e, true);
            }).html('<span></span>').css('height', $(op.grid.gDiv).height());
           
            $(op.grid.gDiv).append(op.grid.rDiv);
        }
        // add pager
        if (op.usepager) {
            op.grid.pDiv.className = 'pDiv';
            op.grid.pDiv.innerHTML = '<div class="pDiv2"></div>';
            $(op.grid.bDiv).after(op.grid.pDiv);
            var html = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + op.pagetext + ' <input type="text" size="4" value="1" /> ' + op.outof + ' <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
            $('div', op.grid.pDiv).html(html);
            $('.pReload', op.grid.pDiv).click(function () {
                methods.populate.call(op.t);
                ;
            });
            $('.pFirst', op.grid.pDiv).click(function () {
                op.grid.changePage('first');
            });
            $('.pPrev', op.grid.pDiv).click(function () {
                op.grid.changePage('prev');
            });
            $('.pNext', op.grid.pDiv).click(function () {
                op.grid.changePage('next');
            });
            $('.pLast', op.grid.pDiv).click(function () {
                op.grid.changePage('last');
            });
            $('.pcontrol input', op.grid.pDiv).keydown(function (e) {
                if (e.keyCode == 13)
                    op.grid.changePage('input');
            });
            
            if (op.useRp) {
                var opt = '', sel = '';
                for (var nx = 0; nx < op.rpOptions.length; nx++) {
                    if (op.rp == op.rpOptions[nx])
                        sel = 'selected="selected"';
                    else
                        sel = '';
                    opt += "<option value='" + op.rpOptions[nx] + "' " + sel + " >" + op.rpOptions[nx] + "&nbsp;&nbsp;</option>";
                }
                $('.pDiv2', op.grid.pDiv).prepend("<div class='pGroup'><select name='rp'>" + opt + "</select></div> <div class='btnseparator'></div>");
                $('select', op.grid.pDiv).change(function () {
                    if (op.onRpChange)
                        op.onRpChange(+this.value);
                    else {
                        op.newp = 1;
                        op.rp = +this.value;
                        methods.populate.call(op.t);
                    }
                });
            }
            //add search button
            if (op.searchitems.length) {
                $('.pDiv2', op.grid.pDiv).prepend("<div class='pGroup'> <div class='pSearch pButton'><span></span></div> </div>  <div class='btnseparator'></div>");
                $('.pSearch', op.grid.pDiv).click(function () {
                    $(op.grid.sDiv).slideToggle('fast', function () {
                        $('.sDiv:visible input:first', op.grid.gDiv).trigger('focus');
                    });
                });
                //add search box
                op.grid.sDiv.className = 'sDiv';
                var sitems = op.searchitems;
                var sopt = '', sel = '';
                for (var s = 0; s < sitems.length; s++) {
                    if (op.qtype === '' && sitems[s].isdefault === true) {
                        op.qtype = sitems[s].name;
                        sel = 'selected="selected"';
                    }
                    else
                        sel = '';
                    sopt += "<option value='" + sitems[s].name + "' " + sel + " >" + sitems[s].display + "&nbsp;&nbsp;</option>";
                }
                if (op.qtype === '')
                    op.qtype = sitems[0].name;

                $(op.grid.sDiv).append("<div class='sDiv2'>" + op.findtext +
                        " <input type='text' value='" + op.query + "' size='30' name='q' class='qsbox' /> " +
                        " <select name='qtype'>" + sopt + "</select></div>");
                //Split into separate selectors because of bug in jQuery 1.3.2
                $('input[name=q]', op.grid.sDiv).keydown(function (e) {
                    if (e.keyCode == 13)
                        op.grid.doSearch();
                });
                $('select[name=qtype]', op.grid.sDiv).keydown(function (e) {
                    if (e.keyCode == 13)
                        op.grid.doSearch();
                });
                $('input[value=Clear]', op.grid.sDiv).click(function () {
                    $('input[name=q]', op.grid.sDiv).val('');
                    op.query = '';
                    op.grid.doSearch();
                });
                $(op.grid.bDiv).after(op.grid.sDiv);
            }
        }
        $(op.grid.pDiv, op.grid.sDiv).append("<div style='clear:both'></div>");
        // add title
        if (op.title) {
            op.grid.mDiv.className = 'mDiv';
            op.grid.mDiv.innerHTML = '<div class="ftitle">' + op.title + '</div>';
            $(op.grid.gDiv).prepend(op.grid.mDiv);
            if (op.showTableToggleBtn) {
                $(op.grid.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
                $('div.ptogtitle', op.grid.mDiv).click(function () {
                    $(op.grid.gDiv).toggleClass('hideBody');
                    $(this).toggleClass('vsble');
                });
            }
        }
        //setup cdrops
        op.grid.cdropleft = document.createElement('span');
        op.grid.cdropleft.className = 'cdropleft';
        op.grid.cdropright = document.createElement('span');
        op.grid.cdropright.className = 'cdropright';
        //add block
        op.grid.block.className = 'gBlock';
        var gh = $(op.grid.bDiv).height();
        var gtop = op.grid.bDiv.offsetTop;
        $(op.grid.block).css({
            width: op.grid.bDiv.style.width,
            height: gh,
            background: 'white',
            position: 'relative',
            marginBottom: (gh * -1),
            zIndex: 1,
            top: gtop,
            left: '0px'
        });
        $(op.grid.block).fadeTo(0, op.blockOpacity);
        // add column control
        if ($('th', op.grid.hDiv).length) {


            op.grid.nDiv.className = 'nDiv';
            op.grid.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
            $(op.grid.nDiv).css({
                marginBottom: (gh * -1),
                display: 'none',
                top: gtop
            });
            methods.noSelect.call($(op.grid.nDiv));
            var cn = 0;
            $('th div', op.grid.hDiv).each(function () {
                var kcol = $("th[axis='col" + cn + "']", op.grid.hDiv)[0];
                var chk = 'checked="checked"';
                if (kcol.style.display == 'none') {
                    chk = '';
                }
                $('tbody', op.grid.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
                cn++;
            });
            
            $('td.ndcol2', op.grid.nDiv).click(function () {
                if ($('input:checked', op.grid.nDiv).length <= op.minColToggle && $(this).prev().find('input')[0].checked)
                    return false;
                return op.grid.toggleCol($(this).prev().find('input').val());
            });
            $('input.togCol', op.grid.nDiv).click(function () {
                if ($('input:checked', op.grid.nDiv).length < op.minColToggle && this.checked === false)
                    return false;
                $(this).parent().next().trigger('click');
            });

            $(op.grid.gDiv).prepend(op.grid.nDiv);
            $(op.grid.nBtn).addClass('nBtn')
                    .html('<div></div>')
                    .attr('title', 'Hide/Show Columns')
                    .click(function () {
                        $(op.grid.nDiv).toggle();
                        return true;
                    }
                    );

            if (op.showToggleBtn) {  // @todo somthing better
                $(op.grid.gDiv).prepend(op.grid.nBtn);
            }
        }
        // add date edit layer
        $(op.grid.iDiv).addClass('iDiv').css({
            display: 'none'
        });
        $(op.grid.bDiv).append(op.grid.iDiv);
        // add flexigrid events
        $(op.grid.bDiv).hover(function () {
            $(op.grid.nDiv).hide();
            $(op.grid.nBtn).hide();
        }, function () {
            if (op.grid.multisel) {
                op.grid.multisel = false;
            }
        });
        $(op.grid.gDiv).hover(function () {
        }, function () {
            $(op.grid.nDiv).hide();
            $(op.grid.nBtn).hide();
        });
        //add document events
        $(document).mousemove(function (e) {
            op.grid.dragMove(e);
        }).mouseup(function (e) {
            op.grid.dragEnd();
        }).hover(function () {
        }, function () {
            op.grid.dragEnd();
        });
        
        op.grid.rePosDrag();
        op.grid.fixHeight();

        // set instance
        $(this).data(pluginName, op);

        // load data
        if (op.url && op.autoload) {
            methods.populate.call(op.t);
        }
        return op;
    };

    methods.populate = function () { //get latest data	

        var op = $(this).data(pluginName);
        if (op.grid.loading)
            return true;
        if (op.onSubmit) {
            if (!op.onSubmit())
                return false;
        }
        op.grid.loading = true;
        if (!op.url)
            return false;

        $('.pPageStat', op.grid.pDiv).html(op.procmsg);
        $('.pReload', op.grid.pDiv).addClass('loading');
        $(op.grid.block).css({
            top: op.grid.bDiv.offsetTop
        });
        if (op.hideOnSubmit)
            $(op.grid.gDiv).prepend(op.grid.block);
        if (browser.opera)
            $(op.grid).css('visibility', 'hidden');

        if (!op.newp)
            op.newp = 1;
        if (op.page > op.pages)
            op.page = op.pages;

        var sortName = op.sortname;
        var orderBy = {};
        orderBy[sortName] = op.sortorder;

        op.QueryParamsUi = {
            'start': Math.ceil(op.newp - 1) * op.rp,
            'end': op.rp,
            'orderBy': orderBy,
            'search': {}
        };

        // recherche
        if (op.query)
            op.QueryParamsUi.search[op.qtype] = op.query;

        var params = jQuery.extend(true, {}, op.QueryParamsUi, op.jsonRpcParams, op.jsonRpcParamsFixed);
        var param = {
            method: op.jsonRpcMethod,
            params: params
        };
        $.ajax({
            type: op.method,
            url: op.url,
            data: param,
            dataType: op.dataType,
            success: function (r) {
                if (!r.error)
                    op.grid.loadData(r.result);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                try {
                    if (op.onError)
                        op.onError(XMLHttpRequest, textStatus, errorThrown);
                } catch (e) {
                }
            }
        });

    };

    methods.flexReload = function (p) { // function to reload grid
        var op = $(this).data(pluginName);
        if (op.grid && op.url)
            methods.populate.call(op.t);
    };

    methods.addToolbar = function(grid, options) {
            var op = $(this).data(pluginName);
            var tDiv = document.createElement('div');
            tDiv.className = 'tDiv';
            var tDiv2 = document.createElement('div');
            tDiv2.className = 'tDiv2';
            $(tDiv).append(tDiv2);
            $(grid).prepend(tDiv);
            return tDiv2;
    };

    methods.addButton = function (toolbar, btn) {
        var op = $(this).data(pluginName);
        if (btn.hide)
            return;
        if (!btn.separator) {
            var btnDiv = document.createElement('div');
            btnDiv.className = 'fbutton';
            btnDiv.innerHTML = ("<div><span>") + (btn.hidename ? "&nbsp;" : btn.name) + ("</span></div>");
            if (btn.bclass)
                $('span', btnDiv).addClass(btn.bclass).css({
                    paddingLeft: 20
                });
            if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
                $('span', btnDiv).css('background', 'url(' + btn.bimage + ') no-repeat center left');
            $('span', btnDiv).css('paddingLeft', 20);

            if (btn.tooltip) // add title if exists (RS)
                $('span', btnDiv)[0].title = btn.tooltip;
           
            btnDiv.name = btn.name;
            if (btn.id) {
                btnDiv.id = btn.id;
            }
            
            if (typeof btn.buttonFunction === 'function') {
                btn.buttonFunction(btnDiv, op);
            }
            
            $(toolbar).append(btnDiv);
           
        }
        else {
            $separator = "<div class='btnseparator'></div>";
            if (typeof btn.buttonFunction == 'function') {
                btn.buttonFunction($separator, op);
            }
            $(toolbar).append($separator);
        }
    };

    methods.flexOptions = function (p) {
        var op = $(this).data(pluginName);
        if (op.grid) {
            if (p) {
                $.extend(true, op, p);
                $(this).data(pluginName, op);
            }
            return op;
        }
    };

    methods.flexToggleCol = function (cid, visible) { // function to reload grid
        var op = $(this).data(pluginName);
        if (op.grid)
            op.grid.toggleCol(cid, visible);

    };

    methods.flexAddLines = function (data) { // function to add data to grid	
        var op = $(this).data(pluginName);
        if (op.grid)
            op.grid.addLines(data);
    };

    methods.flexUpdateLine = function (td, coldata) { // function to add data to grid	
        var op = $(this).data(pluginName);
        if (op.grid)
            op.grid.updateLine(td, coldata);
    };

    methods.noSelect = function (p) { //no select plugin by me :-)
        var prevent = (p === null) ? true : p;
        if (prevent) {
            return this.each(function () {
                if (browser.msie || browser.safari)
                    $(this).bind('selectstart', function () {
                        return false;
                    });
                else if (browser.mozilla) {
                    $(this).css('MozUserSelect', 'none');
                    $('body').trigger('focus');
                } else if (browser.opera)
                    $(this).bind('mousedown', function () {
                        return false;
                    });
                else
                    $(this).attr('unselectable', 'on');
            });
        } else {
            return this.each(function () {
                if (browser.msie || browser.safari)
                    $(this).unbind('selectstart');
                else if (browser.mozilla)
                    $(this).css('MozUserSelect', 'inherit');
                else if (browser.opera)
                    $(this).unbind('mousedown');
                else
                    $(this).removeAttr('unselectable', 'on');
            });
        }
    }; //end noSelect

    $.fn.flexigrid = $.fn[pluginName] = function (method) {
        //return false;
        if (methods[method])
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        else if (typeof method === 'object' || !method)
            return methods.init.apply(this, arguments);
        else
            $.error('Method ' + method + ' fail');
    };
})(jQuery);
