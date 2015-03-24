import Ember from 'ember';

function registerHelperIteration1(name, helperFunction) {
  //earlier versions of ember with htmlbars used this
  Ember.HTMLBars.helpers[name] = helperFunction;
}

function registerHelperIteration2(name, helperFunction) {
  //registerHelper has been made private as _registerHelper
  //this is kept here if anyone is using it
  Ember.HTMLBars.registerHelper(name, helperFunction);
}

function registerHelperIteration3(name, helperFunction) {
  //latest versin of ember uses this
  Ember.HTMLBars._registerHelper(name, helperFunction);
}

export default function registerHelper(name, helperFunction) {
  if (Ember.HTMLBars) {
    if (Ember.HTMLBars._registerHelper) {
      if (Ember.HTMLBars.helpers) {
        registerHelperIteration1(name, helperFunction);
      } else {
        registerHelperIteration3(name, helperFunction);
      }
    } else if (Ember.HTMLBars.registerHelper) {
      registerHelperIteration2(name, helperFunction);
    }
  } else if (Ember.Handlebars) {
    Ember.Handlebars.helper(name, helperFunction);
  }
}
