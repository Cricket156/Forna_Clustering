var fs = require('fs');
var page = require('webpage').create();
var url = 'file://' + fs.absolute('./index.html');


var createForna = function() {
    var container = new fornac.FornaContainer("#rna_ss", 
        {'applyForce': true, 'allowPanningAndZooming': true, 'initialSize':[500,500],
              'friction': parameter1,
              'middleCharge': parameter2,
              'otherCharge': parameter3,
              'linkDistanceMultiplier': parameter4,
              'chargeDistance': parameter5
        } 
    );

    var options = {'structure': '((..((....)).(((....))).))',
                    'sequence': 'CGCUUCAUAUAAUCCUAAUGACCUAU'
    };
    container.addRNA(options.structure, options);
    return container;
};

var writeSVG = function() {
        var svg = document.getElementById('plotting-area');
        var svg_string = new XMLSerializer().serializeToString(svg);
        return svg_string;
};

page.open(url, function (status) {
    var container = page.evaluate(createForna);
    setTimeout(function() {
        //page.evaluate(function(){ container.clearNodes(); });
        console.log(page.evaluate(writeSVG));
        phantom.exit();
   }, 2500);
});

