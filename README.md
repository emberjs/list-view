# Ember.ListView [![Build Status](https://secure.travis-ci.org/emberjs/list-view.png?branch=master)](http://travis-ci.org/emberjs/list-view)

An efficient incremental rendering list view for large lists.

`Ember.ListView` works on major modern browsers and also on major mobile devices (iOS, Android).
However, there are known issues with using `Ember.ListView` on mobile web (if you have a long list
and you're touch-scrolling it very fast, you'll see that items in your list start to disappear
and after some lag appear again). That happens because mobile browsers do not emit scroll events
during the momentum scroll phase that `Ember.ListView` needs to capture.

If you want to have something running on mobile, please make sure to use `Ember.VirtualListView`,
which behaves exactly the same (in terms of configuration and working with it) as `Ember.ListView`.
However, note that `Ember.VirtualListView` doesn't have a native scroll bar. This is something that
we need to work on for future releases of `Ember.ListView`.

### Downloads

Latest:
* [development](http://builds.emberjs.com/list-view/list-view-latest.js)
* [minified](http://builds.emberjs.com/list-view/list-view-latest.min.js)

### Table of Contents

1. [Usage](#usage)
1. [Subclassing](#subclassing)
1. [Build it](#build-it)
1. [How it works](#how-it-works)
1. [Run unit tests](#running-unit-tests)
1. [Caveats](#caveats)

## Dependencies

Both `Ember.ListView` and `Ember.VirtualListView` need [jquery](http://jquery.com/),
[handlebars](http://handlebarsjs.com), [ember.js](http://emberjs.com).

`Ember.VirtualListView` need an additional dependency: [zynga scroller](https://github.com/zynga/scroller).

## Demo

Please, take a look at our live [demo](http://emberjs.com/list-view) and [jsbin](http://emberjs.jsbin.com/) links:
[first](http://emberjs.jsbin.com/betiyuna/1) and [second](http://emberjs.jsbin.com/fuqob/1).

## Submitting bugs

Please, attach code samples or links to [jsbin](http://emberjs.jsbin.com/) or [jsfiddle](http://jsfiddle.net/).
It would help us greatly to help you and to improve ember list view.

## Usage

First, let's create a template:
``` html
<script type="text/x-handlebars" data-template-name="index">
  {{#collection Ember.ListView contentBinding="controller" height=500 rowHeight=50 width=500}}
    {{name}}
  {{/collection}}
</script>
```

Next, let's feed our template with some data:
``` javascript
// create Ember application
App = Ember.Application.create();

// define default index route and pushing some data to content
App.IndexRoute = Ember.Route.extend({
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

Here's an example of how to create your version of ```Ember.ListView```.

``` html
<script type="text/x-handlebars" data-template-name="index">
  {{view App.ListView contentBinding="controller"}}
</script>

<script type="text/x-handlebars" data-template-name="row_item">
  {{name}}
</script>
```

``` javascript
// create Ember application
App = Ember.Application.create();

// define default index route and pushing some data to content
App.IndexRoute = Ember.Route.extend({
  model: function() {
    var items = [];
    for (var i = 0; i < 10000; i++) {
      items.push({name: "Item " + i});
    }
    return items;
  }
});

// extending Ember.ListView
// customize the row views by subclassing Ember.ListItemView
// and specifying the itemViewClass property in the Ember.ListView definition
App.ListView = Ember.ListView.extend({
  height: 500,
  rowHeight: 50,
  itemViewClass: Ember.ListItemView.extend({templateName: "row_item"})
});
```

Unfortunately, if you want to customize item template, you would have to use ```Ember.ListItemView```
and create an additional template, as you see above. You cannot specify ```templateName``` paramter
directly on ```Ember.ListView``` because it's derived from ```Ember.ContainerView``` and it cannot have a template.


### Changing height and width of ```Ember.ListView``` during runtime

The height and width of the entire ```Ember.ListView``` can be adjusted at run-time. 
When this occurs the ```Ember.ListView``` will transform existing view items to the new locations, 
and create and position any new view items that might be needed. 
This is meant to make resizing as cheap as possible.

``` javascript
App.ListView = Ember.ListView.extend({
  height: 500,
  width: 960,
  adjustLayout: function(new_width, new_height) {
    this.set('width', new_width);
    this.set('height', new_height);
  }
});
```


### Required parameters

You must specify the ```height``` and ```rowHeight``` parameters because ```Ember.ListView``` will try
to fill visible area with rows. If you would like to have multiple columns, then you need to specify
```elementWidth```, as well as ```width```.

``` javascript
App.ListView = Ember.ListView.extend({
  height: 500,
  rowHeight: 50,
  elementWidth: 80,
  width: 500,
  itemViewClass: Ember.ListItemView.extend({templateName: "row_item"})
});
```

### Required CSS

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
2. `bundle`
3. `bundle exec rake dist`
4. `cp dist/modules/list-view.js mycoolapp/`

## How it works

`Ember.ListView` will create enough rows to fill the visible area (as defined by the `height` property). It reacts to scroll events and reuses/repositions the rows as scrolled.

Please look at the [unit tests](https://github.com/emberjs/list-view/blob/master/packages/list-view/tests/list_view_test.js) for more information.

## Running unit tests

Run ```bundle exec rackup``` and open [http://localhost:9292](http://localhost:9292) in a browser.
 
## Caveats

Things we are aware about and are on the list to fix.

+ `classNameBindings` and `attributeBindings` won't work properly on `ListItemView` after view's recycle. Using it should be avoided. [Demo](http://jsfiddle.net/SPZn4/2/).

## Thanks

A lot of the work was sponsored by [Yapp Labs](https://www.yapp.us/).
