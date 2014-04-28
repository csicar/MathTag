var app = angular.module('app', ['mathBox']);
(function(){
  var mod = angular.module('mathBox', [])
  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  }
  var mathReady = (function mathReady(){
    var ready = false;
    var waiting = [];
    DomReady.ready(function() {
      ThreeBox.preload([
        'snippets.glsl.html',
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
          console.log(1, scope);
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
    var curve = mathbox.curve({
      id: id,
      domain: [-5, 5],
      expression: function(x){return x-1},
    });
    function attr(name, bind, prop, fn){
      var obj = {}
      fn = fn || function(v){return v}
      if(attrs[name]){
        obj[name] = fn(attrs[name]);
        console.log('o', obj)
        mathbox.animate('#'+id, obj, {
          duration: 1000,
        })
      }
      if(attrs[bind]){
        obj[name] = attr[bind];
        scope.$watch(attr[bind], function(v){
          obj[name] = fn(v);
          mathbox.animate('#'+id, obj, {
            duration: 1000,
          })
        })
      }
    }
    attr('color', 'ngColor', 'color', function(v){
      console.log(v)
      return Number('0x'+(attrs.color||'000000'))
    });
    attr('n', 'ngN', 'n', function(v){
      return Number(v)||200
    })
    attr('expression', 'ngExpression', function(v){
      return math.eval("f(x, i)=re("+(v||'x')+')')
    })
    /*mathbox.curve({
      id: attrs.id||'f',
      domain: [-5, 5],
      line: attrs.line==undefined?true:attrs.line==='true',
      points: attrs.points==undefined?false:attrs.points==='true',
      lineWidth: attrs.lineWidth||2,
      pointSize: attrs.pointSize||5,
      zIndex: attrs.zIndex||0,
      opacity: attrs.opacity||1,
      expression: math.eval("F(x, i)=re("+(elem.text()||'x')+')'),
    })*/
  }

  function linkVector(scope, elem, attrs, ctrl, mathbox){
    mathbox.vector({
      n: 1,
      data: [[attrs.x0, attrs.y0], [attrs.x1, attrs.y1]],
      expression: elem.text()?math.eval("F(i, end)=re("+(elem.text())+')'):undefined,
      line: attrs.line||true,
      arrow: attrs.arrow||true,
      size: attrs.size||0.3,
    })
  }
}())


function make(){

  function mathboxSetup() {
    // Viewport camera/setup
    mathbox
      // Cartesian viewport
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
  }
  // MathBox boilerplate
  var mathbox = window.mathbox = mathBox({
    cursor:         true,
    elementResize:  true,
    fullscreen:     true,
    screenshot:     true,
    stats:          false,
    scale:          1,
  })//!!!.start()
  mathboxSetup(mathbox);

  var nv = new NV();
  var gui = new dat.GUI();
  gui.add(nv, 'Funktion');
  gui.add(nv, 'x_0');
  gui.add(nv, 'run');
  gui.add(nv, 'next');
  var look = gui.addFolder('Aussehen')
  look.add(nv, 'doFade');
  look.add(nv, 'autoTangent');
  look.add(nv, 'showCorrect');

  var dragCtrl = (function(){
    var x0;
    var y0;
    return {
      drag: function(){
        x0 = x0||d3.event.x;
        y0 = y0||d3.event.y;
        nv.move(
          -(d3.event.x-x0)/300,
          (d3.event.y-y0)/300
        )
      },
      dragstart: function(){
        x0 = null;
        y0 = null;
      },
    }
  }())

  d3.select('.mathbox-overlay')
  .call(
    d3.behavior.zoom().scaleExtent([0.1, 8]).on("zoom", function(){
      nv.zoom(d3.event.scale);
    })
  )
  .call(
    d3.behavior.drag().on('drag', dragCtrl.drag)
      .on('dragstart', dragCtrl.dragstart)
  )



  /*var cx = look.add(nv, 'cx', -10, 10);
  cx.onChange(nv.move);
  var cy = look.add(nv, 'cy', -10, 10);
  cy.onChange(nv.move);*/
  nv.run();
}

/*DomReady.ready(function() {
  ThreeBox.preload([
    'snippets.glsl.html',
  ], make);
});*/
