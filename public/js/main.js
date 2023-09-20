const loc = [32.9021883, -83.3217811]
const zoom = 7.4
const map = L.map('map', {zoomSnap: 0.1}).setView(loc, zoom);

let geoJsons = []
let features = [];
let featureIndex = 0

// Google Map Layer

const googleStreets = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
googleStreets.addTo(map);

// let baseLayers = {"Google Map": googleStreets,};
// L.control.layers(baseLayers).addTo(map);

// Search Button
// L.Control.geocoder().addTo(map);

function getColor(d) {
    if (d === undefined) return "#000000"
    if (isNaN(d)) return "#969696"
    if (d === -1) return '#FFFFFF'
    if (d > 80) return '#003b73'
    if (d > 70) return '#0074b7'
    if (d > 60) return '#60a3d9'
    if (d > 50) return '#bfd7ed'
    if (d > 40) return '#fbc490'
    if (d > 30) return '#fbaa60'
    if (d > 20) return '#f67b50'
    return '#a82810';
}

function style(feature) {
    return {
        fillColor: getColor(getPercentage(feature.properties.PREC_KEY, 0)),
        weight: 0,
        opacity: 0,
        color: 'white',
        dashArray: '100',
        fillOpacity: 0.75
    };
}

function countyStyle() {
    return {
        fillColor: '#b9b9b9',
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0
    };
}

function getPercentage(name, index) {
    let total = 0
    let sum = 0
    let def = false
    for (let i = 0; i < voteCounts.length; i++) {
        for (let c = 0; c < 3; c++) {
            const count = getCount(name, i, c)
            if (!isNaN(count)) {
                sum += count
                if (index === i) {
                    total += count
                }
                def = true
            }
        }
    }
    if (name === " " || name === null) return NaN
    if (!def) return undefined
    if (sum === 0) {
        return -1
    }

    return total / sum * 100
}

function getCount(name, index, column) {
    if (voteCounts[index][name] !== undefined) {
        return voteCounts[index][name][column]
    }
    else return NaN
}

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 10,
        color: '#000000',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geoJsons.forEach((geoJson) => {
        geoJson.resetStyle(e.target)
    })
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    features[featureIndex].push(feature)
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


geoJsons.push(L.geoJson(georgiadata, {
    style: countyStyle()
}).addTo(map))


data.forEach((datum) => {
    features.push([])
    let layer = L.geoJson(datum, {
        style: style,
        onEachFeature: onEachFeature
    })
    geoJsons.push(layer.addTo(map))
    featureIndex++
})

let info = L.control();

info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    if (props && props.PREC_KEY !== " " && props.PREC_KEY !== null) {
        let county = props.PREC_KEY.split(" - ")[0]

        // let dateString = "Last Updated: " + date.getFullYear() + "-" + formatDate(date.getMonth() + 1) + "-" + formatDate(date.getDate()) + " " + formatDate(date.getHours()) + ":" + formatDate(date.getMinutes()) + ":" + formatDate(date.getSeconds()) + timeZone
        let name = props.PREC_KEY.replace('_', ' ')
        let str = '<h4>' + position + '</h4>' + name.bold()
        str += '</br><table>\n' +
            '  <tr>\n' +
            '    <th>Candidate</th>\n' +
            '    <th>ABS</th>\n' +
            '    <th>ADV</th>\n' +
            '    <th>ED</th>\n' +
            '    <th>   </th>\n' +
            '    <th>Total</th>\n' +
            '  </tr>\n'
        let totals = []
        let sum = 0
        for (let i = 0; i < voteCounts.length; i++) {
            let total = 0
            for (let c = 0; c < 4; c++) {
                let count = getCount(name, i, c)
                if (count !== undefined) total += count
            }
            totals.push(total)
            sum += total
        }
        for (let i = 0; i < voteCounts.length; i++) {
            let percent = (totals[i] / sum * 100).toFixed(1)
            str += '<tr><td style="text-align: left">' + candidates[i]
            for (let column = 0; column < 3; column++)
                str += '</td><td style="text-align: center">' + getCount(name, i, column)
            str += '</td><td></td><td style="text-align: center">' + totals[i]
            if (!isNaN(percent))
                str += ' (' + percent + '%)'
            str += '</td></tr>'
        }
        // str += '</table></br>' + dateString
        this._div.innerHTML = str
    } else
        this._div.innerHTML = '<h4>' + position + '</h4>' + 'Hover over a precinct'
};

formatDate = function (variable) {
    if (variable < 10) variable = "0" + variable
    return variable;
}

info.addTo(map);

// Legend

let legend = L.control({position: 'bottomright'});

legend.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 20, 30, 40, 50, 60, 70, 80];

    div.innerHTML += '<h4>Raphael Warnock</br>Percentage</h4>'

    for (let i = 0; i < grades.length; i++)
        div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    return div;
};
legend.addTo(map);

let credits = L.control({position: 'bottomleft'});

credits.onAdd = function () {
    let div = L.DomUtil.create('div', 'info legend');
    div.addEventListener("click", function() {
        console.log("clicked")
    });

    div.innerHTML += '<h3>Credits</h3><p>Created by:</br>Vivek Vishwanath'
    return div;
};
credits.addTo(map);