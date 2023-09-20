const data = [applingdata, atkinsondata, bacondata, bakerdata, baldwindata, banksdata, barrowdata, bartowdata, ben_hilldata, berriendata, bibbdata, bleckleydata, brantleydata, brooksdata, bryandata, bullochdata, burkedata, buttsdata, calhoundata, camdendata, candlerdata, carrolldata, catoosadata, charltondata, chathamdata, chattahoocheedata, chattoogadata, cherokeedata, clarkedata, claydata, claytondata, clinchdata, cobbdata, coffeedata, colquittdata, columbiadata, cookdata, cowetadata, crawforddata, crispdata, dadedata, dawsondata, decaturdata, dekalbdata, dodgedata, doolydata, doughertydata, douglasdata, earlydata, echolsdata, effinghamdata, elbertdata, emanueldata, evansdata, fannindata, fayettedata, floyddata, forsythdata, franklindata, fultondata, gilmerdata, glascockdata, glynndata, gordondata, gradydata, greenedata, gwinnettdata, habershamdata, halldata, hancockdata, haralsondata, harrisdata, hartdata, hearddata, henrydata, houstondata, irwindata, jacksondata, jasperdata, jeff_davisdata, jeffersondata, jenkinsdata, johnsondata, jonesdata, lamardata, lanierdata, laurensdata, leedata, libertydata, lincolndata, longdata, lowndesdata, lumpkindata, macondata, madisondata, mariondata, mcduffiedata, mcintoshdata, meriwetherdata, millerdata, mitchelldata, monroedata, montgomerydata, morgandata, murraydata, muscogeedata, newtondata, oconeedata, oglethorpedata, pauldingdata, peachdata, pickensdata, piercedata, pikedata, polkdata, pulaskidata, putnamdata, quitmandata, rabundata, randolphdata, richmonddata, rockdaledata, schleydata, screvendata, seminoledata, spaldingdata, stephensdata, stewartdata, sumterdata, talbotdata, taliaferrodata, tattnalldata, taylordata, telfairdata, terrelldata, thomasdata, tiftdata, toombsdata, townsdata, treutlendata, troupdata, turnerdata, twiggsdata, uniondata, upsondata, walkerdata, waltondata, waredata, warrendata, washingtondata, waynedata, websterdata, wheelerdata, whitedata, whitfielddata, wilcoxdata, wilkesdata, wilkinsondata, worthdata]

const candidates = ["Raphael Warnock (I) (Dem)", "Herschel Junior Walker (Rep)"]
const position = "US Senator"

const firebaseConfig = {
    apiKey: "AIzaSyCzU61kd9rGgqMLm5_t3s-dYohKxJFzHaw",
    authDomain: "live-election-map.firebaseapp.com",
    projectId: "live-election-map",
    storageBucket: "live-election-map.appspot.com",
    messagingSenderId: "179867859868",
    appId: "1:179867859868:web:24ac96d3b3dcf62380e659",
    measurementId: "G-GDJ3ERFDLZ"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();


let voteCounts = []
for (let i = 0; i < candidates.length; i++)
    voteCounts.push(new Map())

let counties = []
let precincts = []
let allCandidates = []
let times = []

async function database() {
    const snapshot = await db.collection("all").get()
    snapshot.forEach((doc) => {
        let data = doc.data()
        if (doc.id === "!lists") {
            precincts = data["precincts"]
            allCandidates = data["candidates"]
            times = data["times"]
        } else {
            counties.push(doc.id.toUpperCase())
            for (const [key, value] of Object.entries(data)) {
                let code = parseInt(key)
                if(code === -1) continue
                let type = code % 4
                code >>= 2
                let candidate = code % (1 << 10)
                code >>= 10
                let precinct = precincts[code % (1 << 12)]
                if(precinct === undefined) continue
                let county = precinct.split("$")
                precinct = process(county[1])
                county = county[0].toUpperCase()
                if (candidates.includes(allCandidates[candidate])) {
                    let arr = voteCounts[candidates.indexOf(allCandidates[candidate])][county + " - " + precinct]
                    if (arr === undefined) {
                        voteCounts[candidates.indexOf(allCandidates[candidate])][county + " - " + precinct] = Array.apply(null, Array(4)).map(function () {
                        })
                    }
                    voteCounts[candidates.indexOf(allCandidates[candidate])][county + " - " + precinct][type] = value
                }
            }
        }
        if (doc.id === "Worth") {
            for (let i = 0; i < features.length; i++) {
                features[i].forEach(feature => {
                    geoJsons[i].resetStyle(feature.target)
                })
            }
        }
    })
}

function process(precinct) {
    precinct = precinct.toUpperCase()
    if (precinct.endsWith(" ")) precinct = precinct.substring(0, precinct.length - 1)
    precinct = precinct.replace("_", "/")
    precinct = precinct.replace("%", "/")
    return precinct
}

database()