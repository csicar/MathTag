(function(){
  var mod = angular.module('mathTag', []);
  var math = mathjs();
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  }

  function Attr(scope, elem, attrs, ctrl, mathbox, sel){
    function attr(name, bind, prop, fn, method){
      var obj = {};
      var method = method || 'animate';
      var duration = 1000;
      fn = fn || function(v){return v}

      //data bind: <curve ng-xxx>
      if(scope[attrs[bind]]){
        obj[name] = attrs[bind];
        scope.$watch(attrs[bind], function(v){
          obj[name] = fn(v);
          mathbox[method](sel, obj, {
            duration: duration,
          })
        })
        scope.$apply();
      //static ngModel: <curve>xxx
      }else if(bind === 'ngModel'){
        obj[name] = fn(elem.text());
        mathbox[method](sel, obj, {
          duration: duration,
        })
      }else if(attrs[name]){
        obj[name] = fn(attrs[name]);
        mathbox[method](sel, obj, {
          duration: duration,
        })
      }
    }
    attr.obj = function(v){
      return (typeof v === 'string')?JSON.parse(v):v;
    }
    attr.num = function(v){
      return Number(v)
    }
    attr.bool = function(v){
      return v===true||v==='true';
    }
    attr.color = function(v){
      return Number('0x'+(v||'000000'))
    }
    return attr;
  }

  var mathReady = (function mathReady(){
    var ready = false;
    var waiting = [];
    angular.element(document).ready(function() {
      ThreeBox.preload([
        '../vendor/snippets.glsl.html',
      ], function(){
        ready = true;
        waiting.forEach(function(cb){
          cb();
        })
      });
    });
    return function on(cb){
      ready?cb():waiting.push(cb);
    }
  }());

  mod.directive('mathBox', function($timeout){
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      template:
      '<div class="mathbox" ng-transclude>'+
      '</div>',
      link: function(scope, elem, attrs){
        mathReady(function(){
          linkMathBox(scope, elem, attrs);
          scope.ready();
        })
      },
      controller: function($scope){
        var waiting = [];
        var ready = false;
        $scope.ready = function(){
          ready = true;
          waiting.forEach(function(cb){
            cb($scope.mathbox());
          })
        }
        this.ready = function(cb){
          ready?cb():waiting.push(cb);
        };
      },
    }
  })

  mod.directive('curve', function(){
    return {
      restrict: 'EA',
      require: '^mathBox',
      link: function(scope, elem, attrs, mathBoxCtrl){
        elem.css('display', 'none');
        mathBoxCtrl.ready(function(mathbox){
          linkCurve(scope, elem, attrs, mathBoxCtrl, mathbox)
        });
      }
    }
  })

  mod.directive('vector', function(){
    return {
      restrict: 'EA',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkVector(scope, elem, attrs, ctrl, mb);
        })
      }
    }
  })

  mod.directive('surface', function(){
    return {
      restrict: 'EA',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkSurface(scope, elem, attrs, ctrl, mb);
        })
      }
    }
  })

  mod.directive('bezier', function(){
    return {
      restrict: 'EA',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkSurface(scope, elem, attrs, ctrl, mb);
        })
      }
    }
  })

  mod.directive('grid', function(){
    return {
      restrict: 'EA',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkGrid(scope, elem, attrs, ctrl, mb);
        })
      }
    }
  })

  mod.directive('axis', function(){
    return {
      restrict: 'E',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkAxis(scope, elem, attrs, ctrl, mb);
        })
      }
    }
  })

  function linkMathBox(scope, elem, attrs){
    var mathbox = mathBox(elem, {
      cursor:         true,
      elementResize:  true,
      fullscreen:     true,
      screenshot:     true,
      stats:          false,
      scale:          1,
    }).start();

    mathbox
      .viewport({
        type: 'cartesian',
        range: [[-10, 10], [-10, 10]],
        scale: [1, 1],
      })
      .transition(300)
    if(elem.find('axis').length){
    }else{
      mathbox.axis({
        axis: 0,
        lineWidth: 1,
      }).axis({
        axis: 1,
        lineWidth: 1,
      })
    }
    if(elem.find('camera').length){
    }else{
      mathbox.camera({
        orbit: 4,
        phi: τ/4,
        theta: 0,
        //lookAt: [0, 0],
      })
    }
    scope.mathbox = function(){
      return mathbox;
    }
  }

  function linkCurve(scope, elem, attrs, ctrl, mathbox){
    var id = guid()
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.curve({
      id: id,
      domain: [-5, 5],
    });

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('expression', 'ngModel', 'expression', function(v){
      return math.eval("f(x, i)=re("+v+')')
    })
    attr('n', 'ngN', 'n', attr.num)
    attr('line', 'ngLine', 'line', attr.bool)
    attr('points', 'ngPoints', 'points', attr.bool)
    attr('domain', 'ngDomain', 'domain', attr.obj);

  }

  function linkVector(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.vector({
      id: id,
    })

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('n', 'ngN', 'n', attr.num)
    attr('expression', 'ngExpression', 'expression', function(v){
      return math.eval("f(x, i)=re("+v+')')
    })
    attr('data', 'ngModel', 'data', attr.obj)
    attr('line', 'ngLine', 'line', attr.bool)
    attr('points', 'ngPoints', 'points', attr.bool)
    attr('domain', 'ngDomain', 'domain', attr.obj);
    attr('arrow', 'ngArrow', 'arrow', attr.bool)
    attr('size', 'ngSize', 'size', attr.num);
  }

  function linkSurface(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.surface({
      id: id
    });

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('n', 'ngN', 'n', attr.obj)
    attr('expression', 'ngExpression', 'expression', function(v){
      return math.eval("f(x, y, i, j)=re("+v+')')
    })
    attr('data', 'ngModel', 'data', attr.obj)
    attr('line', 'ngLine', 'line', attr.bool)
    attr('points', 'ngPoints', 'points', attr.bool)
    attr('domain', 'ngDomain', 'domain', attr.obj);
  }

  function linkBezier(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.bezier({
      id: id
    });

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('n', 'ngN', 'n', function(v){
      return Number(v)
    })
    attr('domain', 'ngDomain', 'domain', attr.obj)
    attr('data', 'ngModel', 'data', attr.obj)
    attr('order', 'ngOrder', 'order', attr.num)
    attr('expression', 'ngExpression', 'expression', function(v){
      return math.eval("f(x, i)=re("+v+')');
    })
    attr('line', 'ngLine', 'line', attr.bool)
    attr('points', 'ngPoints', 'points', attr.bool)
  }

  function linkGrid(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.grid({
      id: id
    });

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('axis', 'ngAxis', 'axis', attr.obj)
    attr('offset', 'ngOffset', 'offset', attr.obj)
    attr('show', 'ngShow', 'show', attr.obj)
    attr('ticks', 'ngTicks', 'ticks', attr.obj)
    attr('tickUnit', 'ngTickUnit', 'tickUnit', attr.obj)
    attr('tickScale', 'ngTickScale', 'tickScale', attr.obj)
  }

  function linkAxis(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, '#'+id);
    mathbox.axis({
      id: id
    });

    //defaults
    attr('opacity', 'ngOpacity', 'opacity', attr.num);
    attr('lineWidth', 'ngLineWidth', 'lineWidth', attr.num)
    attr('pointSize', 'ngPointSize', 'pointSize', attr.num)
    attr('zIndex', 'ngZIndex', 'zIndex', attr.num);
    attr('color', 'ngColor', 'color', attr.color);

    attr('axis', 'ngAxis', 'axis', attr.num, 'set');
    attr('offset', 'ngOffset', 'offset', attr.obj);
    attr('n', 'ngN', 'n', attr.num);
    attr('ticks', 'ngTicks', 'ticks', attr.num);
    attr('tickScale', 'ngTickScale', 'tickScale', attr.num);
    attr('arrow', 'ngArrow', 'arrow', attr.bool);
    attr('size', 'ngSize', 'size', attr.num)
  }

  function linkCamera(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, 'camera');
    /*mathbox.camera({
      orbit: 3,
      phi: τ/4,
      theta: 1,
    });*/

    attr('orbit', 'ngOrbit', 'orbit', attr.num);
    attr('phi', 'ngPhi', 'phi', attr.num);
    attr('theta', 'ngTheta', 'theta', attr.num);
    attr('lookAt', 'ngLookAt', 'lookAt', attr.obj);
  }
}())
