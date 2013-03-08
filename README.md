# Ember.ListView

An efficient incremental rendering list view for large lists.


## Demo

[Demo on JSBin](http://jsbin.com/igawaq/23/)


## Usage

### Template

```
{{#collection Ember.ListView contentBinding="controller" height=500 rowHeight=50}}
	<!-- row content here -->
{{/collection}}
```

### Subclassing

```
App.ListView = Ember.ListView.extend({
	height: 500,
	rowHeight: 50
});
```

You can customize the row views by subclassing `Ember.ListItemView` and specifying the `itemViewClass` property in the `Ember.ListView` definition.

### Required CSS

```
.list-view {
  overflow: auto;
  position: relative;
}
.list-item-view {
  position: absolute;
}
```

## How it works

`Ember.ListView` will create enough rows to fill the visible area (as defined by the `height` property). It reacts to scroll events and reuses/repositions the rows as scrolled.

Please look at the [unit tests](https://github.com/emberjs/list-view/blob/master/packages/list-view/tests/list_view_test.js) for more information.