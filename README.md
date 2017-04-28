Flexigrid for jQuery v1.1
==========================

Lightweight but rich data grid with re-sizable columns and a scrolling data to match the headers, plus an ability to connect to an XML or JSON data source using Ajax to load the content.

Similar in concept with the Ext Grid only its pure jQuery love, which makes it light weight and follows the jQuery mantra of running with the least amount of configuration.

## Features

* Resizable columns
* Resizable height and width
* Sortable column headers
* Cool theme
* Can convert an ordinary table
* Ability to connect to an ajax data source (XML and JSON)
* Paging
* Show/hide columns
* Toolbar (new)
* Search (new)
* Accessible API
* Resizable Width
* JSON Support
* Toolbar
* Table Toggle Button
* Show/Hide Columns control have been move to the column headers (try it by mouseovering a header and clicking a black triangle on the right)
* Fixed paging problem on multiple instances
* Mootools and Prototype noConflict() compatibility problems fixed
* New onError event on ajax interaction, (it will pass what the server said in a variable called data), allowing you to handle server problems
* New $().flexAddData method, allows you to directly add new data to the grid using your own data source.
* New preProcess API, allows you to modify or process data sent by server before passing it to Flexigrid, allowing you to use your own JSON format for example.
* Single Rows Select just use { singleSelect: true } in the options
* Quick Search

## License

Copyright (c) 2008 Paulo P. Marinas (https://github.com/paulopmx/Flexigrid)
Dual licensed under the MIT or GPL Version 2 licenses.
http://jquery.org/license


## how to use
* 1.prepare a table
* 2.link the style file:<link rel="stylesheet" href="../css/flexigrid.css" />
* 3.use jquery:<script src="http://localhost/jquery.js" charset="utf-8"></script>
* 4.use js:<script src="../js/flexigrid.js" charset="utf-8"></script>
* 5.call the flexigrid method:$('.eleTable').flexigrid();

## config
* height: 200, //default height
* width: 'auto', //auto width
* striped: true, //apply odd even stripes
* novstripe: false,
* minwidth: 30, //min width of columns
* minheight: 80, //min height of columns
* resizable: true, //allow table resizing
* url: false, //URL if using data from AJAX
* method: 'POST', //data sending method
* dataType: 'xml', //type of data for AJAX, either xml or json
* errormsg: 'Connection Error',
* usepager: false,
* nowrap: true,
* page: 1, //current page
* total: 1, //total pages
* useRp: true, //use the results per page select box
* rp: 15, //results per page
* rpOptions: [10, 15, 20, 30, 50], //allowed per-page values
* title: false,
* idProperty: 'id',
* pagestat: 'Displaying {from} to {to} of {total} items',
* pagetext: 'Page',
* outof: 'of',
* findtext: 'Find',
* params: [], //allow optional parameters to be passed around
* procmsg: 'Processing, please wait ...',
* query: '',
* qtype: '',
* nomsg: 'No items',
* minColToggle: 1, //minimum allowed column to be hidden
* showToggleBtn: true, //show or hide column toggle popup
* hideOnSubmit: true,
* autoload: true,
* blockOpacity: 0.5,
* preProcess: false,
* addTitleToCell: false, // add a title attr to cells with truncated contents
* dblClickResize: false, //auto resize column by double clicking
* onDragCol: false,
* onToggleCol: false,
* onChangeSort: false,
* onDoubleClick: false,
* onSuccess: false,
* onError: false,
* onSubmit: false
