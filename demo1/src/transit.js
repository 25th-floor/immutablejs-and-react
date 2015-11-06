import Immutable from 'immutable';
import transit from 'transit-js';

function makeWriter(what) {
    return transit.makeWriteHandler({
        tag: v => what,
        rep: v => v,
        stringRep: v => null
    });
}

export let writer = transit.writer("json", {
    handlers: transit.map([
        Immutable.List, makeWriter('array'),
        Immutable.Map, makeWriter('map')
    ])
});


export let reader = transit.reader("json", {
    arrayBuilder: {
        init: function(node) { return Immutable.List().asMutable(); },
        add: function(ret, val, node) { return ret.push(val); },
        finalize: function(ret, node) { return ret.asImmutable(); },
        fromArray: function(arr, node) {
            return Immutable.List(arr);
        }
    },
    mapBuilder: {
        init: function(node) { return Immutable.Map().asMutable(); },
        add: function(ret, key, val, node) { return ret.set(key, val); },
        finalize: function(ret, node) { return ret.asImmutable(); }
    }
});
