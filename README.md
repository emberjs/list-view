# ListView [![Build Status](https://secure.travis-ci.org/emberjs/list-view.png?branch=master)](http://travis-ci.org/emberjs/list-view)

An efficient incremental rendering list view for large lists.

*ListView* works on major modern browsers and also on major mobile devices (iOS, Android). However, there are known issues with using *ListView* on mobile web (if you have a long list and you're touch-scrolling it very fast, you'll see that items in your list start to disappear and after some lag appear again). That happens because some mobile browsers do not emit scroll events during the momentum scroll phase that *ListView* needs to capture. Also, if the browser is under heavy load, it can just stop emitting some events.

If you do experience this problem. We offer an API compatible *VirtualListView* that does the momentum scroll entirely in JS. However, note that *VirtualListView* doesn't have a native scroll bar. This is something that we need to work on for future releases of *ListView*

### Downloads

Latest:
* [development](https://rawgit.com/rondale-sc/list-view-dist/canary/list-view.js)

### Table of Contents

1. [Usage](#usage)
1. [Subclassing](#subclassing)
1. [Build it](#build-it)
1. [How it works](#how-it-works)
1. [Run unit tests](#running-unit-tests)
1. [Caveats](#caveats)

## Dependencies

Both *ListView* and *VirtualListView* need [jquery](http://jquery.com/),
[handlebars](http://handlebarsjs.com), [ember.js](http://emberjs.com).

*VirtualListView* need an additional dependency: [zynga scroller](https://github.com/zynga/scroller).

## Demo

Please, take a look at our live [demo](http://emberjs.com/list-view) and [jsbin](http://emberjs.jsbin.com/) links:
[first](http://emberjs.jsbin.com/betiyuna/1) and [second](http://emberjs.jsbin.com/fuqob/1).

## Submitting bugs

Please, attach code samples or links to [jsbin](http://emberjs.jsbin.com/) or [jsfiddle](http://jsfiddle.net/).
It would help us greatly to help you and to improve ember list view.

## Installation

Install *ListView* with EmberCLI using this command.

```bash
ember install ember-list-view
```

## Usage

First, let's create a template:
```handlebars
{{#ember-list items=model height=500 rowHeight=50 width=500}}
  {{name}}
{{/ember-list}}
```

Next, let's feed our template with some data:
``` javascript
// define index route and return some data from model
export default Ember.Route.extend({
  model: function() {
    var items = [];
    for (var i = 0; i < 10000; i++) {
      items.push({name: "Item " + i});
    }
    return items;
  }
});
```

Shazam! You should be able to see a scrollable area with 10,000 items in it.

## Subclassing

Here's an example of how to create your version of *ListView*.

Create a **my-list.js** in your project's **/views** directory.

```javascript
// in views/my-list.js

import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';

// extending ListView
// customize the row views by subclassing ListItemView
// and specifying the itemViewClass property in the Ember.ListView definition
export default ListView.extend({
  height: 500,
  rowHeight: 50,
  itemViewClass: ListItemView.extend({templateName: "my-list-item"})
});
```

Use the `{{view}}` helper in your template.

```handlebars
{{view 'my-list' content=model}}
```

Create a **my-list-item.hbs** in your project's **/templates** directory.

```handlebars
{{name}}
```

Return data from your route's model hook.

```javascript
// define default index route and pushing some data to content
export default Ember.Route.extend({
  model: function() {
    var items = [];
    for (var i = 0; i < 10000; i++) {
      items.push({name: "Item " + i});
    }
    return items;
  }
});
```

Unfortunately, if you want to customize item template, you would have to use `ListItemView`
and create an additional template, as you see above. You cannot specify `templateName` parameter
directly on *ListView* because it's derived from `Ember.ContainerView` and it cannot have a template.


### Changing height and width of *ListView* during runtime

The height and width of the entire *ListView* can be adjusted at run-time.
When this occurs the *ListView* will transform existing view items to the new locations,
and create and position any new view items that might be needed.
This is meant to make resizing as cheap as possible.

``` javascript
import ListView from 'ember-list-view';

export default ListView.extend({
  height: 500,
  width: 960,
  adjustLayout: function(newWidth, newHeight) {
    this.set('width', newWidth);
    this.set('height', newHeight);
  }
});
```

### Required parameters

You must specify the `height` and `row-Height` parameters because *ListView* will try
to fill visible area with rows. If you would like to have multiple columns, then you need to specify
`element-width`, as well as `width`.

``` javascript
import ListView from 'ember-list-view';
import ListItemView from 'ember-list-view/list-item-view';

export default ListView.extend({
  height: 500,
  rowHeight: 50,
  elementWidth: 80,
  width: 500,
  itemViewClass: ListItemView.extend( { templateName: "row-item" } )
});
```

### Required CSS

You must manually add the following classes to your application's CSS file. Failure to 
do so will lead to overlapping items.

``` css
.ember-list-view {
  overflow: auto;
  position: relative;
}
.ember-list-item-view {
  position: absolute;
}
```

## Build It

1. `git clone https://github.com/emberjs/list-view.git`
2. `cd list-view`
3. `npm install` (implicitly runs `bower install` as a postinstall)
5. `ember build`

## How it works

*ListView* will create enough rows to fill the visible area (as defined by the `height` property). It reacts to scroll events and reuses/repositions the rows as scrolled.

Please look at the [unit tests](https://github.com/emberjs/list-view/blob/master/tests/unit/list-view-test.js) for more information.

## Running unit tests

```sh
npm install
npm test
```

## Caveats

Things we are aware about and are on the list to fix.

* `classNameBindings` and `attributeBindings` won't work properly on `ListItemView` after view's recycle. Using it should be avoided. [Demo](http://jsfiddle.net/SPZn4/2/).

## Thanks

A lot of the work was sponsored by [Yapp Labs](https://www.yapp.us/).
