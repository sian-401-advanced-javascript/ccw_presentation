window.kontext = function( container ) {

  let changed = new kontext.Signal();

  let layers = Array.prototype.slice.call( container.querySelectorAll( '.layer' ) );
  console.log('LAYERS', layers);

  let capable =   'WebkitPerspective' in document.body.style ||
                  'MozPerspective' in document.body.style ||
                  'msPerspective' in document.body.style ||
                  'OPerspective' in document.body.style ||
                  'perspective' in document.body.style;

  if( capable ) {
    container.classList.add( 'capable' );
  }

  layers.forEach( function( el, i ) {
    if( !el.querySelector( '.dimmer' ) ) el.innerHTML += '<div class="dimmer"></div>';
  } );

  function show( target, direction ) {
    layers = Array.prototype.slice.call( container.querySelectorAll( '.layer' ) );
    container.classList.add( 'animate' );

    direction = direction || ( target > getIndex() ? 'right' : 'left' );

    if( typeof target === 'string' ) target = parseInt( target );
    if( typeof target !== 'number' ) target = getIndex( target );

    target = Math.max( Math.min( target, layers.length ), 0 );

    if( layers[ target ] && !layers[ target ].classList.contains( 'show' ) ) {

      layers.forEach( function( el, i ) {
        el.classList.remove( 'left', 'right' );
        el.classList.add( direction );
        if( el.classList.contains( 'show' ) ) {
          el.classList.remove( 'show' );
          el.classList.add( 'hide' );
        }
        else {
          el.classList.remove( 'hide' );
        }
      } );
      layers[ target ].classList.add( 'show' );
      changed.dispatch( layers[target], target );
    }
  }

  function prev() {
    let index = getIndex() - 1;
    show( index >= 0 ? index : layers.length + index, 'left' );
  }

  function next() {
    show( ( getIndex() + 1 ) % layers.length, 'right' );
  }

  function getIndex( of ) {
    let index = 0;
    layers.forEach( function( layer, i ) {
      if( ( of && of == layer ) || ( !of && layer.classList.contains( 'show' ) ) ) {
        index = i;
        return;
      }
    } );
    return index;
  }


  function getTotal() {
    return layers.length;
  }

  return {
    show: show,
    prev: prev,
    next: next,
    getIndex: getIndex,
    getTotal: getTotal,
    changed: changed
  };

};

kontext.Signal = function() {
  this.listeners = [];
};

kontext.Signal.prototype.add = function( callback ) {
  this.listeners.push( callback );
};

kontext.Signal.prototype.remove = function( callback ) {
  let i = this.listeners.indexOf( callback );

  if( i >= 0 ) this.listeners.splice( i, 1 );
};

kontext.Signal.prototype.dispatch = function() {
  let args = Array.prototype.slice.call( arguments );
  this.listeners.forEach( function( f, i ) {
    f.apply( null, args );
  } );
};

let k = kontext( document.querySelector( '.kontext' ) );

let bulletsContainer = document.body.querySelector( '.bullets' );

for( let i = 0, len = k.getTotal(); i < len; i++ ) {
  let bullet = document.createElement( 'li' );
  bullet.className = i === 0 ? 'active' : '';
  bullet.setAttribute( 'index', i );
  bullet.onclick = function( event ) { k.show( event.target.getAttribute( 'index' ) ); };
  bullet.ontouchstart = function( event ) { k.show( event.target.getAttribute( 'index' ) ); };
  bulletsContainer.appendChild( bullet );
}

k.changed.add( function( layer, index ) {
  let bullets = document.body.querySelectorAll( '.bullets li' );
  for( let i = 0, len = bullets.length; i < len; i++ ) {
    bullets[i].className = i === index ? 'active' : '';
  }
} );

document.addEventListener( 'keyup', function( event ) {
  if( event.keyCode === 37 ) k.prev();
  if( event.keyCode === 39 ) k.next();
}, false );
