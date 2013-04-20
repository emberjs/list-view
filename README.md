# Ember.ListView

An efficient incremental rendering list view for large lists.

Ember.ListView works on mobile phones that support web overflow touch css,
doesn't work on iOS because iOS doesn't emit scroll events during the momentum
phase of a scroll nor do the elements know there offset top during that scroll phase.

## Dependecies

You will need to include [jquery](http://jquery.com/), [handlebars](http://handlebarsjs.com),
[ember.js](http://emberjs.com) and list view extension. 

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

// create Ember.ArrayController
App.IndexController = Ember.ArrayController.extend({
  content: []
});

// define default index route and pushing some data to content
App.IndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    var content = [];
    for (var i = 0; i < 10000; i++) {
      content.push({name: "Item " + i});
    }
    controller.set('content', content);
  }
});
```

Shazam! You should be able to see a scrollable area with 10,000 items in it.

![](/screens/list.png)

## Subclassing

Here's an example of how to create your version of ```Ember.ListView```.

``` html
<script type="text/x-handlebars" data-template-name="index">
  {{view App.ListView contentBinding="content"}}
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
  setupController: function(controller) {
    var content = [];
    for (var i = 0; i < 10000; i++) {
      content.push({name: "Item " + i});
    }
    controller.set('content', content);
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

![](/screens/grid.png)

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

## How it works

`Ember.ListView` will create enough rows to fill the visible area (as defined by the `height` property). It reacts to scroll events and reuses/repositions the rows as scrolled.

Please look at the [unit tests](https://github.com/emberjs/list-view/blob/master/packages/list-view/tests/list_view_test.js) for more information.

## Running unit tests

Run ```bundle exec rackup``` and open [http://localhost:9292](http://localhost:9292) in a browser.

## List of contributors

+ [Ray Cohen](https://github.com/raycohen)
+ [Stefan Penner](https://github.com/stefanpenner)
+ [Luke Melia](https://github.com/lukemelia)
+ [Erik Bryn](https://github.com/ebryn)
+ [Alex Navasardyan](https://github.com/2k00l)
+ [Christopher Manning](https://github.com/christophermanning)
+ [Sebastian Seilund](https://github.com/sebastianseilund)

A lot of the work was sponsored by [Yapp Labs](https://www.yapp.us/).