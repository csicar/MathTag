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

  function Attr(scope, elem, attrs, ctrl, mathbox, id){
    return function attr(name, bind, prop, fn){
      var obj = {};
      var duration = 1000;
      fn = fn || function(v){return v}

      if(mathbox.get('#'+id)[prop] === undefined){
        duration = 0;
      }

      //data bind: <curve ng-xxx>
      if(scope[attrs[bind]]){
        obj[name] = attrs[bind];
        scope.$watch(attrs[bind], function(v){
          obj[name] = fn(v);
          mathbox.animate('#'+id, obj, {
            duration: duration,
          })
        })
        scope.$apply();
      //static ngModel: <curve>xxx
      }else if(bind === 'ngModel'){
        obj[name] = fn(elem.text());
        mathbox.animate('#'+id, obj, {
          duration: duration,
        })
      }else if(attrs[name]){
        obj[name] = fn(attrs[name]);
        mathbox.animate('#'+id, obj, {
          duration: duration,
        })
      }
    }
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

  mod.directive('mathBox', function(){
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      template: '<div class="mathbox" ng-transclude></div>',
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
      restrict: 'E',
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
      restrict: 'E',
      require: '^mathBox',
      link: function(scope, elem, attrs, ctrl){
        elem.css('display', 'none');
        ctrl.ready(function(mb){
          linkVector(scope, elem, attrs, ctrl, mb);
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
      .axis({
        id: 'x',
        axis: 0,
        color: 0xa0a0a0,
        ticks: 5,
        lineWidth: 2,
        size: .05,
        labels: true,
      })
      .axis({
        id: 'y',
        axis: 1,
        color: 0xa0a0a0,
        ticks: 5,
        lineWidth: 2,
        size: .05,
        zero: false,
        labels: true,
      })
      .camera({
        orbit: 3,
        phi: τ/4,
        theta: 0,
        //lookAt: [0, 0],
      })
      .transition(300)

    scope.mathbox = function(){
      return mathbox;
    }
  }

  function linkCurve(scope, elem, attrs, ctrl, mathbox){
    var id = guid()
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, id);
    mathbox.curve({
      id: id,
      domain: [-5, 5],
    });

    attr('color', 'ngColor', 'color', function(v){
      return Number('0x'+(v||'000000'))
    });
    attr('n', 'ngN', 'n', function(v){
      return Number(v)||200
    })
    attr('expression', 'ngModel', 'expression', function(v){
      return math.eval("f(x, i)=re("+v+')')
    })
    attr('line', 'ngLine', 'line', function(v){
      return v===true||v==='true';
    })
    attr('points', 'ngPoints', 'points', function(v){
      return v===true||v==='true';
    })
    attr('pointSize', 'ngPointSize', 'pointSize');
    attr('lineWidth', 'ngLineWidth', 'lineWidth');
    attr('zIndex', 'ngZIndex', 'zIndex');
    attr('opacity', 'ngOpacity', 'opacity');
    attr('domain', 'ngDomain', 'domain', function(v){
      if(typeof v === 'object') return v;
      return JSON.parse(v);
    });
  }

  function linkVector(scope, elem, attrs, ctrl, mathbox){
    var id = guid();
    var attr = Attr(scope, elem, attrs, ctrl, mathbox, id);
    mathbox.vector({
      id: id,
    })
    attr('color', 'ngColor', 'color', function(v){
      return Number('0x'+(v||'000000'))
    });
    attr('n', 'ngN', 'n', function(v){
      return Number(v)||200
    })
    attr('expression', 'ngExpression', 'expression', function(v){
      return math.eval("f(x, i)=re("+v+')')
    })
    attr('data', 'ngModel', 'data', function(v){
      if(typeof v === 'object') return v;
      return JSON.parse(v);
    })
    attr('line', 'ngLine', 'line', function(v){
      return v===true||v==='true';
    })
    attr('points', 'ngPoints', 'points', function(v){
      return v===true||v==='true';
    })
    attr('pointSize', 'ngPointSize', 'pointSize');
    attr('lineWidth', 'ngLineWidth', 'lineWidth');
    attr('zIndex', 'ngZIndex', 'zIndex');
    attr('opacity', 'ngOpacity', 'opacity');
    attr('domain', 'ngDomain', 'domain', function(v){
      if(typeof v === 'object') return v;
      return JSON.parse(v);
    });
    attr('arrow', 'ngArrow', 'arrow', function(v){
      return Number(v);
    })
  }
}())
