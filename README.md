MathTag
===

MathTag is a easy-to-use library that delivers the **mathbox** as a angular directive.

Installation
---

Just the `MathTag.js` file in your html. 

> **Note** The file includes `mathbox.js`, `mathjs`, `nerdamer` and the library itself

```html
<script src="path/to/MathTag.js"></script>
```

Usage
---

The matchbox element creates a new instance of mathbox.
```html
<math-box>
    <curve color="ff00">x^2</curve>
    <curve ng-model="f" ng-color="c" domain="[-10, 10]"></curve>
	<vector>[[1, 2], [2, 4]]</vector>
</math-box>
```
***Important*** Use e.g. `color="#ff0000"` for static value and **`ng-color`** for data bound properties. Like:
```html
...
<curve ng-color="myColor">x^2</curve>
...
<script>
MainCtrl($scope){
	$scope.myColor = 'ff0000';
	$scope.changeColor = function(){
		$scope.myColor = '00ff00'; 
		//the color of the graph will automatically change
	}
}
</script>
```

Like all mathbox primitives `curve` has certain properties, their names directly match the attributes in math tag.
